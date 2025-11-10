<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'reference_id',
        'actor_id',
        'action',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Disable updated_at timestamp as the table doesn't have it
     */
    const UPDATED_AT = null;

    const TYPE_TOKEN = 'token';
    const TYPE_PAYMENT = 'payment';
    const TYPE_ACCESS = 'access';
    const TYPE_ADMIN = 'admin';

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

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
}