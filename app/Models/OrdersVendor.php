<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrdersVendor extends Model
{
    protected $table = 'orders_vendor';
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
