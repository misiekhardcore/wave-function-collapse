import { calculateOptions } from './calculateOptions';

describe('calculateOptions', () => {
  it('should return the next grid with updated options', () => {
    const grid1 = [
      { col: 0, row: 0, collapsed: true, options: [0] },
      { col: 1, row: 0, collapsed: false, options: [1, 2, 3, 4] },
      { col: 0, row: 1, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ];
    const cols1 = 2;
    const result1 = calculateOptions(grid1, cols1);
    expect(result1).toEqual([
      { col: 0, row: 0, collapsed: true, options: [0] },
      { col: 1, row: 0, collapsed: true, options: [2] },
      { col: 0, row: 1, collapsed: true, options: [0] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ]);

    const grid2 = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 0, collapsed: true, options: [2] },
      { col: 0, row: 1, collapsed: true, options: [1] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ];
    const cols2 = 2;
    const result2 = calculateOptions(grid2, cols2);
    expect(result2).toEqual([
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 0, collapsed: true, options: [2] },
      { col: 0, row: 1, collapsed: true, options: [1] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ]);

    const grid3 = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 1, collapsed: false, options: [0, 1, 2, 3] },
    ];
    const cols3 = 2;
    const result3 = calculateOptions(grid3, cols3);
    expect(result3).toEqual([
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 1, collapsed: false, options: [0, 1, 2, 3] },
    ]);
  });
});
