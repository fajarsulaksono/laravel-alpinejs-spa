// ============================================================
// Panel (bagian VANILLA JS) — analog admin-core.js pada hris-adsy.
//
// Berbeda dari bagian member (Alpine), bagian panel TIDAK memakai Alpine:
//  • route()  mem-parse hash (#/panel/notes → page 'notes', params)
//  • render() menaruh hasil fungsi halaman (string HTML) ke #panel
//  • aksi klik ditangani delegasi global lewat atribut data-action
//
// Panel membaca data dari store yang sama dengan bagian member:
// window.Alpine.store('app').db — kedua tampilan selalu konsisten.
// ============================================================

import { Nav } from '../core/nav.js';

const $ = (s) => document.querySelector(s);

const ui = { page: 'dashboard', params: [] };

// item navigasi sidebar + topbar (mobile)
const NAV = [
    ['dashboard', 'Ringkasan', '#/panel/'],
    ['notes', 'Catatan', '#/panel/notes'],
    ['profile', 'Profil', '#/panel/profile'],
];

function sidebar() {
    const items = NAV.map(([key, label, href]) => {
        const active = ui.page === key;
        return `<a href="${href}" class="flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground'
        }">${label}</a>`;
    }).join('');

    return `
    <aside class="hidden min-h-screen flex-col gap-1 border-r bg-card p-4 lg:flex">
        <div class="px-2 py-3">
            <div class="text-sm font-bold">SPA Shell</div>
            <div class="text-xs text-muted-foreground">panel · vanilla</div>
        </div>
        ${items}
        <div class="mt-auto space-y-1">
            <a href="#/member/" class="flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-accent-foreground">Member (Alpine)</a>
            <button type="button" class="c-btn c-btn-ghost w-full justify-start" data-action="logout">Keluar</button>
        </div>
    </aside>
    <div class="flex h-14 items-center justify-between border-b bg-card px-4 lg:hidden">
        <span class="text-sm font-bold">SPA Shell</span>
        <nav class="flex items-center gap-1 text-xs">
            ${NAV.map(([key, label, href]) => `
                <a href="${href}" class="rounded-md px-2 py-1.5 font-medium transition-colors ${ui.page === key ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}">${label}</a>`).join('')}
            <button type="button" class="rounded-md px-2 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-accent/60" data-action="logout" aria-label="Keluar">keluar</button>
        </nav>
    </div>`;
}

export const Panel = {
    // halaman dan aksi diisi oleh pages.js
    pages: {},
    actions: {},

    route() {
        const seg = Nav.hash().replace(/^#\/?/, '').split('/').filter(Boolean);
        if (seg[0] !== 'panel') return null;
        ui.page = seg[1] || 'dashboard';
        ui.params = seg.slice(2);
        return ui.page;
    },

    render() {
        const page = Panel.pages[ui.page] ? ui.page : 'dashboard';
        ui.page = page;
        try {
            const content = Panel.pages[page]();
            $('#panel').innerHTML = `<div class="min-h-screen page-enter lg:grid lg:grid-cols-[240px_1fr]">${sidebar()}${content}</div>`;
        } catch (e) {
            $('#panel').innerHTML = `<div class="p-6"><p class="text-sm text-destructive">${e.message}</p></div>`;
            console.error(e);
        }
        window.scrollTo(0, 0);
    },

    state() {
        return Alpine.store('app');
    },
};

window.Panel = Panel;

// Delegasi klik global untuk aksi panel (tanpa menempel listener per tombol).
document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = Panel.actions[el.dataset.action];
    if (fn) fn(el);
});