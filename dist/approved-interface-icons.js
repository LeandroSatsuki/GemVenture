import {APPROVED_CARD_RASTERS} from './card-art-registry.js';
// GV-019 interface extension. Approved artwork 1.0.2 / style 1.1.2.
// No global glyph override, gameplay imports, recolor, stylesheet or CRT layer.
export const APPROVED_INTERFACE_COVERAGE=Object.freeze(Object.fromEntries(Object.entries({
  "astral/first-light": {
    "source": "icones/guard",
    "status": "mapped",
    "reason": "Proteção inicial; escudo geral aprovado.",
    "representation": "monochrome-currentColor"
  },
  "astral/provisions": {
    "source": "icones/tonic",
    "status": "mapped",
    "reason": "Suprimento de curas; poção aprovada.",
    "representation": "monochrome-currentColor"
  },
  "astral/powder": {
    "source": "icones/blast",
    "status": "mapped",
    "reason": "Suprimento de bombas.",
    "representation": "monochrome-currentColor"
  },
  "astral/echo-ward": {
    "source": "icones/ward",
    "status": "mapped",
    "reason": "Suprimento de escudos temporários.",
    "representation": "monochrome-currentColor"
  },
  "astral/compass": {
    "source": "icones/sight",
    "status": "mapped",
    "reason": "Campo de visão.",
    "representation": "monochrome-currentColor"
  },
  "astral/anchor": {
    "source": "habilidades/caravan",
    "status": "mapped",
    "reason": "Mesmo efeito de retenção de recursos na derrota; comparado com Carga protegida.",
    "representation": "monochrome-currentColor"
  },
  "astral/rare-heart": {
    "source": "icones/gem",
    "status": "mapped",
    "reason": "Saque mineral; condição de veio raro permanece no texto.",
    "representation": "monochrome-currentColor"
  },
  "astral/homeland": {
    "source": "icones/gem",
    "status": "mapped",
    "reason": "Quantidade de cristal; qualificador de bioma permanece no texto.",
    "representation": "monochrome-currentColor"
  },
  "astral/scholar": {
    "source": null,
    "status": "gap",
    "reason": "Não existe glifo aprovado de XP/experiência. ear comunica ritmo, não experiência.",
    "representation": "monochrome-currentColor"
  },
  "astral/second-air": {
    "source": "icones/breath",
    "status": "mapped",
    "reason": "Proteção do fôlego.",
    "representation": "monochrome-currentColor"
  },
  "astral/precision": {
    "source": "icones/fury",
    "status": "mapped",
    "reason": "Crítico aprovado; não usar a picareta utilitária force.",
    "representation": "monochrome-currentColor"
  },
  "astral/fracture": {
    "source": "icones/fury",
    "status": "mapped",
    "reason": "Dano crítico usa a mesma família crítica; texto distingue dano de chance.",
    "representation": "monochrome-currentColor"
  },
  "astral/embers": {
    "source": null,
    "status": "gap",
    "reason": "Sem glifo monocromático de queimadura. cartas/ember é ilustração colorida aprovada, alternativa que exige decisão de representação da UI.",
    "representation": "monochrome-currentColor"
  },
  "astral/resonator": {
    "source": "icones/chain",
    "status": "mapped",
    "reason": "Explosão aprovada; não raio elétrico.",
    "representation": "monochrome-currentColor"
  },
  "astral/giant-slayer": {
    "source": "habilidades/bossbane",
    "status": "mapped",
    "reason": "Mesmo bônus de dano contra chefes da habilidade Quebra-titãs.",
    "representation": "monochrome-currentColor"
  },
  "astral/defiance": {
    "source": "icones/force",
    "status": "mapped",
    "reason": "Poder do golpe; picareta utilitária. Condição de vida baixa permanece no texto.",
    "representation": "monochrome-currentColor"
  },
  "astral/last-wall": {
    "source": "icones/guard",
    "status": "mapped",
    "reason": "Defesa; condição de vida baixa no texto.",
    "representation": "monochrome-currentColor"
  },
  "astral/spring": {
    "source": "icones/tonic",
    "status": "mapped",
    "reason": "Cura de poções.",
    "representation": "monochrome-currentColor"
  },
  "astral/mercy": {
    "source": "icones/heart",
    "status": "mapped",
    "reason": "Vida recuperada; gatilho de criatura derrotada permanece no texto.",
    "representation": "monochrome-currentColor"
  },
  "astral/metronome": {
    "source": "icones/breath",
    "status": "mapped",
    "reason": "Fôlego por acerto; não confundir o nome Metronomo com janela de ritmo.",
    "representation": "monochrome-currentColor"
  },
  "astral/long-ward": {
    "source": "icones/ward",
    "status": "mapped",
    "reason": "Duração do escudo temporário.",
    "representation": "monochrome-currentColor"
  },
  "astral/titan-cache": {
    "source": "icones/blast",
    "status": "mapped",
    "reason": "Recompensa de bomba; gatilho de chefe no texto.",
    "representation": "monochrome-currentColor"
  },
  "astral/boss-spring": {
    "source": "habilidades/renewal",
    "status": "mapped",
    "reason": "Mesmo gatilho de cura após chefe de Vitória vital; valores ficam no texto.",
    "representation": "monochrome-currentColor"
  },
  "astral/rescue-kit": {
    "source": "icones/tonic",
    "status": "mapped",
    "reason": "Recompensa de cura; gatilho de resgate no texto.",
    "representation": "monochrome-currentColor"
  },
  "astral/deep-spark": {
    "source": "icones/force",
    "status": "mapped",
    "reason": "Poder geral do golpe; contexto Abismo no texto. Não usar o crítico habilidades/force.",
    "representation": "monochrome-currentColor"
  },
  "astral/rare-ward": {
    "source": "icones/ward",
    "status": "mapped",
    "reason": "Concessão de escudo; condição de veio no texto.",
    "representation": "monochrome-currentColor"
  },
  "astral/flow-shield": {
    "source": "icones/guard",
    "status": "mapped",
    "reason": "Proteção; limiar de combo no texto.",
    "representation": "monochrome-currentColor"
  },
  "astral/seeker": {
    "source": "icones/gem",
    "status": "mapped",
    "reason": "Cristais de recompensa; condição de desafio no texto.",
    "representation": "monochrome-currentColor"
  },
  "astral/lifeline": {
    "source": "icones/backpack",
    "status": "mapped",
    "reason": "Família de suprimentos (cura e escudo iniciais), sem sugerir ressurreição.",
    "representation": "monochrome-currentColor"
  },
  "astral/conductor": {
    "source": "icones/ear",
    "status": "mapped",
    "reason": "Janela de ritmo; nota aprovada.",
    "representation": "monochrome-currentColor"
  },
  "founder/aurora": {
    "source": "icones/guard",
    "status": "mapped",
    "reason": "Escudo inicial.",
    "representation": "monochrome-currentColor"
  },
  "founder/phoenix": {
    "source": "icones/revive",
    "status": "mapped",
    "reason": "Ressurreição; seta de retorno e vida.",
    "representation": "monochrome-currentColor"
  },
  "founder/echo": {
    "source": null,
    "status": "gap",
    "reason": "Carta aleatória inicial não tem símbolo genérico aprovado. echo é ricochete mineral; habilidades/questluck é contrato raro, não uma carta de efeito aleatória.",
    "representation": "monochrome-currentColor"
  },
  "mission/miner": {
    "source": "icones/gem",
    "status": "mapped",
    "reason": "Extração de cristais, família mineral.",
    "representation": "monochrome-currentColor"
  },
  "mission/quartz": {
    "source": "icones/gem",
    "status": "mapped",
    "reason": "Extração de quartzos; espécie no texto.",
    "representation": "monochrome-currentColor"
  },
  "mission/prism": {
    "source": "icones/gem",
    "status": "mapped",
    "reason": "Extração de rubis, não sorte.",
    "representation": "monochrome-currentColor"
  },
  "mission/geode": {
    "source": "icones/gem",
    "status": "mapped",
    "reason": "Extração de topázios; não é efeito de fratura.",
    "representation": "monochrome-currentColor"
  },
  "mission/vital": {
    "source": "icones/gem",
    "status": "mapped",
    "reason": "Extração de esmeraldas; objetivo não é curar.",
    "representation": "monochrome-currentColor"
  },
  "mission/rocks": {
    "source": "icones/force",
    "status": "mapped",
    "reason": "Mineração de rocha; picareta utilitária.",
    "representation": "monochrome-currentColor"
  },
  "mission/brute": {
    "source": "icones/force",
    "status": "mapped",
    "reason": "Mineração de rocha bruta; não é atordoamento.",
    "representation": "monochrome-currentColor"
  },
  "mission/hunter": {
    "source": "icones/hunter",
    "status": "mapped",
    "reason": "Derrotar criaturas; alvo de caça.",
    "representation": "monochrome-currentColor"
  },
  "mission/slime": {
    "source": "icones/hunter",
    "status": "mapped",
    "reason": "Derrotar gosmas; não é poção.",
    "representation": "monochrome-currentColor"
  },
  "mission/bats": {
    "source": "icones/hunter",
    "status": "mapped",
    "reason": "Derrotar morcegos; não é escudo.",
    "representation": "monochrome-currentColor"
  },
  "mission/guardians": {
    "source": "icones/hunter",
    "status": "mapped",
    "reason": "Derrotar guardiões; não é bomba.",
    "representation": "monochrome-currentColor"
  },
  "mission/beats": {
    "source": "icones/ear",
    "status": "mapped",
    "reason": "Acertar ritmo.",
    "representation": "monochrome-currentColor"
  },
  "mission/combo": {
    "source": "icones/flow",
    "status": "mapped",
    "reason": "Sequência contínua; meta numérica permanece no texto.",
    "representation": "monochrome-currentColor"
  },
  "mission/points": {
    "source": null,
    "status": "gap",
    "reason": "Não há glifo aprovado de pontuação; fortune é sorte, não pontos.",
    "representation": "monochrome-currentColor"
  },
  "mission/floors": {
    "source": "icones/lift",
    "status": "mapped",
    "reason": "Concluir andares; elevador.",
    "representation": "monochrome-currentColor"
  },
  "mission/items": {
    "source": "icones/backpack",
    "status": "mapped",
    "reason": "Uso de suprimentos; empty significa espaço vazio.",
    "representation": "monochrome-currentColor"
  },
  "mission/bombs": {
    "source": "icones/blast",
    "status": "mapped",
    "reason": "Usar bombas.",
    "representation": "monochrome-currentColor"
  },
  "mission/cures": {
    "source": "icones/tonic",
    "status": "mapped",
    "reason": "Usar cura de vida. Nome Fôlego de sobra não muda a mecânica real.",
    "representation": "monochrome-currentColor"
  },
  "mission/depth4": {
    "source": "icones/lift",
    "status": "mapped",
    "reason": "Alcançar andar.",
    "representation": "monochrome-currentColor"
  },
  "mission/depth8": {
    "source": "icones/lift",
    "status": "mapped",
    "reason": "Alcançar andar; árvore não representa profundidade.",
    "representation": "monochrome-currentColor"
  },
  "gear/helmet": {
    "source": "icones/helmet",
    "status": "mapped",
    "reason": "Glifo de slot aprovado; não usar ilustração de habilidade.",
    "representation": "monochrome-currentColor"
  },
  "gear/chest": {
    "source": "icones/chest",
    "status": "mapped",
    "reason": "Glifo de slot aprovado; não usar ilustração de habilidade.",
    "representation": "monochrome-currentColor"
  },
  "gear/pants": {
    "source": "icones/pants",
    "status": "mapped",
    "reason": "Glifo de slot aprovado; não usar ilustração de habilidade.",
    "representation": "monochrome-currentColor"
  },
  "gear/boots": {
    "source": "icones/boots",
    "status": "mapped",
    "reason": "Glifo de slot aprovado; não usar ilustração de habilidade.",
    "representation": "monochrome-currentColor"
  },
  "gear/necklace": {
    "source": "icones/necklace",
    "status": "mapped",
    "reason": "Glifo de slot aprovado; não usar ilustração de habilidade.",
    "representation": "monochrome-currentColor"
  },
  "gear/ring": {
    "source": "icones/ring",
    "status": "mapped",
    "reason": "Glifo de slot aprovado; não usar ilustração de habilidade.",
    "representation": "monochrome-currentColor"
  },
  "gear/backpack": {
    "source": "icones/backpack",
    "status": "mapped",
    "reason": "Glifo de slot aprovado; não usar ilustração de habilidade.",
    "representation": "monochrome-currentColor"
  },
  "gear/pickaxe": {
    "source": "icones/pickaxe",
    "status": "mapped",
    "reason": "Glifo de slot aprovado; não usar ilustração de habilidade.",
    "representation": "monochrome-currentColor"
  },
  "item/blast": {
    "source": "icones/blast",
    "status": "mapped",
    "reason": "Consumível real por ID; poção e escudo aprovados substituem miniaturas procedurais.",
    "representation": "monochrome-currentColor"
  },
  "item/tonic": {
    "source": "icones/tonic",
    "status": "mapped",
    "reason": "Consumível real por ID; poção e escudo aprovados substituem miniaturas procedurais.",
    "representation": "monochrome-currentColor"
  },
  "item/ward": {
    "source": "icones/ward",
    "status": "mapped",
    "reason": "Consumível real por ID; poção e escudo aprovados substituem miniaturas procedurais.",
    "representation": "monochrome-currentColor"
  },
  "building/forge": {
    "source": "icones/forge",
    "status": "mapped",
    "reason": "Preservar o sinal de família já usado; trocar somente a fonte pelo glifo aprovado.",
    "representation": "monochrome-currentColor"
  },
  "building/well": {
    "source": "icones/fortune",
    "status": "mapped",
    "reason": "Preservar o sinal de família já usado; trocar somente a fonte pelo glifo aprovado.",
    "representation": "monochrome-currentColor"
  },
  "building/missions": {
    "source": "icones/hunter",
    "status": "mapped",
    "reason": "Preservar o sinal de família já usado; trocar somente a fonte pelo glifo aprovado.",
    "representation": "monochrome-currentColor"
  },
  "forge-feedback/pickaxe": {
    "source": "icones/force",
    "status": "mapped",
    "reason": "Contexto de projeto, não ID de habilidade.",
    "representation": "monochrome-currentColor"
  },
  "forge-feedback/vigor": {
    "source": "icones/heart",
    "status": "mapped",
    "reason": "Contexto de projeto, não ID de habilidade.",
    "representation": "monochrome-currentColor"
  },
  "forge-feedback/anvil": {
    "source": "icones/forge",
    "status": "mapped",
    "reason": "Contexto de projeto, não ID de habilidade.",
    "representation": "monochrome-currentColor"
  },
  "forge-feedback/armor": {
    "source": "icones/chest",
    "status": "mapped",
    "reason": "Contexto de projeto, não ID de habilidade.",
    "representation": "monochrome-currentColor"
  },
  "forge-feedback/tonic": {
    "source": "icones/tonic",
    "status": "mapped",
    "reason": "Contexto de projeto, não ID de habilidade.",
    "representation": "monochrome-currentColor"
  },
  "forge-feedback/vault": {
    "source": "icones/vault",
    "status": "mapped",
    "reason": "Contexto de projeto, não ID de habilidade.",
    "representation": "monochrome-currentColor"
  },
  "card/muscle": {
    "source": "assets/card-art/muscle-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/lucky": {
    "source": "assets/card-art/lucky-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/popcorn": {
    "source": "assets/card-art/popcorn-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/ricochet": {
    "source": "assets/card-art/ricochet-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/pockets": {
    "source": "assets/card-art/pockets-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/candy": {
    "source": "assets/card-art/candy-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/ember": {
    "source": "assets/card-art/ember-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/ice": {
    "source": "assets/card-art/ice-approved-v02.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/vampire": {
    "source": "assets/card-art/vampire-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/skates": {
    "source": "assets/card-art/skates-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/elastic": {
    "source": "assets/card-art/elastic-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/secondwind": {
    "source": "assets/card-art/secondwind-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/shell": {
    "source": "assets/card-art/shell-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/laser": {
    "source": "assets/card-art/laser-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/echohit": {
    "source": "assets/card-art/echohit-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/greed": {
    "source": "assets/card-art/greed-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/bombgift": {
    "source": "assets/card-art/bombgift-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/battery": {
    "source": "assets/card-art/battery-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/sprouts": {
    "source": "assets/card-art/sprouts-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/revival": {
    "source": "assets/card-art/revival-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/lantern": {
    "source": "assets/card-art/lantern-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/abyss-heal": {
    "source": "assets/card-art/abyss-heal-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/abyss-breath": {
    "source": "assets/card-art/abyss-breath-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "card/abyss-ward": {
    "source": "assets/card-art/abyss-ward-approved-v01.png",
    "status": "mapped",
    "reason": "Ilustração de efeito aprovada por ID da carta; preservar cores e separar moldura/valores.",
    "representation": "colored-effect-illustration"
  },
  "die/1": {
    "source": "zag/die-1",
    "status": "mapped",
    "reason": "Face aprovada exata; contagem de pontos preservada.",
    "representation": "colored-die"
  },
  "die/2": {
    "source": "zag/die-2",
    "status": "mapped",
    "reason": "Face aprovada exata; contagem de pontos preservada.",
    "representation": "colored-die"
  },
  "die/3": {
    "source": "zag/die-3",
    "status": "mapped",
    "reason": "Face aprovada exata; contagem de pontos preservada.",
    "representation": "colored-die"
  },
  "die/4": {
    "source": "zag/die-4",
    "status": "mapped",
    "reason": "Face aprovada exata; contagem de pontos preservada.",
    "representation": "colored-die"
  },
  "die/5": {
    "source": "zag/die-5",
    "status": "mapped",
    "reason": "Face aprovada exata; contagem de pontos preservada.",
    "representation": "colored-die"
  },
  "die/6": {
    "source": "zag/die-6",
    "status": "mapped",
    "reason": "Face aprovada exata; contagem de pontos preservada.",
    "representation": "colored-die"
  },
  "boost/giant": {
    "source": "icones/force",
    "status": "mapped",
    "reason": "Golpe/picareta ampliado.",
    "representation": "monochrome-currentColor"
  },
  "boost/lightning": {
    "source": "habilidades/thunder",
    "status": "mapped",
    "reason": "Raio em linha; chain aprovado significa explosão.",
    "representation": "monochrome-currentColor"
  },
  "boost/fire": {
    "source": null,
    "status": "gap",
    "reason": "dash é deslocamento. Sem glifo de chama; cartas/ember é alternativa colorida sujeita à decisão de UI.",
    "representation": "monochrome-currentColor"
  },
  "boost/magnet": {
    "source": "icones/magnet",
    "status": "mapped",
    "reason": "Atração de recursos.",
    "representation": "monochrome-currentColor"
  },
  "boost/shield": {
    "source": "icones/guard",
    "status": "mapped",
    "reason": "Proteção.",
    "representation": "monochrome-currentColor"
  },
  "boost/wings": {
    "source": "icones/wings",
    "status": "mapped",
    "reason": "Voo.",
    "representation": "monochrome-currentColor"
  }
}).map(([key,row])=>[key,Object.freeze(row)])));
export const APPROVED_INTERFACE_SOURCE_HASHES=Object.freeze({
  "assets/card-art/muscle-approved-v01.png": "5cc4e0239e9d0c07e7e8af0d25aca05c9e5f494d31e7167fcc028c86a47070b8",
  "assets/card-art/lucky-approved-v01.png": "2411d8a2f2dfd1ab00381a87d3b5bec363ddf67a5c0cfa52f49edee1fe38f80e",
  "assets/card-art/popcorn-approved-v01.png": "56e5da564bb58d6de2e16148f67770b713fde6d29108a6ed86b4f3d0be1d6d6f",
  "assets/card-art/ricochet-approved-v01.png": "cbd267a220242dc938acab786587fcf0c92484e4998a42a82c72354ae34706d3",
  "assets/card-art/pockets-approved-v01.png": "161f644c484eb453e488f1ab5ace7e6d9e6847cd9b69043904d89973a16af7fd",
  "assets/card-art/candy-approved-v01.png": "eafd8277dc09d0b5982f96c96f5df148c2ef2ff5937807a62174c7e7afb3dda8",
  "assets/card-art/ember-approved-v01.png": "a9a3a24371d0223ef87c674db6e7022b9714467d229d6f1afaae1f03d6091681",
  "assets/card-art/ice-approved-v02.png": "77c15c774396369a537812dfa2e829bab402face7a0e58271db7b5ead6fb4ef4",
  "assets/card-art/vampire-approved-v01.png": "09cd76e7658bfcc5888423781789d8937c6619b755697479ca2293eece3e322e",
  "assets/card-art/skates-approved-v01.png": "40c0e449323db34ad7e05bd06dc9ff0c3d0cac52bb3123aaed5954338d5ce787",
  "assets/card-art/elastic-approved-v01.png": "3e8d6039280d6ff193263962355d2fdc059ef32de51c9b86853a477ba31c7c2c",
  "assets/card-art/secondwind-approved-v01.png": "1e948965d267efb9e0b4f492d5e57773fb75de9a4968b213156902a2c69685c0",
  "assets/card-art/shell-approved-v01.png": "c9c97449c5755cea02170bbfee23d2b4aa3bccb3953f11943f40659eb2043ac7",
  "assets/card-art/laser-approved-v01.png": "770312ac8018998917b51b188905d5d78c18886e8f54d6edf0ab4aace5fea1ba",
  "assets/card-art/echohit-approved-v01.png": "670faba12c82bee68d8a5202044af7f3ab26f3b3bc42c797f1d5159cc7266f81",
  "assets/card-art/greed-approved-v01.png": "4f8a7d38eccecd95f434435d86f17437d2d9ab74de19e5b36ea93dd9693a5138",
  "assets/card-art/bombgift-approved-v01.png": "4002df872a6e2ea8a25695762c1cd5008c2ed3074ac15ef52a8a2a5975dc89c6",
  "assets/card-art/battery-approved-v01.png": "fb9c6e0fc7b448c8e5f0e5bc50e7d8bd99afa1cc507e913c4589c7bcdf0b07a3",
  "assets/card-art/sprouts-approved-v01.png": "d8aa6749f72eb4891586460e93881ae861d759d09b86e8538b0ade627048925d",
  "assets/card-art/revival-approved-v01.png": "9086c0dd28e42d3afe38bd91b5612a6023278481f266e9b7f56ad2e0b64a44ef",
  "assets/card-art/lantern-approved-v01.png": "c6f3e718544a10fe0beebaea5fd6f652e8cfb875700cab0da7b6c44e71363dbb",
  "assets/card-art/abyss-heal-approved-v01.png": "37ca1fb9e13fff7ec1ffd0facb18c6dc4cdb0a7abc939255099af8c30b039855",
  "assets/card-art/abyss-breath-approved-v01.png": "7a158b2cb563c60736a114b180db90a0ed394d30adf4c264ed89f807e51f76ce",
  "assets/card-art/abyss-ward-approved-v01.png": "2bccf827e85a2bb97db7a0e543e9f9cd2962c87c6dee14e3f733d7f24aa5537e",
  "habilidades/bossbane": "43c43141f1402fabd9e91d616f904bbb7d716bf0d3a7e4dee358bc59410fced0",
  "habilidades/caravan": "01a3d0a80340f02f905980ad971f05f204a993daefa1b8242774952ff50258c0",
  "habilidades/renewal": "2771f255e815ab8c07cdbd16d200b61de6bf8f795ec03f38aed4b1065ee9f35b",
  "habilidades/thunder": "6baa04053a44cd270b677df8d38735b3658ea3acfe043f2d5810632aa7871382",
  "icones/backpack": "12d2c1801cb5ad84dc30b69cade671bc70286b51faac6e3eaed756e101bc268a",
  "icones/blast": "e663bd287eaa85d955e43f8569672f5ce0a58c98e317079227f06b9d3137742e",
  "icones/boots": "a2d808ef13bc211c8b95de358d32d8b3f96dca6966bf1d53ba3d093bd9edb45e",
  "icones/breath": "49202aa0f4d44bce20857bd1ba0e10f9b9ef3453e0f4229b99dd071f285c2a50",
  "icones/chain": "5feef27369cad793b05fe17df903cd878b4496a2a1cb69463abc30a118ca5310",
  "icones/chest": "f808688c94dce332c16c7950bbe38285d9fcc74d494a5c06179cb31634eaf488",
  "icones/dash": "8a21e07daabacb8814138e0f3021896e64b48bfd2e2a33c295656a296d1fd307",
  "icones/ear": "8a6e1fcbff2aa0404afab56d722f5e1507f0ade786e175352678110cb3cbc451",
  "icones/echo": "82b3d90b188db7706369bfd941a3aa8ddc644ea773d88f702699d507d93662fa",
  "icones/empty": "ae7e1f6ade715b3912d33474030e50d1d89088f7ff47d4467b1959f16e7e764d",
  "icones/flow": "1c6bae0ac0ca6fbba4476d349d1a7c158fbc3090ba82a5d382f5c5f38bf801ab",
  "icones/force": "0bc4b6bdcb31c97143420c458be5300c34fc47fbb427d3de1665463feae3c2e1",
  "icones/forge": "1488ecfbc578b9124e423172a11dd2ad005663442f3e83c17b72ff47c1637b9b",
  "icones/fortune": "684ec8d216a3d9bc53f7c2d8766f60158cba818403d89d3d4dc08e1b5cf87637",
  "icones/fury": "9e2d8db11e5446de2dfec33dcd5550ed647c171d6e307cc4c9a6567ea0f21644",
  "icones/gem": "4f37577dbaa310afc1ed0ded11f3782a7119dcfb883c500c33a2f990d4f8ebc0",
  "icones/guard": "ac0ae8e07ee4a0d13d354104c1c7b32f1435e1e4c9a50b805d5207bf45427afa",
  "icones/harvest": "b923ba55c9ec548711766a665751b95824419a3081854d4e968542550e5e2981",
  "icones/heart": "58cff751413c0e9e1c4256b166227491c8a5d9ef7b8d3b6f423ac315148cdcc6",
  "icones/helmet": "d7f93878a4ea19aa2318d31d4985c2b1109010901768f85f8e0ca77cbe8ee6a6",
  "icones/hunter": "7e5106bf3433289eff61cee01aeec3fdb500457c5756632b4df5b668e8b3b917",
  "icones/lift": "410d9c66b6e0b0556258c57ad68887ef4f1455d9c565d128e6a49031b0210c7c",
  "icones/magnet": "a41f05c958fc695f946dc1f6e07c2c1e39109a2e154e7348f34994817ab6b573",
  "icones/necklace": "fcd9796620c32eea0ef62cf5fc3895f1f0fc2d1d8911e92f27816167652eeeaf",
  "icones/pants": "b5974903682ee87aeb0c955f3d1be4de48340b947c701bf22ceaf8cc6fed045b",
  "icones/pickaxe": "0bc4b6bdcb31c97143420c458be5300c34fc47fbb427d3de1665463feae3c2e1",
  "icones/revive": "8bf64be865295ed95b2e2c2b5fe65febfc6b6df8daf338df1d9c80f58ce5dfe5",
  "icones/ring": "42f82e5cfbd9b6df1ed0a437fde54a8d7c80c95d2270f0deb2846190dd9b33ba",
  "icones/seed": "dc936816155dc3db4693dae507f89de5ab864a366e09aa6ca56a7d859ea79aa9",
  "icones/shatter": "5d60d7c93d2742bcabb455cc856598aae026b8d49ce4e2242b88b54ba266a520",
  "icones/sight": "2020461671a1f52d3109c39d59cd17f8854df9b9417feb1a989b5452f8e7650a",
  "icones/stun": "b0ad958298980963b8a060aa732595ddd83e970882711f81f422d92663efe216",
  "icones/symbiosis": "bec1f31dcf2fecb6d1d4663043113ea6010b8f644dde60092f617d4d5739ab73",
  "icones/tonic": "7ff35d9764941df9477bb486b4497c7272e5f432f629f06b0c94b0dd9c9017c4",
  "icones/tree": "c304d388539197bf8393fe46df64777380d0919343e26e48e2a5ce0b429220cb",
  "icones/vault": "20d8e037d811238337899e3bc50a9e51c1cc6a3fe16a42dfc3c0a300fce25710",
  "icones/ward": "a808169ee3003af32ef675852df415a570844b09cb5c4d4810b17dd64eb83016",
  "icones/wings": "d9a922e609f8cf164e5b11c540c8a7e11386b47e23291cbdafa0eebee11fcfaf",
  "zag/die-1": "336f2134386b6ee5f28f32d8173bc081b89d3a24fe89fb25d4b1d79a22e8a22c",
  "zag/die-2": "c4e643bb93284f3fb21d4910d7b13f5d1749d30c384978236debf4049e9b3345",
  "zag/die-3": "bb16473641f4d98497d76c75441620903b785ea4709df07328e11c9a469eaa5d",
  "zag/die-4": "90cfd03769b42118691ac772f8a6794b57761a5f4a8906e4722e5fc869e62737",
  "zag/die-5": "175f2cc23bbc8c5eba48adeb0495bdc8a8175d16ca29d2fb2794085d1b9c6d2e",
  "zag/die-6": "358f7295c39155878a1f80c3a9f59deb904452f8e4ec69b75e4ad19d8ea56e2a"
});
const sources=Object.freeze({
  "habilidades/bossbane": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><g transform=\"translate(-1 11) scale(0.75)\"><path d=\"M36 23L17 53\" stroke=\"currentColor\" stroke-width=\"9\" stroke-linecap=\"round\"/><path d=\"M10 19Q20 8 33 10Q48 11 56 30L47 26Q40 19 31 19Q20 19 12 26Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></g><path d=\"M38.1057 8.793Q38 8 38.4438 8.6656L41.5562 13.3344Q42 14 42.5657 13.4343L47.4343 8.5657Q48 8 48.5657 8.5657L53.4343 13.4343Q54 14 54.4438 13.3344L57.5562 8.6656Q58 8 57.8943 8.793L56.1057 22.207Q56 23 55.2 23L40.8 23Q40 23 39.8943 22.207Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "habilidades/caravan": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><g transform=\"translate(-2 -1) scale(0.82)\"><path d=\"M22 20V13Q22 7 32 7Q42 7 42 13V20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M22 17H42Q51 17 51 26V48Q51 57 42 57H22Q13 57 13 48V26Q13 17 22 17Z M21 35V48H43V35Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></g><g transform=\"translate(32 30) scale(0.43)\"><path d=\"M32 6L52 13Q55 14 54 18L51 34Q48 47 34 57Q32 59 30 57Q16 47 13 34L10 18Q9 14 12 13Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></g></svg>",
  "habilidades/renewal": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><g transform=\"translate(0 13) scale(0.78)\"><path d=\"M32 18C25 5 8 7 7 22C5 36 22 48 29 55Q32 58 35 55C42 48 59 36 57 22C56 7 39 5 32 18Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></g><path d=\"M22.1738 5.9848Q22 5 22.6 5.8L27.4 12.2Q28 13 28.7071 12.2929L34.2929 6.7071Q35 6 35.7071 6.7071L41.2929 12.2929Q42 13 42.6 12.2L47.4 5.8Q48 5 47.8262 5.9848L45.1738 21.0152Q45 22 44 22L26 22Q25 22 24.8262 21.0152Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "habilidades/thunder": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M36 8Q36 7 35.3717 7.7779L15.6283 32.2221Q15 33 16 33L28 33Q29 33 28.8356 33.9864L25.1644 56.0136Q25 57 25.6402 56.2318L49.3598 27.7682Q50 27 49 27L37 27Q36 27 36 26Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "icones/backpack": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M22 20V13Q22 7 32 7Q42 7 42 13V20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M22 17H42Q51 17 51 26V48Q51 57 42 57H22Q13 57 13 48V26Q13 17 22 17Z M21 35V48H43V35Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "icones/blast": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><circle cx=\"30\" cy=\"37\" r=\"19\" fill=\"currentColor\" /><path d=\"M36 20L40 13Q44 7 50 13\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M53 6L56 3M54 20L59 21\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",
  "icones/boots": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M12 13Q12 10 15 10H24Q27 10 27 13V34L29 40V52Q29 55 26 55H7Q3 55 4 50L6 42Q7 39 12 37Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/><g transform=\"translate(64 0) scale(-1 1)\"><path d=\"M12 13Q12 10 15 10H24Q27 10 27 13V34L29 40V52Q29 55 26 55H7Q3 55 4 50L6 42Q7 39 12 37Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></g></svg>",
  "icones/breath": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M9 19H36C47 19 47 7 38 7M9 31H48C59 31 59 18 51 18M9 43H32C44 43 44 57 34 57\" stroke=\"currentColor\" stroke-width=\"7\" stroke-linecap=\"round\"/></svg>",
  "icones/chain": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M31.3318 8.1151Q32 7 32.6682 8.1151L37.4547 16.1028Q38.1229 17.2179 39.3839 16.9019L48.4167 14.6383Q49.6777 14.3223 49.3617 15.5833L47.0981 24.6161Q46.7821 25.8771 47.8972 26.5453L55.8849 31.3318Q57 32 55.8849 32.6682L47.8972 37.4547Q46.7821 38.1229 47.0981 39.3839L49.3617 48.4167Q49.6777 49.6777 48.4167 49.3617L39.3839 47.0981Q38.1229 46.7821 37.4547 47.8972L32.6682 55.8849Q32 57 31.3318 55.8849L26.5453 47.8972Q25.8771 46.7821 24.6161 47.0981L15.5833 49.3617Q14.3223 49.6777 14.6383 48.4167L16.9019 39.3839Q17.2179 38.1229 16.1028 37.4547L8.1151 32.6682Q7 32 8.1151 31.3318L16.1028 26.5453Q17.2179 25.8771 16.9019 24.6161L14.6383 15.5833Q14.3223 14.3223 15.5833 14.6383L24.6161 16.9019Q25.8771 17.2179 26.5453 16.1028Z M31.3072 23.4Q32 23 32.6928 23.4L39.1014 27.1Q39.7942 27.5 39.7942 28.3L39.7942 35.7Q39.7942 36.5 39.1014 36.9L32.6928 40.6Q32 41 31.3072 40.6L24.8986 36.9Q24.2058 36.5 24.2058 35.7L24.2058 28.3Q24.2058 27.5 24.8986 27.1Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "icones/chest": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M19.7708 11.0243Q21 10 22.3313 10.8875L25.6687 13.1125Q27 14 28.6 14L35.4 14Q37 14 38.3313 13.1125L41.6687 10.8875Q43 10 44.2292 11.0243L53.7708 18.9757Q55 20 54.3295 21.4527L49.6705 31.5473Q49 33 47.72 32.04L46.28 30.96Q45 30 45 31.6L45 52.4Q45 54 43.4 54L20.6 54Q19 54 19 52.4L19 31.6Q19 30 17.72 30.96L16.28 32.04Q15 33 14.3295 31.5473L9.6705 21.4527Q9 20 10.2292 18.9757Z M27 13Q32 21 37 13L35 27H29Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "icones/dash": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M30 10H45V32L55 39Q59 41 58 46L56 53H24V42L29 33Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/><path d=\"M7 22H20M5 34H16M7 46H14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",
  "icones/ear": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M23 13Q23 10 26 9L49 5Q53 4 53 8V40C53 47 47 51 41 49C33 47 35 37 42 36L46 36V19L30 22V47C30 54 23 59 17 56C9 53 11 44 19 43L23 43Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "icones/echo": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><g transform=\"translate(-2 0) scale(0.58)\"><path d=\"M24 9H40L49 21 44 45 32 55 20 45 15 21Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></g><g transform=\"translate(31 30) scale(0.48)\"><path d=\"M24 9H40L49 21 44 45 32 55 20 45 15 21Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></g><path d=\"M32 13H40Q52 13 52 27\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M45 25L52 36 59 25Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "icones/empty": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M32 16V48M16 32H48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",
  "icones/flow": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M32 32C16 12 5 13 5 32C5 51 16 52 32 32C48 12 59 13 59 32C59 51 48 52 32 32\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",
  "icones/force": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M36 23L17 53\" stroke=\"currentColor\" stroke-width=\"9\" stroke-linecap=\"round\"/><path d=\"M10 19Q20 8 33 10Q48 11 56 30L47 26Q40 19 31 19Q20 19 12 26Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "icones/forge": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M6.7442 16.3024Q6 15 7.5 15L56.5 15Q58 15 57.2558 16.3024L50.7442 27.6976Q50 29 48.5 29L40.5 29Q39 29 39 30.5L39 44.5Q39 46 40.5 46L48.5 46Q50 46 50 47.5L50 53.5Q50 55 48.5 55L15.5 55Q14 55 14 53.5L14 47.5Q14 46 15.5 46L23.5 46Q25 46 25 44.5L25 30.5Q25 29 23.5 29L15.5 29Q14 29 13.2558 27.6976Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/><rect x=\"21\" y=\"7\" width=\"30\" height=\"8\" rx=\"2\" fill=\"currentColor\" /></svg>",
  "icones/fortune": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><circle cx=\"24\" cy=\"21\" r=\"10\" fill=\"currentColor\" /><circle cx=\"40\" cy=\"21\" r=\"10\" fill=\"currentColor\" /><circle cx=\"24\" cy=\"37\" r=\"10\" fill=\"currentColor\" /><circle cx=\"40\" cy=\"37\" r=\"10\" fill=\"currentColor\" /><path d=\"M33 36Q34 49 45 55\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"5.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",
  "icones/fury": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M31.1515 15.8485Q32 15 32.8485 15.8485L48.1515 31.1515Q49 32 48.1515 32.8485L32.8485 48.1515Q32 49 31.1515 48.1515L15.8485 32.8485Q15 32 15.8485 31.1515Z M31.5404 24.4596Q32 24 32.4596 24.4596L39.5404 31.5404Q40 32 39.5404 32.4596L32.4596 39.5404Q32 40 31.5404 39.5404L24.4596 32.4596Q24 32 24.4596 31.5404Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/><path d=\"M12 12L17 17\" transform=\"rotate(0 32 32)\" stroke=\"currentColor\" stroke-width=\"5.5\" stroke-linecap=\"round\"/><path d=\"M12 12L17 17\" transform=\"rotate(90 32 32)\" stroke=\"currentColor\" stroke-width=\"5.5\" stroke-linecap=\"round\"/><path d=\"M12 12L17 17\" transform=\"rotate(180 32 32)\" stroke=\"currentColor\" stroke-width=\"5.5\" stroke-linecap=\"round\"/><path d=\"M12 12L17 17\" transform=\"rotate(270 32 32)\" stroke=\"currentColor\" stroke-width=\"5.5\" stroke-linecap=\"round\"/></svg>",
  "icones/gem": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M20 10H44L56 26 32 56 8 26Z M8 26H56 M20 10L25 26 32 56 39 26 44 10\" stroke=\"currentColor\" stroke-width=\"5.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",
  "icones/guard": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M32 6L52 13Q55 14 54 18L51 34Q48 47 34 57Q32 59 30 57Q16 47 13 34L10 18Q9 14 12 13Z M23 25L18 30 29 41 47 22 41 17 29 30Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "icones/harvest": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><g transform=\"translate(0 0) scale(0.7)\"><path d=\"M24 9H40L49 21 44 45 32 55 20 45 15 21Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></g><g transform=\"translate(28 26) scale(0.5)\"><path d=\"M32 18C25 5 8 7 7 22C5 36 22 48 29 55Q32 58 35 55C42 48 59 36 57 22C56 7 39 5 32 18Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></g></svg>",
  "icones/heart": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M32 18C25 5 8 7 7 22C5 36 22 48 29 55Q32 58 35 55C42 48 59 36 57 22C56 7 39 5 32 18Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "icones/helmet": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M12 40V31C12 18 20 11 32 11C44 11 52 18 52 31V40H55Q58 40 58 44V47Q58 51 54 51H10Q6 51 6 47V44Q6 40 10 40Z M26 32A6 6 0 1 0 38 32A6 6 0 1 0 26 32Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "icones/hunter": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M22 10H10V22M42 10H54V22M10 42V54H22M54 42V54H42\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"5.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"32\" cy=\"32\" r=\"9\" fill=\"currentColor\" /></svg>",
  "icones/lift": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M13 8H51V56H13Z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"5.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M32 17V43M23 35L32 44 41 35\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"5.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",
  "icones/magnet": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M9 9H22V34A10 10 0 0 0 42 34V9H55V34A23 23 0 0 1 9 34Z M9 19H22V24H9Z M42 19H55V24H42Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "icones/necklace": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M13 12C20 5 44 5 51 12C57 26 49 38 37 43Q32 46 27 43C15 38 7 26 13 12Z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><ellipse cx=\"32\" cy=\"42\" rx=\"3.5\" ry=\"5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\"/><path d=\"M32 43C38 43 42 47 42 52C42 58 37 61 32 61C27 61 22 58 22 52C22 47 26 43 32 43Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "icones/pants": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M15.9257 12.5983Q16 11 17.6 11L46.4 11Q48 11 48.0743 12.5983L49.9257 52.4017Q50 54 48.4 54L38.6 54Q37 54 36.6119 52.4478L32.3881 35.5522Q32 34 31.6119 35.5522L27.3881 52.4478Q27 54 25.4 54L15.6 54Q14 54 14.0743 52.4017Z M20 17H44V23H20Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "icones/pickaxe": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M36 23L17 53\" stroke=\"currentColor\" stroke-width=\"9\" stroke-linecap=\"round\"/><path d=\"M10 19Q20 8 33 10Q48 11 56 30L47 26Q40 19 31 19Q20 19 12 26Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "icones/revive": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M13 21A23 23 0 1 1 9 38\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"5.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M8 9L22 23 6 25Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/><g transform=\"translate(18 18) scale(0.44)\"><path d=\"M32 18C25 5 8 7 7 22C5 36 22 48 29 55Q32 58 35 55C42 48 59 36 57 22C56 7 39 5 32 18Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></g></svg>",
  "icones/ring": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M13 25C20 17 28 15 37 15C41 9 49 9 54 14C60 20 57 29 51 32C52 44 44 54 33 58C20 62 8 52 7 40C6 34 8 29 13 25Z M18 31C13 36 15 45 23 49C32 53 41 45 42 37C42 32 38 28 32 26C26 24 21 26 18 31Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "icones/seed": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M31.3356 7.7474Q32 7 32.6644 7.7474L39.3356 15.2526Q40 16 39.9005 16.995L37.0995 45.005Q37 46 36 46L28 46Q27 46 26.9005 45.005L24.0995 16.995Q24 16 24.6644 15.2526Z M9.1116 29.8931Q9 29 9.7814 28.5535L15.2186 25.4465Q16 25 16.5857 25.6833L21.4143 31.3167Q22 32 22 32.9L22 43.1Q22 44 21.28 44.54L18.72 46.46Q18 47 17.4378 46.2972L10.5622 37.7028Q10 37 9.8884 36.1069Z M54.8884 29.8931Q55 29 54.2186 28.5535L48.7814 25.4465Q48 25 47.4143 25.6833L42.5857 31.3167Q42 32 42 32.9L42 43.1Q42 44 42.72 44.54L45.28 46.46Q46 47 46.5622 46.2972L53.4378 37.7028Q54 37 54.1116 36.1069Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/><path d=\"M12 55H52\" stroke=\"currentColor\" stroke-width=\"6\" stroke-linecap=\"round\"/></svg>",
  "icones/shatter": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M22.4265 8.8192Q23 8 24 8L30 8Q31 8 30.7178 8.9594L26.2822 24.0406Q26 25 26.7526 25.6585L33.2474 31.3415Q34 32 33.72 32.96L27.28 55.04Q27 56 26.4592 55.1588L9.5408 28.8412Q9 28 9.5735 27.1808Z M35.8157 8.9829Q36 8 37 8L42 8Q43 8 43.545 8.8384L55.455 27.1616Q56 28 55.3861 28.7894L35.6139 54.2106Q35 55 35.2425 54.0299L40.7575 31.9701Q41 31 40.2474 30.3415L33.7526 24.6585Q33 24 33.1843 23.0171Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "icones/sight": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M6 32Q32 5 58 32Q32 59 6 32Z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"5.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"32\" cy=\"32\" r=\"9\" fill=\"currentColor\" /></svg>",
  "icones/stun": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><g transform=\"translate(15 3) scale(0.6)\"><path d=\"M31.6006 9.1316Q32 8 32.3994 9.1316L37.6006 23.8684Q38 25 39.1096 25.4569L53.8904 31.5431Q55 32 53.8904 32.4569L39.1096 38.5431Q38 39 37.6006 40.1316L32.3994 54.8684Q32 56 31.6006 54.8684L26.3994 40.1316Q26 39 24.8904 38.5431L10.1096 32.4569Q9 32 10.1096 31.5431L24.8904 25.4569Q26 25 26.3994 23.8684Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></g><path d=\"M11 34C2 52 42 61 55 40\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"5.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"15\" cy=\"45\" r=\"4\" fill=\"currentColor\" /></svg>",
  "icones/symbiosis": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M32 18C25 5 8 7 7 22C5 36 22 48 29 55Q32 58 35 55C42 48 59 36 57 22C56 7 39 5 32 18Z M31.4343 22.5657Q32 22 32.5657 22.5657L39.4343 29.4343Q40 30 39.5562 30.6656L32.4438 41.3344Q32 42 31.5562 41.3344L24.4438 30.6656Q24 30 24.5657 29.4343Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "icones/tonic": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M24 7H40V20L49 31V50Q49 57 42 57H22Q15 57 15 50V31L24 20Z M29 28H35V36H42V42H35V50H29V42H22V36H29Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "icones/tree": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M32 19V34M14 46V34H50V46M32 34V46\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><rect x=\"24\" y=\"6\" width=\"16\" height=\"16\" rx=\"3\" fill=\"currentColor\" /><rect x=\"6\" y=\"44\" width=\"16\" height=\"14\" rx=\"3\" fill=\"currentColor\" /><rect x=\"24\" y=\"44\" width=\"16\" height=\"14\" rx=\"3\" fill=\"currentColor\" /><rect x=\"42\" y=\"44\" width=\"16\" height=\"14\" rx=\"3\" fill=\"currentColor\" /></svg>",
  "icones/vault": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M14 10H50Q56 10 56 16V50Q56 56 50 56H14Q8 56 8 50V16Q8 10 14 10Z M16 19V47H48V19Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/><circle cx=\"32\" cy=\"33\" r=\"8\" fill=\"currentColor\" /><path d=\"M32 23V43M22 33H42\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",
  "icones/ward": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M32 6L52 13Q55 14 54 18L51 34Q48 47 34 57Q32 59 30 57Q16 47 13 34L10 18Q9 14 12 13Z M32 15L20 20 22 33Q24 41 32 48Q40 41 42 33L44 20Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "icones/wings": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><path d=\"M7.178 10.6907Q7 9 8.4577 9.8746L15.5423 14.1254Q17 15 17.8334 16.4817L25.1666 29.5183Q26 31 26.106 32.6967L26.894 45.3033Q27 47 25.5139 46.1744L19.4861 42.8256Q18 42 17.6312 40.3405L16.3688 34.6595Q16 33 14.6167 32.0119L10.3833 28.9881Q9 28 8.822 26.3093Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/><g transform=\"translate(64 0) scale(-1 1)\"><path d=\"M7.178 10.6907Q7 9 8.4577 9.8746L15.5423 14.1254Q17 15 17.8334 16.4817L25.1666 29.5183Q26 31 26.106 32.6967L26.894 45.3033Q27 47 25.5139 46.1744L19.4861 42.8256Q18 42 17.6312 40.3405L16.3688 34.6595Q16 33 14.6167 32.0119L10.3833 28.9881Q9 28 8.822 26.3093Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></g><path d=\"M27.8675 29.1927Q28 28 29.2 28L34.8 28Q36 28 36.1325 29.1927L37.8675 44.8073Q38 46 37.3826 47.029L32.6174 54.971Q32 56 31.3826 54.971L26.6174 47.029Q26 46 26.1325 44.8073Z\" fill=\"currentColor\" fill-rule=\"evenodd\"/></svg>",
  "zag/die-1": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><rect x=\"7\" y=\"7\" width=\"50\" height=\"50\" rx=\"12\" fill=\"#ecab11\" stroke=\"#180d2f\" stroke-width=\"3.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M9 19Q9 9 19 9H45Q55 9 55 19V42Q55 49 47 49H17Q9 49 9 42Z\" fill=\"#e8ff75\"/><circle cx=\"32\" cy=\"32\" r=\"3.7\" fill=\"#180d2f\" /></svg>",
  "zag/die-2": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><rect x=\"7\" y=\"7\" width=\"50\" height=\"50\" rx=\"12\" fill=\"#ecab11\" stroke=\"#180d2f\" stroke-width=\"3.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M9 19Q9 9 19 9H45Q55 9 55 19V42Q55 49 47 49H17Q9 49 9 42Z\" fill=\"#e8ff75\"/><circle cx=\"22\" cy=\"22\" r=\"3.7\" fill=\"#180d2f\" /><circle cx=\"42\" cy=\"42\" r=\"3.7\" fill=\"#180d2f\" /></svg>",
  "zag/die-3": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><rect x=\"7\" y=\"7\" width=\"50\" height=\"50\" rx=\"12\" fill=\"#ecab11\" stroke=\"#180d2f\" stroke-width=\"3.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M9 19Q9 9 19 9H45Q55 9 55 19V42Q55 49 47 49H17Q9 49 9 42Z\" fill=\"#e8ff75\"/><circle cx=\"22\" cy=\"22\" r=\"3.7\" fill=\"#180d2f\" /><circle cx=\"32\" cy=\"32\" r=\"3.7\" fill=\"#180d2f\" /><circle cx=\"42\" cy=\"42\" r=\"3.7\" fill=\"#180d2f\" /></svg>",
  "zag/die-4": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><rect x=\"7\" y=\"7\" width=\"50\" height=\"50\" rx=\"12\" fill=\"#ecab11\" stroke=\"#180d2f\" stroke-width=\"3.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M9 19Q9 9 19 9H45Q55 9 55 19V42Q55 49 47 49H17Q9 49 9 42Z\" fill=\"#e8ff75\"/><circle cx=\"22\" cy=\"22\" r=\"3.7\" fill=\"#180d2f\" /><circle cx=\"42\" cy=\"22\" r=\"3.7\" fill=\"#180d2f\" /><circle cx=\"22\" cy=\"42\" r=\"3.7\" fill=\"#180d2f\" /><circle cx=\"42\" cy=\"42\" r=\"3.7\" fill=\"#180d2f\" /></svg>",
  "zag/die-5": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><rect x=\"7\" y=\"7\" width=\"50\" height=\"50\" rx=\"12\" fill=\"#ecab11\" stroke=\"#180d2f\" stroke-width=\"3.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M9 19Q9 9 19 9H45Q55 9 55 19V42Q55 49 47 49H17Q9 49 9 42Z\" fill=\"#e8ff75\"/><circle cx=\"22\" cy=\"22\" r=\"3.7\" fill=\"#180d2f\" /><circle cx=\"42\" cy=\"22\" r=\"3.7\" fill=\"#180d2f\" /><circle cx=\"32\" cy=\"32\" r=\"3.7\" fill=\"#180d2f\" /><circle cx=\"22\" cy=\"42\" r=\"3.7\" fill=\"#180d2f\" /><circle cx=\"42\" cy=\"42\" r=\"3.7\" fill=\"#180d2f\" /></svg>",
  "zag/die-6": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><rect x=\"7\" y=\"7\" width=\"50\" height=\"50\" rx=\"12\" fill=\"#ecab11\" stroke=\"#180d2f\" stroke-width=\"3.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M9 19Q9 9 19 9H45Q55 9 55 19V42Q55 49 47 49H17Q9 49 9 42Z\" fill=\"#e8ff75\"/><circle cx=\"22\" cy=\"20\" r=\"3.7\" fill=\"#180d2f\" /><circle cx=\"42\" cy=\"20\" r=\"3.7\" fill=\"#180d2f\" /><circle cx=\"22\" cy=\"32\" r=\"3.7\" fill=\"#180d2f\" /><circle cx=\"42\" cy=\"32\" r=\"3.7\" fill=\"#180d2f\" /><circle cx=\"22\" cy=\"44\" r=\"3.7\" fill=\"#180d2f\" /><circle cx=\"42\" cy=\"44\" r=\"3.7\" fill=\"#180d2f\" /></svg>"
});
const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function render(source){if(!has(sources,source))throw new RangeError('Unmapped approved source: '+source);return sources[source].replace('<svg ','<svg class="glyph approved-interface-icon" aria-hidden="true" focusable="false" data-approved-source="'+source+'" ');}
export function approvedIconCoverage(domain,id){const key=domain+'/'+id;if(!has(APPROVED_INTERFACE_COVERAGE,key))throw new RangeError('Unknown icon context: '+key);return APPROVED_INTERFACE_COVERAGE[key];}
// GV-019: approved ring/backpack PNG alpha, tinted by the existing UI state. Other six slots keep v3 sources.
const approvedGearRaster=Object.freeze({ring:'assets/interface-equipment-r1/ring.png',backpack:'assets/interface-equipment-r1/backpack.png'});
export function approvedEntityIcon(domain,id){const row=approvedIconCoverage(domain,id);if(!row.source)throw new RangeError('Declared approved-art gap for '+domain+'/'+id+': '+row.reason);if(domain==='card'){const url=APPROVED_CARD_RASTERS[id];if(!url)throw new RangeError('Unknown canonical card: '+id);return '<img class="glyph approved-interface-icon approved-card-raster" src="'+url+'" alt="" aria-hidden="true" data-approved-source="'+url+'" decoding="async" draggable="false">';}if(domain==='gear'&&has(approvedGearRaster,id)){const url=approvedGearRaster[id];return '<span class="glyph approved-interface-icon" aria-hidden="true" data-approved-source="'+row.source+'" data-approved-revision="equipment-readability-r1" style="display:inline-block;flex:none;background-color:currentColor;mask:url('+url+') center/contain no-repeat;-webkit-mask:url('+url+') center/contain no-repeat"></span>';}return render(row.source);}
export function approvedInterfaceGlyph(id){return render('icones/'+id);}
export const approvedAstralGlyph=id=>approvedEntityIcon('astral',id);
export const approvedFounderGlyph=id=>approvedEntityIcon('founder',id);
export const approvedMissionGlyph=id=>approvedEntityIcon('mission',id);
export const approvedGearSlotGlyph=id=>approvedEntityIcon('gear',id);
export const approvedConsumableGlyph=id=>approvedEntityIcon('item',id);
export const approvedBuildingGlyph=id=>approvedEntityIcon('building',id);
export const approvedForgeFeedbackGlyph=id=>approvedEntityIcon('forge-feedback',id);
export const approvedCardArt=id=>approvedEntityIcon('card',id);
export const approvedBoostGlyph=id=>approvedEntityIcon('boost',id);
export function approvedZagDie(face=3){if(!Number.isInteger(face)||face<1||face>6)throw new RangeError('Die face must be 1..6');return approvedEntityIcon('die',String(face));}
