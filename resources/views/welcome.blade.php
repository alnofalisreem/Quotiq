@extends('Layout.app')
@section('title', 'Quotiq')
@section('content')
    <div class="site-shell">
        <section class="hero hero-with-decoration" aria-labelledby="hero-title">
            <div class="account-decoration home-decoration" aria-hidden="true">
                <div class="account-orb orb-orange">
                </div>
                <div class="account-orb orb-green">
                </div>
                <div class="account-ring ring-first">
                </div>
                <div class="account-ring ring-second">
                </div>
                <div class="account-orb orb-bottom">
                </div>
            </div>
            <div class="hero-copy">
                <h1 id="hero-title">Not just quotes.<br><span class="green-text">Pieces</span> <span
                        class="orange-text">of you.</span>
                </h1>
                <p class="hero-description">Discover words worth keeping, collect the quotes that
                    inspire
                    you,<br class="desktop-break"> and turn your favorites into art.</p>
                <div class="hero-actions">
                    <button class="button button-primary" data-auth="Create your own quote card">
                        <x-icon name="arrow" /> Create Your
                        Card</button>
                    <a class="button button-outline" href="#explore">Explore Quotes
                        <x-icon name="arrow" />
                    </a>
                </div>
            </div>
        </section>
        <section id="daily-composer" class="daily-quote daily-composer" aria-labelledby="daily-heading">
            <div class="daily-content">
                <h2 id="daily-heading">GOLDEN DAILY QUOTE</h2>
                <div id="daily-guest">
                    <p>Share one thought for today.</p>
                    <a class="daily-login-link" href="{{ url('/login') }}">Log in to publish</a>
                </div>
                <form id="daily-form" hidden>
                    <label for="daily-text" class="sr-only">Your Golden Daily
                        Quote</label>
                    <textarea id="daily-text" rows="2" maxlength="155"
                        placeholder="What’s your thought for today?" aria-describedby="daily-limit" required>
</textarea>
                    <div class="daily-compose-footer"><span id="daily-limit"><span
                                id="daily-character-count">0</span> / 155 · One golden quote every 24
                            hours</span>
                        <button id="daily-publish" type="submit">Publish <x-icon name="arrow" />
                        </button>
                    </div>
                    <p id="daily-status" role="status">
                    </p>
                </form>
            </div>
        </section>
        <section class="explore-section" id="explore" aria-labelledby="explore-heading">
            <div class="section-heading">
                <div>
                    <p class="eyebrow section-eyebrow">FIND YOUR NEXT FAVORITE</p>
                    <h2 id="explore-heading">Explore Quotes<span class="orange-text">.</span>
                    </h2>
                </div>
                <button class="text-button" id="view-all" aria-expanded="false"><span data-view-all-label>View all</span>
                </button>
            </div>
            <div class="filter-row" aria-label="Filter quotes by category">
                @foreach (array_merge(['All quotes'], \App\Services\QuoteClassifier::CATEGORIES) as $category)
                    <button class="filter-chip {{ $loop->first ? 'active' : '' }}"
                        data-category="{{ $category }}"
                        aria-pressed="{{ $loop->first ? 'true' : 'false' }}">{{ $category }}</button>
                @endforeach
                <span class="results-count" id="results-count" aria-live="polite"></span>
            </div>
            <div class="quote-carousel">
                <button class="carousel-arrow previous" aria-label="Previous quotes">
                    <x-icon name="arrow" />
                </button>
                <div class="quote-grid" id="quote-grid">
                </div>
                <button class="carousel-arrow next" aria-label="Next quotes">
                    <x-icon name="arrow" />
                </button>
            </div>
            <p id="empty-results" class="empty-results" hidden>No quotes found. Try another word or
                category.</p>
        </section>
    </div>
    <dialog id="auth-dialog" class="auth-dialog" aria-label="Log in to continue">
        <button class="dialog-close icon-button" aria-label="Close dialog">×</button>
        <p id="auth-dialog-message">Log in to save your favorites and create something beautiful.</p>
        <a class="button button-primary" href="{{ url('/login') }}">Log in
        </a>
        <p class="dialog-signup">New around here? <a href="{{ url('/signup') }}">Create an account</a>
        </p>
    </dialog>
@endsection
