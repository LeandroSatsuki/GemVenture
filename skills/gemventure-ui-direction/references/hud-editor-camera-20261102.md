# Editor de organização e câmera — aprovado 02/11/2026

Estado: proposta aprovada por mensagem humana direta “aprovado, pode aplicar ao game”. Integração em `coordination/HUD-EDITOR-CAMERA-INTEGRATION-20261102-R1`; conferir APPLIED-RECEIPT.json para aplicação/verificação. A proposta e suas evidências permanecem em `coordination/HUD-EDITOR-CAMERA-20261102-R1`. O aceite da proposta não é um relato de playtest posterior.

## Função e preservação

Personalizar o campo de leitura da expedição sem alterar buffs, cargas, recompensas, ritmo, progressão ou revelação. Configurações da UI pertencem ao jogador/dispositivo e não ao perfil de gameplay. Não clonar controles do jogo vivo nem transferir sua autoria de eventos.

- `hud-layout.js`: quinze grupos, posições normalizadas, escala 65–175%, ocultação, até oito presets nomeados. Chave independente `gemventure-hud-layout-v1`.
- `hud-layout-presenter.js`: somente translate/scale/origem e flags próprias. Não modificar `.hidden` de domínio. Limpar apenas estilos de sua propriedade; composição sem drift. Publicar `gvHudBaseBounds` para os donos da barra de boss/Sentinela medirem o espaço automático anterior à personalização.
- O default vazio preserva o layout automático aprovado. Alterar um bloco não deve empurrar os demais. Boss/Sentinela cedem o afastamento automático da missão apenas quando o usuário altera os blocos envolvidos.
- A ajuda opcional desconsidera obstáculos que o jogador ocultou. Telegraphs e mecânicas permanecem do domínio.

## Editor

Prévia Shadow DOM com marcação/CSS/fontes canônicos e captura do Canvas real. Dados demonstrativos devem ser sinalizados. Sem perfil falso inserido no runtime oficial. Seletores na prévia nunca duplicam IDs da árvore DOM do jogo vivo.

Rascunho, Aplicar e Cancelar são distintos. Presets explicitamente salvos persistem independentemente do rascunho. Reset global ou individual não apaga presets. Desfazer/refazer tem histórico limitado. Limites e falha de armazenamento não apagam opções anteriores; preservar a escolha na sessão e informar persistência pelo status de Configurações.

Usar lista de blocos e teclado como alternativa ao arraste. Manter fechamento, reset e aplicação visíveis com escala global ampliada; painel lateral pode rolar e recolher. Grade e guias são auxílios do editor, não HUD do jogador. Não acrescentar descrições de gameplay aos blocos.

## Câmera e captura

`distancia_camera_pct` é preferência de vídeo 70–150%, padrão 100%. Escala visual = escala existente × 100/distância; preservar enquadramento do boss. Reset de luz não altera câmera e reset de câmera não altera luz. Refúgio permanece no enquadramento próprio.

World e cursor usam exatamente a mesma escala/inversa. Não alterar alcance, tiles, revelação, posição ou simulação. `gemventure-preview-capture` solicita redesenho pausado da última cena com dt zero; `canvas.dataset.gvSceneReady` impede capturar o carregamento antes da cena. Não chamar tick/act para produzir uma imagem.

## Validação exigida

Verificar arraste real, escala, ocultação, undo, cancelamento, aplicação, reload, save/load/duplicação/exclusão de presets e reset sem apagá-los. Conferir 100/150% global, painéis e rodapé. Câmera nos extremos com round-trip da geometria do cursor e perfil congelado idêntico. Isso não substitui playtest de precisão/legibilidade em combate, toque, CRT e teste humano.

Referências primárias: [FFXIV](https://na.finalfantasyxiv.com/uiguide/know/know-hud/hud-layout.html) e [anúncio oficial de WoW](https://worldofwarcraft.blizzard.com/en-gb/news/23837944/). Ver limites de consulta em RESEARCH.md do pacote.
