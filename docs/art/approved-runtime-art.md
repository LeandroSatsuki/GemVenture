# Arte aprovada em uso no jogo — 14/10/2026

Foram integrados **78 PNGs aprovados pelo usuário**:

- 28 cristais: quatro minerais em sete biomas;
- 21 rochas: três resistências em sete biomas;
- 21 criaturas: slime, morcego e geodo em sete biomas;
- sete chefes e um filhote de coelho.

Pasta ativa: `dist/assets/approved-art/`. O manifesto público está nessa
pasta; `dist/approved-art-manifest.js` fornece os mesmos dados ao renderer.
Fontes originais permanecem em `E:/assets GemVenture/output/imagegen/`.
Os PNGs foram copiados byte a byte: hashes verificam que não houve recolor,
posterização, redesenho ou remoção de partes.

## Encaixe e carregamento

`dist/approved-art.js` resolve cada tipo/variante/bioma e recorta a área de
alfa uma única vez para o cache. O ponto de apoio foi definido no manifesto
de arte, independentemente de mãos, armas, orelhas ou garras. Escala uniforme
contém a silhueta no espaço de jogo, sem esticar largura ou altura.

O carregamento é sequencial; o cache tem no máximo 80 entradas, até 256 px
por lado, ou 384 px para chefes. Seu teto geométrico atual é inferior a
23 MB de pixels RGBA, além dos outros caches do jogo e da memória do
navegador. Os originais em resolução alta permanecem disponíveis para
edição e download. Desenhar não aloca imagens, não lê pixels e não recolore.

Se um PNG não carregar ou suas dimensões divergirem, o desenho procedural
anterior serve como fallback. A chegada da coleção invalida o cache de
composição uma vez, evitando deixar o fallback gravado na cena estática.

O ponto público continua sendo `drawAsset`, em `dist/art-kit.js`; o
gerador vetorial mantém sua API e seus testes. Novas fontes não substituem
indevidamente as partes procedurais do ouriço, que não pertence a esta
entrega.

## Aplicação

As cavernas escolhem a arte por tipo, resistência, mineral e bioma. O mesmo
mapeamento cobre os encontros existentes no Abismo, sem mudar sua regra de
bioma, a geração, os limites ou a progressão.

As sombras das criaturas ficam no chão, separadas do voo. O renderer mantém
os movimentos que já existiam: flutuação dos morcegos, respiração/squash
leve, afundar/emergir da toupeira, transparência do Soberano e atordoamento
dos filhotes. São transformações de PNGs estáticos; não são novos ciclos
desenhados de articulações ou asas.

Coelho, filhotes e toupeira já têm uma toca desenhada no PNG. Os aros
antigos não são repetidos sob a imagem carregada. A cenoura da pose do
Barão também não recebe uma segunda arma de placeholder; os avisos
direcionais e o impacto de ataque continuam ativos. Nome e vida dos
chefes acompanham o topo real da silhueta, inclusive no salto da toupeira.

A Mineradora AFK reutiliza as rochas e cristais aprovados: esses materiais
agora são os próprios objetos, sem um quadrado colorido de fundo. TNT e
outros especiais conservam sua apresentação atual até a entrega própria
de arte/efeitos. Física, drops e pagamentos não foram alterados aqui.

Vila, Forja, paredes e os kits de efeitos aprovados foram preservados nesta
integração. A revisão da vila pertence ao chat de UI. A iluminação pulsante
das lamparinas e os novos VFX continuam em entregas separadas; aprovação
de uma prévia não significa que ela já foi integrada nesta etapa.

## Referências e exportação

O catálogo `/asset-catalog.html` aponta aos PNGs ativos e marca essas peças
como **APROVADO · EM USO**. O ateliê `/art-studio.html` usa a arte aprovada
na galeria e na cena; o botão de original entrega o PNG, não o antigo SVG
procedural. O ateliê portátil foi regenerado com imagens embutidas. Seu
arquivo tem aproximadamente 99 MB, porque inclui os originais completos;
essa dimensão não é a do cache de desenho do jogo.

Fluxo reproduzível:

```text
python tools/inspect-approved-alpha.py
node tools/import-approved-art.mjs
node tools/export-asset-catalog.mjs
node export-art-studio.mjs
```

A auditoria local de alfa/hash é exigida pelo importador. O nome histórico
`boss-rei-das-toupeiras-01-previa.png` não representa um fundo opaco: os
pixels RGB ocultos eram a causa da confusão. A leitura independente e a
composição sobre fundos claro e escuro confirmaram o alfa real do original.
Evidências: `approved-alpha-audit.json` e `approved-mole-alpha-check.png`.

## Validação

- 78 hashes, tamanhos e alfas originais conferidos;
- testes de mapeamento completo, proporção, âncoras, cache limitado,
  ausência de alocações durante desenho e fallback para arquivo inválido;
- suíte completa: **426 testes passaram**;
- verificação de projeto: 145 scripts e 965 referências locais, sem erro;
- revisão própria no renderer real com HUD, além da revisão técnica
  independente do chat de arte, com 78/78 carregados e zero erros de
  imagem/JavaScript nas cenas revistas.

Capturas próprias: `approved-game-forest.jpg` e `approved-game-rabbit.jpg`.
A prévia de arte pode revelar o mapa, identificando isso como QA; não
altera o jogo nem o save do jogador.

QA isolado:

```text
http://127.0.0.1:4194/expedition-preview.html?approved=0&freeze
http://127.0.0.1:4194/expedition-preview.html?approved=6&boss&freeze
```

Índices 0–6 selecionam os sete biomas; `boss` abre a arena; `reveal` remove
apenas a névoa na fixture. Nunca executar essas fixtures nas portas
4173/4174, que podem conter o save real. A conferência técnica não substitui
a avaliação artística do usuário sobre a composição final.
