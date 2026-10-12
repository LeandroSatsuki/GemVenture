# Gemventure — Ecos das profundezas (Alpha 0.2)

Jogo incremental de mineração rítmica em português, com salas procedurais em semi-top-down, combate, morte e progressão permanente. Canvas 2D e Web Audio, sem dependências de execução.

## Rodar e verificar

Execute `npm start` e abra http://127.0.0.1:4173. Execute `npm test` para verificar as regras, a migração e expedições completas.

## Controles

- Clique num cristal ou criatura: dash de até 5 casas e golpe ao chegar ao alvo.
- Espaço: continuar atingindo o alvo. Tab: trocar alvo. Shift+Tab: sair do foco da caverna.
- WASD ou setas: esquivar no ritmo. Clique no chão para deslocar-se.
- P ou Escape: pausar. E: solicitar extração. Ative a música com ♫.
- Uma ação por batida, 110 BPM. Janela inicial ±100 ms; Ouvido de cristal adiciona 25 ms.

## Ciclo de evolução

1. Na base, visite construções desenhadas no cenário: forja, fonte, árvore e elevador.
2. Escolha até cinco habilidades aprendidas. A árvore tem 17 nós, três caminhos e conexões entre eles. Trocar a build é gratuito na base.
3. Comece uma nova caverna no andar 1. A cada tentativa muda a semente das salas.
4. Cristais têm dureza, valor e carga diferentes. O Jardineiro faz novos cristais nascerem a cada seis batidas. Cristais vitais recuperam fôlego.
5. Criaturas se movem no pulso e marcam o local do próximo ataque. Esquive, derrote-as ou use habilidades de atordoamento e defesa.
6. Acertos recuperam fôlego. Erros, batidas perdidas e ataques drenam a reserva. Ao chegar a zero, a expedição termina e 50% das gemas da mochila são salvas. Habilidades, moedas na base e essências permanecem.
7. Reúna a carga exigida e mantenha a sequência atual exigida para estabilizar a sala. A sala fica segura para escolher entre descer (+15 de fôlego) e voltar (100% da mochila).
8. Retirada de emergência antes de estabilizar salva 50%. Depois de retornar, invista em habilidades, força e fôlego.
9. Andares 4, 8 e 12 exigem construir na base os selos da Floresta (110 gemas), Ancestral (260) e do Manto (480). O recorde necessário é permanente. Cada nova expedição volta ao andar 1.
10. Complete o andar 16 e extraia para concluir a jornada. Novas expedições preservam todas as melhorias.

## Dados e limites do protótipo

Salvamento local em `gemventure-save-v2`; os dados da Alpha 0.1 são migrados preservando gemas, essências, nível e habilidades equivalentes. O salvamento antigo permanece intacto. Uma partida recarregada começa pausada. Não há produção offline; trocar de aba pausa a partida. Áudio sintetizado original, ativado pelo jogador. Arte procedural usando a paleta AREN32 de ArenSpace: https://lospec.com/palette-list/aren32. Profundidades e geologia são fictícias. Interface em DM Sans e Space Grotesk, com fontes de reserva.

Arquitetura: `dist/core.js` contém regras e progressão; `dist/world.js`, cenário e efeitos; `dist/run.js`, controles, relógio e interface; `dist/audio.js`, sintetizador. `dist/index.html` e `dist/screen.css` compõem a tela. O pacote é estático. Hospedagem privada no mesmo Site da Alpha 0.1.
