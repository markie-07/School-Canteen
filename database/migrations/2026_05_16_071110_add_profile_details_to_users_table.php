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
            $table->string('phone')->nullable()->after('store_name');
            $table->string('stall_number')->nullable()->after('phone');
            $table->text('description')->nullable()->after('stall_number');
            $table->time('opening_time')->nullable()->after('description');
            $table->time('closing_time')->nullable()->after('opening_time');
            $table->string('status')->default('Open')->after('closing_time');
            $table->string('profile_image')->nullable()->after('status');
            $table->string('cover_photo')->nullable()->after('profile_image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'stall_number', 'description', 'opening_time', 'closing_time', 'status', 'profile_image', 'cover_photo']);
        });
    }
};
