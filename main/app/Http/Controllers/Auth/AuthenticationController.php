<?php

namespace App\Http\Controllers\Auth;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\SystemAccount;
class AuthenticationController extends Controller
{
    public function index(){
        return Inertia::render('auth/login');
    }

    public function login(Request $request){
        $user = SystemAccount::where('sys_account_id', $request->sys_account_id)
                ->where('is_deleted', false)
                ->first();
        if($user && Hash::check($request->sys_password, $user->sys_password)){
            Auth::login($user);
            $request->session()->regenerate();
            return redirect()->intended('dashboard');

        }else{
            return back()->withErrors([
                'sys_password' => 'The provided credentials do not match our records.',
            ])->onlyInput('sys_account_id');
        }
    }
}