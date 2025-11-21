<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'payment_id',
        'package_type',
        'period',
        'amount',
        'starts_at',
        'expires_at',
        'status',
        'auto_renew',
        'subscription_data',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'auto_renew' => 'boolean',
        'subscription_data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Subscription statuses
     */
    const STATUS_ACTIVE = 'active';
    const STATUS_EXPIRED = 'expired';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_SUSPENDED = 'suspended';

    /**
     * Get the user that owns the subscription.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the payment associated with this subscription.
     */
    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Check if subscription is active
     */
    public function isActive()
    {
        return $this->status === self::STATUS_ACTIVE && $this->expires_at > now();
    }

    /**
     * Check if subscription is expired
     */
    public function isExpired()
    {
        return $this->expires_at <= now();
    }

    /**
     * Get the number of days remaining in the subscription
     */
    public function getDaysRemaining()
    {
        if ($this->isExpired()) {
            return 0;
        }
        
        return now()->diffInDays($this->expires_at);
    }
}
