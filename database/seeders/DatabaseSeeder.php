<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin Account
        User::factory()->create([
            'name' => 'Canteen Admin',
            'email' => 'admin@canteen.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Student Account
        User::factory()->create([
            'name' => 'Student User',
            'email' => 'student@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
            'id_number' => 'STUD-2026-0001',
            'phone' => '09949960325',
        ]);

        // Vendor Account
        $vendor = User::factory()->create([
            'name' => 'Food Vendor',
            'email' => 'vendor@canteen.com',
            'password' => bcrypt('password'),
            'role' => 'vendor',
            'store_name' => 'Deluxe Diner',
        ]);

        // Example Menu Items for Vendor
        \App\Models\Menu::create([
            'vendor_id' => $vendor->id,
            'name' => 'Classic Beef Burger',
            'category' => 'Main Course',
            'price' => 85.00,
            'status' => 'Available',
            'stock' => 50,
            'description' => 'A juicy 100% beef patty seasoned to perfection, topped with fresh lettuce, vine-ripened tomatoes, crunchy pickles, and our signature secret sauce on a toasted brioche bun.',
            'images' => ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80']
        ]);

        \App\Models\Menu::create([
            'vendor_id' => $vendor->id,
            'name' => 'Crispy Chicken Sandwich',
            'category' => 'Main Course',
            'price' => 75.00,
            'status' => 'Available',
            'stock' => 30,
            'description' => 'Hand-breaded chicken breast fried to golden perfection, served with spicy mayo and tangy coleslaw on a soft potato roll.',
            'images' => ['https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=400&q=80']
        ]);
    }
}
