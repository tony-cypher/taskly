<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function download(Request $request): StreamedResponse
    {
        $user = $request->user();
        $filename = 'todo-export-'.now()->format('Y-m-d-His').'.csv';

        $query = $user->tasks()->with('board')->orderBy('position');

        return response()->streamDownload(function () use ($query): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['id', 'title', 'description', 'board', 'priority', 'category', 'tag', 'progress', 'completed', 'due_at', 'remind_at']);

            foreach ($query->cursor() as $task) {
                /** @var Task $task */
                fputcsv($out, [
                    $task->id,
                    $task->title,
                    $task->description,
                    $task->board?->name,
                    $task->priority,
                    $task->category,
                    $task->tag,
                    $task->progress,
                    $task->completed ? 'yes' : 'no',
                    $task->due_at?->toIso8601String(),
                    $task->remind_at?->toIso8601String(),
                ]);
            }

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }
}
