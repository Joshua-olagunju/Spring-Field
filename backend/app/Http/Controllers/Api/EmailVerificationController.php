<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailVerification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EmailVerificationController extends Controller
{
    /**
     * Send email verification OTP
     */
    public function sendVerificationOtp(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'email' => 'required|email'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::find($request->user_id);
            
            // Verify the email belongs to this user
            if ($user->email !== $request->email) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email does not match user account'
                ], 400);
            }

            // Check if user is already verified
            if ($user->hasVerifiedEmail()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email is already verified'
                ], 400);
            }

            // Check if there's already a pending verification (rate limiting)
            if (EmailVerification::hasPendingVerification($user->id, $user->email)) {
                $latestVerification = EmailVerification::getLatestVerification($user->id, $user->email);
                $timeRemaining = $latestVerification->expires_at->diffInMinutes(now());
                
                return response()->json([
                    'success' => false,
                    'message' => "Please wait {$timeRemaining} minutes before requesting a new OTP",
                    'time_remaining_minutes' => $timeRemaining
                ], 429);
            }

            // Send verification OTP
            $result = $user->sendEmailVerificationOtp();

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => $result['message'],
                    'otp_code' => $result['otp_code'] ?? null // Remove in production
                ], 200);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => $result['message']
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification OTP',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify email with OTP
     */
    public function verifyEmail(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'email' => 'required|email',
                'otp_code' => 'required|string|size:6'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::find($request->user_id);
            
            // Verify the email belongs to this user
            if ($user->email !== $request->email) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email does not match user account'
                ], 400);
            }

            // Check if user is already verified
            if ($user->hasVerifiedEmail()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email is already verified'
                ], 400);
            }

            // Verify the OTP
            $result = EmailVerification::verifyOtp($user->id, $user->email, $request->otp_code);

            if ($result['success']) {
                // Mark user email as verified
                $user->markEmailAsVerified();
                
                // Activate status for landlords when they verify email
                if ($user->role === User::ROLE_LANDLORD && !$user->status_active) {
                    $user->update(['status_active' => true]);
                }
                
                // Generate authentication token for the user
                $token = $user->createToken('auth_token')->plainTextToken;

                return response()->json([
                    'success' => true,
                    'message' => $result['message'],
                    'token' => $token,
                    'user' => [
                        'id' => $user->id,
                        'full_name' => $user->full_name,
                        'email' => $user->email,
                        'email_verified_at' => $user->email_verified_at,
                        'role' => $user->role,
                        'status_active' => $user->status_active
                    ]
                ], 200);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => $result['message']
                ], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to verify email',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resend verification OTP
     */
    public function resendVerificationOtp(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'email' => 'required|email'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::find($request->user_id);
            
            // Verify the email belongs to this user
            if ($user->email !== $request->email) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email does not match user account'
                ], 400);
            }

            // Check if user is already verified
            if ($user->hasVerifiedEmail()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email is already verified'
                ], 400);
            }

            // Delete existing pending verifications and send new one
            EmailVerification::where('user_id', $user->id)
                            ->where('email', $user->email)
                            ->whereNull('verified_at')
                            ->delete();

            // Send new verification OTP
            $result = $user->sendEmailVerificationOtp();

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => 'New verification OTP sent to your email',
                    'otp_code' => $result['otp_code'] ?? null // Remove in production
                ], 200);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => $result['message']
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to resend verification OTP',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check email verification status
     */
    public function checkVerificationStatus(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::find($request->user_id);
            
            $isVerified = $user->hasVerifiedEmail();
            $hasPending = EmailVerification::hasPendingVerification($user->id, $user->email);

            return response()->json([
                'success' => true,
                'data' => [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'is_verified' => $isVerified,
                    'has_pending_otp' => $hasPending,
                    'verified_at' => $user->email_verified_at
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check verification status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}