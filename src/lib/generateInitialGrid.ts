import { TileObject } from '@/types';

import { pickRandomArrayElement } from './pickRandomArrayElement';
import { tiles } from './tiles';

export function generateInitialGrid(
  countOfInitialTiles: number,
  cols: number,
  rows: number
): TileObject[] {
  const grid: TileObject[] = Array.from({ length: cols * rows }).map((_, idx) => ({
    col: idx % cols,
    row: Math.floor(idx / cols),
    options: Array.from({ length: tiles.length }, (_, i) => i),
    collapsed: false,
  }));

  const randomTiles: TileObject[] = [];
  Array.from({ length: countOfInitialTiles }).forEach(() => {
    let randomTile = pickRandomArrayElement(grid);
    while (randomTiles.includes(randomTile)) {
      randomTile = pickRandomArrayElement(grid);
    }
    randomTiles.push(randomTile);
  });
  randomTiles.forEach((tile) => {
    grid[grid.indexOf(tile)] = {
      ...tile,
      options: [pickRandomArrayElement(tiles).id],
      collapsed: true,
    };
  });

  return grid;
}
