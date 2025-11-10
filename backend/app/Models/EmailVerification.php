<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class EmailVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'email',
        'otp_code',
        'expires_at',
        'verified_at',
        'attempts'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    /**
     * Get the user that owns the email verification
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate a new OTP for email verification
     */
    public static function generateOtp($userId, $email, $expiresInMinutes = 10)
    {
        // Generate 6-digit OTP
        $otpCode = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        
        // Delete any existing OTPs for this user/email
        self::where('user_id', $userId)
            ->where('email', $email)
            ->whereNull('verified_at')
            ->delete();
        
        // Create new OTP record
        return self::create([
            'user_id' => $userId,
            'email' => $email,
            'otp_code' => $otpCode,
            'expires_at' => now()->addMinutes($expiresInMinutes),
            'attempts' => 0
        ]);
    }

    /**
     * Verify OTP code
     */
    public static function verifyOtp($userId, $email, $otpCode)
    {
        $verification = self::where('user_id', $userId)
                           ->where('email', $email)
                           ->where('otp_code', $otpCode)
                           ->whereNull('verified_at')
                           ->where('expires_at', '>', now())
                           ->first();

        if (!$verification) {
            return [
                'success' => false,
                'message' => 'Invalid or expired OTP code'
            ];
        }

        // Increment attempts
        $verification->increment('attempts');

        // Check if too many attempts
        if ($verification->attempts > 5) {
            $verification->delete();
            return [
                'success' => false,
                'message' => 'Too many verification attempts. Please request a new OTP.'
            ];
        }

        // Mark as verified
        $verification->update(['verified_at' => now()]);

        return [
            'success' => true,
            'message' => 'Email verified successfully',
            'verification' => $verification
        ];
    }

    /**
     * Check if user has pending verification
     */
    public static function hasPendingVerification($userId, $email)
    {
        return self::where('user_id', $userId)
                  ->where('email', $email)
                  ->whereNull('verified_at')
                  ->where('expires_at', '>', now())
                  ->exists();
    }

    /**
     * Check if email is verified for user
     */
    public static function isEmailVerified($userId, $email)
    {
        return self::where('user_id', $userId)
                  ->where('email', $email)
                  ->whereNotNull('verified_at')
                  ->exists();
    }

    /**
     * Get latest verification for user/email
     */
    public static function getLatestVerification($userId, $email)
    {
        return self::where('user_id', $userId)
                  ->where('email', $email)
                  ->orderBy('created_at', 'desc')
                  ->first();
    }
}