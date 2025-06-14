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
        Route::post('/', 'ProductController@store');
        Route::put('/{id}', 'ProductController@update');
        Route::get('/get-data', 'ProductController@getData');
        Route::delete('/{id}', 'ProductController@destroy');
    });

    Route::post('/auth/logout', 'AuthController@logout');
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

});