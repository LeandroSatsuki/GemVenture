# Fogo, rastros e impactos estilizados — pesquisa de 02/11/2026

Usar quando o trabalho envolver fogo de boss, raios, rastros persistentes ou impacto
com volume aparente na caverna. Esta referência registra uma decisão de produção,
não um efeito já implantado. Reabrir os consumidores: o primeiro caso é a candidata
MYSTIC-TEST02-ALIGN01, não a aparência legada do Místico no `dist` oficial.

## Decisão adotada

Preferir uma composição 2.5D em camadas, com formas animadas próprias, chão
projetado, partículas secundárias e luz limitada. Avaliar atlas autoral de chamas
e máscaras de rastro antes de propor outro renderizador. A linguagem voxel das
criaturas não obriga o fogo a ser construído com cubos. Curvas, sprites e máscaras
podem preservar a identidade por cor, escala, silhueta, nitidez e comportamento.

Não decidir entre qualidade e otimização como alternativas excludentes: melhorar
a organização visual e retirar trabalho repetido pode servir aos dois objetivos.
Isso é uma hipótese de produção; o ganho perceptivo e de desempenho depende do piloto.

## O que as fontes demonstram

Pesquisa documental em fontes primárias. Não houve análise integral dos vídeos,
medição de jogos comerciais ou importação de assets de exemplo. Os números do
piloto abaixo são nossos, não parâmetros atribuídos a esses jogos/ferramentas.

| Fonte | Evidência utilizável | Transferência proposta e limite |
|---|---|---|
| [Riot — Visual Effects](https://www.riotgames.com/en/artedu/visual-effects) | Clareza, satisfação e origem reconhecível precisam coexistir; não há uma construção universal de VFX | Separar perigo, impacto e ambiente, mantendo uma família. Não copiar estilo de campeões |
| [Riot — Clarity in League](https://www.leagueoflegends.com/en-us/news/dev/clarity-in-league/) | Hierarquia entre informações e coerência entre efeito e área de jogo | A borda perigosa deve continuar identificável sob combo, fogo e inimigos |
| [Blizzard — Diablo IV, dezembro/2021](https://news.blizzard.com/en-us/article/23746639/diablo-iv-quarterly-updatedecember-2021) | Efeitos contextualizados, impactos direcionais e variantes ajustadas por vários parâmetros, sem ampliar tudo uniformemente | Aproveitar causalidade e escala dirigida; não importar PBR, ragdolls ou dano controlado pela animação |
| [Godot — partículas 2D](https://docs.godotengine.org/en/stable/tutorials/2d/particle_systems_2d.html) | Flipbooks contêm quadros de animação numa textura e servem a fogo, fumaça e explosões | Aplicar o conceito em Canvas; não trocar o jogo por Godot. A página consultada sinaliza revisão pendente para a versão atual |
| [Unity — TextureSheetAnimationModule](https://docs.unity.com/en-us/engine/6000.3/script-reference/unityengine/particlesystem/texturesheetanimationmodule) | Seleção de quadro, fase inicial, ciclos e curvas de reprodução | Variar fase de instâncias do mesmo atlas sem criar uma imagem por tempo absoluto |
| [Effekseer — chama toon](https://effekseer.github.io/Help_Tool/en/ToolTutorial/material_02.html) | Ruído deslocado, distorção de UV, gradiente de cor e máscara produzem chama estilizada | Usar como receita de autoria/bake; Canvas2D não executa esses nós como shaders |
| [Effekseer — início/fim da chama](https://effekseer.github.io/Help_Tool/en/ToolTutorial/material_03.html) | Curvas e parâmetros controlam aparecimento e extinção | Separar ataque, sustentação e erosão, com parâmetros reutilizáveis |
| [Effekseer — Recorder](https://effekseer.github.io/Help_Tool/en/ToolReference/record.html) | Exporta sequência/spritesheet e permite separar composição alpha e aditiva | Preservar corpo legível e emissão em saídas distintas; conferir recorte, transparência e fase |
| [Epic — ribbons no Niagara](https://dev.epicgames.com/documentation/unreal-engine/create-a-ribbon-effect-in-niagara?application_version=4.27) | Ribbons conectam emissão numa faixa contínua | Adaptar a ideia a uma faixa/máscara projetada, não incorporar Niagara |
| [Epic — otimização de VFX](https://dev.epicgames.com/documentation/en-us/unreal-engine/vfx-optimization-guide?application_version=4.27) | Custo depende também da área coberta, camadas e material, não só do número de partículas | Medir cobertura e sobreposição. Os custos de Unreal não são um benchmark de Canvas |
| [JangaFX — exportação EmberGen](https://docs.jangafx.com/embergen/pages/getting_started.html) | Simulação pode ser exportada em flipbook PNG RGBA ou sequência | Ferramenta opcional de autoria offline, sem simulação de fluidos no navegador |
| [JangaFX — render/câmera/alpha](https://docs.jangafx.com/embergen/pages/references/node_list.html) | Câmera ortográfica e modos de alpha precisam ser configurados no export | Calibrar enquadramento e composição; PNG preto não equivale automaticamente a transparência correta |
| [MDN — otimizar Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) | Recomenda pré-renderizar repetição, agrupar operações e evitar shadowBlur quando possível | Cachear quadros e brilho local; não aplicar blur independente a cada chama por quadro |
| [MDN — composição Canvas](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation) | source-over, screen e lighter têm comportamentos distintos | Corpo alpha para a forma, emissão complementar controlada; adição não cria iluminação física |
| [Chrome — Performance](https://developer.chrome.com/docs/devtools/performance/overview) | Perfis ajudam a localizar custo de execução e quadros | Comparar a mesma reprodução com e sem VFX. Cronometragem JS isolada não é FPS físico |

O PDF histórico de estilo da Riot redirecionou para a página inicial, embora o
buscador ainda exponha trechos antigos. Não foi considerado um PDF integralmente
lido. O manual de animação do Blender falhou no acesso direto; sua receita não foi
tratada como verificada nesta rodada. As fontes acessíveis acima sustentam a decisão.

## Diagnóstico do Místico: fatos, não uma avaliação de desempenho

Baseline/hashes e auditoria reproduzível:
`E:/Genventure/coordination/boss-evolution/mystic-r1/vfx-research01/`.

| Componente | Implementação inspecionada | Consequência provável / correção candidata |
|---|---|---|
| Chamas | `asset-work/mystic-test02/runtime/mystic-presentation.js`, `flame()` e `paintMysticGround()`, linhas19–21 na baseline: mesma forma Bézier, duas cores, oscilação senoidal | Varia altura e inclinação, mas não divide/renova a massa da chama. Comparar com um loop autoral assimétrico |
| Rastro | Elipses11×5 e segmentos grossos9 entre células, incluindo vizinhos diagonais | Repetição de gotas e faixa uniforme. Construir união de células/contorno com interior texturizado; preservar o mapa de dano |
| Adjacência | Para cada trecho, quatro `fire.some(...)` varrem a lista | Limite superior de4N² comparações. Usar índice por célula e cache da topologia, sem cache infinito por tempo |
| Raio disparado | `paintMysticCombat()`, linha15: duas linhas, vida visual0,5pulso | Falta uma massa transitória entre fonte e contato. Usar afunilamento, núcleo, borda e impacto no destino |
| Mira | Linha no chão e X do alvo em `paintMysticGround()`, linha22 | Tratar como aviso, separado do ataque. Espetáculo não deve esconder a posição fixada |
| Ruptura | Reconstrói as faces não pertencentes à cabeça a cada desenho e acrescenta18 quadradinhos | Pode reaproveitar grupos de peças e uma rajada com silhueta autoral. Não é necessário aumentar a quantidade de cubos |
| Camadas | `runtime/world.js` da candidata desenha todo `paintMysticGround()` antes da fila dos atores | Chamas altas não possuem ordenação de frente/trás por apoio. Separar base no piso e porções verticais na fila de oclusão |
| Luz | O painter do Místico não importa/submete fontes ao `dist/vfx-emission.js` atual | Não concluir que não exista emissão no jogo: existe, mas o placeholder não usa essa ponte. Avaliar integração local, não mudar luz global |
| Cache de corpo/cabeça | Cache36 de imagens348×324; chave contém tempo/beat quantizado absoluto | Limite de memória existe, mas repetir o mesmo ciclo não implica reaproveitamento. Perfilar misses e bake de poses antes de alterar arte aprovada |
| Motor | `World` desenha Canvas2D; volumes são malhas projetadas. `world-finish.js`/`screen-finish.js` oferecem acabamento de tela via WebGL e fallback global | Shader de pós-processo não é material de fogo por objeto; não há depth buffer compartilhado verificado para soft particles |

As capturas históricas `fire-trails.png` e `head-aim.png` foram inspecionadas:
mostram as pequenas chamas repetidas e o traçado do aviso. Não foram geradas
capturas novas nem observada uma sessão atual em movimento nesta pesquisa.

A auditoria executou o painter original com um contexto contador, sem pixels.
Num arranjo sintético denso de128células:41.925 comparações de vizinhança,
512 chamadas Bézier e428 strokes num desenho; o limite teórico é65.536
comparações. Isso demonstra trabalho repetido, não um gargalo medido de GPU.
O teto128 é mecânico e não uma meta de partículas. Dados completos em
`evidence/audit.json`. Não alegar que uma luta real alcançou essa carga.

Uma tentativa de repetir a luta encontrou `cave-merchant.js` ausente no fallback
atual do checkout. O protótipo histórico importa esse módulo. Não restaurar uma
dependência obsoleta para produzir um número; reconciliar a candidata com a base
atual na próxima implementação. Os testes históricos40/40 não foram revalidados.
Nenhum arquivo de combate foi corrigido nesta pesquisa.

## Receita de produção compatível

### Chama: massa, movimento e sustentação

Criar uma massa principal legível, com duas ou três línguas assimétricas, núcleo
claro quente, faixa intermediária laranja e borda mais escura. São papéis de cor
para selecionar na paleta ativa, não novas cores autorizadas. O contorno pode ser
nítido sem um outline preto universal. A variação deve dividir, afinar e soltar
pequenas formas, em vez de somente inclinar a mesma gota.

Uma alternativa nativa é pré-renderizar uma animação autoral de máscaras/curvas
num atlas limitado. Outra é desenhar/editar no Effekseer e exportar o resultado.
Ruído e distorção de UV da referência podem ser resolvidos durante autoria, sem
`getImageData/putImageData` sobre o quadro inteiro a cada frame. Erosão é
remoção progressiva da forma; um fade alpha simples não a substitui. Um shader
local em tempo real fica como alternativa futura, condicionada a ganho demonstrado.

### Piso e partes verticais

O domínio continua dono das células `m.fire`, `born`, `activeAt` e `until`.
Gerar máscara/unificação somente dessas células; decoração não pode alargar o
interior perigoso ou deixar uma língua grande enganosa no corredor seguro.
Conexão diagonal precisa refletir a regra lógica, não preencher um espaço seguro
por conveniência do desenho. Conservar separação entre aviso e fogo ativo.

Base, calor e marca residual pertencem ao chão. Labaredas têm apoio no chão,
altura aparente e ordem por profundidade, com limites que preservem o minerador.
Faíscas sobem com velocidade/escala/opacidade por idade; poucas brasas informam
movimento melhor que confete uniforme. Suprimir fumaça que esconda os pés.

### Raio e impacto

Definir source socket da cabeça na pose atual e destino na célula fixada; converter
ambos pelo mesmo `project`, sem usar o deslocamento cosmético da roseta como alvo
de dano. Aviso de dois pulsos permanece. No `mysticShot` confirmado, reproduzir
um jato/ribbon curto com núcleo e volume lateral, ruptura do chão quente,
labareda de contato e brasas direcionais. Não fingir que uma linha no piso seja
o próprio jato. Não atrasar o dano para acompanhar uma animação nova.

Impacto tem preparação, contato rápido, expansão e cauda. Pode usar arcos,
rachaduras luminosas, formas desenhadas e nuvens pequenas. Fragmentos geométricos
são uma opção de material, não uma obrigação. Evitar flashes de tela inteira,
hitstop da simulação e textos extras para explicar a habilidade.

### Luz e composição

Separar corpo, emissão e, se necessária, fumaça. Corpo em alpha mantém a forma;
emissão em screen/lighter apenas complementa o núcleo. Mais brilho não resolve
silhueta pobre. Evitar branco saturado e o aspecto lavado de várias adições.

`vfx-emission.js` já dispõe de sprites radiais cacheados e limites de fontes,
cores e raio. Avaliar seu ponto de coleta, coordenadas, teto e preferências de
vídeo antes de reutilizá-lo. O Místico pode precisar de um adapter local, não
de modificar o ganho global de cristais. Halo desenhado sobre piso não equivale
a luz física sobre paredes; para isso são necessárias máscaras/receptores
verificados. Não prometer PBR, sombra volumétrica ou distorção com profundidade.

### Relógio e orçamento

Os estados e impactos mantêm o relógio musical nativo. Durante a sustentação,
o movimento das línguas pode ser contínuo, com envelopes acentuados no pulso;
não ligar/desligar toda a chama em cada beat. A fase de um atlas deve ser
reconstruível por tempo e seed, sem depender de quantos RAF foram executados.
Pausa/aba oculta/cena encerrada precisam manter o contrato atual e não emitir
uma rajada vencida no retorno.

Orçar área transparente, cópias sobrepostas, fontes de emissão e alocações, além
do número de partículas. Indexar vizinhos em Map/Set; invalidar topologia por
mudança dos trechos, não por fase visual. Não alocar um canvas por chama/frame.
Projetar fora da tela somente o necessário; reduzir secundários antes de remover
o aviso. Não dizer que batching de Canvas garante uma única draw call de GPU.

## Ferramentas e skills

| Recurso | Papel recomendado | Decisão desta pesquisa |
|---|---|---|
| Canvas2D, OffscreenCanvas e atlas atuais | Reprodução e primeira autoria procedural; máscaras, recortes e composição | Caminho inicial, sem dependência nova |
| [Effekseer](https://effekseer.github.io/en/introduction.html) e [repositório oficial](https://github.com/effekseer/Effekseer) | Autoria dedicada de partículas, ribbons, curvas e materiais; Recorder exporta imagens | Primeira ferramenta externa a avaliar offline. Não instalada; runtime WebGL/Emscripten não integrado. Conferir licença de cada asset/exemplo separadamente |
| Blender | Alternativa para bake de elementos volumétricos e enquadramento | Opcional; não necessário para aprovar o primeiro fogo. Receita/versionamento específico ainda a validar |
| EmberGen | Simular fogo/fumaça e exportar flipbooks | Alternativa especializada, sujeita à licença disponível; não necessário comprar/instalar agora |
| Chrome DevTools | Comparação de scripts, carregamento, quadros e memória | Medição do consumidor real antes de chamar uma hipótese de otimização de ganho |
| gemventure-vfx-direction | Gramática visual, hierarquia e critério de clareza | Skill existente ampliada, sem outra skill duplicada |
| gemventure-vfx-implementation | Atlas, densidade, alpha, lifecycle, replay e profiling | Esta referência passa a integrar o fluxo mantido |
| gemventure-boss-design / procedural-art / shaders-atmosphere | Contratos de luta, atores e ambiente respectivamente | Consultar apenas o recorte relevante; efeito não redesenha boss nem ambientação inteira |

A existência de um runtime de Effekseer para browsers não demonstra compatibilidade
com nossa composição Canvas/CRT. Se o bake resolver, não há motivo comprovado
para adicionar esse runtime. Ferramenta de autoria e engine do jogo são decisões
distintas. Esta pesquisa não instalou software nem importou arte de terceiros.

## Primeiro piloto proposto: MYSTIC-FIRE01

Reconciliar a candidata aprovada antes de produzir. Congelar geometria/arte do
boss, arena, câmera, áudio, paleta, dano e regras: rastro somente de boss/clones;
um pulso antes da ativação; cinco pulsos desde nascimento; quatro tiros com
dois pulsos de aviso; cabeça intangível na caça e janela de exaustão preservadas.

1. **Chama isolada no contexto:** comparar placeholder e loop de chama autoral,
   mesmo tamanho/apoio/fundo. Ver começo, sustentação e fim, inclusive suave.
2. **Rastro da fase1:** unir a base, variar a fase das massas e ordenar partes
   verticais. Comparar forma contínua e footprint real sem esconder o jogador.
3. **Fase2:** só depois, jato da cabeça, impacto e dissolução; preservar mira.
4. **Carga conjunta:** mesmo replay e câmera com combo/lanternas/efeitos do jogador,
   três seeds e pausa/retorno. Comparar p50/p95 de CPU do efeito e quadros físicos
   com registro do hardware/viewport/DPR. Não chamar custo isolado de FPS.

Ponto de partida experimental: atlas de16–24quadros, duas ou três variações de
silhueta e camadas normais/suaves limitadas. Medir a densidade efetiva antes de
escolher resolução. Um atlas4×4 com célula128 ocupa1024KiB RGBA por camada;
com célula256 ocupa4MiB. Alpha e emissão separados dobram isso; variantes e
decodes multiplicam novamente. É conta de memória bruta, não pico medido.
Esses valores são candidatos e não limites de qualidade obrigatórios.

Aceitar somente se o fogo parecer vivo e pertencente ao jogo, o caminho perigoso
for compreensível, o impacto coincidir com a consequência e personagem/HUD
permanecerem claros. Provar transição alpha em pisos claros/escuros, ausência
de retângulos, loop sem salto de pivô, densidade sem redução posterior e modo
suave sem perda de informação. Registrar separadamente comportamento, pixels,
desempenho e aceite humano.

## O que ainda não foi feito

Não foi produzido atlas, fogo novo, piloto visual ou benchmark físico. Não foi
integrado o Místico ao `dist` nem alterado o placeholder. O ganho de tempo da
indexação, a qualidade do loop e a necessidade de ferramenta externa dependem
do próximo experimento. A adoção desta etapa é do método nas skills mantidas.
