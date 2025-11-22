<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use App\Models\User;

class NotificationController extends Controller
{
    /**
     * Save FCM token for authenticated user
     */
    public function saveFcmToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fcm_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = Auth::user();
            
            $user->update([
                'fcm_token' => $request->fcm_token,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'FCM token saved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save FCM token',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send notification to specific user
     */
    public function sendNotification(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'data' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = User::find($request->user_id);

            if (!$user->fcm_token) {
                return response()->json([
                    'success' => false,
                    'message' => 'User does not have an FCM token',
                ], 404);
            }

            $this->sendPushNotification(
                $user->fcm_token,
                $request->title,
                $request->body,
                $request->data ?? []
            );

            return response()->json([
                'success' => true,
                'message' => 'Notification sent successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send notification',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send notification to all users
     */
    public function sendBulkNotification(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'role' => 'nullable|in:super,landlord,resident,security',
            'data' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $query = User::whereNotNull('fcm_token');

            // Filter by role if specified
            if ($request->has('role')) {
                $query->where('role', $request->role);
            }

            $users = $query->get();

            if ($users->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No users found with FCM tokens',
                ], 404);
            }

            $successCount = 0;
            $failedCount = 0;

            foreach ($users as $user) {
                try {
                    $this->sendPushNotification(
                        $user->fcm_token,
                        $request->title,
                        $request->body,
                        $request->data ?? []
                    );
                    $successCount++;
                } catch (\Exception $e) {
                    $failedCount++;
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Bulk notifications sent',
                'sent' => $successCount,
                'failed' => $failedCount,
                'total' => $users->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send bulk notifications',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Public method to send push notification via Firebase
     */
    public function sendPushNotification(string $fcmToken, string $title, string $body, array $data = [])
    {
        try {
            // Path to your Firebase service account JSON file
            $serviceAccountPath = storage_path('app/firebase/serviceAccountKey.json');

            if (!file_exists($serviceAccountPath)) {
                throw new \Exception('Firebase service account file not found');
            }

            $factory = (new Factory)->withServiceAccount($serviceAccountPath);
            $messaging = $factory->createMessaging();

            $notification = Notification::create($title, $body);

            $message = CloudMessage::withTarget('token', $fcmToken)
                ->withNotification($notification)
                ->withData($data);

            $messaging->send($message);

            \Log::info('Push notification sent', [
                'token' => substr($fcmToken, 0, 20) . '...',
                'title' => $title,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send push notification', [
                'error' => $e->getMessage(),
                'token' => substr($fcmToken, 0, 20) . '...',
            ]);
            throw $e;
        }
    }

    /**
     * Test notification endpoint (for development)
     */
    public function testNotification(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user->fcm_token) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have an FCM token. Please enable notifications in the app.',
                ], 404);
            }

            $this->sendPushNotification(
                $user->fcm_token,
                'Test Notification',
                'This is a test notification from SpringField Estate!',
                ['test' => true, 'timestamp' => now()->toIso8601String()]
            );

            return response()->json([
                'success' => true,
                'message' => 'Test notification sent successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send test notification',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
