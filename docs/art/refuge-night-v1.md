# Refúgio Mágico — implementação inicial · 27/10/2026

Tela fixa de preparação que substitui a navegação da vila. Canvas 2D, WebAudio,
acabamento CRT e painéis funcionais do jogo foram mantidos. Layout baseado no
conceito noturno v02 aprovado; integração visual nova ainda sujeita à revisão.

## Fontes ativas e proteção contra arquivos antigos

- Protagonista: **generated-player-miner-v1, arte/movimento revisão 3**, aprovado
  explicitamente pelo usuário para refúgio e vestiário. `front.png` mantém SHA256
  `2be8873159ff4a7c4aa4ac6c69a183ae788303ff6bf21b87ddfd1cbad4c49daf`.
- Retrato, repouso e vestiário resolvem `homeCollection.look` pela mesma definição
  em `player-appearance.js`. Nenhuma busca por arquivos mais recentes ou fallback
  para o corpo histórico. Novas aparências precisarão de registro e validação no
  catálogo de save, além de retrato e clips equivalentes.
- Duas danças e pose de mãos na cintura são clips adicionais do rig aprovado,
  em `diorama-library/projects/gemventure-creatures/src/miner/lobby.ts`.
  Esqueleto, rosto, capacete, roupa e os clips aprovados não foram substituídos.
- Companheiros: gosma de quartzo revisão 2 e morcego safira aprovado, provenientes
  de `generated/slimes-motion-v1/quartz` e `generated/bats-v1/sapphire`.
- Árvore: `originalTree`, 24 folhas do gerador aprovado `src/base/tree-altar.ts`.
  Tronco, copa e ilha usam o mesmo frame e yaw, com `gemventure-cave-v1`.
  Exportação adicional `sheets/base/refuge-floating-tree.ts` (32 quadros/8 s).
- Fundo: plate do conceito aprovado, sem UI/atores/árvore/cristais. Origem e hashes
  em `dist/assets/refuge-night-v1/source-manifest.json`; prompt preservado ao lado.

Os PNGs aprovados conservam Cosmos64. O renderer nativo e as gemas novas usam as
cores HEPT32 que já existem no jogo oficial. Não houve troca global de paleta.

## Composição e controles

Forja → Árvore → Poço dos Desejos → Loja (Em breve). MINA permanece o CTA principal.
Vitrola é acesso separado com seu ícone atual, sem telhado. Coleção e atividades
mantém os outros painéis disponíveis; Zag não aparece na navegação principal.
Os tutoriais existentes continuam acessíveis.

Carteira mostra moedas e quatro gemas lapidadas. Veios do cenário são conjuntos
de prismas chanfrados, com contato no chão e brilho superior esquerdo, usando o
cache nativo. Gemas de receita, oferenda e retorno usam a mesma representação de
recurso; nomes, valores, probabilidades, receitas e IDs permanecem iguais.

O botão musical pausa apenas a música do refúgio. O nome exibido é **Refúgio
Mágico**, pois o áudio atual usa o tema doméstico de 64 BPM; o disco equipado
altera seu timbre, e continua sendo selecionado na vitrola. Efeitos e música da
expedição conservam seus controles. A animação de entrega aponta para a carteira
nova e continua seguindo os valores reais calculados no retorno.

Vestiário usa pose nativa com mãos na cintura. Aba Pets lê `petsServiceView`,
mostra condições reais e equipa/desequipa via transação já existente. Abrir a aba
não concede pets nem altera progressão. Só o companheiro desbloqueado e equipado
aparece no cenário.

## Movimento, acabamento e custo

Fundo desfocado uma vez em cache; oito contribuições de luz de lanterna com alcance
limitado; 22 vaga-lumes determinísticos; árvore com folhas assíncronas; repouso,
duas danças e salto/voo dos pets. Pausa, aba oculta e movimento reduzido congelam
o relógio ambiental. Nenhum novo shader, engine ou sistema de luz 3D.
Imagens são carregadas antes de mostrar o refúgio. Não há gerações de imagens por
quadro. Aproximadamente 5,7 MB de PNGs novos, sem incluir o cache já existente.

## Verificação e limites

- `npm test`: 630/630 passaram. Inclui fontes v3, dimensões dos atlas, determinismo,
  movimento reduzido, leitura sem mutação dos pets e IDs únicos da carteira.
- `npm run check`: scripts/referências válidos.
- `npm run audit:art`: 5.922 variantes, 33 famílias, sete biomas, até 30 formas.
- `node export-art-studio.mjs`: exportação portátil concluída.
- Revisão real da UI em perfil isolado: retrato v3, mãos na cintura, árvore inteira,
  troca gosma/morcego persistida, Loja, Forja, talentos, poço, vitrola, play/pause e
  seleção/início da expedição. Nenhum erro de console observado nesses fluxos.

Limites: a migração dos corpos/ações de combate **dentro da caverna** não faz parte
desta integração do lobby; o controlador anterior permanece lá. O registro visual
atual do vestiário prepara aparências futuras, mas não cria um sistema novo de
customização de roupas. Não foi realizado benchmark em hardware fraco, nem QA
completo de celulares em retrato. A floresta de fundo é uma imagem estática com
efeitos sobrepostos; personagem, pet e árvore são camadas animadas independentes.

Não confundir os perfis de QA com o save oficial. A aplicação usa lista explícita,
confere hashes anteriores e guarda backup antes de alterar cada arquivo.


## Revisão de 27/10/2026 — apresentação frontal e dança única

Esta revisão implementa o pedido posterior de interface azul, limpeza dos NPCs
antigos e Passinho do Jamal. A aparência-base continua sendo o minerador procedural
v3 aprovado; as novas poses e a apresentação frontal são candidatas para revisão.
As folhas aprovadas da caverna permanecem byte a byte preservadas.

- Apresentação frontal a 512 px por célula, câmera de apresentação com tilt 16°,
  independente da câmera da caverna. Capacete, esqueleto, roupa, paleta Cosmos64,
  iluminação e proporções do v3 reutilizados. Retrato e vestiário usam o mesmo
  registro da aparência equipada.
- Uma única dança, adaptada do vídeo fornecido pelo usuário:
  https://youtube.com/shorts/qYcKjB_Lk1Q . Sequência de braços diagonais, mãos junto
  à cabeça e pulsos alternados das pernas. 48 quadros, 4,8 s, duas repetições entre
  repousos; sem esticar ossos. Não é captura de movimento nem reprodução exata do
  tempo do vídeo, que contém cortes de personagens.
- Árvore simplificada com 13 massas de folhas, tronco e folhas na mesma orientação,
  raízes sem ilha suspensa e desfoque somente no plano de fundo. Luzes de lanternas
  e 22 vaga-lumes preservados. Filtro global desligado no refúgio e elevador;
  acabamento da caverna preservado.
- Logotipo oficial, sem subtítulo; Forja, Árvore, Poço e Loja por último. Missões
  separadas, Relicário indisponível, pontuação numa estátua frontal flutuante e
  música abaixo da carteira. Mina usa a picareta oficial. Vitrola sem cobertura.
- Pets volta ao painel padrão com requisitos reais; cabeçalhos compactos de Pets
  e Forja sem cuidadora/ferreiro. Pose de cintura sem mãos cruzando a barriga.
- Gemas de recurso em carteiras, melhorias e recompensas, distintas dos cristais
  geológicos. Os assets históricos continuam disponíveis para comparação.
- Mineradora automática retirada dos acessos e da liquidação passiva do lobby.
  Dados históricos e módulos isolados preservados para não invalidar saves.

O elevador sofria interferência de seletores antigos (.lift-pane, .lift-biome-nav,
headers e dialogBody). A largura da faixa mudava quando as setas eram ocultadas,
provocando recálculos do ResizeObserver. A nova versão mantém as colunas das setas,
desabilita os extremos e isola os estilos V2. Restaura a rolagem pelas novas classes.
Em janelas baixas o conteúdo rola verticalmente em vez de comprimir os painéis.

Fontes nativas novas no Diorama: src/miner/refuge-presentation.ts,
src/miner/jamal.ts, src/base/refuge-statue.ts, sheets/base/refuge-tree-v2.ts e
sheets/characters/miner-refuge/. Publicação: work/publish-refuge-v2.py.
No jogo, assets/refuge-night-v2/manifest.json registra quadros, dimensões e hashes.

Validação: 633 testes passaram; check de scripts e referências passou; auditoria
HEPT32 de 5.922 variantes do runtime passou. Estudo nativo com 481 amostras:
deriva óssea zero, fechamento do ciclo zero, pés acima do chão e ausência de avisos
nos clips Jamal, repouso e vestiário. Recortes dos atlas conferidos em todo o ciclo.
Um teste legado misturava performance.now real e tempo de quadro sintético; seu
relógio foi fixado, sem alterar o motor da mineradora aposentada.

Os recibos antigos de aprovação visual foram preservados. O contrato de hashes
refuge-night-v2-ui-contract.json registra a implementação solicitada, não uma
aprovação visual nova. Candidata verificada em perfil separado do save oficial.
Não foi feito benchmark em hardware fraco nem migração do minerador de combate.


## Revisão de 27/10/2026 — volume dos recursos, vida no rosto e acessos atuais (v3)

Esta revisão substitui as decisões de interface da v2 explicitamente corrigidas
pelo usuário: o Relicário está ativo, o Poço foi aposentado e a árvore de fundo
segue a primeira referência aprovada do lobby. O resultado novo aguarda avaliação
visual do usuário; os recibos registram implementação, não aprovação automática.

### Arte e identidade

- Quatro gemas lapidadas com volumes, faces e brilho direcional, distintas dos
  cristais geológicos. collected-gems.js centraliza o consumo na carteira, Forja,
  equipamentos, melhorias, missões e recompensas. Ícones de bolsa, estrela, moeda,
  troféu, espadas, coração, baú, pergaminho e cabine também atualizados.
- O primeiro estudo vetorial das gemas foi rejeitado na inspeção por continuar
  plano. A versão final usa PNGs transparentes. Não ampliar essa substituição
  automaticamente aos materiais ou cristais do combate.
- Árvore de copas rosa/roxa/ciano e tronco azul-escuro reconstruída a partir da
  referência inicial do usuário. É uma ilustração no cenário existente, não uma
  malha 3D nem o modelo antigo deslocado. Sem etiqueta clicável duplicada.
- Sete panoramas de bioma, incluindo a Gruta de Cristal, com volumes estilizados
  e transição alfa nas laterais. Desbloqueios e seleção reais preservados.
- Pets e prévias de inimigos usam as famílias aprovadas do Diorama. Não foram
  inventados novos pets. Os 21 fronts têm IDs canônicos em current-creature-art.js.
- As imagens novas não alteram o catálogo global de cores ou o renderizador.
  PNGs têm antialiasing e tons interpolados; não são imagens indexadas de 64 cores.

### Personagem e movimento

O minerador continua com o rig modular v3 e os mesmos rosto, proporções e roupa.
Somente sua apresentação frontal do refúgio recebe refuge-motion-v3.ts, 96 quadros
por clip, célula 512, atlas 4096×6144. Câmera de apresentação 16°, caverna intacta.
Braços curtos afastados da cabeça, balanço discreto do quadril e ombros, piscadas
espaçadas de forma desigual e breve sorriso com olhos fechados. Ciclo a 1,3×.
Expressões são parâmetros optativos do rosto: os geradores antigos usam o padrão.
Não atualizar folhas de combate/caverna aprovadas com poses de apresentação.

Auditoria nativa de 961 amostras: deriva óssea zero, fechamento do ciclo zero,
pés sem atravessar o chão e distância mínima positiva de 0,254 unidade entre a
envoltória das mãos e a cabeça. Essa medida é uma verificação conservadora do rig,
não uma simulação de colisão de cada triângulo. Atlas conferido visualmente.

### UI, acessos e dados

- Forja com fundo azul-escuro; Árvore sem tarja atrás do título ou resumo BUILD.
  Marca oficial maior. Loja por último, com bolsa própria e aviso Em breve.
- Relicário ativo usa as compras existentes com estrelas. Removidos acesso,
  tutorial e transação do Poço. Campos de save e benefícios históricos permanecem
  para não invalidar progresso adquirido; módulos históricos não são novos acessos.
- Missões em botão destacado: aviso reflete vagas, missões ativas ou recompensa
  disponível conforme dados existentes, sem conceder recompensas na apresentação.
- Pets têm cards de 205 px (174 px em janela baixa), com espaço para duas linhas.
  Corrigida transformação herdada que tirava o sprite da área do card. Não há
  cuidadora no cabeçalho. Pontuação e tutorial usam a família azul atual.
- Vitrola apenas com ícone e borda. Player compacto com play/pause e créditos;
  anterior/próxima ficam desabilitados enquanto houver só uma faixa. O usuário
  informou que enviará outra música para o login: áudio novo e créditos pendentes,
  nenhuma autoria/direito inventado e nenhuma faixa substituída nesta revisão.
- Elevador mantém o layout estável e recebe cabine e recompensas atuais. Estrelas
  registram o delta realmente conquistado no andar, preservando o melhor registro.
  Saves antigos sem essa informação mostram ausência de registro; não recebem
  estrelas fictícias. Corrigido estilo herdado que dourava estrelas não conquistadas.
- Relicário teve o corpo comprimido por um grid legado: apresentação corrigida
  somente quando o diálogo está aberto. Fechar restaura a visibilidade normal.

### Validação e limites

636 testes do jogo passaram; verificação de scripts/referências e auditoria de
5.922 variantes HEPT32 do gerador legado passaram (não validam a paleta dos PNGs).
Inspeção no navegador em perfil de teste separado do save oficial: lobby, Forja,
Árvore, Relicário, Pets, Pontuação, tutorial, Loja, player, Andares e Abismo.
Fixture com uma estrela no primeiro andar mostra uma dourada e quatro vazias.
As artes anteriores permanecem no histórico. Não houve benchmark em hardware
fraco; atlases e PNGs aumentam o custo inicial de carregamento. Nova música e
aprovação visual do usuário permanecem pendentes.

Fontes no Diorama: src/miner/refuge-motion-v3.ts, src/gear/miner-parts.ts e
sheets/characters/miner-refuge-v3/. No jogo: refuge-lobby*, refuge-polish-v3.css,
player-appearance, lobby-track, collected-gems, current-creature-art, pets-view,
rebrand-lift, lift-v2ab-model, descent-progress, abyss-v2y, tutorial e statue-view.
assets/refuge-night-v3/manifest.json registra dimensões, proveniência e hashes.
Evidências no workspace de autoria: outputs/gemventure-refugio-night-v3/.


## Revisão de 28/10/2026 — entrada direta e dungeon procedural v1

Implementação candidata para avaliação visual, sem declarar aprovação das novas artes.
O minerador v3 e as 21 criaturas são as famílias aprovadas do Diorama; não usar as
folhas anteriores da caverna como referência artística. A apresentação da hub v3,
a câmera, a progressão, as regras de combate e o shader existente foram mantidos.

### Entrada, capa e personagem

- `menu-entry.js` entra automaticamente no jogo após a preparação das imagens.
  Uma sessão nova chega à hub; uma expedição salva continua preservada. Não apagar
  uma partida em andamento só para mostrar a hub. Configurações continuam na
  engrenagem e voltam ao jogo, sem uma etapa de menu principal.
- `entry-loading.js` e `entry-loading-v1.css`: capa com mineração, notas musicais e
  criaturas atuais; marca oficial, percentual monotônico por conjuntos preparados,
  barra e corrida do minerador. Nenhum texto técnico durante o carregamento normal.
  A falha mantém uma mensagem curta e botão de tentar novamente.
- `dungeon-miner.js`: folhas v3 de quatro direções, idle/run/mine, sockets originais
  de mãos e ferramenta. As quatro folhas exportadas incluem walk para reutilização.
  Células 128 px, render de 64 unidades na camada em meia escala, âncora (64,96).
  Picareta usa o equipamento verdadeiro do jogador, não uma arma pintada no corpo.
- `dungeon-creatures.js`: 21 famílias, duas folhas por variante; salto, voo e rolagem
  acompanham a direção e o avanço já existentes. Cache limitado a dois biomas.
  A duração visual acompanha o passo do runtime; não redefine o relógio de combate.

### Materiais e ambiente

`dungeon-volumes.js` centraliza os sólidos da caverna. Cosmos64 e base de projeção
(44,0), (4,32), (0,-1), sem alterar o contrato HEPT32 dos geradores legados.
Volumes com topo, laterais, chanfros pequenos e brilho curto nas quinas superiores
voltadas à luz. Três silhuetas de rocha por bioma e quatro minerais semanticamente
coloridos (quartzo/rubi/topázio/esmeralda), com sete famílias de geometria.
As gemas coletadas continuam lapidadas e separadas dos depósitos de minério.

Sombras nativas seguem a pegada e altura dos blocos, projetadas para baixo/direita;
ficam no plano do chão e são pintadas antes de todas as faces. A versão experimental
que desenhava a sombra da tampa sobre a janela da lanterna foi corrigida/rejeitada.
Os quatro chefes com máscara de braços recebem sombra de sua própria silhueta.
Não se adicionou PBR, SSAO ou outro renderizador. A luz local é composição Canvas2D,
com máscara radial na escuridão e contribuição colorida; respeita a visibilidade
já calculada. A máscara integralmente opaca foi rejeitada por apagar as salas:
intensidade final 0,82, permitindo ler o espaço entre os focos de luz.

`dungeon-wall-finish.js` reaproveita contornos e oclusões do planejador de paredes.
Paredes com faces e remates, piso com conexões de 47 máscaras e manchas amplas.
`dungeon-environment.js` produz luminárias, pequenos grupos de borda e terrenos
contínuos. Água ondula; fósseis têm fraturas angulares e pó discreto; lava produz
anéis/brasas; micélio tem esporos; âmbar oscila lentamente; raízes têm ramificações.
Pausa e movimento reduzido congelam as animações ambientais.

As câmaras comuns passaram de raio horizontal 5–6 para 4–5 tiles; vertical 3–4
preservado. A árvore de conexões, caminhos extras, entrada e saída permanecem
alcançáveis. O ensaio 3–4 por 2–3 foi rejeitado por apertar excessivamente o mapa.
Arena dos chefes e lógica de streaming do Abismo não foram redimensionadas.

### Chefes, ícones e legibilidade

- Rei Geodo e Rei das Tocas preservam seus rigs existentes.
- Raiz, Fóssil, Místico e Micélio mantêm suas pinturas atuais e recebem pequenos
  movimentos rígidos dos braços por máscaras específicas, sem deformação elástica.
  São rigs 2D sobre imagens, não reconstruções completas de malha ou novas vistas.
- Barão Cenoura: cabeça, orelhas, dentes, mãos e cenoura em volumes orientados pelas
  coordenadas do mundo. Quatro direções; face ocultada atrás. A cenoura tem tamanho
  constante, e o impacto usa o aviso/VFX do combate existente. Faces que não tinham
  referência lateral completa são interpretações conservadoras, sujeitas a revisão.
- Não foi criado um chefe-sapo: o catálogo ativo de sete chefes não contém esse ator.
  Seu nome/ID precisa ser identificado antes de uma alteração específica.
- `ui-art.js`, `descent-icons.js` e retornos compartilham moeda, estrela e gemas v3;
  essência é um símbolo vetorial volumétrico próprio. Prévia de criaturas usa as
  imagens aprovadas. Texto de carta equipada recebe preenchimento claro explícito.
- A cabine da caverna usa volumes novos, mantendo posição e lógica de chegada.

### Validação e limites

644 testes passaram; após o acabamento visual, 22 testes focados repetidos passaram.
Checagem de 387 scripts e 1.566 referências locais passou antes dos últimos ajustes
simples de CSS/HTML. Sete biomas inspecionados na câmera real com seed 41001,
perfil de QA isolado; testes de layout cobrem 240 sementes. Capa e configurações
conferidas no navegador. Os recibos de hashes são de candidata, não aprovação.
A máscara clara de QA revela todos os tiles apenas para inspeção; não é publicada.

Os novos atlases ocupam cerca de 8,25 MiB em disco, com cache de biomas limitado;
a capa e a corrida da barra ocupam 2,28 MiB. Não houve benchmark em hardware fraco,
nem playthrough manual de todos os chefes. Mantêm-se os sons e a música existentes:
a nova faixa e seus créditos ainda aguardam o arquivo do usuário. A fidelidade
visual dos novos minerais, paredes e chefe direcional requer a avaliação do usuário.

Evidências e backup no workspace de autoria: outputs/gemventure-dungeon-v1/.


## Revisão de 28/10/2026 — integração da caverna, tutorial e música

Implementação solicitada sobre a candidata anterior, sem substituir motor,
projeção, paleta Cosmos64, rig corporal aprovado ou regras de combate.

### Interface e primeira expedição

`dungeon-refinement-v2.css` isola os seletores antigos que venciam o tema azul.
HUD, pausa, recuperação e configurações compartilham fundos escuros e bordas azuis.
Configurações preserva a cena atrás com desfoque. Cartas e continuar/voltar foram
conferidos em 1280×720: ações inteiramente visíveis, sem a segunda indicação de vida,
texto claro também em seleção/hover. Em telas estreitas o conteúdo permite rolagem.
O elevador oculta as famílias “ganhos por progresso” e “escolhas após concluir”;
seus panoramas têm blur de 9 px, sem modificar destinos, estrelas ou requisitos.

`refuge-onboarding.js` apresenta 19 passos com nome salvo, minerador em repouso,
Missões antes de Mina, instruções acionadas nos botões reais e visitas à Forja,
Árvore, Relicário e Vitrola. Não compra nem gasta recursos durante a apresentação.
Cada melhoria da Forja usa seu controle real. Texto simples, avanço manual e pular.
Treino de ritmo agora aponta para MINA e usa a sessão de prática existente.
Perfis existentes podem reabrir a apresentação no Tutorial; o progresso não é zerado.

`refuge-journey.js` e `stars.js` contabilizam as primeiras 30 estrelas conquistadas,
não apenas o saldo. O desbloqueio do Relicário permanece após gastos. A migração
considera saldo, gastos recuperáveis e relíquias possuídas; gastos antigos sem
registro não podem ser inferidos com certeza. Há uma apresentação contextual em
três passos após o desbloqueio. Nome, contagem acumulada e passos são persistidos.
Estrelas e essência aparecem também na carteira da hub. Missões usam ícones atuais.

### Personagens e cenário

A revisão de apresentação v4 mantém o corpo v3 aprovado, separando suas novas poses
na metadata. Mangas ficam atrás do tronco; mãos permanecem afastadas do rosto e
ombros/quadril/expressões mantêm a dança a 1,3×. Retrato e vestiário compartilham o
registro equipado. Os quatro clips originais aprovados da caverna não são regravados.
`dungeon-pickaxe.js` orienta a ferramenta pelo encaixe real da mão: cabo junto à
ponta da empunhadura, cabeça à frente, tamanho rígido e quatro direções verificadas.

`dungeon-volumes.js`: minerais agora têm hastes e pontas truncadas facetadas,
diferentes das massas de pedra. Lanternas têm suporte junto à parede, sombra curta
na parede e contribuição luminosa menor; não usam sombra de objeto sobre o chão.
`dungeon-environment.js`: líquidos animados por bioma, fóssil quente em contraste
com o piso ocre, contorno somente nas bordas externas do conjunto de tiles. Foi
rejeitado o contorno por tile, que criava uma grade sobre a água. Máscaras mais
escuras por família; relevo discreto nas marcas do piso. Trilhos físicos removidos;
trilho de ritmo e mecânicas permanecem. Decorações maiores usam bordas sem bloquear
corredores. `dungeon-fx.js` substitui chamas/explosões quentes por volumes; efeitos
frios já existentes permanecem. Não é uma afirmação de migração de todos os VFX.

`dungeon-bosses-v2.js` reconstrói Raiz, Fóssil, Místico, Micélio e Toupeira em peças
nativas com direção e movimento rígido. Geodo e Barão Cenoura preservam seus rigs
atuais; não houve nova mecânica de ataque. Ícones correspondentes no elevador.
`dungeon-hedgehog-v2.js` diferencia o ouriço e sua abertura rochosa, recortada pela
parede real. Novas artes são candidatas, não aprovação visual automática.
As folhas já separadas da árvore da hub oscilam com fases distintas; copa conectada,
tronco e raster aprovado permanecem. Não separam artificialmente folhas coladas.

### Música e verificação

Faixa fornecida: **In doubt — Hessel_vanO**. `recorded-home-track.js` toca o MP3
pelo barramento existente, pausa e retoma da posição real, sem tocar duas fontes.
Respeita volume, mute, combate e prévia da vitrola. Nenhuma licença ou titularidade
foi inventada. Créditos de nome/artista na fita existente da hub.

652 testes passaram, incluindo restauração/nome, 30 estrelas cumulativas, referências
de ícones, malhas direcionais, rigidêz da ferramenta, áudio pausa/retomada e chamadas
Canvas nos sete biomas. Check de 397 scripts e 1.588 referências passou. Inspeção
manual: apresentação inteira com perfil separado, treino com acerto, música decodificada
em reprodução, quatro direções da picareta, poses de dança, chefes/ouriço, caverna fóssil,
cartas e continuar/voltar em 1280×720. Recursos permaneceram intactos no tutorial.
Não houve benchmark em hardware fraco nem playthrough completo dos sete chefes.
A avaliação estética final continua com o usuário. Evidências, lista de arquivos e
backup ficam no workspace de autoria em outputs/gemventure-dungeon-v2/.


## 28/10/2026 — Caverna: contraste, identidade e apresentação v3

### Diagnóstico e correção do cinza

O passe `paintDungeonNight` em `dungeon-environment.js` desenhava uma máscara
azulada por `source-over` com alpha 0,82. A composição substituía grande parte das
cores por uma constante azul: até pixels pretos ganhavam luminosidade, comprimindo
a diferença entre faces claras e escuras. Isso explica o aspecto lavado observado;
a pedra cinza continua sendo um material cinza, não foi recolorida globalmente.
A inspeção de `screen-finish.js` e `global-screen-finish.js` não encontrou operação
de desaturação: o CRT suaviza, desloca canais e acrescenta linhas/vinheta. Removê-lo
sozinho não elimina o véu. Comparação visual com e sem CRT feita na mesma cena.

O passe noturno agora usa `multiply`, força 0,90, tintas da família de cada bioma;
pretos não recebem luz artificial desse passe. A revelação local preserva a
leitura perto do jogador (0,84), das lanternas (0,78) e de até 12 cristais visíveis
(0,36). Não revela áreas ocultas. O véu atmosférico foi reduzido à metade; CRT
compartilhado 0,90 → 0,45 e blur de fallback 0,45px → 0,225px conforme pedido.
Câmera, projeção, paleta, zoom e regras de visão não mudaram. Sem LUT, shader novo,
filtro global de saturação ou clareamento compensatório. Não aplicar outro
`source-over` opaco sobre o mapa para tentar obter escuridão.

Fontes consultadas: [Canvas compositing — MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation)
e [feColorMatrix — MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feColorMatrix).
A opção de adicionar saturação global foi descartada por não corrigir a causa.

### Refinamentos associados aos pedidos anteriores

- `dungeon-volumes.js`: cristais 1,38× mais largos e 1,26× mais profundos; altura
  0,93×, acentos Cosmos por família, branco reservado às quinas em vez de preencher
  toda a coroa. Pedras não foram aumentadas nem recoloridas.
- `world.js`: ouriço volta à arte anterior `hedgehog-master-v01.png` com rosto,
  patas, cristais e apresentação articulada já existentes. Preserva o recorte da
  parede e o novo acabamento da toca; o PNG original não foi editado.
- `geode-articulation.js` / `geode-rig.js`: máscaras de braços sobre o Geodo atual,
  ombros, preparação, impacto e recuperação alimentados pelos estados reais do
  combate. Apoio parcialmente oculto sob o punho completado com pequenas faces.
  Essa parte é inferida, não uma reconstrução de uma vista inexistente. Mantém
  câmera, dano, áreas, relógio e fonte raster; não é um modelo 3D completo.
- `boss-arena.js`: patamar central de baixa intensidade, lajes periféricas e
  contrafortes minerais com tema de bioma. Caixas projetadas evitam todos os tiles
  transitáveis; nenhum obstáculo ou limite de combate foi alterado.
- `boss-impact-audio.js` / `audio.js`: três amostras CC0 do Kenney, carregadas uma vez
  no AudioContext existente, até duas camadas por ataque e intervalo de 0,18s;
  respeitam SFX/mute e eventos reais. Falha no arquivo mantém os sinais sintéticos.
- `dungeon-pickaxe.js`, `dungeon-miner.js`, `cave-player-art.js`, `pickaxe-art.js`:
  mesma família de dez picaretas na mão e na prévia de upgrade. Cabo segue grip/eixo
  de cada quadro; lâmina usa face legível em 2.5D. Projetar tool-up diretamente como
  largura foi testado e rejeitado por colapsar a vista frontal em uma linha. A
  solução mantém o eixo/foreshortening do cabo com comprimento mínimo legível,
  não afirma reconstrução volumétrica exata da ferramenta.

### Verificação e limites

659 testes passaram; após o último ajuste de legibilidade da picareta, 18 testes
relacionados passaram novamente. Sete novos testes cobrem movimento ligado aos
estados reais do Geodo, ausência de mutação do combate, decoração fora dos tiles
transitáveis em 7 biomas × 3 seeds, áudio limitado/mute/falha e ferramentas sem
colapso nas quatro direções. Check passou: 403 scripts / 1.656 referências locais
(incluindo páginas de QA que não são instaladas no jogo). Três amostras de áudio
decodificaram no navegador. Não foi feita avaliação auditiva humana ou benchmark
em hardware fraco; qualidade estética e mix final aguardam avaliação do usuário.

Evidências no workspace `outputs/gemventure-refinement-v3/`:
`cave-old-lighting-same-camera.png` / `cave-after.png`: mesma seed 41001, câmera e
viewport 1280×720, nova geometria e CRT 50% em ambas, mudando o passe noturno.
Pequenas fases ambientais não estão sincronizadas; não usar como diferença pixel
por pixel. `cave-after-no-crt.png` isola o CRT na candidata. A captura inicial
`cave-before.png` tem outro viewport e é apenas registro histórico.
Não houve playthrough completo dos sete chefes. Restante das antigas solicitações
de UI/economia/vestiário não foi revisitado neste lote.

## 28/10/2026 — Fechamento dos ajustes de personagem, UI e caverna (v4)

### Arte e regras compartilhadas

Cosmos64, projeção da caverna, máscara noturna e CRT 50% permanecem. Em
`dungeon-volumes.js`, cristais têm raiz larga, haste central e duas inclinadas para
fora, com faces luminosas localizadas. Rochas porosas: patamares/cavidades; compactas:
volume largo com lasca; brutas: massas altas partidas. Sete biomas preservam famílias
cromáticas. Não variar cores aleatoriamente por bloco.

`dungeon-pickaxe.js` usa novamente PNGs CP2 aprovados de `PICKAXE_ART`, dez níveis
compartilhados com upgrade, normalizando somente o eixo do cabo. Sockets/orientação
aprovados preservados. A tentativa vetorial anterior foi rejeitada por parecer plana.

Minerador mantém corpo v3 e câmera da caverna. Hub usa apresentação frontal
(inclinação 8, atlas 512 px). Fontes Diorama: `src/miner/wardrobe-v5.ts`,
`src/gear/miner-parts.ts`, `sheets/characters/wardrobe-v5/`. `refinedSleeves` é optativo:
manga acompanha braço, cobre início da pele e não muda exportações históricas.
`miner-outfit.js` centraliza chapéu/blusa/calça/sapatos/óculos. Patinho e rosa estão
disponíveis; demais slots ainda só têm item clássico. Retratos, hub, vestiário,
carregamento, elevador e dungeon usam a seleção salva. Dança 1,5×; pausas 3–9s,
ações completas por seed sem repetição imediata. Movimento reduzido fica em repouso.
Não confundir aprovação histórica v3 com aprovação destes visuais novos.

### Economia e UI

`stars.js`: pontos/classificação reiniciam por andar; `totalPoints` mantém total da
expedição/estátua. Orçamento usa vida/recompensa da população inicial, multiplicador
máximo e margem rítmica; marcas 15/30/50/70/85%, janela de tempo por andar. Reposição
não aumenta orçamento. `floorStars` guarda recorde, paga só diferença: campanha nova
máximo 35×5=175. É orçamento determinístico, não prova de rota ótima; exige playtest.
`account-score.js` restaura cursor cumulativo mesmo após reset dos pontos do andar.

Essência não existe como moeda, ícone ou drop ativo. Única leitura em `core.js` migra
saldo antigo uma vez: 10 moedas por unidade e remoção do campo. Estrelas antigas são
preservadas com crédito legado contra repetição, podendo superar 175 em saves antigos.
Discos 0–6 estrelas, relíquia 4. Selos exigem estrelas conquistadas sem gastar saldo,
evitando bloquear progressão ao gastar moeda limitada. Drops comuns de bomba/cura/
escudo removidos; habilidades, cartas de recuperação do Abismo e itens já possuídos
continuam funcionando.

Márcia confirmou HUD `GV-EXPEDITION-HUD V05`, fonte:
`E:/assets GemVenture/production/gv-hud-v05-integrated-felipe-v1/candidate/`.
Markup, modelo, assets e estilos recuperados, ritmo no topo. Descanso R2 já integrado
foi preservado. Tutorial conserva seus alvos DOM. `completion-v4.css` define tamanho
das cartas desde primeiro quadro, sem ajuste tardio; loja azul R2. Elevador blur
8→4 e 9→4,5. `compact-talents.js` reúne 192 nodes pequenos em 18 grupos de efeito/setor,
preserva 25 habilidades, seis maestrias, custos/efeitos/pré-requisitos/IDs salvos.
Comprar escolhe próximo rank acessível. Seleção mostra conexões reais adicionais;
simplificar diagrama não remove regras do domínio.

### Salas, paredes e efeitos

`cave-layout.js`: câmaras menores ligadas por corredores de três células.
`cave-wall-occlusion.js`: altura 48/aro 4, ordenação com atores, alpha até 0,24 quando
encobre jogador com transição por proximidade. Nunca cortar a parede para revelar.
Raster estático por trecho/bioma em WeakMap; somente alpha varia por quadro.
`dungeon-wall-finish.js` preserva alpha do pai. Arenas e geração contínua do Abismo
permanecem. Slime 32→24 de largura. Escudo com faces translúcidas e aro localizado.

### Verificação e limites

Evidências no workspace `outputs/gemventure-completion-v4/`: hub, vestiário, árvore,
loja, cavernas cristal/fóssil, cartas 1280/1440, descanso e contato de minerais.
`outfit-click-qa.json`: cliques reais salvam/restauram patinho e rosa.
`qa-screens.json`: 120 frames de limites estáveis das cartas em cada viewport.
Perfis isolados: nenhum teste alterou save pessoal do jogador.

669 testes distintos passaram. Suíte integral: 668/669, único erro era recibo SHA
desatualizado da última correção de pontuação. Regenerado, 13 testes de arte/fechamento
passaram. Check: 411 scripts/1695 referências (inclui QA não publicado). Auditoria:
33 famílias, sete biomas, 5922 variantes, máximo 180 formas nas famílias migradas.
200 seeds validaram conexão e altura. Exportador portátil compilou, sem revisão
completa de todas as suas telas.

120 frames em floor11 revelado, Chromium headless 1440×900: baseline 240,38ms,
candidata 236,28ms por frame. Ambas lentas nesse ambiente: não comprova desempenho
satisfatório em máquina real ou ganho significativo. Sem playthrough de todos os
chefes nem balanceamento completo da economia. Qualidade estética aguarda usuário.

## 28/10/2026 — Leitura da expedição e minerador vivo (v5 / rig v6)

Implementação solicitada pelo usuário; nova aparência em avaliação, sem presumir
aprovação estética. Substitui as regras v4 de ritmo no topo e parede traseira inteira.
A Forja vigente é a referência explícita de painel, cores, fontes e proporções.

### Minerador nativo do Diorama

Fonte: `projects/gemventure-creatures/src/miner/living-motion-v6.ts`,
`articulation.ts`, `wardrobe-v5.ts` e `src/gear/miner-parts.ts` no Diorama.
`nativeIdle` e `defineClip` do rig existente; volumes reais e articulação em 3D,
exportados como atlas 2D para o Canvas do jogo. Não há novo motor WebGL nem modelo
Blender. O projeto já possuía rig: a rigidez vinha de poses e cabeça solidária ao
tronco, não de uma impossibilidade de animar volumes.

Cabeça/rosto/capacete/patinho compartilham pivô no pescoço e transformação rígida.
Yaw, pitch e roll próprios; quadril e ombros em contraponto. Mangas seguem o braço.
Idle de 7 s; dança de 6,4 s (1,5× sobre a frase original de 9,6 s), 192 quadros;
aceno 4,5 s; sentar/levantar 8 s. Respiração, piscadas e sorriso em tempos distintos.
Gestos começam/terminam em pé com envelope suave; pausas de 7 ou 14 s e ordem por
seed sem repetição imediata. Não é captura fiel da coreografia de um vídeo.

Quatro combinações atuais (amarelo/patinho × azul/rosa) geradas do mesmo rig. A nova
articulação só se ativa nas folhas living-v6; clips de mineração/corrida/caverna e
fontes históricas v3–v5 preservados. Para adicionar um gesto: registrar nome,
duração e drive em LIVING_CLIPS/livingPose, exportar as quatro roupas, auditar
juntas/limites e cadastrar o clip no consumidor. Não pintar roupa no corpo.

Atlas recortados de 512 para 320 sem reamostrar os pixels; pivô [160,288]. O recorte
mantém todos os quadros dentro da célula. O cartão usa o mesmo rosto/outfit.
Movimento reduzido mantém pose neutra. O runtime preserva pausa/aba oculta.

### Interface e cavernas

`gamefeel-v5.css` alinha os painéis à Forja. Ritmo compacto entre escudo e casa,
combo solto com pulso por acerto e cores por faixa; estrela extrudada girando em
trajetória até seu contador. Movimento reduzido evita rotação/pulso forte.
Missão mostra objetivo/quantidade; calor acima da exploração. Sem minimapa, andar,
marcador de elevador ou legendas de dano na HUD. Efeitos/cartas ficam junto às
estrelas usando rasters disponíveis. Saldo de estrelas ao lado das moedas.

Árvore: grupos existentes preservados, ramificações espaçadas, fundo cavernoso,
expandir/recolher, arrastar com botão direito e dois cliques para comprar respeitando
custos e dependências. Ícones de categorias reutilizam arte funcional do catálogo.
Novas passivas: Casca de prisma (2 batidas de proteção a cada 12 acertos de combo),
Bis de fôlego (+8, até 100, a cada 16). Só atuam após aprender; saves não ganham
habilidades automaticamente. Balanceamento em playtest ainda necessário.

Seis salas principais (antes nove) com corredores de três tiles, ligações mais
longas, entradas/saídas preservadas. Faces traseiras horizontais: altura 30 (dois
cursos); demais 48. Oclusão mantém parede e reduz alpha. Cristais: seção octogonal
chanfrada, haste larga, ombro em 67% da altura e ponta 18% da largura, com faces
consistentes de luz/sombra. Não mudam os materiais globais nem a mecânica mineral.

### Evidências e limites

`outputs/gemventure-gamefeel-v5/`: capturas 1440×900 e 1280×720, GIF do rig,
`runtime-motion.json`, `miner-rig-audit.json`, `miner-pack.json`, testes e recibo.
674 testes passaram; check 415 scripts / 1701 referências (inclui QA não publicado).
Auditoria de 5922 variantes em 33 famílias/7 biomas. A indicação 32 da auditoria
refere-se ao catálogo legado; famílias migradas continuam Cosmos64.
70 seeds novos validaram conexão; 601 amostras por gesto verificaram geometria
finita, transições e distância mão/cabeça (mínimo 5,46 unidades nos gestos ativos).
Vinte exportações nativas, quatro roupas, sem recorte. Reprodução Canvas conferida.

Não confundir validação geométrica com aprovação visual. Atlas maiores custam mais
memória decodificada; não há benchmark representativo em hardware fraco. Navegador
headless tem pausas por lentidão, não certifica 60 fps. Retarget de futuros gestos
exige nova auditoria. Não foi alterada a dança de criaturas nem feito playthrough
completo de todos os chefes.


## Revisão de apresentação 7 / gamefeel v6 — 29/10/2026

Substitui as dimensões e a ordem de apresentação descritas na revisão anterior,
sem reescrever seu registro. A Forja define fontes, cores, bordas e botões; cada
popup dimensiona seu conteúdo. Não impor 1180×780 a toda janela. Vestiário oferece
abas de capacete, blusa, calça, sapato e óculos; só a categoria ativa é desenhada.
Os controles de efeitos visuais mantêm radios nativos funcionais.

O runtime usa miner-living-v7: quatro outfits, oito clips cada, incluindo step
(6 s), sway (6 s) e look (5 s). Gestos começam/terminam neutros; sorteio usa bits
altos do gerador para evitar alternância artificial por paridade. Sem repetição
imediata; pausas 7/14 s, cabeça e rosto independentes preservados. Movimento
reduzido permanece neutro. Não alterar velocidade novamente: Jamal já é 1,5×.

A ordem de roupa é optativa para living: torso fornece a profundidade das peças,
manga à frente do braço, cintura/pernas atrás; canela avança ao dobrar sentado.
Bib e alças ficam ligados à camisa, sem aparecer como um quadrado isolado.
Históricos e sprites de caverna usam o caminho anterior.

Estrela extrudada gira em XY da imagem, não em yaw. Área da face permanece
constante; câmera/espessura preservadas. HUD anfitriã tinha regras de dois IDs
que sobrescreviam as fitinhas: v6 resolve a precedência para poderes/calor.

Geração: quatro salas principais, raio 6×5, corredores de cinco células e variação
horizontal de centro ±2. Entrada/saída e corredor protegidos antes da população.
Paredes de altura 30 em todas as faces, oclusão por transparência preservada.
Salas já salvas não são regeneradas. Drops durante a fase voltam ao contrato
original (gosma/poção, morcego/escudo, guardião/bombas e minérios específicos),
sem inseri-los no saldo permanente nem na listagem de recompensas do elevador.

Cristais: só rampas existentes no topo/corpo; geometria e silhueta preservadas.
Sem novo filtro global, blur ou mudança de paleta.

Fontes/regeneração: pack-living-v7.py, audit-living-v7.mts e os mesmos sheets
nativos living-v6 estendidos. Pacote e capturas em outputs/gemventure-gamefeel-v6.
Validação geométrica não substitui aprovação visual. Memória dos atlas ainda
precisa de avaliação em equipamento modesto; não declarar 60 fps sem benchmark.


## 29/10/2026 — Correção localizada v7

Preservar a imagem atual do ouriço. Sua toca integra a fila de profundidade em
`world.js`, imediatamente antes da linha de aproximação (y + 0,99). A parede
anfitriã fica atrás da abertura; o jogador na linha y + 1 fica à frente. O recorte
por piso caminhável permanece. Não remover paredes nem converter o espectador
para solucionar um defeito de ordenação.

`gamefeel-v7.css` define o enquadramento das cartas antes de sua exibição; não
medir a tela e reajustá-la depois que imagens carregarem. Escolha e continuação
compartilham faixa de saque e altura externa. Conteúdo que exceda o espaço possui
rolagem, sem omitir recompensas ou controles. Confirmações pequenas usam altura
pelo conteúdo e o padrão de fonte/botões da Forja, não a largura da janela dela.

No elevador, o host ocupa toda a altura útil da janela, sem herdar o limite de
altura dos diálogos comuns. Conservar as abas e o acesso à ação de descida por
rolagem. O pop-up de melhoria de missão permanece no fluxo de seu painel, nunca
fora da janela. Custos e condições são os originais.

O ícone do relicário gira em XY, mantendo a face visível. Não usar rotateY em
sprites planos. Preservar o movimento reduzido e a estrela extrudada de coleta.
Evidências de comparação e validação: outputs/gemventure-gamefeel-v7. Esta revisão
não muda câmera, paleta, filtros de ambiente ou modelos aprovados.


## 29/10/2026 — Veios de cristal: referência em seis prismas (v5)

O usuário aprovou os seis prismas de topo largo e plano reconstruídos a partir
da referência enviada neste chat. Preservar a geometria, os chanfros, o azul
escuro e a câmera gemventure-cave-v1. Ajustes finais autorizados: contorno fino
(0,38 na célula 100×110), pedra escura um pouco maior e ausência de pontos brancos
nas quinas. O reflexo usa a cor clara da própria família, sem clarear o corpo.

A pedra acompanha o casco convexo das raízes com margem de 1,2 unidades.
Não reduzir a base até deixar as raízes sem suporte. Não voltar ao pedestal
claro, à cobertura irregular ou às coroas pontudas rejeitadas nos estudos.
Quatro rampas Cosmos64: quartzo azul, rubi rosa/roxo, topázio dourado e esmeralda
verde; materiais compartilhados por face, sem variação tonal aleatória.

Fontes ativas: crystal-vein-data.js (geometria compilada do estudo procedural),
crystal-veins.js (rampas e variações limitadas por seed), dungeon-volumes.js
(entrada de mineração), world-crystals.js (entrada de compatibilidade).
Não executar operações booleanas nem carregar Paper no navegador. Formas estáticas
e contornos são compilados; o jogo reutiliza os caches limitados existentes.
Canvas e SVG respeitam strokeWidth por forma e não preenchem contornos vazios.
As variantes de escala são pequenas, uniformes e fixas por seed/bioma, sem tempo
de animação no identificador do cache.

Reutilizar os mesmos veios nos objetivos do quadro e da HUD (miner/quartz/prism/
geode/vital). Não substituir as gemas lapidadas usadas como recursos coletados,
saldos ou recompensas. Monstros com cristais e ilustrações de cenário compostas
não são automaticamente regenerados por esta troca de família.

Validação: 681 testes existentes/novos passaram; verificador do projeto passou;
auditoria procedural passou em 5.922 combinações, máximo de 180 formas entre
todas as famílias. Capturas da renderização World real em sessão QA isolada:
gruta azul/seed 41001 e fósseis/seed 55. Exportação portátil gerada sem erros.
Não foi alterado o save, gameplay, recompensa ou filtro de iluminação global.
Limite: sem benchmark de FPS em hardware fraco; os testes não representam
aprovação automática de novas versões. Evidências e recuperação no pacote
outputs/gemventure-crystal-polish-v5 do workspace Diorama.


## 29/10/2026 — Faíscas de mineração e veios encantados por bioma

Preservar integralmente a geometria, as quatro rampas Cosmos64 e o contorno
aprovado dos veios v5. Acertos que realmente removem vida do cristal emitem
metadados de mineral no evento hit, usados pelo Effects para cinco faíscas
curtas da própria cor. Duração de 0,24–0,328 s; movimento reduzido: duas faíscas
em 0,18 s. Sem flash branco, anel de impacto genérico ou tremor adicional de
câmera para esse acerto. Dano de outros alvos conserva a apresentação anterior.
As listas de partículas permanecem limitadas e usam o relógio de apresentação
existente; pausa e rolagem do Abismo continuam sendo controladas pelo Effects.

Veios rare recebem halo local discreto e três brilhos facetados assíncronos na
cor clara da própria rampa. O efeito é desenhado antes do mineral, sem encobrir
as faces. Movimento reduzido mantém aura e brilhos estáticos; a pausa congela
o relógio ambiental existente. Não usar o antigo marcador dourado universal.

Fonte mineral característica, reaproveitada do mapa primário vigente:
Grutas de Cristal → quartzo; Floresta Esquecida → esmeralda; Fósseis → topázio;
Coração do Manto → rubi; Micélios → esmeralda; Âmbar → topázio; Hortas → esmeralda.
materials.biomeMineral é a referência compartilhada. floorMinerals continua
variando o foco e os pesos dos veios comuns por andar; essa distribuição não
foi rebalanceada nesta correção.

Causa corrigida: frenzy criava um topázio e depois sorteava outro kind, mantendo
resistência e valor do tipo anterior. Agora escolhe o mineral do bioma antes de
spawnCrystal. Mantidos duração de 48 pulsos, intervalo de 72 após o desafio,
multiplicador ×3, pagamento proporcional ao dano e proteção contra coleta
duplicada. O evento sprout acompanha a posição final do veio. Veios já presentes
em saves não são reescritos ou recoloridos retroativamente.

Módulos: materials, frenzy, core, effects e rare-ore-vfx. Sem API gráfica nova,
mudança de shader global, geometria, ícones de gema, carteira ou formato de save.
Verificação: 686 testes passaram; check passou; inspeção no renderer World real
com golpe efetivo nos biomas cristal e manto, mais movimento reduzido. Origem QA
isolada, sem ler/gravar o save do jogador. Capturas impact-blue.png,
impact-manto.png e reduced-motion.png em outputs/gemventure-crystal-effects-v1
do workspace Diorama. Não há medição de FPS em equipamento modesto nem aceite
artístico automático atribuído a esta revisão.


## 29/10/2026 — Partículas do bioma, orientação da picareta e rubi vermelho

A rampa atual do rubi substitui a anterior rosa/roxa, por pedido do usuário:
Cosmos64 #ce2029 (topo), #9c3824 (face iluminada), #591d35 (sombra),
#f27f72 (reflexo). A geometria v5, a base e o contorno de 0,38 permanecem.
O SVG de veio das missões acompanha a rampa, assim como as faíscas de mineração
e a aura rara que já consultavam CRYSTAL_VEIN_RAMPS. As gemas coletadas continuam
como família separada. Não usar branco no reflexo nem clarear todas as faces.

Partículas ambientais passam de sete pontos sempre ciano para 22 pontos na cor
DUNGEON_MATERIALS[bioma].light. Raios 0,85–1,5; opacidade 0,34–0,64; halo
curto a 13% da opacidade do núcleo, composição screen. Distribuição derivada
da seed, fases assíncronas e movimento lento, sem consumir o RNG do gameplay.
Cobrir o viewport da câmera para não perder os pontos ao avançar pelo mapa.
O relógio ambiental existente congela em pausa/aba oculta. Movimento reduzido
desliga esses pontos, preservando a política anterior. Luz, filtro, saturação
global e DUNGEON_NIGHT.strength=0,90 permanecem inalterados.

Encaixe da ferramenta: preservar o eixo grip→axis e a largura legível de 0,65.
Escolher o sinal do eixo transversal pelo tool-up projetado; o perpendicular
fixo anterior invertia o lado da cabeça em S/E. W/N mantêm sua orientação.
Usar os dez modelos aprovados da Forja, sem repintar imagens ou mudar sockets,
proporções, pose e escala do minerador. A mesma regra atende todos os clips.

Validação: 699 testes passaram; check passou (421 scripts, 1.558 referências).
Verificados todos os clips/direções no teste de orientação, sete biomas e três
seeds na distribuição de partículas, cor do rubi no mineral/SVG/faísca/aura,
além da comparação visual pela renderização real. Capturas: comparison-blue.png
e comparison-manto.png; quatro vistas e picaretas 1/10 inspecionadas, modo
reduzido conferido. Exportação portátil gerada. QA isolado, sem acesso a saves.
A primeira rodada de testes capturou uma atualização simultânea do recibo da
UI; a rodada completa seguinte passou após estabilização, sem mexer nessa UI.
Sem benchmark de FPS em hardware modesto. Evidências, fontes e recuperação em
outputs/gemventure-biome-pickaxe-ruby-v1 no workspace Diorama.


## 29/10/2026 — Névoa baixa, sombras das paredes e globo de combo

A camada cromática e a escuridão anteriores permanecem intactas, incluindo
DUNGEON_NIGHT.strength=0,90. A névoa é uma camada separada sobre o piso e abaixo
dos atores e avisos: seis faixas suaves, opacidade máxima 0,055, material na cor
light do bioma, sem cinza/branco. Posições partem de células reais de piso, com
fases derivadas da seed; amplitude 12/5 e velocidades lentas 0,08/0,06 rad/s.
Rejeitada a distribuição apenas no retângulo do mapa: parte da névoa caía nos
vazios e era inteiramente cortada, perdendo presença. Texturas de 256×64 são
reutilizadas (no máximo sete), com contorno do chão em cache e recorte evenodd.
A névoa não cobre paredes, HUD, personagens ou avisos e não revela regiões
inexploradas. Pausa/aba oculta usam o relógio ambiental existente; modo suave
fixa as fases. Sem aumentar a intensidade do antigo filtro.

Sombras: usar as faces efetivamente desenhadas por occludingWallPlan, altura
atual de 30, sem encurtar paredes nem mudar a oclusão que revela o minerador.
A direção em mundo acompanha os sólidos nativos: x=0,24H, y=0,12H. Na projeção
do piso, deslocamento (0,250909H; 0,087273H), limitado a 12/6. Cast e contato
usam caminhos unidos por camada, com orientação consistente, evitando somar
opacidade nas emendas. Multiply com rock[2] do bioma: 0,28 na projeção e 0,22
no contato curto de 1,5/0,55. Todo resultado é recortado ao piso real; depois
recebe os efeitos de visibilidade e iluminação existentes. Não é shadow map
nem cálculo de luz em tempo real por fonte: a direção principal é estilizada.

Combo: removidas as três elipses coloridas presas ao centro da câmera. A partir
de 50, globo esférico de facetas espelhadas acompanha o minerador na fila de
profundidade do ator: centro (+20,-53) a partir da âncora do chão, raio 8–11.
Parametrização esférica com seis faixas por doze segmentos, metade visível;
faces prateadas e reflexos Cosmos ciano/rosa/dourado/verde. Giro lento e cores
com transições suaves, sem flashes sobre a tela inteira. Reflexos são pequenos
quadriláteros no piso, não os círculos anteriores. Energia cresce de 50 a 250,
com teto de custo: até 16 reflexos e 14 partículas locais. Partículas ambientais
na cor do bioma crescem de 22 para até 36, raio máximo 1,8 e opacidade até 0,8.
Os pulsos em anel de cada cinco acertos permanecem abaixo de 50; depois cedem
lugar ao globo. O multiplicador, ritmo, missões, estrelas e economia não mudam.
Ao perder o limiar ou concluir a sala, o globo desaparece. Modo suave mantém
somente a esfera estática, sem reflexos móveis, partículas locais ou flashes.
O pulso musical do globo também congela durante a pausa.

Arquivos: cave-depth.js, combo-disco.js, world.js, dungeon-environment.js,
effects.js e lista de módulos do export-art-studio.mjs. Testes e recibo em
cave-depth-disco.test.mjs e fixtures/cave-depth-disco-v1-contract.json.
704 testes passaram; check passou; auditoria de 5.922 combinações de assets
passou; exportação portátil regenerada. Teste de sombra: 21 mapas (sete biomas,
três seeds), sem alterar máscaras; demais testes cobrem limiar, limites,
seguimento, fases, modo suave e restauração de contexto. A auditoria de assets
não certifica a aparência da névoa. Conferência perceptiva em World real em
origem QA isolada: Cristal/Manto, combo 0/50/150/250, movimento e modo suave.
Capturas antes/depois com seed 41001, câmera e instante 4 iguais em combo zero.
O baseline usa somente o World anterior arquivado, com dependências existentes;
sem gravar saves e sem substituir a aba do jogador. Sem benchmark de FPS em
hardware modesto; aceite artístico continua com o usuário. Recuperação e
evidências em outputs/gemventure-cave-depth-disco-v1 no workspace Diorama.


## 29/10/2026 — Correção: iluminação de balada, sem globo físico

A referência humana ao globo era sobre sua iluminação. A esfera visível da
primeira candidata foi rejeitada e removida, inclusive sua geometria e chamada
na fila do minerador. Não usar a seção anterior como autorização para reinseri-la.

O efeito vigente é um campo de quadrados coloridos orbitando a posição do
minerador, a partir de 50 de combo. Entre 50 e 250: dez a 24 projeções, tamanho
4,5–8,9, alcance 24–132, opacidade máxima 0,48, cores Cosmos ciano/rosa/dourado/
verde. Movimento contínuo de 0,25–0,32 rad/s; rotação individual dos quadrados
e variação suave no pulso musical. Halo discreto a 14% da intensidade da projeção.
O padrão traduz junto com o personagem, não com o centro da câmera.

No piso, os quadrados respeitam a projeção da caverna e o recorte do terreno.
Nas paredes, o mesmo campo é recortado à face real, com sua inclinação e o
mesmo fator de transparência que revela o jogador. A etapa ocorre junto da
parede na fila de profundidade. Nenhuma projeção é desenhada no vazio ou na
HUD. É iluminação estilizada por composição screen, sem luzes 3D por fonte.

Mantidos névoa, sombras direcionais, materiais, câmera, 22–36 partículas na
cor do bioma, limiar e crescimento do combo, regras e economia. Removidas as
partículas antes desenhadas pelo objeto do globo; as ambientais continuam.
No modo suave não há quadrados móveis ou objeto substituto. Relógios e pulso
seguem a política de pausa já existente. O efeito fica limitado em combo alto.

Arquivos: combo-disco.js e world.js, com testes e recibo atualizados.
Verificação: 704 testes e check passaram; exportação portátil regenerada.
Conferência no World real em Cristal e Manto, combos 150/250 e modo suave,
na origem QA isolada, sem usar o save do jogador. Capturas lights-blue-150.png,
lights-manto-250.png e reduced-motion.png. Recuperação, baseline por hashes e
fontes em outputs/gemventure-combo-lights-v2 no workspace Diorama. Sem benchmark
de FPS em equipamento modesto; testes não substituem o aceite artístico.


## 29/10/2026 — Balada sincronizada ao pulso musical

Direção confirmada: somente iluminação, sem globo físico. O usuário aprovou as
projeções e pediu flashes fortes, aleatoriedade a cada batida e mais partículas.
A oscilação lenta por segundos da v2 foi substituída: não usar seno ambiental
para simular a batida. Usar beatPhase(musicFloor(run),elapsed), o mesmo relógio
que governa áudio, comandos e trilho de ritmo. Isso inclui faixas comuns/chefes
e a aceleração/desaceleração por frase; não recalcular por um BPM fixo isolado.

Há exatamente um flash por pulso inteiro: pico 1, queda suave de potência
1,35 durante os primeiros 0,4 pulsos e zero no restante. O padrão muda no começo
da batida. O hash da seed da sala e do índice do pulso controla posições, ângulos
e cores; o padrão fica imóvel durante a mesma batida, acompanhando apenas a
posição do minerador e a progressão do combo. Não usar Math.random por frame
nem gerar novos padrões pelo tempo ambiente. Ajustar só arredondamentos menores
que 1e-8 no limite de batida para eliminar erros numéricos, sem adiantar o pulso.

De 50 a 250 de combo: 18–40 quadrados, opacidade de pico 0,576–0,8, tamanhos
4,8–10,0, alcance radial até 155; halo a 22% da opacidade e sem brilho branco.
Seis cores existentes Cosmos64: ciano, rosa, dourado, verde, vermelho e laranja.
As projeções continuam recortadas ao piso/faces de parede, preservando oclusão
e a fila de profundidade. A luz fica abaixo dos avisos/atores/HUD.

Cada pulso emite também 12–30 partículas facetadas coloridas, raio 1,2–2,3.
O movimento e a dissipação derivam da fração da batida; desaparecem após 0,72
pulsos. As 22–36 partículas ambientais anteriores permanecem. Nada acelera o
RNG do jogo, a música, o combate, recompensas ou o relógio ambiental. Névoa,
sombras, geometria, câmera e filtros anteriores estão preservados.

Pausa e aba oculta congelam a fase; mudança de contexto (tentativa/andar/seed)
reinicia a referência musical, inclusive quando a nova sala abre pausada. Modo
suave retorna zero flash, quadrados e partículas de pulso; não acrescentar
subdivisões estroboscópicas entre batidas.

Fontes: combo-disco.js e o encaixe World. Testes: combo-beat-v3.test.mjs,
cave-depth-disco.test.mjs e recibo aditivo combo-beat-v3-contract.json, mantendo
a cadeia de alterações de UI concorrentes. Verificação: 709 testes e check
passaram; exportação portátil gerada. Cobertos todos os 14 temas comuns/chefes,
limites das frases, agenda real Music.update em teste, 116/152 BPM e acelerações,
repetibilidade, seguimento, pausa/aba oculta, mudança de sala e limites de custo.

QA World real na origem isolada 4192, seed 41001, sem ler/gravar save do jogador.
Controles permitem ouvir a música real e comparar pico, intervalo e próxima
batida. O harness usa attachAudioMix/refresh como o jogo, sem preferências
persistidas; corrigida a conexão de áudio inicialmente ausente apenas na prévia.
Capturas beat-8-peak.png, beat-8-interval.png, beat-9-new-layout.png,
crystal-accelerated-120bpm.png, manto-accelerated-158bpm.png e reduced-motion.png.
A evidência de sincronização é de relógio/agendamento e renderização, sem medir
latência acústica de alto-falantes/monitor nem FPS em equipamento modesto. Aceite
artístico permanece com o usuário. Fontes, logs e recuperação em
outputs/gemventure-combo-beat-v3 no workspace Diorama.


## 30/10/2026 — Combo livre e celebração promocional v1

Pedido específico: o combo deve ser texto destacado, sem caixa, com preenchimento
colorido e impacto maior nos marcos. Não aplicar a regra de painéis a esse
contador. O diagnóstico encontrou a superfície azul de hud-notices.css sobre
o comboBurst e cores fixas/concorrentes no contador nativo.

Apenas apresentação: combo-impact.css remove a classe panel só do combo e
anula sua superfície/pseudo-molduras, preservando as demais UIs. COMBO e número
usam a fonte GV R2 Display/Fredoka existente, contorno legível, cor no próprio
preenchimento e brilho da mesma família. A cor avança a cada acerto usando as
seis cores já existentes no gamefeel-v5, sem adicionar cores ao catálogo.
Número-base 84 px; título 25 px; valores longos têm orçamento menor.

Cada acerto pulsa o conjunto. O brilho de repouso usa a fase musical já
entregue por run.frame ao HUD, sem relógio musical independente. Os marcos
continuam ocorrendo nos mesmos múltiplos de cinco e na mesma agenda musical:
celebração com recorte radial, legenda/número livres, entrada com impacto e
viagem do número até o retângulo real do contador. Pop de 1000 ms; voo de
640 ms após 360 ms. A chegada dá um novo acento sem reescrever combo,
pontuação, cor atual ou recompensas. No máximo um clone por HUD; troca de
marco substitui o anterior; retorno/descida/destruição cancelam, pausa mantém
o quadro, aba oculta limpa o voo. Modo suave/preferência do sistema usam
fade de 650 ms sem clone/viagem nem oscilação forte.

Módulos: gamefeel-v5.js (somente prefixo de combo), hud-markup.js,
expedition-hud-view.js, run.js, combo-impact.css e link em index.html.
Preservados literalmente o gerador/voo das estrelas, a iluminação disco
combo-beat-v3, World, câmera, paleta, sons de marco e todas as regras de jogo.
Não registrar esta apresentação como nova aprovação artística automática.

Validação: 721 testes passaram; npm run check passou (429 scripts, 1662
referências locais). Seis testes novos cobrem cor por acerto, inteiro pulsando,
trajetória, cancelamento/limite de clones, pausa, modo suave, limpeza,
chegada sem restaurar valor antigo e conservação das estrelas. QA usa o HUD
nativo e World, seed 41001, sem ler/gravar saves. Comparação antes/depois em
1280×720; verificadas também 1366×768 e 1920×1080. Computado: em 51 e 52,
palavra/número/preenchimento passam respectivamente a #f27f72 e #db5ebe;
superfície transparente, borda zero, pseudo-painel ausente. O centro do voo
chega a menos de 0,2 px do alvo no quadro 980 ms. Modo suave sem clone
e brilho de batida zerado. Não houve medição de FPS em hardware modesto
nem audição na QA de HUD; a chamada sonora existente foi preservada.

Capturas: before-50-pop.png, after-50-pop.png, after-50-flight.png,
after-250-1366.png e after-50-flight-1920.png no pacote
outputs/gemventure-combo-impact-v1 do workspace Diorama. Prévia isolada:
/qa-combo-impact-v1.html (4192), com acerto, marco e avanço de quadro.
Rejeitado: manter a placa azul ou trocar só a sombra — ambas impediam
a hierarquia e o preenchimento colorido solicitados.


## 31/10/2026 — Nitidez do minerador na caverna, revisão optativa 6

Pedido: o protagonista tinha leitura mais suave que o cenário e a cabeça ficava
estreita ao olhar para direita/esquerda. O consumidor real é `dungeon-miner.js`,
chamado por `drawCavePlayer`, com quadros antigos de 128 px em `miner-wardrobe-v5`.
Não foi usada a aparência de apresentação/lobby como fonte da caverna.

A revisão nativa `characters/cave-detail-v6` é exportada pelo Diorama com a mesma
câmera `gemventure-cave-v1`, materiais Cosmos64, rig, poses, duração, mãos, pés e
sockets. Cada célula passa a 256 px; o runtime mantém exatamente 64×64 unidades,
origem lógica (64,96), escala 0,5 e encaixe da ferramenta. Os atlas têm oito colunas
e linhas por direção; lados máximos de 4096 px. Só idle/run/mine são decodificados,
que são os clips efetivamente usados pelo consumidor. Não decodificar o walk
histórico, que não é selecionado nesse caminho, evita carregar um atlas extra.

`wardrobeCharacter(...,detailedCave=true)` opta por essa exportação; chamadas antigas
permanecem com sua geometria e densidade originais. `articulatedHead` aplica fator
1,14 ao eixo anatômico de profundidade somente em W/E e somente com a flag
`caveProfileDepth`. Face, orelhas, cabelo, capacete clássico e capacete de patinho
usam o mesmo referencial; não houve esticamento do PNG inteiro, troca de câmera,
mudança de tronco ou deslocamento da picareta. Não habilitar essa flag no lobby.

Prova: frente S e costas N são idênticas pixel a pixel ao controle do modelo
anterior exportado na mesma densidade. Em repouso, os perfis W/E passam de 70 para
79 px de largura total na célula de 256, mantendo seus limites verticais. Esse
número projetado não é o mesmo que o fator de profundidade geométrica. Todos os
sockets e tempos dos 12 atlas das quatro roupas foram comparados com o runtime.
Empacotamento não recorta nem reescala os pixels nativos. Amostragem suave em
qualidade alta usa esses novos quadros; nenhum filtro global foi modificado.

Evidências no workspace Diorama: `outputs/miner-cave-detail-v6/atlas-report.json`,
comparação antes/depois, mineração com patinho/rosa e capturas da caverna real nos
andares 1 e 16, seed 41001. QA isolada em 4212 sem escrita de save. A revisão está
aplicada no jogo local por solicitação direta; aprovação perceptiva final do usuário
continua pendente. Fontes antigas, cartões da biblioteca e mídia aprovada preservados.
Não houve publicação no Itch.io, alteração de economia, colisão ou gameplay.

Não adotado: esticar todo o ator, mudar o zoom/câmera, desligar globalmente a
suavização ou afiar bordas por um filtro. Essas opções deformariam os outros
componentes ou mudariam o acabamento do cenário.

## 31/10/2026 — Picareta: encaixes da esquerda e da frente, revisão 7

Escopo confirmado pelo usuário: corrigir esquerda (W) e baixo/frente (S), mantendo
direita (E) e cima/costas (N). A nitidez e a profundidade lateral da cabeça da
revisão 6 foram aprovadas explicitamente; essa aprovação não inclui os encaixes
antigos da ferramenta nem constitui aprovação antecipada da revisão 7.

`src/miner/cave-tool-pose-v7.ts` corrige somente os braços e os sockets S/W.
W usava a mão distante da câmera: os drives dos braços foram espelhados e o grip
passou à mão próxima, na frente da barriga, com altura equivalente à E aprovada.
S aproxima as mãos do eixo frontal em repouso/preparação e recompõe a pegada
no cabo durante o golpe; preserva o movimento principal do corpo. Em
`dist/dungeon-miner.js`, `dungeonToolBasis` recebe a direção e usa o eixo frontal
autorado em S também no repouso. O blend antigo cancelava sua componente vertical,
deixando a ferramenta de lado. Nenhum ângulo global ou espelhamento de PNG foi usado.

Opt-in nativo: sexto parâmetro `correctToolPose` de `wardrobeCharacter`; folhas
`sheets/characters/cave-tool-v7/<outfit>/{idle,run,mine}.ts`. Chamadas anteriores
continuam intactas. Doze novos atlas de 256 px, quatro roupas, mesma célula lógica,
âncora, escala, câmera, Cosmos64, luz e tempos. Ferramentas dos dez tiers existentes
continuam sendo desenhadas por `dungeon-pickaxe.js`; suas artes não foram alteradas.
As exportações históricas da revisão 6 permanecem preservadas.

Validação: 1040 quadros nativos sem recorte; E/N idênticos pixel a pixel e sockets
idênticos em todas as roupas/clips. Cabeça/centro e tempos preservados em todas as
direções. Quatro testes locais e três novas regressões oficiais; suíte oficial com
798 testes aprovados. Verificação oficial: 467 scripts, 1739 referências locais,
status ok. Auditoria de arte: 33 famílias, sete biomas e 5922 variantes verificadas.
Comparação visual isolada e caverna real nos andares 1 e 16, seed 41001, sem salvar.
Evidências: `outputs/miner-cave-tool-v7/` no workspace Diorama. Aplicada ao jogo local;
não publicada no Itch.io. A avaliação perceptiva final desta revisão cabe ao usuário.

Limitação das verificações: o typecheck do projeto Diorama passou. O comando amplo
`npm run check -- gemventure-creatures` continua com alertas/regras preexistentes:
função em `sheets/base/refuge-tree-v2.ts`, sete literais de cor e quatro arquivos
de animação sem suas folhas. Nenhum desses itens foi introduzido ou alterado neste
recorte; não foram corrigidos incidentalmente. O teste numérico não certifica a
preferência visual por uma pose. Não houve mudança de save, economia ou combate.

### Aprovação humana da revisão 7 — 31/10/2026

O usuário aprovou explicitamente a prévia v7 e autorizou sua aplicação no jogo real. Conferência dos dois módulos e dos doze atlas confirmou igualdade integral com a versão já instalada em dist/. Estado: aprovada e aplicada ao jogo oficial local. Direita e cima preservadas. Os 798 testes e a revisão visual anteriores continuam válidos, pois a geometria e o runtime não foram alterados após a aprovação. Publicação no Itch.io não faz parte deste aceite.
