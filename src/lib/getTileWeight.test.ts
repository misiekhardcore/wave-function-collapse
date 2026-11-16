import type { Side, Sockets, Tile, TileObject } from '@/types';

import { getAverageWeight, getTileWeight } from './getTileWeight';

const COLS = 3;
const SOCKETS: Sockets = ['l', 'b', 'w', 'l'];

type Weights = Partial<Record<Side, Record<number, number>>>;

function tile(weights: Weights = {}, weight = 1): Tile {
  return {
    id: 0,
    name: 'tile',
    image: '/tiles/test.png',
    rotation: 0,
    flipped: false,
    sockets: SOCKETS,
    weight,
    top: [],
    right: [],
    bottom: [],
    left: [],
    pairWeights: { top: {}, right: {}, bottom: {}, left: {}, ...weights },
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

  it('should weigh a tile by its average pair where nothing is settled', () => {
    expect(getTileWeight(tile({ right: { 7: 2 }, left: { 9: 6 } }), CENTRE, grid(), COLS)).toBe(4);
  });

  it('should default a tile with no pair to one', () => {
    expect(getTileWeight(tile(), CENTRE, grid(), COLS)).toBe(1);
  });

  it('should multiply the mean pair by the tile weight', () => {
    const weighted = tile({ right: { 7: 2 } }, 10);

    expect(getTileWeight(weighted, CENTRE, grid({ [RIGHT]: 7 }), COLS)).toBe(20);
    expect(getAverageWeight(weighted)).toBe(20);
  });

  it('should weigh the pair settled on a side', () => {
    expect(getTileWeight(tile({ right: { 7: 0.25 } }), CENTRE, grid({ [RIGHT]: 7 }), COLS)).toBe(
      0.25
    );
  });

  it('should average the pairs settled around the cell', () => {
    expect(
      getTileWeight(
        tile({ top: { 7: 2 }, right: { 8: 6 } }),
        CENTRE,
        grid({ [TOP]: 7, [RIGHT]: 8 }),
        COLS
      )
    ).toBe(4);
  });

  it('should weigh the same side differently for a different neighbour', () => {
    // Two neighbours that both carry this tile's right socket, weighed apart.
    const weighted = tile({ right: { 7: 0.1, 8: 10 } });

    expect(getTileWeight(weighted, CENTRE, grid({ [RIGHT]: 7 }), COLS)).toBeCloseTo(0.1);
    expect(getTileWeight(weighted, CENTRE, grid({ [RIGHT]: 8 }), COLS)).toBeCloseTo(10);
  });

  it('should ignore a side the board has no neighbour on', () => {
    // Top-left corner: the top pair is never consulted, however heavy it is.
    expect(getTileWeight(tile({ top: { 0: 100 }, right: { 8: 2 } }), 0, grid({ 1: 8 }), COLS)).toBe(
      2
    );
  });

  it('should fall back to one for a pair the tile does not declare', () => {
    expect(getTileWeight(tile({ right: { 8: 4 } }), CENTRE, grid({ [RIGHT]: 7 }), COLS)).toBe(1);
  });

  it('should leave an open neighbour out of the mean', () => {
    // Only the decided right side counts, even though the left side is worth more.
    expect(
      getTileWeight(tile({ left: { 7: 100 }, right: { 8: 2 } }), CENTRE, grid({ [RIGHT]: 8 }), COLS)
    ).toBe(2);
  });
});
