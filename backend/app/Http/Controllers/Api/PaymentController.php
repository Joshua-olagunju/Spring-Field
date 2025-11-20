<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Payment;
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
                // Landlord packages with toggle options
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
                                'savings' => 0
                            ],
                            [
                                'period' => '6months',
                                'amount' => 42000,
                                'duration' => 6,
                                'savings' => 0
                            ],
                            [
                                'period' => 'yearly',
                                'amount' => 84000,
                                'duration' => 12,
                                'savings' => 0
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
                                'savings' => 0
                            ],
                            [
                                'period' => '6months',
                                'amount' => 60000,
                                'duration' => 6,
                                'savings' => 0
                            ],
                            [
                                'period' => 'yearly',
                                'amount' => 120000,
                                'duration' => 12,
                                'savings' => 0
                            ]
                        ]
                    ]
                ];
            } else {
                // Regular user packages based on house type
                $basePrices = [
                    'room_self' => 1500,
                    'room_and_parlor' => 2000,
                    '2_bedroom' => 2500,
                    '3_bedroom' => 3000,
                    'duplex' => 4000
                ];

                $basePrice = $basePrices[$user->house_type] ?? 1500;

                $packages = [
                    'user_package' => [
                        'title' => $this->formatHouseType($user->house_type),
                        'description' => 'Subscription for your residence',
                        'base_price' => $basePrice,
                        'plans' => [
                            [
                                'period' => 'monthly',
                                'amount' => $basePrice,
                                'duration' => 1,
                                'savings' => 0
                            ],
                            [
                                'period' => '6months',
                                'amount' => $basePrice * 6,
                                'duration' => 6,
                                'savings' => 0
                            ],
                            [
                                'period' => 'yearly',
                                'amount' => $basePrice * 12,
                                'duration' => 12,
                                'savings' => 0
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
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            $request->validate([
                'package_type' => 'required|string|in:tenant,landlord_alone,landlord_with_tenants',
                'period' => 'required|in:monthly,6months,yearly',
                'amount' => 'required|numeric|min:1'
            ]);

            $packageType = $request->package_type;
            $period = $request->period;
            $amount = $request->amount;

            // Validate amount matches package configuration
            $packageConfig = config('flutterwave.packages.' . $packageType . '.' . $period);
            if (!$packageConfig || $packageConfig['amount'] !== (float)$amount) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid package or amount'
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
                'status' => Payment::STATUS_PENDING
            ]);

            // Prepare Flutterwave payment data
            $flutterwaveData = [
                'tx_ref' => $txRef,
                'amount' => $amount,
                'currency' => 'NGN',
                'redirect_url' => config('app.url') . '/payment/callback',
                'customer' => [
                    'email' => $user->email,
                    'name' => $user->full_name,
                    'phonenumber' => $user->phone ?? ''
                ],
                'customizations' => [
                    'title' => 'SpringField Estate Subscription',
                    'description' => ucfirst($packageType) . ' - ' . ucfirst($period) . ' plan',
                    'logo' => ''
                ],
                'meta' => [
                    'user_id' => $user->id,
                    'package_type' => $packageType,
                    'period' => $period,
                    'payment_id' => $payment->id
                ]
            ];

            $flutterwaveService = new FlutterwaveService();
            $initResult = $flutterwaveService->initializePayment($flutterwaveData);

            if (!$initResult['success']) {
                // Delete the payment record if Flutterwave initialization failed
                $payment->delete();
                
                return response()->json([
                    'success' => false,
                    'message' => $initResult['message'] ?? 'Payment initialization failed'
                ], 500);
            }

            Log::info('Payment initialized successfully', [
                'user_id' => $user->id,
                'payment_id' => $payment->id,
                'package_type' => $packageType,
                'period' => $period,
                'amount' => $amount,
                'tx_ref' => $txRef
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'payment_id' => $payment->id,
                    'tx_ref' => $txRef,
                    'amount' => $amount,
                    'currency' => 'NGN',
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
                ]
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

                        // Process payment tracking
                        $paymentTrackingService = new PaymentTrackingService();
                        $packageDuration = $paymentTrackingService->getPackageDurationInMonths([
                            'amount' => $amount
                        ]);
                        
                        $user = $payment->user;
                        $trackingResult = $paymentTrackingService->processPayment(
                            $user, 
                            $payment, 
                            $packageDuration
                        );

                        Log::info('Payment completed successfully', [
                            'payment_id' => $payment->id,
                            'user_id' => $payment->user_id,
                            'amount' => $amount,
                            'tx_ref' => $txRef,
                            'flutterwave_id' => $flutterwaveId,
                            'months_added' => $packageDuration,
                            'tracking_result' => $trackingResult
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