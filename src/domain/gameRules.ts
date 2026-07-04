import type { Cell, CellState, Coordinate } from './gameTypes'

export function coordinateKey([row, column]: Coordinate): string {
  return `${row}:${column}`
}

export function isSameCoordinate(a: Coordinate, b: Coordinate): boolean {
  return a[0] === b[0] && a[1] === b[1]
}

export function isSolutionCell(solution: Coordinate[], cell: Coordinate): boolean {
  return solution.some((solutionCell) => isSameCoordinate(solutionCell, cell))
}

export function areAdjacent(a: Coordinate, b: Coordinate): boolean {
  const rowDistance = Math.abs(a[0] - b[0])
  const columnDistance = Math.abs(a[1] - b[1])

  return rowDistance <= 1 && columnDistance <= 1 && !isSameCoordinate(a, b)
}

export function countCats(cells: Cell[][]): number {
  return cells.flat().filter((cell) => cell.state === 'GATO').length
}

export function canInteractWithCell(state: CellState): boolean {
  return state === 'VAZIA' || state === 'X_BRANCO'
}
