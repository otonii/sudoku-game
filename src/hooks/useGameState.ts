import { useCallback, useEffect, useMemo, useState } from "react";
import {
  canInteractWithCell,
  countCats,
  isSolutionCell,
} from "../domain/gameRules";
import type { Cell, GameState, Level } from "../domain/gameTypes";
import { createEmptyCells } from "../utils/coordinates";
import { pickRandomItem } from "../utils/random";

const MAX_LIVES = 3;
const HIT_SCORE = 100;
const REVEAL_SCORE = 50;

type UseGameStateResult = {
  gameState: GameState;
  markCell: (row: number, column: number) => void;
  markCellNote: (row: number, column: number) => void;
  validateCell: (row: number, column: number) => void;
  revealRandomCat: () => void;
  recoverLife: () => void;
  resetLevel: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
};

export function useGameState(level: Level): UseGameStateResult {
  const initialCells = useMemo(() => createEmptyCells(level), [level]);

  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState(level, initialCells),
  );

  useEffect(() => {
    setGameState(createInitialGameState(level, initialCells));
  }, [initialCells, level]);

  const markCell = useCallback((row: number, column: number) => {
    setGameState((current) => {
      if (current.status !== "PLAYING") {
        return current;
      }

      const cell = current.cells[row]?.[column];

      if (!cell || !canInteractWithCell(cell.state)) {
        return current;
      }

      const nextState = cell.state === "VAZIA" ? "X_BRANCO" : "VAZIA";

      return {
        ...current,
        cells: updateCell(current.cells, row, column, { state: nextState }),
      };
    });
  }, []);

  const markCellNote = useCallback((row: number, column: number) => {
    setGameState((current) => {
      if (current.status !== "PLAYING") {
        return current;
      }

      const cell = current.cells[row]?.[column];

      if (!cell || cell.state !== "VAZIA") {
        return current;
      }

      return {
        ...current,
        cells: updateCell(current.cells, row, column, { state: "X_BRANCO" }),
      };
    });
  }, []);

  const validateCell = useCallback((row: number, column: number) => {
    setGameState((current) => {
      if (current.status !== "PLAYING") {
        return current;
      }

      const cell = current.cells[row]?.[column];

      if (!cell || !canInteractWithCell(cell.state)) {
        return current;
      }

      const isCorrect = isSolutionCell(current.level.solution, [row, column]);

      if (isCorrect) {
        const cells = updateCell(current.cells, row, column, { state: "GATO" });
        const catsFound = countCats(cells);
        const hasWon = catsFound === current.level.totalCatsRequired;

        return {
          ...current,
          cells,
          catsFound,
          score: current.score + HIT_SCORE,
          status: hasWon ? "WON" : current.status,
        };
      }

      const lives = Math.max(0, current.lives - 1);
      const cells = updateCell(current.cells, row, column, {
        state: "X_VERMELHO",
      });

      return {
        ...current,
        cells,
        lives,
        status: lives === 0 ? "GAME_OVER" : current.status,
      };
    });
  }, []);

  const revealRandomCat = useCallback(() => {
    setGameState((current) => {
      if (current.status !== "PLAYING") {
        return current;
      }

      const candidates = current.level.solution.filter(([row, column]) => {
        const state = current.cells[row]?.[column]?.state;
        return state === "VAZIA" || state === "X_BRANCO";
      });
      const coordinate = pickRandomItem(candidates);

      if (!coordinate) {
        return current;
      }

      const [row, column] = coordinate;
      const cells = updateCell(current.cells, row, column, { state: "GATO" });
      const catsFound = countCats(cells);
      const hasWon = catsFound === current.level.totalCatsRequired;

      return {
        ...current,
        cells,
        catsFound,
        score: current.score + REVEAL_SCORE,
        status: hasWon ? "WON" : current.status,
      };
    });
  }, []);

  const recoverLife = useCallback(() => {
    setGameState((current) => {
      if (current.lives >= current.maxLives) {
        return current;
      }

      const lives = current.lives + 1;

      return {
        ...current,
        lives,
        status: current.status === "GAME_OVER" ? "PLAYING" : current.status,
      };
    });
  }, []);

  const resetLevel = useCallback(() => {
    setGameState(createInitialGameState(level, createEmptyCells(level)));
  }, [level]);

  const pauseGame = useCallback(() => {
    setGameState((current) => {
      if (current.status !== "PLAYING") {
        return current;
      }

      return {
        ...current,
        status: "PAUSED",
        previousStatus: current.status,
      };
    });
  }, []);

  const resumeGame = useCallback(() => {
    setGameState((current) => {
      if (current.status !== "PAUSED") {
        return current;
      }

      return {
        ...current,
        status: current.previousStatus ?? "PLAYING",
        previousStatus: null,
      };
    });
  }, []);

  return {
    gameState,
    markCell,
    markCellNote,
    validateCell,
    revealRandomCat,
    recoverLife,
    resetLevel,
    pauseGame,
    resumeGame,
  };
}

function createInitialGameState(level: Level, cells: Cell[][]): GameState {
  return {
    level,
    cells,
    status: "PLAYING",
    previousStatus: null,
    lives: MAX_LIVES,
    maxLives: MAX_LIVES,
    catsFound: 0,
    score: 0,
  };
}

function updateCell(
  cells: Cell[][],
  row: number,
  column: number,
  patch: Partial<Cell>,
): Cell[][] {
  return cells.map((cellRow, rowIndex) =>
    rowIndex === row
      ? cellRow.map((cell, columnIndex) =>
          columnIndex === column ? { ...cell, ...patch } : cell,
        )
      : cellRow,
  );
}
