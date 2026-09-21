// ============================================================
// Router custom "Nav" — analog object Nav pada hris-adsy
// (resources/js/quanta/data.js, sekitar baris 992-1003).
//
// Semua kode SELALU berpikir dalam tautan hash '#/…'.
//  • mode 'hash' : file HTML dibuka langsung, location.hash dipakai apa adanya.
//  • mode 'path' : dilayani Laravel (window.CFG ada & protokol != file:).
//    Nav menerjemahkan '#/member/x' menjadi URL bersih '/member/x' lewat
//    history.pushState, lalu memancarkan 'hashchange' SINTETIS. Dengan begitu
//    seluruh aplikasi yang mendengarkan 'hashchange' tetap berjalan normal.
// ============================================================

export const Nav = {
    get mode() {
        return window.CFG && location.protocol !== 'file:' ? 'path' : 'hash';
    },

    base() {
        return (window.CFG?.base || '').replace(/\/$/, '');
    },

    hash() {
        if (Nav.mode === 'hash') return location.hash;
        const p = location.pathname.slice(Nav.base().length) || '/';
        return p === '/' ? '' : '#' + p;
    },

    go(h) {
        if (Nav.mode === 'hash') {
            location.hash = h;
            return;
        }
        const path = Nav.base() + String(h).replace(/^#/, '');
        if (location.pathname === path) return; // sudah di rute itu
        history.pushState(null, '', path);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
    },

    init() {
        if (Nav.mode !== 'path') return;

        // tombol back/forward browser
        window.addEventListener('popstate', () => window.dispatchEvent(new HashChangeEvent('hashchange')));

        // tangkap klik pada <a href="#/..."> agar memakai pushState
        document.addEventListener(
            'click',
            (e) => {
                const a = e.target.closest && e.target.closest('a[href^="#/"]');
                if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
                e.preventDefault();
                Nav.go(a.getAttribute('href'));
            },
            true
        );

        // tautan lama #/... → URL bersih (penanda/ribbon lama)
        if (location.hash && location.hash.startsWith('#/')) {
            history.replaceState(null, '', Nav.base() + location.hash.slice(1));
        }
    },
};

Nav.init();