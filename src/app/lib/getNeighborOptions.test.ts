import {
  getEastNeighborOptions,
  getNorthNeighborOptions,
  getSouthNeighborOptions,
  getWestNeighborOptions,
} from './getNeighborOptions';
import { tiles } from './tiles';

describe('getNorthNeighborOptions', () => {
  it('should return the options of the tile to the north if it exists', () => {
    const grid = [
      { col: 0, row: 0, collapsed: true, options: [0] },
      { col: 0, row: 1, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 0, collapsed: false, options: [2] },
      { col: 1, row: 1, collapsed: false, options: [2] },
    ];
    const cols = 2;
    const rows = 2;
    const tile = grid[1];
    const result = getNorthNeighborOptions(tile, grid, cols, rows);
    expect(result).toEqual(tiles[0].s);
  });

  it('should return empty array if the tile to the north does not exist', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: true, options: [1] },
      { col: 1, row: 0, collapsed: true, options: [2] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ];
    const cols = 2;
    const rows = 2;
    const tile = grid[0];
    const result = getNorthNeighborOptions(tile, grid, cols, rows);
    expect(result).toEqual([]);
  });

  it('should return empty array if the tile to the north is not collapsed', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0] },
      { col: 0, row: 1, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 0, collapsed: true, options: [2] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ];
    const cols = 2;
    const rows = 2;
    const tile = grid[1];
    const result = getNorthNeighborOptions(tile, grid, cols, rows);
    expect(result).toEqual([]);
  });
});

describe('getEastNeighborOptions', () => {
  it('should return the options of the tile to the east if it exists', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: false, options: [0] },
      { col: 1, row: 0, collapsed: true, options: [0] },
      { col: 1, row: 1, collapsed: false, options: [2] },
    ];
    const cols = 2;
    const rows = 2;
    const tile = grid[0];
    const result = getEastNeighborOptions(tile, grid, cols, rows);
    expect(result).toEqual(tiles[0].w);
  });

  it('should return empty array if the tile to the east does not exist', () => {
    const grid = [
      { col: 0, row: 0, collapsed: true, options: [0] },
      { col: 0, row: 1, collapsed: true, options: [0] },
      { col: 1, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 1, collapsed: true, options: [0] },
    ];
    const cols = 2;
    const rows = 2;
    const tile = grid[2];
    const result = getEastNeighborOptions(tile, grid, cols, rows);
    expect(result).toEqual([]);
  });

  it('should return empty array if the tile to the east is not collapsed', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: true, options: [0] },
      { col: 1, row: 0, collapsed: false, options: [0] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ];
    const cols = 2;
    const rows = 2;
    const tile = grid[0];
    const result = getEastNeighborOptions(tile, grid, cols, rows);
    expect(result).toEqual([]);
  });
});

describe('getSouthNeighborOptions', () => {
  it('should return the options of the tile to the south if it exists', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: true, options: [0] },
      { col: 1, row: 0, collapsed: false, options: [2] },
      { col: 1, row: 1, collapsed: false, options: [2] },
    ];
    const cols = 2;
    const rows = 2;
    const tile = grid[0];
    const result = getSouthNeighborOptions(tile, grid, cols, rows);
    expect(result).toEqual(tiles[0].n);
  });

  it('should return empty array if the tile to the south does not exist', () => {
    const grid = [
      { col: 0, row: 0, collapsed: true, options: [0] },
      { col: 0, row: 1, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 0, collapsed: true, options: [2] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ];
    const cols = 2;
    const rows = 2;
    const tile = grid[1];
    const result = getSouthNeighborOptions(tile, grid, cols, rows);
    expect(result).toEqual([]);
  });

  it('should return empty array if the tile to the south is not collapsed', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: false, options: [0] },
      { col: 1, row: 0, collapsed: true, options: [2] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ];
    const cols = 2;
    const rows = 2;
    const tile = grid[0];
    const result = getSouthNeighborOptions(tile, grid, cols, rows);
    expect(result).toEqual([]);
  });
});

describe('getWestNeighborOptions', () => {
  it('should return the options of the tile to the west if it exists', () => {
    const grid = [
      { col: 0, row: 0, collapsed: true, options: [0] },
      { col: 0, row: 1, collapsed: false, options: [0] },
      { col: 1, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 1, collapsed: false, options: [2] },
    ];
    const cols = 2;
    const rows = 2;
    const tile = grid[2];
    const result = getWestNeighborOptions(tile, grid, cols, rows);
    expect(result).toEqual(tiles[0].e);
  });

  it('should return empty array if the tile to the west does not exist', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: true, options: [0] },
      { col: 1, row: 0, collapsed: true, options: [2] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ];
    const cols = 2;
    const rows = 2;
    const tile = grid[0];
    const result = getWestNeighborOptions(tile, grid, cols, rows);
    expect(result).toEqual([]);
  });

  it('should return empty array if the tile to the west is not collapsed', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0] },
      { col: 0, row: 1, collapsed: true, options: [0] },
      { col: 1, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ];
    const cols = 2;
    const rows = 2;
    const tile = grid[2];
    const result = getWestNeighborOptions(tile, grid, cols, rows);
    expect(result).toEqual([]);
  });
});
