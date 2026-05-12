import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.LAB_BASE_URL || 'http://127.0.0.1:8765';
const OUT = path.join(__dirname, 'output');

const SITES = [
  { id: 'lab_main',       path: '/index.html' },
  { id: 'okum',           path: '/okum/index.html' },
  { id: 'halden_studio',  path: '/halden_studio/index.html' },
  { id: 'numen',          path: '/numen/index.html' },
  { id: 'tempo_society',  path: '/tempo_society/index.html' },
  { id: 'service',        path: '/service/index.html' },
  { id: 'app',            path: '/app/index.html' },
  { id: 'okinawa',        path: '/okinawa/index.html' },
  { id: 'auto_crawl',     path: '/auto/crawl.html' },
  { id: 'auto_dart',      path: '/auto/dart.html' },
  { id: 'auto_excel',     path: '/auto/excel.html' },
];

const VIEWPORTS = [
  { name: 'pc',     width: 1440, height: 900, dpr: 1, isMobile: false },
  { name: 'mobile', width: 390,  height: 844, dpr: 2, isMobile: true  },
];

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const site of SITES) {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dpr,
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
      userAgent: vp.isMobile
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : undefined,
    });
    const page = await ctx.newPage();
    const out = path.join(OUT, `${site.id}_${vp.name}.png`);
    const t0 = Date.now();
    try {
      await page.goto(`${BASE}${site.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.evaluate(() => document.fonts && document.fonts.ready);
      // lazy-load + intersection observer 트리거
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let y = 0;
          const step = Math.max(300, Math.floor(window.innerHeight * 0.6));
          const id = setInterval(() => {
            window.scrollTo(0, y);
            y += step;
            if (y >= document.body.scrollHeight) {
              clearInterval(id);
              setTimeout(() => { window.scrollTo(0, 0); resolve(); }, 400);
            }
          }, 60);
        });
      });
      await page.waitForTimeout(600);
      await page.screenshot({ path: out, fullPage: true });
      const sizeKB = (fs.statSync(out).size / 1024).toFixed(0);
      const ms = Date.now() - t0;
      console.log(`OK  ${site.id.padEnd(15)} ${vp.name.padEnd(7)} ${sizeKB.padStart(5)} KB  ${ms} ms`);
      results.push({ site: site.id, vp: vp.name, ok: true, sizeKB: Number(sizeKB) });
    } catch (e) {
      console.error(`ERR ${site.id} ${vp.name}: ${e.message}`);
      results.push({ site: site.id, vp: vp.name, ok: false, error: e.message });
    } finally {
      await ctx.close();
    }
  }
}

await browser.close();

const ok = results.filter(r => r.ok).length;
const fail = results.length - ok;
const over5MB = results.filter(r => r.ok && r.sizeKB > 5120);
console.log(`\n총 ${results.length}장 (성공 ${ok}, 실패 ${fail})`);
if (over5MB.length) {
  console.log(`5MB 초과 (크몽 제한): ${over5MB.length}장`);
  over5MB.forEach(r => console.log(`  - ${r.site}_${r.vp}.png  ${r.sizeKB} KB`));
}
