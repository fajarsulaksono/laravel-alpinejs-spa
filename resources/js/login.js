// ============================================================
// Layar login (bagian VANILLA JS) — analog renderLogin pada hris-adsy
// (resources/js/quanta/app.js).
//
// Pola paling sederhana: satu fungsi renderLogin() menaruh HTML ke #login,
// plus dua listener dokumen (click & submit) sebagai "event delegation"
// agar tombol demo / lihat-password / submit jalan tanpa menempel handler.
//
// Gaya UI mengikuti design system shadcn (Tailwind v4).
// ============================================================

import { Nav } from './core/nav.js';

const $ = (s) => document.querySelector(s);

const DEMO = [
    ['Admin', 'admin@example.com', 'password'],
    ['Member', 'member@example.com', 'password'],
];

export function renderLogin(err = '') {
    const chips = DEMO.map(([label, e, p]) => `
        <button type="button" class="c-btn c-btn-outline w-full justify-start" data-login="fill" data-e="${e}" data-p="${p}">
            <span class="font-semibold">${label}</span>
            <span class="ml-auto truncate text-xs text-muted-foreground">${e} / ${p}</span>
        </button>`).join('');

    $('#login').innerHTML = `
    <div class="grid min-h-screen lg:grid-cols-2">
        <div class="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
            <div class="text-lg font-bold">SPA Shell</div>
            <div class="space-y-2">
                <h1 class="text-3xl font-semibold tracking-tight">Laravel + AlpineJS SPA</h1>
                <p class="max-w-sm text-sm text-primary-foreground/70">Satu halaman shell, tiga tampilan: login (vanilla), panel (vanilla), dan member (Alpine) — pola arsitektur yang sama dengan hris-adsy.</p>
            </div>
            <p class="text-xs text-primary-foreground/60">Design system: shadcn · Tailwind v4</p>
        </div>
        <div class="flex items-center justify-center p-6">
            <div class="w-full max-w-sm space-y-6">
                <div class="space-y-1">
                    <h1 class="text-2xl font-semibold tracking-tight">Masuk</h1>
                    <p class="text-sm text-muted-foreground">Login menentukan bagian tujuan berdasarkan level pengguna.</p>
                </div>
                <form class="space-y-4" data-login="form">
                    <div class="space-y-1.5">
                        <label class="c-label" for="login-email">Email</label>
                        <input class="c-input" id="login-email" name="email" type="email" autocomplete="username" required>
                    </div>
                    <div class="space-y-1.5">
                        <label class="c-label" for="login-password">Kata sandi</label>
                        <div class="relative">
                            <input class="c-input pr-16" id="login-password" name="password" type="password" autocomplete="current-password" required>
                            <button type="button" class="absolute inset-y-0 right-1.5 my-auto h-7 rounded px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" data-login="pw">lihat</button>
                        </div>
                    </div>
                    ${err ? `<p class="text-sm text-destructive">${err}</p>` : ''}
                    <button class="c-btn c-btn-primary w-full" type="submit">Masuk</button>
                </form>
                ${window.CFG?.demoLogin === false ? '' : `
                <div class="space-y-2 rounded-md border bg-muted/40 p-4">
                    <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Akun demo</p>
                    <div class="space-y-2">${chips}</div>
                </div>`}
            </div>
        </div>
    </div>`;
}

// klik: isi otomatis akun demo / toggle visibilitas password
document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-login]');
    if (!el) return;

    if (el.dataset.login === 'fill') {
        const f = $('#login form');
        f.email.value = el.dataset.e;
        f.password.value = el.dataset.p;
        f.password.focus();
    }
    if (el.dataset.login === 'pw') {
        const i = $('#login form [name="password"]');
        const show = i.type === 'password';
        i.type = show ? 'text' : 'password';
        el.textContent = show ? 'sembunyi' : 'lihat';
    }
});

// submit form login -> serahkan alur ke store (Nav.go di dalam store memilih bagian).
document.addEventListener('submit', async (e) => {
    const f = e.target.closest('form[data-login="form"]');
    if (!f) return;
    e.preventDefault();
    const btn = f.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    try {
        await Alpine.store('app').login(f.email.value.trim(), f.password.value);
    } catch (err) {
        renderLogin(err.message);
    }
});