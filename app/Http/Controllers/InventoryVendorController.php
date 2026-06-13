<?php

namespace App\Http\Controllers;

use App\Models\InventoryVendor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryVendorController extends Controller
{
    public function index()
    {
        return Inertia::render('Vendor/VendorInventory', [
            'inventory' => InventoryVendor::orderBy('item_name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_name' => 'required|string|unique:inventory_vendors,item_name',
            'category' => 'required|string',
            'quantity' => 'required|numeric',
            'unit' => 'required|string',
        ]);

        InventoryVendor::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, InventoryVendor $inventoryVendor)
    {
        $validated = $request->validate([
            'item_name' => 'required|string|unique:inventory_vendors,item_name,' . $inventoryVendor->id,
            'category' => 'required|string',
            'quantity' => 'required|numeric',
            'unit' => 'required|string',
        ]);

        $inventoryVendor->update($validated);

        return redirect()->back();
    }

    public function destroy(InventoryVendor $inventoryVendor)
    {
        $inventoryVendor->delete();
        return redirect()->back();
    }
}
