# Protocolo numérico

## Economia

Medir por recurso: saldo inicial, ganho bruto, perda, gasto e saldo final. Separar estoque guardado de carga em risco; recompensa única de recorrente; campanha de modo infinito; renda ativa de passiva. Abrir os consumidores reais antes de classificar recursos órfãos.

Estimativa inicial de tentativas para compra: máximo, entre os recursos exigidos, de `déficit / ganho líquido por tentativa`, apenas se ganhos e estratégia forem estacionários. Arredondar para cima e incluir moeda. O máximo expressa gargalo, não soma de moedas incompatíveis. Falha, desbloqueios, rendimento variável, gasto concorrente e troca tornam essa aproximação insuficiente; nesse caso simular a sequência completa. Não calcular tempo com ganho zero nem esconder compras inviáveis.

Relatar mediana e dispersão de tempo até uma compra que altere comportamento, não só primeira compra possível. Acompanhar recursos sobrando junto ao recurso escasso. Diferenciar optar por juntar para um objetivo de ficar sem alternativa relevante. Descontar gastos para recuperar a tentativa quando existirem.

Retenção após derrota pode amortecer aprendizado ou tornar farm por morte melhor que retorno. Comparar rendimento líquido por tempo e risco de retorno, avanço, extração e derrota deliberada. Recompensa por profundidade e facilidade de acesso podem produzir rotas dominantes.

## Combate e ritmo

Começar por golpes discretos: `ceil(HP / dano)` sob dano constante. A fórmula deixa de bastar com golpes mínimos, escudo, críticos, vulnerabilidade ou procs. Calcular breakpoints reais com a função nativa. Um aumento percentual pode não mudar nenhum encontro frequente.

Tempo de encontro inclui aproximação, espera por janela, recarga, reposicionamento e ameaça simultânea. Converter pulsos pelo relógio nativo variável; BPM fixo só quando o cenário o garante. Janela em milissegundos, fração de pulso e offset são unidades diferentes. Distinguir áudio atrasado, ação rejeitada, alvo inválido, atraso voluntário e erro de leitura.

Para uma reserva que ganha `g` num acerto e perde `m` num erro, o equilíbrio simplificado é `p = m/(g+m)`, supondo um resultado por tentativa, valores constantes e ausência de limites ou outros efeitos. Isso é uma hipótese local, não precisão mínima humana do jogo. Simular limites, sequências de erros, regeneração, proteção e transições.

Dificuldade tem eixos independentes: precisão, leitura, tática, reflexo, navegação, planejamento econômico, conhecimento e resistência da sessão. Mais HP testa duração e recursos; mais padrões legíveis pode testar domínio. Dano inevitável precisa ser distinguido de erro do agente ou da política de movimento.

## Builds e modos

Registrar oferta, escolha, alternativa, estado anterior e resultado. Comparar identidades de comportamento: área versus alvo único; mobilidade versus resistência; precisão versus tolerância; saque versus segurança. Identificar limite e custo da sinergia antes de chamar um combo de quebrado. Builds fortes podem ser a recompensa desejada, desde que não apaguem todas as escolhas e ameaças.

Na progressão infinita, comparar taxas de crescimento de HP, dano, poder, cura, recompensas e oferta de melhorias. Teto de poder contra dificuldade ilimitada pode ser término intencional. Investigar quando o objetivo muda de decisões para apenas repetir golpes. Não exigir que o infinito seja vencível em toda profundidade.

## Registro reproduzível

Guardar script de auditoria separado do runtime quando trouxer valor de repetição. Ele deve falhar de maneira visível se entradas mudarem, aceitar saída isolada e registrar hipóteses. Manter hashes das dependências ou manifesto de cobertura. Não testar somente se o relatório contém palavras esperadas; conferir valores contra exemplos manuais e execução nativa.
