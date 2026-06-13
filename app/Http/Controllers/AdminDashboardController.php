<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Store;
use App\Models\UserOrder;
use App\Models\ServedVendor;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // 1. Core KPIs
        $totalCustomers = User::where('role', 'user')->count();
        $totalVendors = User::where('role', 'vendor')->count();
        $totalOrders = UserOrder::count();
        
        $totalSystemRevenue = (double)UserOrder::where('status', 'Served')->sum('total_price');
        $todayRevenue = (double)UserOrder::where('status', 'Served')
            ->whereDate('created_at', today())
            ->sum('total_price');

        // Payment Method counts
        $cashOrdersCount = UserOrder::where('payment_method', 'Cash')->count();
        $gcashOrdersCount = UserOrder::where('payment_method', 'GCash')->count();
        $mayaOrdersCount = UserOrder::where('payment_method', 'Maya')->count();
        $totalPaymentMethods = $cashOrdersCount + $gcashOrdersCount + $mayaOrdersCount;

        $paymentDistribution = [
            'cash' => [
                'count' => $cashOrdersCount,
                'percentage' => $totalPaymentMethods > 0 ? round(($cashOrdersCount / $totalPaymentMethods) * 100, 1) : 0
            ],
            'gcash' => [
                'count' => $gcashOrdersCount,
                'percentage' => $totalPaymentMethods > 0 ? round(($gcashOrdersCount / $totalPaymentMethods) * 100, 1) : 0
            ],
            'maya' => [
                'count' => $mayaOrdersCount,
                'percentage' => $totalPaymentMethods > 0 ? round(($mayaOrdersCount / $totalPaymentMethods) * 100, 1) : 0
            ]
        ];

        // 2. 7-Day System-Wide Sales Trend (SVG Area Chart data)
        $salesTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dayLabel = now()->subDays($i)->format('D');
            
            $sales = (double)UserOrder::where('status', 'Served')
                ->whereDate('created_at', $date)
                ->sum('total_price');
                
            $salesTrend[] = [
                'label' => $dayLabel,
                'amount' => $sales,
            ];
        }

        // 3. Vendor Performances
        $vendorPerformances = User::where('role', 'vendor')
            ->leftJoin('stores', 'users.id', '=', 'stores.user_id')
            ->select(
                'users.id as vendor_id',
                'users.name as vendor_name',
                DB::raw('COALESCE(stores.store_name, users.store_name) as store_name'),
                DB::raw('COALESCE(stores.stall_number, users.stall_number) as stall_number'),
                DB::raw('COALESCE(stores.rating, users.rating, 0.0) as rating'),
                DB::raw('COALESCE(stores.status, users.status, "Open") as status'),
                DB::raw('COALESCE(stores.profile_image, users.profile_image) as profile_image')
            )
            ->get()
            ->map(function ($vendor) {
                // Get served orders count & revenue for this specific vendor
                $servedStats = DB::table('served_vendor')
                    ->where('vendor_id', $vendor->vendor_id)
                    ->select(
                        DB::raw('COUNT(*) as total_completed'),
                        DB::raw('SUM(total_price) as total_revenue')
                    )
                    ->first();

                $vendor->total_orders = $servedStats->total_completed ?? 0;
                $vendor->revenue = (double)($servedStats->total_revenue ?? 0.0);
                return $vendor;
            });

        // 4. System Activity Logs
        $recentOrders = UserOrder::latest()
            ->join('users as customers', 'order_user.user_id', '=', 'customers.id')
            ->join('users as vendors', 'order_user.vendor_id', '=', 'vendors.id')
            ->leftJoin('stores', 'vendors.id', '=', 'stores.user_id')
            ->select(
                'order_user.id',
                'order_user.order_number',
                'order_user.status',
                'order_user.total_price',
                'order_user.payment_method',
                'order_user.created_at',
                'customers.name as customer_name',
                DB::raw('COALESCE(stores.store_name, vendors.store_name, vendors.name) as store_name')
            )
            ->take(5)
            ->get()
            ->map(function ($ord) {
                return [
                    'id' => $ord->id,
                    'order_number' => $ord->order_number,
                    'status' => $ord->status,
                    'total_price' => (double)$ord->total_price,
                    'payment_method' => $ord->payment_method,
                    'customer_name' => $ord->customer_name,
                    'store_name' => $ord->store_name,
                    'time' => $ord->created_at->diffForHumans()
                ];
            });

        // 5. System wide user ratios
        $adminCount = User::where('role', 'admin')->count();
        $userRatio = [
            'customers' => $totalCustomers,
            'vendors' => $totalVendors,
            'admins' => $adminCount,
        ];

        return Inertia::render('Admin/AdminDashboard', [
            'kpis' => [
                'totalCustomers' => $totalCustomers,
                'totalVendors' => $totalVendors,
                'totalOrders' => $totalOrders,
                'totalSystemRevenue' => $totalSystemRevenue,
                'todayRevenue' => $todayRevenue,
            ],
            'paymentDistribution' => $paymentDistribution,
            'salesTrend' => $salesTrend,
            'vendorPerformances' => $vendorPerformances,
            'recentOrders' => $recentOrders,
            'userRatio' => $userRatio
        ]);
    }
}
