# Iluminação por bioma e Abismo

Aplicação autorizada em 01/11/2026: estender a direção do Rei Geodo aos sete
biomas, suas arenas e ao Abismo, mantendo a luz ambiental na cor do bioma.

O material ativo fornece `light` e a base das sombras. A névoa e os reflexos dos
braseiros seguem esse material; o Abismo lê seu próprio material derivado.
Os quatro tipos de cristal mantêm emissão própria. Motes e faíscas já existentes
recebem a emissão fraca aprovada no mesmo ajuste de neon.

Padrão humano preservado: ambiente 103%, neon 106%, luz do personagem 200%, alcance
do personagem 200%, alcance dos cristais 144%, escuridão 68%, três camadas ativas.
`video-preferences.js` e a chave `gemventure-video-v1` não mudaram. Nenhum novo
ajuste, chave de save, migração de partida ou preferência de movimento foi criado.

Os nomes internos `geode-ambience`/`geode-lighting-runtime` permanecem por
compatibilidade, mas o consumidor agora seleciona todas as cenas de caverna.
World passa o run ao hook existente; cenas prontas reutilizam a arte vigente.
Salas legadas sem scene recebem só apresentação, com o mesmo material do bioma.

`cave-lighting-masks.js` recorta os efeitos aditivos às células atualmente visíveis.
A descoberta continua nativa. Luz de uma fonte é recortada por piso, paredes e
rochas vivas; não redefine visão, alcance de poderes ou estado de exploração.
As máscaras têm limite de 4.096 células por viewport, 64 caminhos de fonte em cache
e 24 cristais próximos nas cavernas. Arenas preservam o plano aprovado de quatro
braseiros. Não alocar um bitmap do mapa 192×144 inteiro para a iluminação.

O Abismo invalida máscaras após rebases e mantém a fase da névoa por linha absoluta.
A troca real de bioma libera a apresentação anterior e lê o novo material.
`scene.clipFog` continua protegendo a abertura visível do ouriço contra o véu escuro.
Pausa e modo suave usam os relógios existentes; CRT, fallback e informação nítida
permanecem na ordem atual de World.

Evidências, baseline, backups e recibo:
`E:/Genventure/coordination/biome-ambience-official-20261101-r1/`.
O contrato de UI agora abrange cavernas, arenas e Abismo; o JSON/porcentagens e
o singleton de preferências permanecem compatíveis com o piloto aprovado.
