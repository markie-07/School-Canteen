<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorReview extends Model
{
    use HasFactory;

    protected $table = 'vendor_reviews';

    protected $fillable = [
        'user_id',
        'vendor_id',
        'order_id',
        'rating',
        'comment',
        'suggestion',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function vendor()
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    public function order()
    {
        return $this->belongsTo(UserOrder::class, 'order_id');
    }
}
