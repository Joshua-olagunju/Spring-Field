<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - Spring Field Estate</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2C3E50 0%, #3498DB 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; margin-bottom: 20px; color: #2C3E50; }
        .otp-container { text-align: center; margin: 30px 0; }
        .otp-code { font-size: 36px; font-weight: bold; color: #3498DB; background: #ECF0F1; padding: 15px 25px; border-radius: 8px; letter-spacing: 5px; display: inline-block; border: 2px dashed #3498DB; }
        .instructions { background: #F8F9FA; border-left: 4px solid #3498DB; padding: 20px; margin: 25px 0; border-radius: 0 5px 5px 0; }
        .instructions h3 { margin-top: 0; color: #2C3E50; }
        .warning { background: #FFF3CD; border: 1px solid #FFEAA7; padding: 15px; border-radius: 5px; margin: 20px 0; color: #856404; }
        .footer { background: #34495E; color: white; padding: 25px; text-align: center; font-size: 14px; }
        .footer p { margin: 5px 0; }
        .logo { font-size: 24px; font-weight: bold; }
        .expiry { color: #E74C3C; font-weight: bold; }
        ul li { margin: 8px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏠 Spring Field Estate</div>
            <h1>Email Verification Required</h1>
            <p>Complete your account setup</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hello {{ $userName }},
            </div>
            
            <p>Welcome to Spring Field Estate! To complete your account registration and ensure the security of your account, please verify your email address using the OTP code below:</p>
            
            <div class="otp-container">
                <div class="otp-code">{{ $otpCode }}</div>
                <p>Enter this code to verify your email</p>
            </div>
            
            <div class="instructions">
                <h3>📋 How to verify:</h3>
                <ul>
                    <li>Copy the 6-digit OTP code above</li>
                    <li>Return to the Spring Field Estate app/website</li>
                    <li>Enter the OTP code in the verification form</li>
                    <li>Click "Verify Email" to complete the process</li>
                </ul>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important:</strong> This OTP will expire at <span class="expiry">{{ $expiresAt->format('M d, Y \a\t g:i A') }}</span>. 
                If you don't verify within this time, you'll need to request a new OTP.
            </div>
            
            <p>If you didn't create an account with Spring Field Estate, please ignore this email or contact our support team if you believe this is an error.</p>
            
            <p><strong>Security Tips:</strong></p>
            <ul>
                <li>Never share this OTP code with anyone</li>
                <li>Spring Field Estate will never ask for your OTP via phone or email</li>
                <li>This email was sent from an automated system, please do not reply</li>
            </ul>
        </div>
        
        <div class="footer">
            <p><strong>Spring Field Estate Management System</strong></p>
            <p>Your trusted partner in estate management</p>
            <p>This is an automated message - Please do not reply to this email</p>
        </div>
    </div>
</body>
</html>