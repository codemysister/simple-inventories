<?php

namespace App\Jobs;

use App\Mail\StockMovemenetNotification;
use App\Services\TelegramService;
use App\StockMovement;
use App\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendStockMovementNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public $tries = 3;
    public $timeout = 60;
    public $stockMovement;

    public function __construct(StockMovement $stockMovement)
    {
        $this->stockMovement = $stockMovement;
    }


    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        try {
            $this->sendEmailNotifications();
            $telegramService = new TelegramService();
            $telegramService->sendStockMovementNotification($this->stockMovement);
            Log::info('Stock movement notifications sent successfully', [
                'stock_movement_id' => $this->stockMovement->id,
                'type' => $this->stockMovement->type
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to send stock movement notifications', [
                'stock_movement_id' => $this->stockMovement->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
        }
    }

    private function sendEmailNotifications()
    {
        $admins = User::role('admin')->get();
        
        foreach ($admins as $admin) {
            try {
                Mail::to($admin->email)->send(new StockMovemenetNotification($this->stockMovement));
                
                Log::info('Email sent to admin', [
                    'admin_email' => $admin->email,
                    'stock_movement_id' => $this->stockMovement->id
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send email to admin', [
                    'admin_email' => $admin->email,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }
}
