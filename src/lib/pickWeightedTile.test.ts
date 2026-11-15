import type { Tile } from '@/types';

import { pickWeightedTile } from './pickWeightedTile';

const NO_PAIRS: Tile['pairWeights'] = { top: {}, right: {}, bottom: {}, left: {} };

/** Tile ids double as indexes into the array, exactly as in a tile set. */
function tile(id: number, pairWeights: Partial<Tile['pairWeights']> = {}): Tile {
  return {
    id,
    top: [],
    right: [],
    bottom: [],
    left: [],
    edges: { top: 'open', right: 'open', bottom: 'open', left: 'open' },
    pairWeights: { ...NO_PAIRS, ...pairWeights },
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

  it('should never pick a pair weighted to zero', () => {
    const tiles = [tile(0, { left: { 0: 0 } }), tile(1)];

    for (let draw = 0; draw < 200; draw++) {
      expect(pickWeightedTile([0, 1], tiles, context(0))).toBe(1);
    }
  });

  it('should favour the heavier pair', () => {
    const tiles = [tile(0, { left: { 0: 9 } }), tile(1)];
    let heavy = 0;

    for (let draw = 0; draw < 300; draw++) {
      if (pickWeightedTile([0, 1], tiles, context(0)) === 0) heavy++;
    }

    expect(heavy).toBeGreaterThan(200);
  });

  it('should stay uniform when every pair weighs zero', () => {
    const zero = { 0: 0 };
    const tiles = [
      tile(0, { top: zero, right: zero, bottom: zero, left: zero }),
      tile(1, { top: zero }),
    ];

    for (let draw = 0; draw < 50; draw++) {
      expect([0, 1]).toContain(pickWeightedTile([0, 1], tiles));
    }
  });

  it('should weigh the same side differently for a different neighbour', () => {
    const tiles = [tile(0, { left: { 0: 0.001, 1: 5 } }), tile(1)];
    let favoured = 0;

    for (let draw = 0; draw < 200; draw++) {
      if (pickWeightedTile([0, 1], tiles, context(1)) === 0) favoured++;
    }

    // Tile 0 weighs five beside tile 1 and a thousandth beside tile 0.
    expect(favoured).toBeGreaterThan(120);
  });

  it('should weigh a tile by its average pair when the cell is not known', () => {
    const tiles = [tile(0, { left: { 0: 9 } }), tile(1)];
    let heavy = 0;

    for (let draw = 0; draw < 300; draw++) {
      if (pickWeightedTile([0, 1], tiles) === 0) heavy++;
    }

    expect(heavy).toBeGreaterThan(200);
  });
});
