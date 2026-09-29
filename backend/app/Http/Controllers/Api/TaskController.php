<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = $request->user()->tasks()->with('board');

        if ($search = trim((string) $request->query('q'))) {
            $query->where(fn ($q) => $q
                ->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%"));
        }

        if ($status = $request->query('status')) {
            if ($status === 'completed') {
                $query->where('completed', true);
            } elseif ($status === 'active') {
                $query->where('completed', false);
            }
        }

        if ($request->boolean('today')) {
            $query->whereDate('due_at', today());
        }

        if ($request->boolean('upcoming')) {
            $query->where('due_at', '>', now());
        }

        if ($request->boolean('overdue')) {
            $query->where('completed', false)->where('due_at', '<', now());
        }

        if ($boardId = $request->query('board_id')) {
            $query->where('board_id', $boardId);
        }

        $direction = $request->query('sort') === 'due' ? 'asc' : 'asc';
        $query->orderBy('position')->orderBy('due_at', $direction);

        return TaskResource::collection(
            $query->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateTask($request);

        $position = (int) $request->user()->tasks()->max('position') + 1;

        $task = $request->user()->tasks()->create([
            ...$data,
            'priority' => $data['priority'] ?? 'low',
            'progress' => $data['progress'] ?? 0,
            'position' => $position,
        ]);

        return (new TaskResource($task->load('board')))
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, Task $task): TaskResource
    {
        abort_unless($task->user_id === $request->user()->id, 404);

        $task->update($this->validateTask($request, true));

        return new TaskResource($task->load('board'));
    }

    public function toggle(Request $request, Task $task): TaskResource
    {
        abort_unless($task->user_id === $request->user()->id, 404);

        $task->update([
            'completed' => ! $task->completed,
            'progress' => ! $task->completed ? 100 : min($task->progress, 100),
        ]);

        return new TaskResource($task->load('board'));
    }

    public function destroy(Request $request, Task $task): JsonResponse
    {
        abort_unless($task->user_id === $request->user()->id, 404);

        $task->delete();

        return response()->json(['message' => 'Task deleted']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer'],
        ]);

        $user = $request->user();

        DB::transaction(function () use ($data, $user): void {
            foreach (array_values($data['ids']) as $i => $id) {
                $user->tasks()
                    ->whereKey($id)
                    ->update(['position' => $i]);
            }
        });

        return response()->json(['message' => 'Reordered']);
    }

    private function validateTask(Request $request, bool $partial = false): array
    {
        $sometimes = $partial ? 'sometimes' : '';

        return $request->validate([
            'title' => [$sometimes, 'string', 'max:255'],
            'description' => ['nullable', $sometimes, 'string'],
            'completed' => [$sometimes, 'boolean'],
            'priority' => [$sometimes, Rule::in(['low', 'medium', 'high'])],
            'category' => ['nullable', $sometimes, 'string', 'max:40'],
            'tag' => ['nullable', $sometimes, 'string', 'max:40'],
            'progress' => [$sometimes, 'integer', 'min:0', 'max:100'],
            'due_at' => ['nullable', $sometimes, 'date'],
            'remind_at' => ['nullable', $sometimes, 'date'],
            'board_id' => ['nullable', $sometimes, Rule::exists('boards', 'id')->where('user_id', $request->user()->id)],
        ]);
    }
}
