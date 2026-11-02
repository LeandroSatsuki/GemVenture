---
name: gemventure-boss-design
description: Projetar e refinar lutas de bosses do GemVenture, com pesquisa de mecânicas, combate rítmico, arena, direção de arte procedural e animações por estado. Usar para evolução dos chefes existentes, validando a mecânica antes da conversão visual; não abrange geração comum de cavernas nem balanceamento geral da economia.
---

# Bosses do GemVenture

Conduzir um boss por vez: escolher a decisão de combate que o distingue, validá-la
com o usuário e só depois definir arte e animação. O objetivo é produzir lutas
memoráveis com comandos existentes e escopo técnico viável. Trocar círculos por
cruzes, aumentar HP ou multiplicar explosões não diferencia a decisão do jogador.

Fonte mantida: `E:/Genventure/gemventure/skills/gemventure-boss-design/`.
Se esta for uma cópia instalada, conferir a fonte mantida antes de continuar.
Localizar o checkout atual quando esse caminho não existir. Preservar os registros
vigentes do projeto e consultar `docs/TEAM_WORKFLOW.md` para baseline e aplicação.

## Começar pelo consumidor real

Ler [references/runtime-contract.md](references/runtime-contract.md) para localizar
combate, relógio, arena, apresentação e saves. Reabrir as funções relevantes no
checkout: esse mapa documenta uma baseline, não substitui o código atual.

Identificar o boss/andar/bioma, mecânica ativa e versões legadas. Não chamar uma
mecânica de nova sem comparar com as já existentes, inclusive filhotes do Barão
Cenoura e núcleos do Soberano Micelial. Não restaurar galeria histórica como fonte.
Registrar arquivos/hashes e separar fatos do código, observações de playtest,
hipóteses e propostas ainda não aprovadas.

## Fluxo por boss

1. **Definição:** pesquisar princípios em fontes primárias e propor uma mecânica
   central. Explicar o que o jogador percebe, decide, faz, ganha e perde ao errar.
   Usar [references/encounter-workflow.md](references/encounter-workflow.md) para a
   ficha de luta e os critérios de validação. Ver o repertório inicial em
   [references/research.md](references/research.md); buscar outras referências
   quando não responderem ao problema específico. Identificar adaptações próprias.
2. **Validação da mecânica:** apresentar ciclo em batidas, comandos, participação
   da sala, custo e riscos. Não implementar o combate nem produzir arte final
   quando o pedido atual for definir a proposta. Após autorização do protótipo,
   testar com volumes simples, na câmera real e no consumidor real. Não tratar
   teste automatizado como aprovação de diversão. Registrar o aceite do usuário
   antes de iniciar a conversão visual neste fluxo.
3. **Direção de arte:** a mecânica aprovada determina componentes, pontos fracos,
   silhueta, expressões e direções necessárias. Reusar a identidade do boss e do
   bioma, perspectiva da caverna, escala, paleta e brilho de quinas aprovados.
   Conferir a fonte atual de `gemventure-procedural-art`; imagens raster seguem
   o contrato da família correspondente. Não redesenhar a sala já aprovada.
4. **Animação:** mapear estados de combate para antecipação, ação, impacto e
   recuperação, além de idle vivo, reação, mudança de fase e derrota. Animar
   componentes com pivôs próprios; evitar esticar um PNG inteiro ou girá-lo para
   fingir vistas ausentes. Direção, sockets, sombra no chão e oclusão devem
   acompanhar a pose. Se um estado mecânico ainda não existir, registrar como
   requisito, sem inventar eventos públicos já implementados.
5. **Integração e avaliação:** aplicar só o escopo autorizado em candidata
   isolada, comparar com a baseline e verificar a luta completa. Preservar
   controles, saves, recompensas e os outros bosses. Atualizar os documentos
   existentes com resultado, evidências e pendências; publicar só quando pedido.

## Regras de combate rítmico

- Usar o relógio musical existente para decidir início, aviso, impacto e fim da
  janela. Não usar tempo de animação, `setTimeout` ou frame renderizado como juiz
  de acerto. A pausa não deve consumir uma oportunidade ou acertar ao retornar.
- Projetar para uma ação válida por batida e movimento básico sem upgrades.
  Não exigir atacar e esquivar na mesma batida, pressionar uma tecla nova sem
  necessidade demonstrada ou gastar um item consumível para poder vencer.
- Uma pausa na frase do boss não é uma ordem para o jogador perder a batida.
  Definir ações legais durante escuta/espera, sem forçar perda de combo/fôlego.
- Avisos devem comunicar ação e momento, também com som e forma. Cor pode
  complementar; não pode ser a única pista. Não confundir brilho decorativo,
  perigo, vulnerabilidade e alvo selecionado.
- Calcular acessibilidade das posições e ordem de resolução do input/ataque.
  Não supor que um destino clicado equivale a chegar nele instantaneamente.
- Evitar espera longa com invulnerabilidade e fases que punam mais um erro já
  pago pelo ritmo. Distinguir explicitamente dano, quebra de combo e empurrão.
- Segunda fase desenvolve a mesma linguagem, com antecipação legível. Não
  impor aceleração musical, stun, HP ou punições globais como solução padrão.

## Limites de escopo

Manter a nova arena como ponto de partida. Decoração não vira colisão por
aparência: qualquer elemento funcional precisa de posição, alvo, hitbox, vida
útil e comportamento no save. Não propor motor, física 3D, PBR ou pós-processo
que não existam na implementação. Custo baixo é uma estimativa a confirmar,
não prova de que já existe suporte.

Ao entregar, dizer: estado da etapa, proposta/decisão aprovada, arquivos afetados,
provas e limites, e próxima decisão. Não anunciar boss remodelado quando apenas
a ficha estiver pronta. Aprovação de um boss não aprova automaticamente os sete.
