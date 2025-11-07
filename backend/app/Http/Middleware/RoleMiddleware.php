<?php

namespace App\Http\Middleware;

use App\Models\Log;
use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @param  string  ...$roles
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        // Check if user is authenticated
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required'
            ], 401);
        }

        // Check if user is active
        if (!$user->status_active) {
            // Log inactive user access attempt
            Log::logAccess('ACCESS_DENIED_INACTIVE_USER', $user->id, [
                'route' => $request->route()->getName(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'ip_address' => $request->ip()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact administrator.'
            ], 403);
        }

        // Check if user has required role (if roles are specified)
        if (!empty($roles) && !in_array($user->role, $roles)) {
            // Log unauthorized access attempt
            Log::logAccess('ACCESS_DENIED_INSUFFICIENT_ROLE', $user->id, [
                'user_role' => $user->role,
                'required_roles' => $roles,
                'route' => $request->route() ? $request->route()->getName() : 'unknown',
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'ip_address' => $request->ip()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to access this resource',
                'error_code' => 'INSUFFICIENT_ROLE',
                'required_roles' => $roles,
                'user_role' => $user->role
            ], 403);
        }

        return $next($request);
    }
}
