<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->events();

        if ($from = $request->query('from')) {
            $query->where('starts_at', '>=', $from);
        }

        if ($to = $request->query('to')) {
            $query->where('starts_at', '<=', $to);
        }

        return response()->json(
            $query->orderBy('starts_at')->get()->map(fn (Event $e) => $this->serialize($e))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:40'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'status' => ['nullable', Rule::in(['pending', 'accepted', 'declined'])],
        ]);

        $event = $request->user()->events()->create($data);

        return response()->json($this->serialize($event), 201);
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        abort_unless($event->user_id === $request->user()->id, 404);

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'sometimes', 'string'],
            'location' => ['nullable', 'sometimes', 'string', 'max:255'],
            'category' => ['nullable', 'sometimes', 'string', 'max:40'],
            'starts_at' => ['sometimes', 'date'],
            'ends_at' => ['nullable', 'sometimes', 'date', 'after_or_equal:starts_at'],
            'status' => ['sometimes', Rule::in(['pending', 'accepted', 'declined'])],
        ]);

        $event->update($data);

        return response()->json($this->serialize($event));
    }

    public function rsvp(Request $request, Event $event): JsonResponse
    {
        abort_unless($event->user_id === $request->user()->id, 404);

        $data = $request->validate([
            'status' => ['required', Rule::in(['accepted', 'declined'])],
        ]);

        $event->update(['status' => $data['status']]);

        return response()->json($this->serialize($event));
    }

    public function destroy(Request $request, Event $event): JsonResponse
    {
        abort_unless($event->user_id === $request->user()->id, 404);

        $event->delete();

        return response()->json(['message' => 'Event deleted']);
    }

    private function serialize(Event $e): array
    {
        return [
            'id' => $e->id,
            'title' => $e->title,
            'description' => $e->description,
            'location' => $e->location,
            'category' => $e->category,
            'starts_at' => $e->starts_at?->toIso8601String(),
            'ends_at' => $e->ends_at?->toIso8601String(),
            'status' => $e->status,
        ];
    }
}
