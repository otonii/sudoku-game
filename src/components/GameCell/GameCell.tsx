import type { Cell } from '../../domain/gameTypes'
import type { CellBorders } from '../../utils/coordinates'
import './GameCell.css'

type GameCellProps = {
  cell: Cell
  disabled: boolean
  borders: CellBorders
  onInput: (row: number, column: number) => void
}

export function GameCell({ cell, disabled, borders, onInput }: GameCellProps) {
  const label = getAriaLabel(cell)

  return (
    <button
      className="game-cell"
      style={{
        backgroundColor: cell.regionColor,
        borderTopWidth: borders.top === 'thick' ? 3 : 1,
        borderRightWidth: borders.right === 'thick' ? 3 : 1,
        borderBottomWidth: borders.bottom === 'thick' ? 3 : 1,
        borderLeftWidth: borders.left === 'thick' ? 3 : 1,
      }}
      type="button"
      disabled={disabled}
      aria-label={label}
      onClick={() => onInput(cell.row, cell.column)}
    >
      {renderCellContent(cell)}
    </button>
  )
}

function renderCellContent(cell: Cell) {
  if (cell.state === 'X_BRANCO') {
    return <span className="cell-mark cell-mark--note">×</span>
  }

  if (cell.state === 'GATO') {
    return <span className="cell-cat">🐱</span>
  }

  if (cell.state === 'X_VERMELHO') {
    return <span className="cell-mark cell-mark--error">×</span>
  }

  return null
}

function getAriaLabel(cell: Cell): string {
  const position = `linha ${cell.row + 1}, coluna ${cell.column + 1}`

  if (cell.state === 'X_BRANCO') {
    return `${position}, marcada com nota`
  }

  if (cell.state === 'GATO') {
    return `${position}, gato encontrado`
  }

  if (cell.state === 'X_VERMELHO') {
    return `${position}, erro permanente`
  }

  return `${position}, vazia`
}
