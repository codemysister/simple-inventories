<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StockMovementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'product_id' => [
                'required',
            ],
            'type' => [
                'required',
                'string'
            ],
            'quantity' => [
                'required',
                'integer',
                'min:0',
                'max:999999'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Product is required.',
            
            'type.required' => 'Type is required.',
           
            'quantity.required' => 'Quantity is required.',
            'quantity.integer' => 'Quantity must be a valid number.',
            'quantity.min' => 'Quantity cannot be negative.',
            'quantity.max' => 'Quantity cannot exceed 999,999.',
            
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'product_id' => trim($this->product_id),
            'type' => strtolower(trim($this->type)),
            'quantity' => $this->quantity ? (int) $this->quantity : null,
        ]);
    }
}
