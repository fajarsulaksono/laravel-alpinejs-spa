// Wajib di-import paling pertama (lihat resources/js/app.js).
// Membuat Alpine tersedia global sehingga bagian vanilla (login & panel)
// juga bisa memakai Alpine.store(...).
//
// Alpine.start() TIDAK dipanggil di sini — ditunda sampai bagian member
// pertama kali tampil (window.startMember). Ini analog alpine-global.js
// + "window.startPortal = () => Alpine.start()" pada hris-adsy.
import Alpine from 'alpinejs';

window.Alpine = Alpine;