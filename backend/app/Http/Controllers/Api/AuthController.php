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
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_])[A-Za-z\d@$!%*?&\-_]*$/',
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
                // For landlord OTP registration, require house_number and house_type
                // Address is optional (nullable)
                $validationRules['house_number'] = 'required|string|max:50';
                $validationRules['house_type'] = 'required|string|in:room_self,room_and_parlor,2_bedroom,3_bedroom,duplex';
                $validationRules['address'] = 'nullable|string|max:255'; // Optional for OTP
            } else if (!$isFirstThreeUsers) {
                // Non-first-3 users without OTP need house info
                $validationRules['house_number'] = 'required|string|max:50';
                $validationRules['address'] = 'required|string|max:255';
                $validationRules['house_type'] = 'nullable|string|in:room_self,room_and_parlor,2_bedroom,3_bedroom,duplex';
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
                $houseType = $request->house_type ?? 'room_self';
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
                // For landlords registering via OTP, we'll create the house AFTER user creation
                if ($userRole !== User::ROLE_SUPER && $userRole !== User::ROLE_LANDLORD) {
                    if ($houseId) {
                        // Use existing house from OTP
                        $house = House::find($houseId);
                    } else {
                        // Find or create house for resident
                        $house = House::where('house_number', $houseNumber)
                                    ->where('address', $address)
                                    ->first();

                        if (!$house && $houseNumber && $address) {
                            // Only create house if we have house information
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
                                'house_type' => $houseType,
                            ]);
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

                // Add house_id and house_type for non-super users
                if ($userRole !== User::ROLE_SUPER) {
                    if ($house) {
                        $userData['house_id'] = $house->id;
                    }
                    $userData['house_type'] = $houseType;
                }

                $user = User::create($userData);

                // NOW create house for landlords registering via OTP (AFTER user is created)
                if ($userRole === User::ROLE_LANDLORD && $houseNumber && !$house) {
                    $houseAddress = $address ?: 'To be updated'; // Use provided address or placeholder
                    
                    $house = House::create([
                        'landlord_id' => $user->id, // Use the newly created user ID
                        'house_number' => $houseNumber,
                        'address' => $houseAddress,
                        'house_type' => $houseType,
                    ]);
                    
                    // Update user with house_id
                    $user->update(['house_id' => $house->id]);
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
                        'house_type' => $house ? $house->house_type : null,
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
                        'house_type' => $user->house_type,
                        'status_active' => $user->status_active,
                        'email_verified' => $user->hasVerifiedEmail(),
                        'house' => $house ? [
                            'id' => $house->id,
                            'house_number' => $house->house_number,
                            'house_type' => $house->house_type,
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
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'house_type' => $user->house_type,
                    'status_active' => $user->status_active,
                    'email_verified_at' => $user->email_verified_at,
                    'house' => $user->house ? [
                        'id' => $user->house->id,
                        'house_number' => $user->house->house_number,
                        'house_type' => $user->house->house_type,
                        'address' => $user->house->address,
                    ] : null
                ],
                'token' => $token
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
                            'house_type' => $user->house->house_type,
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

    /**
     * Get the count of super admins in the system
     * Used by frontend to determine if registration OTP is required
     */
    public function getSuperAdminCount(Request $request)
    {
        try {
            $superAdminCount = User::where('role', User::ROLE_SUPER)->count();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'super_admin_count' => $superAdminCount,
                    'requires_otp' => $superAdminCount >= 3,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check super admin count',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
