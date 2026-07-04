import type { CSSProperties } from "react";
import type { Cell } from "../../domain/gameTypes";
import { getCellBorders } from "../../utils/coordinates";
import { GameCell } from "../GameCell/GameCell";
import "./GameBoard.css";

type GameBoardProps = {
  cells: Cell[][];
  disabled: boolean;
  onCellInput: (row: number, column: number) => void;
};

export function GameBoard({ cells, disabled, onCellInput }: GameBoardProps) {
  const gridSize = cells.length;

  return (
    <section className="board-wrap" aria-label="Tabuleiro">
      <div
        className="game-board"
        style={{ "--grid-size": gridSize } as CSSProperties}
      >
        {cells.map((row) =>
          row.map((cell) => (
            <GameCell
              cell={cell}
              disabled={disabled}
              borders={getCellBorders(cells, cell.row, cell.column)}
              onInput={onCellInput}
              key={`${cell.row}:${cell.column}`}
            />
          )),
        )}
      </div>
    </section>
  );
}
