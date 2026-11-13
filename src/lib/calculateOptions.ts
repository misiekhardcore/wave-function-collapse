import type { Tile, TileObject } from '@/types';

import { getCommonOptions } from './getCommonOptions';
import {
  getBottomOptions,
  getLeftOptions,
  getRightOptions,
  getTopOptions,
} from './getNeighborOptions';

export function calculateOptions(grid: TileObject[], cols: number, tiles: Tile[]): TileObject[] {
  for (let i = 0; i < grid.length; i++) {
    if (grid[i].collapsed) {
      continue;
    }

    if (grid[i].options.length === 1) {
      grid[i].collapsed = true;
      continue;
    }

    const topOptions = getTopOptions(i, grid, cols, tiles);
    const rightOptions = getRightOptions(i, grid, cols, tiles);
    const bottomOptions = getBottomOptions(i, grid, cols, tiles);
    const leftOptions = getLeftOptions(i, grid, cols, tiles);
    const commonOptions = getCommonOptions(
      grid[i].options,
      topOptions,
      rightOptions,
      bottomOptions,
      leftOptions
    );

    if (commonOptions.length > 0) {
      grid[i].options = commonOptions;
    }
    grid[i].collapsed = commonOptions.length === 1;
  }

  return grid;
}
