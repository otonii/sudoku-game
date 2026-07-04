import { areAdjacent, coordinateKey } from './gameRules'
import { validateRegionGeometry } from './regionGeometry'
import type { Coordinate, Level } from './gameTypes'

export function validateLevel(level: Level): string[] {
  const errors: string[] = []

  if (level.gridSize <= 0) {
    errors.push('gridSize deve ser maior que zero.')
  }

  if (level.totalCatsRequired !== level.gridSize) {
    errors.push('totalCatsRequired deve ser igual ao gridSize.')
  }

  errors.push(...validateRegions(level))
  errors.push(...validateSolution(level))
  errors.push(...validateRegionGeometry(level))

  return errors
}

function validateRegions(level: Level): string[] {
  const errors: string[] = []
  const seenCells = new Set<string>()

  for (const region of level.regions) {
    for (const cell of region.cells) {
      const key = coordinateKey(cell)

      if (!isInsideGrid(level, cell)) {
        errors.push(`Célula fora do grid: ${key}.`)
      }

      if (seenCells.has(key)) {
        errors.push(`Célula duplicada em regiões: ${key}.`)
      }

      seenCells.add(key)
    }
  }

  const expectedCells = level.gridSize * level.gridSize

  if (seenCells.size !== expectedCells) {
    errors.push(`O grid tem ${seenCells.size} células regionais, mas esperava ${expectedCells}.`)
  }

  return errors
}

function validateSolution(level: Level): string[] {
  const errors: string[] = []
  const solutionKeys = new Set(level.solution.map(coordinateKey))

  if (solutionKeys.size !== level.solution.length) {
    errors.push('A solução possui coordenadas duplicadas.')
  }

  if (level.solution.length !== level.totalCatsRequired) {
    errors.push('A solução não possui o total de gatos exigido.')
  }

  for (const cell of level.solution) {
    if (!isInsideGrid(level, cell)) {
      errors.push(`Solução possui célula fora do grid: ${coordinateKey(cell)}.`)
    }
  }

  validateUniqueAxis(level.solution, 0, 'linha', errors)
  validateUniqueAxis(level.solution, 1, 'coluna', errors)
  validateUniqueRegion(level, errors)
  validateAdjacency(level.solution, errors)

  return errors
}

function validateUniqueAxis(
  solution: Coordinate[],
  axis: 0 | 1,
  label: string,
  errors: string[],
): void {
  const values = new Set<number>()

  for (const cell of solution) {
    if (values.has(cell[axis])) {
      errors.push(`A solução possui mais de um gato na mesma ${label}.`)
      return
    }

    values.add(cell[axis])
  }
}

function validateUniqueRegion(level: Level, errors: string[]): void {
  const regionByCell = new Map<string, Level['regions'][number]['regionId']>()

  for (const region of level.regions) {
    for (const cell of region.cells) {
      regionByCell.set(coordinateKey(cell), region.regionId)
    }
  }

  const regionsWithCats = new Set<Level['regions'][number]['regionId']>()

  for (const cell of level.solution) {
    const regionId = regionByCell.get(coordinateKey(cell))

    if (regionId === undefined) {
      errors.push(`Solução aponta para célula sem região: ${coordinateKey(cell)}.`)
      continue
    }

    if (regionsWithCats.has(regionId)) {
      errors.push('A solução possui mais de um gato na mesma região.')
      return
    }

    regionsWithCats.add(regionId)
  }
}

function validateAdjacency(solution: Coordinate[], errors: string[]): void {
  for (let index = 0; index < solution.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < solution.length; nextIndex += 1) {
      if (areAdjacent(solution[index], solution[nextIndex])) {
        errors.push('A solução possui gatos adjacentes.')
        return
      }
    }
  }
}

function isInsideGrid(level: Level, [row, column]: Coordinate): boolean {
  return row >= 0 && row < level.gridSize && column >= 0 && column < level.gridSize
}
