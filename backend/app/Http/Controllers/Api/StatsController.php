<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        $total = (clone $user->tasks())->count();
        $completed = (clone $user->tasks())->where('completed', true)->count();
        $active = $total - $completed;
        $todayDue = (clone $user->tasks())->whereDate('due_at', today())->count();
        $overdue = (clone $user->tasks())
            ->where('completed', false)
            ->whereNotNull('due_at')
            ->where('due_at', '<', now())
            ->count();

        return response()->json([
            'total' => $total,
            'completed' => $completed,
            'active' => $active,
            'today_due' => $todayDue,
            'overdue' => $overdue,
            'completion_rate' => $total > 0 ? (int) round($completed / $total * 100) : 0,
        ]);
    }
}
