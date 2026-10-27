# Jurnal de modificări — FrequencyLaboratory

Format: [SemVer](https://semver.org/lang/ro/) MAJOR.MINOR.PATCH.

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
