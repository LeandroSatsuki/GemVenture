# Contrato de nitidez de ponta a ponta

Exigência humana de 31/10/2026: o VFX precisa conversar com ambiente e resolução.
Brilho e intensidade podem diferir; baixa definição acidental não faz parte do estilo.

## Diagnosticar a cadeia inteira

`fonte → recorte de frame → redução/recoloração → cache → escala/transformação →
buffer do canvas → escala CSS/composição → acabamento global → tela`.

Registrar em qual etapa a informação desaparece. Comparar uma forma estática
na mesma fase para separar blur espacial de movimento/troca de quadros. Depois
examinar a animação, inclusive borda que vibra por pivô instável ou baixa taxa de frames.

1. **Fonte:** pixels por frame útil, margens transparentes, menor detalhe, alpha,
   cadência, pivô e material. O tamanho total da folha não é resolução por frame.
2. **Cache:** tamanho real depois do loader. Quantização pode perder planos mesmo
   com densidade suficiente; aumento de resolução e revisão de paleta são eixos separados.
3. **Transformação:** unidades lógicas, escala do mundo, rotação, CSS e câmera.
   Medir o retângulo final; não presumir que `size:70` significa 70 pixels na tela.
4. **Buffer:** CSS width/height versus canvas.width/height e transformação do contexto.
   Um overlay com 160×160 pixels em 160 CSS px perde densidade em DPR 2.
5. **Composição:** múltiplas reamostragens, filtro herdado, blur, brilho, blend e
   acabamento global. Respeitar CRT vigente; não adicionar CRT por efeito ou mudar
   todo o acabamento para resolver uma folha. Prova física depende de acesso permitido.

## Contas úteis, não um aceite visual

Para um eixo sem transformação complexa:

```text
L = extensão desenhada em unidades lógicas
S = pixels CSS por unidade lógica, com todas as escalas já incluídas
D = pixels do buffer por pixel CSS (DPR efetivo do renderizador)
T = pixels disponíveis na célula do cache nesse eixo

extensão CSS = L × S
extensão no buffer = L × S × D
ampliação raster = (L × S × D) / T
memória RGBA do atlas = larguraCache × alturaCache × 4 × variantes
```

Se há margem transparente, comparar também fração ocupada e tamanho útil; não
contar o vazio como detalhe disponível. Matrizes/escala não uniforme pedem os dois
eixos e, em transformações mais complexas, o máximo alongamento da matriz.

Na baseline, `world.js` aplica `S = 2 × world.scale` e limita DPR do buffer a 2.
Em um cenário **hipotético** com world.scale=1 e D=2, `reward` de 70 unidades
ocupa 140 CSS px/280 pixels de buffer. A célula 64×64 é ampliada 4,375× no buffer.
Não é medição do monitor do usuário nem prova de que todo frame ficará ruim.
Não multiplicar o zoom do browser de novo se seus efeitos já foram considerados
no retângulo CSS, escala ou DPR observado.

`imageSmoothingEnabled=true` interpola ao ampliar; desligar preserva a grade
existente, mas não reconstrói detalhe perdido. Para uma família de bordas contínuas,
isso pode apenas trocar blur por blocos incompatíveis. [MDN: smoothing](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled).
Canvas HiDPI exige buffer dimensionado em relação ao tamanho CSS e densidade,
sem alterar sua dimensão lógica. [MDN: devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio).

## Escolher a correção mínima

| Causa verificada | Correção candidata | O que não resolve |
| --- | --- | --- |
| Loader reduz fonte boa para uma célula insuficiente | Densidade por família/perfil, cache limitado e opt-in no consumidor | Exportar PNG ainda maior mantendo a mesma redução |
| Canvas de overlay com buffer insuficiente | Dimensionar buffer pelo DPR efetivo e normalizar desenho sem mudar a caixa CSS | Aumentar apenas width/height CSS |
| Desenho com formas simples | Geometria/Path2D ou raster preparado para o tamanho final, com cache apropriado | Adicionar engine 3D ou blur para simular volume |
| Export já pequeno/desfocado | Reexportar receita/fonte com densidade suficiente ou redesenhar formas | Upscale interpolado e sharpen como substitutos de fonte |
| Alpha com halo escuro/claro | Corrigir matte/alpha/export e padding; testar fundos claro e escuro | Compensar com glow maior |
| Vazamento entre frames | Margem/gutter, extrusão quando pertinente e recorte correto | Recortar cada frame com pivô diferente |
| Movimento serrilhado/tremendo | Pivô constante, trajetória e amostragem temporal consistentes | Arredondar todas as posições globais e introduzir jitter |
| Perda de planos na recoloração | Opt-in de mapeamento que preserve o material dentro do contrato | Recolorir globalmente todos os consumidores |

Não exigir a mesma dimensão de arquivo para efeito de contato e partícula minúscula.
Uma célula serve ao maior tamanho autorizado de seu consumidor; se houver zoom
significativo, selecionar níveis de cache ou rasterizar para a transformação prevista.
Recriar cache só quando perfil/escala exigir, fora do draw; não a cada frame.

## Nitidez compatível com o ambiente

- Comparar ao personagem e ao material adjacente em **tamanho real**, com mesma
  câmera, contorno aparente, acabamento e DPR. Uma captura de efeito isolado não basta.
- Núcleo e silhueta intencionais continuam definidos no pico; a dissipação pode
  suavizar de propósito. Registrar quais regiões são suaves por design.
- Não inventar microdetalhes para parecer alta resolução. Poucas formas bem
  rasterizadas têm definição; uma massa ruidosa em 4K pode continuar ilegível.
- Manter luz, faces e apoio do mundo. Sombra de contato não sobe com o fragmento.
  Cor de buff pode destacar-se sem parecer um adesivo ou lavar as formas vizinhas.
- Texto/ícone informativo continua no mecanismo apropriado; não embutir número
  variável ou HUD em atlas. Camada crisp não remove automaticamente o acabamento
  global e não é licença para jogar toda partícula acima do HUD.

## Custo de elevar densidade

Dobrar a dimensão de uma célula quadruplica memória de pixels. Passar de 64 a 256
custa 16× para a mesma quantidade de células/variantes, além do decode e temporários.
O número de bytes do PNG não mede essa memória. Cache residente, buffers temporários,
cópias, GPU e pico de decode têm custos distintos.

Na baseline, o loader genérico mantém 30 variantes e tetos 24/6 de animações.
Não aumentar o limite global `frame` sem orçamento e teste de todos os consumidores.
Uma solução local pode usar menos variantes/frames, cache por demanda com teto,
geometria ou perfil específico. Não degradar o protagonista para manter decoração.

## Evidência mínima

Registrar fonte e cache; dimensões lógicas/CSS/físicas; viewport/zoom/DPR real e
efetivo; filtro e estado do CRT; pivô/alpha; cena e fase; modo normal/suave; custo
estimado e medido com método. Mostrar cena inteira e recorte 1:1 sem redimensionamento.
Testar mudança de escala/DPR se o componente deve sobreviver a redimensionamento
ou troca de monitor. Diferenciar simulação de DPR de hardware real.

O helper `../scripts/audit-density.mjs` quantifica apenas atlas genéricos do manifesto.
Não inspeciona DOM, cores/eventos de bypass, textura efetiva, placa gráfica ou CRT.
