import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.LAB_BASE_URL || 'http://127.0.0.1:8765';
const OUT = path.join(__dirname, 'output', 'thumbs');

const CARDS = [
  { id: 'okum',     selector: '#okum-thumb-wrap' },
  { id: 'axis',     selector: '#axis-thumb-wrap' },
  { id: 'okinawa',  selector: '#portfolio a[href="/okinawa"]' },
  { id: 'aura',     selector: '#aura-thumb-wrap' },
  { id: 'numen',    selector: '#numen-thumb-wrap' },
  { id: 'tempo',    selector: '#tempo-thumb-wrap' },
  { id: 'halden',   selector: '#portfolio a[href="/halden_studio"]' },
  { id: 'excel',    selector: '#excel-thumb-wrap' },
  { id: 'crawl',    selector: '#crawl-thumb-wrap' },
  { id: 'dart',     selector: '#dart-thumb-wrap' },
];

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle', timeout: 30000 });
await page.evaluate(() => document.fonts && document.fonts.ready);

// lazy-load + ResizeObserver scale 트리거를 위해 페이지 전체 스크롤
await page.evaluate(async () => {
  await new Promise((resolve) => {
    let y = 0;
    const id = setInterval(() => {
      window.scrollTo(0, y);
      y += 400;
      if (y >= document.body.scrollHeight) {
        clearInterval(id);
        setTimeout(() => { window.scrollTo(0, 0); resolve(); }, 400);
      }
    }, 60);
  });
});
await page.waitForTimeout(800);

let ok = 0, fail = 0;
for (const c of CARDS) {
  const el = await page.$(c.selector);
  if (!el) { console.error(`MISS ${c.id}  (${c.selector})`); fail++; continue; }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400); // ResizeObserver scale 재계산 안정화
  const out = path.join(OUT, `thumb_${c.id}.png`);
  await el.screenshot({ path: out });
  const box = await el.boundingBox();
  const sizeKB = (fs.statSync(out).size / 1024).toFixed(0);
  console.log(`OK  thumb_${c.id.padEnd(8)}  ${box.width.toFixed(0)}x${box.height.toFixed(0)} CSS  ${sizeKB} KB`);
  ok++;
}

await browser.close();
console.log(`\n총 ${CARDS.length}개 (성공 ${ok}, 실패 ${fail})`);
