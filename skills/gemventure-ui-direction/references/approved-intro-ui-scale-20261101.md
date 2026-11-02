# Primeira expedição e tamanho global da UI — 01/11/2026

Pedido vigente: aplicar a Primeira expedição v1 aprovada e adaptar o menu a telas
grandes, com botões maiores. O usuário escolheu explicitamente **barra deslizante**
nas Configurações, ligada à UI inteira. Autorização e recibo do recorte:
`E:/Genventure/coordination/INTRO-UI-SCALE-INTEGRATION-20261101/`.

## Escala e adaptação

- `services.ui` / `dist/ui-display.js` mantém 75–150%, passo 5%, padrão 100%, na
  preferência separada `gemventure-ui-display-v1`. Nenhuma migração do save, nem
  alteração dos volumes ou do modo de efeitos. Falha de armazenamento mantém o
  valor nesta sessão e participa do aviso já existente em Configurações.
- O tamanho escolhido se combina à adaptação por resolução; 100% é o padrão
  adaptativo. O Refúgio ocupa a largura disponível, com navegação própria para
  telas estreitas. Na composição desktop, a lista lateral pode rolar quando o
  usuário amplia os controles; Mina e opções permanecem visíveis.
- O cenário e o Canvas do mundo continuam fora da escala da UI. A camada
  `#gvUiPlane` conserva os nós/IDs originais do HUD e Refúgio, incluindo movimentos
  feitos pelos apresentadores atuais. Diálogos nativos, Guia e tour têm seus
  próprios limites de viewport. Não aplicar uma segunda escala a seus filhos.
- Na camada atual do Chromium, percentuais de tamanho já acompanham `zoom`:
  `width:100%;height:100%` cobre a área do Stage. Dividir novamente esses
  percentuais pelo fator encolheu a camada na prova nativa. Conferir retângulos
  reais após mudanças; essa observação não é uma regra universal para outros
  tipos de posicionamento ou navegadores.
- Arraste da Árvore usa movimento do ponteiro dividido pela escala física do
  viewport (`getBoundingClientRect().width / offsetWidth`). Rolagem salva continua
  em pixels locais. VFX de voo preservam seu contêiner original não escalado e
  seus destinos medidos na tela; não converter o deslocamento duas vezes.
- A barra funciona por mouse e teclado. Durante o arraste, o painel de
  Configurações mantém o tamanho inicial para o controle não fugir do cursor;
  ao soltar, recebe o tamanho escolhido. O valor e a pequena amostra respondem
  durante o gesto. Padrão retorna a 100%.
- Em pausa e seleção, limitar o painel ao viewport lógico e reservar as ações;
  a lista interna recebe a rolagem. Em 150%, o rodapé da pausa precisa continuar
  inteiro na tela. A camada usa uma restauração de ponteiro com especificidade
  zero, preservando os estados de interatividade definidos pelo consumidor;
  não congelar `pointer-events` com o valor calculado enquanto o nó estava oculto.
- O treino mantém o Canvas e os pontos do jogador no espaço original; cabeçalho,
  consumíveis, indicadores e pulso recebem a preferência. Isso não aprova um
  redesenho da arena ou alterações nas lições.

## Apresentação guiada

- `refuge-onboarding.js` continua dono das 19 etapas e das três explicações de
  desbloqueio do Relicário. A view e a fala curta ficam em `approved-intro-*`.
  Não confundir esse passeio com o treino de ritmo.
- Preservar nome com sanitizador e limite 24, checkpoint/retomada, Pular/Escape,
  ordem das estruturas e requisito cumulativo de 30 estrelas. Pular o desbloqueio
  marca `relicIntroDone`, para a fala não reabrir a cada frame; não gasta estrelas.
- O resumo é imediato; o “i” revela a fala completa sob ação explícita. Contribuir
  deposita e Forjar conclui, a Vitrola tem controles próprios e terminar o passeio
  não certifica uma compra ou missão aceita. Não inventar avanços financeiros.
- Etapas de clique expõem o **controle real**, sem Próximo que substitua a ação.
  Buscar alvos também nos hosts com Shadow DOM e reconhecer `composedPath()`.
  Trazer o alvo para a região visível quando a navegação estiver rolada.
- Máscaras e destaque usam coordenadas físicas. O popover pode ser montado no
  diálogo aberto; compensar o zoom ancestral antes de posicioná-lo. Medir o
  painel já escalado para mantê-lo na janela.
- Usar a aparência real do jogador pelo renderizador existente. Dar margem ao
  gesto do personagem sem alterar a escala de seu corpo. Não recortar uma mão
  em movimento nem substituir a roupa equipada por uma figura fixa.

## Composição e evidência

Preservar fontes Fredoka 600 / Nunito 600, azul/ciano e ação amarela, estados,
sons e modo Suave. Registrar fontes no documento quando necessário para o Shadow
DOM. Novas telas adaptam a linguagem à decisão do jogador, sem copiar seu layout.

Reconferir a reserva e a composição antes de aplicar. No recorte, outros trabalhos
atualizaram HUD, cartas e `run.js`; essas mudanças foram mantidas. Um novo recibo
aditivo cobre somente os arquivos próprios, sem reescrever recibos de terceiros.
Testes de modelo não substituem verificação física de foco, recorte, arraste e
interações em Shadow DOM. Aceite humano e aprovação de testes seguem distintos.

## Decisão humana posterior — 02/11/2026

A escala inicial e o botão Tamanho padrão usam **80%**. Preservar percentuais
explicitamente salvos pelo jogador; a adaptação à viewport continua multiplicativa.

Missão e objetivo/Descer ficam ancorados. Horda e pressão são informações
passivas fora do fluxo do objetivo, sem ampliar largura, criar scrollbar ou mudar
coordenadas do alvo. Boss/Sentinela cedem espaço à missão, não a empurram.
Manter a organização personalizada do jogador.

O pedido atual substitui a antiga decisão de não piscar a missão concluída:
missão pronta e Descer disponível recebem um pulso forte e localizado de luz e
borda, sem translate/scale no controle. No Suave, usar destaque contínuo.
Congelar o pulso na pausa; não mudar regras, recompensas ou condições de prontidão.
Recibo: `coordination/HUD-PINNED-READY-UI80-20261102-R1/APPLIED-RECEIPT.json`.

## Áreas de clique do HUD — 02/11/2026

Contêineres de layout, espaços flexíveis, lacunas entre itens e efeitos decorativos
não interceptam o ponteiro da caverna. O pulso musical é informativo e deixa o
clique atravessar. Botões recebem entrada na superfície visível inteira; filhos
decorativos não ampliam nem dividem esse alvo.

Listas recebem entrada no conteúdo real. Só habilitar a caixa da região/scrollbar
quando houver overflow, observando mudanças de tamanho/conteúdo com descarte, sem
medir layout continuamente. Preservar roda, teclado, estados desabilitados e
organização personalizada. Verificar `elementFromPoint` em bordas, lacunas e áreas
vazias nas escalas 80 e 150%, além de cliques reais. Distinguir arredondamento de
menos de um pixel de retângulos invisíveis grandes.
Recibo: `coordination/HUD-POINTER-BOUNDS-20261102-R1/APPLIED-RECEIPT.json`.
