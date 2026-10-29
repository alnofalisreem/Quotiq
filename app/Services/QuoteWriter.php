<?php

namespace App\Services;

use App\Models\Quote;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class QuoteWriter
{
    public function __construct(private QuoteClassifier $classifier) {}

    public function create(User $user, array $data): Quote
    {
        $quote = $user->quotes()->make();
        if (isset($data['id'])) {
            $quote->id = $data['id'];
        }

        return $this->save($quote, $data);
    }

    public function save(Quote $quote, array $data): Quote
    {
        abort_if($quote->exists && $quote->expires_at?->isPast(), 410);
        $drawing_data = $data['drawing_data'] ?? [];
        $design = $data['design'] ?? null;
        $content = trim($data['content'] ?? '');
        if ($quote->is_golden && ($drawing_data || $design)) {
            throw ValidationException::withMessages([
                'design' => 'Golden Daily Quotes support text only and cannot be designed.',
            ]);
        }
        $quote->fill([
            'content' => $content,
            'drawing_data' => $drawing_data,
            'design' => $design,
            'card_image' => $design ? $data['cardImage'] ?? null : null,
            'category' => $this->classifier->classify($content, (bool) $drawing_data),
        ]);
        $quote->save();

        return $quote;
    }
}
