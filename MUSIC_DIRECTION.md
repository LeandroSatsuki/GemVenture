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
