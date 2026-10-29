<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['content', 'drawing_data', 'design', 'card_image', 'category', 'background_color'])]
class Quote extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'drawing_data' => 'array',
            'design' => 'array',
            'is_golden' => 'boolean',
            'expires_at' => 'immutable_datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive(Builder $q): Builder
    {
        return $q->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()));
    }

    public function payload(?int $viewer = null): array
    {
        return [
            'id' => (string) $this->id,
            'text' => $this->content ?? '',
            'drawing_data' => $this->drawing_data ?? [],
            'design' => $this->design,
            'cardImage' => $this->card_image,
            'category' => $this->category,
            'background_color' => $this->background_color,
            'date' => $this->created_at->toISOString(),
            'author' => $this->user->name,
            'isGolden' => $this->is_golden,
            'expiresAt' => $this->expires_at?->getTimestampMs(),
            'owned' => $viewer === $this->user_id,
        ];
    }
}
