<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function index(): Response
    {
        // Double check admin status for safety (middleware also handles this)
        if (!auth()->user()->is_admin) {
            abort(403);
        }

        $users = User::withCount('notes')->latest()->get();

        return Inertia::render('Admin/Dashboard', [
            'users' => $users
        ]);
    }
}
