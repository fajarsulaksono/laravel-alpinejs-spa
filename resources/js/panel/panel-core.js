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
    ['dashboard', 'Dashboard', '#/panel/', 'ti-layout-dashboard'],
    ['notes', 'Notes', '#/panel/notes', 'ti-notebook'],
    ['profile', 'Profile', '#/panel/profile', 'ti-user'],
];

function sidebar() {
    const c = ui.collapsed;
    const item = (key, label, href, icon) => {
        const active = ui.page === key;
        const cls = `flex items-center rounded-md text-base font-medium transition-colors ${
            c ? 'h-10 w-10 justify-center' : 'w-full gap-2.5 px-3 py-2'
        } ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/75 hover:text-sidebar-accent-foreground'}`;
        return `<a href="${href}" title="${c ? label : ''}" aria-label="${c ? label : ''}" class="${cls}">
            <i class="ti text-base leading-none ${icon}"></i>${c ? '' : label}</a>`;
    };

    return `
    <aside class="hidden shrink-0 flex-col bg-sidebar p-3 text-sidebar-foreground lg:sticky lg:top-0 lg:flex lg:h-svh ${c ? 'w-16 items-center gap-1' : 'w-60 gap-1'}">
        <div class="flex items-center gap-2 ${c ? 'justify-center py-2' : 'px-2 py-2.5'}">
            <i class="ti ti-box text-xl leading-none"></i>
            ${c ? '' : '<div><div class="text-base font-bold">SPA Shell</div><div class="text-base text-sidebar-foreground/70">panel · vanilla</div></div>'}
        </div>
        ${NAV.map(([k, l, h, i]) => item(k, l, h, i)).join('')}
        <div class="mt-auto flex flex-col gap-1">
            ${item('member', 'Member (Alpine)', '#/member/', 'ti-sparkles')}
            <button type="button" title="Log out" aria-label="Log out"
                    class="flex items-center rounded-md text-base font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/75 hover:text-sidebar-accent-foreground ${c ? 'size-10 w-10 justify-center' : 'w-full gap-2.5 px-3 py-2'} " data-action="logout"><i class="ti ti-logout text-base leading-none"></i>${c ? '' : 'Log out'}</button>
        </div>
    </aside>
    <div class="flex h-14 items-center justify-between px-4 text-sidebar-foreground lg:hidden">
        <span class="flex items-center gap-2 text-base font-bold"><i class="ti ti-box text-lg leading-none"></i>SPA Shell</span>
        <nav class="flex items-center gap-1 text-base">
            ${NAV.map(([key, label, href, icon]) => `
                <a href="${href}" class="flex items-center gap-1 rounded-md px-2 py-1.5 font-medium transition-colors ${ui.page === key ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground'}"><i class="ti ${icon}"></i>${label}</a>`).join('')}
            <button type="button" class="rounded-md px-2 py-1.5 font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/75" data-action="logout" aria-label="Log out"><i class="ti ti-logout"></i></button>
        </nav>
    </div>`;
}

const header = (title, sub) => `
    <header class="flex h-14 shrink-0 items-center justify-between border-b px-4 lg:px-6">
        <div class="flex min-w-0 items-center gap-3">
            <button type="button" title="Expand / collapse sidebar" aria-label="Expand / collapse sidebar"
                    class="hidden c-btn c-btn-ghost c-btn-sm px-2 lg:inline-flex" data-action="sidebar">
                <i class="ti text-lg leading-none ${Panel.collapsed ? 'ti-layout-sidebar-left-expand' : 'ti-layout-sidebar-left-collapse'}"></i>
            </button>
            <div class="min-w-0">
                <h1 class="truncate text-base font-semibold">${title}</h1>
                <p class="hidden truncate text-base text-muted-foreground sm:block">${sub}</p>
            </div>
        </div>
        <button type="button" class="c-btn c-btn-ghost c-btn-sm" data-action="theme"><i class="ti ti-moon text-base leading-none"></i>Theme</button>
    </header>`;

export const Panel = {
    // halaman, judul halaman, dan aksi diisi oleh pages.js
    pages: {},
    meta: {},
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
            const meta = Panel.meta[page] ?? { title: page, sub: '' };
            const body = Panel.pages[page]();
            $('#panel').innerHTML = `
        <div class="min-h-screen w-full bg-sidebar">
            <div class="flex w-full flex-col gap-2 sm:gap-3 lg:min-h-svh lg:flex-row lg:gap-0">
                ${sidebar()}
                <main class="page-enter m-2 flex w-full min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-background shadow-sm sm:m-3 sm:ml-0 lg:my-3">
                    ${header(meta.title, meta.sub)}
                    <div class="flex-1">${body}</div>
                </main>
            </div>
        </div>`;
        } catch (e) {
            $('#panel').innerHTML = `<div class="p-6"><p class="text-base text-destructive">${e.message}</p></div>`;
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