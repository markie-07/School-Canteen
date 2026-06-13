<?php

use App\Models\User;
use App\Models\ProfileVendor;
use Illuminate\Support\Facades\DB;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$vendors = User::where('role', 'vendor')->get();

foreach ($vendors as $vendor) {
    ProfileVendor::updateOrCreate(
        ['user_id' => $vendor->id],
        [
            'store_name' => $vendor->store_name,
            'stall_number' => $vendor->stall_number,
            'description' => $vendor->description,
            'opening_time' => $vendor->opening_time,
            'closing_time' => $vendor->closing_time,
            'status' => $vendor->status ?? 'Open',
            'profile_image' => $vendor->profile_image,
            'cover_photo' => $vendor->cover_photo,
        ]
    );
    echo "Migrated: " . ($vendor->store_name ?: $vendor->name) . "\n";
}

echo "Migration complete!\n";
