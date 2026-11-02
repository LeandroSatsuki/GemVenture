# Treino de ritmo — padrão aprovado em 01/11/2026

O usuário aprovou a proposta de treino com uma condição explícita: a faixa de pulso deve ser a mesma do jogo oficial, para o jogador reconhecer o ritmo. Autorização e evidência deste recorte: `E:/Genventure/coordination/TRAINING-UI-INTEGRATION-20261101/`. Este aceite não redesenha o mundo nem muda as lições.

## Consumidores e decisões

- `tutorial-view.js` delega a apresentação a `approved-training-ui.js` e seu CSS. `tutorial-runtime.js` continua dono dos controles, eventos, sessões e transações; os campos adicionais de apresentação são somente leitura.
- O pulso consome o `.track` real de `expeditionHudMarkup()`, com as cinco notas, `rhythmPositions`, `rhythmWave` e `createApprovedPulseFeel`. Mantém a linha de acerto em 15% da faixa. Não substituir por uma bolinha no meio ou por outro minijogo. A janela usa `actionWindowMs` e `runBeatDuration` do treino, sem copiar o BPM da campanha.
- Vida e fôlego separados; combo com `comboColor` canônico; itens 1/2/3 visíveis junto à faixa, com quantidades reais. Um item de outra lição continua disponível na prática. Sem cargas, escurece; em carga, permanece claro. Primeiro toque na leitura da respectiva lição prepara, sem consumir.
- Resumo curto, explicação integral em “i”, sem descrição ao passar o mouse. Orientação lateral aproveita a área livre; teclado, alvos e saída continuam com o consumidor. A ação principal fica visível e bloqueada até a confirmação real do objetivo.
- Cinco acertos confirmados não avançam a etapa automaticamente. Depois de pronto, um erro durante a prática pode zerar o combo atual, mas não relacra Continuar nem desmarca o objetivo já cumprido. Escudo exige bloqueio real; calor/estrelas continuam opcionais após ele. A sala livre e o elevador continuam condicionados à conclusão real.
- A ajuda de conclusão apresenta somente o `grant` confirmado pelo dono da transação; não copiar os números do perfil usado na proposta. Repetir não paga novamente. Falha de save/recarregamento e Pular permanecem acessíveis. Forja e Missões continuam nas telas reais, sem compra ou aceite automático.
- Recompensa de quartzo/rubi usa os fragmentos `assets/refuge-night-v3/gem-0.png` e `gem-1.png`, como a Forja. A imagem do minério ainda por quebrar tem outro significado.

## Escala e preservação

Tudo segue a preferência global de UI. O Canvas e suas coordenadas ficam fora do zoom dos controles. No cabeçalho e no painel flutuante do treino, o root já está normalizado ao viewport: usar âncora direita e o zoom calculado dos controles, sem deixar `right:0` restringir a largura intrínseca de uma toolbar cuja posição será medida. Conferir retângulos e pixels em cada composição; não transformar essa solução local em regra para todos os pop-ups.

Garantir o esqueleto de layout de forma síncrona antes de o World medir o Canvas. A folha visual pode chegar depois; seu carregamento deve solicitar nova medição. Conferir a cena desde o primeiro frame, inclusive em checkpoint pausado: Canvas vazio não é prova de funcionamento dos controles. Não encobrir falhas do renderer com try/catch nem substituir o World para corrigir uma medição da UI.

Preservar as 26 etapas, perfil/expedição de origem, pausa P, ESC/Pular, som e mixer, modo Suave, 80/100/120 BPM nas condições atuais, entrada protegida de quatro pulsos, uma ação por batida, pausa ao perder visibilidade e checkpoint. Não transportar contadores ilustrativos da proposta para o core. Controller, training, reward, clock, World e HUD oficial não são arquivos substitutos desta view.

Em novas alterações, comparar com os recibos vigentes, a implementação atual e as capturas nativas do recorte. Aceite humano da proposta, aplicação e verificação técnica continuam evidências distintas.
