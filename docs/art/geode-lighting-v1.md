# Iluminação do Rei Geodo

Atualização: a aplicação autorizada foi estendida aos sete biomas, arenas e Abismo.
Contrato atual: [iluminação por bioma](biome-lighting-v1.md). O recorte R1 abaixo
documenta a origem dos valores e do piloto aprovado.

Direção humana e aplicação autorizadas em 01/11/2026, após piloto R4 e ajuste
manual. Arena da campanha, bioma 0; demais cavernas/biomas preservam a apresentação
vigente. Névoa e luz de braseiros usam a cor do material; cada cristal emite sua
própria cor neon. O círculo do minerador acompanha a posição visual da caminhada.

Adendo humano: motes e faíscas existentes emitem luz bem fraca, ligada ao mesmo
ajuste «Brilho neon». `geode-particle-light.js` lê o sampler de motes vigente e
`fx.particles`; não emite, avança nem prolonga partículas. Máximo de 48 luzes,
raios lógicos 5/8, alfa-base .06, redução de acúmulo local e de pico de combo,
cache de até oito texturas 32×32. A máscara deixa passar só .035 da intensidade
por partícula; composição é recortada ao piso da arena. Modo suave remove motes
e reduz luz de faíscas; pausa usa os mesmos relógios já existentes.

Padrão aprovado: ambiente 103%, cristais 106%, luz do personagem 200%, alcance
do personagem 200%, alcance dos cristais 144%, escuridão 68%, camadas ativas.
Modo suave continua controlado pela preferência existente e pelo sistema.

`World` sincroniza `geode-lighting-runtime.js` depois do aquecimento da cena.
O adaptador `geode-ambience.js` é liberado antes de descartar/trocar a cena;
restaura os métodos e imagens originais e libera seus buffers. Piso, superfícies,
emissão e máscara noturna são compostos antes do CRT e da informação nítida.
Não há mudança em combate, visão, descoberta, geração ou saves de partida.

`video-preferences.js` fornece o singleton `getVideoPreferences()`, metadados
`VIDEO_CONTROLS` e `VIDEO_DEFAULTS`, operações getState/set/reset/subscribe e
estado de persistência getStatus. Valores são porcentagens inteiras limitadas;
patches são parciais, inclusive camadas. O renderer observa getRevision uma vez
por frame para evitar refazer o cache emissivo em cada evento do slider.
Persistência: chave própria `gemventure-video-v1`, esquema 1. Falha de storage
mantém o ajuste em sessão. Abertura não grava defaults nem migra o save.

O menu de vídeo pertence ao consultor de UI; contrato, faixas, critérios de QA
e reserva estão em
`E:/Genventure/coordination/geode-ambience-official-20261101-r1/UI-HANDOFF.md`.
Recibo, backup e evidências da aplicação estão nesse mesmo pacote.
