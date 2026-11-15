import type { TileObject } from '@/types';

/**
 * Indices of the undecided cells with the fewest options left.
 *
 * Collapsed cells are skipped: they are decided, and picking one would give the
 * step nothing to collapse — the run would stall while the board still has open
 * cells.
 */
export function findTilesIndicesWithLeastOptions(grid: TileObject[]): number[] {
  const lengths: number[] = [];

  for (let i = 0; i < grid.length; i++) {
    if (!grid[i].collapsed) lengths.push(grid[i].options.length);
  }

  const minOptions = Math.min(...lengths);
  const indices: number[] = [];

  for (let i = 0; i < grid.length; i++) {
    const tile = grid[i];
    if (!tile.collapsed && tile.options.length === minOptions) indices.push(i);
  }

  return indices;
}
