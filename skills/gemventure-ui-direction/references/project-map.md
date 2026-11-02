# GemVenture: funções e fontes antes da composição

Leitura documental e de trechos de código em 30/10/2026, após a pesquisa externa. Baseline e hashes desta rodada em `E:/Genventure/coordination/UI-SYSTEM-RESEARCH-20261030/BASELINE.json`. Não foi feita auditoria visual/interativa do jogo rodando; as imagens 02, 05, 06 e 09 da bíblia foram inspecionadas como referências, não como capturas do runtime.

## Resolver fonte, versão e divergência

- `docs/TEAM_WORKFLOW.md` orienta escopo, reservas, baseline e entrega. `coordination/team-control.json` preserva IDs e aponta recibos. Leia os consumidores e decisões mais recentes referenciados, sem tratar um resumo antigo como retrato de todas as telas.
- `DESIGN_RULES.md` explica a função de sistemas, mas contém trechos históricos. Exemplo conhecido: Broca AFK aparece no texto, enquanto GV-057 registra retirada. Não ressuscitar o sistema; primeiro conferir composição vigente e autorização.
- `coordination/UI-BIBLE-20261022/REFERENCES.json` identifica imagens, dimensões e hashes; `DECISION.json` aprova direção, não toda implementação. `ELEVADOR-DETAILED-HUMAN-CORRECTIONS.json` adapta aparência aos dados e requisitos reais.
- Recibos de Árvore, Forja e Cartas, registrados em arquivos próprios de responsabilidades, mostram evolução posterior ao estado resumido de GV-033/035. Confirme hashes dos arquivos efetivamente observados se precisar declarar aplicação local.
- `dist/index.html` e módulos montados identificam a UI atual. Funções novas precisam entrar no inventário mesmo quando não estão na ilustração antiga. Documento desatualizado ou ausência em DTO antigo não autorizam sua remoção.

## Mapa inicial por decisão

Este mapa guia investigação; não substitui inventário completo do consumidor vigente.

| Sistema | Decisão e papel no loop | Informação que a UI precisa preservar | Onde começar a conferir |
| --- | --- | --- | --- |
| Vila / hub | Preparar próxima descida e acessar serviços | Recurso guardado, destino, serviço acessível, orientação e retorno | `refuge-navigation.js`, `refuge-hud.js`, `village.js`; GV-057 |
| Forja | Investir em progressão de equipamento/atributos | Projeto, nível, benefício, moedas e materiais separados, contribuição acumulada, requisito, pronto/concluído | `forge.js`, `forge-presentation.js`, `forge-layout.js`; `FORGE-COINS-UI-RESPONSIBILITIES-20261024.json` |
| Árvore dos Ecos | Construir especialização com pontos e equipar habilidades | Nó, pré-requisito, custo, efeito, nível, conexões, build, zoom/origem/expandir/devolver; seleção diferente de comprado/equipado | `talents.js`, `talent-view.js`, `tree-host.js`; `TREE-UI-RESPONSIBILITIES-20261023.json` |
| Poço | Aceitar uma vantagem com risco para a próxima descida | Oferta e custo antes; efeitos concretos do resultado depois, sem rerrolar | `pillars.js`, `rebrand-well.js` e consumidor atual; regras e recibo vigente do Poço |
| Relicário | Progressão permanente e desbloqueios | Preço, requisito, efeito persistente e estados atuais | `relicario.css`, `reliquary-layout.js`, domínio montado; GV-057 A1 e recibos do Relicário |
| Missões | Escolher e acompanhar objetivos | Condição, progresso real, recompensa, aceitar/concluir/resgatar conforme domínio | `missions.js`, consumidor atual; `MISSIONS-UI-RESPONSIBILITIES-20261023.json` |
| Elevador | Selecionar destino e avaliar a entrada | Bioma/andar, progresso, objetivos, inimigos, drops possíveis, recordes e ação de descer | `lift-*`, `campaign.js`, `descent-progress.js`; bíblia e recibo vigente |
| HUD da descida | Ler risco e agir no ritmo | Vida e fôlego distintos, pista musical, perigos, saque da mochila, poderes e duração | `hud-model.js`, `hud-markup.js`, `score.js`, `run.js`, `core.js` |
| Carta ao concluir andar | Comparar a próxima mudança na build | Ofertas reais, efeitos/unidades, vida atual, ganhos do andar, seleção e transição | `cards.js`, `choice-guard.js`, `index.html`, `card-floating.css`; recibo Cartas V4 |
| Carta do Abismo | Fazer escolha rápida sob regra própria | Tempo restante, opções, atalhos 1–3 e regra automática; proteção de entrada | `abyss-cards.js`, `choice-guard.js`, `abyssCardDialog`; contrato atual |
| Continuar / voltar | Escolher continuidade e destino do saque | O que foi ganho, o que foi guardado, consequência de retornar e confirmação vigente | `post-choice.js`, `post-choice-consumer.js`; `CONTINUE-RETURN-UI-RESPONSIBILITIES-20261024.json` |
| Cuidadora / companheiros | Adquirir, consultar e selecionar companheiro | Estado de aquisição, requisito, custo, efeito e seleção atual | `pets-service.js`, `pets-transaction.js`, `pets-selection.js`; recibo Cuidadora |
| Vitrola | Escolher e pré-ouvir música | Disco ativo, disponível/bloqueado, prévia e volume/mute | `gramophone-playback.js`, consumidor; recibo Vitrola |
| Zag | Planejar rota e consumir recursos do tabuleiro | Dados disponíveis, destino previsto, risco, mochila/guardado, confirmação e automação explícita | `zag.js`, `zag-view.js`; contrato vigente |
| Configurações / pausa | Alterar apresentação e retomar | Configuração atual, mute, modo suave, foco e retorno seguro | `menu-controller.js`, `menu-profile.js`, pausa atual |

Os caminhos na tabela são relativos a `E:/Genventure/gemventure/dist/`, exceto os recibos em `E:/Genventure/coordination/`. Alguns são pontos de entrada documentais a verificar, não arquivos inspecionados integralmente nesta rodada. Descubra módulos alcançados pelos imports; não assuma que um arquivo legado ainda é montado.

## Exemplos que impedem padronização cega

**Forja:** o trecho atual de `forge.js` separa projeto, contribuição de moedas/materiais e conclusão; não comprimir tudo numa compra instantânea fictícia. Armadura e migrações antigas podem existir no domínio sem serem nova oferta da UI. O recibo V6 lista cinco projetos: Picareta, Vida, Bigorna Rúnica, Alambique Vital e Cofre. Conferir o consumidor antes de exibir ou eliminar qualquer um.

**Árvore:** `talent-view.js` possui ações diferentes para aprender, melhorar, equipar/desequipar e devolver, com restrições de dependência; também zoom, origem, expansão e arrasto. Uma imagem antiga não mostra necessariamente todas. O registro humano exige APRENDER amarelo e seleção na cor real da especialização, distinguindo-a de comprado/máximo/alcançável/equipado. Não alterar IDs, custos ou topologia.

**Cartas:** flutuação aprovada tem hitbox fixa, pausa nos estados de interação e desliga com movimento reduzido. A imagem 09 sugere um botão de confirmação, mas o Abismo tem fluxo próprio com atalhos e tempo. Não acrescentar uma confirmação universal nem copiar quatro segundos para toda escolha.

**Elevador:** referência 06 ilustra três estrelas; a correção humana pede até cinco reais. A coluna de recompensas indica possibilidade de drop, não saldo ou garantia. Classificação online aparece como “Em breve”, indisponível, sem backend inventado. O modal deve manter pequena faixa do cenário visível conforme o recorte humano; isso não decreta modal para todo o jogo.

**Paleta:** `palette.js` mantém HEPT32 para o mundo; `rebrand-tokens.css` contém proposta R2 histórica. A reconstrução atual distingue CSS/raster da regra procedural. Nenhum desses arquivos sozinho prova o conjunto atual de cores aprovadas da UI.
