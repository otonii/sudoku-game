# Arquitetura

## Visão geral

Neko Battle é uma aplicação React client-side. Toda a lógica de gameplay, validação e geração de níveis roda no navegador.

```text
React UI
  ↓
hooks de estado/input
  ↓
domínio do jogo
  ↓
gerador e validadores de nível
```

Não há backend, banco de dados ou persistência remota configurados.

## Principais módulos

### `src/App.tsx`

Orquestra a tela principal do jogo.

Responsabilidades:

- gerar o nível hard inicial;
- validar o nível atual;
- conectar `useGameState` e `useDoubleClickCell`;
- renderizar header, regras, status, tabuleiro e modais;
- gerar um novo nível hard quando solicitado.

### `src/components/`

Componentes visuais do jogo.

- `GameHeader`: topo com voltar, nível, pontuação e configurações.
- `GameStatus`: contador de gatos e vidas.
- `GameBoard`: grid e eventos de pointer/drag.
- `GameCell`: célula individual e estados visuais.
- `GameModal`: vitória, game over e configurações.
- `GameFooter`: componente legado não usado na tela atual.

### `src/hooks/useGameState.ts`

Fonte principal do estado da partida.

Controla:

- células;
- status global (`PLAYING`, `WON`, `GAME_OVER`, `PAUSED`);
- vidas;
- pontuação;
- gatos encontrados;
- marcação simples;
- marcação por arraste;
- validação de gato/erro;
- reset;
- pausa.

### `src/hooks/useDoubleClickCell.ts`

Diferencia clique simples e clique duplo.

Regras:

- clique simples só roda após o delay;
- clique duplo cancela o clique simples pendente;
- duplo clique só vale para a mesma célula;
- evita flicker de `X_BRANCO` antes da validação.

### `src/domain/`

Contém regras puras e tipos do domínio.

- `gameTypes.ts`: tipos `Level`, `Region`, `Cell`, `GameState`, etc.
- `gameRules.ts`: regras de coordenada, solução, adjacência e interação.
- `levelValidation.ts`: validação completa do nível.
- `regionGeometry.ts`: regras geométricas das regiões.
- `levelGenerator/`: geração dinâmica de níveis hard.

### `src/utils/`

Utilitários pequenos.

- `coordinates.ts`: cria grid de células e funções auxiliares de coordenada.
- `random.ts`: seleção aleatória genérica.

## Fluxo de renderização

1. `App` chama `generateHardLevel`.
2. `App` valida o nível com `validateLevel`.
3. `useGameState` transforma o `Level` em uma matriz de `Cell`.
4. `GameBoard` renderiza a matriz.
5. `GameCell` renderiza cada estado visual.

## Fluxo de input

### Clique simples

```text
GameCell click
→ useDoubleClickCell aguarda delay
→ markCell
→ VAZIA ⇄ X_BRANCO
```

### Clique duplo

```text
GameCell click + click rápido na mesma célula
→ cancela clique simples pendente
→ validateCell
→ se correto: GATO
→ se incorreto: X_VERMELHO e perde vida
```

### Arraste

```text
pointer down no board
→ pointer move sobre células
→ markCellNote
→ VAZIA → X_BRANCO
```

O arraste ignora células que já são `GATO`, `X_VERMELHO` ou `X_BRANCO`.

## Geração de níveis hard

Arquivo principal: `src/domain/levelGenerator/hardLevelGenerator.ts`.

O gerador:

1. sorteia uma solução `10x10` com uma permutação de colunas;
2. rejeita soluções com gatos adjacentes;
3. sorteia entre 2 e 3 regiões micro e define seus tamanhos entre 1 e 3 células;
4. força exatamente 6 regiões concentradas;
5. usa cada gato como semente de uma região;
6. aplica a restrição das regiões concentradas só no crescimento inicial;
7. preenche o restante do grid por flood fill ortogonal;
8. garante que as regiões iniciais planejadas preservem ao menos um compartilhamento de linha ou coluna na geometria final;
9. aplica um filtro de qualidade para manter as regiões iniciais compactas e exigir que as demais toquem mais linhas e colunas;
10. valida o resultado com `validateLevel`.

## Validação de nível

Um nível válido precisa garantir:

- `gridSize > 0`;
- `totalCatsRequired === gridSize`;
- todas as células pertencem a exatamente uma região;
- a solução tem uma coordenada por linha;
- a solução tem uma coordenada por coluna;
- a solução tem uma coordenada por região;
- gatos não são adjacentes;
- regiões respeitam mínimo/máximo de células;
- regiões não violam regras geométricas.

## Estado e persistência

O estado existe apenas em memória React. Ao recarregar a página, um novo nível hard é gerado.

Não há persistência de:

- progresso;
- pontuação;
- níveis concluídos;
- configurações;
- estatísticas.

## Build e entrega

O build de produção é gerado por:

```bash
npm run build
```

A saída fica em `dist/`, conforme padrão do Vite.
