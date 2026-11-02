# GV-016 — filtro global aprovado

Aprovação humana APP-20261015-002412: “Aprovar e aplicar o filtro global”. Fonte visual canônica `production/crt-global-r2/global-screen-finish.js`, preservada byte a byte, intensidade0.9. O rebase de integração mantém a versão atual pós-R3, árvoreGV009 e íconesGV019.

Uma superfície final inert/pointer-events:none cobre mapa e HTML na mesma composição, incluindo dialogs do jogo. Bootstrap único em run antes de inicializarWorld. No documento com global instalado, world-finish não adiciona o CRTWebGL antigo nem deixa HUD separado sem filtro. Renderer nativo/destacado conserva fallback antigo. Sem suporte, a página inteira fica limpa; não deixa apenas mapa filtrado e interface limpa.

Popover manual na top layer é promovido após diálogo/popover abrir e acompanha fullscreen/resize. O filtro não clona o DOM nem lê tela/save a cada frame. Máscara estática em cache, reconstruída emresize; nenhuma animação independente. Shader/perfil original screen-finish preservado. A reconstrução global usa blurGaussiano0.45CSSpx como na proposta aceita, não é igualdade matemática com o kernelWebGL antigo.

Integração do global no export-art-studio preserva dependências de R3 e echo-tree-rig. Esse export é o estúdio de arte; o jogo é servido por dist/run. Não alegar que o estúdio inicializa global somente por conter o módulo. Novas entradas/menu do jogo precisam do mesmo bootstrap, uma única vez; não inserir filtros por componente ou dentro de assets.

Provas de prévia anteriores: `production/crt-global-r2/INTEGRATION.txt`, release-manifest, nove painéis e evidências de Fernando. Aceite humano veio após prévia de Forja/Árvore. Testes de integração locais cobrem singleton, input pass-through por contrato de atributos, promoção/fullscreen no adaptadorDOM, bypass da passagem antiga, perda/restauração de contexto e máscara1x/2x. Isso não equivale a teste completo do navegador/hardware; manter origem e limites de cada evidência.

Limitações abertas: DPR2 real de DOM/hardware; menu/configurações ainda em produção; popup expandido de select nativo fora da captura de página. Não declarar esses três cobertos pelo aceite. Selects da mineradora requerem futuro componenteHTML controlado no contrato deUI, sem nova camadaCRT. A restrição de navegador de Felipe permanece respeitada; nenhum acesso alternativo foi usado para inspecionar o jogo.
