# Vitrola — reparo pontual de foco

Autorização intermediária da coordenação, AUTH-20261015-003451, OBS-GV016-VITROLA-POINTER. Apenas o retângulo semântico de foco da Vitrola muda de centro: agora(610,268)local, equivalente(1220,536)World. O centro anterior(610,239.5)fica numa lacuna transparente da imagem. A nova caixa87×56local acompanha a base visível; o desenho, apoio, layout, chegada(610,333), navegação e picking por alfa permanecem idênticos.

Os botões semânticos continuam pointer-events:none; nenhuma área transparente vira clique de prédio. Pontos vazios/bordas mantêm a resposta de alfa anterior. Handler de foco/ativação preserva o IDrecords. Navegação por teclado usa o mesmo binding de click; fonte de run não foi alterada.

Reprodução nativa antes/depois: centro exato em quatro posições do jogador; oito mapeamentosWorld/viewport/DPR e chegadas reais no controlador existente; pausa e chegada única; quatro bordas e alvos visíveis das nove estruturas. Teste de handlers executado em adaptadorNode; não é inspeção própria de Enter no navegador.

A observação independente de Adriano registrou duas tentativas por mouse sem abrir e Enter funcionando, sem coordenadas dos cliques. Este reparo cobre uma falha reproduzida pelo centro semântico; não comprova a causa daqueles dois cliques nem certifica todos os caminhos de pointer. Não foi atribuído aoCRT. Nenhum acesso de navegador bloqueado foi contornado.

Evidências em E:/assets GemVenture/production/gv-028-vitrola-input-triage/analysis.json e native-points.png; depois em production/gv-028-vitrola-focus-fix-v1/native-verification.json e relatório de aplicação. PNG da gramofone permanece8f9e456ad3b2c9b1b156cc3ba788f8737edc4aa9cdeb05b5aad01fac756c7376.
