<?php

use Illuminate\Support\Facades\Route;

Route::post('/debug-notification', function (Illuminate\Http\Request $request) {
    try {
        // Test basic auth
        $user = auth('sanctum')->user();
        
        if (!$user) {
            return response()->json([
                'error' => 'No authenticated user found',
                'headers' => $request->headers->all(),
                'auth_header' => $request->header('Authorization'),
                'bearer_token' => $request->bearerToken(),
            ], 401);
        }

        return response()->json([
            'success' => true,
            'user_id' => $user->id,
            'user_email' => $user->email,
            'fcm_token' => $user->fcm_token ?? 'No FCM token',
            'headers' => $request->headers->all(),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Exception occurred',
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ], 500);
    }
});