<?php

namespace App\Http\Controllers;

use App\Models\ProcurementVendor;
use App\Models\InventoryVendor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProcurementVendorController extends Controller
{
    public function index()
    {
        return Inertia::render('Vendor/VendorProcurementReport', [
            'procurements' => ProcurementVendor::orderBy('date', 'desc')->get(),
            'inventoryItems' => InventoryVendor::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_name' => 'required|string',
            'category' => 'required|string',
            'quantity' => 'required|numeric',
            'unit' => 'required|string',
            'supplier' => 'required|string',
            'total_cost' => 'required|numeric',
            'date' => 'required|date',
            'status' => 'required|string',
        ]);

        $procurement = ProcurementVendor::create($validated);

        if ($procurement->status === 'Delivered') {
            $this->updateInventory($procurement);
        }

        return redirect()->back();
    }

    public function update(Request $request, ProcurementVendor $procurementVendor)
    {
        $oldStatus = $procurementVendor->status;
        
        $validated = $request->validate([
            'item_name' => 'required|string',
            'category' => 'required|string',
            'quantity' => 'required|numeric',
            'unit' => 'required|string',
            'supplier' => 'required|string',
            'total_cost' => 'required|numeric',
            'date' => 'required|date',
            'status' => 'required|string',
        ]);

        $procurementVendor->update($validated);
        
        if ($oldStatus !== 'Delivered' && $procurementVendor->status === 'Delivered') {
            $this->updateInventory($procurementVendor);
        }

        return redirect()->back();
    }

    public function destroy(ProcurementVendor $procurementVendor)
    {
        $procurementVendor->delete();
        return redirect()->back();
    }

    private function updateInventory($procurement)
    {
        $inventory = InventoryVendor::where('item_name', $procurement->item_name)->first();

        if ($inventory) {
            $inventory->increment('quantity', $procurement->quantity);
            $inventory->update([
                'category' => $procurement->category,
                'unit' => $procurement->unit
            ]);
        } else {
            InventoryVendor::create([
                'item_name' => $procurement->item_name,
                'category' => $procurement->category,
                'quantity' => $procurement->quantity,
                'unit' => $procurement->unit,
            ]);
        }
    }
}
