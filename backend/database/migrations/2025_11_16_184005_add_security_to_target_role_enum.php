<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Add security to the target_role enum
        DB::statement("ALTER TABLE registration_otps MODIFY target_role ENUM('landlord', 'resident', 'security') NOT NULL");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Remove security from the target_role enum
        DB::statement("ALTER TABLE registration_otps MODIFY target_role ENUM('landlord', 'resident') NOT NULL");
    }
};
