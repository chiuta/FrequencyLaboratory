// Test: patch modular (v5) — validare, cicluri, cod FLP1, JSON, salvare, verificare offline (FFT) pe analizor, 8 limbi.
// Rulare: node tests/modular-v5.test.mjs [cale_index.html]
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require = createRequire(process.env.PW_ROOT || import.meta.url);
const {chromium} = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILE = 'file://' + (process.argv[2] || path.join(HERE, '..', 'index.html'));
let ok = 0, bad = 0;
const check = (n, c, x) => { if (c) { ok++; console.log('  ok   ' + n); } else { bad++; console.log('  FAIL ' + n + (x !== undefined ? '  → ' + JSON.stringify(x) : '')); } };
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 1280, height: 900}, locale: 'en'});
const net = [];
await ctx.route(/^https?:/, (r) => { net.push(r.request().url()); r.abort(); });
await ctx.addInitScript(() => { try { localStorage.setItem('frequencylaboratory.lang', 'en'); localStorage.setItem('frequencylaboratory.onboarded_v1', '1'); } catch (e) {} });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => { if (/Content Security Policy|Refused to/i.test(m.text())) errs.push('csp: ' + m.text()); });
await page.goto(FILE);
await page.waitForFunction(() => window.FL_PATCH && document.getElementById('flpMods'), null, {timeout: 15000});
const ev = (f, a) => page.evaluate(f, a);

// --- structură inițială
check('exemplu încărcat: 5 module, 4 conexiuni', await ev(() => { const p = FL_PATCH.get(); return p.mods.length === 5 && p.cons.length === 4; }));
check('panoul are avertisment (nu dispozitiv medical)', /not a medical device/i.test(await ev(() => document.getElementById('flpWarn').textContent)));
check('UI: 5 carduri de modul', await ev(() => document.querySelectorAll('#flpMods .flp-mod').length) === 5);

// --- validare / reguli
const R = await ev(() => {
  const P = FL_PATCH, o = {};
  const t = (f) => { try { f(); return 'ok'; } catch (e) { return e.code || e.message; } };
  o.badType = t(() => P.norm({mods: [{id: 'x', type: 'evil', p: {}}], cons: []}));
  o.proto = t(() => P.norm({mods: [{id: 'x', type: '__proto__', p: {}}], cons: []}));
  o.dupId = t(() => P.norm({mods: [{id: 'a', type: 'gain'}, {id: 'a', type: 'gain'}], cons: []}));
  o.two = t(() => P.norm({mods: [{id: 'a', type: 'out'}, {id: 'b', type: 'out'}], cons: []}));
  o.cycle = t(() => P.norm({mods: [{id: 'a', type: 'gain'}, {id: 'b', type: 'gain'}], cons: [['a', 'b'], ['b', 'a']]}));
  o.fromOut = t(() => P.norm({mods: [{id: 'a', type: 'out'}, {id: 'b', type: 'gain'}], cons: [['a', 'b']]}));
  o.lfoAudio = t(() => P.norm({mods: [{id: 'a', type: 'lfo'}, {id: 'b', type: 'gain'}], cons: [['a', 'b']]}));
  o.audioToParam = t(() => P.norm({mods: [{id: 'a', type: 'osc'}, {id: 'b', type: 'gain'}], cons: [['a', 'b.g']]}));
  o.toOsc = t(() => P.norm({mods: [{id: 'a', type: 'osc'}, {id: 'b', type: 'osc'}], cons: [['a', 'b']]}));
  o.many = t(() => P.norm({mods: Array.from({length: 17}, (_, i) => ({id: 'g' + i, type: 'gain'})), cons: []}));
  const c = P.norm({mods: [{id: 'a', type: 'osc', p: {f: 1e9, g: 99, w: 'zzz'}}, {id: 'b', type: 'delay', p: {fb: 5, t: -3}}], cons: []});
  o.clamp = [c.mods[0].p.f, c.mods[0].p.g, c.mods[0].p.w, c.mods[1].p.fb, c.mods[1].p.t];
  return o;
});
check('tip necunoscut respins', R.badType === 'invalid', R);
check('__proto__ ca tip respins', R.proto === 'invalid', R);
check('id duplicat respins', R.dupId === 'invalid');
check('două ieșiri respinse', R.two === 'out1');
check('buclă respinsă', R.cycle === 'cycle');
check('conexiune din ieșire respinsă', R.fromOut === 'rule');
check('LFO către intrare audio respins', R.lfoAudio === 'rule');
check('audio către parametru respins', R.audioToParam === 'rule');
check('conexiune spre oscilator (fără intrare) respinsă', R.toOsc === 'rule');
check('max 16 module', R.many === 'limit');
check('valori limitate: f=20000, g=1, w=sine, fb=0.9, t=0.01', JSON.stringify(R.clamp) === JSON.stringify([20000, 1, 'sine', 0.9, 0.01]), R.clamp);

// --- operații pe stare
const O = await ev(() => {
  const P = FL_PATCH, o = {};
  P.set({mods: [], cons: []});
  const a = P.add('osc'), g = P.add('gain'), out = P.add('out'), out2 = P.add('out');
  o.ids = [a, g, out, out2];
  o.c1 = P.connect(a, g); o.c2 = P.connect(g, out); o.cyc = P.connect(g, a);
  o.n = P.get().cons.length;
  P.setParam(a, 'f', 880); o.f = P.get().mods[0].p.f;
  P.remove(g); o.afterRm = [P.get().mods.length, P.get().cons.length];
  return o;
});
check('add: id-uri osc1,gain1,out1; a doua ieșire refuzată', JSON.stringify(O.ids) === JSON.stringify(['osc1', 'gain1', 'out1', null]), O.ids);
check('connect ok / buclă refuzată', O.c1 === true && O.c2 === true && O.cyc === false && O.n === 2, O);
check('setParam', O.f === 880);
check('remove șterge și conexiunile', O.afterRm[0] === 2 && O.afterRm[1] === 0, O.afterRm);

// --- cod FLP1 și JSON
const C = await ev(() => {
  const P = FL_PATCH, o = {};
  P.set(P.example()); const code = P.encode(); o.prefix = code.slice(0, 5);
  const back = P.decode(code); o.same = JSON.stringify(back.mods) === JSON.stringify(P.norm(P.example()).mods) && back.cons.length === 4;
  const js = P.exportJSON(); o.json = JSON.parse(js).mods.length;
  P.set({mods: [], cons: []}); o.imp = P.importText(js); o.after = P.get().mods.length;
  o.impCode = P.importText(code); 
  const status = () => document.getElementById('flpStatus').textContent;
  o.bad = P.importText('FLP1.@@@'); o.bad2 = P.importText('{"mods":[{"id":"x","type":"nope"}],"cons":[]}'); o.badMsg = status();
  o.keep = P.get().mods.length;
  return o;
});
check('cod începe cu FLP1.', C.prefix === 'FLP1.');
check('cod → patch round-trip', C.same);
check('JSON export/import', C.json === 5 && C.imp === true && C.after === 5);
check('import din cod FLP1', C.impCode === true);
check('cod/JSON invalid respins, starea rămâne', C.bad === false && C.bad2 === false && C.keep === 5 && /Invalid patch/.test(C.badMsg), C);

// --- salvare
const SV = await ev(() => {
  const P = FL_PATCH, o = {};
  P.set(P.example()); P.save('t1'); P.save('t2'); P.save('t1');
  o.names = P.list().map((x) => x.name); 
  P.set({mods: [], cons: []}); o.loaded = P.load('t2') && P.get().mods.length === 5;
  P.del('t2'); o.after = P.list().map((x) => x.name);
  o.raw = localStorage.getItem(P.KEY) !== null;
  localStorage.setItem(P.KEY, '{broken'); o.broken = P.list().length;
  return o;
});
check('salvare: ordine și suprascriere (t1,t2)', JSON.stringify(SV.names) === JSON.stringify(['t1', 't2']), SV.names);
check('încărcare + ștergere', SV.loaded && JSON.stringify(SV.after) === '["t1"]', SV);
check('stocare cu prefixul frequencylaboratory.', SV.raw);
check('JSON stricat în stocare → listă goală', SV.broken === 0);

// --- verificare offline: analizor măsoară frecvența reală
const V = await ev(async () => {
  const P = FL_PATCH, o = {};
  P.set({mods: [{id: 'o', type: 'osc', p: {w: 'sine', f: 440, g: 0.5}}, {id: 'a', type: 'analyzer'}, {id: 'u', type: 'out', p: {g: 0.5}}], cons: [['o', 'a'], ['a', 'u']]});
  const r = await P.verify(); o.hz = r.an.a.peakHz; o.outHz = r.out.peakHz; o.rms = r.an.a.rmsDb; o.silent = r.an.a.silent;
  // filtru trece-jos 500 Hz pe 4 kHz → mult atenuat față de fără filtru
  P.set({mods: [{id: 'o', type: 'osc', p: {w: 'sine', f: 4000, g: 0.5}}, {id: 'f', type: 'filter', p: {ty: 'lowpass', f: 500, q: 0.7}}, {id: 'a', type: 'analyzer'}, {id: 'b', type: 'analyzer'}, {id: 'u', type: 'out', p: {g: 0.5}}], cons: [['o', 'b'], ['o', 'f'], ['f', 'a'], ['a', 'u']]});
  const r2 = await P.verify(); o.lp = r2.an.a.rmsDb; o.raw = r2.an.b.rmsDb;
  // fără ieșire
  try { await P.verify({v: 1, mods: [{id: 'o', type: 'osc'}], cons: []}); o.noout = 'no'; } catch (e) { o.noout = e.code; }
  // zgomot: spectru lat, nu mut
  P.set({mods: [{id: 'n', type: 'noise', p: {c: 'pink', g: 0.5}}, {id: 'a', type: 'analyzer'}, {id: 'u', type: 'out', p: {g: 0.5}}], cons: [['n', 'a'], ['a', 'u']]});
  const r3 = await P.verify(); o.noiseSilent = r3.an.a.silent; o.noiseRms = r3.an.a.rmsDb;
  // limitator: ieșire cu amplificare mare nu depășește 1.0
  P.set({mods: [{id: 'o', type: 'osc', p: {w: 'square', f: 300, g: 1}}, {id: 'g', type: 'gain', p: {g: 2}}, {id: 'u', type: 'out', p: {g: 0.8}}], cons: [['o', 'g'], ['g', 'u']]});
  const r4 = await P.verify(); o.maxOut = r4.out.max;
  // LFO pe frecvența filtrului: determinist (același rezultat de două ori)
  P.set(P.example()); const r5 = await P.verify(), r6 = await P.verify(); o.det = r5.out.rmsDb === r6.out.rmsDb; o.exOut = r5.out.silent;
  return o;
});
check('analizor: sinus 440 Hz → vârf ~440 Hz', Math.abs(V.hz - 440) < 3, V);
check('ieșire: același vârf', Math.abs(V.outHz - 440) < 3);
check('RMS sinus amplitudine 0.5 ≈ -9 dB', V.rms > -10 && V.rms < -8, V.rms);
check('filtru trece-jos 500 Hz atenuează 4 kHz cu > 25 dB', V.raw - V.lp > 25, [V.raw, V.lp]);
check('verify fără ieșire → noout', V.noout === 'noout');
check('zgomot roz: ne-mut', V.noiseSilent === false && V.noiseRms > -40, V);
check('limitator: ieșire ≤ 1.0 chiar cu amplificare 2×', V.maxOut <= 1.0, V.maxOut);
check('exemplul (cu LFO) e determinist și audibil', V.det && !V.exOut);

// --- UI și limbi
await ev(() => FL_PATCH.set(FL_PATCH.example()));
await page.click('#flpVerify');
await page.waitForFunction(() => /✓/.test(document.getElementById('flpV_analyzer1').textContent), null, {timeout: 15000});
check('buton Verifică → rezultat afișat pe analizor', /peak \d+/.test(await ev(() => document.getElementById('flpV_analyzer1').textContent)));
await ev(() => { document.getElementById('flpAdd').value = 'delay'; document.getElementById('flpAddB').click(); });
check('UI: adăugare modul delay', await ev(() => FL_PATCH.get().mods.some((m) => m.id === 'delay1')));
await ev(() => { const i = document.getElementById('flpP_osc1_f'); i.value = '330'; i.dispatchEvent(new Event('change', {bubbles: true})); });
check('UI: parametru modificat în stare', await ev(() => FL_PATCH.get().mods[0].p.f) === 330);
await ev(() => { const f = document.getElementById('flpFrom'); f.value = 'lfo1'; f.dispatchEvent(new Event('change')); });
check('UI: LFO propune doar ținte-parametru', await ev(() => [...document.querySelectorAll('#flpTo option')].every((o) => /\./.test(o.value))));
await ev(() => { document.getElementById('flpCopy').click(); });
check('Copiază cod → textarea conține FLP1.', /^FLP1\./.test(await ev(() => document.getElementById('flpIO').value)));
// redare live (headless: doar stare)
const lv = await ev(() => { const P = FL_PATCH; P.set(P.example()); const a = P.play(); const l = P.isLive(); P.stop(); return [a, l, P.isLive()]; });
check('play/stop: stare live', lv[0] === true && lv[1] === true && lv[2] === false, lv);

for (const L of ['en', 'ro', 'fr', 'it', 'es', 'pt', 'de', 'hu']) {
  const TXok = await ev(() => { const T = FL_PATCH.TX; return Object.keys(T).every((k) => T[k].length === 8 && T[k].every((s) => typeof s === 'string' && s.length)); });
  if (L === 'en') check('i18n: toate cheile au 8 limbi', TXok);
  await ev((l) => { document.documentElement.lang = l; if (window.__FL) window.__FL.L = l; }, L);
  await page.waitForTimeout(300);
  const info = await ev(() => ({t: document.getElementById('flpTitle').textContent, w: document.getElementById('flpWarn').textContent, unl: [...document.querySelectorAll('#flpPanel input:not([hidden]),#flpPanel select,#flpPanel textarea')].filter((e) => !(e.getAttribute('aria-label') || (e.labels && e.labels.length))).length}));
  check(L + ': titlu tradus + 0 controale fără nume', info.t.length > 3 && info.unl === 0, info);
  if (L !== 'en') check(L + ': avertismentul diferă de EN', info.w !== (await ev(() => FL_PATCH.TX.warn[0])), info.w);
}
check('fără pageerror/CSP', errs.length === 0, errs);
check('fără rețea', net.length === 0, net);
await b.close();
console.log('\n' + ok + ' reușite, ' + bad + ' eșuate');
process.exit(bad ? 1 : 0);
