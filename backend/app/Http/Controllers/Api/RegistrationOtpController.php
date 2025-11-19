<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Models\RegistrationOtp;
use App\Models\User;
use App\Models\House;
use App\Models\Log as AuditLog;
use App\Mail\OtpCodeMail;
use Illuminate\Support\Facades\Mail;

class RegistrationOtpController extends Controller
{
    /**
     * Generate OTP for user registration (Admin/Landlord)
     * Simpler version without house requirements
     */
    public function generateUserOtp(Request $request)
    {
        try {
            // Check if user is landlord (only landlords can generate user OTPs)
            if (!$request->user()->isLandlord()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only landlords can generate user tokens.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'recipient_email' => 'required|email',
                'recipient_name' => 'required|string|max:255',
                'expires_in_hours' => 'nullable|integer|min:1|max:168',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $expiresInHours = $request->input('expires_in_hours', 72); // Default 3 days

            // Get landlord's first house to pre-fill for the resident
            $landlord = $request->user();
            $landlordHouse = $landlord->ownedHouses()->first();

            // Create OTP with landlord's house info (to be prefilled for resident)
            $otp = RegistrationOtp::create([
                'otp_code' => RegistrationOtp::generateOtpCode(),
                'generated_by' => $landlord->id,
                'target_role' => RegistrationOtp::TARGET_RESIDENT,
                'house_id' => $landlordHouse ? $landlordHouse->id : null,
                'house_number' => $landlordHouse ? $landlordHouse->house_number : null,
                'address' => $landlordHouse ? $landlordHouse->address : null,
                'expires_at' => \Carbon\Carbon::now()->addHours($expiresInHours),
            ]);

            // Update metadata with recipient info and admin metadata
            $metadata = [
                'recipient_email' => $request->recipient_email,
                'recipient_name' => $request->recipient_name,
                'generated_by_role' => $landlord->role,
                'generated_by_name' => $landlord->full_name,
                'admin_house_number' => $landlordHouse ? $landlordHouse->house_number : null,
                'admin_address' => $landlordHouse ? $landlordHouse->address : null,
                'admin_house_type' => $landlordHouse ? $landlordHouse->house_type : null,
            ];
            $otp->update(['metadata' => $metadata]);

            return response()->json([
                'success' => true,
                'message' => 'User token generated successfully',
                'data' => [
                    'otp_code' => $otp->otp_code,
                    'target_role' => $otp->target_role,
                    'expires_at' => $otp->expires_at,
                    'generated_by' => $landlord->full_name,
                    'recipient_email' => $request->recipient_email,
                    'recipient_name' => $request->recipient_name,
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate user token',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate OTP for landlord registration (Super Admin only)
     */
    public function generateLandlordOtp(Request $request)
    {
        try {
            // Check if user is super admin
            if (!$request->user()->isSuper()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only super administrators can generate landlord OTP codes.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'recipient_email' => 'required|email',
                'recipient_name' => 'required|string|max:255',
                'expires_in_hours' => 'nullable|integer|min:1|max:168', // Max 1 week
                'description' => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $expiresInHours = $request->input('expires_in_hours', 24); // Default 24 hours

            $otp = RegistrationOtp::createForLandlord(
                $request->user()->id,
                $expiresInHours
            );

            // Update metadata with recipient info and description
            $metadata = [
                'recipient_email' => $request->recipient_email,
                'recipient_name' => $request->recipient_name,
            ];
            if ($request->has('description')) {
                $metadata['description'] = $request->description;
            }
            $otp->update(['metadata' => $metadata]);

            // Send OTP via email
            try {
                Mail::to($request->recipient_email)->send(new OtpCodeMail(
                    $otp->otp_code,
                    $request->recipient_name,
                    $otp->target_role,
                    $request->user()->full_name,
                    $otp->expires_at
                ));
            } catch (\Exception $mailException) {
                // Log email failure but don't fail the OTP generation
                AuditLog::logAction(
                    AuditLog::TYPE_ADMIN,
                    'EMAIL_SEND_FAILED',
                    $request->user()->id,
                    $otp->id,
                    [
                        'error' => $mailException->getMessage(),
                        'recipient_email' => $request->recipient_email
                    ]
                );
            }

            // Log the OTP generation
            AuditLog::logAction(
                AuditLog::TYPE_ADMIN,
                'LANDLORD_OTP_GENERATED',
                $request->user()->id,
                $otp->id,
                [
                    'otp_code' => $otp->otp_code,
                    'expires_at' => $otp->expires_at,
                    'generated_for' => 'landlord',
                    'recipient_email' => $request->recipient_email,
                    'recipient_name' => $request->recipient_name,
                    'description' => $request->description
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Landlord OTP generated and sent successfully',
                'data' => [
                    'otp_code' => $otp->otp_code,
                    'target_role' => $otp->target_role,
                    'expires_at' => $otp->expires_at,
                    'generated_by' => $otp->generatedBy->full_name,
                    'recipient_email' => $request->recipient_email,
                    'recipient_name' => $request->recipient_name,
                    'description' => $request->description,
                    'email_sent' => true
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate landlord OTP',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate OTP for resident registration (Landlord only)
     */
    public function generateResidentOtp(Request $request)
    {
        try {
            // Check if user is landlord
            if (!$request->user()->isLandlord()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only landlords can generate resident OTP codes.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'house_id' => 'required|exists:houses,id',
                'recipient_email' => 'required|email',
                'recipient_name' => 'required|string|max:255',
                'expires_in_hours' => 'nullable|integer|min:1|max:168', // Max 1 week
                'description' => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verify the house belongs to this landlord
            $house = House::where('id', $request->house_id)
                         ->where('landlord_id', $request->user()->id)
                         ->first();

            if (!$house) {
                return response()->json([
                    'success' => false,
                    'message' => 'House not found or you do not own this house.'
                ], 404);
            }

            $expiresInHours = $request->input('expires_in_hours', 72); // Default 72 hours

            $otp = RegistrationOtp::createForResident(
                $request->user()->id,
                $house->id,
                $house->house_number,
                $house->address,
                $expiresInHours
            );

            // Update metadata if description provided
            if ($request->has('description')) {
                $otp->update([
                    'metadata' => ['description' => $request->description]
                ]);
            }

            // Send OTP via email
            $emailSent = false;
            $emailError = null;
            
            try {
                Mail::to($request->recipient_email)->send(new OtpCodeMail(
                    $otp->otp_code,
                    $request->recipient_name,
                    'resident',
                    $request->user()->name,
                    $otp->expires_at,
                    [
                        'house_number' => $house->house_number,
                        'address' => $house->address
                    ]
                ));
                $emailSent = true;
            } catch (\Exception $e) {
                $emailError = $e->getMessage();
                \Illuminate\Support\Facades\Log::error('Failed to send resident OTP email: ' . $e->getMessage());
            }

            // Log the OTP generation
            AuditLog::logAction(
                AuditLog::TYPE_ADMIN,
                'RESIDENT_OTP_GENERATED',
                $request->user()->id,
                $otp->id,
                [
                    'otp_code' => $otp->otp_code,
                    'expires_at' => $otp->expires_at,
                    'generated_for' => 'resident',
                    'house_number' => $house->house_number,
                    'address' => $house->address,
                    'recipient_email' => $request->recipient_email,
                    'recipient_name' => $request->recipient_name,
                    'email_sent' => $emailSent,
                    'description' => $request->description
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Resident OTP generated successfully',
                'data' => [
                    'otp_code' => $otp->otp_code,
                    'target_role' => $otp->target_role,
                    'house' => [
                        'id' => $house->id,
                        'house_number' => $house->house_number,
                        'address' => $house->address,
                    ],
                    'expires_at' => $otp->expires_at,
                    'generated_by' => $otp->generatedBy->full_name,
                    'email_sent' => $emailSent,
                    'recipient_email' => $request->recipient_email,
                    'description' => $request->description
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate resident OTP',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all OTPs generated by current user
     */
    public function getUserOtps(Request $request)
    {
        try {
            $otps = RegistrationOtp::where('generated_by', $request->user()->id)
                                  ->with(['house', 'usedBy'])
                                  ->orderBy('created_at', 'desc')
                                  ->get()
                                  ->map(function($otp) {
                                      return [
                                          'id' => $otp->id,
                                          'otp_code' => $otp->otp_code,
                                          'target_role' => $otp->target_role,
                                          'house' => $otp->house ? [
                                              'id' => $otp->house->id,
                                              'house_number' => $otp->house->house_number,
                                              'address' => $otp->house->address,
                                          ] : null,
                                          'expires_at' => $otp->expires_at,
                                          'used_at' => $otp->used_at,
                                          'used_by' => $otp->usedBy ? $otp->usedBy->full_name : null,
                                          'is_active' => $otp->is_active,
                                          'is_valid' => $otp->isValid(),
                                          'metadata' => $otp->metadata,
                                          'created_at' => $otp->created_at
                                      ];
                                  });

            return response()->json([
                'success' => true,
                'data' => [
                    'otps' => $otps,
                    'total_count' => $otps->count(),
                    'active_count' => $otps->where('is_valid', true)->count()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch OTPs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deactivate an OTP (cancel it)
     */
    public function deactivateOtp(Request $request, $otpId)
    {
        try {
            $otp = RegistrationOtp::where('id', $otpId)
                                 ->where('generated_by', $request->user()->id)
                                 ->first();

            if (!$otp) {
                return response()->json([
                    'success' => false,
                    'message' => 'OTP not found or you do not have permission to deactivate it.'
                ], 404);
            }

            if ($otp->isUsed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot deactivate an already used OTP.'
                ], 422);
            }

            $otp->deactivate();

            // Log the deactivation
            AuditLog::logAction(
                AuditLog::TYPE_ADMIN,
                'OTP_DEACTIVATED',
                $request->user()->id,
                $otp->id,
                [
                    'otp_code' => $otp->otp_code,
                    'target_role' => $otp->target_role
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'OTP deactivated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to deactivate OTP',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate OTP code (for frontend to check before registration)
     */
    public function validateOtp(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'otp_code' => 'required|string|size:6'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid OTP format',
                    'errors' => $validator->errors()
                ], 422);
            }

            $otp = RegistrationOtp::where('otp_code', $request->otp_code)
                                 ->with(['house', 'generatedBy'])
                                 ->first();

            if (!$otp) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid OTP code'
                ], 404);
            }

            if (!$otp->isValid()) {
                $reason = $otp->isUsed() ? 'already used' : ($otp->isExpired() ? 'expired' : 'deactivated');
                return response()->json([
                    'success' => false,
                    'message' => "OTP code is {$reason}"
                ], 422);
            }

            $responseData = [
                'valid' => true,
                'target_role' => $otp->target_role,
                'generated_by' => $otp->generatedBy->full_name,
                'expires_at' => $otp->expires_at,
            ];

            // Include house info for resident OTPs (admin's house details for prefill)
            if ($otp->target_role === RegistrationOtp::TARGET_RESIDENT) {
                $responseData['house_number'] = $otp->house_number;
                $responseData['address'] = $otp->address;
                $responseData['house_type'] = $otp->house ? $otp->house->house_type : null;
                
                // Include metadata for additional context
                if ($otp->metadata) {
                    $responseData['admin_house_number'] = $otp->metadata['admin_house_number'] ?? $otp->house_number;
                    $responseData['admin_address'] = $otp->metadata['admin_address'] ?? $otp->address;
                    $responseData['admin_house_type'] = $otp->metadata['admin_house_type'] ?? null;
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Valid OTP code',
                'data' => $responseData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to validate OTP',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate OTP for security personnel registration (Super Admin only)
     */
    public function generateSecurityOtp(Request $request)
    {
        try {
            // Check if user is super admin
            if (!$request->user()->isSuper()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only super administrators can generate security personnel OTP codes.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'recipient_email' => 'required|email',
                'recipient_name' => 'required|string|max:255',
                'expires_in_hours' => 'nullable|integer|min:1|max:168', // Max 1 week
                'description' => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $expiresInHours = $request->input('expires_in_hours', 24); // Default 24 hours

            // Create OTP for security personnel
            $otp = RegistrationOtp::create([
                'otp_code' => str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT),
                'generated_by' => $request->user()->id,
                'target_role' => 'security',
                'expires_at' => now()->addHours($expiresInHours),
                'is_active' => true,
                'metadata' => [
                    'recipient_email' => $request->recipient_email,
                    'recipient_name' => $request->recipient_name,
                    'description' => $request->description,
                    'generated_by_name' => $request->user()->full_name,
                ]
            ]);

            // Send OTP via email
            try {
                Mail::to($request->recipient_email)->send(new OtpCodeMail(
                    $otp->otp_code,
                    $request->recipient_name,
                    'security',
                    $request->user()->full_name,
                    $otp->expires_at,
                    $request->description
                ));
            } catch (\Exception $e) {
                // Log email failure but still return success since OTP was created
                Log::error('Failed to send security OTP email: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Security personnel OTP generated successfully',
                'data' => [
                    'otp_id' => $otp->id,
                    'otp_code' => $otp->otp_code,
                    'target_role' => $otp->target_role,
                    'expires_at' => $otp->expires_at->format('Y-m-d H:i:s'),
                    'expires_in_hours' => $expiresInHours,
                    'recipient_email' => $request->recipient_email,
                    'recipient_name' => $request->recipient_name,
                    'description' => $request->description,
                    'registration_url' => url('/register?otp=' . $otp->otp_code)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate security personnel OTP',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate user token on behalf of a landlord (Super Admin functionality)
     */
    public function generateTokenForLandlord(Request $request)
    {
        try {
            // Check if user is super admin
            if ($request->user()->role !== User::ROLE_SUPER) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only super admins can generate tokens on behalf of landlords.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'landlord_id' => 'required|exists:users,id',
                'recipient_email' => 'required|email',
                'recipient_name' => 'required|string|max:255',
                'expires_in_hours' => 'nullable|integer|min:1|max:168',
                'landlord_house_number' => 'nullable|string',
                'landlord_address' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verify the landlord exists and is a landlord
            $landlord = User::findOrFail($request->landlord_id);
            if ($landlord->role !== User::ROLE_LANDLORD) {
                return response()->json([
                    'success' => false,
                    'message' => 'Target user is not a landlord'
                ], 422);
            }

            $expiresInHours = $request->input('expires_in_hours', 72); // Default 3 days

            // Get landlord's house information if not provided
            $landlordHouse = $landlord->ownedHouses()->first();
            $houseNumber = $request->input('landlord_house_number', $landlordHouse ? $landlordHouse->house_number : null);
            $address = $request->input('landlord_address', $landlordHouse ? $landlordHouse->address : null);

            // Create OTP record
            $otp = RegistrationOtp::create([
                'otp_code' => RegistrationOtp::generateOtpCode(),
                'target_role' => RegistrationOtp::TARGET_RESIDENT,
                'generated_by' => $landlord->id, // Set as if generated by the landlord
                'house_id' => $landlordHouse ? $landlordHouse->id : null,
                'house_number' => $houseNumber,
                'address' => $address,
                'expires_at' => now()->addHours($expiresInHours),
                'metadata' => [
                    'recipient_email' => $request->recipient_email,
                    'recipient_name' => $request->recipient_name,
                    'generated_by_super_admin' => $request->user()->full_name,
                    'generated_for_landlord' => $landlord->full_name,
                    'admin_house_number' => $houseNumber,
                    'admin_address' => $address,
                    'admin_house_type' => $landlordHouse ? $landlordHouse->house_type : null,
                ],
            ]);

            // Try to send email notification to recipient
            try {
                Mail::to($request->recipient_email)->send(new OtpCodeMail(
                    $otp->otp_code,
                    $request->recipient_name,
                    RegistrationOtp::TARGET_RESIDENT,
                    $landlord->full_name, // Show landlord name as generator
                    $otp->expires_at
                ));
            } catch (\Exception $e) {
                // Log email failure but still return success since OTP was created
                Log::error('Failed to send user token email: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'User token generated successfully on behalf of landlord',
                'data' => [
                    'otp_id' => $otp->id,
                    'otp_code' => $otp->otp_code,
                    'target_role' => $otp->target_role,
                    'expires_at' => $otp->expires_at->format('Y-m-d H:i:s'),
                    'expires_in_hours' => $expiresInHours,
                    'recipient_email' => $request->recipient_email,
                    'recipient_name' => $request->recipient_name,
                    'generated_for_landlord' => $landlord->full_name,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate user token on behalf of landlord',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
