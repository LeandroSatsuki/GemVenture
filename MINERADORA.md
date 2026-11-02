# Broca AFK — cascalho, eventos e economia (14/10/2026)

## Identidade
A produção automatizada de [Idle Miner Tycoon](https://www.idleminertycoon.com/) é a referência de ciclo de reinvestimento. Os eventos, preços e taxas abaixo são decisões próprias de Gemventure, seguindo o pedido do jogador.

A Broca produz **cascalho**, utilizado exclusivamente para seus próprios upgrades. Cristais são jackpots secundários. Não entrega moedas, XP, essências, estrelas, passes, buffs de personagem ou progresso de expedição. Profundidade e combo pertencem só à máquina. Forja, árvore, poço, prestígio e Zag mantêm seus papéis.

## Regras e eventos
- Impacto comum: 4 s no motor inicial. Cada bloco destruído gera cascalho; multiplicador ×1–×4 sobe com a sequência.
- Rocha densa: resistência adicional de 2,5 s na base. Sem frenesi, rompe a sequência e esfria o combo. Perfuração reduz essa resistência, sem aumentar dano de jogador.
- Titânio: indestrutível, desvia a máquina lateralmente; não paga recompensa e resiste aos efeitos de limpeza.
- TNT: 3% inicial, +1 ponto percentual por melhoria, máximo 6%. Limpa vizinhança 3×3; nível 2 da dinamite amplia para 5×5. Limites laterais e titânio reduzem a quantidade efetiva.
- Frenesi: 2% dos encontros; velocidade ×4 durante 5 s de funcionamento, ignorando a resistência extra da rocha densa. Pausa conserva o tempo restante.
- 50 blocos na sequência: pulso sísmico, coleta o cascalho da janela visível, zera o medidor e garante um prêmio de cristal. Não dispara pulsos recursivos.
- Sorteio de cristal: **2% por impacto direto que destrói um bloco**. Laterais, TNT e pulso não fazem sorteios adicionais de jackpot. Se o impacto sorteou cristal e também acionou pulso, entrega um único lote, sem duplicação.
- O foco direciona aproximadamente metade dos jackpots à cor escolhida; não muda o total.
- Camadas consumidas por explosão/pulso são ultrapassadas; não são premiadas novamente.

Os blocos que produzem recursos são majoritariamente cascalho. Mesmo os cristais raros chegam junto com cascalho, sem tornar minério comum o produto primário.

## Melhorias
| Parte | Início | Crescimento do preço | Limite / efeito |
|---|---:|---:|---|
| Motor | 90 cascalho | ×1,42 | NV. 20; +2% da velocidade base por nível |
| Núcleo | 6.000 | preço = 6.000 × (1 + nível)^1,6 | +4% do prêmio base e +2% do cascalho base por nível |
| Perfuração | 140 | ×1,4 | 20 melhorias; reduz resistência de rocha densa |
| Laterais | 2.200 | ×5 | 2 laterais, bônus de cascalho e sequência |
| Dinamite | 1.800 | ×4 | 3 melhorias; +1% TNT e área maior |
| Autonomia | 900 | ×2,5 | 1 h inicial até 8 h offline |

Só a carteira de cascalho paga essas partes. Capacidade inicial: 20 milhões, crescendo com o núcleo: 20 milhões × (1 + núcleo)^1,3, limitada aos inteiros seguros. A tela apresenta preço e disponibilidade antes da compra. Atualização processa o tempo anterior no estado antigo. Velocidade cresce linearmente. O núcleo mantém evolução após o motor inicial, com custo polinomial mais forte que seu ganho linear. Há limite técnico de um milhão de níveis, não um alvo ou teto exibido ao jogador.

## Escala para a progressão longa
O rendimento de 90–97 cristais/h **não é um teto**. Cresce o tamanho do lote raro, mantendo a chance de encontro em 2%:

`prêmio = (1 + camadas da broca / 25.000)^0,35 × (1 + núcleo × 0,04) × (1 + melhor andar × 0,015)`

A profundidade usa crescimento sublinear: dobra o tempo acumulado sem dobrar a renda. O núcleo dá +4% da base por melhoria. Cada andar alcançado nas expedições adiciona 1,5% da base ao fator da campanha; a atividade do jogador ajuda a máquina a acompanhar o jogo. Os três fatores se multiplicam, sem multiplicar a chance de drop.

Lotes fracionários são arredondados por sorteio determinístico: um fator 1,25 entrega um cristal normalmente e dois em aproximadamente 25% dos jackpots. O mesmo save e tempo sempre dão o mesmo resultado; abrir ou desenhar o painel não muda a rolagem. Pulso segue o mesmo lote e sempre dá pelo menos um cristal. Cascalho recebe apenas o fator de profundidade e +2% da base por nível de núcleo; não recebe bônus do recorde da campanha. A interface mostra `PRÊMIO ×...` e a quantidade realmente recebida.

## Auditoria reproduzível
Execute `node tools/audit-miner.mjs`. Em 300 seeds, uma hora:
| Configuração | Cascalho médio/h | Cristais totais médios/h | P10–P90 de cristais |
|---|---:|---:|---|
| Inicial, primeira hora | 9.011,30 | 27,09 | 21–34 |
| Melhorias mecânicas, núcleo 0, primeira hora | 97.104,96 | 91,10 | 82–100 |
| Núcleo 25, 25.000 camadas, recorde 35 | 184.880,98 | 350,76 | 315–381 |
| Núcleo 100, 250.000 camadas, recorde 150 | 667.883,72 | 3.373,18 | 3.017–3.730 |

As quantidades são totais, somando quatro cores. As configurações avançadas são estados de teste, não estimativas de tempo para alcançá-las. Exigem investimento prolongado e progresso ativo. Prêmios garantidos de pulso e tamanho dos lotes entram na auditoria. Não existe rendimento horário fixo na progressão longa. São simulações, não garantias de ganho ou diversão; revisar com sessões reais, especialmente o retorno de cada nível de núcleo frente às receitas da Forja.

## Migração, refino e troca
O save da máquina passa de versão 1 a 2 na mesma chave geral. Motor, profundidade, foco, estado ligado/desligado e todos os fragmentos antigos são preservados. Máquinas anteriores conservam 8 h offline; novas começam com 1 h. Não há conversão automática do estoque antigo nem produção de novos fragmentos.

A aba **Reserva** só aparece quando existe estoque antigo: 2.000 fragmentos da mesma cor = 1 cristal. Não aceita cascalho. A aba **Trocar** mantém o serviço da vila: 5 cristais de origem + 5 moedas por cristal de destino. Trocas de ida e volta perdem 96% antes das taxas; não geram recursos. Transações rejeitam valores inválidos, mesmo material e overflow.

## Persistência e apresentação
`dist/miner.js` é a fonte única da simulação. Trabalho usa unidades inteiras, com resultados equivalentes em lotes, intervalos curtos e recarregamentos. A ausência é limitada pela autonomia e processada uma vez; relógio regressivo não gera renda. Resto de trabalho, frenesi, sequência, coluna e seed são persistidos. A apresentação não gera recursos.

Render: janela fixa 13×7, 30 FPS, até 96 cubos de destroço, 8 números, 20 máscaras de escavação e histórico de 24 eventos. As máscaras persistem no save e impedem coleta duplicada, sem guardar o mapa infinito. Movimento lateral amortecido, rolagem limitada a 3 linhas/s. TNT treme somente a área da máquina; modo suave remove esse tremor e reduz partículas. Sem halos, blur, faíscas ou sombras multicoloridas. Sombras de um tom, partículas sólidas com gravidade rápida, pulso de contorno flat. Vila oculta não é redesenhada.

Música suave da mineradora permanece; seis sons próprios distinguem contato, fricção, desvio, dinamite, pulso e frenesi, com limites de vozes e silêncio ao ocultar o painel. Não altera a música de combate.

Novo sprite: `dist/assets/village-hept32/mining-machine-v2.png`. A versão amarela anterior sem uso foi removida na limpeza de 25/10/2026. Corpo chanfrado de aço, cabeça larga de bate-estacas, esteiras, caçamba e lâmpada de quartzo; paleta HEPT32 normalizada uma vez, cache máximo 512 px. Vila usa o mesmo sprite e preserva proporção e ponto de apoio.

## Validação
`tests/miner.test.mjs` cobre migração, equivalência temporal, limites, relógio, pausa, eventos, materiais separados, compras, runs, estabilidade das células e auditoria de raridade. Auditoria de arte: 5.922 variantes, 33 famílias, 7 biomas, 32 cores. QA manual usa origem isolada, preservando a partida real.

Validação final: 384 testes aprovados. Na interface, a compra do núcleo debitou exatamente 6.000 cascalhos, mudou o prêmio de ×1,00 para ×1,04 e manteve moedas/cristais. Frenesi usa a variação laranja em cache. Nenhum erro de console. Prévia: `broca-afk-polida.jpg`. A amostra de 900 desenhos teve mediana próxima de 0,8 ms e p95 de 2,1 ms nesse navegador em segundo plano; não equivale a garantia de FPS.

Uma ausência máxima de 8 h na máquina mecânica completa processou 11.373 eventos, retendo apenas os 24 finais. Execuções medidas variaram aproximadamente entre 25 e 64 ms no ambiente de teste. Isso mede simulação, não FPS. Como o jogo local atual, não há sincronização ou trava de carteiras entre abas concorrentes.
