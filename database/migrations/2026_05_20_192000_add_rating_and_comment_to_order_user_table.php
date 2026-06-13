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
        Schema::table('order_user', function (Blueprint $table) {
            $table->tinyInteger('rating')->nullable()->after('status');
            $table->text('comment')->nullable()->after('rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_user', function (Blueprint $table) {
            $table->dropColumn(['rating', 'comment']);
        });
    }
};
