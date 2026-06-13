<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Store;
use App\Models\OrdersVendor;
use App\Models\PreparingVendor;
use App\Models\ServingVendor;
use App\Models\ServedVendor;
use App\Models\InventoryVendor;
use Inertia\Inertia;

class VendorDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $store = Store::where('user_id', $user->id)->first();

        // 1. KPI Metrics
        $todayRevenue = (double)ServedVendor::where('vendor_id', $user->id)
            ->whereDate('created_at', today())
            ->sum('total_price');

        $pendingCount = OrdersVendor::where('vendor_id', $user->id)->count();

        $itemsServedCount = ServedVendor::where('vendor_id', $user->id)->count();

        $lowStockCount = InventoryVendor::where('quantity', '<', 10)->count();

        // Calculate Average Order Value (AOV)
        $totalServedSales = (double)ServedVendor::where('vendor_id', $user->id)->sum('total_price');
        $averageOrderValue = $itemsServedCount > 0 ? round($totalServedSales / $itemsServedCount, 2) : 0.0;

        // Calculate Order Completion Rate (percentage of served vs total non-cancelled orders)
        $cancelledCount = \App\Models\UserOrder::where('vendor_id', $user->id)->where('status', 'Cancelled')->count();
        $totalOrdersCount = $itemsServedCount + $pendingCount + $cancelledCount + 
            PreparingVendor::where('vendor_id', $user->id)->count() + 
            ServingVendor::where('vendor_id', $user->id)->count();
        $completionRate = $totalOrdersCount > 0 ? round(($itemsServedCount / $totalOrdersCount) * 100, 1) : 100.0;

        // 2. 7-Day Sales Trend (SVG Area Chart data)
        $salesTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $dayLabel = now()->subDays($i)->format('D');
            
            $sales = (double)ServedVendor::where('vendor_id', $user->id)
                ->whereDate('created_at', $date)
                ->sum('total_price');
                
            $salesTrend[] = [
                'label' => $dayLabel,
                'amount' => $sales,
            ];
        }

        // 3. Hourly Peak Dining Hours
        $peakHours = [
            ['label' => 'Breakfast (6-9am)', 'count' => 0, 'val' => 0],
            ['label' => 'Break (9-11am)', 'count' => 0, 'val' => 0],
            ['label' => 'Lunch (11am-1pm)', 'count' => 0, 'val' => 0],
            ['label' => 'Afternoon (1-5pm)', 'count' => 0, 'val' => 0],
        ];
        
        $servedOrders = ServedVendor::where('vendor_id', $user->id)->get();
        foreach ($servedOrders as $ord) {
            $hour = $ord->created_at->hour;
            if ($hour >= 6 && $hour < 9) {
                $peakHours[0]['count']++;
            } elseif ($hour >= 9 && $hour < 11) {
                $peakHours[1]['count']++;
            } elseif ($hour >= 11 && $hour < 13) {
                $peakHours[2]['count']++;
            } elseif ($hour >= 13 && $hour < 17) {
                $peakHours[3]['count']++;
            }
        }
        
        $maxPeakCount = max(array_column($peakHours, 'count'));
        foreach ($peakHours as &$peak) {
            $peak['val'] = $maxPeakCount > 0 ? round(($peak['count'] / $maxPeakCount) * 100) : 0;
        }

        // 4. Order Distribution (Donut Chart percentages)
        $prepCount = PreparingVendor::where('vendor_id', $user->id)->count();
        $servCount = ServingVendor::where('vendor_id', $user->id)->count();
        
        $totalActive = $pendingCount + $prepCount + $servCount + $itemsServedCount;
        $orderDistribution = [
            'pending' => $totalActive > 0 ? round(($pendingCount / $totalActive) * 100, 1) : 0,
            'preparing' => $totalActive > 0 ? round(($prepCount / $totalActive) * 100, 1) : 0,
            'serving' => $totalActive > 0 ? round(($servCount / $totalActive) * 100, 1) : 0,
            'served' => $totalActive > 0 ? round(($itemsServedCount / $totalActive) * 100, 1) : 0,
            'counts' => [
                'pending' => $pendingCount,
                'preparing' => $prepCount,
                'serving' => $servCount,
                'served' => $itemsServedCount,
            ]
        ];

        // 5. Top Selling Menu Items
        $itemCounts = [];
        foreach ($servedOrders as $order) {
            $items = preg_split('/,\s*(?![^(]*\))/', $order->items);
            foreach ($items as $item) {
                $item = trim($item);
                if (preg_match('/^(\d+)x\s+(.+)$/', $item, $matches)) {
                    $qty = (int)$matches[1];
                    $name = trim($matches[2]);
                    $itemCounts[$name] = ($itemCounts[$name] ?? 0) + $qty;
                }
            }
        }
        arsort($itemCounts);
        $topItems = [];
        $rank = 1;
        foreach (array_slice($itemCounts, 0, 4, true) as $name => $count) {
            $topItems[] = [
                'rank' => $rank++,
                'name' => $name,
                'sold' => $count,
                'revenue' => '₱' . number_format($count * 75) // assuming average price ₱75
            ];
        }
        
        if (empty($topItems)) {
            $topItems = [
                ['rank' => 1, 'name' => 'Cheeseburger', 'sold' => 0, 'revenue' => '₱0'],
                ['rank' => 2, 'name' => 'Iced Coffee', 'sold' => 0, 'revenue' => '₱0'],
                ['rank' => 3, 'name' => 'Coke', 'sold' => 0, 'revenue' => '₱0'],
            ];
        }

        // 6. Next to Prepare queue
        $nextOrders = OrdersVendor::where('vendor_id', $user->id)
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->take(3)
            ->get();

        // 7. Recent Activity Timeline
        $recentActivity = [];
        
        $recentServed = ServedVendor::where('vendor_id', $user->id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->take(2)
            ->get();
        foreach ($recentServed as $ord) {
            $recentActivity[] = [
                'id' => 'served_' . $ord->id,
                'type' => 'serve',
                'title' => 'Order Served',
                'desc' => "Order #{$ord->order_number} served to " . ($ord->user->name ?? $ord->customer_name),
                'time' => $ord->created_at->diffForHumans(),
                'icon' => '✅',
                'timestamp' => $ord->created_at->timestamp,
            ];
        }

        $recentPrep = PreparingVendor::where('vendor_id', $user->id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->take(2)
            ->get();
        foreach ($recentPrep as $ord) {
            $recentActivity[] = [
                'id' => 'prep_' . $ord->id,
                'type' => 'prepare',
                'title' => 'Order Preparing',
                'desc' => "Order #{$ord->order_number} is in prep for " . ($ord->user->name ?? $ord->customer_name),
                'time' => $ord->created_at->diffForHumans(),
                'icon' => '🍳',
                'timestamp' => $ord->created_at->timestamp,
            ];
        }

        $recentNew = OrdersVendor::where('vendor_id', $user->id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->take(2)
            ->get();
        foreach ($recentNew as $ord) {
            $recentActivity[] = [
                'id' => 'new_' . $ord->id,
                'type' => 'order',
                'title' => 'New Order Received',
                'desc' => "Order #{$ord->order_number} from " . ($ord->user->name ?? $ord->customer_name),
                'time' => $ord->created_at->diffForHumans(),
                'icon' => '📥',
                'timestamp' => $ord->created_at->timestamp,
            ];
        }

        usort($recentActivity, function($a, $b) {
            return $b['timestamp'] <=> $a['timestamp'];
        });
        $recentActivity = array_slice($recentActivity, 0, 4);

        return Inertia::render('Vendor/VendorDashboard', [
            'metrics' => [
                'todayRevenue' => $todayRevenue,
                'pendingCount' => $pendingCount,
                'itemsServedCount' => $itemsServedCount,
                'lowStockCount' => $lowStockCount,
                'averageOrderValue' => $averageOrderValue,
                'completionRate' => $completionRate,
            ],
            'salesTrend' => $salesTrend,
            'peakHours' => $peakHours,
            'orderDistribution' => $orderDistribution,
            'topItems' => $topItems,
            'nextOrders' => $nextOrders,
            'recentActivity' => $recentActivity,
        ]);
    }
}
