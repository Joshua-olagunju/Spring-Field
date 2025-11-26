<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User;
use App\Models\VisitorToken;
use App\Models\VisitorEntry;

class ReportsController extends Controller
{
    /**
     * Get comprehensive statistics for super admin reports
     */
    public function getStatistics(Request $request)
    {
        try {
            // User Statistics
            $totalUsers = User::count();
            $totalLandlords = User::where('role', 'landlord')->count(); // Only landlords, not super or security
            $totalResidents = User::where('role', 'resident')->count();
            $totalSuperAdmins = User::where('role', 'super')->count();
            $totalSecurity = User::where('role', 'security')->count();
            $activeUsers = User::where('status_active', 1)->count();
            $verifiedUsers = User::whereNotNull('email_verified_at')->count();

            // Calculate user retention rate (users who have logged in in the last 30 days)
            $recentlyActiveUsers = User::where('last_login_at', '>=', Carbon::now()->subDays(30))->count();
            $userRetentionRate = $totalUsers > 0 ? round(($recentlyActiveUsers / $totalUsers) * 100, 1) : 0;

            // Visitor Statistics
            $totalVisitors = VisitorEntry::count();
            $uniqueVisitors = VisitorEntry::distinct('visitor_phone')->count('visitor_phone');
            
            // Average daily visitors (last 30 days)
            $recentEntries = VisitorEntry::where('entered_at', '>=', Carbon::now()->subDays(30))->count();
            $averageDailyVisitors = round($recentEntries / 30, 0);

            // Monthly visitor growth
            $thisMonthVisitors = VisitorEntry::where('entered_at', '>=', Carbon::now()->startOfMonth())->count();
            $lastMonthVisitors = VisitorEntry::whereBetween('entered_at', [
                Carbon::now()->subMonth()->startOfMonth(),
                Carbon::now()->subMonth()->endOfMonth()
            ])->count();
            
            $monthlyVisitorGrowth = $lastMonthVisitors > 0 ? 
                round((($thisMonthVisitors - $lastMonthVisitors) / $lastMonthVisitors) * 100, 1) : 
                ($thisMonthVisitors > 0 ? 100 : 0);

            // Returning visitors (visitors with more than one entry)
            $returningVisitors = DB::table('visitor_entries')
                ->select('visitor_phone')
                ->groupBy('visitor_phone')
                ->havingRaw('COUNT(*) > 1')
                ->get()
                ->count();

            // Token Statistics
            $totalTokens = VisitorToken::count();
            $activeTokens = VisitorToken::whereNull('used_at')
                ->where('expires_at', '>', Carbon::now())
                ->count();
            $expiredTokens = VisitorToken::where('expires_at', '<=', Carbon::now())->count();
            $usedTokens = VisitorToken::whereNotNull('used_at')->count();
            $pendingTokens = VisitorToken::whereNull('used_at')
                ->where('expires_at', '>', Carbon::now())
                ->count();

            // Token utilization rate
            $tokenUtilizationRate = $totalTokens > 0 ? 
                round(($usedTokens / $totalTokens) * 100, 1) : 0;

            // Average token duration (for used tokens)
            $avgTokenDuration = DB::table('visitor_tokens')
                ->whereNotNull('used_at')
                ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, used_at)) as avg_duration')
                ->first();
            
            $averageTokenDurationHours = $avgTokenDuration ? round($avgTokenDuration->avg_duration, 1) : 0;

            // Tokens generated today
            $tokensGeneratedToday = VisitorToken::whereDate('created_at', Carbon::today())->count();

            // System health metrics
            $recentErrorLogs = DB::table('logs')
                ->where('type', 'error')
                ->where('created_at', '>=', Carbon::now()->subHours(24))
                ->count();

            $systemHealth = $recentErrorLogs < 10 ? 'Excellent' : ($recentErrorLogs < 50 ? 'Good' : 'Needs Attention');
            
            // Database status (check if we can query successfully)
            $databaseStatus = 'Healthy';
            try {
                DB::select('SELECT 1');
            } catch (\Exception $e) {
                $databaseStatus = 'Unhealthy';
            }

            // Peak activity analysis (most active hour of the day)
            $peakActivity = DB::table('visitor_entries')
                ->selectRaw('HOUR(entered_at) as hour, COUNT(*) as entries')
                ->where('entered_at', '>=', Carbon::now()->subDays(30))
                ->groupBy('hour')
                ->orderBy('entries', 'desc')
                ->first();

            $peakActivityTime = $peakActivity ? 
                sprintf('%02d:00 - %02d:00', $peakActivity->hour, $peakActivity->hour + 1) : 
                'No data';

            // Calculate trends (compared to last month)
            $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
            $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

            $lastMonthUsers = User::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();
            $thisMonthUsers = User::where('created_at', '>=', Carbon::now()->startOfMonth())->count();
            $userGrowthTrend = $lastMonthUsers > 0 ? 
                round((($thisMonthUsers - $lastMonthUsers) / $lastMonthUsers) * 100, 1) : 
                ($thisMonthUsers > 0 ? 100 : 0);

            $lastMonthTokens = VisitorToken::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();
            $thisMonthTokens = VisitorToken::where('created_at', '>=', Carbon::now()->startOfMonth())->count();
            $tokenGrowthTrend = $lastMonthTokens > 0 ? 
                round((($thisMonthTokens - $lastMonthTokens) / $lastMonthTokens) * 100, 1) : 
                ($thisMonthTokens > 0 ? 100 : 0);

            return response()->json([
                'success' => true,
                'data' => [
                    'user_statistics' => [
                        'total_users' => $totalUsers,
                        'total_landlords' => $totalLandlords,
                        'total_residents' => $totalResidents,
                        'total_super_admins' => $totalSuperAdmins,
                        'total_security' => $totalSecurity,
                        'active_users' => $activeUsers,
                        'inactive_users' => $totalUsers - $activeUsers,
                        'verified_users' => $verifiedUsers,
                        'user_retention_rate' => $userRetentionRate,
                        'user_growth_trend' => $userGrowthTrend
                    ],
                    'visitor_statistics' => [
                        'total_visitors' => $totalVisitors,
                        'unique_visitors' => $uniqueVisitors,
                        'average_daily_visitors' => $averageDailyVisitors,
                        'monthly_visitor_growth' => $monthlyVisitorGrowth,
                        'returning_visitors' => $returningVisitors,
                        'first_time_visitors' => $uniqueVisitors - $returningVisitors,
                        'visitor_conversion_rate' => $uniqueVisitors > 0 ? 
                            round(($returningVisitors / $uniqueVisitors) * 100, 1) : 0
                    ],
                    'token_statistics' => [
                        'total_tokens' => $totalTokens,
                        'active_tokens' => $activeTokens,
                        'expired_tokens' => $expiredTokens,
                        'used_tokens' => $usedTokens,
                        'pending_tokens' => $pendingTokens,
                        'token_utilization_rate' => $tokenUtilizationRate,
                        'average_token_duration_hours' => $averageTokenDurationHours,
                        'tokens_generated_today' => $tokensGeneratedToday,
                        'token_growth_trend' => $tokenGrowthTrend
                    ],
                    'system_health' => [
                        'status' => $systemHealth,
                        'database_status' => $databaseStatus,
                        'peak_activity_time' => $peakActivityTime,
                        'last_updated' => Carbon::now()->toISOString(),
                        'recent_errors' => $recentErrorLogs
                    ]
                ],
                'generated_at' => Carbon::now()->toISOString()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detailed user analytics
     */
    public function getUserAnalytics(Request $request)
    {
        try {
            // Users by role
            $usersByRole = User::select('role', DB::raw('count(*) as count'))
                ->groupBy('role')
                ->get()
                ->keyBy('role');

            // User registration trends (last 12 months)
            $registrationTrends = DB::table('users')
                ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
                ->where('created_at', '>=', Carbon::now()->subMonths(12))
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            // Users by verification status
            $verificationStats = [
                'verified' => User::whereNotNull('email_verified_at')->count(),
                'unverified' => User::whereNull('email_verified_at')->count()
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'users_by_role' => $usersByRole,
                    'registration_trends' => $registrationTrends,
                    'verification_stats' => $verificationStats
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detailed visitor analytics
     */
    public function getVisitorAnalytics(Request $request)
    {
        try {
            // Visitor entries by month (last 12 months)
            $visitorTrends = DB::table('visitor_entries')
                ->selectRaw('DATE_FORMAT(entered_at, "%Y-%m") as month, COUNT(*) as count')
                ->where('entered_at', '>=', Carbon::now()->subMonths(12))
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            // Visit duration analysis
            $durationStats = DB::table('visitor_entries')
                ->whereNotNull('duration_minutes')
                ->selectRaw('
                    AVG(duration_minutes) as avg_duration,
                    MIN(duration_minutes) as min_duration,
                    MAX(duration_minutes) as max_duration
                ')
                ->first();

            // Popular visit times (hour of day)
            $visitTimeDistribution = DB::table('visitor_entries')
                ->selectRaw('HOUR(entered_at) as hour, COUNT(*) as count')
                ->groupBy('hour')
                ->orderBy('hour')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'visitor_trends' => $visitorTrends,
                    'duration_stats' => $durationStats,
                    'visit_time_distribution' => $visitTimeDistribution
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch visitor analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}