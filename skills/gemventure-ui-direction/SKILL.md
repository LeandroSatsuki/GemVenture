---
name: gemventure-ui-direction
description: Pesquisar referências e dirigir o sistema de UI do GemVenture a partir das mecânicas, decisões do jogador e identidade aprovada. Usar para padronização entre telas, paleta semântica, navegação, hierarquia e game feel. Implementação, reconstrução literal e arte têm escopos próprios.
---

# Direção de UI do GemVenture

Para personalização do HUD e distância da câmera, leia [o contrato aprovado de 02/11/2026](references/hud-editor-camera-20261102.md): quinze blocos, presets, rascunho/aplicar, reset independente e geometria do cursor preservada.

Para avisos complementares sucintos e revisão transversal, leia [o contrato vigente de02/11/2026](references/final-ui-review-20261102.md).

Para o tutorial contextual e a correção de recompensa da Sentinela, leia [o contrato vigente de02/11/2026](references/contextual-tutorial-20261102.md). Ele prevalece sobre o anúncio de vitória e a entrada obrigatória do passeio antigo.

Para a Sentinela do Veio, leia [o recorte aprovado de02/11/2026](references/approved-sentinel-20261102.md): visibilidade, combate opcional, recuo e bônus confirmado na mochila.

Para nível e pontos de habilidade, leia [o recorte aprovado de02/11/2026](references/approved-level-progress-20261102.md): ganho confirmado, agregação, XP atual e prioridade de perigo/descobertas.

Para hordas e pressão da caverna, leia [o recorte aprovado de01/11/2026](references/approved-cave-alerts-20261101.md): estados simultâneos, contagens confirmadas, fase real e prioridade sobre celebrações.

Para avisos de descobertas, leia [o recorte aprovado de01/11/2026](references/approved-discoveries-20261101.md): eventos confirmados, fila transitória, leitura passiva e respeito ao espaço do HUD.

Para achados da caverna, leia [o recorte aprovado de01/11/2026](references/approved-cave-finds-20261101.md): baú original, abertura confirmada, fragmentos e proteção de combo com relógio real.

Para Configurações com Vídeo, leia [o recorte aprovado de01/11/2026](references/approved-video-settings-20261101.md): três abas, serviço de iluminação vigente, resets separados e escala global preservada.

Para orbs da caverna, leia [o recorte aprovado de 01/11/2026](references/approved-cave-orbs-20261101.md): HUD/pedestais coerentes, efeitos no ESC, moedas da descida e movimento preservado.

Para Requisito do Abismo, leia [o recorte aprovado de 01/11/2026](references/approved-abyss-requirement-20261101.md): boss20, quatro depósitos completos e retorno ao portão.

Para Próximo bioma, leia [o recorte aprovado de 01/11/2026](references/approved-biome-unlock-20261101.md): requisitos permanentes, estrelas não consumidas e retorno à primeira parada, sem iniciar viagem.

Para Preparação do Abismo, leia [o recorte aprovado de 01/11/2026](references/approved-abyss-preparation-20261101.md): efeitos reais, equipadas/passivas, origens das relíquias e retorno ao portão.

Para Desempenho por andar, leia [o recorte aprovado de 01/11/2026](references/approved-floor-performance-20261101.md): seis marcas independentes, dados antigos, retorno ao destino e escala global.

Para o treino de ritmo, leia [o contrato aprovado de 01/11/2026](references/approved-training-20261101.md): pulso oficial, orientação curta, objetivos confirmados, controles visíveis e preservação das 26 etapas.

Para a Primeira expedição e o tamanho global da interface, leia [o contrato de escala e apresentação de 01/11/2026](references/approved-intro-ui-scale-20261101.md): barra persistente, adaptação do Refúgio, coordenadas de clique e preservação das etapas reais.


Para o Guia do Tutorial, leia [o consumidor aprovado em 01/11/2026](references/approved-tutorial-guide-20261101.md): nove acessos, orientação lateral, dados reais e consulta segura durante a expedição. Apresentação inicial e arena de treino continuam com escopos próprios.

Para Configurações e consulta de cartas na pausa, leia [o recorte de 01/11/2026](references/settings-pause-20261101.md): valores reais, efeitos acumulados e apresentação compacta.

Para Refúgio e som dos botões importantes, leia [o recorte aprovado em 01/11/2026](references/approved-refuge-20261101.md): controles reais, imagem canônica da Pontuação e bolha no mixer existente. O aceite é próprio do Refúgio; não autoriza mundo, rotas ou GV-057.

Para Como jogar, leia [o recorte de Ajuda aprovado em 01/11/2026](references/approved-help-20261101.md). Não confundir Ajuda com o Guia do Tutorial ou com o treino: são consumidores distintos.

Para Pets/Cuidadora, leia [o padrão de Pets aprovado](references/approved-pets-20261031.md): seleção distinta de equipamento, carinho confirmado, vínculos reais e apresentação animada.

Para Minerador/Vestiário, leia [o padrão de Vestiário aprovado](references/approved-wardrobe-20261031.md): troca imediata, prévia do personagem, catálogo e preservação transacional.

Para Missões e entregas, leia [o recorte aprovado de Missões](references/approved-missions-20261031.md): diferença visual entre grupos, densidade, ações reais e integração com o tutorial.

## Padrão aprovado de Forja e Árvore — 31/10/2026

Para implementar, revisar ou estender a família atual, leia [o contrato aprovado](references/approved-services-20261031.md). Ele registra as correções humanas de Forja e Árvore, as fontes ativas e os limites de integração. Referências antigas de Elevador/Abismo continuam próprias desses recortes e não impõem seu layout às telas novas.


A UI deve se adaptar ao jogo: explicar a decisão atual, tornar sua consequência previsível e dar peso ao resultado verdadeiro. Preserve a identidade volumétrica, colorida e aventureira; padronize relações entre elementos, além de suas cores. Uma tela bonita isolada não demonstra coerência do conjunto.

**Regra humana reafirmada em 30/10/2026:** o jogo atual contém funcionalidades posteriores às referências. A referência orienta a linguagem visual, não limita o conjunto de funções. Inventarie controles, dados e estados atuais antes de propor alterações; registre onde cada um continuará acessível. Recomponha ou expanda o layout para acomodá-los. Nunca remova, desative, esconda uma função essencial ou altere sua regra para fazer a tela caber na imagem. Simplificação visual não autoriza simplificação mecânica.

## Escolher o trabalho e reunir evidência

Quando o pedido exigir pesquisa antes do projeto, respeite essa ordem. Use [o estudo comparativo](references/comparative-study.md) como base inicial e atualize somente questões que dependam de informação nova. Examine material visual primário; descrição de loja serve para entender a proposta, não para certificar usabilidade. Identifique observação, relato do criador e inferência separadamente.

Antes de examinar o projeto, leia `E:/Genventure/gemventure/docs/TEAM_WORKFLOW.md`, o registro vigente `E:/Genventure/coordination/team-control.json` e recibos do domínio. Não descarregue o registro inteiro: selecione IDs, campos e referências pertinentes. Confirme baseline, alterações locais relevantes, reservas e qual versão está sendo observada. Preserve o monitor pausado e o histórico; pesquisa não despacha produção.

Consulte [o mapa de funções e fontes](references/project-map.md) para localizar contratos. Ele é um ponto de partida datado, não autoridade acima de decisões humanas posteriores. Diferencie referência aprovada, candidata, aplicação com recibo e QA perceptivo. Um estado resumido antigo pode coexistir com recibo posterior de um consumidor específico.

## Entender a tela antes de desenhá-la

Preencha a ficha em [audit-workbook.md](references/audit-workbook.md). Ela deve responder:

- O que trouxe o jogador aqui e qual decisão ele precisa tomar agora?
- Qual é a origem dos dados, custo, benefício, risco e duração do efeito?
- O que persiste: seleção, compra, build, recurso guardado ou efeito desta descida?
- O que exige atenção imediata, o que ajuda a comparar e o que pode ir para detalhes?
- O que acontece ao confirmar, falhar, fechar, voltar, pausar ou reabrir?

Não dirija uma tela cuja função essencial continue desconhecida. Investigue o contrato relevante; registre a lacuna e avance no que independe dela. Não complete lacunas com regras da ilustração ou de outro jogo.

## Formar um sistema comum

Leia [design-system.md](references/design-system.md) para paleta por função, componentes, tipografia, iconografia, densidade e escolha de superfícies. Extraia valores das referências atuais e das correções humanas, não da skin mais antiga ou de uma preferência genérica. Mantenha um registro único de papéis e exceções; um tom novo precisa de motivo e estado explícitos.

Compare função com função entre telas: compra com compra; fechar com fechar; navegação com navegação. Cores de materiais, especializações e temas podem variar dentro de uma família. Disponível, selecionado, comprado, equipado e máximo têm significados diferentes e precisam continuar reconhecíveis quando coexistem.

Ao propor simplificação, preserve informação necessária à decisão e a identidade do sistema de jogo. Ao propor expansão, declare o problema resolvido, frequência de uso, custo de atenção e eventual dependência de gameplay. Não crie mecânica para ocupar espaço vazio.

## Dar resposta e ritmo às ações

Leia [interaction-and-feel.md](references/interaction-and-feel.md) quando houver navegação, compras, cartas, ganhos ou movimento. Separe reconhecimento do comando, processamento e resultado confirmado. Preserve hitboxes, relógio musical, pausa, mute, modo suave e integridade de transações. Tempos propostos são parâmetros de protótipo, nunca uma norma atribuída à pesquisa.

## Verificar e entregar

Use [audit-workbook.md](references/audit-workbook.md) para cobertura, achados e critérios de conclusão. Registre viewport, escala, zoom, DPR e CRT quando observáveis. Teste conteúdo real, estados e retorno de foco; screenshot não prova comportamento. Não declare experiência validada com jogadores sem participantes.

Entregue o mapa de funções, o que já funciona, divergências com impacto, contrato visual proposto e o menor piloto útil. Separe regras vigentes de propostas pendentes. Implementação só dentro do escopo autorizado; testes não substituem aceite humano. Não use uma imagem de tela como substituta de controles funcionais.

Para reconstrução literal autorizada, use `E:/Genventure/gemventure/skills/gemventure-ui-reconstruction/SKILL.md`; reproduza a linguagem e os trechos especificados preservando as funções atuais, conforme a regra humana acima. Se a imagem antiga não comportar uma função nova, proponha sua acomodação explícita; não a elimine nem alegue cópia literal onde houve adaptação. Para layout, consulte `gemventure-ui-layout` sem importar parâmetros antigos que conflitem com decisões atuais. Arte do mundo, ícones e raster mantêm seus contratos próprios. Não impor regras procedurais a CSS ou PNG.

Se uma ferramenta não puder verificar o recorte, marque a prova pendente e conclua as partes independentes. Não contorne rejeições de acesso. A pesquisa histórica de 29/10 permanece em [research.md](references/research.md); suas recomendações de modelo não são requisito desta skill.
