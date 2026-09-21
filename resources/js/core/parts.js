// ============================================================
// Komponen halaman bagian member — analog Alpine.data('xxxPage', ...)
// pada hris-adsy (resources/js/quanta/portal.js).
//
// Setiap <main x-data="namaPage"> di member-body.blade.php dicocokkan ke
// pendaftaran di sini. Pendaftaran terjadi SEBELUM Alpine.start() — Alpine
// sudah menerimanya saat start.
// ============================================================

Alpine.data('homePage', () => ({
    get user() {
        return Alpine.store('app').user;
    },
    get db() {
        return Alpine.store('app').db;
    },
    get doneCount() {
        return this.db.notes.filter((n) => n.done).length;
    },
    openNotes() {
        Alpine.store('app').go('/notes');
    },
}));

Alpine.data('notesPage', () => ({
    title: '',
    get list() {
        return Alpine.store('app').db.notes;
    },
    get doneCount() {
        return this.list.filter((n) => n.done).length;
    },
    add() {
        const st = Alpine.store('app');
        st.addNote(this.title);
        this.title = '';
    },
    toggle(n) {
        Alpine.store('app').toggleNote(n.id);
    },
}));

Alpine.data('profilePage', () => ({
    get user() {
        return Alpine.store('app').user;
    },
    logout() {
        Alpine.store('app').logout();
    },
}));