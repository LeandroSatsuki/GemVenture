# Configurações aprovadas e regra humana da pausa — 01/11/2026

O usuário aprovou Configurações v1 e autorizou sua aplicação. Também pediu diretamente a compactação da pausa; o resultado aplicado dessa correção ainda aguarda sua avaliação perceptiva. Autorização, baseline, fontes e prova: `E:/Genventure/coordination/SETTINGS-PAUSE-UI-INTEGRATION-20261101/`. Como jogar recebeu depois seu próprio aceite e recibo, descritos em [Ajuda aprovada](approved-help-20261101.md).

## Configurações

- A leitura inicial vem dos serviços reais de áudio e efeitos. Os volumes ilustrativos da proposta não são os padrões do jogo.
- Música e SFX permanecem independentes; desligar o som preserva ambos. Os controles persistem imediatamente, sem botão Salvar fictício. Falha de persistência e desbloqueio pendente de áudio continuam comunicados com mensagens curtas.
- Completo e Suave são estados exclusivos. Selecionar Completo permite uma única resposta curta no exemplo visual; Suave, movimento reduzido, fechamento e descarte interrompem o movimento. Não fazer a estrela piscar continuamente.
- Voltar/fechar mantêm a família azul/vermelha e o ciclo existente de pausa, foco e retorno ao jogo. Não usar dourado num retorno para simular uma confirmação de preferência.
- Consumidores: `dist/index.html:#gameSettings`, `menu-controller.js`, `approved-settings-ui.css`. IDs e serviços foram preservados. Neste consumidor, a cascata antiga tinha posicionamento absoluto e estilo de rodapé: o CSS próprio redefine posição/inset/transform e mantém a leitura do botão Voltar. Conferir a composição nativa, além da especificidade.

## Cartas na pausa

Pedido humano: **ícone + nome + nível + efeito aplicado acumulado**, sem um parágrafo de descrição por carta. O nível aparece como número em um marcador próprio; no desktop, o efeito fica na mesma linha. A versão estreita pode usar uma segunda linha curta dentro da mesma entrada.

- Ler cartas ativas de `activeCards`, nível de `cardCount` e totais de `cardDetail(card, level, power(profile), 0, profile)`. A UI compacta não calcula uma progressão paralela nem multiplica o total pelo número de cópias novamente.
- Preservar os limites reais, a chance de ativação, a escala pelo poder, a cura não linear e condições como vida abaixo de 40%. “Menos texto” remove repetição, sem apagar o que muda a interpretação do efeito.
- Em Só mais uma, o nível indica as cópias; o efeito informa as vidas restantes, descontadas as já usadas, e a vida ao reviver. Esses números podem ser diferentes.
- Usar os símbolos compactos já fornecidos por `approvedCardArt`; não redesenhar cartas nem trocar todos os símbolos por uma estrela genérica.
- Não repetir `card.text` embaixo do nome. A consulta de pausa mostra o efeito atual; a seleção de cartas conserva seu próprio papel e suas funções.
- O contêiner permite rolagem de todas as cartas. Não remover entradas para fazer a lista caber. Conferir também builds com muitas cartas e a leitura em 320 px.

Consumidores: `dist/approved-pause-summary.js`, `expedition-hud-view.js:renderPause`, `approved-expedition-hud.css`. As contas e regras de `cards.js` e `core.js` permanecem no domínio.

## Aba Expedição

Preservar os três dados existentes — moedas na base, estrelas e recorde com sua unidade — usando ícones atuais e valores diretos. Os nomes completos continuam acessíveis. Essa compactação não autoriza retirar missão, consumíveis, combo colorido, buffs ou informações críticas do HUD.

O recibo registra a reconciliação com as camadas das estrelas produzida em outro chat. Alterar a pausa não autoriza restaurar um arquivo inteiro de HUD ou apagar esse ajuste.
