import {
  getRightOptions,
  getTopOptions,
  getBottomOptions,
  getLeftOptions,
} from './getNeighborOptions';
import { tiles } from './tiles';

describe('getTopOptions', () => {
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
    const result = getTopOptions(tile, grid, cols, rows);
    expect(result).toEqual(tiles[0].bottom);
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
    const result = getTopOptions(tile, grid, cols, rows);
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
    const result = getTopOptions(tile, grid, cols, rows);
    expect(result).toEqual([]);
  });
});

describe('getRightOptions', () => {
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
    const result = getRightOptions(tile, grid, cols, rows);
    expect(result).toEqual(tiles[0].left);
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
    const result = getRightOptions(tile, grid, cols, rows);
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
    const result = getRightOptions(tile, grid, cols, rows);
    expect(result).toEqual([]);
  });
});

describe('getBottomOptions', () => {
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
    const result = getBottomOptions(tile, grid, cols, rows);
    expect(result).toEqual(tiles[0].top);
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
    const result = getBottomOptions(tile, grid, cols, rows);
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
    const result = getBottomOptions(tile, grid, cols, rows);
    expect(result).toEqual([]);
  });
});

describe('getLeftOptions', () => {
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
    const result = getLeftOptions(tile, grid, cols, rows);
    expect(result).toEqual(tiles[0].right);
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
    const result = getLeftOptions(tile, grid, cols, rows);
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
    const result = getLeftOptions(tile, grid, cols, rows);
    expect(result).toEqual([]);
  });
});
