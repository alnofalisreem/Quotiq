<?php

use App\Http\Controllers\CollectionController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\GoldenQuoteController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\LogoutController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\RepostController;
use App\Http\Controllers\SignupController;
use App\Http\Controllers\StateController;
use Illuminate\Support\Facades\Route;

Route::get('/', [QuoteController::class, 'index'])->name('home');
Route::middleware('guest')->group(function () {
    Route::view('/signup', 'Authentication.SignUp', ['page' => 'Sign Up']);
    Route::view('/login', 'Authentication.LogIn', ['page' => 'Log In'])->name('login');
    Route::post('/signup', [SignupController::class, 'signup'])->middleware('throttle:10,1');
    Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:10,1');
});
Route::get('/api/state', [StateController::class, 'show']);
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LogoutController::class, 'logout'])->name('logout');
    Route::view('/preview', 'preview', ['page' => 'Preview'])->name('preview');
    Route::get('/my-quotes', [QuoteController::class, 'mine'])->name('my-quotes');
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::get('/reposts', [RepostController::class, 'index']);
    Route::get('/collections', [CollectionController::class, 'index'])->name('collections');
    Route::get('/collections/{collection}', [CollectionController::class, 'show'])
        ->whereUuid('collection')
        ->name('collections.show');
    Route::middleware('throttle:120,1')->group(function () {
        Route::post('/', [QuoteController::class, 'store']);
        Route::put('/quote/{quote}', [QuoteController::class, 'update'])
            ->whereUuid('quote')
            ->name('edit_quote');
        Route::delete('/quote/{quote}', [QuoteController::class, 'destroy'])
            ->whereUuid('quote')
            ->name('delete_quote');
        Route::post('/preview/classify', [QuoteController::class, 'classify']);
        Route::post('/api/favorites/{quote}', [FavoriteController::class, 'store'])->whereUuid(
            'quote',
        );
        Route::delete('/api/favorites/{quote}', [FavoriteController::class, 'destroy'])->whereUuid(
            'quote',
        );
        Route::post('/api/reposts/{quote}', [RepostController::class, 'store'])->whereUuid('quote');
        Route::delete('/api/reposts/{quote}', [RepostController::class, 'destroy'])->whereUuid(
            'quote',
        );
        Route::post('/api/collections', [CollectionController::class, 'store']);
        Route::put('/api/collections/{collection}', [
            CollectionController::class,
            'update',
        ])->whereUuid('collection');
        Route::delete('/api/collections/{collection}', [
            CollectionController::class,
            'destroy',
        ])->whereUuid('collection');
        Route::post('/api/golden-quotes', [GoldenQuoteController::class, 'store']);
    });
});
