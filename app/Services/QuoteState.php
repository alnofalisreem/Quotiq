<?php

namespace App\Services;

use App\Models\Quote;
use App\Models\QuoteCollection;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class QuoteState
{
    public function snapshot(?User $user): array
    {
        // Expiry is enforced on reads, not by a browser timer or scheduled job alone.
        Quote::whereNotNull('expires_at')->where('expires_at', '<=', now())->delete();
        $public = Quote::active()->with('user')->latest()->get();
        $state = [
            'public' => $public->map(fn ($quote) => $quote->payload($user?->id))->values()->all(),
            'posts' => [],
            'favorites' => [],
            'reposts' => [],
            'collections' => [],
            'goldenAvailableAt' => $user?->fresh()->golden_available_at?->getTimestampMs(),
        ];
        if (! $user) {
            return $state;
        }
        $state['posts'] = $public
            ->where('user_id', $user->id)
            ->map(fn ($q) => $q->payload($user->id))
            ->values()
            ->all();
        $byId = $public->keyBy('id');
        foreach (['favorites', 'reposts'] as $kind) {
            $ids = DB::table($kind)
                ->where('user_id', $user->id)
                ->orderByDesc('created_at')
                ->pluck('quote_id');
            foreach ($ids as $id) {
                if (! ($q = $byId->get($id))) {
                    continue;
                }
                $owned = $q->user_id === $user->id;
                $state[$kind][] = array_merge($q->payload($user->id), [
                    'id' => ($owned ? 'own-' : 'quote-').$q->id,
                    'kind' => $owned ? 'own' : 'community',
                    'sourceId' => $q->id,
                ]);
            }
        }
        $state['collections'] = QuoteCollection::where('user_id', $user->id)
            ->with('quotes')
            ->latest()
            ->get()
            ->map(
                fn ($collection) => [
                    'id' => (string) $collection->id,
                    'name' => $collection->name,
                    'background_color' => $collection->background_color,
                    'createdAt' => $collection->created_at->toISOString(),
                    'quoteIds' => $collection->quotes->pluck('id')->all(),
                ],
            )
            ->all();

        return $state;
    }
}
