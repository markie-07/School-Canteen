<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserOrder extends Model
{
    protected $table = 'order_user';

    protected $fillable = [
        'user_id',
        'vendor_id',
        'order_number',
        'items',
        'total_price',
        'payment_method',
        'status',
        'cancel_reason',
        'rating',
        'comment',
        'suggestion',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function vendor()
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }
}
