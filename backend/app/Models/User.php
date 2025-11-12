<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\EmailVerificationMail;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'full_name',
        'phone',
        'email',
        'password_hash',
        'role',
        'house_id',
        'house_type',
        'status_active',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'status_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'email_verified_at' => 'datetime',
    ];

    /**
     * Get the password for authentication.
     */
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    /**
     * User roles
     */
    const ROLE_SUPER = 'super';
    const ROLE_LANDLORD = 'landlord';
    const ROLE_RESIDENT = 'resident';
    const ROLE_SECURITY = 'security';

    /**
     * Get the house that the user belongs to (for residents).
     */
    public function house()
    {
        return $this->belongsTo(House::class);
    }

    /**
     * Get the houses owned by this user (for landlords).
     */
    public function ownedHouses()
    {
        return $this->hasMany(House::class, 'landlord_id');
    }

    /**
     * Get the payments made by this user.
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the visitor tokens issued by this resident.
     */
    public function visitorTokens()
    {
        return $this->hasMany(VisitorToken::class, 'resident_id');
    }

    /**
     * Get the registration codes issued by this user.
     */
    public function issuedRegistrationCodes()
    {
        return $this->hasMany(RegistrationCode::class, 'issued_by');
    }

    /**
     * Get the registration codes used by this user.
     */
    public function usedRegistrationCodes()
    {
        return $this->hasMany(RegistrationCode::class, 'used_by_user_id');
    }

    /**
     * Get the visitor entries recorded by this guard.
     */
    public function guardedEntries()
    {
        return $this->hasMany(VisitorEntry::class, 'guard_id');
    }

    /**
     * Get the logs where this user was the actor.
     */
    public function actorLogs()
    {
        return $this->hasMany(Log::class, 'actor_id');
    }

    /**
     * Check if user is active
     */
    public function isActive()
    {
        return $this->status_active;
    }

    /**
     * Check if user has specific role
     */
    public function hasRole($role)
    {
        return $this->role === $role;
    }

    /**
     * Check if user is resident
     */
    public function isResident()
    {
        return $this->role === self::ROLE_RESIDENT;
    }

    /**
     * Check if user is landlord
     */
    public function isLandlord()
    {
        return $this->role === self::ROLE_LANDLORD;
    }

    /**
     * Check if user is security
     */
    public function isSecurity()
    {
        return $this->role === self::ROLE_SECURITY;
    }

    /**
     * Check if user is super admin
     */
    public function isSuper()
    {
        return $this->role === self::ROLE_SUPER;
    }

    /**
     * Get the email verifications for this user
     */
    public function emailVerifications()
    {
        return $this->hasMany(EmailVerification::class);
    }

    /**
     * Check if user's email is verified
     */
    public function hasVerifiedEmail()
    {
        return $this->email_verified_at !== null;
    }

    /**
     * Mark the user's email as verified
     */
    public function markEmailAsVerified()
    {
        return $this->forceFill([
            'email_verified_at' => $this->freshTimestamp(),
        ])->save();
    }

    /**
     * Send email verification OTP
     */
    public function sendEmailVerificationOtp()
    {
        $verification = EmailVerification::generateOtp($this->id, $this->email);
        
        // Send email with OTP
        try {
            Mail::to($this->email)->send(new EmailVerificationMail(
                $verification->otp_code,
                $this->full_name,
                $verification->expires_at
            ));
            return [
                'success' => true,
                'message' => 'Verification OTP sent to your email',
                'otp_code' => $verification->otp_code // Remove this in production
            ];
        } catch (\Exception $e) {
            Log::error('Failed to send verification email: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to send verification email'
            ];
        }
    }
}
