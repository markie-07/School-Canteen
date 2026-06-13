<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vendor_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('vendor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('order_id')->nullable()->constrained('order_user')->onDelete('set null');
            $table->tinyInteger('rating');
            $table->text('comment')->nullable();
            $table->timestamps();
        });

        // Port existing rating/comments from order_user to vendor_reviews
        $existingRatings = DB::table('order_user')
            ->whereNotNull('rating')
            ->get();

        foreach ($existingRatings as $order) {
            DB::table('vendor_reviews')->insert([
                'user_id' => $order->user_id,
                'vendor_id' => $order->vendor_id,
                'order_id' => $order->id,
                'rating' => $order->rating,
                'comment' => $order->comment,
                'created_at' => $order->updated_at ?? now(),
                'updated_at' => $order->updated_at ?? now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_reviews');
    }
};
