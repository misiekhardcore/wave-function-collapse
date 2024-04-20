import {
  getRightOptions,
  getTopOptions,
  getBottomOptions,
  getLeftOptions,
} from './getNeighborOptions';
import { tiles } from './tiles';

describe('getTopOptions', () => {
  it('should return the options of the tile to the top if it exists', () => {
    const grid = [
      { col: 0, row: 0, collapsed: true, options: [0] },
      { col: 1, row: 0, collapsed: false, options: [2] },
      { col: 0, row: 1, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 1, collapsed: false, options: [2] },
    ];
    const cols = 2;
    const result = getTopOptions(2, grid, cols);
    expect(result).toEqual(tiles[0].bottom);
  });

  it('should return empty array if the tile to the top does not exist', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: true, options: [1] },
      { col: 1, row: 0, collapsed: true, options: [2] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ];
    const cols = 2;
    const result = getTopOptions(0, grid, cols);
    expect(result).toEqual([]);
  });

  it('should return empty array if the tile to the top is not collapsed', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0] },
      { col: 1, row: 0, collapsed: true, options: [2] },
      { col: 0, row: 1, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ];
    const cols = 2;
    const result = getTopOptions(2, grid, cols);
    expect(result).toEqual([]);
  });
});

describe('getRightOptions', () => {
  it('should return the options of the tile to the right if it exists', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 0, collapsed: true, options: [0] },
      { col: 0, row: 1, collapsed: false, options: [0] },
      { col: 1, row: 1, collapsed: false, options: [2] },
    ];
    const cols = 2;
    const result = getRightOptions(0, grid, cols);
    expect(result).toEqual(tiles[0].left);
  });

  it('should return empty array if the tile to the right does not exist', () => {
    const grid = [
      { col: 0, row: 0, collapsed: true, options: [0] },
      { col: 1, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: true, options: [0] },
      { col: 1, row: 1, collapsed: true, options: [0] },
    ];
    const cols = 2;
    const result = getRightOptions(1, grid, cols);
    expect(result).toEqual([]);
  });

  it('should return empty array if the tile to the right is not collapsed', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 0, collapsed: false, options: [0] },
      { col: 0, row: 1, collapsed: true, options: [0] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ];
    const cols = 2;
    const result = getRightOptions(0, grid, cols);
    expect(result).toEqual([]);
  });
});

describe('getBottomOptions', () => {
  it('should return the options of the tile to the bottom if it exists', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 0, collapsed: false, options: [2] },
      { col: 0, row: 1, collapsed: true, options: [0] },
      { col: 1, row: 1, collapsed: false, options: [2] },
    ];
    const cols = 2;
    const result = getBottomOptions(0, grid, cols);
    expect(result).toEqual(tiles[0].top);
  });

  it('should return empty array if the tile to the bottom does not exist', () => {
    const grid = [
      { col: 0, row: 0, collapsed: true, options: [0] },
      { col: 1, row: 0, collapsed: true, options: [2] },
      { col: 0, row: 1, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ];
    const cols = 2;
    const result = getBottomOptions(2, grid, cols);
    expect(result).toEqual([]);
  });

  it('should return empty array if the tile to the bottom is not collapsed', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 0, collapsed: true, options: [2] },
      { col: 0, row: 1, collapsed: false, options: [0] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ];
    const cols = 2;
    const result = getBottomOptions(0, grid, cols);
    expect(result).toEqual([]);
  });
});

describe('getLeftOptions', () => {
  it('should return the options of the tile to the left if it exists', () => {
    const grid = [
      { col: 0, row: 0, collapsed: true, options: [0] },
      { col: 1, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: false, options: [0] },
      { col: 1, row: 1, collapsed: false, options: [2] },
    ];
    const cols = 2;
    const result = getLeftOptions(1, grid, cols);
    expect(result).toEqual(tiles[0].right);
  });

  it('should return empty array if the tile to the left does not exist', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 0, collapsed: true, options: [2] },
      { col: 0, row: 1, collapsed: true, options: [0] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ];
    const cols = 2;
    const result = getLeftOptions(0, grid, cols);
    expect(result).toEqual([]);
  });

  it('should return empty array if the tile to the left is not collapsed', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0] },
      { col: 1, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: true, options: [0] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ];
    const cols = 2;
    const result = getLeftOptions(1, grid, cols);
    expect(result).toEqual([]);
  });
});
