<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class VisitorToken extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'resident_id',
        'token_hash',
        'issued_for_name',
        'issued_for_phone',
        'visit_type',
        'note',
        'expires_at',
        'used_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    /**
     * Disable updated_at timestamp (not in schema)
     */
    const UPDATED_AT = null;

    /**
     * Visit types enumeration
     */
    const TYPE_SHORT = 'short';
    const TYPE_LONG = 'long';
    const TYPE_DELIVERY = 'delivery';
    const TYPE_CONTRACTOR = 'contractor';
    const TYPE_OTHER = 'other';

    /**
     * Relationship: Token belongs to resident
     */
    public function resident()
    {
        return $this->belongsTo(User::class, 'resident_id');
    }

    /**
     * Relationship: Token has many visitor entries
     */
    public function visitorEntries()
    {
        return $this->hasMany(VisitorEntry::class, 'token_id');
    }

    /**
     * Get the house through resident
     */
    public function house()
    {
        return $this->resident->house();
    }

    /**
     * Generate a new visitor token
     */
    public static function generate($residentId, $data, $expiresInHours = 24)
    {
        $rawToken = Str::random(16) . '-' . time() . '-' . $residentId;
        $tokenHash = hash('sha256', $rawToken);
        
        $token = self::create([
            'resident_id' => $residentId,
            'token_hash' => $tokenHash,
            'issued_for_name' => $data['visitor_name'],
            'issued_for_phone' => $data['visitor_phone'] ?? null,
            'visit_type' => $data['visit_type'] ?? self::TYPE_SHORT,
            'note' => $data['note'] ?? null,
            'expires_at' => now()->addHours($expiresInHours),
        ]);

        // Return both token record and raw token for QR code
        return [
            'token' => $token,
            'raw_token' => $rawToken
        ];
    }

    /**
     * Verify a visitor token
     */
    public static function verify($rawToken)
    {
        $tokenHash = hash('sha256', $rawToken);
        
        return self::where('token_hash', $tokenHash)
                   ->where('expires_at', '>', now())
                   ->whereNull('used_at')
                   ->first();
    }

    /**
     * Mark token as used
     */
    public function markAsUsed()
    {
        $this->update(['used_at' => now()]);
    }

    /**
     * Check if token is valid
     */
    public function isValid()
    {
        return $this->expires_at > now() && is_null($this->used_at);
    }

    /**
     * Check if token is expired
     */
    public function isExpired()
    {
        return $this->expires_at <= now();
    }

    /**
     * Check if token is used
     */
    public function isUsed()
    {
        return !is_null($this->used_at);
    }

    /**
     * Generate QR code data
     */
    public function getQrCodeData($rawToken)
    {
        return json_encode([
            'token' => $rawToken,
            'visitor_name' => $this->issued_for_name,
            'visit_type' => $this->visit_type,
            'expires_at' => $this->expires_at->toISOString(),
            'house_info' => [
                'house_number' => $this->resident->house->house_number ?? null,
                'address' => $this->resident->house->address ?? null,
            ]
        ]);
    }

    /**
     * Scope: Active tokens only
     */
    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now())
                    ->whereNull('used_at');
    }

    /**
     * Scope: Expired tokens
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }

    /**
     * Scope: Used tokens
     */
    public function scopeUsed($query)
    {
        return $query->whereNotNull('used_at');
    }

    /**
     * Scope: Filter by visit type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('visit_type', $type);
    }

    /**
     * Scope: Filter by resident
     */
    public function scopeByResident($query, $residentId)
    {
        return $query->where('resident_id', $residentId);
    }
}
