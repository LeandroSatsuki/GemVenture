# Alertas da caverna — aprovado em01/11/2026

Fonte: `coordination/CAVE-ALERTS-UI-PROPOSAL-20261101/v1/DELIVERY.json`.
Aplicação: `coordination/CAVE-ALERTS-UI-INTEGRATION-20261101/APPLIED-RECEIPT.json`.

- Hordas e pressão podem coexistir no objetivo da descida, sem modal/botão novo.
  A orientação e as condições originais de navegação permanecem.
- A horda usa `room.wave`, `wavePlan` e fase musical; a chegada mostra somente
  `horde.count` confirmado, inclusive zero. Não prever criaturas por plan.count.
- Pressão usa `cavePressure`: últimos16 pulsos e estágios reais +25/+50/+75% de
  dano inimigo. Três segmentos são estágios, não um novo recurso. A UI não altera
  o intervalo das ondas, dano, cap, XP ou relógio.
- Não retroceder o estágio já resolvido ao amostrar uma fase visual menor que
  run.beat/run.acted, inclusive na restauração de relógios antigos.
- Paleta azul/Fredoka/Nunito; antecipação âmbar#ffd36a, dano#ff5264. Barras e
  segmentos são dados; não criar outro ícone para esse consumidor.
- Chegada e avanço assentam uma vez200ms. Chegada permanece1200ms de apresentação
  visível. Pausa/aba oculta bloqueiam o tempo cosmético; suave fica estático.
  Carregar um estágio não cria celebração/chegada retroativa.
- Preservar sons de aviso e de onda existentes. Substituir somente os textos
  legados desse recorte. A composição impede duplicação do parágrafo antigo.
- Perigo tem prioridade sobre descobertas; estas aguardam, com a fila preservada.
  Invalidar suas medidas quando o painel muda de tamanho. Preservar combo
  colorido, estrelas verticais, pulso oficial, orbs e teclas1/2/3.
- Conferir a cascata completa: [hidden] precisa vencer display das linhas,
  trilhas e segmentos, e a regra nova deve vencer o seletor legado do objetivo.
  Não resolver corte diminuindo fontes nem escondendo uma das duas condições.

Verificações do lote não equivalem a aprovação perceptiva de todos os tamanhos.
Revalidar especialmente escala150%, conteúdo simultâneo e variantes de campanha,
legado, treino e Abismo antes de estender esse consumidor.
