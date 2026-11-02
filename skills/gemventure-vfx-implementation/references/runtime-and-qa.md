# Runtime, composição e verificação

## Contrato mínimo de um efeito

Registrar evento/estado de origem; identidade e deduplicação; alvo/âncora;
coordenadas e espaço; relógio; envelope visual; camada e oclusão; paleta/forma;
densidade; normal/suave; cache/limites; interrupção; fallback e critério de aceite.
Essa ficha não exige criar uma nova API central quando a existente já comporta o caso.

**Origem:** efeito lê o evento confirmado. A conclusão cosmética não dispara dano,
pagamento, ganho ou save. Um botão pode comprimir ao receber input; a partícula
de ganho só nasce do sucesso. Buff ativo deriva do estado/deadline do domínio,
não de uma estimativa de duração da animação.

**Identidade:** repetir consumo do mesmo evento não repete abertura ou celebração.
Evitar chaves só por posição quando dois eventos legítimos podem ocorrer no mesmo
local. Sets/caches de deduplicação precisam de escopo e descarte limitados.

**Espaço:** distinguir coordenada de tabuleiro, projetada, meia-escala do efeito,
CSS e viewport. Ground anchor, pivô do corpo e centro do sprite não são sinônimos.
Rolagem, câmera, resize e troca de alvo não se corrigem com offsets mágicos globais.
Conferir o plano de oclusão de parede/personagem e a ordem de chão, corpo e fragmentos.

**Relógio:** estado cosmético usa o clock visual; acento lê beatPhase/beatTime
atuais. Sem `setInterval` musical ou BPM presumido constante. Pausa e aba oculta
não geram uma rajada de eventos vencidos na volta. Política de cancelar ou congelar
segue o consumidor; não mudar a regra de escolhas temporizadas incidentalmente.

**Ciclo de vida:** limpar ao terminar/trocar cena; cancelar animações e listeners
próprios. Um overlay removido não mantém RAF. Buff terminado não conserva aura.
Uma imagem carregada tarde pode ativar apenas o fallback ou efeito ainda pertinente,
sem repetir o resultado antigo. `save/restore` deve ser balanceado mesmo em saída antecipada.

## Arquitetura a reutilizar

Baseline de 31/10/2026, a conferir na tarefa:

- `Effects` consome eventos e agrupa partículas, labels, beams e `VfxSprites`;
  cura/escudo/Titã e geodo têm consumidores próprios.
- `VfxSprites` controla atlas genéricos e seu limite. Há desvio procedural para
  explosão laranja/vermelha. Trocar `explosion.png` não controla esse ramo.
- Minion VFX mantém seus atlas, contexto/variante suave e fila. Não recarregar
  folhas por partícula nem substituir seu contrato sem necessidade.
- `combo-disco` já fornece luz progressiva e sincronizada nas superfícies. Não
  duplicar o pulso ambiental ou criar uma bola física onde o efeito é luz refletida.
- `world.js` integra camadas, câmera, scale/DPR e acabamento; é arquivo compartilhado.
  Preferir novos módulos pequenos e hunk delimitado quando necessário e autorizado.
- `gamefeel-v5.js` e o HUD têm pulsos/voos próprios; CSS afeta glow e contraste.
  Conferir cascata antes de atribuir um resultado ao atlas.

## Orçamento e degradação

Declarar residente e temporário, limites por sistema e soma esperada em cena.
Tetos atuais não demonstram orçamento total suficiente. Considerar superfície
transparente desenhada, overdraw, filtros, recoloração, alocação e decode. Variação
de frame time e atraso de input importam ao ritmo; médias podem esconder picos.

Não fazer leitura de pixels, novo canvas, decode ou recoloração por frame para um
efeito repetível. Pré-calcular geometria estática e preparar variantes com teto.
Não transformar a skill em obrigação de pool complexo para todo efeito pequeno;
escolher solução proporcional e medir antes de complicar.

Se saturar: reduzir ambiente e secundários, limitar cauda/área, agregar visuais de
mesmo papel e preservar sinal essencial. A política da fila deve ser explícita;
não descartar perigo informativo junto com decoração nem alterar transações.
Modo suave mantém confirmação e significado, com menos movimento/variação luminosa.

## Provas proporcionais por recorte

| Pergunta | Prova adequada | Não demonstra |
| --- | --- | --- |
| O efeito nasce do evento certo? | Teste do consumidor com eventos válidos, inválidos e repetidos; comparação de estado | Qualidade visual |
| A regra ficou intacta? | Mesmo fluxo/seed, mesmos eventos e estado do domínio com VFX ligado/desligado quando viável | Aceite estético |
| Tem pixels suficientes? | Conta fonte→cache→tela, captura 1:1 e inspeção em contexto | Prazer ou resolução física não observada |
| O efeito é temporalmente coerente? | Início/pico/cauda em movimento, fase/relógio rastreáveis, pausa/retomada | Sincronia auditiva se não houve áudio |
| Fica legível sob carga? | Sequência realista com números, buffs, perigo e combo alto, cenários contrastantes | Todos os biomas a partir de um fundo neutro |
| Cabe no orçamento? | Baseline/candidata, mesma carga, duração, máquina e método; memória/cache e frame time quando observáveis | FPS do navegador a partir de render nativo |
| Botão continua utilizável? | Foco, mouse/teclado, repetição, falha, fechar/reabrir | Interação real a partir de screenshot |

Cobrir normal/suave, pausa, aba oculta, troca de cena, scroll do Abismo quando
afetado, resize/DPR quando afetado e falha do asset/fallback. Executar apenas os
casos pertinentes à alteração. Não escrever teste que só copie a fórmula cosmética.

Para integração de código, seguir `CONTRIBUTING.md` e `TEAM_WORKFLOW.md`, incluindo
checks exigidos. Criação apenas documental de skills não pede a suíte inteira do jogo.
Scripts novos da skill precisam ser executados com casos úteis e entrada inválida.

## Aplicação e entrega

Antes de aplicar, comparar os bytes atuais com a baseline, reconciliar o hunk,
confirmar autorização no sublote e preservar recuperação. Não reaplicar aceites
antigos a uma aparência nova. Registrar origem da prévia, versão, viewport,
zoom, DPR, CRT e o que ficou não verificado. Não contornar bloqueio de acesso.

Entrega: ID/revisão, resultado, arquivos/contratos, baseline/dependências,
diferença visual e técnica, fontes e prova utilizável, testes/método/limites,
aceite/autorização/recibo e próximo responsável quando houver. Relatório no próprio
chat é válido; envio a outros chats exige autorização aplicável. Não retomar monitor.


## Emissão seletiva de VFX — integração de 01/11/2026

`vfx-emission.js` fornece halos pequenos cacheados. `Effects.emissionSources` e
a amostragem real de mineração alimentam o shader existente, sem novo emissor de
partículas. Núcleos de fragmentos são recompostos seletivamente após a escuridão
e antes do CRT; não encaminhar o mundo inteiro a blur nem usar a camada nítida de
HUD para contornar a ordem de luz. Conservar máscaras, tetos e preferência neon.
Ao expor amostras de um novo efeito, usar a mesma posição, cor, relógio e opção
suave do desenho. Cura suave possui uma cruz, não três emissores invisíveis.
Não alterar animação/recompensa para obter luz. O teste original de corpo/recuo
da mineração continua válido; o wrapper de emissão é externo a esse corpo.
Recibo e limites: `coordination/VFX-NEON-20261101-R1/APPLIED.json`.

## Aliases genéricos sem os atlas antigos — 02/11/2026

`vfx-crisp-assets.js` resolve os antigos IDs para a família procedural já aprovada.
`drawVfxAsset` preserva a rota voxel laranja/vermelha; os outros caminhos deixam de
decodificar os cinco PNGs genéricos. `loadVfxAssets` continua idempotente e reporta
as implementações nativas prontas. O suave da aura mantém uma faceta estacionária.
Não restaurar o anel/burst genérico duplicado para compensar a ausência da chama.

`sampleFamilyEmission` e `crispAssetEmission` são puros e compartilham posição,
idade, escala e paleta com o desenho. A coleta de luz importa esses samplers;
não criar dependência circular fazendo o módulo de amostragem importar o emissor.
Geodo expõe `emissionSources` a partir de `geodePieceFrame`; minions fornecem halo
por âncora/material do clip sem alterar pixels do atlas. `vfx-actor-emission.js`
amostra o solo do coelho a partir de `strikeDirt`, preservando suas fontes aprovadas.
O orçamento continua 64 fontes locais / 24 efeitos no shader; os grupos são
intercalados e os pintores próprios não recebem um halo local duplicado em Effects.

Recibo, baseline e recuperação: `coordination/VFX-LEGACY-AUDIT-20261102-R1/`.
