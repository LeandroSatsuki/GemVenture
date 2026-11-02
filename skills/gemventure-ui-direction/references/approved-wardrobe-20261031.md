# Minerador/Vestiário — proposta v1 aprovada em31/10/2026

Ao alterar o Vestiário, consultar a aprovação em `E:/Genventure/coordination/WARDROBE-UI-INTEGRATION-20261031/HUMAN-APPROVAL.json`, a aplicação em `APPLIED-RECEIPT.json` e a verificação em `QA.json`. A aprovação é da proposta; não inferir revisão humana do jogo integrado. Pets é a proposta seguinte e exige aceite próprio.

- A função é personalizar o personagem, consultar XP/pontos e acessar Pets/Talentos/Forja. Não transformar a tela em loja nem acrescentar confirmação de vestir. Preservar a troca gratuita/imediata, os cinco slots e os IDs reais. O catálogo atual possui sete peças e quatro combinações de capacete/blusa.
- O host prepara um draft, salva e só então instala a roupa. Falha mantém o visual anterior. A apresentação dá impulso breve apenas depois da confirmação; uma peça já em uso não recebe recompensa falsa. Pontos/XP não mudam ao vestir.
- Personagem maior à esquerda e catálogo à direita, adequado à escolha visual. “Todas” e categorias/paginação mudam a vista, não a regra. Mudar peça/categoria/página mantém o espaço reservado. O catálogo deriva dos dados; crescer aumenta páginas, sem esticar os cards ou a janela.
- Ciano distingue navegação; verde/check indica peça em uso. A paleta e o relevo pertencem à família aprovada, com Fredoka e Nunito nos pesos locais. Atalhos52px; fechar vermelho também em repouso. Em formato estreito, preservar os alvos e os rótulos, considerando a largura útil após barras externas.
- Duas poses locais usam somente `front.png` e `wardrobe.png` existentes. Não criar giro3D, nova roupa ou nova animação. A metadata de aprovação da arte ativa permanece independente do aceite de UI.
- Nível no cabeçalho, XP em barra real e formatoatual/próximo, pontos junto de Talentos. Pets conserva seu contador e o serviço real; Forja é o destino de equipamentos. Preservar bloqueios e o retorno de foco ao acionador do refúgio.
- Atualmente só existe a aparência completa `miner-default`, sem transação pública de troca. Não desenhar um seletor de opção única nem inventar novas aparências. Futuras aparências precisam de opções/transação reais; podem reutilizar a região de prévia/coleção, respeitando sua função distinta dos slots.

Consumidores: `dist/approved-wardrobe-ui.js`, `.css`, `run.js:showWardrobe` e escopo específico em `approved-services-shell.css`. O host mantém domínio, persistência, áudio e bloqueios; o componente guarda categoria/página/pose de apresentação. O caminho legado `showWardrobe('pets')` e seus handlers foi conservado. `openDialog` aplica o estilo novo de Wardrobe somente ao mount moderno de corpo vazio; não ocultar os controles nativos do fallback legado.

O impulso aprovado de roupa usa260ms, com opacidade120ms em modo suave. Esses tempos são parâmetros do recorte, sujeitos à revisão perceptiva. Fixtures e APIs da conversa não entram no jogo.
