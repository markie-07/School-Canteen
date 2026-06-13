<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Add your school canteen API routes here
Route::get('/status', function () {
    return response()->json(['status' => 'School Canteen API is online']);
});
