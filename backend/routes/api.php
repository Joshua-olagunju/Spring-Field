<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RegistrationOtpController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\VisitorTokenController;

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
    });
});
