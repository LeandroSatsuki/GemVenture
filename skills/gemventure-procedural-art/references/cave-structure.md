# Cavernas: estrutura orientada à mineração rítmica

Direção humana de 31/10/2026: salas maiores e robustas, melhores ligações,
movimentação dinâmica, acesso fácil e imersão. Esta referência orienta avaliação
e futuras candidatas; não aplica mudanças ao runtime.

## Começar pela ação real

Leia `core.js` (generateRoom, pathTo e resolução da ação), `cavern.js`
(travelPath, terreno e visão), `cave-layout.js` e `campaign.js` na baseline atual.
Conserve a mineração como ação central: boa circulação não significa retirar
pedras ou deixar tudo ao alcance sem deslocamento.

Na baseline estudada, os andares comuns são 42×30; chefes, 21×15. O deslocamento
usa vizinhos cardeais e orçamento por ação. Água, terra fofa e raízes consomem
mais orçamento. O desenho projetado não altera esse custo. Uma distância em
células não é uma duração em batidas; calcule duração com a resolução real,
build e terreno antes de prometer um ritmo específico.

Avalie uma sequência concreta: perceber alvo → alcançar uma face livre → minerar
→ reagir ao aviso → desviar → retomar mineração. Meça o que a geometria exige
dessa sequência com equipamento inicial e mobilidade ampliada. Obstáculos,
visão curta e curvas podem interrompê-la mesmo com um flood-fill aprovado.

## Arquitetura recomendada para o piloto

Separar em etapas com dados inspecionáveis:

1. **Intenção e grafo:** entrada, câmaras principais, ligações e alcovas opcionais;
   cada sala tem papel, entradas e área útil. Um ciclo deve oferecer retorno ou
   flanco real, sem exigir portas, chaves ou uma nova mecânica de progresso.
2. **Forma das salas:** ocupar os volumes previstos com silhuetas limitadas por
   família; conservar área central manobrável, bolsões de mineração e espessura
   suficiente de parede entre vizinhas. Uma sala pode ser aberta e contínua,
   sem transição de tela, câmera travada ou arena selada.
3. **Conexões por portais:** conectar aberturas no perímetro, com orientação e
   largura compatíveis, em vez de pintar faixas até o centro de todas as salas.
   Preservar a leitura da boca e a identidade dos dois recintos.
4. **Circulação protegida:** entrada, saída, curva, zona de reação e aproximação
   de alvos especiais. Proteger o necessário; uma faixa protegida excessiva
   pode excluir mineração da maior parte do piso.
5. **População:** terreno, pedras, cristais, criaturas e reposição respeitam as
   reservas. Conferir novamente acesso e desvios após o povoamento.
6. **Ambiente:** contorno, materiais e decoração recebem sementes próprias,
   sem consumir o RNG da simulação. Decoração não pode corrigir uma sala ruim.

Para uma comparação inicial, experimente câmaras de extração com área útil
maior que a largura da ligação, uma entrada acolhedora, uma bifurcação legível
e um retorno curto. Trate quantidade e dimensões como parâmetros de estudo,
não como especificação humana já aprovada. Se não couber no mapa atual,
reduza a quantidade antes de aumentar a área total ou mudar a câmera.

## Como julgar cada espaço

| Elemento | Pergunta que muda a decisão |
| --- | --- |
| Sala de extração | Há alvos acessíveis em mais de uma borda e espaço para retomar a sequência após um desvio? |
| Ligação | O jogador vê a boca e entende para onde vai? A curva aceita a movimentação atual sem colisão ou surpresa ilegível? |
| Bifurcação | As alternativas oferecem percurso ou situação diferente, com sinal visual local, sem exigir decorar o mapa? |
| Alcova | A aproximação e o retorno justificam o desvio? Evitar recompensas obrigatórias atrás de percurso vazio. |
| Centro aberto | O espaço ajuda hordas e mineração ou só aumenta a caminhada sem decisão? |
| Arena | Há posições e rotas compatíveis com os avisos e padrões do chefe vigente? |

Não fixar um corredor universal de N tiles. Derive a largura útil do deslocamento,
do padrão de ataque, do envelope projetado dos atores e da necessidade de desvio.
A ligação pode ser mais estreita que a sala, mas não deve exigir precisão espacial
incompatível com o pulso. Curva cega longa e passagem de uma célula merecem
rejeição ou justificativa explícita no contexto do jogo, não proibição abstrata.

## Escolha de método procedural

| Método | Onde ajuda | Cuidado neste jogo |
| --- | --- | --- |
| Grafo + moldes parametrizados | Controlar função das salas, entradas e sequência espacial | Preferência inicial; precisa de boa biblioteca e validação de encaixe. |
| BSP | Reservar volumes e impedir sobreposição | Folhas viram caixas repetidas se a forma e as portas não forem trabalhadas. |
| Autômato celular | Naturalizar massas e superfícies locais | Usá-lo sozinho não controla fluxo; pode fechar uma rota já aprovada. |
| Ruído/caminhante | Bordas e irregularidade em escala coerente | Não confundir contorno ruidoso com variedade de decisões. |
| WFC/autotiling | Resolver compatibilidade local de materiais e peças | Compatibilidade local não prova caminho global nem segurança de combate. |

Evite trocar todo o sistema pelo algoritmo mais vistoso. Compare o menor piloto
capaz de responder à dúvida, conservando entradas públicas e formato do save.

## Evidência e métricas

O script `../scripts/audit-cave-structure.mjs` usa o gerador real em memória.
Registra área aberta, proteção, acesso à saída e às faces de mineração,
distância em células e núcleos largos. A contagem de núcleos por distância à
parede é um diagnóstico morfológico; não representa número de salas ou ciclos.

Para uma candidata, acrescente conforme o escopo:

- Grafo realizado versus planejado: salas que se fundiram, portas que desapareceram,
  caminhos alternativos de fato distintos e gargalos após população.
- Percurso até uma posição adjacente a cada recurso obrigatório e retorno;
  separar inacessível, acessível após mineração e acessível imediatamente.
- Sequências de mineração e evasão usando a lógica real de orçamento/terreno;
  tempo sem decisão e retorno improdutivo precisam de observação de jogo.
- Distribuições por seed/bioma/andar e casos extremos reproduzíveis. Comparar
  medianas e extremos; não aceitar apenas uma imagem bonita ou uma média.

Não usar o número de ciclos do grafo de **células** como número de rotas úteis:
um retângulo vazio já contém muitos ciclos. Não usar unicidade de hash como
prova de variedade espacial; posições, conexões e papéis também precisam variar.

Revisar planta e câmera real nos mesmos seeds, incluindo a fronteira superior,
curvas em ambos os sentidos, chefe, explosões e biomas claros/escuros. A suíte
de testes pode provar invariantes; aceite de game feel exige jogo observado.

## Contratos que a proposta deve respeitar

`floorMask`, `layout.version`, `protectedTiles`, spawn, saída, toca, exploração,
salvamento e dados legados têm consumidores. Uma nova versão de layout precisa
de escopo e migração explícitos; não invalidar uma descida salva. A prova inicial
usa só o primeiro andar comum de cada bioma; não extrapolar para todos os andares.
O Abismo é contínuo e tem algoritmo próprio. A direção de salas da campanha
não autoriza interromper seu fluxo. Não alterar timing, economia, cores de recurso,
habilidades ou colisões para acomodar arte neste estudo.
