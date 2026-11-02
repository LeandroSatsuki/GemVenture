# Mineradora AFK — direção para assets e efeitos

Pedido do usuário em 14/10/2026. Este documento orienta os chats de arte e
efeitos; não integra arquivos nem altera a jogabilidade.

## Intenção da tela

Uma mina automática divertida de assistir: uma broca pequena cai, salta e
ricocheteia, quebra materiais e desencadeia TNT, cortes, raios e outros
bônus. O jogador acompanha a trajetória e espera o próximo encontro. A
satisfação vem do contato, das reações em cadeia, dos objetos reconhecíveis
e da celebração do que foi realmente ganho. A TNT e sua mecânica agradaram
ao usuário e devem continuar como referência positiva.

O problema visual atual é o uso de quadrados coloridos com símbolos ou
gemas desenhadas dentro. **O objeto deve ser o próprio asset:** cristal
inteiro no lugar da caixa azul; pedra no lugar do quadrado cinza; pedrinhas
para representar cascalho. A grade existe para a simulação, não precisa
aparecer como uma coleção de botões. Evitar aparência de placeholder.

## Responsabilidades

- **Configure a skill de geração de arte:** avaliar o acervo, reutilizar o
  que já estiver adequado e produzir os objetos ausentes/incompatíveis.
- **Polir efeitos especiais do jogo:** produzir os efeitos e suas receitas
  de reprodução, usando os cinco efeitos já aprovados como direção.
- **Projeto principal:** comunicar intenção, medidas e eventos. A integração
  será coordenada depois da preparação dos componentes.

Não transferir este pedido para o chat de ícones. Não redesenhar outros
menus ou alterar preços, drops, física e pagamentos nesta etapa.

## Assets: direção e entregas

Usar a identidade raster já aprovada no projeto e na skill de arte: massas
compactas, formas bem definidas, quinas suavizadas, contorno escuro, cores
vibrantes e harmônicas, chanfros foscos e pouco detalhe. Preservar a família
de cores HEPT32 e as quatro identidades minerais: quartzo ciano, rubi
rosa/vermelho, topázio amarelo e esmeralda verde. Não incluir brilhos,
partículas ou halos permanentes no sprite base; a energia é dos efeitos.

Referência geral aprovada:
`C:/Users/lpsan/.codex/skills/gemventure-image-art/references/slime-blue-approved.png`.
O gerador deve consultar sua própria skill e referências aprovadas atuais.
O acervo do jogo contém referências em
`E:/Genventure/gemventure/dist/asset-reference/recursos/`; isso não significa
que cada referência procedural antiga esteja aprovada como arte final.
Também há o pack original em `E:/Genventure/Assets` e o workspace de arte
em `E:/assets GemVenture`.

Primeira entrega prioritária:

| Objeto | Leitura necessária |
|---|---|
| Quartzo, rubi, topázio, esmeralda | Cristal autônomo completo, sem placa ou quadrado de fundo |
| Pedra comum | Rocha robusta, volumosa e imediatamente reconhecível |
| Rocha densa | Mais pesada/compacta, distinta da pedra comum pela forma |
| Cascalho | Pequeno conjunto de pedras da mesma família; reutilizável no saldo e prêmio |
| Titânio/defletor | Obstáculo duro com face de desvio legível, distinto dos recursos |
| Broca | Ferramenta compacta, ponta para baixo; simples e expressiva, sem veículo gigante |
| TNT | Objeto explosivo reconhecível, mantendo a leitura e satisfação já aprovadas |

Depois, preparar objetos próprios para corte, raio, frenesi, dobro e
transformação. Evitar uma mesma caixa apenas com uma cor e glifo diferentes.
Os especiais precisam distinguir-se também por forma. O dobro deve manter
uma identificação ×2 clara; não parecer uma esmeralda comum. Propor essa
família em uma prévia antes de multiplicar variantes.

A imagem final deve ser PNG com alfa verdadeiro, objeto inteiro e margem
livre, sem fundo, chão ou moldura. Entregar fonte/prompt, PNGs, medidas do
conteúdo visível e pontos de ancoragem. Priorizar teste no tamanho real,
sobre fundo escuro e ao lado dos outros objetos; não apenas render ampliado.

## Perspectiva, escala e encaixe

A tela atual é frontal 2D, com volume/topo raso nos blocos. Seu tabuleiro
não usa grade isométrica diagonal. Os novos sprites devem preservar a
linguagem aprovada de volume e chanfro, adaptada a essa descida vertical.
Não copiar a vista antiga da máquina da vila para dentro da mina. Todos
os objetos novos precisam parecer vistos pela mesma câmera; se a câmera
aprovada de um asset existente não encaixar, preparar adaptação visual e
prévia em vez de misturar perspectivas.

Contrato atual para a futura integração:

- Canvas lógico **700×580**; 7 colunas, janela limitada a 13 linhas.
- Centros separados por **72 px na horizontal / 58 px na vertical**.
- O placeholder ocupa **64×44 px**, mais o pequeno volume inferior.
- Projetar a silhueta dos materiais para aproximadamente 60–64 px de
  largura e 48–54 px de altura máxima, com cristais mais estreitos quando
  conveniente. São limites de encaixe, não obrigação de virar um quadrado.
- `point(row,col) = (134+72×col, 58×row−cameraY+230)` é o centro da célula.
- Contato atual da broca: **centro da célula + (0,−22)**, normal `(0,−1)`.
  Entregar o ponto de impacto do novo objeto para ajustar apresentação sem
  mudar a colisão ou o alcance da simulação.
- Broca atual: corpo de aproximadamente 58 px, largura total até 70 px,
  altura aproximada 64 px; pivô principal na ponta inferior. O asset precisa
  deixar essa ponta livre para saltar, inclinar e receber efeitos de contato.
- O modo de assistir muda o layout/CSS, não a grade lógica ou a perspectiva.

## Efeitos: direção e cobertura

Manter os cinco aprovados da revisão 2: contato, estilhaços, explosão,
transformação e prêmio. Preservar os originais aprovados. A próxima rodada
deve completar os efeitos abaixo e preparar a aplicação coerente do kit:

| Gatilho | Intenção visual |
|---|---|
| Contato comum/denso | Impacto claro na ponta; peso maior na rocha densa |
| Quebra | Estilhaços sólidos do material, tamanhos distintos e queda; sem aspecto de água |
| TNT e cascata | Origem forte, explosões secundárias menores e propagação legível |
| Corte horizontal | Varrer somente a linha e realçar os materiais realmente quebrados |
| Raio de faixa | Mostrar a faixa atingida e seus contatos, além do raio central |
| Pulso sísmico | Culminação distinta do combo; expansão e quebra em cadeia |
| Frenesi | Broca quente e rastro curto; a silhueta e a ponta continuam visíveis |
| Prêmio duplo | ×2 reconhecível, diferente de cura e esmeralda |
| Jazida temporária | Transformar visualmente as pedras em cristais, mantendo as quatro cores minerais |
| Reflexão no titânio | Contato duro e acento direcional acompanhando o ricochete |
| Cascalho/cristal/passe recebido | Mostrar o objeto correto e o valor efetivamente pago; passe não parecer topázio |

Alegria e exagero vêm de sucessões de impactos, cascatas, cores e contrastes
de intensidade. Não cobrir tudo com um clarão uniforme nem deixar todas as
explosões com o mesmo tamanho. Manter a broca e os próximos especiais
legíveis. Respeitar a opção de efeitos suaves.

## Contrato técnico dos efeitos

Fonte: `dist/miner.js`, `dist/miner-view.js` e `docs/MINER_AFK.md`.

Cada contato informa `id`, `step`, `from`, `to`, `kind`, `contact`, `cells`,
`effects`, `count`, `combo`, `multiplier`, `pulse` e os pagamentos reais:
`gravel`, `crystal`, `crystalAmount`, `pass`. Os eventos visuais preservam
`batchId`, o id do especial e a cor de cada célula.

Os objetos sobrevivem visualmente até a frente da cascata atingi-los.
Quebras são espaçadas por profundidade em cerca de **85 ms**, até 650 ms;
especiais até 700 ms, com prêmio agregado no fim. `depth` não contém uma
ligação explícita pai/filho; não inventar uma cadeia causal exata.

Alcances reais: TNT 3×3/5×5; corte horizontal 7 colunas; raio faixa 3×4
do ponto de origem para baixo; pulso até 5 linhas×7 colunas. As listas
`cells/effects` são a verdade, pois titânio e células já coletadas são
excluídos. Não usar apenas uma animação fixa para prometer alcance maior.

Toda recompensa já foi paga pela simulação. O efeito não concede recurso.
Cristais visuais da jazida não devem receber a mesma celebração de prêmio
de um cristal efetivamente creditado; destacar prêmio mineral somente
quando `crystalAmount > 0`, cascalho quando `gravel > 0`, passe quando
`pass > 0`. O medidor REFINO explica o processamento em lotes.

Manter os limites atuais: 24/6 sprites, 220/32 partículas (normal/suave),
14 anéis, 10 feixes e fila de 320 eventos. Priorizar contato e prêmio,
reduzir primeiro os secundários. Não empilhar uma folha de estilhaços e
um emissor completo em cada célula. Preparar sprites/cache uma vez; sem
recorte, recoloração, leitura de pixels ou novos canvases por frame.

## Revisão conjunta

Preparar contato com materiais lado a lado, quebra simples, TNT encadeada,
jazida, pulso e recompensa real, em tamanho de jogo e fundo escuro. A
perspectiva, os pontos de contato e as cores devem permanecer iguais entre
assets e efeitos. A origem de QA deve ser isolada: as fixtures nunca devem
ser executadas nas portas 4173/4174 do jogador.

Nesta etapa o pedido é repassar e preparar a direção. Nenhuma integração
automática, substituição de arquivo ativo ou mudança de mecânica está
incluída neste documento.
