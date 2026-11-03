# Hotfix 0.27.1 · chefes

Pedido humano de03/11/2026. A variante fica em `coordination/boss-hotfix-20261103-r1`, vinculada a GV-052. Não há troca de modelo, câmera ou paleta.

## Geodo

- Abertura frontal120°→96°: redução angular exata de20%. O raio continua7casas; não foi aplicado outro corte de20% ao raio. O total de casas afetadas depende da discretização e da direção.
- Região traseira: antes toda a semicircunferência superior(180°); agora setor de108°(−40% de abertura), oposto à direção real do tronco e restrito às costas. Os flancos W/E no mesmo alinhamento não repelem. O alcance permanece7casas, dano4 e recuo2.
- Colisão do corpo: cinco casas sólidas, com quatro quinas externas liberadas; não atravessa o centro. O alcance da picareta mantém duas casas e os alvos da coroa continuam W/E/S.
- Mesmos atlas de punhos: preparação, descida acelerada em0,07pulso, contato no quadro8 no instante do impacto e recuperação. A animação não dispara dano.
- Poeira: até8elipses por impacto(4 no suave), alpha máximo0,15 e duração0,9pulso; usa a fila existente de no máximo12eventos, sem novo emissor ou cache de atlas.

## Posição e saves

Novas arenas usam origem(12,8), acima da marca central, para todos os sete chefes. Geodo/árvore/Místico/micelial passam de y9 para8; os demais, de y10 para8. Invocações, validação, centro da fase de cabeça e raízes acompanham essa origem.

`campaignCave.bossHomeRevision=1` e `boss.arenaHome` identificam somente os encontros novos. A ausência desses campos conserva as posições e os validadores anteriores; não se muda a origem de uma luta salva em andamento. Saves não são editados no disco do jogador.

## Validação e limites

Testes focados cobrem geometria, setores por direção, contato, colisão, rodadas completas com movimento básico, pausa/efeito suave e restauração de sete encontros anteriores. A simulação usa decisões e relógio privilegiados: não representa habilidade humana nem prova que a luta ficou divertida. Antes/depois usa seed41001 e a mesma câmera. Logs e imagens ficam no pacote de coordenação. O aceite perceptivo humano continua separado dos checks técnicos.

## Desktop

O pacote `desktop/` usa Electron45.2.2, electron-builder26.18.0 e electron-updater6.8.11, preservando o renderizador. Instalador x64 NSIS e GitHub Releases foram escolhidos conforme a documentação oficial. Ganho de FPS não é garantido pela embalagem; a versão precisa de medição física. Fluxo, diretório de saves e limites de atualização em `desktop/README.md`.
