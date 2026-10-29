<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table(
            'users',
            fn (Blueprint $t) => $t->timestamp('golden_available_at')->nullable(),
        );
        Schema::create('quotes', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->text('text')->nullable();
            $t->json('strokes');
            $t->json('design')->nullable();
            $t->longText('card_image')->nullable();
            $t->string('category', 30);
            $t->string('tone', 20)->default('ivory');
            $t->boolean('is_golden')->default(false);
            $t->timestamp('expires_at')->nullable()->index();
            $t->timestamps();
            $t->index(['user_id', 'created_at']);
        });
        foreach (['favorites', 'reposts'] as $table) {
            Schema::create($table, function (Blueprint $t) {
                $t->foreignId('user_id')->constrained()->cascadeOnDelete();
                $t->foreignUuid('quote_id')->constrained()->cascadeOnDelete();
                $t->timestamps();
                $t->primary(['user_id', 'quote_id']);
            });
        }
        Schema::create('quote_collections', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('name', 60);
            $t->string('normalized_name', 60);
            $t->string('tone', 20)->default('green');
            $t->timestamps();
            $t->unique(['user_id', 'normalized_name']);
        });
        Schema::create('collection_quote', function (Blueprint $t) {
            $t->foreignUuid('collection_id')->constrained('quote_collections')->cascadeOnDelete();
            $t->foreignUuid('quote_id')->constrained()->cascadeOnDelete();
            $t->primary(['collection_id', 'quote_id']);
        });
    }

    public function down(): void
    {
        foreach (
            ['collection_quote', 'quote_collections', 'reposts', 'favorites', 'quotes'] as $table
        ) {
            Schema::dropIfExists($table);
        }
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('golden_available_at'));
    }
};
