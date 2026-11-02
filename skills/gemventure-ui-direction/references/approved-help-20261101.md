# Como jogar — aprovação e consumidor de 01/11/2026

O usuário aprovou a proposta v1 e pediu sua aplicação oficial, seguida da próxima tela. Fonte: `E:/Genventure/coordination/HELP-UI-INTEGRATION-20261101/HUMAN-APPROVAL.json`. A aprovação autoriza esta Ajuda; o Refúgio continua proposta própria.

- Controles e Progressão usam abas com a mesma altura reservada. A troca não reposiciona o rodapé. Texto curto conserva todos os comandos e as consequências de vida, fôlego, cartas e formas de retorno.
- Não fixar a porcentagem de resgate na Ajuda: ela depende da progressão real. Distinguir todo o saque pelo elevador pronto de saque parcial em resgate/derrota.
- `Jogar` fecha o guia; não inicia outra partida. X e ESC usam `closeDialog`, conservando o retorno ao controle de origem. Não criar serviços paralelos de pausa, save ou navegação.
- Consumidor: `run.js:showHelp` monta `approved-help-ui.js` no hospedeiro existente. O CSS próprio neutraliza somente o shell da Ajuda. A cascata antiga fixava a altura de `#dialogBody`; conferir a altura real em tela estreita, além de largura e especificidade.
- Conferir Tab e Shift+Tab no Shadow DOM, com volta entre X e Jogar, e retorno ao botão Como jogar. O fechamento descarta eventos e animação; o atributo acessível do diálogo é restaurado.
- Fredoka/Nunito, superfícies azuis e medidas de botões vêm da família aprovada. Resposta de aba é um deslocamento breve, sem loop; Suave, movimento reduzido e fechamento interrompem o movimento.

Recibo e prova nativa: `E:/Genventure/coordination/HELP-UI-INTEGRATION-20261101/APPLIED-RECEIPT.json`. Os testes técnicos não substituem a avaliação humana do resultado integrado.
