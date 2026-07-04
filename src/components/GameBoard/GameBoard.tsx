import {
  useCallback,
  useRef,
  type CSSProperties,
  type PointerEvent,
} from "react";
import type { Cell, CellState } from "../../domain/gameTypes";

import { GameCell } from "../GameCell/GameCell";
import "./GameBoard.css";

type GameBoardProps = {
  cells: Cell[][];
  disabled: boolean;
  onCellInput: (row: number, column: number) => void;
  onCellDragMark: (
    row: number,
    column: number,
    mode: "mark" | "unmark",
  ) => void;
};

type DragCell = {
  row: number;
  column: number;
};

type DragState = {
  active: boolean;
  start: DragCell | null;
  lastKey: string | null;
  didDrag: boolean;
  mode: "mark" | "unmark" | null;
};

const initialDragState: DragState = {
  active: false,
  start: null,
  lastKey: null,
  didDrag: false,
  mode: null,
};

export function GameBoard({
  cells,
  disabled,
  onCellInput,
  onCellDragMark,
}: GameBoardProps) {
  const gridSize = cells.length;
  const dragRef = useRef<DragState>(initialDragState);
  const suppressNextClickRef = useRef(false);

  const getCellFromPointer = useCallback(
    (event: PointerEvent): DragCell | null => {
      const element = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>("[data-game-cell='true']");

      if (!element) {
        return null;
      }

      const row = Number(element.dataset.row);
      const column = Number(element.dataset.column);

      if (!Number.isInteger(row) || !Number.isInteger(column)) {
        return null;
      }

      return { row, column };
    },
    [],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (disabled || event.button !== 0) {
        return;
      }

      const cell = getCellFromPointer(event);

      if (!cell) {
        return;
      }

      dragRef.current = {
        active: true,
        start: cell,
        lastKey: toCellKey(cell),
        didDrag: false,
        mode: getDragMode(cells[cell.row]?.[cell.column]?.state),
      };
    },
    [cells, disabled, getCellFromPointer],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;

      if (disabled || !drag.active || !drag.start || !drag.mode) {
        return;
      }

      const cell = getCellFromPointer(event);

      if (!cell) {
        return;
      }

      const key = toCellKey(cell);

      if (key === drag.lastKey) {
        return;
      }

      if (!drag.didDrag) {
        onCellDragMark(drag.start.row, drag.start.column, drag.mode);
      }

      onCellDragMark(cell.row, cell.column, drag.mode);
      dragRef.current = {
        ...drag,
        lastKey: key,
        didDrag: true,
      };
    },
    [disabled, getCellFromPointer, onCellDragMark],
  );

  const finishDrag = useCallback(() => {
    const didDrag = dragRef.current.didDrag;

    dragRef.current = initialDragState;

    if (didDrag) {
      suppressNextClickRef.current = true;
      window.setTimeout(() => {
        suppressNextClickRef.current = false;
      }, 0);
    }
  }, []);

  const handleCellInput = useCallback(
    (row: number, column: number) => {
      if (suppressNextClickRef.current) {
        return;
      }

      onCellInput(row, column);
    },
    [onCellInput],
  );

  return (
    <section className="board-wrap" aria-label="Tabuleiro">
      <div
        className="game-board"
        style={{ "--grid-size": gridSize } as CSSProperties}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onPointerLeave={finishDrag}
      >
        {cells.map((row) =>
          row.map((cell) => (
            <GameCell
              cell={cell}
              disabled={disabled}
              onInput={handleCellInput}
              key={`${cell.row}:${cell.column}`}
            />
          )),
        )}
      </div>
    </section>
  );
}

function toCellKey(cell: DragCell): string {
  return `${cell.row}:${cell.column}`;
}

function getDragMode(state?: CellState): "mark" | "unmark" | null {
  if (state === "VAZIA") {
    return "mark";
  }

  if (state === "X_BRANCO") {
    return "unmark";
  }

  return null;
}
