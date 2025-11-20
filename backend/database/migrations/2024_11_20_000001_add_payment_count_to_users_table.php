<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->integer('payment_count')->default(0)->after('email_verified_at')
                ->comment('Total months paid for since registration');
            $table->boolean('is_payment_up_to_date')->default(true)->after('payment_count')
                ->comment('Whether user is up to date with monthly payments');
            $table->timestamp('last_payment_check')->nullable()->after('is_payment_up_to_date')
                ->comment('Last time payment status was checked');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['payment_count', 'is_payment_up_to_date', 'last_payment_check']);
        });
    }
};