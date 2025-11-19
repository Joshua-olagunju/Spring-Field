<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VisitorToken;
use App\Models\VisitorEntry;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class VisitorTokenController extends Controller
{
    /**
     * Generate a new visitor token
     */
    public function generateToken(Request $request)
    {
        try {
            Log::info('Token generation request received', [
                'user_id' => Auth::id(),
                'request_data' => $request->all()
            ]);

            $request->validate([
                'issued_for_name' => 'required|string|max:100',
                'issued_for_phone' => 'nullable|string|max:20',
                'visit_type' => 'required|in:short,long,delivery,contractor,other',
                'duration' => 'required|integer|min:1',
                'note' => 'nullable|string|max:500',
            ]);

            $user = Auth::user();
            
            if (!$user) {
                Log::error('No authenticated user found for token generation');
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            Log::info('Generating token for user', ['user_id' => $user->id, 'user_name' => $user->full_name]);
            
            // Generate unique token
            do {
                $tokenString = 'VT-' . strtoupper(Str::random(8));
                $tokenExists = VisitorToken::where('token_hash', hash('sha256', $tokenString))->exists();
            } while ($tokenExists);

            // Calculate expiry time with precise timing
            $expiresAt = Carbon::now();
            if ($request->visit_type === 'short') {
                // For short visits, duration is in hours
                $expiresAt->addHours($request->duration);
            } else {
                // For long visits, duration is in days
                $expiresAt->addDays($request->duration);
            }
            
            Log::info('Token expiration calculated', [
                'visit_type' => $request->visit_type,
                'duration' => $request->duration,
                'expires_at' => $expiresAt->toISOString(),
                'current_time' => Carbon::now()->toISOString()
            ]);

            // Create visitor token
            $visitorToken = VisitorToken::create([
                'resident_id' => $user->id,
                'token_hash' => hash('sha256', $tokenString),
                'temp_token' => $tokenString, // Store original token temporarily
                'issued_for_name' => $request->issued_for_name,
                'issued_for_phone' => $request->issued_for_phone,
                'visit_type' => $request->visit_type,
                'note' => $request->note,
                'expires_at' => $expiresAt,
            ]);

            Log::info('Token created successfully', ['token_id' => $visitorToken->id]);

            return response()->json([
                'success' => true,
                'message' => 'Visitor token generated successfully',
                'data' => [
                    'token' => $tokenString,
                    'token_id' => $visitorToken->id,
                    'visitor_name' => $visitorToken->issued_for_name,
                    'visitor_phone' => $visitorToken->issued_for_phone,
                    'stay_type' => $visitorToken->visit_type,
                    'duration' => $request->duration,
                    'expires_at' => $visitorToken->expires_at->toISOString(),
                    'generated_by' => [
                        'name' => $user->full_name,
                        'phone' => $user->phone,
                        'house_number' => $user->house_number ?? 'N/A',
                        'address' => $user->address ?? 'N/A',
                    ],
                ],
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error generating visitor token', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error generating visitor token',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify a visitor token
     */
    public function verifyToken(Request $request)
    {
        try {
            $request->validate([
                'token' => 'required|string',
            ]);

            $tokenHash = hash('sha256', $request->token);
            $visitorToken = VisitorToken::with(['resident.house'])
                ->where('token_hash', $tokenHash)
                ->first();

            if (!$visitorToken) {
                return response()->json([
                    'success' => false,
                    'isValid' => false,
                    'message' => 'Invalid token - not found in our records',
                ], 404);
            }

            // Check if token is expired with detailed logging
            if ($visitorToken->isExpired()) {
                Log::info('Token verification failed - expired', [
                    'token_id' => $visitorToken->id,
                    'expires_at' => $visitorToken->expires_at->toISOString(),
                    'current_time' => Carbon::now()->toISOString(),
                    'expired_since' => $visitorToken->expires_at->diffForHumans()
                ]);
                
                return response()->json([
                    'success' => false,
                    'isValid' => false,
                    'message' => 'Token has expired',
                    'data' => [
                        'expired_at' => $visitorToken->expires_at->toISOString(),
                        'current_time' => Carbon::now()->toISOString(),
                        'expired_since' => $visitorToken->expires_at->diffForHumans()
                    ]
                ], 400);
            }

            // Check if token is already used (has active entry)
            if ($visitorToken->isUsed()) {
                // Get the active entry for this token
                $activeEntry = $visitorToken->visitorEntries()
                    ->whereNull('exited_at')
                    ->with('guardUser')
                    ->first();
                
                if ($activeEntry) {
                    // Token is granted and visitor is currently on premises
                    return response()->json([
                        'success' => true,
                        'isValid' => true,
                        'isGranted' => true,
                        'message' => 'Token has been granted - visitor is on premises',
                        'data' => [
                            'token_id' => $visitorToken->id,
                            'entry_id' => $activeEntry->id,
                            'visitorInfo' => [
                                'name' => $visitorToken->issued_for_name,
                                'phone' => $visitorToken->issued_for_phone,
                                'stayType' => $visitorToken->visit_type,
                                'expiresAt' => $visitorToken->expires_at->toISOString(),
                                'note' => $visitorToken->note,
                                'enteredAt' => $activeEntry->entered_at->toISOString(),
                            ],
                            'generatedBy' => [
                                'name' => $visitorToken->resident->full_name,
                                'phone' => $visitorToken->resident->phone,
                                'house_number' => $visitorToken->resident->house_number ?? 'N/A',
                                'address' => $visitorToken->resident->address ?? 'N/A',
                                'house_type' => $visitorToken->resident->house_type ?? 'N/A',
                                'role' => $visitorToken->resident->role,
                                'generatedAt' => $visitorToken->created_at->toISOString(),
                            ],
                            'grantedBy' => [
                                'name' => $activeEntry->guardUser->full_name ?? 'Unknown',
                                'grantedAt' => $activeEntry->entered_at->toISOString(),
                            ],
                        ],
                    ], 200);
                } else {
                    // Token was used but visitor already exited
                    return response()->json([
                        'success' => false,
                        'isValid' => false,
                        'message' => 'Token has already been used and visitor has exited',
                    ], 400);
                }
            }

            // Token is valid and not yet used
            return response()->json([
                'success' => true,
                'isValid' => true,
                'isGranted' => false,
                'message' => 'Token is valid and ready for entry',
                'data' => [
                    'token_id' => $visitorToken->id,
                    'visitorInfo' => [
                        'name' => $visitorToken->issued_for_name,
                        'phone' => $visitorToken->issued_for_phone,
                        'stayType' => $visitorToken->visit_type,
                        'expiresAt' => $visitorToken->expires_at->toISOString(),
                        'note' => $visitorToken->note,
                    ],
                    'generatedBy' => [
                        'name' => $visitorToken->resident->full_name,
                        'phone' => $visitorToken->resident->phone,
                        'house_number' => $visitorToken->resident->house_number ?? 'N/A',
                        'address' => $visitorToken->resident->address ?? 'N/A',
                        'house_type' => $visitorToken->resident->house_type ?? 'N/A',
                        'role' => $visitorToken->resident->role,
                        'generatedAt' => $visitorToken->created_at->toISOString(),
                    ],
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error verifying token',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Grant entry to visitor (mark token as used and create entry log)
     */
    public function grantEntry(Request $request)
    {
        try {
            $request->validate([
                'token' => 'required|string',
                'visitor_name' => 'nullable|string|max:100',
                'visitor_phone' => 'nullable|string|max:20',
                'gate_id' => 'nullable|integer',
                'note' => 'nullable|string|max:500',
            ]);

            $guard = Auth::user();
            $tokenHash = hash('sha256', $request->token);
            
            $visitorToken = VisitorToken::where('token_hash', $tokenHash)->first();

            if (!$visitorToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token - not found',
                ], 404);
            }
            
            if ($visitorToken->isExpired()) {
                Log::info('Grant entry failed - token expired', [
                    'token_id' => $visitorToken->id,
                    'expires_at' => $visitorToken->expires_at->toISOString(),
                    'current_time' => Carbon::now()->toISOString()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Token has expired and cannot be used',
                    'data' => [
                        'expired_at' => $visitorToken->expires_at->toISOString(),
                        'current_time' => Carbon::now()->toISOString()
                    ]
                ], 400);
            }
            
            if ($visitorToken->isUsed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token has already been used',
                ], 400);
            }

            // Mark token as used and clear temp_token for security
            $visitorToken->update([
                'used_at' => now(),
                'temp_token' => null // Clear the temp token when used
            ]);

            // Create visitor entry log
            $visitorEntry = VisitorEntry::create([
                'token_id' => $visitorToken->id,
                'visitor_name' => $request->visitor_name ?? $visitorToken->issued_for_name,
                'visitor_phone' => $request->visitor_phone ?? $visitorToken->issued_for_phone,
                'entered_at' => now(),
                'guard_id' => $guard->id,
                'gate_id' => $request->gate_id,
                'note' => $request->note,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Entry granted successfully',
                'data' => [
                    'entry_id' => $visitorEntry->id,
                    'visitor_name' => $visitorEntry->visitor_name,
                    'entered_at' => $visitorEntry->entered_at->toISOString(),
                    'guard_name' => $guard->full_name,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error granting entry',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Exit visitor (mark exit time)
     */
    public function exitVisitor(Request $request)
    {
        try {
            $request->validate([
                'entry_id' => 'required|integer|exists:visitor_entries,id',
                'note' => 'nullable|string|max:500',
            ]);

            $visitorEntry = VisitorEntry::find($request->entry_id);

            if ($visitorEntry->exited_at) {
                return response()->json([
                    'success' => false,
                    'message' => 'Visitor has already exited',
                ], 400);
            }

            $exitTime = now();
            $durationMinutes = $visitorEntry->entered_at->diffInMinutes($exitTime);

            $visitorEntry->update([
                'exited_at' => $exitTime,
                'duration_minutes' => $durationMinutes,
                'note' => $request->note ? $visitorEntry->note . ' | Exit: ' . $request->note : $visitorEntry->note,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Visitor exit recorded successfully',
                'data' => [
                    'entry_id' => $visitorEntry->id,
                    'visitor_name' => $visitorEntry->visitor_name,
                    'entered_at' => $visitorEntry->entered_at->toISOString(),
                    'exited_at' => $visitorEntry->exited_at->toISOString(),
                    'duration_minutes' => $visitorEntry->duration_minutes,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error recording exit',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get user's visitor tokens
     */
    public function getUserTokens(Request $request)
    {
        try {
            $user = Auth::user();
            $tokens = VisitorToken::where('resident_id', $user->id)
                ->with(['visitorEntries'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            $formattedTokens = collect($tokens->items())->map(function ($token) {
                return [
                    'id' => $token->id,
                    'visitor_name' => $token->issued_for_name,
                    'visitor_phone' => $token->issued_for_phone,
                    'stay_type' => $token->visit_type,
                    'note' => $token->note,
                    'expires_at' => $token->expires_at->toISOString(),
                    'used_at' => $token->used_at ? $token->used_at->toISOString() : null,
                    'created_at' => $token->created_at->toISOString(),
                    'is_active' => $token->isActive(),
                    'is_expired' => $token->isExpired(),
                    'is_used' => $token->isUsed(),
                    'entries_count' => $token->visitorEntries->count(),
                    // Only include temp_token for active (unused and not expired) tokens
                    'token' => $token->isActive() ? $token->temp_token : null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'tokens' => $formattedTokens,
                    'pagination' => [
                        'current_page' => $tokens->currentPage(),
                        'total' => $tokens->total(),
                        'per_page' => $tokens->perPage(),
                        'last_page' => $tokens->lastPage(),
                    ],
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching tokens',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all visitor entries for security dashboard
     */
    public function getAllEntries(Request $request)
    {
        try {
            $entries = VisitorEntry::with(['token.resident', 'guardUser'])
                ->orderBy('created_at', 'desc')
                ->paginate(50);

            $formattedEntries = collect($entries->items())->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'visitor_name' => $entry->visitor_name,
                    'visitor_phone' => $entry->visitor_phone,
                    'entered_at' => $entry->entered_at->toISOString(),
                    'exited_at' => $entry->exited_at ? $entry->exited_at->toISOString() : null,
                    'duration_minutes' => $entry->duration_minutes,
                    'is_active' => $entry->isActive(),
                    'resident_name' => $entry->token->resident->full_name,
                    'house_number' => $entry->token->resident->house_number ?? 'N/A',
                    'guard_name' => $entry->guardUser ? $entry->guardUser->full_name : null,
                    'note' => $entry->note,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'entries' => $formattedEntries,
                    'pagination' => [
                        'current_page' => $entries->currentPage(),
                        'total' => $entries->total(),
                        'per_page' => $entries->perPage(),
                        'last_page' => $entries->lastPage(),
                    ],
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching entries',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get visitor entries for authenticated user only (their visitors)
     */
    public function getUserEntries(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Get entries for tokens generated by this user
            $entries = VisitorEntry::with(['token.resident', 'guardUser'])
                ->whereHas('token', function ($query) use ($user) {
                    $query->where('resident_id', $user->id);
                })
                ->orderBy('created_at', 'desc')
                ->paginate(50);

            $formattedEntries = collect($entries->items())->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'visitor_name' => $entry->visitor_name,
                    'visitor_phone' => $entry->visitor_phone,
                    'entered_at' => $entry->entered_at->toISOString(),
                    'exited_at' => $entry->exited_at ? $entry->exited_at->toISOString() : null,
                    'duration_minutes' => $entry->duration_minutes,
                    'is_active' => $entry->isActive(),
                    'resident_name' => $entry->token->resident->full_name,
                    'house_number' => $entry->token->resident->house_number ?? 'N/A',
                    'guard_name' => $entry->guardUser ? $entry->guardUser->full_name : null,
                    'note' => $entry->note,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'entries' => $formattedEntries,
                    'pagination' => [
                        'current_page' => $entries->currentPage(),
                        'total' => $entries->total(),
                        'per_page' => $entries->perPage(),
                        'last_page' => $entries->lastPage(),
                    ],
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching your visitor entries',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all active visitor entries (currently on premises)
     */
    public function getActiveEntries(Request $request)
    {
        try {
            $activeEntries = VisitorEntry::with(['token.resident', 'guardUser'])
                ->whereNull('exited_at')
                ->orderBy('entered_at', 'desc')
                ->get();

            $formattedEntries = $activeEntries->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'token_id' => $entry->token_id,
                    'visitor_name' => $entry->visitor_name,
                    'visitor_phone' => $entry->visitor_phone,
                    'purpose' => $entry->token->visit_type,
                    'entered_at' => $entry->entered_at->toISOString(),
                    'expires_at' => $entry->token->expires_at->toISOString(),
                    'resident_name' => $entry->token->resident->full_name,
                    'house_number' => $entry->token->resident->house_number ?? 'N/A',
                    'address' => $entry->token->resident->address ?? 'N/A',
                    'guard_name' => $entry->guardUser ? $entry->guardUser->full_name : 'Unknown',
                    'note' => $entry->note,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedEntries,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching active entries',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get admin dashboard statistics
     */
    public function getAdminDashboardStats(Request $request)
    {
        try {
            $admin = Auth::user();
            
            if (!$admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }
            
            if (!in_array($admin->role, ['admin', 'super_admin', 'landlord'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - Admin access required'
                ], 403);
            }

            Log::info('Admin dashboard stats requested', [
                'admin_id' => $admin->id,
                'admin_role' => $admin->role,
                'admin_name' => $admin->full_name
            ]);

            // Get total users connected to this admin (if admin) or all users (if super_admin)
            $totalUsersQuery = User::query();
            if ($admin->role === 'admin') {
                // For regular admins, count users they manage (you may need to adjust this based on your user hierarchy)
                $totalUsersQuery->where('created_by', $admin->id)
                    ->orWhere('role', 'user');
            }
            $totalUsers = $totalUsersQuery->count();

            // Get visitor statistics
            $totalVisitorsQuery = VisitorEntry::with(['token']);
            if ($admin->role === 'admin') {
                // For regular admins, only count visitors for tokens they or their users generated
                $adminUserIds = User::where('created_by', $admin->id)->pluck('id')->push($admin->id);
                $totalVisitorsQuery->whereHas('token', function($query) use ($adminUserIds) {
                    $query->whereIn('resident_id', $adminUserIds);
                });
            }
            $totalVisitors = $totalVisitorsQuery->count();

            // Get token statistics
            $tokenStatsQuery = VisitorToken::query();
            if ($admin->role === 'admin') {
                // For regular admins, only count their tokens and their users' tokens
                $adminUserIds = User::where('created_by', $admin->id)->pluck('id')->push($admin->id);
                $tokenStatsQuery->whereIn('resident_id', $adminUserIds);
            }
            
            $activeTokens = (clone $tokenStatsQuery)->where('expires_at', '>', Carbon::now())
                ->whereNull('used_at')->count();
            $pendingTokens = (clone $tokenStatsQuery)->whereNull('used_at')->count() - $activeTokens;
            $usedTokens = (clone $tokenStatsQuery)->whereNotNull('used_at')->count();
            $expiredTokens = (clone $tokenStatsQuery)->where('expires_at', '<=', Carbon::now())
                ->whereNull('used_at')->count();
            $totalTokens = $tokenStatsQuery->count();

            // Get recent visitors (last 10)
            $recentVisitorsQuery = VisitorEntry::with(['token.resident', 'guardUser'])
                ->orderBy('created_at', 'desc');
            if ($admin->role === 'admin') {
                $adminUserIds = User::where('created_by', $admin->id)->pluck('id')->push($admin->id);
                $recentVisitorsQuery->whereHas('token', function($query) use ($adminUserIds) {
                    $query->whereIn('resident_id', $adminUserIds);
                });
            }
            $recentVisitors = $recentVisitorsQuery->limit(10)->get();

            $formattedRecentVisitors = $recentVisitors->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'name' => $entry->visitor_name,
                    'phone' => $entry->visitor_phone,
                    'visit_date' => $entry->entered_at ? $entry->entered_at->format('M d, Y') : 'N/A',
                    'visit_time' => $entry->entered_at ? $entry->entered_at->format('h:i A') : 'N/A',
                    'status' => $entry->exited_at ? 'completed' : ($entry->token->isExpired() ? 'expired' : 'active'),
                    'resident_name' => $entry->token->resident->full_name ?? 'Unknown',
                    'house_number' => $entry->token->resident->house_number ?? 'N/A',
                    'visit_type' => $entry->token->visit_type,
                    'entered_at' => $entry->entered_at ? $entry->entered_at->toISOString() : null,
                    'exited_at' => $entry->exited_at ? $entry->exited_at->toISOString() : null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => [
                        'total_visitors' => $totalVisitors,
                        'total_users' => $totalUsers,
                        'total_tokens' => $totalTokens,
                        'active_tokens' => $activeTokens,
                        'pending_tokens' => $pendingTokens,
                        'used_tokens' => $usedTokens,
                        'expired_tokens' => $expiredTokens,
                    ],
                    'recent_visitors' => $formattedRecentVisitors,
                ],
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error fetching admin dashboard stats', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'admin_id' => Auth::id()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching dashboard statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get test dashboard statistics (no auth required for testing)
     */
    public function getTestDashboardStats(Request $request)
    {
        try {
            // Get basic statistics without auth constraints
            $totalVisitors = VisitorEntry::count();
            $totalUsers = User::count();
            $totalTokens = VisitorToken::count();
            $activeTokens = VisitorToken::where('expires_at', '>', Carbon::now())
                ->whereNull('used_at')->count();
            $usedTokens = VisitorToken::whereNotNull('used_at')->count();
            $expiredTokens = VisitorToken::where('expires_at', '<=', Carbon::now())
                ->whereNull('used_at')->count();
            $pendingTokens = $totalTokens - $activeTokens - $usedTokens - $expiredTokens;

            // Get recent visitors (last 5 for testing)
            $recentVisitors = VisitorEntry::with(['token.resident', 'guardUser'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            $formattedRecentVisitors = $recentVisitors->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'name' => $entry->visitor_name ?? 'Unknown Visitor',
                    'phone' => $entry->visitor_phone,
                    'visit_date' => $entry->entered_at ? $entry->entered_at->format('M d, Y') : 'N/A',
                    'visit_time' => $entry->entered_at ? $entry->entered_at->format('h:i A') : 'N/A',
                    'status' => $entry->exited_at ? 'completed' : ($entry->token && $entry->token->isExpired() ? 'expired' : 'active'),
                    'resident_name' => $entry->token && $entry->token->resident ? $entry->token->resident->full_name : 'Unknown',
                    'house_number' => $entry->token && $entry->token->resident ? $entry->token->resident->house_number ?? 'N/A' : 'N/A',
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => [
                        'total_visitors' => $totalVisitors,
                        'total_users' => $totalUsers,
                        'total_tokens' => $totalTokens,
                        'active_tokens' => $activeTokens,
                        'pending_tokens' => max(0, $pendingTokens), // Ensure non-negative
                        'used_tokens' => $usedTokens,
                        'expired_tokens' => $expiredTokens,
                    ],
                    'recent_visitors' => $formattedRecentVisitors,
                ],
                'message' => 'Test endpoint - no authentication required'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error fetching test dashboard stats', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching test dashboard statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get expired tokens (for cleanup/monitoring)
     */
    public function getExpiredTokens(Request $request)
    {
        try {
            $expiredTokens = VisitorToken::with(['resident'])
                ->where('expires_at', '<', Carbon::now())
                ->orderBy('expires_at', 'desc')
                ->paginate(50);

            $formattedTokens = collect($expiredTokens->items())->map(function ($token) {
                return [
                    'id' => $token->id,
                    'visitor_name' => $token->issued_for_name,
                    'visit_type' => $token->visit_type,
                    'created_at' => $token->created_at->toISOString(),
                    'expires_at' => $token->expires_at->toISOString(),
                    'expired_since' => $token->expires_at->diffForHumans(),
                    'is_used' => $token->isUsed(),
                    'used_at' => $token->used_at ? $token->used_at->toISOString() : null,
                    'resident_name' => $token->resident->full_name,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'expired_tokens' => $formattedTokens,
                    'count' => $expiredTokens->total(),
                    'pagination' => [
                        'current_page' => $expiredTokens->currentPage(),
                        'total' => $expiredTokens->total(),
                        'per_page' => $expiredTokens->perPage(),
                        'last_page' => $expiredTokens->lastPage(),
                    ],
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching expired tokens',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clear expired temp tokens for security
     */
    public function clearExpiredTempTokens(Request $request)
    {
        try {
            $clearedCount = VisitorToken::where('expires_at', '<=', Carbon::now())
                ->whereNotNull('temp_token')
                ->update(['temp_token' => null]);

            return response()->json([
                'success' => true,
                'message' => 'Expired temp tokens cleared',
                'cleared_count' => $clearedCount
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error clearing expired temp tokens',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Test token expiration (for debugging)
     */
    public function testTokenExpiration(Request $request)
    {
        try {
            $request->validate([
                'token' => 'required|string',
            ]);

            $tokenHash = hash('sha256', $request->token);
            $visitorToken = VisitorToken::where('token_hash', $tokenHash)->first();

            if (!$visitorToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'token_id' => $visitorToken->id,
                    'created_at' => $visitorToken->created_at->toISOString(),
                    'expires_at' => $visitorToken->expires_at->toISOString(),
                    'current_time' => Carbon::now()->toISOString(),
                    'is_expired' => $visitorToken->isExpired(),
                    'is_used' => $visitorToken->isUsed(),
                    'is_active' => $visitorToken->isActive(),
                    'time_until_expiry' => $visitorToken->getTimeUntilExpiry(),
                    'remaining_minutes' => $visitorToken->getRemainingMinutes(),
                    'visit_type' => $visitorToken->visit_type,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error testing token',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Checkout visitor by token (mark exit using token instead of entry_id)
     */
    public function checkoutByToken(Request $request)
    {
        try {
            $request->validate([
                'token' => 'required|string',
                'note' => 'nullable|string|max:500',
            ]);

            $tokenHash = hash('sha256', $request->token);
            $visitorToken = VisitorToken::where('token_hash', $tokenHash)->first();

            if (!$visitorToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token - not found',
                ], 404);
            }
            
            // Note: We allow checkout even if token is expired, 
            // as visitor may still be on premises after token expired
            if ($visitorToken->isExpired()) {
                Log::info('Checkout with expired token (allowed)', [
                    'token_id' => $visitorToken->id,
                    'expires_at' => $visitorToken->expires_at->toISOString(),
                    'current_time' => Carbon::now()->toISOString()
                ]);
            }

            // Find the active entry for this token
            $activeEntry = $visitorToken->visitorEntries()
                ->whereNull('exited_at')
                ->first();

            if (!$activeEntry) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active entry found for this token',
                ], 404);
            }

            $exitTime = now();
            $durationMinutes = $activeEntry->entered_at->diffInMinutes($exitTime);

            $activeEntry->update([
                'exited_at' => $exitTime,
                'duration_minutes' => $durationMinutes,
                'note' => $request->note ? $activeEntry->note . ' | Exit: ' . $request->note : $activeEntry->note,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Visitor checked out successfully',
                'data' => [
                    'entry_id' => $activeEntry->id,
                    'visitor_name' => $activeEntry->visitor_name,
                    'entered_at' => $activeEntry->entered_at->toISOString(),
                    'exited_at' => $activeEntry->exited_at->toISOString(),
                    'duration_minutes' => $activeEntry->duration_minutes,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking out visitor',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}