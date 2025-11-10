<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $otpCode;
    public $userName;
    public $expiresAt;

    /**
     * Create a new message instance.
     */
    public function __construct($otpCode, $userName, $expiresAt)
    {
        $this->otpCode = $otpCode;
        $this->userName = $userName;
        $this->expiresAt = $expiresAt;
    }

    /**
     * Get the message envelope.
     */
    public function envelope()
    {
        return new Envelope(
            subject: 'Spring Field Estate - Verify Your Email Address',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content()
    {
        return new Content(
            html: 'emails.email-verification',
            text: 'emails.email-verification-text',
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