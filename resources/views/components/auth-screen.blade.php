@props(['mode' => 'login'])
@php($isSignup = $mode === 'signup')
<section class="account-screen account-login" aria-labelledby="account-title">
    <div class="account-decoration" aria-hidden="true">
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
    <div class="account-content">
        <div class="account-intro">
            <p class="eyebrow">{{ $isSignup ? 'JOIN QUOTIQ' : 'WELCOME BACK' }}</p>
            <h1 id="account-title">
                @if ($isSignup)
                    Create <span class="green-text">your</span>
                    <br><span class="orange-text">account.</span>
                @else
                    Good to<br>see <span class="green-text">you</span> <span
                        class="orange-text">again.</span>
                @endif
            </h1>
        </div>
        <div class="account-panel">
            <form class="account-form" action="{{ $isSignup ? url('/signup') : url('/login') }}"
                method="POST">
                @csrf
                <input type="hidden" name="_auth_form" value="1">
                @if ($isSignup)
                    <div class="account-field">
                        @error('name')
                            <p id="name-error" class="auth-error" role="alert">{{ $message }}</p>
                        @enderror
                        <label for="account-name">Name</label>
                        <div class="account-input">
                            <x-icon name="user" />
                            <input id="account-name" name="name"
                                @error('name') aria-invalid="true" aria-describedby="name-error" @enderror
                                value="{{ old('name') }}" type="text" autocomplete="name"
                                placeholder="2–50 letters only" minlength="2" maxlength="50"
                                pattern="[\p{L} ]{2,50}" title="Use 2–50 letters and spaces only"
                                required>
                        </div>
                    </div>
                @endif
                <div class="account-field">
                    @error('email')
                        <p id="email-error" class="auth-error" role="alert">{{ $message }}</p>
                    @enderror
                    <label for="account-email">Email</label>
                    <div class="account-input">
                        <x-icon name="mail" />
                        <input id="account-email" name="email"
                            @error('email') aria-invalid="true" aria-describedby="email-error" @enderror
                            value="{{ old('email') }}" type="email" autocomplete="email"
                            placeholder="you@example.com" required>
                    </div>
                </div>
                <div class="account-field">

                    @error('password')
                        <p id="password-error" class="auth-error" role="alert">{{ $message }}</p>
                    @enderror
                    <label for="account-password">Password</label>
                    <div class="account-input">
                        <x-icon name="lock" />
                        <input id="account-password" name="password"
                            @error('password') aria-invalid="true" aria-describedby="password-error" @enderror
                            type="password"
                            autocomplete="{{ $isSignup ? 'new-password' : 'current-password' }}"
                            placeholder="At least 8 characters" minlength="8" required>
                        <button type="button" class="password-toggle icon-button"
                            aria-label="Show password" aria-pressed="false"
                            aria-controls="account-password">
                            <x-icon name="eye" />
                        </button>
                    </div>
                </div>
                <button type="submit" class="account-submit">
                    {{ $isSignup ? 'Create account' : 'Log in' }}
                </button>
                <p class="account-switch">
                    @if ($isSignup)
                        Already have an account?
                        <a href="{{ url('/login') }}">Log in</a>
                    @else
                        Don’t have an account? <a href="{{ url('/signup') }}">Sign up</a>
                    @endif
                </p>
            </form>
        </div>
    </div>
</section>
