<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class FlutterwaveService
{
    private $baseUrl;
    private $secretKey;
    private $publicKey;

    public function __construct()
    {
        $this->secretKey = config('services.flutterwave.secret_key');
        $this->publicKey = config('services.flutterwave.public_key');
        $this->baseUrl = config('services.flutterwave.environment') === 'live' 
            ? 'https://api.flutterwave.com/v3' 
            : 'https://api.flutterwave.com/v3';
    }

    public function initializePayment($data)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/payments', $data);

            $responseData = $response->json();
            
            Log::info('Flutterwave payment initialization response', [
                'status' => $response->status(),
                'data' => $responseData
            ]);

            if ($response->successful() && isset($responseData['status']) && $responseData['status'] === 'success') {
                return [
                    'success' => true,
                    'data' => $responseData['data']
                ];
            }

            return [
                'success' => false,
                'message' => $responseData['message'] ?? 'Payment initialization failed'
            ];

        } catch (\Exception $e) {
            Log::error('Flutterwave payment initialization error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'Payment service error: ' . $e->getMessage()
            ];
        }
    }

    public function verifyTransaction($transactionId)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])->get($this->baseUrl . '/transactions/' . $transactionId . '/verify');

            $responseData = $response->json();
            
            Log::info('Flutterwave transaction verification response', [
                'transaction_id' => $transactionId,
                'status' => $response->status(),
                'data' => $responseData
            ]);

            if ($response->successful() && isset($responseData['status']) && $responseData['status'] === 'success') {
                return [
                    'success' => true,
                    'data' => $responseData['data']
                ];
            }

            return [
                'success' => false,
                'message' => $responseData['message'] ?? 'Transaction verification failed'
            ];

        } catch (\Exception $e) {
            Log::error('Flutterwave transaction verification error', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'Verification service error: ' . $e->getMessage()
            ];
        }
    }

    public function validateWebhookSignature($payload, $signature)
    {
        $webhookSecret = config('services.flutterwave.webhook_secret_hash');
        $expectedSignature = hash_hmac('sha256', $payload, $webhookSecret);
        
        return hash_equals($expectedSignature, $signature);
    }

    public function getPublicKey()
    {
        return $this->publicKey;
    }
}