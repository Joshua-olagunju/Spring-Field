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
        Schema::create('registration_otps', function (Blueprint $table) {
            $table->id();
            $table->string('otp_code', 10)->unique();
            $table->unsignedBigInteger('generated_by'); // User who generated the OTP
            $table->enum('target_role', ['landlord', 'resident']); // Role for the person who will use this OTP
            $table->string('house_number', 50)->nullable(); // Pre-filled for resident OTPs
            $table->string('address', 255)->nullable(); // Pre-filled for resident OTPs
            $table->unsignedBigInteger('house_id')->nullable(); // For resident OTPs from landlords
            $table->datetime('expires_at');
            $table->datetime('used_at')->nullable();
            $table->unsignedBigInteger('used_by')->nullable(); // User who used the OTP
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable(); // Additional data
            $table->timestamps();
            
            // Foreign key constraints
            $table->foreign('generated_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('used_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('house_id')->references('id')->on('houses')->onDelete('set null');
            
            // Indexes
            $table->index(['otp_code', 'is_active']);
            $table->index(['generated_by', 'target_role']);
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('registration_otps');
    }
};
