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
            // Check super admin count to determine if this user can become a super admin
            $superAdminCount = User::where('role', User::ROLE_SUPER)->count();
            $canBeSuperAdmin = $superAdminCount < 3;

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

            // If can't be super admin (already have 3), require OTP
            if (!$canBeSuperAdmin) {
                $validationRules['otp_code'] = 'required|string|size:6|exists:registration_otps,otp_code';
            } else {
                // Users who can be super admin don't need address fields
                $validationRules['description'] = 'nullable|string';
            }

            // If OTP is provided, we need to validate against it
            if ($request->has('otp_code')) {
                // Check OTP to determine if house fields are needed
                $tempOtp = RegistrationOtp::where('otp_code', $request->otp_code)->first();
                $needsHouseInfo = $tempOtp && $tempOtp->target_role !== 'security';
                
                if ($needsHouseInfo) {
                    // For landlord/resident OTP registration, require house_number and house_type
                    // Address is optional (nullable)
                    $validationRules['house_number'] = 'required|string|max:50';
                    $validationRules['house_type'] = 'required|string|in:room_self,room_and_parlor,2_bedroom,3_bedroom,duplex';
                    $validationRules['address'] = 'nullable|string|max:255'; // Optional for OTP
                }
            } else if (!$canBeSuperAdmin) {
                // Users who can't be super admin without OTP need house info
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

                // Handle OTP-based registration for users when we already have 3 super admins
                if (!$canBeSuperAdmin && $request->has('otp_code')) {
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
                    if ($otp->target_role === RegistrationOtp::TARGET_LANDLORD) {
                        $userRole = User::ROLE_LANDLORD;
                    } elseif ($otp->target_role === RegistrationOtp::TARGET_SECURITY) {
                        $userRole = User::ROLE_SECURITY;
                    } else {
                        $userRole = User::ROLE_RESIDENT;
                    }

                    // For resident registration via landlord OTP, use pre-filled house info
                    if ($otp->target_role === RegistrationOtp::TARGET_RESIDENT) {
                        $houseNumber = $otp->house_number;
                        $address = $otp->address;
                        $houseId = $otp->house_id;
                    }
                } else if ($canBeSuperAdmin) {
                    // Handle direct super admin registration when we have less than 3 super admins
                    if ($request->has('target_role') && $request->target_role === 'super') {
                        $userRole = User::ROLE_SUPER;
                    } else {
                        // Default to super admin for first 3 users if no specific role requested
                        $userRole = User::ROLE_SUPER;
                    }
                }

                $house = null;

                // Create or find house for users who need houses (not super admins, landlords, or security)
                // For landlords registering via OTP, we'll create the house AFTER user creation
                if ($userRole !== User::ROLE_SUPER && $userRole !== User::ROLE_LANDLORD && $userRole !== User::ROLE_SECURITY) {
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
                    'status_active' => $canBeSuperAdmin || $userRole === User::ROLE_RESIDENT, // Super admin candidates and residents are auto-active
                ];

                // Add house_id and house_type for users who need houses (not super admins or security)
                if ($userRole !== User::ROLE_SUPER && $userRole !== User::ROLE_SECURITY) {
                    if ($house) {
                        $userData['house_id'] = $house->id;
                    }
                    $userData['house_type'] = $houseType;
                }

                // Set landlord_id for residents who register via landlord OTP
                if ($otp && $userRole === User::ROLE_RESIDENT && $otp->target_role === RegistrationOtp::TARGET_RESIDENT) {
                    $userData['landlord_id'] = $otp->generated_by;
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
                        'can_be_super_admin' => $canBeSuperAdmin,
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
            
            // Update last login timestamp
            $user->update(['last_login_at' => now()]);

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
            
            // Split full_name into first_name and last_name if they don't exist
            $firstName = $user->first_name;
            $lastName = $user->last_name;
            
            if (!$firstName && !$lastName && $user->full_name) {
                $nameParts = explode(' ', $user->full_name, 2);
                $firstName = $nameParts[0] ?? '';
                $lastName = $nameParts[1] ?? '';
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'full_name' => $user->full_name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'address' => $user->address,
                        'role' => $user->role,
                        'status_active' => $user->status_active,
                        'theme_preference' => $user->theme_preference ?? 'light',
                        'last_login_at' => $user->last_login_at,
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

    /**
     * Get all landlords for super admin dashboard
     */
    public function getLandlords(Request $request)
    {
        try {
            // Check if user is super admin
            if ($request->user()->role !== User::ROLE_SUPER) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $landlords = User::where('role', User::ROLE_LANDLORD)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($landlord) {
                    // Get residents count manually
                    $residentsCount = User::where('landlord_id', $landlord->id)
                        ->where('role', User::ROLE_RESIDENT)
                        ->count();
                        
                    // Get actual payment count and required payments
                    $paymentCount = $landlord->payment_count ?? 0;
                    $monthsSinceRegistration = $landlord->getMonthsSinceRegistration();
                    
                    return [
                        'id' => $landlord->id,
                        'full_name' => $landlord->full_name,
                        'email' => $landlord->email,
                        'phone' => $landlord->phone,
                        'house_number' => $landlord->house_number,
                        'address' => $landlord->address,
                        'status' => $landlord->status,
                        'created_at' => $landlord->created_at,
                        'email_verified_at' => $landlord->email_verified_at,
                        'residents_count' => $residentsCount,
                        'payment_count' => $paymentCount,
                        'months_since_registration' => $monthsSinceRegistration,
                        'required_payments' => $monthsSinceRegistration,
                        'is_payment_up_to_date' => $landlord->isPaymentUpToDate(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $landlords
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch landlords',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get users under a specific landlord
     */
    public function getLandlordUsers(Request $request, $landlordId = null)
    {
        try {
            $user = $request->user();
            
            // If landlordId is provided, it's a super admin request
            if ($landlordId) {
                if ($user->role !== User::ROLE_SUPER) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthorized'
                    ], 403);
                }
                $landlord = User::findOrFail($landlordId);
            } else {
                // It's a landlord requesting their own users
                if ($user->role !== User::ROLE_LANDLORD) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthorized'
                    ], 403);
                }
                $landlord = $user;
            }

            // Get all residents under this landlord
            $residents = User::where('role', User::ROLE_RESIDENT)
                ->where('landlord_id', $landlord->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($resident) {
                    // Get actual payment count and required payments
                    $paymentCount = $resident->payment_count ?? 0;
                    $monthsSinceRegistration = $resident->getMonthsSinceRegistration();
                    
                    return [
                        'id' => $resident->id,
                        'full_name' => $resident->full_name,
                        'email' => $resident->email,
                        'phone' => $resident->phone,
                        'house_number' => $resident->house_number,
                        'house_type' => $resident->house_type,
                        'address' => $resident->address,
                        'status' => $resident->status,
                        'created_at' => $resident->created_at,
                        'payment_count' => $paymentCount,
                        'months_since_registration' => $monthsSinceRegistration,
                        'required_payments' => $monthsSinceRegistration,
                        'is_payment_up_to_date' => $resident->isPaymentUpToDate(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $residents
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment statistics for landlord
     */
    public function getPaymentStats(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user->role !== User::ROLE_LANDLORD) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $currentYear = date('Y');
            
            // Placeholder payment count - implement actual payment counting logic
            $totalPayments = 0;
            
            return response()->json([
                'success' => true,
                'data' => [
                    'totalPayments' => $totalPayments,
                    'currentYear' => (int) $currentYear,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payment stats',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deactivate a user
     */
    public function deactivateUser(Request $request, $userId)
    {
        try {
            $user = $request->user();
            
            // Check authorization - super admin can deactivate anyone, landlord can deactivate their residents
            if (!in_array($user->role, [User::ROLE_SUPER, User::ROLE_LANDLORD])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $targetUser = User::findOrFail($userId);
            
            // If landlord, ensure they can only deactivate their own residents
            if ($user->role === User::ROLE_LANDLORD) {
                if ($targetUser->landlord_id !== $user->id || $targetUser->role !== User::ROLE_RESIDENT) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthorized'
                    ], 403);
                }
            }

            $targetUser->status_active = false;
            $targetUser->save();

            return response()->json([
                'success' => true,
                'message' => 'User deactivated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to deactivate user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Activate a user
     */
    public function activateUser(Request $request, $userId)
    {
        try {
            $user = $request->user();
            
            // Check authorization - super admin can activate anyone, landlord can activate their residents
            if (!in_array($user->role, [User::ROLE_SUPER, User::ROLE_LANDLORD])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $targetUser = User::findOrFail($userId);
            
            // If landlord, ensure they can only activate their own residents
            if ($user->role === User::ROLE_LANDLORD) {
                if ($targetUser->landlord_id !== $user->id || $targetUser->role !== User::ROLE_RESIDENT) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthorized'
                    ], 403);
                }
            }

            $targetUser->status_active = true;
            $targetUser->save();

            return response()->json([
                'success' => true,
                'message' => 'User activated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to activate user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a user
     */
    public function deleteUser(Request $request, $userId)
    {
        try {
            $user = $request->user();
            
            // Check authorization - super admin can delete anyone, landlord can delete their residents
            if (!in_array($user->role, [User::ROLE_SUPER, User::ROLE_LANDLORD])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $targetUser = User::findOrFail($userId);
            
            // If landlord, ensure they can only delete their own residents
            if ($user->role === User::ROLE_LANDLORD) {
                if ($targetUser->landlord_id !== $user->id || $targetUser->role !== User::ROLE_RESIDENT) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthorized'
                    ], 403);
                }
            }

            // Prevent deleting super admins unless done by another super admin
            if ($targetUser->role === User::ROLE_SUPER && $user->role !== User::ROLE_SUPER) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete super admin'
                ], 403);
            }

            $targetUser->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all users for security personnel to view
     */
    public function getAllUsersForSecurity(Request $request)
    {
        try {
            // Check if this is a test call (no auth required for test endpoint)
            $isTestCall = $request->routeIs('*test-security-users*') || str_contains($request->path(), 'test-security-users');
            
            if (!$isTestCall) {
                // Verify user is authenticated for regular endpoint
                $currentUser = $request->user();
                if (!$currentUser) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthorized'
                    ], 401);
                }
            }

            // Get search and pagination parameters
            $search = $request->get('search', '');
            $page = max(1, intval($request->get('page', 1)));
            $perPage = 20; // Fixed at 20 per page as requested

            // Build the query
            $query = User::select([
                'id',
                'full_name',
                'email',
                'phone',
                'role',
                'status_active',
                'created_at',
                'updated_at'
            ]);

            // Apply search if provided
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('full_name', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%")
                      ->orWhere('phone', 'LIKE', "%{$search}%")
                      ->orWhere('role', 'LIKE', "%{$search}%");
                });
            }

            // Get total count before pagination
            $totalUsers = $query->count();
            $totalPages = ceil($totalUsers / $perPage);

            // Apply pagination
            $users = $query->orderBy('created_at', 'desc')
                          ->skip(($page - 1) * $perPage)
                          ->take($perPage)
                          ->get();

            // Format users for frontend
            $formattedUsers = $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->full_name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => ucfirst($user->role),
                    'status' => $user->status_active ? 'active' : 'inactive',
                    'created_at' => $user->created_at->format('Y-m-d'),
                    'updated_at' => $user->updated_at->format('Y-m-d'),
                    'last_login_at' => 'Never', // We don't have last_login_at field in database
                    'last_active' => 'Never'   // We don't have last_login_at field in database
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'users' => $formattedUsers,
                    'pagination' => [
                        'current_page' => $page,
                        'per_page' => $perPage,
                        'total' => $totalUsers,
                        'total_pages' => $totalPages,
                        'has_next' => $page < $totalPages,
                        'has_prev' => $page > 1
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
