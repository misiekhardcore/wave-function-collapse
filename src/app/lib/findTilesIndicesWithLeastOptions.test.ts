import { findTilesIndicesWithLeastOptions } from './findTilesIndicesWithLeastOptions';

describe('findTilesIndicesWithLeastOptions', () => {
  it('should return the indices of tiles with the least options', () => {
    const grid1 = [
      { col: 0, row: 0, collapsed: true, options: [0] },
      { col: 0, row: 1, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 0, collapsed: false, options: [1, 2, 3, 4] },
      { col: 1, row: 1, collapsed: false, options: [2] },
    ];

    const result1 = findTilesIndicesWithLeastOptions(grid1);
    expect(result1).toEqual([0, 3]);

    const grid2 = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: true, options: [1] },
      { col: 1, row: 0, collapsed: true, options: [2] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ];

    const result2 = findTilesIndicesWithLeastOptions(grid2);
    expect(result2).toEqual([0]);

    const grid3 = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: false, options: [1] },
      { col: 1, row: 0, collapsed: false, options: [2] },
      { col: 1, row: 1, collapsed: false, options: [2] },
    ];

    const result3 = findTilesIndicesWithLeastOptions(grid3);
    expect(result3).toEqual([1, 2, 3]);
  });
});
