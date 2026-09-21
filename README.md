# Laravel + AlpineJS SPA (Shell SPA)

A minimal example of the **Shell SPA** architecture: a single Blade page
that serves the whole application, while the actual "routing" happens in
the browser.

One bundle, **three UI regimes** that live side by side:

```
#/login      →  #login   →  vanilla JS  (renderLogin)
#/panel/...  →  #panel   →  vanilla JS  (Panel.render)
#/member/... →  #member  →  AlpineJS    (<template x-if>)
```

Login picks the destination based on the user's `level`: `admin` → panel,
`member` → the Alpine section.

## Getting started

```bash
composer install
cp .env.example .env && php artisan key:generate   # if .env does not exist yet
touch database/database.sqlite
php artisan migrate --seed
npm install && npm run build      # or: npm run dev
php artisan serve
```

Open <http://127.0.0.1:8000>.

### Demo accounts

| Email | Password | Level | Lands on |
| --- | --- | --- | --- |
| `admin@example.com` | `password` | `admin` | `#/panel/` (vanilla) |
| `member@example.com` | `password` | `member` | `#/member/` (Alpine) |

## Routing flow

1. The browser requests any URL → Laravel returns the **same shell**
   (`ShellController`) with `window.CFG`.
2. `routeTop()` (`resources/js/app.js`) reads `Nav.hash()` and picks which
   section to show (`login` / `panel` / `member`).
3. `Nav` works in two modes:
   - **path** (served by Laravel): `#/member/notes` is translated to the
     clean URL `/member/notes` via `history.pushState`, then a synthetic
     `hashchange` event is dispatched. All code keeps thinking in terms of
     `#/…`.
   - **hash** (opened as a `file://`): uses `location.hash` as is.
4. The **member** section only calls `Alpine.start()` the first time it is
   shown; the vanilla sections use the same `window.Alpine.store(...)`.

## API

All endpoints are same-origin, JSON, and CSRF-protected via the
`X-XSRF-TOKEN` header (read from the `XSRF-TOKEN` cookie; helper `api()`).

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/login` | sign in (throttled at 10/min) |
| `POST` | `/api/logout` | sign out |
| `GET` | `/api/state` | session + notes snapshot |
| `POST` | `/api/notes` | create a note |
| `POST` | `/api/notes/{note}/toggle` | toggle done status |
| `DELETE` | `/api/notes/{note}` | delete a note |

## File map

```
routes/web.php                     catch-all shell + /api group
app/Http/Controllers/ShellController.php   inject window.CFG
app/Http/Controllers/ApiController.php     session + notes CRUD
app/Models/{User,Note}.php

resources/views/shell.blade.php    shell: #login, #panel, #member
resources/views/member-body.blade.php      Alpine template (raw block)

resources/js/app.js                entry + routeTop() + show() + startMember
resources/js/core/alpine-global.js window.Alpine (no start)
resources/js/core/nav.js           Nav router (hash ⇄ path)
resources/js/core/api.js           fetch + CSRF
resources/js/core/store.js         'app' & 'theme' stores
resources/js/core/parts.js         Alpine.data member pages
resources/js/login.js              login screen (vanilla)
resources/js/panel/panel-core.js   sub-router + sidebar + click delegation
resources/js/panel/pages.js        panel page functions

resources/css/app.css              shadcn tokens (Tailwind v4), .dark, .c-*
```

## UI

**shadcn**-style design system (Tailwind v4): `oklch` color tokens in
`:root` / `.dark`, dark mode via the `.dark` class on `<html>` (pre-paint
script in the shell + `Alpine.store('theme')`), plus a few compact
component classes (`.c-btn`, `.c-input`, `.c-card`, `.c-badge*`). Icons use
the **Tabler Icons** webfont (`<i class="ti ti-*">`), bundled locally via
Vite (`@tabler/icons-webfont`).

## Tests

```bash
php artisan test
```

Covers: every subroute returns the same shell, admin login lands on the
panel, the complete notes CRUD cycle, and ownership protection for other
users' notes.