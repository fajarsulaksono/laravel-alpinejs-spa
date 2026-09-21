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

const SIDEBAR_KEY = 'sample.panel.sidebar';
const ui = { page: 'dashboard', params: [], collapsed: localStorage.getItem(SIDEBAR_KEY) === '1' };

// item navigasi sidebar + topbar (mobile)
const NAV = [
    ['dashboard', 'Ringkasan', '#/panel/', 'ti-layout-dashboard'],
    ['notes', 'Catatan', '#/panel/notes', 'ti-notebook'],
    ['profile', 'Profil', '#/panel/profile', 'ti-user'],
];

function sidebar() {
    const c = ui.collapsed;
    const item = (key, label, href, icon) => {
        const active = ui.page === key;
        const cls = `flex items-center rounded-md text-sm font-medium transition-colors ${
            c ? 'h-9 w-9 justify-center' : 'w-full gap-2 px-3 py-2'
        } ${active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground'}`;
        return `<a href="${href}" title="${c ? label : ''}" aria-label="${c ? label : ''}" class="${cls}">
            <i class="ti text-base leading-none ${icon}"></i>${c ? '' : label}</a>`;
    };

    return `
    <aside class="hidden min-h-screen flex-col gap-1 border-r bg-card py-4 lg:flex ${c ? 'items-center px-2' : 'items-stretch px-4'}">
        <div class="flex items-center gap-2 py-3 ${c ? 'justify-center' : 'px-2'}">
            <i class="ti ti-box text-xl leading-none"></i>
            ${c ? '' : '<div><div class="text-sm font-bold">SPA Shell</div><div class="text-xs text-muted-foreground">panel · vanilla</div></div>'}
        </div>
        ${NAV.map(([k, l, h, i]) => item(k, l, h, i)).join('')}
        <div class="mt-auto space-y-1">
            ${item('member', 'Member (Alpine)', '#/member/', 'ti-sparkles')}
            <button type="button" title="Keluar" aria-label="Keluar" class="c-btn c-btn-ghost ${
                c ? 'h-9 w-9 justify-center px-0' : 'w-full justify-start'
            }" data-action="logout"><i class="ti ti-logout text-base leading-none"></i>${c ? '' : 'Keluar'}</button>
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
            const grid = ui.collapsed ? 'lg:grid-cols-[64px_1fr]' : 'lg:grid-cols-[240px_1fr]';
            $('#panel').innerHTML = `<div class="min-h-screen lg:grid ${grid}">${sidebar()}${content}</div>`;
        } catch (e) {
            $('#panel').innerHTML = `<div class="p-6"><p class="text-sm text-destructive">${e.message}</p></div>`;
            console.error(e);
        }
        window.scrollTo(0, 0);
    },

    state() {
        return Alpine.store('app');
    },

    get collapsed() {
        return ui.collapsed;
    },

    toggleSidebar() {
        ui.collapsed = !ui.collapsed;
        localStorage.setItem(SIDEBAR_KEY, ui.collapsed ? '1' : '0');
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