import type { Cell, Coordinate, Level, Region } from '../domain/gameTypes'

export type CellBorders = {
  top: 'thin' | 'thick'
  right: 'thin' | 'thick'
  bottom: 'thin' | 'thick'
  left: 'thin' | 'thick'
}

export function createEmptyCells(level: Level): Cell[][] {
  const regionByCell = new Map<string, Region>()

  for (const region of level.regions) {
    for (const [row, column] of region.cells) {
      regionByCell.set(toCoordinateKey([row, column]), region)
    }
  }

  return Array.from({ length: level.gridSize }, (_, row) =>
    Array.from({ length: level.gridSize }, (_, column) => {
      const region = regionByCell.get(toCoordinateKey([row, column]))

      if (!region) {
        throw new Error(`Célula sem região: ${row}, ${column}`)
      }

      return {
        row,
        column,
        regionId: region.regionId,
        regionColor: region.color,
        state: 'VAZIA',
      }
    }),
  )
}

export function getCellBorders(cells: Cell[][], row: number, column: number): CellBorders {
  const cell = cells[row]?.[column]

  if (!cell) {
    return { top: 'thick', right: 'thick', bottom: 'thick', left: 'thick' }
  }

  return {
    top: getBorderForNeighbor(cells, cell.regionId, row - 1, column),
    right: getBorderForNeighbor(cells, cell.regionId, row, column + 1),
    bottom: getBorderForNeighbor(cells, cell.regionId, row + 1, column),
    left: getBorderForNeighbor(cells, cell.regionId, row, column - 1),
  }
}

export function toCoordinateKey([row, column]: Coordinate): string {
  return `${row}:${column}`
}

function getBorderForNeighbor(
  cells: Cell[][],
  regionId: Cell['regionId'],
  row: number,
  column: number,
): CellBorders[keyof CellBorders] {
  const neighbor = cells[row]?.[column]

  return neighbor?.regionId === regionId ? 'thin' : 'thick'
}
