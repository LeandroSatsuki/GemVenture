---
name: gemventure-ui-layout
description: Implementar e revisar layouts do GemVenture a partir dos consumidores e padrões aprovados, com assets existentes, preservação de dados e comparação visual. Usar para composição, CSS, tipografia e responsividade; não para desenhar ícones ou alterar gameplay.
---

# GemVenture — UI e layout

Para pausa, retomada e flash na primeira abertura, leia [o contrato de 02/11/2026](../gemventure-ui-direction/references/pause-resume-readiness-20261102.md): prontidão de CSS em Shadow DOM, contagem sem avanço de música e graça de ritmo transitória.

Para personalização do HUD e distância da câmera, leia [o contrato aprovado de 02/11/2026](../gemventure-ui-direction/references/hud-editor-camera-20261102.md): quinze blocos, presets, rascunho/aplicar, reset independente e geometria do cursor preservada.

Para estrelas sem texto repetido e vida dos bosses no topo, leia [o contrato de02/11/2026](../gemventure-ui-direction/references/hud-boss-bars-20261102.md).

Para avisos complementares sucintos e revisão transversal, leia [o contrato vigente de02/11/2026](../gemventure-ui-direction/references/final-ui-review-20261102.md).

Para o tutorial contextual e a correção de recompensa da Sentinela, leia [o contrato vigente de02/11/2026](../gemventure-ui-direction/references/contextual-tutorial-20261102.md). Ele prevalece sobre o anúncio de vitória e a entrada obrigatória do passeio antigo.

Para a Sentinela do Veio, leia [o recorte aprovado de02/11/2026](../gemventure-ui-direction/references/approved-sentinel-20261102.md): visibilidade, combate opcional, recuo e bônus confirmado na mochila.

Para nível e pontos de habilidade, leia [o recorte aprovado de02/11/2026](../gemventure-ui-direction/references/approved-level-progress-20261102.md): ganho confirmado, agregação, XP atual e prioridade de perigo/descobertas.

Para hordas e pressão da caverna, leia [o recorte aprovado de01/11/2026](../gemventure-ui-direction/references/approved-cave-alerts-20261101.md): estados simultâneos, contagens confirmadas, fase real e prioridade sobre celebrações.

Para avisos de descobertas, leia [o recorte aprovado de01/11/2026](../gemventure-ui-direction/references/approved-discoveries-20261101.md): eventos confirmados, fila transitória, leitura passiva e respeito ao espaço do HUD.

Para achados da caverna, leia [o recorte aprovado de01/11/2026](../gemventure-ui-direction/references/approved-cave-finds-20261101.md): baú original, abertura confirmada, fragmentos e proteção de combo com relógio real.

Para Configurações com Vídeo, leia [o recorte aprovado de01/11/2026](../gemventure-ui-direction/references/approved-video-settings-20261101.md): três abas, serviço de iluminação vigente, resets separados e escala global preservada.

Para orbs da caverna, leia [o recorte aprovado de 01/11/2026](../gemventure-ui-direction/references/approved-cave-orbs-20261101.md): HUD/pedestais coerentes, efeitos no ESC, moedas da descida e movimento preservado.

Para Requisito do Abismo, leia [o recorte aprovado de 01/11/2026](../gemventure-ui-direction/references/approved-abyss-requirement-20261101.md): boss20, quatro depósitos completos e retorno ao portão.

Para Próximo bioma, leia [o recorte aprovado de 01/11/2026](../gemventure-ui-direction/references/approved-biome-unlock-20261101.md): requisitos permanentes, estrelas não consumidas e retorno à primeira parada, sem iniciar viagem.

Para Preparação do Abismo, leia [o recorte aprovado de 01/11/2026](../gemventure-ui-direction/references/approved-abyss-preparation-20261101.md): efeitos reais, equipadas/passivas, origens das relíquias e retorno ao portão.

Para Desempenho por andar, leia [o recorte aprovado de 01/11/2026](../gemventure-ui-direction/references/approved-floor-performance-20261101.md): seis marcas independentes, dados antigos, retorno ao destino e escala global.

Para o treino de ritmo, leia [o contrato aprovado de 01/11/2026](../gemventure-ui-direction/references/approved-training-20261101.md): pulso oficial, orientação curta, objetivos confirmados, controles visíveis e preservação das 26 etapas.

Para a Primeira expedição e o tamanho global da interface, leia [o contrato de escala e apresentação de 01/11/2026](../gemventure-ui-direction/references/approved-intro-ui-scale-20261101.md): barra persistente, adaptação do Refúgio, coordenadas de clique e preservação das etapas reais.


Para o Guia do Tutorial, leia [o consumidor aprovado em 01/11/2026](../gemventure-ui-direction/references/approved-tutorial-guide-20261101.md): Shadow DOM, fontes registradas no documento, foco, alvos de 56/52/44 px e dados do perfil atual.

Para Configurações e consulta de cartas na pausa, leia [o recorte de 01/11/2026](../gemventure-ui-direction/references/settings-pause-20261101.md): valores reais, efeitos acumulados e apresentação compacta.

Para Refúgio e som dos botões importantes, leia [o recorte aprovado em 01/11/2026](../gemventure-ui-direction/references/approved-refuge-20261101.md): toolbar original com retorno à expedição, retrato real e deduplicação de áudio em Shadow DOM.

Para Como jogar, leia [o consumidor aprovado de Ajuda](../gemventure-ui-direction/references/approved-help-20261101.md): abas de altura estável, fechamento e foco no diálogo existente, sem ações de gameplay.

Para Pets/Cuidadora, leia [o padrão de Pets aprovado](../gemventure-ui-direction/references/approved-pets-20261031.md): seleção distinta de equipamento, carinho confirmado, vínculos reais e apresentação animada.

Para Minerador/Vestiário, leia [o padrão de Vestiário aprovado](../gemventure-ui-direction/references/approved-wardrobe-20261031.md): troca imediata, prévia do personagem, catálogo e preservação transacional.

Para Missões e entregas, leia [o recorte aprovado de Missões](../gemventure-ui-direction/references/approved-missions-20261031.md): diferença visual entre grupos, densidade, ações reais e integração com o tutorial.

## Padrão aprovado de Forja e Árvore — 31/10/2026

Para implementar, revisar ou estender a família atual, leia [o contrato aprovado](references/approved-services-20261031.md). Ele registra as correções humanas de Forja e Árvore, as fontes ativas e os limites de integração. Referências antigas de Elevador/Abismo continuam próprias desses recortes e não impõem seu layout às telas novas.


Este rascunho registra o padrão aprovado de Andares e a V2AB como baseline aprovado para direção/layout da fase de composição do Abismo. O aceite foi comunicado por Guilherme em 23/10/2026. Não certifica captura de navegador, prova física de corte ou integração oficial; cada novo estado, viewport ou versão exige conferência própria. Respeitar o escopo e a autorização atuais do usuário.

## Fontes de referência

Consultar apenas as fontes necessárias ao painel em trabalho; confirmar sua existência antes de aplicar um delta.

- Referência visual de Andares: [06-andares.png](<E:/assets GemVenture/production/gv019-gv036-lift-ui-v2aa-marcelo-v1/preview/references/06-andares.png>).
- Referência visual do Abismo: [05-abismo.png](<E:/assets GemVenture/production/gv019-gv036-lift-ui-v2aa-marcelo-v1/preview/references/05-abismo.png>). As duas pranchas têm 1536×1024; não são capturas comprobatórias do produto.
- Implementação congelada de Andares: [V2R](<E:/assets GemVenture/production/gv019-gv036-lift-ui-v2r-marcelo-v1/dist/rebrand-lift.css>). Preservar o estado aprovado quando o pedido for somente Abismo.
- Baseline aprovado de direção/layout do Abismo nesta fase: [V2AB — CSS](<E:/assets GemVenture/production/gv019-gv036-lift-ui-v2ab-marcelo-v1/dist/rebrand-lift.css>) e [registro do aceite](<E:/assets GemVenture/production/gv019-gv036-lift-ui-v2ab-marcelo-v1/PHASE-ACCEPTANCE.json>). A V2AA permanece como fonte histórica, preservada.
- Escopo e evidências do baseline: [V2AB — relatório](<E:/assets GemVenture/production/gv019-gv036-lift-ui-v2ab-marcelo-v1/REPORT.md>) e [manifesto](<E:/assets GemVenture/production/gv019-gv036-lift-ui-v2ab-marcelo-v1/MANIFEST.json>). O aceite é de direção/layout da fase. Testes de fonte e espaço não substituem captura real nem autorizam aplicação oficial.
- Fontes tipográficas e arte consumida: `E:/assets GemVenture/production/gv019-gv036-lift-ui-v2ab-marcelo-v1/preview/assets/menu-fonts/` e `dist/assets/` no mesmo pacote. A composição usa Fredoka para títulos/rótulos de destaque e Nunito para texto, nos pesos realmente disponíveis; conferir carregamento e eventual peso sintético.
- Seleção de arte e proveniência: [mapa dos 15 assets](<E:/assets GemVenture/production/gv019-gv036-lift-ui-v2ab-marcelo-v1/received-assets/SELECTED-FOR-PREVIEW-V2AA.json>), [FIT-V02 do hero](<E:/assets GemVenture/production/gv019-gv036-lift-ui-v2ab-marcelo-v1/received-assets/FIT-V02-MANIFEST.json>) e [recibo da cabine](<E:/assets GemVenture/production/gv019-gv036-lift-ui-v2ab-marcelo-v1/received-assets/CABIN-PRODUCER-MANIFEST-V02.json>).
- Dados e ações reais pertencem ao consumidor do jogo: `E:/Genventure/gemventure/dist/lift-view.js`, `expedition-map.js`, `run.js` e módulos de domínio relacionados. Ler a revisão de destino antes da integração; uma candidata de UI não substitui esses arquivos completos.

Os caminhos acima identificam referências deste padrão, não uma autorização permanente para editar fontes congeladas ou aplicar ao oficial. Uma referência mais recente explicitamente aprovada pelo usuário prevalece; documentar qual base foi utilizada.

## Composição e linguagem visual

- Reproduzir a referência elemento por elemento: fonte, paleta, proporção, eixo, espaçamento, contorno e estado. Evitar aproximar apenas a silhueta geral do painel.
- Manter a hierarquia do elevador: título/fechar e navegação de modos; conteúdo principal do modo; métricas e ação; detalhes e recompensas. Em Andares, preservar a navegação de biomas, seleção de andar, imagem contextual e informações da seleção.
- Usar painéis azuis escuros, contornos escuros contínuos, leve luz interna na borda e superfícies secundárias distinguíveis. Textos de destaque brancos com contorno escuro; descrições em azul claro legível. Reutilizar as cores e fontes do painel aprovado, sem impor a paleta da arte dos ícones ao CSS.
- CTAs de descida/entrada seguem amarelo vivo no topo e laranja na base, brilho superior estreito e texto branco com borda escura. Abas e categorias preservam seus gradientes e estados aprovados; roxo do Abismo não transforma automaticamente o CTA em roxo.
- Manter eixos e intervalos deliberados entre hero, métricas, CTA, detalhes e recompensas. Dimensionar o espaço necessário pelo conteúdo, bordas, padding e line-height; não resolver falta de espaço com corte, sobreposição ou redução indiscriminada da fonte.
- Ajustes de um modo devem usar seletores próprios. Conferir a cascata completa, incluindo `flex-direction`, alinhamento, shorthand de fonte, especificidade e breakpoints: redefinir `display:flex` não desfaz uma direção `column` herdada.

## Assets, ícones e legibilidade

- Consumir os arquivos fornecidos pelo responsável de arte e conferir o ID/versão/hash quando houver recibo. Criação ou revisão do desenho pertence à skill de arte apropriada, como `gemventure-icon-art`; esta skill cuida de encaixe e composição.
- Em métricas, detalhes e categorias, posicionar o ícone à esquerda do rótulo, em linha, com centro vertical comum. Dar ao texto espaço flexível e `min-width:0`; reservar folga real entre ícone, texto e borda. Não truncar rótulos essenciais como “ATÉ 5 ESTRELAS”.
- Preservar a proporção e a transparência da arte. Usar `contain` para símbolos e ilustrações que precisam aparecer inteiros. Crop de panorama somente quando fizer parte do encaixe aprovado; preservar o FIT-V02 do hero do Abismo ao ajustar seus textos e controles.
- Preferir um export existente de resolução suficiente a ampliar uma cópia pequena. Exemplo: a cabine de 112 px pode servir ao slot de aproximadamente 48×52 CSS px; não regenerar ou redesenhar a arte para corrigir o slot.
- Conferir ocupação visual, não apenas o tamanho do recipiente. Como exemplos ajustáveis desta família: símbolos funcionais próximos de 64 px no desktop e 50 px no compacto; categorias de aproximadamente 40–42/36 px; rótulos de categoria de 17–18/15 px; altura de categorias de aproximadamente 66/54–56 px. Esses valores são exemplos ajustáveis do baseline aprovado desta fase, não medidas universais nem prova de encaixe em um novo estado ou viewport.
- Aumentar um botão implica recalcular padding, largura do rótulo, altura da seção e vizinhos. Manter os tiles de recompensa proporcionais; se faltar espaço, ajustar a malha ou a área rolável sem esconder conteúdo.

## Estado e integração

Separar imagem de referência, fixture visual e estado real. A prancha ilustrativa pode mostrar cinco recompensas, baú ou pergaminho; isso não autoriza criar drops, saldos, ranking, desbloqueios ou resultados de gameplay. No produto, mostrar somente dados e ações sustentados pelo domínio. Manter fixtures identificadas e sem gravar saves.

Preservar IDs, hooks, callbacks, teclado, bloqueios, elegibilidade, custos, recordes, unidades e lógica existentes. Uma correção visual não autoriza modificar a mecânica. Quando a tarefa pedir candidata isolada, criar sucessora e conservar o pacote aprovado; entregar deltas reconciliáveis para integração, não a substituição integral de arquivos compartilhados.

## Conferência e aceite

Comparar referência e candidata lado a lado no mesmo artboard. Conferir também a página nativa em 1536×1024 e 1366×768 como exemplos desktop/compacto desta família, além das viewports exigidas pela tarefa. O comparador escalado não substitui a prova nativa; media queries da janela não podem ativar inadvertidamente o compacto dentro da comparação desktop.

Verificar texto completo, ícones em linha, foco/seleção/bloqueio, fontes e imagens carregadas, rolagem alcançável, limites dos painéis e ausência de sobreposição. Para divergências, registrar arquivo/regra, estado, viewport, evidência e ajuste mínimo. Preservar a referência e a arte ao corrigir CSS.

Distinguir testes de código, avaliação de cascata, projeção geométrica, computed style real e captura de pixels. Testes e contas ajudam a localizar falhas, mas não provam ausência visual de corte, fidelidade percentual, toque, zoom ou CRT0,9. Se a renderização estiver indisponível, concluir a parte verificável, registrar a evidência faltante e não fabricar captura ou aceite visual. Não repetir uma confirmação já autorizada: o aceite deve tratar a candidata concreta e os limites materiais restantes.
