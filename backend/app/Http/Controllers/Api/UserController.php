<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Log;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users
     * GET /api/users
     * Access: Super Admin, Admin (Landlord)
     */
    public function index(Request $request)
    {
        $currentUser = $request->user();
        
        // Build query based on user role
        $query = User::with(['house.landlord']);

        // Role-based filtering
        if ($currentUser->role === 'landlord') {
            // Landlords can only see residents in their houses
            $houseIds = $currentUser->ownedHouses()->pluck('id');
            $query->whereIn('house_id', $houseIds)
                  ->where('role', 'resident');
        } elseif (!$currentUser->isSuper()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to access this resource'
            ], 403);
        }

        // Apply filters
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('status')) {
            $query->where('status_active', $request->status === 'active');
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'LIKE', "%{$search}%")
                  ->orWhere('phone', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $users = $query->paginate($perPage);

        // Log the access
        Log::logAccess('USERS_LIST_ACCESSED', $currentUser->id, [
            'filters' => $request->only(['role', 'status', 'search']),
            'total_results' => $users->total()
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'users' => collect($users->items())->map(function ($userItem) {
                    return [
                        'id' => $userItem->id,
                        'full_name' => $userItem->full_name,
                        'phone' => $userItem->phone,
                        'email' => $userItem->email,
                        'role' => $userItem->role,
                        'status_active' => $userItem->status_active,
                        'created_at' => $userItem->created_at,
                        'house' => $userItem->house ? [
                            'id' => $userItem->house->id,
                            'house_number' => $userItem->house->house_number,
                            'address' => $userItem->house->address,
                            'landlord' => $userItem->house->landlord ? [
                                'full_name' => $userItem->house->landlord->full_name,
                                'phone' => $userItem->house->landlord->phone
                            ] : null
                        ] : null
                    ];
                }),
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total()
                ]
            ]
        ]);
    }

    /**
     * Create a new user (Super Admin only)
     * POST /api/users
     * Access: Super Admin only
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:150',
            'phone' => 'required|string|max:20|unique:users,phone',
            'email' => 'nullable|email|max:100|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => ['required', Rule::in(['super', 'landlord', 'resident', 'security'])],
            'house_id' => 'nullable|integer|exists:houses,id',
            'status_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create the user
        $user = User::create([
            'full_name' => $request->full_name,
            'phone' => $request->phone,
            'email' => $request->email,
            'password_hash' => Hash::make($request->password),
            'role' => $request->role,
            'house_id' => $request->house_id,
            'status_active' => $request->get('status_active', true),
        ]);

        // Log user creation
        Log::logAdmin('USER_CREATED', $request->user()->id, $user->id, [
            'created_user_role' => $user->role,
            'created_user_house_id' => $user->house_id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'phone' => $user->phone,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status_active' => $user->status_active,
                    'house_id' => $user->house_id
                ]
            ]
        ], 201);
    }

    /**
     * Display the specified user
     * GET /api/users/{id}
     * Access: Super Admin, Admin (own residents), Users (own profile)
     */
    public function show(Request $request, $id)
    {
        $currentUser = $request->user();
        $user = User::with(['house.landlord', 'payments' => function ($query) {
            $query->latest()->limit(5);
        }])->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Check access permissions
        if (!$currentUser->isSuper()) {
            // Landlords can view their residents
            if ($currentUser->isLandlord()) {
                $houseIds = $currentUser->ownedHouses()->pluck('id');
                if (!$houseIds->contains($user->house_id)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You can only view residents in your houses'
                    ], 403);
                }
            }
            // Users can view their own profile
            elseif ($currentUser->id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only view your own profile'
                ], 403);
            }
        }

        // Log the access
        Log::logAccess('USER_PROFILE_VIEWED', $currentUser->id, [
            'viewed_user_id' => $user->id,
            'viewed_user_role' => $user->role
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'phone' => $user->phone,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status_active' => $user->status_active,
                    'created_at' => $user->created_at,
                    'house' => $user->house ? [
                        'id' => $user->house->id,
                        'house_number' => $user->house->house_number,
                        'address' => $user->house->address,
                        'landlord' => $user->house->landlord ? [
                            'full_name' => $user->house->landlord->full_name,
                            'phone' => $user->house->landlord->phone
                        ] : null
                    ] : null,
                    'recent_payments' => $user->payments->map(function ($payment) {
                        return [
                            'id' => $payment->id,
                            'amount' => $payment->amount,
                            'status' => $payment->status,
                            'period_type' => $payment->period_type,
                            'created_at' => $payment->created_at
                        ];
                    })
                ]
            ]
        ]);
    }

    /**
     * Update the specified user
     * PUT /api/users/{id}
     * Access: Super Admin, Admin (own residents), Users (own profile - limited)
     */
    public function update(Request $request, $id)
    {
        $currentUser = $request->user();
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Check access permissions
        $canUpdateAll = $currentUser->isSuper();
        $canUpdateLimited = false;

        if (!$canUpdateAll) {
            // Landlords can update their residents (limited fields)
            if ($currentUser->isLandlord()) {
                $houseIds = $currentUser->ownedHouses()->pluck('id');
                $canUpdateLimited = $houseIds->contains($user->house_id);
            }
            // Users can update their own profile (limited fields)
            elseif ($currentUser->id === $user->id) {
                $canUpdateLimited = true;
            }

            if (!$canUpdateLimited) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to update this user'
                ], 403);
            }
        }

        // Validation rules based on permissions
        $rules = [];
        if ($canUpdateAll) {
            $rules = [
                'full_name' => 'sometimes|string|max:150',
                'phone' => 'sometimes|string|max:20|unique:users,phone,' . $user->id,
                'email' => 'sometimes|nullable|email|max:100|unique:users,email,' . $user->id,
                'role' => ['sometimes', Rule::in(['super', 'landlord', 'resident', 'security'])],
                'house_id' => 'sometimes|nullable|integer|exists:houses,id',
                'status_active' => 'sometimes|boolean',
            ];
        } else {
            // Limited update for non-super users
            $rules = [
                'full_name' => 'sometimes|string|max:150',
                'email' => 'sometimes|nullable|email|max:100|unique:users,email,' . $user->id,
            ];
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $oldData = $user->toArray();
        $updateData = $request->only(array_keys($rules));
        
        // Hash password if provided
        if (isset($updateData['password'])) {
            $updateData['password_hash'] = Hash::make($updateData['password']);
            unset($updateData['password']);
        }

        $user->update($updateData);

        // Log user update
        Log::logAdmin('USER_UPDATED', $currentUser->id, $user->id, [
            'old_data' => $oldData,
            'new_data' => $user->fresh()->toArray(),
            'updated_by_role' => $currentUser->role
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'phone' => $user->phone,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status_active' => $user->status_active,
                    'house_id' => $user->house_id
                ]
            ]
        ]);
    }

    /**
     * Toggle user status (activate/deactivate)
     * PUT /api/users/{id}/status
     * Access: Super Admin, Admin (own residents)
     */
    public function toggleStatus(Request $request, $id)
    {
        $currentUser = $request->user();
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Check permissions
        if (!$currentUser->isSuper()) {
            if ($currentUser->isLandlord()) {
                $houseIds = $currentUser->ownedHouses()->pluck('id');
                if (!$houseIds->contains($user->house_id)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You can only manage residents in your houses'
                    ], 403);
                }
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to perform this action'
                ], 403);
            }
        }

        // Prevent deactivating self
        if ($user->id === $currentUser->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot deactivate your own account'
            ], 422);
        }

        $oldStatus = $user->status_active;
        $user->update(['status_active' => !$user->status_active]);

        // Log status change
        Log::logAdmin('USER_STATUS_CHANGED', $currentUser->id, $user->id, [
            'old_status' => $oldStatus,
            'new_status' => $user->status_active
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'status_active' => $user->status_active
                ]
            ]
        ]);
    }

    /**
     * Delete user (Super Admin only)
     * DELETE /api/users/{id}
     * Access: Super Admin only
     */
    public function destroy(Request $request, $id)
    {
        $currentUser = $request->user();
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Prevent self-deletion
        if ($user->id === $currentUser->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account'
            ], 422);
        }

        // Log user deletion before deleting
        Log::logAdmin('USER_DELETED', $currentUser->id, $user->id, [
            'deleted_user_data' => $user->toArray()
        ]);

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }
}
