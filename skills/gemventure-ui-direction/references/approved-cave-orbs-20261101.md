> Atualização humana de 02/11/2026: a lojinha do Zag da caverna foi retirada. O contrato de ofertas, pedestais, preços e compra abaixo é histórico e não deve ser reintroduzido. Zag permanece somente como NPC, em `cave-zag.js` / `cave-zag-art.js`. Orbs já equipadas em saves mantêm seus efeitos e leitura até o fim da run; novas partidas não exibem slots vazios. Ver `coordination/zag-npc-only-20261102-r1/REPORT.md`.

# Orbs da caverna — aprovado em 01/11/2026

Recibo: E:/Genventure/coordination/CAVE-ORBS-UI-INTEGRATION-20261101/. Consumidores run-orb-hud, cave-merchant-art e seção Expedição da pausa. approved-orb-presentation/assets compartilham glifos canônicos e moeda entre DOM e Canvas, com cache de seis sprites estáticos e cinco imagens.

Três espaços por cor, sem repetir letras/famílias/Vazio. Ressonância lê pulseHits0–3; Aparo lê guardCooldown0–12 em batidas, pronto com check estável. As ofertas mostram nome, efeito curto, preço da descida e motivo sempre legível. Troca inclui a orb anterior. Efeitos completos ficam também em ESC→Expedição, preservando cartões, fatos anteriores e retornos.

Pedestais usam o mesmo símbolo e preço, removendo a repetição de nome/efeito no chão. Projeção, visibilidade, palco, percurso, movimento e colisão permanecem do jogo. Falta de dinheiro/equipada/comprada bloqueiam pagamento, não caminhar pelo piso. Não implementar botões de compra ou outra confirmação. O dinheiro é run.bag, nunca bank; fonte das transações continua buyOrbOnArrival/act, com ritmo e pouso final válidos. Mesma cor substitui; sem rerrolar, reembolsar ou resetar contador/cooldown. Só dura nesta descida.

Paleta azul/fonte e volume aprovados; três cores exatas ORB_FAMILIES são exceções semânticas, não cores de painéis/ações. Destaque curto só após spent subir na mesma run e um espaço mudar; não celebrar abertura/reload. Preservar som, suave, CRT e escala global. Sem copiar imagens de cenário, dados ilustrativos, Tweak, pedestais DOM ou grafo de compras da proposta para o runtime. A API de preferências de vídeo está em fila própria, com contrato vigente do produtor.
