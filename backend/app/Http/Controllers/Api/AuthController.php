<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\House;
use App\Models\Log;
use App\Models\RegistrationOtp;
use App\Models\EmailVerification;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        try {
            // Check total user count to determine if this is one of the first 3 users (auto super admin)
            $totalUsers = User::count();
            $isFirstThreeUsers = $totalUsers < 3;

            // Validation rules differ based on whether this is first 3 users or needs OTP
            $validationRules = [
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|string|email|max:100|unique:users,email',
                'phone_number' => 'required|string|max:20|unique:users,phone',
                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/',
                    'confirmed'
                ],
                'password_confirmation' => 'required|string'
            ];

            // If not first 3 users, require OTP
            if (!$isFirstThreeUsers) {
                $validationRules['otp_code'] = 'required|string|size:6|exists:registration_otps,otp_code';
            } else {
                // First 3 users don't need address fields as they become super admins
                $validationRules['description'] = 'nullable|string';
            }

            // If OTP is provided, we need to validate against it
            if ($request->has('otp_code')) {
                // Don't require house_number and address as they might be pre-filled from OTP
            } else if (!$isFirstThreeUsers) {
                // Non-first-3 users without OTP need house info
                $validationRules['house_number'] = 'required|string|max:50';
                $validationRules['address'] = 'required|string|max:255';
            }

            $validator = Validator::make($request->all(), $validationRules, [
                'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
                'email.unique' => 'This email address is already registered.',
                'phone_number.unique' => 'This phone number is already registered.',
                'otp_code.required' => 'OTP code is required for registration.',
                'otp_code.exists' => 'Invalid OTP code.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Start database transaction
            DB::beginTransaction();

            try {
                $otp = null;
                $userRole = User::ROLE_RESIDENT;
                $houseNumber = $request->house_number;
                $address = $request->address;
                $houseId = null;

                // Handle OTP-based registration for non-first-3 users
                if (!$isFirstThreeUsers && $request->has('otp_code')) {
                    // Find and validate the OTP
                    $otp = RegistrationOtp::where('otp_code', $request->otp_code)
                                         ->valid()
                                         ->first();

                    if (!$otp) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Invalid or expired OTP code'
                        ], 422);
                    }

                    // Set role based on OTP target role
                    $userRole = $otp->target_role === RegistrationOtp::TARGET_LANDLORD 
                              ? User::ROLE_LANDLORD 
                              : User::ROLE_RESIDENT;

                    // For resident registration via landlord OTP, use pre-filled house info
                    if ($otp->target_role === RegistrationOtp::TARGET_RESIDENT) {
                        $houseNumber = $otp->house_number;
                        $address = $otp->address;
                        $houseId = $otp->house_id;
                    }
                } else if ($isFirstThreeUsers) {
                    // First 3 users become super admins
                    $userRole = User::ROLE_SUPER;
                }

                $house = null;

                // Create or find house for non-super-admin users
                if ($userRole !== User::ROLE_SUPER) {
                    if ($houseId) {
                        // Use existing house from OTP
                        $house = House::find($houseId);
                    } else {
                        // Find or create house
                        $house = House::where('house_number', $houseNumber)
                                    ->where('address', $address)
                                    ->first();

                        if (!$house) {
                            if ($userRole === User::ROLE_LANDLORD) {
                                // Landlord will own this house - create placeholder, will be updated after user creation
                                $house = House::create([
                                    'landlord_id' => 1, // Temporary, will be updated
                                    'house_number' => $houseNumber,
                                    'address' => $address,
                                ]);
                            } else {
                                // Resident needs a house with a landlord - create temp landlord
                                $tempLandlord = User::create([
                                    'full_name' => 'Temp Landlord for ' . $houseNumber,
                                    'phone' => 'temp_' . time(),
                                    'email' => 'temp_landlord_' . time() . '@temp.com',
                                    'password_hash' => Hash::make('temporary_password'),
                                    'role' => User::ROLE_LANDLORD,
                                    'status_active' => false,
                                ]);

                                $house = House::create([
                                    'landlord_id' => $tempLandlord->id,
                                    'house_number' => $houseNumber,
                                    'address' => $address,
                                ]);
                            }
                        }
                    }
                }

                // Create the user
                $userData = [
                    'full_name' => $request->first_name . ' ' . $request->last_name,
                    'phone' => $request->phone_number,
                    'email' => $request->email,
                    'password_hash' => Hash::make($request->password),
                    'role' => $userRole,
                    'status_active' => $isFirstThreeUsers, // First 3 users are auto-active
                ];

                // Add house_id for non-super users
                if ($userRole !== User::ROLE_SUPER && $house) {
                    $userData['house_id'] = $house->id;
                }

                $user = User::create($userData);

                // If this user is a landlord and we created a placeholder house, update the landlord_id
                if ($userRole === User::ROLE_LANDLORD && $house && $house->landlord_id === 1) {
                    $house->update(['landlord_id' => $user->id]);
                }

                // Mark OTP as used if applicable
                if ($otp) {
                    $otp->markAsUsed($user->id);
                }

                // Log the registration
                Log::logAction(
                    Log::TYPE_ADMIN,
                    'USER_REGISTERED',
                    $user->id,
                    $user->id,
                    [
                        'user_role' => $user->role,
                        'is_first_three' => $isFirstThreeUsers,
                        'used_otp' => $otp ? $otp->otp_code : null,
                        'otp_generated_by' => $otp ? $otp->generated_by : null,
                        'house_number' => $house ? $house->house_number : null,
                        'address' => $house ? $house->address : null,
                        'description' => $request->description
                    ]
                );

                DB::commit();

                // Send email verification OTP for all users
                $emailResult = $user->sendEmailVerificationOtp();
                
                // Only provide token if email verification is successful
                // Note: First 3 users (super admins) still need to verify email through OTP flow
                // They just don't need a registration OTP
                $token = null;
                // Tokens are only created after successful login or email verification
                // Removing auto-verification to enforce OTP verification for all users

                // All users must verify their email via OTP before getting access
                $responseMessage = 'Registration successful! Please check your email and verify your account with the OTP code sent to complete the registration.';

                $responseData = [
                    'user' => [
                        'id' => $user->id,
                        'full_name' => $user->full_name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'role' => $user->role,
                        'status_active' => $user->status_active,
                        'email_verified' => $user->hasVerifiedEmail(),
                        'house' => $house ? [
                            'id' => $house->id,
                            'house_number' => $house->house_number,
                            'address' => $house->address,
                        ] : null
                    ],
                    'email_verification' => [
                        'required' => true,  // All users must verify email
                        'sent' => $emailResult['success'] ?? false,
                        'message' => $emailResult['message'] ?? 'Email verification OTP could not be sent',
                        'otp_code' => $emailResult['otp_code'] ?? null // Remove in production
                    ]
                ];

                // Token will be created after successful email verification via OTP
                // Don't include token in registration response

                return response()->json([
                    'success' => true,
                    'message' => $responseMessage,
                    'data' => $responseData
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password_hash)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            if (!$user->status_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account is not active. Please contact your landlord or administrator.'
                ], 403);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            // Log the login
            Log::logAction(
                Log::TYPE_ACCESS,
                'USER_LOGIN',
                $user->id,
                $user->id,
                [
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'full_name' => $user->full_name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'role' => $user->role,
                        'status_active' => $user->status_active,
                        'house' => $user->house ? [
                            'id' => $user->house->id,
                            'house_number' => $user->house->house_number,
                            'address' => $user->house->address,
                        ] : null
                    ],
                    'token' => $token
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            // Log the logout
            Log::logAction(
                Log::TYPE_ACCESS,
                'USER_LOGOUT',
                $request->user()->id,
                $request->user()->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get authenticated user details
     */
    public function me(Request $request)
    {
        try {
            $user = $request->user();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'full_name' => $user->full_name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'role' => $user->role,
                        'status_active' => $user->status_active,
                        'house' => $user->house ? [
                            'id' => $user->house->id,
                            'house_number' => $user->house->house_number,
                            'address' => $user->house->address,
                            'landlord' => $user->house->landlord ? [
                                'id' => $user->house->landlord->id,
                                'full_name' => $user->house->landlord->full_name,
                                'phone' => $user->house->landlord->phone,
                            ] : null
                        ] : null
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user details',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
