# Companheiros procedurais v2 — integração completa

ID: pet-companions-v2 / gameplay-v1. Data: 30/10/2026.
Estado: implementado e verificado no projeto oficial; avaliação de balanceamento de longo prazo ainda depende de playtest.
Autorização: usuário — “Integrar tudo: arte, idles, habilidades e desbloqueios”. Correção adicional solicitada: apoio dos pets nos pedestais da coleção.

Esta etapa sucede a preparação visual v1, que deixava oito pets como prévias. Os dez agora têm efeitos e requisitos ativos. Nenhum pet é concedido só por abrir a coleção. Não existe custo para desbloqueá-los e apenas um acompanha o jogador por expedição. A escolha é feita no refúgio e fica registrada no início da descida.

## Habilidades e desbloqueios vigentes

| Pet / ID persistente | Efeito | Requisitos acumulados |
| --- | --- | --- |
| Pingô / `slime-friend` | Poções recuperam 20% mais vida | Chefe do andar 10 e 10 retornos seguros com saque |
| Pipisco / `bat-friend` | +0,5 de fôlego por ação aceita no ritmo | Combo 100 em três expedições diferentes |
| Cascalhito / `cascalhito` | Quinto golpe direto de mineração causa dano ×2 | 500 pedras e 15 andares diferentes concluídos |
| Fagulhito / `fagulhito` | +1 tile de visão, respeitando paredes | Exploração real de 100% em 15 andares distintos, distribuídos em três biomas |
| Bolota / `bolota` | +12% de moedas saqueadas de pedras/criaturas, com resto fracionário acumulado na expedição | 20 missões e 5.000 moedas obtidas em expedições |
| Garim / `garim` | Uma gema adicional do tipo do décimo veio comum destruído | 750 gemas guardadas e andares concluídos em quatro biomas |
| Nimbo / `nimbo` | 20 acertos no ritmo preparam uma carga; próximo ataque direto de criatura tem dano −50%, com recuo de um tile livre dos inimigos comuns a até dois tiles | 60 estrelas obtidas e três andares diferentes concluídos sem dano à vida |
| Trufa / `trufa` | Recupera 8% da vida máxima ao concluir um andar ou novo trecho do Abismo | 20 andares diferentes concluídos, pelo menos cinco com cinco estrelas |
| Mizu / `mizu` | Um bloqueio de ataque direto de criatura a cada 32 batidas ativas | Cinco chefes diferentes e 75 estrelas obtidas |
| Cadêncio / `cadencio` | Dano de mineração e combate +20% com combo ≥50 | Combo 200 e seis chefes diferentes |

Cargas de Nimbo/Mizu não acumulam além de uma; o progresso para outra carga fica suspenso enquanto carregados. São consumidas por ataques diretos, não por lava, terreno ou perda de fôlego. Nimbo não empurra chefes nem as partes do chefe coelho; não atravessa paredes, pedras ou posições ocupadas. O recuo é resolvido depois do avanço do atacante, evitando que a investida de um morcego o sobrescreva. Mizu também bloqueia o empurrão do pulso de geodo; uma erupção bloqueada não aplica o recuo/penalidade secundária.

Cascalhito conta golpes diretos aceitos no ritmo e aplica seu multiplicador depois do limite normal de dano de mineração. Cadêncio mantém as invulnerabilidades/fases dos chefes. Garim não avança o contador com veios raros e não multiplica sua gema adicional por sorte de saque. Bolota calcula os 12% sobre o saque real com resto inteiro em centésimos, evitando perder o bônus de todos os drops pequenos. Moedas de missões não são classificadas como saque de expedição.

## Progresso e migração

`petBonds.progress` acrescenta contadores versionados de pedras, retornos seguros, expedições com combo 100, moedas de expedição, gemas guardadas, andares totalmente explorados e andares sem dano. Andares e chefes distintos são identificados pelo número oficial, nunca pela seed. Repetir o mesmo andar não cria outro andar distinto.

Estrelas e conclusões já comprovadas pelos registros oficiais são reaproveitadas. Gastar estrelas/gemas/moedas não desfaz conquistas. Gemas guardadas avançam tanto no retorno quanto no envio de carga, sem contar duas vezes o mesmo envio. Um retorno seguro pode aproveitar o saque já enviado naquela expedição, mas envio de carga sozinho não conta como retorno.

Os dois IDs legados foram mantidos, junto com todos os pets já adquiridos e selecionados. Requisitos mais difíceis não retiram companheiros de quem já os conquistou. Um save antigo não recebe automaticamente estatísticas inexistentes: moedas históricas de origem misturada, número de retornos seguros e provas de ausência de dano começam a ser registrados nesta atualização. O melhor combo antigo comprova no máximo uma expedição com combo 100. O inventário atual fornece apenas o mínimo comprovado de gemas já guardadas. Um andar iniciado em versão antiga sem registro de dano não é presumido como perfeito.

`run.petJourney` impede duplicar o crédito de combo na mesma expedição ou registrar duas vezes um retorno. `run.petPower` guarda contadores/cargas e restos de bônus; novas expedições recomeçam as cargas. Pausas e escolhas não avançam batidas. Treino não concede progresso nem ativa poderes. Esquemas futuros opacos são preservados; dados inválidos de esquema conhecido recusam a restauração em vez de reiniciar o perfil silenciosamente. A coleção e os detalhes continuam consultas sem mutação.

## Arte, câmeras e apoio

Preservadas as 60 folhas / 4.850 quadros aprovados: comparação de SHA-256 confirmou todos os PNGs idênticos à preparação visual. Não foram alteradas paleta, geometria, modelos ou animações do lote.

- Apresentação: `miner-presentation-8deg-v1`, fonte nativa 4×, utilizada no refúgio e na coleção.
- Jogo: `gemventure-cave-v1`, fonte nativa 2×, quatro direções S/W/N/E e fila de profundidade existente.
- Duas animações de idle por pet, 48 quadros / quatro segundos, com pose comum nos limites e alternância determinística.
- A coleção agora posiciona o **pivô do chão** sobre o plano superior da plataforma, sem alinhar o corpo pelo fim do recorte transparente. A mesma transformação é usada no fallback e no canvas animado.
- Nos cartões, o apoio corresponde a 28% da altura da imagem do pedestal. Na prévia maior, reaproveita-se o pedestal já pintado no cenário, com âncora normalizada em y=0,73 da imagem, respeitando `object-fit: contain`.
- O ajuste é calculado por espécie e não muda de quadro para quadro. Os voadores preservam a altura nativa acima do apoio. Modo suave, aba oculta e fechamento da janela mantêm as regras de pausa.

## Arquivos principais

`dist/pet-companion-roster.js` reúne nomes, descrições e requisitos apresentados. `home-collection.js` mantém seleção e catálogo. `pet-bonds.js` contém metas e progresso; `pet-powers.js`, os efeitos. Os pontos de integração estão em `core.js`, `cavern.js`, `frenzy.js` e `missions.js`. `run.js` apresenta feedback de habilidades com retratos próprios. `pets-service.js`, `pets-details.js`, `pets-view.js`, `refuge-lobby.js`, `pet-art-runtime.js` e `pet-companions.css` compõem os controles e o apoio visual. O antigo módulo somente de preparação foi retirado; recibos históricos permanecem preservados.

Ao alterar números no futuro, sincronizar descrição do roster, meta em `pet-bonds.js` ou efeito em `pet-powers.js`, testes de fronteira e esta tabela. Não substituir os dois IDs legados por novos IDs de arte.

## Verificações e evidências

- `npm run check`: aprovado, 435 scripts e 1.677 referências locais.
- `npm test`: **759 testes aprovados**, nenhuma falha. Depois do último ajuste de legenda da prévia, 42 testes direcionados de arte, geometria de apoio e gameplay também passaram.
- `npm run audit:art`: aprovado, 5.922 variantes legadas; não substitui a prova dos PNGs novos.
- 32 novos testes de integração de gameplay: metas exatas e abaixo da fronteira, consultas puras, save, migração, um pet por vez, cargas, mineração, moedas, gema por tipo, visão bloqueada por parede, recuo seguro, cura no trecho real do Abismo e carga enviada sem duplicação.
- Prova matemática do apoio dos dez modelos; no navegador, a diferença medida entre o pivô exibido e o topo do pedestal foi zero para os dez cartões.
- Troca real para Mizu pela interface, gravação e recarga sem reaplicar a fixture; pet selecionado preservado no refúgio. Nimbo conferido no andar 1 (cristal) e Cadêncio no andar 11 (fósseis), ambos na direção E, visíveis e apoiados no chão nativo. Erupção e pulso de geodo também tiveram verificações específicas de bloqueio por Mizu.
- Revisão visual em origem separada com perfil artificial. A fixture visual pode posicionar o histórico seguro do seguidor e desativar inimigos/fôlego para inspeção; testes de combate executam o core real, sem esses ajustes.

Pacote: `outputs/gemventure-pets-official-v2/` no workspace Diorama, com baseline, backups, logs, capturas e prova de preservação. Recibo aditivo: `tests/fixtures/pet-companions-gameplay-v1-contract.json`.

O save real na origem 4173 não foi aberto/modificado pelos testes. Permanecem para playtest: equilíbrio de longo prazo e desempenho em máquinas modestas. Esta entrega adiciona idles e poderes, não um novo conjunto completo de locomoção/combate de cada pet.

## Lançamento e acabamento — 30/10/2026

Após novo feedback, Pingô, Garim, Trufa e Pipisco usam a revisão visual 3 em `assets/pets-companions-v3/`; os seis outros modelos e os PNGs anteriores foram preservados. O laço tem lóbulos volumétricos, o Garim e a Trufa receberam chanfros/focinhos mais definidos e o pitch das asas do Pipisco mantém o bordo de ataque acima dos recortes. Tempos, Cosmos, duas câmeras, poderes e metas não mudaram. Foram verificados 24 PNGs/1.940 quadros nativos e 5.760 poses em três seeds.

`pet-companions.css` remove a limitação de 130 px da apresentação e a altura antiga do corpo do pop-up, aproveitando o painel sem a faixa vazia inferior. Na conferência pública a prévia do Pipisco ocupou 246 px, com dez cartões presentes e painel sem transbordamento vertical; a origem local também foi comparada visualmente. O teste ocorreu na viewport padrão 1280×720, sem alegar aferição em outras resoluções. Check e 759 testes passaram novamente.

Publicado em https://leandrosatsuki.itch.io/gemventure, upload **20159504**, ZIP `gemventure-pets-2026-10-30-web-r2.zip` com 947 arquivos, SHA-256 `b2ef35979a5226360f7e1d8821138ea0acef1cfb599a9a3c35c77beb08332869`. Conferido pelo botão Jogar: iframe do upload atual, dez pets, atlas v3 do Pipisco carregado e apresentação ampliada. A primeira abertura levou tempo para completar os recursos, mas terminou; não foi identificada uma causa de rede. A inspeção bruta de rede foi negada e não foi contornada.

Diário público: https://leandrosatsuki.itch.io/gemventure/devlog/1740503/os-pets-chegaram-10-companheiros-para-conquistar-no-gemventure. Ilustração promocional final `promo/output/pets-launch-20261030/pets-launch-v3.png`, com o minerador atual e asas corrigidas. Os downloads históricos de 20/10 foram ocultados, sem apagar seus arquivos. Recibos e capturas: `outputs/gemventure-pets-launch-2026-10-30/` no workspace Diorama.

## Coleção v4 — paginação, escala e raridade

Correção solicitada em 30/10/2026, posterior à publicação acima. A coleção exibe no máximo oito cartões por página, em quatro colunas e duas linhas. As setas anterior/próxima e o contador de página substituem a rolagem contínua; filtros de raridade reiniciam a página. Seleção e página são preservadas ao cuidar/equipar, sem gravar preferências de apresentação no save. A primeira renderização já oculta os cartões fora da página, inclusive quando o equipado é um dos dois últimos.

A prévia lateral utiliza a mesma plataforma isolada dos cartões, sem o cenário antigo da cuidadora. Área nativa de apresentação 240×144 e suporte 216×64,8: exatamente o dobro das medidas 120×72 e 108×32,4 dos cartões. O mesmo cálculo de pivô mantém a proporção por espécie e o apoio sobre a superfície, sem aumentar o pet para preencher todo o painel. Artes, idles, câmeras e gameplay permanecem intactos.

Raridade editorial por dificuldade da jornada e utilidade; não implica sorteio, custo ou multiplicador novo:

| Raridade | Companheiros |
| --- | --- |
| Comum | Pingô |
| Incomum | Pipisco, Cascalhito, Bolota |
| Raro | Fagulhito, Garim, Trufa |
| Épico | Nimbo, Mizu |
| Lendário | Cadêncio |

Classificação central em `pet-companion-roster.js`; cartões, detalhes e filtros consultam a mesma fonte. Sem mudanças nos requisitos, habilidades, IDs ou propriedade dos pets. Implementação localizada em `pets-view.js`, `pets-selection.js` e `pet-companions.css`. Pacote e verificação desta revisão: `outputs/pets-collection-pagination-v4/` no workspace Diorama. A publicação de lançamento acima permanece histórica; esta revisão foi incluída na atualização de progressão do Itch.io, upload 20163366.

Check: 436 scripts e 1.678 referências locais; suíte: 763 testes aprovados. O último delta somente de CSS teve os quatro testes de arte/recibos repetidos e aprovados. Navegação 8+2, seleção de Cadêncio, filtro Lendário e retorno a Todos conferidos na interface. Captura final `collection-final.png`: viewport 1280×720, oito cartões, Cascalhito selecionado e galeria/painel com altura e scrollHeight de 529 px, sem excesso vertical. Tamanhos 1366×768 e 1536×1024 também inspecionados antes do limite final de altura de 700 px. Em janelas com altura ≤650 px, a galeria permite rolagem de segurança; mantém oito itens por página. Save real da origem 4173 preservado.
