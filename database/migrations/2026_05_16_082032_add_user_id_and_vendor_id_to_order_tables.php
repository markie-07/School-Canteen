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
        $tables = ['orders_vendor', 'preparing_vendor', 'serving_vendor', 'served_vendor'];
        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->onDelete('cascade');
                $table->foreignId('vendor_id')->nullable()->after('user_id')->constrained('users')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = ['orders_vendor', 'preparing_vendor', 'serving_vendor', 'served_vendor'];
        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->dropForeign(['user_id']);
                $table->dropForeign(['vendor_id']);
                $table->dropColumn(['user_id', 'vendor_id']);
            });
        }
    }
};
