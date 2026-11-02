---
name: gemventure-vfx-implementation
description: Implementar e verificar VFX e game feel do GemVenture em Canvas, atlas e camadas de UI, preservando nitidez na resolução final, ritmo, eventos, limites e modo suave. Usar para corrigir efeitos desfocados ou executar pilotos autorizados; direção de estilo fica em gemventure-vfx-direction.
---

# GemVenture — execução de VFX e nitidez

Fonte mantida: `E:/Genventure/gemventure/skills/gemventure-vfx-implementation/`.
Conferir esta fonte quando a skill for carregada por uma cópia instalada.

## Contratos de entrada

Ler `E:/Genventure/AGENTS.md`, `docs/TEAM_WORKFLOW.md`, escopo/aceites/recibos do
ID vigente em `E:/Genventure/coordination/team-control.json` e o consumidor atual.
Registrar HEAD, hashes das fontes locais e reserva antes da edição. Usar delta
ou candidata isolada quando houver concorrência; não sobrescrever pacote aprovado.
Manter o monitor pausado. Não confundir teste aprovado com aceite perceptivo.

Para decidir estilo, consultar `../gemventure-vfx-direction/SKILL.md`; uma correção
de resolução não autoriza mudar forma, cor ou duração. Para geometria procedural,
ler a skill mantida `../gemventure-procedural-art/SKILL.md` no modo runtime e o
contrato pertinente. UI usa os padrões atuais de `gemventure-ui-direction/layout`.
Não impor câmera/paleta Cosmos do Diorama ao jogo ou regra procedural ao CSS/raster.

## Escolher o recorte técnico

- Blur, densidade, export, reamostragem e borda: ler [cadeia de nitidez](references/crispness-pipeline.md).
- Gatilhos, camadas, limites, pausa, integração e provas: ler [runtime e QA](references/runtime-and-qa.md).
- Fogo de bosses, jatos, rastros e impactos: ler [técnicas e primeiro piloto](references/stylized-fire-and-impacts.md). Distinguir autoria offline de nova dependência no jogo; a pesquisa do Místico não é um efeito implementado.
- Diagnóstico numérico de atlas: executar o helper abaixo; ele não altera o jogo.

```powershell
node E:/Genventure/gemventure/skills/gemventure-vfx-implementation/scripts/audit-density.mjs --game-root E:/Genventure/gemventure --css-scale 2 --render-dpr 2
```

`--css-scale` é pixels CSS por unidade lógica do efeito, incluindo a transformação
do mundo; `--render-dpr` é a densidade efetiva do buffer, não um DPR multiplicado
novamente pelo zoom. Os valores acima são um cenário analítico, não medição da
janela atual. O helper lê o manifesto atual e calcula ampliação e cache; os overrides
por evento/cor e a composição final precisam ser conferidos no consumidor.

## Executar sem perder o significado

Traçar evento aceito → adapter/estado visual → amostra → desenho → limpeza.
Preservar a autoridade do domínio sobre dano, raio, custo, loot, HP, expiração e save.
Nunca acoplar concessão de recompensa a `animation.finished`, framerate ou partícula.
Feedback imediato reconhece entrada; recompensa visual reconhece resultado real.

Reutilizar Canvas 2D, Web Audio, filas, relógios e caches atuais. Não introduzir
engine 3D, biblioteca de partículas ou scheduler musical paralelo para obter volume
aparente. Escolher geometria direta, camadas cacheadas ou atlas segundo o recorte.
VFX de fontes diferentes podem compartilhar aparência sem compartilhar loader.

Fogo e energia não precisam ser blocos. Escolher formas, máscaras, atlas e
partículas pela leitura final e pelo custo. Ferramentas externas de autoria podem
exportar para o pipeline atual; não integrar seus runtimes por arrasto. Separar
corpo alpha, emissão local e o footprint mecânico. Pós-processo de tela não
substitui material animado, ordenação por profundidade ou contato com o piso.

**Nitidez final é critério de entrega:** medir tamanho lógico, transformação,
dimensão CSS, buffer físico, célula após cache e filtros. PNG maior não corrige
um caminho que o reduz novamente. Não desligar smoothing globalmente nem aumentar
todos os atlas para corrigir um consumidor. Preservar contornos intencionais e
antialiasing compatível com o jogo; glow não substitui informação de borda.

Na baseline de 31/10/2026, `drawVfxAsset` desvia explosões laranja/vermelhas para
`paintVoxelExplosion`. O ramo Bomba precisa ser identificado antes de trocar a folha
compartilhada. O novo piloto cartoon de GV-043 não herda aplicação oficial dos
sublotes antigos. Revalidar esses fatos na versão em trabalho.

## Relógio, ciclo de vida e orçamento

Ler o relógio musical existente para fase e acentos; usar o relógio visual de
apresentação para caudas. Preservar pausa, aba oculta, rolagem do Abismo, troca de
cena, mute e modo suave. Não congelar a simulação para hitstop nem atrasar o evento
até a próxima batida. Tratar interrupção sem replay de recompensas.

Declarar limites de instâncias, partículas, camadas, cache, área e descarte. Preparar
geometria, decode e tint fora do desenho quando reutilizáveis. Escolher degradação
que preserve núcleo/confirmação e reduza secundários; não elevar tetos por padrão.
Deduplicar o mesmo evento sem fundir transações distintas. Resetar e liberar o que
pertence à cena/overlay; não deixar loops vivos após remoção.

## Concluir o recorte

Verificar o patch no caminho realmente ativo, incluindo fallback e suave.
Usar testes pertinentes para preservar eventos/relógio/estado; medir custo com
método repetível quando a mudança afeta buffer, partículas ou filtros. Não chamar
conta de memória de pico real, tempo de CPU de FPS físico ou screenshot de teste
de interação. Seguir os checks do projeto quando houver integração de código.

Entregar comparação em contexto na escala final e evidência de início/pico/cauda,
com viewport, zoom, DPR e acabamento identificados. Se a renderização física não
foi observada, declarar a pendência e entregar fontes/contas verificáveis. Registrar
delta, hashes, limites e recuperação. Aplicar somente dentro da autorização vigente,
reconciliando a baseline com mudanças posteriores e emitindo recibo dos arquivos.
