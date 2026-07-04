import type { Level } from "../domain/gameTypes";

export const levels: Level[] = [
  {
    levelId: 1,
    gridSize: 6,
    totalCatsRequired: 6,
    regions: [
      {
        regionId: 0,
        color: "#6bb9b7",
        cells: [
          [0, 0],
          [0, 1],
          [0, 2],
          [1, 0],
          [1, 1],
          [1, 2],
          [2, 0],
        ],
      },
      {
        regionId: 1,
        color: "#a9d88b",
        cells: [
          [0, 3],
          [0, 4],
          [0, 5],
          [1, 3],
          [1, 4],
          [2, 3],
        ],
      },
      {
        regionId: 2,
        color: "#a8784e",
        cells: [
          [1, 5],
          [2, 4],
          [2, 5],
          [3, 5],
        ],
      },
      {
        regionId: 3,
        color: "#c85578",
        cells: [
          [2, 1],
          [2, 2],
          [3, 1],
          [3, 2],
          [3, 3],
        ],
      },
      {
        regionId: 4,
        color: "#d6843d",
        cells: [
          [3, 4],
          [4, 3],
          [4, 4],
          [4, 5],
          [5, 3],
          [5, 4],
          [5, 5],
        ],
      },
      {
        regionId: 5,
        color: "#b486df",
        cells: [
          [3, 0],
          [4, 0],
          [4, 1],
          [4, 2],
          [5, 0],
          [5, 1],
          [5, 2],
        ],
      },
    ],
    solution: [
      [0, 0],
      [1, 3],
      [2, 5],
      [3, 2],
      [4, 4],
      [5, 1],
    ],
  },
];
