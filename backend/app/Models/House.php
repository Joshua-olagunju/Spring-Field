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
        'house_type',
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
     * Disable updated_at timestamp as the table doesn't have it
     */
    const UPDATED_AT = null;

    /**
     * Get the landlord that owns the house.
     */
    public function landlord()
    {
        return $this->belongsTo(User::class, 'landlord_id');
    }

    /**
     * Get the residents living in this house.
     */
    public function residents()
    {
        return $this->hasMany(User::class, 'house_id');
    }

    /**
     * Get the registration codes for this house.
     */
    public function registrationCodes()
    {
        return $this->hasMany(RegistrationCode::class);
    }

    /**
     * Get active residents living in this house.
     */
    public function activeResidents()
    {
        return $this->residents()->where('status_active', true);
    }

    /**
     * Get the full address display
     */
    public function getFullAddressAttribute()
    {
        return "House {$this->house_number}, {$this->address}";
    }
}