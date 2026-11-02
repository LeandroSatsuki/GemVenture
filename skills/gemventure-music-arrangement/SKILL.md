---
name: gemventure-music-arrangement
description: Analisar, compor, revisar e verificar arranjos originais do GemVenture em WebAudio, especialmente synthwave/chiptune com rock, preservando o pulso de gameplay e entregando áudio comparável. Não se aplica ao No Encore nem altera economia ou regras de combate.
---

# Arranjos musicais do GemVenture

Leia `docs/TEAM_WORKFLOW.md` e o registro vigente da tarefa em `../coordination/team-control.json`, relativos à raiz do jogo. Registre baseline/hash e reserva antes de editar. Preserve autorizações existentes e o monitor pausado. A skill é mantida em `gemventure/skills/gemventure-music-arrangement/`.

Use [project-contract.md](references/project-contract.md) para mapear relógio, consumidores, invariantes e execução da auditoria. Use [arrangement-language.md](references/arrangement-language.md) ao escrever ou avaliar frases e instrumentação. As skills pares `music-compose` e `music-evaluate` são bases opcionais de composição e avaliação; este contrato do jogo prevalece. A origem e licença estão em [sources.md](references/sources.md).

## Do problema ao arranjo

Identifique o disco, o contexto (expedição, chefe, descanso ou prévia) e o que o usuário quer mudar. Separe uma melodia fraca de uma melodia boa repetida sem desenvolvimento. EQ e volume não resolvem ausência de frase. Compare a partitura de eventos e uma renderização do consumidor real. Não declare ter ouvido áudio a partir de metadados ou transcrição de fala.

Escreva o motivo, as respostas e o percurso de energia antes de programar as vozes. Declare registros, entradas/saídas, pontos de chegada, duração das notas e espaços para cues/SFX. Para a direção de 31/10/2026, mantenha melodia chip legível, corpo synthwave e rock como apoio rítmico; preserve a identidade dos discos fora do recorte. Não normalize todos os gêneros ao mesmo padrão.

Componha notas e silêncios explícitos, com transformação deliberada entre frases. Repetição dá identidade; mude contorno, duração, acompanhamento ou instrumentação nas reprises. Não use sorteio de notas no gameplay. Limites de densidade são critérios de clareza e desempenho, não fórmulas que certificam qualidade musical.

## Imersão com headset

O pedido humano de 31/10/2026 inclui escuta imersiva com fones. Planeje espaço estéreo como parte do arranjo: âncora, baixo, melodia principal e avisos ficam legíveis no centro; respostas, guitarras de apoio, arpejos e vozes de acordes podem ocupar lados distintos. Distribua entradas e registros antes de adicionar processamento. Movimento lateral deve acompanhar notas/frases, sem oscilar o kick nem deslocar a ação exigida.

Confira estéreo, soma mono, equilíbrio entre canais e SFX de perigo. Não inverter fase para simular largura, colocar informação crítica só em um ouvido ou chamar panning comum de áudio binaural/HRTF. A posição de um inimigo só pode orientar um som se o consumidor fornecer coordenadas reais; não inventar direção. Reverb/delay exigem benefício audível, espaço nos cues e orçamento demonstrado, não são pré-requisito para imersão. Declare separadamente campo estéreo implementado, prova mono e escuta humana de headset/áudio ao vivo.

## Produção e evidência

Trabalhe em delta isolado quando houver concorrência. Reaproveite `playInstrument` e o AudioContext vigente. Não introduza samples, dependências, geradores externos ou um novo transport quando o motor existente atende ao recorte. Renderize o mesmo trecho antes/depois com a mesma fase, contexto, volume e ruído determinístico de QA. Inclua ao menos uma passagem com mudança de seção, uma fronteira de ciclo e combo base/alto na auditoria; uma prévia de cinco segundos não prova evolução de arranjo.

Verifique âncoras, avisos, eventos finitos, polifonia e desconexão; use `scripts/audit-arrangements.mjs <game-root> [baseline-root]`. Antes de integrar, confira os hashes da baseline, execute `npm run check`, `npm test` e a auditoria musical. Registre backup, arquivos aplicados e recibo. Autorização para implementar não é aprovação auditiva humana.

Entregue áudio reproduzível, mapa de seções, resultado das verificações e limites da prova. Identifique renderização offline, aproximação de vozes, escuta perceptiva e teste ao vivo separadamente. Mantenha a decisão musical humana em aberto quando ainda não ouvida/aprovada. Se uma ferramenta falhar por créditos ou acesso, preserve o checkpoint e informe o limite; não repita nem troque de via para contornar a restrição.
