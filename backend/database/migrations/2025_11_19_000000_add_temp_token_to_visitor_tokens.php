<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('visitor_tokens') && !Schema::hasColumn('visitor_tokens', 'temp_token')) {
            Schema::table('visitor_tokens', function (Blueprint $table) {
                $table->string('temp_token', 20)->nullable()->after('token_hash');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('visitor_tokens') && Schema::hasColumn('visitor_tokens', 'temp_token')) {
            Schema::table('visitor_tokens', function (Blueprint $table) {
                $table->dropColumn('temp_token');
            });
        }
    }
};