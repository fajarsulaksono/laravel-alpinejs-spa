// ============================================================
// ENTRY bundel — analog resources/js/quanta.js + app.js pada hris-adsy.
//
// URUTAN IMPORT PENTING: modul ES dieksekusi sesuai urutan baris.
//   1. core/alpine-global.js (window.Alpine)        — harus paling pertama
//   2. core/nav.js (router) + core/api.js (fetch)
//   3. core/store.js (Alpine.store) + core/parts.js (Alpine.data)
//   4. login.js (vanilla) + panel/* (vanilla)
//   5. Router tingkat atas (routeTop) didefinisikan di file ini
// ============================================================

import './core/alpine-global.js';
import './core/api.js';
import './core/nav.js';
import './core/store.js';
import './core/parts.js';
import './login.js';
import './panel/panel-core.js';
import './panel/pages.js';

import { Nav } from './core/nav.js';
import { renderLogin } from './login.js';

const $ = (s) => document.querySelector(s);

// Alpine di-start TERTUNDA: baru hidup saat bagian member pertama kali tampil.
// Analog "window.startPortal = () => Alpine.start()" pada hris-adsy.
window.startMember = () => Alpine.start();

function show(which) {
    for (const id of ['login', 'panel', 'member']) {
        $('#' + id).hidden = id !== which;
    }
    document.body.dataset.view = which;
}

async function ensureState() {
    const st = Alpine.store('app');
    if (st.ready) return true;
    if (!st.user) return false;
    try {
        await st.loadState();
        return true;
    } catch {
        return false;
    }
}

// Router tingkat atas — analog routeTop() pada hris-adsy (app.js).
// Mendengarkan 'hashchange' (asli, atau sintetis dari Nav.go) lalu memilih
// bagian mana yang tampil: login / panel (vanilla) / member (Alpine).
async function routeTop() {
    const h = Nav.hash() || '#/login';

    // Bagian yang butuh autentikasi: pastikan state sudah dimuat dulu.
    if (h.startsWith('#/panel') || h.startsWith('#/member')) {
        if (!(await ensureState())) {
            Nav.go('#/login');
            return;
        }
        if (h !== Nav.hash()) return; // rute berubah saat menunggu state
    }

    if (h.startsWith('#/member')) {
        show('member');
        if (!window.__memberStarted) {
            window.__memberStarted = true;
            window.startMember(); // inisialisasi semua x-data/x-if di #member
        } else {
            // sudah start: parse ulang rute agar <template x-if> berpindah halaman
            Alpine.store('app').parseRoute();
        }
        return;
    }

    if (h.startsWith('#/panel')) {
        show('panel');
        window.Panel.route();
        window.Panel.render();
        return;
    }

    // default: layar login
    show('login');
    $('#panel').innerHTML = '';
    renderLogin();
}

window.addEventListener('hashchange', routeTop);

document.addEventListener('DOMContentLoaded', () => {
    if (!Nav.hash()) {
        // belum ada rute: coba pulihkan sesi lalu pilih bagian sesuai level
        const u = window.CFG?.user;
        Nav.go(u ? (u.level === 'member' ? '#/member/' : '#/panel/') : '#/login');
    }
    routeTop();
});