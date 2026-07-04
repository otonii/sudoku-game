import type { Cell } from "../../domain/gameTypes";

import "./GameCell.css";

type GameCellProps = {
  cell: Cell;
  disabled: boolean;
  onInput: (row: number, column: number) => void;
};

export function GameCell({ cell, disabled, onInput }: GameCellProps) {
  const label = getAriaLabel(cell);

  return (
    <button
      className="game-cell"
      style={{ backgroundColor: cell.regionColor }}
      type="button"
      disabled={disabled}
      data-game-cell="true"
      data-row={cell.row}
      data-column={cell.column}
      aria-label={label}
      onClick={() => onInput(cell.row, cell.column)}
    >
      {renderCellContent(cell)}
    </button>
  );
}

function renderCellContent(cell: Cell) {
  if (cell.state === "X_BRANCO") {
    return <span className="cell-mark cell-mark--note">×</span>;
  }

  if (cell.state === "GATO") {
    return <span className="cell-cat">🐱</span>;
  }

  if (cell.state === "X_VERMELHO") {
    return <span className="cell-mark cell-mark--error">×</span>;
  }

  return null;
}

function getAriaLabel(cell: Cell): string {
  const position = `linha ${cell.row + 1}, coluna ${cell.column + 1}`;

  if (cell.state === "X_BRANCO") {
    return `${position}, marcada com nota`;
  }

  if (cell.state === "GATO") {
    return `${position}, gato encontrado`;
  }

  if (cell.state === "X_VERMELHO") {
    return `${position}, erro permanente`;
  }

  return `${position}, vazia`;
}
