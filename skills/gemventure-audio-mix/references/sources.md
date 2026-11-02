# Pesquisa e aquisição — 31/10/2026

- `music-produce`, sb-dev/music-production-skills, commit `aa3933bc87f54a48ec018bb868bf6385b340db22`, MIT: adquirido pelo instalador oficial em `gemventure/skills/music-produce`. Complementa `music-evaluate` já existente com edição determinística, proveniência e entrega. A rota generativa Replicate é opcional e não foi habilitada.
  https://github.com/sb-dev/music-production-skills/tree/aa3933bc87f54a48ec018bb868bf6385b340db22/skills/music-produce
- `mixer-doctor` e `sidechain-setup`, glincker/ableton-skills: examinadas como alternativas. O backend exige Ableton/MCP não presente neste piloto. Seus valores de compressor não constituem validação para o jogo; o exemplo de equivalência entre 100 ms e colcheia a 120 BPM não foi adotado. Não instaladas como dependência do projeto.
  https://github.com/glincker/ableton-skills/tree/main/skills
- FFmpeg: `rubberband`, filtros EQ, medições `ebur128` e processamento estéreo. A instalação local possui o filtro Rubber Band. A licença de execução de uma ferramenta não licencia redistribuir seu binário junto ao jogo; este piloto apenas exporta áudio.
  https://ffmpeg.org/ffmpeg-filters.html#rubberband
- iZotope: sidechain como organização de espaço entre kick e material concorrente; configurações dependem do contexto e da escuta.
  https://www.izotope.com/community/blog/what-is-sidechain-compression
- AudioLabs/FMP e FitzGerald (DAFx 2010): separação harmônica/percussiva por filtragem mediana no espectrograma. Algoritmo do helper escrito para este projeto; não é uma cópia dos notebooks. Máscara conjunta entre canais preserva relações de fase, sem garantir separação sem artefatos.
  https://www.audiolabs-erlangen.de/resources/MIR/FMP/C8/C8S1_HPS.html
- SciPy: STFT/ISTFT e filtro mediano usados pelo helper.
  https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.stft.html
  https://docs.scipy.org/doc/scipy/reference/generated/scipy.ndimage.median_filter.html

Esta é uma seleção por adequação e capacidade verificável, não um ranking universal de qualidade das skills. A prova prática está em `coordination/GV-059-faraway-p1/`.

## Revisão P2 — música gravada e mapa de pulso

Feedback humano favoreceu a original a 87 BPM e a referência, com crítica ao abafamento. A candidata P2 conserva o espectro integral e reduz as camadas adicionais. Pesquisa primária do NecroDancer e limites da analogia estão em `coordination/GV-059-faraway-p2/research/NECRODANCER.md`, na raiz da área de trabalho.

- FAQ da desenvolvedora, beat data em segundos e ajuste manual: https://braceyourselfgames.com/crypt-of-the-necrodancer/faq/
- Relato histórico do criador sobre unificação do ritmo e tolerância: https://www.gamedeveloper.com/audio/game-design-deep-dive-finding-the-beat-in-i-crypt-of-the-necrodancer-i-
- Notas oficiais sobre beatmaps e calibração: https://store.steampowered.com/news/posts/?appids=247080&enddate=1660085692&feed=steam_community_announcements

Não inferir a API interna ou a versão atual a partir desses documentos históricos. A proposta para o GemVenture continua sujeita ao contrato de relógio vigente; o P2 não altera combate nem modos de treino.

## Correção humana P3 — ataques da bateria como pulso

O usuário esclareceu que quer ações seguindo a própria bateria, inclusive pares próximos, e versões de velocidade. Isso substitui a interpretação do P2 de um reforço regular acrescentado. Os P1/P2 permanecem como histórico de revisão, sem definir o contrato atual desse piloto.

O P3 usa detecção de ataques e comparação com a mix original, sem quantização para o metadado de BPM. A estimativa de percussão serve para reforçar sons existentes; não se acrescentam osciladores, clicks ou novas batidas. O número de referência deve ser declarado como média dos ataques selecionados quando não houver partitura/medição métrica confirmada.

- AudioLabs/FMP, definição de onset e métodos de detecção: https://www.audiolabs-erlangen.de/resources/MIR/FMP/C6/C6S1_OnsetDetection.html
- Documentação de detecção/backtracking do librosa, consultada como referência (biblioteca não instalada): https://librosa.org/doc/main/api/generated/librosa.onset.onset_detect.html
- Evidência do padrão, comparações entre detecção na estimativa e na mix integral, arquivos e consumidores: `coordination/GV-059-faraway-p3/`.
