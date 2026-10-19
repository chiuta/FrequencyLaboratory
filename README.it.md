# Frequency Laboratory

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · **Italiano** · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

**Versione:** 4.3.1 · **Ultimo aggiornamento:** 2026-10-19

Lingue dell'interfaccia: **Română, English, Français, Italiano, Español, Português (PT), Deutsch, Magyar**

Generatore audio completo nel browser: oscillatori, binaurale, filtri, effetti, pianoforte, analizzatori e test uditivi.

**App online:** https://chiuta.github.io/FrequencyLaboratory/

![Schermata](screenshot.it.png)

## Che cos'è

Frequency Laboratory (v4.2.0 nel titolo dell'app) è un laboratorio audio in un unico file HTML, basato sulla Web Audio API. Combina generatore di toni, sintesi, effetti, sessioni programmabili, strumenti di misura con il microfono e una banca dati di frequenze (Solfeggio, Schumann, binaurali, accordature, ecc.). L'applicazione precisa che non è un trattamento medico e che le categorie di frequenze hanno carattere informativo.

## Funzioni

Le funzioni qui sotto compaiono come sezioni/controlli nell'interfaccia:

- **Generazione:** Osc A e Osc B (sinusoide, quadra, triangolare, dente di sega), modalità binaurale (Δ binaurale), hard sync, ADSR, portamento, filtri (passa-basso/passa-alto/passa-banda, notch, shelf, peaking, comb), sweep, modulazione AM/isocronica (ISO 2/6/10/40 Hz), rumore bianco/rosa/marrone.
- **Sintesi ed effetti:** accordi e arpeggiatore, sub-oscillatore e supersaw, FM, ring, auto-pan, drive/compressore/EQ a 5 bande/gate/chorus/flanger/delay/reverb, filtro di formanti vocali, matrice di modulazione LFO, player di progressioni di accordi, step sequencer a 8 passi, Karplus-Strong, sintetizzatore granulare, looper, accordature (12-TET, giusta, pitagorica, 19-TET, 31-TET, raga, gamelan, ecc.).
- **Pianoforte e MIDI:** tastiera, note scritte (es. A4), tap tempo, MIDI IN (Web MIDI, solo nei browser che lo supportano), mappature MIDI.
- **Analisi:** oscilloscopio, spettro FFT, spettrogramma, istogramma, scope di fase (Lissajous), RTA a 1/3 di ottava, THD stimato, accordatore con microfono, fonometro SPL con calibrazione, misura dell'ambiente (room sweep) con esportazione CSV.
- **Test:** identificazione dei canali, polarità, impulso/chirp, rodaggio degli altoparlanti, audiogramma interattivo (esportazione PNG), gioco «identifica la frequenza», tinnitus matcher con mascheramento notch, toni «mosquito».
- **Suoni ambientali** generati proceduralmente (pioggia, oceano, vento, fuoco, foresta).
- **Sessioni:** fasi programmabili con crossfade, modelli Meditazione / Addormentamento / Solfeggio, sleep timer con dissolvenza, registrazione WAV a 16 bit con pre-roll.
- **Dati:** preset utente, preferiti, esportazione/importazione JSON, annulla/ripeti, condivisione della configurazione tramite URL, condivisione WAV/JSON (Web Share), temi di colore (Phosphor, Amber, Blue, Mono), Wake Lock, tutorial.
- Interfaccia in 8 lingue (RO, EN, FR, IT, ES, PT, DE, HU); si usa prima la lingua salvata, poi quella del browser (altrimenti EN), e la scelta fatta con il selettore di lingua viene conservata. Attenzione: nella versione RO molte etichette tecniche restano in inglese (waveform, reverb, cutoff, ecc.).

## Guida all'uso

1. Apri la pagina e, se necessario, percorri il tutorial (`★ TUTORIAL`).
2. Imposta la frequenza in «Osc A» e la forma d'onda; tieni il volume «master» sotto il 20% all'inizio (avviso dell'app).
3. Premi `START ▶` (o Spazio); `STOP ◼` ferma; `PANIC ✕` (o `P`) ferma all'istante.
4. Per il binaurale, avvia «Osc B», attiva la «modalità binaurale» e imposta il «Δ binaurale»; usa le cuffie.
5. Esplora le sezioni della barra dei moduli (Accordi, Effetti, Pianoforte, RTA, Audiogramma, Ambient, Presets, Database, ecc.).
6. Scorciatoie: Spazio start/stop, `P` panic, `R` registrazione, `↑/↓` frequenza A ±1 Hz, `Shift+↑/↓` ±10 Hz, `1–4` forma d'onda, `[` / `]` volume master ∓5%, `S` snap alla nota, `D` drone, `?` elenco delle scorciatoie, `Esc` chiude.
7. Registrazione: `▶ START RECORDING`, poi `↓ DOWNLOAD WAV`.
8. Preset: salva con un nome, poi `↑ EXPORT JSON` per il backup e `↓ IMPORT JSON` per il ripristino (l'importazione si unisce ai preset esistenti).
9. Il microfono (SPL, accordatore, RTA con microfono, room sweep) si attiva solo su richiesta; il browser chiede il permesso.

## Privacy e rete

- **Archiviazione locale:** `localStorage`, chiavi con prefisso `lab_frecv_` (lingua, tema, preset, preferiti, mappature MIDI, ordine/stato dei moduli, indicatori di onboarding). La cancellazione dei dati del sito elimina i preset; usa l'esportazione JSON per il backup.
- **Rete:** l'applicazione non effettua richieste `fetch` e non carica script o font esterni. La CSP nella pagina limita `connect-src` a `'self'`. I link (Buy Me a Coffee, alexio.tf, creativecommons.org) sono collegamenti ipertestuali aperti solo al clic.
- Il microfono è usato in locale, solo dopo la concessione del permesso; l'applicazione non invia l'audio da nessuna parte.

## Avvertenza

Contenuto informativo/educativo. L'applicazione non è un dispositivo né un trattamento medico e non sostituisce il parere medico (anche per acufene, dolore o problemi di udito). Le frequenze «Solfeggio», «Schumann», i ritmi binaurali/isocronici e i preset dell'interfaccia denominati «Pain Relief» o «Peak Performance» non hanno validazione scientifica come terapia e non hanno alcun effetto medico dimostrato (i nomi dei preset sono mantenuti come denominazioni indicative; l'interfaccia mostra l'avvertenza accanto a essi, in RO e EN); la pagina stessa avverte nel pannello dei preset. Usa un volume basso (sotto il 20% all'inizio), soprattutto con le cuffie; evita le frequenze alte a volume elevato. L'audiogramma non sostituisce un audiogramma medico.

## Esecuzione locale / offline

Scarica `index.html` e aprilo nel browser; non richiede internet. Il MIDI funziona solo dove esiste Web MIDI (ad es. Chrome desktop), e l'accesso al microfono richiede un contesto sicuro (HTTPS o file locale, a seconda del browser).

## Licenza

MIT — vedi il file LICENSE

## Audit

2026-10-11 (round 3): le etichette aggiunte dall'audit e l'avvertenza sono tradotte RO/EN (richiedono revisione madrelingua); avvertenza «nessun effetto medico dimostrato» accanto ai preset Pain Relief / Peak Performance / Solfeggio.

2026-10-10: verificato (nessuna richiesta di rete nel codice, CSP `connect-src 'self'`); aggiunti nomi accessibili per i controlli, contrasto, avviso nel piè di pagina.

## Autore

Alexio — Alexandru-Ionuț Chiuță, contatto: alexio@trom.tf

## Riepilogo

Frequency Laboratory è un toolkit Web Audio in un unico file: oscillatori e battimenti binaurali, filtri ed effetti, pianoforte/MIDI, sequencer, analizzatori (FFT, RTA, scope di fase), misura SPL e dell'ambiente con il microfono, test uditivi, suoni ambientali, sessioni programmabili, registrazione WAV e una banca dati di frequenze. Interfaccia rumeno/inglese. Lo stato è conservato in localStorage (chiavi `lab_frecv_`); l'applicazione non effettua richieste di rete (CSP `connect-src 'self'`). Non è un dispositivo medico.

## Cronologia / Changelog

### 4.2.1 — 2026-10-19
- Correzione: durante il caricamento da `#state=<base64>`, i parametri aggiuntivi presenti nell'indirizzo (ad es. `&from=generator-frecvente`) non compromettono più la decodifica dello stato.

### 4.2.0 — 2026-10-14
- Copia di riserva ed etichettatura dei dati (fff-kit).

### 12 ottobre 2026 (v4.1.3)
- 4.1.3 — 2026-10-12: la versione e la data dell'ultimo aggiornamento sono mostrate nell'app

### 11 ottobre 2026
- Prima visita: la lingua predefinita segue quella del browser (rumeno → RO, altrimenti EN) invece di essere sempre RO; prima i visitatori con browser in inglese vedevano un'interfaccia mista RO/EN.
- Eliminate le tre notifiche (toast) al caricamento (portamento, micro-accordatura, «v4.1.2 caricato · MIDI»), che si sovrapponevano all'intestazione; il messaggio sul MIDI compare quando si usa il MIDI. Scompare anche la parola francese «prêt» da una di esse.
- La pillola delle donazioni segue la lingua dell'interfaccia (RO/EN), comprese le etichette ARIA.
- v4.1.2: avviso di volume (oltre il 60%, `role=status`, RO/EN) accanto al volume master; scorciatoie `[` / `]` per il volume; CSP su hash (senza `'unsafe-inline'` in `script-src`, `blob:` mantenuto per il worklet/la registrazione). Testato offline: 0 errori/violazioni CSP, 0 overflow orizzontale, axe 0.
- Versione unificata v4.1.2 (titolo, intestazione, manifest, piè di pagina; prima il titolo diceva v4.0 e il piè di pagina v4.1).
- La guida di benvenuto (primo avvio) ha ora i pulsanti RO/EN e «Salta» (più il tasto Esc), è una finestra di dialogo accessibile ed è tradotta completamente in inglese; i moduli/profili sono tradotti in fase di visualizzazione. Sugli schermi bassi non taglia più la parte superiore.
- I font di visualizzazione incorporati non contengono Ă/Ș/Ț: gli elementi interessati passano al font di testo (classe `dia-fb`), quindi il titolo non mescola più i glifi (ad es. «FRECVENȚE», «CONTINUĂ»).
- Axe: 0 violazioni (contenuto in `<main>`, 18 campi con `aria-label`, titoli h2 in «Usage notes», `aside` per le donazioni, contenitore delle notifiche come regione). Corretto «uppended» → «suspended» nell'indicatore CTX.
