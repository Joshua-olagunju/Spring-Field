<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Flutterwave Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration options for Flutterwave payment
    | gateway integration.
    |
    */

    'public_key' => env('FLUTTERWAVE_PUBLIC_KEY'),
    'secret_key' => env('FLUTTERWAVE_SECRET_KEY'),
    'webhook_secret_hash' => env('FLUTTERWAVE_WEBHOOK_SECRET_HASH'),
    'environment' => env('FLUTTERWAVE_ENVIRONMENT', 'sandbox'), // sandbox or live
    
    'base_url' => env('FLUTTERWAVE_ENVIRONMENT', 'sandbox') === 'sandbox' 
        ? 'https://api.flutterwave.com/v3' 
        : 'https://api.flutterwave.com/v3',

    'webhook_url' => env('APP_URL') . '/api/flutterwave/webhook',

    // Package configurations for Flutterwave plans
    'packages' => [
        'tenant' => [
            'monthly' => [
                'plan_id' => 'tenant_monthly',
                'name' => 'Tenant Monthly Plan',
                'amount' => 3000,
            ],
            '6months' => [
                'plan_id' => 'tenant_6months',
                'name' => 'Tenant 6 Months Plan',
                'amount' => 15000,
            ],
            'yearly' => [
                'plan_id' => 'tenant_yearly',
                'name' => 'Tenant Yearly Plan',
                'amount' => 27000,
            ],
        ],
        'landlord_alone' => [
            'monthly' => [
                'plan_id' => 'landlord_alone_monthly',
                'name' => 'Landlord Alone Monthly Plan',
                'amount' => 5000,
            ],
            '6months' => [
                'plan_id' => 'landlord_alone_6months',
                'name' => 'Landlord Alone 6 Months Plan',
                'amount' => 25000,
            ],
            'yearly' => [
                'plan_id' => 'landlord_alone_yearly',
                'name' => 'Landlord Alone Yearly Plan',
                'amount' => 45000,
            ],
        ],
        'landlord_with_tenants' => [
            'monthly' => [
                'plan_id' => 'landlord_tenants_monthly',
                'name' => 'Landlord with Tenants Monthly Plan',
                'amount' => 7000,
            ],
            '6months' => [
                'plan_id' => 'landlord_tenants_6months',
                'name' => 'Landlord with Tenants 6 Months Plan',
                'amount' => 35000,
            ],
            'yearly' => [
                'plan_id' => 'landlord_tenants_yearly',
                'name' => 'Landlord with Tenants Yearly Plan',
                'amount' => 63000,
            ],
        ],
    ],
];