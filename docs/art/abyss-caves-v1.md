# Abismo — cavernas aprovadas v1

Integração autorizada em 01/11/2026 a partir de `ABYSS-CAVE-PILOT-20261101-R1`.
Recibo: `coordination/abyss-cave-official-20261101-r1/APPLIED.json`, fora do checkout.

A identidade profunda e escura do Abismo combina materiais dos sete biomas,
salões longitudinais largos, conexões amplas e tocas laterais. A câmera e os
sprites mantêm a projeção nativa. Novas ondas usam a família do bioma atual;
inimigos ainda vivos não são apagados ao mudar de trecho.

O ouriço se abriga da pressão do Abismo junto de um veio cristalino. Pequenas
inclusões na parede e a descrição contextual ligam o refúgio à brotação existente.
O contato no pulso continua não letal: até três cristais por brotação, intervalo
de seis batidas, orçamento de nove por seção, sem pagamento direto. Reposicionar
a toca não renova esse orçamento.

## Runtime e compatibilidade

- `room.abyssCave = {version:1}` identifica somente novas descidas.
- A janela lógica permanece 42 × 30; a rota usa fileiras absolutas por semente.
- Uma fileira entra a cada quatro batidas; seções de 96 batidas e cartas usam
  o relógio nativo. Não há alteração de HP, dano, música, recompensas ou chave de save.
- Saves ativos sem o marcador mantêm a geração e a apresentação anteriores.
  Uma nova descida seleciona automaticamente a versão aprovada.
- Marcadores inválidos ou usados fora do modo Abismo são rejeitados na restauração.
- Tocas fora da janela não podem ser selecionadas. A frente de uma toca visível
  permanece transitável, com parede sólida suficiente atrás do hospedeiro.

## Desenho e visibilidade

`abyss-cave-scene.js` adapta paredes, terrenos conectados, minerais e sombras do
kit aprovado. O contorno único do piso evita clip por centenas de quadriláteros.
Cache de paredes: no máximo 512 rasters; terrenos: 192 tiles; materiais carregados:
dois biomas recentes. O mapa infinito inteiro não é mantido em memória.

Paredes entram na ordenação dos atores e usam a máscara do personagem.
O pulso de combo recebe faces nas coordenadas locais e seu clip acompanha cada
rebase da máscara. Animações do ouriço continuam ligadas à fase musical e à pausa.

Quando a aproximação revela o ouriço, apenas a abertura da toca é excluída da
névoa quadriculada e do escurecimento frontal. A exploração lógica não muda,
áreas desconhecidas continuam ocultas e a iluminação geral da caverna permanece.

## Evidência

Testes cobrem diversidade, conectividade, retenção de fileiras, tocas, crescimento,
cartas, save/legado e descoberta da abertura. A entrega inclui imagens antes/depois
do `World` real em Canvas nativo. Isso não certifica FPS ou interação física de
navegador. O piloto foi aprovado pelo usuário; os testes de integração não são
substitutos desse aceite. A prévia com dano suspenso não foi copiada para o jogo.
