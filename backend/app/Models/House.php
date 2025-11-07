<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class House extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'landlord_id',
        'house_number',
        'address',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Disable updated_at timestamp (not in schema)
     */
    const UPDATED_AT = null;

    /**
     * Relationship: House belongs to landlord
     */
    public function landlord()
    {
        return $this->belongsTo(User::class, 'landlord_id');
    }

    /**
     * Relationship: House has many residents
     */
    public function residents()
    {
        return $this->hasMany(User::class)->where('role', 'resident');
    }

    /**
     * Relationship: House has many registration codes
     */
    public function registrationCodes()
    {
        return $this->hasMany(RegistrationCode::class);
    }

    /**
     * Get visitor tokens through residents
     */
    public function visitorTokens()
    {
        return $this->hasManyThrough(VisitorToken::class, User::class, 'house_id', 'resident_id');
    }

    /**
     * Scope: Search by house number
     */
    public function scopeByHouseNumber($query, $houseNumber)
    {
        return $query->where('house_number', $houseNumber);
    }

    /**
     * Scope: Filter by landlord
     */
    public function scopeByLandlord($query, $landlordId)
    {
        return $query->where('landlord_id', $landlordId);
    }
}
