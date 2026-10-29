<?php

namespace App\Http\Controllers;

use App\Http\Requests\CollectionRequest;
use App\Models\QuoteCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CollectionController extends Controller
{
    public function index()
    {
        return view('collections', ['page' => 'Collections']);
    }

    public function show(Request $request, QuoteCollection $collection)
    {
        abort_unless($collection->user_id === $request->user()->id, 404);

        return view('collections', ['page' => 'Collections', 'collectionId' => $collection->id]);
    }

    public function store(CollectionRequest $request)
    {
        $collection = $request->user()->collections()->make();
        $data = $request->validated();
        if (isset($data['id'])) {
            $collection->id = $data['id'];
        }
        $this->save($collection, $data);

        return response()->json(['saved' => true, 'id' => $collection->id], 201);
    }

    public function update(CollectionRequest $request, QuoteCollection $collection)
    {
        abort_unless($collection->user_id === $request->user()->id, 403);
        $this->save($collection, $request->validated());

        return response()->json(['saved' => true]);
    }

    public function destroy(Request $request, QuoteCollection $collection)
    {
        abort_unless($collection->user_id === $request->user()->id, 403);
        $collection->delete();

        return response()->json(['saved' => true]);
    }

    private function save(QuoteCollection $collection, array $data): void
    {
        DB::transaction(function () use ($collection, $data) {
            $collection->fill([
                'name' => $data['name'],
                'normalized_name' => $data['normalized_name'],
                'background_color' => $data['background_color'] ?? ($collection->background_color ?? 'green'),
            ]);
            $collection->save();
            $collection->quotes()->sync(array_values(array_unique($data['quoteIds'])));
        });
    }
}
