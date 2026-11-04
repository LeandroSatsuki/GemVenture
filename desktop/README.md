# GemVenture para Windows

O aplicativo mantém a arte, os shaders, o áudio e os controles do jogo web. O runtime Chromium acompanha o instalador; executar fora do navegador não garante ganho de FPS por si só.

Requer Node.js 24 para produzir o pacote:

```powershell
cd desktop
npm ci
npm run prepare:game
npm start
npm run dist
```

`prepare:game` usa o conjunto de arquivos de produção do projeto, sem testes ou ferramentas. Execute em uma árvore de build nova. O instalador x64 NSIS aparece em `artifacts/` junto de `latest.yml` e do arquivo `.blockmap`.

As partidas desktop ficam em `%APPDATA%/GemVenture`; o desenvolvimento usa `GemVenture-desktop-development`. O save do navegador/itch.io não é transferido automaticamente. Atualizações preservam o diretório de dados e a desinstalação mantém seus dados.

## Atualizações

O aplicativo consulta Releases públicos de `LeandroSatsuki/GemVenture`, mantém download e reinício sob comando do usuário no menu nativo **GemVenture → Verificar atualizações**, e não instala ao sair. Não executa código de branches ou de páginas remotas.

Para distribuir uma atualização, aumente a versão deste pacote, gere o NSIS e publique o `.exe`, o `.blockmap` e `latest.yml` no mesmo GitHub Release. Um push de código sozinho não atualiza aplicativos instalados. O workflow manual `desktop-windows.yml` prepara esses arquivos como artefato de CI; a publicação é uma etapa explícita.

Assinatura Authenticode pode ser configurada no ambiente de build usando os meios oficiais do electron-builder. O projeto não inclui chaves, certificados nem tokens. A primeira candidata local não é assinada; distribuição e teste real de upgrade entre duas versões são etapas distintas da geração do instalador.

O processo do jogo usa isolamento de contexto, sandbox, integração Node desativada e protocolo local restrito aos arquivos do jogo. Links HTTPS abrem no navegador padrão; janelas remotas não são carregadas como jogo.

## Modos de tela

Em Configurações → Vídeo: Tela cheia, Janela e Janela sem bordas. O aplicativo abre maximizado por padrão em Janela e lembra o modo escolhido em display-mode.json, separado do save. F11 alterna tela cheia/janela. A janela sem bordas cobre o monitor atual; Alt+Tab continua disponível. A troca reparenta a mesma WebContentsView entre frames nativos, sem recarregar a página, o áudio ou a partida. Não significa fullscreen exclusivo nem ganho garantido de FPS. No navegador, tela cheia usa a API do próprio navegador; Janela sem bordas só está habilitada no aplicativo Windows.

Referências: https://www.electronjs.org/docs/latest/api/base-window e https://www.electronjs.org/docs/latest/api/web-contents-view.
