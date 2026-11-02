---
name: gemventure-vfx-direction
description: Pesquisar, auditar e dirigir efeitos e game feel do GemVenture, com linguagem visual comum, recompensa por desempenho, ritmo, nitidez e controle de poluição. Usar para impactos, combos, bônus, buffs, partículas e resposta de botões; não define economia nem implementa layouts completos.
---

# GemVenture — direção de efeitos e game feel

Fonte mantida: `E:/Genventure/gemventure/skills/gemventure-vfx-direction/`.
Uma cópia instalada é um ponto de entrada: conferir a fonte mantida antes de trabalhar.

## Intenção humana

No GemVenture, incremental musical, o efeito integra a recompensa do jogador.
Desempenho melhor deve ser percebido em uma resposta mais rica e satisfatória,
preservando leitura, controle e espaço de crescimento. O usuário quer uma família
de efeitos reconhecível e permite estudar mudanças de linguagem; uma proposta
nova continua candidata até avaliação. Preservar a animação e a UI já definidas.

**Nitidez é requisito humano explícito de 31/10/2026:** o efeito deve conversar
com a resolução e o acabamento do ambiente. Pode ter energia e contraste próprios;
não pode parecer um sprite pequeno desfocado sobre arte mais definida. Avaliar
a imagem final, não somente o PNG de origem. Não confundir nitidez com brilho,
quantidade de detalhe, ausência de antialiasing ou tamanho de arquivo.

## Escolher a profundidade do trabalho

- Pesquisa, auditoria ou padronização: começar por [fontes e limites](references/research.md)
  e [mapa do projeto](references/project-audit.md); ler apenas os consumidores envolvidos.
- Linguagem, intensidade e progressão: usar [gramática e recompensa](references/visual-reward-system.md).
- Primeiro exemplo ou experimento: usar [pilotos comparáveis](references/pilots.md).
- Fogo/impactos de boss: consultar a [pesquisa aplicada ao Místico](../gemventure-vfx-implementation/references/stylized-fire-and-impacts.md), com diagnóstico, alternativas de autoria e limites da evidência.
- Código, atlas, resolução ou desempenho: usar a skill irmã
  `../gemventure-vfx-implementation/SKILL.md` e seu contrato de nitidez.
  Não é necessário carregar a parte técnica inteira para discutir direção.

## Autoridade e ponto de partida

Ler `E:/Genventure/AGENTS.md`, `docs/TEAM_WORKFLOW.md` e os campos pertinentes de
`E:/Genventure/coordination/team-control.json`. Registrar baseline atual e reserva
antes de editar. Não atribuir a um pacote congelado autoridade sobre correções humanas
posteriores. Manter o monitor pausado. A pesquisa atual não despacha outros chats.

No registro consultado em 31/10/2026, GV-040 cobre rastros progressivos e GV-043
cobre efeitos do personagem. A orientação humana de GV-043 em 22/10 rejeitou
explosão com aparência de massinha e pediu cartoon, pequenas estrelas agrupadas,
volume aparente e ausência de texto BOOM. Isso se aplica à Bomba candidata;
não aprova um estilo global nem revoga efeitos aprovados de cura, escudo ou Titã.
Conferir o registro novamente em cada tarefa, inclusive aceites por subconsumidor.

Para geometria procedural, ler a skill do checkout em
`../gemventure-procedural-art/SKILL.md` no modo runtime; não importar Cosmos/Diorama.
Para feedback de UI, respeitar `../gemventure-ui-direction/` e o padrão atual do
componente; `gemventure-ui-layout` cuida de composição. Efeitos não autorizam
redesenhar botões, tipografia, ícones ou controles inteiros.

## Trabalhar a partir da ação real

Traçar **entrada → reconhecimento → evento confirmado → consequência visual → repouso**.
Registrar origem, gatilho, frequência, posição, alvo, camada, significado e duração.
Distinguir acionamento de buff, estado ativo, bloqueio consumido e término; assim
como seleção, compra e equipamento. Nunca celebrar um resultado ainda não confirmado.

Antes de padronizar, inventariar o efeito efetivamente montado: evento, consumidor,
renderizador, atlas ou geometria, paleta, escala final, filtro, relógio, modo suave,
procedência e aceite. Nomes de arquivos e presença de um PNG não demonstram uso.
Classificar achados como observados no código, observados em pixels/movimento,
relatos do criador, hipóteses ou propostas. Não transformar "parecem vinte fontes"
em contagem técnica inventada.

## Criar uma família, preservar significados

Definir formas principais/secundárias, bordas, volume, luz, cor por papel, trajetória,
ataque/sustentação/dissipação, relação com chão e ambiente e perfil de nitidez.
Documentar diferenças necessárias entre funções: uma explosão, cura e coleta
podem pertencer à mesma família sem compartilhar a mesma silhueta ou movimento.

Para fogo e magia, coerência com voxel 2.5D não exige materializar todos os efeitos
em cubos. Avaliar silhueta animada, fluxo, curvas de ataque/sustentação/dissipação,
apoio no chão e contraste antes de aumentar brilho ou quantidade. Aviso e área
ativa devem continuar distintos; brilho decorativo não alarga a área de dano.

Fazer a progressão aumentar **organização, precisão, camadas e assinatura**, com
saturação de intensidade; não aumentar indefinidamente partículas, brancos ou área.
Garantir resposta prazerosa no estágio inicial. Reservar clímax para conquistas
confirmadas e fazer a cena recuperar repouso. Verificar combinações simultâneas.

Usar o relógio musical existente para acentos sincronizados; reconhecimento do
comando continua imediato. Não adicionar espera até a próxima batida ao impacto
resolvido nem congelar simulação, música ou janela de acerto para produzir peso.
Qualquer nova regra de combo, pontuação, benefício ou desbloqueio é proposta de
gameplay separada, com seu próprio escopo; o VFX apenas lê o estado real.

## Entregar uma decisão utilizável

Entregar diagnóstico com fonte, direção candidata, diferenças frente ao ativo,
menor piloto útil e critérios perceptivos. Todo número novo é parâmetro de
experimento, identificado como tal; não atribuir tempos ou tetos a jogos pesquisados
sem medição. Comparar antes/depois sob os mesmos eventos, cenário, escala e relógio.

A prova precisa responder: o jogador identifica ação e resultado, percebe evolução,
vê personagem/perigo/HUD e reconhece nitidez da mesma família? Testar também suave,
repetição e combinação. Código e conta de densidade não certificam sensação,
CRT físico ou satisfação de jogadores. Registrar o que foi e não foi observado.
Aceite humano da linguagem, autorização de aplicação e aplicação com recibo são
estados distintos; respeitar as autorizações já válidas no escopo.
