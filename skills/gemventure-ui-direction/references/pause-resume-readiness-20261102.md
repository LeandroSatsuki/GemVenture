# Contrato de pausa e primeira pintura — 02/11/2026

Solicitado e aplicado no pacote PAUSE-RESUME-SURFACES-20261102-R1. Consultar APPLIED-RECEIPT.json para a prova vigente. O pedido autoriza implementação/correção; não equivale a um playtest humano posterior.

Configurações abertas na expedição mantêm o mundo pausado. Fechar/Voltar/Esc retorna à pausa. Aplicar e continuar usa o mesmo caminho de Continuar: contagem de três segundos sem avanço da música ou da simulação. Não usar setTimeout solto para retomar. Aba oculta, nova UI, troca de contexto ou lacuna longa de frames cancelam a contagem. Música/cenário em preparação não consomem a contagem.

A retomada concede graça de ritmo por pelo menos três batidas e dois segundos do relógio corrente. Não conceder acerto, loot ou ação gratuitamente, não usar guardUntil e não bloquear dano de inimigo. Preservar combo/fôlego/contadores em erro de ritmo/silêncio. A janela pertence à instância da sala em WeakMap; não salvar nem migrar esse estado. O indicador acompanha o bloco de combo, inclusive escala/posição personalizada e ocultação.

Shadow DOM com link externo pode pintar conteúdo antes do CSS. A prontidão da arte de mundo não prova que a UI está pronta. Usar prepareStyledSurface no host comum dos serviços e nos hosts próprios, ou uma solução equivalente que já insira todo o CSS antes da marcação. Não confiar somente em visibility herdada: descendentes podem torná-la visible. O host deve ficar transparente e inerte; conter o layout cru; aguardar todas as folhas, fontes e estabilização da geometria antes de revelar. Falha de CSS não autoriza revelar imagens cruas.

Cartas temporizadas exigem quatro segundos visíveis de decisão; a espera pela superfície não pode consumi-los nem aceitar teclas para uma carta ainda invisível. Não remover o conteúdo ou o controle para disfarçar o flash. Usar os mesmos arquivos de arte e os mesmos callbacks/transações.

Regressão: verificar atraso, erro e descarte de estilos; fases3→2→1, congelamento de mundo/música, cancelamento e fim real da graça; dano de inimigo continua normal. Separar imagens nativas, amostra de estado por RAF, unit tests e teste auditivo. Comparações de pixels exigem mesmo viewport. Registrar falha de harness desatualizado separadamente de uma falha do runtime; nunca apagar o log bruto ou relaxar uma asserção para esconder a falha.
