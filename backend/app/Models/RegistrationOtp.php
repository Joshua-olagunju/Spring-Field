<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Carbon\Carbon;

class RegistrationOtp extends Model
{
    use HasFactory;

    protected $fillable = [
        'otp_code',
        'generated_by',
        'target_role',
        'house_number',
        'address',
        'house_id',
        'expires_at',
        'used_at',
        'used_by',
        'is_active',
        'metadata'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
        'is_active' => 'boolean',
        'metadata' => 'array'
    ];

    const TARGET_LANDLORD = 'landlord';
    const TARGET_RESIDENT = 'resident';
    const TARGET_SECURITY = 'security';

    /**
     * Generate a new OTP code (6-digit numeric)
     */
    public static function generateOtpCode()
    {
        do {
            // Generate 6-digit numeric OTP
            $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        } while (self::where('otp_code', $otp)->exists());

        return $otp;
    }

    /**
     * Create OTP for landlord (by super admin)
     */
    public static function createForLandlord($generatedBy, $expiresInHours = 24)
    {
        return self::create([
            'otp_code' => self::generateOtpCode(),
            'generated_by' => $generatedBy,
            'target_role' => self::TARGET_LANDLORD,
            'expires_at' => Carbon::now()->addHours($expiresInHours),
        ]);
    }

    /**
     * Create OTP for resident (by landlord)
     */
    public static function createForResident($generatedBy, $houseId, $houseNumber, $address, $expiresInHours = 72)
    {
        return self::create([
            'otp_code' => self::generateOtpCode(),
            'generated_by' => $generatedBy,
            'target_role' => self::TARGET_RESIDENT,
            'house_id' => $houseId,
            'house_number' => $houseNumber,
            'address' => $address,
            'expires_at' => Carbon::now()->addHours($expiresInHours),
        ]);
    }

    /**
     * Relationships
     */
    public function generatedBy()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function usedBy()
    {
        return $this->belongsTo(User::class, 'used_by');
    }

    public function house()
    {
        return $this->belongsTo(House::class, 'house_id');
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeValid($query)
    {
        return $query->where('is_active', true)
                    ->where('expires_at', '>', now())
                    ->whereNull('used_at');
    }

    public function scopeForRole($query, $role)
    {
        return $query->where('target_role', $role);
    }

    /**
     * Check if OTP is valid
     */
    public function isValid()
    {
        return $this->is_active && 
               $this->expires_at > now() && 
               is_null($this->used_at);
    }

    /**
     * Check if OTP is expired
     */
    public function isExpired()
    {
        return $this->expires_at <= now();
    }

    /**
     * Check if OTP is used
     */
    public function isUsed()
    {
        return !is_null($this->used_at);
    }

    /**
     * Mark OTP as used
     */
    public function markAsUsed($userId)
    {
        $this->update([
            'used_at' => now(),
            'used_by' => $userId,
            'is_active' => false
        ]);

        return $this;
    }

    /**
     * Deactivate OTP
     */
    public function deactivate()
    {
        $this->update(['is_active' => false]);
        return $this;
    }
}
