# Sistema visual: cor, componentes, espaço e navegação

As regras de processo abaixo são parte da skill. Valores finais de cor, fonte, tamanho e movimento devem derivar do recorte aprovado ou ser apresentados como proposta. “Travar a paleta” significa controlar escolhas e seu significado, não aplicar um filtro azul ao jogo inteiro.

## 1. Separar valores e papéis

Mantenha três camadas, usando a implementação já existente quando suficiente:

| Camada | Exemplo conceitual | Regra |
| --- | --- | --- |
| Primitivo | Rampa marinho/azul, rampa ouro, tinta clara | Valor exato e procedência; gradiente registra início/fim, contorno e sombra |
| Semântico | `surface.panel`, `text.primary`, `action.primary`, `state.focus` | Explica a função, consumidores e exceções |
| Componente | Fundo/contorno/texto do botão principal normal, hover e pressionado | Usa papéis comuns; nenhuma cor avulsa por conveniência de uma tela |

Os nomes são ilustrativos, não uma obrigação de renomear CSS. Não codifique valores da pesquisa em runtime sem escopo. Se um botão novo “precisar de outro azul”, conferir primeiro papel, hierarquia, contraste e cascata.

### Registro obrigatório ao fechar uma direção

Para cada token: nome; função; valor ou referência ainda pendente de amostragem; par texto/fundo; estados; consumidores; origem de aprovação; usos proibidos; exceção temática. Inclua gradientes, opacidade e fundos sobrepostos. Cores colhidas de uma imagem com iluminação são amostras, não prova do valor original de CSS.

Congele uma versão revisável da tabela, compartilhada pelas telas. Alteração posterior registra motivo e consumidores afetados. Uma migração de valor não altera seu papel silenciosamente. Não criar um script de recoloração global como substituto desse mapeamento.

## 2. Gramática de cor e seus conflitos

| Papel | Direção derivada das referências do GemVenture | Distinção necessária |
| --- | --- | --- |
| Fundo e painéis | Família marinho/azul profundo, recuos mais escuros, bordas legíveis | Fundo decorativo não disputa leitura com texto |
| Texto principal/secundário | Claro e azul claro em contraste com superfície escura, conforme referência | Secundário continua legível; não é estado desabilitado |
| Ação principal | Família amarela/dourada das ações aprovadas; APRENDER recebeu correção explícita | Verbo e forma de botão distinguem ação de moeda/estrela |
| Ação secundária | Superfície da família azul, com peso menor | Não parecer bloqueada; prioridade menor não significa ilegível |
| Navegação selecionada | Realce conforme componente aprovado | Na ref.06 a aba ativa é dourada; na ref.05 o Abismo é roxo. Preservar exceção temática documentada |
| Foco de entrada | Indicador perceptível adicional, independente de seleção persistente | Deve continuar visível sobre amarelo, azul, roxo e estados bloqueados |
| Recurso/material | Cristais separados e moeda com arte/identidade canônica | Cor do rubi não transforma saldo em erro; sempre ícone e quantidade |
| Especialização/tema | Cor real do ramo, tema do Abismo, categoria de carta | Enquadrar a categoria sem pintar todo o sistema de controles |
| Ganho confirmado | Quantidade/sinal e origem do ganho; cor de feedback definida | Disponibilidade de compra não é sucesso de compra |
| Risco/erro | Aviso localizado com ícone/rótulo e consequência | Vermelho do X de fechar não significa que fechar sempre destrói algo |
| Bloqueado/insuficiente | Tratamento atenuado com motivo legível | Separar requisito não cumprido, falta de saldo, em processamento e máximo |

Essas famílias são extração qualitativa das imagens e decisões, não uma nova paleta numérica aprovada. O mesmo matiz pode aparecer em papéis diferentes já aprovados: dourado em aba e CTA; vermelho em recurso e fechar. A solução é manter canais estáveis — contorno, forma, posição, texto e ícone — e impedir colisão no mesmo contexto. Não “corrigir” essas exceções apagando os temas.

**Exemplo de colisão:** nó de Defesa amarelo, moeda dourada e APRENDER amarelo podem coexistir. Nó se identifica pela conexão e glifo, saldo pelo ícone/quantidade, ação pelo verbo e caixa; seleção/foco ganham sinais próprios. Pintar todos de verde ou dar pulso a todos cria uma hierarquia nova sem justificativa.

## 3. Gramática volumétrica e iconografia

Observe contorno exterior escuro, realce superior, sombra inferior contida, planos largos, cantos e recuos nas referências aprovadas. Defina família de painel, slot, botão, aba e cartão. Variações mudam tamanho/peso pela função mantendo material e iluminação coerentes. Texto permanece frontal e limpo; não inclinar parágrafos para imitar a câmera do mundo.

UI 2D pode conversar com mundo 2.5D por materiais, volume e vocabulário de cristais, sem impor isometria aos controles. Não confundir family look de ícone volumétrico com SVG flat genérico, emoji de sistema, fotografia ou detalhe excessivo. Reuse o ícone canônico para a mesma entidade no mundo, carteira, custo e recompensa, ou registre uma variante óptica deliberada para o tamanho pequeno.

Registre por ícone: entidade/ação, fonte e aceite, silhueta, ângulo, contorno, iluminação, bounds visíveis, escala óptica e tamanhos de uso. Examine em tamanho real; padding transparente pode fazer PNGs de dimensões iguais parecerem diferentes. Não substitua ícone para resolver só tamanho de caixa. Glifos simples de fechar/seta podem ter contrato code-native próprio; não encomendar arte raster sem necessidade.

## 4. Tipografia e densidade

Defina papéis de título, seção, rótulo, corpo, dado/custo e auxiliar. Extraia família, peso, altura de linha, caixa e espaçamento das referências atuais; não invente uma fonte para cada tema. Registre substituição de fonte quando a original não puder ser identificada. Hover não troca família, tamanho ou largura da linha; qualquer mudança de cor/peso precisa ser deliberada e sem salto de layout.

Números recorrentes devem manter alinhamento e formato previsíveis; conferir separadores, unidades, porcentagens, duração, sinal e abreviações. Valor exato permanece acessível quando uma abreviação pode afetar a decisão. Não fazer números globais pularem de largura a cada ganho.

Quando houver aperto: agrupar por decisão; eliminar repetição textual; reservar espaço a custo/benefício/requisito; recolher explicação secundária; rever colunas; permitir rolagem localizada; aumentar área do painel se compatível com o contexto. Só depois recalibrar tipografia dentro da legibilidade. Não usar corte de preço, esconder risco ou encolher a tela inteira como solução.

Meça espaçamentos da família aprovada e proponha uma escala pequena e reutilizável, com papéis de margem externa, distância entre grupos e espaço interno. Registre os valores como extraídos ou propostos. Não decretar 8px, 48px ou fonte18 como constantes universais herdadas de uma skin.

## 5. Superfície pela tarefa, convenções pelo sistema

| Forma | Quando ajuda | Contrato a preservar |
| --- | --- | --- |
| HUD | Informação contínua necessária à ação no mundo | Não cobrir perigos/alvos nem capturar cliques do mapa por decoração |
| Modal contextual | Uma decisão delimitada, preservando onde o jogador estava | Entrar/sair claramente, foco contido, retorno ao acionador e regra de pausa explícita |
| Painel amplo / tela de sistema | Comparação extensa ou navegação espacial que precisa de área | Cabeçalho/voltar persistentes; contexto e posição conservados ao retornar |
| Detalhe/tooltip | Explicação complementar ou inspeção de item | Acessível por foco/toque conforme entrada; nunca único lugar de custo/risco essencial |
| Aviso não modal | Resultado que não exige decisão imediata | Não sequestrar foco nem exigir fechar repetidamente |
| Confirmação | Consequência material que precisa de revisão | Dizer o que será perdido/guardado; não confirmar toda compra rotineira |

Padronize abrir/fechar/voltar, posição e família de controles, foco e ordem de ações. Dimensão pode mudar com a tarefa e o conteúdo. Variação exige motivo conhecido; “esta tela foi feita por outro agente” não é motivo.

Preserve exigências humanas específicas: o Elevador é popup sobre cenário, não tela cheia opaca. Se funções novas aumentarem conteúdo, acomodar em seções/rolagem/painel ampliado preservando contexto; não descartá-las. Uma navegação lateral global ou nova janela universal deve ser proposta e justificada, nunca presumida.

## 6. Estados como contrato do componente

Registre normal, hover, foco, pressionado, selecionado, indisponível, em processamento, sucesso/erro e máximo quando aplicáveis. Marque N/A com motivo quando um estado não existir. Defina combinação e precedência: por exemplo, selecionado+focado e comprado+equipado. Hover não esconde bloqueio; foco não parece compra; máximo não aparenta falha.

Use rótulos de ação do domínio: contribuir, concluir, aprender, melhorar, equipar, selecionar, resgatar e entrar não são sinônimos. A forma comum de botão não autoriza tornar suas transações iguais.

## 7. Trava revisável, sem deriva

Antes de fechar um piloto, confronte consumidores equivalentes na mesma escala. Faça uma prancha de componentes com tokens, estados e exceções, acompanhada da matriz de funções preservadas. Nova tela reutiliza papéis existentes; nova exceção apresenta justificativa e comparação. Se duas telas aprovadas conflitarem, explicite o conflito localizado e proponha a menor reconciliação, sem substituir ambas por um terceiro estilo.
