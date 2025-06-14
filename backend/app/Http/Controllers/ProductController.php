<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductStoreRequest;
use App\Product;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function store(ProductStoreRequest $request)
    {
        try {
            DB::beginTransaction();
            
            $productData = $request->validated();
            $imagePath = null;
            
            if ($request->hasFile('image')) {
                $imagePath = $this->handleImageUpload($request->file('image'));
            }
            
            $product = Product::create([
                'name' => $productData['name'],
                'price' => $productData['price'],
                'uom' => $productData['uom'],
                'stock_on_hand' => $productData['stock_on_hand'],
                'image' => $imagePath,
                'created_by' => auth()->id(),
            ]);

            DB::commit();
            
            return response()->json([
                'error' => false,
                'message' => 'Product created successfully.',
                'data' => $product
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            
            if (isset($imagePath) && $imagePath) {
                Storage::disk('public')->delete($imagePath);
            }
            
            Log::error('Failed to update product', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Failed to update product. Please try again.',
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $product = Product::findOrFail($id);

            $imagePath = $product->image;

            if ($request->hasFile('image')) {
                if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                    Storage::disk('public')->delete($imagePath);
                }

                $imagePath = $this->handleImageUpload($request->file('image'));
            }
            $product->update([
                'name' => $request->name,
                'price' => $request->price,
                'uom' => $request->uom,
                'stock_on_hand' => $request->stock_on_hand,
                'image' => $imagePath,
            ]);

            DB::commit();

            return response()->json([
                'error' => false,
                'message' => 'Product updated successfully.',
                'data' => $product
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to update product', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'product_id' => $id,
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Failed to update product. Please try again.',
            ], 500);
        }
    }

    public function destroy($id) {
        try {
            DB::beginTransaction();
                
            $product = Product::find($id);

            if (!empty($product)) {

            }

            $product->delete();

            DB::commit();
            
            return response()->json([
                'error' => false,
                'message' => 'Product deleted successfully.',
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to create product', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Failed to delete product. Please try again.',
            ], 500);
        }
    }
     private function handleImageUpload($image): string
    {
        try {
            $filename = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            
            $path = $image->storeAs('products', $filename, 'public');
            
            return $path;
            
        } catch (Exception $e) {
            Log::error('Image upload failed', [
                'error' => $e->getMessage(),
                'file_name' => $image->getClientOriginalName(),
            ]);
            
            throw new Exception('Failed to upload image: ' . $e->getMessage());
        }
    }

    public function getData(Request $request)
    {
        $columns = ['name', 'price', 'uom', 'image', 'stock_on_hand', 'id'];

        $draw = intval($request->input('draw'));
        $start = intval($request->input('start'));
        $length = intval($request->input('length'));
        $search = $request->input('search.value');

        $query = Product::query();

        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('price', 'like', "%{$search}%")
                  ->orWhere('uom', 'like', "%{$search}%")
                  ->orWhere('image', 'like', "%{$search}%")
                  ->orWhere('stock_on_hand', 'like', "%{$search}%");
            });
        }

        $recordsTotal = Product::count();
        $recordsFiltered = $query->count();

        if ($request->has('order')) {
            $orderColumnIndex = $request->input('order.0.column');
            $orderDir = $request->input('order.0.dir');
            $orderColumn = $columns[$orderColumnIndex] ?? 'name';

            $query->orderBy($orderColumn, $orderDir);
        }

        $data = $query->skip($start)->take($length)->get();

        $formattedData = $data->map(function ($item) {
            return [
                $item->name,
                $item->price,
                $item->uom,
                $item->image_url,
                $item->stock_on_hand,
                $item->id
            ];
        });

        return response()->json([
            'draw' => $draw,
            'recordsTotal' => $recordsTotal,
            'recordsFiltered' => $recordsFiltered,
            'data' => $formattedData,
        ]);
    }
}
