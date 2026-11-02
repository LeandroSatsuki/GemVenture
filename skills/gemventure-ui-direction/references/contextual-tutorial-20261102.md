# Tutorial contextual — 02/11/2026

Pedido humano vigente: ensinar por ordem de jogabilidade, com pouco texto, treino
livre, gatilhos por desbloqueio/primeiro uso e consulta posterior. Aplicação foi
solicitada diretamente; testes não representam aprovação perceptiva do tutorial.

## Jornada inicial

Nome → convite para som, com alternativa silenciosa → prática do pulso sem mira →
primeira expedição → primeiro andar concluído e retorno efetivamente coletado →
primeiro aprimoramento real. Ler a explicação não equivale a comprar uma melhoria.
Não exigir cinco acertos para sair do treino inicial; permitir repetir à vontade.
Manter curso completo de 26 etapas, guia anterior e passeio manual disponíveis.
Treino usa simulação descartável; não deposita recompensas nem financia melhorias.

## Gatilhos

`learning-path.js` é o catálogo canônico com critério, páginas, imagens e passos.
Árvore: ponto/nível real. Relicário: 30 estrelas conquistadas, mesmo após gasto.
Missões: primeira expedição e primeira visita. Pets: companheiro disponível.
Forja: primeira compra e primeira visita a cada projeto. Abismo: guardião20 e
portão realmente habilitado. Cartas, fogueira, retorno e orbs: contexto real.
Um desbloqueio agenda orientação; não abre um painel no meio do combate.
Durante a caverna, esperar pausa, andar concluído ou escolha segura.
Nome, áudio e boas-vindas não são reapresentados compulsoriamente em perfis antigos.
Guia permite rever, retomar jornada, pausar dicas e repetir treino.

## Persistência e apresentação

Estado separado por `accountScore.id`, versão1; nunca reescrever saves de gameplay.
Ignorar IDs desconhecidos e preservar dados futuros. Sem copiar progresso entre
contas. `Depois` suspende a entrada ou dispensa a dica; não gera crédito.
Uma decisão por passo, arte canônica, Fredoka/Nunito, azul da família aprovada,
CTA amarelo, alvos ≥44px, foco/ESC, escala global e janela limitada à viewport.
Não alegar teste com jogadores, toque ou tempo de aprendizagem a partir de testes
automatizados. Conferir composição no navegador com o CRT oficial.

## Sentinela: correção que prevalece sobre o recorte anterior

Remover anúncio “Sentinela derrotada” e painel global de vitória. O jogador viu a
morte; mostrar só ícone e quantidade de moedas/fragmentos subindo no local real.
Usar evento de vitória confirmado, somar moeda ordinária da morte ao bônus visual,
suprimir somente os números duplicados; não alterar transações, regras nem VFX.
Preservar HUD vivo da Sentinela e seu espaçamento com a missão.

## Pesquisa e limites

- [Apple — Onboarding for games](https://developer.apple.com/app-store/onboarding-for-games/):
  núcleo primeiro, aprendizado curto e contextual, liberdade para pular/rever.
- [Factorio FFF361](https://www.factorio.com/blog/post/fff-361): dicas por gatilhos,
  dependências e índice consultável.
- [Roblox Creator — Onboarding techniques](https://create.roblox.com/docs/production/game-design/onboarding-techniques):
  orientação junto da primeira interação e prática progressiva.
- [GDC — Prime, Teach, Observe](https://gdcvault.com/play/1021120/Prime-Teach-Observe-Tutorializing-Innovative):
  resumo público da palestra; vídeo completo não foi auditado.

Esses princípios orientam a implementação; não copiar layout nem atribuir aos
jogos de referência mecânicas que não foram verificadas.

## Revisão humana posterior — orientação da dungeon por escolha

O usuário relatou interrupções excessivas mesmo nas pausas seguras. Prevalece no
recorte da caverna: não abrir dicas automaticamente durante uma expedição real,
incluindo ESC, fim de andar, cartas, fogueira, recuperação e Configurações.
Preservar os gatilhos e o progresso para consulta, sem transformar uma descoberta
num pop-up. Não reapresentar dicas da caverna em sequência automática no refúgio.

Antes de descer, o Elevador oferece **Guia da expedição**, iniciado pelo jogador.
O guia reúne orientações curtas numa única sequência, com barra de progresso,
**Pular guia** e **Concluir**; concluir não inicia a viagem nem compra melhoria.
A biblioteca e o botão **Tutorial** na pausa permitem consulta voluntária.
O tutorial inicial de nome, som e treino e as orientações dos serviços no refúgio
continuam com seus próprios critérios. Não alterar mecânicas nem recompensas.

Esclarecimento humano: manter **Novo** visível até a primeira abertura voluntária.
Abrir e fechar já reconhece a existência da ajuda; não exigir ler, concluir,
terminar uma run ou aceitar treino. Registrar esse reconhecimento separado de
`seen` por conta, preservando as lições não lidas e a consulta posterior.
