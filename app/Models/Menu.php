<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $table = 'menus';

    protected $fillable = [
        'vendor_id',
        'name',
        'category',
        'price',
        'status',
        'stock',
        'description',
        'cooking_time',
        'images',
        'ingredients'
    ];

    public function vendor()
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    protected $casts = [
        'images' => 'array',
        'ingredients' => 'array',
        'price' => 'decimal:2'
    ];
}
