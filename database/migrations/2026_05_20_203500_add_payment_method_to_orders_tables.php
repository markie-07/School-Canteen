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
        $tables = ['order_user', 'orders_vendor', 'preparing_vendor', 'serving_vendor', 'served_vendor'];
        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->string('payment_method')->default('Cash')->after('total_price');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = ['order_user', 'orders_vendor', 'preparing_vendor', 'serving_vendor', 'served_vendor'];
        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->dropColumn('payment_method');
            });
        }
    }
};
