<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppNotification extends Model
{
    protected $table = 'app_notifications';

    protected $fillable = ['user_id', 'type', 'title', 'body', 'scheduled_at', 'read_at_flag'];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'read_at_flag' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
