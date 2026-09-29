<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Notes shipped after the initial launch: users created before this
        // feature get their sample notes on first visit instead of at signup.
        if (! $request->user()->notes_seeded) {
            DemoData::seedNotes($request->user());
            $request->user()->update(['notes_seeded' => true]);
        }

        $notes = $request->user()->notes()
            ->orderByDesc('pinned')
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (Note $n) => $this->serialize($n));

        return response()->json(['data' => $notes]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateNote($request);

        $note = $request->user()->notes()->create($data);

        return response()->json(['data' => $this->serialize($note)], 201);
    }

    public function update(Request $request, Note $note): JsonResponse
    {
        abort_unless($note->user_id === $request->user()->id, 404);

        $note->update($this->validateNote($request, true));

        return response()->json(['data' => $this->serialize($note)]);
    }

    public function pin(Request $request, Note $note): JsonResponse
    {
        abort_unless($note->user_id === $request->user()->id, 404);

        $note->update(['pinned' => ! $note->pinned]);

        return response()->json(['data' => $this->serialize($note)]);
    }

    public function destroy(Request $request, Note $note): JsonResponse
    {
        abort_unless($note->user_id === $request->user()->id, 404);

        $note->delete();

        return response()->json(['message' => 'Note deleted']);
    }

    private function validateNote(Request $request, bool $partial = false): array
    {
        $sometimes = $partial ? 'sometimes' : '';

        return $request->validate([
            'title' => [$sometimes, 'string', 'max:255'],
            'body' => ['nullable', $sometimes, 'string'],
            'color' => [$sometimes, 'nullable', 'string', 'max:20'],
            'pinned' => [$sometimes, 'boolean'],
        ]);
    }

    private function serialize(Note $n): array
    {
        return [
            'id' => $n->id,
            'title' => $n->title,
            'body' => $n->body,
            'color' => $n->color,
            'pinned' => (bool) $n->pinned,
            'created_at' => $n->created_at?->toIso8601String(),
            'updated_at' => $n->updated_at?->toIso8601String(),
        ];
    }
}
