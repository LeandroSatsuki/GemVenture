# Auditoria inicial do projeto

Fotografia documental de 31/10/2026. HEAD `104e0140d923532a6477cc34120881eb9c6f58c3`
com alterações locais: HEAD sozinho não identifica a versão analisada. Os hashes
estão em `E:/Genventure/coordination/VFX-GAME-FEEL-20261031/SCOPE-BASELINE.json`.
Revalidar consumidores e recibos no trabalho seguinte. Não é auditoria perceptiva.

## Skills existentes e fronteiras

| Skill mantida no checkout | O que já resolve | Como complementar |
| --- | --- | --- |
| `gemventure-ui-direction` | Função da tela, semântica de estados, hierarquia, resposta, foco, transação, ritmo e modo suave | Especializar formas, camadas, progressão de VFX e comparação de efeitos em cena |
| `gemventure-ui-layout` | Composição, padrões atuais, assets fornecidos, tipografia e responsividade | Usar para encaixar feedback no componente sem redesenhar sua função |
| `gemventure-procedural-art` | Família da geometria, materiais, luz, composição e animação; runtime distinto de Diorama | Usar ao desenhar geometria do VFX; a nova skill acrescenta direção temporal e densidade final |
| `gemventure-ui-reconstruction` | Reconstrução literal de referências delimitadas | Não é ferramenta de invenção de nova linguagem de efeitos |

Não há necessidade de substituir essas skills ou duplicar seus contratos. As duas
skills de VFX cobrem direção/recompensa e execução/nitidez, respectivamente.

## Fontes atuais e achados verificáveis

Caminhos abaixo relativos a `E:/Genventure/gemventure/`.

| Sistema | Evidência lida | Achado e implicação |
| --- | --- | --- |
| Orquestração geral | `dist/effects.js`, `consume`, `draw`, `burst` | Eventos resolvidos podem acrescentar sprite, partículas, anel e número. A sobreposição é uma causa possível de ruído; ainda falta vê-la em cena |
| Atlas genéricos | `dist/vfx-manifest.js`, `dist/vfx-assets.js`, `docs/art/vfx-assets.md` | Cinco folhas são reduzidas a células 64×64 e recoloridas em seis variantes. `drawVfxAsset` amplia com suavização ligada. A resolução da folha original não chega integralmente à tela |
| Exceção importante | `drawVfxAsset` e `dist/dungeon-fx.js` | Explosão laranja/vermelha desvia para `paintVoxelExplosion`; uma troca no PNG não muda esse caminho. Não atribuir seu aspecto ao atlas sem conferir o ramo |
| Mundo | `dist/world.js`, `resize` e desenho | DPR limitado a 2; cena usa `world.scale * 2` sobre coordenadas de efeitos. O tamanho lógico de uma folha não equivale ao tamanho em CSS ou pixels físicos |
| Overlay de recompensa | `vfxOverlay` em `dist/vfx-assets.js` | Buffer `size×size` e CSS também `size×size`, sem compensação de DPR nesse helper. Pode haver perda adicional em telas densas; uso real depende do consumidor |
| Mortes de criaturas | `dist/minion-effects.js`, `dist/minion-effects-player.js` | Atlas/cache, âncoras, variantes suaves e deduplicação próprios. Padronizar aparência não exige fundir esse sistema ao loader genérico |
| Cura, escudo, Titã | `dist/player-heal-vfx.js`, `player-shield-vfx.js`, `player-titan-vfx.js`, chamada no mundo | Módulos específicos, com amostragem temporal e vínculo ao personagem; preservar semântica e aceites próprios |
| Combo no mundo | `dist/combo-disco.js`, chamadas no mundo | Já há progressão ambiental: começa em 50 e satura em 250; até 40 manchas e 30 partículas nesse sistema. Luz no chão/parede respeita recorte de superfície e fase musical. Reaproveitar antes de inventar uma segunda festa ambiental |
| Combo no HUD | `dist/gamefeel-v5.js`, `dist/combo-impact.css`, `run.js`, `expedition-hud-view.js` | Texto, pulsos e voo possuem sua própria animação; CSS acrescenta brilhos. Avaliar hierarquia conjunta com a luz da caverna, não apenas o contador isolado |
| Acabamento | `dist/crisp-layer.js`, `dist/global-screen-finish.js`, consumidor do mundo | Há camada de informação e acabamento global. Um VFX não recebe CRT adicional. Prova sem acabamento final não certifica nitidez em uso |
| Música | `dist/score.js` e `run.js` | Há conversão beat↔tempo e mudanças de andamento; não criar BPM fixo independente ou sincronização por frame |

Isso demonstra pluralidade de técnicas, não vinte origens comprovadas nem defeito
perceptivo em todos os efeitos. Técnica diferente pode gerar aparência coerente;
um único atlas também pode gerar aparência incoerente.

## O que preservar

- Relógio compartilhado, eventos aceitos, custos, dano, hitboxes, raio real, loot,
  HP, duração/expiração de buffs, saves e proteção de entrada.
- No controle vigente, rastros GV-040 têm níveis visuais 7/8/9, não upgrades 7/8/9.
  Não confundir progressão permanente de ferramenta com qualidade do combo atual.
- Em GV-043 há aceites e aplicações de sublotes anteriores. O campo geral
  `officialApplicationAuthorized: true` não libera a Bomba cartoon nova.
- Direção humana posterior da Bomba: cartoon com estrelas agrupadas, sem massinha
  ou texto BOOM. O piloto já pertence ao recorte existente; não abrir produção concorrente.

## Ficha para completar por consumidor

Registrar evento/estado confirmado; origem e destino; frequência em uso; ativo e
fallback; arquivos e funções; coordenadas e pivô; dimensão de origem e célula
depois do cache; tamanho em cena/CSS/físico; filtros; duração/fase; paleta e borda;
limites locais e concorrência; modo suave; comportamento em pausa/troca de tela;
aceite humano e recibo aplicável; prova observada e lacuna.

Priorizar a cadeia de resolução e um evento frequente. A linguagem escolhida
precisa funcionar em baixa intensidade antes de servir a bônus raros.


## Aplicação autorizada — família do Abismo, 31/10/2026

O usuário aprovou explicitamente a definição e o círculo de fogo R4 e autorizou
aplicação no jogo, pedindo cobertura das cartas. Recibo vigente deste sublote:
`E:/Genventure/coordination/VFX-OFFICIAL-20261031/APPLICATION-RECEIPT.json`.
Consultar esse recibo e as fontes atuais antes de ampliar a linguagem.

- `dist/power-vfx.js`: estados elétrico e magnético R3 e círculo de fogo R4;
  seis chamas na perspectiva do chão, ciclo de 12 batidas, suave estável.
- `dist/lightning-vfx.js`: raio angular com base larga, ponta fina, núcleo claro
  e halo curto; variação por disparo e duração de 0,35 s. `Effects` mantém teto 12.
- `dist/player-shield-vfx.js` usa o hexágono simétrico de `dist/vfx-family.js`,
  preservando a autoridade e o ciclo de vida do controlador de proteção.
- `echo`, inclusive ricochete de carta, usa essa linguagem elétrica. A carta
  `laser` mantém quatro braços em cruz; `ember` queima o alvo, sem conceder o
  buff de fogo ao personagem. Buff e carta preservam significados diferentes.
- Recuperação `abyss-heal` emite apenas a vida realmente recuperada;
  `abyss-ward` emite o sinal de proteção. Nenhuma regra de recompensa mudou.

A aprovação não substitui Bomba, Titã, asas ou todos os eventos genéricos.
Impacto no cristal, resposta de botões e chegada de cartas formam o próximo lote;
não herdam aplicação automática de uma proposta de interação ainda não vista.
O diagnóstico do loader de atlas acima permanece válido para os demais efeitos.

## Aplicação autorizada — impacto e quebra de cristal, 31/10/2026

O humano aprovou o Crystal P1 mostrado em `http://127.0.0.1:44839/` e autorizou
aplicar no jogo. Recibo deste sublote:
`E:/Genventure/coordination/VFX-CRYSTAL-APPLIED-20261031/APPLICATION-RECEIPT.json`.
Isso atualiza o estado de impacto/quebra citado acima; botões e chegada de cartas
continuam sendo a fase seguinte, ainda sem nova aparência aplicada.

O consumidor ativo é `dist/mining-vfx.js`, montado em `Effects` e no ramo de
desenho do cristal de `World`. Quatro lascas no contato, sete na quebra; no suave,
duas e três. Desenho, recuo, rampas e tempos são os do piloto aprovado. O recuo
é somente da imagem do cristal, não do chão, HP, colisão, câmera ou jogador.
O adapter agrega contatos do mesmo mineral no pacote, associa loot confirmado,
acompanha scroll e descarta caudas vencidas. Números/payout continuam nativos.
Não tratar `crystalSpark` legado ou um atlas de recompensa como o contato ativo.

Próxima fase analisada: reconhecimento e seleção de botões, seguido de seleção/
confirmação/entrada de cartas, respeitando os consumidores Shadow atuais. Consultar
`coordination/VFX-CRYSTAL-APPLIED-20261031/NEXT-PHASE.md` e a matriz GV-059/SFX-MAP
como inventário, sem inferir autorização para novos sons ou aplicar outro visual.

## Aplicação autorizada — criaturas e chefes, 31/10/2026

O humano aprovou o piloto de 18 encontros e a revisão `R2-WORDLESS-ZONES`,
autorizando a fase seguinte. O delta foi integrado ao World vigente; recibo em
`E:/Genventure/coordination/VFX-ATTACK-APPLIED-20261031/APPLICATION-RECEIPT.json`.
O consumidor é `dist/attack-readability.js`: preparação corporal, área nativa,
contagem e contato confirmado usam a mesma linguagem. Os desenhos e controladores
próprios do Rei Geodo e do Barão permanecem. Alcance, dano e relógio não mudam.

**Correção humana a preservar:** não escrever `FIQUE AQUI`, `SEGURO` ou `FIQUE
NO AZUL` dentro das áreas. O contorno já informa a posição. O cabeçalho pode
manter nome do ataque e contagem; avisos de ação continuam permitidos. Azul
recebe somente as casas da zona definida pela mecânica que não estejam sob
outra ameaça/poça ofensiva; prata distingue o empurrão sem dano.

A falha do acabamento no piloto foi isolada na composição da ferramenta:
o CSS genérico de canvas tornava opaco o fundo da camada de informação.
Na verificação integrada, essa camada é transparente e o shader nativo volta
a ser visível. Não remover o CRT oficial para corrigir um efeito e não
transportar os estilos da ferramenta de comparação para o jogo.

Esta aprovação não aplica a mecânica frontal histórica do geodo comum, outro
piloto de Bomba, arranjos musicais ou novos botões/cartas. O monitor segue pausado.


## Aplicação autorizada — botões, 31/10/2026

Após aprovar `VFX-BUTTONS-P1-20261031`, o usuário autorizou aplicar o padrão aos
botões do jogo, mantendo nitidez e brilho apenas quando a ação for confirmada.
Recibo: `E:/Genventure/coordination/VFX-BUTTONS-APPLIED-20261031/APPLICATION-RECEIPT.json`.

O consumidor é `dist/button-feedback.js`, instalado na entrada e reutilizado por
`ui-command-feedback.js`. Acompanha botões recriados e os Shadow DOM dos serviços
aprovados. Não instalar estilos em Shadow DOM de ferramentas/extensões externas.
Os filhos do botão descem 2 px; dimensões, hitbox, fonte, foco e arte ficam nativos.
O traço persistente lê seleção real. Não restaurar o antigo aumento do ícone no
clique como se fosse confirmação.

`confirmButtonResult` só deve ser chamado no ramo positivo do domínio. O contexto
do comando é capturado antes do render e resolvido novamente pelo ID/chave após
a reconstrução do botão. Se o controle tiver sido consumido ou a cena fechada,
não deslocar o brilho para outra compra nem reapresentar recompensa na reabertura.
Forja, Árvore, Vitrola, Relicário, missões, roupas, pets, Broca e Zag têm esses
pontos de sucesso. Navegação e tentativas recusadas não disparam recompensa.

Tempos aprovados: soltura 140 ms, seleção 160 ms, depósito 300 ms e conclusão
520 ms; suave confirma em 180 ms, sem deslocamento do conteúdo ou brilhos em
viagem. Limite global de duas confirmações, quatro brilhos por conclusão,
deduplicação limitada a 64 eventos. Esses limites não cancelam transações.

As 878 verificações do jogo passaram. Foram conferidos os sete serviços ativos
no jogo, clique/teclado na Forja, aquisição na Árvore e Vitrola, invocação,
troca de roupa, melhoria de missões e indisponibilidade de pets. Na origem de
comparação, 17 contratos verificaram inclusive recusa, reconstrução, modo suave,
deduplicação e limpeza. Toque físico e DPR 2 não foram certificados. O acabamento
segue a política vigente de `run.update`: o Refúgio/Elevador usa apresentação
clara; o compositor CRT não foi alterado. O monitor continua pausado.


## Aplicação autorizada — cartas na UI nova, 01/11/2026

O usuário aprovou VFX-CARDS-NEW-UI-P2-20261101 e autorizou aplicar o padrão.
Recibo: E:/Genventure/coordination/VFX-CARDS-APPLIED-P2-20261101/APPLICATION-RECEIPT.json.
Consumidor: dist/card-feedback.js/.css, montado por approved-expedition-cards-ui.js.
Usa fields do Shadow DOM vigente; não remontar os seletores antigos de cartas.
run.js chama a resposta apenas nos ramos aceitos de chooseCard/chooseAbyssCard/
advanceAbyssCards e depois de descend. Seleção não é concessão; não reapresentar
confirmação ao carregar uma carta já equipada. O prazo nativo do Abismo é preservado.

Cores: dano pêssego, cura/fôlego menta, defesa azul e utilidade lilás. O catálogo
continua sem raridade: não inventar uma classe rara por aparência. Imagens e layout
continuam canônicos. Entrada 380 ms com intervalo 70 ms; confirmação 560 ms,
voo 420 ms; suave 180 ms sem partículas/voo. Limites 12 partículas, 2 grupos e
1 voo. Preservar transforms da arte com translate independente e cancelar as
camadas geométricas ao rolar, redimensionar ou ocultar a página.

Próximo recorte iniciado: composição sob carga no Abismo, em perfil isolado com
quatro buffs nativos e seis cartas. Primeiro diagnóstico e imagem em NEXT-PHASE.md
no pacote aplicado; isso não aplica uma nova aparência, não retoma o monitor e
não encerra todos os sublotes de GV-043.


## Correções concluídas — leitura do Abismo, 01/11/2026

O pedido humano de finalizar os números de dano e os indicadores de buffs foi
executado no recorte GV-043/ABYSS-READABILITY-R1. Recibo:
E:/Genventure/coordination/VFX-ABYSS-READABILITY-R1-20261101/APPLICATION-RECEIPT.json.
Os dois pontos anteriormente pendentes no pacote das cartas estão corrigidos.

Effects usa damage-labels.js: playerActionResolved/perfect e os procs críticos
nativos identificam o golpe principal. Danos secundários agrupam somente o mesmo
alvo com ID nativo/época de scroll em 450 ms; primários não se fundem. Tetos 10/6 números no
normal/suave e seis secundários; números fora da imagem física não ficam pela metade.
Não alterar dano, pontuação ou deadline para acompanhar o VFX.

Os buffs permanecem no #boostHud da UI oficial, com ícone e tempo em linha,
44 px de altura mínima e duração sem quebra. A região atual é rolável e recebe
Home/End, PageUp/PageDown e setas quando focada; a navegação não chega ao gameplay.
O seletor é restrito à .hud5-buffs ativa, sem redesenho de ícones ou troca de UI.
A conferência física cobriu 1280x720 e 680x720, DPR 1. Suíte final: 953 passaram.
O monitor permanece pausado; este recorte não encerra todos os sublotes de GV-043.


### GV-043/HUD-MINIATURES-R1 - 01/11/2026

Correcao humana explicita vigente: buffs temporarios a ESQUERDA; cartas ativas a DIREITA.
O HUD usa miniaturas dos PNGs oficiais de cartas, com nivel real, vidas restantes e
moldura discreta pela mesma paleta semantica de card-feedback. approvedCardArt tambem
resolve estes PNGs na pausa. Os 24 SVGs antigos exclusivos de cartas e seus hashes
foram retirados do modulo distribuido; 48 SVGs de outros dominios continuam intactos.
Nao excluir skins de vestuario, pets ou icones compartilhados por skills.
Preservar #runCards .card-chip img e seus URLs canonicos: sao destinos do voo confirmado.
Poderes preservam linhas de 44px e tempos sem quebra. Rails limitados pela altura
fisica da tela; 21 cartas e seis poderes acessiveis com Home/End em 680x720.
Suíte: 964 testes passaram. Fonte/evidencias: coordination/HUD-CARDS-RIGHT-BUFFS-LEFT-20261101.
Implementacao autorizada pelo pedido atual; testes nao representam novo aceite humano.
Monitor continua pausado; sublote nao encerra automaticamente GV-043.


### GV-043/HUD-CLEAN-R2 - 01/11/2026

Correcao humana posterior substitui o visual de tiles de HUD-MINIATURES-R1:
buffs temporarios a ESQUERDA, abaixo, apenas simbolo 22px e tempo adjacente,
sem card/fundo/borda/sombra. Cartas a DIREITA em lista inferior: PNG oficial
20px, nome e nivel em cada linha; sem titulo Cartas, contador ou moldura.
Preservar o target #runCards .card-chip img e os efeitos de confirmacao.
Vidas restantes da revival continuam na descricao canonica; nivel fica visivel.
Fonte/evidencia: coordination/HUD-CLEAN-R2-20261101; 964 testes passaram.
Monitor segue pausado. Aplicacao autorizada pela correcao atual; novo aceite
perceptivo humano nao foi inferido dos testes.


Aceite humano posterior de HUD-CLEAN-R2: usuario aprovou explicitamente e autorizou
a aplicacao. Os tres hashes oficiais continuam iguais aos validados. Recibos:
coordination/HUD-CLEAN-R2-20261101/HUMAN-ACCEPTANCE.json e APPLICATION-RECEIPT.json.
O formato clean de lista inferior substitui os tiles anteriores do HUD. Nao retomar
o monitor nem aprovar outros pilotos por esta confirmacao.


## Combo por marcos - candidata P1, 01/11/2026

Pedido humano: estudar referencias antes de reformular a recompensa visual do
combo/discoteca; cada marco deve ter assinatura diferente, incluindo antes de 50.
Pesquisa e comparador: coordination/VFX-COMBO-STAGES-P1-20261101/RESEARCH.md e
http://127.0.0.1:44858/. Baseline e reserva no proprio pacote.
Oito perfis experimentais: 5/10/15/20/50/100/250/500. Nao sao beneficios novos.
Usa World e clipping nativos, memoria por instancia, fase de score.js, campo
espacial continuo e acento pontual. Marco 100: duas faixas entrelacadas.
Tetos candidatos: 18 motivos residentes + 12 acentos; suave ate quatro estaveis.
Oito contratos passaram e oito perfis foram renderizados sem mutar o estado.
Suave e combinacao com escudo conferidos; audio/GPU/FPS/todos os bosses e
composicao com HUD completo continuam fora da certificacao deste instrumento.
Sequencia de combo explicitamente simulada apenas no comparador, sem save.
Nao tratar esta candidata como aplicada ou aprovada pelo aceite do HUD.
Fila humana: combo primeiro, recompensas de conclusao depois e Bomba cartoon
existente em seguida; preservar candidata existente da Bomba, sem producao paralela.
Monitor permanece pausado.


## Combo aprovado e aplicado — 01/11/2026

Aceite humano explícito do piloto COMBO-STAGES-P1 e aplicação no runtime oficial.
Recibo: `coordination/VFX-COMBO-APPLIED-20261101/APPLIED.json`.
Oito marcos 5/10/15/20/50/100/250/500, memória visual por World, reset de contexto
e anel legado retirado. Check passou; 997 testes passaram; assets sem faltantes,
inventário de não utilizados permanece em review. Native Abismo: weave/14, sem
celebração falsa ao carregar; suave: quatro marcas estáticas, sem pulso/acento.
Próxima frente autorizada: recompensas de conclusão na UI oficial nova, em
comparativo isolado. Isso não aprova a Bomba nem retoma o monitor.


## Recompensas de conclusão — P1 candidato, 01/11/2026

Comparativo: `coordination/VFX-COMPLETION-REWARDS-P1-20261101/DELIVERY.json`,
porta 44860. Usa a UI oficial nova real e ReturnScreen; não aplica novo estilo
no runtime oficial. Entrada, contadores, reconhecimento de estrelas já guardadas
e chegada ao cofre. FontFaceSet cancelava quatro voos apesar de bounds iguais;
a candidata reutiliza o validador geométrico nativo, preservando cortes, visibilidade
e cancelamento por mudança real. Quatro voos cumpridos, zero cancelados no caso
normal final; saldos exatos iguais ao controle, sem efeitos/leases restantes.
Perda e vazio sem partículas de vitória; suave sem viagem. O aceite humano
continua pendente para este novo visual. Combo está aplicado; Bomba e monitor
permanecem sob seus contratos anteriores. Fontes compartilhadas de cave-finds,
treino e Abismo chegaram durante o trabalho e foram preservadas; recibo do combo
registra a reconciliação com 17 contratos atuais e dois checks de paleta/recibos.


## Recompensas P1 aprovadas e aplicadas — 01/11/2026

Aceite humano explícito e aplicação em `completion-feedback.js`/`return-screen.js`.
Recibo: `coordination/VFX-COMPLETION-APPLIED-20261101/APPLIED.json`.
UI, ícones e domínio financeiro preservados. Quatro voos reais chegaram; nenhum
efeito/lease restante, saldos iguais e suave sem viagem. Seis testes específicos
passaram; check passou; auditoria sem faltantes e inventário unused em review.
Suíte geral: 1034 passaram e três cenários sintéticos de restauração falharam,
sem dependência do código desta tela; detalhes no GENERAL-QA-ISSUES.json do recibo.
Não certificar a suíte geral como verde nem alterar Core nesse recorte.
Usuário autorizou encaminhar ao chat Direção de Som o som de moedas enchendo,
para o próprio responsável produzir e aplicar no mixer existente. Pedido enviado;
áudio em andamento, separado do aceite visual. Monitor não retomado.
## Bomba cartoon P2 e cogumelos sem placas — 01/11/2026

Pedido atual: comparar a explosão em movimento no cenário e remover nomes dos
cogumelos. Comparativo isolado em
`coordination/VFX-BOMB-CARTOON-P2-20261101/DELIVERY.json`, porta 44862.
Continua o piloto cartoon existente de GV-043, usando World e ação real do Core;
estrela com extrusão curta, quatro faíscas e remoção do proc legado duplicado
de find-blast somente na proposta. Outros efeitos e regras preservados.
Não há aceite nem aplicação oficial da bomba.

Texto dos cogumelos retirado do runtime, mantendo o desenho e a execução dos
efeitos. Recibo: `coordination/VFX-MUSHROOM-NO-LABELS-20261101/APPLIED.json`.
Oito testes do piloto e 22 nativos passaram; check passou, auditoria sem assets
faltantes. Suíte geral 1050/1067: 17 falhas fora do recorte visual permanecem
registradas no REPORT do piloto; não declarar a suíte verde. A pausa do monitor
e o registro central de autorizações não foram alterados.



## Bomba: manter atual, intensificar vermelho — 01/11/2026

Usuário rejeitou o cartoon P2 e pediu explicitamente o efeito atual com vermelho
mais intenso. Aplicação restrita à cor/intensidade em
`coordination/VFX-BOMB-RED-R1-20261101/APPLIED.json`; comparativo na porta 44863.
Mesmas formas, movimento, quantidade, âncora, tempo e tremor; vermelho/vinho e
opacidade do sprite da bomba de 0,85 para 1. Outras origens preservadas por opt-in.
Quatro testes específicos, 11 nativos finais e gate de paleta/recibos passaram.
Execução ampla: 1072 passaram; único teste com expectativa laranja foi atualizado
para a nova direção e o grupo afetado passou no rerun; ver relatório para limites.
Não reintroduzir cartoon por aceite histórico. Monitor continua pausado.


## Vermelho da bomba aprovado e aplicação oficial confirmada — 01/11/2026

Usuário: aprovado; aplique no jogo oficial. Os três arquivos oficiais coincidem
exatamente com GV-043/BOMB-RED/R1; nenhuma reaplicação de código necessária.
Aceite perceptivo e autorização explícita registrados em
`coordination/VFX-BOMB-RED-R1-20261101/APPROVAL.json`. Manter a animação existente
com vermelho mais intenso. Cartoon permanece rejeitado. Monitor não retomado.


## Emissão neon dos efeitos do personagem — 01/11/2026

Pedido humano de aplicação; consultar shader/ambientação e iluminar fragmentos e
efeitos do personagem. Aplicado: `coordination/VFX-NEON-20261101-R1/APPLIED.json`.
Reutiliza amostragem/máscaras do shader vigente; halo local e núcleo emissivo
seletivo após a escuridão, antes do CRT. Mantidos desenho/recuo P1, movimento,
contagens, cores semânticas, Bomba vermelha e regras. Piras, cenário e UI v3 que
entraram em paralelo foram preservados; World/Core não foram editados pelo lote.
Suíte ampla 1141/1141; refinamento final de amostragem da cura suave, com 16/16 no
grupo reexecutado; gate e check final passaram. Auditoria sem assets faltantes.
Prova real no navegador e custo Native Canvas de efeitos no REPORT; não chamar
o custo de mineração de FPS físico. Monitor continua pausado.

Pedido autorizado encaminhado da UI: luz de tesouro no baú. Protótipo separado
em `TREASURE-PILOT.json`, mesma porta 44864, opção Baú · tesouro (piloto). Usa
findUsed e progresso real da tampa v3, não repaga, não reanima baú carregado e
conserva a caixa original; 3 testes passaram. Ainda não integra esse novo efeito.

## Revisão dos legados e cobertura neon — 02/11/2026

O baú foi depois aprovado e aplicado: `VFX-NEON-20261101-R1/TREASURE-APPLIED.json`.
Novo pedido humano identificou amarelo subindo. A chama genérica foi reproduzida
no `zag-pass` de uma quebra nativa do Abismo; os aliases impact/explosion/shield/
aura/reward agora usam a família nítida aprovada, mantendo o pintor voxel original
para Bomba vermelha/explosão laranja. Os cinco PNGs genéricos ficaram como fontes
históricas e não são decodificados pelo renderizador ativo. Não reintroduzir a
chama ao adicionar um novo proc. Crítico/sorte usam seus pintores próprios.

Recibo: `coordination/VFX-LEGACY-AUDIT-20261102-R1/APPLIED.json`, prévia 44865.
Luzes seguem as estrelas/facetas reais; geodo compartilha o sampler de trajetória;
minions mantêm os atlases aprovados com halo discreto por clip/material; coelho
empresta a geometria de `strikeDirt` sem alterar o rig aprovado. Não uniformizar
fumaça/resíduo com o pico de brilho de uma recompensa. Pintores aprovados de
mineração, poderes, cura e bomba permaneceram preservados.

1189/1189 no checkpoint amplo; após integração paralela da UI da Sentinela,
37/37 no recorte final, gate de paleta e check passaram; export portátil gerado e
parseado. Native Canvas mede só custo dos efeitos, não FPS físico. Novo aceite
perceptivo desta correção não é inferido dos testes. Monitor continua pausado.

## Combo local e penumbra de contato — 02/11/2026

Usuário aprovou a revisão dos legados e pediu substituir o campo de quadradinhos
de combo por resposta mais coerente com a batida, além de sombras em degradê.
`combo-disco.js` preserva marcos/memória, mas desenha arcos e rastros locais junto
aos pés; os acentos fracionados em terços foram retirados. Envelope inicia no beat
musical e libera em 0,45 batida. Suave é estático. Não reintroduzir os losangos
espalhados por herança do aceite da progressão anterior.

`soft-ground-shadow.js` atua no desenho de sombras projetadas do ArtKit e no
contato das estruturas Canvas. Não suaviza corpos, avisos ou sombreamento de faces;
bitmaps autorados não foram editados. Recibo e limites de alcance:
`coordination/VFX-COMBO-SOFT-SHADOWS-20261102-R1/APPLIED.json`, prévia 44866.
1219/1219 no checkpoint amplo; refinamentos finais de desenho com 28/28 nos
grupos afetados. Mais de 61 mil pixels interiores dos minerais iguais à baseline.
Comparação física em quartzo, magma, Abismo e ramo Canvas do Refúgio, sem medição
de FPS. Aplicado sob pedido de correção; aceite perceptivo da nova versão aberto.
