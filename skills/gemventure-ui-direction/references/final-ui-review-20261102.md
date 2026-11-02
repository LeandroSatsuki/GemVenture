# Avisos complementares e revisão final — 02/11/2026

Pedido humano atual: concluir aviso de ritmo e revisão transversal. Avisos são
complementos: o evento ocorre independentemente de leitura; a UI não exige resposta.

- Junto do BPM: `↑ Acelera · 4`, `↓ Desacelera · 4` ou `↻ Virada · 4`.
- Quatro pulsos vêm de `musicCue(musicFloor(run),phase)`. Durante a transição,
  retirar a contagem; fora desse intervalo, esconder o complemento.
- Não anunciar aceleração em chefe com relógio constante. Não anunciar a mistura
  inicial como mudança recém-descoberta. Não repetir avisos antigos ao carregar save.
- Não abrir modal, pausar, capturar input, acrescentar SFX, piscar ou criar cronômetro.
- Preservar BPM, trilho oficial, feedback de acerto, combo colorido, itens e estrelas.
- Pausa/ocultação, carregamento, recuperação, escolhas e tutorial suprimem o aviso.
  Retomada consulta a fase atual; não há fila transitória nem contagem por timeout.
- Mesmo conteúdo e leitura estável no modo suave. Um único acento pequeno por estado;
  sem sombra/luz que compita com perigo ou exija vigiar outro canto da tela.

## Encerramento de um recorte global

Mapear todos os consumidores ativos antes de declarar cobertura. Separar fonte,
captura nativa, interação realmente exercitada e estados não verificados.
Conferir entrada/fechar/retorno, comparação, campos de saldo/custo, seleção versus
equipado, 100/150% de UI, teclado, rolagem, imagens e integridade de ações/saves.
Corrigir somente achados concretos, com baseline e reserva adicionadas antes do delta.
Fluxos legados retirados e Loja desativada não são lacunas para inventar mecânicas.

Autorização de aplicação vem do pedido direto desta etapa. Aprovação perceptiva,
playtest com participantes, FPS e toque continuam evidências distintas; testes de
código ou imagens não podem substituí-las. Manter a pausa do monitor e os IDs globais.

## Achados concretos da revisão

- Escala de UI reduz a largura lógica útil de um painel. Media query da janela
  não basta para seus cards: usar a largura do componente e conferir o CTA por
  rolagem/foco. Na Forja, aplicar somente à receita; não impor a composição à árvore.
- Copiar JSON de um perfil não copia registros de identidade em WeakSet/WeakMap.
  Na transação de Pets, reidratar o mesmo accountScore com restoreAccountScore,
  sem mudar JSON, antes de persistir/instalar o rascunho. Preservar isolamento e
  falha atômica. Verificar Pontuação e início/registro da próxima expedição, além
  de apenas verificar que o pet aparece equipado. Não enfraquecer o validador.
- Distinguir atraso de uma entrega animada de falha de navegação. O retorno mantém
  sua guarda até terminar; não remover a guarda para um teste clicar mais rápido.
- Evidência de DOM gerada pelo último clique pode ficar anterior a uma transição
  assíncrona. Captura nativa e estado atual prevalecem; registrar essa diferença.
