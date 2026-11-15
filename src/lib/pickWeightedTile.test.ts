import type { Tile } from '@/types';

import { pickWeightedTile } from './pickWeightedTile';

/** Tile ids double as indexes into the array, exactly as in a tile set. */
function tile(id: number, weight?: number, pairWeights?: Tile['pairWeights']): Tile {
  return {
    id,
    top: [],
    right: [],
    bottom: [],
    left: [],
    edges: { top: 'open', right: 'open', bottom: 'open', left: 'open' },
    weight,
    pairWeights,
  };
}

/** Two cells side by side, the left one already decided as `neighbourTileId`. */
function context(neighbourTileId: number) {
  return {
    index: 1,
    cols: 2,
    grid: [
      { col: 0, row: 0, options: [neighbourTileId], collapsed: true },
      { col: 1, row: 0, options: [0, 1], collapsed: false },
    ],
  };
}

describe('pickWeightedTile', () => {
  it('should pick one of the given options', () => {
    const tiles = [tile(0), tile(1), tile(2)];

    for (let draw = 0; draw < 50; draw++) {
      expect([0, 1, 2]).toContain(pickWeightedTile([0, 1, 2], tiles));
    }
  });

  it('should never pick a tile weighted to zero', () => {
    const tiles = [tile(0, 0), tile(1)];

    for (let draw = 0; draw < 200; draw++) {
      expect(pickWeightedTile([0, 1], tiles)).toBe(1);
    }
  });

  it('should favour heavier tiles', () => {
    const tiles = [tile(0, 9), tile(1, 1)];
    let heavy = 0;

    for (let draw = 0; draw < 300; draw++) {
      if (pickWeightedTile([0, 1], tiles) === 0) heavy++;
    }

    expect(heavy).toBeGreaterThan(200);
  });

  it('should stay uniform when every weight is zero', () => {
    const tiles = [tile(0, 0), tile(1, 0)];

    for (let draw = 0; draw < 50; draw++) {
      expect([0, 1]).toContain(pickWeightedTile([0, 1], tiles));
    }
  });

  it('should never pick a pair the cell rules out', () => {
    const tiles = [tile(0, 1, { left: { 0: 0 } }), tile(1, 1)];

    for (let draw = 0; draw < 200; draw++) {
      expect(pickWeightedTile([0, 1], tiles, context(0))).toBe(1);
    }
  });

  it('should favour the pair the cell allows', () => {
    const tiles = [tile(0, 1, { left: { 0: 0.001 } }), tile(1, 1)];
    let favouring = 0;

    for (let draw = 0; draw < 1000; draw++) {
      if (pickWeightedTile([0, 1], tiles, context(0)) === 1) favouring++;
    }

    // The pair weighs a thousandth of its neighbour, so over a thousand draws
    // the other tile should lose only a handful of them.
    expect(favouring).toBeGreaterThan(985);
  });

  it('should weigh the same side differently for a different neighbour', () => {
    const tiles = [tile(0, 1, { left: { 0: 0.001 } }), tile(1, 1)];
    const picked = new Set<number>();

    for (let draw = 0; draw < 200; draw++) {
      picked.add(pickWeightedTile([0, 1], tiles, context(1)));
    }

    expect([...picked].sort()).toEqual([0, 1]);
  });

  it('should ignore pair weights when the cell is not known', () => {
    const tiles = [tile(0, 1, { left: { 0: 0.001 } }), tile(1, 1)];
    const picked = new Set<number>();

    for (let draw = 0; draw < 200; draw++) {
      picked.add(pickWeightedTile([0, 1], tiles));
    }

    expect([...picked].sort()).toEqual([0, 1]);
  });
});
