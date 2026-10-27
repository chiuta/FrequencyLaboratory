// Teste r9 pentru Frequency Laboratory: import ostil (1e309 → Infinity), chei localStorage proprii cu migrare, service worker offline.
// Rulare: node tests/r9-import-keys-sw.test.mjs   (Playwright din /opt/node-tools; rețea externă blocată)
import {createRequire} from 'module';
import fs from 'fs';
import http from 'http';
import path from 'path';
import {fileURLToPath} from 'url';
const require = createRequire(process.env.PW_ROOT || import.meta.url);
const {chromium} = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..');
let ok = 0, bad = 0;
function t(name, cond, extra) { if (cond) { ok++; console.log('  ok  ' + name); } else { bad++; console.log('  FAIL ' + name + (extra ? ' :: ' + JSON.stringify(extra) : '')); } }

const MIME = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.webmanifest': 'application/manifest+json', '.png': 'image/png'};
const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('no'); }
  res.writeHead(200, {'Content-Type': MIME[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(res);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const BASE = 'http://127.0.0.1:' + srv.address().port + '/';
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox']});

// 1. migrare chei + import ostil
{
  const ctx = await b.newContext({viewport: {width: 1280, height: 800}, serviceWorkers: 'block'});
  await ctx.addInitScript(() => {
    try {
      if (!localStorage.getItem('__seeded')) {
        localStorage.setItem('__seeded', '1');
        localStorage.setItem('lab_frecv_theme', 'amber'); localStorage.setItem('lab_frecv_onboarded_v1', '1');
        localStorage.setItem('lab_frecv_presets_v1', JSON.stringify([{name: 'vechi', state: {freqA: 432}}]));
      }
    } catch (e) {}
  });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('dialog', (d) => { errs.push('dialog ' + d.type()); d.dismiss(); });
  await p.goto(BASE); await p.waitForTimeout(2500);
  const ls = await p.evaluate(() => ({t: localStorage.getItem('frequencylaboratory.theme'), pr: localStorage.getItem('frequencylaboratory.presets_v1'), old: localStorage.getItem('lab_frecv_theme'), mig: localStorage.getItem('frequencylaboratory.migrated')}));
  t('migrare: tema copiată în cheia cu prefix', ls.t === 'amber', ls);
  t('migrare: presetările copiate', /vechi/.test(ls.pr || ''), ls);
  t('migrare: cheia veche rămâne până migrează și generator-frecvente', ls.old === 'amber' && ls.mig === '1', ls);
  t('migrare: aplicația nu mai scrie în lab_frecv_*', await p.evaluate(() => { localStorage.setItem('frequencylaboratory.theme', 'x'); return localStorage.getItem('lab_frecv_theme') === 'amber'; }));
  // import ostil: stare cu Infinity/NaN/șiruri/chei străine
  const bad = JSON.stringify([{name: 'ostil', state: {freqA: 1e309, freqB: -1e309, master: 1e309, gainA: 'x', beatRate: 1e309, filterFreq: 1e309, sweepDur: 1e309, noiseLP: 1e309, adsrA: 1e309, fadeIn: 1e309, amRate: 1e309, enableA: 'da', __proto__: {polluted: 1}, extra: 5}}]).replace('"__proto__":{"polluted":1}', '"__proto__":{"polluted":1}');
  fs.writeFileSync('/tmp/r9-bad-presets.json', bad.replace(/1e\+?309|1\.7976931348623157e\+308/g, '1e309'));
  await p.setInputFiles('#importFile', '/tmp/r9-bad-presets.json'); await p.waitForTimeout(800);
  const applied = await p.evaluate(() => { try { const l = JSON.parse(localStorage.getItem('frequencylaboratory.presets_v1') || '[]'); const x = l.find((q) => q.name === 'ostil'); if (!x) return 'fără preset'; applyState(x.state); return [state.freqA, state.master, state.beatRate, state.filterFreq, typeof state.enableA, ({}).polluted, Object.getPrototypeOf(state) === Object.prototype]; } catch (e) { return 'ERR ' + e.message; } });
  console.log('   stare după aplicare:', JSON.stringify(applied));
  t('import ostil: valori finite, fără excepții', Array.isArray(applied) && applied.slice(0, 4).every(Number.isFinite) && errs.length === 0, {applied, errs});
  t('import ostil: prototipul nu e poluat', Array.isArray(applied) && applied[5] == null && applied[6] === true, applied);
  // pornire cu stare ostilă
  const err2 = await p.evaluate(async () => { try { applyState({freqA: Infinity, master: Infinity, filterFreq: NaN}); await new Promise((r) => setTimeout(r, 100)); return null; } catch (e) { return e.message; } });
  t('applyState(Infinity) nu aruncă', err2 === null, err2);
  await ctx.close();
}
// 2. confirmările sunt inline (toast), fără dialoguri native blocante
{
  const ctx = await b.newContext({viewport: {width: 1280, height: 800}, serviceWorkers: 'block'});
  await ctx.addInitScript(() => { try { localStorage.setItem('frequencylaboratory.onboarded_v1', '1'); localStorage.setItem('frequencylaboratory.wn_seen', 'v4.0'); localStorage.setItem('frequencylaboratory.lang', 'de'); } catch (e) {} });
  const p = await ctx.newPage(); let dialogs = 0; p.on('dialog', (d) => { dialogs++; d.dismiss(); });
  await p.goto(BASE); await p.waitForTimeout(2500);
  await p.evaluate(() => { document.getElementById('btnClearAllPresets').click(); });
  await p.waitForTimeout(400);
  const txt = await p.evaluate(() => document.body.innerText);
  t('ștergere preset-uri: confirmare inline, tradusă (de)', /Wirklich ALLE/.test(txt));
  t('fără dialoguri native', dialogs === 0, dialogs);
  await ctx.close();
}
// 3. service worker: instalare + repornire offline
{
  const ctx = await b.newContext({viewport: {width: 1280, height: 800}});
  await ctx.addInitScript(() => { try { localStorage.setItem('frequencylaboratory.onboarded_v1', '1'); localStorage.setItem('frequencylaboratory.wn_seen', 'v4.0'); } catch (e) {} });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(BASE); await p.waitForTimeout(1500);
  const reg = await p.evaluate(async () => { const r = await navigator.serviceWorker.ready; for (let i = 0; i < 50 && r.active && r.active.state !== 'activated'; i++) await new Promise((x) => setTimeout(x, 100)); return {scope: r.scope, state: r.active && r.active.state}; });
  t('service worker activ', reg.state === 'activated', reg);
  const keys = await p.evaluate(async () => (await caches.keys()));
  t('cache fff-frequencylaboratory-<versiune>', keys.some((k) => /^fff-frequencylaboratory-\d+\.\d+\.\d+$/.test(k)), keys);
  const man = await p.evaluate(async () => { const r = await fetch('manifest.webmanifest'); return r.ok ? (await r.json()).name : null; });
  t('manifest real', man === 'Frequency Laboratory', man);
  await ctx.setOffline(true);
  await p.reload(); await p.waitForTimeout(2500);
  t('repornire offline: pagina se încarcă', await p.evaluate(() => /Frequency Laboratory/.test(document.title) && !!document.getElementById('app-version')), await p.title());
  t('offline: fără pageerror', errs.length === 0, errs);
  await ctx.close();
}
// 4. date corupte în localStorage nu blochează pornirea (4.3.12)
{
  const bad = {'frequencylaboratory.module_order_v1': ['5', '{"a":1}'], 'frequencylaboratory.midi_mappings': ['null', '5', '[1]'], 'frequencylaboratory.modules_v1': ['5', 'null', '{"a":1}']};
  for (const key of Object.keys(bad)) for (const val of bad[key]) {
    const ctx = await b.newContext({viewport: {width: 1280, height: 800}});
    await ctx.addInitScript(([k, v]) => { try { localStorage.setItem('frequencylaboratory.onboarded_v1', '1'); localStorage.setItem('frequencylaboratory.wn_seen', 'v4.0'); localStorage.setItem(k, v); } catch (e) {} }, [key, val]);
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(BASE); await p.waitForTimeout(1500);
    t('stocare coruptă ' + key.split('.')[1] + '=' + val + ': fără pageerror', errs.length === 0, errs);
    await ctx.close();
  }
}
// 5. presetări utilizator cu câmpuri de tip greșit nu opresc panoul (5.1.0)
{
  for (const val of ['[{"name":"a","state":{"freqA":"440"}}]', '[{"name":"a","state":{"freqA":440,"binaural":true}}]']) {
    const ctx = await b.newContext({viewport: {width: 1280, height: 800}});
    await ctx.addInitScript((v) => { try { localStorage.setItem('frequencylaboratory.onboarded_v1', '1'); localStorage.setItem('frequencylaboratory.wn_seen', 'v4.0'); localStorage.setItem('frequencylaboratory.presets_v1', v); } catch (e) {} }, val);
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(BASE); await p.waitForTimeout(1500);
    t('presetare coruptă ' + val.slice(0, 40) + ': fără pageerror', errs.length === 0, errs);
    await ctx.close();
  }
}
await b.close(); srv.close();
console.log('\n' + ok + ' reușite, ' + bad + ' eșuate'); process.exit(bad ? 1 : 0);
