<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // Add columns if they don't exist
            if (!Schema::hasColumn('subscriptions', 'user_id')) {
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
            }
            if (!Schema::hasColumn('subscriptions', 'payment_id')) {
                $table->foreignId('payment_id')->nullable()->constrained()->onDelete('set null');
            }
            if (!Schema::hasColumn('subscriptions', 'package_type')) {
                $table->string('package_type');
            }
            if (!Schema::hasColumn('subscriptions', 'period')) {
                $table->string('period');
            }
            if (!Schema::hasColumn('subscriptions', 'amount')) {
                $table->decimal('amount', 10, 2);
            }
            if (!Schema::hasColumn('subscriptions', 'starts_at')) {
                $table->datetime('starts_at');
            }
            if (!Schema::hasColumn('subscriptions', 'expires_at')) {
                $table->datetime('expires_at');
            }
            if (!Schema::hasColumn('subscriptions', 'status')) {
                $table->enum('status', ['active', 'expired', 'cancelled', 'suspended'])->default('active');
            }
            if (!Schema::hasColumn('subscriptions', 'auto_renew')) {
                $table->boolean('auto_renew')->default(false);
            }
            if (!Schema::hasColumn('subscriptions', 'subscription_data')) {
                $table->json('subscription_data')->nullable();
            }
        });
        
        // Add indexes for performance (using try-catch to avoid errors if indexes already exist)
        try {
            Schema::table('subscriptions', function (Blueprint $table) {
                $table->index(['user_id', 'status'], 'idx_subscriptions_user_status');
                $table->index(['expires_at', 'status'], 'idx_subscriptions_expires_status');
            });
        } catch (\Exception $e) {
            // Indexes may already exist, ignore the error
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            try {
                $table->dropIndex('idx_subscriptions_user_status');
                $table->dropIndex('idx_subscriptions_expires_status');
            } catch (\Exception $e) {
                // Ignore if indexes don't exist
            }
            
            $table->dropColumn([
                'user_id', 'payment_id', 'package_type', 'period', 'amount',
                'starts_at', 'expires_at', 'status', 'auto_renew', 'subscription_data'
            ]);
        });
    }
};
