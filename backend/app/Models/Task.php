<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'completed',
        'priority',
        'category',
        'tag',
        'progress',
        'due_at',
        'remind_at',
        'board_id',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'completed' => 'boolean',
            'due_at' => 'datetime',
            'remind_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }
}
