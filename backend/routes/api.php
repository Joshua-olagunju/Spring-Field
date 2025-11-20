<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RegistrationOtpController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\VisitorTokenController;
use App\Http\Controllers\Api\ReportsController;

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

// Public authentication routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// For backward compatibility with your frontend
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public email verification routes (before user is logged in)
Route::prefix('email-verification')->group(function () {
    Route::post('/send-otp', [EmailVerificationController::class, 'sendVerificationOtp']);
    Route::post('/verify', [EmailVerificationController::class, 'verifyEmail']);
    Route::post('/resend-otp', [EmailVerificationController::class, 'resendVerificationOtp']);
    Route::post('/check-status', [EmailVerificationController::class, 'checkVerificationStatus']);
});

// Public OTP validation (for frontend to check before registration)
Route::post('/validate-otp', [RegistrationOtpController::class, 'validateOtp']);

// Public endpoint to check super admin count (for signup flow)
Route::get('/super-admin-count', [AuthController::class, 'getSuperAdminCount']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
    
    // User routes
    Route::get('/user', [AuthController::class, 'me']);
    
    // Admin Dashboard routes
    Route::prefix('admin')->group(function () {
        Route::post('/generate-user-token', [RegistrationOtpController::class, 'generateUserOtp']);
    });
    
    // Reports routes (Super Admin only)
    Route::prefix('reports')->middleware('superadmin')->group(function () {
        Route::get('/statistics', [ReportsController::class, 'getStatistics']);
        Route::get('/user-analytics', [ReportsController::class, 'getUserAnalytics']);
        Route::get('/visitor-analytics', [ReportsController::class, 'getVisitorAnalytics']);
    });
    
    // Super Admin Dashboard routes
    Route::prefix('super-admin')->group(function () {
        Route::get('/landlords', [AuthController::class, 'getLandlords']);
        Route::get('/landlord-users/{landlordId}', [AuthController::class, 'getLandlordUsers']);
        Route::post('/generate-user-token-for-landlord', [RegistrationOtpController::class, 'generateTokenForLandlord']);
        Route::patch('/users/{userId}/deactivate', [AuthController::class, 'deactivateUser']);
        Route::patch('/users/{userId}/activate', [AuthController::class, 'activateUser']);
        Route::delete('/users/{userId}', [AuthController::class, 'deleteUser']);
    });
    
    // Landlord Dashboard routes
    Route::prefix('landlord')->group(function () {
        Route::get('/users', [AuthController::class, 'getLandlordUsers']);
        Route::get('/payment-stats', [AuthController::class, 'getPaymentStats']);
        Route::patch('/users/{userId}/deactivate', [AuthController::class, 'deactivateUser']);
        Route::patch('/users/{userId}/activate', [AuthController::class, 'activateUser']);
        Route::delete('/users/{userId}', [AuthController::class, 'deleteUser']);
    });
    
    // OTP Management routes
    Route::prefix('otp')->group(function () {
        // Super Admin: Generate OTP for landlords
        Route::post('/generate-landlord', [RegistrationOtpController::class, 'generateLandlordOtp']);
        
        // Super Admin: Generate OTP for security personnel
        Route::post('/generate-security', [RegistrationOtpController::class, 'generateSecurityOtp']);
        
        // Landlord: Generate OTP for residents
        Route::post('/generate-resident', [RegistrationOtpController::class, 'generateResidentOtp']);
        
        // Get user's generated OTPs
        Route::get('/my-otps', [RegistrationOtpController::class, 'getUserOtps']);
        
        // Deactivate an OTP
        Route::post('/{otpId}/deactivate', [RegistrationOtpController::class, 'deactivateOtp']);
    });
    
    // TODO: Add other protected routes here
    // Route::apiResource('houses', HouseController::class);
    // Route::apiResource('payments', PaymentController::class);
    
    // Visitor Token Management routes
    Route::prefix('visitor-tokens')->group(function () {
        // Generate new visitor token (residents/admins)
        Route::post('/generate', [VisitorTokenController::class, 'generateToken']);
        
        // Verify token (security personnel)
        Route::post('/verify', [VisitorTokenController::class, 'verifyToken']);
        
        // Grant entry to visitor (security personnel)
        Route::post('/grant-entry', [VisitorTokenController::class, 'grantEntry']);
        
        // Exit visitor (security personnel)
        Route::post('/exit-visitor', [VisitorTokenController::class, 'exitVisitor']);
        
        // Checkout visitor by token (security personnel)
        Route::post('/checkout', [VisitorTokenController::class, 'checkoutByToken']);
        
        // Get user's tokens (residents/admins)
        Route::get('/my-tokens', [VisitorTokenController::class, 'getUserTokens']);
        
        // Get user's visitor entries (their visitors only)
        Route::get('/my-entries', [VisitorTokenController::class, 'getUserEntries']);
        
        // Get all entries for security dashboard (security personnel/admins)
        Route::get('/all-entries', [VisitorTokenController::class, 'getAllEntries']);
        
        // Get active entries (currently on premises)
        Route::get('/active-entries', [VisitorTokenController::class, 'getActiveEntries']);
        
        // Test token expiration (for debugging)
        Route::post('/test-expiration', [VisitorTokenController::class, 'testTokenExpiration']);
        
        // Get expired tokens (for monitoring)
        Route::get('/expired', [VisitorTokenController::class, 'getExpiredTokens']);
        
        // Clear expired temp tokens (security cleanup)
        Route::post('/clear-expired-temps', [VisitorTokenController::class, 'clearExpiredTempTokens']);
        
        // Get admin dashboard statistics
        Route::get('/admin-dashboard-stats', [VisitorTokenController::class, 'getAdminDashboardStats']);
        
        // Get user/resident dashboard statistics
        Route::get('/user-dashboard-stats', [VisitorTokenController::class, 'getUserDashboardStats']);
        
        // Get super admin dashboard statistics
        Route::get('/super-admin-dashboard-stats', [VisitorTokenController::class, 'getSuperAdminDashboardStats']);
        
        // Get recent visitors (role-based)
        Route::get('/recent-visitors', [VisitorTokenController::class, 'getRecentVisitors']);
    });
    
    // Security Dashboard routes
    Route::prefix('security')->group(function () {
        // Get all users for security personnel view
        Route::get('/all-users', [AuthController::class, 'getAllUsersForSecurity']);
    });
    
    // Settings routes - Available to all authenticated users
    Route::prefix('settings')->group(function () {
        Route::get('/profile', [App\Http\Controllers\Api\SettingsController::class, 'getProfile']);
        Route::post('/profile', [App\Http\Controllers\Api\SettingsController::class, 'updateProfile']);
        Route::post('/change-password', [App\Http\Controllers\Api\SettingsController::class, 'changePassword']);
        Route::post('/theme', [App\Http\Controllers\Api\SettingsController::class, 'updateTheme']);
        Route::get('/summary', [App\Http\Controllers\Api\SettingsController::class, 'getSettings']);
        Route::post('/last-login', [App\Http\Controllers\Api\SettingsController::class, 'updateLastLogin']);
    });
});

// Test endpoint (no auth required)
Route::get('/test-dashboard-stats', [VisitorTokenController::class, 'getTestDashboardStats']);

// Test endpoint for security users (no auth required for testing)
Route::get('/test-security-users', [AuthController::class, 'getAllUsersForSecurity']);

// Test endpoint to check actual user table structure
Route::get('/test-user-fields', function() {
    try {
        $user = App\Models\User::first();
        if ($user) {
            return response()->json([
                'success' => true,
                'user_attributes' => $user->getAttributes(),
                'fillable_fields' => $user->getFillable()
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'No users found',
                'total_users' => App\Models\User::count()
            ]);
        }
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
});

// Test reports API (no auth required for testing) - REMOVE IN PRODUCTION
Route::get('/test-reports-statistics', [ReportsController::class, 'getStatistics']);

// Test settings API (no auth required for testing)
Route::get('/test-settings-profile', function() {
    try {
        $user = App\Models\User::first(); // Get first user for testing
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No users found'
            ]);
        }
        
        // Simulate the SettingsController getProfile method
        $firstName = $user->first_name;
        $lastName = $user->last_name;
        
        if (!$firstName && !$lastName && $user->full_name) {
            $nameParts = explode(' ', $user->full_name, 2);
            $firstName = $nameParts[0] ?? '';
            $lastName = $nameParts[1] ?? '';
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'role' => $user->role,
                'theme_preference' => $user->theme_preference ?? 'light',
                'created_at' => $user->created_at,
                'last_login_at' => $user->last_login_at
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
});
