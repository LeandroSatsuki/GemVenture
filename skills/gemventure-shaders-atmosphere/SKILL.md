---
name: gemventure-shaders-atmosphere
description: Pesquisar, dirigir e prototipar iluminação, shaders e ambientação das cavernas e arenas do GemVenture, incluindo emissivos, névoa, feixes e partículas ambientais. Usar a partir do renderizador e das fontes visuais vigentes; não substitui VFX de combate, geração de salas ou direção de UI.
---

# Shaders e ambientação do GemVenture

Fonte mantida: esta pasta no checkout `E:/Genventure/gemventure/skills/`.
O objetivo é tornar o espaço vivo e misterioso, com luz de origem reconhecível,
profundidade e movimento ambiental coerente com o game feel rítmico.

## Começar pelo consumidor real

Consultar `../../docs/TEAM_WORKFLOW.md`, o controle vigente em
`E:/Genventure/coordination/team-control.json` e a baseline/reserva do recorte.
Pesquisa autoriza diagnóstico e propostas; respeitar o escopo pedido para pilotos
e aplicação. Preservar a pausa do monitor e os aceites por subconsumidor.

Ler [o mapa do renderizador](references/runtime.md) antes de escolher uma técnica.
Revalidar as chamadas: cavernas de campanha, arenas, Abismo e saves legados
possuem caminhos distintos. Um módulo importado não prova execução em todos eles.
Não transferir automaticamente a câmera ou a paleta de um projeto Diorama.
Conferir a skill procedural **mantida no checkout** e a família efetivamente ativa.

## Escolher o efeito pela experiência desejada

Consultar [a pesquisa e as fontes reutilizáveis](references/research.md) para
referências primárias, autoria, licenças e limites de transferência.

| Necessidade | Primeira técnica a considerar | Dado necessário |
| --- | --- | --- |
| Luz com origem no espaço | Máscara de luz local e oclusão; relevo toon seletivo depois | Posição/altura da fonte, superfícies e bloqueadores |
| Cristal realmente luminoso | Emissão separada, luz derramada e bloom curto seletivo | Máscara emissiva autorada e visibilidade |
| Caverna profunda | Névoa baixa em camadas, movimento lento ancorado no mundo | Máscara de chão/recessos, profundidade e câmera |
| Fenda ou entrada memorável | Feixes 2D com recorte e poeira localizada | Abertura/fonte visível e bloqueadores |
| Bioma vivo | Emissores ambientais próprios, distribuídos por habitat | Material, seed visual e regiões permitidas |
| Calor ou água | Distorção/caústica restrita à superfície pertinente | Máscara de material e fundo válido |
| Arena que acompanha a luta | Modulação de fontes existentes pelos estados reais | Estado do boss, tempo de apresentação e relógio musical |

Partículas são um sistema de apresentação, não necessariamente um shader.
Preferir Canvas/caches quando forem suficientes. Um shader de pós-processamento
não recupera geometria, normais ou materiais perdidos no bitmap final.

## Contrato visual e temporal

- A direção humana de 01/11/2026 exige tonalidade ambiental própria do bioma:
  luz ambiente, reflexos dos braseiros e névoa leem seus materiais vigentes.
  Cada cristal conserva a própria cor emissiva e de espalhamento local. Não
  transportar um azul fixo entre biomas. Ajustar alcance não implica aumentar
  o brilho central nem clarear o ambiente inteiro; preservar o escuro aprovado.
- Preservar a nitidez e a família de materiais aprovadas. Começar por luz colorida
  suave e relevo em poucos patamares, evitando aparência plástica por especular amplo.
  Luz nova se soma à luz-base autorada; não inverte indiscriminadamente suas sombras.
- Usar luz para explicar um emissor, contorno ou volume. Não espalhar brilho por
  toda a imagem nem apagar as diferenças entre minerais e perigos.
- Direção humana de 01/11/2026: o cenário luminoso (líquidos, raízes, cristais
  e piras) continua visível fora do alcance de identificação; esse alcance oculta
  os inimigos. Não escrever descoberta/visibilidade nem ampliar interação por
  causa da luz. Preservar o escuro aprovado e a oclusão física das paredes:
  combinar máscara de superfície e máscara de oclusão da fonte. Luz de inimigo
  oculto não pode denunciar sua posição.
- Preservar a leitura da toca e as exceções atuais do ouriço. Não recolocar uma
  camada frontal que uma instrução humana posterior tenha removido.
- Reservar contraste e movimento mais fortes para perigo, personagem e resultado
  confirmado. Ambiente cede espaço nos picos de VFX; combinar orçamentos existentes
  antes de criar outro emissor de combo.
- Movimento ambiente usa tempo de apresentação que respeita pausa/aba oculta;
  acentos musicais leem o relógio real, incluindo mudanças de andamento. Não criar
  BPM paralelo, atrasar impacto, adicionar hitstop ou alterar janela de acerto.
- No modo suave, manter composição estática útil, retirar tremulação, distorção
  e movimento dispensável. Avisos de ataque continuam presentes e com o mesmo timing.

## Prototipar sem transformar o renderizador por inércia

Separar cor-base, emissivos, luz/oclusão, materiais e informação nítida somente
quando a técnica escolhida precisar desses dados. Para relighting de volume,
obter normais/altura da geometria de origem ou autorá-las; derivar do brilho do
PNG pode interpretar uma mancha de cor como relevo. Conferir câmera, Y, alfa,
âncoras e quadros correspondentes. Não prometer reconstrução 3D exata.

O jogo já possui pós-processamento WebGL 1. Preservar o CRT oficial e o fallback
Canvas; não duplicar o acabamento, nem impor WebGL2 por copiar um template.
Ler as regras de adaptação em `runtime.md`. Emissão/bloom precisam de máscara
própria, e a informação nítida continua fora de blur, distorção e grading.

Começar com um efeito isolável e parâmetros artísticos identificados. Medir CPU,
GPU quando disponível, memória, uploads e estabilidade com os mesmos eventos e
viewport. Resolução menor pode servir à névoa ou luz difusa; não reduzir sprites,
avisos ou HUD junto. Não adotar tetos de loops, partículas ou luzes de uma skill
genérica como garantia de desempenho no jogo.

## Verificar e entregar

Comparar a mesma seed, posição, câmera, fase musical e eventos: controle,
efeito isolado e composição. Usar ao menos dois biomas contrastantes e uma arena
quando o recorte cobrir ambos. Incluir repouso, pico de combo, ataque anunciado,
pausa, modo suave, borda do chunk e retorno de contexto GPU quando pertinente.

Disponibilizar vistas de depuração de emissivos, visibilidade, oclusão e normais
conforme os dados usados. Shader que compila não demonstra iluminação correta;
preview procedural genérico não demonstra integração com o consumidor real.

Relatar separadamente: observado no código; observado em imagem; observado em
movimento; hipótese; proposta. Entregar fonte revisável, baseline/hashes, alcance,
evidências, custo medido ou pendente e menor próxima decisão útil. Pesquisa não
exige executar toda a suíte do jogo. Mudanças de runtime seguem as verificações
do domínio e de integração em `TEAM_WORKFLOW.md`.

Para impactos, buffs e recompensas, articular com `../gemventure-vfx-direction/`;
para execução e nitidez de atlas, com `../gemventure-vfx-implementation/`;
para geometria e biomas, com `../gemventure-procedural-art/`.
