import type { Tile, TileObject } from '@/types';

import { getTileWeight } from './getTileWeight';

/**
 * The cell a tile is being weighed for. Without it every tile is weighed by its
 * own weight; with it, the tiles' pair weights apply against the neighbours
 * already decided there.
 */
export type WeightContext = {
  index: number;
  grid: TileObject[];
  cols: number;
};

/**
 * Picks one of the given tile ids, honouring each tile's weight.
 *
 * Sets that never set a weight stay uniform, exactly as before. Weighting lets a
 * set keep a rare structure — such as a chip package that needs a whole block of
 * tiles — to a chosen share of the board without changing any of its rules.
 */
export function pickWeightedTile(
  options: number[],
  tiles: Tile[],
  context?: WeightContext
): number {
  const weights = options.map((id) =>
    context
      ? getTileWeight(tiles[id], context.index, context.grid, context.cols)
      : Math.max(0, tiles[id].weight ?? 1)
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
