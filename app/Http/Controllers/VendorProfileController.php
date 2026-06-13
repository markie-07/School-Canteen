<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Store;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VendorProfileController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $profile = Store::where('user_id', $user->id)->first();
        $totalOrders = \App\Models\ServedVendor::where('vendor_id', $user->id)->count();

        return Inertia::render('Vendor/VendorProfile', [
            'profile' => $profile,
            'totalOrders' => $totalOrders
        ]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();
        
        $validated = $request->validate([
            'email' => 'nullable|email|max:255|unique:users,email,' . $user->id,
            'store_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'stall_number' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'opening_time' => 'nullable',
            'closing_time' => 'nullable',
            'status' => 'nullable|string',
            'profile_image' => 'nullable',
            'cover_photo' => 'nullable',
        ]);

        // Handle Base64 images
        if (isset($validated['profile_image']) && strpos($validated['profile_image'], 'data:image') === 0) {
            $validated['profile_image'] = $this->uploadBase64($validated['profile_image'], 'profiles');
        }
        
        if (isset($validated['cover_photo']) && strpos($validated['cover_photo'], 'data:image') === 0) {
            $validated['cover_photo'] = $this->uploadBase64($validated['cover_photo'], 'covers');
        }

        // Save store specific attributes to stores table
        $storeData = collect($validated)->except(['email'])->toArray();
        Store::updateOrCreate(
            ['user_id' => $user->id],
            $storeData
        );

        // Update User table details
        $user->update($validated);

        return redirect()->back()->with('success', 'Vendor Profile updated successfully!');
    }

    private function uploadBase64($base64String, $folder)
    {
        $image_service_str = substr($base64String, strpos($base64String, ",") + 1);
        $image = base64_decode($image_service_str);
        $filename = time() . '_' . uniqid() . '.png';
        $path = $folder . '/' . $filename;
        Storage::disk('public')->put($path, $image);
        return Storage::url($path);
    }
}
