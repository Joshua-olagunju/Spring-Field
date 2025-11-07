<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisitorEntry extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'token_id',
        'visitor_name',
        'visitor_phone',
        'entered_at',
        'exited_at',
        'guard_id',
        'gate_id',
        'duration_minutes',
        'note',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'entered_at' => 'datetime',
        'exited_at' => 'datetime',
        'created_at' => 'datetime',
        'gate_id' => 'integer',
        'duration_minutes' => 'integer',
    ];

    /**
     * Disable updated_at timestamp (not in schema)
     */
    const UPDATED_AT = null;

    /**
     * Relationship: Entry belongs to visitor token
     */
    public function visitorToken()
    {
        return $this->belongsTo(VisitorToken::class, 'token_id');
    }

    /**
     * Relationship: Entry logged by security guard
     */
    public function securityGuard()
    {
        return $this->belongsTo(User::class, 'guard_id');
    }

    /**
     * Log visitor entry
     */
    public static function logEntry($tokenId, $visitorData, $guardId, $gateId = null)
    {
        return self::create([
            'token_id' => $tokenId,
            'visitor_name' => $visitorData['visitor_name'],
            'visitor_phone' => $visitorData['visitor_phone'] ?? null,
            'entered_at' => now(),
            'guard_id' => $guardId,
            'gate_id' => $gateId,
            'note' => $visitorData['entry_note'] ?? null,
        ]);
    }

    /**
     * Log visitor exit
     */
    public function logExit($guardId, $note = null)
    {
        $enteredAt = $this->entered_at;
        $exitedAt = now();
        $duration = $enteredAt->diffInMinutes($exitedAt);

        $this->update([
            'exited_at' => $exitedAt,
            'duration_minutes' => $duration,
            'guard_id' => $guardId, // Update guard who logged exit
            'note' => $note ? ($this->note ? $this->note . ' | Exit: ' . $note : 'Exit: ' . $note) : $this->note,
        ]);

        return $this;
    }

    /**
     * Check if visitor is currently inside
     */
    public function isCurrentlyInside()
    {
        return !is_null($this->entered_at) && is_null($this->exited_at);
    }

    /**
     * Check if visitor has exited
     */
    public function hasExited()
    {
        return !is_null($this->exited_at);
    }

    /**
     * Get visit duration in minutes
     */
    public function getVisitDuration()
    {
        if ($this->hasExited()) {
            return $this->duration_minutes;
        }

        if ($this->isCurrentlyInside()) {
            return $this->entered_at->diffInMinutes(now());
        }

        return 0;
    }

    /**
     * Get visit duration in human readable format
     */
    public function getHumanDuration()
    {
        $minutes = $this->getVisitDuration();
        
        if ($minutes < 60) {
            return $minutes . ' minutes';
        }

        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;

        if ($remainingMinutes > 0) {
            return $hours . ' hours ' . $remainingMinutes . ' minutes';
        }

        return $hours . ' hours';
    }

    /**
     * Scope: Currently inside visitors
     */
    public function scopeCurrentlyInside($query)
    {
        return $query->whereNotNull('entered_at')
                    ->whereNull('exited_at');
    }

    /**
     * Scope: Exited visitors
     */
    public function scopeExited($query)
    {
        return $query->whereNotNull('exited_at');
    }

    /**
     * Scope: Filter by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('entered_at', [$startDate, $endDate]);
    }

    /**
     * Scope: Today's entries
     */
    public function scopeToday($query)
    {
        return $query->whereDate('entered_at', today());
    }

    /**
     * Scope: Filter by guard
     */
    public function scopeByGuard($query, $guardId)
    {
        return $query->where('guard_id', $guardId);
    }

    /**
     * Scope: Filter by gate
     */
    public function scopeByGate($query, $gateId)
    {
        return $query->where('gate_id', $gateId);
    }

    /**
     * Get visitor's house information through token
     */
    public function getHouseInfo()
    {
        return $this->visitorToken->resident->house ?? null;
    }
}
