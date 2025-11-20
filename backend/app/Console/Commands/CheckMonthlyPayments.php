<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\PaymentTrackingService;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class CheckMonthlyPayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:check-monthly 
                           {--dry-run : Show what would happen without making changes}
                           {--user= : Check specific user by email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check all users monthly payment status and update their access';

    /**
     * Create a new command instance.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $isDryRun = $this->option('dry-run');
        $specificUser = $this->option('user');
        
        $this->info('🔄 Starting monthly payment check...');
        
        if ($isDryRun) {
            $this->warn('🧪 DRY RUN MODE - No changes will be made');
        }

        $paymentTrackingService = new PaymentTrackingService();

        try {
            if ($specificUser) {
                $this->checkSpecificUser($specificUser, $paymentTrackingService, $isDryRun);
            } else {
                $this->checkAllUsers($paymentTrackingService, $isDryRun);
            }

            $this->info('✅ Monthly payment check completed successfully');
            return 0;

        } catch (\Exception $e) {
            $this->error('❌ Error during payment check: ' . $e->getMessage());
            Log::error('Monthly payment check failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }

    /**
     * Check all users payment status
     */
    private function checkAllUsers(PaymentTrackingService $paymentTrackingService, bool $isDryRun): void
    {
        $users = User::where('role', '!=', User::ROLE_SUPER)->get();
        
        $this->info("📋 Found {$users->count()} users to check");
        
        $updated = 0;
        $errors = 0;
        $upToDate = 0;
        $behind = 0;

        $progressBar = $this->output->createProgressBar($users->count());
        $progressBar->start();

        foreach ($users as $user) {
            try {
                $oldStatus = $user->is_payment_up_to_date;
                $paymentStatus = $user->getPaymentStatus();
                $newStatus = $paymentStatus['is_up_to_date'];

                if (!$isDryRun) {
                    $user->updatePaymentStatus();
                }

                if ($oldStatus !== $newStatus) {
                    $updated++;
                }

                if ($newStatus) {
                    $upToDate++;
                } else {
                    $behind++;
                }

                $progressBar->advance();

            } catch (\Exception $e) {
                $errors++;
                $this->error("\n❌ Error checking user {$user->email}: " . $e->getMessage());
                $progressBar->advance();
            }
        }

        $progressBar->finish();
        $this->line('');

        // Display summary
        $this->displaySummary($users->count(), $updated, $errors, $upToDate, $behind, $isDryRun);

        // Show statistics
        $this->displayStatistics($paymentTrackingService);
    }

    /**
     * Check specific user
     */
    private function checkSpecificUser(string $email, PaymentTrackingService $paymentTrackingService, bool $isDryRun): void
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("❌ User with email '{$email}' not found");
            return;
        }

        $this->info("👤 Checking user: {$user->full_name} ({$user->email})");

        $paymentStatus = $user->getPaymentStatus();
        
        $this->table(['Field', 'Value'], [
            ['Email', $user->email],
            ['Registration Date', $user->created_at->toDateString()],
            ['Role', $user->role],
            ['Months Since Registration', $paymentStatus['months_since_registration']],
            ['Required Payments', $paymentStatus['required_payments']],
            ['Current Payment Count', $paymentStatus['payment_count']],
            ['Is Up To Date', $paymentStatus['is_up_to_date'] ? '✅ Yes' : '❌ No'],
            ['Months Behind', $paymentStatus['months_behind']],
            ['Months Ahead', $paymentStatus['months_ahead']],
            ['Can Access Paid Features', $paymentStatus['can_access_paid_features'] ? '✅ Yes' : '❌ No'],
            ['Last Payment Check', $paymentStatus['last_payment_check'] ?? 'Never']
        ]);

        if (!$isDryRun) {
            $oldStatus = $user->is_payment_up_to_date;
            $user->updatePaymentStatus();
            $newStatus = $user->fresh()->is_payment_up_to_date;

            if ($oldStatus !== $newStatus) {
                $this->info("📊 Status updated: {$oldStatus} → {$newStatus}");
            } else {
                $this->info("📊 Status unchanged: {$oldStatus}");
            }
        } else {
            $this->info("🧪 DRY RUN: Would update payment status");
        }
    }

    /**
     * Display summary of the check
     */
    private function displaySummary(int $total, int $updated, int $errors, int $upToDate, int $behind, bool $isDryRun): void
    {
        $this->line('');
        $this->info('📊 SUMMARY REPORT');
        $this->line('================');
        
        $this->line("👥 Total Users Checked: {$total}");
        
        if (!$isDryRun) {
            $this->line("🔄 Status Updates Made: {$updated}");
        } else {
            $this->line("🔄 Would Update: {$updated}");
        }
        
        $this->line("❌ Errors: {$errors}");
        $this->line("✅ Users Up To Date: {$upToDate}");
        $this->line("⚠️  Users Behind: {$behind}");
        
        if ($behind > 0) {
            $percentage = round(($behind / $total) * 100, 1);
            $this->warn("⚠️  {$percentage}% of users are behind on payments");
        }
    }

    /**
     * Display payment statistics
     */
    private function displayStatistics(PaymentTrackingService $paymentTrackingService): void
    {
        $stats = $paymentTrackingService->getPaymentStatistics();
        
        $this->line('');
        $this->info('📈 PAYMENT STATISTICS');
        $this->line('=====================');
        
        $this->line("👥 Total Users: {$stats['total_users']}");
        $this->line("✅ Up To Date: {$stats['up_to_date_users']} ({$stats['up_to_date_percentage']}%)");
        $this->line("⚠️  Behind: {$stats['behind_users']}");
        $this->line("📊 Average Payment Count: {$stats['average_payment_count']}");
    }
}