# Cavernas de campanha — expedição v1

Aplicação autorizada pelo usuário após caminhar e aprovar o piloto
`CAVE-EXPEDITION-PILOT-20261031-R1`. Fontes, baseline, recibo e recuperação em
`coordination/cave-expedition-official-20261031-r1/`, fora do checkout.

## Estrutura aprovada

Os quatro andares comuns de cada um dos sete biomas usam uma planta de 192 × 144
células: 24 salões principais, seis câmaras laterais com entradas discretas,
corredores e algumas ligações alternativas. Seed, planta, materiais e posição
do ouriço são determinísticos. A toca ocupa uma parede com espaço contínuo
atrás e passagem livre à frente; sua posição exige pelo menos 180 passos a partir
da entrada. Ela varia entre os salões profundos, sem ficar presa ao topo.

`campaign-cave-layout.js` adapta as posições após a geração da população nativa.
IDs numéricos, quantidades, tipos, HP, valores, cota e relógios permanecem os do
gerador atual. As três primeiras veias ficam próximas da entrada. Reposição,
quedas de rochas e encontros comuns usam os arredores alcançáveis do jogador,
preservando frequência, orçamento e regras de segurança existentes.

## Materiais e apresentação

`campaign-cave-data.js` e `assets/campaign-caves-v1/` preservam as famílias
aprovadas no piloto: paredes de blocos volumétricos escuros, curvas e cantos,
variações de solo, vazios escuros, líquidos com encaixe entre tiles e bases dos
minerais da cor do bioma. Não aplicar a sombra antiga sob essas paredes.

O consumidor é `World`: minerador, bosses, companheiros, golpes, avisos, HP e
animações atuais continuam ativos. Paredes entram na fila de profundidade e
recebem uma abertura de visibilidade junto ao personagem. A chegada usa o asset
canônico ancorado à parede oeste do salão inicial, com apoio recortado pelo piso.

As arenas são próprias: piso circular de blocos, centro com padrão, toca e jaula
integradas, quatro pilares de marfim e quatro chamas Canvas 2D. A cor da chama
segue o chefe: azul, verde, âmbar/marfim, vermelho, magenta, dourado e laranja.
A revisão espacial de 01/11/2026 amplia novas arenas de 21 × 15 para 23 × 17
células; os doze cantos reservados deixam 303 células jogáveis (antes 235).
O boss inicia em (11,9), mais central na composição, e a câmera recua 8%.
Piso, pilares, chamas, toca, núcleos e tocas dos filhotes acompanham a ampliação.
Ataques usam os limites da arena, incluindo as novas bordas; selos seguros
continuam alcançáveis com dois movimentos básicos. Salas e telegráficos antigos
21 × 15 mantêm seu contrato. A revisão usa `campaignCave.arenaRevision=2` e
`boss.arenaSize`, sem trocar a versão raiz do save. Combate,
telegráficos, regras de vitória e recompensas permanecem os existentes.

## Preparação e memória

A planta lógica existe inteira; as imagens do cenário são preparadas em setores
de 16 × 16 células. A geometria usa Worker quando disponível. O trabalho de
rasterização é dividido em unidades, com orçamento alvo de 4 ms por quadro;
uma unidade isolada pode ultrapassar esse alvo. Não interpretar isso como FPS
garantido em todo dispositivo.

O cache dos setores tem teto de 64 entradas e 64 MiB, incluindo rasters em
preparação. Imagens decodificadas, atlas e pequenos auxiliares têm limites
separados. Há uma borda de antecipação de 16 células e avanço de 12 células na
direção do deslocamento. A entrada aguarda essa borda; se a câmera alcançar uma
área ainda indisponível, a preparação suspende os relógios de gameplay. Não há
um Canvas da caverna inteira. Recursos removidos ficam no estado real da sala,
fora do cache: voltar a uma região não recria loot. O descarte libera os rasters.

## Save e limites

O save raiz e a chave de armazenamento continuam na versão existente. Novas
cavernas têm `campaignCave.version=1`; a planta comum tem `layout.version=2`.
Saves antigos mantêm a sala em andamento e sua apresentação anterior. O próximo
andar gerado ou uma nova expedição adota o modelo novo. O Abismo mantém sua
geração, geometria e fluxo separados. Esta aplicação não acessa nem altera o
save do navegador do jogador, não publica a versão hospedada e não retoma o
monitor de equipe.

A evidência Native Canvas usa o consumidor real e câmera simulada. Ela não
certifica navegador físico, foco, controles, CRT ou desempenho do aparelho.

### Complemento espacial R2 — 01/11/2026

A pedido do usuário, novas arenas passam a 25 × 19 (379 casas úteis), mais
9,5% na largura e 13,3% na profundidade sobre a revisão anterior. Câmera
mantida em 0,92. `arenaRevision=3`; arenas antigas das revisões anteriores
continuam válidas. Piso, pilares, chamas e alvos acompanham os novos limites.
