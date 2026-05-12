import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8765';
const browser = await chromium.launch();

const PAGES = [
  // 옮긴 4개 사이트
  { url: '/okum/',          name: 'okum',          checks: ['title'] },
  { url: '/halden_studio/', name: 'halden_studio', checks: ['title'] },
  { url: '/numen/',         name: 'numen',         checks: ['title'] },
  { url: '/tempo_society/', name: 'tempo_society', checks: ['title'] },
  // Lenis + TOP 이식한 5개
  { url: '/service/',       name: 'service',       checks: ['lenis', 'topBtn'] },
  { url: '/app/',           name: 'app',           checks: ['lenis', 'topBtn'] },
  { url: '/auto/crawl.html',name: 'auto_crawl',    checks: ['lenis', 'topBtn'] },
  { url: '/auto/dart.html', name: 'auto_dart',     checks: ['lenis', 'topBtn'] },
  { url: '/auto/excel.html',name: 'auto_excel',    checks: ['lenis', 'topBtn'] },
  // 새 정책 페이지
  { url: '/policies/refund.html', name: 'policy_refund', checks: ['lenis', 'topBtn', 'title'] },
  // 메인
  { url: '/',               name: 'lab_main',      checks: ['lenis', 'topBtn', 'newFaq', 'policyLink'] },
];

let allOk = true;
for (const p of PAGES) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`console.error: ${m.text()}`); });

  try {
    await page.goto(BASE + p.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(500);

    const result = await page.evaluate(() => ({
      lenis: typeof window.Lenis === 'function',
      topBtn: !!document.getElementById('top-btn'),
      title: document.title,
      newFaq: !!Array.from(document.querySelectorAll('summary')).find(s => s.textContent.includes('시안 받고 진행이 어려워졌어요')),
      policyLink: !!document.querySelector('a[href="/policies/refund.html"]'),
    }));

    const failed = [];
    for (const c of p.checks) {
      if (c === 'title') { if (!result.title) failed.push('title empty'); }
      else if (!result[c]) failed.push(c);
    }

    const status = (failed.length === 0 && errors.length === 0) ? 'OK' : 'FAIL';
    if (status === 'FAIL') allOk = false;
    console.log(`${status.padEnd(4)} ${p.name.padEnd(16)} title="${result.title.slice(0,40)}"  Lenis=${result.lenis}  TOP=${result.topBtn}${p.checks.includes('newFaq') ? '  newFAQ='+result.newFaq+'  policyLink='+result.policyLink : ''}`);
    if (failed.length) console.log(`     missing: ${failed.join(', ')}`);
    if (errors.length) console.log(`     errors:\n     ${errors.join('\n     ')}`);
  } catch (e) {
    allOk = false;
    console.log(`FAIL ${p.name}: ${e.message}`);
  } finally {
    await ctx.close();
  }
}

await browser.close();
console.log(allOk ? '\n전체 통과' : '\n실패 있음');
process.exit(allOk ? 0 : 1);
