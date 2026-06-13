<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PreparingVendor extends Model
{
    protected $table = 'preparing_vendor';
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
