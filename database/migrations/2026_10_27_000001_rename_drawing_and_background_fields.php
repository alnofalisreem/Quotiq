<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->renameColumn('strokes', 'drawing_data');
            $table->renameColumn('tone', 'background_color');
        });
        Schema::table('quote_collections', function (Blueprint $table) {
            $table->renameColumn('tone', 'background_color');
        });
    }

    public function down(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->renameColumn('drawing_data', 'strokes');
            $table->renameColumn('background_color', 'tone');
        });
        Schema::table('quote_collections', function (Blueprint $table) {
            $table->renameColumn('background_color', 'tone');
        });
    }
};
