# Guia do Tutorial — aplicado em 01/11/2026

Recibo: `E:/Genventure/coordination/TUTORIAL-GUIDE-INTEGRATION-20261101/APPLIED-RECEIPT.json`.
Fonte: `dist/tutorial-hub-guide.js`, `approved-guide-model.js`,
`approved-guide-view.js`, `approved-guide-ui.css`. O usuário aprovou a proposta v1
e autorizou sua aplicação direta. Não estender esse aceite ao tour ou ao treino.

## Função antes de forma

São nove entradas: tour, treino e sete locais. Os convites ao aprendizado ficam
distintos dos locais consultáveis. Seleção atualiza a orientação ao lado; a ação
principal abre o consumidor real. Não remover estados, custos ou ações para reduzir
texto. O resumo é breve e o “i” mostra fala/status completos, sem descrição em hover.

Vagas, pontos, custo de invocação, coleção, álbuns, pontuação e imagem do elo vêm
do perfil/domínio atuais. Não instalar os números da demonstração. O custo do
Relicário é de invocação; não sugerir uma segunda cobrança ao escolher.

Preservar `gemventure-hub-guide-v1`, accountId, versão e seen. Prévia padrão do
Elevador não marca visita; seleção ou abertura confirmada marca. Durante a descida,
consultar um local oferece Fechar e não abre estrutura. O tour continua bloqueado
nessa situação. Manter os callbacks de tour/treino, seus checkpoints, recompensas,
isolamento e controles. Guia, Ajuda, tour e treino são consumidores diferentes.

## Composição e integração

Família azul, seleção ciano, ação dourada, fechar rosa; Fredoka 600 e Nunito 600.
Locais 56 px, ação 52 px, informação/fechar 44 px. A orientação tem 332 px no
desktop; o “i” alterna conteúdo nessa área. Em espaço estreito, fluir para uma
coluna. Usar alinhamento seguro no host rolável para não perder o cabeçalho quando
o conteúdo for mais alto que a janela. Não copiar o layout de compra para o Guia.

O host mantém `#hubGuideOverlay`, popover manual e classe `approved-service-host`.
Conteúdo e folha ficam em Shadow DOM: estilos antigos com `!important` estavam
cobrindo o amarelo e o cabeçalho no jogo, embora a proposta isolada estivesse certa.
Registrar as fontes no documento: `@font-face` só dentro da folha do Shadow DOM
resultou em fonte de fallback na conferência nativa. Não corrigir isso trocando
a família aprovada ou alterando CSS global dos outros consumidores.

Preservar o registro do host pelo feedback existente dos botões, incluindo sua
face pressionada e seleção. A bolha reutiliza o mixer atual. Para botões azuis
do Guia, identificar o host em `composedPath()`; `closest()` no botão não atravessa
a fronteira do Shadow DOM. Manter o cache por evento que evita dois sons quando
a navegação esconde ou recria o botão.

Tab/Shift+Tab circulam pelos controles visíveis; Escape/X fecham e devolvem foco
a Tutorial quando disponível. Não roubar foco em um segundo hide já inativo,
pois o tour ou treino pode ter assumido a entrada. Não escrever atributos a cada
frame sem mudança, nem criar um MediaQueryList por frame para ler modo suave.

## Evidência e limites

Sete destinos reais, entrada do tour/nome, entrada do treino, Escape/foco e consulta
durante uma expedição conferidos em origem descartável. Janela 736 e 320 px
conferida, com restauração do tamanho. Suíte de integração 934/934; testes finais
incluem identificação do host de áudio e preservação de ações. Não declarar aceite
humano do runtime ou encerramento global de GV-025/GV-057 com essa prova.

A apresentação inicial tem 19 etapas e três explicações de desbloqueio. Seu
próximo desenho é proposta separada; preservar nome, Pular, requisito cumulativo
do Relicário e interação com as estruturas reais. Conferir seus seletores antigos
contra os hosts atuais antes de integrar. O monitor permanece pausado.
