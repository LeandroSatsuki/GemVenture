# Ouriço da toca — arte e interação

Pedido humano de 14/10/2026. A nova interação substitui a antiga regra de
que o ouriço seria apenas cenário e nunca receberia uma picaretada. A
colisão da parede e a posição segura da toca continuam preservadas.

## Referência visual

`docs/media/gemventure-cover.png`: ouriço gigante à esquerda da capa do
GitHub, rosto claro, volumes escuros e cristais grandes nas costas. A capa
define aparência, não a projeção do sprite. A nova arte deve seguir a câmera,
contorno, acabamento e volumes dos PNGs de criaturas aprovados no jogo.
Cor do corpo igual nos sete biomas; somente os cristais mudam de cor.

O **Diretor De Assests** recebeu a referência e o pedido completo: toca
fixa; corpo, face/olhos, patinhas e cristais com apoios comuns; dança no BPM;
contato da picareta; expressão triste, patinhas recolhidas, encolhimento e
retorno à dança. Usar camadas/poses controladas. Corpo cerca de quatro vezes
a largura do minerador, sentado dentro do buraco da parede e observando o
tabuleiro. Não reutilizar o desenho procedural antigo como nova arte final.
O pacote novo ainda está em produção; o renderer atual é provisório.

## Comportamento implementado

- Clique no corpo visível seleciona o ouriço. O personagem usa o movimento
  normal para chegar à frente da toca; não atravessa muro nem pedra.
- Picaretada no ritmo provoca uma reação não letal. O ouriço encolhe,
  recolhe as patas e se recupera antes de voltar à dança. A nova expressão
  facial será aplicada com as camadas entregues pelo diretor de assets.
- Quando a brotação está disponível, nascem até **3 cristais** de verdade
  na sala. Eles usam distribuição, resistência e valor normais do bioma.
  É preciso minerá-los para receber recursos; acertar o ouriço não paga
  gemas, XP, missão de matar ou carga de elevador diretamente.
- Intervalo inicial: **6 batidas** entre brotações. Orçamento: **9 cristais
  extras por andar**. No Abismo, renova ao entrar na próxima seção; mover
  ou recriar a posição da toca não renova o orçamento.
- Limite de 64 cristais vivos e 180 registros de nós na sala. Sem espaço,
  não cria pilhas, não coloca cristais em paredes e não gasta orçamento
  por uma tentativa de nascimento que falhou.
- Reação visual: contato inicial, duas batidas triste/encolhido e uma de
  recuperação. Novo golpe pode reiniciar a reação sem furar a cadência da
  brotação. Modo suave reduz deslocamentos; pausa congela a fase.
- Golpe fora do ritmo, repetido na mesma batida ou dado de longe não gera
  cristais. Aproximação bloqueada ainda registra o ritmo, como a parede.
- O ouriço tem interação própria; permanece fora das listas de inimigos,
  rochas e cristais. Explosões/habilidades em área não acionam a brotação.
  Não recebe barra de vida de inimigo nem bloqueia o encerramento da fase.
- Hover curto: **OURIÇO / BATA PARA BROTAR**, **DESCANSANDO** ou **SEM ESPAÇO**.

Os limites são parâmetros de balanceamento em `dist/hedgehog.js`, sem
alterar a curva dos cristais comuns ou criar outra moeda. São valores
iniciais ajustáveis, não uma promessa de equilíbrio final.

## Eventos e ligação com a arte

`hedgehogHit`: `{x,y,beat,damage:1,spawned}`. `damage` identifica o contato
visual não letal; não é dano ao jogador nem uma morte do ouriço.

`hedgehogGrow`: `{x,y,count,targets:[{x,y,kind}]}` na brotação provocada.
O evento passivo anterior continua compatível. Cada cristal também emite
o `sprout` normal. Os eventos não são callbacks de pagamento de animação.

`room.hedgehogGrowth` guarda orçamento, seção, golpes, última reação e
próxima brotação. O salvamento preserva os dados; saves antigos podem não
conter o objeto. A restauração rejeita campos corrompidos. O estado fica
separado de `room.hedgehog` para impedir renovação ao reposicionar a toca.

## Verificação

Testes de interação cobrem timing, repetição, movimento/bloqueio, orçamento,
capacidade, save/legado, Abismo, máscara de clique, pausa e modo suave.
QA de clique real: `/expedition-preview.html?hedgehogcheck` somente no
servidor isolado 4196. Nunca abrir essa fixture sobre a origem do save real.
Arte nova e suas variantes só serão consideradas integradas após entrega,
conferência dos pivôs/cache e validação visual no combate.

A suíte completa passou com 447 testes antes da última revisão de camadas;
depois dela, os 12 testes focados de ouriço/composição passaram, incluindo
o caso adicional de explosão sem ativar o ouriço nem derrotar o chefe.
O teste de clique real confirmou quatro contatos no canvas, quatro acertos
registrados e nove cristais extras, sem erros de página. A frente da toca
é desenhada antes dos atores para não encobrir a cabeça do minerador.

Revisão final: 17 testes focados passaram após os ajustes de apresentação.
Na captura `hedgehog-interaction-qa.jpg`, a cena usa a arte provisória e
confirma `hits:4`, `bonus:9`, `mood:sad`, quatro cliques válidos e nenhum
erro de página. A fixture espera o contato musical antes de congelar a
reação. O save real do jogador não foi alterado. Auditoria do gerador
procedural: 5.922 variantes, 33 famílias, sete biomas, máximo 30 formas;
essa auditoria não certifica a futura arte raster do ouriço.


## Atualização de 01/11/2026 — refúgio no Abismo

Nas novas descidas aprovadas, o ouriço se abriga em nichos de paredões ricos em
cristais. Ele cultiva o veio: a picaretada no pulso faz cristais brotarem ao redor.
A entrada descoberta fica livre da sobreposição quadriculada de névoa, sem
revelar o mapa nem alterar colisão. Inclusões minerais na parede e a descrição
contextual explicam o habitat. Cadência, orçamento e reação não letal permanecem.
Tocas fora da janela não são selecionáveis. Descidas antigas mantêm o layout
ativo; uma nova partida usa `room.abyssCave.version=1`.

Contrato e módulos: [abyss-caves-v1.md](abyss-caves-v1.md).
