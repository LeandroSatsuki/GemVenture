# GV-009 — integração da árvore aprovada

Cinco PNGs originais e rig de production/gv-009-echo-tree-v3, aprovação APP-20261014-234127. Tronco fixo, quatro copas rígidas com movimentos lentos e defasados. Fonte e geometria preservadas.

O consumidor usa sampleEchoCrown do rig aprovado e converte seus offsets de composição para a escala uniforme da cena. Draw e picking recebem o mesmo relógio/transform. World/run/câmera/geometria/navegação/saves não mudam. Pausa congela o relógio existente; reduced fixa todas as copas. Carregamento/picking usam caches limitados, sem leitura de pixels ou alocação de canvas a cada frame.

Width130, ground(500,191), nominalWidth915, limite de base85. Bounds locais(-465,-1115)..(450,0).

Onze composições não relacionadas preservadas, inclusive água atual do chafariz, cristais e forja. Novos caminhos e materiais R4 não incluídos. Não é um novo CRT nem hover amarelo.

Evidências locais em E:/assets GemVenture/production/gv-009-ui-integration-v1/: scene-0.png, world-scene.png, tree-phases.png, tree-scene-motion.webp e visual-verification.json. Render Canvas nativo; não captura de navegador nem afirmação de inspeção ao vivo do jogador. Sequência de revisão reinicia20s ao repetir; runtime usa fases contínuas do relógio existente.
