import { calculateOptions } from './calculateOptions';

describe('calculateOptions', () => {
  it('should return the next grid with updated options', () => {
    const grid = [
      { col: 0, row: 0, collapsed: true, options: [0] },
      { col: 1, row: 0, collapsed: false, options: [1, 2, 3, 4] },
      { col: 0, row: 1, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ];
    const cols = 2;
    const result = calculateOptions(grid, cols);
    expect(result).toEqual([
      { col: 0, row: 0, collapsed: true, options: [0] },
      { col: 1, row: 0, collapsed: true, options: [2] },
      { col: 0, row: 1, collapsed: true, options: [0] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ]);
  });

  it('should return the next grid with updated options', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 0, collapsed: true, options: [2] },
      { col: 0, row: 1, collapsed: true, options: [1] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ];
    const cols = 2;
    const result = calculateOptions(grid, cols);
    expect(result).toEqual([
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 0, collapsed: true, options: [2] },
      { col: 0, row: 1, collapsed: true, options: [1] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ]);
  });

  it('should return the next grid with updated options', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 1, collapsed: false, options: [0, 1, 2, 3] },
    ];
    const cols = 2;
    const result = calculateOptions(grid, cols);
    expect(result).toEqual([
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 1, collapsed: false, options: [0, 1, 2, 3] },
    ]);
  });
});
