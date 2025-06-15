<?php

namespace App\Http\Controllers;

use App\Http\Requests\StockMovementRequest;
use App\Jobs\SendStockMovementNotification;
use App\Product;
use App\StockMovement;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StockMovementController extends Controller
{
    public function store(StockMovementRequest $request)
    {
        try {
            DB::beginTransaction();
            
            $validated = $request->validated();
       
            $stockMovements = StockMovement::create([
                'product_id' => $validated['product_id'],
                'type' => $validated['type'],
                'quantity' => $validated['quantity'],
                'created_by' => auth()->id(),
            ]);

            SendStockMovementNotification::dispatch($stockMovements);
         
            DB::commit();
            
            return response()->json([
                'error' => false,
                'message' => 'Stock movement created successfully.',
                'data' => $stockMovements
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
     
            Log::error('Failed to create stock movements', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Failed to create stock movements. Please try again.',
            ], 500);
        }
    }

    public function update(StockMovementRequest $request, $id)
    {
        try {
            DB::beginTransaction();
            
            $validated = $request->validated();
            
            $stockMovements = StockMovement::findOrFail($id);

            $stockMovements->update([
                'product_id' => $validated['product_id'],
                'type' => $validated['type'],
                'quantity' => $validated['quantity'],
                'status' => $stockMovements->status == 'rejected' ? 'waiting' : $stockMovements->status
            ]);

            DB::commit();
            
            return response()->json([
                'error' => false,
                'message' => 'Stock movement updated successfully.',
                'data' => $stockMovements
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
     
            Log::error('Failed to update stock movements', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Failed to update stock movements. Please try again.',
            ], 500);
        }
    }

     public function destroy($id) {
        try {
            DB::beginTransaction();
                
            $stockMovement = StockMovement::find($id);

            if (empty($stockMovement)) {
                return response()->json([
                    'error' => true,
                    'message' => 'Stock movement not found.',
                ], 201);
            }

            $stockMovement->delete();

            DB::commit();
            
            return response()->json([
                'error' => false,
                'message' => 'Stock movement deleted successfully.',
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to delete stock movement', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Failed to delete stock movement. Please try again.',
            ], 500);
        }
    }

     public function reject(Request $request, $id) {
        try {
            DB::beginTransaction();
                
            $stockMovement = StockMovement::find($id);

            if (empty($stockMovement)) {
                return response()->json([
                    'error' => true,
                    'message' => 'Stock movement not found.',
                ], 201);
            }

            $stockMovement->update([
                'remark' => $request->remark,
                'status' => 'rejected'
            ]);

            DB::commit();
            
            return response()->json([
                'error' => false,
                'message' => 'Stock movement rejected successfully.',
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to rejected stock movement', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Failed to rejected stock movement. Please try again.',
            ], 500);
        }
    }

     public function approve($id) {
        try {
            DB::beginTransaction();
                
            $stockMovement = StockMovement::find($id);
            $product = Product::findOrFail($stockMovement->product_id);

            if (empty($stockMovement)) {
                return response()->json([
                    'error' => true,
                    'message' => 'Stock movement not found.',
                ], 201);
            }

            if ($stockMovement->type == 'inbound') {
                $product->stock_on_hand += $stockMovement->quantity;
            } else {
                $product->stock_on_hand -= $stockMovement->quantity;
            }

            $product->save();
            
            $stockMovement->update([
                'status' => 'approved'
            ]);

            DB::commit();
            
            return response()->json([
                'error' => false,
                'message' => 'Stock movement approved successfully.',
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to approved stock movement', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'error' => true,
                'message' => 'Failed to approved stock movement. Please try again.',
            ], 500);
        }
    }

      public function getData(Request $request)
    {
        $columns = ['product_id', 'type', 'quantity', 'status', 'created_at_formatted', 'created_by', 'id'];

        $draw = intval($request->input('draw'));
        $start = intval($request->input('start'));
        $length = intval($request->input('length'));
        $search = $request->input('search.value');

        $query = StockMovement::with('product', 'createdBy');

        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('product_id', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%");
            });
        }

        $recordsTotal = StockMovement::count();
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
                $item->product?->name ?? "N/A",
                $item->type,
                $item->quantity,
                $item->status,
                $item->remark ?? "N/A",
                $item->created_at_formatted,
                $item->createdBy?->name ?? "N/A",
                $item->id,
                $item->product_id
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
