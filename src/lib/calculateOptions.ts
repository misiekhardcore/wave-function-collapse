import { TileObject } from '@/types';

import { getCommonOptions } from './getCommonOptions';
import {
  getRightOptions,
  getTopOptions,
  getBottomOptions,
  getLeftOptions,
} from './getNeighborOptions';

export function calculateOptions(grid: TileObject[], cols: number, rows: number): TileObject[] {
  for (let i = 0; i < grid.length; i++) {
    if (grid[i].collapsed) {
      continue;
    }

    const northOptions = getTopOptions(grid[i], grid, cols, rows);
    const eastOptions = getRightOptions(grid[i], grid, cols, rows);
    const southOptions = getBottomOptions(grid[i], grid, cols, rows);
    const westOptions = getLeftOptions(grid[i], grid, cols, rows);
    const commonOptions = getCommonOptions(
      grid[i].options,
      northOptions,
      eastOptions,
      southOptions,
      westOptions
    );

    grid[i].options = commonOptions.length ? commonOptions : grid[i].options;
    grid[i].collapsed = commonOptions.length === 1 || grid[i].options.length === 1;
  }

  return grid;
}
