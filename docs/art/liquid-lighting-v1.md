# Líquidos emissivos

Aplicação humana autorizada em 01/11/2026: líquidos com luz neon incandescente,
água com tom mágico, lava mais quente e partículas sobre suas superfícies.

`liquid-ambience.js` lê somente os terrenos nativos água (1) e lava (3). Fóssil,
micélio, terra fofa e raízes conservam a apresentação vigente. A geometria reutiliza
traceTerrainTile/normalizeTerrainMask do kit atual; não se altera mapa ou colisão.

Água: ciano luminoso, reflexo frio e pequenas cintilações que sobem até 15 unidades
lógicas. Lava: laranja quente, pontos claros incandescentes e brasas até 23 unidades.
Corpo e reflexos ficam na superfície conectada. A luz derramada nas margens usa
piso visível e a oclusão por parede/rocha já aplicada às outras fontes.

O brilho compartilha o ajuste «Brilho neon» vigente, sem novo slider, chave de
preferência ou migração. Os valores humanos 103/106/200/200/144/68 continuam padrão.
Neon zero remove emissão e partículas extras dos líquidos. Modo suave mantém
emissão estática e retira as partículas adicionais; pausa usa ambientAge existente.

Limites adicionais por cena: até 4.096 células visíveis examinadas, seis emissores
por tipo/12 no total, duas partículas por emissor/24 no total. Um gradiente 128×128
por tipo visto, no máximo dois/128 KiB, e dois caches locais de emissão/abertura
com até 1024×1024 cada (8 MiB de teto conjunto, normalmente bem menores).
Curvas, recortes e luz difusa são preparados ao mudar descoberta, terreno ou ganho
de neon. Frames estáveis compõem dois bitmaps e as pequenas partículas; não
reconstroem o recorte complexo de cada poça. A arte-base e o HUD mantêm sua resolução.
Não há leitura de pixels por frame, timer paralelo, emissor de recompensa ou loop
persistente após descarte. A fase é ancorada à linha absoluta no Abismo.

Composição: emissão no passe de chão, abertura local na máscara escura e partículas
no passe de apresentação anterior ao CRT e à informação nítida. O piso não visível
não recebe a emissão. O véu da toca continua com a exceção clipFog aprovada.

Recibo, comparação e provas em
`E:/Genventure/coordination/liquid-ambience-official-20261101-r1/`.
