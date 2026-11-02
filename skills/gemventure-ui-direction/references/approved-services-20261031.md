# Forja e Árvore dos Ecos — padrão aprovado em 31/10/2026

O usuário aprovou Forja v6 e Árvore v9 e autorizou sua aplicação no jogo. Isso não aprova automaticamente Elevador, Abismo ou outras telas. O próximo trabalho nelas começa pela leitura das mecânicas e do consumidor atual, preservando todas as funções; não transportar o layout da Forja.

## Fontes vigentes

- Forja aprovada: `E:/Genventure/coordination/UI-SYSTEM-PROPOSAL-20261030/v6/`; árvore aprovada: `.../v9/`.
- Consumidores ativos: `E:/Genventure/gemventure/dist/approved-forge-ui.js`, `approved-tree-ui.js`, `approved-services.css` e `approved-services-shell.css`. Integração em `run.js`.
- Autorização, baseline, backups, verificações e recibo desta aplicação: `E:/Genventure/coordination/UI-APPROVED-INTEGRATION-20261031/`.
- Fundo original da árvore: `dist/assets/approved-services-v1/ecos-cave.png`, proveniência em `coordination/UI-SYSTEM-PROPOSAL-20261030/v9/ART-METADATA.json`.

## Decisões que devem orientar o próximo trabalho

1. Paleta fixa por papel, com os 28 tokens `--gv-*` do consumidor aprovado. Azul escuro estrutura; ação principal usa amarelo/laranja e texto escuro; vermelho pertence ao fechamento. Especializações e materiais preservam suas cores próprias. Não inventar uma cor para cada ação ou copiar a paleta do cenário para os controles.
2. Fredoka nos títulos/botões e Nunito no corpo/números, usando arquivos e pesos existentes. Hover não troca fonte, peso, cor semântica ou tamanho do alvo. Números que orientam a compra têm destaque; saldos/rótulos redundantes não ganham blocos de texto.
3. Ações primárias com 52 px mínimos, secundárias com 48 px na família aprovada. Controles compactos de navegação têm outra função e podem usar o tamanho compacto já definido. Fechar mantém material vermelho inclusive sem hover; foco e desabilitado são estados distintos.
4. Barras e quantidades representam recursos/níveis reais. Formato de contribuição `atual/necessário` na mesma linha em todas as receitas, sem inverter números nem acrescentar “recursos”, “saldo” ou “investido” repetidamente. Preço fica junto da barra/nível, uma vez; o botão comunica a ação.
5. Seleção, depósito, máximo, equipamento e confirmação não devem deslocar os controles. Reservar espaço e usar um painel existente para consultas. Efeitos têm causa real: preenchimento da barra, deslocamento de recursos efetivamente pagos e impulso breve no ícone; não há ganho cosmético fictício. Respeitar modo suave, preferência de movimento reduzido, som/mute e transações síncronas.
6. Forja: cinco projetos atuais; moedas de Picareta/Vida podem ser guardadas parcialmente, com validação e persistência em `forge.funds`; seus cristais são consumidos ao forjar. Outros projetos mantêm a regra real de depósito/conclusão. Não unificar transações distintas por semelhança visual. A melhoria da construção é independente, com botão sempre acessível e painel sobreposto que não empurra a receita.
7. Árvore: teia dominante e inspetor lateral no PC; em largura estreita, gaveta lateral temporária em vez de empilhar uma ficha longa abaixo. Abas **Nó** e **Buffs**. Sem aba Ligações: ligações reais ganham destaque no próprio mapa. 52 nós compactos representam os membros reais; preservar IDs, 127 conexões, custos e requisitos. Buffs usa os valores positivos de `progressionEffects`, sem inventar bônus numéricos para gatilhos automáticos. Cinco espaços visíveis; passivas fora deles.
8. Fundo da árvore é uma imagem discreta de caverna, com centro limpo. Não voltar a desenhar placas/envelopes atrás de cada ramo. Usar os glifos canônicos atuais e estado por forma/anel/marcador; não gerar 192 ícones novos para os bônus internos.

## Integração e prova

Os consumidores usam estilos locais em Shadow DOM para conter a cascata histórica, chamando os módulos reais do domínio. Não copiar estado, funções de gameplay, botões de revisão, fixtures ou `window.openai` dos estudos para o produto. Fontes e arte são locais; dados de save permanecem com o host do jogo.

Validar regras/transações separadamente de composição e interação nativa. Os testes de VM não certificam rolagem, ponteiro físico, CRT, foco ou enquadramento. Registrar limitações efetivas no recibo; aprovação da proposta e aplicação técnica não substituem a revisão humana do jogo integrado. O monitor continua pausado e não é retomado por trabalho novo.
