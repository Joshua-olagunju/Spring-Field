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

            // Calculate expiry time
            $expiresAt = Carbon::now();
            if ($request->visit_type === 'short') {
                $expiresAt->addHours($request->duration);
            } else {
                $expiresAt->addDays($request->duration);
            }

            // Create visitor token
            $visitorToken = VisitorToken::create([
                'resident_id' => $user->id,
                'token_hash' => hash('sha256', $tokenString),
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

            // Check if token is expired
            if ($visitorToken->isExpired()) {
                return response()->json([
                    'success' => false,
                    'isValid' => false,
                    'message' => 'Token has expired',
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

            if (!$visitorToken || $visitorToken->isExpired() || $visitorToken->isUsed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired token',
                ], 400);
            }

            // Mark token as used
            $visitorToken->update(['used_at' => now()]);

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
                    'message' => 'Invalid token',
                ], 404);
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