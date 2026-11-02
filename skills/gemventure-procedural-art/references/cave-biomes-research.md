# Biomas e pesquisa aplicada às cavernas

Pesquisa consultada em 31/10/2026. Fontes descrevem seus próprios jogos e ferramentas;
as recomendações para GemVenture abaixo são síntese de projeto, não declarações dos
autores sobre este jogo. Não copiar sprites, layouts, modelos ou números de balanceamento.

## Referências que fundamentam decisões

| Fonte primária | Princípio extraído | Tradução e limite no GemVenture |
| --- | --- | --- |
| [Sébastien Bénard, The Level Design of Dead Cells](https://deepnight.net/tutorial/the-level-design-of-dead-cells-a-hybrid-approach/) — lead designer, relato do próprio sistema | Salas com propósito e um grafo de organização antes da montagem espacial. O autor também comenta limitações da tentativa inicial e revisão posterior. | Usar função/portais e sequência para controlar geração; o jogo é plataforma lateral, portanto não importar dimensões nem mobilidade. |
| [Ghost Ship Games, Below Decks: Cave generation](https://store.steampowered.com/news/posts/?enddate=1725619604&feed=steam_community_announcements) — anúncio de 06/09/2024, seção Deep Rock Galactic | Moldes de câmaras, variação e conexão; biomas também orientam superfícies e ambientação. | Favorecer salas reconhecíveis e gramática ambiental. Seu 3D escavável e ferramentas de travessia não justificam túneis apertados ou desníveis aqui. |
| [Ryan Clark, Finding the beat in Crypt of the NecroDancer](https://www.gamedeveloper.com/audio/game-design-deep-dive-finding-the-beat-in-i-crypt-of-the-necrodancer-i-) — criador | A justiça percebida guiou a experimentação do ritmo. | Conferir se espaço, sinal e reação apoiam decisões no pulso. Não transferir sua janela de acerto ou substituir a mecânica rítmica atual. |
| [Olle Håkansson, The digging mechanic in SteamWorld Dig](https://www.gamedeveloper.com/design/game-design-deep-dive-the-digging-mechanic-in-i-steamworld-dig-i-) — lead designer | Escala dos blocos, movimento e testes mudaram o acesso e a sensação da escavação. | Validar conforto da ação central antes de defender uma estrutura existente; não importar salto/plataforma ou adicionar habilidades para compensar uma caverna ruim. |
| [Tiled, Using Terrains](https://doc.mapeditor.org/en/stable/manual/terrain/) — documentação oficial | Regras de encaixe por cantos, lados e combinações. | Declarar assinatura de vizinhança e cobertura; uma tabela completa não prova qualidade artística ou circulação. |
| [BorisTheBrave, Tileset Roundup](https://www.boristhebrave.com/2013/07/14/tileset-roundup/) — autor de ferramentas de geração | Distinguir modelos de autotiling e os casos de borda que representam. | Usar como vocabulário técnico; não impor um atlas plano ao paredão contínuo atual. |
| [Maxim Gumin, WaveFunctionCollapse](https://github.com/mxgmn/WaveFunctionCollapse) — implementação original | Gerar combinações a partir de padrões e restrições de adjacência. | Ferramenta possível para acabamento local; demonstrar alcance global separadamente. WFC não é uma solução automática de level design. |
| [Green et al., Two-step Constructive Approaches for Dungeon Generation](https://www.antoniosliapis.com/papers/two_step_constructive_approaches_for_dungeon_generation.pdf) — artigo dos autores, FDG 2019 | Separar arquitetura e população, avaliando combinações e diferentes perfis. | Medir espaço vazio e povoado; uma simulação limitada não certifica experiência humana. |

Como contexto de comunidade, a discussão no próprio blog de Bénard inclui resposta
do autor sobre evolução do método. A tabela blob citada pelo Boris aponta ao
TIGSource, mas o acesso retornou 403 nesta pesquisa: **não foi revisada diretamente**.
Não atribuir consenso ou eficácia a fóruns por popularidade. Buscar explicação,
projeto reproduzível e autoria; relatos de jogadores levantam hipóteses de conforto,
que precisam de verificação no jogo.

## Gramática ambiental por bioma

Primeiro confirmar nomes, regras e paletas nas fontes atuais (`campaign.js`,
`cavern.js`, `dungeon-volumes.js` e decisões artísticas posteriores). Não acrescentar
bioma, recurso ou perigo para enriquecer a decoração. Os tratamentos abaixo são
**propostas de linguagem não jogável**, não arte aprovada nem novos efeitos de solo.

| Bioma existente | Massa e superfície propostas | Ambientação sem coleta | Limite de leitura |
| --- | --- | --- | --- |
| Grutas Rochosas | Câmaras amplas, estratos largos, fraturas espaçadas e recuos | Pequenos apoios minerais integrados, nichos e vestígios de trabalho coerentes | Não imitar as três silhuetas de pedras quebráveis; ornamento não parece alvo. |
| Águas da Floresta | Recessos erodidos e faixas de umidade junto à base | Raízes pendentes recuadas, musgo e gotejo localizado | Decal de brilho não cria uma poça falsa; manter a rota seca identificável. |
| Fósseis Instáveis | Camadas sedimentares e planos largos com inclusões | Impressões fósseis na face e ossadas embutidas fora do percurso | Fissura decorativa difere do aviso real de instabilidade. |
| Fissuras do Manto | Massas escuras com rupturas amplas e reentrâncias | Crostas, veios resfriados e luz discreta em nichos | Acento decorativo não imita lava ativa ou previsão de ataque. |
| Gruta dos Micélios | Bolsões úmidos, patamares rochosos e cavidades agrupadas | Colônias fúngicas aderidas, filamentos e volumes recuados | Luminescência ambiental não imita área de esporos perigosa. |
| Tocas de Âmbar | Massas terrosas coesas, concavidades e estratos quentes | Raízes fossilizadas e inclusões foscas nas paredes | Âmbar decorativo não sugere um cristal coletável; não confundir piso lento. |
| Hortas Subterrâneas | Câmaras sob redes de raízes e bolsas de solo | Raízes em paredes, fibras e vegetação nos recuos | Conservar o corredor e distinguir raízes de borda do terreno que muda movimento. |

Uma identidade de bioma deve continuar legível numa imagem sem cristais e
criaturas. Comparar também em cinza: silhueta, escala das massas e agrupamento
devem carregar parte da diferença, sem exigir uma nova paleta. O estado ativo
das famílias migradas usa Cosmos64; preservar rampas e contratos específicos.

Para cada família escolhida, definir: material/forma dominante; motivo secundário;
local de crescimento; densidade por setor; escala e variação limitada; zonas
proibidas; semente visual; envelope projetado. Alternar trechos de presença e
silêncio. Evitar espalhamento uniforme e o mesmo arco de parede com sete recolors.

O espaço pode mudar de personalidade por bioma sem exigir nova habilidade.
Uma proposta de mudança de custo, perigo, iluminação de descoberta ou travessia
é design de gameplay e precisa de escopo próprio; não escondê-la num lote de tiles.

## Como pesquisar para a próxima decisão

Escolher a pergunta antes da referência: um problema de teto pede câmera/oclusão;
um mapa repetitivo pede estrutura e percursos; um bioma sem identidade pede formas,
materiais e distribuição. Consultar fonte primária relevante e registrar:

- Autor/projeto, link, data de consulta e qual parte foi realmente examinada.
- Princípio que resolve a dúvida, diferença de perspectiva/mecânica e limite da evidência.
- Hipótese específica para GemVenture e uma comparação capaz de refutá-la.

Não acumular nomes de jogos como selo de autoridade nem atribuir algoritmo a uma
imagem promocional. Uma referência visual mostra aparência; o código ou relato do
criador fundamenta funcionamento. Preservar autoria/licença; qualquer asset externo
exige verificação própria. Atualizar a referência quando uma medição ou decisão
humana mudar a recomendação; não cristalizar os números de um estudo como lei.
