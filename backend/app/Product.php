<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
     protected $fillable = [
        'name',
        'price',
        'uom',
        'stock_on_hand',
        'image',
        'created_by',
    ];

    protected $appends = [
        'image_url'
    ];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? Storage::url($this->image) : null;
    }
}
