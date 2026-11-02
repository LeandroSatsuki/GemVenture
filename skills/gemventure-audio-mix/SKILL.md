---
name: gemventure-audio-mix
description: Preparar e verificar mixagens e mapas rítmicos de músicas licenciadas do GemVenture, incluindo ataques da bateria como ações, foco na percussão original, variantes de velocidade, fase, estéreo e comparação auditiva. Usar em arquivos e pilotos; integração depende do contrato e autorização da tarefa.
---

# Mixagem musical para o GemVenture

Use o registro vigente de coordenação e `docs/TEAM_WORKFLOW.md`, relativos ao checkout. Reserve os arquivos e congele hashes antes de produzir. Um pedido de teste permite produzir a candidata; não transfere o aceite de uma composição anterior. Preserve o monitor pausado.

## Identifique o material

Preserve o original, seu hash, autor, URL, licença e condições de adaptação. Confira a licença da música específica: permissão para usar comercialmente não comprova permissão para remixar. Registre créditos e alterações nos derivados. Mantenha referências para avaliação futura separadas da seleção atual.

Meça duração, formato, canais, pico e loudness. Cruze BPM informado com periodicidade de ataques, analisando também metade/dobro e deriva entre início, meio e fim. BPM não identifica o primeiro tempo: declare a origem de fase, a evidência e a incerteza. Não invente observações auditivas a partir de uma FFT.

Para música gravada, defina primeiro o que o usuário chama de pulso. Na direção humana do P3, os ataques da própria bateria selecionada são os momentos de ação: intervalos espaçados e pares próximos devem permanecer, sem acrescentar um metrônomo regular. Prepare timestamps explícitos, sem encaixá-los numa grade uniforme nem descartar contratempos por princípio. Outros arranjos podem usar uma grade métrica quando esse for o contrato pedido; não confundir os dois modos. Valide a posição do áudio, offset, pausas e loop contra o mesmo mapa. Latência de dispositivo é uma questão separada do BPM e da fase musical. A referência NecroDancer documenta beatmaps e ajuste manual; não comprova o desenho rítmico de uma faixa específica.

Um metadado de BPM é evidência auxiliar, não prova do ritmo escolhido. Compare os ataques na gravação integral e, se usar separação, na estimativa. Declare se o número apresentado é andamento métrico ou média de ataques do mapa. Uma sequência de intervalos não uniformes pode ter uma média de BPM sem virar um pulso constante. Confirme pares próximos e pausas reais em vez de gerar timestamps apenas por `60 / BPM`.

## Faça o pulso liderar

Leia o `trackBeatTime` e os consumidores vigentes; nunca substitua o relógio variável por um metrônomo constante. Preserve as âncoras e os avisos de gameplay. Renderize os instrumentos reais quando a pergunta for compatibilidade com o jogo, mantendo apenas as vozes necessárias ao piloto.

Quando o pedido usa a bateria gravada como âncora, não sintetize outra bateria por cima. Um reforço pode usar uma estimativa coerente da percussão já presente, com ganho moderado e comparação ao original. Identifique a separação como estimativa. Nas variantes de velocidade, preserve o desenho dos intervalos e a altura, derive as marcações do áudio renderizado e confira a correspondência com os mesmos ataques da fonte. Um novo mapa de ações exige reconciliação dos consumidores antes da integração ao jogo; a prévia isolada não prova esse trabalho.

Um arquivo estéreo pronto não oferece controle independente de bateria e melodia. Comece pelo menor tratamento útil: nível do arranjo, EQ moderado e ducking disparado pelo pulso real. Se a bateria original disputar a âncora, teste a redução por máscara harmônica/percussiva. O helper `scripts/harmonic_bed.py` implementa esse tratamento com máscara compartilhada entre canais; exige NumPy, SciPy e FFmpeg. Uma extração é uma estimativa, nunca um stem original nem uma remoção perfeita da bateria. Compare com o original para detectar perda de ataques de sintetizador/guitarra e textura aquosa.

Se o usuário prefere o original e relata abafamento, reavalie a necessidade da separação antes de intensificar EQ ou compressão. Compare uma versão com espectro e dinâmica integrais e menos camadas acrescentadas. Não remova síncopes que o usuário considera aceitáveis só para tornar o detector de ataques mais simples. Maior presença do arranjo pode vir da relação com o pulso, mantendo o loudness total da comparação.

Mude andamento com preservação de altura; simplesmente trocar sample rate ou playbackRate também altera a afinação. Para tempo variável, derive os segmentos e durações do relógio real, preserve contexto nas bordas e valide transições. Não use cortes a cada beat sem contexto ou sobreposição. Registre latência, arredondamento em amostras, tratamento de bordas e o que a medição realmente comprova.

Ducking é relativo à âncora; ataque, profundidade e recuperação devem servir à clareza. Calcule frações de beat como `60000 / BPM * fração` em milissegundos. Por exemplo, uma colcheia em 120 BPM dura 250 ms. Evite copiar valores ou compensações de ganho automáticas de outra sessão. Aplique o envelope ao arranjo, preservando o cue e o ataque do kick.

## Headset e comparação

Mantenha kick, grave e informação crítica centrados. Preserve o campo estéreo útil da fonte, sem inversão de fase ou alargamento automático. Compare estéreo/mono, correlação, RMS L/R e pico mono. Equilíbrio medido não certifica conforto de headset.

Exporte o mesmo trecho, fase, mapa de andamento e loudness para as alternativas. A referência deve isolar a alteração avaliada: original no tempo nativo e arranjo no tempo de destino são referências distintas. Inclua mudança de andamento e limite de ciclo quando pertinentes, além de recuperação do ducking. Um pulso mais alto não é, por si só, uma mix melhor.

Verifique decodificação, amostras finitas, duração, sample/true peak, clipping, integridade das bordas, alinhamento da âncora e limpeza de nós. A entrega identifica renderização nativa versus aproximação, escuta humana pendente, integração pendente e limitações. Não anuncie masterização profissional ou aprovação perceptiva só porque as medições passaram.

Consulte [references/sources.md](references/sources.md) para aquisição e documentação técnica. Scripts e configurações do piloto ficam na entrega, sem instalar uma DAW, serviço pago ou modelos de separação por inferência automática.
