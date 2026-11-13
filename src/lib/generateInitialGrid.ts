import type { Tile, TileObject } from '@/types';

import { canPlaceTile } from './canPlaceTile';
import { pickWeightedTile } from './pickWeightedTile';

export function generateInitialGrid(
  countOfInitialTiles: number,
  cols: number,
  rows: number,
  tiles: Tile[]
): TileObject[] {
  const grid: TileObject[] = Array.from({ length: cols * rows }).map((_, idx) => ({
    col: idx % cols,
    row: Math.floor(idx / cols),
    options: Array.from({ length: tiles.length }, (_, i) => i),
    collapsed: false,
  }));

  const seedIndices: number[] = [];
  const allTileIds = tiles.map((tile) => tile.id);

  while (seedIndices.length < countOfInitialTiles && seedIndices.length < grid.length) {
    const index = Math.floor(Math.random() * grid.length);
    if (!seedIndices.includes(index)) seedIndices.push(index);
  }

  for (const index of seedIndices) {
    const placeable = allTileIds.filter((tileId) => canPlaceTile(tileId, index, grid, cols, tiles));

    grid[index] = {
      ...grid[index],
      options: [pickWeightedTile(placeable.length > 0 ? placeable : allTileIds, tiles)],
      collapsed: true,
    };
  }

  return grid;
}
