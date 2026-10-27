// Teste v5.2.0 (frequencylaboratory): mod „Generator simplu” + biblioteca de scene portată din generator-frecvente.
import {createRequire} from 'module';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
const require = createRequire(process.env.PW_ROOT || '/opt/node-tools/package.json');
const {chromium} = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const FILE = 'file://' + path.resolve(here, '..', 'index.html');
const AXE = process.env.FFF_AXE || process.env.AXE_PATH;
const SLUG = 'frequencylaboratory';
let ok = 0, bad = 0;
function t(name, cond, extra) { if (cond) { ok++; console.log('  ok  ' + name); } else { bad++; console.log('  FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); } }
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']});
async function open(o = {}) {
  const ctx = await b.newContext({viewport: {width: o.w || 1280, height: 900}, serviceWorkers: 'block', bypassCSP: !!o.axe, acceptDownloads: true});
  await ctx.addInitScript((o) => {
    try { localStorage.setItem(o.slug + '.tutorial_seen', '1'); localStorage.setItem(o.slug + '.onboarded_v1', '1'); localStorage.setItem(o.slug + '.lang', o.lang || 'ro'); if (o.simple) localStorage.setItem(o.slug + '.simple', '1'); sessionStorage.setItem(o.slug + '.hpack', '1'); } catch (e) {}
  }, {slug: SLUG, lang: o.lang, simple: o.simple});
  let net = 0; await ctx.route(/^https?:/, (r) => { net++; r.abort(); });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (/Content Security|Refused/i.test(m.text())) errs.push('csp ' + m.text().slice(0, 140)); });
  await p.goto(FILE); await p.waitForTimeout(1500);
  return {ctx, p, errs, net: () => net};
}
const visPanels = (p) => p.evaluate(() => [...document.querySelectorAll('main .panel')].filter((e) => getComputedStyle(e).display !== 'none').length);

console.log('Mod Generator simplu');
{
  const {ctx, p, errs, net} = await open();
  const total = await p.evaluate(() => document.querySelectorAll('main .panel').length);
  const keep = await p.evaluate(() => document.querySelectorAll('main .panel.gs-keep').length);
  t('în modul complet toate panourile sunt vizibile', (await visPanels(p)) === total && total > 60, {total});
  t('panourile păstrate = cele ale generatorului clasic + scene (36)', keep >= 34 && keep < total, {keep, total});
  t('butonul arată OPRIT', /OPRIT/.test(await p.textContent('#gsToggle')) && (await p.getAttribute('#gsToggle', 'aria-pressed')) === 'false');
  await p.click('#gsToggle'); await p.waitForTimeout(200);
  t('secțiunile fără panouri păstrate sunt ascunse', await p.evaluate(() => [...document.querySelectorAll('.grid > .section-group')].every((g) => (getComputedStyle(g).display === 'none') === !g.querySelector('.panel.gs-keep'))));
  t('modul simplu: numai panourile păstrate sunt vizibile', (await visPanels(p)) === keep, {vis: await visPanels(p), keep});
  t('panourile FL-only sunt ascunse, nu șterse (rămân în DOM)', await p.evaluate(() => { const e = document.getElementById('panelKarplus'); return !!e && getComputedStyle(e).display === 'none'; }));
  t('panourile oscilator A/B, master, zgomot, sesiuni și scene rămân vizibile', await p.evaluate(() => ['col-osc-a', 'col-osc-b', 'col-master', 'col-noise', 'col-sessions', 'col-scenes'].every((c) => getComputedStyle(document.querySelector('main .panel.' + c)).display !== 'none')));
  t('butonul arată PORNIT, aria-pressed=true', /PORNIT/.test(await p.textContent('#gsToggle')) && (await p.getAttribute('#gsToggle', 'aria-pressed')) === 'true');
  t('modul se păstrează (localStorage)', await p.evaluate((s) => localStorage.getItem(s + '.simple') === '1', SLUG));
  t('navigarea rapidă ascunde țintele ascunse', await p.evaluate(() => [...document.querySelectorAll('#quickNav button[data-jump]')].every((bt) => bt.hidden === (document.querySelector('main .panel.' + bt.dataset.jump).classList.contains('gs-keep') ? false : true))));
  await p.click('#gsToggle'); await p.waitForTimeout(100);
  t('revenire la complet', (await visPanels(p)) === total && /OPRIT/.test(await p.textContent('#gsToggle')));
  t('fără erori și fără rețea', errs.length === 0 && net() === 0, {errs, net: net()});
  await ctx.close();
  const c2 = await open({simple: true});
  t('la redeschidere modul simplu rămâne activ', await c2.p.evaluate(() => document.body.classList.contains('gs-on')));
  await c2.ctx.close();
}

console.log('Protecția auzului rămâne în modul simplu');
{
  const {ctx, p} = await open({simple: true});
  const r = await p.evaluate(async () => {
    const c = new AudioContext(); await c.resume();
    const o = c.createOscillator(); o.frequency.value = 220; const g = c.createGain(); g.gain.value = 5; o.connect(g).connect(c.destination); o.start();
    await new Promise((r) => setTimeout(r, 400));
    const a = c.__hp.tap, buf = new Float32Array(a.fftSize); let m = 0;
    for (let i = 0; i < 25; i++) { a.getFloatTimeDomainData(buf); for (const v of buf) m = Math.max(m, Math.abs(v)); await new Promise((r) => setTimeout(r, 20)); }
    return {m, hp: !!c.__hp};
  });
  const lim = Math.pow(10, -6 / 20);
  t('în modul simplu AudioContext trece prin plafon (−6 dB)', r.hp && r.m > lim * 0.9 && r.m <= lim + 0.005, r);
  t('pastila de limită este vizibilă', await p.evaluate(() => { const e = document.getElementById('hpPill'); return !!e && getComputedStyle(e).display !== 'none'; }));
  await ctx.close();
  const c2 = await b.newContext({viewport: {width: 1280, height: 900}, serviceWorkers: 'block'});
  await c2.addInitScript((s) => { localStorage.setItem(s + '.simple', '1'); localStorage.setItem(s + '.tutorial_seen', '1'); localStorage.setItem(s + '.onboarded_v1', '1'); }, SLUG);
  await c2.route(/^https?:/, (r) => r.abort());
  const q = await c2.newPage(); await q.goto(FILE); await q.waitForTimeout(1500);
  t('fără confirmare, dialogul de avertizare apare și în modul simplu', await q.evaluate(() => { const d = document.getElementById('hpGate'); return !!d && d.open; }));
  await c2.close();
}

console.log('Biblioteca de scene');
{
  const {ctx, p, errs} = await open();
  const R = await p.evaluate(() => {
    const S = FL_SCENES, all = S.all();
    const sc = S.norm({name: 'Test', stages: [{name: 'A', freq: 200, beat: 6, dur: 60, cross: 5, gain: 50}, {name: 'B', freq: 100, beat: 2, dur: 120, cross: 10, gain: 40}]});
    const code = S.encode(sc), back = S.decode(code);
    return {n: all.length, builtin: all.filter((x) => x.builtin).length, code, back: back && back.stages, ok: JSON.stringify(back.stages) === JSON.stringify(sc.stages) && back.name === 'Test',
      bad: [S.decode('nope'), S.decode('GF1.!!!'), S.norm({name: '', stages: []})],
      csv: S.csv([{name: '=cmd', freq: 200, beat: 0, dur: 10, cross: 1, gain: 5}]),
      match: [S.matches(all[0], 'theta'), S.matches(all[0], 'zzzz'), S.matches(all[0], 'alpha beta')],
      clamp: S.norm({name: 'c', stages: [{freq: 999999, beat: 999, dur: 1, cross: 999, gain: 999}]}).stages[0],
      pack: S.parsePack(JSON.stringify({format: 'gf-scenes', version: 1, scenes: [sc]})).length};
  });
  t('6 scene încorporate', R.builtin === 6 && R.n >= 6, R.n);
  t('codul GF1 dus-întors fără pierderi', R.ok && /^GF1\./.test(R.code), R.code);
  t('coduri și scene invalide respinse', R.bad.every((x) => x === null), R.bad);
  t('CSV neutralizează formulele (=)', /"'=cmd"/.test(R.csv), R.csv);
  t('căutare: potrivire / fără potrivire', R.match[0] === true && R.match[1] === false, R.match);
  t('valorile sunt limitate (frecvență ≤ 22000, beat ≤ 40, durată ≥ 5, cross ≤ 60, nivel ≤ 100)', R.clamp.freq === 22000 && R.clamp.beat === 40 && R.clamp.dur === 5 && R.clamp.cross === 60 && R.clamp.gain === 100, R.clamp);
  t('pachet gf-scenes acceptat', R.pack === 1);
  // UI: încarcă o scenă încorporată în sesiuni
  await p.waitForSelector('#sceneList .scene-row');
  t('lista afișează scenele; numărătorul corect', (await p.locator('#sceneList .scene-row').count()) >= 6 && Number(await p.textContent('#sceneCount')) >= 6);
  await p.fill('#sceneSearch', 'delta'); await p.waitForTimeout(100);
  const cnt = await p.locator('#sceneList .scene-row').count();
  t('căutarea „delta” filtrează', cnt >= 1 && cnt < 6, cnt);
  await p.locator('#sceneList .scene-row button', {hasText: 'Încarcă'}).first().click();
  const loaded = await p.evaluate(() => sessionStages.length);
  t('„Încarcă” pune etapele în sesiuni', loaded >= 1 && /încărcată/.test(await p.textContent('#sceneMsg')), loaded);
  await p.fill('#sceneSearch', '');
  // salvare, redenumire, ștergere
  await p.fill('#sceneName', 'Scena mea'); await p.click('#btnSaveScene'); await p.waitForTimeout(100);
  t('salvarea creează o scenă proprie (★) și o păstrează în localStorage', (await p.textContent('#sceneList')).includes('Scena mea ★') && await p.evaluate((s) => JSON.parse(localStorage.getItem(s + '.scenes_v1')).length === 1, SLUG));
  await p.click('#btnSceneCodeCopy'); const code = await p.inputValue('#sceneCode');
  t('codul sesiunii e generat', /^GF1\./.test(code));
  await p.evaluate(() => { sessionStages = []; renderSessionList(); });
  await p.fill('#sceneCode', code); await p.click('#btnSceneCodeLoad');
  t('încărcarea din cod restaurează sesiunea', (await p.evaluate(() => sessionStages.length)) === loaded);
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#btnExportScenes')]);
  const txt = fs.readFileSync(await dl.path(), 'utf8'); const pack = JSON.parse(txt);
  t('exportul produce pachet gf-scenes cu scena proprie', pack.format === 'gf-scenes' && pack.scenes.length === 1 && pack.scenes[0].name === 'Scena mea');
  await p.locator('#sceneList .scene-row', {hasText: 'Scena mea'}).locator('button', {hasText: 'Șterge'}).click();
  await p.waitForSelector('dialog[open], .fff-dlg', {timeout: 3000}).catch(() => {});
  const okBtn = p.locator('.fff-dlg button.fff-btn-danger, .fff-dlg button:has-text("Da"), .fff-dlg button:has-text("OK")').first();
  if (await okBtn.count()) await okBtn.click();
  await p.waitForTimeout(300);
  t('ștergerea (cu confirmare) elimină scena proprie', await p.evaluate((s) => JSON.parse(localStorage.getItem(s + '.scenes_v1') || '[]').length === 0, SLUG));
  // import
  const tmp = path.join(here, 'tmp-scenes.json'); fs.writeFileSync(tmp, txt);
  await p.setInputFiles('#sceneImportFile', tmp); await p.waitForTimeout(300); fs.unlinkSync(tmp);
  t('importul adaugă scena', (await p.textContent('#sceneList')).includes('Scena mea ★'));
  // engleză
  await p.selectOption('#flLang', 'en'); await p.waitForTimeout(1600);
  t('în engleză: titlul și butoanele se traduc', /scene library/i.test(await p.textContent('#scenesPanel .panel-title')) && /SAVE SCENE/.test(await p.textContent('#btnSaveScene')), await p.textContent('#btnSaveScene'));
  t('în engleză: numele scenelor încorporate', /Meditation/.test(await p.textContent('#sceneList')));
  t('fără erori', errs.length === 0, errs);
  await ctx.close();
}

console.log('Axe și lățime');
if (AXE) {
  for (const simple of [false, true]) {
    const {ctx, p} = await open({axe: true, simple, w: 390});
    await p.addScriptTag({content: fs.readFileSync(AXE, 'utf8')});
    const v = await p.evaluate(async () => (await axe.run(document.getElementById('scenesPanel').parentElement ? '#scenesPanel' : document)).violations.map((x) => x.id + ':' + x.nodes.length));
    t('axe 0 violări în panoul de scene' + (simple ? ' (mod simplu)' : '') + ' la 390 px', v.length === 0, v);
    await ctx.close();
  }
}
console.log('\n' + ok + ' reușite, ' + bad + ' eșuate');
await b.close();
process.exit(bad ? 1 : 0);
