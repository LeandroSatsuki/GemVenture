# Desempenho por andar — aprovado em 01/11/2026

Recibo: `E:/Genventure/coordination/FLOOR-PERFORMANCE-UI-INTEGRATION-20261101/`. Consulta ativa do Elevador em `approved-lift-ui.js`, renderizada por `approved-floor-performance.js` e CSS próprio. A rota legacy de floor-records-view não é o consumidor ativo.

Preservar seis campos independentes de s.descent.records: endereço numérico, estrelas máximas até cinco, melhor tempo, última pontuação, maior pontuação e número de conclusões. Marcas podem vir de tentativas distintas. Ausente é “—”; zero salvo continua zero. Sem prêmio ou novo recorde cosmético ao abrir o histórico.

Linhas compactas agrupadas pelos biomas reais; leitura em duas colunas quando a largura local não comporta seis campos. Miolo rolável, cabeçalho e retorno sempre acessíveis. Usar estrelas/troféu de HUD_ART e Fredoka/Nunito aprovadas. Controle i contém explicação, sem tooltip de hover. Ranking continua Em breve, indisponível.

Abrir consulta suspende os controles de destino por trás da tabela. Voltar ou ESC restaura exatamente o Elevador, modo, andar e foco do acionador; X chama o fechamento existente. Consulta não chama onAction nem escreve save. Escala vem da preferência global: calcular altura disponível nas coordenadas locais do painel, sem aplicar zoom duas vezes. Reutilizar mixer e mapa de botões; retorno amarelo usa data-primary=true. Modo suave mantém dados/estados e retira a entrada cosmética.

O aceite é específico deste consumidor; Preparação do Abismo e demais detalhes seguem por proposta própria. Não encerrar tarefas globais de UI nem retomar monitor.
