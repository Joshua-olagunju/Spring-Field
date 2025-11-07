<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'type',
        'reference_id',
        'actor_id',
        'action',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Disable updated_at timestamp (not in schema)
     */
    const UPDATED_AT = null;

    /**
     * Log types enumeration
     */
    const TYPE_TOKEN = 'token';
    const TYPE_PAYMENT = 'payment';
    const TYPE_ACCESS = 'access';
    const TYPE_ADMIN = 'admin';

    /**
     * Relationship: Log belongs to actor (user)
     */
    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * Log an action
     */
    public static function logAction($type, $action, $actorId = null, $referenceId = null, $metadata = [])
    {
        return self::create([
            'type' => $type,
            'action' => $action,
            'actor_id' => $actorId,
            'reference_id' => $referenceId,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Log token action
     */
    public static function logToken($action, $tokenId, $actorId, $metadata = [])
    {
        return self::logAction(self::TYPE_TOKEN, $action, $actorId, $tokenId, $metadata);
    }

    /**
     * Log payment action
     */
    public static function logPayment($action, $paymentId, $actorId, $metadata = [])
    {
        return self::logAction(self::TYPE_PAYMENT, $action, $actorId, $paymentId, $metadata);
    }

    /**
     * Log access action
     */
    public static function logAccess($action, $actorId, $metadata = [])
    {
        return self::logAction(self::TYPE_ACCESS, $action, $actorId, null, $metadata);
    }

    /**
     * Log admin action
     */
    public static function logAdmin($action, $actorId, $referenceId = null, $metadata = [])
    {
        return self::logAction(self::TYPE_ADMIN, $action, $actorId, $referenceId, $metadata);
    }

    /**
     * Get reference model based on type and reference_id
     */
    public function getReference()
    {
        if (!$this->reference_id) {
            return null;
        }

        switch ($this->type) {
            case self::TYPE_TOKEN:
                return VisitorToken::find($this->reference_id);
            case self::TYPE_PAYMENT:
                return Payment::find($this->reference_id);
            case self::TYPE_ADMIN:
                // Could be any model, metadata should contain model type
                if (isset($this->metadata['model_type'])) {
                    $modelClass = 'App\\Models\\' . $this->metadata['model_type'];
                    if (class_exists($modelClass)) {
                        return $modelClass::find($this->reference_id);
                    }
                }
                return null;
            default:
                return null;
        }
    }

    /**
     * Scope: Filter by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: Filter by actor
     */
    public function scopeByActor($query, $actorId)
    {
        return $query->where('actor_id', $actorId);
    }

    /**
     * Scope: Filter by action
     */
    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope: Filter by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope: Today's logs
     */
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    /**
     * Scope: Recent logs (last 24 hours)
     */
    public function scopeRecent($query)
    {
        return $query->where('created_at', '>=', now()->subDay());
    }

    /**
     * Scope: Token-related logs
     */
    public function scopeTokenLogs($query)
    {
        return $query->where('type', self::TYPE_TOKEN);
    }

    /**
     * Scope: Payment-related logs
     */
    public function scopePaymentLogs($query)
    {
        return $query->where('type', self::TYPE_PAYMENT);
    }

    /**
     * Scope: Access-related logs
     */
    public function scopeAccessLogs($query)
    {
        return $query->where('type', self::TYPE_ACCESS);
    }

    /**
     * Scope: Admin-related logs
     */
    public function scopeAdminLogs($query)
    {
        return $query->where('type', self::TYPE_ADMIN);
    }
}
