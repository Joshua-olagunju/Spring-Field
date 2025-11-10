<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $otpCode;
    public $recipientName;
    public $targetRole;
    public $generatedBy;
    public $expiresAt;
    public $houseInfo;

    /**
     * Create a new message instance.
     */
    public function __construct($otpCode, $recipientName, $targetRole, $generatedBy, $expiresAt, $houseInfo = null)
    {
        $this->otpCode = $otpCode;
        $this->recipientName = $recipientName;
        $this->targetRole = $targetRole;
        $this->generatedBy = $generatedBy;
        $this->expiresAt = $expiresAt;
        $this->houseInfo = $houseInfo;
    }

    /**
     * Get the message envelope.
     */
    public function envelope()
    {
        return new Envelope(
            subject: 'Spring Field Estate - Registration OTP Code',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content()
    {
        return new Content(
            html: 'emails.otp-code',
            text: 'emails.otp-code-text',
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments()
    {
        return [];
    }
}
