# Manutenção e limpeza

`dist/` contém o código-fonte e os assets atuais do jogo. Não apagar essa pasta
como se fosse uma compilação. `tests/`, `tools/`, `docs/` e `skills/` contêm
verificação, ferramentas, documentação e contratos mantidos.

## Diretórios de trabalho

- `asset-work/`: produção local. Prompts, inventários, proveniência, referências
  e dependências das ferramentas ficam preservados; capturas, logs, candidatas
  antigas e cópias de checkout sem consumidor podem ser descartados após revisão.
- `promo/`: fontes e entregas do trailer. Filmes finais, mixagem e press kit
  são entregas; quadros e amostras intermediárias de QA são temporários.
- `../Assets/`: packs originais e licenças, fora do jogo publicado.
- `../coordination/`: contratos, aprovações, evidências e checkpoints da equipe.
  Não apagar essas provas por ausência de importação no runtime. Binários de
  ferramentas externas antigas podem ser reinstalados quando necessários.
  O OBS portátil antigo e seu instalador foram excluídos em 25/10/2026, após
  autorização humana específica do lote adicional de limpeza. Configurações,
  fontes, takes, relatórios e checkpoints da equipe continuam preservados.

A mesma limpeza retirou candidatas raster antigas não integradas, a cópia local
antiga para publicação e amostras intermediárias de QA do trailer. Novas entregas
devem recriar somente as pastas de trabalho necessárias e ser integradas por
manifesto de família antes de entrar em `dist/assets/`.

Não manter prints, amostras de áudio ou exportações grandes na raiz. O ateliê
portátil pode ser recriado por `npm run export:studio`, em
`../Assets/exports/atelie-gemventure.html`; o jogo e o ateliê local
em `dist/art-studio.html` não dependem dessa exportação.

## Verificação antes de excluir arte

Execute `npm run audit:assets`. A auditoria é somente leitura: procura nomes e
caminhos nos módulos, folhas de estilo e páginas atuais, reconhecendo também os
nomes gerados pelo portão, pela vila e pelo estúdio de terrenos. Preserva fontes
editáveis dos templates, metadados e licenças. Retorna falha quando encontra mídia
sem referência reconhecida ou URL literal de asset ausente.

Uma referência textual pode ser metadado antigo; ausência pode ser resultado de
um novo carregador dinâmico. Por isso a saída é uma lista para revisão, não uma
autorização automática para apagar. Conferir registros e consumidores, nomes
montados em código, prévias mantidas, ferramentas, documentação e concorrência.
Ao adicionar um carregador dinâmico novo, atualizar a auditoria no mesmo lote.

A auditoria atual reconhece conservadoramente famílias de atlases/cosméticos
montadas por prefixo e separa arte usada apenas por regressões. A presença de um
prefixo mantém a família inteira; não prova uso de cada imagem individualmente.

Após a limpeza, executar `npm run check`, `npm test`, `npm run audit:art` e
`npm run audit:assets`, além de verificar as páginas afetadas quando necessário.
Preservar saves e preferências no navegador e registrar as exclusões por caminho,
motivo, tamanho e hash. Não usar limpezas globais do Git: há trabalho local ativo.

## Distribuição e revisão de 02/11/2026

Use `npm run build:release`: o pacote é criado fora da árvore do jogo, em
`../releases/`. O comando recusa sobrescrever uma distribuição existente e inclui
um manifesto de hashes. O fechamento de imports mantém os módulos ativos; folhas
de estilo e famílias dinâmicas são conservadas sem minificar ou recomprimir arte.
O teste de pacote cobre os sete biomas, músicas e quatro visuais do minerador.

100 arquivos substituídos/temporários ou gerados foram retirados da árvore do
jogo, cerca de 197 MiB. A exportação portátil foi transferida para fora do jogo,
preservada byte a byte. A recuperação por caminho e hash está em
`../../coordination/cleanup-performance-20261102-r1/ARCHIVED.json`. Fontes de arte,
marketing, testes e checkpoints existentes foram preservados. Arquivos de QA e
versões antigas não devem retornar ao pacote para publicação.

Regras de desempenho preservadas neste lote:

- O HUD padrão usa o layout CSS sem ler geometria por quadro. Personalizações
  recalculam ao mudar preferências, tamanho ou estrutura; observadores são liberados.
- Avisos vazios/ocultos não consultam estilos calculados; avisos ativos mantêm
  o posicionamento e a proteção dos controles.
- As imagens das animações do minerador têm cache de quatro entradas e orçamento
  de 192 MiB de pixels RGBA mantidos pela aplicação. Carrega-se a animação atual,
  idle e a próxima ação, com três segundos de antecipação. As sequências e imagens
  aprovadas não mudam. O navegador pode manter caches próprios além desse valor.
- A música sintetizada agenda 240 ms à frente, em vez de 120 ms, no relógio de
  áudio. Pausa/silêncio continuam cancelando notas; julgamento rítmico não muda.
- A máscara emissiva dos cristais ignora pixels transparentes e descarta cores
  fora do raio antes de calcular distâncias. 84 comparações nativas de saída e
  máscara RGBA foram idênticas.

Medições headless, testes sintéticos e microbenchmarks não equivalem a FPS na
máquina do jogador ou certificação Steam. Não remover efeitos, trocar engine ou
apagar dados de save para mascarar uma queda de desempenho. Registrar primeiro
CPU, quadros longos, imagens decodificadas, cenário e condições do áudio.
