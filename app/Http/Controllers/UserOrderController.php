<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Menu;
use App\Models\UserOrder;
use App\Models\OrdersVendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UserOrderController extends Controller
{
    public function index()
    {
        // Fetch vendors with their profiles
        $vendors = User::where('role', 'vendor')
            ->leftJoin('stores', 'users.id', '=', 'stores.user_id')
            ->select(
                'users.id', 
                'users.name', 
                DB::raw('COALESCE(stores.store_name, users.store_name) as store_name'),
                DB::raw('COALESCE(stores.stall_number, users.stall_number) as stall_number'),
                DB::raw('COALESCE(stores.description, users.description) as description'),
                DB::raw('COALESCE(stores.opening_time, users.opening_time) as opening_time'),
                DB::raw('COALESCE(stores.closing_time, users.closing_time) as closing_time'),
                DB::raw('COALESCE(stores.profile_image, users.profile_image) as profile_image'),
                DB::raw('COALESCE(stores.cover_photo, users.cover_photo) as cover_photo'),
                DB::raw('COALESCE(stores.status, users.status, "Open") as status'),
                'stores.rating'
            )
            ->get();

        return Inertia::render('User/UserOrder', [
            'vendors' => $vendors
        ]);
    }

    public function showVendorMenu($id)
    {
        $vendor = User::with('profile')->findOrFail($id);
        
        // Flatten the profile data for easier use in the frontend if preferred, 
        // or just pass it as is. I'll pass it as is but ensure the frontend handles it.
        
        $menuItems = Menu::where('vendor_id', $id)
            ->where('status', 'Available')
            ->get();

        return response()->json([
            'vendor' => $vendor,
            'menuItems' => $menuItems
        ]);
    }

    public function orders()
    {
        $userId = auth()->id();
        
        // Dynamically sync status with vendor tables to repair any old or out-of-sync order records
        $orderNumbers = UserOrder::where('user_id', $userId)->pluck('order_number');
        
        if ($orderNumbers->isNotEmpty()) {
            // Sync Pending orders (presence in orders_vendor)
            $pendingNums = \App\Models\OrdersVendor::whereIn('order_number', $orderNumbers)->pluck('order_number');
            if ($pendingNums->isNotEmpty()) {
                UserOrder::whereIn('order_number', $pendingNums)->update(['status' => 'Pending']);
            }

            // Sync Preparing orders
            $preparingNums = \App\Models\PreparingVendor::whereIn('order_number', $orderNumbers)->pluck('order_number');
            if ($preparingNums->isNotEmpty()) {
                UserOrder::whereIn('order_number', $preparingNums)->update(['status' => 'Preparing']);
            }

            // Sync Serving orders
            $servingNums = \App\Models\ServingVendor::whereIn('order_number', $orderNumbers)->pluck('order_number');
            if ($servingNums->isNotEmpty()) {
                UserOrder::whereIn('order_number', $servingNums)->update(['status' => 'Serving']);
            }

            // Sync Served (Completed) orders
            $servedNums = \App\Models\ServedVendor::whereIn('order_number', $orderNumbers)->pluck('order_number');
            if ($servedNums->isNotEmpty()) {
                UserOrder::whereIn('order_number', $servedNums)->update(['status' => 'Served']);
            }
        }
        
        $allOrders = UserOrder::where('order_user.user_id', $userId)
            ->join('users', 'order_user.vendor_id', '=', 'users.id')
            ->leftJoin('stores', 'users.id', '=', 'stores.user_id')
            ->select(
                'order_user.*',
                DB::raw('COALESCE(stores.store_name, users.store_name) as vendor_name'),
                DB::raw('COALESCE(stores.profile_image, users.profile_image) as vendor_logo')
            )
            ->latest('order_user.created_at')
            ->get();

        $pending = $allOrders->where('status', 'Pending')->values();
        $preparing = $allOrders->where('status', 'Preparing')->values();
        $serving = $allOrders->where('status', 'Serving')->values();
        $served = $allOrders->whereIn('status', ['Served', 'Cancelled'])->values();

        return Inertia::render('User/UserMyOrder', [
            'orders' => [
                'pending' => $pending,
                'preparing' => $preparing,
                'serving' => $serving,
                'served' => $served
            ]
        ]);
    }

    public function placeOrder(Request $request)
    {
        $request->validate([
            'cart' => 'required|array|min:1',
            'vendor_id' => 'required|exists:users,id',
            'payment_method' => 'nullable|string|in:Cash,GCash,Maya'
        ]);

        $user = auth()->user();
        $cart = $request->cart;
        $vendorId = $request->vendor_id;
        $paymentMethod = $request->input('payment_method', 'Cash');

        $totalPrice = collect($cart)->sum('totalPrice');

        // Create the order in the new order_user table
        $order = UserOrder::create([
            'user_id' => $user->id,
            'vendor_id' => $vendorId,
            'order_number' => 'ORD-' . strtoupper(uniqid()),
            'items' => json_encode($cart), 
            'total_price' => $totalPrice,
            'payment_method' => $paymentMethod,
            'status' => 'Pending'
        ]);

        // For backward compatibility
        OrdersVendor::create([
            'order_number' => $order->order_number,
            'customer_name' => $user->name,
            'items' => collect($cart)->map(fn($i) => $i['quantity'] . 'x ' . $i['name'] . (isset($i['notes']) && $i['notes'] ? " (" . $i['notes'] . ")" : ""))->implode(', '),
            'total_price' => $totalPrice,
            'payment_method' => $paymentMethod,
            'user_id' => $user->id,
            'vendor_id' => $vendorId
        ]);

        return redirect()->back()->with('success', 'Order placed successfully!');
    }

    public function cancelOrder(Request $request, $id)
    {
        $request->validate([
            'cancel_reason' => 'required|string|max:255'
        ]);

        $order = UserOrder::findOrFail($id);

        // Security check: ensure the authenticated user owns this order
        if ($order->user_id !== auth()->id()) {
            return redirect()->back()->with('error', 'Unauthorized action.');
        }

        // Only allow cancellation if status is still 'Pending'
        if ($order->status !== 'Pending') {
            return redirect()->back()->with('error', 'Order cannot be cancelled because it is already being prepared.');
        }

        // Update the order in order_user table
        $order->update([
            'status' => 'Cancelled',
            'cancel_reason' => 'Customer: ' . $request->cancel_reason
        ]);

        // Delete from the vendor's pending orders table (OrdersVendor)
        OrdersVendor::where('order_number', $order->order_number)->delete();

        return redirect()->back()->with('success', 'Order cancelled successfully.');
    }

    public function rateOrder(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
            'suggestion' => 'nullable|string|max:500'
        ]);

        $order = UserOrder::findOrFail($id);

        if ($order->user_id !== auth()->id()) {
            return redirect()->back()->with('error', 'Unauthorized action.');
        }

        if ($order->status !== 'Served') {
            return redirect()->back()->with('error', 'Only completed orders can be rated.');
        }

        if ($order->rating !== null) {
            return redirect()->back()->with('error', 'Order has already been rated.');
        }

        $order->update([
            'rating' => $request->rating,
            'comment' => $request->comment,
            'suggestion' => $request->suggestion
        ]);

        // Create the vendor review
        \App\Models\VendorReview::create([
            'user_id' => auth()->id(),
            'vendor_id' => $order->vendor_id,
            'order_id' => $order->id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'suggestion' => $request->suggestion
        ]);

        // Calculate average rating and count based on the vendor_reviews table
        $ratings = \App\Models\VendorReview::where('vendor_id', $order->vendor_id)
            ->pluck('rating');

        $ratingCount = $ratings->count();
        $averageRating = round($ratings->avg(), 2);

        \App\Models\Store::updateOrCreate(
            ['user_id' => $order->vendor_id],
            [
                'rating' => $averageRating,
                'rating_count' => $ratingCount
            ]
        );

        \App\Models\User::where('id', $order->vendor_id)->update([
            'rating' => $averageRating,
            'rating_count' => $ratingCount
        ]);

        return redirect()->back()->with('success', 'Thank you for your rating!');
    }
}
