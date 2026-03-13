<?php

namespace App\Http\Middleware;

use App\Models\ApiToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiTokenAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $bearerToken = $request->bearerToken();
        $xToken = $request->header('X-Api-Token');
        
        \Illuminate\Support\Facades\Log::info("Auth Attempt - Bearer: " . ($bearerToken ? 'Yes' : 'No') . " | X-Token: " . ($xToken ? 'Yes' : 'No'));

        $token = $bearerToken ?: $xToken;
 
        if (!$token) {
            \Illuminate\Support\Facades\Log::warning("No token found in request headers");
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
 
        $hashedToken = hash('sha256', $token);
        $tokenRecord = ApiToken::where('token', $hashedToken)->first();
 
        if (!$tokenRecord) {
            \Illuminate\Support\Facades\Log::warning("Invalid token hash: {$hashedToken}");
            return response()->json(['error' => 'Invalid token'], 401);
        }

        $tokenRecord->update(['last_used_at' => now()]);
        $request->setUserResolver(fn() => $tokenRecord->user);

        return $next($request);
    }
}
