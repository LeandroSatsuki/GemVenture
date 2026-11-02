# Sentinela do Veio — aprovada em02/11/2026

Fonte: SENTINEL-UI-PROPOSAL-20261102/v1 e aceite direto; aplicação SENTINEL-UI-INTEGRATION-20261102.

Visibilidade real governa a leitura: próxima e não visível mostra apenas “Sentinela próxima / Opcional”; visível mostra nome, vida numérica/barra e “Golpeie para enfrentar”; engajada usa “Em combate / Afaste-se para recuar”. Recuo mantém feridas. Estados ignorado, derrotado e andar concluído não conservam barra. Não revelar vida de alvo escondido, trocar criatura, criar CTA de combate ou alterar ataque marcado/relógio.

Vitória só responde ao evento confirmado da Sentinela atual com rewardClaimed. Mostrar bônus de moedas/fragmentos com artes canônicas e “Na mochila”; não antecipar depósito na base ou misturar saque ordinário. O presenter não paga novamente. Deduplicar por encontro, sem inferência a partir de save; fila cosmética limitada a quatro pendentes e um atual. Interrupções conservam duração; trocar perfil limpa a apresentação.

Família azul/Fredoka/Nunito, proximidade âmbar, vida inimiga vermelha e ganho ciano. Barra muda em140ms; vitória tem acento único de180ms, sem piscar. Suave mantém valores estáticos. Header ocupa faixa livre entre combo e localização; dimensões são recalculadas no plano local da escala global. Quando a missão ocupar a mesma faixa na escala ampliada, aplicar somente uma folga vertical temporária à missão via --sentinel-mission-offset; restaurar zero ao ocultar o encontro. Em espaço restrito, não reduzir fontes. Avisos passivos nunca interceptam entrada. Recompensa aguarda perigo/descoberta e precede nível; se não houver área sem sobrepor ação/controles, aguarda.

Manter áudio de warning/claim e efeitos no mundo com seus donos. Suprimir apenas toast/proc textual duplicado da mesma vitória. Regras, transações, visibilidade, save, combo colorido e pulso permanecem fora do escopo. Diferenciar captura nativa sintética de teste de gameplay normal e aceite humano.
