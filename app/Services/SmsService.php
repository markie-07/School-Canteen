<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    /**
     * Send an SMS message using Twilio, Semaphore API, or simulated logger fallback.
     *
     * @param string $phoneNumber
     * @param string $message
     * @return array
     */
    public static function send($phoneNumber, $message)
    {
        $twilioSid = env('TWILIO_SID');
        $twilioToken = env('TWILIO_AUTH_TOKEN');
        $twilioPhone = env('TWILIO_PHONE_NUMBER');

        $apiKey = env('SEMAPHORE_API_KEY');
        $senderName = env('SEMAPHORE_SENDER_NAME', 'SEMAPHORE');

        if (empty($phoneNumber)) {
            Log::warning("[SMS SERVICE] [FAILED] Cannot send SMS. Phone number is empty. Message: \"{$message}\"");
            return [
                'success' => false,
                'error' => 'Phone number is empty',
                'simulated' => false
            ];
        }

        // Clean and normalize phone number to Philippine international format (639XXXXXXXXX)
        $cleanNumber = preg_replace('/[^0-9]/', '', $phoneNumber);
        if (str_starts_with($cleanNumber, '0')) {
            $cleanNumber = '63' . substr($cleanNumber, 1);
        }

        // 1. TWILIO GATEWAY (Free Trial Option)
        if (!empty($twilioSid) && !empty($twilioToken) && !empty($twilioPhone)) {
            $toFormatted = '+' . $cleanNumber; // E.164 format (e.g., +639949960325)
            
            try {
                Log::info("[SMS SERVICE] [PENDING] Sending real SMS to {$toFormatted} via Twilio API...");

                $response = Http::withBasicAuth($twilioSid, $twilioToken)
                    ->asForm()
                    ->post("https://api.twilio.com/2010-04-01/Accounts/{$twilioSid}/Messages.json", [
                        'From' => $twilioPhone,
                        'To' => $toFormatted,
                        'Body' => $message,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    Log::info("[SMS SERVICE] [SUCCESS] Twilio API Response: " . json_encode($data));
                    return [
                        'success' => true,
                        'response' => $data,
                        'gateway' => 'twilio',
                        'simulated' => false
                    ];
                }

                $errorData = $response->json();
                $errorMessage = $errorData['message'] ?? 'Unknown Twilio error';
                Log::error("[SMS SERVICE] [FAILED] Twilio Response Code: " . $response->status() . " Error: " . $errorMessage);
                return [
                    'success' => false,
                    'error' => $errorMessage,
                    'status' => $response->status(),
                    'simulated' => false
                ];

            } catch (\Exception $e) {
                Log::error("[SMS SERVICE] [EXCEPTION] Error sending SMS via Twilio: " . $e->getMessage());
                return [
                    'success' => false,
                    'error' => $e->getMessage(),
                    'simulated' => false
                ];
            }
        }

        // 2. SEMAPHORE GATEWAY (PH Bulk API Option)
        if (!empty($apiKey)) {
            try {
                Log::info("[SMS SERVICE] [PENDING] Sending real SMS to +{$cleanNumber} via Semaphore API...");

                $response = Http::post('https://semaphore.co/api/v4/messages', [
                    'apikey' => $apiKey,
                    'number' => $cleanNumber,
                    'message' => $message,
                    'sendername' => $senderName
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    Log::info("[SMS SERVICE] [SUCCESS] Semaphore API Response: " . json_encode($data));
                    return [
                        'success' => true,
                        'response' => $data,
                        'gateway' => 'semaphore',
                        'simulated' => false
                    ];
                }

                Log::error("[SMS SERVICE] [FAILED] Semaphore Response Code: " . $response->status() . " Body: " . $response->body());
                return [
                    'success' => false,
                    'error' => 'Semaphore API response was unsuccessful',
                    'status' => $response->status(),
                    'simulated' => false
                ];

            } catch (\Exception $e) {
                Log::error("[SMS SERVICE] [EXCEPTION] Error sending SMS via Semaphore: " . $e->getMessage());
                return [
                    'success' => false,
                    'error' => $e->getMessage(),
                    'simulated' => false
                ];
            }
        }

        // 3. SIMULATED LOGGER FALLBACK (Default)
        $logMsg = "\n" . str_repeat('=', 80) . "\n" .
                  "📱 [SMS SIMULATION SERVICE] [SUCCESS]\n" .
                  "Recipient: +{$cleanNumber}\n" .
                  "Timestamp: " . now()->toDateTimeString() . "\n" .
                  "Message:   \"{$message}\"\n" .
                  "Note:      To send real SMS, configure TWILIO or SEMAPHORE credentials in your .env file.\n" .
                  str_repeat('=', 80) . "\n";
        
        Log::info($logMsg);

        return [
            'success' => true,
            'message' => 'Simulated message logged successfully',
            'simulated' => true
        ];
    }
}
