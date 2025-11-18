<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('visitor_tokens')) {
            Schema::create('visitor_tokens', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('resident_id');
                $table->string('token_hash')->unique();
                $table->string('issued_for_name', 100)->nullable();
                $table->string('issued_for_phone', 20)->nullable();
                $table->enum('visit_type', ['short', 'long', 'delivery', 'contractor', 'other'])->default('short');
                $table->text('note')->nullable();
                $table->datetime('expires_at');
                $table->datetime('used_at')->nullable();
                $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));

                $table->foreign('resident_id')->references('id')->on('users');
            });
        }

        if (!Schema::hasTable('visitor_entries')) {
            Schema::create('visitor_entries', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('token_id');
                $table->string('visitor_name', 100)->nullable();
                $table->string('visitor_phone', 20)->nullable();
                $table->datetime('entered_at')->nullable();
                $table->datetime('exited_at')->nullable();
                $table->unsignedBigInteger('guard_id')->nullable();
                $table->unsignedBigInteger('gate_id')->nullable();
                $table->integer('duration_minutes')->nullable();
                $table->text('note')->nullable();
                $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));

                $table->foreign('token_id')->references('id')->on('visitor_tokens');
                $table->foreign('guard_id')->references('id')->on('users');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('visitor_entries');
        Schema::dropIfExists('visitor_tokens');
    }
};