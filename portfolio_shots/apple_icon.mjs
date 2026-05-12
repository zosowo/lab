import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const VARIANTS = [
  { name: 'apple-touch-icon.png', size: 180, rounded: true,  safeZone: 0    },
  { name: 'icon-192.png',         size: 192, rounded: false, safeZone: 0.10 },
  { name: 'icon-512.png',         size: 512, rounded: false, safeZone: 0.10 },
];

function buildHtml({ size, rounded, safeZone }) {
  const radius = rounded ? Math.round(size * 0.20) : 0;
  const padding = Math.round(size * safeZone);
  const content = size - padding * 2;
  const victorFs = Math.round(content * 0.18);
  const labFs = Math.round(content * 0.17);
  const ruleW = Math.round(content * 0.10);
  return `<!doctype html>
<html><head><meta charset="utf-8"/>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<style>
  html,body{margin:0;padding:0;background:transparent;}
  .icon{
    width:${size}px;height:${size}px;border-radius:${radius}px;
    background:linear-gradient(135deg,#FAF7F2 0%,#F2EEDF 100%);
    position:relative;overflow:hidden;
    font-family:'Pretendard Variable','Pretendard',system-ui,sans-serif;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:${padding}px;box-sizing:border-box;
  }
  .icon::before{
    content:'';position:absolute;inset:0;
    background:radial-gradient(${Math.round(size*0.67)}px ${Math.round(size*0.44)}px at 75% 22%, rgba(176,143,68,0.14) 0%, rgba(176,143,68,0) 65%);
    pointer-events:none;
  }
  .victor{color:#0C1F40;font-size:${victorFs}px;font-weight:700;letter-spacing:-0.5px;line-height:1;margin-bottom:${Math.round(content*0.035)}px;position:relative;}
  .rule{width:${ruleW}px;height:1px;background:#C9A961;margin-bottom:${Math.round(content*0.045)}px;position:relative;}
  .lab{color:#B08F44;font-size:${labFs}px;font-weight:500;letter-spacing:${Math.round(content*0.033)}px;line-height:1;text-transform:uppercase;padding-left:${Math.round(content*0.035)}px;position:relative;}
</style></head>
<body>
<div class="icon">
  <div class="victor">Victor</div>
  <div class="rule"></div>
  <div class="lab">Lab</div>
</div>
</body></html>`;
}

const browser = await chromium.launch();
for (const v of VARIANTS) {
  const ctx = await browser.newContext({
    viewport: { width: v.size, height: v.size },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.setContent(buildHtml(v), { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const el = await page.$('.icon');
  const out = path.join(ROOT, v.name);
  await el.screenshot({ path: out, omitBackground: true });
  console.log('Wrote', out);
  await ctx.close();
}
await browser.close();
