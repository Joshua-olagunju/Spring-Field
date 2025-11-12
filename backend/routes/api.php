<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RegistrationOtpController;
use App\Http\Controllers\Api\EmailVerificationController;

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
    
    // OTP Management routes
    Route::prefix('otp')->group(function () {
        // Super Admin: Generate OTP for landlords
        Route::post('/generate-landlord', [RegistrationOtpController::class, 'generateLandlordOtp']);
        
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
    // Route::apiResource('visitor-tokens', VisitorTokenController::class);
});
