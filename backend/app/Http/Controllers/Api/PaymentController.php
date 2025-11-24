<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Payment;
use App\Models\Subscription;
use App\Services\FlutterwaveService;
use App\Services\PaymentTrackingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PaymentController extends Controller
{
    /**
     * Get subscription packages for the authenticated user
     */
    public function getPackages(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            Log::info('Fetching subscription packages', [
                'user_id' => $user->id,
                'user_role' => $user->role,
                'house_type' => $user->house_type
            ]);

            if ($user->role === 'landlord') {
                // Landlord packages with Flutterwave plan IDs
                $packages = [
                    'landlord_with_tenants' => [
                        'title' => 'Landlord with Tenants',
                        'description' => 'For landlords living with tenants',
                        'base_price' => 7000,
                        'plans' => [
                            [
                                'period' => 'monthly',
                                'amount' => 7000,
                                'duration' => 1,
                                'savings' => 0,
                                'plan_id' => '227503'
                            ],
                            [
                                'period' => '6months',
                                'amount' => 42000,
                                'duration' => 6,
                                'savings' => 0,
                                'plan_id' => '227507' // Real Flutterwave plan ID for 6 months
                            ],
                            [
                                'period' => 'yearly',
                                'amount' => 84000,
                                'duration' => 12,
                                'savings' => 0,
                                'plan_id' => '227508' // Real Flutterwave plan ID for yearly
                            ]
                        ]
                    ],
                    'landlord_alone' => [
                        'title' => 'Landlord Living Alone',
                        'description' => 'For landlords living alone',
                        'base_price' => 10000,
                        'plans' => [
                            [
                                'period' => 'monthly',
                                'amount' => 10000,
                                'duration' => 1,
                                'savings' => 0,
                                'plan_id' => '227504'
                            ],
                            [
                                'period' => '6months',
                                'amount' => 60000,
                                'duration' => 6,
                                'savings' => 0,
                                'plan_id' => '227509'
                            ],
                            [
                                'period' => 'yearly',
                                'amount' => 120000,
                                'duration' => 12,
                                'savings' => 0,
                                'plan_id' => '227510'
                            ]
                        ]
                    ]
                ];
            } else {
                // Regular user packages based on house type with Flutterwave plan IDs
                $packageConfig = [
                    'room_self' => [
                        'price' => 1500,
                        'monthly_plan_id' => '227498',
                        'six_months_plan_id' => '227512',
                        'yearly_plan_id' => '227513'
                    ],
                    'room_and_parlor' => [
                        'price' => 2000,
                        'monthly_plan_id' => '227499',
                        'six_months_plan_id' => '227514',
                        'yearly_plan_id' => '227515'
                    ],
                    '2_bedroom' => [
                        'price' => 2500,
                        'monthly_plan_id' => '227500',
                        'six_months_plan_id' => '227516',
                        'yearly_plan_id' => '227517'
                    ],
                    '3_bedroom' => [
                        'price' => 3000,
                        'monthly_plan_id' => '227501',
                        'six_months_plan_id' => '227518',
                        'yearly_plan_id' => '227519'
                    ],
                    'duplex' => [
                        'price' => 4000,
                        'monthly_plan_id' => '227502',
                        'six_months_plan_id' => '227520',
                        'yearly_plan_id' => '227521'
                    ]
                ];

                $config = $packageConfig[$user->house_type] ?? $packageConfig['room_self'];
                $basePrice = $config['price'];

                $packages = [
                    'user_package' => [
                        'title' => $this->formatHouseType($user->house_type),
                        'description' => 'Subscription for your residence',
                        'base_price' => $basePrice,
                        'house_type' => $user->house_type,
                        'plans' => [
                            [
                                'period' => 'monthly',
                                'amount' => $basePrice,
                                'duration' => 1,
                                'savings' => 0,
                                'plan_id' => $config['monthly_plan_id']
                            ],
                            [
                                'period' => '6months',
                                'amount' => $basePrice * 6,
                                'duration' => 6,
                                'savings' => 0,
                                'plan_id' => $config['six_months_plan_id']
                            ],
                            [
                                'period' => 'yearly',
                                'amount' => $basePrice * 12,
                                'duration' => 12,
                                'savings' => 0,
                                'plan_id' => $config['yearly_plan_id']
                            ]
                        ]
                    ]
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'packages' => $packages,
                    'user_role' => $user->role,
                    'house_type' => $user->house_type
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching subscription packages', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch subscription packages',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Initialize payment with Flutterwave
     */
    public function initializePayment(Request $request)
    {
        try {
            Log::info('🚀 === FRONTEND PAYMENT INITIALIZATION REQUEST RECEIVED ===', [
                'request_data' => $request->all(),
                'request_method' => $request->getMethod(),
                'request_url' => $request->fullUrl(),
                'headers' => $request->headers->all(),
                'user_agent' => $request->userAgent(),
                'request_ip' => $request->ip(),
                'timestamp' => now()->toISOString()
            ]);
            
            $user = Auth::user();
            
            if (!$user) {
                Log::error('Payment initialization failed - no authenticated user');
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }
            
            Log::info('User authenticated for payment', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_role' => $user->role
            ]);

            $request->validate([
                'package_type' => 'required|string|in:tenant,landlord_alone,landlord_with_tenants',
                'period' => 'required|in:monthly,6months,yearly',
                'amount' => 'required|numeric|min:1',
                'plan_id' => 'required|string' // Flutterwave plan ID
            ]);

            $packageType = $request->package_type;
            $period = $request->period;
            $amount = $request->amount;
            $planId = $request->plan_id;

            // For now, we'll validate the plan_id exists and matches the amount
            // Later we can add more sophisticated validation
            if (empty($planId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment plan ID is required'
                ], 400);
            }

            // Generate unique transaction reference
            $txRef = 'SF_' . time() . '_' . $user->id . '_' . strtoupper(substr(md5(uniqid()), 0, 6));

            // Calculate period dates
            $periodStart = Carbon::now();
            $periodEnd = match ($period) {
                'monthly' => $periodStart->copy()->addMonth(),
                '6months' => $periodStart->copy()->addMonths(6),
                'yearly' => $periodStart->copy()->addYear(),
                default => $periodStart->copy()->addMonth()
            };

            // Create pending payment record
            $payment = Payment::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'period_type' => $period,
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
                'flutterwave_txn_id' => $txRef,
                'flutterwave_plan_id' => $planId,
                'status' => Payment::STATUS_PENDING
            ]);

            // For frontend Flutterwave integration, we don't need to call Flutterwave API
            // We just prepare the data that the frontend needs

            $responseData = [
                'payment_id' => $payment->id,
                'tx_ref' => $txRef,
                'amount' => $amount,
                'currency' => 'NGN',
                'plan_id' => $planId,
                'customer' => [
                    'email' => $user->email,
                    'name' => $user->full_name,
                    'phonenumber' => $user->phone ?? ''
                ],
                'customization' => [
                    'title' => 'SpringField Estate Subscription',
                    'description' => ucfirst($packageType) . ' - ' . ucfirst($period) . ' plan',
                    'logo' => ''
                ]
            ];
            
            Log::info('=== PAYMENT INITIALIZATION SUCCESSFUL ===', [
                'user_id' => $user->id,
                'payment_id' => $payment->id,
                'package_type' => $packageType,
                'period' => $period,
                'response_data' => $responseData
            ]);

            return response()->json([
                'success' => true,
                'data' => $responseData
            ]);

        } catch (\Exception $e) {
            Log::error('Error initializing payment', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $user->id ?? null
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to initialize payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify payment with Flutterwave
     */
    public function verifyPayment($txRef)
    {
        try {
            Log::info('🔥 === FRONTEND PAYMENT VERIFICATION REQUEST RECEIVED ===', [
                'tx_ref' => $txRef,
                'request_method' => request()->getMethod(),
                'request_url' => request()->fullUrl(),
                'request_headers' => request()->headers->all(),
                'request_ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'timestamp' => now()->toISOString()
            ]);
            
            $user = Auth::user();
            
            Log::info('🔐 Authentication check in payment verification', [
                'tx_ref' => $txRef,
                'auth_user_exists' => $user ? true : false,
                'auth_header' => request()->header('Authorization') ? 'Present' : 'Missing',
                'bearer_token' => request()->bearerToken() ? 'Present' : 'Missing'
            ]);
            
            if (!$user) {
                Log::error('❌ Payment verification failed - no authenticated user', [
                    'tx_ref' => $txRef,
                    'auth_header' => request()->header('Authorization'),
                    'all_headers' => request()->headers->all()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required - user not found'
                ], 401);
            }
            
            Log::info('✅ User authenticated for payment verification', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_role' => $user->role,
                'tx_ref' => $txRef
            ]);

            // Find or create the payment record
            $payment = Payment::where('flutterwave_txn_id', $txRef)
                             ->where('user_id', $user->id)
                             ->first();

            if (!$payment) {
                // Create payment record if it doesn't exist (for direct payments)
                $payment = Payment::create([
                    'user_id' => $user->id,
                    'amount' => 0, // Will be updated from Flutterwave response
                    'period_type' => 'monthly',
                    'period_start' => now(),
                    'period_end' => now()->addMonth(),
                    'flutterwave_txn_id' => $txRef,
                    'flutterwave_plan_id' => null, // May not be available for direct payments
                    'status' => Payment::STATUS_PENDING
                ]);
            }

            // Verify payment with Flutterwave
            Log::info('Verifying payment with Flutterwave', [
                'tx_ref' => $txRef,
                'payment_id' => $payment->id
            ]);
            
            $flutterwaveService = new FlutterwaveService();
            $verificationResult = $flutterwaveService->verifyPayment($txRef);
            
            Log::info('Flutterwave verification result', [
                'tx_ref' => $txRef,
                'verification_result' => $verificationResult
            ]);

            $paymentStatus = $verificationResult['data']['status'] ?? '';
            if ($verificationResult['success'] && ($paymentStatus === 'successful' || $paymentStatus === 'completed')) {
                Log::info('Payment verified as successful', [
                    'tx_ref' => $txRef,
                    'payment_status' => $paymentStatus
                ]);
                // Update payment record with Flutterwave response data
                $payment->update([
                    'amount' => $verificationResult['data']['amount'] ?? $payment->amount,
                    'status' => Payment::STATUS_PAID,
                    'flutterwave_response' => json_encode($verificationResult['data']),
                    'paid_at' => now()
                ]);

                // Determine package type and period duration
                $periodType = $payment->period_type ?? 'monthly';
                // Determine specific landlord package type based on plan ID
                $packageType = 'tenant'; // default
                if ($user->role === 'landlord') {
                    // Determine landlord package type based on plan ID
                    $landlordWithTenantsPlans = ['227503', '227507', '227508']; // Monthly, 6 months, yearly
                    $landlordAlonePlans = ['227504', '227509', '227510']; // Monthly, 6 months, yearly
                    
                    if (in_array($payment->flutterwave_plan_id, $landlordWithTenantsPlans)) {
                        $packageType = 'landlord_with_tenants';
                    } elseif (in_array($payment->flutterwave_plan_id, $landlordAlonePlans)) {
                        $packageType = 'landlord_alone';
                    } else {
                        $packageType = 'landlord_alone'; // Default for landlords
                    }
                }
                
                // Calculate subscription period
                $monthsToAdd = match($periodType) {
                    '6months' => 6,
                    'yearly' => 12,
                    default => 1 // monthly
                };

                // Create subscription record
                $subscription = Subscription::create([
                    'user_id' => $user->id,
                    'payment_id' => $payment->id,
                    'package_type' => $packageType,
                    'period' => $periodType,
                    'amount' => $payment->amount,
                    'starts_at' => now(),
                    'expires_at' => now()->addMonths($monthsToAdd),
                    'status' => 'active',
                    'auto_renew' => false,
                    'subscription_data' => json_encode([
                        'flutterwave_plan_id' => $payment->flutterwave_plan_id,
                        'house_type' => $user->house_type,
                        'tx_ref' => $txRef
                    ])
                ]);

                // Update user payment tracking
                $oldCount = $user->payment_count ?? 0;
                $newCount = $oldCount + $monthsToAdd; // Add months based on payment period
                
                // Calculate if payment is up to date
                $monthsSinceRegistration = $user->created_at->diffInMonths(now()) + 1;
                $requiredPayments = max(1, $monthsSinceRegistration);
                $isUpToDate = $newCount >= $requiredPayments;
                
                // Update user using Eloquent update
                User::where('id', $user->id)->update([
                    'payment_count' => $newCount,
                    'is_payment_up_to_date' => $isUpToDate,
                    'last_payment_check' => now()
                ]);

                // Get updated user values after payment increment
                $user = User::find($user->id);
                
                Log::info('🎉 LANDLORD PAYMENT SUCCESSFUL - DATABASE UPDATED', [
                    'user_id' => $user->id,
                    'user_role' => $user->role,
                    'payment_id' => $payment->id,
                    'subscription_id' => $subscription->id,
                    'tx_ref' => $txRef,
                    'amount' => $payment->amount,
                    'package_type' => $packageType,
                    'period_type' => $periodType,
                    'months_added' => $monthsToAdd,
                    'payment_count' => $user->payment_count,
                    'is_up_to_date' => $user->is_payment_up_to_date,
                    'plan_id' => $payment->flutterwave_plan_id,
                    'subscription_expires_at' => $subscription->expires_at->toISOString()
                ]);

                // Get fresh user data to return in response
                $freshUser = User::find($user->id);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment verified and processed successfully',
                    'data' => [
                        'payment' => $payment->fresh(),
                        'subscription' => $subscription,
                        'user_payment_count' => $freshUser->payment_count,
                        'is_payment_up_to_date' => $freshUser->is_payment_up_to_date,
                        'required_payments' => $freshUser->getRequiredPayments(),
                        'months_added' => $monthsToAdd
                    ]
                ]);
            } else {
                Log::warning('Flutterwave verification failed', [
                    'tx_ref' => $txRef,
                    'verification_result' => $verificationResult,
                    'payment_status' => $paymentStatus
                ]);
                
                // Update payment as failed
                $payment->update([
                    'status' => Payment::STATUS_FAILED,
                    'flutterwave_response' => json_encode($verificationResult)
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Payment verification failed'
                ], 400);
            }

        } catch (\Exception $e) {
            Log::error('Payment verification error', [
                'tx_ref' => $txRef,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment verification failed'
            ], 500);
        }
    }

    /**
     * Handle Flutterwave webhook
     */
    public function handleWebhook(Request $request)
    {
        try {
            Log::info('Flutterwave webhook received', $request->all());

            $flutterwaveService = new FlutterwaveService();
            $payload = $request->getContent();
            $signature = $request->header('verif-hash');

            // Validate webhook signature
            if (!$flutterwaveService->validateWebhookSignature($payload, $signature)) {
                Log::warning('Invalid webhook signature', [
                    'provided_signature' => $signature
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid signature'
                ], 400);
            }

            $webhookData = $request->all();
            
            if ($webhookData['event'] === 'charge.completed' && $webhookData['data']['status'] === 'successful') {
                $txRef = $webhookData['data']['tx_ref'];
                $flutterwaveId = $webhookData['data']['id'];
                $amount = $webhookData['data']['amount'];

                // Find the payment record
                $payment = Payment::where('flutterwave_txn_id', $txRef)->first();

                if ($payment) {
                    // Verify transaction with Flutterwave
                    $verificationResult = $flutterwaveService->verifyTransaction($flutterwaveId);
                    
                    if ($verificationResult['success'] && $verificationResult['data']['status'] === 'successful') {
                        // Update payment status
                        $payment->update([
                            'status' => Payment::STATUS_PAID,
                            'paid_at' => Carbon::now()
                        ]);

                        $user = $payment->user;
                        
                        // Determine package type and period duration
                        $periodType = $payment->period_type ?? 'monthly';
                        $packageType = $user->role === 'landlord' ? 'landlord' : 'tenant';
                        
                        // Calculate subscription period
                        $monthsToAdd = match($periodType) {
                            '6months' => 6,
                            'yearly' => 12,
                            default => 1 // monthly
                        };

                        // Create subscription record
                        $subscription = Subscription::create([
                            'user_id' => $user->id,
                            'payment_id' => $payment->id,
                            'package_type' => $packageType,
                            'period' => $periodType,
                            'amount' => $payment->amount,
                            'starts_at' => now(),
                            'expires_at' => now()->addMonths($monthsToAdd),
                            'status' => 'active',
                            'auto_renew' => false,
                            'subscription_data' => json_encode([
                                'flutterwave_plan_id' => $payment->flutterwave_plan_id,
                                'house_type' => $user->house_type,
                                'tx_ref' => $txRef,
                                'flutterwave_id' => $flutterwaveId
                            ])
                        ]);

                        // Update user payment tracking
                        $oldCount = $user->payment_count ?? 0;
                        $newCount = $oldCount + $monthsToAdd;
                        
                        // Calculate if payment is up to date
                        $monthsSinceRegistration = $user->created_at->diffInMonths(now()) + 1;
                        $requiredPayments = max(1, $monthsSinceRegistration);
                        $isUpToDate = $newCount >= $requiredPayments;
                        
                        // Update user using Eloquent update
                        User::where('id', $user->id)->update([
                            'payment_count' => $newCount,
                            'is_payment_up_to_date' => $isUpToDate,
                            'last_payment_check' => now()
                        ]);

                        Log::info('Payment completed successfully via webhook', [
                            'payment_id' => $payment->id,
                            'subscription_id' => $subscription->id,
                            'user_id' => $payment->user_id,
                            'amount' => $amount,
                            'tx_ref' => $txRef,
                            'flutterwave_id' => $flutterwaveId,
                            'months_added' => $monthsToAdd,
                            'payment_count' => $newCount
                        ]);

                        return response()->json([
                            'success' => true,
                            'message' => 'Payment processed successfully'
                        ]);
                    } else {
                        Log::error('Payment verification failed', [
                            'tx_ref' => $txRef,
                            'flutterwave_id' => $flutterwaveId,
                            'verification_result' => $verificationResult
                        ]);
                        
                        return response()->json([
                            'success' => false,
                            'message' => 'Payment verification failed'
                        ], 400);
                    }
                } else {
                    Log::error('Payment record not found', [
                        'tx_ref' => $txRef,
                        'flutterwave_id' => $flutterwaveId
                    ]);

                    return response()->json([
                        'success' => false,
                        'message' => 'Payment record not found'
                    ], 404);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Webhook processed'
            ]);

        } catch (\Exception $e) {
            Log::error('Error processing webhook', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error processing webhook'
            ], 500);
        }
    }

    /**
     * Check if user has active subscription using new payment tracking system
     */
    public function hasActiveSubscription(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            $paymentTrackingService = new PaymentTrackingService();
            $subscriptionStatus = $paymentTrackingService->getSubscriptionStatus($user);

            return response()->json([
                'success' => true,
                'data' => $subscriptionStatus
            ]);

        } catch (\Exception $e) {
            Log::error('Error checking subscription status', [
                'error' => $e->getMessage(),
                'user_id' => $user->id ?? null
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error checking subscription status'
            ], 500);
        }
    }

    /**
     * Get user's payment history
     */
    public function getPaymentHistory(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            $payments = Payment::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $payments
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching payment history', [
                'error' => $e->getMessage(),
                'user_id' => $user->id ?? null
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payment history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get subscription status endpoint for frontend
     */
    public function subscriptionStatus(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            // Super admin users have unlimited access, no subscription required
            if ($user->role === 'super') {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'has_active_subscription' => true,
                        'subscription_type' => 'super_admin',
                        'is_super_admin' => true,
                        'message' => 'Super admin access - no subscription required'
                    ]
                ]);
            }

            $paymentTrackingService = new PaymentTrackingService();
            $subscriptionStatus = $paymentTrackingService->getSubscriptionStatus($user);

            return response()->json([
                'success' => true,
                'data' => $subscriptionStatus
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting subscription status', [
                'error' => $e->getMessage(),
                'user_id' => $user->id ?? null
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get subscription status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all user transactions for super admin (only successful payments)
     */
    public function getAllUserTransactions(Request $request)
    {
        try {
            $user = Auth::user();

            // Only super admin can access this endpoint
            if (!$user || $user->role !== 'super') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            $perPage = $request->input('per_page', 20);
            $status = $request->input('status', 'paid'); // Default to successful payments only

            // Fetch payments with user information
            $payments = Payment::with(['user:id,full_name,first_name,last_name,email,role,house_type'])
                ->where('status', $status)
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            // Transform the data to include user information
            $transformedPayments = collect($payments->items())->map(function ($payment) {
                // Handle cases where user might be null (deleted users)
                $user = $payment->user;
                
                return [
                    'id' => $payment->id,
                    'user' => $user ? [
                        'id' => $user->id,
                        'full_name' => $user->full_name ?? 
                                     ($user->first_name . ' ' . $user->last_name),
                        'email' => $user->email,
                        'role' => $user->role,
                        'house_type' => $user->house_type,
                    ] : [
                        'id' => null,
                        'full_name' => 'Deleted User',
                        'email' => 'N/A',
                        'role' => 'N/A',
                        'house_type' => null,
                    ],
                    'amount' => $payment->amount,
                    'period_type' => $payment->period_type,
                    'period_start' => $payment->period_start,
                    'period_end' => $payment->period_end,
                    'status' => $payment->status,
                    'flutterwave_txn_id' => $payment->flutterwave_txn_id,
                    'flutterwave_plan_id' => $payment->flutterwave_plan_id,
                    'created_at' => $payment->created_at,
                    'paid_at' => $payment->paid_at ?? $payment->updated_at,
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Transactions retrieved successfully',
                'data' => [
                    'data' => $transformedPayments,
                    'current_page' => $payments->currentPage(),
                    'last_page' => $payments->lastPage(),
                    'per_page' => $payments->perPage(),
                    'total' => $payments->total(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching all user transactions', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error fetching transactions',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get revenue statistics with filtering
     */
    public function getRevenue(Request $request)
    {
        try {
            $user = Auth::user();

            // Only super admin can access this endpoint
            if (!$user || $user->role !== 'super') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            $filter = $request->input('filter', 'all_time');
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');

            // Build query for paid payments only
            $query = Payment::where('status', 'paid');

            // Apply date filters
            switch ($filter) {
                case 'today':
                    $query->whereDate('created_at', today());
                    break;
                case 'this_week':
                    $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                    break;
                case 'this_month':
                    $query->whereMonth('created_at', now()->month)
                          ->whereYear('created_at', now()->year);
                    break;
                case 'this_year':
                    $query->whereYear('created_at', now()->year);
                    break;
                case 'custom':
                    if ($startDate && $endDate) {
                        $query->whereBetween('created_at', [$startDate, $endDate]);
                    }
                    break;
                case 'all_time':
                default:
                    // No additional filter for all time
                    break;
            }

            // Calculate statistics
            $totalRevenue = $query->sum('amount');
            $totalPayments = $query->count();
            $averagePayment = $totalPayments > 0 ? $totalRevenue / $totalPayments : 0;

            return response()->json([
                'success' => true,
                'message' => 'Revenue statistics retrieved successfully',
                'data' => [
                    'total_revenue' => round($totalRevenue, 2),
                    'total_payments' => $totalPayments,
                    'average_payment' => round($averagePayment, 2),
                    'filter' => $filter,
                    'period' => [
                        'start' => $startDate,
                        'end' => $endDate
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching revenue statistics', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error fetching revenue statistics',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Format house type for display
     */
    private function formatHouseType($houseType)
    {
        return match ($houseType) {
            'room_self' => 'Room Self',
            'room_and_parlor' => 'Room & Parlour (Mini Flat)',
            '2_bedroom' => '2 Bedroom',
            '3_bedroom' => '3 Bedroom',
            'duplex' => 'Duplex',
            default => 'Standard'
        };
    }
}