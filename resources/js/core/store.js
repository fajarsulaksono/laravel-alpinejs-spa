// ============================================================
// Global store Alpine — analog Alpine.store('app') pada hris-adsy
// (resources/js/quanta/portal.js).
//
// Dipegang store ini:
//  • user  : data sesi (dari window.CFG saat render server, atau hasil login)
//  • route : halaman aktif bagian member + params — diparse dari hash
//  • db    : "snapshot" data yang dibaca SEMUA tampilan (bagian member lewat
//            Alpine, bagian panel vanilla lewat window.Alpine.store('app'))
//  • aksi  : login/logout/loadState + CRUD catatan
// ============================================================

import { api } from './api.js';
import { Nav } from './nav.js';

const TOKEN_KEY = 'sample.session';
const USER_KEY = 'sample.user';

// ---------------------------------------------------------------------------
// Tema (terang/gelap/system). Bagian vanilla memakai store yang sama, jadi
// satu klik tema di login/panel langsung terasa di bagian member juga.
// ---------------------------------------------------------------------------
const THEME_KEY = 'sample.theme';

function applyTheme(mode) {
    const dark = mode === 'dark' || (mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
}

Alpine.store('theme', {
    mode: localStorage.getItem(THEME_KEY) || 'system',
    get isDark() {
        return document.documentElement.classList.contains('dark');
    },
    set(mode) {
        this.mode = mode;
        localStorage.setItem(THEME_KEY, mode);
        applyTheme(mode);
    },
    toggle() {
        this.set(this.isDark ? 'light' : 'dark');
    },
    init() {
        applyTheme(this.mode);
        matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(this.mode));
    },
});

// ---------------------------------------------------------------------------
// Store aplikasi
// ---------------------------------------------------------------------------
Alpine.store('app', {
    user: window.CFG?.user ?? JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
    route: { name: 'home', params: {} },
    ready: false, // db sudah dimuat dari server?
    busy: false,
    toast: null,
    online: navigator.onLine,
    db: { notes: [] },

    init() {
        window.addEventListener('hashchange', () => this.parseRoute());
        window.addEventListener('online', () => (this.online = true));
        window.addEventListener('offline', () => (this.online = false));
        this.parseRoute();
        if (this.user && !this.ready) this.loadState();
    },

    // Snapshot data dari server — analog Store.fetch() / GET /state.
    async loadState() {
        try {
            const s = await api('/state');
            this.db.notes = s.notes ?? [];
            this.ready = true;
        } catch (e) {
            this.notify('Failed to load data: ' + e.message, 'bad');
        }
    },

    setUser(u) {
        this.user = u;
        window.CFG.user = u;
        if (u === null) {
            localStorage.removeItem(USER_KEY);
        } else {
            localStorage.setItem(USER_KEY, JSON.stringify(u));
        }
    },

    async login(email, password) {
        this.busy = true;
        try {
            const d = await api('/login', { method: 'POST', body: { email, password } });
            localStorage.setItem(TOKEN_KEY, '1');
            this.setUser(d.user);
            this.ready = false;
            await this.loadState();
            // pilih bagian tujuan sesuai level pengguna
            Nav.go(d.user.level === 'member' ? '#/member/' : '#/panel/');
        } finally {
            this.busy = false;
        }
    },

    async logout(silent = false) {
        if (!silent) {
            try {
                await api('/logout', { method: 'POST' });
            } catch {
                /* sesi mungkin sudah habis */
            }
        }
        localStorage.removeItem(TOKEN_KEY);
        this.setUser(null);
        this.ready = false;
        this.db = { notes: [] };
        Nav.go('#/login');
    },

    go(path) {
        Nav.go('#/member' + path);
    },

    parseRoute() {
        const h = (Nav.hash() || '#/').replace(/^#/, '');
        if (!h.startsWith('/member')) return;

        if (!this.user) {
            Nav.go('#/login');
            return;
        }
        if (h.endsWith('/login')) {
            Nav.go('#/login'); // bagian member tidak punya halaman login
            return;
        }
        if (!this.ready) this.loadState();

        const seg = h.split('/').filter(Boolean);
        seg.shift(); // buang 'member'
        const map = { '': 'home', notes: 'notes', profile: 'profile' };
        this.route = { name: map[seg[0] || ''] || 'home', params: seg.slice(1) };
        window.scrollTo(0, 0);
    },

    notify(msg, type = 'ok') {
        this.toast = { msg, type };
        clearTimeout(this._t);
        this._t = setTimeout(() => (this.toast = null), 3500);
    },

    // ---- aksi data (dipakai halaman member via Alpine & panel via vanilla) ----
    async addNote(title) {
        if (!String(title).trim()) return this.notify('Title must not be empty', 'bad');
        try {
            const n = await api('/notes', { method: 'POST', body: { title } });
            this.db.notes.unshift(n);
            this.notify('Note created');
        } catch (e) {
            this.notify(e.message, 'bad');
        }
    },

    async toggleNote(id) {
        const n = this.db.notes.find((x) => x.id === id);
        if (!n) return;
        try {
            const d = await api(`/notes/${id}/toggle`, { method: 'POST' });
            n.done = d.done;
        } catch (e) {
            this.notify(e.message, 'bad');
        }
    },

    async deleteNote(id) {
        try {
            await api(`/notes/${id}`, { method: 'DELETE' });
            this.db.notes = this.db.notes.filter((x) => x.id !== id);
        } catch (e) {
            this.notify(e.message, 'bad');
        }
    },
});