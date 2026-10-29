@extends('Layout.app')
@section('title', 'Collections — Quotiq')
@section('content')
    <div class="collections-page" data-collection-id="{{ $collectionId ?? '' }}">
        <a id="collections-back" class="collection-back-button" href="{{ url('/collections') }}"
            aria-label="Back to my collections" title="Back to my collections" hidden>
            <x-icon name="arrow" />
        </a>
        <div class="collections-heading">
            <div>
                <h1 id="collections-title">My collections</h1><span id="collections-count">0
                    collections</span>
            </div>
            <button id="collection-create" class="button button-primary">+ Create
                collection</button>
        </div>
        <p id="collections-status" class="workspace-status" role="status">
        </p>
        <div id="collections-list" class="collections-list">
        </div>
        <p id="collections-empty" class="empty-results" hidden>No collections yet. Create a collection
            to
            keep your quotes together.</p>
        <button id="collection-add" class="collection-add" hidden><span
                aria-hidden="true">+</span><span>Add your quote here</span>
        </button>
        <div id="collection-quotes" class="preview-posts">
        </div>
    </div>
    <dialog id="collection-name-dialog" class="collection-dialog"
        aria-labelledby="collection-name-title">
        <button class="dialog-close icon-button" data-close-dialog
            aria-label="Close collection dialog">×</button>
        <h2 id="collection-name-title">Create collection</h2>
        <form id="collection-name-form">
            <p class="control-label">Suggested names</p>
            <div id="collection-suggestions" class="collection-suggestions">
            </div>
            <label class="control-label" for="collection-name">Collection name</label>
            <input id="collection-name" type="text" maxlength="60"
                placeholder="Or write your own name" required autocomplete="off">
            <p id="collection-name-error" class="workspace-status" role="status">
            </p>
            <div class="collection-dialog-actions">
                <button type="button" class="button button-outline" data-close-dialog>Cancel</button>
                <button id="collection-save-name" class="button button-primary" type="submit">Create
                    collection</button>
            </div>
        </form>
    </dialog>
    <dialog id="collection-picker-dialog" class="collection-dialog quote-picker-dialog"
        aria-labelledby="collection-picker-title">
        <button class="dialog-close icon-button" data-close-dialog
            aria-label="Close quote picker">×</button>
        <h2 id="collection-picker-title">My quotes</h2>
        <p id="quote-picker-empty" class="empty-results" hidden>No quotes yet. Publish a quote first,
            then
            add it here.</p>
        <a id="quote-picker-create" class="text-button" href="{{ route('preview') }}#draw" hidden>Create
            a quote →</a>
        <div id="collection-quote-picker" class="collection-quote-picker">
        </div>
        <p id="collection-picker-status" class="workspace-status" role="status">
        </p>
        <div class="collection-dialog-actions">
            <button class="button button-outline" type="button" data-close-dialog>Cancel</button>
            <button class="button button-primary" id="collection-add-selected" disabled>Add selected
                (0)</button>
        </div>
    </dialog>
    @vite('resources/js/collections.js')
@endsection
