# Regras de produto — Gemventure

## Andares, Abismo e contraste de descanso

- Andares permite decisões entre salas. Abismo é uma faixa contínua, sem carga de sala ou fogueira. Ao entrar em cada nova seção, oferece três cartas por quatro segundos; o fim do prazo escolhe uma aleatória entre as três. Combate e relógio musical congelam durante a escolha, preservando combo e fôlego, e retomam imediatamente depois.
- A escolha rápida do Abismo tem barra regressiva e proteção contra cliques já em andamento. Aceita clique ou teclas 1–3; não exige confirmação extra. Saves preservam opções, tempo restante e resultado automático sorteado. Aba oculta/pausa não consome tempo. Não oferecer carga de elevador no Abismo; manter limites de acúmulo e usar cura/fôlego/escudo quando faltarem cartas aprimoráveis.
- Som, movimento, inimigos, avisos e expiração de bônus usam o mesmo relógio musical. Sônico ornamenta o pulso; mudanças obrigatórias jamais são ocultas.
- Calor deve aumentar perigo e recompensa juntos. Mostrar CALOR, SAQUE e a regra ativa em poucas palavras.
- Meteoros e Titãs precisam de aviso visual persistente acima dos efeitos. Não cobrir o personagem com escolhas de resgate.
- Resgatar deposita de imediato, registra o uso e esvazia a mochila; a morte só afeta a carga nova. Máximo de cinco estrelas por descida continua valendo.
- Forja compra números com minerais; árvore compra mecânicas com XP; poço troca excedentes por risco; estrelas compram prestígio, relíquias e biomas.
- Vila e fogueira são descanso real: música ambiente lenta, menor volume, nenhuma bateria ou pulsação de combate. Menus da vila não silenciam o ambiente.
- Broca AFK gera cascalho para suas próprias melhorias e cristais raros (2% por impacto direto). Prêmios crescem sublinearmente com profundidade, núcleo e recorde da campanha; não há renda fixa de fim de jogo. Não gera moedas, prestígio, XP, essências, discos ou passes. Fragmentos antigos ficam em reserva para refino. Troca de cristais custa 5 da origem e 5 moedas por destino. Offline inicial de 1 h, ampliável até 8 h; antigos saves preservam 8 h. Cena, memória, partículas e sons têm limites fixos. Música suave e mute global.
- O início ensina antes de exigir uma build: andares 1–4 têm resistência, dano e ondas graduais. Sem mutadores nesses quatro andares. A coleta perdida usa proteção de 80/75/68/60%, somada às melhorias até o teto de 90%. A partir do andar 5 e no Abismo vale a progressão normal. Sempre medir moedas e cada cristal separadamente, com jogador imperfeito e vida persistente, sem usar apenas um bot perfeito.
- Um disco muda instrumentos e composição, nunca a batida exigida. O catálogo inclui vocal eletrônico original sem palavras; não chamar a síntese interna de uma gravação Vocaloid. Prévia de cinco segundos e descanso suave continuam obrigatórios.
- O modo intenso usa HEPT32, efeitos limitados em memória e preserva a opção suave. Nomes de poderes e avisos são grandes e curtos.


Estas regras registram a direção definida pelo usuário. Aplicar em novas mecânicas, balanceamento, arte e interface.

## Cinco pilares com funções distintas

| Pilar | Função | Custo | Não substituir por |
| --- | --- | --- | --- |
| Forja | Poder bruto: ferramenta, vida, armadura, cura e proteção do saque | Minérios separados e moedas | Escolhas de build |
| Constelação | Identidade da build: ritmo, explosões, raios, mobilidade e sinergias | Pontos ganhos com XP e nível | Compra de dano base |
| Poço dos Desejos | Uma bênção para a próxima descida, sempre com vantagem e risco visíveis | Oferenda de uma cor de cristal | Melhoria garantida de atributos |
| Relicário | Regras permanentes de prestígio e futuros desbloqueios especiais | Estrelas de desempenho | Pequenos aumentos repetidos de dano |
| Missões | Objetivos de coleta, combate e desempenho; recompensas claras | Tempo de exploração | Mais uma loja de atributos |

O elevador é navegação e acesso aos biomas, não uma loja duplicada. As melhorias estelares antigas continuam funcionando em salvamentos anteriores; não são oferecidas como novas compras.

## Leitura instantânea

- Títulos curtos que identifiquem a função; tamanho legível e palavras-chave. Remover slogans e descrições redundantes. Dicas ficam em detalhes fechados, sem esconder custo, benefício ou risco.
- Mostrar custo, o que ganha e risco onde a decisão acontece. Detalhes adicionais ficam recolhidos.
- Preferir “XP EM DOBRO” e “INIMIGOS: +25% DANO” a explicações narrativas.
- Procs anunciam o resultado no combate. Não exigir que o jogador conte batidas para entender a carta.
- Evitar atalhos duplicados e ações destrutivas em destaque. Aceitar missão fecha a janela. Voltar à base exige confirmação; descer é a ação principal.

## Arte e progressão

- A vila da etapa Flow (13/10/2026) segue o prompt e os assets entregues pelo usuário: isometria consistente, blocos volumétricos com chanfros suaves, materiais foscos, contorno de silhueta e sombra azul-marinho. Usar os PNGs do pack e referências para peças faltantes; não substituir essa direção por pequenos retoques nos desenhos frontais antigos. O terreno acompanha as faces dos assets. A migração visual das cavernas é uma etapa própria.

- Uma paleta: HEPT32. Formas sólidas, contornos escuros e uma cor de sombra por material. Personagem e quadro de missões são as referências locais; priorizar silhueta clara, curvas orgânicas e poucas massas grandes. Cristais têm facetas intencionais, sem ruído em cada vértice. Todos os assets usam o mesmo gerador.
- Packs novos passam por seleção e adaptação explícita: preservar a identidade do recurso, eliminar texturas e variações de sombra desnecessárias e conferir os seis biomas. Não trocar automaticamente a arte ao detectar um ZIP novo. Fontes e importação em ART_ASSETS.md.
- Desenhos importados compartilham as mesmas âncoras, exportações SVG e cache do Canvas. Máximo de 30 formas por peça; ZIPs, conversores e sequências brutas de VFX ficam fora da execução do jogo.
- Seis biomas, cinco andares cada; chefes em 5, 10, 15, 20, 25 e 30. Boss Místico encerra o Manto, Soberano Micelial encerra os Micélios e Rei das Tocas encerra as Tocas de Âmbar. O HUD não antecipa o total da campanha.
- Quartzo, rubi, topázio e esmeralda são recursos separados. Não converter automaticamente a mineração em uma moeda genérica.
- O mapa vertical mostra cada andar, seu bioma, cristal abundante e chefe. Arrastar, scroll e teclado devem funcionar.
- Vida persiste entre andares; cura só por efeitos explícitos. Cartas e bênçãos duram a descida. XP, recursos guardados, construções e relíquias persistem.
- Evolução da forja aparece na ferramenta e nas runas do personagem. Desbloqueios na constelação acendem conexões. Efeitos intensos devem respeitar o modo suave.
- A barra de vida fica abaixo do personagem e acompanha sua posição animada. Combos grandes e anúncios de habilidades ficam no canto superior direito; sinais de ataques permanecem legíveis.
- FÔLEGO e VIDA são reservas independentes. A barra grossa de fôlego fica no topo: erros drenam, acertos recuperam; erro sinaliza vermelho/azul com leve sacudida, respeitando efeitos suaves. Ataques e perigos drenam vida. Qualquer reserva zerada encerra a descida, salvo uma ressurreição equipada. Ambas persistem entre andares. Poções/cartas de cura recuperam vida; Segundo fôlego recupera fôlego.

## Exploração e hordas

- O ouriço de costas cristalinas é um espectador gigante na toca da parede, claramente maior que o explorador. Varia com o bioma, respira, pisca, acompanha a exploração com o olhar e alterna as patas no pulso. Usa camadas independentes e pivôs coerentes, com no máximo 30 formas. É cenário, sem vida, colisão de alvo ou recompensa por ataque.
- Pedras do teto avisam três pulsos antes. Repor apenas em área livre, sem bloquear corredor protegido, saída ou personagem. Limitar a três avisos e doze quedas por andar/seção; pedras repostas pagam uma moeda base e nenhum cristal. Pausas e cartas congelam a queda.

- Cavernas de exploração têm quatro vezes a área inicial, câmera acompanhando o personagem e descoberta por proximidade. Não revelar todos os recursos e inimigos ao entrar.
- Gerar primeiro a arquitetura: câmaras ligadas por corredores largos e rotas alternativas; depois distribuir terreno, minério e criaturas. Validar conectividade, entrada, saída, alcance dos recursos e arena segura em muitas sementes. Saves sem máscara mantêm fallback compatível.
- Ondas de criaturas seguem a música, surgem fora da visão e pressionam por várias direções. Avisar a chegada e limitar o total para manter leitura e desempenho.
- Cada bioma possui distribuição mineral e mecânica ambiental própria: rochas, água lenta, chão instável e calor. Perigos avisam antes do dano.
- Arenas de chefe mantêm o espaço de combate livre. Paredes fixas bloqueiam rota e visão e usam desenho contínuo de paredão; nunca a mesma peça das pedras mineráveis. A toca ampla e seu recorte não podem ocultar chão ou alvo. Dar margem superior suave à câmera somente quando necessária para enquadrar o espectador, sem saltos ou alterar comandos. Terreno explorado fica na memória e no minimapa.

## Música e justiça do ritmo

- Vila com estações mais espaçadas e circulação livre. Animar partes: cristal flutua sobre poço fixo, copa sobre tronco, gesto sobre corpo. Movimento leve e pivôs coerentes; respeitar pausa e redução de movimento, sem chacoalhar cenário ou câmera.

- Todo clique válido no mapa é uma tentativa de ritmo, mesmo em chão vazio, névoa ou limite da sala. Acertar a batida mantém a sequência; uma parede nunca transforma esse acerto em erro. Uma ação por batida continua valendo.
- Colisão tem um recuo curto do personagem, sem deslocar a câmera. Batidas paradas não geram pontos, saque ou ataques automáticos de mineração.
- Avisos e indicadores passivos deixam o clique atravessar até o mapa. Botões, escolhas e menus mantêm sua própria interação. A câmera deixa margem no fim da caverna para o personagem não se esconder sob os controles.

- Variação musical não deve exigir adivinhar a próxima batida. Manter uma referência audível e usar viradas em limites de frase.
- Avisar mudanças reais de velocidade antes, por som e sinal visual curto. O jogador sem áudio também precisa do aviso.
- Começar com oscilações pequenas, transição gradual e tolerância temporária; nunca duplicar ações ou recompensas na mesma batida.
- Música, comandos, criaturas, pista e animações usam o mesmo relógio. Pausar ou carregar não pode deslocar um sistema em relação aos outros.
- Chefes conservam pulso estável nesta etapa; variar sua instrumentação. A prévia musical permite testar sem perder recursos.
- Validar a sensação com pessoas: testes automáticos comprovam sincronização, mas não comprovam prazer, clareza auditiva ou ausência de fadiga.

## Marcos, descanso e decisões

- Estrelas são marcos dentro de uma barra acumulada. A barra não reinicia ao ganhar uma estrela nem ao mudar de andar. Metas fixas não devem crescer porque o jogador desbloqueou mais andares.
- Cada sala oferece pontos limitados e suficientes para progresso perceptível. Repetir trajetos e permanecer infinitamente não pode gerar todas as estrelas.
- Aumentar a duração das cavernas junto da área explorável; combinar carga, sequência e sobrevivência, com pressão crescente. Mostrar quando o elevador ainda está estabilizando.
- Elevador do HUD usa o personagem e mostra só o andar atual. Revelar o mapa com a exploração; não informar o total de andares ou futuros chefes.
- Uma ressurreição disponível preserva o combo e abre pausa para mudar estratégia. Vida extra precisa ser conquistada; não oferecer revives ilimitados.
- A cada dez andares, incluir um abrigo antes de prosseguir: tempo parado, música tranquila, troca de build e preparos pagos com cristais. Não curar automaticamente ao atravessar andares.
- Ações manuais têm botões grandes, nomes e atalhos. Habilidades automáticas são identificadas como AUTO para não parecerem botões de ataque manual.

## Recompensas e salvamento

- Na exploração, a caverna ocupa a janela. Informações ficam nas bordas, sem empurrar o jogo para baixo. Preservar área livre ao redor do personagem e barras legíveis; adaptar o enquadramento em retrato.
- A conclusão de andar tem prioridade visual sobre o HUD. Ocultar fôlego e controles externos enquanto cartas e destino estão na frente.
- Quadro de missões usa linhas: objetivo, prazo, raridade, recompensa e uma ação. Aceitar fecha o quadro. Entregar acontece na vila, com prêmio separado e confirmação curta.
- Sons distinguem ações e resultados sem esconder o pulso. Limitar vozes e repetição em cascatas; preservar efeitos de recompensa durante trocas de trilha. Mute encerra música e efeitos. Vila mantém sons suaves.

- Debitar antes da animação; nunca cobrar duas vezes. Investimentos parciais persistem.
- Mostrar cada recurso separadamente no retorno e animar até seu contador. Essências permanecem guardadas para uma mecânica futura: não criar uso, loja, receita ou conversão nesta etapa.
- Preservar progresso e compras existentes ao migrar regras. Testar saldo, morte, recarga, duplicação de entrada e conclusão da jornada.

## Forja 100 e chefe micelial

- Cartas de cura preservam as duas primeiras cópias; depois usam níveis efetivos `2 + 0,5 × log2(n − 1)`. No nível 16, Cristal de açúcar cura 15,8; Lanchinho 31,6; Último fôlego 7,9. Prévia e combate usam os mesmos décimos. A multiplicação de cura não pode dispensar esquiva e defesa nas descidas longas.
- Registrar hipóteses e amostras separadamente. A auditoria atual de seis partidas perfeitas teve cinco conclusões e uma amostra viva no limite de 600 batidas; não prometer duração humana a partir desse bot. Custos e tetos econômicos estão em `dist/balance-report.html`; resultado bruto em `asset-work/balance-results.json`.

- Todos os aprimoramentos da Forja chegam a 100, com ganhos pequenos, custos crescentes e cristais separados. Preservar os benefícios de saves anteriores, sem migração repetida.
- Proteção e retenção têm limites abaixo de 100%. Aprimorar não deve eliminar o risco nem substituir builds.
- Corpo intangível não recebe dano: destruir oito núcleos encerra o combate. Pedras da espiral são perigos, não recursos mineráveis.
- A espiral avisa antes de atingir e de inverter. Manter esquiva possível com quatro casas por ação, avisos acima dos efeitos e alvos fora das áreas cobertas pelo HUD.
- A expansão não altera o requisito do portão do Abismo: Boss Místico derrotado no 20, mais cristais.

## Construções e oferendas por cor

- Construções Forja e Poço vão de 1 a 10; Quadro de Missões vai de 1 a 150. Aprimoramentos individuais da Forja continuam até 100. A Forja aumenta força bruta, o Quadro melhora contratos, o Poço aumenta a chance de bênçãos raras e épicas.
- Missões novas escalam quantidade, prazo ativo e prêmio pelo nível do Quadro; combos, consumíveis e andares têm curvas menores que coleta. Custos após o nível 10 são polinomiais e usam as quatro cores separadas. Até seis ofertas, chances limitadas e comuns ainda possíveis no máximo. Contratos introdutórios de alcançar andares deixam de aparecer após o nível 10.
- Objetivo, prazo e prêmio são guardados no contrato. Melhorar o Quadro nunca reescreve missão aceita. Tempo e progresso persistem após morte; vila e pausas não gastam o prazo. Receber só no quadro, uma vez. Pulsos vazios não devem render tanto quanto mineração ou andares completos.
- Uma missão simultânea no início; novas vagas nos níveis 30, 60, 90 e 120, limitadas a cinco até 150. Tipos de contrato não se repetem entre as vagas. A mesma ação pode avançar objetivos compatíveis; cada prazo e prêmio são independentes. Concluídas ocupam vaga até a entrega, expiradas liberam espaço.
- Aceitar ou entregar sorteia novas ofertas automaticamente, preservando as missões aceitas. Não receber recompensas automaticamente. Abrir, recarregar, abandonar ou começar uma descida não rerrola. Aceitar fecha o quadro; para pegar outra missão, reabrir o quadro. Mostrar vagas usadas e próximo desbloqueio em poucas palavras.
- Escolher cristal revela só sua família; oferecer é a ação que gasta. Quartzo: vida/fôlego/XP. Rubi: força/crítico/explosão. Topázio: defesa/escudo. Esmeralda: sorte/cristais/cura. Não antecipar resultados ou probabilidades.
- Bônus comuns são pequenos; raros e épicos podem sair em qualquer nível. Bônus, raridade e risco ficam fixos no sorteio; recompensa de missão é fixada na oferta. Melhorias não reescrevem contratos aceitos nem bênçãos guardadas.
- Preservar bênçãos antigas já pagas até o uso. O poço flutua e brilha suavemente, sem flashes fortes na vila.

- Movimento visual: pequenos pulos por casa da rota real, com rastro curto. Percurso dura de 100 a 300 ms; altura do salto afeta somente a arte, nunca a câmera nem a posição de combate. Golpes continuam resolvidos no pulso. Um novo deslocamento começa na posição visual atual. Pausas congelam movimento; trocar de andar limpa o rastro. Efeitos suaves mantêm apenas marcas discretas no chão.
- Câmera independente do teleporte: zona central estável, aproximação amortecida e velocidade limitada a 420 unidades do mundo por segundo. Sem salto de segurança; enquadramento imediato apenas ao entrar numa sala. No Abismo, renovar uma faixa desloca as coordenadas de câmera, personagem, efeitos e rastro igualmente: a posição na tela permanece contínua. Sementes de decoração usam a linha absoluta; o piso só desenha as casas visíveis. O relógio musical não controla a câmera.
- Reutilizar sprites por aparência efetiva (família, silhueta, variante, bioma e resolução), não por cada instância de minério. Cache limitado a 256 superfícies recicláveis de 108 × 118 ou 216 × 236 pixels. Névoa e minimapa só mudam com a visibilidade. Fundo do Abismo só é reconstruído na troca de bioma; terrenos e paredes visíveis usam o fluxo de faixas. Evitar consultar layout a cada quadro. As prévias grandes preservam arte vetorial.
- Se o navegador ficar mais de 500 ms sem atualizar durante a partida, pausar antes de avançar o relógio. Não cobrar batidas acumuladas de uma travada; retomar por CONTINUAR, preservando combo e música sincronizada.
- Plataforma: manter a versão de navegador enquanto as medições do jogo completo sustentarem o orçamento de quadros. Medir interface, lógica, desenho e intervalos reais, com hordas e várias seções; não inferir FPS de um teste isolado do renderizador. Considerar renderização por atlas/WebGL se o próximo limite for desenho/composição; um executável que apenas embala a mesma página não elimina gargalos do motor.

- Picareta tem dez aparências: Ferro inicial, depois marcos nos níveis 10 a 90. A forma Estelar permanece até o nível 100. Cursor, personagem e Forja compartilham a mesma arte e regra de evolução. A ponta da lâmina indica o ponto de clique; não adicionar atraso ao cursor. Melhorias entre marcos continuam aumentando os atributos, sem trocar a aparência.

## Visão e leitura imediata durante a descida

- Estrelas ficam numa trilha vertical à direita, separada da pista de ritmo. Enchimento sobe; cada marco acende e recebe a estrela da celebração. A trilha e todos os seus filhos deixam passar os cliques. Nenhuma faixa de estrelas cobre o centro/rodapé da caverna.
- Câmera de exploração cerca de 10% mais afastada; vida abaixo do personagem, 44 × 17 unidades de desenho. Visão inicial de raio 5, medido no plano projetado para evitar elipse deformada. Borda de luz gradual, sombras por obstruções e exploração memorizada. No Abismo, exploração acompanha a rolagem; chefes mantêm suas arenas legíveis.
- Lanterna Viva é a 21ª carta: +20% de alcance por cópia, até três cópias (+60%). Temporária por descida; funciona ao comprar, mudar de andar e recarregar. Não revela inimigos através de pedras.
- Poderes do Abismo são reconhecidos pela silhueta junto ao personagem: picareta grande, raios, fogo nos pés, ímã puxando cristais, bolha dourada e asas. HUD usa ícone e duração; detalhes continuam acessíveis no rótulo. Não exibir longos anúncios de bônus no meio do combate.
- Bolha Dourada bloqueia dano, mas não protege erros de ritmo. Asas de Cristal atravessam pedras e terrenos, sem quebrá-los ou conceder saque. Ao expirar sobre uma pedra, pousar na casa livre mais próxima. Os dois poderes entram no ciclo temporário existente de recompensas do Abismo; não são melhorias permanentes.

- Exceção temporária de teste: `ABYSS_PLAYTEST_ENABLED` em `dist/descent-progress.js` libera o Abismo apenas em localhost/loopback. Não grava desbloqueio no save, não completa cristais nem chefes. Interface identifica TESTE. Para encerrar a fase de teste, definir a constante como `false`; o portão normal volta a valer. Recompensas e recordes da partida de teste seguem as regras normais.

- Elevador: abas Andares e Abismo usam ícones próprios (elevador e portão vermelho). O painel direito é a única área de rolagem de conteúdo; manter abas e fechar acessíveis. Biomas começam recolhidos, com cinco posições ao expandir. Posições não visitadas ficam misteriosas; não revelar biomas futuros. Recorde por andar usa apenas pontos daquele andar concluído, com melhor resultado e contagem de vitórias, preservados no save. Sem inventar dados de partidas antigas.

## Zag · Trilha da Fortuna

- Substitui a Broca por um tabuleiro procedural descendente, sem fim. Guarda somente a posição e uma janela de casas, sem crescer a memória com a jornada. Arte HEPT32 e personagem da vila.
- Cada 60 cristais destruídos no Abismo dão um passe e um fragmento permanentes. A roleta custa um passe; oito setores equiprováveis entregam 2–6 dados, alguns com cristais extras. Não cobra aposta dos minérios da vila.
- Role até três dados da reserva. Cada face tem chance igual. Escolha um dado e rota, confira o destino e confirme AVANÇAR. Dados não usados ficam na mão, inclusive ao sair ou recarregar. Nenhuma escolha tem cronômetro.
- Em cada turno, três rotas visíveis partem da posição atual e reencontram cofres a cada 12 casas. Azul: cristais, proteção, dados, sorte e XP. Vermelha: prêmios básicos triplos, desabamentos (25% da mochila) e auditorias (10% do investimento). Só o destino ativa a casa; passar sobre perigos é seguro. Cofres ativam ao atravessar.
- XP alimenta o nível e os pontos reais da Árvore. Cristais mantêm as quatro cores para a Forja. Não criar uma segunda moeda de habilidades nem entregar estrelas comuns de sorte. Escudo bloqueia um perigo; saque ×2 aplica ao próximo cristal/tesouro.
- Três fragmentos fabricam uma carga: Salto soma 2 ao movimento; Inversor vira 1↔6, 2↔5, 3↔4; Ímã troca o destino por uma casa de bônus duas posições à frente. A troca persiste, não duplica a recompensa, não envolve cofres e só permite uma pendente. Prever os efeitos antes de consumir dado.
- Parar em cofre permite depositar 25/100/250 cristais de uma cor da vila; pode sacar investimento a qualquer momento. Ao atravessar cada marco de 12 casas, rendimento composto de 5%, arredondado para baixo, uma única vez; teto de 10.000 por cor. Auditorias só atingem investimento. O jogador vê a taxa antes de confirmar.
- Mochila pode ser guardada manualmente. Cruzar cofre entrega bônus de cristais e guarda a mochila automaticamente; não tira recursos já guardados na vila.
- Salvar sorteio e custo antes da animação. Fechar ou recarregar conclui o mesmo resultado uma vez. AFK pode continuar com a aba oculta enquanto o painel permanece aberto; fora do AFK, ocultar conclui a ação pendente. Saves da Broca preservam passes e minérios; rodada antiga pendente devolve sua entrada uma única vez. Saves da trilha anterior recebem mão/ferramentas/investimentos vazios.
- Música lounge suave a 72 BPM fixos, acordes de sétima e baixo leve, sem aceleração. Som curto para roleta, casas e prêmio. Sem telas piscando; modo suave reduz pulos e giro. Vila e acampamentos continuam áreas de descanso.

## Poço: sorte, bônus e riscos

- Aprimorar só altera as probabilidades da raridade, nunca a força de um resultado já sorteado. Nível 1: comum 75%, rara 22%, épica 3%. A cada nível: comum −3 pontos percentuais, rara +2, épica +1. No nível 10 ainda pode sair comum (48%).
- Cada cristal mantém sua família temática com três bênçãos possíveis, sorteadas com chances iguais. A raridade fixa a potência por uma tabela comum/rara/épica, independente do nível do prédio.
- Risco é sorteado separadamente: leve 60%, forte 30%, extremo 10%, iguais em todos os níveis. Quartzo reduz o saque em 5/20/40%; rubi aumenta dano inimigo em 15/40/80%; topázio reduz força em 5/20/35%; esmeralda reduz vida máxima em 5/20/40%. Uma bênção épica também pode ter risco extremo.
- Oferta paga uma vez, salva o par bônus/risco e aplica apenas na próxima descida. Subir nível, reabrir ou recarregar não rerrola. Bênçãos antigas já compradas mantêm os valores anteriores até o uso; novos sorteios usam a regra aleatória.
- Antes da oferenda, mostrar apenas cristal, família e custo. Não exibir chances, nomes de resultados possíveis ou tabelas. Depois da oferenda, mostrar os dois efeitos concretos em frases curtas. Cristal flutuante e efeitos suaves continuam.

## Chefes e Zag: regras de integridade

- Pontuação nunca conclui um andar de chefe. Conferir derrota e ausência de chefe vivo também na saída; corrigir saves incompletos sem apagar a expedição. Nome e vida acompanham a criatura, sem faixa larga sobre o mapa.
- Zag tem Oficina para ferramentas e Ousada para selos exclusivos. Três selos diferentes pagam melhorias só do tabuleiro. Engrenagens excedentes compram cargas de ferramentas; não substituem Árvore, Forja ou Estrelas.
- AFK é uma escolha explícita e tem botão de parada. Usa dados e passes, escolhe destinos pelo benefício visível e guarda a mochila ao acabar. Preserva ferramentas, engrenagens e investimentos para decisões manuais. Fechar o painel encerra a automação.
- Cada passe limita os dados bônus a dois; após esse limite, a casa de dado paga um fragmento. Não permitir que a automação crie recursos infinitos sem novas descidas.
