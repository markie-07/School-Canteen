<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class VendorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Vendor Account
        User::factory()->create([
            'name' => 'Food Vendor',
            'email' => 'vendor@canteen.com',
            'password' => bcrypt('password'),
            'role' => 'vendor',
            'store_name' => 'Deluxe Diner',
        ]);
    }
}
