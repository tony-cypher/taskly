<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Sanctum;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'is_guest' => false,
            'avatar' => strtoupper(substr($data['name'], 0, 1)),
        ]);

        // Give brand-new signed-up users the demo experience too.
        DemoData::seed($user);

        return $this->issueToken($user, 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || $user->is_guest || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        return $this->issueToken($user);
    }

    public function guest(Request $request): JsonResponse
    {
        // Re-entry with a stored guest token resumes the same guest session.
        if ($token = $request->input('token')) {
            $model = Sanctum::$personalAccessTokenModel::findToken($token);
            $user = $model?->tokenable;

            if ($user instanceof User && $user->is_guest) {
                return response()->json($this->payload($user, $token));
            }
        }

        $user = User::create([
            'name' => 'Guest',
            'email' => 'guest-'.Str::uuid()->toString().'@todo.local',
            'password' => Str::password(32),
            'is_guest' => true,
            'avatar' => 'G',
            'onboarded' => false,
        ]);

        DemoData::seed($user);

        return $this->issueToken($user, 201);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    private function issueToken(User $user, int $status = 200): JsonResponse
    {
        $token = $user->createToken('spa')->plainTextToken;

        return response()->json($this->payload($user, $token), $status);
    }

    private function payload(User $user, string $token): array
    {
        return [
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'is_guest' => $user->is_guest,
                'onboarded' => $user->onboarded,
                'theme' => $user->theme ?? 'light',
            ],
        ];
    }
}
