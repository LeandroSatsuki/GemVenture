# Changelog

## 03/11/2026 — Prévias, descida e retirada do Zag

- Prévias procedurais agendam a primeira batida no clique e continuam durante as explicações do tutorial. Ativação bloqueada do áudio tem espera limitada e mensagem para tentar novamente; prévia continua sem compra/equipagem.
- Zag deixa de nascer nas cavernas e de aparecer nas partidas antigas. Compatibilidade remove somente seus metadados da sala, preservando terreno, recursos e poderes existentes.
- Objetivo da descida passa a ter um único responsável pelo texto, eliminando a alternância de caixa. Botão “CONCLUIR E DESCER” recebe face amarela e pulsação mais forte, com modo suave e pausa preservados.
- Lote UI-FOOTER-20261103-r1 integrado: o host dos pop-ups acompanha seu conteúdo e elimina a base azul excedente. Matriz física de 2500 × 1000 em UI80/UI150 conferida pelo chat de UI, preservando a Forja e a rolagem necessária.



## 03/11/2026 — Hotfix dos bosses e candidata Windows

- Novas arenas colocam os sete chefes acima do centro, com mais espaço frontal. Encontros salvos conservam a origem anterior.
- Geodo: abertura frontal de 120° para 96° (−20%); empurrão traseiro de 180° para 108° (−40%), seguindo a direção do tronco e deixando os flancos livres. Alcance, dano e relógio musical preservados.
- Quatro quinas da colisão liberadas, com centro sólido. Punhos aceleram até o contato com o chão e produzem poeira discreta.
- Candidata Windows 0.27.1: instalador NSIS, mesmo renderizador e shaders, consulta a GitHub Releases e download/reinício sob comando do usuário. Instalação visual e atualização entre duas versões ainda não verificadas; pacote sem assinatura.
- Evidências e limites em docs/boss-hotfix-20261103.md e desktop/README.md. Testes técnicos não substituem o aceite humano do balanceamento.


## 02/11/2026 — Publicação das cavernas, chefes e ambientação

- Atualização publicada no Itch.io, com nova arte promocional, capturas atuais e diário de desenvolvimento.
- Pacote web com 945 arquivos, abaixo do limite de 1.000 da plataforma. Módulos reunidos sem minificação; 258 imagens pequenas transportadas sem perdas. CSS, áudio, regras e pixels preservados.
- Entradas inline do HTML mantidas e chunks na raiz para conservar os caminhos dos estilos carregados em tempo de execução.
- Empacotador reproduzível em `tools/build-itch.mjs`, com esbuild 0.25.12 fixado. Reconstrução comparada: 945 arquivos idênticos byte a byte.
- Conferência local de hub, Forja, elevador e caverna; hub hospedada abriu sem erros registrados. Quatro verificações de release e check do projeto passaram. Isso não certifica FPS constante nem substitui playtest.
- [Jogo](https://leandrosatsuki.itch.io/gemventure) · [Diário](https://leandrosatsuki.itch.io/gemventure/devlog/1748439/cavernas-renovadas-chefes-com-mais-personalidade-gemventure).

## 02/11/2026 — Otimização da exploração da caverna

- Rotas e perseguição reutilizam buscas incrementais; inimigos parados e salas sem perseguidores não geram buscas desnecessárias.
- Nascimento de inimigos/cristais compartilha conectividade, mantendo sementes, quantidades e posições permitidas.
- Avisos evitam repetir medições de layout quando nada mudou; sem alterações de aparência.
- Serialização das grades do save reutilizada; gravação continua imediata e compatível.
- Preparação antecipada dos blocos distribuída em fatias menores, preservando prioridade dos blocos visíveis.
- Shaders, arte, efeitos, escala, densidade, recompensas e regras preservados neste lote. Evidências e limites: `coordination/cave-runtime-performance-20261102-r2/REPORT.md` na raiz de trabalho.


## 02/11/2026 — Limpeza e desempenho

- 100 arquivos antigos/temporários ou gerados retirados da árvore do jogo, cerca de197 MiB, com recuperação por hash.
- HUD e avisos vazios deixam de forçar consultas repetidas de layout/estilo.
- Cache das animações aprovadas do minerador limitado; próxima ação antecipada, sem retirar movimentos ou cosméticos.
- Síntese musical com240 ms de antecipação; relógio e julgamento rítmico preservados.
- Máscara de brilho dos cristais mais rápida, com84 comparações de pixels idênticas.
- Novo build:release separa o jogo de testes, ferramentas e históricos; documentação atualizada.
- 1413 testes gerais,66 de composição e25 finais do recorte passaram, com momentos de execução documentados no relatório. Fluidez física prolongada/escuta no Abismo pendentes; sem publicação Steam/Itch.io.


## 02/11/2026 — Progressão da picareta e da vida

- Picareta com ganhos maiores no início e decrescentes depois; preserva nível100 e força final13,276.
- Vida: +4 nos níveis1–10, +3 em11–30, +2 em31–60 e +1 em61–100, chegando a300HP base.
- Custos, receitas, fundos e demais sistemas preservados. Saves mantêm HP corrente sem cura grátis; barras antigas preservam a proporção original do fôlego.
- 43 testes focados e 1298 testes da suíte geral passaram na baseline do lote;94 testes focados adicionais passaram após conciliar integrações paralelas. Check de projeto, auditoria de arte e exportação do ateliê concluídos. Balanceamento ainda depende de playtest humano.
- Aplicação local; sem nova publicação no Itch.io.

## 02/11/2026 — Místico: coluna de chamas na fase da cabeça

- Aplica a mira discreta e a coluna de chamas aprovada, crescendo pelo trajeto do disparo.
- Reutiliza o fogo translúcido com luz local, um pouco maior, sem alterar o momento ou a área de dano.
- Preserva a primeira fase, as recompensas e o modo suave.
- Verificação: 27 testes do recorte e 1256 testes na suíte geral passaram; check de projeto, auditoria de arte e exportação do ateliê concluídos.
- Conferência no navegador com os módulos oficiais; aplicação local, sem nova publicação no Itch.io.

## 02/11/2026 — Místico: encontro aprovado e fogo com luz local

- Aplica o Místico aprovado: miragens com rastros de fogo e cabeça vulnerável após sua sequência de ataques.
- Fogo translúcido e mais lento, com chamas espalhadas, partículas luminosas e luz quente no piso próximo.
- Preserva danos, avisos, duração e recompensas do encontro aprovado; mantém compatibilidade com encontros antigos salvos.
- Verificados combate nas duas fases, restauração, modo suave, limpeza do efeito e execução no navegador. Checks de arquivos/arte e retestes de compatibilidade passaram; detalhes da composição de testes em docs/boss-evolution.md.
- Aplicação local; sem nova publicação no Itch.io.

## 02/11/2026 — Barão Cenoura: arte e animações aprovadas

- Aplicado ao jogo o visual procedural aprovado em quatro direções, com orelhas e braços articulados.
- Pancada rápida de cenoura rígida, rastro curto, impacto de terra e sons; aviso de perigo simplificado.
- Preservado o ciclo dos três filhotes e a janela de atordoamento, com respostas visuais mais claras.
- Testes do boss, auditoria de arte e exportação do ateliê passaram. Suíte geral tem pendência externa de recibo de material; detalhes em docs/boss-evolution.md. Sem publicação no Itch.io.

## 01/11/2026 — Soberano Micelial aprovado no jogo oficial

- Integra a espiral contínua no ritmo, esporos avisados e passagem temporária ao quebrar núcleos.
- Boss centralizado, reação de dor/raiva e cogumelinhos com compressão elástica.
- Copa com brilho vermelho mágico discreto, sinais visuais/sonoros e menos texto durante a luta.
- Preserva encontros já salvos, recompensas, câmera e as melhorias recentes de névoa, movimento e descida.
- Aplicação local verificada; sem nova publicação no Itch.io.


## Abismo aprovado — 01/11/2026

- Integra salões conectados, tocas laterais e materiais dos sete biomas nas novas descidas do Abismo.
- Retira a névoa da frente do ouriço descoberto e contextualiza seu refúgio junto dos veios.
- Preserva descidas antigas, relógio rítmico, cartas e regras de brotação.


## 01/11/2026 — Matriarca Raiz: encontro aprovado integrado

- Árvore centralizada, raízes poligonais, cipó elástico e ovo de seiva com contagem regressiva no jogo oficial local.
- O ovo pode ser cortado ou eclodir em três morcegos, com limite compartilhado e sem farm de recompensas. Clique, teclado, sons e saves conectados aos sistemas atuais.
- Preservadas arena, câmera, música, UI e mudanças paralelas; partidas antigas em combate mantêm o encontro anterior.
- Verificação: 990 testes + 13 de arte, check do projeto, auditoria de 5.922 variantes, exportação compilada e captura nativa. Sem publicação no Itch.io.

## 01/11/2026 — Complemento no tamanho do salão do boss

- Novas arenas com mais uma faixa de espaço: 25 × 19, 379 casas transitáveis. Câmera e estilo mantidos.
- Bordas, braseiros e mecânicas acompanham o novo tamanho; revisões antigas de arenas continuam compatíveis.

## 01/11/2026 — Mais espaço nas salas dos bosses

- Novas arenas passam de 235 para 303 casas transitáveis, com o boss mais centralizado na composição e câmera 8% mais afastada.
- Piso, toca, jaula e quatro braseiros acompanham o espaço maior. Ataques e áreas seguras reconhecem as novas bordas; vida, dano, ritmo e recompensas preservados.
- Arenas antigas salvas continuam compatíveis; cavernas comuns e Abismo não mudam.

## 31/10/2026 — Cavernas de expedição e arenas aprovadas

- Novos mapas de campanha com 24 salões, seis câmaras laterais, corredores, ligações alternativas e toca do ouriço em paredes profundas e variáveis.
- Sete famílias de materiais, líquidos arredondados, curvas e cantos; arenas com piso circular, jaula e quatro chamas na cor de cada chefe.
- Cenário preparado por setores próximos da câmera, com descarte limitado; recursos coletados permanecem removidos. Reposição e encontros acompanham os arredores da exploração.
- População, HP, valores, relógios e animações atuais preservados. Salas já salvas continuam; novos andares adotam a expedição. Abismo separado e sem alterações.
- Aplicação local autorizada após aprovação e caminhada do piloto. Contrato e limites em `docs/art/campaign-caves-v1.md`; sem publicação externa.

## 31/10/2026 — Picareta alinhada nas vistas esquerda e frontal

- Esquerda: ferramenta presa à mão próxima da câmera, à frente da barriga, seguindo a posição aprovada da direita.
- Frente: mãos centralizadas e picareta orientada pelo eixo frontal, corrigindo o repouso de lado.
- Direita/costas, cabeça, nitidez, câmera, roupas, ferramentas dos upgrades e tempos preservados. Novos atlas mantêm os históricos.
- Comparação visual em dois biomas; 1040 quadros verificados, 798 testes oficiais aprovados e referências do jogo válidas. Aprovada pelo usuário e aplicada ao jogo oficial local; sem publicação no Itch.io.


## 31/10/2026 — Minerador mais nítido na caverna

- Exportação procedural dos quadros do minerador de 128 para 256 px, sem aumentar seu tamanho no cenário. Atlas reorganizados e amostragem de maior qualidade, preservando a luz e o acabamento atuais.
- Cabeça e capacetes com mais profundidade nas vistas direita/esquerda; frente e costas preservadas na comparação do modelo em igual resolução.
- Aplicado às quatro combinações de capacete clássico/patinho e blusa azul/rosa. Corrida, mineração, tempos, apoios e encaixe da picareta mantidos.
- Verificados todos os quadros/encaixes e a apresentação em dois biomas, com testes de regressão e comparação antes/depois. Sem mudanças no save, no gameplay ou na versão hospedada no Itch.io.


## 30/10/2026 — Progressão completa, desempenho por andar e acesso ao Abismo

- Corrigida a descoberta dos biomas após abrir um selo: o elevador considera também os biomas já liberados. Suas entradas ficam disponíveis sem comprar outra parada; as paradas internas mantêm descoberta e custo. Não cria conclusões fictícias nem remove a progressão de estrelas.
- Melhor tempo, tempo da última conclusão e último score gravados por andar e preservados no save. A classificação pessoal mostra estrelas e recordes por fase. Treino e Abismo não escrevem recordes da campanha; tempos históricos ausentes não são inventados.
- O botão de classificação deixou de ser um controle desativado e abre o desempenho local neste dispositivo.
- Requisitos do Abismo visíveis ao abrir a aba: vencer o Boss Místico do andar 20 e depositar 1.500 quartzos, 1.200 rubis, 1.000 topázios e 800 esmeraldas. Não exige encerrar os 35 andares nem moedas. Removido o acesso automático de teste local, igualando a regra do jogo hospedado.
- Check aprovado (438 scripts e 1.682 referências); 768 testes aprovados. Casos novos cobrem a fronteira após o Geodo, entradas dos sete biomas/35 andares, gravação/restauração dos tempos, repetição de fase, dados legados e portão do Abismo. Desbloqueio, depósito e entrada conferidos em origem isolada.
- Inclui a revisão da coleção de pets com páginas de oito, escala sobre o pedestal e raridades. Publicada no Itch.io, upload 20163366; botão Jogar, marcador da versão, hub e requisitos do Abismo conferidos na hospedagem. Recibos em `outputs/campaign-progression-release-v1/` no workspace Diorama.

## 30/10/2026 — Coleção de pets paginada e raridades

- Oito cartões por página (4×2), setas anterior/próxima, contador e filtros de raridade integrados. Os dois últimos pets ficam na segunda página.
- Prévia lateral com o mesmo pedestal e proporção dos cartões: o companheiro fica pequeno sobre a plataforma, sem encobri-la. Removido apenas o fundo de oficina da apresentação; artes e idles preservados.
- Classificação dos dez: Pingô comum; Pipisco, Cascalhito e Bolota incomuns; Fagulhito, Garim e Trufa raros; Nimbo e Mizu épicos; Cadêncio lendário. Sem mudanças em habilidades, requisitos ou save.
- Pop-up limitado a 700 px de altura para evitar espaço vazio excessivo em monitores grandes. Textos completos e objetivos permanecem no painel lateral.
- Check aprovado; 763 testes passaram, com quatro casos novos de paginação/filtros/primeira renderização/proporção. Após o último ajuste somente de CSS, os quatro testes de arte e recibos passaram novamente.
- Revisão incluída na atualização de progressão publicada no Itch.io, upload 20163366. O pacote do lançamento anterior continua preservado no workspace.

## 30/10/2026 — Dez pets ativos e apoio nos pedestais corrigido

- Ativadas as dez habilidades e as condições acumuladas de desbloqueio aprovadas, com um companheiro por expedição.
- Contadores persistentes, cargas sem acúmulo, bônus reais de mineração/saque/visão/defesa e cura no Abismo. Pets já adquiridos preservados.
- Corrigido o apoio das artes e dos idles sobre as plataformas da coleção, incluindo a prévia maior. Removido o estado de preparação dos oito novos pets.
- Acabamento de lançamento: laço volumétrico no Pingô, focinho/patas/orelhas do Garim refinados, chanfros/focinho da Trufa polidos e asas do Pipisco com bordo de ataque acima da membrana recortada. Duas perspectivas e idles mantidos; seis outros modelos preservados.
- Apresentação ampliada do pet selecionado: área útil do pop-up corrigida, sem a faixa vazia inferior; habilidade, objetivos e ações continuam legíveis e acessíveis.
- Check, 759 testes e auditor de arte aprovados; 60 PNGs aprovados preservados. Troca, save e apoio visual conferidos em perfil isolado.
- Histórico sem prova suficiente começa a contar nesta versão; balanceamento prolongado ainda depende de playtest. Detalhes: `docs/art/pet-companions-v2.md`.
- Versão web publicada no Itch.io (upload 20159504), diário dos pets e ilustração promocional atualizados; botão Jogar conferido com os dez pets e prévia ampliada. Downloads de 20/10 ocultados e preservados no histórico.


## 30/10/2026 — Preparação visual dos pets procedurais v2

- Dez modelos aprovados e dois idles por pet integrados ao catálogo visual oficial.
- Apresentação frontal no refúgio/coleção e atlas com quatro direções na caverna.
- Pingô e Pipisco substituem visualmente os dois pets antigos sem perder equipamento ou propriedade; oito novos companheiros aparecem como prévias em preparação.
- Lacinho do Pingô, forma/cor do Cascalhito e cauda polida da Bolota preservados.
- Folhas recortadas sem perda de resolução/cor; prévias respeitam modo suave e pausa em aba oculta.
- Check, 727 testes e auditor de arte aprovados; 4.850 quadros conferidos contra as fontes aprovadas. Revisão visual na origem isolada, sem tocar no save do jogador.
- Habilidades e desbloqueios novos ainda pendentes. Recibo e limites: `docs/art/pet-companions-v2.md`.


## 30/10/2026 — Combo livre e celebração promocional v1

- Problema: celebração reduzida a placa azul; texto do combo com cor fixa
  e destaque insuficiente.
- Combo maior e sem caixa, com mudança da cor inteira a cada acerto, brilho
  musical e pulso. Marcos com estouro luminoso e número voando até o contador.
- Mantidos música, gatilhos, estrelas, recompensas, saves e luzes do cenário.
- Fontes: gamefeel-v5.js, hud-markup.js, expedition-hud-view.js, run.js,
  combo-impact.css e index.html. Testes/recibo aditivos; históricos preservados.
- Verificação: 721 testes e check passaram; HUD real comparado em três
  resoluções desktop, troca de cor, voo, cancelamento e modo suave.
- Limites: sem aferição de FPS em hardware modesto; avaliação artística
  final permanece com o jogador. Capturas no pacote combo-impact-v1.


## 29/10/2026 — Luzes de combo no ritmo da música

- O flash agora usa diretamente a fase musical compartilhada com áudio e
  comandos, incluindo as acelerações das faixas. Pico na batida e intervalo
  apagado; removida a oscilação lenta independente da música.
- Cada pulso troca posições, ângulos e cores do padrão de forma reproduzível
  pela seed. O campo continua acompanhando o minerador, sem globo físico.
- Cores Cosmos mais fortes, 18–40 projeções e 12–30 partículas de pulso conforme
  o combo cresce. Mantidos recorte do cenário, névoa, sombras e legibilidade.
- Pausa/aba oculta congelam o efeito; modo suave desativa os flashes.
- Módulos: combo-disco.js e world.js; testes de ritmo/apresentação e recibos.
- Validação: 709 testes, check e exportação portátil; comparados pico, intervalo,
  próxima batida e faixas aceleradas de dois biomas no World real.
- Evidências: gemventure-combo-beat-v3 no workspace Diorama. Sem medição de
  latência acústica do equipamento ou benchmark de FPS em hardware modesto.

Resumo de desenvolvimento: O combo virou uma balada no pulso: cada batida acende
as luzes, muda as posições e solta partículas coloridas. O efeito acompanha as
acelerações da música e ganha intensidade junto com a sequência.


## 29/10/2026 — Combo com iluminação de balada

- Corrigida a interpretação da referência: removido o globo físico.
- Quadrados coloridos maiores giram pelo piso e pelas paredes, acompanhando
  o minerador, com intensidade crescente entre 50 e 250 de combo.
- Projeções respeitam a perspectiva, o contorno das superfícies e a transparência
  das paredes. Névoa e sombras preservadas; HUD e regras do jogo intactas.
- Módulos: combo-disco.js, world.js e testes de apresentação.
- Verificação: 704 testes, check e exportação portátil; inspeção em dois biomas
  e modo suave. Sem benchmark em hardware modesto.
- Capturas: lights-blue-150.png e lights-manto-250.png em
  gemventure-combo-lights-v2 no workspace Diorama.

Resumo de desenvolvimento: O combo agora transforma a caverna numa pista de
balada: luzes quadradas e coloridas giram ao redor do minerador e ganham força
com a sequência, sem colocar um globo físico no cenário.


## 29/10/2026 — Atmosfera das cavernas e globo de discoteca no combo

- Névoa baixa e fina, distribuída sobre células reais de piso e tingida por
  bioma; preservados o nível de escuridão e a iluminação existentes.
- Paredes projetam sombras curtas e coerentes com a direção da luz e sua altura,
  com contato no terreno, recorte nas salas e emendas sem manchas acumuladas.
- A partir de 50 de combo, um globo facetado acompanha o minerador e substitui
  os círculos presos ao centro da tela. Cresce em intensidade até 250, com
  reflexos coloridos e mais partículas, todos limitados. Pausa e modo suave
  respeitados. Regras de gameplay e economia preservadas.
- Módulos: cave-depth, combo-disco, world, dungeon-environment e effects;
  módulos novos incluídos na exportação portátil.
- Verificação: 704 testes, check, auditoria de 5.922 combinações, exportação
  portátil e inspeção em dois biomas na origem QA. Capturas antes/depois
  em gemventure-cave-depth-disco-v1 no workspace.
- Limites: sombras direcionais estilizadas, sem simulação por fonte de luz;
  sem benchmark em hardware modesto ou aprovação artística presumida.

Resumo de desenvolvimento: As cavernas ganharam névoa leve e sombras junto
às paredes. Mantendo o ritmo, 50 de combo trazem um globo de discoteca que
acompanha o minerador, com reflexos e partículas crescendo junto com a sequência.


## 29/10/2026 — Partículas por bioma, picareta orientada e rubi vermelho

- Problemas: partículas ambientais sempre ciano e pouco presentes; ferramenta
  espelhada em frente/direita; rubi com coloração rosa/roxa.
- Partículas: 22 pontos pequenos, mais visíveis e na cor de cada bioma, com
  seed controlada, relógio de pausa e respeito ao movimento reduzido.
- Picareta: lado da cabeça segue o encaixe tool-up, mantendo eixo e escala;
  preservados os dez modelos aprovados e o corpo do personagem.
- Rubi: faces vermelhas e sombras vinho com cores Cosmos64 existentes. O veio
  das missões, as faíscas e a aura encantada seguem a mesma rampa.
- Módulos: dungeon-miner, dungeon-environment, world, crystal-veins e vein-1.svg.
- Verificação: 699 testes, check, exportação portátil e inspeção visual em
  quatro direções e dois biomas. Capturas comparison-blue.png e
  comparison-manto.png em gemventure-biome-pickaxe-ruby-v1 no workspace.
- Limites: sem medição de FPS em hardware modesto; aprovação artística pendente
  do usuário. Iluminação global e geometria dos veios preservadas.

Resumo de desenvolvimento: As cavernas ganharam partículas mais presentes na
cor de cada bioma. Corrigimos o lado de impacto da picareta e deixamos o rubi
mais vermelho, com faíscas e brilho encantado acompanhando a nova cor.


## 29/10/2026 — Mineração com faíscas e veios raros do bioma

- Acertos em cristal produzem faíscas pequenas e curtas na cor do mineral.
  Sem o impacto genérico e o tremor de câmera adicionais para esse tipo de golpe.
- Veios encantados ganham halo discreto e brilhos facetados assíncronos da própria
  cor. Pausa e movimento reduzido respeitados; geometria aprovada preservada.
- Corrigida a criação do raro: o tipo do bioma é escolhido antes do cálculo de
  resistência/valor. Antes era criado um topázio e o tipo mudava depois.
- Preservados pesos dos veios comuns, multiplicador ×3, prazo/intervalo do desafio
  e pagamento proporcional ao dano. Sprout acompanha o veio após seu deslocamento.
- Arquivos: materials.js, frenzy.js, core.js, effects.js e rare-ore-vfx.js.
- Verificações: 686 testes e check passaram; golpes reais conferidos em dois
  biomas na origem QA isolada; modo suave e efeitos limitados cobertos por testes.
- Limites: veios já salvos não são reescritos; sem benchmark de FPS em hardware
  fraco. Capturas e recuperação em gemventure-crystal-effects-v1 no workspace.

Resumo de desenvolvimento: A picareta agora solta faíscas na cor do cristal.
Veios encantados brilham na própria cor e surgem com o mineral característico
de cada bioma, com resistência e valor coerentes com ele.


## 29/10/2026 — Cristais com geometria regular e veios unificados

- Problema: coroas afuniladas, pedra sem suporte suficiente e quinas brancas que
  pareciam falhas. Missões ainda mostravam um veio de uma revisão antiga.
- Solução: família de seis prismas chanfrados, topos planos, base escura ajustada
  às raízes, contorno fino e reflexos coloridos, nas quatro cores dos minérios.
- Aplicação: caverna, decoração que usa o gerador de cristais, pilares de Geodo,
  quadro de missões, objetivos da HUD e ateliê/compatibilidade. Gemas coletadas
  e ícones de recompensa permanecem separados e sem alterações.
- Módulos: crystal-vein-data, crystal-veins, dungeon-volumes, world-crystals,
  art-kit, missions-assets, hud-art/registry e art-studio; exportador portátil.
- Verificação: 681 testes, check do projeto e 5.922 combinações na auditoria;
  comparação na câmera real em dois biomas e duas seeds; exportação portátil.
- Limites: sem medição de FPS em hardware fraco; não altera a arte de criaturas
  com cristais nem as ilustrações de fundo compostas.
- Capturas: in-game-blue.png e in-game-fossil.png; comparação com o estudo
  anterior e quatro cores em gemventure-crystal-polish-v5, no workspace Diorama.

Resumo de desenvolvimento: Os veios do GemVenture ganharam prismas mais limpos,
base de pedra ajustada e reflexos coloridos. As quatro cores agora também aparecem
nas missões, mantendo as gemas de recompensa com seu visual próprio.


## 29/10/2026 — Toca visível e abertura estável das telas

- Causa: a parede era desenhada depois da toca; passou a compartilhar a ordenação
  com os atores. A abertura reaparece, com a moldura rochosa existente, atrás do
  jogador e sem ocupar o piso caminhável. Arte e interação do ouriço preservadas.
- Cartas e continuação recebem orçamento de altura no CSS inicial. O resumo de
  recompensas usa a mesma faixa nas duas etapas, sem cortar seus rótulos.
- Confirmação de retorno reduzida ao conteúdo (560 px de largura máxima), com
  fonte/botões da Forja. A proteção contra confirmação acidental foi preservada.
- Missões: botão de melhoria sem quebra de palavra, painel de custo contido.
- Elevador: retirada a restrição de altura herdada do painel genérico, que deixava
  espaço inferior vazio. Conteúdo longo continua acessível por rolagem.
- Relicário: removido o giro em profundidade; estrela gira no plano da tela,
  preservando a área aparente, com respeito à opção de movimento reduzido.
- Módulos: world.js, gamefeel-v7.css, refuge-polish-v3.css e index.html.
- Verificações: 678 testes existentes; verificador de arquivos; capturas antes/depois
  e medições de abertura/navegação em outputs/gemventure-gamefeel-v7.
- Limites: validação visual local, não aprovação artística do usuário. Não houve
  nova modelagem do ouriço, alteração de economia, geração de salas ou save.

Resumo de desenvolvimento: A toca fica visível, cartas e continuação abrem sem
reajuste de tamanho e os painéis de retorno, missões e elevador aproveitam melhor
seu espaço. A estrela do relicário deixa de se achatar durante o giro.

## 29/10/2026 — Gestos variados e interfaces compactas

- Minerador: duas novas danças e gesto de olhar ao redor, alternados por seed com
  pausas, aceno e sentar. Preservado o movimento independente da cabeça e 1,5×.
- Roupa: ordem de desenho estável para mangas, braços, macacão e pernas; joelhos
  avançam somente ao sentar. Correção do painel azul que cobria partes do corpo.
- Estrela gira no plano da tela mantendo suas faces e espessura aparentes.
- Janelas menores seguem fontes, cores e botões da Forja, com altura pelo conteúdo.
  Vestiário tem cinco abas com miniaturas; tutorial sem marcadores “visto”.
- Descanso com fogueira procedural; poderes em fitinhas junto às estrelas;
  calor/exploração abaixo. Corrigida precedência do posicionamento legado da HUD.
- Novas cavernas: quatro salas amplas e corredores protegidos de cinco células;
  todas as faces da parede com altura 30. Cristais mantêm silhueta com faces tonais.
- Poções, bombas e escudos voltam a cair durante a fase, sem voltar ao resumo de
  recompensas permanentes. Saves e salas já geradas são preservados.
- Módulos: living-motion-v6/miner-parts (Diorama), player-appearance, miner-outfit,
  expedition-hud-view, gamefeel-v6.css, core, cave-layout, cave-wall-occlusion.
- Evidências: outputs/gemventure-gamefeel-v6 (testes, capturas, auditoria de rig,
  exportações e recibo de aplicação). Não equivale a aprovação artística do usuário.
- Limites: atlas de apresentação têm custo de memória; sem benchmark em hardware
  fraco. Não foram redesenhados a câmera, os materiais globais ou os chefes.

Resumo de desenvolvimento: O minerador alterna novas danças e pequenos gestos,
com roupas mais estáveis. As telas aproveitam melhor o espaço e a caverna ganha
salas amplas, corredores largos e indicadores compactos.

## 28/10/2026 — Minerador articulado e leitura da expedição

- Rig nativo do Diorama: cabeça independente, respiração, dança, aceno, sentar e
  expressões. Quatro roupas, transições neutras e dança 1,5× sem aceleração duplicada.
- HUD compacta: ritmo junto aos itens, combo colorido sem caixa, estrela volumétrica,
  objetivo curto e calor/exploração. Sem minimapa, andar ou legendas de dano.
- Painéis alinhados à Forja; árvore expansível com ramificações espaçadas, compra por
  dois cliques e duas passivas opcionais. Estrelas ao lado das moedas na hub.
- Cristais facetados mais largos, seis salas conectadas, corredores mais longos e
  faces traseiras com dois cursos. Câmera, paleta e iluminação global preservadas.
- Módulos: player-appearance, living-motion-v6 (Diorama), gamefeel-v5, talent-view,
  compact-talents, rhythm-talents, dungeon-volumes, cave-layout, cave-wall-occlusion.
- Verificação: 674 testes, 5922 variantes de arte, 70 seeds novos, 20 exports nativos,
  601 amostras por gesto, navegador isolado 1440×900 e 1280×720, exportador portátil.
- Limites: aprovação estética e balanceamento em playtest pendentes; sem benchmark
  em hardware fraco. Rig 3D exporta atlas 2D; não houve troca de motor.

Resumo para desenvolvimento: O minerador ganhou movimentos de cabeça, expressões
 e gestos mais vivos. A expedição tem uma HUD mais limpa, combo em destaque e uma
árvore de talentos que pode ser ampliada para navegar pelas ramificações.

## 28/10/2026 — Minerador modular, estrelas por andar e cavernas em salas

- Cristais em buquê com base larga, três rochas distintas em sete biomas e picaretas
  da família aprovada, mantendo sockets e dez níveis de equipamento.
- Mangas acompanham braços, dança 1,5×, apresentação frontal, pausas variadas entre
  repouso, dança, sentar e acenar. Patinho e blusa rosa; cinco slots compartilhados.
- Classificação de até cinco estrelas por andar, pagando somente melhora do recorde.
  Discos e relicários usam estrelas. Essência retirada; saldo legado vira moedas.
- HUD V05 com ritmo no topo, descanso R2 preservado, cartas ajustadas no primeiro
  quadro, loja azul, árvore compacta e desfoque do elevador reduzido à metade.
- Recompensas comuns sem essência/bomba/cura/escudo; habilidades e itens possuídos
  preservados. Escudo facetado, slime menor, salas conectadas e paredes inteiras
  com transparência por oclusão e cache estático.
- Verificação: 669 testes distintos passaram, 200 seeds, 5.922 variantes de arte,
  navegador 1280×720 e 1440×900, troca de roupa persistente e exportador compilado.
  Limites e evidências: docs/art/refuge-night-v1.md. Aprovação estética pendente.

Resumo de desenvolvimento: O minerador ganhou roupas e gestos variados. As cavernas
têm salas mais definidas, minerais distintos e ritmo no topo da tela. Cada andar
possui sua classificação de estrelas, sem recompensas repetidas.

## 28/10/2026 — Contraste da caverna e impactos minerais

- Removido o aspecto lavado da máscara azul opaca: escurecimento por multiplicação,
  mais intenso e com luz localizada. Véu/CRT reduzidos à metade; sem desaturação global.
- Cristais mais robustos e contrastantes; identidade anterior do ouriço restaurada.
- Geodo com braços articulados e recuperação; arena com contrafortes temáticos fora
  da passagem. Ataques recebem amostras Kenney CC0 pelo barramento de efeitos.
- Dez picaretas nativas compartilhadas entre mão e upgrade, eixo ligado aos sockets.
- Verificação: 659 testes; 18 reexecutados após acabamento da picareta, check de
  403 scripts e 1.656 referências, comparação visual, três sons decodificados.
- Sem alterações de dano, cadência, geração navegável ou saves. Limitações e fontes:
  docs/art/refuge-night-v1.md. Candidata visual, sem aprovação presumida.

Resumo para desenvolvimento: As cavernas ganharam sombras mais profundas sem o
véu acinzentado. Cristais mais robustos, o ouriço com sua identidade anterior e
novos movimentos e impactos do Geodo reforçam a leitura da expedição.


## 28/10/2026 — Caverna e primeira expedição integradas

- Corrigidos estilos antigos no HUD, recuperação, configurações e escolhas de cartas;
  telas de escolha conferidas em 1280×720, sem vida duplicada e com texto legível.
- Tutorial com nome salvo, cliques nos controles reais, explicações curtas e treino
  acessível pela Mina. Relicário desbloqueia nas primeiras 30 estrelas acumuladas.
- Minerador com mangas ordenadas e picareta direcional; minerais mais distintos,
  líquidos contínuos/temáticos, luminárias na parede e cavernas mais escuras.
- Chefes e ouriço recebem volumes nativos; trilhos físicos removidos; decorações
  nas bordas. Novas artes ainda aguardam avaliação visual do usuário.
- Música fornecida “In doubt”, de Hessel_vanO, integrada com pausa/retomada e crédito.
- Verificação: 652 testes, 397 scripts e 1.588 referências; navegador e perfis isolados.
  Limitações e módulos: docs/art/refuge-night-v1.md. Sem benchmark de hardware fraco.

Resumo de desenvolvimento: A primeira expedição ficou mais clara: tutorial guiado,
menus consistentes e cartas que cabem no notebook. A caverna ganhou líquidos mais
legíveis e novos volumes; o refúgio agora toca In doubt, de Hessel_vanO.


## 28/10/2026 — Carregamento direto e renovação visual da dungeon

- Nova capa com mineração, música e criaturas atuais; porcentagem e minerador
  correndo na barra. Entrada direta, configurações na hub, partidas salvas preservadas.
- Minerador procedural v3 e 21 criaturas aprovadas aplicados à dungeon; sete famílias
  de minerais/rochas com volume, paredes, pisos, decoração, luminárias e animações.
- Câmaras menores com conexões preservadas; sombras por geometria, luzes locais e
  máscara de escuridão que mantém a leitura das salas.
- Barão Cenoura em quatro direções com arma rígida; pequenos movimentos de braços
  para quatro chefes. Rigs do Geodo e da Toupeira preservados.
- Ícones atuais nas recompensas, cabine volumétrica e contraste do texto das cartas.
- Validação: 644 testes; 22 testes repetidos após revisão visual; sete biomas na
  câmera do jogo e 240 seeds de layout. Detalhes e limitações em docs/art/refuge-night-v1.md.
- Aprovação visual pendente. Música nova aguarda envio. Sem benchmark de hardware
  fraco; quatro chefes continuam rigs 2D sobre os assets existentes.

Resumo para publicação: GemVenture agora carrega direto no refúgio. A dungeon
recebeu o minerador e as criaturas atuais, minérios com volume, luzes locais e
ambientes próprios por bioma. O Barão Cenoura ganhou direção e um golpe sem esticar
sua arma. A nova apresentação segue em avaliação visual.


## 27/10/2026 — Refúgio v3: gemas com volume, expressões e menus atuais

- Gemas e ícones com leitura volumétrica; árvore da referência inicial e sete
  panoramas de bioma com transição suave nas bordas. Pets/inimigos aprovados.
- Minerador com braços afastados da cabeça, quadril e ombros suaves, piscadas e
  sorriso; dança a 1,3×, preservando o rig e as folhas aprovadas da caverna.
- Relicário ativo no lugar do Poço; Missões em destaque, Loja por último, Vitrola
  sem texto, player compacto, Forja azul-escura e atualização de tutorial/pontuação.
- Estrelas por andar refletem ganhos registrados; históricos desconhecidos não
  são preenchidos. Corrigidos conflitos de CSS em Pets, Relicário e elevador.
- Validação: 636 testes, auditoria de 5.922 variantes legadas e 961 poses nativas;
  revisão visual em perfil isolado. Save oficial não usado como fixture.
- Limites: música nova e créditos aguardam envio; aprovação visual pendente;
  sem benchmark de hardware fraco. Detalhes em docs/art/refuge-night-v1.md.

Resumo para publicação: O refúgio ganhou gemas mais volumétricas, um minerador
mais expressivo e menus mais claros. Os biomas e as recompensas receberam novas
artes, enquanto o elevador passou a mostrar as estrelas realmente conquistadas.


## 27/10/2026 — Refúgio: apresentação frontal, Jamal e limpeza da UI

- Minerador v3 em apresentação frontal de maior resolução, mãos na cintura
  corrigidas e uma única dança adaptada do Passinho do Jamal enviado pelo usuário.
- Árvore simplificada ao fundo, UI azul, logotipo oficial, pontuação em estátua,
  Missões separadas e Relicário desativado. Forja e Pets sem retratos antigos.
- Gemas coletadas nas melhorias e recompensas. Mineradora automática sem acesso
  nem liquidação passiva no lobby; dados históricos preservados.
- Elevador: estilos isolados, setas estáveis e painéis com rolagem, corrigindo
  compressão, cortes e o ciclo de redimensionamento que provocava piscadas.
- Módulos: player-appearance, refuge-lobby*, run/world, rebrand-lift, pets-view,
  forge-layout, reward-catalog-ui e consumidores de collected-gems.
- Validação: 633 testes; 5.922 variantes; auditoria de 481 poses; revisão em navegador.
  A dança é uma adaptação ao rig curto, não uma reprodução exata do vídeo.
  Aprovação visual da revisão ainda pendente; detalhes em docs/art/refuge-night-v1.md.

Resumo de desenvolvimento: O refúgio ganhou um minerador mais nítido e frontal,
uma dança única e menus mais consistentes. Pets, Forja e elevador receberam ajustes
de leitura e navegação, preservando a progressão do jogo.


## 27/10/2026 — Refúgio Mágico: preparação direta

- A vila navegável da tela inicial dá lugar ao refúgio noturno com acessos diretos
  à Forja, Árvore, Poço, Loja (Em breve), Vitrola e Mina.
- Minerador procedural v3 aprovado no lobby, retrato e vestiário, com duas danças;
  companheiro equipado e aba de pets com requisitos reais.
- Gemas coletadas distintas dos cristais do cenário, carteira ao lado das moedas,
  play/pause do tema doméstico, iluminação das lanternas, vaga-lumes e fundo suave.
- Canvas, shaders, economia e saves preservados. Integração em `refuge-lobby*`,
  `player-appearance`, `lobby-pets`, `world-crystals`, `collected-gems`, `run` e `world`.
- Validação: 630 testes, auditoria de 5.922 variantes e exportação portátil; revisão
  manual dos acessos, retrato/pose, pets e música. Limites e fontes em
  [documentação do refúgio](docs/art/refuge-night-v1.md).

Resumo de desenvolvimento: O Refúgio Mágico ganhou acessos diretos de preparação,
o minerador aprovado com novas poses de espera e um vestiário para conferir seus
companheiros. Gemas lapidadas, luzes suaves e vaga-lumes completam a primeira
integração noturna.

## Em desenvolvimento

Preparação inicial do repositório público. Este registro descreve o estado
presente; versões antigas e suas decisões estão no histórico técnico.

- Mineração rítmica com expedições procedurais e modo Abismo Infinito.
- Criaturas e chefes com ataques sinalizados no pulso.
- Cartas temporárias, teia de talentos, equipamentos e progressão da vila.
- Forja, poço, prestígio, missões escalonadas, vitrola e tabuleiro de Zag.
- Broca AFK com cascalho, TNT, frenesi, desvio, pulso e escala de prêmios.
- Interface de pedra/madeira e arte compartilhada em HEPT32.
- Capa promocional própria e documentação para desenvolvimento local.
- Partes procedurais originais do minerador para a distribuição pública.
- Validação automática em Node.js e ferramentas de auditoria de arte/economia.

Ainda em alpha: balanceamento, apresentação e integração futura com Steam.

## 2026-11-02 — Cavernas comuns: redução de 40% nas salas

- Novas cavernas passam de 30 para 18 salas: 15 principais e três laterais, com
  salões do mesmo tamanho e corredores conectados. Grade 160×108, 37,5% menor.
- Saves de cavernas anteriores conservam o mapa original; bosses e Abismo
  permanecem com a estrutura aprovada. Nenhuma alteração de arte ou recompensas.

## 2026-11-02 — Antecipação e preparação de trechos da campanha

- Preparação estática de paredes, pisos e terrenos em worker Canvas2D, com
  transferência de imagens e até dois pedidos; fallback síncrono compatível.
- Antecipação de24células, reutilização de trabalhos em mudanças de direção e
  reparo de entradas descartadas sob pressão de memória.
- Geometria,18salas novas/30salas salvas,recursos,ritmo,bosses eAbismo preservados.
