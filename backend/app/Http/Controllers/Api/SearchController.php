<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q'));

        if ($q === '') {
            return response()->json(['tasks' => [], 'events' => [], 'notes' => []]);
        }

        $user = $request->user();

        $tasks = $user->tasks()
            ->where(fn ($query) => $query
                ->where('title', 'like', "%{$q}%")
                ->orWhere('description', 'like', "%{$q}%"))
            ->limit(8)
            ->get(['id', 'title', 'completed', 'due_at'])
            ->map(fn (Task $t) => [
                'id' => $t->id,
                'title' => $t->title,
                'completed' => (bool) $t->completed,
                'due_at' => $t->due_at?->toIso8601String(),
            ]);

        $events = $user->events()
            ->where('title', 'like', "%{$q}%")
            ->limit(8)
            ->get(['id', 'title', 'starts_at'])
            ->map(fn ($e) => [
                'id' => $e->id,
                'title' => $e->title,
                'starts_at' => $e->starts_at?->toIso8601String(),
            ]);

        $notes = $user->notes()
            ->where(fn ($query) => $query
                ->where('title', 'like', "%{$q}%")
                ->orWhere('body', 'like', "%{$q}%"))
            ->limit(8)
            ->get(['id', 'title', 'body'])
            ->map(fn (Note $n) => [
                'id' => $n->id,
                'title' => $n->title,
                'body' => $n->body,
            ]);

        return response()->json(['tasks' => $tasks, 'events' => $events, 'notes' => $notes]);
    }
}
