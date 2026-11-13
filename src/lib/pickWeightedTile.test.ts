import type { Tile } from '@/types';

import { pickWeightedTile } from './pickWeightedTile';

/** Tile ids double as indexes into the array, exactly as in a tile set. */
function tile(id: number, weight?: number): Tile {
  return {
    id,
    top: [],
    right: [],
    bottom: [],
    left: [],
    edges: { top: 'open', right: 'open', bottom: 'open', left: 'open' },
    weight,
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
});
