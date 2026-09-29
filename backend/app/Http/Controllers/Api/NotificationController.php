<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = $request->user()->appNotifications()
            ->orderBy('scheduled_at', 'desc')
            ->get()
            ->map(fn (AppNotification $n) => $this->serialize($n));

        return response()->json([
            'items' => $items,
            'unread' => $items->where('read', false)->count(),
        ]);
    }

    public function markRead(Request $request, AppNotification $notification): JsonResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 404);

        $notification->update(['read_at_flag' => true]);

        return response()->json($this->serialize($notification));
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->appNotifications()->update(['read_at_flag' => true]);

        return response()->json(['message' => 'All marked as read']);
    }

    public function destroy(Request $request, AppNotification $notification): JsonResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 404);

        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }

    public function clear(Request $request): JsonResponse
    {
        $request->user()->appNotifications()->delete();

        return response()->json(['message' => 'Notifications cleared']);
    }

    private function serialize(AppNotification $n): array
    {
        return [
            'id' => $n->id,
            'type' => $n->type,
            'title' => $n->title,
            'body' => $n->body,
            'scheduled_at' => $n->scheduled_at?->toIso8601String(),
            'read' => (bool) $n->read_at_flag,
        ];
    }
}
