import type { Bias } from '@/types';

/** Deterministic hash of a cell index, in [0, 1). */
function cellNoise(index: number): number {
  let hash = (index + 0x9e3779b9) >>> 0;

  hash = Math.imul(hash ^ (hash >>> 16), 0x21f0aaad);
  hash = Math.imul(hash ^ (hash >>> 15), 0x735a2d97);
  hash ^= hash >>> 15;

  return (hash >>> 0) / 4294967296;
}

/**
 * How much the set's weights count at one cell.
 *
 * `constant` spreads them evenly. `noise` multiplies them by a per-cell factor
 * between one half and one and a half, which makes the pattern patchy without
 * changing which tiles are allowed anywhere. The factor is derived from the
 * cell alone, so the same cell always carries the same bias.
 */
export function getBiasFactor(bias: Bias, index: number): number {
  if (bias === 'constant') return 1;

  return 0.5 + cellNoise(index);
}
