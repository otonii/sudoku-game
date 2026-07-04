# Design Visual

## Referência

A referência visual do jogo está em:

```text
images/IMG-20260630-WA0001.jpg
```

Ela guia o estilo geral: fundo claro, cards brancos, cores suaves no tabuleiro e UI arredondada.

## Direção visual

- Visual casual e amigável.
- Fundo bege claro.
- Cards brancos com sombra suave.
- Textos em tons rosados/marrons.
- Regiões coloridas em tons pastel/médios.
- Células com cantos levemente arredondados.
- Separação branca uniforme entre células.

## Layout

### Mobile

Ordem visual:

1. Header.
2. Cards de regras.
3. Status com gatos e vidas.
4. Tabuleiro.

As regras ficam em uma faixa horizontal, como na imagem de referência.

### Desktop

O layout usa duas colunas:

- primeira coluna: regras;
- segunda coluna: status e tabuleiro.

As regras ficam compactas para não competir com o tabuleiro.

## Header

O header contém:

- botão voltar;
- nível;
- pontuação;
- botão configurações.

Botões devem ser circulares, brancos e com sombra suave.

## Regras

Cards atuais:

- `1 gato por cor`;
- `1 gato por linha e coluna`;
- `Os gatos não podem se tocar`.

O container branco deve ser compacto. Os cards internos usam fundo bege claro.

## Status

O status usa pills brancas:

- contador de gatos em azul;
- vidas com ícones de peixe.

## Tabuleiro

Regras visuais:

- células sempre quadradas;
- usar `aspect-ratio: 1 / 1`;
- não usar bordas variáveis por célula;
- usar `gap` branco para separação;
- manter tamanho responsivo por `--cell-size`;
- remover outline/foco visual das células clicadas.

## Estados da célula

| Estado | Visual |
| --- | --- |
| `VAZIA` | cor da região |
| `X_BRANCO` | `×` branco grande |
| `GATO` | emoji/ícone de gato centralizado |
| `X_VERMELHO` | `×` vermelho |

## Responsividade

O tamanho da célula usa `min(vw, vh)` para caber em telas estreitas e baixas.

Tokens relevantes ficam em `src/index.css`:

```css
--cell-size: clamp(28px, min(8.2vw, 5.8vh), 42px);
```

Media queries em `src/App.css` refinam tablet, desktop e mobile.
