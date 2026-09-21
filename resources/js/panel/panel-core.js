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
    ['dashboard', 'Ringkasan', '#/panel/', 'ti-layout-dashboard'],
    ['notes', 'Catatan', '#/panel/notes', 'ti-notebook'],
    ['profile', 'Profil', '#/panel/profile', 'ti-user'],
];

function sidebar() {
    const items = NAV.map(([key, label, href, icon]) => {
        const active = ui.page === key;
        return `<a href="${href}" class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground'
        }"><i class="ti text-base leading-none ${icon}"></i>${label}</a>`;
    }).join('');

    return `
    <aside class="hidden min-h-screen flex-col gap-1 border-r bg-card p-4 lg:flex">
        <div class="flex items-center gap-2 px-2 py-3">
            <i class="ti ti-box text-xl leading-none"></i>
            <div>
                <div class="text-sm font-bold">SPA Shell</div>
                <div class="text-xs text-muted-foreground">panel · vanilla</div>
            </div>
        </div>
        ${items}
        <div class="mt-auto space-y-1">
            <a href="#/member/" class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-accent-foreground"><i class="ti ti-sparkles text-base leading-none"></i>Member (Alpine)</a>
            <button type="button" class="c-btn c-btn-ghost w-full justify-start" data-action="logout"><i class="ti ti-logout text-base leading-none"></i>Keluar</button>
        </div>
    </aside>
    <div class="flex h-14 items-center justify-between border-b bg-card px-4 lg:hidden">
        <span class="flex items-center gap-2 text-sm font-bold"><i class="ti ti-box text-lg leading-none"></i>SPA Shell</span>
        <nav class="flex items-center gap-1 text-xs">
            ${NAV.map(([key, label, href, icon]) => `
                <a href="${href}" class="flex items-center gap-1 rounded-md px-2 py-1.5 font-medium transition-colors ${ui.page === key ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}"><i class="ti ${icon}"></i>${label}</a>`).join('')}
            <button type="button" class="rounded-md px-2 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-accent/60" data-action="logout" aria-label="Keluar"><i class="ti ti-logout"></i></button>
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