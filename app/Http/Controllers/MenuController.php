<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class MenuController extends Controller
{
    public function index()
    {
        return Inertia::render('Vendor/VendorMenu', [
            'menuItems' => Menu::where('vendor_id', auth()->id())
                ->orderBy('created_at', 'desc')
                ->get()
        ]);
    }

    public function store(Request $request)
    {
        \Illuminate\Support\Facades\Log::info('Storing Menu Item:', $request->all());
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string',
            'price' => 'required|numeric|min:0|max:999999999999.99',
            'status' => 'nullable|string',
            'stock' => 'nullable|integer',
            'description' => 'nullable|string',
            'cooking_time' => 'nullable|string|max:255',
            'images' => 'nullable|array',
            'ingredients' => 'nullable|array'
        ]);

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('menu_items', 'public');
                $imagePaths[] = Storage::url($path);
            }
        }

        $validated['images'] = $imagePaths;
        $validated['vendor_id'] = auth()->id();
        Menu::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Menu $menu)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string',
            'price' => 'required|numeric|min:0|max:999999999999.99',
            'status' => 'nullable|string',
            'stock' => 'nullable|integer',
            'description' => 'nullable|string',
            'cooking_time' => 'nullable|string|max:255',
            'images' => 'nullable|array',
            'ingredients' => 'nullable|array'
        ]);

        $finalImages = [];
        
        // 1. Keep existing string paths that were not removed
        if ($request->has('images')) {
            foreach ($request->images as $img) {
                if (is_string($img)) {
                    $finalImages[] = $img;
                }
            }
        }

        // 2. Upload and add new files
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('menu_items', 'public');
                $finalImages[] = Storage::url($path);
            }
        }

        $validated['images'] = $finalImages;
        $menu->update($validated);

        return redirect()->back();
    }

    public function destroy(Menu $menu)
    {
        // Optional: delete images from storage
        if ($menu->images) {
            foreach ($menu->images as $imageUrl) {
                $path = str_replace('/storage/', '', $imageUrl);
                Storage::disk('public')->delete($path);
            }
        }
        
        $menu->delete();
        return redirect()->back();
    }

    public function toggleStatus(Menu $menu)
    {
        $menu->status = $menu->status === 'Available' ? 'Out of Stock' : 'Available';
        $menu->save();
        return redirect()->back();
    }
}
