<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
Route::post('/auth/login', 'AuthController@login'); 

Route::middleware('auth:sanctum')->group(function(){

    // Products
    Route::prefix('products')->group(function(){
        
        Route::get('/fetch', 'ProductController@fetch');
        Route::get('/get-data', 'ProductController@getData');
         Route::middleware('role:admin')->group(function () {
            Route::post('/', 'ProductController@store');
            Route::put('/{id}', 'ProductController@update');
            Route::delete('/{id}', 'ProductController@destroy');
        });
    });

     // Stock Movement
    Route::prefix('stock-movements')->group(function(){
        Route::post('/', 'StockMovementController@store');
        Route::put('/{id}', 'StockMovementController@update');
        Route::put('approve/{id}', 'StockMovementController@approve');
        Route::put('reject/{id}', 'StockMovementController@reject');
        Route::get('/get-data', 'StockMovementController@getData');
        Route::delete('/{id}', action: 'StockMovementController@destroy');
    });

    Route::post('/auth/logout', 'AuthController@logout');
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

});