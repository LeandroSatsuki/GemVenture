# Discos com identidade própria

A Mineradora tem uma cena musical de descanso própria em `Music.mining()`:
baixo suave, marimba sintetizada e percussão curta. Não muda a coleção da vitrola
nem o relógio das expedições. Sons de impacto e coleta só tocam com o painel
visível; controle de som no painel compartilha o mute global.

As músicas são composições originais sintetizadas no navegador. Não há gravações
de terceiros incorporadas. Cada disco tem harmonia, motivo, instrumentos e
densidade próprios em `dist/music-arrangements.js`, com vozes em
`dist/music-instruments.js`. Não basta trocar a forma de onda de um arranjo comum.

| Disco | Identidade |
| --- | --- |
| Prisma Pulse | House: baixo no contratempo, acordes curtos e teclas percussivas |
| Ferro em Brasa | Rock: riff de guitarra distorcida em quintas, baixo e caixa |
| Ária do Eco | Ópera: voz sem palavras, frases longas e acompanhamento espaçado |
| Raízes Vivas | Percussão de madeira, motivos pentatônicos e sinos |
| Âmbar Groove | Funk: baixo de ataque forte, clavinet e acordes sincopados |
| Noite de Neon | Disco: baixo em oitavas, acordes e sintetizador agudo |
| Coro do Manto | Coro: vozes sustentadas e harmonia mais grave |
| Tempestade Prisma | Metal: guitarra mais saturada, riff cromático e viradas |
| Circuito Profundo | Techno: baixo acid com filtro ressonante e sequência curta |
| Horizonte Violeta | Synthwave: acordes largos, arpejos e melodia sustentada |
| Eco Digital | Vocal eletrônico: vogais sintetizadas, melodia e refrão sem palavras |
| Batida do Abismo | Drum & Bass: baixo duplo, bateria quebrada e viradas |
| Mina 8-Bit | Chiptune: ondas quadradas e arpejos curtos |
| Zag Swing | Electro swing: baixo caminhante, metais sintéticos e contratempo atrasado |
| Descida Turbo | Eurobeat: melodia em oitavas, acordes maiores e sintetizadores duplos |

Essas cinco adições são originais, inspiradas nos estilos pesquisados. Eco Digital
usa síntese de formantes com vogais e vibrato, sem letras; não é uma gravação
feita no programa VOCALOID. Nenhuma canção comercial de referência foi copiada.
Custos em essências: 120 / 210 / 95 / 155 / 235, respectivamente. Coleção, drops
raros de missão, filtros e prévia usam o mesmo sistema dos discos anteriores.
O contratempo do swing é calculado no relógio compartilhado, sem deslocar o
pulso exigido por cliques ou inimigos.

Circuito Profundo e Horizonte Violeta custam 180 e 200 essências respectivamente.
Podem aparecer nos drops raros de entrega de missão, com as probabilidades por
raridade já existentes. A seleção não é refeita para substituir um disco já
possuído: entregar a mesma missão novamente não cria outro prêmio musical.
IDs antigos, coleção, compras e disco equipado permanecem compatíveis.

## Ritmo e descanso

O relógio continua em `dist/score.js`: bioma e chefe determinam o BPM, os discos
determinam o arranjo. Há uma batida principal por ação; subdivisões são enfeites.
Todos os gêneros preservam os quatro avisos anteriores às mudanças de tempo.
Riffs e harmonias têm respostas e mudanças de frase; o combo 50 acrescenta
ênfase, viradas ou vozes conforme o gênero. Não se acelera o relógio ao trocar
o disco, nem se esconde a batida em uma pausa instrumental.

Vila, fogueira e Zag mantêm o ambiente suave existente. A prévia da vitrola dura
cinco segundos e retorna ao ambiente, sem comprar ou equipar o disco ouvido.
O laboratório musical permite ouvir todos os discos sem progresso ou recursos.

As vozes têm duração finita, são desconectadas ao terminar e têm orçamento
compartilhado com os efeitos do jogo. Curvas de distorção e ruído são reutilizados.
Não há reverberação pesada, samples enormes ou processadores por quadro.

## Referências estudadas

- [Danny Baranowsky — Crypt of the NecroDancer OST](https://dbsoundworks.bandcamp.com/album/crypt-of-the-necrodancer-ost): versões eletrônicas, guitarra e versões com canto. Referência de contraste, sem copiar composições.
- [A_Rival — catálogo oficial](https://rivalrivalrival.bandcamp.com/music): versões eletrônicas de NecroDancer.
- [Kevin MacLeod — Welcome to the Show](https://www.incompetech.com/music/royalty-free/index.html?isrc=USUAN1100013): referência de conjunto rock com guitarra, baixo e bateria.
- [Kevin MacLeod — Variation on Egmont](https://incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1100027): contraste entre textura eletrônica e tema instrumental.

## Validação desta revisão

Na expansão para quinze discos, os quinze foram renderizados em WebAudio real,
sem erros. Picos de áudio entre 0,110 e 0,214, abaixo do corte digital; máximo
observado de 18 vozes no trecho auditado. Os testes cobrem limite de vozes,
desconexão do vocal, prévia sem compra e preservação do pulso no swing.

A suíte completa passou com 354 testes. Após adicionar a variação harmônica por
bioma e mais um teste, os 31 testes de música, ritmo e discos passaram. Os dez
discos foram renderizados com WebAudio real em
`tests/music-review.html`; picos ficaram entre 0,110 e 0,156, sem corte digital,
e o trecho analisado usou no máximo 18 vozes simultâneas. Isso verifica áudio
válido e margem de volume; percepção de gênero e satisfação musical continuam
sendo avaliadas pelo jogador. Amostras de techno e rock estão na raiz do projeto.

## Revisão GV-059 — 31/10/2026

Direção humana: synthwave/chiptune 8 bits com rock leve, melodia sobre bateria
e menos fadiga por repetição. Referência de intenção enviada pelo usuário:
[Otrebil — 8 bit RETRO GAMES](https://youtu.be/qx7avPhISBo).
Metadados confirmados; análise auditiva dessa referência não executada por
indisponibilidade de créditos. O áudio do vídeo não foi incorporado.

Três discos receberam partituras originais explícitas em `dist/music-chiprock.js`:
Mina 8-Bit (pixel), Horizonte Violeta (dusk) e Ferro em Brasa (iron).
Forma: oito compassos de tema, oito de subida, oito de resposta, oito de ponte
esparsa e oito de retorno. Notas sustentadas, pausas e respostas substituem
parte da atividade contínua; guitarra e chip têm funções separadas. O tema
existe mesmo sem combo. Combo alto colore uma reprise, sem mudar o pulso.

O arranjo usa o relógio existente, incluindo rampas e avisos. O motivo tem
40 compassos; a harmonia de bioma conserva seu ciclo mais longo, portanto
o retorno do motivo não significa repetição absoluta de todas as frequências.
Outros doze discos, Home/Zag, prévia, IDs, preços e saves foram preservados.

Skills adquiridas: `music-compose` e `music-evaluate`, MIT, commit
`aa3933bc87f54a48ec018bb868bf6385b340db22` de sb-dev/music-production-skills.
Complemento mantido: `skills/gemventure-music-arrangement/`, com contrato,
linguagem de arranjo e auditoria executável. Sem dependências novas no jogo.

Prova técnica e comparação de seis WAVs nativos de 48 kHz estéreo:
`../coordination/GV-059-music-arrangement-r1/`. Ver `REPORT.md` e
`NATIVE-AUDIO-QC.json`. Renderização offline não é escuta humana nem aprovação
da identidade musical; esses pontos permanecem pendentes de avaliação do jogador.


### Imersão com headset — GV-059 r2

O pedido humano acrescentou a imersão ao usar headset. Nas três partituras,
batida, baixo, avisos e melodia principal ficam centrados. Guitarras de apoio,
arpejos e respostas usam lados complementares; pads distribuem as vozes do acorde.
O StereoPanner existente mantém essas posições por nota: sem inverter fase,
sem reverb adicional e sem alterações de notas, duração, volume ou andamento.
É distribuição estéreo de instrumentos, não localização binaural/3D de inimigos.

O render nativo de r2 e sua soma mono estão em
`../coordination/GV-059-headphones-r2/OUVIR.html`. As três somas mono preservam
mais de 99% da energia RMS estéreo; diferença L/R inferior a 0,01 dB no ciclo
medido. Esses valores confirmam compatibilidade técnica, não qualidade percebida.
Mina 8-Bit tem campo mais sutil e lead centrado; não se exige mais energia lateral
como pontuação universal de imersão. Escuta física com headset e o conjunto de SFX
permanece pendente. A skill passou a exigir essas distinções e provas.
