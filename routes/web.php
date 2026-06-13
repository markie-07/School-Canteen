<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MenuVendorController;
use App\Http\Controllers\InventoryVendorController;
use App\Http\Controllers\ProcurementVendorController;
use App\Http\Controllers\VendorOrderController;
use App\Http\Controllers\VendorCustomerController;
use App\Http\Controllers\UserOrderController;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return Inertia::render('Auth/Login');
});

Route::get('/dashboard', function () {
    $role = auth()->user()->role;
    if ($role === 'admin') {
        return redirect()->route('admin.dashboard');
    } elseif ($role === 'vendor') {
        return redirect()->route('vendor.dashboard');
    } else {
        return redirect()->route('user.dashboard');
    }
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/admin/dashboard', [\App\Http\Controllers\AdminDashboardController::class, 'index'])
    ->middleware(['auth', 'role:admin'])
    ->name('admin.dashboard');

Route::middleware(['auth', 'role:user'])->prefix('user')->name('user.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('User/Dashboard');
    })->name('dashboard');
    
    Route::get('/order', [UserOrderController::class, 'index'])->name('order');
    Route::get('/orders', [UserOrderController::class, 'orders'])->name('orders');
    Route::post('/place-order', [UserOrderController::class, 'placeOrder'])->name('place-order');
    Route::patch('/orders/{id}/cancel', [UserOrderController::class, 'cancelOrder'])->name('orders.cancel');
    Route::post('/orders/{id}/rate', [UserOrderController::class, 'rateOrder'])->name('orders.rate');
    Route::get('/vendor/{id}/menu', [UserOrderController::class, 'showVendorMenu'])->name('vendor.menu');
    Route::get('/profile', [ProfileController::class, 'userProfile'])->name('profile');
    Route::patch('/profile', [ProfileController::class, 'userProfileUpdate'])->name('profile.update');
});

Route::middleware(['auth', 'role:vendor'])->prefix('vendor')->name('vendor.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\VendorDashboardController::class, 'index'])->name('dashboard');
    
    Route::get('/orders/new', [VendorOrderController::class, 'orders'])->name('orders.new');
    Route::get('/orders/preparing', [VendorOrderController::class, 'preparing'])->name('orders.preparing');
    Route::get('/orders/serving', [VendorOrderController::class, 'serving'])->name('orders.serving');
    Route::get('/orders/served', [VendorOrderController::class, 'served'])->name('orders.served');
    Route::patch('/orders/{vendorOrder}/status', [VendorOrderController::class, 'updateStatus'])->name('orders.update-status');
    
    Route::get('/menu', [\App\Http\Controllers\MenuController::class, 'index'])->name('menu');
    Route::post('/menu', [\App\Http\Controllers\MenuController::class, 'store'])->name('menu.store');
    Route::put('/menu/{menu}', [\App\Http\Controllers\MenuController::class, 'update'])->name('menu.update');
    Route::delete('/menu/{menu}', [\App\Http\Controllers\MenuController::class, 'destroy'])->name('menu.destroy');
    Route::patch('/menu/{menu}/status', [\App\Http\Controllers\MenuController::class, 'toggleStatus'])->name('menu.toggle-status');
    
    Route::get('/reports/sales', function () {
        return Inertia::render('Vendor/VendorSalesReport');
    })->name('reports.sales');
    
    Route::get('/inventory', [InventoryVendorController::class, 'index'])->name('inventory');
    Route::post('/inventory', [InventoryVendorController::class, 'store'])->name('inventory.store');
    Route::put('/inventory/{inventoryVendor}', [InventoryVendorController::class, 'update'])->name('inventory.update');
    Route::delete('/inventory/{inventoryVendor}', [InventoryVendorController::class, 'destroy'])->name('inventory.destroy');
    
    Route::get('/reports/procurement', [ProcurementVendorController::class, 'index'])->name('reports.procurement');
    Route::post('/reports/procurement', [ProcurementVendorController::class, 'store'])->name('reports.procurement.store');
    Route::put('/reports/procurement/{procurementVendor}', [ProcurementVendorController::class, 'update'])->name('reports.procurement.update');
    Route::delete('/reports/procurement/{procurementVendor}', [ProcurementVendorController::class, 'destroy'])->name('reports.procurement.destroy');
    Route::get('/customers', [VendorCustomerController::class, 'index'])->name('customers');
    Route::get('/reviews', function () {
        $vendorId = auth()->id();
        
        $realReviews = \App\Models\VendorReview::where('vendor_reviews.vendor_id', $vendorId)
            ->join('users', 'vendor_reviews.user_id', '=', 'users.id')
            ->select(
                'vendor_reviews.id',
                'users.name as customer',
                'vendor_reviews.rating',
                'vendor_reviews.comment',
                'vendor_reviews.suggestion',
                'vendor_reviews.created_at'
            )
            ->latest('vendor_reviews.created_at')
            ->get()
            ->map(function ($review) {
                return [
                    'id' => $review->id,
                    'customer' => $review->customer,
                    'rating' => $review->rating,
                    'comment' => $review->comment ? $review->comment : "No comment left.",
                    'suggestion' => $review->suggestion,
                    'date' => $review->created_at->toDateString(),
                    'avatar' => '👤',
                    'likes' => 0,
                    'isLiked' => false,
                    'replies' => [],
                    'isFlagged' => false
                ];
            });

        return inertia('Vendor/VendorReviews', [
            'initialReviews' => $realReviews
        ]);
    })->name('reviews');
    Route::get('/profile', [\App\Http\Controllers\VendorProfileController::class, 'index'])->name('profile');
    Route::post('/profile/update', [\App\Http\Controllers\VendorProfileController::class, 'update'])->name('profile.update-details');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
