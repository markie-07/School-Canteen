<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServingVendor extends Model
{
    protected $table = 'serving_vendor';
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
