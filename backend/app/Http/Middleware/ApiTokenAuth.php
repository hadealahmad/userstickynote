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

        if (!$bearerToken) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $tokenRecord = ApiToken::where('token', hash('sha256', $bearerToken))->first();

        if (!$tokenRecord) {
            return response()->json(['error' => 'Invalid token'], 401);
        }

        $tokenRecord->update(['last_used_at' => now()]);
        $request->setUserResolver(fn() => $tokenRecord->user);

        return $next($request);
    }
}
