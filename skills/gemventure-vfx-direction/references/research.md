# Pesquisa de referência — consultada em 31/10/2026

## Como usar a evidência

Pesquisar mecanismos comparáveis, não procurar um jogo que replique todo o
GemVenture. Separar evidência de implementação, declaração do criador, descrição
comercial e inferência de direção. Os estudos abaixo são documentais: não houve
sessão de jogo, medição quadro a quadro nem reprodução integral dos vídeos.
As aplicações propostas são nossas; os jogos não certificam seus resultados.
Reabrir fontes quando uma decisão nova depender de detalhe ainda não verificado.

| Referência primária | O que a fonte sustenta | Aplicação proposta ao GemVenture | Limite de transferência |
| --- | --- | --- | --- |
| [Tetris Effect — entrevista com Enhance/Monstars](https://www.unrealengine.com/developer-interviews/how-tetris-effect-became-a-modern-work-of-art?lang=en-US), 30/10/2019 | A equipe relata partículas reativas à música, alternância de excitação/relaxamento e ajuste para preservar gameplay; há opção de reduzir estímulos | Dividir resposta local, acento musical e ambiente; crescer e devolver espaço de repouso | Não importar a ocupação de tela ou a estética abstrata de um puzzle para combate com perigos |
| [Hi-Fi RUSH — história oral da Tango no Xbox Wire](https://news.xbox.com/en-us/2023/10/04/hi-fi-rush-exclusive-oral-history/), 04/10/2023 | Criadores descrevem integração de ação, animação e música, inclusive acentos sonoros feitos para a tonalidade das faixas | Uma referência temporal musical e acentos de conclusão coerentes; som deve reforçar o gesto e a música | Não copiar janelas, cadência, sistema de notas ou prometer efeitos sonoros novos durante trabalho apenas visual |
| [Beat Hazard 3 — apresentação da Cold Beam Games](https://store.steampowered.com/app/1493520/Beat_Hazard_3/) | O criador apresenta ação comandada pela música, variação com cada faixa e aumento de potência audiovisual nos picos musicais | Ler energia musical sem transformar todo ataque em um pico; manter causa do efeito reconhecível | Intensidade visual de um shooter musical não é referência automática de legibilidade para GemVenture |
| [Clicker Heroes — Playsaurus](https://www.clickerheroes.com/) | O loop oficial conecta ataques, derrota, ouro, upgrades e crescimento exponencial; existe ganho automático | Mostrar causalidade e progressão mesmo quando valores crescem enormemente; distinguir ganho passivo de conquista ativa | A página não documenta curvas de partículas nem timings; não alegar que há uma receita de VFX medida |
| [Leaf Blower Revolution — Humble North](https://store.steampowered.com/app/1468260/Leaf_Blower_Revolution__Idle_Game/) | Descrição oficial conecta manipulação de folhas, ferramentas, automação e evolução incremental | Fazer o material reagir à ação reconhecível; para grandes volumes, usar fluxo organizado em vez de confete indiferenciado | A física das folhas integra aquele gameplay; transportar o princípio sensorial não autoriza criar coleta física no GemVenture |
| [League of Legends — Clarity in League](https://www.leagueoflegends.com/en-us/news/dev/clarity-in-league/), 12/03/2021 | A equipe define leitura de gameplay, hierarquia por importância e contenção do ruído acumulado | Orçamento compartilhado entre perigo, impacto, buff, combo, números e ambiente; fonte e função distinguíveis | Não transferir estética, cores de time ou exigências competitivas específicas |
| [Riot Art Education — Visual Effects](https://www.riotgames.com/en/artedu/visual-effects) | O texto oficial trata da harmonia entre efeitos sem apagar sua origem e do equilíbrio entre satisfação e clareza | Uma gramática comum com variantes por material/ação, não o mesmo anel para tudo | A página foi lida; o vídeo não foi analisado integralmente |
| [GDC — Juice It or Lose It, Jonasson/Purho](https://www.gdcvault.com/play/1016487/juice-it-or-lose), 2012 | A descrição da sessão apresenta enriquecimento progressivo de um protótipo simples por feedback | Ensaios com a mesma ação e uma variável por vez permitem decidir o que acrescenta prazer | A descrição não prova que toda técnica serve ao jogo; shake e hitstop não são recomendações automáticas para ritmo |

## Conclusões de direção, como inferências

1. **Causalidade:** o efeito deve parecer provocado pela ação e revelar onde/como
   ela aconteceu. Um bônus automático e um acerto no ritmo merecem assinaturas próprias.
2. **Contraste temporal:** um pico ganha valor quando há preparação e repouso.
   Manter intensidade máxima permanente reduz o espaço perceptivo de evolução.
3. **Hierarquia conjunta:** contar partículas de um emissor não resolve o conjunto;
   luzes de combo, números e auras podem dominar mesmo dentro dos seus tetos locais.
4. **Progressão expressiva:** variar estrutura, direção e camadas antes de aumentar
   quantidade. A curva é uma hipótese a validar, não uma descoberta mensurada nos jogos.
5. **Coerência sensorial:** o material/gesto explica forma e trajetória; a música
   explica o acento. O relógio visual nunca passa a comandar o jogo.

## Pesquisa adicional apenas quando necessária

Para um efeito específico, buscar demonstração oficial ou do autor, observar início,
contato, pico e dissipação e registrar trecho realmente visto. Medir tempos somente
em material reproduzido com base temporal conhecida. Não copiar sprites, texturas,
curvas completas ou importar bibliotecas sem verificar proveniência e necessidade.

O experimento de Bomba já tem pesquisa própria em
`coordination/GV-043/CARTOON-BOMB-ART-DIRECTION-20261022.md`. Reutilizar esse trabalho;
não tratar a V2 com aparência rejeitada como aprovação estética.

Limites de acesso desta rodada: o antigo PDF público da Riot redirecionou para a
home; a sessão *The VFX of Diablo* retornou manutenção. Nenhum princípio específico
desses materiais foi dado como lido ou incorporado. A entrevista oficial e o texto
de educação da Riot acima oferecem base primária acessível.

## Ampliação — fogo e impactos de boss, 02/11/2026

A pesquisa técnica está em [Fogo, rastros e impactos estilizados](../../gemventure-vfx-implementation/references/stylized-fire-and-impacts.md),
com fontes primárias de Riot, Blizzard, Godot, Unity, Epic, Effekseer, JangaFX,
MDN e Chrome. O artigo oficial da Blizzard sobre VFX de dezembro/2021 foi lido;
isso não significa acesso à sessão GDC indisponível na rodada anterior. O PDF
antigo da Riot continuou redirecionando. Não foram analisados todos os vídeos.

Foi adotado o método híbrido: forma animada/atlas, rastro projetado, secundários
e luz local, preservando a independência de dano/ritmo. O primeiro caso é o
Místico TEST02-ALIGN01 aprovado, ainda isolado; não reutilizar seu core congelado
como substituto do jogo atual. Pesquisa e atualização de skills não equivalem à
produção de um novo fogo. Não houve instalação, integração ou mudança de motor.
