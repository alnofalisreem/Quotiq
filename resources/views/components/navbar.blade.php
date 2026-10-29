@props(['page' => ''])
<header class="site-header">
    <nav class="nav-shell" aria-label="Main navigation">
        <a class="brand" href="{{ url('/') }}" aria-label="Quotiq home">
            <img src="{{ asset('images/quotiq-logo.jpeg') }}" alt="Quotiq" width="180"
                height="63">
        </a>
        <div class="nav-links">
            <a href="{{ url('/') }}" class="{{ $page === 'Home' ? 'active' : '' }}">
                <x-icon name="home" /> Home</a>
            <a href="{{ url('/') . '#explore' }}">
                <x-icon name="compass" /> Explore</a>
            <a href="{{ route('collections') }}" data-member-link>
                <x-icon name="folder" />
                Collections</a>
            @if (in_array($page, ['Preview', 'My quotes', 'Favorites', 'Reposts', 'Collections']))
                <a href="{{ route('preview') }}#draw">
                    <x-icon name="palette" /> Card
                    Studio</a>
            @else
                <button data-auth="Create your own quote card">
                    <x-icon name="palette" /> Card Studio</button>
            @endif
        </div>
        <label class="search-box">
            <x-icon name="search" />
            <input id="quote-search" type="search" enterkeyhint="search"
                placeholder="Search quotes…" aria-label="Search quotes" autocomplete="off">
        </label>
        <div class="account-links">
            <a class="login-link" href="{{ url('/login') }}">Log in</a>
            <a class="signup-link" href="{{ url('/signup') }}">Sign up <x-icon name="arrow" />
            </a>
        </div>
        <div class="user-account" id="user-account" hidden>
            <button id="account-menu-toggle" class="account-menu-toggle" type="button"
                aria-expanded="false" aria-controls="account-dropdown"><span class="account-avatar">
                    <x-icon name="user" /></span><span
                    class="account-display-name">{{ auth()->user()?->name ?? 'Your name' }}</span>
                <svg class="account-chevron" viewBox="0 0 20 20" fill="none"
                    stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <path d="m5 8 5 5 5-5" />
                </svg>
            </button>
            <nav id="account-dropdown" class="account-dropdown" aria-label="Your account" hidden>
                <a href="{{ route('my-quotes') }}">
                    <x-icon name="pen" /> My quotes</a>
                <a href="{{ url('/favorites') }}">
                    <x-icon name="heart" /> Favorites</a>
                <a href="{{ url('/reposts') }}">
                    <x-icon name="repost" /> Reposts</a>
                <form action="{{ route('logout') }}" method="POST" class="logout-form">
                    @csrf
                    <button type="submit">Log out</button>
                </form>
            </nav>
        </div>
        <button type="button" class="mobile-menu-button icon-button" aria-label="Open navigation"
            aria-expanded="false" aria-controls="mobile-nav">
            <x-icon name="menu" />
        </button>
    </nav>
    <nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation" hidden>
        <a class="mobile-nav-home" href="{{ url('/') }}">
            <x-icon name="home" /> Home</a>
        <a href="{{ url('/') . '#explore' }}">
            <x-icon name="compass" /> Explore</a>
        @auth
            <a href="{{ route('preview') }}#draw">
                <x-icon name="palette" /> Card Studio</a>
        @else
            <button type="button" data-auth="Create your own quote card">
                <x-icon name="palette" /> Card
                Studio</button>
        @endauth
        <a href="{{ route('collections') }}" data-member-link>
            <x-icon name="folder" />
            Collections</a>
    </nav>
</header>
