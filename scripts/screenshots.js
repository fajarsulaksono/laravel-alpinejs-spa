#!/usr/bin/env node
// ============================================================
// Screenshot generator — setiap halaman untuk kedua role.
//
//   npm run screenshots          # pakai http://127.0.0.1:8000
//   APP_BASE=http://127.0.0.1:8125 npm run screenshots
//
// Memakai Google Chrome sistem (executablePath) sehingga tidak perlu
// mengunduh browser Playwright. Hasil disimpan di docs/screenshots/.
// ============================================================

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.APP_BASE || 'http://127.0.0.1:8000';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs', 'screenshots');
const CHROME = process.env.CHROME || '/usr/bin/google-chrome';
const W = 1280;
const H = 800;

const shot = (page, name) =>
    page.screenshot({ path: path.join(OUT, name), fullPage: false });

async function login(page, email, password, section) {
    await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
    await page.waitForSelector('form[data-login="form"]');
    await page.fill('form[data-login="form"] [name="email"]', email);
    await page.fill('form[data-login="form"] [name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForSelector(`#${section}:not([hidden])`, { timeout: 10000 });
    await page.waitForTimeout(800);
}

async function run() {
    await mkdir(OUT, { recursive: true });

    const browser = await chromium.launch({
        executablePath: CHROME,
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });

    const ctx = await browser.newContext({
        viewport: { width: W, height: H },
        deviceScaleFactor: 2,
        colorScheme: 'light',
    });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.warn('pageerror:', e.message));

    // ---------- Login (belum masuk) ----------
    await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
    await page.waitForSelector('form[data-login="form"]');
    await shot(page, '01-login.png');
    console.log('ok 01-login.png');

    // ---------- Admin -> panel ----------
    await login(page, 'admin@example.com', 'password', 'panel');

    await shot(page, '02-panel-dashboard.png');
    console.log('ok 02-panel-dashboard.png');

    await page.click('a[href="#/panel/notes"]');
    await page.waitForSelector('#panel h1:has-text("Catatan")');
    await page.waitForTimeout(600);
    await shot(page, '03-panel-notes.png');
    console.log('ok 03-panel-notes.png');

    await page.click('a[href="#/panel/profile"]');
    await page.waitForSelector('#panel h1:has-text("Profil")');
    await page.waitForTimeout(600);
    await shot(page, '04-panel-profile.png');
    console.log('ok 04-panel-profile.png');

    // sidebar ciut + tema gelap
    await page.click('[data-action="sidebar"]');
    await page.waitForTimeout(600);
    await shot(page, '05-panel-sidebar-collapsed.png');
    console.log('ok 05-panel-sidebar-collapsed.png');

    await page.click('[data-action="theme"]');
    await page.waitForTimeout(600);
    await shot(page, '06-panel-sidebar-dark.png');
    console.log('ok 06-panel-sidebar-dark.png');

    // ---------- Member -> bagian Alpine ----------
    const ctx2 = await browser.newContext({
        viewport: { width: W, height: H },
        deviceScaleFactor: 2,
        colorScheme: 'light',
    });
    const p2 = await ctx2.newPage();
    p2.on('pageerror', (e) => console.warn('pageerror:', e.message));

    await login(p2, 'member@example.com', 'password', 'member');

    await p2.waitForSelector('main[x-data="homePage"]');
    await p2.waitForTimeout(600);
    await shot(p2, '07-member-home.png');
    console.log('ok 07-member-home.png');

    await p2.click('a[href="#/member/notes"]');
    await p2.waitForSelector('main[x-data="notesPage"]');
    await p2.waitForTimeout(600);
    await shot(p2, '08-member-notes.png');
    console.log('ok 08-member-notes.png');

    await p2.click('a[href="#/member/profile"]');
    await p2.waitForSelector('main[x-data="profilePage"]');
    await p2.waitForTimeout(600);
    await shot(p2, '09-member-profile.png');
    console.log('ok 09-member-profile.png');

    await ctx.close();
    await ctx2.close();
    await browser.close();
    console.log(`Selesai -> ${OUT}`);
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});