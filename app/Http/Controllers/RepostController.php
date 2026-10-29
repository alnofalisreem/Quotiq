<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use Illuminate\Http\Request;

class RepostController extends Controller
{
    public function index()
    {
        return view('my-quotes', ['page' => 'Reposts']);
    }

    public function store(Request $request, Quote $quote)
    {
        abort_if($quote->expires_at?->isPast(), 410);
        abort_if(
            $quote->user_id === $request->user()->id,
            422,
            'You cannot repost your own quote.',
        );
        $request
            ->user()
            ->repostedQuotes()
            ->syncWithoutDetaching([$quote->id]);

        return response()->json(['saved' => true]);
    }

    public function destroy(Request $request, Quote $quote)
    {
        $request->user()->repostedQuotes()->detach($quote->id);

        return response()->json(['saved' => true]);
    }
}
