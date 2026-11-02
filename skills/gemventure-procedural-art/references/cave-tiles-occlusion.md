# Tiles, paredões, encontros e visibilidade

Esta referência trata a estrutura não jogável da caverna: piso visual, paredes,
coroamentos, encontros, curvas e ambientação de borda. A fonte da colisão continua
sendo a geometria lógica do jogo. Ler a forma real do consumidor antes de desenhar.

## Perspectiva e planos

Na baseline de 31/10/2026, `world.project(x,y)` é
`(100 + 44x + 4y, 115 + 32y)`. O desenho interno usa metade dessas coordenadas;
viewport, escala e câmera acrescentam outras transformações. É uma projeção
superior oblíqua com eixo horizontal e fileiras levemente enviesadas, não um
losango isométrico simétrico. Piso, pé da parede, props, sombra e hotspot devem
passar pela mesma base. Não aplicar medidas internas diretamente a pixels CSS.

Separar quatro dados: piso transitável; sólido que bloqueia; envelope desenhado;
camada de visibilidade/oclusão. Um topo volumoso pode exceder a base sem ganhar
colisão. Isso não pode esconder jogador, alvo ou aviso numa rota existente.

No runtime atual, `world.js` inclui `occludingWallPlan` na fila de profundidade
de atores. A altura usada é 30 no espaço interno do pintor. `buildWallPlan`
é um plano anterior/ainda usado por outros consumidores, com faces de altura
variável e suportes. Inventariar ambos e comparar seus resultados quando um
prop usa o segundo plano, pois podem divergir da parede realmente visível.

## Contrato do kit modular

Projetar o kit por funções e encontros necessários, não por uma quantidade
arbitrária de sprites. Manter IDs estáveis e uma tabela de peças contendo:
papel, orientação, assinatura dos vizinhos, âncora, altura, material, máscara
de recorte, bounds visuais e consumidor. Colisão e flags de perigo são separados.

| Família | Cobertura que precisa existir |
| --- | --- |
| Piso interior | Massa contínua sem contorno entre células da mesma superfície; variantes esparsas. |
| Transição de piso | Bordas e cantos de materiais; não insinuar lentidão ou dano onde o mapa lógico é neutro. |
| Parede reta | Pé/base, face e topo coerentes nas orientações exigidas pela câmera. |
| Canto externo | Continuidade de espessura e chanfro, sem rachadura ao girar a fachada. |
| Canto interno | Encontro côncavo com interior fechado, sem triângulo de vazio ou z-fighting. |
| Retorno e término | Fechamento de massas, pilares e mudança de altura sem tampas flutuantes. |
| Curva | Silhueta em segmentos largos ou curva controlada; entrada e saída com encaixe previsível. |
| Boca de conexão | Ombreiras e eventual teto recuado que mantenham largura visual e acesso reais. |
| Coroamento e teto de borda | Espessura aparente, suporte e recorte; não formar uma faixa que cobre todo o corredor. |
| Nicho e toca | Integração com a massa e recorte fixo sem invasão da área transitável. |

Para regras por vizinhos, escolher explicitamente um modelo: cantos, lados ou
misto. A documentação do [Tiled](https://doc.mapeditor.org/en/stable/manual/terrain/)
descreve essas diferenças. [Boris](https://www.boristhebrave.com/2013/07/14/tileset-roundup/)
explica a redução blob para 47 configurações sólidas relevantes. Esses números
descrevem modelos 2D; não são uma ordem para gerar 47 peças volumétricas por
bioma. O runtime já constrói contornos contínuos: pode receber segmentos e
junções sem virar uma matriz de sprites de parede independentes.

Em contatos diagonais, decidir a conectividade pela regra cardinal vigente.
Fechar o visual sem inventar uma passagem diagonal. Em qualquer canto, dar um
único proprietário à junção; evitar dois contornos e duas sombras sobrepostos.
Rotação automática de uma peça iluminada pode virar a luz, o chanfro e o relevo:
derivar cada orientação a partir da geometria/câmera, em vez de girar pixels.

## Como naturalizar sem poluir

### Direção humana vigente para o piloto do primeiro bioma — 31/10/2026

O usuário rejeitou a superfície plana da R3. Sua referência positiva é o volume
em blocos da R2, com duas correções: pedra mais escura e textura menos regular.
O formato, as curvas e a disposição das salas foram elogiados; não confundir
irregularidade de textura com mudança aleatória dos contornos. Trabalhar blocos
estilizados com topo, chanfro e retorno sombreado, variando largura, altura e
juntas. Evitar tanto o painel plano com riscos quanto fiadas claras uniformes.
A parede permanece uma massa conectada, distinta das pedras mineráveis.

A posição da toca R3 foi elogiada; seu paredão plano foi rejeitado. A boca deve
ter profundidade e pertencer à mesma família volumétrica da parede. Preservar
ouriço, acesso e recorte; conferir o conjunto na câmera real. A correção não
constitui aceite antecipado de outra candidata nem autorização de aplicação.

Na revisão seguinte, o usuário gostou dos blocões e do resultado da R4. Pediu
preservá-los, melhorar apenas o acabamento da entrada do ouriço e **reverter o
preenchimento dos vazios centrais**: eles devem voltar a ficar escuros como o
limite do mapa. Essa decisão substitui o pedido anterior de tampar os meios.
Não transformar o vazio em piso acessível nem alterar os contornos para escurecê-lo.

Dar forma em três escalas: massa da sala → estratos/retornos largos → pequenas
fraturas selecionadas. Aleatorizar todo vértice cria serrilhado e dificuldade de
encaixe. Variar comprimentos de estrato, nichos e grupos mantendo as interfaces.
Paredão permanente deve parecer conectado e diferente das pedras mineráveis.
Uma curva de arte suaviza uma esquina; só um estudo de navegação pode mudar
a esquina lógica. Não arredondar até sugerir uma passagem inexistente.

## Parte superior sem tampar o minerador

Construir profundidade por face, topo e sombra de contato; aumentar o volume
superior não é a única maneira de sugerir caverna. Recuar massas de teto para
o lado sólido, enquadrar o vazio nas margens e preservar aberturas visuais.

Para sobreposições inevitáveis, usar a política atual de transparência local
como baseline. Avaliar a silhueta projetada completa do minerador (incluindo
pulo, ferramentas e buffs grandes) e a aproximação do alvo. Uma origem de ator
visível não prova que cabeça, ferramenta ou próximo aviso estão legíveis.

Testar separadamente parede que fica **acima na imagem**, parede atrás do ator
na profundidade e parede de primeiro plano: não são conceitos equivalentes.
Ordenar pelo apoio/profundidade coerente com a câmera, não pelo topo do sprite.
Um estudo pode propor recorte local ou fade com margem de entrada/saída para
evitar piscar; documentar essa diferença, pois o fade atual é espacial e não
implementa automaticamente toda essa política. Preservar altura, colisão e
limite de visão. Não remover fog para revelar alvos ocultos por regras do jogo.

Não resolver o problema diminuindo globalmente paredes, deslocando o jogador,
mudando colisão ou desenhando todos os atores acima de qualquer obstáculo.
Se um detalhe decorativo não pode coexistir com a visibilidade, reposicioná-lo
ou removê-lo antes de acrescentar um novo efeito.

## Gramática de decoração

O kit precisa dizer **onde** cada peça cresce: topo, face, pé de parede, canto
úmido, fissura seca, nicho ou solo. Cada instância tem área de apoio e envelope
de projeção, separação de outras peças e exclusões de entrada/saída/ameaças.
Uma estalactite alta fora do piso pode cobrir uma rota distante na imagem.
Não confundir ausência de colisão com ausência de obstrução visual.

Usar conjuntos coerentes e trechos silenciosos; evitar moldura decorada de
espessura constante ao redor de todas as paredes. Preservar saturação e movimento
mais fortes para ações e perigos. Decoração estática usa cache por geometria;
animação leve usa camadas/pivôs, relógio vigente e modo suave. Nunca reconstruir
contorno, atlas ou pixels de material por quadro para variar um detalhe.

## Prancha e revisão necessárias para futuros tiles

Antes da composição completa, montar peça isolada **e** encontros reais:
reta longa, L externo, L interno, U, S, término, estreitamento, T/ramificação,
contato diagonal, nicho/toca e limite do mapa. Exercitar cada orientação e os
materiais contrastantes. T é um caso de encontro espacial, não necessariamente
um sprite independente quando o contorno compartilhado já o resolve.

Verificar em escala final e durante aproximação/afastamento:

- Piso contínuo sem frestas, costuras escuras em dobro ou detalhe que pareça minério.
- Topo, face e base encontram-se com espessura coerente e um dono por vértice.
- Sombra acompanha o contorno efetivamente desenhado e respeita piso e fog.
- Cabeça, ferramenta, alvo, aviso e rota de desvio legíveis junto a todas as faces.
- O clique e o movimento correspondem ao solo visível; nenhum ornamento captura alvo.
- Sem cintilação, salto de alpha ou repetição gritante ao mover câmera e ator.
- Cache limitado e preservação de pausa, modo suave, saves e desempenho.

Registrar seed, bioma, posição, pose, viewport/zoom, filtros e instante do antes/depois.
Prancha e teste geométrico não substituem revisão perceptiva no jogo.
