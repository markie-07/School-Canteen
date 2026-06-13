<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request)
    {
        if ($request->user()->role === 'user') {
            return redirect()->route('user.profile');
        }

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    /**
     * Display the student/user profile page.
     */
    public function userProfile(Request $request): Response
    {
        return Inertia::render('User/UserProfile', [
            'status' => session('status'),
        ]);
    }

    /**
     * Update the student/user profile details.
     */
    public function userProfileUpdate(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'profile_image' => 'nullable|string',
        ]);

        if (isset($validated['profile_image']) && strpos($validated['profile_image'], 'data:image') === 0) {
            $image_service_str = substr($validated['profile_image'], strpos($validated['profile_image'], ",") + 1);
            $image = base64_decode($image_service_str);
            $filename = time() . '_' . uniqid() . '.png';
            $path = 'profiles/' . $filename;
            
            // Delete old profile image if it exists and is stored locally
            if ($user->profile_image) {
                $oldPath = str_replace('/storage/', '', $user->profile_image);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            Storage::disk('public')->put($path, $image);
            $user->profile_image = Storage::url($path);
        }

        $user->save();

        return Redirect::route('user.profile')->with('success', 'Profile image updated successfully!');
    }
}
