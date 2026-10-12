# Gemventure

Protótipo jogável de mineração incremental e sincronia, em português. HTML, CSS, Canvas 2D e Web Audio; sem instalação de dependências.

## Jogar localmente

Execute `npm start` nesta pasta e abra http://127.0.0.1:4173. Execute `npm test` para verificar a geração, economia, progressão, persistência e final da expedição.

Clique nos cristais ou selecione a caverna e use as setas e espaço. O losango passando pelo centro indica o momento do golpe perfeito. Ative a música no topo. Complete oito cristais por andar, use gemas para melhorar a picareta e essências para aprender habilidades na base. O elevador preserva o andar em andamento. Há 16 andares em quatro biomas; após o manto, uma nova expedição preserva suas melhorias.

Progresso salvo no armazenamento local do navegador. Não há contas, compras, coleta de dados ou serviços de backend. A música só toca após ativação explícita. Trocar de aba, abrir a base ou pausar interrompe a mineração e o relógio rítmico; não há produção offline. O áudio é sintetizado em tempo real com um loop original de 110 BPM.

Arte gerada por código com a paleta [AREN32, por ArenSpace](https://lospec.com/palette-list/aren32). Interface com DM Sans e Space Grotesk (Google Fonts), com fontes locais de reserva. As profundidades são uma escala fictícia de jogo, não uma representação geológica.

Arquivos: `dist/engine.js` contém as regras; `dist/art.js`, a arte procedural; `dist/audio.js`, o sintetizador; `dist/game.js`, a interação e persistência. Site estático em `dist/`.
