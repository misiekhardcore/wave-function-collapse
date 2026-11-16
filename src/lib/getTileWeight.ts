import type { Side, Tile, TileObject } from '@/types';

import { SIDES } from './tileSets';

function neighbourIndex(index: number, side: Side, count: number, cols: number): number {
  if (side === 'top') return index - cols >= 0 ? index - cols : -1;
  if (side === 'bottom') return index + cols < count ? index + cols : -1;
  if (side === 'left') return index % cols > 0 ? index - 1 : -1;

  return index % cols < cols - 1 ? index + 1 : -1;
}

function mean(values: number[]): number {
  return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 1;
}

/** Mean of every pair multiplier a tile declares, cached on the tile itself. */
const pairAverages = new WeakMap<Tile, number>();

function averagePairWeight(tile: Tile): number {
  const cached = pairAverages.get(tile);
  if (cached !== undefined) return cached;

  const average = mean(SIDES.flatMap((side) => Object.values(tile.pairWeights[side])));

  pairAverages.set(tile, average);

  return average;
}

/**
 * What a tile weighs where nothing around it is settled yet: its own weight
 * times the mean of every pair it allows, which is just its own weight when the
 * set overrides no pair.
 */
export function getAverageWeight(tile: Tile): number {
  return tile.weight * averagePairWeight(tile);
}

/**
 * The weight the tile carries at one cell: its own weight times the mean of the
 * pairs already settled around it. A side whose neighbour is still open, or a
 * side at the edge of the board, says nothing — and a cell with nothing settled
 * around it falls back to the tile's average pair.
 *
 * Weighting by the mean rather than the product keeps a pair's multiplier
 * meaningful on its own: four neighbours do not make a tile four times rarer
 * than one.
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

  return tile.weight * (settled === 0 ? averagePairWeight(tile) : total / settled);
}
