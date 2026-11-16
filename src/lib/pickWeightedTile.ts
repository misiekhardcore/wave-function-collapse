import type { Bias, Tile, TileObject } from '@/types';

import { getBiasFactor } from './bias';
import { getAverageWeight, getTileWeight } from './getTileWeight';

/**
 * The cell a tile is being weighed for. Without it every tile is weighed by its
 * average pair; with it, by the pairs settled around that cell and by how much
 * the set's bias counts there.
 */
export type WeightContext = {
  index: number;
  grid: TileObject[];
  cols: number;
  bias: Bias;
};

/**
 * Picks one of the given tile ids, honouring the weight of the tile and of the
 * pair it would make with each neighbour already settled at the cell.
 *
 * A set only overrides the pairs it cares about, so the multiplier is one almost
 * everywhere; the tile's own weight does the rest. Without a context the tile's
 * average pair decides, which is what seeds use.
 */
export function pickWeightedTile(
  options: number[],
  tiles: Tile[],
  context?: WeightContext
): number {
  const weights = options.map((id) =>
    context
      ? getTileWeight(tiles[id], context.index, context.grid, context.cols) *
        getBiasFactor(context.bias, context.index)
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
