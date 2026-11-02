# Efeitos substituíveis

Pasta ativa: **`dist/assets/vfx/`**. Prévia: **`/vfx-gallery.html`**.
Configuração: **`dist/vfx-manifest.js`**. Renderizador: **`dist/vfx-assets.js`**.

| PNG | Quadros | Colunas | Tamanho de cada quadro | Uso |
| --- | ---: | ---: | --- | --- |
| impact.png | 30 | 6 | 291 × 301 | Picareta, ataques e queda de rocha |
| explosion.png | 30 | 6 | 355 × 355 | Bombas, ruptura, meteoros e broca |
| shield.png | 30 | 6 | 265 × 265 | Escudo e bloqueio |
| aura.png | 30 | 6 | 437 × 437 | Cura, poderes e habilidades ativadas |
| reward.png | 40 | 7 | 120 × 109 | Cristais, inimigos derrotados, Zag e jackpots |

## Como polir

1. Faça uma cópia do PNG antes de substituir.
2. Gere uma folha PNG transparente com quadros uniformes, ordenados da
   esquerda para a direita e depois de cima para baixo. Não inclua texto.
3. Preserve a posição do efeito em todos os quadros; não recorte cada quadro
   individualmente. Use as dimensões da tabela para substituir sem alterar código.
4. Para outro tamanho, quantidade de quadros ou ponto de apoio, ajuste
   `width`, `height`, `columns`, `frames` e `pivot` no manifesto.
   `duration` e `size` alteram apenas a apresentação, nunca o dano ou o BPM.
   `playFrames` permite omitir o final vazio de uma folha (impacto usa 14/30).
5. Abra a prévia e teste as seis cores, o modo suave e a caverna.

O importador reduz cada quadro para 64 × 64 e cria seis versões HEPT32 uma vez.
Tons escuros viram sombra, tons médios viram a cor do efeito e núcleos claros
viram um pequeno acento amarelo. Transparência é preservada. Use massas
definidas e evite ruído ou gradientes; a redução privilegia leitura no combate.
Não desenhe fundo preto: ele aparecerá como um retângulo no jogo.

## Limites e comportamento

- Cinco folhas, aproximadamente 1,3 MB de arquivos. Trinta versões em cache,
  cerca de 15 MiB de pixels. As folhas grandes são decodificadas sequencialmente.
- Até 24 animações ativas; modo suave: seis, sem auras grandes.
- Relógio visual separado do ritmo, pausa respeitada e posições corrigidas
  quando o Abismo desloca a sala. Não há alteração de recursos ou de saves.
- Sem leitura/recoloração de pixels por quadro. Imagem ausente ou dimensões
  inválidas mantêm os efeitos procedurais de segurança.
- Números, barras, raios entre alvos, pulso de alcance, rastros do jogador e
  sinais de ataques permanecem dinâmicos. Eles precisam acompanhar posições
  e tamanhos reais, e não devem ser embutidos em imagens estáticas.

## Origem

CodeManu, **VFX Free Pack**, fornecido em `E:\Genventure\Assets`.
[Fonte e termos](https://codemanu.itch.io/vfx-free-pack), verificados em
14/10/2026. A descrição declara domínio público e os metadados CC BY 4.0;
mantemos crédito e indicação de adaptação para cobrir ambos.

`Effect and FX Pixel Part 14 Free` não foi integrado: sua licença restringe
redistribuição e exige contribuição para uso comercial. Os outros pacotes
permanecem intactos na pasta original.
