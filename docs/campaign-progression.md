# Campanha, desempenho local e Abismo

Revisão de 30/10/2026: correção autorizada pelo usuário para o jogo oficial e publicação no Itch.io.

## Progressão

A campanha contém sete biomas, cada um com cinco andares, e sete chefes. Os selos preservam os requisitos acumulados de 3, 8, 15, 25, 35 e 45 estrelas, mais a chegada aos andares 5, 10, 15, 20, 25 e 30. Não consomem estrelas. A UI apresenta o requisito do próximo selo e o botão para abri-lo.

Antes, a lista de biomas dependia exclusivamente de `ceil(best/5)`: abrir o selo sem ter visitado o próximo andar não mostrava o novo bioma. Agora também considera `seals+1`. A entrada de cada bioma liberado é uma parada gratuita; os andares internos continuam exigindo descoberta e ativação. Não é preciso repetir os cinco primeiros andares para encontrar a entrada já aberta. A navegação vai diretamente para a nova entrada após abrir o selo.

`biomeEntrance()` e `canStartAt()` centralizam essa regra em `descent-progress.js`. Abrir/navegar não grava uma conclusão nem altera recordes ou o campo `best`; iniciar a descida mantém a atualização habitual de descoberta. Saves existentes com selos comprados passam a enxergar suas entradas automaticamente, sem reset.

## Tempos e classificação pessoal

`recordFloorResult()` guarda, por andar: `points` (melhor score), `lastScore`, `clears`, `stars` (melhor classificação), `bestTimeMs` e `lastTimeMs`. Melhor tempo e melhor pontuação são recordes independentes, não necessariamente da mesma tentativa. A gravação ocorre uma vez por conclusão e exclui treino/Abismo.

O tempo usa o relógio musical ativo do andar (`runBeatTime`), incluindo as variações de andamento e a fase fracionária da ação final. Pausas, menus, leitura de cartas e tempo fora do jogo não avançam esse relógio. Não usa data de calendário. A restauração valida e conserva os campos novos; não inventa último score ou tempo onde os saves antigos não os registraram. Uma repetição mais lenta não apaga o menor tempo, nem uma pontuação menor apaga o melhor score.

`floor-records-view.js` e o botão Desempenho local mostram os resultados deste navegador. Não há ranking online nem comunicação com um servidor de pontuação nesta revisão.

## Abismo

Condições existentes, agora visíveis na aba e verificadas pelo motor:

- Vitória sobre o Boss Místico, andar 4–5 / absoluto 20.
- Depósito acumulado no portão: 1.500 quartzos, 1.200 rubis, 1.000 topázios e 800 esmeraldas.
- As duas condições são necessárias; nenhuma substitui a outra.
- Não exige concluir os 35 andares nem pagar moedas.

Cada depósito mostra saldo, valor entregue e total exigido. A transferência continua limitada ao saldo e ao que falta. Depois de aberto, o acesso permanece nas próximas tentativas. `ABYSS_PLAYTEST_ENABLED=false` impede que o localhost pareça liberado enquanto a versão hospedada continua bloqueada.

## Verificação

Check: 438 scripts / 1.682 referências. Suíte: 768 testes passaram, zero falhas. A cobertura inclui geração/início de cada entrada e chefe ao longo dos sete biomas, e o limite do andar 35. Isso verifica as transições e contratos; não equivale a um playthrough manual completo dos 35 andares ou avaliação de dificuldade.

Na interface, um perfil artificial concluiu um andar pelo core real, exibiu 49,5 s / 6.690 pontos / quatro estrelas, abriu a Floresta Esquecida sem consumir estrelas, e consultou a tabela pessoal. Outro perfil de QA completou o último depósito do portão e iniciou o Abismo pelo botão liberado. A origem do jogador em 4173 não foi alterada.

Fontes principais: `campaign.js`, `descent-progress.js`, `core.js`, `expedition-map.js`, `lift-v2ab-model.js`, `rebrand-lift.js`, `abyss-v2y.js`, `lift-view.js`, `floor-records-view.js`, `lift-v2ab-host.css` e `run.js`. Recuperação, hashes, capturas e pacote no workspace Diorama em `outputs/campaign-progression-release-v1/`.

## Publicação verificada

Publicado em https://leandrosatsuki.itch.io/gemventure, upload **20163366**, substituindo o jogável 20159504. Pacote `gemventure-campaign-2026-10-30-web.zip`, 947 arquivos / 365.993.131 bytes, SHA-256 `a865e4ccd1b2adf3b3ed84e6984575cd67150f197c2852444f7ec6c4b2ef4531`. O nome de transporte permanece o anterior para substituir o upload, com título público atualizado.

O botão Jogar abriu o iframe `html/20163366/` com marcador `2026-10-30-progression-v1`; hub e requisitos do Abismo conferidos no site. Nenhum depósito ou reset de save foi executado na hospedagem durante a verificação. Capa, banner, screenshots e downloads antigos ocultos preservados. A página pública recebeu uma nota curta desta correção; não foi criado novo devlog.
