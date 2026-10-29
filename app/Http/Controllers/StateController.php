<?php

namespace App\Http\Controllers;

use App\Services\QuoteState;
use Illuminate\Http\Request;

class StateController extends Controller
{
    public function show(Request $request, QuoteState $state)
    {
        return response()
            ->json($state->snapshot($request->user()))
            ->header('Cache-Control', 'no-store');
    }
}
