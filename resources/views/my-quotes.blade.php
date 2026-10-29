@extends('Layout.app')
@section('title', $page . ' — Quotiq')
@section('content')
    <div class="account-quotes-page">
        <div class="account-quotes-heading">
            <h1>{{ $page }}</h1>
            @if ($page === 'My quotes')
                <span id="my-quotes-count"></span>
            @else
                <span id="{{ $page === 'Favorites' ? 'favorites-count' : 'reposts-count' }}">0
                    quotes</span>
            @endif
        </div>
        @if ($page === 'My quotes')
            <p id="my-quotes-status" class="workspace-status" role="status">
            </p>
            <p id="my-quotes-empty" class="empty-results" hidden>No quotes yet.</p>
            <div id="my-quotes-list" class="preview-posts">
            </div>
            @vite('resources/js/my-quotes.js')
        @else
            <p id="saved-quotes-status" class="workspace-status" role="status">
            </p>
            <div id="saved-quotes-list" class="saved-quotes-grid"
                data-kind="{{ $page === 'Favorites' ? 'favorites' : 'reposts' }}">
            </div>
            <p id="saved-quotes-empty" class="empty-results">
                {{ $page === 'Favorites' ? 'No favorite quotes yet.' : 'No reposted quotes yet.' }}</p>
        @endif
    </div>
@endsection
