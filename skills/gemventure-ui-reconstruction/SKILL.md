---
name: gemventure-ui-reconstruction
description: Reconstruir interfaces do GemVenture em HTML/CSS a partir de referências visuais explícitas, com fidelidade de composição e comportamento real. Usar para reconstrução literal de telas e pop-ups; não para gerar arte do mundo ou redesenhar livremente a UI.
---

# Reconstrução fiel de UI

## Escopo e precedência

Leia `../../docs/TEAM_WORKFLOW.md` e o recorte vigente em `../../../coordination/team-control.json`. Trabalhe na candidata e reservas atribuídas; não altere outras telas, skins globais, saves ou oficial por inferência. Preserve correções humanas posteriores e o recorte atual, mesmo que a tela inteira ainda tenha diferenças.

Quando o usuário pede cópia/reconstrução literal, a referência específica é a especificação visual. Paletas, medidas e proporções genéricas de guias anteriores são fallback apenas para aspectos ausentes. Regras HEPT32/duas cores/materiais foscos do mundo procedural não governam CSS. A skill de imagens governa a produção raster, não a composição da janela.

As referências atuais estão em `../../../coordination/UI-BIBLE-20261022/references/`. No Elevador, usar `06-andares.png` e `05-abismo.png` e o feedback humano mais recente. A imagem define aparência; os dados e as mecânicas vêm do jogo. Cinco estrelas por andar prevalecem sobre três ilustradas. Não fabricar saldos, drops, recordes ou funcionalidades.

## Converter a imagem em implementação

- Inspecione a imagem real, não só a descrição. Registre o tamanho original e uma tabela curta do trecho em trabalho: elemento, retângulo x/y/largura/altura, alinhamento, tamanho aparente de texto/ícone, cores e tratamento de borda/sombra. Use coordenadas normalizadas quando necessário. Medidas visuais estimadas devem ser identificadas como estimativas.
- Meça limites VISÍVEIS dos PNGs: espaço transparente não conta como tamanho do emblema. Diferencie tamanho do botão e da seta, painel e área ilustrada, título e caixa de linha. Registre extravasamento do X/emblema e fundo visível atrás do popup.
- Reproduza hierarquia, posições e proporções antes do acabamento. Não conservar o layout antigo apenas por ser reutilizável. Reutilize dados, eventos, controles acessíveis e lógica; substitua a apresentação no escopo autorizado.
- Audite a cascata CSS aplicada ao componente: heranças, seletores globais, media queries, min/max-width, overflow e estilos inline. Remova/substitua regras antigas dentro do escopo em vez de acumular remendos contraditórios ou apagar toda a skin global.
- Amostre cores representativas da referência quando houver ferramenta apropriada. Reproduza gradientes, sombras difusas versus deslocadas, contornos e recortes. Não trocar amarelo por verde porque um guia genérico recomenda verde. Não alegar fonte exata se não identificada: compare peso, largura, altura e espaçamento e declare a substituição.
- Texto e controles são elementos funcionais; não usar screenshot inteiro como UI. Arte ausente é uma lacuna explícita: não substituir por imagem antiga inadequada nem recortar a referência como asset de produção por conta própria. Solicite ao responsável a peça necessária e avance no trabalho independente.

## Comparação e entrega

Compare referência e renderização na MESMA área de desenho e escala. Dois iframes com larguras diferentes não são prova. Evite que media queries da página de comparação transformem só a candidata. Mostre também standalone utilizável. Sobreposição com transparência ou comparação lado a lado ajuda a localizar desvios; não esconder erro ajustando apenas a escala de uma imagem.

Valide o recorte visual e os estados funcionais relevantes: normal, hover/foco, desabilitado, seleção, fechamento e rolagem. Preserve acessibilidade e texto legível em outras dimensões sem usar responsividade como justificativa para divergir na dimensão-alvo.

Use renderização real apenas por ferramentas autorizadas. Se indisponível, registre “validação visual renderizada pendente”; testes DOM/CSS, contagem de arquivos e hashes não comprovam aparência. Não contorne restrições de navegador nem anuncie fidelidade/pronto visual com base nesses testes. Apresente a candidata e liste diferenças conhecidas.

Entregue o trecho solicitado, referência utilizada, comparativo, validação funcional e pendências objetivas. Se uma diferença persistir, identifique a causa (asset, fonte, cascata, medidas ou falta de renderização) antes de repetir mudanças por tentativa. Aceite final continua humano.
