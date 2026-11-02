# Animações das criaturas — contrato de produção v1

Direção do usuário em 14/10/2026. Escopo: gosmas, morcegos e geodos dos
sete biomas. Chefes, invocações de chefes e filhotes ficam fora desta etapa.
Este documento é a especificação de produção; as folhas de frames ainda
precisam ser entregues e validadas antes de substituir os PNGs estáticos.

## Fonte obrigatória

Usar os **novos PNGs aprovados**, já ativos em `dist/assets/approved-art/`.
`dist/approved-art-manifest.js` identifica arquivo, bioma, bounds e apoio.
Originais: `E:/assets GemVenture/output/imagegen/`; manifesto de origem:
`E:/assets GemVenture/production/approved-art-v1/manifest.json`.

Famílias internas: `slime-b1`…`slime-b7`, `bat-b1`…`bat-b7`,
`golem-b1`…`golem-b7`. O geodo azul final é `minion-geodo-cristal-azul-04.png`.
Não animar o desenho procedural anterior. Não trocar paleta, proporções,
acessórios ou perspectiva entre poses. Preservar contorno, materiais,
volumes arredondados e a face superior visível da arte aprovada.

## Comportamento e frames

| Família | Movimento | Ataque | Morte / resíduo |
| --- | --- | --- | --- |
| Gosma | Achata levemente, estica, dá um salto curto até a próxima casa e acomoda. 6 poses. | Deforma e inclina o corpo na direção do ataque, contato, retorno. 4 poses. | Pequeno estouro de gosma e uma pocinha na cor da variante. |
| Morcego | Voo normal com asas articuladas: abertas, intermediárias, baixas, retorno. Ciclo de 6 poses. Deslocamento curto em teleporte. | Investida em linha reta, com 3 poses de preparação/avanço/retorno; reutilizar asas quando couber. | Pequena nuvem de fumaça, sem explosão de fogo. |
| Geodo | Cambalhota lateral completa de casa em casa: repouso, inclinação, giro, invertido, giro, queda e acomodação; 8 poses, terminando em pé. | Para, prepara um pequeno salto para a frente, impacta e acomoda. 5 poses. | Pequenas pedrinhas espirrando; sem chuva de cristais ou loot fictício. |

Os números de poses são alvos pequenos de produção, não exigência de gerar
desenhos intermediários redundantes. Uma pose de repouso pode ser
compartilhada por vários clipes. Todas as variantes usam a mesma sequência
e os mesmos tempos; o nome da espécie não cria outra mecânica.

## Ritmo e mecânica

- O relógio da música continua sendo a autoridade. Frames acompanham a
  ação; terminar uma animação nunca causa dano, drop ou avanço de turno.
- Movimento visual termina dentro da mesma batida, com duração alvo
  `min(0,8 × duração da batida, 320 ms)`. A sombra permanece no chão.
- A preparação do ataque ocupa o aviso já existente. O frame de contato
  e o VFX começam exatamente na batida em que o ataque é resolvido.
  Não acrescentar um novo atraso de dano depois dessa batida.
- Gosma: pequena inclinação para a direção marcada. A poça ofensiva nasce
  no contato. A poça da morte é **decorativa**, não causa dano nem bloqueia
  o chão. As duas usam a cor correspondente à gosma.
- Morcego: aviso de uma linha definida, direção travada na preparação,
  avanço rápido até a casa válida ao final da linha. As asas continuam
  legíveis; o cenário e a câmera não teleportam. O marcador não pode
  avançar para fora das casas que realmente recebem dano.
- Geodo: área curta **à frente**, direção travada ao iniciar o aviso.
  Pausa de preparação e salto visível para essa direção; o impacto deve
  coincidir com as casas marcadas. Alterar o código atual de ataque em
  área somente junto do teste desse contrato. O salto não atravessa muro,
  pedra nem uma casa inválida. Não atingir a posição nova do jogador se
  ele já saiu da área anunciada.
- Atordoamento interrompe o ataque sem contato atrasado. Morte interrompe
  os clipes ativos e gera um único efeito, sem manter o inimigo vivo só
  para acabar a animação. O resíduo visual não impede concluir o andar.
- Pausa congela todos os clipes e efeitos. Modo suave mantém posição,
  leitura do aviso e momento do contato, reduz salto, giro e partículas.

## Divisão de produção

**Configure a skill de geração de arte**: poses das três famílias a partir
dos PNGs novos. Entregar as sete variantes sem reinterpretação visual.
Começar pelas três criaturas do primeiro bioma para verificar pivô e
fluidez no tamanho real; aplicar o mesmo esqueleto às outras variantes.

**Polir efeitos especiais do jogo**: splash pequeno por cor de gosma,
poça ofensiva, resíduo decorativo de morte, fumaça do morcego e fragmentos
do geodo. Efeitos locais, curtos, sem ocultar avisos ou alterar recompensas.

**Padronizar ícones do GemVenture**: área de investida do morcego e impacto
frontal do geodo. Receber casas e direção do jogo, desenhar o marcador
nessas casas, sem decidir alcance, dano, tempo ou movimento.

**Chat do jogo**: integrar folhas, clipes, relógio, interrupções e eventos;
ajustar a mecânica frontal do geodo e validar Andares/Abismo.

## Formato da entrega

- PNG RGBA com alfa real, uma folha por variante; fonte em células de
  256 ou 512 px conforme a definição do desenho. Até 4 colunas; informar
  explicitamente dimensões e quantidade de linhas.
- Todas as células da mesma folha têm dimensões iguais, câmera, escala e
  apoio compartilhados. Não aparar e recentralizar cada frame de forma
  independente: isso causa tremor. O corpo pode girar e saltar, o pivô não.
- Separar deslocamento no chão de deslocamento desenhado: entregar poses
  ao redor do apoio local; o jogo move esse apoio entre casas. Informar
  o deslocamento vertical desenhado para não duplicar a altura do salto.
- Metadados JSON: `id`, `family`, `biome` (0…6), `sourceAsset`, hash da
  fonte, arquivo, tamanho da célula, colunas/linhas, apoio, escala de
  repouso, `clips` com índices ordenados e fase de contato. Exemplo:
  `clips.move.frames`, `clips.attack.frames`, `clips.fly.frames`.
- VFX em folhas separadas, sem sombra de cenário ou corpo completo
  repetido. Informar duração, apoio, cores e distinção ofensivo/decorativo.
- Não exigir girar um PNG isométrico inteiro para fingir outra direção.
  Reportar direções suportadas; a integração só espelha quando a silhueta
  e acessórios permitirem, sem mudar a iluminação a cada passo.

## Critérios de integração

1. Comparar repouso com o PNG aprovado; sem mudança de identidade.
2. Verificar asas/orelhas/cristais completos e alfa sem halo nos frames.
3. Repetir movimento e ataque em escala real, incluindo direções opostas:
   sem tremor de apoio, deslizamento depois da queda ou teleporte da câmera.
4. Conferir contato na batida com BPM baixo/alto, pausa e modo suave.
5. Testar morte durante preparação, atordoamento, múltiplas mortes,
   bloqueios e saída da área marcada. Loot e dano acontecem uma única vez.
6. Medir cache limitado, carregamento fora do laço e ausência de leitura
   de pixels/alocação de imagens a cada frame. Validar enxame no Abismo.
7. Usar origem de QA separada, preservando o save do jogador. Validar
   pelo menos dois biomas contrastantes e salvar captura da cena real.

## Estado nesta entrega

Contrato e pedidos encaminhados aos três responsáveis. Nenhuma folha nova
é considerada pronta apenas por constar neste documento. Os PNGs estáticos
aprovados continuam como versão ativa até a entrega e integração dos frames.

### Avisos de chão — primeira entrega recebida

Pacote isolado: `E:/assets GemVenture/production/ground-telegraphs-v1/`.
Módulo: `minion-ground-telegraphs.mjs`, função `prepareMinionTelegraph`.
Recebe família (`bat`/`geodo`), casas, direção e projeção explícitas; prepara
cinco Path2D e desenha preparação/contato sem decidir a mecânica. Contorno
dourado, pontas direcionais pequenas no morcego e cantos de aterrissagem
no geodo. A revisão da imagem de cena confirmou a leitura sobre chão azul
e verde; isso não substitui teste de combate ou aprovação humana da arte.

O código atual do geodo comum ainda usa raio 1 ao redor da posição marcada
do jogador. Portanto o marcador frontal **não deve** ser aplicado sobre esse
ataque fingindo que a hitbox mudou. Na integração, trocar a mecânica e os
dois avisos antigos juntos, testar as mesmas casas no dano e no desenho e
remover o fill vermelho/retângulos/rótulos antigos dessas duas famílias.
Chefes e suas marcações permanecem independentes. O pacote recebido ainda
não está ativo no runtime.

### Piloto de frames — diagnóstico inicial

Arte reportou uma primeira folha de gosma com apoio instável e uma de
morcego com câmera mais frontal/espelhamento de lateral. Essas fontes não
foram aprovadas para integração nem para replicação às 21 variantes. Está
em andamento um teste de geodo e uma correção focada para verificar se o
processo consegue preservar a identidade.

256/512 px são alvos de produção, não uma exigência que justifique
regenerar boa arte. Células nativas uniformes de outro tamanho podem ser
aceitas com metadados corretos e cache limitado. Câmera, identidade e
apoio estável continuam obrigatórios. Qualquer alternativa de rig deve
ser demonstrada sobre os novos PNGs e avaliada antes de substituir o
pipeline; nenhum redesenho antigo ou fonte deformada será aplicado
silenciosamente.

### Método escolhido pelo usuário

O usuário escolheu **animar por partes, criando camadas e poses controladas
a partir dos assets novos**. Decisão encaminhada à arte: primeiro slime
azul com corpo/cristal separados e morcego com corpo/asas nativos; geodo
com poses controladas para as faces que aparecem no giro. A câmera e os
apoios aprovados continuam obrigatórios. O piloto de corpo ainda não está
ativo; uma rotação plana do PNG não é uma cambalhota aprovada.

### VFX integrados independentemente dos corpos

Pacote original: `E:/assets GemVenture/production/minion-effects-v1/`.
42 entradas por espécie/bioma e 48 atlases normal/suave foram importados
com hashes preservados para `dist/assets/minion-vfx/`. O módulo
`dist/minion-effects.js` carrega os seis atlases do bioma/modo atual e
mantém no máximo 12 referências decodificadas, sem recolor ou leitura de
pixels no desenho. Há limites de 48 instâncias transitórias, ou 16 no
modo suave; resíduos decorativos são descartados primeiro.

Mortes reais de minions comuns agora informam id, família e bioma. Gosmas
usam splash e resíduo na cor do corpo, morcegos fumaça cinza e geodos
fragmentos da pedra cinza. A mesma morte não gera uma segunda instância
visual. A explosão/reward genéricos são suprimidos quando a morte temática
está disponível; o popup continua usando apenas o valor efetivamente pago.
O impacto genérico do golpe fatal no mesmo lote também deixa de encobrir
o efeito pequeno. Chefes, invocações e filhotes preservam o caminho anterior.

Poças ofensivas recebem identidade, origem e bioma na criação pelo combate;
o visual é recortado à mesma casa e existe somente enquanto o hazard real
está ativo. Resíduos de morte nunca entram na lista de hazards. O relógio
visual congela na pausa, e o scroll do Abismo desloca os efeitos com o chão.
O contato frontal do geodo permanece **sem ligação**, até a mudança real
da mecânica; não foi aplicado sobre o círculo legado.

Prévia isolada do renderer/combate: `/minion-effects-preview.html` pelo
servidor de QA (4195), com dois biomas, modo suave e opção `?abyss`.
Não lê/grava localStorage. A exportação portátil inclui os mesmos atlases.
Isso é integração técnica, não declaração de aprovação humana do piloto.

Validação da integração: suíte completa 435/435 sem falhas; depois da
última proteção visual de expiração, minions/composição 8/8. Conferidos
bioma azul normal, horta laranja suave e Abismo suave: quatro camadas
de morte, uma poça autoritativa, sem falha de atlas ou erro novo na página.
Capturas: `minion-vfx-blue.jpg`, `minion-vfx-orange-soft.jpg`,
`minion-vfx-abyss-soft.jpg`. A prévia protege o personagem de teste do
dano de andares altos e cancela replays assíncronos ultrapassados; isso
não altera a dificuldade do jogo. Os tempos exibidos nessa cena incluem
preparação/cache e não são um benchmark de combate ou de enxame.
A opção **Isolar VFX** da prévia oculta temporariamente números, anéis e
partículas genéricos apenas durante o desenho de QA, para inspecionar os
efeitos pequenos. Os arrays são restaurados depois; o jogo normal mantém
os avisos e a recompensa visual. Capturas isoladas são identificadas pelo
botão e pelo campo `isolated` no relatório.

Conferência independente do chat de VFX: azul normal em Andares e bioma 6
suave em Andares/Abismo passaram sem erros atuais ou falhas de atlas.
Ao avançar o relógio, mortes/resíduos expiraram enquanto a poça ofensiva
continuou vinculada ao hazard; a pausa estabilizou a idade dos efeitos.
Troca rápida de bioma/modo após a correção da QA manteve o desenho correto
e no máximo 12 atlases (5.308.416 bytes de pixels referenciados). Evidências:
`E:/assets GemVenture/analysis/minion-runtime-review-v1/review.json` e
capturas nessa pasta. Essa conferência não mede FPS nem substitui aprovação
visual humana. Nenhuma correção adicional do pacote foi solicitada.

### Revisão parcial do piloto por partes

Prévia de arte em `http://127.0.0.1:4230/`: comparados original aprovado,
montagem em repouso e ataque na fase 0,50; observado também movimento em
0,62. Slime preserva a leitura de topo/frente/lateral e o cristal conectado;
morcego preserva a cabeça e o encaixe das asas nos estados inspecionados.
As regiões reconstruídas não são pixel-idênticas à fonte: diferenças
discretas de cor/contorno foram declaradas pelo autor. Isso é uma revisão
parcial, não aprovação humana nem integração. Geodo ainda em construção.
Foi solicitada conferência em escala real 32/39 px e entrega dos pivôs,
direções, contato e comportamento suave/pausa antes da aplicação.
Captura diagnóstica: `minion-rig-pilot-attack.jpg`.
