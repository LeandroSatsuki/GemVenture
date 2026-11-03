# Evolução dos bosses — definição de mecânicas

Data: 31/10/2026. Estado: pesquisa e proposta inicial; nenhuma mudança no combate,
na arena, na arte ou nas animações foi aplicada. O usuário pediu validação da
mecânica antes da conversão visual. A skill especializada está em
`skills/gemventure-boss-design/` e sua cópia instalada em
`C:/Users/lpsan/.codex/skills/gemventure-boss-design/`.

## Diagnóstico da implementação

Foram inspecionados os sete encontros da campanha, nos andares 5, 10, 15, 20, 25,
30 e 35. Os hashes das dez fontes e a amostra seed 41001 estão em
`outputs/boss-evolution-v1/baseline.json`, no workspace Diorama.

Fatos verificados:

- `bosses.planBossAttack` centraliza diferenças de desenho/tempo dos ataques.
  Matriarca, Titã e Místico têm padrões espaciais diferentes, mas a resposta
  predominante continua sendo trocar de posição para não sofrer o impacto.
- O Geodo tem empurrão e pilares temporários; seu pulso periódico atual não causa
  dano de vida. Não é correto descrevê-lo como apenas um slam genérico.
- O Micelial já tem uma condição diferente: corpo intangível e dano por núcleos.
- Novos Barões Cenoura usam `rabbitMechanic: 2`, com isca para atingir filhotes e
  motim. Bater diretamente no filhote é bloqueado nessa versão. O fluxo antigo
  ainda existe para compatibilidade e não deve ser tomado como comportamento novo.
- A arena lógica tem 21×15 células, interior aberto de 19×13, enquanto lajes e
  massas em `boss-arena.js` são apresentação decorativa sem novos obstáculos.
  A nova sala é preservada como base; uma mecânica não exige redesenhá-la inteira.
- O relógio já é compartilhado por música, input e criaturas. As músicas dos
  bosses têm BPM próprios, de 92 a 116 nesta baseline. Não será necessário um
  relógio de animação para controlar as decisões de combate.
- Há uma ação por batida. O deslocamento básico permite até quatro células por
  ação, sujeito ao caminho; clicar no boss pode escolher uma aproximação automática.
- O renderizador usa Canvas 2.5D, geometria projetada e imagens/atlas, com caminhos
  especiais para Geodo, toupeira e coelho. Não presumir um único modelo 3D universal.

Limite da prova: inspeção de código e geração em memória, sem playtest completo
dos sete bosses nesta etapa. Este diagnóstico não aprova a aparência nem a diversão.

## Referências e adaptação

| Fonte primária | Princípio observado | Aplicação proposta |
|---|---|---|
| [Hi-Fi Rush — Xbox Wire](https://news.xbox.com/en-us/2023/01/25/hi-fi-rush-preview-out-now-hands-on/) e [dicas do diretor](https://news.xbox.com/en-us/2023/07/05/hi-fi-rush-arcade-challenge-update-tips/amp/) | Ataques e pistas obedecem ao ritmo; resposta acompanha o pulso. | Preparação, oportunidade e impacto do boss usam a música real, com sinais visuais e sonoros equivalentes. |
| [Crypt of the NecroDancer — SYNCHRONY 3.7.0](https://braceyourselfgames.com/updates/crypt-of-the-necrodancer/synchrony-v3-7-0/) | A conquista de Dead Ringer confirma a possibilidade de usar o ataque dele contra ele mesmo. | Preservar esse tipo de decisão no Barão, onde já existe; não duplicá-lo em todos. A fonte não detalha toda a luta. |
| [Titan Souls — relato de Mark Foster](https://blog.playstation.com/archive/2015/04/02/titan-souls-game-jam-playstation-store) | O ponto fraco é o objetivo central de um duelo. | Transformar o boss em um problema legível de mineração/posicionamento, sem importar morte em um golpe. |

As propostas abaixo são design próprio para o GemVenture. As referências não
provam que serão divertidas nem que suas soluções já estão no nosso motor.

## Primeiro boss proposto: Rei Geodo

**Nome da mecânica candidata: Coroa Fraturada.**

Ideia em linguagem de jogador: encontre o lado onde a coroa está rachada, vá até
ele e dê a picaretada no ritmo. Quebre as placas e aproveite a abertura para
acertar o núcleo. A luta passa a pedir **ler → flanquear → minerar → aproveitar**.

Por que começar nele: é o primeiro chefe, tem vínculo direto com mineração e
cristais e uma música de 92 BPM. Permite ensinar uma regra simples com espaço de
leitura, sem novos botões, consumíveis obrigatórios ou uma nova infraestrutura
de projéteis/parry. Isso não autoriza regenerar a arte atual do Geodo.

### Ciclo candidato, com números provisórios

| Etapa | Informação e ação do jogador | Regra proposta |
|---|---|---|
| Anúncio, duas batidas | Uma fissura e um som indicam o flanco da próxima placa. | O boss fixa essa orientação; não gira perseguindo o jogador no último instante. |
| Fratura, até quatro batidas | Mover até o lado indicado e acertar com a picareta. | Um ataque primário válido fratura uma placa. Um golpe no lado protegido continua sendo ação rítmica válida, mas dá feedback de armadura e não progride a placa. |
| Próxima placa | Reposicionar-se e repetir a regra, agora em outro flanco anunciado. | Três placas por ciclo como ponto de partida; o progresso das placas não é apagado por um erro de timing. |
| Núcleo aberto, quatro batidas | Usar o dano da build na oportunidade. | Dano segue as regras/teto existentes durante a janela; a duração final depende do teste com build básica e forte. |
| Recuperação | Ler o início do ciclo seguinte. | O núcleo perde a exposição e a coroa se fecha para outro ciclo. O HP perdido não volta. |

Se a janela de uma placa terminar sem quebra, anunciar novamente uma posição
alcançável; não acumular ataques ou apagar placas já fraturadas nesse ciclo.
Não exigir apertar duas coisas na mesma batida nem ficar sem agir para ouvir.

**Segunda fase candidata:** manter o mesmo verbo e fazer uma troca de flanco
anunciada adicional, com reação corporal mais enérgica. Não aumentar o BPM nem
adicionar uma nova prova de memória nesta primeira hipótese. Padrões de área
podem ser avaliados depois como apoio, sem voltarem a ser a identidade da luta.

### Regras que ainda precisam de protótipo autorizado

- O flanco será definido no mundo por coordenadas relativas ao boss e conferido
  na câmera; não por girar a imagem em CSS. Quantidade de lados e sua leitura
  devem ser confirmadas antes de produzir vistas finais.
- A autoaproximação atual pode escolher o lado errado. Será necessário respeitar
  a posição/flanco pretendido; isso não está resolvido só por desenhar uma fissura.
- Fratura conta no máximo uma vez por ação primária. Pet, fogo, explosão ou proc
  não devem completar o quebra-cabeça acidentalmente. A build continua importante
  na janela do núcleo; interações opcionais precisam de aprovação própria.
- A proposta de proteção durante as placas é diferente do multiplicador de
  armadura atual. Precisa de validação; não foi aplicada uma mudança de dano.
- Testar alcance de cada posição, duração com dano básico e máximo, tempo de
  espera, leitura da fissura, transição de janela e restauro. Os números acima
  ainda não são balanceamento final.
- Não deve haver loot nas placas, farm de estrelas, alteração das recompensas,
  pagamento duplo ou saída liberada antes da derrota real.

### Sala e custo

Manter a nova sala aberta. Para esta hipótese, nenhum obstáculo funcional novo
é necessário. Reservar circulação ao redor do boss; pistas de flanco pertencem
à apresentação da mecânica, sem fingir colisão em lajes decorativas.

Custo relativo estimado: **médio**, não trivial. Reuso: relógio, navegação,
ataque, vulnerabilidade e arena. Trabalho novo: orientação semântica, integridade
das placas, seleção de flanco, feedback de bloqueio, eventos e save. Alterações
futuras seriam localizadas no comportamento do Geodo/consumidores, sem refazer
o sistema dos outros seis bosses.

### O que será definido depois do aceite

1. Protótipo de combate com formas simples, sem arte final e sem alterar a versão
   oficial antes da autorização correspondente.
2. Direção visual: componentes da coroa, fissuras, núcleo, rosto e silhueta. Manter
   o Geodo reconhecível, Cosmos e perspectiva da caverna; validar vistas necessárias.
3. Animação: idle com peso, olhar acompanhando o jogador, giro comprometido,
   preparação da placa, trinca, reação, núcleo aberto, recomposição e derrota.
   Pivôs e camadas próprios; não esticar o corpo para simular movimento.
4. Impactos/sons: sincronizados aos eventos, preservando leitura no modo suave.
5. Luta completa no jogo, com seed e câmera comparáveis, antes de encerrar o boss.

Essas animações são requisitos propostos, não clips já produzidos.

## Demais bosses: perguntas para próximas fichas

São direções a investigar, não mecânicas aprovadas ou um pacote para implementar.

| Boss | Pergunta que deve orientar sua ficha |
|---|---|
| Matriarca Raiz | Como o jogador interrompe ou corta uma ligação viva, em vez de apenas sair da cruz? |
| Titã Fóssil | Como desmontar uma estrutura ou explorar um comprometimento de postura sem repetir a coroa do Geodo? |
| Boss Místico | A identidade no bioma de magma faz sentido? Uma resposta de frase/espelho usa os comandos atuais sem silêncio punitivo? |
| Soberano Micelial | Como tornar os núcleos uma decisão de prioridade/ligação legível, preservando a diferença que já existe? |
| Rei das Tocas | Como o rastro ensina a antecipar/interceptar a emergência, em vez de só fugir do círculo? |
| Barão Cenoura | A isca, o filhote afetado e o motim atual são compreensíveis e responsivos? O que falta é regra ou apresentação? |

## Estado e próxima decisão

Skill e diagnóstico prontos. Mecânica Coroa Fraturada proposta para avaliação.
Nenhum boss, mapa, renderizador, som, animação, save ou economia foi modificado.
A próxima decisão é aceitar ou ajustar essa mecânica do Rei Geodo antes de
iniciar o protótipo e a direção visual. Não publicar como atualização implementada.


## Primeiro protótipo autorizado — Rei Geodo / Coroa Fraturada — 31/10/2026

O usuário aprovou a proposta acima e autorizou o primeiro protótipo, incluindo a conversão procedural, perspectiva e animações. Este registro substitui apenas o estado de decisão anterior; o histórico do diagnóstico permanece.

Prévia isolada: http://127.0.0.1:4220/ . Núcleo real de combate/World do jogo, com sobreposição optativa para o Geodo. O runtime oficial não foi modificado. A implementação e sua aparência ainda aguardam avaliação humana; não publicar como versão instalada.

Preparação de 2 batidas, oportunidade de 4 batidas, três placas por ataques primários no flanco indicado; núcleo abre na batida seguinte por 4 batidas e recompõe por 2. Falha preserva placas. Autoaproximação não resolve o flanco. Os três lados exigidos nesta candidata são W/E/S para manter o jogador visível na câmera; avaliação geométrica suporta N também. Guardada frontal em uma célula, sem obstáculos novos. O dano do núcleo recebe ressonância específica da candidata, mantendo o teto compartilhado de dano por batida. Aos 50% de HP muda a sequência, sem acelerar o BPM.

Arte nativa Cosmos64/câmera da caverna: coroa tripla, quartzo azul, 33 componentes semânticos, peito com duas placas articuladas, quatro vistas, giros reais, fratura, punho, abertura, recomposição e derrota. São 24 clips e 1.568 quadros. VFX separados de aura, fissura e faíscas adotam a sugestão de explorar efeitos fluidos; isso não vira regra global de estilo.

Verificação: 878 testes existentes na primeira candidata; 21 regressões focadas após refinamentos do punho/eventos; 13 testes novos no estado final. Seed 41001: luta básica roteirizada termina em 92 batidas, aproximadamente 60 s. Demonstração no navegador chegou à vitória, com teclado/pausa conferidos. Nove módulos oficiais permaneceram iguais por SHA-256. Preferência visual, balanceamento humano e benchmark de desempenho continuam pendentes.

Arte e fontes na cópia Diorama do workspace. Relatório completo e recibo: C:\Users\lpsan\Documents\Codex\2026-10-25\x20-https-github-com-leduardo99-diorama-2\outputs\geode-crown-test01\relatorio.md e `validation.json` no mesmo diretório. Controles de prévia, comparação, limitações e arquivos alterados estão no relatório. Não alterar os outros seis bosses nem integrar esta candidata sem a decisão seguinte.


## Revisão 2 — monólito ancorado e animação rápida — 31/10/2026

Após o primeiro teste, o usuário pediu corpo mais baixo, sem pernas, braços longos separados e base fixa, usando o concept de monólito oco recebido. Solicitou leque frontal, sem mostrar as costas, e fratura da coroa claramente visível e audível.

Candidata isolada em http://127.0.0.1:4221/ . O Teste 01 e o runtime oficial permanecem preservados. A arena não foi redesenhada; o boss da prévia foi ancorado em (10,3), perto do norte, com circulação traseira. São cinco vistas E/SE/S/SW/W, giro real com 33 amostras, base independente e braços sólidos sem alongar a imagem. Um golpe pode atingir atrás sem mudar o olhar.

Giro de 0,60 para 0,28 batida; punho para 0,30; reação de fratura para 0,45; repouso de quatro para 1,5 batida. Mantidos BPM, avisos, janelas, dano do protótipo e recompensas. Cavidade escura construída por partes, três gemas no interior e coroa com suportes isolados; mais contraste localizado, sem mudança da luz/câmera/paleta globais.

Correção factual sobre o Teste 01: as funções de VFX existiam, mas estavam inseridas num método que o desenho atual não chamava. Nesta candidata, o consumidor real chama o sinal do piso antes dos atores e a fratura acima do corpo. Cristal ativo destacado no socket; quebra com fragmento volumétrico grande, estilhaços, faíscas e estalo/chimes no canal SFX. Também corrigida a orientação da terceira quebra.

18 folhas nativas/typecheck sem falhas; 1.339 células frontais sem cortes; base invariável nos 33 ângulos. 19 testes novos e 21 regressões existentes passaram. Preferência visual, sensação de impacto e benchmark de desempenho continuam pendentes de avaliação. O botão Ver quebra da QA pausa após um evento real para inspecionar a consequência.

Relatório e recibo: C:\Users\lpsan\Documents\Codex\2026-10-25\x20-https-github-com-leduardo99-diorama-2\outputs\geode-crown-test02\relatorio.md e validation.json no mesmo diretório. Sem integração no runtime oficial ou publicação.

Validação final da candidata v2: suíte completa com 881 testes existentes, 19 testes locais e auditoria da base passaram. Demonstração com vitória e elevador liberado conferida no navegador; nenhum erro no console. Enquadramento permanece estável ao remover o boss derrotado e volta ao normal na próxima sala. Fotos de comparação, fratura normal/suave e vitória estão no relatório. Ainda aguarda avaliação humana.


## Matriarca Raiz — Teste 01 — 01/11/2026

Após o aceite da proposta e a autorização humana para reinventar a arte com formas
geométricas polidas, foi construída uma candidata isolada. O estado detalhado está
em [asset-work/matriarch-test01/README.md](../asset-work/matriarch-test01/README.md).

A picaretada normal devolve uma semente anunciada, causa dano controlado e abre a
casca por quatro batidas completas. A segunda fase oferece dois lançamentos;
um rebate cancela o outro. Corpo e raízes permanecem sólidos, com braços, casca
e massas de folhas articulados separadamente. Cosmos64, projeção da caverna,
música e arena existentes foram preservadas.

A suíte vigente passou 73 testes (22 novos e 51 regressões). A demonstração no
navegador terminou com vida 100, combo 96, oito rebotes e recompensa única.
Arte, sensação de combate, sons provisórios e balanceamento ainda aguardam
avaliação humana. A derrota conserva a resposta final existente.

Prévia: http://127.0.0.1:4229/ . Recibo local em
`coordination/boss-evolution/matriarch-r1/PROTOTYPE-DELIVERY.json` no workspace.
O Geodo aprovado e o runtime oficial não foram substituídos; não houve publicação.
O monitor continua pausado.

## Matriarca Raiz — Teste 02: Seiva e Cipós — 01/11/2026

O usuário rejeitou a reflexão de sementes do Teste 01 e autorizou uma árvore
estática, sem braços, com raiz de seiva cortável e um cipó que prende o jogador.
Recuar em direção oposta à árvore rompe o vínculo; ficar parado provoca apertos
limitados. A segunda fase anuncia arbustos temporários que soltam dois morcegos,
com teto de dois vivos e intervalo após eliminar o par. Não há nova recompensa
pelas invocações. O Teste 01 permanece como histórico, não como mecânica aprovada.

Candidata isolada: http://127.0.0.1:4230/ . Mesmo núcleo de combate, Cosmos64,
projeção, arena e música. Corpo sólido 3×3 em (10,7), sem perseguição. Root/foliage
procedurais articulados, cipó com marcação, seta de recuo e rompimento visível;
avisos e dano seguem as batidas reais, sem um relógio independente.

Passaram 75 testes: 24 da candidata e 51 regressões vigentes. Três seeds e
save/restore verificados. A simulação básica de seed 41001 termina em 181 batidas,
108,6 s, vida 100 e máximo de dois morcegos. Não constitui aceite de balanceamento,
arte ou desempenho. Sons continuam provisórios; a resposta final de derrota usa
o comportamento existente. Evidência do navegador e detalhes constam no recibo.

Relatório: [matriarch-test02/README.md](../asset-work/matriarch-test02/README.md).
Recibo: `coordination/boss-evolution/matriarch-r1/TEST02-DELIVERY.json` no workspace.
Não houve integração oficial, publicação nem retomada do monitor.

## Matriarca Raiz — Teste 03: arena atual, arcos e nódulos — 01/11/2026

Direção humana posterior, com desenho anotado: usar a arena já aplicada no jogo;
raiz marrom em arcos até a parede, nódulo enchendo na batida e explosão na sala
inteira quando cheio. A raiz que prende o jogador deve esticar bastante antes
de romper. O Teste 02 foi preservado como comparação.

A candidata usa o World atual e o cenário de campanha oficial: piso circular de
revisão 2, paredes, jaula, braseiros e máscara recortada de 235 células. A árvore
continua central e sem braços. Há quatro batidas de crescimento, doze incrementos
de seiva, dois cortes para cancelar e oito batidas de casca aberta para permitir
o retorno da parede. A antiga cura foi substituída por uma explosão de 16 de dano
global. O agarrão exige seis células de ganho radial e oferece cinco batidas de
tolerância. Todos esses números são provisórios da variante.

Passaram 71 testes, incluindo 51 regressões vigentes. Três seeds terminaram com
vida 100 e limite de dois morcegos; a demonstração no navegador terminou com vida
100, cinco raízes rompidas e combo 123. Avaliação humana, mix final e desempenho
continuam pendentes. Não houve integração oficial ou publicação; monitor pausado.

Prévia: http://127.0.0.1:4231/ . [Relatório do Teste 03](../asset-work/matriarch-test03/README.md).
Recibo no workspace: `coordination/boss-evolution/matriarch-r1/TEST03-DELIVERY.json`.

## Matriarca Raiz — Teste 04: polimento e ovos verdes — 01/11/2026

A mecânica foi aceita em princípio, com direção posterior para substituir dano
global por três morcegos nascidos de um ovo. O registro humano separado está em
`coordination/boss-evolution/matriarch-r1/TEST03-HUMAN-DIRECTION-20261101.json`.
Isso não autoriza integração oficial nem aprova a arte da nova candidata.

O feedback seguinte foi incorporado no mesmo Teste 04: árvore mais baixa, copa
com oito massas separadas, sombreamento coerente e remoção das placas frontais.
Raízes volumétricas na projeção da caverna afinam da base à ponta; variam entre
NE/SE/E/W/SW/NW com preferência pelo lado oposto ao jogador. Detritos e ondulação
marcam o contato com o piso. O laço estica, afina e recua com som de rompimento.
O ovo verde incha, pula, balança, racha e libera a ninhada; não causa dano direto.

O teto compartilhado é três morcegos vivos. Ovos não adicionam uma ninhada sobre
uma onda existente e continuam cortáveis enquanto aguardam espaço. Preservados
relógio musical, comandos, recompensas, arena atual e demais bosses.

Passaram 79 testes, incluindo 51 regressões vigentes. Três seeds permitem vitória
deixando o primeiro ovo eclodir; a alternativa de cortar todos também permite
vitória. A conferência no navegador terminou com vida 60, oito rompimentos e
combo 123. Não houve erro no console. Avaliação humana e mix final continuam
pendentes; não foi feito benchmark de desempenho.

Prévia: http://127.0.0.1:4232/ . [Relatório do Teste 04](../asset-work/matriarch-test04/README.md).
Recibo: `coordination/boss-evolution/matriarch-r1/TEST04-DELIVERY.json` no workspace.
Sem publicação, integração oficial ou retomada do monitor.


## Matriarca Raiz — Teste 05 (2026-11-01)

Candidata de acabamento a partir do Teste 04. Ovo mais volumoso com perfil de revolução,
iluminação contínua da casca e contagem regressiva musical sem nome. A raiz começa
mais grossa e termina em um caule sob o ovo, sem ninho circular. Copa reorganizada
em dois níveis com chanfros uniformes; tronco, olhos e base preservados.

Passaram 85 testes, incluindo seis verificações próprias de acabamento. A expectativa
local do teste de arena acompanha a revisão oficial atual de 23×17 / 303 células;
nenhuma alteração do gerador é atribuída a esta candidata. Conferência perceptiva
e imagens nativas registradas no recibo, sem aprovação humana implícita.

Prévia: http://127.0.0.1:4233/ . [Relatório do Teste 05](../asset-work/matriarch-test05/README.md).
Recibo: `coordination/boss-evolution/matriarch-r1/TEST05-DELIVERY.json`.
Sem integração oficial, publicação ou retomada do monitor.


## Matriarca Raiz — Teste 06 (2026-11-01)

Candidata de ajuste geométrico: ovo facetado com a escala e os verdes anteriores,
raízes de seção quadrada chanfrada e nove amostras por arco, copa comprimida
verticalmente em 10% sem recompor seus blocos. Corpo, ritmo e mecânica preservados.
A copa continua provisória, sem aceite visual final.

88 testes passaram; expectativas locais adaptadas à arena oficial espacial 3, sem
alterar seu gerador. Capturas e conferência nativa no recibo. Não houve benchmark
ou aprovação humana implícita. Prévia: http://127.0.0.1:4234/ .
[Relatório do Teste 06](../asset-work/matriarch-test06/README.md).
Recibo: `coordination/boss-evolution/matriarch-r1/TEST06-DELIVERY.json`.
Sem integração oficial, publicação ou retomada do monitor.


## Matriarca Raiz — Teste 07 (2026-11-01)

Usuário aprovou a aparência do Teste 06 condicionada à centralização. A Matriarca
agora usa o centro da arena atual (12,9), com apoio visual alinhado à roseta
(284,164) transformada. Corpo sólido, alvos e origem das raízes seguem o centro.
Um veio conflitante foi reposicionado mantendo seus dados. Arte, câmera e círculo
não foram alterados. O caminho antigo continua disponível sem ativação optativa.

94 testes passaram, incluindo seis de centralização/restauração e três seeds de
luta centrada. Condição conferida por coordenadas e navegador. Aprovação humana
registrada em `coordination/boss-evolution/matriarch-r1/TEST07-HUMAN-APPROVAL.json`,
sem inventar uma nova inspeção humana da correção.
[Relatório](../asset-work/matriarch-test07/README.md) e prévia http://127.0.0.1:4235/ .
Sem integração oficial, publicação ou retomada do monitor.


## 01/11/2026 — Matriarca Teste 07 aplicada ao jogo oficial local

Aplicação expressamente autorizada pelo usuário após o aceite do Teste 07. Os encontros novos da campanha no andar 10 ativam a árvore centrada (12,9), copa e corpo aprovados, raízes poligonais, ovo verde com tempo/barra decrescente, cipó elástico e morcegos limitados. O acesso ao ovo foi conectado à seleção real por clique/Q/Espaço. O HUD contextual e os sons usam os consumidores e o relógio atuais do jogo.

Foram portados somente os ganchos da Matriarca. A arena 25 × 19, a câmera, música e demais bosses foram preservados, assim como as mudanças concorrentes de mercador/orbes e memória do combo. Saves antigos já no meio da luta continuam carregáveis com a mecânica anterior; o Abismo não foi convertido neste recorte.

Validação: 990 testes do projeto, 13 verificações da família artística aplicada, check de 554 scripts/1.929 referências e auditoria de 5.922 variantes passaram. Três seeds completaram a luta no ordenamento real de input; a captura usa o jogo completo em origem de QA isolada. Mais 28 verificações da composição final passaram após a mudança concorrente do combo. O exportador incluiu os oito módulos novos e seu HTML foi compilado sem substituir o portátil concorrente. Não houve publicação.

Os testes de contrato que ainda exigiam posição (12,10) e ausência de invocações foram atualizados especificamente para a Matriarca. O novo recibo de hashes complementa os contratos históricos, sem alterá-los.

[Entrega e backup](../asset-work/matriarch-official-r1/README.md). Recibo: `coordination/boss-evolution/matriarch-r1/OFFICIAL-R1-DELIVERY.json`. Monitor permanece pausado.

Próximo em discussão: **Titã Fóssil**, andar 15, Galeria dos Fósseis. Proposta de atrair sua investida contra a parede para abrir a carapaça e minerar durante a recuperação. [Ficha para discussão](../asset-work/matriarch-official-r1/NEXT-BOSS-PROPOSAL.md). Não foi implementada nem aprovada sua mecânica ou nova arte.


## 01/11/2026 — Titã Fóssil: Carapaça Partida, Teste 01

Mecânica aprovada pelo usuário para protótipo e reestruturação visual preservando a identidade do boss. Candidata isolada com o crânio, dentes, costelas, braços e paletas atuais; projeção real e poses articuladas. O Titã prepara três batidas, trava a mira e investe. A parede abre as costelas por quatro batidas. A segunda fase avisa uma segunda investida se a primeira não atingir a parede. Há recuo não ofensivo para liberar a borda, colisão sólida e um acerto por avanço.

34 testes passaram, incluindo saves, ordem de input, colisão, caminho diagonal, articular/ocultar peças e regressão dos bosses atuais. Três seeds completadas com build básica em 111 batidas, aproximadamente 61,7s, por controlador determinístico; não é aceite de diversão. Conferência visual no Canvas nativo, mesma arena e escala, com comparação frontal e vistas diagonais.

[Entrega](../asset-work/fossil-test01/README.md) e [inventário](../asset-work/fossil-test01/INVENTORY.md). Prévia http://127.0.0.1:4237/ . Recibo em `coordination/boss-evolution/fossil-r1/TEST01-DELIVERY.json`. Não integrado ao jogo oficial nem publicado. Monitor permanece pausado. Próximo passo: revisão humana desta candidata.


## 01/11/2026 — Titã Fóssil: Braços em Espiral, Teste 02

O usuário rejeitou a investida do Teste 01 e definiu outra mecânica. Nova candidata isolada: Titã imóvel no centro, sobre sete ossos cruzados, sem pernas. Na fase 1 destaca um braço, lança-o para fora e o recupera numa espiral convergente, golpeando com a outra mão. Na fase 2 lança os dois em sequência e usa cabeçadas com alvo avisado. Articulações rígidas, antecipação, impacto rápido, torso com giro interpolado e retorno alinhado ao ombro. A pilha não gira. Câmera, paleta, escala, arena e música preservadas.

37 verificações passaram. Três seeds concluídas em 110 batidas (~61,1 s), com build básica, sem consumíveis e uma recompensa. A demonstração também chegou à vitória no Canvas nativo, sem erros registrados no navegador. Isso não equivale a aceite humano de dificuldade, clareza ou animação. FPS estável e mixagem final permanecem sem certificação.

[Entrega](../asset-work/fossil-test02/README.md) e [inventário](../asset-work/fossil-test02/INVENTORY.md). Prévia http://127.0.0.1:4238/ . Recibo: `coordination/boss-evolution/fossil-r1/TEST02-DELIVERY.json`. Teste 01 preservado como histórico rejeitado. Sem integração oficial, publicação ou retomada do monitor. Alterações concorrentes de `dist/run.js` e `dist/world.js` foram registradas e não sobrescritas.


## 01/11/2026 — Boss Místico: conversão visual 01

Mecânica Miragens do Manto aprovada pelo usuário. O pedido seguinte autorizou estilizar o boss preservando sua identidade. Esta candidata converte o modelo procedural ativo: manto vermelho/vinho, capuz e olhos, mangas, mãos douradas, broche e coroa de três pontas. Abertura do capuz construída em profundidade, abas e punhos separados, chanfros direcionais e fecho articulado preparado como pista visual. Câmera, cores e escala aproximada preservadas.

9 testes passaram e 288 combinações de vista/pose/tempo foram amostradas. Conferência no navegador da comparação e da arena nativa, inclusive silhueta e traseira. As poses são apresentação; a nova mecânica ainda não foi conectada ao combate. Sem benchmark de FPS ou aceite visual humano inferido.

[Entrega](../asset-work/mystic-art01/README.md), [inventário](../asset-work/mystic-art01/INVENTORY.md), prévia http://127.0.0.1:4239/ . Recibo: `coordination/boss-evolution/mystic-r1/ART01-DELIVERY.json`. Sem integração oficial, publicação ou retomada do monitor.


## 01/11/2026 — Aceite visual do Boss Místico

O usuário aprovou expressamente a arte com a mensagem “art aprovada”. MYSTIC-ART01 torna-se a referência visual aprovada para o próximo protótipo de Miragens do Manto. Preservar capuz, manto, mangas, coroa, paleta e componentes desta candidata. Aceite registrado em `coordination/boss-evolution/mystic-r1/ART01-HUMAN-APPROVAL.json`, associado aos hashes da entrega, sem alterar o recibo histórico. O combate novo ainda não foi implementado ou integrado. Publicação e monitor permanecem inalterados.

## 01/11/2026 — Boss Místico: protótipo Miragens do Manto (MYSTIC-TEST01)

Candidata jogável isolada em `asset-work/mystic-test01/`, prévia http://127.0.0.1:4240/. Arte ART01 aprovada preservada byte a byte. Três corpos, fecho verdadeiro persistente, erro sem loot/procs, janela de oito pulsos, golpe correto + quatro de recuperação; fase 2 com troca única anunciada; prazo vencido gera dois disparos direcionados avisados. Relógio musical nativo, arena/câmera/escala/paleta intactas. Barra de vida fixa para não entregar o alvo. Corpos sólidos, reserva de posições e reposição de veios sem perda de valor.

Verificação: 37 testes da candidata + 8 do caminho oficial preservado; 10.560 caminhos em dez seeds, pior caso seis ações; três lutas simuladas e repetição determinística (134–135 pulsos, sem aumentar vida/poder global). Fraqueza candidata ×4 com mínimo 8, teto nativo 47. Driver conhece a resposta: isso não valida diversão/dificuldade. Testes antigos de selo/caminho dentro do corpo não descrevem a nova mecânica; registro bruto preservado. Relatório e limites em README e DELIVERY; recibo `../../coordination/boss-evolution/mystic-r1/TEST01-DELIVERY.json`. Alteração concorrente em `dist/run.js` exige reconciliação futura. Sem aplicação oficial, publicação, acesso ao save ou retomada do monitor. Aceite humano do combate pendente.

## 01/11/2026 — Boss Místico: rastros de fogo e cabeça (MYSTIC-TEST02)

Revisão humana posterior ao TEST01: somente boss/clones deixam fogo; na metade da vida o corpo se rompe, sobra cabeça intangível que caça com miras no chão, depois fica exausta no centro e aceita golpes. Nova candidata isolada `asset-work/mystic-test02/`, http://127.0.0.1:4241/. TEST01 e arte ART01 preservados. Corpo se rompe na posição anterior e cabeça vai suavemente ao centro; capuz/olhos/coroa derivados do mesh aceito. Rastro conectado, chamas vetoriais, contato ao pousar/permanecer, quatro miras fixadas antes do impacto, previsão limitada e janela de seis pulsos. Tentativas contra intangibilidade/corpo fechado mantêm ritmo, sem procs de acerto.

40 testes passaram; três lutas básicas simuladas + repetição determinística, 150 pulsos (~77,6 s); até quatro ações de aproximação em 379 células na janela de seis. Reprodução completa na câmera real concluída. Driver conhece o alvo, não substitui avaliação humana. Baseline/hashes, arquivos, limites e evidências em README/DELIVERY; recibo `../../coordination/boss-evolution/mystic-r1/TEST02-DELIVERY.json`. Mudança concorrente em `dist/world.js` registrada: reconciliar antes de aplicar. Sem escrita oficial, publicação, save do jogador ou retomada de monitor. Aceite do combate revisado continua pendente.

## 01/11/2026 — Aceite da mecânica e ajuste de âncora do Místico

O usuário aprovou a mecânica do TEST02 e solicitou subir o boss para apoiar o pé na marca central. MYSTIC-TEST02-ALIGN01 centraliza o spawn inicial e alinha a apresentação à roseta nativa (y164, não y169.5). Outros consumidores, arte aprovada e regras de combate preservados; 40 testes passaram. Recibos em ../../coordination/boss-evolution/mystic-r1/TEST02-HUMAN-APPROVAL.json e TEST02-ALIGN01-DELIVERY.json. Fogo e marcação no jogador continuam pendentes de acabamento. Sem aplicação oficial ou retomada do monitor.

## 01/11/2026 — Soberano Micelial: desenvolvimento da mecânica (DESIGN01)

O usuário quer preservar a rotação existente, melhorar fluidez em ritmo rápido, acrescentar balanço do fungo e esporos. Inspeção nativa de seed41001: andar25, Gruta dos Micélios, corpo intangível720HP, quatro núcleos36HP, Valsa do Micélio104BPM, sala25×19. Giro atual avança22,5°/30° por ciclo, observado a cada dois pulsos; direção muda a cada16 ciclos. Núcleos e transferência de dano já existem: não são novidade da proposta.

Proposta própria, ainda sem implementação: espiral contínua pelo relógio musical, colisão coerente com setor varrido e limite espacial testado com movimento base; balanço por impacto sem multiplicar velocidade por hits; dois esporos móveis no máximo, aviso de dois pulsos, expiração de quatro e passagens preservadas. Quebra de núcleo conserva dano e propõe limpar esporos próximos/abrir passagem local por dois pulsos, mantendo a rotação. Segunda fase evolui velocidade e lançamentos sem acrescentar braços de espiral ou núcleos. Parâmetros provisórios e fontes/hashes registrados em ../../coordination/boss-evolution/micelial-r1/DESIGN01.json.

Pesquisa primária: apresentação oficial de Hi-Fi Rush (Xbox Wire, 25/01/2023) para avisos sonoros/visuais ligados ao ritmo; não reproduzir estética ou luta. Validar caminhos, uma ação por pulso, autoaproximação, giro e perigo no mesmo relógio, interseção de esporos/espiral, pausa/save e duração antes de ampliar para arte. Sem código/arte novos, aplicação oficial, publicação ou retomada do monitor.


## 01/11/2026 — Soberano Micelial: protótipo polido (MICELIAL-TEST01)

O pedido atual aprova implementar DESIGN01 e converter a arte, com mecânicas intuitivas e pouco texto. Candidata isolada em `asset-work/micelial-test01/`, prévia http://127.0.0.1:4242/ e comparação de arte em `/art.html`. Mantidos cogumelo vermelho/marfim, paleta e luz nativas, sala25×19, corpo intangível720HP, quatro núcleos36HP simultâneos e transferência nativa de dano. Copa regular de painéis poligonais, borda inferior separada, caule articulado, raízes ancoradas, manchas assentadas nos planos e reação por dano real.

Espiral contínua pelo relógio musical, 0,30/0,40rad por pulso, inversão a cada32 com aviso de dois pulsos. Faixa projetada a partir da curva mundial, colisão varrida após input; sem avanço por hit/frame. Até dois esporos, preparo de dois pulsos, percurso curvo fixado e quatro de vida, sem loot. Quebra de núcleo abre passagem local de dois pulsos, limpa esporos próximos e envia partículas de dano ao boss. Sinais na copa, chão e sons substituem instruções extensas.

40 testes passaram (11 próprios +29 existentes de bosses, arena, campanha e input). Três seeds e repetição completa com movimento/dano básicos:333 pulsos, oito núcleos, uma vitória/recompensa. A demonstração no navegador percorreu a luta com áudio e registrou oito núcleos, fase2 e boss derrotado; esse primeiro percurso antecede o refinamento final da espessura projetada, validado novamente em simulação e estudo visual. Driver conhece os perigos; não prova diversão ou dificuldade. Save atual/legado, rejeição de corrupção, duplicidade, pausa, geometria finita/paleta e repetibilidade cobertos. Sem teste exaustivo de todas as builds/pets ou certificação de FPS; Canvas local apresentou custos altos também durante pausa, sem benchmark comparativo que atribua causa.

Fontes/hashes e reserva em RESERVATION; resultados em evidence/tests.txt; relatório em README/DELIVERY; recibo `../../coordination/boss-evolution/micelial-r1/TEST01-DELIVERY.json`. Alteração concorrente de `dist/world.js` detectada e preservada: reconciliar antes da integração. Sem aplicação oficial, publicação, acesso ao save do jogador ou retomada do monitor. Aparência e dificuldade aguardam aceite humano.


## 01/11/2026 — Micelial: aceite da mecânica, centro e reações (TEST02)

Usuário aprovou a mecânica TEST01 e pediu subir o boss, reação de dor/raiva ao destruir núcleo e cogumelinhos mais fofos/elásticos. Esclareceu que a copa deve emitir pouca luz avermelhada mágica, não receber um novo capacete. Candidata preserva TEST01 e fontes oficiais: asset-work/micelial-test02, http://127.0.0.1:4243/. Centro lógico (12,9) e apoio visual calculado na roseta; espiral/esporos partem do centro real. Núcleos conservam locais e regras. Compressão, raiva, rebote e acomodação por pivôs, sem mudar dano ou tempo do combate; pequenos núcleos com copa/caule/olhos e reação acionada por golpe real. Halo vermelho local, sem alterar luz global/paleta.

44 verificações passaram; três seeds e repetição concluídas em330 pulsos, com uma recompensa. Teste histórico da arena que exige y10 divergiu como esperado; original preservado, expectativa candidata y9 e alinhamento projetado conferidos. Registro inicial em evidence/tests-legacy-anchor.txt; resultado final em tests.txt. Comparação visual e câmera nativa conferidas no navegador. Sem certificação de FPS ou aceite humano desta aparência. Recibo TEST02-DELIVERY no diretório micelial-r1; autorização anterior em TEST01-HUMAN-APPROVAL. Não aplicado oficialmente, não publicado; monitor continua pausado.


## 01/11/2026 — Micelial aprovado aplicado ao oficial local

Usuário aprovou TEST02 e autorizou aplicação oficial. Integrados módulos de mecânica/arte/som em dist, com adaptações pequenas em core/world/audio/run e inclusão no exportador portátil. Preservados SoftCaveMask, alcance de movimento e descida pelo buraco da baseline atual; não foi copiado o world antigo da candidata. Todas as cores, câmera e demais bosses permanecem. Encontros antigos já salvos conservam sua versão; novas lutas no andar25 usam o Micelial aprovado.

Aplicação/recuperação e estado de verificação no recibo ../../coordination/boss-evolution/micelial-r1/official-r1/APPLIED.json. Domínio37/37, composição25/25, check611 scripts/2058 referências, auditoria6258 variantes, exportação portátil e captura no renderizador oficial conferidos. Estados de 13 andares/bosses não relacionados permaneceram idênticos à baseline por40 pulsos; save antigo do Micelial restaurado sem reset. A suíte global e suas correções de expectativas históricas são registradas separadamente no recibo vigente. Sem publicação no Itch.io ou retomada do monitor.

## 01/11/2026 — Próximo boss: Rei das Tocas, preservação da habilidade

Inspeção do runtime: andar30/Tocas de Âmbar,960HP,108BPM, sala25×19. Enterra e fixa a posição do jogador, três pulsos de aviso, emerge no alvo fixado e permite quatro pulsos completos de contra-ataque. Na metade da vida passa a alternar explosão local e anel com miolo seguro. Preservar decisão/identidade, melhorando rastro de terra, leitura por forma+som, escavação com garras, impacto rápido e acomodação. Coroa, focinho rosado e patas grandes seguem a identidade ativa; nenhuma nova arte implementada.

Proposta MOLE-DESIGN01, fatos amostrados em BASELINE.json no diretório ../../coordination/boss-evolution/mole-r1/. Uma sobreposição nativa de corpo/jogador no centro seguro foi identificada: validar espaço legível sem empurrão surpresa no protótipo, antes de alterar colisão. Pesquisa de referência apenas para avisos musicais (Hi-Fi Rush/Xbox Wire); não copiar outra luta. Próxima etapa aguarda discussão da proposta.

## 01/11/2026 — Rei das Tocas: protótipo e terra na emergência (TEST01)

Usuário aprovou DESIGN01 e pediu terra lançada para cima ao emergir. Candidata isolada em `asset-work/mole-test01/`, prévia http://127.0.0.1:4245/ e estudo em `/art.html`. Identidade nativa preservada: corpo quente, focinho rosa, nariz escuro, seis garras claras, dentes e coroa de três pontas. Corpo, cabeça e garras possuem pivôs separados; afundamento usa corte das faces no plano do chão. Torrões poligonais determinísticos sobem acima da coroa e caem com sombras;18 normais/seis suaves, vida1,35 pulso. Sons de escavar/impacto/terra utilizam WebAudio e canal SFX existentes. Sem biblioteca, filtro, câmera ou paleta global novos.

Preservados alvo fixo, três pulsos de aviso, quatro de contra-ataque, HP960, dano42/50,108BPM, arena25×19, movimento4, limite de dano por pulso, itens e recompensa. Segunda fase mantém explosão/anel com centro seguro, diferenciados por forma de terra e máscara nativa. Comparação automática pulso a pulso com o combate congelado. O corpo mantém a colisão nativa, inclusive sobreposição no miolo seguro; driver de QA prefere célula adjacente, sem novo empurrão. Nenhum rebalanceamento.

39 verificações passaram (15 próprias+24 existentes); três seeds e repetição concluídas em126 pulsos, uma recompensa. Perfil de inspeção explicitamente avançado usa níveis100 suportados; básico também concluiu em2383 pulsos, portanto não há certificação de dificuldade. Demonstração no navegador percorreu ambas as fases e foi registrada antes do último ajuste de preferência sul do driver, revalidado nos39 testes. Estudos finais de escavação, emergência, anel e modo suave conferidos. Sem erros de console capturados; sem certificação de FPS/mixagem perceptiva ou todas as builds/pets. UI nativa preservada, com ocupação elevada dos consumíveis em janela baixa.

Baseline oficial sem divergência; sintaxe14 módulos conferida. Reserva, hashes, relatório e evidências na candidata; aceite da proposta em `../../coordination/boss-evolution/mole-r1/DESIGN01-HUMAN-APPROVAL.json`, entrega em `TEST01-DELIVERY.json`. Arte/animação aguardam revisão humana; não aplicado oficialmente, publicado ou usado save do jogador. Monitor permanece pausado.

## 01/11/2026 — Rei das Tocas: três toupeirinhas no pulso (TEST02)

Usuário pediu substituir a segunda fase por três toupeirinhas em linha: rei se esconde, cada pulso alterna uma emergência em padrão aleatório aprendível, derrubar o trio traz o rei de volta e repete. Pediu também monte de terra volumétrico remexendo na primeira fase e terra lançada nas emergências dos pequenos e do rei. Autorização/reserva em `../../coordination/boss-evolution/mole-r1/TEST02-HUMAN-REQUEST.json`. Candidata isolada `asset-work/mole-test02/`, prévia http://127.0.0.1:4246/ e estudo `/art.html`; TEST01 congelado/intacto.

Mantidos HP960,108BPM, câmera/luz/paleta, arena25×19, controles, movimento básico4 e combate da primeira fase. Ao terminar a recuperação abaixo de metade da vida, três buracos em(8,8),(12,8),(16,8) derivados da arena; linha alta evita consumíveis no viewport testado. Pequenas toupeiras com focinho, dentes e garras, cabeça infantil sem coroa, corte real no solo e aro com recesso. Frase determinística de seis pulsos por seed/rodada, cada posição duas vezes sem repetição imediata, fixa até concluir. Dois pulsos de introdução e pistas de remexer/tempo/som antecipam até dois. Somente picareta primária no pulso ativo derruba; auxiliar fica escondido até finalizar, não concede loot/XP/missão. Erros de ritmo nativos mantidos, sem nova punição de área por perder uma emergência.

Terceiro acerto agenda retorno no próximo pulso e seis completos para chegar/revidar; repetir outra rodada/frase. Substituído somente o antigo padrão explosão/anel da segunda fase. Filhotes não são inimigos comuns vagando: conjunto de três alvos persistentes, IDs reutilizados e validados, sem drops; morte do rei limpa o conjunto e mantém recompensa única. Corredor funcional reserva espaço e reloca recursos sem prêmio; reposição não o bloqueia. Monte geométrico substitui círculos da primeira fase e segue o alvo já fixado, com remexer discreto. Pivôs/caches nativos,18 torrões do rei/seis por pequeno(três suaves), relógio musical/pausa, sons WebAudio deduplicados. Nada de motor ou filtro novo.

39 verificações passaram(15 próprias+24 existentes): alvo/tempos da primeira fase, padrão/antecipação, contato primário, bordas temporais, duplicidade, ciclos, retorno, caminhos de quatro cantos em três seeds com movimento básico, save/corrupção/legado, paleta/geometria/clipping/caches/suave/áudio. Três seeds e repetição venceram com equipamento avançado explícito:138/135/137 pulsos, cinco trios, uma recompensa. Básico venceu em2580 pulsos, vida100; não é um rebalanceamento ou certificado de dificuldade. A demonstração nativa no navegador venceu com quatro trios, vida200 e1600moedas; driver decide após avançar o pulso, enquanto o teste decide antes, logo percursos distintos. Essa reprodução antecede somente os retoques finais de aro e controlesQA; estudos/snapshots finais foram reabertos e conferidos. Capturas, janela real e logs no diretório evidence. Sem erros de console capturados; sem certificação deFPS, mixagem perceptiva ou todas as builds/pets.

Sintaxe16 módulos e TEST01 preservados. A conferência final detectou alteração concorrente em `dist/world.js`, sem intervenção desta tarefa; reconciliar com a fonte congelada antes de qualquer integração futura. README/DELIVERY e recibo `TEST02-DELIVERY.json` descrevem limites e reprodução. UI global preservada; a candidata/arte/diversão aguardam revisão humana. Sem aplicação oficial, publicação, acesso ao save do jogador ou retomada do monitor.

## 01/11/2026 — Toupeira aprovada e brief do Barão Cenoura

Usuário aprovou MOLE-TEST02 e passou ao último boss. Aceite registrado em `../../coordination/boss-evolution/mole-r1/TEST02-HUMAN-APPROVAL.json`, separado da entrega histórica; nenhuma aplicação oficial inferida. Pedido atual é um brief do Barão, mantendo pancada de cenoura e ciclo de bichinhos/atordoamento, com arte atual, orientação correta, aviso de chão simplificado e impacto rápido com rastro.

RABBIT-BRIEF01 inspeciona fontes atuais e registra hashes em `../../coordination/boss-evolution/rabbit-r1/BRIEF01.json`. Amostra real em memória(seed41001): andar35/Hortas Subterrâneas,1080HP,25×19, Valsa da Cenoura112BPM, R2. Mira fixada no aviso, três pulsos até impacto. No R2 ativo, picareta direta nos filhotes não os atordoa: atrair a cenoura para perto de um filhote e desviar; os três atordoados saltam no chefe no pulso seguinte e abrem dez pulsos completos de ataque. Segunda fase atual mantém ciclo/tempos, com dano1,2×. Caminho legado de atordoar filhotes com picareta existe, mas não é o comportamento das lutas novas.

Brief propõe preservar esse ciclo, direção real do volume para a mira, preparação legível e descida final rápida terminando no pulso de dano, arma rígida e rastro curto. Aviso deve ser somente esboço da área real e indicação temporal; retirar desenho colorido de cenoura do chão/objeto extra caindo. Polir coelho branco, orelhas, focinho, dentes, mãos/encaixe da cenoura e tocas, na câmera e paleta vigentes. Cabeças dos filhotes na toca, corpos completos somente no salto; reação clara do chefe. Sem nova habilidade de primeira fase ou encurtar aviso. Alcance distante é risco a validar: a malha direcional atual recebe pose com alvo/alcance, mas não os utiliza, logo contagem de direções não prova contato geométrico correto.

Apenas análise e documentação nesta etapa; não foram alteradas mecânica, arte, interfaces ou fontes oficiais. Não houve playtest visual novo ou certificação de animação. Próximo passo: discutir brief e depois produzir candidata isolada. Monitor continua pausado; sem publicação ou save do jogador.

## 01/11/2026 — Barão Cenoura: arte direcional e pancada rápida (TEST01)

Usuário aprovou RABBIT-BRIEF01 e autorizou iniciar. Candidata isolada em `asset-work/rabbit-test01/`, prévia http://127.0.0.1:4247/ e comparação `/art.html`. Autoridade/reserva em `../../coordination/boss-evolution/rabbit-r1/TEST01-HUMAN-REQUEST.json`. Fontes atuais congeladas antes da edição; mantidos os pacotes históricos GV-054, mole-test01/02 e os aceites anteriores.

Core/bosses/rabbit-mechanic byte a byte preservados: R2,1080HP, arena25×19,112BPM, três pulsos de mira fixa, cenoura atordoa um filhote elegível, trio salta no pulso seguinte e abre dez pulsos completos. Segunda fase e recompensa nativas. Sem novo schema/save, hitbox, dano, custo ou expansão de fase. Caminho legado sem R2 conservado.

Novo mesh no construtor nativo: coelho branco, orelhas, focinho/dentes, mãos e cenoura separados; volumes com chanfros contidos e materiais Cosmos da família vigente. Quatro vistas por yaw real, sem deformar PNG. Pegada avança para a frente nas laterais; arm/forearm/luva/haste/folhas/raiz rotacionam rigidamente. Preparação clara, descida final0,22 pulso até contato geométrico no pulso previsto, breve recuperação, reação por dano e orelhas/idle discretos. Direção retida durante impacto e tontura; não gira acompanhando o jogador que já desviou. Aviso somente contorno da união real das células e três marcas temporais, sem cenoura pintada/objeto caindo. Rastro junto da arma, torrões no alvo e eco de alcance para alvos distantes, sem alongamento da arma ou nova colisão. Filhotes mostram cabeça na toca e corpo inteiro apenas no salto nativo, com clipping/oclusão de terra. HP do boss acima das orelhas; legenda redundante retirada somente nesse consumidor.

Corrigida dependência visual que ainda limitava eventos a19×13: variante reconhece interior23×17 e confere também a sala/contexto reais. Terceiro filhote emy14 e golpes nas bordas passam pelo caminho de VFX correto, sem reativar cenoura/efeitos legados duplicados. Sem modificar a geometria de perigo. Som WebAudio acrescenta impacto/terra ao canalSFX já existente, com mute e deduplicação128. Cache40 de poses, boss3×/filhotes1,5×;14 torrões por impacto/quatro suaves, vida0,75 pulso. Nenhuma engine/biblioteca externa adicionada.

41 verificações passaram(12 próprias+29 existentes): fontes de combate idênticas, alvo/tempo, invariância das distâncias da arma, contato, geometria/paleta/quatro vistas, clipping, bounds/contexto, pausa, cache, SFX, direção retida e lutas completas. Três seeds41001/41017/41999+repetição venceram em88 pulsos, vida200/2050moedas, uma recompensa; perfil de inspeção avançado explícito com níveis100 suportados. Básico venceu em1624 pulsos, vida100, sem guard/itens artificiais. Não é rebalanceamento nem aceite de diversão. Demonstração nativa no navegador concluiu duas fases e três motins; registro em evidence/native-victory.json/PNG. Essa reprodução antecede só o ajuste final da direção retida e pegada, cobertos novamente por testes/vistas/snapshots. Sem erros de console capturados; sem certificação deFPS físico, mixagem perceptiva ou todas as builds/pets.

Relatório, hashes, recuperação e limites em README/DELIVERY e recibo `../../coordination/boss-evolution/rabbit-r1/TEST01-DELIVERY.json`. Arte/animação aguardam revisão humana. Nenhuma aplicação oficial/publicação, acesso ao save do jogador ou retomada do monitor.

## 02/11/2026 — Barão Cenoura aprovado aplicado ao jogo

RABBIT-TEST01 r1 aprovado e aplicado ao consumidor oficial bossIndex6/R2. Sete módulos: volume nativo em quatro vistas, peças rígidas com pivôs, cenoura com descida final em0,22pulso, direção do impacto preservada, contorno das células reais, solo/sons por evento e corpos dos filhotes no salto. HP acima das orelhas. Validador visual compatível com arena25×19. Combate do Barão/recompensas/câmera/escala/paleta preservados neste lote.

Autoridade em `../../coordination/boss-evolution/rabbit-r1/TEST01-HUMAN-APPROVAL.json`; reserva, backup e recibo `official-r1/APPLIED.json`. Seis módulos próprios iguais à candidata; World preserva delta concorrente ChestTreasureVfx. Dois módulos novos cadastrados no ateliê; exportação compilada.33testes de integração passaram antes da alteração concorrente de saída/objetivo em core.js; repetição final registrada no recibo. A mecânica R2 e bosses.js continuam idênticos à baseline. Nenhuma alteração própria em core.js.

Check inicial642scripts/2118referências; check final646scripts/2124referências e auditoria6258variantes passaram. Navegador nativoQA4248: controles isolados, todos os módulos de produção diretamente de dist, sem save; golpe6,94pulso/esquerda, cenário carregado e zero erros de console. Captura `evidence/applied-strike.png`. Sem certificação de FPS ou novo aceite perceptivo.

Suíte inicial1155passaram/2falharam: import do helper de QA corrigido e testes repetidos; recibo tonal inicial do áudio atualizado para este lote. Repetição do contrato de arte aponta agora divergência concorrente em approved-scenery-emission.js, fora do lote, registrada e preservada. A suíte global final não é declarada verde. Sem publicação Itch.io, sem acesso ao progresso do jogador ou retomada do monitor.

## 02/11/2026 — Pesquisa de fogo, impactos e ferramentas (MYSTIC-VFX-RESEARCH01)

Pedido humano: pesquisa ampla na internet, técnicas/ferramentas/skills e adoção do método, usando o Místico como primeiro caso. Etapa documental, sem novo fogo ou alteração oficial. Fontes primárias de Riot, Blizzard, Godot, Unity, Epic, Effekseer, JangaFX, MDN e Chrome comparadas com o Canvas2D/CRT atual e a candidata MYSTIC-TEST02-ALIGN01. Método adotado nas skills mantidas de direção/implementação de VFX: massa animada/atlas, base contínua projetada, partículas secundárias e emissão local, sem obrigar efeitos a serem cubos.

Diagnóstico e plano de piloto em `skills/gemventure-vfx-implementation/references/stylized-fire-and-impacts.md`; reserva, fontes/hashes e evidência em `../../coordination/boss-evolution/mystic-r1/vfx-research01/`. Auditoria do painter real com contexto contador: arranjo sintético128trechos gerou41925comparações e512chamadasBézier por desenho; não representa carga real de luta nem FPS. Preservar estados/tempos/arte/câmera e preparar apenas o primeiro fogo/rastro antes de ampliar para jato/impacto.

Capturas históricas do placeholder foram inspecionadas; nenhuma sessão atual ou vídeo completo foi certificado. Repetição da luta histórica encontrou cave-merchant.js ausente no fallback atual: próxima produção deve reconciliar o protótipo sem restaurar módulo antigo. Effekseer recomendado para eventual autoria offline; Blender/EmberGen opcionais, nenhum software instalado. O PDF da Riot redirecionou e uma página Blender falhou; não foram tratados como lidos integralmente. Sem nova aprovação visual, implantação, publicação, alteração de save ou retomada do monitor.

## 02/11/2026 — Primeiro fogo e rastro do Místico (MYSTIC-FIRE01 r1)

Pedido humano autorizou iniciar pelo fogo. Candidata isolada `asset-work/mystic-fire01/`, prévia http://127.0.0.1:4249/. Reserva/baseline e autoridade em `RESERVATION.json` e `../../coordination/boss-evolution/mystic-r1/FIRE01-HUMAN-REQUEST.json`. Estudo visual da primeira fase: core/arena atuais com domínio aprovado, sem restaurar cave-merchant.js. Não representa luta completa; combate/contato não são simulados nesta tela.

Atlas procedural de24quadros×3variações, massa de chama e brasas, união exata do piso, ordenação das chamas entre atores e emissão local existente. Sem nova paleta ou iluminação global. Preparação e limites de perigo nativos; nenhuma ponte diagonal sobre chão seguro. Pausa/relógio musical e modo suave preservados. Limites128células/24brasas/16luzes, cache6, atlas6,75MiB. Depois de preparar o atlas, não reconstrói curvas da chama por célula a cada quadro. Contagem sintética128células:41925comparações antigas versus512consultas,512cúbicas versus128sprites; não é medição deFPS.

Dez testes passaram: tempo/união/cache/atlas/suave/luzes/repetibilidade em três seeds e preservação dos três módulos aprovados. Comparação nativa do navegador em seed41001/pulso9,25; capturas antes/depois/suave/perfil no diretório evidence, sem erros de console capturados. Sem certificação deFPS, áudio, combate completo ou todos os dispositivos. README/DELIVERY registram controles, parâmetros e limites. Jato/impacto da segunda fase fora do recorte. Pronta para revisão visual humana; sem aplicação oficial, publicação, save ou retomada do monitor.

## 02/11/2026 — Fogo do Místico: transparência e partículas luminosas (FIRE01 r2)

Usuário considerou r1 ainda placeholder e pediu corpo mais transparente, mancha/base menor, pé um pouco mais largo que o meio, outra camada de fogo e brilho nas partículas/pontas. Delta isolado na mesma candidata e prévia4249, r1 preservada em history/r1 e botão Anterior, mantendo também Placeholder. Autoridade/reserva em `../../coordination/boss-evolution/mystic-r1/FIRE01-R2-HUMAN-REQUEST.json`.

Mancha alpha0,28→0,08, brasa0,48→0,15 e raio9–11→6,5–7,2; envelope da chama0,72–1→0,48–0,60, lâmina secundária com fase própria no atlas existente, composição screen. Emissão pequena acompanha pontas douradas/faíscas em vez de halo forte na base. Paleta vigente, sem branco novo ou filtro global. Até24faíscas/16fontes; suave0/8. Mesmas células/ativação/expiração/arte/câmera; fontes emissivas compartilham o sampler das partículas visíveis. Comparação prepara dois atlas(13,5MiB estimados); cada variante6,75MiB, sem aumento de quadros ou sprites por célula.

Doze testes passaram, incluindo acentos determinísticos/suave/expiração e r1 byte idêntica. Navegador integrado1280×720/DPR1, seed41001/pulso9,25:24chamas/24faíscas/16fontes, suave24/0/8. Capturas finais em evidence/r2. Sem certificado deFPS, sincronia auditiva ou combate completo; aparência aguarda avaliação humana. Sem aplicação oficial/publicação/save ou retomada do monitor.

## 02/11/2026 — Fogo do Místico mais lento e alastrando (FIRE01 r3)

Pedido humano: animação menos acelerada, base marrom quase nula, chamas largas embaixo e estreitas em cima sem pirâmide literal, incandescência clara preservando transparência. Mesma candidata4249, recuperação history/r2 e comparação Anterior agora contra r2 byte idêntica. Autoridade/baseline/reserva em `../../coordination/boss-evolution/mystic-r1/FIRE01-R3-HUMAN-REQUEST.json`.

Ciclo1,3→0,5volta/pulso, faíscas0,85→0,4. Mancha alpha0,08→0,012, brasa0,15→0,025; contorno marrom ativo retirado. Línguas laterais baixas no atlas e largura23–27 sem aumento de altura; núcleo dourado0,25→0,42, secundária0,32→0,38. Pontas com filete incandescente e halo pequeno mais forte. Envelope translúcido, paleta, área/tempos de perigo e aviso mantidos. Sem novos filtros globais, instâncias ou atlas.

14 testes passaram, incluindo menor avanço temporal cosmético com mesma ativação/expiração, três seeds de domínio e r2 preservada. Conferência no navegador integrado1280×720/DPR1, seed41001/pulso9,25; comparação/arena/suave em evidence/r3. Sem certificado deFPS, vídeo, áudio ou combate completo. Pronta para avaliação visual humana; sem aplicação oficial, publicação, save ou retomada do monitor.

## 02/11/2026 — Fogo com fonte de luz na arena (FIRE01 r4)

Pedido humano: manter transparência e reforçar brilho, com fogo emitindo luz. Diagnóstico: halos r3 não alimentavam a máscara noturna. Variante isolada liga até oito fontes ativas de piso à máscara nativa de paintCampaignNight, preservando lanternas/jogador, valores globais e clipFog. Emissão quente existente colore a superfície; até oito acentos adicionais, teto16. Raio de clareamento32/potência0,61±0,035; suave25/0,5. Nenhuma alteração de visibilidade do domínio. Chama conserva alpha0,48–0,60 e ciclo0,5; núcleo0,42→0,50, secundária0,38→0,43.

R3 recuperável em history/r3/Anterior, autoridade em FIRE01-R4-HUMAN-REQUEST.json. Build gera somente variante local do runtime de campanha; dist preservado e fallback de dungeon legado fora do recorte da máscara. 17 testes passaram, incluindo fontes/ativação/morte/expiração/tetos e máscara com/sem fontes. Navegador IAB1532×884/DPR1, seed41001/pulso9,25, antes/depois/suave em evidence/r4, zero erros capturados. Sem certificado deFPS/áudio/combate completo; aguarda avaliação visual humana. Sem aplicação oficial/publicação/save ou retomada do monitor.

## 02/11/2026 — Místico e fogo r4 aprovados aplicados ao oficial

Usuário: “aprovado pode aplicar no jogo real”. Aceite/autorização específica em `../../coordination/boss-evolution/mystic-r1/FIRE01-R4-HUMAN-APPROVAL.json`; pacote aplicado e recuperação em `asset-work/mystic-fire01/official-r1/`. A fonte oficial ainda não possuía mirage.v2: integrada como pré-requisito a mecânica/arte MYSTIC-TEST02-ALIGN01 já aprovadas. Grafts reconciliados com a remoção do comerciante, Micelial e deltas recentes de core/run/World; nenhum checkout histórico foi copiado sobre o atual.

Dez módulos de runtime, cadastro/exportação do ateliê e contratos de testes. Fire r4 byte idêntico ao aprovado. Domínio/arte/SFX originais do Místico mantidos; presentation ganha somente opção showFire=false para suprimir o placeholder e preservar avisos/ruptura/dissolução. Novos encontros recebem versão2; encontros legados sem mirage permanecem compatíveis. Clique/Q reconhecem cópias, seleção se limpa na aparição, barra fixa e dica sem HP não revelam o verdadeiro por metadados. O fogo usa profundidade dos atores, relógio musical, modo suave, descarte na morte/saída/refúgio e fontes locais na máscara existente. Dano, limite por pulso, vida e recompensas do encontro aprovado preservados. Jato/aviso da cabeça conservados, sem nova produção visual por extensão.

Checks: npm run check passou(670scripts/2159referências), auditoria de arte6258variantes passou e ateliê exportou. Integração18/18, escopo/arenas/legados30/30, compatibilidade progressão/coelho19/19 e campanha/bots37/37 após adequar as fixtures e o bot ao encontro novo. A campanha completa de20andares levou315,96s;25andares também concluiu. No lote geral com concorrência limitada:1224passaram/3falharam inicialmente — worker de core interrompido por usar bot antigo, fixture de morte instantânea legada do Místico e comparação integral do áudio do coelho. Todas as falhas observadas foram cobertas pelos retestes mencionados; áudio do coelho é comparado removendo somente os dois acréscimos do Místico, não ignorado. Não foi repetida outra suíte monolítica inteira após esses retestes; não somar reexecuções como casos distintos. A primeira execução com concorrência padrão ficou sem resumo e foi interrompida, preservada no relatório.

Navegador1280×720/DPR1, QA4250 com todos os módulos de produção vindo de dist, sem save: fogo/luz no pulso9,25 e modo suave conferidos; demonstração nativa com equipamento básico venceu as duas fases no pulso149,03, HP do boss0 e fogo/atlas liberados. Capturas applied-fire.png/applied-soft.png/native-victory.png e DOM native-victory.json no pacote. Zero erros capturados. Servidor4173 respondeu200 com módulo do fogo exatamente igual ao disco. Sem certificado deFPS físico, prova auditiva de mixagem ou inspeção do perfil real. Sem publicação Itch.io, acesso ao save do jogador ou retomada do monitor. Recibo vigente: FIRE01-R4-APPLIED.json.

## 02/11/2026 — Coluna de chamas da cabeça (MYSTIC-BEAM01 r1)

Pedido humano: linha de habilidade discreta e fogo aprovado um pouco maior surgindo pelo trajeto do raio. Candidata isolada `asset-work/mystic-beam01/`, prévia4251; fontes da integração oficial atual congeladas na reserva, sem importar core histórico. Linha fina descontínua substitui aviso grosso/X; clarão integral de0,18pulso reconhece o impacto nativo, enquanto chamas crescem numa varredura0,45pulso+subida0,18. Sem atrasar dano. Mesmo atlas r4, largura×1,10/altura×1,28, âncora/profundidade/alpha/velocidade/luz compartilhados; nenhum novo atlas ou teto. Quadradinhos da preparação pós-impacto retirados somente desse disparo; aviso/células/ativação/expiração do domínio intactos.

Opções showBeam permitem comparação com r4 sem alterar a arte da cabeça/ruptura. Modo suave surge junto e retira brasas. Nove testes passaram, incluindo equivalência da primeira fase/atlas, domínio em três seeds, clarão versus aviso seguinte, ancoragem, tetos, morte e supressão dos quadradinhos. Navegador1280×720/DPR1, snapshots em8,5/9,16/9,7 e suave; zero erros capturados. Campo visual9,7 mostrou18atores/18brasas/16fontes. Sem certificado deFPS, áudio ou luta completa nesta candidata. README/DELIVERY discriminam limites. Pronta para avaliação humana, sem nova aplicação oficial/publicação/save ou retomada do monitor.


## 02/11/2026 — MYSTIC-BEAM01 r1 aplicado ao jogo oficial

Aceite e aplicação autorizados pelo usuário após4251: “aprovado pode aplicar no jogo real”. Baseline dos oito arquivos compatível; cópia de recuperação/reserva em asset-work/mystic-beam01/official-r1. Instala helper, fire/presentation exatamente aprovados e cinco hooks delimitados no World atual; sem seletor A/B no oficial. Registra helper no portátil e fixture incremental, sem alterar os recibos anteriores. Geometria/dano/relógio/recompensas/primeira fase congelados.

Verificação:27/27 no recorte; suíte geral 1256/1256 com concorrência2,0falhas, duração481443.9889ms. Check677scripts/2169referências; auditoria6258variantes; exportação do ateliê. Falha inicial restrita ao carregamento de referência do teste foi corrigida antes dos checks finais. Navegador1280×720/DPR1 na4252 usa todos os módulos de jogo de dist: aviso8,5/subida9,16/pico9,7 e suave, sem erros capturados.18atores/18brasas/16fontes no pico; mesmo atlas6,75MiB. Servidor principal4173 respondeu200 com hash correto dos quatro arquivos. Sem save, publicação, retomada do monitor, certificadoFPS, sincronia auditiva ou luta completa no navegador nesta etapa; testes de domínio cobrem a luta nas duas fases.

Recibo: coordination/boss-evolution/mystic-r1/BEAM01-APPLIED.json; fontes, logs e capturas: asset-work/mystic-beam01/official-r1/. O portátil anterior não foi copiado byte a byte: a reserva inicial nomeou saída antiga; recuperação por reexportação dos módulos/exportador restaurados, documentada no recibo.

Composição posterior com BOSS-OPTIONAL-HELP: recibo concorrente parte exatamente do hash do World instalado por BEAM01 e preserva seus hooks. Nenhum arquivo do outro lote foi revertido. A suíte de1256 corresponde à aplicação BEAM01 anterior a essa mudança;46/46 testes pertinentes passaram novamente sobre a composição final (Místico/coluna/ajuda/configurações/recibos de arte). Check677/2169 e portátil repetidos; dois helpers da ajuda registrados no portátil por dependência do World atual. Navegador recarregado e captura applied-final.png, sem erros. Recibo discrimina ambos os hashes/escopos.


## 03/11/2026 — Hotfix dos bosses e preparação desktop

- Novas arenas colocam os sete chefes um pouco acima do centro, com mais espaço frontal; partidas em andamento mantêm a origem anterior.
- Geodo: abertura do leque de120° para96° (−20%); empurrão traseiro de180° para108° (−40%), orientado pela direção real e sem afetar os flancos laterais. Alcance, dano e aviso musical preservados.
- Quinas da colisão do corpo liberadas; centro sólido e alcance da picareta mantidos. Punhos descem rapidamente até o chão no impacto, com poeira curta e limitada.
- Preparado aplicativo Windows com o mesmo renderizador/shaders, instalador NSIS e consulta a GitHub Releases. Push de código não equivale a publicar um instalador. O teste de atualização entre dois instaladores publicados é uma validação posterior.
- Evidências e limites em docs/boss-hotfix-20261103.md e desktop/README.md.
