# Terrenos · contrato de encaixe

Escolha confirmada: **uma spritesheet por material**, padronizando primeiro os
encaixes. A folha final usa **8 × 8 células de 256 px**, total de **2048 × 2048**.

Prévia local: `/terrain-studio.html`. Arquivos em
`dist/assets/terrain-kit-v1/`; o diretório identifica a coleção, e `layout.json`
registra a versão 2 do contrato. Não há alteração no renderizador do jogo ativo.

## Conteúdo da folha

| Posições, começando em zero | Conteúdo |
| --- | --- |
| 00–46 | 47 máscaras de superfície com conexões cardinais e diagonais |
| 47–50 | Faces verticais N, L, S, O; cascatas para líquidos |
| 51–54 | Terminações N, L, S, O |
| 55–58 | Escadas N, L, S, O; detalhes de fluxo para água/lava |
| 59–62 | Quatro variações interiores de piso |
| 63 | Detalhe sobreposto: espuma, crosta, folhas ou poeira |

`layout.json` contém os retângulos exatos de recorte de cada posição. Máscaras
00–46 incluem os cantos internos: uma diagonal só conecta se os dois vizinhos
cardinais também conectarem. A seleção nunca conecta materiais diferentes.
Água e lava usam suas folhas `*-template.png`, com as posições de fluxo próprias.

Os espaços auxiliares definem pontos de apoio e orientação; sua união com o
volume 3D, colisão, altura e ocultação dos personagens ainda pertence à futura
integração. O teste de bordas cobre as 47 superfícies, não certifica uma arte
gerada nem simula automaticamente uma ponte utilizável.

## Guias para usar na geração

- `guia-encaixes.png`: posições numeradas, para entender o atlas.
- `mascaras.png`: formas brancas sobre transparência; sem legenda embutida.
- `pedra-template.png`, `terra-template.png`, `grama-template.png`,
  `agua-template.png`, `lava-template.png`, `madeira-template.png`,
  `alvenaria-template.png`: estênceis por material.
- Os SVGs equivalentes preservam a geometria vetorial editável.
- `layout.json`: células, máscaras, pontos de apoio e materiais.

Os templates são **guias técnicos**, não assets finais. Branco é máscara, não a
cor do terreno. A pintura deve preservar sua cobertura, escala e posição.
Não pedir um pedestal por célula ou contorno preto entre pisos conectados.

## Perspectiva

Usar a elevação e acabamento do slime azul aprovado para os volumes. A pegada
de chão segue os eixos reais do mapa: horizontal e profundidade com leve desvio
para a direita. Não gerar um losango isométrico simétrico.

Na célula de 256 px, os pontos do chão completo são (32,120), (208,120),
(224,248), (48,248). Vetores de encaixe: U=(176,0), V=(16,128). A origem
da célula é (32,120), o centro de apoio é (128,184), e a altura de referência da
parede é 76 px. As máscaras deixam margem para a arte subir sem alterar a base.

Paredes devem parecer massas contínuas, distintas das pedras mineráveis.
Terra/grama usam barrancos; madeira usa faces de passarela; alvenaria usa muros;
água/lava usam margens e quedas. Esses papéis não mudam a ordem do atlas.

## Fluxo de produção

1. Anexar o template do material e a referência de acabamento aprovada.
2. Usar o prompt do material em `terrain-prompts/`.
3. Gerar como PNG transparente e preservar o original.
4. Conferir dimensões, alfa, cobertura de cada célula e ausência de vazamentos.
5. Testar repetições, corredores, cantos internos, ilhas e transições.
6. Só conectar ao jogo depois que a folha passar na inspeção visual e de encaixe.

Uma IA pode alterar máscaras apesar do prompt. Nesse caso, preservar o estudo
como fonte visual e ajustar a arte à geometria; não afirmar encaixe perfeito.
Os 2048 px definem a fonte de produção. O jogo poderá usar cópias menores em
cache; não deve ler, recortar ou recolorir toda a folha a cada quadro.

Água e lava recebem animação de superfície em camada separada. A margem fica
fixa. Os quatro detalhes de fluxo são lugares de produção, **não loops já
validados**. Acentos não substituem o aviso mecânico de lava perigosa.

## Validação executada

- Todos os 256 estados de vizinhos resultam em 47 máscaras únicas.
- Comparação de bordas em todos os 4096 padrões horizontais 4×3 e em todos os
  4096 padrões verticais 3×4, considerando pares conectados.
- Formas finitas, sem degeneração, dentro de suas células; 64 recortes sem sobreposição.
- Testes em `tests/terrain-kit.test.mjs`.

A primeira folha de pedra (`pedra-estudo-v1.png`) tem formato 4×6. Ela documenta
o estudo de acabamento e **não corresponde** a este contrato 8×8. Os cantos
daquela geração não foram aprovados como peças finais.

Exportação dos vetores: `node tools/export-terrain-template.mjs`.
Exportação PNG: `tools/render-terrain-template.py`, usando PyMuPDF disponível
no ambiente de produção. Essa dependência não é necessária para jogar.
