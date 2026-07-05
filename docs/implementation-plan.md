# Plano de Implementação — Neko Battle com Vite + React + TypeScript

## 1. Objetivo

Implementar o jogo Neko Battle como uma aplicação web em HTML/CSS/React, usando Vite com template `react-ts`.

A primeira versão deve entregar:

- Renderização de tabuleiro `N x N`.
- Regiões coloridas irregulares.
- Clique simples para alternar `X_BRANCO`.
- Clique duplo rápido para validar `GATO` ou `X_VERMELHO`.
- Sistema de vidas.
- Condições de vitória e derrota.
- Botões básicos de ajuda.
- Layout responsivo para desktop e mobile.

## 2. Stack

- Vite.
- React.
- TypeScript.
- HTML/CSS puro ou CSS Modules.
- Sem backend na primeira versão.
- Dados de níveis em arquivos TypeScript ou JSON locais.

## 3. Bootstrap do projeto

Criar o app com:

```bash
npm create vite@latest . -- --template react-ts
npm install
npm run dev
```

Scripts esperados em `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

## 4. Estrutura de pastas proposta

```text
src/
├── App.tsx
├── App.css
├── components/
│   ├── GameBoard/
│   │   ├── GameBoard.tsx
│   │   └── GameBoard.css
│   ├── GameCell/
│   │   ├── GameCell.tsx
│   │   └── GameCell.css
│   ├── GameHeader/
│   │   ├── GameHeader.tsx
│   │   └── GameHeader.css
│   ├── GameStatus/
│   │   ├── GameStatus.tsx
│   │   └── GameStatus.css
│   ├── GameFooter/
│   │   ├── GameFooter.tsx
│   │   └── GameFooter.css
│   └── GameModal/
│       ├── GameModal.tsx
│       └── GameModal.css
├── data/
│   └── levels.ts
├── domain/
│   ├── gameTypes.ts
│   ├── gameRules.ts
│   ├── levelValidation.ts
│   └── regionGeometry.ts
├── hooks/
│   ├── useDoubleClickCell.ts
│   └── useGameState.ts
├── utils/
│   ├── coordinates.ts
│   └── random.ts
├── main.tsx
└── index.css
```

## 5. Modelagem TypeScript

Arquivo sugerido: `src/domain/gameTypes.ts`.

```ts
export type Coordinate = readonly [row: number, column: number]

export type CellState = 'VAZIA' | 'X_BRANCO' | 'GATO' | 'X_VERMELHO'

export type GameStatus = 'PLAYING' | 'WON' | 'GAME_OVER' | 'PAUSED'

export type Region = {
  regionId: number | string
  color: string
  cells: Coordinate[]
}

export type Level = {
  levelId: number | string
  gridSize: number
  totalCatsRequired: number
  regions: Region[]
  solution: Coordinate[]
}

export type Cell = {
  row: number
  column: number
  regionId: Region['regionId']
  regionColor: string
  state: CellState
}

export type GameState = {
  level: Level
  cells: Cell[][]
  status: GameStatus
  lives: number
  maxLives: number
  catsFound: number
  score: number
}
```

## 6. Dados do primeiro nível

Arquivo sugerido: `src/data/levels.ts`.

Começar com 1 nível fixo para validar gameplay antes de criar seleção de níveis.

```ts
import type { Level } from '../domain/gameTypes'

export const levels: Level[] = [
  {
    levelId: 1,
    gridSize: 6,
    totalCatsRequired: 6,
    regions: [
      // preencher regiões válidas
    ],
    solution: [
      // preencher solução válida
    ],
  },
]
```

Critérios para o primeiro nível:

- Não usar mais grids pequenos `4 x 4` ou `6 x 6` no produto atual.
- Manter foco no grid hard `10 x 10`.
- Garantir 6 gatos na solução.
- Validar manualmente as regras antes de implementar geração procedural.

## 7. Fluxo de estado do jogo

Centralizar a lógica em `src/hooks/useGameState.ts`.

Responsabilidades:

- Criar grid inicial a partir do nível.
- Controlar estados das células.
- Controlar vidas.
- Controlar contador de gatos.
- Controlar status global.
- Expor ações simples para componentes.

API sugerida:

```ts
const {
  gameState,
  markCell,
  validateCell,
  revealRandomCat,
  recoverLife,
  resetLevel,
  pauseGame,
  resumeGame,
} = useGameState(level)
```

## 8. Input de célula

Criar `src/hooks/useDoubleClickCell.ts` para encapsular a diferença entre clique simples e clique duplo.

API sugerida:

```ts
const bindCellInput = useDoubleClickCell({
  delay: 280,
  onSingleClick: markCell,
  onDoubleClick: validateCell,
})
```

Uso esperado:

```tsx
<button
  type="button"
  className="game-cell"
  onClick={() => bindCellInput(row, column)}
>
  {content}
</button>
```

Regras:

- Clique simples só executa após o timeout.
- Clique duplo cancela o clique simples pendente.
- Clique duplo só vale se for na mesma célula.
- Células permanentes devem ser ignoradas pelo `useGameState`.

## 9. Regras de domínio

Arquivo sugerido: `src/domain/gameRules.ts`.

Funções principais:

```ts
export function isSolutionCell(solution: Coordinate[], cell: Coordinate): boolean
export function areAdjacent(a: Coordinate, b: Coordinate): boolean
export function countCats(cells: Cell[][]): number
export function canInteractWithCell(state: CellState): boolean
```

Essas funções devem ser puras para facilitar testes futuros.

## 10. Validação de nível

Arquivo sugerido: `src/domain/levelValidation.ts`.

Validar ao carregar o nível:

- `gridSize > 0`.
- `totalCatsRequired === gridSize`.
- Todas as células pertencem a exatamente uma região.
- Nenhuma célula fica fora do grid.
- Nenhuma célula aparece em duas regiões.
- `solution.length === totalCatsRequired`.
- Solução tem 1 gato por linha.
- Solução tem 1 gato por coluna.
- Solução tem 1 gato por região.
- Gatos não são adjacentes.

No MVP, se o nível for inválido, exibir erro técnico simples na tela.

## 11. Validação geométrica das regiões

Arquivo sugerido: `src/domain/regionGeometry.ts`.

Funções principais:

```ts
export function validateRegionGeometry(level: Level): boolean
export function validateRegionSize(level: Level): boolean
export function validateRegionLinearity(level: Level): boolean
export function isPerfectRectangleRegion(region: Region): boolean
```

Regras:

- Cada região deve ter ao menos `3` células.
- Cada região deve ter no máximo `2N - 2` células.
- Nenhuma região pode ocupar mais de `60%` de uma linha.
- Nenhuma região pode ocupar mais de `60%` de uma coluna.
- Retângulos perfeitos devem ser rejeitados.

## 12. Componentes

### 12.1 `App`

Responsável por:

- Selecionar nível inicial.
- Inicializar `useGameState`.
- Montar layout principal.
- Exibir modal de vitória/derrota.

### 12.2 `GameHeader`

Props sugeridas:

```ts
type GameHeaderProps = {
  levelId: Level['levelId']
  score: number
  onBack: () => void
  onOpenSettings: () => void
}
```

Renderiza:

- Voltar.
- `Nível X`.
- `Pontuação Y`.
- Configurações.

### 12.3 `GameStatus`

Props sugeridas:

```ts
type GameStatusProps = {
  catsFound: number
  totalCats: number
  lives: number
  maxLives: number
}
```

Renderiza:

- `🐱 atual/total`.
- Peixes de vida.

### 12.4 `GameBoard`

Props sugeridas:

```ts
type GameBoardProps = {
  cells: Cell[][]
  disabled: boolean
  onCellInput: (row: number, column: number) => void
}
```

Responsável por:

- Renderizar grid CSS.
- Passar célula para `GameCell`.
- Bloquear input quando `disabled` for verdadeiro.

### 12.5 `GameCell`

Props sugeridas:

```ts
type GameCellProps = {
  cell: Cell
  disabled: boolean
  borders: CellBorders
  onInput: (row: number, column: number) => void
}
```

Responsável por:

- Cor de fundo da região.
- Conteúdo visual conforme estado.
- Bordas grossas entre regiões diferentes.
- Acessibilidade básica com `button`.

Conteúdo por estado:

| Estado | Render |
| --- | --- |
| `VAZIA` | vazio |
| `X_BRANCO` | `×` branco translúcido |
| `GATO` | `🐱` ou SVG de gato |
| `X_VERMELHO` | `×` vermelho opaco |

### 12.6 `GameFooter`

Props sugeridas:

```ts
type GameFooterProps = {
  onRevealCat: () => void
  onRecoverLife: () => void
  disabled: boolean
}
```

Renderiza:

- Botão revelar gato.
- Botão recuperar vida / limpar erro.

### 12.7 `GameModal`

Usado para:

- Vitória.
- Game over.
- Configurações.

Props sugeridas:

```ts
type GameModalProps = {
  title: string
  description?: string
  actions: Array<{
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }>
}
```

## 13. CSS e layout

Regras gerais:

- Usar CSS custom properties para cores e espaçamentos.
- Centralizar o tabuleiro na tela.
- Garantir toque confortável em mobile.
- Evitar dependência exclusiva de cor para comunicar estado.

Exemplo de tokens:

```css
:root {
  --color-page: #fff8ef;
  --color-text: #2f2a24;
  --color-error: #e74c3c;
  --color-grid-line: rgba(47, 42, 36, 0.18);
  --color-region-border: rgba(47, 42, 36, 0.48);
  --cell-size: min(9vw, 48px);
}
```

Grid:

```css
.game-board {
  display: grid;
  grid-template-columns: repeat(var(--grid-size), var(--cell-size));
  grid-template-rows: repeat(var(--grid-size), var(--cell-size));
}
```

## 14. Bordas entre regiões

Criar utilitário para calcular bordas por célula.

Arquivo sugerido: `src/utils/coordinates.ts`.

Regra:

- Se a célula vizinha tem a mesma `regionId`, borda fina.
- Se a célula vizinha tem `regionId` diferente ou não existe, borda grossa.

Tipo sugerido:

```ts
export type CellBorders = {
  top: 'thin' | 'thick'
  right: 'thin' | 'thick'
  bottom: 'thin' | 'thick'
  left: 'thin' | 'thick'
}
```

## 15. Ordem de implementação

### Fase 1 — Setup

- Criar projeto Vite React TS.
- Limpar arquivos padrão.
- Criar estrutura de pastas.
- Adicionar tokens CSS globais.

### Fase 2 — Domínio

- Criar tipos TypeScript.
- Criar primeiro nível local.
- Implementar criação do grid a partir das regiões.
- Implementar validação básica do nível.
- Implementar regras de solução e adjacência.

### Fase 3 — Renderização

- Criar `GameBoard`.
- Criar `GameCell`.
- Renderizar cores das regiões.
- Implementar bordas grossas entre regiões.
- Garantir responsividade básica.

### Fase 4 — Estado do jogo

- Criar `useGameState`.
- Implementar clique simples: `VAZIA` ⇄ `X_BRANCO`.
- Implementar validação: `GATO` ou `X_VERMELHO`.
- Implementar vidas.
- Implementar vitória e derrota.
- Bloquear células permanentes.

### Fase 5 — Input refinado

- Criar `useDoubleClickCell`.
- Impedir flicker de `X_BRANCO` no clique duplo.
- Validar duplo clique apenas na mesma célula.
- Ajustar delay para `280ms`.

### Fase 6 — UI completa

- Criar `GameHeader`.
- Criar `GameStatus`.
- Criar `GameFooter`.
- Criar `GameModal`.
- Adicionar reset de nível.
- Adicionar overlay de configurações.

### Fase 7 — Ajudas

- Implementar revelar gato aleatório.
- Implementar recuperar vida.
- Opcional: limpar um `X_VERMELHO`.

### Fase 8 — Feedback visual

- Animação de entrada do gato.
- Shake em erro.
- Fade-out no peixe perdido.
- Estados hover/focus/active.

### Fase 9 — Qualidade

- Validar nível ao iniciar.
- Validar geometria de regiões.
- Rodar build.
- Testar manualmente em desktop e mobile.

## 16. Checklist do MVP

- [ ] Projeto Vite + React TS criado.
- [ ] Tabuleiro renderiza um nível local.
- [ ] Cores das regiões aparecem corretamente.
- [ ] Bordas entre regiões são visíveis.
- [ ] Clique simples alterna `X_BRANCO`.
- [ ] Clique duplo correto aplica `GATO`.
- [ ] Clique duplo errado aplica `X_VERMELHO`.
- [ ] `X_BRANCO` não pisca durante clique duplo.
- [ ] Erro reduz vida.
- [ ] 0 vidas abre game over.
- [ ] Todos os gatos encontrados abrem vitória.
- [ ] Gatos e erros permanentes bloqueiam input.
- [ ] Revelar gato funciona.
- [ ] Reset funciona.
- [ ] Layout funciona em mobile.
- [ ] `npm run build` passa.

## 17. Fora do MVP

- Menu completo de seleção de níveis.
- Persistência de progresso.
- Sons reais.
- Vibração real.
- Anúncios.
- Geração procedural infinita.
- Editor visual de níveis.
- Ranking online.
