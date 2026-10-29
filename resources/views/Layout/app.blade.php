<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#151515">
    <meta name="description"
        content="Discover words worth keeping. Find daily inspiration and collect meaningful quotes with Quotiq.">
    <title>
        @yield('title', 'Quotiq')</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body data-user-id="{{ auth()->id() ?? '' }}" data-user-name="{{ auth()->user()?->name ?? 'You' }}"
    data-authenticated="{{ auth()->check() ? 'true' : 'false' }}">
    @php($quotiqState = $quotiqState ?? app(\App\Services\QuoteState::class)->snapshot(auth()->user()))
    <script id="quotiq-state" type="application/json">{!! \Illuminate\Support\Js::encode($quotiqState) !!}</script>
    <a class="skip-link" href="#main-content">Skip to
        content</a>
    <x-navbar :page="$page ?? ''" />
    <main id="main-content">
        @yield('content')</main>
</body>

</html>
