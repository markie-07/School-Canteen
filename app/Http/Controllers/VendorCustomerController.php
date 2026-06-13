<?php

namespace App\Http\Controllers;

use App\Models\ServedVendor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class VendorCustomerController extends Controller
{
    public function index()
    {
        // Get unique customers with their aggregate data from served orders
        $customers = ServedVendor::select('customer_name', 
            DB::raw('COUNT(*) as total_orders'), 
            DB::raw('SUM(total_price) as total_spent'),
            DB::raw('MAX(created_at) as last_purchase')
        )
        ->groupBy('customer_name')
        ->orderBy('last_purchase', 'desc')
        ->get();

        // Get all historical orders to display in the history section or drill-down
        $orderHistory = ServedVendor::orderBy('created_at', 'desc')->get();

        return Inertia::render('Vendor/VendorCustomer', [
            'customers' => $customers,
            'orderHistory' => $orderHistory
        ]);
    }
}
