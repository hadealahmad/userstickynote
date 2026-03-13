<?php

namespace App\Http\Controllers;

use App\Models\ApiToken;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $noteCount = $user->notes()->count();

        return Inertia::render('Dashboard', [
            'notes' => $user->notes()->latest()->get(),
            'noteCount' => $noteCount,
        ]);
    }

    public function createToken(Request $request): RedirectResponse
    {
        $request->validate(['name' => 'required|string|max:60']);

        $plainToken = Str::random(40);

        $user = auth()->user();
        $token = $user->apiTokens()->create([
            'name' => $request->name,
            'token' => hash('sha256', $plainToken),
        ]);

        return redirect()->route('dashboard')->with('newToken', [
            'id' => $token->id,
            'name' => $token->name,
            'plain' => $plainToken,
        ]);
    }

    public function deleteToken(int $id): RedirectResponse
    {
        auth()->user()->apiTokens()->findOrFail($id)->delete();
        return redirect()->route('dashboard');
    }

    public function deleteAccount(): RedirectResponse
    {
        $user = auth()->user();

        // Purge user data
        $user->notes()->delete();
        $user->apiTokens()->delete();
        
        // Final delete
        $user->delete();

        auth()->logout();

        return redirect()->route('home')->with('message', 'Account deleted successfully. No refunds were issued as per policy.');
    }

    public function connect(): \Illuminate\Http\JsonResponse
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $plainToken = Str::random(40);
        $user->apiTokens()->updateOrCreate(
            ['name' => 'Browser Extension'],
            ['token' => hash('sha256', $plainToken)]
        );

        return response()->json([
            'token' => $plainToken,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'is_subscribed' => (bool)$user->is_subscribed,
                'is_admin' => (bool)$user->is_admin,
            ]
        ]);
    }
}
