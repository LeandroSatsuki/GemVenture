# HUD e vida de bosses — 02/11/2026

Pedido direto: retirar “próxima estrela”, aproveitar a coluna vertical, reduzir
o contador de minério/cristais e levar a vida dos bosses para o espaço superior.
Escopo autorizado de apresentação; aceite posterior desta aplicação fica separado.

- Estrelas preservam eixo vertical, marcos numéricos, preenchimento e animações
  existentes. Retirar a frase repetida e devolver esse espaço ao eixo.
- Contadores conservam valores e unidades. Reduzir a ocupação do quadro de carga
  e do saldo da mochila sem diminuir os alvos de itens, pausa ou retorno.
- Boss principal tem uma única identificação/vida no HUD superior. Adotar o
  mesmo elemento real `#bossHud` no plano global de UI, conservando seus IDs,
  ataque, instrução, fase, vulnerabilidade e atualização pelo domínio atual.
- Nome/HP deixam de acompanhar o corpo; sinais de ataque e contagens locais
  continuam no mundo. Fora do HUD de expedição, conservar o fallback do painter.
- Painel azul `#102a52 → #06132b`, borda `#26538c`, sombra `#020816`, texto
  `#edf4ff`, apoio `#bfd0e8`; Fredoka/Nunito600. A cor canônica de
  `BIOME_ART[index].accent` fica somente na vida e no acento superior. Vulnerabilidade
  usa o sinal semântico verde já aprovado; nenhuma recoloração de bioma ou arte.
- Transição de vida de140ms, sem loop de brilho, sem áudio novo. Modo suave e
  preferência de movimento reduzido mantêm valores sem interpolação.
- Calcular faixa livre entre combo/vida e localização no plano lógico da escala
  global. Se faltar largura, usar a faixa imediatamente abaixo dos controles.
  Reservar folga temporária da missão e restaurá-la ao ocultar/derrotar o boss.
- Conferir a cascata inteira: o legado oculta `#bossHud` com clip/altura de1px.
  Alterar posição/display sem remover esse recorte não torna a barra visível.
- Preservar a Sentinela e as barras de inimigos comuns. Não mudar dano, HP,
  exposição, relógio, save, loot ou regras específicas dos sete bosses.

Prova nativa com perfis sintéticos não é playtest humano nem aprovação estética.

## Correção humana posterior: ajuda opcional

O usuário aprovou a barra e retirou as instruções abaixo do nome. A barra contém
nome e vida; fase e comandos continuam disponíveis ao código, ocultos no painel.
Explicações aparecem em um único balão junto ao boss somente com “Habilitar ajuda”
ativa em Configurações / Interface. Começa desligada, persiste em preferência
separada do save e não muda resets de luz/áudio/tamanho. Desativar elimina o balão
sem fila, repetição ou alerta antigo. As instruções consultam o estado atual e o
relógio real dos sete bosses. Marcas, áreas de perigo, animações e contagens visuais
dos ataques permanecem mesmo com a ajuda desligada. Não adicionar narração/SFX.

No Místico, o balão usa o centro da arena para não entregar a cópia verdadeira.
Repouso/transformação não repetem falas passivas; a dica vem da mecânica ativa.

O balão converte os limites físicos do HUD para o plano da câmera e procura
área livre dos controles, missão, vida, estrelas e avisos. Sem área livre,
cede ao HUD e não conserva uma dica ultrapassada em fila.
