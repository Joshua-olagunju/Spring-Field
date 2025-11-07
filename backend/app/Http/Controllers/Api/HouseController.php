<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\House;
use App\Models\Log;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HouseController extends Controller
{
    /**
     * Display a listing of houses
     * GET /api/houses
     * Access: Super Admin, Landlord (own houses)
     */
    public function index(Request $request)
    {
        $currentUser = $request->user();
        
        // Build query based on user role
        $query = House::with(['landlord:id,full_name,phone', 'residents:id,full_name,phone,status_active']);

        // Role-based filtering
        if ($currentUser->isLandlord()) {
            // Landlords can only see their own houses
            $query->where('landlord_id', $currentUser->id);
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

        if ($request->filled('landlord_id') && $currentUser->isSuper()) {
            $query->where('landlord_id', $request->landlord_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('house_number', 'LIKE', "%{$search}%")
                  ->orWhere('address', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'house_number');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $houses = $query->paginate($perPage);

        // Log the access
        Log::logAccess('HOUSES_LIST_ACCESSED', $currentUser->id, [
            'filters' => $request->only(['status', 'landlord_id', 'search']),
            'total_results' => $houses->total()
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'houses' => collect($houses->items())->map(function ($house) {
                    return [
                        'id' => $house->id,
                        'house_number' => $house->house_number,
                        'address' => $house->address,
                        'description' => $house->description,
                        'rent_amount' => $house->rent_amount,
                        'status' => $house->status,
                        'created_at' => $house->created_at,
                        'landlord' => $house->landlord ? [
                            'id' => $house->landlord->id,
                            'full_name' => $house->landlord->full_name,
                            'phone' => $house->landlord->phone
                        ] : null,
                        'residents' => $house->residents->map(function ($resident) {
                            return [
                                'id' => $resident->id,
                                'full_name' => $resident->full_name,
                                'phone' => $resident->phone,
                                'status_active' => $resident->status_active
                            ];
                        }),
                        'residents_count' => $house->residents->count(),
                        'active_residents_count' => $house->residents->where('status_active', true)->count()
                    ];
                }),
                'pagination' => [
                    'current_page' => $houses->currentPage(),
                    'last_page' => $houses->lastPage(),
                    'per_page' => $houses->perPage(),
                    'total' => $houses->total()
                ]
            ]
        ]);
    }

    /**
     * Store a newly created house
     * POST /api/houses
     * Access: Super Admin only
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'house_number' => 'required|string|max:20|unique:houses,house_number',
            'address' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'rent_amount' => 'required|numeric|min:0',
            'landlord_id' => 'required|integer|exists:users,id',
            'status' => 'in:available,occupied,maintenance,unavailable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify landlord role
        $landlord = User::find($request->landlord_id);
        if (!$landlord || !$landlord->isLandlord()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid landlord. User must have landlord role.'
            ], 422);
        }

        // Create the house
        $house = House::create([
            'house_number' => $request->house_number,
            'address' => $request->address,
            'description' => $request->description,
            'rent_amount' => $request->rent_amount,
            'landlord_id' => $request->landlord_id,
            'status' => $request->get('status', 'available'),
        ]);

        // Log house creation
        Log::logAdmin('HOUSE_CREATED', $request->user()->id, null, [
            'house_id' => $house->id,
            'house_number' => $house->house_number,
            'landlord_id' => $house->landlord_id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'House created successfully',
            'data' => [
                'house' => [
                    'id' => $house->id,
                    'house_number' => $house->house_number,
                    'address' => $house->address,
                    'description' => $house->description,
                    'rent_amount' => $house->rent_amount,
                    'status' => $house->status,
                    'landlord_id' => $house->landlord_id
                ]
            ]
        ], 201);
    }

    /**
     * Display the specified house
     * GET /api/houses/{id}
     * Access: Super Admin, Landlord (own house), Residents (own house)
     */
    public function show(Request $request, $id)
    {
        $currentUser = $request->user();
        $house = House::with([
            'landlord:id,full_name,phone,email',
            'residents:id,full_name,phone,email,status_active,created_at',
            'payments' => function ($query) {
                $query->latest()->limit(10);
            }
        ])->find($id);

        if (!$house) {
            return response()->json([
                'success' => false,
                'message' => 'House not found'
            ], 404);
        }

        // Check access permissions
        if (!$currentUser->isSuper()) {
            // Landlords can view their own houses
            if ($currentUser->isLandlord() && $house->landlord_id !== $currentUser->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only view your own houses'
                ], 403);
            }
            // Residents can view their house
            elseif ($currentUser->isResident() && $currentUser->house_id !== $house->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only view your own house'
                ], 403);
            }
            // Security guards cannot view houses
            elseif ($currentUser->isSecurity()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to view house details'
                ], 403);
            }
        }

        // Log the access
        Log::logAccess('HOUSE_VIEWED', $currentUser->id, [
            'house_id' => $house->id,
            'house_number' => $house->house_number
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'house' => [
                    'id' => $house->id,
                    'house_number' => $house->house_number,
                    'address' => $house->address,
                    'description' => $house->description,
                    'rent_amount' => $house->rent_amount,
                    'status' => $house->status,
                    'created_at' => $house->created_at,
                    'landlord' => $house->landlord ? [
                        'id' => $house->landlord->id,
                        'full_name' => $house->landlord->full_name,
                        'phone' => $house->landlord->phone,
                        'email' => $house->landlord->email
                    ] : null,
                    'residents' => $house->residents->map(function ($resident) {
                        return [
                            'id' => $resident->id,
                            'full_name' => $resident->full_name,
                            'phone' => $resident->phone,
                            'email' => $resident->email,
                            'status_active' => $resident->status_active,
                            'created_at' => $resident->created_at
                        ];
                    }),
                    'recent_payments' => $house->payments->map(function ($payment) {
                        return [
                            'id' => $payment->id,
                            'amount' => $payment->amount,
                            'status' => $payment->status,
                            'period_type' => $payment->period_type,
                            'created_at' => $payment->created_at,
                            'user' => [
                                'id' => $payment->user->id,
                                'full_name' => $payment->user->full_name
                            ]
                        ];
                    }),
                    'statistics' => [
                        'total_residents' => $house->residents->count(),
                        'active_residents' => $house->residents->where('status_active', true)->count(),
                        'total_payments' => $house->payments->count(),
                        'paid_payments' => $house->payments->where('status', 'paid')->count()
                    ]
                ]
            ]
        ]);
    }

    /**
     * Update the specified house
     * PUT /api/houses/{id}
     * Access: Super Admin, Landlord (own house - limited fields)
     */
    public function update(Request $request, $id)
    {
        $currentUser = $request->user();
        $house = House::find($id);

        if (!$house) {
            return response()->json([
                'success' => false,
                'message' => 'House not found'
            ], 404);
        }

        // Check access permissions
        $canUpdateAll = $currentUser->isSuper();
        $canUpdateLimited = false;

        if (!$canUpdateAll) {
            if ($currentUser->isLandlord() && $house->landlord_id === $currentUser->id) {
                $canUpdateLimited = true;
            }

            if (!$canUpdateLimited) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to update this house'
                ], 403);
            }
        }

        // Validation rules based on permissions
        $rules = [];
        if ($canUpdateAll) {
            $rules = [
                'house_number' => 'sometimes|string|max:20|unique:houses,house_number,' . $house->id,
                'address' => 'sometimes|string|max:255',
                'description' => 'sometimes|nullable|string|max:500',
                'rent_amount' => 'sometimes|numeric|min:0',
                'landlord_id' => 'sometimes|integer|exists:users,id',
                'status' => 'sometimes|in:available,occupied,maintenance,unavailable',
            ];
        } else {
            // Limited update for landlords (can only update description and rent)
            $rules = [
                'description' => 'sometimes|nullable|string|max:500',
                'rent_amount' => 'sometimes|numeric|min:0',
                'status' => 'sometimes|in:available,occupied,maintenance',
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

        // If updating landlord, verify role
        if (isset($request->landlord_id) && $canUpdateAll) {
            $newLandlord = User::find($request->landlord_id);
            if (!$newLandlord || !$newLandlord->isLandlord()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid landlord. User must have landlord role.'
                ], 422);
            }
        }

        $oldData = $house->toArray();
        $updateData = $request->only(array_keys($rules));
        $house->update($updateData);

        // Log house update
        Log::logAdmin('HOUSE_UPDATED', $currentUser->id, null, [
            'house_id' => $house->id,
            'old_data' => $oldData,
            'new_data' => $house->fresh()->toArray(),
            'updated_by_role' => $currentUser->role
        ]);

        return response()->json([
            'success' => true,
            'message' => 'House updated successfully',
            'data' => [
                'house' => [
                    'id' => $house->id,
                    'house_number' => $house->house_number,
                    'address' => $house->address,
                    'description' => $house->description,
                    'rent_amount' => $house->rent_amount,
                    'status' => $house->status,
                    'landlord_id' => $house->landlord_id
                ]
            ]
        ]);
    }

    /**
     * Delete the specified house (Super Admin only)
     * DELETE /api/houses/{id}
     * Access: Super Admin only
     */
    public function destroy(Request $request, $id)
    {
        $house = House::with(['residents'])->find($id);

        if (!$house) {
            return response()->json([
                'success' => false,
                'message' => 'House not found'
            ], 404);
        }

        // Check if house has active residents
        $activeResidents = $house->residents->where('status_active', true);
        if ($activeResidents->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete house with active residents. Please relocate or deactivate residents first.',
                'data' => [
                    'active_residents_count' => $activeResidents->count(),
                    'active_residents' => $activeResidents->map(function ($resident) {
                        return [
                            'id' => $resident->id,
                            'full_name' => $resident->full_name,
                            'phone' => $resident->phone
                        ];
                    })
                ]
            ], 422);
        }

        // Log house deletion before deleting
        Log::logAdmin('HOUSE_DELETED', $request->user()->id, null, [
            'deleted_house_data' => $house->toArray()
        ]);

        $house->delete();

        return response()->json([
            'success' => true,
            'message' => 'House deleted successfully'
        ]);
    }

    /**
     * Get houses available for assignment
     * GET /api/houses/available
     * Access: Super Admin, Landlord (own houses)
     */
    public function available(Request $request)
    {
        $currentUser = $request->user();
        
        $query = House::where('status', 'available')
                     ->with(['landlord:id,full_name']);

        // Role-based filtering
        if ($currentUser->isLandlord()) {
            $query->where('landlord_id', $currentUser->id);
        } elseif (!$currentUser->isSuper()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to access this resource'
            ], 403);
        }

        $houses = $query->orderBy('house_number')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'houses' => $houses->map(function ($house) {
                    return [
                        'id' => $house->id,
                        'house_number' => $house->house_number,
                        'address' => $house->address,
                        'rent_amount' => $house->rent_amount,
                        'landlord' => [
                            'id' => $house->landlord->id,
                            'full_name' => $house->landlord->full_name
                        ]
                    ];
                })
            ]
        ]);
    }

    /**
     * Update house status
     * PUT /api/houses/{id}/status
     * Access: Super Admin, Landlord (own house)
     */
    public function updateStatus(Request $request, $id)
    {
        $currentUser = $request->user();
        $house = House::find($id);

        if (!$house) {
            return response()->json([
                'success' => false,
                'message' => 'House not found'
            ], 404);
        }

        // Check permissions
        if (!$currentUser->isSuper() && !($currentUser->isLandlord() && $house->landlord_id === $currentUser->id)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to update this house status'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:available,occupied,maintenance,unavailable'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $oldStatus = $house->status;
        $house->update(['status' => $request->status]);

        // Log status change
        Log::logAdmin('HOUSE_STATUS_CHANGED', $currentUser->id, null, [
            'house_id' => $house->id,
            'old_status' => $oldStatus,
            'new_status' => $house->status
        ]);

        return response()->json([
            'success' => true,
            'message' => 'House status updated successfully',
            'data' => [
                'house' => [
                    'id' => $house->id,
                    'house_number' => $house->house_number,
                    'status' => $house->status
                ]
            ]
        ]);
    }
}