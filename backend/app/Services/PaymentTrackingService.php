<?php

namespace App\Services;

use App\Models\User;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PaymentTrackingService
{
    /**
     * Process payment and update user's payment count
     * 
     * @param User $user
     * @param Payment $payment
     * @param int $packageDuration Duration in months
     * @return array
     */
    public function processPayment(User $user, Payment $payment, int $packageDuration): array
    {
        try {
            DB::beginTransaction();

            // Add payment months to user's count
            $user->addPaymentMonths($packageDuration);

            Log::info('Payment tracking updated', [
                'user_id' => $user->id,
                'payment_id' => $payment->id,
                'months_added' => $packageDuration,
                'new_payment_count' => $user->fresh()->payment_count,
                'is_up_to_date' => $user->fresh()->isPaymentUpToDate()
            ]);

            DB::commit();

            return [
                'success' => true,
                'message' => 'Payment processed and tracking updated',
                'data' => $user->fresh()->getPaymentStatus()
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Payment tracking update failed', [
                'user_id' => $user->id,
                'payment_id' => $payment->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to update payment tracking'
            ];
        }
    }

    /**
     * Check if user can generate tokens based on payment status
     * 
     * @param User $user
     * @return array
     */
    public function checkTokenGenerationEligibility(User $user): array
    {
        // Super admin users can always generate tokens
        if ($user->role === 'super') {
            return [
                'can_generate' => true,
                'message' => 'Super admin access - unlimited token generation.',
                'payment_status' => [
                    'is_up_to_date' => true,
                    'is_super_admin' => true,
                    'status_message' => 'Super admin - no payment required'
                ]
            ];
        }
        
        // Update the user's payment status first
        $user->updatePaymentStatus();
        
        $paymentStatus = $user->getPaymentStatus();

        if (!$paymentStatus['is_up_to_date']) {
            return [
                'can_generate' => false,
                'message' => sprintf(
                    'You are %d month(s) behind on payments. Please make a payment to continue.',
                    $paymentStatus['months_behind']
                ),
                'payment_status' => $paymentStatus
            ];
        }

        return [
            'can_generate' => true,
            'message' => 'Payment is up to date. You can generate tokens.',
            'payment_status' => $paymentStatus
        ];
    }

    /**
     * Get subscription status for API compatibility
     * 
     * @param User $user
     * @return array
     */
    public function getSubscriptionStatus(User $user): array
    {
        // Super admin users have unlimited access
        if ($user->role === 'super') {
            return [
                'has_active_subscription' => true,
                'subscription_type' => 'super_admin',
                'payment_status' => [
                    'is_up_to_date' => true,
                    'is_super_admin' => true,
                    'status_message' => 'Super admin - no payment required'
                ],
                'can_generate_tokens' => true
            ];
        }
        
        $paymentStatus = $user->getPaymentStatus();
        
        return [
            'has_active_subscription' => $paymentStatus['is_up_to_date'],
            'subscription_type' => $paymentStatus['is_up_to_date'] ? 'monthly_tracking' : 'expired',
            'payment_status' => $paymentStatus,
            'can_generate_tokens' => $paymentStatus['can_access_paid_features']
        ];
    }

    /**
     * Run monthly check for all users
     * 
     * @return array
     */
    public function runMonthlyCheck(): array
    {
        $users = User::where('role', '!=', User::ROLE_SUPER)->get();
        $updated = 0;
        $errors = 0;

        foreach ($users as $user) {
            try {
                $oldStatus = $user->is_payment_up_to_date;
                $user->updatePaymentStatus();
                $newStatus = $user->fresh()->is_payment_up_to_date;

                if ($oldStatus !== $newStatus) {
                    $updated++;
                    Log::info('User payment status updated', [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'old_status' => $oldStatus,
                        'new_status' => $newStatus,
                        'payment_count' => $user->payment_count,
                        'required_payments' => $user->getRequiredPayments()
                    ]);
                }
            } catch (\Exception $e) {
                $errors++;
                Log::error('Failed to update user payment status', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return [
            'success' => true,
            'message' => "Monthly check completed. Updated {$updated} users, {$errors} errors.",
            'users_checked' => $users->count(),
            'users_updated' => $updated,
            'errors' => $errors
        ];
    }

    /**
     * Get users who are behind on payments
     * 
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUsersBehindOnPayments()
    {
        return User::where('is_payment_up_to_date', false)
                   ->where('role', '!=', User::ROLE_SUPER)
                   ->get();
    }

    /**
     * Get payment statistics
     * 
     * @return array
     */
    public function getPaymentStatistics(): array
    {
        $totalUsers = User::where('role', '!=', User::ROLE_SUPER)->count();
        $upToDateUsers = User::where('is_payment_up_to_date', true)
                            ->where('role', '!=', User::ROLE_SUPER)
                            ->count();
        $behindUsers = $totalUsers - $upToDateUsers;

        $averagePaymentCount = User::where('role', '!=', User::ROLE_SUPER)
                                  ->avg('payment_count');

        return [
            'total_users' => $totalUsers,
            'up_to_date_users' => $upToDateUsers,
            'behind_users' => $behindUsers,
            'up_to_date_percentage' => $totalUsers > 0 ? round(($upToDateUsers / $totalUsers) * 100, 2) : 0,
            'average_payment_count' => round($averagePaymentCount, 2)
        ];
    }

    /**
     * Determine package duration from package details
     * 
     * @param array $packageData
     * @return int Duration in months
     */
    public function getPackageDurationInMonths(array $packageData): int
    {
        $amount = $packageData['amount'] ?? 0;
        
        // Map amount to months based on your pricing
        // Adjust these values to match your actual package pricing
        $priceToMonths = [
            1000 => 1,   // ₦1000 = 1 month
            5000 => 6,   // ₦5000 = 6 months  
            10000 => 12, // ₦10000 = 12 months
        ];

        return $priceToMonths[$amount] ?? 1; // Default to 1 month if unknown amount
    }

    /**
     * Initialize payment tracking for new user
     * NEW USERS START BEHIND - they owe 1 month immediately upon registration
     * 
     * @param User $user
     * @return void
     */
    public function initializeUserPaymentTracking(User $user): void
    {
        $user->update([
            'payment_count' => 0,
            'is_payment_up_to_date' => false, // NEW USERS START BEHIND!
            'last_payment_check' => now()
        ]);

        Log::info('Payment tracking initialized for new user', [
            'user_id' => $user->id,
            'email' => $user->email,
            'registration_date' => $user->created_at,
            'initial_status' => '0/1 (must pay to generate tokens)'
        ]);
    }
}