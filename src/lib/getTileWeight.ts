import type { Tile, TileEdges, TileObject } from '@/types';

import { SIDES } from './tileSets';

type Side = keyof TileEdges;

function neighbourIndex(index: number, side: Side, count: number, cols: number): number {
  if (side === 'top') return index - cols >= 0 ? index - cols : -1;
  if (side === 'bottom') return index + cols < count ? index + cols : -1;
  if (side === 'left') return index % cols > 0 ? index - 1 : -1;

  return index % cols < cols - 1 ? index + 1 : -1;
}

/** Mean of every pair a tile declares, cached on the tile itself. */
const averages = new WeakMap<Tile, number>();

/**
 * What a tile weighs where nothing around it is settled yet: the mean of every
 * pair it allows. A tile that is equally likely beside every neighbour it
 * accepts therefore carries that one number everywhere.
 */
export function getAverageWeight(tile: Tile): number {
  const cached = averages.get(tile);
  if (cached !== undefined) return cached;

  const weights = SIDES.flatMap((side) => Object.values(tile.pairWeights[side]));
  const mean =
    weights.length > 0 ? weights.reduce((sum, weight) => sum + weight, 0) / weights.length : 1;

  averages.set(tile, mean);

  return mean;
}

/**
 * The weight the tile carries at one cell: the mean of the pairs already settled
 * around it. A side whose neighbour is still open, or a side at the edge of the
 * board, says nothing — and a cell with nothing settled around it falls back to
 * the tile's overall mean.
 *
 * Weighting by the mean rather than the product keeps a pair's number meaningful
 * on its own: four neighbours do not make a tile four times rarer than one.
 */
export function getTileWeight(tile: Tile, index: number, grid: TileObject[], cols: number): number {
  let total = 0;
  let settled = 0;

  for (const side of SIDES) {
    const neighbour = neighbourIndex(index, side, grid.length, cols);
    if (neighbour === -1) continue;

    const cell = grid[neighbour];
    if (!cell.collapsed) continue;

    total += tile.pairWeights[side][cell.options[0]] ?? 1;
    settled++;
  }

  return settled === 0 ? getAverageWeight(tile) : total / settled;
}
