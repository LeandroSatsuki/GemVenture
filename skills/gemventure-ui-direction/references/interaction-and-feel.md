# Interação, atenção e game feel

Game feel de UI é a percepção de controle, resposta e consequência. Movimento, som, volume visual e ritmo devem acompanhar a ação real. A pesquisa comparativa fornece exemplos; os efeitos abaixo são direções de protótipo, não animações medidas nos sete jogos.

## Contrato de cada resposta

Registre: ação do jogador → reconhecimento de entrada → evento confirmado do domínio → efeito percebido → estado de repouso. Para cada efeito, especifique gatilho, componente, canal visual/sonoro, duração/easing se propostos, repetição, interrupção, prioridade, comportamento na pausa e alternativa suave.

Um pressionamento pode alterar sombra/profundidade imediatamente. Custo consumido, ganho ou sucesso só aparecem quando confirmados pelo domínio. Se houver falha, comunicar causa junto da ação; se houver espera real, representar processamento. Nunca criar espera artificial, refazer sorteio, repetir pagamento ou condicionar aplicação da regra ao fim de uma animação cosmética.

## Intensidade pela frequência e significado

| Evento | Resposta proposta | Limite |
| --- | --- | --- |
| Hover / foco | Realce de borda/material; foco adicional perceptível | Não deslocar hitbox, trocar fonte, executar ou imitar seleção confirmada |
| Pressionar | Compressão de volume, mudança da sombra inferior | Caixa clicável estável; cancelar/repetir conforme comportamento do controle |
| Navegar / trocar aba | Estado ativo e entrada curta do conteúdo | Não perder posição, resetar compra ou atrasar interação disponível |
| Compra repetida | Reação curta no botão, custo e nível atualizados, ganho local | Sem celebração longa, fila de partículas ou popup a cada compra |
| Aprender habilidade | Nó e conexão respondem; painel exibe mudança real | Seleção, aquisição e equipamento permanecem distintos |
| Escolher carta | Opção reconhecida, efeito/estado confirmado e retomada clara | Não adicionar confirmação ao fluxo rápido nem impedir leitura de alternativas |
| Coletar recurso | Quantidade e destino visíveis; trajetória se esclarecer origem→saldo | Não atravessar texto importante ou multiplicar contadores de recompensa |
| Marco raro / evolução | Antecipação compatível com a regra, acento e repouso | Não reaplicar recompensa em reabertura; respeitar pausa e efeitos suaves |
| Indisponível / erro | Motivo junto ao alvo e resposta discreta | Sem shake global, punição sonora repetida ou depender só de vermelho |

Comece com amplitudes contidas e resposta curta; só fixe milissegundos após examinar o componente e testar repetição. Há um caso concreto já registrado: flutuação das cartas ±2px/4,8s com hitbox fixa e pausas de interação. É contrato daquele consumidor, não duração universal de hover, modal ou recompensa.

## Atenção tem prioridades

Perigo que exige ação prevalece sobre ganho rotineiro e decoração. A decisão em curso prevalece sobre animação de disponibilidade. Aquisição rara pode receber acento mais forte quando não oculta um risco ativo. Evite pulsos permanentes em todo CTA, indicadores e ícones; se tudo chama, nada informa prioridade.

Durante comparação, estabilize textos, custos e painéis. Para ações frequentes, agregar visualmente valores pode evitar ruído, desde que quantidades efetivas permaneçam verificáveis e transações não sejam agregadas de modo diferente do domínio. Limite simultaneidade/reciclagem de efeitos e coalesça eventos de áudio quando necessário; não manter filas de feedback que continuem depois da ação.

## Respeitar o loop próprio do GemVenture

- Combate rítmico: preservar uma ação por batida e relógio compartilhado. Animação de UI não muda janela de acerto, combo, dano, prazo ou frequência de recompensa.
- Vida e fôlego: não unificar barras porque a referência tem só um coração. Dar pistas distintas de depleção e causa; ambas continuam legíveis.
- Cartas: conferir qual fluxo está aberto. As escolhas do Abismo possuem prazo e proteção de entrada; escolha do andar e confirmação de retorno seguem seus contratos. Pausa/aba oculta não devem ganhar comportamento novo por causa do efeito.
- Vila: ambiente vivo em repouso; navegação e preparação não recebem bateria visual de combate. Menus mantêm áudio ambiente segundo o produto.
- Recurso: voo para carteira representa depósito confirmado. Saque ainda na mochila não deve parecer guardado. Cura, XP, estrelas e moeda não recebem a mesma animação que apaga seu significado.
- Controle de fechar: transição de saída não deixa comandos chegarem ao mapa indevidamente nem consome o clique de reabertura. Preservar guardas atuais.

## Prova de interação

Examine uma ação isolada, uma sequência rápida, estado sem saldo/requisito, troca de aba, fechamento durante efeito, reabertura, pausa, som mudo e movimento reduzido. Verifique também mouse e teclado: foco não some ao remontar um painel; Enter/Space não duplicam eventos; clique carregado não seleciona uma carta recém-aberta. Não declarar isso testado a partir de CSS ou imagem estática.

No modo suave, manter indicação funcional com mudança de estado, texto, contraste e marca estável. O feedback importante continua compreensível sem partículas, som ou movimento. Revisão especializada de fluidez não equivale a avaliação com jogadores; registre desconforto como observação e método, sem inventar satisfação medida.
