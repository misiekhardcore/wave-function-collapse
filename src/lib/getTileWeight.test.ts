import type { Tile, TileObject } from '@/types';

import { getTileWeight } from './getTileWeight';

const COLS = 3;

function tile(weight?: number, pairWeights?: Tile['pairWeights']): Tile {
  return {
    id: 0,
    top: [],
    right: [],
    bottom: [],
    left: [],
    edges: { top: 'land', right: 'beach', bottom: 'water', left: 'land' },
    weight,
    pairWeights,
  };
}

/** A 3 x 3 board with the given cells decided as the given tiles. */
function grid(decided: Record<number, number> = {}): TileObject[] {
  return Array.from({ length: COLS * 3 }, (_, index) => ({
    col: index % COLS,
    row: Math.floor(index / COLS),
    options: [decided[index] ?? 0],
    collapsed: index in decided,
  }));
}

describe('getTileWeight', () => {
  // The centre cell of the 3 x 3 grid used below.
  const CENTRE = 4;
  const TOP = 1;
  const RIGHT = 5;
  const LEFT = 3;

  it('should weigh a tile by its own weight alone', () => {
    expect(getTileWeight(tile(2.5), CENTRE, grid(), COLS)).toBe(2.5);
  });

  it('should default a tile without a weight to one', () => {
    expect(getTileWeight(tile(), CENTRE, grid({ [TOP]: 0, [RIGHT]: 0, [LEFT]: 0 }), COLS)).toBe(1);
  });

  it('should apply a pair weight once that neighbour is decided', () => {
    const weighted = tile(2, { right: { 7: 0.25 } });

    expect(getTileWeight(weighted, CENTRE, grid(), COLS)).toBe(2);
    expect(getTileWeight(weighted, CENTRE, grid({ [RIGHT]: 7 }), COLS)).toBe(0.5);
  });

  it('should leave a neighbour the pair weights say nothing about at one', () => {
    expect(getTileWeight(tile(2, { right: { 7: 0.25 } }), CENTRE, grid({ [RIGHT]: 8 }), COLS)).toBe(
      2
    );
  });

  it('should weigh the same side differently for a different neighbour', () => {
    // Two neighbours that both carry this tile's right label, weighed apart.
    const weighted = tile(1, { right: { 7: 0.1, 8: 10 } });

    expect(getTileWeight(weighted, CENTRE, grid({ [RIGHT]: 7 }), COLS)).toBeCloseTo(0.1);
    expect(getTileWeight(weighted, CENTRE, grid({ [RIGHT]: 8 }), COLS)).toBeCloseTo(10);
  });

  it('should ignore a side without a neighbour', () => {
    // Top-left corner: only the right and bottom neighbours exist.
    expect(getTileWeight(tile(2, { top: { 0: 0.5 } }), 0, grid(), COLS)).toBe(2);
  });

  it('should multiply the weight of every decided neighbour', () => {
    expect(
      getTileWeight(
        tile(2, { top: { 7: 2 }, right: { 8: 3 } }),
        CENTRE,
        grid({ [TOP]: 7, [RIGHT]: 8 }),
        COLS
      )
    ).toBe(12);
  });

  it('should keep a tile ruled out by a zero pair weight at zero', () => {
    expect(getTileWeight(tile(5, { left: { 7: 0 } }), CENTRE, grid({ [LEFT]: 7 }), COLS)).toBe(0);
  });
});
