import { validateLevel } from "../levelValidation";
import type { Coordinate, Level, Region } from "../gameTypes";

const HARD_GRID_SIZE = 10;
const HARD_MAX_ATTEMPTS = 700;
const REGION_MAX_CELLS = HARD_GRID_SIZE * 2 - 2;
const MIN_STARTER_REGIONS = 6;
const MIN_NON_STARTER_TRACK_COVERAGE = 3;
const MIN_NON_STARTER_SPREAD_SCORE = 5;
const MAX_STARTER_SPREAD_SCORE = 4;
const MAX_STARTER_TRACK_COVERAGE = 2;
const EXPLORATORY_PICK_CHANCE = 0.72;
const MICRO_REGION_MAX_COUNT = 2;
const MICRO_REGION_ONE_CELL_CHANCE = 0.25;

const HARD_REGION_COLORS = [
  "#6bb9b7",
  "#8fc7e8",
  "#a8784e",
  "#c85578",
  "#d6843d",
  "#b486df",
  "#6f88b5",
  "#e7a080",
  "#9dbf73",
  "#a4aac8",
];

type GenerateHardLevelOptions = {
  levelId: number | string;
  maxAttempts?: number;
};

type OwnedCell = {
  row: number;
  column: number;
  regionId: number;
};

type StarterRegion = {
  regionId: number;
  axis: "row" | "column";
  allowedTracks?: readonly [number, number];
};

type RegionPlan = {
  starterRegionIds: Set<number>;
  microRegionTargets: Map<number, number>;
};

type GenerationDebugStats = {
  regionGrowthFailed: number;
  noCandidatesLeft: number;
  levelValidationFailed: number;
  starterValidationFailed: number;
  balancedDifficultyFailed: number;
};

export function generateHardLevel({
  levelId,
  maxAttempts = HARD_MAX_ATTEMPTS,
}: GenerateHardLevelOptions): Level {
  const preferredStats = createGenerationDebugStats();
  const preferredLevel = tryGenerateHardLevel(
    levelId,
    maxAttempts,
    true,
    preferredStats,
  );

  if (preferredLevel) {
    return preferredLevel;
  }

  const fallbackStats = createGenerationDebugStats();
  const fallbackLevel = tryGenerateHardLevel(
    levelId,
    maxAttempts,
    false,
    fallbackStats,
  );

  if (fallbackLevel) {
    return fallbackLevel;
  }

  throw new Error(
    [
      "Não foi possível gerar um nível hard válido.",
      `preferred: growth=${preferredStats.regionGrowthFailed}, noCandidates=${preferredStats.noCandidatesLeft}, validation=${preferredStats.levelValidationFailed}, starter=${preferredStats.starterValidationFailed}, difficulty=${preferredStats.balancedDifficultyFailed}`,
      `fallback: growth=${fallbackStats.regionGrowthFailed}, noCandidates=${fallbackStats.noCandidatesLeft}, validation=${fallbackStats.levelValidationFailed}, starter=${fallbackStats.starterValidationFailed}, difficulty=${fallbackStats.balancedDifficultyFailed}`,
    ].join(" "),
  );
}

function tryGenerateHardLevel(
  levelId: number | string,
  maxAttempts: number,
  enforceBalancedDifficulty: boolean,
  debugStats: GenerationDebugStats,
): Level | null {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const solution = generateHardSolution();
    const starterRegions = generateStarterRegions(solution);
    const regionPlan = createRegionPlan(starterRegions);
    const regions = generateHardRegions(solution, starterRegions, regionPlan);

    if (!regions) {
      debugStats.noCandidatesLeft += 1;
      continue;
    }

    const level: Level = {
      levelId,
      gridSize: HARD_GRID_SIZE,
      totalCatsRequired: HARD_GRID_SIZE,
      regions,
      solution,
    };

    if (!hasExpectedStarterRegions(regions, starterRegions)) {
      debugStats.starterValidationFailed += 1;
      continue;
    }

    const levelErrors = validateLevel(level);
    if (levelErrors.length > 0) {
      debugStats.levelValidationFailed += 1;
      continue;
    }

    if (!enforceBalancedDifficulty) {
      return level;
    }

    if (hasBalancedRegionDifficulty(level, starterRegions)) {
      return level;
    }

    debugStats.balancedDifficultyFailed += 1;
  }

  return null;
}

function generateHardSolution(): Coordinate[] {
  for (let attempt = 0; attempt < HARD_MAX_ATTEMPTS; attempt += 1) {
    const columns = shuffle(
      Array.from({ length: HARD_GRID_SIZE }, (_, index) => index),
    );
    const solution = columns.map((column, row) => [row, column] as const);

    if (hasNoTouchingCats(solution)) {
      return solution;
    }
  }

  throw new Error("Não foi possível gerar uma solução hard válida.");
}

function generateHardRegions(
  solution: Coordinate[],
  starterRegions: StarterRegion[],
  regionPlan: RegionPlan,
): Region[] | null {
  const owners = createEmptyOwnerGrid();
  const regionCells = solution.map((cell, regionId) => {
    const [row, column] = cell;
    owners[row][column] = regionId;
    return [cell];
  });

  if (!growRegionsToTargets(owners, regionCells, starterRegions, regionPlan)) {
    return null;
  }

  while (hasUnownedCells(owners)) {
    const candidates = collectGrowthCandidates(
      owners,
      regionCells,
      starterRegions,
      regionPlan,
      false,
    );

    if (candidates.length === 0) {
      return null;
    }

    const candidate = pickWeightedHardCandidate(candidates, regionCells);
    assignCell(owners, regionCells, candidate);
  }

  return regionCells.map((cells, regionId) => ({
    regionId,
    color: HARD_REGION_COLORS[regionId % HARD_REGION_COLORS.length],
    cells,
    category: regionPlan.microRegionTargets.has(regionId) ? "MICRO" : undefined,
  }));
}

function growRegionsToTargets(
  owners: number[][],
  regionCells: Coordinate[][],
  starterRegions: StarterRegion[],
  regionPlan: RegionPlan,
): boolean {
  for (let regionId = 0; regionId < regionCells.length; regionId += 1) {
    const targetSize = getRegionTargetSize(regionId, regionPlan);

    while (regionCells[regionId].length < targetSize) {
      const candidates = collectGrowthCandidatesForRegion(
        owners,
        regionCells,
        regionId,
        starterRegions,
        true,
      );

      if (candidates.length === 0) {
        return false;
      }

      assignCell(owners, regionCells, pickRandom(candidates));
    }
  }

  return true;
}

function collectGrowthCandidates(
  owners: number[][],
  regionCells: Coordinate[][],
  starterRegions: StarterRegion[],
  regionPlan: RegionPlan,
  enforceStarterConstraint: boolean,
): OwnedCell[] {
  return regionCells.flatMap((cells, regionId) => {
    const maxCells = getRegionMaxSize(regionId, regionPlan);

    if (cells.length >= maxCells) {
      return [];
    }

    return collectGrowthCandidatesForRegion(
      owners,
      regionCells,
      regionId,
      starterRegions,
      enforceStarterConstraint,
    );
  });
}

function collectGrowthCandidatesForRegion(
  owners: number[][],
  regionCells: Coordinate[][],
  regionId: number,
  starterRegions: StarterRegion[],
  enforceStarterConstraint: boolean,
): OwnedCell[] {
  const seen = new Set<string>();
  const candidates: OwnedCell[] = [];

  for (const [row, column] of regionCells[regionId]) {
    for (const [nextRow, nextColumn] of getOrthogonalNeighbors(row, column)) {
      if (
        !isInsideGrid(nextRow, nextColumn) ||
        owners[nextRow][nextColumn] !== -1
      ) {
        continue;
      }

      const key = `${nextRow}:${nextColumn}`;

      if (seen.has(key)) {
        continue;
      }

      const candidate = { row: nextRow, column: nextColumn, regionId };

      if (
        enforceStarterConstraint &&
        !matchesStarterRegionConstraint(
          candidate,
          regionCells[regionId],
          starterRegions,
        )
      ) {
        continue;
      }

      seen.add(key);
      candidates.push(candidate);
    }
  }

  return candidates;
}

function createRegionPlan(starterRegions: StarterRegion[]): RegionPlan {
  const starterRegionIds = new Set(
    starterRegions.map(({ regionId }) => regionId),
  );
  const microRegionTargets = pickMicroRegionTargets(starterRegionIds);

  return {
    starterRegionIds,
    microRegionTargets,
  };
}

function pickMicroRegionTargets(
  starterRegionIds: Set<number>,
): Map<number, number> {
  const eligibleRegionIds = shuffle(
    Array.from({ length: HARD_GRID_SIZE }, (_, regionId) => regionId).filter(
      (regionId) => !starterRegionIds.has(regionId),
    ),
  );
  const microRegionCount = Math.min(
    eligibleRegionIds.length,
    MICRO_REGION_MAX_COUNT,
  );
  const selectedRegionIds = eligibleRegionIds.slice(0, microRegionCount);
  const microTargets = selectedRegionIds.map((regionId, index) => {
    if (index === 0) {
      return [regionId, 2] as const;
    }

    return [
      regionId,
      Math.random() < MICRO_REGION_ONE_CELL_CHANCE ? 1 : 3,
    ] as const;
  });

  return new Map(microTargets);
}

function getRegionTargetSize(regionId: number, regionPlan: RegionPlan): number {
  const microTarget = regionPlan.microRegionTargets.get(regionId);

  if (microTarget !== undefined) {
    return microTarget;
  }

  if (regionPlan.starterRegionIds.has(regionId)) {
    return 1;
  }

  return 1;
}

function getRegionMaxSize(regionId: number, regionPlan: RegionPlan): number {
  const microTarget = regionPlan.microRegionTargets.get(regionId);

  if (microTarget !== undefined) {
    return microTarget;
  }

  return REGION_MAX_CELLS;
}

function generateStarterRegions(solution: Coordinate[]): StarterRegion[] {
  const starterCount = MIN_STARTER_REGIONS;
  const parallelPair = pickParallelStarterPair(solution);
  const usedRegionIds = new Set(parallelPair.map(({ regionId }) => regionId));
  const remainingRegionIds = shuffle(
    Array.from({ length: HARD_GRID_SIZE }, (_, regionId) => regionId).filter(
      (regionId) => !usedRegionIds.has(regionId),
    ),
  );
  const extraStarters = remainingRegionIds
    .slice(0, starterCount - parallelPair.length)
    .map((regionId) => ({
      regionId,
      axis: Math.random() < 0.5 ? ("row" as const) : ("column" as const),
    }));

  return [...parallelPair, ...extraStarters];
}

function pickParallelStarterPair(solution: Coordinate[]): StarterRegion[] {
  if (Math.random() < 0.5) {
    const row = Math.floor(Math.random() * (HARD_GRID_SIZE - 1));

    return [
      { regionId: row, axis: "row", allowedTracks: [row, row + 1] },
      { regionId: row + 1, axis: "row", allowedTracks: [row, row + 1] },
    ];
  }

  const columnPairs = findAdjacentColumnRegionPairs(solution);

  if (columnPairs.length > 0) {
    const [firstRegionId, secondRegionId, firstColumn, secondColumn] =
      pickRandom(columnPairs);

    return [
      {
        regionId: firstRegionId,
        axis: "column",
        allowedTracks: [firstColumn, secondColumn],
      },
      {
        regionId: secondRegionId,
        axis: "column",
        allowedTracks: [firstColumn, secondColumn],
      },
    ];
  }

  const row = Math.floor(Math.random() * (HARD_GRID_SIZE - 1));

  return [
    { regionId: row, axis: "row", allowedTracks: [row, row + 1] },
    { regionId: row + 1, axis: "row", allowedTracks: [row, row + 1] },
  ];
}

function findAdjacentColumnRegionPairs(
  solution: Coordinate[],
): Array<readonly [number, number, number, number]> {
  const regionByColumn = new Map<number, number>();

  for (const [regionId, [, column]] of solution.entries()) {
    regionByColumn.set(column, regionId);
  }

  return Array.from({ length: HARD_GRID_SIZE - 1 }, (_, column) => {
    const firstRegionId = regionByColumn.get(column);
    const secondRegionId = regionByColumn.get(column + 1);

    if (firstRegionId === undefined || secondRegionId === undefined) {
      return null;
    }

    return [firstRegionId, secondRegionId, column, column + 1] as const;
  }).filter((pair) => pair !== null);
}

function hasExpectedStarterRegions(
  regions: Region[],
  starterRegions: StarterRegion[],
): boolean {
  const starterRegionIds = new Set(
    starterRegions.map(({ regionId }) => regionId),
  );
  const plannedStarters = regions.filter(({ regionId }) =>
    starterRegionIds.has(Number(regionId)),
  );

  return (
    plannedStarters.length === MIN_STARTER_REGIONS &&
    hasSharedStarterTrack(plannedStarters)
  );
}

function hasSharedStarterTrack(regions: Region[]): boolean {
  for (let index = 0; index < regions.length; index += 1) {
    for (
      let nextIndex = index + 1;
      nextIndex < regions.length;
      nextIndex += 1
    ) {
      const currentRows = new Set(regions[index].cells.map(([row]) => row));
      const currentColumns = new Set(
        regions[index].cells.map(([, column]) => column),
      );
      const nextRows = new Set(regions[nextIndex].cells.map(([row]) => row));
      const nextColumns = new Set(
        regions[nextIndex].cells.map(([, column]) => column),
      );

      if (
        setsIntersect(currentRows, nextRows) ||
        setsIntersect(currentColumns, nextColumns)
      ) {
        return true;
      }
    }
  }

  return false;
}

function matchesStarterRegionConstraint(
  candidate: OwnedCell,
  currentCells: Coordinate[],
  starterRegions: StarterRegion[],
): boolean {
  const starterRegion = starterRegions.find(
    ({ regionId }) => regionId === candidate.regionId,
  );

  if (!starterRegion) {
    return true;
  }

  const nextCells: Coordinate[] = [
    ...currentCells,
    [candidate.row, candidate.column],
  ];
  const rows = new Set(nextCells.map(([row]) => row));
  const columns = new Set(nextCells.map(([, column]) => column));

  if (starterRegion.allowedTracks) {
    const allowedTracks = new Set(starterRegion.allowedTracks);
    const tracks = starterRegion.axis === "row" ? rows : columns;

    return Array.from(tracks).every((track) => allowedTracks.has(track));
  }

  return starterRegion.axis === "row" ? rows.size <= 2 : columns.size <= 2;
}

function pickWeightedHardCandidate(
  candidates: OwnedCell[],
  regionCells: Coordinate[][],
): OwnedCell {
  const shuffledCandidates = shuffle(candidates);
  const exploratoryCandidates = shuffledCandidates.filter((candidate) =>
    increasesRegionSpread(candidate, regionCells[candidate.regionId]),
  );

  if (
    exploratoryCandidates.length > 0 &&
    Math.random() < EXPLORATORY_PICK_CHANCE
  ) {
    return pickRandom(exploratoryCandidates);
  }

  return pickRandom(shuffledCandidates);
}

function increasesRegionSpread(
  candidate: OwnedCell,
  cells: Coordinate[],
): boolean {
  const rows = cells.map(([row]) => row);
  const columns = cells.map(([, column]) => column);

  return (
    candidate.row < Math.min(...rows) ||
    candidate.row > Math.max(...rows) ||
    candidate.column < Math.min(...columns) ||
    candidate.column > Math.max(...columns)
  );
}

function hasBalancedRegionDifficulty(
  level: Level,
  starterRegions: StarterRegion[],
): boolean {
  const starterRegionIds = new Set(
    starterRegions.map(({ regionId }) => regionId),
  );
  const starters = level.regions.filter(({ regionId }) =>
    starterRegionIds.has(Number(regionId)),
  );
  const nonStarters = level.regions.filter(
    ({ regionId, category }) =>
      !starterRegionIds.has(Number(regionId)) && category !== "MICRO",
  );

  if (starters.length !== MIN_STARTER_REGIONS || nonStarters.length === 0) {
    return false;
  }

  const starterRegionsAreCompact = starters.every((region) =>
    isCompactStarterRegion(region.cells),
  );
  const qualifiedNonStarters = nonStarters.filter(
    (region) =>
      getRegionSpreadScore(region.cells) >= MIN_NON_STARTER_SPREAD_SCORE &&
      touchesEnoughTracks(region.cells),
  );

  return starterRegionsAreCompact && qualifiedNonStarters.length >= 3;
}

function getRegionSpreadScore(cells: Coordinate[]): number {
  const rows = new Set(cells.map(([row]) => row));
  const columns = new Set(cells.map(([, column]) => column));

  return rows.size + columns.size;
}

function isCompactStarterRegion(cells: Coordinate[]): boolean {
  const rows = new Set(cells.map(([row]) => row));
  const columns = new Set(cells.map(([, column]) => column));

  return (
    getRegionSpreadScore(cells) <= MAX_STARTER_SPREAD_SCORE &&
    (rows.size <= MAX_STARTER_TRACK_COVERAGE ||
      columns.size <= MAX_STARTER_TRACK_COVERAGE)
  );
}

function touchesEnoughTracks(cells: Coordinate[]): boolean {
  const rows = new Set(cells.map(([row]) => row));
  const columns = new Set(cells.map(([, column]) => column));

  return (
    rows.size >= MIN_NON_STARTER_TRACK_COVERAGE &&
    columns.size >= MIN_NON_STARTER_TRACK_COVERAGE
  );
}

function assignCell(
  owners: number[][],
  regionCells: Coordinate[][],
  { row, column, regionId }: OwnedCell,
): void {
  owners[row][column] = regionId;
  regionCells[regionId].push([row, column]);
}

function hasNoTouchingCats(solution: Coordinate[]): boolean {
  return solution.every(([row, column], index) => {
    const next = solution[index + 1];

    if (!next) {
      return true;
    }

    return Math.abs(row - next[0]) > 1 || Math.abs(column - next[1]) > 1;
  });
}

function hasUnownedCells(owners: number[][]): boolean {
  return owners.some((row) => row.some((owner) => owner === -1));
}

function createEmptyOwnerGrid(): number[][] {
  return Array.from({ length: HARD_GRID_SIZE }, () =>
    Array.from({ length: HARD_GRID_SIZE }, () => -1),
  );
}

function getOrthogonalNeighbors(row: number, column: number): Coordinate[] {
  return [
    [row - 1, column],
    [row + 1, column],
    [row, column - 1],
    [row, column + 1],
  ];
}

function isInsideGrid(row: number, column: number): boolean {
  return (
    row >= 0 && row < HARD_GRID_SIZE && column >= 0 && column < HARD_GRID_SIZE
  );
}

function setsIntersect<T>(left: Set<T>, right: Set<T>): boolean {
  for (const item of left) {
    if (right.has(item)) {
      return true;
    }
  }

  return false;
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    const current = shuffled[index];
    shuffled[index] = shuffled[nextIndex];
    shuffled[nextIndex] = current;
  }

  return shuffled;
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function createGenerationDebugStats(): GenerationDebugStats {
  return {
    regionGrowthFailed: 0,
    noCandidatesLeft: 0,
    levelValidationFailed: 0,
    starterValidationFailed: 0,
    balancedDifficultyFailed: 0,
  };
}
