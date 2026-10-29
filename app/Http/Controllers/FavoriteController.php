<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index()
    {
        return view('my-quotes', ['page' => 'Favorites']);
    }

    public function store(Request $request, Quote $quote)
    {
        abort_if($quote->expires_at?->isPast(), 410);
        $request
            ->user()
            ->favoriteQuotes()
            ->syncWithoutDetaching([$quote->id]);

        return response()->json(['saved' => true]);
    }

    public function destroy(Request $request, Quote $quote)
    {
        $request->user()->favoriteQuotes()->detach($quote->id);

        return response()->json(['saved' => true]);
    }
}
