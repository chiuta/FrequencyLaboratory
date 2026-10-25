# Frequency Laboratory

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · **Português** · [Deutsch](README.de.md) · [Magyar](README.hu.md)

**Versão:** 4.3.14 · **Última atualização:** 2026-10-26

Idiomas da interface: **Română, English, Français, Italiano, Español, Português (PT), Deutsch, Magyar**

Gerador de áudio completo no navegador: osciladores, binaural, filtros, efeitos, piano, analisadores e testes auditivos.

**Aplicação online:** https://chiuta.github.io/FrequencyLaboratory/

![Captura de ecrã](screenshot.pt.png)

## O que é

O Frequency Laboratory (v4.2.0 no título da aplicação) é um laboratório de áudio num único ficheiro HTML, baseado na Web Audio API. Combina gerador de tons, síntese, efeitos, sessões programáveis, ferramentas de medição com o microfone e uma base de dados de frequências (Solfeggio, Schumann, binaurais, afinações, etc.). A aplicação esclarece que não é um tratamento médico e que as categorias de frequências são meramente informativas.

## Funcionalidades

As funcionalidades abaixo surgem como secções/controlos na interface:

- **Geração:** Osc A e Osc B (sinusoidal, quadrada, triangular, dente de serra), modo binaural (Δ binaural), hard sync, ADSR, portamento, filtros (passa-baixo/passa-alto/passa-banda, notch, shelf, peaking, comb), sweep, modulação AM/isocrónica (ISO 2/6/10/40 Hz), ruído branco/rosa/castanho.
- **Síntese e efeitos:** acordes e arpejador, suboscilador e supersaw, FM, ring, auto-pan, drive/compressor/equalizador de 5 bandas/gate/chorus/flanger/delay/reverb, filtro de formantes vocais, matriz de modulação LFO, reprodutor de progressões de acordes, sequenciador por passos de 8 passos, Karplus-Strong, sintetizador granular, looper, afinações (12-TET, justa, pitagórica, 19-TET, 31-TET, raga, gamelão, etc.).
- **Piano e MIDI:** teclado, notas escritas (p. ex. A4), tap tempo, MIDI IN (Web MIDI, apenas em navegadores que o suportem), mapeamentos MIDI.
- **Análise:** osciloscópio, espectro FFT, espectrograma, histograma, osciloscópio de fase (Lissajous), RTA em terços de oitava, THD estimada, afinador com microfone, decibelímetro SPL com calibração, medição de sala (room sweep) com exportação CSV.
- **Testes:** identificação de canais, polaridade, impulso/chirp, rodagem de colunas, audiograma interativo (exportação PNG), jogo «identifique a frequência», tinnitus matcher com mascaramento notch, tons «mosquito».
- **Sons ambiente** gerados proceduralmente (chuva, oceano, vento, fogo, floresta).
- **Sessões:** etapas programáveis com crossfade, modelos de Meditação / Adormecer / Solfeggio, temporizador de sono com fade, gravação WAV de 16 bits com pre-roll.
- **Dados:** predefinições do utilizador, favoritos, exportação/importação JSON, anular/refazer, partilha da configuração por URL, partilha WAV/JSON (Web Share), temas de cor (Phosphor, Amber, Blue, Mono), Wake Lock, tutorial.
- Interface em 8 idiomas (RO, EN, FR, IT, ES, PT, DE, HU); usa-se primeiro o idioma guardado, depois o do navegador (caso contrário EN), e a escolha feita com o seletor de idioma é conservada. A ajuda (ELI5), as notas de utilização, o tutorial, os registos de alterações e o catálogo de frequências (cerca de 230 entradas com nomes e descrições) existem nas 8 línguas, e a versão RO, em que cerca de 800 textos estavam só em inglês, está agora traduzida; os nomes próprios, os formatos/códigos e os nomes padrão dos modos musicais ficam como estão. As traduções que não sejam RO e EN são automáticas e não foram verificadas por falantes nativos.

## Manual de utilização

1. Abra a página e, se necessário, percorra o tutorial (`★ TUTORIAL`).
2. Defina a frequência em «Osc A» e a forma de onda; mantenha o volume «master» abaixo de 20% no início (aviso da aplicação).
3. Prima `START ▶` (ou Espaço); `STOP ◼` pára; `PANIC ✕` (ou `P`) pára instantaneamente.
4. Para binaural, inicie o «Osc B», ative o «modo binaural» e defina o «Δ binaural»; use auscultadores.
5. Explore as secções da barra de módulos (Acordes, Efeitos, Piano, RTA, Audiograma, Ambient, Presets, Database, etc.).
6. Atalhos: Espaço start/stop, `P` panic, `R` gravação, `↑/↓` frequência A ±1 Hz, `Shift+↑/↓` ±10 Hz, `1–4` forma de onda, `[` / `]` volume master ∓5%, `S` ajuste à nota, `D` drone, `?` lista de atalhos, `Esc` fecha.
7. Gravação: `▶ START RECORDING`, depois `↓ DOWNLOAD WAV`.
8. Predefinições: guarde com um nome, depois `↑ EXPORT JSON` para cópia de segurança e `↓ IMPORT JSON` para restauro (a importação funde-se com as predefinições existentes).
9. O microfone (SPL, afinador, RTA com microfone, room sweep) só é ativado a pedido; o navegador pede permissão.

## Privacidade e rede

- **Armazenamento local:** `localStorage`, chaves com o prefixo `frequencylaboratory.` (idioma, tema, predefinições, favoritos, mapeamentos MIDI, ordem/estado dos módulos, marcas de onboarding). Apagar os dados do sítio elimina as predefinições; use a exportação JSON como cópia de segurança.
- **Rede:** a aplicação não faz pedidos `fetch` e não carrega scripts nem tipos de letra externos. A CSP da página limita `connect-src` a `'self'`. As ligações (Buy Me a Coffee, alexio.tf, creativecommons.org) são hiperligações abertas apenas ao clicar.
- O microfone é usado localmente, apenas após a concessão da permissão; a aplicação não envia o áudio para lado nenhum.

## Aviso

Conteúdo informativo/educativo. A aplicação não é um dispositivo nem um tratamento médico e não substitui o aconselhamento médico (incluindo em caso de acufenos, dor ou problemas de audição). As frequências «Solfeggio», «Schumann», os ritmos binaurais/isocrónicos e as predefinições da interface denominadas «Pain Relief» ou «Peak Performance» não têm validação científica como terapia nem efeito médico comprovado (os nomes das predefinições são mantidos como designações indicativas; a interface apresenta o aviso junto a elas, na língua da interface); a própria página avisa no painel de predefinições. Use um volume baixo (abaixo de 20% no início), sobretudo com auscultadores; evite frequências agudas a volume elevado. O audiograma não substitui uma audiometria médica. As notas sobre o teste auditivo e a segurança e as descrições do catálogo de frequências (solfeggio, ondas cerebrais, Schumann etc., que nas fontes trazem alegações terapêuticas) são traduzidas automaticamente e requerem revisão por um especialista.

## Execução local / offline

Transfira `index.html` e abra-o no navegador; não requer internet. O MIDI só funciona onde existe Web MIDI (p. ex. Chrome de computador), e o acesso ao microfone requer um contexto seguro (HTTPS ou ficheiro local, consoante o navegador).

## Licença

MIT — ver o ficheiro LICENSE

## Auditoria

2026-10-11 (ronda 3): as etiquetas acrescentadas pela auditoria e o aviso estão traduzidos para RO/EN (necessitam de revisão nativa); aviso «sem efeito médico comprovado» junto às predefinições Pain Relief / Peak Performance / Solfeggio.

2026-10-10: verificado (sem pedidos de rede no código, CSP `connect-src 'self'`); acrescentados nomes acessíveis para os controlos, contraste, aviso no rodapé.

## Autor

Alexio — Alexandru-Ionuț Chiuță, contacto: alexio@trom.tf

## Resumo

O Frequency Laboratory é um conjunto de ferramentas Web Audio num único ficheiro: osciladores e batimentos binaurais, filtros e efeitos, piano/MIDI, sequenciador, analisadores (FFT, RTA, osciloscópio de fase), medição de SPL e de sala com microfone, testes auditivos, sons ambiente, sessões programáveis, gravação WAV e uma base de dados de frequências. Interface em 8 línguas (RO, EN, FR, IT, ES, PT, DE, HU). O estado é guardado em localStorage (chaves `frequencylaboratory.`); a aplicação não faz pedidos de rede (CSP `connect-src 'self'`). Não é um dispositivo médico.

## Histórico / Changelog
- **4.3.9 — 2026-10-22:** Alvos táteis: os distintivos «?» ELI5 chegam a 24×24 px (44 px com ponteiro grosseiro). Nova auditoria a 360 e 1366 px (estado inicial, secções expandidas, painéis ocultos): não resta nenhum alvo abaixo de 24 px nem texto abaixo de 12 px.

### 4.3.13 — 2026-10-23

- Fix: user presets with wrongly typed fields (e.g. string `freqA`, missing `beatRate`) no longer break the presets panel; CSP hash recalculated.

### 4.3.12 — 2026-10-23

- Fix: startup no longer fails when `module_order_v1` or `midi_mappings` in localStorage are corrupt (object/`null`/number); CSP hash recalculated.

### 4.3.11 — 2026-10-23

- Diálogos: as caixas nativas `alert`/`confirm`/`prompt` foram substituídas por diálogos `FFF.dialog` acessíveis e traduzidos (teclado, armadilha de foco, Esc), com o mesmo comportamento (fff-kit 1.2.0).

### 4.3.8 — 2026-10-22

fff-kit 1.1.4: áreas de toque e texto mínimo. Áreas de toque/texto corrigidos na aplicação.

### 4.3.7 — 2026-10-22

fff-kit 1.1.2: PBKDF2 com 600.000 iterações, proteção anti-clickjacking.

### 4.3.6 — 2026-10-22

chaves `localStorage` próprias com o prefixo `frequencylaboratory.`, migradas automaticamente das antigas chaves `lab_frecv_` (que colidiam com o Generator de frecvențe na mesma origem); as predefinições importadas são validadas (só campos conhecidos, tipos corretos, números finitos: um valor `1e309` já não estraga os parâmetros de áudio); service worker e manifesto reais (arranque offline, instalável); número de versão retirado do título da página; foco de teclado visível em todos os controlos. melhorias para telemóvel e acessibilidade: texto de pelo menos 12 px e áreas táteis de pelo menos 24 px.

### 4.3.5 — 2026-10-22
- Correção de tradução: quatro textos de ajuda que continuavam meio em inglês na interface romena estão agora totalmente em romeno; os rótulos de estado do sleep-fade, da matriz, do clock MIDI, do buffer do espetrograma e do contexto de áudio seguem agora o idioma da interface.

### 4.3.4 — 2026-10-22
- Correção de tradução: os nomes acessíveis (Share URL, Pluck, Módulos, botões de «explicação simples») seguem agora o idioma da interface em vez de misturar romeno; o título da página segue o idioma; sete textos de ajuda em romeno (e uma nota da caixa de ritmos) foram reescritos corretamente em vez de misturar inglês e romeno.

### 4.3.3 — 2026-10-22
- Corrigido: o nome acessível romeno do botão Wake lock passa a começar pelo texto visível («Wake lock – menține ecranul activ»), conforme WCAG Label in Name.

### 4.3.2 — 2026-10-19
- Os scripts de acessibilidade da aplicação voltam a estar presentes: nomes acessíveis automáticos para controlos sem etiqueta, tipo de letra de reserva para as letras Ă ă Ș ș Ț ț nos tipos de letra de apresentação e regra do texto visível no nome acessível (WCAG 2.5.3). Tinham sido removidos por engano numa limpeza anterior e foram restaurados, com os sufixos dos nomes gerados em 8 línguas. Problema menor conhecido: na interface RO o nome acessível do botão «Wake lock» não começa pelo seu texto visível.

### 4.3.1 — 2026-10-19
- Todos os textos longos (ajuda ELI5, notas de utilização, tutorial, registos de alterações, catálogo de frequências) em 8 línguas; a interface em romeno, que ainda tinha cerca de 800 textos só em inglês, está traduzida.

### 4.2.1 — 2026-10-19
- Correção: ao carregar a partir de `#state=<base64>`, os parâmetros adicionais do endereço (p. ex. `&from=generator-frecvente`) deixam de estragar a descodificação do estado.

### 4.2.0 — 2026-10-14
- Cópia de segurança e etiquetagem de dados (fff-kit).

### 12 de outubro de 2026 (v4.1.3)
- 4.1.3 — 2026-10-12: a versão e a data da última atualização são apresentadas na aplicação

### 11 de outubro de 2026
- Primeira visita: o idioma predefinido segue o do navegador (romeno → RO, caso contrário EN) em vez de ser sempre RO; antes, os visitantes com navegador em inglês viam uma interface misturada RO/EN.
- Eliminadas as três notificações (toasts) no carregamento (portamento, microafinação, «v4.1.2 carregado · MIDI»), que se sobrepunham ao cabeçalho; a mensagem sobre MIDI aparece quando se usa MIDI. Desaparece também a palavra francesa «prêt» de uma delas.
- A pílula de donativos segue o idioma da interface (RO/EN), incluindo as etiquetas ARIA.
- v4.1.2: aviso de volume (acima de 60%, `role=status`, RO/EN) junto ao volume master; atalhos `[` / `]` para o volume; CSP por hash (sem `'unsafe-inline'` em `script-src`, `blob:` mantido para o worklet/gravação). Testado offline: 0 erros/violações de CSP, 0 transbordo horizontal, axe 0.
- Versão unificada v4.1.2 (título, cabeçalho, manifesto, rodapé; antes o título dizia v4.0 e o rodapé v4.1).
- O guia de boas-vindas (primeira execução) tem agora botões RO/EN e «Saltar» (mais a tecla Esc), é uma caixa de diálogo acessível e está totalmente traduzido para inglês; os módulos/perfis são traduzidos na apresentação. Em ecrãs baixos já não corta a parte superior.
- Os tipos de letra de apresentação incorporados não contêm Ă/Ș/Ț: os elementos afetados passam para o tipo de letra de texto (classe `dia-fb`), pelo que o título deixa de misturar glifos (p. ex. «FRECVENȚE», «CONTINUĂ»).
- Axe: 0 violações (conteúdo em `<main>`, 18 campos com `aria-label`, títulos h2 em «Usage notes», `aside` para donativos, contentor de notificações como região). Corrigido «uppended» → «suspended» no indicador CTX.
