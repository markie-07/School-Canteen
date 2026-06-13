<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    use HasFactory;

    protected $table = 'stores';

    protected $fillable = [
        'user_id',
        'store_name',
        'stall_number',
        'description',
        'opening_time',
        'closing_time',
        'status',
        'profile_image',
        'cover_photo',
        'rating',
        'rating_count',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
