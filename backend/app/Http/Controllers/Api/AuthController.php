<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Log;
use App\Models\RegistrationCode;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * Verify registration code
     * POST /api/register/verify-code
     */
    public function verifyRegistrationCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'registration_code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify the registration code
        $registrationCode = RegistrationCode::verify($request->registration_code);

        if (!$registrationCode) {
            // Log failed attempt
            Log::logAccess('REGISTRATION_CODE_VERIFICATION_FAILED', null, [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'attempted_code' => substr($request->registration_code, 0, 4) . '****'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Invalid, expired, or already used registration code'
            ], 401);
        }

        // Log successful verification
        Log::logAccess('REGISTRATION_CODE_VERIFIED', $registrationCode->issued_by, [
            'code_id' => $registrationCode->id,
            'house_id' => $registrationCode->house_id,
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registration code verified successfully',
            'data' => [
                'house_info' => [
                    'id' => $registrationCode->house->id,
                    'house_number' => $registrationCode->house->house_number,
                    'address' => $registrationCode->house->address,
                    'landlord_name' => $registrationCode->house->landlord->full_name
                ],
                'code_id' => $registrationCode->id
            ]
        ]);
    }

    /**
     * Complete user registration
     * POST /api/register/complete
     */
    public function completeRegistration(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code_id' => 'required|integer|exists:registration_codes,id',
            'full_name' => 'required|string|max:150',
            'phone' => 'required|string|max:20|unique:users,phone',
            'email' => 'nullable|email|max:100|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'role' => ['required', Rule::in(['landlord', 'resident'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify registration code is still valid
        $registrationCode = RegistrationCode::find($request->code_id);
        
        if (!$registrationCode || !$registrationCode->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'Registration code is no longer valid'
            ], 401);
        }

        // Create the user
        $user = User::create([
            'full_name' => $request->full_name,
            'phone' => $request->phone,
            'email' => $request->email,
            'password_hash' => Hash::make($request->password),
            'role' => $request->role,
            'house_id' => $registrationCode->house_id,
            'status_active' => true,
        ]);

        // Mark registration code as used
        $registrationCode->markAsUsed($user->id);

        // Create access token
        $token = $user->createToken('auth-token')->plainTextToken;

        // Log successful registration
        Log::logAdmin('USER_REGISTERED', $user->id, $user->id, [
            'role' => $user->role,
            'house_id' => $user->house_id,
            'registration_code_id' => $registrationCode->id,
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registration completed successfully',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'phone' => $user->phone,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status_active' => $user->status_active,
                    'house' => $user->house ? [
                        'id' => $user->house->id,
                        'house_number' => $user->house->house_number,
                        'address' => $user->house->address
                    ] : null
                ],
                'token' => $token
            ]
        ], 201);
    }

    /**
     * User login
     * POST /api/login
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Find user by phone
        $user = User::where('phone', $request->phone)->first();

        // Check credentials
        if (!$user || !Hash::check($request->password, $user->password_hash)) {
            // Log failed login attempt
            Log::logAccess('LOGIN_FAILED', null, [
                'phone' => $request->phone,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Invalid phone number or password'
            ], 401);
        }

        // Check if user is active
        if (!$user->status_active) {
            // Log inactive user login attempt
            Log::logAccess('LOGIN_ATTEMPT_INACTIVE_USER', $user->id, [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact administrator.'
            ], 403);
        }

        // Create access token
        $token = $user->createToken('auth-token')->plainTextToken;

        // Log successful login
        Log::logAccess('LOGIN_SUCCESS', $user->id, [
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'phone' => $user->phone,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status_active' => $user->status_active,
                    'house' => $user->house ? [
                        'id' => $user->house->id,
                        'house_number' => $user->house->house_number,
                        'address' => $user->house->address
                    ] : null
                ],
                'token' => $token
            ]
        ]);
    }

    /**
     * Get authenticated user profile
     * GET /api/user
     */
    public function user(Request $request)
    {
        $user = $request->user()->load(['house.landlord']);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'phone' => $user->phone,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status_active' => $user->status_active,
                    'created_at' => $user->created_at,
                    'house' => $user->house ? [
                        'id' => $user->house->id,
                        'house_number' => $user->house->house_number,
                        'address' => $user->house->address,
                        'landlord' => [
                            'id' => $user->house->landlord->id,
                            'full_name' => $user->house->landlord->full_name,
                            'phone' => $user->house->landlord->phone
                        ]
                    ] : null
                ]
            ]
        ]);
    }

    /**
     * Update user profile
     * PUT /api/user/profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|string|max:150',
            'email' => 'sometimes|email|max:100|unique:users,email,' . $user->id,
            'phone' => 'sometimes|string|max:20|unique:users,phone,' . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $oldData = $user->toArray();
        $user->update($request->only(['full_name', 'email', 'phone']));

        // Log profile update
        Log::logAdmin('PROFILE_UPDATED', $user->id, $user->id, [
            'old_data' => $oldData,
            'new_data' => $user->fresh()->toArray(),
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'phone' => $user->phone,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status_active' => $user->status_active
                ]
            ]
        ]);
    }

    /**
     * User logout
     * POST /api/logout
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        // Delete current access token
        $request->user()->currentAccessToken()->delete();

        // Log logout
        Log::logAccess('LOGOUT', $user->id, [
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Logout from all devices
     * POST /api/logout-all
     */
    public function logoutAll(Request $request)
    {
        $user = $request->user();

        // Delete all tokens for user
        $user->tokens()->delete();

        // Log logout from all devices
        Log::logAccess('LOGOUT_ALL_DEVICES', $user->id, [
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Logged out from all devices successfully'
        ]);
    }
}
