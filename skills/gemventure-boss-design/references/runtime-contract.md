# Contrato e mapa do runtime — baseline de 31/10/2026

Checkout inspecionado: `E:/Genventure/gemventure`. Revalidar antes de implementar.
Não importar o contrato antigo de uma cópia congelada para sobrescrever este jogo.

## Campanha e lutas vigentes

`dist/campaign.js`: sete biomas, cinco andares por bioma, 35 andares.
`dist/core.js`, `BIOMES`, é a lista de nomes dos biomas nesta baseline.

| Índice | Andar | Boss | Bioma | BPM-base da luta | Mecânica verificada no código |
|---|---:|---|---|---:|---|
| 0 | 5 | Rei Geodo | Grutas de Cristal | 92 | Cristal no alvo, empurrão, pilares temporários; cada terceiro ciclo usa pulso sem dano de vida. |
| 1 | 10 | Matriarca Raiz | Floresta Esquecida | 100 | Cruz de perigo passando pela posição marcada do jogador. |
| 2 | 15 | Titã Fóssil | Galeria dos Fósseis | 108 | Alternância de metade esquerda/direita da sala. |
| 3 | 20 | Boss Místico | Coração do Manto | 116 | Selo seguro alternado com linhas/runas perigosas. O nome e tema atuais pedem discussão, não troca automática. |
| 4 | 25 | Soberano Micelial | Gruta dos Micélios | 104 | Corpo intangível, espiral e quatro núcleos invocados; destruir núcleo transfere dano ao boss. |
| 5 | 30 | Rei das Tocas | Tocas de Âmbar | 108 | Enterra, marca posição e emerge; alterna explosão/anel na segunda fase. |
| 6 | 35 | Barão Cenoura | Hortas Subterrâneas | 112 | Novos bosses usam rabbitMechanic=2: atrair cenoura para filhote, atordoar três, motim e janela de ataque. Há caminho legado diferente. |

Inspeção em memória de seed 41001: salas 21×15, interior de 19×13 = 247
células de piso. A sala do micélio tinha cinco inimigos (boss + núcleos); a do
coelho tinha quatro (boss + filhotes). Isso não é um playtest de diversão.

## Responsabilidades

| Arquivo/função | Papel real | Cuidado para uma revisão |
|---|---|---|
| `dist/bosses.js`: `createBoss`, `planBossAttack`, `bossStep`, `finishBossAttack`, `bossDamage` | Estado, padrão, fases, recuperação, vulnerabilidade e limite de dano por pulso | Há condições por boss e versões legadas; não trocar todo o módulo para um piloto. |
| `dist/rabbit-mechanic.js` | Mecânica v2, alvo fixado, filhote atingido, motim, eventos e validação | Preservar o comportamento atual em vez de sugeri-lo como novidade. |
| `dist/core.js`: `generateRoom`, `act`, `enemyBeat`, resoluções de ataques, `damageTarget` | Geração real, inputs, navegação, execução e dano | Uma extensão de alvo/colisão também precisa ser reconhecida pelos consumidores e pelo save. |
| `dist/score.js` e `dist/training-clock.js` | Relógio musical e relógio de treino | Usar a mesma fase e transformação do áudio/input; não inferir ritmo pela animação. |
| `dist/cave-layout.js`: `createLayout`, `isFloor` | Máscara de piso e arena lógica | O ramo boss abre o interior retangular; a sala não é um modelo 3D com colisão implícita. |
| `dist/boss-arena.js`: `buildBossArena`, `paintBossArena` | Lajes e volumes temáticos decorativos | Declara massas fora da navegação; não cria obstáculos funcionais. |
| `dist/world.js` | Seleciona o desenho efetivamente usado e a oclusão | Geodo, toupeira e coelho têm caminhos específicos; não editar só um fallback. |
| `dist/dungeon-boss-motion.js`, `dist/dungeon-bosses-v2.js` | Procedural e fallback de recortes rígidos | Canvas/volumes projetados e atlas/rasters convivem; não presumir rig 3D completo. |

Para o Geodo, seguir também os imports de `geode-presentation`/arte em `world.js`.
Para o coelho, seguir a apresentação e os eventos atuais. Registrar o que realmente
foi desenhado; um arquivo `boss-b*.png` pode ser histórico ou fallback.

## Comandos e tempo

- `core.act`: rejeita uma segunda ação na mesma batida, usando `acted`/`missed`.
- O acerto temporal usa `runBeatTime` e `actionWindowMs`, não tempo de vídeo.
- `movement`: base de quatro células por ação, sujeita a caminho/obstáculos.
  Upgrades alteram isso; validar com a base e com o extremo de mobilidade.
- Um ataque selecionado pode aproximar automaticamente até célula adjacente.
  O lado final de aproximação é escolhido pelo caminho atual. Uma mecânica de
  flanco terá de preservar o lado escolhido e não confiar só no clique no boss.
- Não há contrato genérico de aparar/devolver projétil verificado nesta auditoria.
  Qualquer proposta assim deve declarar alvo, regra de contato e implementação nova.
- O dano dos bosses tem teto por pulso (`ceil(maxHp/12)`) e exceções; a vulnerabilidade
  deve ser testada também com pets, DoT, explosões e procs para evitar bypass/softlock.
- Restauro valida estados específicos. Adicionar fase, parte quebrável ou janela
  exige esquema/validação e comportamento para saves anteriores, quando aplicável.

## Validação de integração futura

Consultar testes existentes de bosses, Geodo, coelho, campanha, input, save e
apresentação. Verificar limites inclusive nas batidas imediatamente antes/depois do
impacto; input antecipado/tardio não pode resolver duas vezes. Pausa, retorno da
aba, morte e término da sala não podem deixar efeito/colisão órfãos.

Baseline reproduzível desta inspeção: `outputs/boss-evolution-v1/baseline.json`
no workspace Diorama, com dez hashes e sete encontros. O script de auditoria está
em `work/boss-evolution-v1/inspect-baseline.mjs`, usa o código real em memória e
não lê nem escreve o save do jogador. Não é um gerador alternativo do combate.
