<?php

namespace App\Mail;

use App\StockMovement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class StockMovemenetNotification extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public $stockMovement;
    public $product;
    public $user;

    public function __construct(StockMovement $stockMovement)
    {
        $this->stockMovement = $stockMovement;
        $this->product = $stockMovement->product;
        $this->user = $stockMovement->user;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $subject = $this->stockMovement->type === 'inbound' 
            ? 'Stock Inbound Notification' 
            : 'Stock Outbound Notification';

        return $this->subject($subject)
                   ->view('emails.stock-movement')
                   ->with([
                       'stockMovement' => $this->stockMovement,
                       'product' => $this->product,
                       'user' => $this->user,
                   ]);
    }
}
