---
name: gameplay-critic
description: Criticar jogos em polimento, investigando foco, mecânicas, desafio, progressão, repetição, descoberta e motivos de continuidade ou abandono com pesquisa e evidências. Especialmente útil para aventuras de mineração, ação rítmica e roguelites; não implementa mudanças automaticamente.
---

# Crítica de experiência de jogo

Produzir um parecer independente que ajude o criador a decidir o que preservar, aprofundar, simplificar, corrigir ou retirar. Buscar vontade voluntária de voltar a jogar e satisfação, não maximizar tempo gasto. A skill é um método e uma biblioteca consultável; não constitui treinamento permanente do modelo nem certificação profissional.

## Começar pela versão e pela promessa

Identificar build, origem, plataforma, entrada real e caminhos alcançáveis. Documentação, código existente e função acessível ao jogador são coisas diferentes. Em repositório com mudanças locais, registrar commit e hashes dos arquivos relevantes. Ler contratos operacionais sem herdar pareceres antigos. Se o usuário pedir análise sem viés de chats anteriores, não consultar históricos de conversas nem usar diagnósticos antigos como evidência.

Descrever a promessa por verbos e decisões: o que o jogador faz a cada instante, numa expedição e entre sessões? Classificar o híbrido pelas regras de ação, falha, reset, permanência e escolha. Tema de aventura não prova um gênero; mineração não implica sandbox; cartas de bônus não implicam deckbuilder; estrelas de prestígio não implicam reset de conta.

Separar públicos por motivação e familiaridade: domínio rítmico, tática/build, exploração, coleção, progresso incremental, descanso. São hipóteses de público, não personas estatisticamente validadas. Comparar jogos por mecanismo compartilhado e explicitar onde a analogia deixa de funcionar.

## Construir evidência antes do veredito

Para pesquisa ou atualização da base, ler [método de pesquisa](references/research-method.md). A [biblioteca comentada](references/source-library.md) contém fundamentos, relatos de desenvolvimento, críticas e vozes de jogadores; consultar apenas as partes pertinentes e reabrir fontes sujeitas a mudança. Pesquisa inicial: 02/11/2026.

Usar cinco rótulos que não se substituem: **implementado** (código alcançável), **observado** (sessão documentada), **medido** (procedimento e amostra), **relatado** (fonte humana), **hipótese** (inferência a testar). Identificar intenção de projeto separadamente. Inspeção de código não comprova diversão, justiça percebida, fadiga física, mix audível ou retenção.

Consultar [roteiro de crítica](references/experience-review.md) para análise abrangente. Traçar regra → comportamento incentivado → experiência provável → evidência contrária. Examinar interações, não apenas sistemas isolados: uma penalidade tolerável sozinha pode se tornar esmagadora junto de perda de combo, saque e tempo de retorno.

Para gargalos numéricos, consultar `gameplay-balance-lab` se disponível. Sem ela, extrair fórmulas e construir cenários explícitos; não preencher lacunas com números inventados.

## Decidir com proporção

Antes de chamar um elemento de inútil, procurar sua função tática, econômica, didática, expressiva, afetiva, de descanso ou acessibilidade. Baixa utilização pode indicar descoberta ruim, desbloqueio tardio, nicho ou redundância. Uma escolha dominante precisa de contexto e custo de oportunidade. Simplicidade não é automaticamente superficialidade; complexidade não é profundidade.

Recomendar primeiro a menor mudança capaz de resolver o problema identificado. Preservar os pontos fortes e a fantasia principal. Se a mudança elevar desafio, explicar qual decisão ou habilidade passa a importar; aumentar vida de inimigos pode somente alongar uma rotina. Se reduzir atrito, testar se também elimina uma tensão valiosa. Evitar transplante de sistemas só porque um jogo famoso os utiliza.

Para cada achado relevante, registrar: situação concreta, fonte/local, público e etapa, consequência, grau de confiança, explicação alternativa, proposta, risco ao ponto forte e teste que poderia refutar o diagnóstico. Prioridade combina gravidade, frequência observada, alcance e confiança; usar categorias justificadas, não uma nota global pseudocientífica.

## Entrega e limites

Entregar tese central, pontos fortes a preservar, mapa de cobertura, problemas priorizados, oportunidades subexploradas e sequência curta de experimentos. Diferenciar proposta de ajuste aprovado. Indicar com clareza o que foi jogado, simulado, apenas lido ou não verificado. Um parecer pode cobrir todos os sistemas sem validar toda a experiência: não chamá-lo de avaliação completa de jogabilidade se faltou observação.

No GemVenture, usar `docs/TEAM_WORKFLOW.md` e o controle vigente só para versão, autorização e reservas. O código oficial fica em `dist/`. Não alterar gameplay, saves, arte, registro compartilhado ou monitor em uma tarefa apenas de crítica. Novas evidências entram em referências com data, limites e contradições; não acumular opiniões como regras universais.
