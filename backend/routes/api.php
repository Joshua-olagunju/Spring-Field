<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HouseController;
use App\Http\Controllers\Api\RegistrationCodeController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'OK',
        'message' => 'Springfield Estate API is running',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0-MVP'
    ]);
});

/*
|--------------------------------------------------------------------------
| Authentication Routes (Public)
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    // Registration routes
    Route::post('/verify-code', [AuthController::class, 'verifyRegistrationCode']);
    Route::post('/register', [AuthController::class, 'completeRegistration']);
    
    // Login route
    Route::post('/login', [AuthController::class, 'login']);
});

/*
|--------------------------------------------------------------------------
| Protected Routes (Require Authentication)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // User profile routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    
    // Authentication management
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/logout-all', [AuthController::class, 'logoutAll']);
    
    /*
    |--------------------------------------------------------------------------
    | User Management Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:super,landlord')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::put('/users/{id}/status', [UserController::class, 'toggleStatus']);
    });
    
    // User can view their own profile (additional to the above)
    Route::get('/users/{id}', [UserController::class, 'show'])
         ->middleware('role:super,landlord,resident,security');
    
    /*
    |--------------------------------------------------------------------------
    | House Management Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:super,landlord,resident')->group(function () {
        Route::get('/houses', [HouseController::class, 'index']);
        Route::get('/houses/{id}', [HouseController::class, 'show']);
        Route::get('/houses/available/list', [HouseController::class, 'available']);
    });
    
    Route::middleware('role:super')->group(function () {
        Route::post('/houses', [HouseController::class, 'store']);
        Route::delete('/houses/{id}', [HouseController::class, 'destroy']);
    });
    
    Route::middleware('role:super,landlord')->group(function () {
        Route::put('/houses/{id}', [HouseController::class, 'update']);
        Route::put('/houses/{id}/status', [HouseController::class, 'updateStatus']);
    });
    
    /*
    |--------------------------------------------------------------------------
    | Registration Code Management Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:super,landlord')->group(function () {
        Route::get('/registration-codes', [RegistrationCodeController::class, 'index']);
        Route::get('/registration-codes/statistics', [RegistrationCodeController::class, 'statistics']);
        Route::post('/registration-codes/generate', [RegistrationCodeController::class, 'generate']);
        Route::get('/registration-codes/{id}', [RegistrationCodeController::class, 'show']);
        Route::put('/registration-codes/{id}/deactivate', [RegistrationCodeController::class, 'deactivate']);
        Route::put('/registration-codes/bulk-deactivate', [RegistrationCodeController::class, 'bulkDeactivate']);
    });
    
    Route::middleware('role:super')->group(function () {
        Route::post('/registration-codes/cleanup-expired', [RegistrationCodeController::class, 'cleanupExpired']);
    });
    
    // Role-based route groups will be added here
    // Visitor Token routes
    // Visitor Entry routes  
    // Payment routes
    // Audit Log routes
});
