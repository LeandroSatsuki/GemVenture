# Avisos de descobertas — aprovado em01/11/2026

Fonte visual: `coordination/DISCOVERIES-UI-PROPOSAL-20261101/v1/DELIVERY.json`.
Aplicação: `coordination/DISCOVERIES-UI-INTEGRATION-20261101/APPLIED-RECEIPT.json`.

- Arte fornecida + tipo + nome, em painel azul/Fredoka/Nunito. Sem descrição,
  preço ou botão. O aviso é passivo e nunca rouba foco ou bloqueia o mapa.
- Ler somente eventos confirmados `recordDrop`/`petUnlocked` e a posse real.
  Usar os nomes/arte da Vitrola e Pets, incluindo os aliases de apresentação.
  Não antecipar disco raro nem chamar um pet descoberto de pet desbloqueado.
- Fila transitória limitada ao catálogo; um aviso por vez, ordem dos eventos e
  deduplicação por item/perfil. Não inferir descobertas ao abrir tela/carregar save.
  Eventos de pets do retorno entram no retorno fresco, sem reproduzir resultados
  antigos carregados. As coleções permanentes continuam sob seus domínios.
- Entrada230ms uma vez e3200ms de apresentação visível. Pausa, aba oculta,
  cartas, retorno/modal e ausência de espaço suspendem a apresentação. Suave/
  movimento reduzido mantém a leitura estática. Não há pulso/brilho repetido.
- Converter coordenadas físicas pela escala real do plano global da UI.
  Preservar orbs, cartas, missão, teclas1/2/3 e objetivo. Na caverna, aguardar
  espaço na lateral fora do centro da ação. No Refúgio ampliado, a alternativa
  fica ao lado da navegação quando a margem esquerda está ocupada.
- Não criar carteira, seleção automática, recompensa, prazo de gameplay ou
  nova voz de áudio. Som de disco existente permanece em `processEvents`.
  Substituir somente os textos legados dessas duas descobertas; outros avisos
  e decisões conservam seus consumidores.

O aceite humano não certifica automaticamente todas as viewports. Conferir
encaixe, fontes/arte, bloqueios, fila e escala no consumidor real de cada lote.
