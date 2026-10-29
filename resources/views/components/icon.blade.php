@props(['name'])
<svg {{ $attributes->merge(['class' => 'icon']) }} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true">
    @switch($name)
        @case('pen')
            <path d="m16 3 5 5L8 21H3v-5Z M13 6l5 5" />
        @break

        @case('eraser')
            <path d="m14 3 7 7-10 11H6l-4-4a2 2 0 0 1 0-3L12 3a2 2 0 0 1 2 0ZM7 9l8 8M11 21h10" />
        @break

        @case('user')
            <circle cx="12" cy="7" r="4" />
            <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
        @break

        @case('mail')
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 6 9 7 9-7" />
        @break

        @case('lock')
            <rect x="5" y="10" width="14" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
        @break

        @case('eye')
            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
        @break

        @case('arrow')
            <path d="M4 12h16m-6-6 6 6-6 6" />
        @break

        @case('heart')
            <path
                d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
        @break

        @case('home')
            <path d="m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9" />
        @break

        @case('compass')
            <circle cx="12" cy="12" r="9" />
            <path d="m16 8-2.5 5.5L8 16l2.5-5.5Z" />
        @break

        @case('folder')
            <path d="M3 7V4h6l2 3h10v13H3Z" />
        @break

        @case('palette')
            <path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 0-4 2 2 0 0 1 0-4h3a5 5 0 0 0 5-5c0-3-4-5-9-5Z" />
            <circle cx="7" cy="9" r=".7" />
            <circle cx="11" cy="6" r=".7" />
            <circle cx="16" cy="7" r=".7" />
            <circle cx="6" cy="14" r=".7" />
        @break

        @case('search')
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 5 5" />
        @break

        @case('bookmark')
            <path d="M6 3h12v18l-6-4-6 4Z" />
        @break

        @case('download')
            <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
        @break

        @case('repost')
            <path d="m17 2 4 4-4 4M3 11V8a2 2 0 0 1 2-2h16M7 22l-4-4 4-4m14-1v3a2 2 0 0 1-2 2H3" />
        @break

        @case('menu')
            <path d="M4 6h16M4 12h16M4 18h16" />
        @break
    @endswitch
</svg>
