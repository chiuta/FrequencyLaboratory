# Jurnal de modificări — FrequencyLaboratory

Format: [SemVer](https://semver.org/lang/ro/) MAJOR.MINOR.PATCH.

## 5.2.1 — 2026-10-31

### Accesibilitate
- Etichetele și valorile panourilor de efecte (`.flp-p`, `.flp-an`, `.flp-st`) la 12 px în loc de 11 px.
- Șirul de versiune din subsol (`data-tf-ro`/`data-tf-en`) aliniat cu `app.json`; înainte rămânea 5.2.0 la schimbarea limbii.

## 5.2.0 — 2026-10-27 (anterior: v5.1.0)

Stare: stabil · Offline: complet

Aplicat în tura 2 a recenziei din 2026-10-27 (funcții noi → versiune minoră).

### Adăugat
- **Mod „Generator simplu”** (buton deasupra navigării rapide; reținut în `frequencylaboratory.simple`): arată doar cele panourile ale generatorului clasic `generator-frecvente` (oscilatoare A/B, afișaj, master, filtru, modulație, zgomot, înregistrare, sesiuni, presetări, măsurare, acorduri, efecte, pian, RTA, teste, audiogramă, ambient, tinitus, bază de date, tobe, secvențiator, looper, granular, vocoder, compresor multibandă…) plus biblioteca de scene. Restul panourilor (patch modular, laboratoare de sinteză, analizoare suplimentare) sunt ASCUNSE, nu eliminate. În acest mod, secțiunile cu panouri păstrate se afișează chiar dacă sistemul de module le-a dezactivat în modul complet.
- **Bibliotecă de scene** (logică copiată din generator-frecvente), vizibilă în ambele moduri: 6 scene încorporate + scene proprii (max. 100, `frequencylaboratory.scenes_v1`), căutare, încărcare în sesiuni, rulare, export/import (pachet JSON `gf-scenes`), plan CSV (cu neutralizarea formulelor), cod de partajare `GF1.…` compatibil cu generator-frecvente; ștergere cu confirmare.
- **Protecția auzului** (avertizare + limitator, introduse în 5.1.0) funcționează neschimbat în ambele moduri; test dedicat (în modul simplu, un oscilator la amplitudine 5 rămâne sub plafonul de −6 dB; fără confirmare apare dialogul).
- Texte noi scrise în română și engleză (cu `_L`); traduceri fr/it/es/pt/de/hu adăugate ulterior ca rânduri în tabela de traduceri existentă a aplicației (41 de rânduri) — traducere automată, nevalidată de vorbitori nativi.
- Test nou `tests/gen-simplu-v52.test.mjs` (37 de verificări).
- README (8 limbi): secțiune nouă, istoric, versiune.

### Neimplementat
- Fuziunea cu generator-frecvente: aplicațiile rămân separate; generator-frecvente rămâne funcțional, neschimbat, la URL-ul lui.
- Modul simplu NU este o interfață nouă, simplificată: este aceeași interfață FL cu aceleași panouri ca în generator-frecvente (afișarea selectivă a panourilor existente).
- Limitatorul nu poate controla volumul hardware al dispozitivului/căștilor (ca în 5.1.0).

## 5.1.0 — 2026-10-27 (anterior: v5.0.0)

Stare: stabil · Offline: complet

Aplicat după mini-recenzia din 2026-10-27 (funcții noi → versiune minoră).

### Adăugat
- **Avertizare de protecție a auzului la pornire, cu confirmare înainte de primul sunet.** Dialog modal (8 limbi, accesibil, axe 0 violări). Până la confirmare, ieșirea audio este mută (câștig 0 pe lanțul de ieșire), indiferent de ce pornește aplicația. Confirmarea se păstrează doar pe sesiune (`sessionStorage`), deci reapare la următoarea deschidere.
- **Limitator de volum (plafon) pe ieșire.** Toate `AudioContext`-urile paginii sunt trecute printr-un lanț intrare → WaveShaper (taie la ±1) → câștig-plafon → difuzoare/căști; implicit −6 dB, reglabil de la −30 dB la 0 dB din pastila „LIMITĂ … dB” din antet sau din dialog. Limita se păstrează în `localStorage` (`frequencylaboratory.volcap`). Se aplică și testului auditiv și generatoarelor de test; nu afectează fișierele WAV înregistrate. Fără rețea, fără biblioteci.
- Notă „vezi și” Generator de frecvențe (generator-frecvente) în README (8 limbi), cu explicația diferenței dintre cele două aplicații. Aplicațiile NU au fost fuzionate.
- README (8 limbi): linii „Stare: stabil” și „Offline: complet”; secțiuni noi; istoric.
- Test nou `tests/hearing-guard.test.mjs` (30 verificări: mut înainte de confirmare, plafon măsurat cu AnalyserNode, persistență, 8 limbi, axe, fără rețea).

### Modificat
- Testele existente deschid aplicația cu avertizarea deja confirmată (`sessionStorage`), altfel dialogul modal le blochează clicurile.

### Neimplementat
- Fuziunea cu Generator de frecvențe (generator-frecvente) (recomandarea din recenzie): omisă intenționat, conform regulilor lotului; doar notă „vezi și”.
- Limitatorul nu poate controla volumul hardware al dispozitivului/căștilor; avertizarea îl recomandă la minim.

## 5.0.0
- Versiunea anterioară (vezi istoricul din README).
