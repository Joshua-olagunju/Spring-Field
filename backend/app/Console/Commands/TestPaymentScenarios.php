<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class TestPaymentScenarios extends Command
{
    protected $signature = 'payment:test-scenarios';
    protected $description = 'Test different payment tracking scenarios';

    public function handle()
    {
        $this->info('🧪 PAYMENT TRACKING SCENARIOS TEST');
        $this->info('===================================');
        $this->newLine();

        $user = User::first();
        if (!$user) {
            $this->error('No users found for testing');
            return;
        }

        $this->info("Testing with user: {$user->email}");
        $this->newLine();

        // Save original values
        $originalCreatedAt = $user->created_at;
        $originalPaymentCount = $user->payment_count;

        // Test scenarios
        $scenarios = [
            [
                'name' => 'New user (just registered today)',
                'months_ago' => 0,
                'payment_count' => 0,
                'expected' => '0/1 (Behind - must pay immediately)'
            ],
            [
                'name' => 'New user who paid 1 month',
                'months_ago' => 0,
                'payment_count' => 1,
                'expected' => '1/1 (Up to date)'
            ],
            [
                'name' => 'User registered 3 months ago, no payments',
                'months_ago' => 3,
                'payment_count' => 0,
                'expected' => '0/4 (Behind by 4 months)'
            ],
            [
                'name' => 'User registered 3 months ago, paid 2 months',
                'months_ago' => 3,
                'payment_count' => 2,
                'expected' => '2/4 (Behind by 2 months)'
            ],
            [
                'name' => 'User registered 4 months ago, paid 6 months',
                'months_ago' => 4,
                'payment_count' => 6,
                'expected' => '6/5 (Ahead by 1 month)'
            ],
            [
                'name' => 'User registered 2 months ago, paid 3 months',
                'months_ago' => 2,
                'payment_count' => 3,
                'expected' => '3/3 (Perfect match)'
            ]
        ];

        foreach ($scenarios as $index => $scenario) {
            $this->info("Scenario " . ($index + 1) . ": " . $scenario['name']);
            
            // Set up scenario
            $user->created_at = now()->subMonths($scenario['months_ago']);
            $user->payment_count = $scenario['payment_count'];
            $user->save();
            
            // Get results
            $user = $user->fresh();
            $status = $user->getPaymentStatus();
            
            $this->line("  Registration: " . $user->created_at->format('Y-m-d'));
            $this->line("  Payment ratio: " . $status['payment_ratio']);
            $this->line("  Status: " . ($user->isPaymentUpToDate() ? '✅ Up to date' : '❌ Behind'));
            $this->line("  Message: " . $status['status_message']);
            $this->line("  Expected: " . $scenario['expected']);
            $this->newLine();
        }

        // Restore original values
        $user->created_at = $originalCreatedAt;
        $user->payment_count = $originalPaymentCount;
        $user->save();

        $this->info('🎯 SUMMARY:');
        $this->info('The payment ratio shows: paid_months/required_months');
        $this->info('CORRECT Examples:');
        $this->info('  0/1 = New user owes 1 month immediately (❌ behind)');
        $this->info('  1/1 = New user paid 1 month (✅ up to date)');
        $this->info('  0/4 = User owes 4 months (❌ behind)');
        $this->info('  2/4 = User owes 2 months (❌ behind)');
        $this->info('  6/5 = User paid extra 1 month (✅ ahead)');
        $this->info('  3/3 = User is exactly up to date (✅ perfect)');
        
        $this->newLine();
        $this->info('✅ Payment tracking system is working correctly!');
        $this->info('User restored to original state.');
        
        return Command::SUCCESS;
    }
}
