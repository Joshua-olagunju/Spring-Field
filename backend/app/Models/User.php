<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

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
        'status_active',
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
    ];

    /**
     * Get the password attribute name for Laravel Auth
     */
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    /**
     * User roles enumeration
     */
    const ROLE_SUPER = 'super';
    const ROLE_LANDLORD = 'landlord';
    const ROLE_RESIDENT = 'resident';
    const ROLE_SECURITY = 'security';

    /**
     * Check if user is super admin
     */
    public function isSuper()
    {
        return $this->role === self::ROLE_SUPER;
    }

    /**
     * Check if user is landlord
     */
    public function isLandlord()
    {
        return $this->role === self::ROLE_LANDLORD;
    }

    /**
     * Check if user is resident
     */
    public function isResident()
    {
        return $this->role === self::ROLE_RESIDENT;
    }

    /**
     * Check if user is security guard
     */
    public function isSecurity()
    {
        return $this->role === self::ROLE_SECURITY;
    }

    /**
     * Relationship: User belongs to a house
     */
    public function house()
    {
        return $this->belongsTo(House::class);
    }

    /**
     * Relationship: Landlord has many houses
     */
    public function ownedHouses()
    {
        return $this->hasMany(House::class, 'landlord_id');
    }

    /**
     * Relationship: User has many payments
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Relationship: Resident has many visitor tokens
     */
    public function visitorTokens()
    {
        return $this->hasMany(VisitorToken::class, 'resident_id');
    }

    /**
     * Relationship: User has many logs (as actor)
     */
    public function logs()
    {
        return $this->hasMany(Log::class, 'actor_id');
    }

    /**
     * Relationship: User has many registration codes (created by)
     */
    public function createdRegistrationCodes()
    {
        return $this->hasMany(RegistrationCode::class, 'created_by');
    }

    /**
     * Relationship: User used registration code
     */
    public function usedRegistrationCode()
    {
        return $this->hasOne(RegistrationCode::class, 'used_by');
    }

    /**
     * Relationship: Security guard has many visitor entries
     */
    public function visitorEntries()
    {
        return $this->hasMany(VisitorEntry::class, 'guard_id');
    }

    /**
     * Scope: Active users only
     */
    public function scopeActive($query)
    {
        return $query->where('status_active', true);
    }

    /**
     * Scope: Filter by role
     */
    public function scopeRole($query, $role)
    {
        return $query->where('role', $role);
    }
}
