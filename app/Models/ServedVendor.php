<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServedVendor extends Model
{
    protected $table = 'served_vendor';
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
