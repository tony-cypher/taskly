<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->boards()
                ->withCount('tasks')
                ->orderBy('position')
                ->get()
                ->map(fn (Board $b) => [
                    'id' => $b->id,
                    'name' => $b->name,
                    'color' => $b->color,
                    'position' => $b->position,
                    'tasks_count' => $b->tasks_count,
                ])
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);

        $board = $request->user()->boards()->create([
            ...$data,
            'color' => $data['color'] ?? 'violet',
            'position' => (int) $request->user()->boards()->max('position') + 1,
        ]);

        return response()->json($board, 201);
    }

    public function update(Request $request, Board $board): JsonResponse
    {
        abort_unless($board->user_id === $request->user()->id, 404);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'color' => ['sometimes', 'string', 'max:20'],
            'position' => ['sometimes', 'integer'],
        ]);

        $board->update($data);

        return response()->json($board);
    }

    public function destroy(Request $request, Board $board): JsonResponse
    {
        abort_unless($board->user_id === $request->user()->id, 404);

        $board->delete();

        return response()->json(['message' => 'Board deleted']);
    }
}
