<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'theme' => ['sometimes', 'in:light,dark'],
            'avatar' => ['sometimes', 'nullable', 'string', 'max:10'],
            'settings' => ['sometimes', 'array'],
        ]);

        $request->user()->update($data);

        return response()->json(['user' => $request->user()]);
    }

    public function completeOnboarding(Request $request): JsonResponse
    {
        $request->user()->update(['onboarded' => true]);

        return response()->json(['user' => $request->user()]);
    }
}
