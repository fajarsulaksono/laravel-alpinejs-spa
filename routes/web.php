<?php

use App\Http\Controllers\ApiController;
use App\Http\Controllers\ShellController;
use Illuminate\Support\Facades\Route;

// ============================================================
// SAMPLE — Laravel + AlpineJS SPA shell
//
// Semua URL (login|panel|member)(/.*)? mengembalikan SATU halaman
// shell yang sama. "Routing" sesungguhnya terjadi di browser oleh
// custom router Nav (lihat resources/js/app.js & core/nav.js):
//   #/login      -> layar login  (vanilla JS)
//   #/panel/...  -> bagian panel  (vanilla JS, halaman = fungsi)
//   #/member/... -> bagian member (AlpineJS, x-if per halaman)
//
// Pola shell-SPA ini analog dengan hris-adsy (routes/web.php):
// catch-all route ke shell + API JSON sesi/data.
// ============================================================

Route::get('/', ShellController::class)->name('shell');
Route::get('/{route}', ShellController::class)
    ->where('route', '(login|panel|member)(/.*)?')
    ->name('shell.route');

// API sesi + data (same-origin, CSRF lewat header X-XSRF-TOKEN).
Route::prefix('api')->name('api.')->group(function () {
    Route::post('login', [ApiController::class, 'login'])->middleware('throttle:10,1')->name('login');

    Route::middleware('auth')->group(function () {
        Route::post('logout', [ApiController::class, 'logout'])->name('logout');
        Route::get('state', [ApiController::class, 'state'])->name('state');

        Route::post('notes', [ApiController::class, 'storeNote'])->name('notes.store');
        Route::post('notes/{note}/toggle', [ApiController::class, 'toggleNote'])->name('notes.toggle');
        Route::delete('notes/{note}', [ApiController::class, 'deleteNote'])->name('notes.destroy');
    });
});

// Path tak dikenal diarahkan ke shell.
Route::fallback(fn () => redirect('/'));