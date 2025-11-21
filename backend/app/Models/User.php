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
        'first_name',
        'last_name',
        'full_name',
        'phone',
        'email',
        'password_hash',
        'role',
        'house_id',
        'house_type',
        'status_active',
        'email_verified_at',
        'landlord_id',
        'theme_preference',
        'address',
        'last_login_at',
        'payment_count',
        'is_payment_up_to_date',
        'last_payment_check',
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
        'last_login_at' => 'datetime',
        'payment_count' => 'integer',
        'is_payment_up_to_date' => 'boolean',
        'last_payment_check' => 'datetime',
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
     * Get the residents under this landlord.
     */
    public function residents()
    {
        return $this->hasMany(User::class, 'landlord_id');
    }

    /**
     * Get the landlord of this user (for residents).
     */
    public function landlord()
    {
        return $this->belongsTo(User::class, 'landlord_id');
    }

    /**
     * Get the payments made by this user.
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the subscriptions for this user.
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
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
     * Get status attribute (for frontend consistency)
     */
    public function getStatusAttribute()
    {
        return $this->status_active ? 'active' : 'inactive';
    }

    /**
     * Set status attribute (for frontend consistency)
     */
    public function setStatusAttribute($value)
    {
        $this->status_active = $value === 'active' || $value === true;
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
     * Get house number from related house
     */
    public function getHouseNumberAttribute()
    {
        return $this->house ? $this->house->house_number : null;
    }

    /**
     * Get address from related house
     */
    public function getAddressAttribute()
    {
        return $this->house ? $this->house->address : null;
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

    /**
     * Payment tracking methods
     */
    
    /**
     * Calculate how many months have passed since registration
     * Month counter starts at 1 immediately upon registration
     */
    public function getMonthsSinceRegistration(): int
    {
        // Add 1 because the first month starts immediately upon registration
        return $this->created_at->diffInMonths(now()) + 1;
    }

    /**
     * Calculate required payments based on registration date
     */
    public function getRequiredPayments(): int
    {
        return $this->getMonthsSinceRegistration();
    }

    /**
     * Check if user is up to date with payments
     * User must have paid for ALL months since registration (starting from month 1)
     */
    public function isPaymentUpToDate(): bool
    {
        $requiredPayments = $this->getRequiredPayments();
        
        // User must have paid for at least the required months
        // No exceptions - even new users owe 1 month immediately
        return $this->payment_count >= $requiredPayments;
    }

    /**
     * Get how many months the user is behind
     */
    public function getMonthsBehind(): int
    {
        $required = $this->getRequiredPayments();
        $paid = $this->payment_count;
        return max(0, $required - $paid);
    }

    /**
     * Get how many months the user is ahead
     */
    public function getMonthsAhead(): int
    {
        $required = $this->getRequiredPayments();
        $paid = $this->payment_count;
        return max(0, $paid - $required);
    }

    /**
     * Increment payment count when user makes payment
     */
    public function addPaymentMonths(int $months): void
    {
        $this->increment('payment_count', $months);
        $this->updatePaymentStatus();
    }

    /**
     * Update the payment up to date status
     */
    public function updatePaymentStatus(): void
    {
        $this->update([
            'is_payment_up_to_date' => $this->isPaymentUpToDate(),
            'last_payment_check' => now()
        ]);
    }

    /**
     * Check if user can access paid features
     */
    public function canAccessPaidFeatures(): bool
    {
        return $this->isPaymentUpToDate();
    }

    /**
     * Get detailed payment status information
     */
    public function getPaymentStatus(): array
    {
        $monthsSince = $this->getMonthsSinceRegistration();
        $required = $this->getRequiredPayments();
        $paid = $this->payment_count;
        $isUpToDate = $this->isPaymentUpToDate();

        return [
            'payment_ratio' => "{$paid}/{$required}", // Format like "2/3" or "6/4"
            'months_since_registration' => $monthsSince,
            'required_payments' => $required,
            'payment_count' => $paid,
            'is_up_to_date' => $isUpToDate,
            'months_behind' => $this->getMonthsBehind(),
            'months_ahead' => $this->getMonthsAhead(),
            'can_access_paid_features' => $this->canAccessPaidFeatures(),
            'registration_date' => $this->created_at->toDateString(),
            'last_payment_check' => $this->last_payment_check,
            'status_message' => $this->getPaymentStatusMessage()
        ];
    }

    /**
     * Get human-readable payment status message
     */
    public function getPaymentStatusMessage(): string
    {
        $paid = $this->payment_count;
        $required = $this->getRequiredPayments();
        
        if ($paid >= $required) {
            if ($paid > $required) {
                return "Ahead by " . ($paid - $required) . " month(s)";
            } else {
                return "Up to date";
            }
        } else {
            return "Behind by " . ($required - $paid) . " month(s) - Payment required";
        }
    }
}
