<?php

namespace App\Http\Controllers;

use App\Models\OrdersVendor;
use App\Models\PreparingVendor;
use App\Models\ServingVendor;
use App\Models\ServedVendor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorOrderController extends Controller
{
    public function orders()
    {
        return Inertia::render('Vendor/VendorOrders', [
            'orders' => OrdersVendor::with('user')->orderBy('created_at', 'desc')->get()
        ]);
    }

    public function preparing()
    {
        return Inertia::render('Vendor/VendorPreparing', [
            'orders' => PreparingVendor::with('user')->orderBy('updated_at', 'desc')->get()
        ]);
    }

    public function serving()
    {
        return Inertia::render('Vendor/VendorServing', [
            'orders' => ServingVendor::with('user')->orderBy('updated_at', 'desc')->get()
        ]);
    }

    public function served()
    {
        return Inertia::render('Vendor/VendorServed', [
            'orders' => ServedVendor::with('user')->orderBy('updated_at', 'desc')->get()
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:preparing,serving,served,cancelled',
            'current_status' => 'required|string',
            'cancel_reason' => 'nullable|string'
        ]);

        $status = $request->status;
        $currentStatus = $request->current_status;

        $modelMap = [
            'pending' => OrdersVendor::class,
            'preparing' => PreparingVendor::class,
            'serving' => ServingVendor::class,
            'served' => ServedVendor::class,
        ];

        $targetModelMap = [
            'preparing' => PreparingVendor::class,
            'serving' => ServingVendor::class,
            'served' => ServedVendor::class,
        ];

        $currentModelClass = $modelMap[$currentStatus] ?? null;
        if (!$currentModelClass) return redirect()->back();

        $order = $currentModelClass::find($id);
        if (!$order) return redirect()->back();

        // Load user association dynamically to access phone details
        $order->load('user');

        // Synchronize the status with the user's order record
        $statusMap = [
            'preparing' => 'Preparing',
            'serving' => 'Serving',
            'served' => 'Served',
            'cancelled' => 'Cancelled',
        ];
        if (isset($statusMap[$status])) {
            $updateData = [
                'status' => $statusMap[$status]
            ];
            if ($status === 'cancelled' && $request->filled('cancel_reason')) {
                $updateData['cancel_reason'] = 'Vendor: ' . $request->cancel_reason;
            }
            \App\Models\UserOrder::where('order_number', $order->order_number)->update($updateData);
        }

        if ($status === 'cancelled') {
            // Automatically send SMS to the customer explaining the cancellation reason
            if ($order->user && !empty($order->user->phone)) {
                $customerName = $order->user->name;
                $phone = $order->user->phone;
                $orderNumber = $order->order_number;
                $reason = $request->cancel_reason ?? 'No reason specified';
                $message = "Hi {$customerName}, your order #{$orderNumber} has been cancelled by the vendor. Reason: {$reason}.";
                
                \App\Services\SmsService::send($phone, $message);
            }
            $order->delete();
        } else {
            $targetModelClass = $targetModelMap[$status] ?? null;
            if ($targetModelClass) {
                $targetModelClass::create([
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'items' => $order->items,
                    'total_price' => $order->total_price,
                    'payment_method' => $order->payment_method,
                    'user_id' => $order->user_id,
                    'vendor_id' => $order->vendor_id,
                ]);
                $order->delete();
            }
        }

        return redirect()->back();
    }
}
