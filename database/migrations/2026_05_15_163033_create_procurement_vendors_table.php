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
        Schema::create('procurement_vendors', function (Blueprint $table) {
            $table->id();
            $table->string('item_name');
            $table->string('category');
            $table->decimal('quantity', 15, 2);
            $table->string('unit');
            $table->string('supplier');
            $table->decimal('total_cost', 15, 2);
            $table->date('date');
            $table->string('status')->default('Delivered');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('procurement_vendors');
    }
};
