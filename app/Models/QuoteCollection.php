<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class QuoteCollection extends Model
{
    use HasUuids;

    protected $guarded = ['id', 'user_id'];

    public function quotes(): BelongsToMany
    {
        return $this->belongsToMany(Quote::class, 'collection_quote', 'collection_id', 'quote_id');
    }
}
