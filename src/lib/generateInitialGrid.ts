import { TileObject } from '@/types';

import { pickRandomArrayIndex } from './pickRandomArrayIndex';
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

  const randomIndicies: number[] = [];
  Array.from({ length: countOfInitialTiles }).forEach(() => {
    let randomIndex = pickRandomArrayIndex(grid);
    while (randomIndicies.includes(randomIndex)) {
      randomIndex = pickRandomArrayIndex(grid);
    }
    randomIndicies.push(randomIndex);
  });
  randomIndicies.forEach((idx) => {
    grid[idx] = {
      ...grid[idx],
      options: [tiles[pickRandomArrayIndex(tiles)].id],
      collapsed: true,
    };
  });

  return grid;
}
