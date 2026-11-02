# Contribuir com GemVenture

O projeto está em alpha. Relatos de bugs e sugestões objetivas ajudam a melhorar
o jogo; mudanças grandes devem ser discutidas em uma issue antes da implementação.

## Relatar um problema

Informe sistema/navegador, modo de jogo, passos para reproduzir e resultado
esperado. Um vídeo curto ou captura costuma ajudar. Não publique saves com
informações pessoais, tokens ou credenciais.

## Preparar uma mudança

Para tarefas da equipe, baseline, reserva de interfaces, entrega e aprovação,
consulte [o fluxo operacional](docs/TEAM_WORKFLOW.md).

1. Use Node.js 24 e execute `npm start`.
2. Faça alterações pequenas, preservando compatibilidade dos saves.
3. Execute `npm run check`, `npm test` e a auditoria relevante.
4. Explique o problema, o comportamento resultante e como verificou a mudança.

## Regras do jogo

- Forja, árvore, poço, estrelas e sistemas AFK têm economias e papéis distintos.
- Ritmo, criaturas e sinais usam o mesmo relógio musical.
- Textos curtos, perigos claros, controles legíveis e efeitos com limites.
- Use HEPT32 no runtime e silhuetas definidas. A regra de uma sombra por material
  pertence à arte procedural; referências raster e ícones seguem seus contratos aprovados.
- Teste em uma origem/porta separada; preserve a partida do jogador.
- Não adicione assets de terceiros sem documentação de origem e permissão.
- Não introduza dependências ou reescreva a engine para alterações pontuais.

Consulte [DESIGN_RULES.md](DESIGN_RULES.md) e
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). O projeto mantém direitos reservados;
contribuir não autoriza redistribuir ou comercializar seus materiais.
