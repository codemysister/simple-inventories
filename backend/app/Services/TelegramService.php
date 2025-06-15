<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    private $botToken;
    private $baseUrl;

    public function __construct()
    {
        $this->botToken = config('services.telegram.bot_token');
        $this->baseUrl = "https://api.telegram.org/bot{$this->botToken}";
    }

    public function sendMessage($chatId, $message, $parseMode = 'HTML')
    {
        try {
            $response = Http::post("{$this->baseUrl}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => $parseMode
            ]);

            if ($response->successful()) {
                Log::info('Telegram message sent successfully', [
                    'chat_id' => $chatId,
                    'response' => $response->json()
                ]);
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            } else {
                Log::error('Failed to send Telegram message', [
                    'chat_id' => $chatId,
                    'response' => $response->json()
                ]);
                return [
                    'success' => false,
                    'error' => $response->json()
                ];
            }
        } catch (\Exception $e) {
            Log::error('Telegram service error', [
                'error' => $e->getMessage(),
                'chat_id' => $chatId
            ]);
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public function sendToAdmin($message, $parseMode = 'HTML')
    {
        $adminChatId = config('services.telegram.admin_chat_id');
        
        if (!$adminChatId) {
            Log::warning('Telegram admin chat ID not configured');
            return [
                'success' => false,
                'error' => 'Admin chat ID not configured'
            ];
        }

        return $this->sendMessage($adminChatId, $message, $parseMode);
    }

    public function sendStockMovementNotification($stockMovement)
    {
        $product = $stockMovement->product;
        
        $icon = $stockMovement->type === 'inbound' ? '📦' : '📤';
        $typeEmoji = $stockMovement->type === 'inbound' ? '⬆️' : '⬇️';
        
        $message = "{$icon} <b>Stock Movement Alert</b>\n\n";
        $message .= "{$typeEmoji} <b>Type:</b> " . ucfirst($stockMovement->type) . "\n";
        $message .= "🏷️ <b>Product:</b> " . ($product->name ?? 'N/A') . "\n";
        $message .= "📊 <b>Quantity:</b> " . number_format($stockMovement->quantity) . "\n";
        $message .= "⭐ <b>Status:</b> " . ucfirst($stockMovement->status ?? 'Waiting') . "\n";
        $message .= "🕐 <b>Date:</b> " . $stockMovement->created_at->format('d M Y H:i:s') . "\n";
        
        return $this->sendToAdmin($message);
    }

 
}