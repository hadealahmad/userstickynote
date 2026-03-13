<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\WebNoteController;
use App\Http\Controllers\StripeController;
use App\Http\Controllers\AdminController;
use App\Http\Middleware\ApiTokenAuth;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

// Landing page
Route::get('/', function () {
    return Inertia::render('Landing');
})->name('home');

// Google OAuth
Route::get('/auth/google', [AuthController::class, 'redirect'])->name('auth.google');
Route::get('/auth/google/callback', [AuthController::class, 'callback'])->name('auth.google.callback');
Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout');

// Web Dashboard (auth required)
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/api/connect', [DashboardController::class, 'connect'])->name('api.connect');
    Route::post('/tokens', [DashboardController::class, 'createToken'])->name('tokens.create');
    Route::delete('/tokens/{id}', [DashboardController::class, 'deleteToken'])->name('tokens.delete');
    Route::delete('/account', [DashboardController::class, 'deleteAccount'])->name('account.delete');

    // Payments
    Route::get('/billing/checkout', [StripeController::class, 'checkout'])->name('billing.checkout');

    // Web Note CRUD (Subscribers only could be handled here or in controller)
    Route::post('/notes', [WebNoteController::class, 'store'])->name('notes.store');
    Route::put('/notes/{note}', [WebNoteController::class, 'update'])->name('notes.update');
    Route::delete('/notes/{note}', [WebNoteController::class, 'destroy'])->name('notes.destroy');
});

// Admin Dashboard
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'index'])->name('dashboard');
    Route::post('/users', [AdminController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [AdminController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [AdminController::class, 'destroy'])->name('users.destroy');
    Route::post('/users/{user}/impersonate', [AdminController::class, 'impersonate'])->name('users.impersonate');
});

Route::get('/admin/stop-impersonating', [AdminController::class, 'stopImpersonating'])
    ->middleware('auth')
    ->name('admin.stop-impersonating');

Route::prefix('api')->middleware(ApiTokenAuth::class)->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/notes', [NoteController::class, 'index']);
    Route::post('/notes', [NoteController::class, 'store']);
    Route::delete('/notes/{id}', [NoteController::class, 'destroy']);
    Route::get('/debug-headers', function (Request $request) {
        return response()->json([
            'headers' => $request->headers->all(),
            'token' => $request->bearerToken()
        ]);
    });
    Route::post('/sync', [NoteController::class, 'sync']);
});

// Public Stripe Webhook (No CSRF)
Route::post('/webhooks/stripe', [StripeController::class, 'webhook']);
