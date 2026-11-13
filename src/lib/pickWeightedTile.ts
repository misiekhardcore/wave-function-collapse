import type { Tile } from '@/types';

/**
 * Picks one of the given tile ids, honouring each tile's weight.
 *
 * Sets that never set a weight stay uniform, exactly as before. Weighting lets a
 * set keep a rare structure — such as a chip package that needs a whole block of
 * tiles — to a chosen share of the board without changing any of its rules.
 */
export function pickWeightedTile(options: number[], tiles: Tile[]): number {
  const weights = options.map((id) => Math.max(0, tiles[id].weight ?? 1));
  const total = weights.reduce((sum, weight) => sum + weight, 0);

  if (total <= 0) return options[Math.floor(Math.random() * options.length)];

  let roll = Math.random() * total;

  for (let index = 0; index < options.length; index++) {
    roll -= weights[index];
    if (roll < 0) return options[index];
  }

  return options[options.length - 1];
}
