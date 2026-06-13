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
            $table->text('suggestion')->nullable()->after('comment');
        });

        Schema::table('vendor_reviews', function (Blueprint $table) {
            $table->text('suggestion')->nullable()->after('comment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_user', function (Blueprint $table) {
            $table->dropColumn('suggestion');
        });

        Schema::table('vendor_reviews', function (Blueprint $table) {
            $table->dropColumn('suggestion');
        });
    }
};
