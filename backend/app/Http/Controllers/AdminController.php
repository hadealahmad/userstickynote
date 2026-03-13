<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function index(): Response
    {
        if (!auth()->user()->is_admin) {
            abort(403);
        }

        $users = User::withCount('notes')->latest()->get();

        return Inertia::render('Admin/Dashboard', [
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->is_admin) abort(403);
        
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'is_admin' => 'boolean',
            'is_subscribed' => 'boolean',
        ]);

        User::create($data);

        return redirect()->back()->with('message', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        if (!auth()->user()->is_admin) abort(403);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'is_admin' => 'boolean',
            'is_subscribed' => 'boolean',
        ]);

        $user->update($data);

        return redirect()->back()->with('message', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if (!auth()->user()->is_admin) abort(403);
        if ($user->id === auth()->id()) abort(403, 'You cannot delete yourself.');

        $user->notes()->delete();
        $user->apiTokens()->delete();
        $user->delete();

        return redirect()->back()->with('message', 'User deleted successfully.');
    }

    public function impersonate(User $user)
    {
        if (!auth()->user()->is_admin) abort(403);
        
        session(['impersonator_id' => auth()->id()]);
        auth()->login($user);

        return redirect()->route('dashboard');
    }

    public function stopImpersonating()
    {
        if (!session()->has('impersonator_id')) return redirect()->back();
        
        $admin = User::findOrFail(session()->pull('impersonator_id'));
        auth()->login($admin);

        return redirect()->route('admin.dashboard');
    }
}
