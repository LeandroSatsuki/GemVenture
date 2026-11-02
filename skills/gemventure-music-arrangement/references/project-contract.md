# Contrato musical e consumidores

Raiz do jogo: `E:/Genventure/gemventure`. Fontes atuais prevalecem sobre esta fotografia de 31/10/2026.

- `dist/score.js`: `ALL_TRACKS`, `trackBeatTime`, `trackBeatPhase`, `scoreStep` e avisos. Os relógios variam 1 / 1,04 / 1 / 0,97 / 1 por blocos de 32 beats, com rampas de quatro beats. Chefes têm tempo fixo. Não reimplementar nem substituir esse mapa por BPM constante na prova.
- `dist/music-arrangements.js`: `arrangementStep(record,trackIndex,step,mood)` retorna eventos. Um step é uma semicolcheia; quatro steps são um beat e 16 steps um compasso 4/4. Há um kick em cada beat e nenhum kick adicional. Copiar exatamente os eventos `cue` de `scoreStep`, preservando frequência, fase e tempo.
- `dist/music-chiprock.js`: partituras explícitas de pixel/dusk/iron e forma de 40 compassos. Não é contrato para os demais gêneros.
- `dist/music-instruments.js`: `playInstrument(music,event,at)` suporta kick/snare/hat/crash/tom/cue, bass/lead/pad/pluck/keys/guitar/acid/sing/vocal. Eventos têm freq, duration, level e opcionais color, pan, delayBeats. Metadados role/section não mudam síntese.
- `dist/audio.js`: Music.update agenda por relógio compartilhado; home/Zag/preview e mute já têm consumidores. Preview dura cinco segundos e não compra/equipa. Não editar transporte ou cenas de descanso para melhorar um disco de combate.
- `dist/records.js`: manter IDs, preços, owned/active e compatibilidade. `pixel` = Mina 8-Bit, `dusk` = Horizonte Violeta, `iron` = Ferro em Brasa.

## Vozes e transições

O motor limita trabalho quando há mais de 78 nós ativos. Uma nota pode criar dois osciladores; snare usa oscilador e ruído, pads e guitarras usam dois osciladores, sing inclui vibrato. Planejar margem para os efeitos e cues, preferencialmente abaixo de 60 vozes musicais. A simulação da auditoria é uma estimativa conservadora, não prova nativa de execução.

Todos os osciladores têm duração finita e desconectam ao terminar. Não usar reverberação global, efeitos por frame ou osciladores permanentes. Não ampliar o ganho master para compensar um arranjo pouco claro.

Headset: `pan` é processado pelo StereoPanner existente por voz. Medir L/R RMS, diferença em dB, RMS de mid=(L+R)/2 e side=(L-R)/2, correlação entre canais e razão RMS mono/estéreo nos renders completos. Pico mono não pode saturar; valores finitos e energia preservada não certificam conforto ou localização percebida. As âncoras e cues são centrados no evento antes da mixagem, e seus onsets permanecem iguais. Em 31/10/2026, r2 introduz largura nas três partituras sem mudar os instrumentos, volume ou calendário de notas do r1.

Na renderização, usar OfflineAudioContext e os instrumentos reais. Remover da contagem os nós cujo stop foi agendado antes da próxima nota: o render offline não dispara onended durante o agendamento. Ruído com seed fixa só no harness, sem alterar Math.random no jogo. Agendar duração suficiente para cobrir o ciclo de 160 beats e uma pequena cauda. Medir pico, RMS, duração, amostras não finitas e orçamento observado; conferir clipping e limpeza final de nós. A prova auditiva humana continua separada.

Auditoria: `node skills/gemventure-music-arrangement/scripts/audit-arrangements.mjs . ../coordination/GV-059-music-arrangement-r1/baseline` a partir da raiz do jogo. Comparação de baseline exige grafo de módulos congelado nessa raiz. Testes específicos: `node --test tests/music*.test.mjs tests/home-music.test.mjs tests/pulse.test.mjs`.
