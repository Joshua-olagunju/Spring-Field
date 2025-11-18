<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisitorEntry extends Model
{
    use HasFactory;

    // Disable updated_at timestamp since the table doesn't have it
    const UPDATED_AT = null;

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

    protected $casts = [
        'entered_at' => 'datetime',
        'exited_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function token()
    {
        return $this->belongsTo(VisitorToken::class, 'token_id');
    }

    public function guardUser()
    {
        return $this->belongsTo(User::class, 'guard_id');
    }

    public function calculateDuration()
    {
        if ($this->entered_at && $this->exited_at) {
            return $this->entered_at->diffInMinutes($this->exited_at);
        }
        return null;
    }

    public function isActive()
    {
        return $this->entered_at && !$this->exited_at;
    }
}