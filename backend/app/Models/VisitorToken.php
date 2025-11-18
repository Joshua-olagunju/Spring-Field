<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisitorToken extends Model
{
    use HasFactory;

    // Disable updated_at timestamp since the table doesn't have it
    const UPDATED_AT = null;

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

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    const VISIT_SHORT = 'short';
    const VISIT_LONG = 'long';
    const VISIT_DELIVERY = 'delivery';
    const VISIT_CONTRACTOR = 'contractor';
    const VISIT_OTHER = 'other';

    public function resident()
    {
        return $this->belongsTo(User::class, 'resident_id');
    }

    public function visitorEntries()
    {
        return $this->hasMany(VisitorEntry::class, 'token_id');
    }

    public function isExpired()
    {
        return $this->expires_at < now();
    }

    public function isUsed()
    {
        return !is_null($this->used_at);
    }

    public function isActive()
    {
        return !$this->isExpired() && !$this->isUsed();
    }
}