// ============================================================
// Halaman panel — masing-masing berupa FUNGSI yang mengembalikan string HTML,
// analog pages-*.js pada hris-adsy (pages.dashboard, pages.organisasi, ...).
// Setelah render, aksi dilayani Panel.actions di panel-core.js via data-action.
//
// Gaya UI mengikuti design system shadcn (Tailwind v4).
// ============================================================

import { Panel } from './panel-core.js';

const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[c]));

const initials = (name) =>
    String(name || '?')
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

const head = (title, sub) => `
    <header class="flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:px-8">
        <div class="flex min-w-0 items-center gap-3">
            <button type="button" title="Bentang / ciutkan sidebar" aria-label="Bentang / ciutkan sidebar"
                    class="hidden c-btn c-btn-ghost c-btn-sm px-2 lg:inline-flex" data-action="sidebar">
                <i class="ti text-lg leading-none ${Panel.collapsed ? 'ti-layout-sidebar-left-expand' : 'ti-layout-sidebar-left-collapse'}"></i>
            </button>
            <div class="min-w-0">
                <h1 class="truncate text-sm font-semibold">${title}</h1>
                <p class="hidden truncate text-xs text-muted-foreground sm:block">${sub}</p>
            </div>
        </div>
        <button type="button" class="c-btn c-btn-ghost c-btn-sm" data-action="theme"><i class="ti ti-moon text-base leading-none"></i>Tema</button>
    </header>`;

const stat = (label, value, icon) => `
    <div class="c-card rounded-lg bg-gradient-to-t from-primary/5 to-card p-5 shadow-xs">
        <p class="flex items-center justify-between text-sm text-muted-foreground">
            <span>${label}</span><i class="ti text-lg leading-none text-muted-foreground/70 ${icon}"></i>
        </p>
        <p class="mt-1 text-3xl font-semibold tabular-nums">${value}</p>
    </div>`;

Panel.pages = {};
Panel.actions = {};

// ---- dashboard ----

Panel.pages.dashboard = () => {
    const st = Panel.state();
    const total = st.db.notes.length;
    const done = st.db.notes.filter((n) => n.done).length;

    return `
        ${head('Ringkasan', 'Halaman dirender dari fungsi JS vanilla, tanpa Alpine')}
        <main class="page-enter max-w-5xl space-y-6 p-4 lg:p-8">
            <p class="text-sm text-muted-foreground">Halo, <b class="text-foreground">${esc(st.user.name)}</b> · level <code>${esc(st.user.level)}</code>. Pengguna berlevel <code>admin</code> selalu mendarat di bagian ini.</p>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                ${stat('Total catatan', total, 'ti-notes')}
                ${stat('Selesai', done, 'ti-check')}
                ${stat('Terbuka', total - done, 'ti-circle-dashed')}
            </div>
        </main>`;
};

// ---- catatan (tabel + aksi) ----

Panel.pages.notes = () => {
    const rows = Panel.state()
        .db.notes.map(
            (n) => `
            <tr class="border-b last:border-0 hover:bg-muted/30">
                <td class="p-3 align-middle text-sm font-medium ${n.done ? 'text-muted-foreground line-through' : ''}">${esc(n.title)}</td>
                <td class="p-3 align-middle">${n.done ? '<span class="c-badge-outline gap-1"><i class="ti ti-check"></i>Selesai</span>' : '<span class="c-badge-secondary gap-1"><i class="ti ti-circle-dashed"></i>Terbuka</span>'}</td>
                <td class="p-3 align-middle">
                    <div class="flex justify-end gap-2">
                        <button class="c-btn c-btn-outline c-btn-sm" data-action="toggle" data-id="${n.id}">${n.done ? '<i class="ti ti-arrow-back-up text-sm leading-none"></i>Buka lagi' : '<i class="ti ti-check text-sm leading-none"></i>Tandai'}</button>
                        <button class="c-btn c-btn-destructive c-btn-sm" data-action="delete-note" data-id="${n.id}"><i class="ti ti-trash text-sm leading-none"></i>Hapus</button>
                    </div>
                </td>
            </tr>`
        )
        .join('');

    return `
        ${head('Catatan', 'Data dibaca dari store yang sama dengan bagian member')}
        <main class="page-enter max-w-5xl p-4 lg:p-8">
            <div class="c-card overflow-hidden shadow-xs">
                <table class="w-full caption-bottom text-sm">
                    <thead>
                        <tr class="border-b bg-muted/40">
                            <th class="h-10 px-3 text-left align-middle font-medium text-muted-foreground">Judul</th>
                            <th class="h-10 px-3 text-left align-middle font-medium text-muted-foreground">Status</th>
                            <th class="h-10 px-3 text-right align-middle font-medium text-muted-foreground">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr class="border-b"><td class="p-3 text-sm text-muted-foreground" colspan="3">Belum ada catatan.</td></tr>'}</tbody>
                </table>
            </div>
        </main>`;
};

// ---- profil ----

Panel.pages.profile = () => {
    const u = Panel.state().user;

    return `
        ${head('Profil', 'Contoh halaman dengan kartu & avatar')}
        <main class="page-enter max-w-5xl p-4 lg:p-8">
            <div class="c-card max-w-md space-y-4 rounded-lg p-5 shadow-xs">
                <div class="flex items-center gap-3">
                    <div class="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">${initials(u.name)}</div>
                    <div class="min-w-0">
                        <p class="truncate text-sm font-semibold">${esc(u.name)}</p>
                        <p class="truncate text-xs text-muted-foreground">${esc(u.email)}</p>
                    </div>
                </div>
                <dl class="divide-y border-t">
                    <div class="flex justify-between py-2.5 text-sm">
                        <dt class="flex items-center gap-1.5 text-muted-foreground"><i class="ti ti-shield text-base leading-none"></i>Level</dt>
                        <dd class="font-medium">${esc(u.level)}</dd>
                    </div>
                    <div class="flex justify-between py-2.5 text-sm">
                        <dt class="flex items-center gap-1.5 text-muted-foreground"><i class="ti ti-bolt text-base leading-none"></i>Bagian SPA</dt>
                        <dd class="font-medium">panel · vanilla</dd>
                    </div>
                </dl>
                <button class="c-btn c-btn-destructive w-full" data-action="logout"><i class="ti ti-logout text-base leading-none"></i>Keluar</button>
            </div>
        </main>`;
};

// ---- aksi (data-* klik) ----

Panel.actions.toggle = async (el) => {
    await Panel.state().toggleNote(Number(el.dataset.id));
    Panel.render();
};

Panel.actions['delete-note'] = async (el) => {
    await Panel.state().deleteNote(Number(el.dataset.id));
    Panel.render();
};

Panel.actions.logout = () => {
    Panel.state().logout();
};

Panel.actions.theme = () => {
    Alpine.store('theme').toggle();
};

Panel.actions.sidebar = () => {
    Panel.toggleSidebar();
    Panel.render();
};
