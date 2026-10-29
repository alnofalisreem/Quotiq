<?php

namespace App\Http\Controllers;

use App\Http\Requests\LogoutRequest;
use Illuminate\Support\Facades\Auth;

class LogoutController extends Controller
{
    public function logout(LogoutRequest $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}
