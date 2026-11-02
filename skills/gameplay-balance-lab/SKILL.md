---
name: gameplay-balance-lab
description: Investigar balanceamento de combate, ritmo, builds e economia de jogos com fórmulas, cenários, simulação e playtest. Usar para gargalos de progressão, escolhas dominantes, grind e curvas de desafio; não confundir bot perfeito com jogador nem aplicar ajustes sem escopo autorizado.
---

# Laboratório de balanceamento

Transformar uma suspeita de experiência numa pergunta verificável. Preferir funções nativas e estado sintético isolado. Registrar versão, origem dos dados, sementes, hipóteses e limites. Código que existe mas não é consumido pela entrada ativa não define o balanceamento do jogo.

## Modelo antes do número

Traçar recursos, fontes, gastos, requisitos, perdas, limites e persistência. Separar moedas e cada material. Para cada melhoria, identificar custo total, ganho marginal, breakpoint de golpes/tempo, oportunidade adiada e tempo de uso antes da próxima mudança. Não confundir custo baixo com boa compra, nem preço alto com grind sem medir aquisição e interesse das tentativas.

Ler [protocolo numérico](references/numerical-protocol.md) para combate, economia, variedade e cenários. Ler [experimentos](references/experiments.md) para transformar achados em testes de polimento. A pesquisa motivadora está em `gameplay-critic/references/source-library.md` quando essa skill estiver instalada; o método aqui é utilizável sem ela.

Verificar interações: multiplicadores, pisos e tetos, arredondamento, mínimo de golpes, invulnerabilidade, cura recorrente, retorno seguro, dano por segundo versus por pulso, sinergias, seleção de ofertas e recargas. Estados de teste avançados precisam ser possíveis no jogo ou identificados como extremos artificiais.

## Medir sem fabricar jogadores

Separar cálculo fechado, execução de funções, simulação de política, teste automatizado e observação humana. Bot com visão do estado, previsão de perigos ou relógio perfeito é um cenário sintético privilegiado. Não publicar seus segundos como duração humana. Taxa de vitória de um bot é propriedade daquele bot e cenário.

Variar habilidade rítmica, erro de decisão, demora de reação, rota, uso de consumíveis, estratégia de gasto e interesse de coleta. Precisão média sozinha não representa erros em sequência nem abandono de atenção. Usar seeds pareadas em comparação; variar parâmetros incertos antes de recomendar valor final. Informar tamanhos da amostra e falhas, inclusive sessões que não concluíram.

Popularidade não prova poder; taxa de vitória condicionada a escolher uma carta não prova causalidade. Considerar momento da oferta, raridade, habilidade, build anterior, dificuldade e sobrevivência até o desbloqueio. Não impor distribuição igual de escolhas: opções de nicho podem ser saudáveis.

## Entregar decisão revisável

Para cada resultado: fórmula/fonte → condições → medida → interpretação limitada → experimento. Propor faixa inicial de teste, não número “ideal” sem dados. Informar tradeoff entre facilidade, duração, variedade e identidade. Preferir uma família de parâmetros por experimento quando for possível isolar o efeito.

Não modificar o jogo numa auditoria. Se houver autorização posterior, respeitar contratos, candidatas e saves. Teste técnico verde não comprova balanceamento satisfatório. No GemVenture conferir `dist/` vigente, baseline local, reservas e monitor pausado; nunca importar parecer de outro chat como resultado desta medição.
