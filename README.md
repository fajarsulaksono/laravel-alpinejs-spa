# Laravel + AlpineJS SPA (Shell SPA)

Contoh minimal arsitektur **Shell SPA**: satu halaman Blade yang menyajikan
seluruh aplikasi, lalu "routing" sesungguhnya terjadi di browser.

Pola ini memetakan arsitektur **hris-adsy** (Laravel + AlpineJS, tanpa
Vue/React/Inertia) ke versi generik yang mudah dibaca:

| Konsep | Proyek ini | Padanan di hris-adsy |
| --- | --- | --- |
| Rute server | `routes/web.php` — catch-all `(login\|panel\|member)(/.*)?` | `routes/web.php` `(login\|admin\|portal)(/.*)?` |
| Jembatan server → client | `window.CFG = @json($cfg)` di `shell.blade.php` | `AppController` + `QUANTA_CFG` |
| Router kustom | `resources/js/core/nav.js` (objek `Nav`) | objek `Nav` di `resources/js/quanta/data.js` |
| Bagian vanilla | `login.js`, `panel/*` (fungsi render + event delegation) | layar login & admin |
| Bagian Alpine | `#member` + `<template x-if>` per halaman | portal/member |
| Store global | `Alpine.store('app')`, `Alpine.store('theme')` | `Alpine.store('app')` |
| Bootstrap Alpine tertunda | `window.startMember()` → `Alpine.start()` | `window.startPortal = () => Alpine.start()` |

Satu bundel, **tiga rezim UI** yang hidup berdampingan:

```
#/login      →  #login   →  vanilla JS  (renderLogin)
#/panel/...  →  #panel   →  vanilla JS  (Panel.render)
#/member/... →  #member  →  AlpineJS    (<template x-if>)
```

Login memilih tujuan berdasarkan `level` pengguna: `admin` → panel,
`member` → bagian Alpine.

## Menjalankan

```bash
composer install
cp .env.example .env && php artisan key:generate   # jika .env belum ada
touch database/database.sqlite
php artisan migrate --seed
npm install && npm run build      # atau: npm run dev
php artisan serve
```

Buka <http://127.0.0.1:8000>.

### Akun demo

| Email | Kata sandi | Level | Mendarat di |
| --- | --- | --- | --- |
| `admin@example.com` | `password` | `admin` | `#/panel/` (vanilla) |
| `member@example.com` | `password` | `member` | `#/member/` (Alpine) |

## Alur routing

1. Browser meminta URL apa pun → Laravel mengembalikan **shell yang sama**
   (`ShellController`) dengan `window.CFG`.
2. `routeTop()` (`resources/js/app.js`) membaca `Nav.hash()` dan memilih
   bagian mana yang ditampilkan (`login` / `panel` / `member`).
3. `Nav` bekerja dalam dua mode:
   - **path** (dilayani Laravel): `#/member/notes` diterjemahkan ke URL bersih
     `/member/notes` lewat `history.pushState`, lalu memancarkan event
     `hashchange` sintetis. Semua kode tetap berpikir dalam istilah `#/…`.
   - **hash** (file `file://`): memakai `location.hash` apa adanya.
4. Bagian **member** baru memanggil `Alpine.start()` saat pertama kali
   dibuka; bagian vanilla memakai `window.Alpine.store(...)` yang sama.

## API

Semua endpoint same-origin, JSON, dan dilindungi CSRF lewat header
`X-XSRF-TOKEN` (dibaca dari cookie `XSRF-TOKEN`; helper `api()`).

| Method | Path | Fungsi |
| --- | --- | --- |
| `POST` | `/api/login` | masuk (throttle 10/menit) |
| `POST` | `/api/logout` | keluar |
| `GET` | `/api/state` | sesi + snapshot catatan |
| `POST` | `/api/notes` | buat catatan |
| `POST` | `/api/notes/{note}/toggle` | ubah status selesai |
| `DELETE` | `/api/notes/{note}` | hapus catatan |

## Peta berkas

```
routes/web.php                     catch-all shell + grup /api
app/Http/Controllers/ShellController.php   inject window.CFG
app/Http/Controllers/ApiController.php     sesi + CRUD catatan
app/Models/{User,Note}.php

resources/views/shell.blade.php    shell: #login, #panel, #member
resources/views/member-body.blade.php      template Alpine (blok raw)

resources/js/app.js                entry + routeTop() + show() + startMember
resources/js/core/alpine-global.js window.Alpine (tanpa start)
resources/js/core/nav.js           router Nav (hash ⇄ path)
resources/js/core/api.js           fetch + CSRF
resources/js/core/store.js         store 'app' & 'theme'
resources/js/core/parts.js         Alpine.data halaman member
resources/js/login.js              layar login (vanilla)
resources/js/panel/panel-core.js   sub-router + sidebar + delegasi klik
resources/js/panel/pages.js        fungsi halaman panel

resources/css/app.css              token shadcn (Tailwind v4), .dark, .c-*
```

## UI

Design system bergaya **shadcn** (Tailwind v4): token warna `oklch` di
`:root` / `.dark`, tema gelap lewat kelas `.dark` pada `<html>` (pre-paint
script di shell + `Alpine.store('theme')`), dan beberapa kelas komponen
ringkas (`.c-btn`, `.c-input`, `.c-card`, `.c-badge*`).

## Test

```bash
php artisan test
```

Mencakup: semua subroute mengembalikan shell yang sama, login admin
mendarat di panel, siklus CRUD catatan, dan proteksi catatan milik
pengguna lain.
