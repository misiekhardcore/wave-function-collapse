import { TileObject } from '@/types';

export function findTilesIndicesWithLeastOptions(grid: TileObject[]): number[] {
  const lengths: number[] = [];
  for (let i = 0; i < grid.length; i++) {
    const tile = grid[i];
    if (!tile.collapsed) {
      lengths.push(tile.options.length);
    }
  }
  const minOptions = Math.min(...lengths);
  const indicies: number[] = [];
  for (let i = 0; i < grid.length; i++) {
    const tile = grid[i];
    if (tile.options.length === minOptions) {
      indicies.push(i);
    }
  }

  return indicies;
}
