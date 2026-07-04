import type { Level, Region } from './gameTypes'

const MAX_REGION_LINE_SHARE = 0.6
const MIN_REGION_CELLS = 3

export function validateRegionGeometry(level: Level): string[] {
  return [
    ...validateRegionSize(level),
    ...validateRegionLinearity(level),
    ...validateRegionShapes(level),
  ]
}

export function validateRegionSize(level: Level): string[] {
  const maxCells = level.gridSize * 2 - 2

  return level.regions.flatMap((region) => {
    const errors: string[] = []

    if (region.cells.length < MIN_REGION_CELLS) {
      errors.push(`Região ${region.regionId} tem menos de ${MIN_REGION_CELLS} células.`)
    }

    if (region.cells.length > maxCells) {
      errors.push(`Região ${region.regionId} tem mais de ${maxCells} células.`)
    }

    return errors
  })
}

export function validateRegionLinearity(level: Level): string[] {
  const limit = Math.floor(level.gridSize * MAX_REGION_LINE_SHARE)

  return level.regions.flatMap((region) => {
    const rowCounts = new Map<number, number>()
    const columnCounts = new Map<number, number>()

    for (const [row, column] of region.cells) {
      rowCounts.set(row, (rowCounts.get(row) ?? 0) + 1)
      columnCounts.set(column, (columnCounts.get(column) ?? 0) + 1)
    }

    const errors: string[] = []

    for (const [row, count] of rowCounts) {
      if (count > limit) {
        errors.push(`Região ${region.regionId} ocupa ${count} células na linha ${row}.`)
      }
    }

    for (const [column, count] of columnCounts) {
      if (count > limit) {
        errors.push(`Região ${region.regionId} ocupa ${count} células na coluna ${column}.`)
      }
    }

    return errors
  })
}

export function isPerfectRectangleRegion(region: Region): boolean {
  const rows = region.cells.map(([row]) => row)
  const columns = region.cells.map(([, column]) => column)
  const minRow = Math.min(...rows)
  const maxRow = Math.max(...rows)
  const minColumn = Math.min(...columns)
  const maxColumn = Math.max(...columns)
  const width = maxColumn - minColumn + 1
  const height = maxRow - minRow + 1

  return region.cells.length === width * height
}

function validateRegionShapes(level: Level): string[] {
  return level.regions
    .filter(isPerfectRectangleRegion)
    .map((region) => `Região ${region.regionId} forma um retângulo perfeito.`)
}
