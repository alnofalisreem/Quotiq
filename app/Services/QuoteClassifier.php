<?php

namespace App\Services;

final class QuoteClassifier
{
    public const CATEGORIES = ['Motivation', 'Self-love', 'Life', 'Calm', 'Hope', 'Other', 'Art'];

    private const KEYWORDS = [
        'Motivation' => [
            'discipline',
            'goal',
            'goals',
            'effort',
            'success',
            'work hard',
            'small steps',
            'move forward',
            'move you forward',
            'progress',
            'تحفيز',
            'نجاح',
            'هدف',
            'اجتهاد',
        ],
        'Self-love' => [
            'self love',
            'self-love',
            'yourself',
            'worthy',
            'enough',
            'masterpiece',
            'you are allowed',
            'حب الذات',
            'نفسك',
            'تستحق',
        ],
        'Life' => [
            'life',
            'alive',
            'journey',
            'experience',
            'story',
            'memories',
            'حياة',
            'الحياة',
            'ذكريات',
            'رحلة',
        ],
        'Calm' => [
            'calm',
            'calmer',
            'peace',
            'breathe',
            'slow',
            'patience',
            'take time',
            'one day at a time',
            'own pace',
            'no rush',
            'هدوء',
            'سلام',
            'صبر',
            'تنفس',
        ],
        'Hope' => [
            'hope',
            'tomorrow',
            'believe',
            'new beginning',
            'new beginnings',
            'beginning again',
            'fresh start',
            'better days',
            'أمل',
            'امل',
            'غدا',
            'غداً',
            'بداية',
        ],
    ];

    public function classify(?string $text, bool $hasDrawing = false): string
    {
        $text = mb_strtolower(trim($text ?? ''), 'UTF-8');
        $text = preg_replace("/\s+/u", ' ', $text);

        if ($text === '') {
            return $hasDrawing ? 'Art' : 'Other';
        }

        $category = 'Other';
        $highestScore = 0;

        foreach (self::KEYWORDS as $candidate => $keywords) {
            $score = 0;
            foreach ($keywords as $keyword) {
                $pattern = "/(?<![\p{L}\p{N}])".preg_quote($keyword, '/')."(?![\p{L}\p{N}])/u";
                if (preg_match($pattern, $text)) {
                    $score++;
                }
            }
            // Equal scores keep the first matching category for consistent results.
            if ($score > $highestScore) {
                $category = $candidate;
                $highestScore = $score;
            }
        }

        return $category;
    }
}
