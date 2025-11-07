<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Log;
use App\Models\RegistrationCode;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class RegistrationCodeController extends Controller
{
    /**
     * Display a listing of registration codes
     * GET /api/registration-codes
     * Access: Super Admin, Landlord (codes they created)
     */
    public function index(Request $request)
    {
        $currentUser = $request->user();
        
        // Build query based on user role
        $query = RegistrationCode::with(['createdBy:id,full_name,role', 'usedBy:id,full_name,phone']);

        // Role-based filtering
        if ($currentUser->isLandlord()) {
            // Landlords can only see codes they created
            $query->where('created_by', $currentUser->id);
        } elseif (!$currentUser->isSuper()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to access this resource'
            ], 403);
        }

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('created_by') && $currentUser->isSuper()) {
            $query->where('created_by', $request->created_by);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%")
                  ->orWhereHas('usedBy', function ($userQuery) use ($search) {
                      $userQuery->where('full_name', 'LIKE', "%{$search}%")
                               ->orWhere('phone', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $codes = $query->paginate($perPage);

        // Log the access
        Log::logAccess('REGISTRATION_CODES_LIST_ACCESSED', $currentUser->id, [
            'filters' => $request->only(['status', 'role', 'created_by', 'search', 'date_from', 'date_to']),
            'total_results' => $codes->total()
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'codes' => collect($codes->items())->map(function ($code) {
                    return [
                        'id' => $code->id,
                        'code' => $code->code,
                        'role' => $code->role,
                        'status' => $code->status,
                        'description' => $code->description,
                        'expires_at' => $code->expires_at,
                        'created_at' => $code->created_at,
                        'used_at' => $code->used_at,
                        'created_by' => $code->createdBy ? [
                            'id' => $code->createdBy->id,
                            'full_name' => $code->createdBy->full_name,
                            'role' => $code->createdBy->role
                        ] : null,
                        'used_by' => $code->usedBy ? [
                            'id' => $code->usedBy->id,
                            'full_name' => $code->usedBy->full_name,
                            'phone' => $code->usedBy->phone
                        ] : null,
                        'is_expired' => $code->expires_at && $code->expires_at->isPast(),
                        'is_available' => $code->status === 'active' && (!$code->expires_at || $code->expires_at->isFuture())
                    ];
                }),
                'pagination' => [
                    'current_page' => $codes->currentPage(),
                    'last_page' => $codes->lastPage(),
                    'per_page' => $codes->perPage(),
                    'total' => $codes->total()
                ],
                'statistics' => [
                    'total_codes' => $codes->total(),
                    'active_codes' => RegistrationCode::where('status', 'active')->count(),
                    'used_codes' => RegistrationCode::where('status', 'used')->count(),
                    'expired_codes' => RegistrationCode::where('expires_at', '<', now())->where('status', 'active')->count()
                ]
            ]
        ]);
    }

    /**
     * Generate new registration codes
     * POST /api/registration-codes/generate
     * Access: Super Admin, Landlord
     */
    public function generate(Request $request)
    {
        $currentUser = $request->user();
        
        $validator = Validator::make($request->all(), [
            'role' => 'required|in:landlord,resident,security',
            'count' => 'required|integer|min:1|max:100',
            'description' => 'nullable|string|max:255',
            'expires_in_days' => 'nullable|integer|min:1|max:365',
            'auto_expire' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Role-based restrictions
        if ($currentUser->isLandlord()) {
            // Landlords can only create resident codes
            if ($request->role !== 'resident') {
                return response()->json([
                    'success' => false,
                    'message' => 'Landlords can only generate registration codes for residents'
                ], 403);
            }
        }

        $count = $request->count;
        $role = $request->role;
        $description = $request->description;
        $expiresInDays = $request->expires_in_days;
        $autoExpire = $request->get('auto_expire', true);

        // Calculate expiration date
        $expiresAt = null;
        if ($autoExpire) {
            $defaultExpiry = [
                'landlord' => 30,   // 30 days for landlords
                'resident' => 7,    // 7 days for residents
                'security' => 14    // 14 days for security
            ];
            $days = $expiresInDays ?? $defaultExpiry[$role];
            $expiresAt = now()->addDays($days);
        }

        $generatedCodes = [];
        
        try {
            DB::beginTransaction();

            for ($i = 0; $i < $count; $i++) {
                // Generate unique code
                do {
                    $code = $this->generateUniqueCode($role);
                } while (RegistrationCode::where('code', $code)->exists());

                $registrationCode = RegistrationCode::create([
                    'code' => $code,
                    'role' => $role,
                    'status' => 'active',
                    'description' => $description,
                    'expires_at' => $expiresAt,
                    'created_by' => $currentUser->id
                ]);

                $generatedCodes[] = [
                    'id' => $registrationCode->id,
                    'code' => $registrationCode->code,
                    'role' => $registrationCode->role,
                    'expires_at' => $registrationCode->expires_at,
                    'description' => $registrationCode->description
                ];
            }

            DB::commit();

            // Log code generation
            Log::logAdmin('REGISTRATION_CODES_GENERATED', $currentUser->id, null, [
                'role' => $role,
                'count' => $count,
                'expires_at' => $expiresAt,
                'description' => $description
            ]);

            return response()->json([
                'success' => true,
                'message' => "{$count} registration code(s) generated successfully",
                'data' => [
                    'codes' => $generatedCodes,
                    'generation_info' => [
                        'role' => $role,
                        'count' => $count,
                        'expires_at' => $expiresAt,
                        'description' => $description,
                        'generated_by' => $currentUser->full_name
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate registration codes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified registration code
     * GET /api/registration-codes/{id}
     * Access: Super Admin, Landlord (own codes)
     */
    public function show(Request $request, $id)
    {
        $currentUser = $request->user();
        $code = RegistrationCode::with([
            'createdBy:id,full_name,role,phone',
            'usedBy:id,full_name,phone,email,created_at'
        ])->find($id);

        if (!$code) {
            return response()->json([
                'success' => false,
                'message' => 'Registration code not found'
            ], 404);
        }

        // Check access permissions
        if (!$currentUser->isSuper() && $code->created_by !== $currentUser->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only view registration codes you created'
            ], 403);
        }

        // Log the access
        Log::logAccess('REGISTRATION_CODE_VIEWED', $currentUser->id, [
            'code_id' => $code->id,
            'code' => $code->code,
            'code_status' => $code->status
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'code' => [
                    'id' => $code->id,
                    'code' => $code->code,
                    'role' => $code->role,
                    'status' => $code->status,
                    'description' => $code->description,
                    'expires_at' => $code->expires_at,
                    'created_at' => $code->created_at,
                    'used_at' => $code->used_at,
                    'created_by' => $code->createdBy ? [
                        'id' => $code->createdBy->id,
                        'full_name' => $code->createdBy->full_name,
                        'role' => $code->createdBy->role,
                        'phone' => $code->createdBy->phone
                    ] : null,
                    'used_by' => $code->usedBy ? [
                        'id' => $code->usedBy->id,
                        'full_name' => $code->usedBy->full_name,
                        'phone' => $code->usedBy->phone,
                        'email' => $code->usedBy->email,
                        'registered_at' => $code->usedBy->created_at
                    ] : null,
                    'is_expired' => $code->expires_at && $code->expires_at->isPast(),
                    'is_available' => $code->status === 'active' && (!$code->expires_at || $code->expires_at->isFuture()),
                    'days_until_expiry' => $code->expires_at ? now()->diffInDays($code->expires_at, false) : null
                ]
            ]
        ]);
    }

    /**
     * Deactivate registration code
     * PUT /api/registration-codes/{id}/deactivate
     * Access: Super Admin, Creator of the code
     */
    public function deactivate(Request $request, $id)
    {
        $currentUser = $request->user();
        $code = RegistrationCode::find($id);

        if (!$code) {
            return response()->json([
                'success' => false,
                'message' => 'Registration code not found'
            ], 404);
        }

        // Check permissions
        if (!$currentUser->isSuper() && $code->created_by !== $currentUser->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only deactivate registration codes you created'
            ], 403);
        }

        if ($code->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Registration code is not active'
            ], 422);
        }

        $code->update(['status' => 'inactive']);

        // Log deactivation
        Log::logAdmin('REGISTRATION_CODE_DEACTIVATED', $currentUser->id, null, [
            'code_id' => $code->id,
            'code' => $code->code,
            'role' => $code->role
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registration code deactivated successfully',
            'data' => [
                'code' => [
                    'id' => $code->id,
                    'code' => $code->code,
                    'status' => $code->status
                ]
            ]
        ]);
    }

    /**
     * Bulk deactivate registration codes
     * PUT /api/registration-codes/bulk-deactivate
     * Access: Super Admin, Landlord (own codes)
     */
    public function bulkDeactivate(Request $request)
    {
        $currentUser = $request->user();
        
        $validator = Validator::make($request->all(), [
            'code_ids' => 'required|array|min:1|max:50',
            'code_ids.*' => 'integer|exists:registration_codes,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $codeIds = $request->code_ids;
        
        // Build query with permissions
        $query = RegistrationCode::whereIn('id', $codeIds)->where('status', 'active');
        
        if (!$currentUser->isSuper()) {
            $query->where('created_by', $currentUser->id);
        }

        $codes = $query->get();

        if ($codes->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No valid active codes found for deactivation'
            ], 422);
        }

        $deactivatedCount = 0;
        $deactivatedCodes = [];

        try {
            DB::beginTransaction();

            foreach ($codes as $code) {
                $code->update(['status' => 'inactive']);
                $deactivatedCount++;
                $deactivatedCodes[] = [
                    'id' => $code->id,
                    'code' => $code->code,
                    'role' => $code->role
                ];
            }

            DB::commit();

            // Log bulk deactivation
            Log::logAdmin('REGISTRATION_CODES_BULK_DEACTIVATED', $currentUser->id, null, [
                'deactivated_count' => $deactivatedCount,
                'code_ids' => $codes->pluck('id')->toArray()
            ]);

            return response()->json([
                'success' => true,
                'message' => "{$deactivatedCount} registration code(s) deactivated successfully",
                'data' => [
                    'deactivated_count' => $deactivatedCount,
                    'deactivated_codes' => $deactivatedCodes
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to deactivate registration codes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clean up expired codes
     * POST /api/registration-codes/cleanup-expired
     * Access: Super Admin only
     */
    public function cleanupExpired(Request $request)
    {
        $expiredCodes = RegistrationCode::where('status', 'active')
                                      ->where('expires_at', '<', now())
                                      ->get();

        if ($expiredCodes->isEmpty()) {
            return response()->json([
                'success' => true,
                'message' => 'No expired codes found',
                'data' => ['cleanup_count' => 0]
            ]);
        }

        $cleanupCount = $expiredCodes->count();
        
        RegistrationCode::where('status', 'active')
                       ->where('expires_at', '<', now())
                       ->update(['status' => 'expired']);

        // Log cleanup
        Log::logAdmin('REGISTRATION_CODES_CLEANUP', $request->user()->id, null, [
            'cleanup_count' => $cleanupCount,
            'expired_code_ids' => $expiredCodes->pluck('id')->toArray()
        ]);

        return response()->json([
            'success' => true,
            'message' => "{$cleanupCount} expired registration code(s) cleaned up successfully",
            'data' => [
                'cleanup_count' => $cleanupCount
            ]
        ]);
    }

    /**
     * Generate a unique registration code
     */
    private function generateUniqueCode($role)
    {
        $prefix = [
            'landlord' => 'LL',
            'resident' => 'RS',
            'security' => 'SG'
        ];

        $rolePrefix = $prefix[$role] ?? 'GN';
        $randomString = strtoupper(Str::random(6));
        
        return $rolePrefix . '-' . $randomString;
    }

    /**
     * Get registration code statistics
     * GET /api/registration-codes/statistics
     * Access: Super Admin, Landlord (own codes stats)
     */
    public function statistics(Request $request)
    {
        $currentUser = $request->user();
        
        // Base query with role filtering
        $baseQuery = RegistrationCode::query();
        
        if (!$currentUser->isSuper()) {
            $baseQuery->where('created_by', $currentUser->id);
        }

        $stats = [
            'total_codes' => (clone $baseQuery)->count(),
            'active_codes' => (clone $baseQuery)->where('status', 'active')->count(),
            'used_codes' => (clone $baseQuery)->where('status', 'used')->count(),
            'inactive_codes' => (clone $baseQuery)->where('status', 'inactive')->count(),
            'expired_codes' => (clone $baseQuery)->where('status', 'active')->where('expires_at', '<', now())->count(),
            'by_role' => [
                'landlord' => (clone $baseQuery)->where('role', 'landlord')->count(),
                'resident' => (clone $baseQuery)->where('role', 'resident')->count(),
                'security' => (clone $baseQuery)->where('role', 'security')->count()
            ],
            'recent_activity' => [
                'generated_today' => (clone $baseQuery)->whereDate('created_at', today())->count(),
                'used_today' => (clone $baseQuery)->whereDate('used_at', today())->count(),
                'generated_this_week' => (clone $baseQuery)->where('created_at', '>=', now()->startOfWeek())->count(),
                'used_this_week' => (clone $baseQuery)->where('used_at', '>=', now()->startOfWeek())->count()
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'statistics' => $stats,
                'generated_at' => now()->toISOString()
            ]
        ]);
    }
}