# Ficha e validação de um encontro

## Definição para discutir com o usuário

Entregar a menor ficha que permita imaginar e avaliar a luta:

- Boss, andar/bioma, baseline e etapa; o que já foi aprovado.
- Fantasia do encontro e verbo principal do jogador, em uma frase simples.
- Mecânica atual, problema específico e diferença da proposta.
- Sinal percebido → decisão → comando → resposta → oportunidade/punição.
- Ciclo em batidas, posição inicial e destino, janela e reset. Marcar números
  provisórios. Separar ações da simulação de movimentos puramente visuais.
- Estados/entidades novos, reuso e custo relativo; interações com autoaproximação,
  combo, fôlego, pets, procs, itens e restauração.
- Uso da sala nova: espaço de circulação e elemento funcional realmente necessário.
  Dizer quando nenhum objeto de arena novo é necessário.
- Segunda fase que desenvolve a mesma ideia, sem camadas simultâneas arbitrárias.
- Critério de sucesso e falha, recuperação após erro e pendências para o protótipo.

Escolher uma hipótese central por piloto. Alternativas são opções para decisão,
não uma lista de ataques que será implementada inteira. O usuário pode rever a
ideia antes da produção, sem perder os componentes anteriores aprovados.

## Protótipo mecânico após autorização

Usar geometria simples no pipeline existente. Medir:

1. O jogador entende o sinal e sabe o próximo comando sem ler parágrafos?
2. Existe resposta alcançável com mobilidade e dano básicos, inclusive no canto?
3. Há algo útil/legítimo para fazer em cada batida, sem duas ações obrigatórias?
4. Autoaproximação respeita o flanco/destino que a luta exige?
5. A mecânica evita farm infinito, saída prematura, invulnerabilidade eterna,
   bypass por pets/procs e morte sem aviso?
6. Quanto dura uma luta com build básica e forte? Quanto é tempo de espera?
7. O jogador consegue se recuperar de um erro sem uma cascata inevitável?

Casos de borda: replay com mesma seed e ações, abertura/fechamento de janela,
input antes/depois do tick, pausa e aba oculta, save no aviso e no impacto, morte
do boss no meio da ação. Recompensa e desbloqueio são pagos uma vez e preservados.

Registrar testes de código e observação da luta separadamente. Ficha aprovada
permite trabalhar a direção visual conforme o pedido; protótipo executando não
equivale a diversão aprovada. Ajustar a hipótese antes de investir em arte final.

## Direção de arte após aprovação da mecânica

Inventariar o modelo atual e os elementos que dão identidade. Nomear partes e
decidir quais precisam separar para operar a mecânica. Atribuir geometria/material,
pivô, conexão e quais faces são conhecidas. Registrar incertezas da referência.

Conferir a projeção real na câmera da caverna e a escala junto ao minerador.
Preservar formas polidas, contornos seletivos, cores do bioma e brilho direcional
nas quinas; destacar o boss por silhueta, valor e leitura do ponto fraco. Não
clarear toda a cena nem mudar a paleta global para compensar um material.

Validar conceito/pose e vistas necessárias antes de fabricar todas as animações.
Adaptar a referência ao contrato ativo; não confundir uma frente de apresentação
com a perspectiva de gameplay. Não assumir faces invisíveis reconstruídas fielmente.

## Plano de animação derivado da mecânica

| Campo por estado | O que definir |
|---|---|
| Estado e causa | Evento/condição real, parte que move, direção e alvo fixado ou rastreado |
| Tempo | Início, antecipação, impacto e recuperação em batidas/fração de batida |
| Corpo e rosto | Peso, apoio, olhar, expressão e movimento secundário |
| Técnica | Pivôs, sockets e camadas; efeito/sombra ancorados no lugar correto |
| Interrupção | Hit, stun, nova fase, pausa, morte e saída de cena |
| Modo suave | Manter o aviso e o momento de acerto sem flashes/tremor excessivos |

Idle vivo não significa balançar todos os componentes igualmente. Preparação
indica intenção; impacto tem peso; recuperação deixa consequência. Evitar membros
atravessando corpo, mangas fora de camada, ferramenta virada, chão que acompanha
ator no salto e troca brusca de direção. Validar em escala de jogo, não só ampliado.

O impacto visual ilustra a resolução; não causa dano por conta própria. Áudio e
VFX usam os eventos do combate e o relógio comum, sem duplicar disparos no replay.

## Integração

Preservar a arena e seus limites; acrescentar objetos funcionais somente quando a
mecânica aprovada exigir. Testar juntos visibilidade, navegação, dano e apresentação.
Comparar mesma câmera, seed e configurações, antes/depois, no bioma do encontro.
Usar os testes existentes e acrescentar regressões dos novos estados reais.

Entrega: ficha e aceite, revisão/arquivos, baseline e recibo, evidências visuais e
de combate, resultados, limitações e próxima decisão. Atualizar a documentação
existente. Não chamar de implementados os outros bosses, VFX, sons ou animações
que constem apenas como intenção na ficha.
