<?php

namespace App\Http\Controllers;

use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    function login(Request $request) {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'error' => true,
                'message' => 'Invalid credentials'
            ], status: 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'error' => false,
            'token' => $token,
            'user' => $user,
        ]);
    }

    function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Success logout']);
    }

}
