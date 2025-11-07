<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegistrationCode extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code',
        'role',
        'status',
        'description',
        'expires_at',
        'used_at',
        'created_by',
        'used_by',
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
        'updated_at' => 'datetime',
    ];

    /**
     * Status constants
     */
    const STATUS_ACTIVE = 'active';
    const STATUS_USED = 'used';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_EXPIRED = 'expired';

    /**
     * Role constants
     */
    const ROLE_LANDLORD = 'landlord';
    const ROLE_RESIDENT = 'resident';
    const ROLE_SECURITY = 'security';

    /**
     * Relationship: Registration code created by user
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship: Registration code used by user
     */
    public function usedBy()
    {
        return $this->belongsTo(User::class, 'used_by');
    }

    /**
     * Check if code is active
     */
    public function isActive()
    {
        return $this->status === self::STATUS_ACTIVE && 
               (!$this->expires_at || $this->expires_at->isFuture());
    }

    /**
     * Check if code is expired
     */
    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Check if code is used
     */
    public function isUsed()
    {
        return $this->status === self::STATUS_USED;
    }

    /**
     * Mark code as used
     */
    public function markAsUsed($userId)
    {
        $this->update([
            'status' => self::STATUS_USED,
            'used_at' => now(),
            'used_by' => $userId,
        ]);
    }

    /**
     * Scope: Active codes only
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Scope: Expired codes
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<', now());
    }

    /**
     * Scope: Used codes
     */
    public function scopeUsed($query)
    {
        return $query->where('status', self::STATUS_USED);
    }

    /**
     * Scope: Filter by role
     */
    public function scopeRole($query, $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope: Created by specific user
     */
    public function scopeCreatedBy($query, $userId)
    {
        return $query->where('created_by', $userId);
    }
}
