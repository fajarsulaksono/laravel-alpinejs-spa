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

const card = (inner, cls = '') =>
    `<div class="rounded-xl border bg-card p-4 shadow-xs ${cls}">${inner}</div>`;

const cardHead = (title, right = '') => `
    <div class="flex items-center justify-between gap-2">
        <h3 class="text-base font-semibold">${title}</h3>${right}
    </div>`;

const exportBtn = (label = 'Export') =>
    `<button type="button" class="c-btn c-btn-outline c-btn-sm"><i class="ti ti-download text-base leading-none"></i>${label}</button>`;

const rowMenu = (title = 'Open menu') =>
    `<button type="button" title="${title}" aria-label="${title}" class="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"><i class="ti ti-dots-vertical"></i></button>`;

const statusBadge = (status) => {
    const map = {
        processing: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
        paid: 'bg-secondary text-secondary-foreground',
        success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        failed: 'bg-destructive/15 text-destructive',
    };
    return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-base font-medium capitalize ${map[status] ?? 'bg-secondary text-secondary-foreground'}">${status}</span>`;
};

const avatar = (name, i = 0) => {
    const colors = [
        'bg-primary text-primary-foreground',
        'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        'bg-amber-500/15 text-amber-600 dark:text-amber-400',
        'bg-sky-500/15 text-sky-600 dark:text-sky-400',
        'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    ];
    return `<span class="flex size-8 shrink-0 items-center justify-center rounded-full text-base font-semibold ${colors[i % colors.length]}">${initials(name)}</span>`;
};

const miniStat = (label, value, delta, icon, up = true) => `
    <div class="rounded-xl border bg-card p-4 shadow-xs xl:col-span-2">
        <div class="flex items-center justify-between text-base text-muted-foreground">
            <span>${label}</span><i class="ti ${icon} text-lg leading-none text-muted-foreground/70"></i>
        </div>
        <p class="mt-1 text-2xl font-semibold tabular-nums">${value}</p>
        <div class="mt-3 flex items-center gap-1 text-base">
            <span class="inline-flex items-center gap-0.5 font-medium ${up ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}">
                <i class="ti ti-trending-${up ? 'up' : 'down'}"></i>${delta}
            </span>
            <span class="text-muted-foreground">from last month</span>
        </div>
        <a href="#/panel/" class="mt-3 inline-block text-base font-medium text-foreground hover:underline">View more</a>
    </div>`;

const pagination = (label) => `
    <div class="flex flex-wrap items-center justify-between gap-2 border-t p-3 text-base text-muted-foreground">
        <span>${label}</span>
        <div class="flex gap-2">
            <button type="button" class="c-btn c-btn-outline c-btn-sm" disabled>Previous page</button>
            <button type="button" class="c-btn c-btn-outline c-btn-sm">Next page</button>
        </div>
    </div>`;

Panel.pages = {};
Panel.meta = {
    dashboard: { title: 'Dashboard', sub: 'E-commerce overview rendered from vanilla JS functions' },
    notes: { title: 'Notes', sub: 'Data is read from the same store as the member section' },
    profile: { title: 'Profile', sub: 'Sample page with a card & avatar' },
};
Panel.actions = {};

// ---- dashboard (E-commerce, mengikuti shadcnuikit.com/dashboard/ecommerce) ----

Panel.pages.dashboard = () => {
    const st = Panel.state();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const desktop = [4200, 3800, 5100, 4700, 6200, 5400, 7100, 6800, 5900, 7400, 6900, 8200];
    const mobile = [3100, 3600, 4200, 3900, 5200, 4600, 6100, 5700, 5100, 6300, 6000, 7100];
    const revMax = Math.max(...desktop, ...mobile);

    const locations = [
        ['Canada', '+5.2%', 85],
        ['Greenland', '+7.8%', 80],
        ['Russia', '-2.1%', 63],
        ['China', '+3.4%', 60],
        ['Australia', '+1.2%', 45],
        ['Greece', '+1%', 40],
    ];

    const sources = [
        ['Direct', 35, '#171717'],
        ['Social', 25, '#0ea5e9'],
        ['Email', 20, '#8b5cf6'],
        ['Referrals', 12, '#10b981'],
        ['Other', 8, '#f59e0b'],
    ];
    const srcTotal = sources.reduce((s, [, v]) => s + v, 0);
    let srcAcc = 0;
    const donutStops = sources
        .map(([, v, c]) => {
            const from = (srcAcc / srcTotal) * 100;
            srcAcc += v;
            return `${c} ${from}% ${(srcAcc / srcTotal) * 100}%`;
        })
        .join(', ');

    const ratings = [[5, 4000], [4, 2100], [3, 800], [2, 631], [1, 344]];
    const ratMax = 4000;

    const orders = [
        ['#1023', 'Theodore Bell', 'Tire Doodad', '$300.00', 'processing'],
        ['#2045', 'Amelia Grant', 'Engine Kit', '$450.00', 'paid'],
        ['#3067', 'Eleanor Ward', 'Brake Pad', '$200.00', 'success'],
        ['#4089', 'Henry Carter', 'Fuel Pump', '$500.00', 'processing'],
        ['#5102', 'Olivia Harris', 'Steering Wheel', '$350.00', 'failed'],
        ['#6123', 'James Robinson', 'Air Filter', '$180.00', 'paid'],
        ['#7145', 'Sophia Martinez', 'Oil Filter', '$220.00', 'success'],
        ['#8167', 'Liam Thompson', 'Radiator Cap', '$290.00', 'processing'],
    ];

    const products = [
        ['ti-shoe', 'Sports Shoes', '$316.00', 10],
        ['ti-shirt', 'Black T-Shirt', '$274.00', 20],
        ['ti-hanger', 'Jeans', '$195.00', 15],
        ['ti-shoe', 'Red Sneakers', '$402.00', 40],
        ['ti-hanger', 'Red Scarf', '$280.00', 37],
        ['ti-tools-kitchen-2', 'Kitchen Accessory', '$150.00', 18],
        ['ti-bike', 'Bicycle', '$316.00', 25],
        ['ti-shoe', 'Sports Shoes', '$290.00', 12],
    ];

    const emailOf = (name) => name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '') + '@example.com';

    const orderRows = orders
        .map(
            ([id, name, product, amount, status], i) => `
            <tr class="border-b last:border-0 hover:bg-muted/30">
                <td class="p-3 align-middle font-medium">${id}</td>
                <td class="p-3 align-middle">
                    <div class="flex items-center gap-2">
                        ${avatar(name, i)}
                        <div class="min-w-0">
                            <p class="truncate text-base font-medium">${esc(name)}</p>
                            <p class="truncate text-base text-muted-foreground">${emailOf(name)}</p>
                        </div>
                    </div>
                </td>
                <td class="p-3 align-middle text-muted-foreground">${product}</td>
                <td class="p-3 align-middle font-medium tabular-nums">${amount}</td>
                <td class="p-3 align-middle">${statusBadge(status)}</td>
                <td class="p-3 align-middle text-right">${rowMenu()}</td>
            </tr>`
        )
        .join('');

    const productRows = products
        .map(
            ([icon, name, sales, sold]) => `
            <tr class="border-b last:border-0 hover:bg-muted/30">
                <td class="p-3 align-middle">
                    <div class="flex items-center gap-3">
                        <span class="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground"><i class="ti ${icon} text-lg"></i></span>
                        <span class="text-base font-medium">${name}</span>
                    </div>
                </td>
                <td class="p-3 align-middle tabular-nums text-muted-foreground">${sold}</td>
                <td class="p-3 align-middle tabular-nums font-medium">${sales}</td>
                <td class="p-3 align-middle text-right">${rowMenu()}</td>
            </tr>`
        )
        .join('');

    const locRows = locations
        .map(
            ([name, delta, pct]) => `
            <div class="space-y-1.5">
                <div class="flex items-center justify-between text-base">
                    <span class="font-medium">${name}</span>
                    <span class="flex items-center gap-1 text-base ${delta.startsWith('-') ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}">
                        <i class="ti ti-trending-${delta.startsWith('-') ? 'down' : 'up'}"></i>${delta}
                    </span>
                </div>
                <div class="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div class="h-full rounded-full bg-primary" style="width:${pct}%"></div>
                </div>
            </div>`
        )
        .join('');

    const revBars = months
        .map(
            (m, i) => `
            <div class="flex flex-1 flex-col items-center gap-1.5">
                <div class="flex h-44 w-full items-end justify-center gap-0.5">
                    <div class="w-1.5 rounded-t bg-primary" style="height:${Math.round((desktop[i] / revMax) * 100)}%"></div>
                    <div class="w-1.5 rounded-t bg-primary/25" style="height:${Math.round((mobile[i] / revMax) * 100)}%"></div>
                </div>
                <span class="text-[10px] text-muted-foreground">${m}</span>
            </div>`
        )
        .join('');

    return `
        <div class="space-y-4 p-4 lg:p-6">
            <!-- toolbar -->
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2 text-base text-muted-foreground">
                    <i class="ti ti-calendar-event text-base leading-none"></i>
                    <span class="rounded-md border px-2 py-1">Aug 25, 2026 - Sep 21, 2026</span>
                    <span class="hidden sm:inline">Hi, <b class="text-foreground">${esc(st.user.name)}</b></span>
                </div>
                ${exportBtn('Download')}
            </div>

            <!-- promo + mini stats -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-12">
                <div class="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 p-4 text-primary-foreground shadow-xs sm:col-span-2 xl:col-span-6">
                    <i class="ti ti-confetti pointer-events-none absolute -right-3 -top-3 text-7xl opacity-10"></i>
                    <p class="text-lg font-semibold">Congratulations Toby! 🎉</p>
                    <p class="text-base text-primary-foreground/70">Best seller of the month</p>
                    <p class="mt-4 text-3xl font-semibold tabular-nums">$15,231.89</p>
                    <p class="text-base text-primary-foreground/70"><span class="font-medium text-primary-foreground">+65%</span> from last month</p>
                    <button type="button" class="c-btn c-btn-sm mt-4 bg-primary-foreground text-primary hover:bg-primary-foreground/90">View Sales</button>
                </div>
                ${miniStat('MRR', '$34.1K', '6.1%', 'ti-currency-dollar')}
                ${miniStat('Users', '500.1K', '19.2%', 'ti-users')}
                ${miniStat('User growth', '11.3%', '1.2%', 'ti-user-plus')}
            </div>

            <!-- charts -->
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
                ${card(
                    `
                    ${cardHead(
                        'Total Revenue',
                        `<div class="flex items-center gap-2"><span class="text-base font-semibold tabular-nums">$15,231.89</span><span class="inline-flex items-center gap-0.5 text-base font-medium text-emerald-600 dark:text-emerald-400"><i class="ti ti-trending-up"></i>+2.5%</span></div>`
                    )}
                    <div class="mt-3 flex items-center gap-4 text-base text-muted-foreground">
                        <span class="flex items-center gap-1.5"><i class="ti ti-point text-primary"></i>Desktop</span>
                        <span class="flex items-center gap-1.5"><i class="ti ti-point text-primary/30"></i>Mobile</span>
                        <span class="ml-auto">Returning Rate <b class="text-foreground">42.8%</b></span>
                    </div>
                    <div class="mt-4 flex items-end justify-between gap-1">${revBars}</div>
                `,
                    'lg:col-span-6'
                )}
                ${card(
                    `${cardHead('Sales by Location', exportBtn())}<div class="mt-4 space-y-4">${locRows}</div>`,
                    'lg:col-span-3'
                )}
                ${card(
                    `${cardHead('Store Visits by Source', exportBtn())}
                    <div class="mt-4 flex items-center gap-4">
                        <div class="relative size-32 shrink-0 rounded-full" style="background:conic-gradient(${donutStops})">
                            <div class="absolute inset-5 rounded-full bg-card"></div>
                        </div>
                        <div class="min-w-0 flex-1 space-y-2">
                            ${sources
                                .map(
                                    ([label, v, c]) => `
                                <div class="flex items-center gap-2 text-base">
                                    <span class="size-2.5 shrink-0 rounded-full" style="background:${c}"></span>
                                    <span class="truncate text-muted-foreground">${label}</span>
                                    <span class="ml-auto font-medium tabular-nums">${v}%</span>
                                </div>`
                                )
                                .join('')}
                        </div>
                    </div>`,
                    'lg:col-span-3'
                )}
            </div>

            <!-- orders + reviews -->
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <div class="overflow-hidden rounded-xl border bg-card shadow-xs lg:col-span-8">
                    <div class="p-4 pb-0">${cardHead('Recent Orders', exportBtn())}</div>
                    <div class="mt-4 overflow-x-auto">
                        <table class="w-full caption-bottom text-base">
                            <thead>
                                <tr class="border-b bg-muted/40">
                                    <th class="h-10 px-3 text-left align-middle font-medium text-muted-foreground">ID</th>
                                    <th class="h-10 px-3 text-left align-middle font-medium text-muted-foreground">Customer</th>
                                    <th class="h-10 px-3 text-left align-middle font-medium text-muted-foreground">Product</th>
                                    <th class="h-10 px-3 text-left align-middle font-medium text-muted-foreground">Amount</th>
                                    <th class="h-10 px-3 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th class="h-10 px-3 text-right align-middle font-medium text-muted-foreground"><span class="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>${orderRows}</tbody>
                        </table>
                    </div>
                    ${pagination('1 - 8 of 16 orders')}
                </div>
                ${card(
                    `${cardHead('Customer Reviews', '<a href="#/panel/" class="text-base font-medium text-foreground hover:underline">View All</a>')}
                    <div class="mt-4 flex items-center gap-4">
                        <div>
                            <p class="text-4xl font-semibold tabular-nums">4.5</p>
                            <p class="text-base text-muted-foreground">out of 5</p>
                        </div>
                        <div class="flex-1 space-y-1.5">
                            ${ratings
                                .map(
                                    ([star, count]) => `
                                <div class="flex items-center gap-2 text-base">
                                    <span class="w-7 text-muted-foreground">${star} ★</span>
                                    <span class="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><span class="block h-full rounded-full bg-amber-400" style="width:${(count / ratMax) * 100}%"></span></span>
                                    <span class="w-10 text-right tabular-nums text-muted-foreground">${count}</span>
                                </div>`
                                )
                                .join('')}
                        </div>
                    </div>
                    <div class="mt-4 rounded-lg border bg-muted/30 p-3">
                        <div class="flex items-center gap-0.5 text-amber-400">${'<i class="ti ti-star"></i>'.repeat(5)}</div>
                        <p class="mt-2 text-base font-medium">Exceeded my expectations!</p>
                        <p class="text-base text-muted-foreground">March 12, 2025</p>
                        <p class="mt-2 text-base text-muted-foreground">I was skeptical at first, but this product has completely changed my daily routine. The quality is outstanding and it's so easy to use.</p>
                        <div class="mt-3 flex items-center gap-2">
                            <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">SJ</span>
                            <div>
                                <p class="text-base font-medium">Sarah J.</p>
                                <p class="text-[10px] text-muted-foreground">Verified Purchase</p>
                            </div>
                        </div>
                    </div>`,
                    'lg:col-span-4'
                )}
            </div>

            <!-- best selling products -->
            <div class="overflow-hidden rounded-xl border bg-card shadow-xs">
                <div class="p-4 pb-0">${cardHead('Best Selling Products', exportBtn())}</div>
                <div class="mt-4 overflow-x-auto">
                    <table class="w-full caption-bottom text-base">
                        <thead>
                            <tr class="border-b bg-muted/40">
                                <th class="h-10 px-3 text-left align-middle font-medium text-muted-foreground">Product</th>
                                <th class="h-10 px-3 text-left align-middle font-medium text-muted-foreground">Sold</th>
                                <th class="h-10 px-3 text-left align-middle font-medium text-muted-foreground">Sales</th>
                                <th class="h-10 px-3 text-right align-middle font-medium text-muted-foreground"><span class="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>${productRows}</tbody>
                    </table>
                </div>
                ${pagination('1 - 8 of 8 products')}
            </div>
        </div>`;
};

// ---- catatan (tabel + aksi) ----

Panel.pages.notes = () => {
    const rows = Panel.state()
        .db.notes.map(
            (n) => `
            <tr class="border-b last:border-0 hover:bg-muted/30">
                <td class="p-3 align-middle text-base font-medium ${n.done ? 'text-muted-foreground line-through' : ''}">${esc(n.title)}</td>
                <td class="p-3 align-middle">${n.done ? '<span class="c-badge-outline gap-1"><i class="ti ti-check"></i>Done</span>' : '<span class="c-badge-secondary gap-1"><i class="ti ti-circle-dashed"></i>Open</span>'}</td>
                <td class="p-3 align-middle">
                    <div class="flex justify-end gap-2">
                        <button class="c-btn c-btn-outline c-btn-sm" data-action="toggle" data-id="${n.id}">${n.done ? '<i class="ti ti-arrow-back-up text-base leading-none"></i>Reopen' : '<i class="ti ti-check text-base leading-none"></i>Mark done'}</button>
                        <button class="c-btn c-btn-destructive c-btn-sm" data-action="delete-note" data-id="${n.id}"><i class="ti ti-trash text-base leading-none"></i>Delete</button>
                    </div>
                </td>
            </tr>`
        )
        .join('');

    return `
        <div class="p-4 lg:p-6">
            <div class="overflow-hidden rounded-lg shadow-xs ring-1 ring-border">
                <table class="w-full caption-bottom text-base">
                    <thead>
                        <tr class="border-b bg-muted/40">
                            <th class="h-10 px-3 text-left align-middle font-medium text-muted-foreground">Title</th>
                            <th class="h-10 px-3 text-left align-middle font-medium text-muted-foreground">Status</th>
                            <th class="h-10 px-3 text-right align-middle font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr class="border-b"><td class="p-3 text-base text-muted-foreground" colspan="3">No notes yet.</td></tr>'}</tbody>
                </table>
            </div>
        </div>`;
};

// ---- profil ----

Panel.pages.profile = () => {
    const u = Panel.state().user;

    return `
        <div class="p-4 lg:p-6">
            <div class="max-w-md space-y-4 rounded-lg border bg-card p-5 shadow-xs">
                <div class="flex items-center gap-3">
                    <div class="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">${initials(u.name)}</div>
                    <div class="min-w-0">
                        <p class="truncate text-base font-semibold">${esc(u.name)}</p>
                        <p class="truncate text-base text-muted-foreground">${esc(u.email)}</p>
                    </div>
                </div>
                <dl class="divide-y border-t">
                    <div class="flex justify-between py-2.5 text-base">
                        <dt class="flex items-center gap-1.5 text-muted-foreground"><i class="ti ti-shield text-base leading-none"></i>Level</dt>
                        <dd class="font-medium">${esc(u.level)}</dd>
                    </div>
                    <div class="flex justify-between py-2.5 text-base">
                        <dt class="flex items-center gap-1.5 text-muted-foreground"><i class="ti ti-bolt text-base leading-none"></i>SPA section</dt>
                        <dd class="font-medium">panel · vanilla</dd>
                    </div>
                </dl>
                <button class="c-btn c-btn-destructive w-full" data-action="logout"><i class="ti ti-logout text-base leading-none"></i>Log out</button>
            </div>
        </div>`;
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
