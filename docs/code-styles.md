# Estilo de Código

## Princípios

- Priorize código simples, direto e fácil de reutilizar.
- Mantenha regras de domínio fora dos componentes visuais.
- Prefira funções pequenas e puras para regras e validações.
- Evite abstrações antes de existir repetição real.
- Use nomes explícitos para estados, ações e regras.

## TypeScript

- Use tipos explícitos para entidades do domínio.
- Compartilhe tipos em `src/domain/gameTypes.ts`.
- Evite `any`.
- Prefira `readonly` em coordenadas quando possível.
- Use unions para estados finitos, como `CellState` e `GameStatus`.

## React

- Componentes devem receber dados por props e delegar regras para hooks/domínio.
- Hooks controlam estado e efeitos de interação.
- Evite lógica de validação de jogo dentro de JSX.
- Preserve componentes pequenos:
  - `GameBoard` cuida do grid e eventos de pointer.
  - `GameCell` cuida da célula individual.
  - `GameStatus` cuida de progresso e vidas.

## Domínio

Arquivos em `src/domain/` devem ser independentes da UI sempre que possível.

Exemplos:

- `gameRules.ts`: regras puras.
- `levelValidation.ts`: validação do contrato de nível.
- `regionGeometry.ts`: regras geométricas.
- `levelGenerator/`: geração de níveis.

## CSS

- Use CSS por componente.
- Tokens globais ficam em `src/index.css`.
- Layout principal fica em `src/App.css`.
- Mantenha as células quadradas com `aspect-ratio: 1 / 1`.
- Evite bordas variáveis nas células, pois elas distorcem a percepção do grid.
- Use `gap` uniforme no tabuleiro para separar células.

## Input

- Clique simples e clique duplo devem passar por `useDoubleClickCell`.
- Arraste deve marcar apenas notas e não deve validar células.
- Estados permanentes (`GATO`, `X_VERMELHO`) não devem ser alterados por marcação.

## Validação antes de entregar

Rode:

```bash
npm run lint
npm run build
```

Se alterar apenas documentação, não há formatador específico configurado.
