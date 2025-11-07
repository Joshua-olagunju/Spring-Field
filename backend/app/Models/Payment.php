<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'amount',
        'period_type',
        'period_start',
        'period_end',
        'flutterwave_txn_id',
        'status',
        'paid_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'period_start' => 'date',
        'period_end' => 'date',
        'paid_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    /**
     * Disable updated_at timestamp (not in schema)
     */
    const UPDATED_AT = null;

    /**
     * Payment statuses enumeration
     */
    const STATUS_PENDING = 'pending';
    const STATUS_PAID = 'paid';
    const STATUS_FAILED = 'failed';

    /**
     * Period types enumeration
     */
    const PERIOD_MONTHLY = 'monthly';
    const PERIOD_QUARTERLY = 'quarterly';
    const PERIOD_SEMI_ANNUAL = '6months';
    const PERIOD_YEARLY = 'yearly';

    /**
     * Relationship: Payment belongs to user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Create a new payment record
     */
    public static function createPayment($userId, $amount, $periodType, $periodStart = null, $periodEnd = null)
    {
        // Calculate period dates if not provided
        if (!$periodStart) {
            $periodStart = now()->startOfMonth();
        }

        if (!$periodEnd) {
            switch ($periodType) {
                case self::PERIOD_MONTHLY:
                    $periodEnd = $periodStart->copy()->endOfMonth();
                    break;
                case self::PERIOD_QUARTERLY:
                    $periodEnd = $periodStart->copy()->addMonths(3)->subDay();
                    break;
                case self::PERIOD_SEMI_ANNUAL:
                    $periodEnd = $periodStart->copy()->addMonths(6)->subDay();
                    break;
                case self::PERIOD_YEARLY:
                    $periodEnd = $periodStart->copy()->addYear()->subDay();
                    break;
                default:
                    $periodEnd = $periodStart->copy()->endOfMonth();
            }
        }

        return self::create([
            'user_id' => $userId,
            'amount' => $amount,
            'period_type' => $periodType,
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
            'status' => self::STATUS_PENDING,
        ]);
    }

    /**
     * Mark payment as paid
     */
    public function markAsPaid($flutterwaveTxnId = null)
    {
        $this->update([
            'status' => self::STATUS_PAID,
            'paid_at' => now(),
            'flutterwave_txn_id' => $flutterwaveTxnId,
        ]);
    }

    /**
     * Mark payment as failed
     */
    public function markAsFailed($flutterwaveTxnId = null)
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'flutterwave_txn_id' => $flutterwaveTxnId,
        ]);
    }

    /**
     * Check if payment is overdue
     */
    public function isOverdue()
    {
        return $this->status === self::STATUS_PENDING && 
               $this->period_end < now()->toDateString();
    }

    /**
     * Check if payment is paid
     */
    public function isPaid()
    {
        return $this->status === self::STATUS_PAID;
    }

    /**
     * Check if payment is pending
     */
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if payment failed
     */
    public function isFailed()
    {
        return $this->status === self::STATUS_FAILED;
    }

    /**
     * Get formatted amount
     */
    public function getFormattedAmountAttribute()
    {
        return '₦' . number_format($this->amount, 2);
    }

    /**
     * Get period display name
     */
    public function getPeriodDisplayAttribute()
    {
        switch ($this->period_type) {
            case self::PERIOD_MONTHLY:
                return 'Monthly';
            case self::PERIOD_QUARTERLY:
                return 'Quarterly';
            case self::PERIOD_SEMI_ANNUAL:
                return '6 Months';
            case self::PERIOD_YEARLY:
                return 'Yearly';
            default:
                return ucfirst($this->period_type);
        }
    }

    /**
     * Scope: Paid payments
     */
    public function scopePaid($query)
    {
        return $query->where('status', self::STATUS_PAID);
    }

    /**
     * Scope: Pending payments
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope: Failed payments
     */
    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    /**
     * Scope: Overdue payments
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', self::STATUS_PENDING)
                    ->where('period_end', '<', now()->toDateString());
    }

    /**
     * Scope: Filter by period type
     */
    public function scopeByPeriodType($query, $periodType)
    {
        return $query->where('period_type', $periodType);
    }

    /**
     * Scope: Filter by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope: This month's payments
     */
    public function scopeThisMonth($query)
    {
        return $query->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year);
    }
}
