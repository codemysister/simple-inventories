<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
     protected $fillable = [
        'product_id',
        'quantity',
        'status',
        'remark',
        'type',
        'created_by'
    ];

    protected $appends = [
        'created_at_formatted'
    ];
    
    public function getCreatedAtFormattedAttribute()
    {
        return $this->created_at ? $this->created_at->format('d/m/Y, H:i') : null;
    }


    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }
}
