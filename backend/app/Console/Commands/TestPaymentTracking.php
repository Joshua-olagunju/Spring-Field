<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class TestPaymentTracking extends Command
{
    protected $signature = 'payment:test';
    protected $description = 'Test payment tracking system display';

    public function handle()
    {
        $this->info('🔍 PAYMENT TRACKING SYSTEM TEST');
        $this->info('================================');
        $this->newLine();

        $users = User::where('role', '!=', User::ROLE_SUPER)->take(10)->get();

        if ($users->isEmpty()) {
            $this->warn('No users found to test.');
            return;
        }

        $this->table(
            ['Email', 'Registration', 'Days Ago', 'Payment Ratio', 'Status', 'Message'],
            $users->map(function ($user) {
                $status = $user->getPaymentStatus();
                $daysAgo = $user->created_at->diffInDays(now());
                
                return [
                    $user->email,
                    $user->created_at->format('Y-m-d'),
                    $daysAgo . ' days',
                    $status['payment_ratio'],
                    $status['is_up_to_date'] ? '✅ Up to date' : '❌ Behind',
                    $status['status_message']
                ];
            })->toArray()
        );

        $this->newLine();
        $this->info('📊 EXAMPLES OF PAYMENT RATIOS:');
        $this->info('2/3 → User paid 2 months, should have paid 3 months → Behind');
        $this->info('6/4 → User paid 6 months, should have paid 4 months → Ahead');
        $this->info('2/2 → User paid 2 months, should have paid 2 months → Up to date');
        $this->info('0/1 → User paid 0 months, should have paid 1 month → Behind');
        
        $this->newLine();
        
        // Test specific scenarios
        if ($users->count() > 0) {
            $testUser = $users->first();
            $this->info("🧪 DETAILED TEST FOR: {$testUser->email}");
            $this->info("Registration Date: {$testUser->created_at}");
            $this->info("Months since registration: {$testUser->getMonthsSinceRegistration()}");
            $this->info("Payment count: {$testUser->payment_count}");
            $this->info("Required payments: {$testUser->getRequiredPayments()}");
            $this->info("Is up to date: " . ($testUser->isPaymentUpToDate() ? 'Yes' : 'No'));
            
            $status = $testUser->getPaymentStatus();
            $this->info("Payment ratio: {$status['payment_ratio']}");
            $this->info("Status message: {$status['status_message']}");
        }
    }
}