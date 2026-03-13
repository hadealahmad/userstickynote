<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse
    {
        $googleUser = Socialite::driver('google')->user();

        $user = User::updateOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'google_id' => $googleUser->getId(),
                'name' => $googleUser->getName() ?? $googleUser->getNickname(),
                'google_avatar' => $googleUser->getAvatar(),
            ]
        );

        // Auto Admin Logic
        if (env('ADMIN_EMAIL') && $user->email === env('ADMIN_EMAIL')) {
            $user->update([
                'is_admin' => true,
                'is_subscribed' => true,
                'subscription_ends_at' => now()->addYears(100),
            ]);
        }

        auth()->login($user, true);

        return redirect()->route('dashboard');
    }

    public function logout(): RedirectResponse
    {
        auth()->logout();
        return redirect()->route('home');
    }
}
