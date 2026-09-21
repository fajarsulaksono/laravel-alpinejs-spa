<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

/**
 * Shell SPA — satu halaman yang berisi tiga bagian (login · panel · member).
 *
 * Analog AppController pada hris-adsy: menyuntikkan window.CFG (jembatan
 * server → client) lalu mengembalikan view shell yang sama untuk semua rute.
 */
class ShellController extends Controller
{
    public function __invoke(Request $request): View
    {
        $user = $request->user();

        return view('shell', ['cfg' => [
            'appName' => 'SPA Shell',
            'version' => 'v1',
            'base' => rtrim($request->getBasePath(), '/'), // '' atau '/subfolder'
            'user' => $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'level' => $user->level,
            ] : null,
            'demoLogin' => true,
        ]]);
    }
}