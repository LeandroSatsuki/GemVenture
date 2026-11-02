# Refúgio e resposta dos botões — 01/11/2026

Fonte aplicada: `dist/approved-refuge-markup.js`, `dist/approved-refuge-ui.css`,
`dist/refuge-lobby.js`, `dist/ui-bubble-bank.js`, `dist/ui-bubble-feedback.js`.
Recibo: `E:/Genventure/coordination/REFUGE-UI-INTEGRATION-20261101/APPLIED-RECEIPT.json`.
O usuário aprovou o Refúgio v3 e pediu o mesmo som nos botões importantes/amarelos.
A aprovação autoriza aplicação direta deste recorte. A avaliação humana posterior
do runtime continua distinta dos testes e da conferência nativa.

## Relação com o jogo

- O centro pertence ao cenário e ao minerador reais. Não instalar uma captura de
  cenário ou um personagem de demonstração como substitutos do renderizador.
- A miniatura de Pontuação usa `STATUE_FAMILY[tier].file`, a mesma família do painel
  interno, acompanhando os sete elos. Retrato usa `drawPlayerPortrait` e roupa real.
- Preservar `#refugeLobby`, `#refugeActorAnchor`, `data-refuge-action`, callbacks e
  ações de tutorial. Loja continua indisponível; serviços aposentados não retornam.
- Mover os elementos originais da toolbar para o slot do Refúgio e devolvê-los à
  posição original quando o Refúgio some. Conservar identidade, IDs e handlers.
  Configurações, Tutorial, Ajuda e a passagem à expedição exigem conferência nativa.
- Mostrar recursos guardados reais, com valor exato acessível se abreviado; não
  arredondar saldo para cima. Desbloqueio de Relicário usa estrelas conquistadas,
  não apenas saldo atual. Missão pronta informa quantidade sem piscar.

## Mesma família, composição própria

Refúgio é a entrada do jogo. Tem ações de serviço de 56 px, auxiliares de 44 px
e Mina de 52 px; isso não obriga diálogos de decisão a copiar o layout do menu.
Fontes Fredoka 600 em títulos/ações e Nunito 600 em dados. Usar os arquivos estáticos
existentes, sem variação de fonte no hover.

Paleta aplicada: base `#06132b`, painel `#102a52`, elevado `#173f73`, linha `#26538c`,
texto `#edf4ff`, secundário `#bfd0e8`, seleção `#35d6f2`, ação principal
`#ffbc00 → #ff7600`, tinta da ação `#17213d`, confirmação `#67e3b8`.
Papéis são fixos. O dourado destaca a ação, não todo botão ou todo título.
Play tem fundo mais transparente, sem competir com Mina ou a arte.

Hover responde no ícone e no brilho, com passagem única; hitbox e layout permanecem
estáveis. Modo suave, movimento reduzido e aba oculta retiram movimento secundário.
Na conferência nativa, `.head` global e opacidade legada de botão desabilitado
vazaram para o novo consumidor. Corrigir pelo escopo do componente; testar dentro
do jogo com todas as folhas carregadas, além de testar a proposta isolada.

## Bolha: entrada reconhecida, resultado continua verdadeiro

- Amostras originais curtas: hover de 82 ms e clique de 132 ms. Botão importante
  usa o mesmo clique um pouco mais encorpado, ganho 0,85 e velocidade 0,92; botão
  comum usa 0,65 e hover 0,5, antes do volume real de SFX.
- Reutilizar `music.ctx` e `music.sfxBus`. Nunca abrir um contexto ou relógio
  musical paralelo, nem contornar mute, volume de efeitos, aba oculta e orçamento.
- Aplicação inclui os botões do Refúgio e ações principais existentes, inclusive
  em Shadow DOM. Não transformar dano, consumíveis, cartas ou combo em sons de menu.
- Capturar elegibilidade com `composedPath()` antes do callback: uma compra pode
  recriar o botão e uma navegação pode mover a toolbar. Cache por evento evita que
  o beep genérico reapareça no mesmo clique após essa mudança de DOM.
- Tocar a entrada em microtarefa depois da ação, sem atrasá-la. Preservar compra,
  recompensa e confirmações de domínio; a bolha não certifica sucesso financeiro.
- Sem fila: hover tem intervalo mínimo de 100 ms, clique 75 ms, e clique bloqueia
  hover por 150 ms. Descartar a voz anterior com cauda curta; limpar ao ocultar.
- Não transportar o botão de audição ou o buffer de demonstração da proposta para
  o produto. Testar mixer, silêncio, orçamento, descarte e identidade do evento.

## Limites e próxima revisão

Foram conferidos controles reais, contribuição na Forja, Vestiário/Pets, Tutorial,
Configurações, música, modo suave, entrada/pausa da expedição e retorno por exaustão.
A conferência estreita de 736×768 comprovou acesso por teclado e rolagem curta;
isso não certifica todos os dispositivos. Testes não encerram GV-025 nem GV-057.

Ajuda/Como jogar e Guia do Tutorial são telas diferentes. O Guia recebeu aceite
próprio e foi aplicado depois deste recorte; consultar
[seu contrato](approved-tutorial-guide-20261101.md). Tour inicial e treino continuam
separados, preservando checkpoints, status, ações e isolamento. O aceite do Guia
não aprova antecipadamente os desenhos desses consumidores.
