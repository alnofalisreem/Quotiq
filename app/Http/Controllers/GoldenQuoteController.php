<?php

namespace App\Http\Controllers;

use App\Http\Requests\GoldenQuoteRequest;
use App\Services\QuoteClassifier;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class GoldenQuoteController extends Controller
{
    public function store(GoldenQuoteRequest $request, QuoteClassifier $classifier)
    {
        $quote = DB::transaction(function () use ($request, $classifier) {
            $expires = now()->addHours(24);
            $updated = $request
                ->user()
                ->newQuery()
                ->whereKey($request->user()->id)
                ->where(
                    fn ($query) => $query
                        ->whereNull('golden_available_at')
                        ->orWhere('golden_available_at', '<=', now()),
                )
                ->update(['golden_available_at' => $expires]);
            if (! $updated) {
                throw ValidationException::withMessages([
                    'content' => 'You can publish another Golden Daily Quote after 24 hours.',
                ]);
            }
            $quote = $request
                ->user()
                ->quotes()
                ->make([
                    'content' => $request->validated('content'),
                    'drawing_data' => [],
                    'category' => $classifier->classify($request->validated('content')),
                ]);
            $quote->is_golden = true;
            $quote->expires_at = $expires;
            $quote->save();

            return $quote;
        }, 3);

        return response()->json($quote->load('user')->payload($request->user()->id), 201);
    }
}
