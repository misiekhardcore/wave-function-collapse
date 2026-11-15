import type { Tile, TileObject } from '@/types';

import { getAverageWeight, getTileWeight } from './getTileWeight';

/**
 * The cell a tile is being weighed for. Without it every tile is weighed by its
 * average pair; with it, by the pairs settled around that cell.
 */
export type WeightContext = {
  index: number;
  grid: TileObject[];
  cols: number;
};

/**
 * Picks one of the given tile ids, honouring the weight of the pair it would
 * make with each neighbour already settled at the cell.
 *
 * The weight lives on the pair, so a set can make one tile common beside one
 * neighbour and rare beside another without anything being inferred. Without a
 * context the tile's average pair decides, which is what seeds use.
 */
export function pickWeightedTile(
  options: number[],
  tiles: Tile[],
  context?: WeightContext
): number {
  const weights = options.map((id) =>
    context
      ? getTileWeight(tiles[id], context.index, context.grid, context.cols)
      : getAverageWeight(tiles[id])
  );
  const total = weights.reduce((sum, weight) => sum + weight, 0);

  if (total <= 0) return options[Math.floor(Math.random() * options.length)];

  let roll = Math.random() * total;

  for (let index = 0; index < options.length; index++) {
    roll -= weights[index];
    if (roll < 0) return options[index];
  }

  return options[options.length - 1];
}
