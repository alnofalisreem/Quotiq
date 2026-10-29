<?php

namespace App\Http\Controllers;

use App\Http\Requests\QuoteClassificationRequest;
use App\Http\Requests\QuoteRequest;
use App\Models\Quote;
use App\Services\QuoteClassifier;
use App\Services\QuoteState;
use App\Services\QuoteWriter;
use Illuminate\Http\Request;

class QuoteController extends Controller
{
    public function index(Request $request, QuoteState $state)
    {
        return view('welcome', [
            'page' => 'Home',
            'quotiqState' => $state->snapshot($request->user()),
        ]);
    }

    public function mine()
    {
        return view('my-quotes', ['page' => 'My quotes']);
    }

    public function store(QuoteRequest $request, QuoteWriter $writer)
    {
        $quote = $writer->create($request->user(), $request->validated());

        return $request->expectsJson()
            ? response()->json(
                ['saved' => true, 'quote' => $quote->load('user')->payload($request->user()->id)],
                201,
            )
            : redirect()->back();
    }

    public function update(QuoteRequest $request, Quote $quote, QuoteWriter $writer)
    {
        abort_unless($quote->user_id === $request->user()->id, 403);
        $writer->save($quote, $request->validated());

        return $request->expectsJson()
            ? response()->json([
                'saved' => true,
                'quote' => $quote->load('user')->payload($request->user()->id),
            ])
            : redirect()->back();
    }

    public function destroy(Request $request, Quote $quote)
    {
        abort_unless($quote->user_id === $request->user()->id, 403);
        $quote->delete();

        return $request->expectsJson() ? response()->json(['saved' => true]) : redirect()->back();
    }

    public function classify(QuoteClassificationRequest $request, QuoteClassifier $classifier)
    {
        return response()->json([
            'category' => $classifier->classify(
                $request->input('text'),
                $request->boolean('hasDrawing'),
            ),
        ]);
    }
}
