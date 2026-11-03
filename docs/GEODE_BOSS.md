# Rei Geodo · Coroa Fraturada

Novos encontros oficiais usam a revisão **TESTE 09 — crown-collision-r9**.
Hotfix de03/11/2026: abertura frontal96° (antes120°), setor traseiro108° (antes180°) acompanhando o tronco. Alcances de7casas, dano e relógio preservados. Novas arenas usam origem(12,8); saves anteriores mantêm sua origem. A descida final dos punhos ocupa0,07pulso e toca o chão no impacto, seguida de poeira discreta. Detalhes em[boss-hotfix-20261103.md](boss-hotfix-20261103.md).

Fontes congeladas preservadas em `asset-work/geode-crown-test09` e na cadeia
TESTE08/07/06/05 descrita no manifesto de integração. A autorização humana de
02/11/2026 e o recibo ficam em
`../../coordination/geode-crown-official-20261102-r1/`.

- O corpo mantém cinco casas sólidas (centro e apoios cardinais); as quatro quinas externas ficam livres. A picareta alcança a borda a duas casas do centro.
- O aviso de dois pulsos prepara a onda de quartzo. Ela avança para a frente
  em fileiras e só bloqueia passagem enquanto seus cristais estão erguidos.
- A fissura indica esquerda, direita ou frente. Três acertos do lado indicado
  quebram a coroa; a exposição dura quatro pulsos e a recuperação, dois.
- As costas repelem o jogador. Escudos protegem do dano; uma crista que nasce
  sob o jogador o desloca para uma casa livre, sem criar rochas falsas.
- Vida, recompensa e regras do TESTE09 são mantidas: 140 HP e 180 gemas.
  O fluxo atual da campanha termina ao alcançar a saída após vencer.
- Cristais da coroa emitem neon azul no quadro efetivamente desenhado. O corpo
  de pedra recebe luz ambiente suave na cor do bioma. A emissão usa recortes
  limitados dos atlas, sem criar máscaras de atlas inteiros; pausa, efeitos
  suaves e regulagens de vídeo continuam valendo.
- Clique na fissura para escolher o lado, ou caminhe até a borda e golpeie.
  A ajuda de bosses, quando ativada nas opções, acompanha o estado da coroa.
- Saves antigos em combate continuam no ataque que já estava em andamento.
  Nenhum save do jogador é modificado pela integração.

Implementação: `geode-crown.js`, `geode-collision.js`, `geode-fan.js`,
`geode-crown-art.js` e consumidores atuais em core/World/run. Testes novos:
`geode-crown-official.test.mjs`, `geode-crown-collision.test.mjs` e
`geode-crown-wave.test.mjs`. As descrições abaixo documentam a compatibilidade
legada, coberta por `geode.test.mjs`.

## Compatibilidade de saves · Cristal gigante

O chefe marca onde o jogador está. O alvo fica fixo durante três pulsos;
o contorno mostra toda a área perigosa e três pontos mostram a preparação.
Ao chegar o terceiro pulso, um cristal gigante emerge da posição marcada.

- Saiu da área: preserva vida, fôlego e combo.
- Ficou na área: dano base de 30 à vida, recuo de até três casas e penalidade
  base de 10 ao fôlego. Armadura e proteções de ritmo continuam valendo.
- Guardas e escudos bloqueiam o golpe inteiro, incluindo o recuo.
- O recuo para em paredes, rochas e criaturas, cancelando a rota anterior.
  A câmera continua seguindo suavemente, sem saltar com o cenário.
- Após o ataque, o chefe fica vulnerável por quatro pulsos. Na segunda fase
  aumenta o dano de vida; o aviso continua com três pulsos.

O cristal é um ataque temporário, não um recurso farmável. Dissipa em dois
pulsos e não causa dano contínuo. Não congela os comandos nem muda o BPM.
A animação respeita pausa e efeitos suaves; a vida do jogador e os sinais de
perigo continuam legíveis. Saves guardam marca e cristal, inclusive durante
o ataque; avisos antigos de Estilhaços continuam compatíveis.

Implementação: `dist/bosses.js`, `dist/core.js`, `dist/world.js`,
`dist/effects.js` e `dist/sound-design.js`.
Testes: `tests/geode.test.mjs`.
Prévia isolada: `/expedition-preview.html?geode=warning&freeze`,
`?geode=hit&freeze` e `?geode=dodge&freeze` no servidor de revisão.
