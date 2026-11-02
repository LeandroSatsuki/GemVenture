# Pesquisa, reaproveitamento e limites

Consultada em 01/11/2026. Textos/código lidos; sem execução dos repositórios externos,
reprodução integral de vídeos ou benchmark. As traduções para GemVenture são
propostas nossas. Fontes externas não substituem contratos humanos do projeto.

## Jogos e princípios aproveitáveis

| Fonte primária | O que sustenta | Tradução proposta e limite |
| --- | --- | --- |
| [Unity / Team Cherry — Hollow Knight](https://unity.com/made-with-unity/hollow-knight) | Iluminação com formas transparentes suaves e cenário em camadas | Profundidade por composição e luz atmosférica simples; não implica adotar câmera lateral, blur global ou o renderer de Unity |
| [Thomas Vasseur — pipeline de Dead Cells](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-) | Exportação de quadros com normal maps e uso de toon shader | Volumes de parede/cristal podem reagir à luz preservando estilo; aqui os mapas e a integração ainda precisam ser produzidos |
| [Gwenaël Massé — cores de Dead Cells](https://www.gamedeveloper.com/production/art-design-deep-dive-giving-back-colors-to-cryptic-worlds-in-i-dead-cells-i-) | Cor saturada e contraste quente/frio coexistem com ambiente ameaçador | Mistério sem transformar tudo em cinza ou escurecer rotas; preservar a paleta vigente do GemVenture |
| [PolyCrunch / GameMaker — Pyramid Plunge](https://gamemaker.io/en/blog/using-normal-maps-to-light-your-2d-game) | Normais usadas no ambiente enquanto personagens mantêm sombreamento cartoon; exemplo separa texto da luz | Começar por cenário seletivo e preservar protagonistas/HUD; não importar o teto de oito luzes do exemplo como orçamento do jogo |
| [Enhance/Monstars — Tetris Effect](https://www.unrealengine.com/developer-interviews/how-tetris-effect-became-a-modern-work-of-art?lang=en-US) | Pesquisa anterior de VFX do checkout documenta ambiente reativo à música | Reutilizar direção temporal e contraste repouso/pico; texto não reaberto nesta rodada, consultar a fonte antes de depender de outro detalhe |

O [relato da Playdigious](https://gist.github.com/FlorianB-playdigious/aea80f853d46c30df6036c113cfc4b90)
descreve a remoção de normal mapping no port mobile de Dead Cells, por custo e
tradeoffs daquela versão. Serve para exigir medição e fallback, não prova que
normal maps sejam inviáveis em qualquer dispositivo ou neste jogo.

Noita foi investigado como referência possível. A página oficial confirma engine
própria e simulação por pixel; isso não demonstra por si o algoritmo de iluminação.
A sessão GDC foi localizada, mas não assistida. Nenhuma técnica de shader foi
atribuída a Noita nesta proposta.

## Comunidade e implementações consultadas

| Fonte | Princípio/exame | Uso permitido ou pendência |
| --- | --- | --- |
| [Amit Patel — 2D Visibility](https://www.redblobgames.com/articles/visibility/) | Polígonos de visibilidade e composição de máscaras de fontes; o próprio autor aponta limitações numéricas | Referência para impedir vazamento de luz; implementação Haxe indicada como Apache 2.0, rever avisos/licença se incorporar código |
| [HexagonNico — 2D fog overlay](https://godotshaders.com/shader/2d-fog-overlay-2/) | Código: ruído deslocado, densidade e alfa; comentários mostram dependência da textura | Código da postagem CC0; imagens/textura de exemplo não herdam automaticamente essa licença. Adaptar relógio, máscaras e câmera |
| [artunicore / pend00 — God Rays](https://godotshaders.com/shader/god-rays-shader-inspired-by-pend00-godot-4-5/) | Código: duas faixas de ruído, transformação e queda de intensidade | Código da postagem CC0. É feixe 2D artístico, não scattering volumétrico físico. Rever domínio/ordem de `smoothstep` no porte, não copiar cegamente |
| [VegeTato — experimento no fórum GDevelop](https://forum.gdevelop.io/t/2d-normal-map-experiment/75501) | Autor relata várias luzes, flip Y, obstáculos e animações | Relato primário de experimento; não houve teste de compatibilidade/desempenho ou exame de extensão distribuída |
| [The Book of Shaders — fBM](https://thebookofshaders.com/13/) | Explicação de composição de ruído em escalas | Base matemática para névoa; não obriga cálculo por pixel quando textura cacheada bastar |
| [Ashima / Gustavson — webgl-noise](https://github.com/ashima/webgl-noise) | Rotinas GLSL de ruído autocontidas, autoria e licença MIT declaradas | Candidato a reaproveitamento pontual com avisos preservados. Medir contra ruído em textura; biblioteca não é automaticamente a opção mais rápida |
| [MDN — WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices) | Custo de chamadas bloqueantes/uploads, batching e resolução de buffers | Referência para medir pipeline e reduzir buffers de efeitos, preservando a resolução do jogo e informação crítica |

Buscas adicionais localizaram discussões no Reddit sobre feixes, normais e névoa,
e no GameDev.net sobre iluminação 2D. As aberturas diretas retornaram cache miss.
Trechos indexados foram usados apenas para descoberta; não são prova de leitura
integral, consenso ou recomendações técnicas adotadas. O fórum GDevelop e os
comentários da postagem de névoa foram acessíveis. Não inferir algoritmo de um
vídeo/imagem cujo código ou explicação não foi examinado.

## Skills públicas encontradas

### shader-art-coding, gokayfem

[Repositório](https://github.com/gokayfem/shader-skills),
[entrypoint lido](https://raw.githubusercontent.com/gokayfem/shader-skills/main/skills/shader-art-coding/SKILL.md),
[licença MIT](https://raw.githubusercontent.com/gokayfem/shader-skills/main/LICENSE).

É a referência externa preferida para montagem/depuração de GLSL procedural:
biblioteca de blocos, bundler/checker, roteamento e vistas de depuração.
Essa capacidade é descrita pelo projeto; a biblioteca completa e seus testes não
foram executados nesta pesquisa. A saída é centrada em Shadertoy/WebGL2 e arte
procedural. Uniforms, alvo GLSL, tonemapping e regras de textura precisam de
adaptação ao consumidor do GemVenture; não herdar suas escolhas de aparência.

### shader-dev, MiniMax

[Entry point lido](https://github.com/MiniMax-AI/skills/blob/main/skills/shader-dev/SKILL.md),
[licença MIT do repositório](https://raw.githubusercontent.com/MiniMax-AI/skills/main/LICENSE).

Catálogo amplo com roteamento para iluminação, ruído, partículas e multipass.
Útil como índice secundário. Exemplos Shadertoy/WebGL2, pressupostos de página
fullscreen e números de custo não são o contrato do jogo. Algumas orientações
gerais exigem conferência na especificação antes de virar diagnóstico; por exemplo,
macros GLSL não são universalmente proibidas de conter chamadas de função.

**Decisão:** criar a especialização local `gemventure-shaders-atmosphere`, apoiada
nas fontes acima e nas skills mantidas de arte/VFX. Não importar automaticamente
qualquer skill como autoridade global, não executar instaladores externos nesta
fase e não adicionar dependência de renderer. Esta pasta contém síntese original,
sem código/arquivos copiados dessas bibliotecas. Revisar commit, scripts, licença
do arquivo e necessidade real antes de incorporar um trecho futuro.
