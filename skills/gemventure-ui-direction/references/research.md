# Pesquisa inicial — UI incremental desktop e game feel

Consulta: 29/10/2026. Preparação para a auditoria do GemVenture, não diagnóstico de telas já observado nem estudo de eficácia com seus jogadores.

## Fontes primárias consultadas

### Contexto de interface e consistência

- [Microsoft XAG 114 — UI context](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/114): a interface deve esclarecer finalidade, interação e consequência. Aplicação proposta: avaliar custo, benefício, requisito e resultado no local da decisão. Isso não determina uma paleta específica.
- [Microsoft XAG 112 — UI navigation](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/112): navegação previsível, consistente e com estruturas semelhantes entre telas. Aplicação proposta: comparar posição e comportamento de fechar/voltar, ordem das ações e continuidade entre hub e painéis.
- [Microsoft XAG 113 — UI focus handling](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/113): foco perceptível e visível. Aplicação proposta: verificar teclado e foco separadamente de hover e seleção; não depender apenas de brilho sutil.

### Legibilidade e sinais

- [Microsoft XAG 101 — Text display](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101): leitura depende de tamanho, espaçamento e opções de apresentação. Aplicação proposta: conferir texto real em escalas desktop e com o CRT do jogo, sem adotar um tamanho único para todos os componentes.
- [Microsoft XAG 102 — Contrast](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/102): elementos e fundos precisam se distinguir. Aplicação proposta: verificar texto e estados sobre as superfícies efetivamente renderizadas; medir cores estáticas não encerra a avaliação com filtros e efeitos.
- [Microsoft XAG 103 — Additional channels for visual and audio cues](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/103): informação essencial precisa de sinais complementares; cor isolada é insuficiente. Aplicação proposta: diferenciar indisponível, foco, escolha e recompensa com forma/texto além da cor, preservando entendimento sem som.

### Movimento, atenção e gênero

- [Microsoft XAG 117 — Visual distractions and motion settings](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/117): movimento, atualização e conteúdo piscante podem distrair e dificultar leitura; prevê controles de movimento. Aplicação proposta: examinar competição entre efeitos e decisões, respeitando modo suave e configurações existentes. Não é argumento para remover a identidade expressiva do jogo.
- [Spiel et al., 2019 — “It started as a joke”: On the design of idle games](https://research.monash.edu/en/publications/it-started-as-a-joke-on-the-design-of-idle-games/), DOI 10.1145/3311350.3347180: resumo e metadados consultados. Entrevistas com seis designers e discussão do afastamento ativo como parte do gênero. Inferência para avaliar no GemVenture: distinguir informação para acompanhamento e informação que exige ação, sem transformar toda disponibilidade em alerta. O resumo não demonstra melhora de UI nem é playtest do GemVenture.
- [GDC — Juice It or Lose It, Martin Jonasson e Petri Purho](https://www.gdcvault.com/play/1016487/Juice-It-or-Lose): página e resumo consultados; vídeo não assistido nesta pesquisa. O resumo propõe demonstrar efeitos para tornar um jogo mais satisfatório. Serve como referência de investigação, sem atribuir tempos de animação, técnicas específicas ou eficácia quantitativa ao vídeo não examinado.

## Jogos para comparação por pergunta

As páginas oficiais abaixo foram lidas para selecionar referências por função. Não houve inspeção jogável, análise de frames de seus vídeos ou medição de UI nesta etapa. A pergunta de estudo é nossa; não é uma conclusão sobre eficácia.

| Referência | Base verificável da seleção | Pergunta para comparação visual/interativa posterior |
| --- | --- | --- |
| [(the) Gnorp Apologue](https://store.steampowered.com/app/1473350/Gnorp_Apologue/) | A descrição do desenvolvedor relaciona crescimento numérico à apresentação visual e descreve melhorias, produção/coleta e builds. | Como tornar o ganho percebido sem inundar os controles e a área de leitura? |
| [Clicker Heroes](https://store.steampowered.com/app/363970/Clicker_Heroes/) | A página descreve ouro, contratação/melhoria de heróis e progresso ocioso. | Como distinguir recurso, compra possível e ganho da compra em ações recorrentes? |
| [Balatro](https://store.steampowered.com/app/2379780/Balatro/) | A descrição apresenta cartas, sinergias, escolhas que alteram a partida, estatísticas e acabamento CRT. É referência adjacente, não incremental equivalente. | Como comunicar comparação, seleção e resultado de combinações sem perder legibilidade? |

Copiar a cor ou composição desses jogos não preservaria automaticamente a identidade do GemVenture. Avaliações de loja e popularidade não isolam a contribuição da interface; não usar vendas/reviews como prova causal de uma decisão de UI.

## Hipóteses iniciais para testar no GemVenture

1. A mesma função deve manter aparência e localização previsíveis entre painéis, com variação temática deliberada.
2. Separar informação persistente, evento e detalhe pode reduzir competição visual, desde que não esconda risco, custo ou benefício essencial.
3. Resposta imediata ao comando e confirmação do resultado real devem ser distinguíveis.
4. Uma ação recorrente precisa continuar agradável após repetição; uma conquista rara pode justificar uma celebração maior.
5. No hub, repouso e orientação devem coexistir com identidade e vida; no combate, a UI precisa deixar riscos e ações importantes legíveis.
6. Na escolha de cartas, o jogador deve comparar as opções e reconhecer o que escolheu dentro das regras atuais. Alterar prazo/pausa é decisão de gameplay, não correção automática de UI.

Estas hipóteses ainda não são achados do jogo. Para validá-las, observar jornadas reais e registrar a origem da prova, inclusive quando algo não puder ser acessado.

## Prova necessária na auditoria

- Inventariar telas e estados na versão correta, incluindo referências aprovadas e consumidores novos. Separar oficial/candidata/prancha.
- Comparar componentes equivalentes e extrair a família visual já aprovada. Registrar exceções com função justificável.
- Testar cliques repetidos, transições, retorno/foco, números/textos longos e estados bloqueados. Captura estática não certifica essas interações.
- Para movimento, registrar sequência e condições observadas; tempos de protótipo devem ser rotulados como propostas. Para legibilidade, observar a dimensão real, zoom e filtro atuais.
- Validar se o jogador identifica a próxima ação, entende a consequência e percebe o resultado. Essas perguntas estruturam o teste; sem participantes, a revisão especializada não equivale a comprovação com jogadores.

## Limites de acesso desta pesquisa

O PDF de Anthony Pecorella `Idle Games: The Mechanics and Monetization of Self-Playing Games` excedeu o limite de leitura da ferramenta. As páginas GDC de `Quest for Progress` e `Designing for Presence Without Intrusion` redirecionaram para manutenção. Os resultados de busca ajudaram a localizar material, mas os conteúdos integrais não foram estudados e não sustentam conclusões deste documento. As fontes legíveis acima bastam para iniciar um método de revisão; ampliar a pesquisa quando uma pergunta concreta exigir.

## Modelos — recomendação consultada nesta data

[OpenAI Model selection](https://developers.openai.com/api/docs/guides/model-selection) descreve Astra para análise exigente e entregas complexas; [GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra) identifica suas capacidades e entrada de imagens. A recomendação para esta direção é GPT-6 Astra com Extra high, quando disponível. GPT-6.1 Sol com Extra high é alternativa de menor custo para trabalho complexo e correções definidas. É uma escolha fundamentada nas descrições oficiais, não um benchmark de direção de arte no GemVenture; conferir disponibilidade no seletor do usuário. A skill permanece independente do modelo.
