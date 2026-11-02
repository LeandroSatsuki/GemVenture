# Fichas de auditoria, preservação e validação

Preencha somente o recorte necessário. Não abra uma auditoria de todo o jogo para corrigir um componente conhecido. Para padronização global, o mapa completo é necessário antes de declarar cobertura total.

## 1. Procedência e cobertura

Registre origem (oficial/candidata/referência), commit e hashes relevantes, data, rota de entrada, cenário/save de teste, viewport, zoom, escala da UI, DPR e CRT quando observáveis. Proteja o save do usuário; testes que mudem estado usam perfil/fixture isolados e autorizados. Não confundir ausência de captura com ausência de problema.

| Tela / consumidor / estado | Função entendida | Evidência documental/código | Visual observado | Interação exercitada | Lacuna / próximo passo |
| --- | --- | --- | --- | --- | --- |

Inclua estados alcançáveis por navegação normal e funções posteriores à referência. Indique inacessíveis/não verificados. Quantidade de arquivos, testes ou imagens não demonstra cobertura de jornadas.

## 2. Ficha funcional antes da proposta

| Campo | Pergunta |
| --- | --- |
| Intenção | O que o jogador quer fazer e por que veio a esta tela? |
| Ação central | Qual decisão avança essa intenção? Há decisões independentes equivalentes? |
| Dados essenciais | O que precisa estar visível antes de agir: custo, saldo pertinente, benefício, requisito, risco, destino, duração? |
| Comparação | Quais alternativas precisam ser lidas juntas e com unidades consistentes? |
| Persistência | O que dura um clique, um turno, a descida ou o save? |
| Tempo | Ação livre, deadline, pausa, processamento real ou atualização passiva? |
| Retorno | Fechar cancela, preserva, confirma ou só oculta? Onde o foco volta? |
| Estados | Bloqueado, sem saldo, pronto, comprado, equipado, máximo, sucesso e falha existem? |
| Fonte | Qual módulo/callback/DTO fornece cada informação e executa a ação? |
| Identidade | Que família e referências atuais regem este consumidor? |

## 3. Matriz de preservação — critério obrigatório

Antes de redesenhar, descubra controles e comportamentos atuais por DOM/handlers/imports e, quando disponível, uso real. Não limite o inventário ao que a referência mostra. Para cada item, registre:

| Função / dado atual | Origem / controle / ação | Condições e estados | Destino na proposta | Como acessar | Verificação após mudança |
| --- | --- | --- | --- | --- | --- |

Marque cada linha como preservada, movida com acesso equivalente, pendente de acomodação ou alteração mecânica explicitamente solicitada. “Não aparece na referência” nunca é justificativa de remoção. Se a proposta deixar uma função sem destino, ainda não está pronta.

Use uma matriz adicional de diferenças referência→jogo: elemento ilustrado; equivalente real; função nova sem equivalente; adaptação visual necessária. Assim a referência mantém material, hierarquia e acabamento sem reduzir o jogo a uma imagem antiga.

Dados essenciais não podem ser rebaixados a tooltip inacessível ou detalhe oculto para manter aparência. Uma função pouco frequente pode mudar de posição com sinalização e acesso previsíveis; isso deve ser decisão explícita e verificável. Remover funcionalidade exige pedido específico, não autorização genérica de polimento.

## 4. Classificar evidência e impacto

Para cada achado: tela/estado/origem; comportamento esperado e fonte; observado; impacto na decisão; passos reproduzíveis; proposta mínima; confiança e o que falta verificar. Use rótulos separados:

- **Observado visualmente:** captura/renderização identifica aparência, clipping ou hierarquia.
- **Verificado no comportamento:** ação executada e resultado observado, com condições.
- **Relato humano/documental:** decisão ou experiência registrada; não significa reprodução nesta rodada.
- **Indício de código:** regra, seletor ou handler sugere risco; não comprova aparência real.
- **Hipótese/proposta:** melhoria a testar, sem diagnóstico disfarçado.
- **Não verificado:** limite explícito, sem completar com suposição.

Priorize perda de função/dado, decisão enganosa, saída/foco bloqueados e risco não comunicado; depois conflitos recorrentes de hierarquia/navegação; por fim acabamento. Frequência, consequência e alcance explicam prioridade melhor que uma nota estética inventada. Registre padrões que já funcionam para protegê-los.

## 5. Definir o que deve aparecer

**Persistente:** contexto, seleção, recursos e riscos necessários à decisão atual. **Contextual:** resultado/evento confirmado no lugar em que ajuda a entendê-lo. **Detalhe:** explicação extensa, histórico e referência secundária com acesso claro. Essa classificação depende da mecânica; não é ordem para esconder todo texto longo.

Para simplificar ou expandir, documente problema, mudança, efeito na decisão, função preservada, custo de atenção e dependência. Exemplos de hipóteses úteis: alinhar custos de materiais entre projetos; manter detalhe do nó enquanto navega a árvore; mostrar o que já foi guardado ao retornar. Não adicionar novas lojas, pontos, bônus ou filtros sem necessidade identificada e escopo.

## 6. Verificação proporcional

| Dimensão | Casos relevantes |
| --- | --- |
| Integridade | Todas as linhas da matriz de preservação possuem destino e acesso; mesmas ações e dados reais; save e transação preservados |
| Consistência | Botões equivalentes, fonte e estados; cores por papel; exceções temáticas legíveis; ícones da mesma entidade |
| Conteúdo | Nome longo, número grande, ausência de recorde, sem saldo, bloqueado, máximo, oferta distinta, recurso zerado |
| Espaço | Viewport alvo da referência e menor alvo desktop; rolagem localizada; cabeçalho/fechar acessíveis; nada cortado |
| Navegação | Entrada, troca de abas, retorno, Esc/fechar quando previstos, ordem de foco e foco restaurado |
| Resposta | Hover/foco/pressionado, repetição, falha, pausa, fechar durante efeito e reabrir |
| Conforto | Som mudo, modo suave, CRT vigente, fundos claros/escuros e contraste dos estados finais |

1536×1024, 1920×1080 e 1366×768 são recortes úteis conforme origem/alvo, não obrigação de simular três resoluções para qualquer alteração. Meça contraste nos pares reais com método declarado. Não alegar conformidade global de acessibilidade a partir de um teste de cor. Quando houver implementação autorizada, rode os checks do domínio e do fluxo da equipe; teste técnico não certifica foco nativo, movimento ou legibilidade.

Para fidelidade visual, compare referência e candidata na mesma escala e área útil, incluindo versão standalone. Destaque adaptações por funcionalidade nova; não escondê-las com crop ou escala diferente.

## 7. Entrega e critério de conclusão

Entregue evidência e lacunas junto das conclusões, com IDs relacionados, baseline, reserva e próxima ação. Para uma direção de sistema, o resultado útil contém mapa funcional, tabela semântica versionada, família de componentes/estados, regras de navegação, contratos de efeitos e piloto proposto. Para um recorte pequeno, entregue somente as partes afetadas e sua ligação ao sistema.

**Direção pronta para revisão:** funções mapeadas; propostas distintas de regras vigentes; tokens com origem/pendências; conflitos explícitos; nenhuma função órfã na proposta. **Candidata implementada pronta para revisão:** acrescenta prova técnica e perceptiva do recorte, conforme ferramentas disponíveis; lacunas continuam abertas. **Aplicada:** exige autorização vigente, baseline compatível e recibo. **Aceita:** exige aceite humano correspondente. Não mover entre esses estados por número de testes ou silêncio do usuário.
