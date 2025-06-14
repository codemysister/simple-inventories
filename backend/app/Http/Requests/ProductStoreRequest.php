<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductStoreRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'min:2',
                'max:255',
                'regex:/^[a-zA-Z0-9\s\-_]+$/',
                'unique:products,name'
            ],
            'price' => [
                'required',
                'numeric',
                'min:0.01',
                'max:999999.99',
            ],
            'uom' => [
                'required',
                'string',
                Rule::in(['pcs', 'pair', 'kg', 'liter', 'meter', 'box', 'pack', 'unit'])
            ],
            'stock_on_hand' => [
                'required',
                'integer',
                'min:0',
                'max:999999'
            ],
            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:2048' 
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Product name is required.',
            'name.min' => 'Product name must be at least 2 characters.',
            'name.max' => 'Product name cannot exceed 255 characters.',
            'name.regex' => 'Product name can only contain letters, numbers, spaces, hyphens, and underscores.',
            'name.unique' => 'A product with this name already exists.',
            
            'price.required' => 'Product price is required.',
            'price.numeric' => 'Price must be a valid number.',
            
            'uom.required' => 'Unit of measurement is required.',
            'uom.in' => 'Selected unit of measurement is invalid.',
            
            'stock_on_hand.required' => 'Stock on hand is required.',
            'stock_on_hand.integer' => 'Stock must be a valid number.',
            'stock_on_hand.min' => 'Stock cannot be negative.',
            'stock_on_hand.max' => 'Stock cannot exceed 999,999.',
            
            'image.image' => 'The file must be an image.',
            'image.mimes' => 'Image must be in JPEG, JPG, PNG, or WEBP format.',
            'image.max' => 'Image size cannot exceed 2MB.'
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => trim($this->name),
            'price' => $this->price ? (float) $this->price : null,
            'uom' => strtolower(trim($this->uom)),
            'stock_on_hand' => $this->stock_on_hand ? (int) $this->stock_on_hand : null,
        ]);
    }
}
