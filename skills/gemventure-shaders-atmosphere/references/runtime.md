# Mapa do renderizador e integração

Fotografia documental de 01/11/2026. Baseline e hashes da pesquisa inicial:
`E:/Genventure/coordination/SHADERS-ATMOSPHERE-20261101-R1/SCOPE-BASELINE.json`.
Não usar o HEAD sozinho: o checkout continha 789 caminhos modificados/não rastreados.
Revalidar este mapa antes de implementar.

## Caminhos que mudam a decisão

| Fonte relativa ao checkout | Achado observado | Consequência |
| --- | --- | --- |
| `dist/world.js` | Mundo em Canvas 2D, ramos de cena distintos e ordenação de atores/paredes | Identificar ramo e camada antes de acrescentar efeito |
| `dist/campaign-cave-runtime.js` | `campaignCaveScene`, superfície em chunks, paredes/props, quatro braseiros de arena e `paintCampaignNight` | Principal alvo para campanha/arena atual; não confundir a apresentação raster com um mundo 3D em tempo real |
| `dist/campaign-cave-surface.js` | Superfícies, sombras e proteção de oclusão do minerador, caches com descarte | Novos passes precisam preservar ordem, âncoras e liberação de buffers |
| `dist/abyss-cave-scene.js` | Cena própria compatível com parte da interface da campanha, `clipFog` específico | Testar e integrar Abismo separadamente; não assumir os mesmos props/dados |
| `dist/cave-depth.js` | Sombras e seis manchas de névoa para o caminho anterior | Em `World`, a chamada de névoa fica no ramo sem `campaignScene`; não afirmar que a campanha nova já a utiliza |
| `dist/dungeon-environment.js` | Decoração/luzes no caminho anterior; `paintDungeonMotes` continua chamado no desenho geral | Não empilhar um segundo ambiente completo; motes atuais são distribuídos na viewport |
| `dist/cave-atmosphere.js` | Véu cromático estático muito discreto; não cobre Abismo | Não confundir com scattering volumétrico nem com iluminação de volume |
| `dist/combo-disco.js` | Iluminação de chão e paredes ligada ao combo e à fase musical | Preservar sua semântica e avaliar o pico combinado |
| `dist/screen-finish.js`, `world-finish.js` | Shader WebGL 1 para acabamento CRT; fallback para o Canvas original; tratamento de contexto perdido | Já existe GPU na apresentação; shader novo não exige migrar a simulação |
| `dist/crisp-layer.js`, `global-screen-finish.js` | Informação nítida e acabamento possuem regras próprias | Não acrescentar segundo CRT nem passar informação crítica pelo bloom |

## Luz e descoberta são coisas distintas

`paintCampaignNight` compõe uma máscara multiplicativa, abrindo gradientes em torno
do jogador e dos braseiros da arena. Isso ilumina regiões do bitmap, mas não
fornece normais por superfície nem oclusão calculada por fonte. O raio de visão e
as regras de descoberta continuam do domínio do jogo.

No trecho final de `World`, há motes, fog de exploração, halo noturno, efeitos,
véu ambiente, acabamento CRT e informação nítida. Outras chamadas de informação
são encaminhadas antecipadamente para a camada nítida. Portanto, “desenhar por
último” pode sobrepor fog/HUD indevidamente: seguir as chamadas reais.

Para um piloto, distinguir quatro máscaras: onde há superfície; onde aquela fonte
alcança sem atravessar bloqueador; onde o jogador pode ver; o que realmente emite.
Não substituir `visible/explored` por um novo raycast artístico. Luz difusa é
aproximação de apresentação, não uma nova mecânica de lanterna ou escuridão.

## Estratégias compatíveis

1. **Canvas primeiro, quando suficiente:** manchas de luz recortadas, texturas de
   névoa pré-calculadas, feixes e partículas locais. Evita mudança arquitetural,
   mas exige medir custo de composição e preenchimento de pixels.
2. **Passe GPU de ambiente candidato:** fornecer cena e máscaras explicitamente,
   compor atmosfera/luz no mundo e manter o CRT oficial uma única vez. Reutilizar
   o estágio existente só após avaliar interfaces e preservação do acabamento.
   Um segundo canvas/contexto não compartilha automaticamente suas texturas.
3. **Relighting seletivo posterior:** fornecer normais/altura e material de
   paredes/colunas/cristais. Adotar sombreamento toon moderado, em um subconjunto
   comparável, antes de produzir mapas para todas as animações.

Não há implementação ou benchmark dessas alternativas nesta pesquisa.

## Portar exemplos externos

O `screen-finish.js` atual usa `webgl`, `varying`, `texture2D` e `gl_FragColor`.
Templates GLSL ES 3.00/WebGL2 usam interfaces e recursos diferentes. Escolher o
alvo primeiro. Shadertoy fornece `mainImage`, `iTime` e canais; o runtime do jogo
precisa de `main`, uniforms/texturas explícitos e relógio próprio de apresentação.
As instruções de não declarar uniforms/`#version` em uma skill de Shadertoy não
são uma regra universal de GLSL. Inteiros/PCG de templates WebGL2 também não se
transferem diretamente para GLSL ES 1.00.

Conferir orientação Y, coordenadas lógicas/físicas, DPR, projeção, alfa premultiplicado
e bordas de texturas. Tratar normais/máscaras como dados, sem decodificação sRGB
indevida. Uma composição nova pode calcular luz em espaço linear, mas não deve
reprocessar toda a paleta/tonemapping oficial por extensão. Capturar antes/depois.

Evitar leituras GPU→CPU por quadro e compilações no caminho quente. Medir uploads
do Canvas e sobreposição antes de prometer aceleração. Prever resize, perda e
restauração de contexto, descarte e fallback utilizável. O orçamento inicial deve
derivar da medição no dispositivo alvo, não do limite nominal de um template.

## Evidência visual existente examinada

- `coordination/cave-expedition-official-20261031-r1/evidence/official-cave-entry.png`.
- `coordination/boss-arena-space-20261101-r2/evidence/after-boss-0.png`.

São imagens de evidências já produzidas, não uma nova sessão de gameplay. O relatório
da arena identifica Native Canvas e declara ausência de certificação de HUD/CRT,
input físico e FPS. A imagem de entrada antecede mudanças posteriores de 01/11.
Elas ajudam a avaliar composição e hierarquia; não provam movimento ou latência.
