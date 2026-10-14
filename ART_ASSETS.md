# Gemventure — biblioteca de arte

## Versão pública no GitHub · 14/10/2026

Corpo e capacete procedurais usam partes originais em `dist/pack-art.js`.
As entradas de packs importados na seção histórica abaixo não são componentes
ativos da versão pública. Os vetores antigos e o importador permanecem apenas
no ambiente local, fora do Git, por restrições de redistribuição. As referências
do catálogo foram regeneradas com as peças originais. Veja `CREDITS.md`.

## Direção visual

### Interface — materiais HEPT32, 14/10/2026

`dist/ui-theme.css` contém a base comum; `dist/ui-refinement.css`, carregada por último, define a revisão atual pelas duas referências enviadas pelo usuário. Madeira no cabeçalho, pedra cinza `#686b72` na janela, aço `#8b97b6` nos detalhes e fundo slate `#353658` nos mapas. Categorias têm ícone e nome; seleção é ocre `#de9751`, ação principal é laranja `#ef6e10`, texto sobre superfícies escuras é branco. As superfícies usam uma sombra sólida e os controles inativos ficam cinza. Recursos aparecem em bandejas e linhas com ícones e quantidades. As habilidades 1/2/3 continuam no centro inferior e usam o relógio real de batidas para indicar disponibilidade. Combo, recompensas e perigo preservam seus sinais fortes.

`dist/ui-labels.js` aplica nomes de apresentação curtos sem alterar IDs salvos: Talentos, Relicário, os seis ramos por função e os projetos da Forja. Melhorias dos prédios ficam em um controle expansível, preservando receitas, preços e limites. As possibilidades de atributos também ficam recolhidas até o jogador consultar. Ao atualizar uma melhoria de prédio, o controle permanece aberto se o jogador já o abriu.

Referências estudadas: seleções ilustradas e estados de habilidade em [Forager](https://interfaceingame.com/games/forager/); integração de cores e formas no cenário de [Stardew Valley](https://www.stardewvalley.net/media/). As imagens servem de estudo, não são assets importados. Novas telas devem seguir os materiais e a hierarquia de `ui-theme.css`, evitando recolocar placas, gradientes e contornos neon em cada informação.

QA de interface usa `node tests/ui-review-server.mjs`, porta 4175, para manter as prévias com progresso fictício separadas dos saves nos endereços 4173/4174.

### Catálogo para produção de novas imagens

Abrir `http://127.0.0.1:4173/asset-catalog.html` (ou a mesma página no servidor QA 4174). O catálogo apresenta as peças atuais, referências PNG/SVG exportadas, origem no código, destino proposto e necessidades de animação. Dados completos em `dist/asset-reference/catalog.json`.

- `dist/assets/village-hept32/`: 13 PNGs ativos da vila, incluindo `mining-machine-v2.png` da Broca AFK de aço. `mining-machine.png` é a versão amarela anterior, preservada. A normalização de paleta e os recortes animados atuais ainda se aplicam.
- `dist/asset-reference/`: referências por código exportadas, separadas por personagem, criaturas, chefes, recursos, cenário, equipamento, cartas, ícones, dados do Zag e biomas. São referências, não novos assets integrados.
- `asset-work/novos-assets/`: pastas de entrega para novas imagens das demais famílias. O jogo **não carrega automaticamente** esta pasta; a integração será feita por família, com tamanho, ponto de apoio e animação revisados.

As 209 entradas incluem reutilizações: 7 chefes e 2 invocações, 21 inimigos e 7 ouriços por bioma, 4 minerais sobre 7 bases, 3 resistências de rocha por bioma, 10 picaretas, 4 variantes do minerador, 24 símbolos de cartas (incluindo 3 de recuperação do Abismo), 35 ícones compartilhados e 6 faces de dado, além da mineradora AFK. Não gerar um desenho por semente ou por andar. Biomas usam a miniatura real do elevador como referência de composição; chão, paredes, perigos, efeitos e painéis ainda exigem partes próprias, descritas no catálogo.

Para atualizar as referências após mudar a arte por código: `node tools/export-asset-catalog.mjs`, depois `python tools/rasterize-asset-references.py`. A conversão usa o PyMuPDF já instalado em `asset-work/python-deps`, preserva transparência e não modifica os assets ativos.

### Vila — referência de composição e HEPT32, 13/10/2026

O usuário definiu uma nova referência de vila e esclareceu que ela é um guia, não uma imagem para colocar no jogo. As novas peças são criadas individualmente, com volumes isométricos chanfrados, poucas massas sólidas, sombra simples, contorno externo e a paleta HEPT32 já acordada. A imagem de composição é `codex-clipboard-19b14d97-c09e-4fff-8e27-40b983e492e8.png`; o pack `C:/Users/lpsan/Downloads/out. 13 - 09_49` permanece como estudo de direção anterior.

O cenário usa `dist/flow-village.js` e doze PNGs transparentes novos em `dist/assets/village-hept32/`: Forja, Árvore de Ecos, elevador de madeira, poço, quadro, relicário, vitrola, roleta, Zag, explorador, árvore pequena e arbusto. As proporções e posições seguem a composição aprovada; terreno e caminhos são construídos pelo renderizador com a mesma paleta. A imagem de referência nunca é desenhada como fundo. Prompts completos em `asset-work/village-hept32-prompts.md`.

As imagens carregam uma vez e viram sprites de até 512 pixels por dimensão. O renderizador lê o alfa, conserva a proporção, reduz variações de superfície e normaliza cada material ao seu subconjunto HEPT32. Copas e cristais têm recortes animados, sem regenerar imagens a cada quadro. Não há legendas fixas: mouse e foco de teclado exibem o nome da estação no topo. Os estudos anteriores não são usados na versão atual.

HEPT32, por ENDESGA: https://lospec.com/palette-list/hept32

Uma única paleta no mundo, na interface e nos efeitos. Silhuetas amplas, contorno escuro, luz superior esquerda, cor sólida e uma sombra por material. Personagem e quadro de missões são referências locais. Corpos orgânicos e construções usam curvas e cantos suaves; cristais mantêm facetas regulares. Os quatro minerais conservam sua cor nos seis biomas.

## Origem dos assets atuais

| Fonte fornecida em `../Assets` | Uso e adaptação |
| --- | --- |
| `vector-rpg-character-template.zip` / `Individual Animations/idle-1.svg` | Frente do explorador; roupa, pele e contornos adaptados à HEPT32. Mochila e cinto próprios. |
| `vector-hats.zip` / `Miner Hat/miner-hat-outline.svg` | Capacete do explorador, recolorido em amarelo/dourado. |
| `vector-ranks.zip` | Adaptação anterior preservada no catálogo importado. Os emblemas atuais do quadro e relicário foram redesenhados para o projeto. |
| `video-game-element-collection.zip` / `8730665.ai` | Vetores importados anteriores preservados como arquivo de referência. Cristais, poção e escudo atuais são desenhos próprios em `scene-art.js`; não usam essas peças importadas. |

As famílias do gerador receberam polimento conjunto: telhado regular da Forja, elevador de madeira e corda, árvore ampla, poço e estrela simétricos, rochas arredondadas, seis chefes e criaturas próprias por bioma. O personagem preserva corpo e capacete dos packs, com acabamento comum. O ouriço de cristais substitui o jardineiro como espectador gigante na toca: 30 formas e sete camadas animáveis para respiração, piscar, olhar e patas alternadas no pulso. A toca acompanha sua escala, com recorte que preserva a leitura do chão jogável. Animações usam camadas com pivôs; bases ficam no chão. Paredes da caverna são uma massa contínua distinta das rochas mineráveis.

## Outros pacotes avaliados

Os novos conjuntos `cartoon-game-icons...`, `fun-variety-knight-elements`, `set-game-icons...` e `video-game-game-health-bar-element...` foram catalogados. Os conjuntos de HUD e medieval servem como referência de composição; não substituem automaticamente a interface. Os arquivos adicionais `(1)` e `(2)` permanecem disponíveis no inventário para seleção futura.

Sunnyside, Solaria e os pacotes de VFX/pixel UI não entram diretamente no renderizador: suas texturas, resoluções ou sombreamentos diferem da direção escolhida. O pacote de músicas não foi alterado nesta integração.

## Créditos e origem

- RhosGFX: https://rhosgfx.itch.io — personagem e capacete atuais; emblemas da importação anterior. A licença fornecida para o personagem permite adaptação e uso em jogos comerciais ou não comerciais, mas proíbe revenda/distribuição do asset isolado. Conservar o arquivo de licença original. Ranks: CC0 conforme `License.txt`. Hats: CC0 conforme https://rhosgfx.itch.io/vector-hats.
- Coleção de elementos de jogo: arquivos `8730665.ai`, `8730668.eps` e `8730670.jpg` fornecidos pelo usuário. O ZIP não inclui licença nem crédito de autor verificável; manter o comprovante e os termos da origem junto ao pack. Não classificar essa coleção como CC0.
- As prévias e exportações do ateliê são ferramentas locais de produção do jogo; não constituem autorização para redistribuir os assets como um novo pacote.

Referências de direção, sem copiar desenhos: [Forager, HopFrog](https://hopfrogsa.net/forager) para a leitura imediata de objetos e coleta; [Core Keeper, artigo do desenvolvedor](https://news.xbox.com/en-us/2025/03/07/core-keeper-boss-stomps-sandbox-adventure/) para relacionar identidade dos chefes e mecânicas.

## Manutenção

1. Colocar os packs originais em `../Assets`; o importador não altera os originais.
2. Para os vetores Illustrator, instalar a dependência de edição: `python -m pip install --target asset-work/python-deps pymupdf==1.28.2`.
3. `python tools/import-art-pack.py` atualiza o catálogo `dist/pack-art.js`. Cada cor exige mapeamento explícito; executar o importador não deve substituir os desenhos próprios atuais. O jogo usa desse catálogo apenas corpo e capacete do explorador.
4. Consultar `asset-work/inventory.json` e `asset-work/import-manifest.json` para fontes e hashes. Novos ZIPs entram no inventário; sua integração visual exige seleção deliberada.
5. Seguir [a skill de arte procedural](skills/gemventure-procedural-art/SKILL.md). Revisar contato, silhuetas e `art-studio.html`, nos seis ambientes e no tamanho real de jogo. Conferir os dez tiers da picareta, todos os chefes, sombras, camadas animadas e distinção parede/rocha.
6. Executar `npm test` e `node export-art-studio.mjs` para atualizar o ateliê portátil.

Sem dependência de Python, Illustrator ou ZIPs no jogo publicado. As peças usam o mesmo desenho vetorial em Canvas e SVG; o cache de sprites continua limitado a 256 superfícies. Cada peça tem no máximo 30 formas e os efeitos mantêm seus limites de partículas e duração.
