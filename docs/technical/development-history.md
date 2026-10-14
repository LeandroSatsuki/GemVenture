# Gemventure — Ecos das profundezas

## Interface das referências · 14/10/2026

`dist/ui-refinement.css` é a última camada de estilo, após `ui-theme.css` e
`miner.css`. Janela de pedra cinza, faixa de madeira, categorias escuras com
ícones e seleção ocre. A Forja separa categoria, cena e receita em três colunas;
os custos têm preenchimento proporcional e um único botão principal. A árvore
abre em 60%, destaca a categoria selecionada e mantém o detalhe e os bônus à
direita. Equipamentos conservam os oito slots, com peças em uma grade compacta.
Vila usa chão floresta/deep teal e bandejas de aço para reduzir luminosidade.

As receitas diretas não somam duas vezes o saldo mostrado; depósitos de projetos
continuam separados. Preços e progressão permanecem nos módulos originais.
Validação integrada: 378 testes aprovados. Conferência visual em origem QA 4180,
incluindo compra de picareta e painel de melhorias, sem mudar o save da partida.

## Broca AFK

Na vila, a máquina de aço abre a extração passiva. Produz **cascalho para suas
próprias melhorias**; cristais são jackpots raros (2% por impacto direto).
TNT, frenesi de 5 segundos, titânio com desvio e rocha densa alteram a trajetória
e a sequência. Aos 50 blocos, um pulso sísmico coleta a janela e garante um cristal.

Motor, núcleo, perfuração, laterais, dinamite e autonomia consomem apenas cascalho.
Novas máquinas trabalham até 1 h por ausência, ampliável a 8 h. Fragmentos antigos
ficam na aba Reserva; a troca onerosa de cristais continua separada.
Nenhum ganho AFK de moedas, XP, essências, estrelas ou passes.

Em 300 simulações: cerca de 27 cristais/h iniciais. A quantidade do prêmio cresce
com profundidade, núcleo e recorde de andar, mantendo drops em 2%: não há teto
fixo de 97/h. Estados avançados testados rendem 351 e 3.373 cristais/h,
somando as quatro cores, com investimentos maiores. Ver [MINERADORA.md](MINERADORA.md) e
`tools/audit-miner.mjs` para as regras e limites. Sprite ativo:
`dist/assets/village-hept32/mining-machine-v2.png`; original preservado.


## Começo acessível e quinze discos

Os quatro primeiros andares têm curvas próprias de resistência, dano, tamanho
de ondas e proteção do saque. O primeiro quartzo quebra em três golpes;
criaturas comuns começam com seis de vida e ataques próximos de oito de dano.
O início conserva 80% da coleta em derrota/retirada, depois 75%, 68% e 60%;
o restante da progressão e o Abismo conservam a regra normal e as melhorias.
As primeiras receitas da picareta continuam acessíveis: 4 quartzos, 2 rubis e
35 moedas. A economia foi conferida com partidas imperfeitas, não só um bot
perfeito. Ver [análise do início](asset-work/onboarding-balance.md).

Vitrola com quinze composições originais. Adições: **Eco Digital**, **Batida do
Abismo**, **Mina 8-Bit**, **Zag Swing** e **Descida Turbo**. Vocal eletrônico
sem palavras, Drum & Bass, chiptune, electro swing e eurobeat. Ouvir em
[prévia musical](http://127.0.0.1:4174/music-lab.html). Vila/Zag/fogueira
continuam suaves. Ver [direção musical](MUSIC_DIRECTION.md).

## Polimento atual · arte, cavernas e leitura

A [skill de arte procedural](skills/gemventure-procedural-art/SKILL.md) reúne direção visual, referências, composição, animação e auditoria por sementes. O [ateliê local](http://127.0.0.1:4173/art-studio.html) permite revisar as famílias nos seis biomas. ZIPs e conversores não são dependências de execução.

Silhuetas mais claras, menos quinas, cores sólidas e uma sombra por material. A vila tem espaço entre as estações e animações por partes; Forja, poço, árvore e elevador rústico seguem a mesma direção. Cristais, emblemas, poção e escudo agora usam desenho próprio. Corpo e capacete do explorador preservam os packs adaptados à HEPT32. Fontes e créditos permanecem em [ART_ASSETS.md](ART_ASSETS.md).

Cavernas agora combinam câmaras e corredores conectados, com paredes distintas das pedras quebráveis, ouriço cristalino gigante assistindo à exploração de sua toca e quedas de rochas anunciadas. O espectador respira, pisca, acompanha o movimento com o olhar e alterna as patas no pulso, com camadas independentes e sem encobrir o chão jogável. Títulos diretos substituem textos repetidos; dicas ficam recolhidas. Essências continuam reservadas, sem uso novo. Curas de cartas têm ganho decrescente após a segunda cópia, preservando os dois níveis iniciais. A [auditoria](asset-work/final-polish-balance-audit.txt) registra mudanças, limites e a amostra que não concluiu no tempo do teste.

Validação integrada em 12/10/2026: **329/329 testes aprovados** em 58,996 s, incluindo cache ampliado e camadas do ouriço gigante. Ensaio do Abismo da rodada integrada anterior ao último refinamento do ouriço: 164 s, 7.054 quadros e nenhum erro de console; CPU por quadro média 4,79 ms / p95 14,8 ms, desenho média 3,86 ms / p95 8,3 ms. Intervalos reais entre quadros: média 23,26 ms / p95 33,4 ms / máximo 83,3 ms. O navegador estava em segundo plano e a suíte rodava em paralelo; estes dados não são uma nova medição do ouriço gigante, não comprovam 60 FPS e não substituem testes em outros dispositivos.

## Tocas de Âmbar · sexto bioma

- Andares 26–30, após os Micélios. O Selo das Tocas custa 35 estrelas e exige alcançar o andar 25. Os acessos e saves existentes, inclusive o Abismo, continuam válidos.
- Terra ocre, raízes e montes de escavação na HEPT32. Terra fofa custa dois pontos por passo, sem dano ambiental; a arena do chefe fica livre desses obstáculos. Topázio e quartzo predominam, com variação de foco por andar. Âmbar é o tema visual, não uma quinta moeda.
- **Rei das Tocas**, andar 30: 960 PV. Escava, marca a posição do jogador e emerge três pulsos depois (42 de dano). O alvo fica fixo, permitindo esquiva. Submerso, bloqueia golpes, bombas e efeitos; ao emergir fica vulnerável por quatro ações, com teto compartilhado de 80 de dano por pulso.
- Abaixo de meia vida, alterna emergência e **Onda de Terra** (50 de dano). A onda marca um anel; o centro azul é seguro. Todos os pontos da arena têm uma saída alcançável com o movimento básico, sem depender de habilidades.
- Trilha de exploração a 140 BPM e batalha a 108 BPM. Escavação e emergência têm sons próprios; rastro de terra limitado a seis formas, com sprites em cache. Arte nova disponível no ateliê e na miniatura do elevador.
- Teste isolado: iniciar `node tests/visual-server.mjs` e abrir `http://127.0.0.1:4174/expedition-preview.html?mole=surface&freeze` (também `mole=burst` e `mole=ring`). A porta 4174 usa outro save; não altera a partida da porta 4173.
- Pesquisa de tema: [The Wildlife Trusts — Mole](https://www.wildlifetrusts.org/wildlife-explorer/mammals/mole), pelas patas de escavação, túneis, montes de terra e habitat em solo de bosques. Desenho e padrões de ataque originais.
- Validação desta extensão: 269 testes aprovados, incluindo save em plena escavação, invulnerabilidade a efeitos, área segura, som, paleta, progressão e vitória com ações reais do motor. Arena e ateliê conferidos no navegador sem erros de console.

## Evolução da Vila e Poço por Cristal

- Forja e Poço vão do nível 1 ao 10; o Quadro vai até 150. A construção usa moedas e quatro minerais separados; a compra é atômica e só funciona na vila. Os aprimoramentos individuais da Forja continuam até 100, em uma progressão separada.
- Cada nível extra da construção Forja dá +2% de força à ferramenta (máximo +18%), sem mudar receitas, depósitos existentes ou slots de habilidades.
- O Quadro escala objetivos, prazos e recompensas até 150, com curvas diferentes para coleta, combo, consumíveis e andares. As melhorias dos níveis 1–9 mantêm seus preços; depois, moedas e receitas crescem por curvas polinomiais. Raridade tem retorno decrescente e há até seis ofertas. Missões antigas aceitas preservam prazo, objetivo, progresso e recompensa. Novas missões guardam seu prêmio no contrato. Fórmulas, custos totais e exemplos estão em [Balanceamento: Missões](dist/balance-report.html#missoes); dados reproduzíveis em `tools/mission-balance.mjs`.
- Missões simultâneas: uma inicial e mais uma nos níveis 30, 60, 90 e 120, com teto de cinco até 150. Aceitar e entregar renova ofertas automaticamente, sem alterar contratos em andamento. Cada missão tem seu prazo e recompensa; objetivos compatíveis avançam juntos e contratos do mesmo tipo não podem ser duplicados. Concluídas exigem RECEBER no quadro, expiradas liberam vaga. Salvos antigos continuam com sua missão original; vagas adicionais ficam em `extraMissions` e a sequência de sorteios em `missionRoll`.
- O Poço custa 45 cristais da cor escolhida. Antes da oferenda, a interface revela apenas a família do cristal; sem probabilidades, nomes antecipados ou tabelas. Depois mostra a bênção e a maldição sorteadas. Upgrades alteram somente a chance de raridade; nunca reescrevem um resultado já pago.
- Quartzo: vida, fôlego ou XP. Rubi: força, críticos ou explosões. Topázio: defesa, escudo inicial ou escudo por andar. Esmeralda: sorte, cristais ou cura por abate. São 12 bênçãos novas, além das três legadas, com potência e severidade sorteadas independentemente.
- A cena começa com uma esmeralda flutuando; selecionar outra cor muda o cristal e o brilho. Movimento lento, três partículas suaves e revelação discreta respeitam a opção de efeitos suaves e movimento reduzido.
- Saves anteriores recebem construções no nível 1. Bênçãos antigas já sorteadas mantêm seus efeitos até serem usadas; novos sorteios usam os bônus menores por cor.
- Verificação: 196 testes aprovados, incluindo limites, pagamento, saves, sorte por cor, bônus aplicados em combate/coleta e contratos preservados. Fluxos de melhoria, oferenda e recarga conferidos em navegador isolado.

## Forja até 100 e Gruta dos Micélios

- Picareta, vigor e os quatro projetos chegam ao nível 100. Novos saves recebem ganhos pequenos: primeiro reforço da picareta +2,6%; vigor +1 de vida; bigorna +0,5% da força base; proteção −0,3 ponto percentual de dano; poções +0,15 de cura; cofre +0,25 ponto percentual de retenção por nível.
- A força da picareta é `1 + 0,025n + 0,001n²`, com `n = nível − 1`. Custos atuais usam curvas polinomiais em `balance.js` e `forge.js`; projetos preservam as três primeiras receitas. O depósito acompanha o tamanho da receita, com investimento parcial salvo. Fórmulas e totais atualizados estão no [relatório de balanceamento](dist/balance-report.html).
- Novos personagens no máximo têm 200 de vida, +50% de força da bigorna, 30% de redução de ataques, cura de 40 e retenção de 75% do saque (85% com Caravana). A Forja continua comprando números; a árvore mantém as escolhas mecânicas. Custos são uma curva inicial, ainda sujeita a sessões humanas de balanceamento.
- Saves antigos preservam os benefícios já comprados por meio de bônus de legado, migrados uma única vez. Vida atual, moedas, cristais e depósitos continuam salvos. Os bônus antigos permanecem ativos; níveis extras seguem a nova curva.
- Novo quinto bioma nos andares 21–25: **Gruta dos Micélios**, criaturas com cogumelos, esporos perigosos, geração mineral própria e arte procedural HEPT32. O Selo dos Micélios exige alcançar o andar 20 e custa 25 estrelas.
- **Soberano Micelial**, no 25: corpo intangível no centro; quatro núcleos estacionários por onda. Cada núcleo destruído remove 1/8 da vida do chefe; duas ondas encerram a luta. Ataques diretos, fogo e explosões não atravessam sua intangibilidade. Os núcleos ficam visíveis abaixo do HUD.
- A espiral de pedras é um perigo indestrutível. Cada varredura avisa por um pulso, gira em passos musicais e inverte após 16 varreduras, com aviso nas quatro anteriores. Abaixo de metade da vida, o giro acelera e o dano aumenta. Há esquiva possível com o movimento inicial de quatro casas.
- Trilhas novas: **Micélio Vivo**, 136 BPM na exploração, e **Valsa do Micélio**, 104 BPM constantes no chefe. Prévia musical e ateliê incluem o quinto bioma. A fogueira no andar 20 oferece descanso antes da nova região.
- O portão do Abismo continua exigindo o Boss Místico do andar 20 e seus cristais; a expansão não bloqueia novamente quem já o abriu. Cinco estrelas por descida permanecem como limite.
- Verificação: **187 testes aprovados**, incluindo compras até 100, migração, renderização de todos os biomas, campanha até 25, dano dos núcleos, inversão e esquiva da espiral. Compra real na Forja e arena conferidas em navegador com save isolado. A partida principal permanece intacta.


## Veio raro: coleta por golpe

- Cada golpe que causa dano ao veio raro já deposita cristais da cor dele na mochila, com número flutuante e som de coleta. A quantidade acompanha o dano real e os bônus de saque. Golpes repetidos no mesmo pulso, erros e dano excedente não geram coleta extra.
- O veio desaparece ao expirar seu prazo no relógio musical. O que já foi coletado permanece na mochila, sujeito às regras normais de extração e morte. Pausa e recarga preservam o prazo e os recursos.
- Quebrar antes do prazo mantém o bônus do desafio e os efeitos de quebra, sem pagar novamente o valor inteiro do cristal. Cristais comuns continuam pagando na quebra. O aviso mostra **BATA E COLETE**, depois o total coletado e o tempo restante.
- Verificação: 179 testes aprovados, com coleta parcial, expiração, recarga, dano excedente, bloqueio de pagamentos duplicados e preservação dos cristais comuns. Aviso e saldo parcial conferidos no navegador em save de teste separado.

## Elevador e desbloqueios permanentes

- O elevador abre em **Andares**, com o mapa detalhado e as paradas. Duas placas à esquerda alternam **Andares** e **Abismo**; somente o conteúdo do modo escolhido é mostrado. A tela do Abismo reúne recorde permanente, recompensas possíveis, bênção preparada (incluindo seu risco), relíquias, habilidades equipadas e construção do portão. Detalhes ficam recolhidos; após liberar, é possível iniciar outra tentativa sem apagar o recorde.
- O elevador mostra **1/5 a 5/5**, o código **região–andar** (ex.: 2–3), o nome da caverna e cinco marcos. No quarto andar avisa **CHEFE A SEGUIR**; no quinto, **CHEFE**. Não revela o total da campanha.
- Cada andar já visitado pode virar uma parada permanente. A ativação custa cristais separados: 12 × andar de quartzo; a partir dos andares 6/11/16, acrescenta respectivamente 8 × andar de rubi, 6 × andar de topázio e 6 × andar de esmeralda. Exige o selo do bioma. A seleção lista apenas paradas compradas e acessíveis.
- Partir de uma parada inicia uma nova expedição: vida cheia, mochila e combo vazios, sem cartas da tentativa anterior. Bênçãos pendentes e relíquias iniciais seguem suas regras normais. Ativar uma parada não conclui seus andares nem concede recompensas.
- **Abismo bloqueado:** o portão aceita depósitos parciais de até 100 cristais por clique. Custo inicial de balanceamento: 1.500 quartzos, 1.200 rubis, 1.000 topázios e 800 esmeraldas. Cada cor tem seu próprio encaixe e progresso. Abrir exige também derrotar o Boss Místico da campanha. Preencher antes da vitória conserva tudo, mas não libera a entrada. Depois de aberto, fica aberto permanentemente.
- O salvamento guarda contribuições, paradas e chefes vencidos. Saves antigos preservam recursos e partidas de Abismo já em andamento; novas entradas passam a exigir o portão. Chegar ao andar final não é confundido com derrotar o chefe. Depósitos e compras inválidas não descontam recursos.
- A identidade região–andar aceita profundidades além do catálogo atual e fica separada da apresentação e das compras. A campanha agora tem 30 andares; novas extensões ainda precisam de conteúdo e balanceamento. O Abismo já mantém sua progressão contínua sem teto de campanha.
- Referência consultada: [TBH: Task Bar Hero, página oficial na Steam](https://store.steampowered.com/app/3678970/TBH_Task_Bar_Hero/). A solução região–andar desta versão é própria; não reproduz arte ou interface do jogo.
- Verificação: **173 testes aprovados**, incluindo bloqueio real do Abismo, depósitos parciais, migração, derrota do chefe, compra de paradas e partida em profundidade. Fluxo conferido no navegador com save de teste separado, incluindo liberação do portão e partida no andar 11; layout conferido em 1280 × 720 e 390 × 844. Os custos ainda precisam de partidas humanas para calibrar o tempo de desbloqueio.

## Tela, missões e sons

- Cartas do Abismo: cada nova seção (96 pulsos, a partir da segunda) abre três escolhas durante quatro segundos. Barra regressiva; clique ou teclas 1–3; ao expirar, uma das três é aplicada automaticamente. Combate, fôlego, missões e música pausam juntos, sem quebrar o combo. Opções, prazo e sorteio persistem ao recarregar; cartas duram a descida. Carga de elevador é excluída, limites de acúmulo continuam valendo e, no máximo da build, entram opções imediatas de vida, fôlego e escudo.

- Durante a exploração, a caverna ocupa a janela abaixo de um cabeçalho de 42 px. Fôlego, estrelas, calor, desafios e ações ficam sobrepostos nas bordas. A vila mantém seu próprio layout. A câmera mantém o minerador abaixo das barras e adapta o enquadramento em telas estreitas, sem faixas vazias.
- Ao concluir um andar, a barra de fôlego e os indicadores externos deixam a frente da escolha de cartas. A barra volta na exploração seguinte. Os bloqueios contra cliques acidentais continuam ativos.
- O primeiro trecho do Abismo começa sem inimigos: grupos de dois chegam no pulso 16, depois três a partir do 48, a cada 16 pulsos. Eles têm 25% menos vida; seus ataques causam 35% menos dano. A pressão no topo cai de 14 para 6. Na segunda seção voltam os enxames completos e os meteoros anunciados. Música e rolagem conservam o mesmo relógio.
- Missões são linhas com objetivo curto, prazo, raridade e recompensa lado a lado. Aceitar fecha o quadro. Concluir sinaliza o quadro da vila; após conferir o saque de retorno, uma missão pronta abre a entrega. RECEBER deposita uma única vez e mostra moedas e essências separadas. Não há entrega automática na caverna.
- Efeitos sonoros próprios para picareta, cristais, pedras fortes, inimigos, dano, erro de ritmo, cura, escudo, poderes, alertas, cartas, descida, derrota e missões. Reações em cadeia escolhem até três sons prioritários por lote, com limite de repetição e vozes. Trocas de trilha não cortam os efeitos novos; desligar o som interrompe tudo. Vila e descanso conservam a trilha suave.
- Verificação: suíte completa de 164 testes aprovada, seguida das regressões de enquadramento e troca de áudio (166 testes no catálogo). As suítes afetadas passaram novamente. Interface conferida em 1280 × 720 e 390 × 844, incluindo aceite, entrega, saldos, escolha de carta e retorno do fôlego no andar seguinte. O save da partida principal não foi alterado.

## Modos e ciclo de jogo

- No elevador da vila, escolha a parada do modo **ANDARES** ou construa o portão para acessar o **ABISMO INFINITO**. Salvamentos anteriores continuam no seu modo atual. Uma nova descida ativa as novas mecânicas.
- **Andares:** carga + sequência + sobrevivência, escolha de carta e decisão de avançar/voltar. Chefes mantêm suas arenas e cadência controlada, sem multiplicadores extras de calor. A fogueira continua entre cada dez andares e o seguinte.
- **Abismo:** uma única faixa de caverna em movimento. A cada quatro pulsos, uma linha sai e outra nasce; posições, ataques marcados, terreno e efeitos acompanham a rolagem. Sem regenerar a sala inteira, reiniciar combo ou parar em fogueiras. Cada 96 pulsos avança uma seção e abre a escolha de carta por quatro segundos; biomas se alternam e a profundidade continua sem teto de campanha. Manter-se no topo causa pressão: é preciso minerar e descer.
- O relógio do Abismo usa a faixa Core Overdrive com as variações musicais existentes. Sônico acrescenta subdivisões e ecos de golpes; não duplica escondido a velocidade exigida nos comandos. Mudanças de regra são anunciadas oito pulsos antes. Pausa manual, perda de foco e salvamento permanecem disponíveis.

## Risco, eventos e bônus

- **Calor:** cresce com profundidade e permanência. Calor, Vidro, Ímã e profundidade logarítmica compartilham o teto ambiental de ×3,5. O calor tem teto de 100; vida e dano dos enxames continuam escalando com a seção absoluta, sem reinício no bioma.
- **Modificadores:** Fluxo; Vidro (saque +80% e dano +50%); Enxame (mais criaturas e saque); Sônico (golpes ecoam e música com subdivisões extras). São determinísticos, preservados ao salvar.
- **Desafios durante a run:** caçada no pulso ou destruição de veia rara, com prazo de 48 pulsos. Recompensa imediata: 30 cristais e pontos; no Abismo também ativa um poder. O último golpe de uma sala também paga o desafio. A expiração não cobra recursos.
- **Abismo:** enxames laterais a cada oito pulsos, até 48 criaturas comuns; meteoros a cada 32 pulsos com quatro de aviso; um Titã invade a cada 192 pulsos e marca uma cruz antes de atacar. Veias explosivas provocam reações em área. Partículas, rótulos e faixas de terreno têm limites de memória.
- **Poderes de 16 pulsos:** Picareta Titã (dano ×3 e área), Tempestade (raios em até seis alvos), Passo de Fogo (movimento ×2 e queimadura no caminho), Imã Total (atração de cristais e saque ×2). Ganhos por sequências de 20, grupos de oito inimigos ou desafios; indicadores conectados por brilho, ícone, nome e duração. Os efeitos suaves continuam disponíveis.
- **Estrelas:** continuam limitadas a cinco por run. No Abismo a referência de pontuação é 60.000; Titãs derrotados com combo alto têm chance crescente de conceder um bônus estelar, respeitando esse limite.

## Resgate, prestígio e descanso

- Depois de um chefe no modo Andares, o jogador pode enviar a mochila e continuar. No Abismo, a cada terceira seção abre uma janela de 24 pulsos: **ENVIAR SAQUE** ou **ARRISCAR**. O mundo continua andando.
- O envio deposita imediatamente moedas e cada cor de cristal na base, esvazia a carga transportada e registra o resgate antes de qualquer animação. Morte ou recarga nunca pagam essa carga outra vez. A tela de retorno distingue o que já foi enviado.
- **Forja:** números brutos, pagos com moedas e minerais. **Árvore:** XP, builds e sinergias. **Poço:** oferendas e bênçãos com vantagens e riscos. **Estrelas:** relíquias e acesso a biomas. Os selos agora custam 3 / 8 / 15 estrelas e ainda exigem alcançar o respectivo chefe; selos antigos permanecem abertos.
- **Refúgio/fogueira:** música ambiente a 64 BPM, sem bateria, notas senoidais longas com entrada suave e volume menor. Continua tocando nos menus da vila. Brilhos rítmicos de combate são desligados no descanso.
- Ressurreições no Abismo preservam o combo e concedem proteção imediatamente, sem abrir uma pausa automática; a troca de build continua na base e nos abrigos do modo Andares.

### Verificação desta revisão

159 testes passaram na suíte completa, incluindo áudio de descanso, continuidade até a seção 25, recorde persistente, resgates, poderes e compatibilidade. Interface de resgate, poderes, Forja com som ativo e seleção de modos conferida em servidor de teste separado do save do jogador, sem erros de execução observados. A dificuldade e a densidade visual ainda precisam de partidas humanas para calibrar a experiência.

## Regras atuais

- Estrelas: cinco marcos fixos por descida em 1.000 / 3.500 / 7.500 / 12.500 / 20.000 pontos. A barra é contínua, com estrelas posicionadas nos marcos; não reinicia a cada estrela ou andar. Cada estrela é guardada imediatamente e o limite permanece cinco por expedição.
- Salas novas reservam 3.000 / 3.750 / 4.500 / 5.250 pontos conforme o bioma. A janela de tempo para pontuar foi substituída por esse orçamento, salvo na compatibilidade interna de scores antigos não migrados. Movimento só pontua ao percorrer casas ainda não visitadas; combate e mineração respeitam o mesmo teto. A pontuação acumula entre andares. Saves antigos preservam pontos, estrelas e moedas, recebem a meta fixa e descontam o que já pontuaram no andar.
- Cavernas novas exigem 32 + 2 × andar de carga, uma sequência ativa e pelo menos 96 pulsos de sobrevivência; chefes continuam exigindo derrota do boss. Ao completar a carga cedo, o HUD mostra ESTABILIZANDO. Ondas ficam mais frequentes depois de 256 pulsos e o dano sobe gradualmente, evitando permanência tranquila infinita. Criaturas comuns têm 12 + piso(2,2 × andar), mais 10 para guardiões; ataques têm 20 + 2,4 × andar antes dos modificadores. Salas já salvas mantêm sua geração até o próximo andar.
- Descoberta: o HUD usa um elevador com o personagem, animação de descida e legenda do andar atual. Mapa mostra somente andares alcançados, sem total da campanha nem futuros chefes.
- Última Batida exige Segundo Fôlego e custa dois pontos de habilidade. Vida extra equipada, carta de ressurreição ou relíquia Fênix consomem sua carga, recuperam 30 da reserva esgotada e preservam combo e contadores da sequência. O combate pausa para trocar/aprender/aprimorar a build; continuar dá quatro pulsos de proteção contra ataques. Sem vida extra, a morte continua encerrando a descida.
- Descanso obrigatório entre o décimo andar e o seguinte: fogueira, música da base e relógios parados. Troca de build usa as mesmas regras de XP; não libera compras durante combate normal. Preparos únicos por parada usam a mochila: 30 esmeraldas por 35 de vida, 25 topázios por dois escudos, 25 rubis por duas bombas. Entrar não cura automaticamente. Consumo e estado de descanso sobrevivem à recarga.
- Controles: BOMBA / CURAR / ESCUDO têm botões grandes, nomes, quantidades e atalhos 1/2/3. Habilidades equipadas exibem nome e AUTO; Tab abre a árvore.


- Música: cinco seções de 32 pulsos (Fluxo, Impulso, Fluxo, Respiro, Retorno), com mudanças de instrumentação e densidade. Nas cavernas, a velocidade relativa segue 100%, 104%, 100%, 97%, 100%. Cada mudança leva quatro pulsos para chegar ao novo andamento. Nas arenas de chefe, somente o arranjo varia.
- Cada virada é anunciada quatro pulsos antes por um motivo musical e “ACELERA” / “DESACELERA” com contagem na tela. O bumbo de referência permanece em todos os pulsos; notas extras não pedem ações extras. Oito pulsos após a mudança recebem 60 ms adicionais de tolerância, mantendo uma ação por pulso. Erros fora da tolerância e inatividade continuam contando.
- Áudio, julgamento dos comandos, inimigos, animações, pista e duração das missões usam o mesmo mapa temporal. Pausa e recarga preservam a posição musical; saves de andamento fixo são convertidos pela posição no pulso, sem reiniciar a sala. A subida toca o tema tranquilo da base; cada descida começa com seu período de preparação.
- [Prévia musical local](http://127.0.0.1:4173/music-lab.html): comparar os dez discos em qualquer bioma ou chefe, avançar até o aviso da próxima virada e pausar, sem mexer no salvamento do jogo.
- Referência de design: [Ryan Clark, criador de Crypt of the NecroDancer](https://www.gamedeveloper.com/audio/game-design-deep-dive-finding-the-beat-in-i-crypt-of-the-necrodancer-i-) descreve a importância da tolerância de ritmo em combate e da sincronização do mundo. [Audiokinetic](https://www.audiokinetic.com/en/library/edge/?id=setting_source_and_destination_properties&source=Help) documenta transições musicais em pontos como batidas e compassos. As faixas e regras deste protótipo são originais; a sensação musical e o nível de tolerância ainda pedem teste humano.

- Cavernas de exploração: 42 × 30 casas, quatro vezes a área anterior. A câmera acompanha o personagem. A visão alcança sete casas, bloqueada por rochas; o terreno descoberto permanece no mapa, enquanto criaturas e cristais fora da visão ficam ocultos. Minimap mostra o caminho explorado. O salvamento preserva a exploração. Salas antigas em andamento conservam 21 × 15 até a próxima geração.
- Ondas rítmicas: primeiro ataque no pulso 16, aviso quatro pulsos antes, novas ondas a cada 24. Nascem fora da visão, por direções diferentes e em locais com caminho até o jogador. O limite simultâneo cresce de 18 a 36 criaturas conforme o bioma. Ondas param ao concluir o andar.
- Identidade ambiental: grutas com mais rochas quebráveis; floresta com água que dobra o custo de movimento; fósseis com rachaduras e manto com fissuras quentes. Os dois últimos dão dois pulsos para sair e causam 8/12 de dano à vida se o jogador permanecer. Vida e fôlego continuam independentes.
- A quantidade inicial de cristais cresce por bioma e profundidade. Carga e pontuação seguem as novas regras de marcos acima. Arenas de chefe continuam 21 × 15 nesta versão para preservar a leitura das mecânicas.
- Referências desta revisão: [Core Keeper / Fireshine](https://fireshinegames.co.uk/featured/core-keeper/) para exploração e identidade dos biomas; [Vampire Survivors / poncle](https://poncle.games/vs-online-faq) para pressão de hordas durante deslocamento. Implementação e arte próprias.

- Vida e fôlego são independentes. Vida (verde, abaixo do personagem) recebe ataques, poças e curas. Fôlego (barra azul grossa acima da caverna) perde 12 + 0,5 por andar em erros e 5 + 0,3 por andar em pulsos perdidos; ações válidas no ritmo recuperam 2. Segundo fôlego acrescenta sua recuperação de sequência. Qualquer reserva zerada encerra a expedição, exceto ressurreições equipadas, que recuperam 30 da reserva esgotada. Ambas persistem entre andares. Saves anteriores preservam vida e recebem fôlego proporcional. Alpha 0.22: 145 testes aprovados, incluindo expedição completa com mineração real, cinco estrelas e build de explosões para hordas. Cobertura de orçamento por sala, exploração sem pontuação repetida, ressurreição, descanso e descoberta. Barra, elevador, controles, cura paga, troca de build e retomada conferidos no navegador. A dificuldade final ainda deve ser calibrada com partidas humanas.

Leia [DESIGN_RULES.md](DESIGN_RULES.md) antes de criar mecânicas ou telas. Os cinco pilares têm papéis diferentes: forja para atributos, constelação para builds por XP, poço para risco e recompensa, relicário para regras permanentes e missões para objetivos. Texto curto, título grande e palavras-chave são regra de produto.

- Campanha: 30 andares, seis biomas de cinco andares. Chefes em 5/10/15/20/25/30. O mapa do elevador tem scroll, arraste, miniaturas por andar e fauna do bioma. Dezoito identidades de criaturas, com três comportamentos rítmicos por bioma.
- Materiais: quartzo, rubi, topázio e esmeralda ficam em quatro saldos. Cristais minerados não viram moedas; rochas, criaturas e missões ainda dão moedas. Cada andar favorece uma cor. Os pesos de base por bioma são [64,14,10,12], [16,12,14,58], [18,14,54,14] e [14,56,20,10]; a cor abundante do andar recebe mais 60 antes da normalização. As quatro primeiras posições da sala asseguram variedade; o restante e os novos cristais usam os pesos.
- Forja: seis opções, receitas por cor e depósitos parciais. Picareta e vigor são compras diretas; bigorna, armadura, alambique e cofre são projetos. Os projetos exigem todos os materiais e moedas antes de conceder o efeito. A picareta muda em quatro tiers visuais; armadura acende runas. O vigor antes comprado na fonte agora pertence à forja.
- Constelação: 25 nós conectados, cinco habilidades equipáveis e passivas. XP permanente por quebra, criatura e conclusão de andar; cada nível dá um ponto. Aprender custa 1–3 pontos e aprimorar custa 2/3. Não consome minérios, moedas ou essências. Pulso brutal gera críticos por sequência; Trovão profundo carrega um raio em linha no primeiro golpe de cada andar. Os demais caminhos incluem explosões, cura, mobilidade e coleta.
- Poço: uma oferenda de 45 cristais da cor escolhida sorteia uma bênção, salva imediatamente. Não permite rerrolar uma bênção pendente. Fome de brilho dobra XP e aumenta dano inimigo em 25%; Vidro vivo dá +50% cristais e −25% vida máxima; Fúria dá +2 força e +50% desgaste por erros. Consome na próxima descida e termina na morte ou extração.
- Relicário: Escudo da Aurora (12 estrelas, proteção por 8 pulsos iniciais); Coração Fênix (24, uma ressurreição por descida); Memória Arcana (35, uma carta inicial aleatória). Compras únicas. Melhorias estelares antigas continuam ativas, sem novas ofertas de atributos.
- Migração: o mapa antigo de quatro andares é convertido preservando sala, vida, mochila e chefes. Moedas e investimentos anteriores permanecem; saldos novos começam vazios. Habilidades compradas permanecem; força antiga recebe compatibilidade. A meta de pontuação de uma expedição já iniciada é mantida.
- Referências pesquisadas: [Slay the Spire / Mega Crit](https://www.megacrit.com/press-kits/slay-the-spire/) para apresentação da jornada e [Hades / Supergiant](https://www.supergiantgames.com/blog/hades-faq/) para evolução entre tentativas. Arte e implementação próprias, preservando HEPT32.

As notas abaixo registram versões anteriores. Em caso de diferença, as regras acima e DESIGN_RULES.md descrevem o comportamento atual.

Jogo incremental de mineração rítmica em português, com salas procedurais em semi-top-down, combate, morte e progressão permanente. Canvas 2D e Web Audio, sem dependências de execução.

## Rodar e verificar

Execute `npm start` e abra http://127.0.0.1:4173. Execute `npm test` para verificar as regras, a migração e expedições completas.

Validação da Alpha 0.18: 114 testes aprovados (suíte completa de 113 mais regressão da carta inicial da relíquia). Forja, constelação, poço, relicário, mapa e entrega dos quatro materiais conferidos no navegador; nenhum erro de console nessa verificação.

## Controles

- Clique num cristal, rocha ou criatura: dash inicial de até 4 casas e golpe ao chegar ao alvo.
- Espaço: continuar atingindo o alvo. Tab: abrir habilidades e pausar a exploração. Q: trocar alvo. Shift+Tab: sair do foco da caverna.
- WASD ou setas: esquivar no ritmo. Clique no chão para deslocar-se.
- P ou Escape: pausar. E: solicitar extração. Ative a música com ♫.
- 1: geobomba (dano ×3 em raio 3). 2: pulso vital (+25 de fôlego). 3: escudo de eco (3 batidas). Usar item ocupa a ação do pulso; errar o ritmo não gasta o item.
- Uma ação por batida. Quatro faixas originais de 116, 128, 140 e 152 BPM, uma por bioma. Janelas de ±100, ±94, ±88 e ±82 ms; Ouvido de cristal adiciona 25 ms.

## Ciclo de evolução

1. Na base, clique nas construções do cenário: forja, fonte, árvore, elevador, quadro de missões e oficina estelar.
2. Escolha até cinco habilidades aprendidas. A árvore tem 18 nós, três caminhos e conexões entre eles. Olho de Ouro é passivo e não ocupa os cinco espaços. Trocar a build é gratuito na base.
3. Comece uma nova caverna no andar 1. A cada tentativa muda a semente das salas.
4. Cristais têm dureza, valor e carga diferentes. O Jardineiro faz novos cristais nascerem a cada seis batidas. Cristais vitais recuperam fôlego.
5. Criaturas continuam perseguindo a cada pulso (guardiões andam a cada dois). Gosmas saltam e deixam ácido por 3 batidas; morcegos marcam e percorrem uma linha; guardiões carregam por 2 batidas e esmagam uma área. Atordoar interrompe o ataque. Geodos e guardiões dão geobombas; cristais vitais e gosmas dão pulsos de cura; morcegos dão escudos. Coleta automática, até 9 de cada item. Itens persistem entre andares, mas duram apenas a expedição.
6. Cura vem de itens, cristais vitais, criaturas derrotadas e habilidades. Acertos comuns não curam. Erros, batidas perdidas e ataques drenam a reserva. Ao chegar a zero, a expedição termina e 50% das gemas da mochila são salvas. Habilidades, moedas na base e essências permanecem.
7. Reúna a carga exigida e mantenha a sequência atual exigida para estabilizar a sala. A sala fica segura e mostra, no centro da tela, três gemas-cartas. Escolha uma e depois decida entre descer (fôlego mantido) e voltar (100% da mochila).
8. Retirada de emergência antes de estabilizar salva 50%. Depois de retornar, invista em habilidades, força e fôlego.
9. Andares 4, 8 e 12 exigem construir na base os selos da Floresta (110 gemas), Ancestral (260) e do Manto (480). O recorde necessário é permanente. Cada nova expedição volta ao andar 1.
10. Complete o andar 16 e extraia para concluir a jornada. Novas expedições preservam todas as melhorias.

## Impacto visual e habilidades de explosão

- Estilhaços, faíscas, anéis de impacto, números de dano e gemas saltando em cada quebra; rastros no dash e raio do Eco mineral.
- Marcos a cada 5 acertos disparam números no canto superior direito da área de jogo. A lateral contém uma pista vertical de sincronia, histórico de oito ações e multiplicador. Níveis de energia em 5, 10, 15 e 20 acertos. Geodos produzem explosões maiores. As quatro músicas têm melodias, baixos, timbres e arranjos distintos, com variações de frase a cada 8 batidas. O relógio de áudio, as notas e os turnos usam o mesmo mapa de tempo.
- Onda de choque ativa a cada 6 golpes que atingem um alvo. Ruptura dá +1/2/3 de dano após 8 acertos e dispara dano ×3/4/5 na sala a cada 24/20/16 acertos (níveis 1/2/3). O golpe precisa alcançar um alvo. Alvos resistentes podem sobreviver. Errar ou trocar de andar reinicia a carga.
- Marcadores de ataques são desenhados por cima das explosões. Sem pausas no relógio de ritmo para simular impacto. Partículas limitadas a 420, anéis a 18 e textos a 28; todos expiram.
- Botão ✹ alterna efeitos intensos/suaves e salva a preferência. A preferência do sistema por movimento reduzido é respeitada por padrão. Modo suave remove tremores e reduz partículas.
- Teste visual isolado: `node tests/visual-server.mjs`, depois http://127.0.0.1:4174/fx-preview.html. A cena controlada usa as regras e o renderizador reais, sem alterar o salvamento do jogo. Esse painel não integra a versão publicada.

## Dados e limites do protótipo

Salvamento local em `gemventure-save-v2`; os dados da Alpha 0.1 são migrados preservando gemas, essências, nível e habilidades equivalentes. O salvamento antigo permanece intacto. Uma partida recarregada começa pausada. Não há produção offline; trocar de aba pausa a partida. Áudio sintetizado original, ativado pelo jogador. Arte procedural usando exclusivamente HEPT32, criada por ENDESGA: https://lospec.com/palette-list/hept32. Profundidades e geologia são fictícias. Interface arcade com Bungee e Chakra Petch, fontes de reserva locais, ícones vetoriais próprios, painéis recortados e cores HEPT32.

Arquitetura: `dist/core.js` contém regras e progressão; `dist/world.js`, cenário; `dist/effects.js`, partículas e feedback; `dist/run.js`, controles, relógio e interface; `dist/audio.js`, sintetizador; `dist/score.js`, composições e tempos compartilhados; `dist/ui-art.js`, ícones. `dist/index.html` e `dist/screen.css` compõem a tela. O pacote é estático. Hospedagem privada no mesmo Site da Alpha 0.1.

## Gerador de arte · Alpha 0.5

Acesse `/art-studio.html` no servidor local, ou o link Ateliê de arte no rodapé do jogo. O ateliê apresenta 23 peças (20 famílias, incluindo quatro cristais), permite variar a semente e o bioma, visualizar a base e as quatro cavernas, baixar uma peça em SVG ou PNG transparente (400 × 440) e exportar a coleção em SVG. O ateliê usa o mesmo gerador e renderizador do jogo, sem acessar o salvamento da partida.

Também foi entregue `atelie-gemventure.html`, um arquivo portátil com o gerador, os estilos e as prévias incorporados, para abrir diretamente em um navegador. As fontes externas são opcionais, com alternativas locais. Para atualizar esse arquivo a partir do projeto, execute `node export-art-studio.mjs`. A versão servida foi inspecionada no navegador; o arquivo portátil passou pela validação de imports e sintaxe, mas sua abertura direta não pôde ser verificada porque o navegador automatizado bloqueia URLs `file:`.

- `dist/palette.js` é a fonte da HEPT32: 32 cores, quatro pares de cristal e quatro conjuntos de materiais dos biomas. Troca completa da AREN32; nenhuma cor dela é mantida como segunda paleta.
- `dist/art-kit.js` gera modelos determinísticos de formas, usados tanto no Canvas quanto na exportação SVG. Variação limitada de silhuetas, proporções fixas, contorno escuro arredondado, luz superior esquerda, uma sombra por material e pequenos brilhos pontuais. Sem textura aleatória, gradientes ou dithering nos objetos.
- Personagem, ferramenta, cristais, criaturas, vegetação, fósseis, magma e construções seguem o mesmo desenho. Peças fixas preservam sua identidade; minerais e formas orgânicas variam com a semente. O bioma troca apenas os materiais previstos.
- Chão com áreas sólidas e poucas manchas grandes; cenário e objetos ordenados por profundidade, inclusive o jogador. O cache do cenário usa resolução dupla, com suavização nas curvas. As explosões continuam intensas, com composição normal para preservar a identidade das cores.
- Materiais e cores da interface pertencem à HEPT32. Transparência, suavização de bordas e transições luminosas podem produzir pixels intermediários, sem introduzir uma segunda paleta de materiais.
- Limites: até 30 formas por peça, 512 modelos e 2.048 caminhos em cache. Testes verificam identidade após descarte do cache, variedade de silhuetas, orçamento de detalhes, exportação e cores de todos os arquivos publicados.

A Alpha 0.15 está preparada localmente. A atualização do Site privado ainda depende da autorização pendente para enviar a credencial temporária ao publicador oficial do Sites; a versão pública/privada hospedada não foi alterada por esta revisão.

## Gemas-cartas · Alpha 0.6

- 20 efeitos temporários, três escolhas distintas por andar. Repetições entre andares melhoram o nível da carta. As cartas persistem no salvamento da expedição e desaparecem na morte, extração ou retorno seguro; a árvore continua permanente.
- Força, críticos, explosões, ricochetes, fogo, gelo, cura, riqueza, mobilidade, tolerância rítmica, armadura, bombas, carga, crescimento e segunda chance. Cartas de ataque ativam automaticamente ou por chance a partir de golpes reais. Avisos de ativação aparecem junto ao combate; o rodapé mostra os efeitos e níveis.
- Criaturas têm mais vida e causam mais dano. Cristais e três tipos de rocha têm resistência mínima a golpes normais, inclusive com picareta forte. Críticos e explosões podem romper esse limite. Rochas bloqueiam rotas até serem quebradas; a animação do dash acompanha o caminho real.
- O retorno revela até quatro grupos de recursos por página, com contagem e sinos. OK faz as gemas voarem para seus contadores. Os valores são creditados uma única vez; a apresentação não concede recursos adicionais. A base tem uma trilha suave própria.
- `dist/cards.js` define o catálogo; `dist/rewards.js` distribui o saque; `dist/return-screen.js` apresenta a extração; `dist/expedition.css` contém os novos painéis.
- QA: 48 testes cobrem as regras, os 20 efeitos, repetição, migração, resistência, caminhos, extração e progressão até o andar 16. Para inspecionar a interface controlada, abra `/expedition-preview.html` no servidor de testes (porta 4174). O cenário usa outro armazenamento e não altera a partida da porta 4173.

## Padrão de texto · Alpha 0.7

Títulos grandes e uma frase direta por efeito. Cartas usam nome de 25 px, efeito de 21 px e valores de 18 px; painéis usam títulos de 26–42 px e explicações de 18–20 px. Preserve limites e números, sem parágrafos longos. As cartas mostram o benefício primeiro e a melhoria concreta logo abaixo, como +4 → 8 vida por cristal. Habilidades, botões, avisos e saque seguem a mesma hierarquia. Em telas menores, reorganize e permita rolagem em vez de reduzir a letra até ficar ilegível. `dist/readable.css` centraliza essa hierarquia. A árvore mantém os nomes separados e o painel da habilidade acompanha a rolagem.

## Estrelas e missões · Alpha 0.9

- Pontos por expedição, separados das gemas. Até cinco estrelas, concedidas uma única vez ao cruzar 50%, 70%, 90%, 110% e 130% da referência fixa. A referência é 1.800 pontos × quantidade de andares desbloqueados ao iniciar; não é uma porcentagem de precisão ou um máximo teórico.
- Pontuação nos primeiros 64 pulsos de cada andar. Ação útil: 10 pontos; dano real: 2 por HP; quebra: quartzo 30, prisma 60, geodo 100, vital 40, rocha 15, criatura 60. Completar no prazo dá 100 + 4 por pulso restante. Tudo recebe o multiplicador de combo: +0,25 a cada cinco acertos, até ×3. Erros quebram o multiplicador. Golpes vazios e entradas repetidas não concedem pontos; explosões e procs pontuam pelo dano real, sem contar dano excedente.
- A janela limita a geração infinita de pontos na mesma sala. A exploração pode continuar depois dos 64 pulsos; descer abre outra janela. Pausas, menus e base não avançam o relógio. Estrelas são guardadas ao conquistar e sobrevivem à morte; voltar à base não paga novamente.
- Oficina Estelar: Kit de resgate (12/24/36 estrelas), Elevador solar (18/36/54), Lapidação astral (20/40/60). Cada nível dá, respectivamente, +1 cura inicial, +1 carga por andar ou +5% de gemas dos cristais. São melhorias permanentes, com três níveis.
- Missões: 20 modelos, três ofertas aleatórias e uma ativa. Prazo de exploração: comum 4 minutos, rara 5, dourada 6. Objetivos incluem tipos de cristal, rochas, criaturas, itens, combos, pontos e andares. Progresso e prazo persistem após morte, saída e recarga. Na base, em pausa ou em andar concluído, o relógio para. Ao completar, o prazo para e a recompensa fica disponível para entrega na base.
- Recompensas por entrega: comum 200 gemas + 1 essência; rara 500 + 3; dourada 1.100 + 6. Missões não concedem estrelas, preservando o limite de cinco por expedição. Recompensa entregue uma vez. Missões vencidas podem ser substituídas. Abandonar não sorteia outras ofertas; novas ofertas vêm após uma expedição ou entrega.
- Chances por oferta: 25% rara e 5% dourada. Olho de Ouro, ligado a Olhar lapidado, custa 220 gemas e 5 essências; eleva as chances para 35% e 10%. É passivo, sem ocupar a build.
- Arquivos: `dist/stars.js` e `dist/missions.js` contêm regras; folhas de estilo de mesmo nome contêm a apresentação. Salvamentos antigos recebem os novos campos sem perder progresso. A suíte atual tem 97 testes. A expedição automatizada de 16 andares superou a referência e ganhou cinco estrelas sem injetar carga.
## Movimento e habilidades · Alpha 0.10

- Movimento inicial de 4 casas por pulso. Passo Espectral soma 1/2/3 casas quando equipado; cartas somam movimento, até 10 no dash e 7 na esquiva. Rochas continuam bloqueando o caminho.
- Seis habilidades têm três níveis: Passo Espectral, Punho Firme, Segundo Fôlego, Impacto Pesado, Onda de Choque e Ruptura. Melhorias custam gemas e essências, apenas na base. Saves antigos recebem nível 1 nas habilidades aprendidas.
- Tab no cenário abre a árvore e pausa ritmo, inimigos e missões. Escape ou Voltar ao Jogo fecha; em outros menus Tab mantém a navegação por teclado. Q troca o alvo.
- Cristais e rochas têm mais vida e golpes mínimos; inimigos têm mais vida, dano e reforços. Atordoamento permanente foi substituído por ativações a cada 5/4/3 golpes. Segundo Fôlego cura 3/6/9 a cada 8 acertos; cura automática por ação removida.
- Ações vazias quebram combo e drenam fôlego, sem conceder pontos ou efeitos. A simulação de jornada reage aos avisos de ataque e usa itens reais coletados.
- Base só mostra os nomes das construções. Avisos curtos com contraste, sem instrução permanente no meio do cenário. Painel apresenta efeito atual, próximo nível e custo.
## Chefes dos biomas · Alpha 0.11

- Andares 4, 8, 12 e 16 são arenas. Rei Geodo (140 HP, círculo), Matriarca Raiz (240 HP, cruz), Titã Fóssil (380 HP, metade alternada da arena) e Boss Místico (560 HP, selo seguro alternado com runas).
- Só derrotar o chefe libera a carta e o elevador. Carga e combo não substituem a vitória. Recompensas: 180/320/500/900 gemas e 3 essências por arena; entrega normal e uma única vez. Os selos permanentes continuam abrindo os biomas seguintes.
- Avisos de 3 pulsos nos dois primeiros chefes e 2 nos últimos. Após cada ataque, 4 pulsos de vulnerabilidade. Armadura recebe 20% do dano; limite compartilhado por pulso de 1/12 da vida, incluindo explosões e procs. Chefes resistem a atordoamento e congelamento. Abaixo de metade da vida, entram em fúria (+20% no dano dos próximos ataques).
- A esquiva exige sair da área marcada. Invulnerabilidade só vem de Contratempo e do item Escudo de Eco. O selo do Místico é escolhido entre os mais próximos e cabe em dois movimentos de quatro casas a partir de qualquer posição da arena.
- Quatro novas trilhas originais com acordes sustentados e pulsos em 92/100/108/116 BPM. As músicas normais continuam com 116/128/140/152 BPM. Mesmo mapa de tempo para áudio, inimigos e entrada do jogador.
- Arte dos chefes incluída no gerador HEPT32 e no ateliê (quatro variantes). Barra grande de vida, nome do ataque, instrução curta e contagem. Terreno sem rochas nas arenas; cristais seguem disponíveis para recursos e cura.
- Salvamentos preservam vida, ciclo e ataque preparado. Salas antigas em andamento continuam com sua regra original; novas arenas usam os chefes. QA isolado: /expedition-preview.html?boss=16; &freeze=1 apresenta a arena pausada sem a cobertura para inspecionar a arte.
## Fim de andar seguro · Alpha 0.12

- Ganhos do andar aparecem imediatamente: gemas, essências, estrelas e pontos, calculados a partir do início daquele andar. Não há pagamento extra no resumo. Saves antigos sem a referência mostram a mochila atual.
- Nos Andares, cartas aguardam 1 segundo, soltura dos controles e 400 ms sem entradas. Clicar apenas seleciona; ESCOLHER confirma. No Abismo, a escolha dura quatro segundos, usa uma proteção inicial curta contra cliques em andamento e aplica a carta com um clique. Não há foco automático em uma carta.
- Confirmar a carta bloqueia descida/retorno por mais 900 ms e exige soltura. Cliques e teclas repetidos prolongam o bloqueio. Tab continua navegando nas opções disponíveis.
- DESCER tem destaque e pulsação suave; VOLTAR À BASE é secundário e abre confirmação com FICAR NA MINA como foco inicial. A confirmação também tem um bloqueio breve.
- Descer preserva o valor exato do fôlego, inclusive frações, chefes e vida quase esgotada. Cura automática de +15 foi removida; itens e habilidades continuam curando. A jornada completa continua validada.

## Cartas claras · Alpha 0.13

- As 20 cartas têm nome grande, função visível (cura, defesa, dano, utilidade), uma frase de efeito e valor atual → próximo nível. Sem “cópia”, milissegundos ou contadores de batidas no texto das cartas. A árvore também usa descrições curtas do benefício.
- Toda nova oferta inclui sobrevivência, ataque e uma terceira opção aberta. Melhorias já no limite saem do sorteio, considerando Passo Espectral e Amigo do Jardim. Os IDs antigos foram mantidos para preservar cartas salvas.
- Pipoca: 35% por golpe, dano 4 por nível + 50% da força arredondado, raio 2. Raio: 25%, dano 5 por nível + 60% da força, cruz de alcance 5. Toc Toc: 40%, dano 3 por nível + 50% da força. Ricochete: cada golpe atinge outro alvo a até 5 casas, dano 2 por nível + 35% da força. Sorte: 20% por nível, máximo 60%, dano dobrado. Chances usam sementes determinísticas; efeitos não ativam recursivamente.
- Fogo: 2 de dano por nível durante os 3 pulsos seguintes. Açúcar: 4 de cura por nível ao quebrar cristal. Lanchinho: 8 de cura por nível ao matar, além da recuperação básica. Último Fôlego: 2 por nível ao atingir inimigo com menos de 40% de vida; deslocamento e mineração não curam por essa carta.
- Casca: reduz ataques em 15% por nível, máximo 60%. Gelo: 40% por golpe para enfraquecer por 4 pulsos, reduzindo dano em 25/30/35/40/45%; inimigos comuns também param brevemente. Chefes mantêm avisos, ciclos e áreas de ataque. Seu limite de dano por pulso permanece.
- Presente Explosivo: 50% por inimigo derrotado para ganhar 1/2/3 bombas, limitado ao inventário. Ritmo Fácil: +8% de tolerância por nível, máximo 40%, aplicado sobre a janela vigente. Outros efeitos de economia, movimento, crescimento e vida extra preservam seu papel.
- Ativações anunciam o resultado (VIDA +N, EXPLOSÃO, DANO DUPLO), com intervalo visual para não empilhar o mesmo aviso. Cura só anuncia vida realmente recuperada. O saldo de vidas extras no rodapé atualiza ao usar uma.
- Validação: 89 testes; probabilidades determinísticas, cura condicional, limites, sinergias, gelo no chefe, morte, recompensas únicas e expedição completa. O jogador de teste agora prioriza dano ao chefe em arenas, em vez de coletar carga que não conclui essas salas. Prévia isolada: /expedition-preview.html?cards=1.

## Vila interativa · Alpha 0.15

### Layout ampliado do Refúgio e da Trilha

- O Refúgio ocupa a janela abaixo do cabeçalho. Saldos ficam no topo, experiência e cristais nas bordas inferiores; as construções continuam sendo a navegação. As áreas de clique acompanham o tamanho e a posição do canvas, inclusive em telas estreitas.
- A Trilha da Fortuna usa quase toda a janela. Tabuleiro e escolhas têm rolagem independente; dados, rotas, ferramentas e mochila ficam ao lado. Cofre, criação de ferramentas e regras expandem sob demanda sem comprimir o tabuleiro. No celular, as áreas se empilham com rolagem.
- A prévia de destino e o acompanhamento do boneco usam a escala real do desenho, inclusive após redimensionar a janela. Economia, chances, progressão e música permanecem iguais.

- A vila ocupa toda a largura da área de jogo, com seis construções separadas e caminhos mais largos. Quadro de missões e oficina estelar usam o mesmo gerador de arte HEPT32. Os atalhos duplicados abaixo do cenário foram removidos; o elevador inicia a descida.
- Áreas de clique acompanham as construções e o redimensionamento do cenário, com navegação por teclado e nomes acessíveis. Na base, o estado da missão aparece diretamente sobre o quadro.
- Aceitar uma missão fecha a janela imediatamente. Ao reabrir, a ação principal volta à vila; abandonar fica dentro de “Trocar missão”.
- Novas missões de combo exigem 30, 42 ou 54 acertos, conforme a raridade. Ofertas antigas ainda não aceitas recebem a nova meta sem trocar sua identidade. Contratos já aceitos preservam meta e progresso.
- 97 testes aprovados, incluindo migração das ofertas de combo, cores e orçamento de detalhes das novas construções. Acesso às construções e aceite de missão verificados na prévia isolada.

## Zag · Trilha da Fortuna e AFK

- Um passe e um fragmento a cada **60** cristais destruídos no Abismo (antes: 12; queda de 80% na frequência). Saves v1–v3 preservam passes, dados, recursos e a fração do passe em andamento. AFK não continua após fechar o painel ou reiniciar o jogo.
- Três caminhos: Segura entrega cristais/proteção; Oficina entrega fragmentos/ferramentas; Ousada tem tesouros triplos e selos exclusivos. Sol, Lua e Raiz juntos geram uma engrenagem; repetidos geram dois fragmentos. O preço dos selos é 10% da mochila, bloqueável por escudo. Perigos e benefícios são previstos antes de gastar um dado.
- Engrenagens compram até três níveis de Baú (+10% de minerais do tabuleiro por nível), Escudo (−20% de perdas por nível) ou Dado (+1 ajuste de face por mão por nível). Também compram um kit com uma carga de cada ferramenta, mantendo utilidade após completar os módulos. Nenhum módulo aumenta atributos na caverna.
- AFK compara destinos de todas as faces e rotas e os ajustes gratuitos. Considera tesouros, penalidades, escudo, sorte, peças faltantes e cofres. É uma heurística dos destinos visíveis, sem antecipar sorteios. Usa mão/reserva antes de consumir novos passes; não gasta ferramentas, engrenagens ou investimentos. Ao acabar, guarda a mochila e para. Funciona com o painel aberto, inclusive em outra aba; a cadência pode diminuir se o navegador limitar temporizadores.
- No máximo **dois dados extras por passe pago**; depois, casas de dado dão um fragmento. Assim, cada passe entrega no máximo oito movimentos (seis da roleta + dois bônus), sem ciclo de dados infinito em AFK. Simulações e testes não substituem balanceamento com sessões humanas prolongadas.
- Inspiração: aprimorar ferramentas de decisão, em vez de depender só da rolagem, como em [Dice Forge na adaptação oficial do Board Game Arena](https://en.boardgamearena.com/news?id=383). O tabuleiro usa regras próprias e a arte HEPT32 existente.

## Histórico: Forja do Refúgio · Alpha 0.14 (substituída pela curva 0.26)

- Oficina ilustrada com minerador, fornalha, bigorna, ferramentas e estoque de cristais. A composição reutiliza o gerador vetorial HEPT32. Fogo, brasas, cristais lançados e marteladas respeitam a opção de efeitos suaves e a preferência de movimento reduzido.
- A picareta mantém as melhorias existentes. Quatro novos projetos têm três níveis permanentes, com custos por nível: Bigorna Rúnica (600 / 1.800 / 4.800), Placas de Proteção (900 / 2.700 / 6.500), Alambique Vital (750 / 2.200 / 5.600) e Cofre de Resgate (1.200 / 3.500 / 8.500). Total dos novos projetos: 39.050 gemas.
- Bigorna soma 1/2/3 de força; placas reduzem ataques em 5/10/15%, multiplicando com a defesa de cartas; alambique aumenta a cura das poções para 30/35/40; cofre salva 60/70/80% do saque ao morrer ou resgatar. Retorno seguro continua guardando 100%.
- Bigorna e alambique exigem recordes 0/4/8; placas e cofre exigem 4/8/12. A interface informa o andar necessário. Depósitos e construção só funcionam na base.
- JOGAR investe um lote das gemas guardadas (aproximadamente 1/4 do projeto, até 1.000), limitado ao saldo e ao restante. Cada depósito é gasto e salvo imediatamente; progresso persiste entre partidas, mortes e recargas. Completar o investimento habilita CONSTRUIR. Só construir aplica o benefício; não cobra novamente.
- Interface bloqueia ações durante a animação. Fechar a janela não perde uma transação já salva. Conclusão mostra FORJADO, benefício e som de recompensa. Novos níveis aparecem como objetivos seguintes.
- Saves existentes recebem projetos vazios sem perder progresso. Investimentos inválidos são rejeitados. Sete novos testes cobrem economia, desbloqueios, limites, persistência e efeitos reais; suíte completa com 96 testes aprovados. Prévia isolada: /expedition-preview.html?forge=1.

## Histórico: primeiro polimento de teleporte — substituído pelo movimento em pulos

- Teleporte de 160 ms, rota real, custos de movimento e janela musical preservados. Câmera com zona central estável e aproximação exponencial, calculada depois do movimento. Margem de segurança mantém o personagem visível. Entrada de andar e modo suave enquadram imediatamente. Tremor durante o teleporte reduzido para 35%.
- Sprites procedurais reutilizados em cache LRU de 96 imagens, inclusive pós-imagens. Névoa e minimapa recompilados só quando a visibilidade muda. Entidades fora da tela descartadas antes da ordenação. Removida leitura de layout por quadro do minimapa. Tempo visual acompanha o relógio real após engasgos, sem criar atraso acumulado.
- Teste reproduzível: `node tests/visual-server.mjs`, depois `http://127.0.0.1:4174/movement-performance.html`. Não usa o save do jogador. Percurso determinístico em caverna de 42 × 30. Botões para 3.600 quadros e 36.000 quadros (dez minutos simulados a 60 Hz), mais exploração animada.
- Medição local no navegador: antes 4,53 ms de média / 6,20 ms p95; depois 0,46 ms / 0,70 ms, nos mesmos 3.600 quadros. Simulação de 36.000 quadros: 0,40 ms de média / 0,50 ms p95; primeiro bloco 0,44 ms, último 0,40 ms, no máximo dez pós-imagens. Mede custo CPU de atualização/desenho isolado, não FPS final, GPU, áudio ou uma partida real de dez minutos. Não implica ausência de gargalos em todo hardware.
- Validação: suíte de 219 testes aprovada; teste adicional de reutilização/expulsão de sprites aprovado. Cobertura específica de câmera em diferentes FPS, pausas, limites, névoa após exploração e reset, rotas, Abismo e efeitos suaves.
- Referências primárias: [Ryan Clark sobre resposta no ritmo em NecroDancer](https://www.gamedeveloper.com/audio/game-design-deep-dive-finding-the-beat-in-i-crypt-of-the-necrodancer-i-), [Jochen Heizmann sobre a câmera de Tiny Thor](https://www.gamedeveloper.com/design/camera-logic-in-a-2d-platformer), [MDN: otimização de canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas). A implementação de câmera é própria; não reproduz código de NecroDancer.

## Movimento em pulos e estabilidade do Abismo

- Personagem percorre cada casa da rota em pequenos pulos (100–300 ms no percurso completo), com rastro curto; o combate mantém seu relógio. Câmera segue o chão, sem acompanhar a altura do salto, sem enquadramentos instantâneos durante a ação. Velocidade de câmera limitada; tremor reduzido. Efeitos suaves preservam a câmera amortecida.
- O Abismo rebasa câmera e objetos juntos. Decoração usa linhas absolutas para não saltar na renovação das faixas. Fundo não é mais reconstruído em cada faixa; só terrenos e paredes visíveis são desenhados durante a rolagem.
- Gargalo reproduzido no navegador: cache de 96 sprites por instância entrava em expulsão/recriação contínua. Agora aparências geometricamente iguais compartilham pixels; até 256 superfícies são reutilizadas, incluindo as expulsas, com resolução menor para sprites pequenos. Não altera a paleta nem o gerador de arte.
- Teste completo isolado: iniciar `node tests/visual-server.mjs`, abrir `/expedition-preview.html?abyss&soak` e CONTINUAR. A fixture automatiza ações na interface e mantém vida/fôlego para ensaio prolongado; não mede dificuldade. Som pode ser ativado. Relatório mostra custo CPU do quadro/desenho, intervalos reais, erros, entidades e reconstruções do fundo. Dados ficam somente no save da porta 4174. Botão TESTAR TRAVADA simula 650 ms: partida deve pausar mantendo o estado, e CONTINUAR retoma.
- Primeira amostra local com a interface real: desenho médio 34,4 ms, p95 276,6 ms, máximo 781,4 ms. Amostra posterior de 80 s: desenho médio 3,0 ms, p95 4,9 ms, máximo 14,3 ms; 46 inimigos e 77 cristais. Rotas e carga variam conforme ações; números diagnósticos, não benchmark idêntico nem promessa de FPS. Intervalos externos acima de 500 ms ainda podem ocorrer e acionam pausa protetora antes de avançar o relógio.
- Continuar no navegador nesta etapa. A causa encontrada é reaproveitamento incorreto no renderizador Canvas, não limite demonstrado da plataforma. Próximo passo, se necessário após novas medições em máquinas de entrada: atlas e renderização WebGL com Phaser/Pixi; separar lógica de combate e apresentação. Empacotar a página como desktop, por si só, mantém o mesmo gargalo. Referências: [otimização de Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas), [OffscreenCanvas e trabalho fora da thread principal](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas), [renderização do Phaser](https://phaser.io/tutorials/phaser-4-rendering-concepts).

## Teia, Relicário e economia 02

- Teia de 223 nós, seis setores, 24 marcos maiores e seis maestrias de ganhos decrescentes. Arraste, zoom, atalhos por setor, soma efetiva dos bônus e destaque dourado nos nós completos. Os pontos vêm de experiência; cinco habilidades e três ecos podem ser equipados.
- Relicário: 35 estrelas por oferta salva de três ecos inéditos entre 30; escolha um permanentemente. Não aceita outra invocação antes de resolver a oferta. As três relíquias fundadoras continuam disponíveis.
- Economia: coleta base a 55%, bônus pessoais aditivos, ambiente limitado a 3,5x, dificuldade do Abismo baseada na seção absoluta, veios com pagamento fracionário acumulado. Forja v3 migra investimentos v2 e devolve excedentes sem remover níveis comprados.
- Análise completa e lista de conquistas: `dist/balance-report.html`. Catálogo de 30 fáceis e 20 muito difíceis em `dist/steam-achievements.json` e `.csv`; não há integração Steamworks ou novos contadores de conquistas nesta etapa.
- Reproduzir as seis simulações: `node tools/balance-sim.mjs`. Dados em `asset-work/balance-results.json`. Gerar relatório e catálogo: `node tools/export-balance-report.mjs`.
- Prévia isolada: servidor `tests/visual-server.mjs`, endereço `/expedition-preview.html?talents` na porta 4174. Usa somente o save de teste dessa porta. Navegar depois para `/` preserva as escolhas para testar reload. O jogo normal continua na porta 4173.

## Correção de chefes e Poço — outubro de 2026

- A classificação de andar de chefe vem do número do andar, não de uma flag opcional do save. Conclusão e descida exigem chefe derrotado e nenhuma criatura-chefe viva. Saves com chefe vivo e sala marcada como concluída voltam à batalha; salas antigas sem chefe são reconstruídas, preservando vida, mochila e progressão.
- Vida e nome são desenhados junto à criatura; o painel amplo continua apenas para acessibilidade. Avisos de perigo no chão permanecem visíveis.
- Escudo do Poço reaparece por andar/seção, sem curar. Explosões obedecem aos limites de dano dos chefes. Bônus comprados não mudam após melhorias ou recarga.
- Verificação desta revisão: 281 testes aprovados; cenários adicionais de AFK com 32 sementes, limite finito de dados e migrações de saves. Boss, Zag e Poço conferidos na porta isolada 4174, sem erros de console. Prévia visual em `asset-work/boss-hud-compacto.png`, `asset-work/zag-afk-preview.png` e `asset-work/poco-simples-preview.png`. A porta 4173 e seu save não foram usados para testes.
