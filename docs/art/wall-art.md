# Paredes ilustradas — Grutas de Cristal, revisão 4

Implementação de apresentação em `dist/cave-wall-art.js`. Mantém a identidade raster de pedras grandes chanfradas, a projeção do jogo e a família de cor do chão `P.slate`. A composição e os encaixes da revisão 4 foram aprovados pelo usuário. A revisão 4.1 acrescenta o contorno solicitado para separar os acabamentos; este ajuste está disponível para revisão visual.

## Estrutura e câmera

A máscara lógica de piso é a fonte única da borda. Arestas compartilhadas desaparecem; os circuitos externos e as ilhas são fechados, com tratamento dos contatos diagonais. A projeção é U=(22,0), V=(2,16), em coordenadas de meio tamanho do renderizador; não é isometria de losango.

`buildWallPlan()` separa cada circuito em frentes, retornos laterais e cortes de visibilidade. A frente é uma superfície inteira ancorada no limite do chão. O topo de 4 unidades compartilha exatamente sua aresta superior. Cada vértice possui um único encontro, associado às duas superfícies adjacentes. Não existe uma segunda linha de topo elevada sobre todo o mapa.

A altura preferencial é 48, o dobro das 24 unidades iniciais. Uma máscara já existente pode ter outra passagem imediatamente atrás da parede. Nesses casos o planejador escolhe 32, 16 ou 8 para o trecho completo, em vez de desenhar uma parede alta e recortá-la depois contra o chão. Retornos fazem a transição para a altura da frente vizinha ou para o corte baixo. A restrição é de apresentação: não altera obstáculos, geração, navegação ou saves.

Há uma margem visual fixa de aproximadamente 2–3 unidades na borda do piso para chanfros e contato. O interior protegido de cada célula é verificado contra a face, o topo e o suporte completos. Essa margem não é uma autorização para cobrir centros, corredores ou avisos. Testes de pixels e de combate complementam o teste geométrico. Paredes altas não usam a subtração global do piso; somente o contorno baixo usa esse recorte.

## Arte e conexões

- `stone-courses-v3.png`: nova arte com quatro fileiras de pedras, sem esticar/repetir verticalmente a antiga parede de duas fileiras. Amostra em escala 132 × 48 com fase fixa no mundo. Não há mistura das bordas opostas nem reinício da fase por face.
- `stone-coping-v4.png`: fiada raster de pequenos blocos regulares, mapeada sobre a aresta superior de cada face em escala 72 × 4. A faixa acompanha também os retornos, sem espessar a parede.
- `timber-front-v4.png`: poste e lanterna em elevação frontal, sem topo/lateral em perspectiva. Recorte transparente (348,63,328,1408), largura 10, altura igual à face mais o remate de 4. O pé coincide com a base da parede.
- `stone-footing-v4.png`: rodapé baixo de pedra/rejunte, recorte (24,305,2124,166), escala 88 × 4, contido na base da parede. A borda suavemente irregular conecta os grandes blocos ao piso sem espalhar detritos na passagem.

A colocação prioriza as emendas reais da textura frontal em x múltiplo de 132, em faces de pelo menos 16 unidades. Não é um poste por célula de piso. Encontros frente/retorno de altura 48 continuam elegíveis, com frente de ao menos 66 unidades; um poste próximo elimina duplicação. Todo suporte conserva espaço integral e reservas da entrada, toca e saída. O afastamento horizontal mínimo é 36 quando as alturas se sobrepõem. As demais quinas são resolvidas pela própria estrutura. A lanterna possui cor pintada; não adiciona uma nova luz de combate. Os antigos portais desenhados em código são mantidos somente no fallback.

Os PNGs foram produzidos com `image_gen.imagegen`; prompts e proveniência em `dist/assets/cave-walls/material-prompts-v4.json`. Prompts de versões anteriores e fontes originais externas são preservados; os PNGs aposentados sem consumidor foram removidos na limpeza de 25/10/2026. Este sistema utiliza materiais raster sobre superfícies calculadas; não é uma folha de 47 sprites finalizada. A arte final não recebe aleatoriedade de fase/cor por tile.

## Integração

O plano fica em cache por sala e identidade de `floorMask`; a máscara é imutável durante a vida das salas compatíveis. Se uma futura mecânica editar essa máscara no lugar, deverá invalidar esse cache ou substituir a matriz.

`World.cave()` compõe a parede no fundo estático, depois do chão e antes de atores. As quatro imagens carregam uma vez; a revisão de disponibilidade invalida o fundo quando todas estiverem prontas. Falha ou carregamento incompleto usa o fallback. Não consome RNG da simulação e não reconstrói por frame.

Escopo: cavernas comuns do bioma 0 com máscara compatível. Chefes, Abismo, outros biomas e saves sem máscara mantêm a implementação anterior. O exportador portátil incorpora o módulo e os quatro PNGs novos/retidos explicitamente.

## Validação e limites

`tests/cave-wall-art.test.mjs` verifica 512 configurações locais e 1000 cavernas para contornos; 500 cavernas para superfícies, encaixes e pilares com algoritmo independente de interseção; corredores com separação sólida de 1 a 4 células; preservação de estado, escopo e cache. Números de QA não certificam a estética.

Evidências e comparações na mesma câmera/semente: `E:/assets GemVenture/production/wall-integration-v4/`. Incluem mapa 712/713, quinas, escala do personagem, controles de floresta/arena, leitura de piso em 100 mapas, carregamento/falha, avisos de queda, jogo real e exportação portátil.

O mapa atual apresenta muitos degraus de uma célula. A revisão conserva esses mapas e resolve seus encontros; não promete remover todo serrilhado da arquitetura nem manter altura 48 onde uma passagem exige corte. Um gerador futuro pode impor espessura mínima e trechos mais longos para ampliar a presença de paredes altas. Isso deverá ser versionado separadamente, sem reinterpretar saves existentes. Recolor dos demais biomas só após a revisão visual deste primeiro material.

## Pesquisa aplicada ao projeto

O estudo completo está em `E:/assets GemVenture/production/wall-research-v3/estudo-paredes.html`. Foram adaptados os princípios de separar máscara, regras de encaixe e composição, em vez de copiar o tileset ou a câmera de outro jogo. Fontes principais: documentação de [TileMaps do Godot](https://docs.godotengine.org/en/3.5/tutorials/2d/using_tilemaps.html), [automapeamento do Tiled](https://doc.mapeditor.org/en/stable/manual/automapping/), [camadas automáticas do LDtk](https://ldtk.io/docs/general/auto-layers/), e os relatos dos desenvolvedores reunidos no estudo. A solução atual conserva a projeção e as restrições concretas do Gemventure.

## Acabamento geométrico da revisão 4

A máscara visual de cada superfície usa curvas quadráticas de raio máximo 3, limitadas a um terço de cada aresta. Os cantos são suavizados para dentro do volume; os polígonos conservadores de encaixe, os circuitos lógicos e as alturas continuam os mesmos. Frente e remate compartilham uma única máscara visual; uma base opaca evita frestas de antialias entre as faixas. O rodapé também fica contido nessa máscara. Não há desfoque da arte para simular arredondamento.

A revisão foi comparada com a v3 na mesma câmera e nos mesmos mapas. Testes adicionais verificam postes ancorados às repetições reais, alturas compatíveis, afastamento, contornos e superfícies em 500/1000 mapas. A revisão artística do usuário continua sendo necessária para declarar este acabamento canônico.

## Contornos de acabamento — revisão 4.1

Contorno `P.ink` de 0,8 unidade sob o remate, 0,65 acima do rodapé e 1,3 na linha de contato da base, sempre recortados pela mesma silhueta arredondada. Os chanfros pintados continuam fornecendo o volume. Não altera alturas, materiais, ancoragem dos postes, navegação ou cache. Evidências na mesma câmera/semente em `E:/assets GemVenture/production/wall-integration-v4-1/`. Iluminação leve das lanternas foi solicitada ao chat de efeitos; a preparação de cores dos demais biomas não ativa o recolor das paredes.
