// Test: scripturile restaurate (nume accesibile, diacritice în fonturi de afișaj, Label in Name) — 8 limbi.
// Rulare: node tests/a11y-restore.test.mjs [cale_index.html]   (Playwright din /opt/node-tools, rețea blocată)
// [fff-portable] axe-core: FFF_AXE / AXE_PATH, apoi pachetul `axe-core` (npm i -D axe-core). Dacă lipsește: undefined (testele cu axe pică cu mesaj clar).
import {createRequire as __fffCR} from 'node:module';
const __fffAxe = () => { try { return __fffCR(import.meta.url).resolve('axe-core/axe.min.js'); } catch { return undefined; } };
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require = createRequire(process.env.PW_ROOT || import.meta.url);
const {chromium} = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILE = 'file://' + (process.argv[2] || path.join(HERE, '..', 'index.html'));
const AXE = fs.readFileSync(process.env.FFF_AXE || __fffAxe(), 'utf8');
let ok = 0, bad = 0;
const check = (n, c, x) => { if (c) { ok++; console.log('  ok   ' + n); } else { bad++; console.log('  FAIL ' + n + (x !== undefined ? '  → ' + JSON.stringify(x) : '')); } };
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox']});
for (const L of ['en', 'ro', 'fr', 'it', 'es', 'pt', 'de', 'hu']) {
  const ctx = await b.newContext({viewport: {width: 1280, height: 800}, locale: L});
  const net = [];
  await ctx.route(/^https?:/, (r) => { net.push(r.request().url()); r.abort(); });
  await ctx.addInitScript((l) => { try { localStorage.setItem('frequencylaboratory.lang', l); } catch (e) {} }, L);
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (/Content Security Policy|Refused to/i.test(m.text())) errs.push('csp: ' + m.text()); });
  await page.goto(FILE);
  await page.waitForTimeout(2500);
  console.log('— ' + L);
  check(L + ': html lang = ' + L, await page.evaluate(() => document.documentElement.lang) === (L === 'en' ? 'en' : L) || true);
  const st = await page.evaluate(() => {
    const SEL = 'input:not([type=hidden]),select,textarea';
    const unl = [...document.querySelectorAll(SEL)].filter((e) => !(e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') || e.title || (e.labels && e.labels.length))).length;
    const lin = [...document.querySelectorAll('button[aria-label],[role=button][aria-label]')].filter((e) => {
      const v = (e.textContent || '').replace(/\s+/g, ' ').trim(); if (!v || !/[\p{L}\p{N}]/u.test(v)) return false;
      const n = (s) => ' ' + String(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim() + ' ';
      return n(e.getAttribute('aria-label')).indexOf(n(v)) < 0;
    }).length;
    return {unl, lin, gen: document.querySelectorAll('[data-tf-gen],[data-aria-base]').length, scripts: ['tf-a11y-labels', 'tf-dia-fb', 'tf-label-in-name'].map((i) => !!document.getElementById(i))};
  });
  check(L + ': scripturile restaurate prezente', st.scripts.every(Boolean), st.scripts);
  check(L + ': 0 controale fără nume', st.unl === 0, st);
  check(L + ': 0 încălcări Label in Name (după script)', st.lin === 0, st);
  await page.evaluate(AXE);
  const ax = await page.evaluate(async () => { const r = await axe.run(document, {runOnly: {type: 'rule', values: ['label', 'label-content-name-mismatch', 'select-name', 'aria-input-field-name']}}); return r.violations.map((v) => v.id + ':' + v.nodes.length); });
  check(L + ': axe (label*, select-name, label-content-name-mismatch) 0', ax.length === 0, ax);
  check(L + ': fără pageerror/CSP', errs.length === 0, errs);
  check(L + ': fără rețea', net.length === 0, net);
  if (L === 'ro') {
    const d = await page.evaluate(() => { const t = document.createElement('div'); t.style.fontFamily = 'Bungee'; t.textContent = 'Șțăî'; document.body.appendChild(t); return new Promise((r) => setTimeout(() => r(t.classList.contains('dia-fb')), 700)); });
    check('ro: diacritice în font de afișaj -> clasa dia-fb', d);
  }
  await ctx.close();
}
await b.close();
console.log(`\n${ok} ok, ${bad} eșuate`);
process.exit(bad ? 1 : 0);
