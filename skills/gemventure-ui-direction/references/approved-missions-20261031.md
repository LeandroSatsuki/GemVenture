# Missões e entrega — padrão aprovado em31/10/2026

Leia este recorte ao dirigir ou alterar Missões. A aprovação humana é de **Missões v3**, com aplicação autorizada pelo recibo `E:/Genventure/coordination/MISSIONS-UI-INTEGRATION-20261031/HUMAN-APPROVAL.json`. Aplicação e QA estão em `APPLIED-RECEIPT.json` e `QA.json` na mesma pasta; não inferir aceite humano do jogo integrado. A próxima proposta autorizada é Minerador/Vestiário; sua implementação depende de aprovação própria.

## Decisões visuais

- O jogador distingue o grupo antes de ler: **Suas missões** usa azul mais presente, contorno contínuo e faixa lateral; **Ofertas** usa fundo mais profundo e contorno tracejado. Pronta mantém o grupo aceito e recebe verde; encerrada recebe o aviso âmbar. Raridade não substitui estado ou propriedade. Não aplicar automaticamente esses contornos a inventários ou outras mecânicas.
- Cards compactos mostram ícone, objetivo, progresso/quantidade, pagamento e ação. O nome tem espaço para quebrar; informação real não é cortada para igualar alturas. Evitar saldo/custo repetidos e descrições por hover. Os tons, fontes e relevo vêm da família aprovada; extrair tokens do consumidor vigente.
- Em tela larga, grupos ficam lado a lado; em largura estreita, abas mostram um grupo por vez. Paginar contratos e ofertas para acomodar as cinco vagas sem ampliar a janela. A diferença entre grupos continua perceptível nos cards.
- Aceitar/Receber mantêm52px; nav compacta e Fechar seguem seus papéis. Melhoria tem acesso constante e abre custos no espaço reservado; Ajuda, abandono e recibo também usam esse espaço. Não deslocar a tela ao expandir.

## Funções que a composição precisa preservar

- Aceitar é gratuito, chama a ação real, salva e fecha o quadro. O prazo só avança na exploração da caverna conforme o domínio. Vaga é calculada pelo domínio, inclusive contratos prontos/encerrados.
- Entregar concede o pagamento real, progresso de companheiros e eventual disco. Só mostrar disco novo se ele tiver entrado efetivamente na coleção; não inventar drop. Continuar fecha e responde no saldo já existente; Missões volta ao quadro.
- Abandonar/limpar não sorteia ofertas. Entrega, aceite e melhoria mantêm seus gatilhos próprios de geração. Contratos antigos e já aceitos conservam objetivo, prazo, nível e pagamento, mesmo após melhorar a construção.
- A construção de Missões mantém pagamento integral ao concluir. Depósito parcial da Forja não vira regra das outras telas por semelhança visual.
- Falha de persistência respeita o host: o tutorial não anuncia save confirmado quando a missão só está na sessão. Não alterar economia ou política de save para simplificar a UI.

## Integração observada

Consumidores: `dist/approved-missions-ui.js`, `.css`, `approved-missions-assets.js`, `approved-missions-access.js`, `run.js:showMissions` e o escopo de Missões em `approved-services-shell.css`.

O host concentra domínio, save, som, bloqueios e retorno ao refúgio. A apresentação mantém paginação e sobreposições. Não copiar fixtures, estado de revisão ou funções do estudo para o jogo. Reaproveitar mídia canônica local.

O tutorial precisa alcançar o botão real dentro do Shadow DOM, inclusive se a oferta recomendada estiver em outra página. A ponte `missionPresentationTarget` revela o alvo; teclado usa o caminho composto e foco profundo. Preservar foco/Tab/Enter e o fallback dos consumidores antigos. Esse detalhe de integração não determina o layout de outras telas.

Resposta visual representa resultado verdadeiro: progresso real, recibo único, impulso breve no saldo e feedback de botão. Respeitar modo suave, movimento reduzido e o áudio existente. QA automático e observação de navegador não substituem avaliação física/perceptiva humana.
