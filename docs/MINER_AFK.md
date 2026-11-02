# Mineradora AFK — cascatas e progressão

Implementação: `dist/miner.js` (simulação e pagamentos), `dist/miner-view.js`
(movimento e apresentação), `dist/miner.css` (tela), `Music.mining` em
`dist/audio.js` (groove original de 120 BPM).

## Referências e adaptação

- [King: criar e combinar especiais](https://candycrush.zendesk.com/hc/en-us/articles/211939685-Creating-and-combining-Special-Candies): efeitos de linha, área e transformação que ativam outros especiais. Aqui, TNT, corte horizontal e raio propagam a quebra por células reais.
- [Peglin, página dos autores](https://gedig.itch.io/peglin): contatos e alvos especiais dão propósito à trajetória. Aqui, titânio reflete o deslocamento lateral e a câmera acompanha o percurso.
- [Peggle, EA](https://www.ea.com/games/peggle): acúmulo seguido de uma culminação reconhecível. Aqui, o combo de 50 blocos dispara o pulso.

São princípios de mecânica; não foram copiados assets, música ou código.

## Fluxo

A broca tem uma trajetória balística entre contatos autoritativos da grade.
Sua ponta chega à superfície do próximo bloco; o contato define o próximo
deslocamento lateral. Não existe um corpo de física rodando separado da
simulação, que pudesse divergir com FPS, animação, tempo offline ou recarga.
O voo é derivado do progresso do trabalho, com subida, queda e inclinação.
O titânio reflete a direção sem conceder loot. Corredores já escavados são
atravessados rapidamente; não geram recursos novamente.

O bloco comum leva 1 s no motor inicial. Rocha densa leva até 2 s e esfria
o combo. Frenesi multiplica a velocidade por quatro durante 5 s. Motor e
perfuração mantêm suas funções distintas.

Há seis especiais: TNT, corte de linha, raio de faixa, frenesi, prêmio duplo
e jazida. Uma faixa especial aparece a cada seis camadas. Os demais são
distribuídos por seed; não dependem de sorte por frame.

TNT e raios ativam os especiais atingidos, com resolução em largura e
deduplicação por célula. Laterais também podem iniciar cascatas. A jazida
transforma os blocos próximos em cristais por 8 s; o dobro dura 8 s. O
pulso é uma culminação separada, sem recursão ilimitada.

## Economia

Cascalho continua exclusivo dos upgrades da mineradora. Cristais preservam
seus quatro tipos e o foco escolhido. Passes raríssimos vão para o Zag.
Não há moedas, estrelas, XP ou avanço de missão concedidos por este modo.

Para que milhares de blocos e partículas não se tornem milhares de
cristais, a **reserva mineral** recarrega por tempo de mineração: um crédito
a cada 90 s, com estoque máximo de três créditos. Jazida, pulso e achado
raro usam um crédito para conceder o prêmio. Dobro multiplica o prêmio
real, sem exigir que o jogador olhe a tela. A barra REFINO mostra a reserva.
Cristais decorativos em uma jazida não são promessas de um cristal inteiro
por bloco: o material é refinado em lotes.

O tamanho do prêmio conserva a escala por profundidade, núcleo e melhor
andar. A maior densidade de cascalho recebeu custos próprios maiores;
os custos da Forja e das outras estruturas não foram inflados.

Auditoria de 300 seeds por perfil, uma hora, sem reinvestimento durante a
amostra (14/10/2026):

| Perfil | Cascalho/h | Cristais/h, média | P10–P90 | Pulsos/h |
|---|---:|---:|---:|---:|
| Inicial | 168.515 | 66,17 | 62–70 | 260,76 |
| Mecânica máxima, núcleo 0 | 443.738 | 72,47 | 68–77 | 695,22 |
| Núcleo 25, melhor andar 35 | 816.305 | 270,94 | 256–284 | 694,06 |
| Núcleo 100, melhor andar 150 | 2.866.778 | 2.537,57 | 2.390–2.689 | 694,39 |

São resultados de simulação, não uma promessa por jogador nem uma
certificação final de diversão. Reinvestimento muda esses valores.

Primeiros custos: motor 1.800, perfuração 2.400, autonomia 18.000,
dinamite 36.000, laterais 48.000 e núcleo 120.000 cascalhos. Custos
posteriores continuam crescentes. Investimentos e reservas antigos são
migrados; nenhuma carteira é zerada.

## Contrato para polimento de efeitos

Cada contato de `settleMiner` emite:

```text
id, step, type, from, to, kind
contact: {row, col, offsetY:-22, normal:{x:0,y:-1}}
cells: [{row,col,depth,type,kind}]
effects: [{id,row,col,depth,type,kind}]
count, combo, multiplier, pulse
gravel, crystal, crystalAmount, pass   ← valores realmente pagos
```

`MinerGame.point(row,col)` converte a posição para o canvas. Contato usa
o deslocamento até a face; fragmentos usam o centro da célula. Os eventos
visuais mantêm `batchId`, identidade do especial e cor da célula. Quebras
são distribuídas por frentes de 85 ms, até 650 ms; especiais até 700 ms;
o prêmio agregado vem no fim. O resultado já foi salvo no estado antes
de qualquer animação. Reabrir ou repetir um efeito não paga novamente.

O chat de efeitos recebeu este contrato e preparou folhas candidatas no
workspace de assets. Elas ainda não substituem os atlas atuais; precisam
de aprovação e integração próprias. A implementação usa os atlas CodeManu
já existentes e formas HEPT32 como fallback.

Limites: 16 especiais e 72 células por cascata; o pulso pode acrescentar
até 35 células. Histórico de 24 contatos, 192 recortes, janela de 13×7
blocos, fila visual de 320 itens. Na sobrecarga são protegidos contatos e
prêmios, agregando primeiro os fragmentos. Partículas: 220/32; anéis:14;
feixes:10; sprites:24/6 (normal/suave). Sem criar imagens por frame.

Efeitos suaves removem saltos/inclinação/tremor, reduzem partículas e
suprimem auras animadas. A música e os pagamentos não mudam. A trilha usa
frases de oito compassos e a percussão de contato não tem um segundo
temporizador de batidas falsas.

Ao retomar uma aba oculta, a câmera reencontra a broca antes de desenhar e
descarta os efeitos antigos: não atravessa milhares de camadas para buscar
o ponto atual. A simulação já calculou o período ausente normalmente.

## Verificação isolada

```text
node tests/ui-review-server.mjs 4194
http://127.0.0.1:4194/expedition-preview.html?miner&minerperf
```

Essa fixture grava apenas no origin de QA; nunca deve ser usada em 4173
ou 4174, onde pode existir o save do jogador. O botão ⛶ expande a mina;
TROCAR conserva a taxa 5:1 mais cinco moedas por cristal recebido.

Testes: `tests/miner.test.mjs`, `tests/miner-view.test.mjs`,
`tests/sound-design.test.mjs`. A auditoria reproduzível é `npm run audit:miner`.
O cálculo de oito horas com a mecânica máxima processou 104.626 contatos,
reteve 24 eventos e levou cerca de 937 ms nesta máquina. A primeira
medição visual teve p95 de 3,4 ms por desenho; isso não mede todos os
custos do navegador nem garante o mesmo resultado em outros aparelhos.
