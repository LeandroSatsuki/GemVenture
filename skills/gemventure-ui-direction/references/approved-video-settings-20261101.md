# Configurações com Vídeo — aprovação e aplicação de 01/11/2026

Recibo: `E:/Genventure/coordination/VIDEO-SETTINGS-UI-INTEGRATION-20261101/`.
Proposta aprovada: `VIDEO-SETTINGS-UI-PROPOSAL-20261101/v1`. Este recorte sucede
a apresentação de Configurações descrita em settings-pause-20261101.md; a regra
de compactação das cartas naquele documento continua própria da pausa.

- Três abas locais: Áudio, Vídeo e Interface. Seleção ciano, superfícies azuis,
  fechar vermelho e retorno azul; fontes Fredoka/Nunito600 reais. Abas não são
  ações de gameplay. Os painéis se reorganizam em uma coluna quando necessário;
  escala ampliada conserva rolagem de todos os controles.
- Vídeo lê o singleton vigente `getVideoPreferences`. Seus seis ranges e três
  camadas são os do proprietário: não criar outro serviço, chave ou flag suave.
  Brilho neon cobre cristais, líquidos e partículas. Não expor um seletor de
  cores: a paleta acompanha os biomas. Luz de apresentação não muda revelação
  lógica, combate, caminhos ou recursos.
- Padrão de luz usa o reset do proprietário:103/106/200/200/144/68, três camadas
  ativas. Não colocar100 em tudo e não resetar áudio, tamanho da UI ou efeitos.
  Áudio padrão e Tamanho padrão têm seus próprios serviços e escopos.
- Música/SFX continuam independentes, mute preserva volumes, efeitos Intensos/
  Suaves usam os valores existentes intense/soft. O exemplo visual anterior foi
  preservado como uma estrela pequena, com resposta curta somente ao escolher
  intenso, respeitando movimento reduzido, fechamento e descarte.
- A barra75–150 em Interface continua global, com trava de escala durante o
  arraste e ajuste por teclado, liberação ao soltar/cancelar/desfocar/fechar.
  Não escalar só a amostra Aa nem alterar coordenadas de clique do mundo.
- Persistência é imediata. Falha de qualquer preferência mantém ajuste em sessão
  e aviso curto; sem botão Salvar fictício. O serviço de vídeo é assinado enquanto
  Configurações está aberta; soltar assinatura no fechamento e dispose, inclusive
  após aberturas repetidas. Ler ou abrir a aba não grava preferências.
- Preservar os IDs e o fluxo de menu-controller: pausa da aplicação, áudio atual,
  fechar/Escape/Voltar e retorno ao mundo/menu. Navegação por setas/Home/End entre
  abas; Tab não entra em painéis ocultos. Funções não migram para dicas por hover.

Consumidores: `dist/index.html:#gameSettings`, `menu-controller.js`,
`settings-panels.js`, `approved-settings-ui.css`. Não levar controles de prévia,
Tweak ou estado ilustrativo ao produto. Os serviços e schemas não foram alterados.
