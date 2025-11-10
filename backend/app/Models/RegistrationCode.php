<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegistrationCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'house_id',
        'code_hash',
        'issued_by',
        'expires_at',
        'used_at',
        'used_by_user_id',
        'revoked',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
        'revoked' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function house()
    {
        return $this->belongsTo(House::class);
    }

    public function issuedBy()
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function usedBy()
    {
        return $this->belongsTo(User::class, 'used_by_user_id');
    }

    public function isExpired()
    {
        return $this->expires_at < now();
    }

    public function isUsed()
    {
        return !is_null($this->used_at);
    }

    public function isRevoked()
    {
        return $this->revoked;
    }

    public function isValid()
    {
        return !$this->isExpired() && !$this->isUsed() && !$this->isRevoked();
    }
}