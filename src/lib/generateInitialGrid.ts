import type { Bias, Tile, TileObject } from '@/types';

import { canPlaceTile } from './canPlaceTile';
import { isCompatibleWithNeighbours } from './isCompatibleWithNeighbours';
import { pickWeightedTile } from './pickWeightedTile';

export function generateInitialGrid(
  countOfInitialTiles: number,
  cols: number,
  rows: number,
  tiles: Tile[],
  bias: Bias = 'constant'
): TileObject[] {
  const grid: TileObject[] = Array.from({ length: cols * rows }).map((_, idx) => ({
    col: idx % cols,
    row: Math.floor(idx / cols),
    options: Array.from({ length: tiles.length }, (_, i) => i),
    collapsed: false,
  }));

  const allTileIds = tiles.map((tile) => tile.id);
  const seeded: number[] = [];
  let attempts = 0;

  // A seed that disagrees with a seed beside it breaks the board from the very
  // start: every cell around the pair is then asked for two sockets at once, and
  // the run has to give up a seam somewhere. So a cell is only seeded with a
  // tile its already-decided neighbours accept, and a cell with no such tile is
  // left for the solver.
  while (
    seeded.length < countOfInitialTiles &&
    seeded.length < grid.length &&
    attempts < grid.length * 4
  ) {
    attempts++;

    const index = Math.floor(Math.random() * grid.length);
    if (seeded.includes(index)) continue;

    const placeable = allTileIds.filter(
      (tileId) =>
        canPlaceTile(tileId, index, grid, cols, tiles) &&
        isCompatibleWithNeighbours(tileId, index, grid, cols, tiles)
    );

    if (placeable.length === 0) continue;

    grid[index] = {
      ...grid[index],
      options: [pickWeightedTile(placeable, tiles, { index, grid, cols, bias })],
      collapsed: true,
    };
    seeded.push(index);
  }

  return grid;
}
