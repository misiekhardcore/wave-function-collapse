import type { Tile, TileEdges, TileObject } from '@/types';

import { SIDES } from './tileSets';

type Side = keyof TileEdges;

function neighbourIndex(index: number, side: Side, count: number, cols: number): number {
  if (side === 'top') return index - cols >= 0 ? index - cols : -1;
  if (side === 'bottom') return index + cols < count ? index + cols : -1;
  if (side === 'left') return index % cols > 0 ? index - 1 : -1;

  return index % cols < cols - 1 ? index + 1 : -1;
}

/**
 * The weight the tile carries at one cell, given which tiles are already
 * settled around it.
 *
 * A tile's `weight` is its prior, and every neighbour pair it declares a weight
 * for multiplies that prior once that neighbour is decided — so the same tile
 * can be common beside one neighbour and rare beside another, even when both
 * carry the label that meets it. Pairs the tile says nothing about, and sides
 * whose neighbour is still open, leave the weight alone; a set that declares no
 * pair weights is weighed by its priors alone.
 */
export function getTileWeight(tile: Tile, index: number, grid: TileObject[], cols: number): number {
  const prior = Math.max(0, tile.weight ?? 1);
  const pairs = tile.pairWeights;

  if (!pairs) return prior;

  return SIDES.reduce((weight, side) => {
    const neighbour = neighbourIndex(index, side, grid.length, cols);
    if (neighbour === -1) return weight;

    const cell = grid[neighbour];
    if (!cell.collapsed) return weight;

    return weight * Math.max(0, pairs[side]?.[cell.options[0]] ?? 1);
  }, prior);
}
