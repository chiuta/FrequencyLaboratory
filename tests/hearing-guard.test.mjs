// Teste protecția auzului (frequencylaboratory): avertizare cu confirmare înainte de primul sunet + limitator de volum (plafon) pe ieșire.
// Rulare: node tests/hearing-guard.test.mjs   (Playwright din /opt/node-tools; rețea blocată; axe opțional prin AXE_PATH)
import {createRequire} from 'module';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
const require = createRequire(process.env.PW_ROOT || '/opt/node-tools/package.json');
const {chromium} = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const FILE = 'file://' + path.resolve(here, '..', 'index.html');
const SLUG = 'frequencylaboratory';
let ok = 0, bad = 0;
function t(name, cond, extra) { if (cond) { ok++; console.log('  ok  ' + name); } else { bad++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); } }
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']});
async function open(opts = {}) {
  const ctx = await b.newContext({viewport: {width: 1280, height: 900}, serviceWorkers: 'block', bypassCSP: !!opts.axe});
  await ctx.addInitScript((o) => { try { localStorage.setItem(o.slug + '.tutorial_seen', '1'); localStorage.setItem(o.slug + '.onboarded_v1', '1'); if (o.lang) localStorage.setItem(o.slug + '.lang', o.lang); if (o.ack) sessionStorage.setItem(o.slug + '.hpack', '1'); } catch (e) {} }, {slug: SLUG, lang: opts.lang, ack: opts.ack});
  let net = 0; await ctx.route(/^https?:/, (r) => { net++; r.abort(); });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (/Content Security|Refused/i.test(m.text())) errs.push('csp ' + m.text().slice(0, 140)); });
  await p.goto(FILE); await p.waitForTimeout(1500);
  return {ctx, p, errs, net: () => net};
}
const peak = (p, ms = 400) => p.evaluate(async (ms) => {
  const c = hearingGuard.contexts()[0]; const a = c.__hp.tap; const buf = new Float32Array(a.fftSize); let m = 0;
  const t0 = performance.now();
  while (performance.now() - t0 < ms) { a.getFloatTimeDomainData(buf); for (const v of buf) m = Math.max(m, Math.abs(v)); await new Promise((r) => setTimeout(r, 20)); }
  return m;
}, ms);
const loud = (p) => p.evaluate(async () => {
  const c = new AudioContext(); await c.resume();
  const o = c.createOscillator(); o.frequency.value = 220; const g = c.createGain(); g.gain.value = 5; o.connect(g).connect(c.destination); o.start();
  window.__tc = c; return c.state;
});

console.log('Avertizare la pornire, înainte de primul sunet');
{
  const {ctx, p, errs, net} = await open();
  t('dialogul de protecție a auzului este deschis la încărcare', await p.evaluate(() => { const d = document.getElementById('hpGate'); return !!d && d.open; }));
  t('rolul/etichetele ARIA ale dialogului', await p.evaluate(() => { const d = document.getElementById('hpGate'); return d.getAttribute('aria-labelledby') === 'hpT' && !!document.getElementById('hpT').textContent; }));
  t('butonul „Am înțeles” e vizibil, „Închide” ascuns', await p.evaluate(() => !document.getElementById('hpOk').hidden && document.getElementById('hpClose').hidden));
  const st = await loud(p);
  t('AudioContext creat înainte de confirmare: ieșirea e mută (câștig 0)', await p.evaluate(() => hearingGuard.contexts().every((c) => c.__hp.cap.gain.value === 0)));
  const pk0 = await p.evaluate(async () => { const c = window.__tc; const a = c.__hp.tap; const b2 = new Float32Array(a.fftSize); let m = 0; for (let i = 0; i < 15; i++) { a.getFloatTimeDomainData(b2); for (const v of b2) m = Math.max(m, Math.abs(v)); await new Promise((r) => setTimeout(r, 30)); } return m; });
  t('nivel măsurat după plafon înainte de confirmare = 0 (' + st + ')', pk0 < 1e-6, pk0);
  t('pastila arată „SUNET BLOCAT”', await p.evaluate(() => /BLOCAT|BLOCKED/.test(document.getElementById('hpPill').textContent)));
  await p.click('#hpNo');
  t('„Rămân fără sunet” închide dialogul fără a activa sunetul', await p.evaluate(() => !document.getElementById('hpGate').open && !hearingGuard.acknowledged()));
  await p.click('#hpPill');
  t('pastila redeschide avertizarea', await p.evaluate(() => document.getElementById('hpGate').open));
  await p.click('#hpOk'); await p.waitForTimeout(500);
  t('după confirmare: confirmat, dialog închis', await p.evaluate(() => hearingGuard.acknowledged() && !document.getElementById('hpGate').open));
  t('confirmarea este păstrată doar pe sesiune (sessionStorage), nu permanent', await p.evaluate((s) => sessionStorage.getItem(s + '.hpack') === '1' && localStorage.getItem(s + '.hpack') === null, SLUG));
  const pk1 = await p.evaluate(async () => { const c = window.__tc; const a = c.__hp.tap; const b2 = new Float32Array(a.fftSize); let m = 0; for (let i = 0; i < 25; i++) { a.getFloatTimeDomainData(b2); for (const v of b2) m = Math.max(m, Math.abs(v)); await new Promise((r) => setTimeout(r, 30)); } return m; });
  const expect = Math.pow(10, -6 / 20);
  t('sursă la amplitudine 5 (peste scală): vârful după plafon ≤ plafon implicit −6 dB (' + expect.toFixed(3) + ')', pk1 > expect * 0.9 && pk1 <= expect + 0.005, pk1);
  t('fără cereri de rețea și fără erori', net() === 0 && errs.length === 0, {net: net(), errs});
  await ctx.close();
}

console.log('Limită configurabilă și persistență');
{
  const {ctx, p, errs} = await open({ack: true});
  t('cu confirmare în sesiune, dialogul nu se deschide', await p.evaluate(() => !document.getElementById('hpGate') || !document.getElementById('hpGate').open));
  await loud(p); await p.waitForTimeout(300);
  await p.click('#hpPill');
  t('în modul setări: „Închide” vizibil, „Am înțeles” ascuns', await p.evaluate(() => !document.getElementById('hpClose').hidden && document.getElementById('hpOk').hidden));
  await p.selectOption('#hpCap', '-18'); await p.waitForTimeout(500);
  const pk = await p.evaluate(async () => { const c = window.__tc; const a = c.__hp.tap; const b2 = new Float32Array(a.fftSize); let m = 0; for (let i = 0; i < 25; i++) { a.getFloatTimeDomainData(b2); for (const v of b2) m = Math.max(m, Math.abs(v)); await new Promise((r) => setTimeout(r, 30)); } return m; });
  const e18 = Math.pow(10, -18 / 20);
  t('limită −18 dB: vârf ≈ ' + e18.toFixed(3), pk > e18 * 0.9 && pk <= e18 + 0.004, pk);
  t('limita se salvează în localStorage cu prefixul aplicației', await p.evaluate((s) => localStorage.getItem(s + '.volcap') === '-18', SLUG));
  t('pastila arată limita', await p.evaluate(() => /18/.test(document.getElementById('hpPill').textContent)));
  await p.click('#hpClose');
  await p.reload(); await p.waitForFunction(() => window.hearingGuard); await p.waitForTimeout(2500);
  t('după reîncărcare limita se păstrează, fără a cere din nou confirmarea în aceeași sesiune', await p.evaluate(() => hearingGuard.capDb() === -18 && hearingGuard.acknowledged() && !(document.getElementById('hpGate') || {}).open));
  await ctx.close();
  t('fără erori', errs.length === 0, errs);
}

console.log('Limbi, accesibilitate, aplicația funcționează după confirmare');
{
  const {ctx, p, errs} = await open({lang: 'en', axe: true});
  t('titlul în engleză', await p.evaluate(() => document.getElementById('hpT').textContent === 'Hearing protection'), await p.evaluate(() => document.getElementById('hpT') && document.getElementById('hpT').textContent));
  for (const l of ['fr', 'it', 'es', 'pt', 'de', 'hu', 'ro']) {
    await p.evaluate((l) => { document.documentElement.setAttribute('lang', l); }, l); await p.waitForTimeout(150);
    const tt = await p.evaluate(() => document.getElementById('hpT').textContent);
    t('titlul se schimbă la lang=' + l + ': ' + tt, tt.length > 3 && tt !== 'Hearing protection');
  }
  const AX = process.env.AXE_PATH;
  if (AX && fs.existsSync(AX)) {
    await p.addScriptTag({path: AX});
    const r = await p.evaluate(async () => (await axe.run(document.getElementById('hpGate'))).violations.map((v) => v.id + ':' + v.nodes.length));
    t('axe 0 violări în dialog', r.length === 0, r);
  } else console.log('  (axe omis: AXE_PATH nesetat)');
  await p.click('#hpOk');
  await p.evaluate(() => { const b2 = document.getElementById('btnStart') || [...document.querySelectorAll('button')].find((x) => /START/i.test(x.textContent)); if (b2) b2.click(); });
  await p.waitForTimeout(800);
  const info = await p.evaluate(() => { const c = hearingGuard.contexts(); return {n: c.length, run: c.map((x) => x.state), g: c.map((x) => +x.__hp.cap.gain.value.toFixed(3))}; });
  t('butonul START al aplicației creează un context protejat și funcționează', info.n >= 1 && info.g.every((g) => g > 0.4 && g <= 0.51), info);
  t('fără erori de pagină/CSP', errs.length === 0, errs);
  await ctx.close();
}
await b.close();
console.log(`\n${ok} reușite, ${bad} eșuate`);
process.exit(bad ? 1 : 0);
