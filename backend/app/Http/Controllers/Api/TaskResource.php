<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'completed' => (bool) $this->completed,
            'priority' => $this->priority,
            'category' => $this->category,
            'tag' => $this->tag,
            'progress' => $this->progress,
            'due_at' => $this->due_at?->toIso8601String(),
            'remind_at' => $this->remind_at?->toIso8601String(),
            'position' => $this->position,
            'board' => $this->whenLoaded('board', fn () => $this->board ? [
                'id' => $this->board->id,
                'name' => $this->board->name,
                'color' => $this->board->color,
            ] : null),
        ];
    }
}
