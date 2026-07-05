export type Coordinate = readonly [row: number, column: number];

export type CellState = "VAZIA" | "X_BRANCO" | "GATO" | "X_VERMELHO";

export type GameStatus = "PLAYING" | "WON" | "GAME_OVER" | "PAUSED";

export type RegionCategory = "DEFAULT" | "MICRO";

export type Region = {
  regionId: number | string;
  color: string;
  cells: Coordinate[];
  category?: RegionCategory;
};

export type Level = {
  levelId: number | string;
  gridSize: number;
  totalCatsRequired: number;
  regions: Region[];
  solution: Coordinate[];
};

export type Cell = {
  row: number;
  column: number;
  regionId: Region["regionId"];
  regionColor: string;
  state: CellState;
};

export type GameState = {
  level: Level;
  cells: Cell[][];
  status: GameStatus;
  previousStatus: GameStatus | null;
  lives: number;
  maxLives: number;
  catsFound: number;
  score: number;
};
