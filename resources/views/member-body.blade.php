{{-- ============================================================
     Bagian MEMBER — dihidupkan oleh AlpineJS.
     Seluruh isi file ini DIBIARKAN APA ADANYA oleh Blade (blok raw), karena
     memakai sintaks {{ }} dan at-directive milik Alpine/JS.

     Pola analog 'portal-body.blade.php' pada hris-adsy:
     satu <template x-if> per halaman, dipilih lewat
     $store.app.route.name hasil parseRoute(). Komponen x-data="xxx"
     didaftarkan di resources/js/core/parts.js.
     ============================================================ --}}
@verbatim

<div>
    <!-- toast dari $store.app.notify -->
    <div x-show="$store.app.toast" x-transition
         class="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-4">
        <div class="rounded-md border bg-card px-4 py-2 text-sm font-medium shadow-lg"
             :class="$store.app.toast?.type === 'bad' ? 'text-destructive' : 'text-foreground'"
             x-text="$store.app.toast?.msg"></div>
    </div>

    <!-- Beranda -->
    <template x-if="$store.app.route.name === 'home'">
        <main class="page-enter min-h-screen pb-24" x-data="homePage">
            <header class="flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur">
                <h1 class="text-sm font-semibold">Member Area</h1>
                <div class="flex items-center gap-2">
                    <span class="text-xs text-muted-foreground">AlpineJS</span>
                    <button type="button" class="c-btn c-btn-ghost c-btn-sm" @click="$store.theme.toggle()"
                            x-text="$store.theme.isDark ? '☀' : '☾'"></button>
                </div>
            </header>
            <div class="mx-auto max-w-md space-y-6 px-4 py-6">
                <div class="space-y-1">
                    <h2 class="text-2xl font-semibold tracking-tight">Halo, <span x-text="user.name"></span></h2>
                    <p class="text-sm text-muted-foreground">Bagian ini dirender oleh Alpine. Router mem-parse hash,
                        lalu <code>&lt;template x-if&gt;</code> menukar halaman.</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <button type="button"
                            class="c-card rounded-lg bg-gradient-to-t from-primary/5 to-card p-4 text-left shadow-xs transition-colors hover:border-ring/50"
                            @click="openNotes()">
                        <p class="text-sm text-muted-foreground">Catatan</p>
                        <p class="mt-1 text-2xl font-semibold tabular-nums" x-text="db.notes.length"></p>
                        <p class="mt-2 text-xs text-muted-foreground">total</p>
                    </button>
                    <button type="button"
                            class="c-card rounded-lg bg-gradient-to-t from-primary/5 to-card p-4 text-left shadow-xs transition-colors hover:border-ring/50"
                            @click="openNotes()">
                        <p class="text-sm text-muted-foreground">Selesai</p>
                        <p class="mt-1 text-2xl font-semibold tabular-nums" x-text="doneCount"></p>
                        <p class="mt-2 text-xs text-muted-foreground">dari total</p>
                    </button>
                </div>
            </div>
        </main>
    </template>

    <!-- Catatan (CRUD sederhana, data dari $store.app.db) -->
    <template x-if="$store.app.route.name === 'notes'">
        <main class="page-enter min-h-screen pb-24" x-data="notesPage">
            <header class="flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur">
                <h1 class="text-sm font-semibold">Catatan</h1>
                <span class="c-badge-outline" x-text="doneCount + '/' + list.length"></span>
            </header>
            <div class="mx-auto max-w-md space-y-4 px-4 py-6">
                <form class="flex gap-2" @submit.prevent="add()">
                    <input class="c-input min-w-0 flex-1" type="text" x-model="title" placeholder="Tulis catatan baru…" required>
                    <button class="c-btn c-btn-primary" type="submit">Tambah</button>
                </form>
                <ul class="space-y-2">
                    <template x-for="n in list" :key="n.id">
                        <li class="c-card flex items-center gap-3 rounded-md p-3 shadow-xs" :class="n.done ? 'opacity-60' : ''">
                            <button type="button"
                                    class="flex size-5 shrink-0 items-center justify-center rounded-full border text-xs transition-colors"
                                    :class="n.done ? 'border-primary bg-primary text-primary-foreground' : 'border-input'"
                                    @click="toggle(n)" x-text="n.done ? '✓' : ''"
                                    :aria-pressed="n.done ? 'true' : 'false'"></button>
                            <div class="min-w-0 flex-1">
                                <p class="truncate text-sm font-medium"
                                   :class="n.done ? 'text-muted-foreground line-through' : ''"
                                   x-text="n.title"></p>
                                <p class="text-xs text-muted-foreground" x-text="n.done ? 'Selesai' : 'Terbuka'"></p>
                            </div>
                        </li>
                    </template>
                </ul>
                <p class="text-sm text-muted-foreground" x-show="!list.length">Belum ada catatan — buat satu di atas.</p>
            </div>
        </main>
    </template>

    <!-- Profil -->
    <template x-if="$store.app.route.name === 'profile'">
        <main class="page-enter min-h-screen pb-24" x-data="profilePage">
            <header class="flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur">
                <h1 class="text-sm font-semibold">Profil</h1>
                <span class="c-badge-outline">AlpineJS</span>
            </header>
            <div class="mx-auto max-w-md space-y-4 px-4 py-6">
                <div class="c-card flex items-center gap-3 rounded-md p-4 shadow-xs">
                    <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                         x-text="(user.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()"></div>
                    <div class="min-w-0">
                        <p class="truncate text-sm font-semibold" x-text="user.name"></p>
                        <p class="truncate text-xs text-muted-foreground" x-text="user.email"></p>
                    </div>
                    <span class="c-badge-outline ml-auto" x-text="user.level"></span>
                </div>
                <p class="text-sm text-muted-foreground">Navigasi bawah dirender dengan <code>x-for</code>; tautannya
                    memakai <code>#/member/…</code> yang diterjemahkan Nav menjadi URL bersih.</p>
                <button class="c-btn c-btn-destructive w-full" type="button" @click="logout()">Keluar</button>
            </div>
        </main>
    </template>

    <!-- Navigasi bawah: x-for + kondisi aktif berdasarkan $store.app.route.name -->
    <nav class="fixed inset-x-0 bottom-0 border-t bg-card/95 backdrop-blur">
        <div class="mx-auto grid max-w-md grid-cols-3">
            <template x-for="tab in [['home', 'Beranda'], ['notes', 'Catatan'], ['profile', 'Profil']]" :key="tab[0]">
                <a :href="'#/member/' + (tab[0] === 'home' ? '' : tab[0])"
                   class="flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors"
                   :class="$store.app.route.name === tab[0] ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'">
                    <span x-text="tab[0] === 'home' ? '◎' : tab[0] === 'notes' ? '≡' : '✕'"></span>
                    <span x-text="tab[1]"></span>
                </a>
            </template>
        </div>
    </nav>
</div>

@endverbatim