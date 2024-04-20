import { collapseGrid } from './collapseGrid';

describe('collapseGrid', () => {
  it('should return the next grid with a random tile collapsed', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 1, collapsed: false, options: [0, 1] },
    ];
    const cols = 2;
    const result = collapseGrid(grid, cols);
    expect(result.slice(0, 3)).toEqual([
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 0, collapsed: false, options: [0, 1, 2, 3] },
    ]);
    expect(result[3].collapsed).toBe(true);
    expect(result[3].options[0]).toBeGreaterThanOrEqual(0);
    expect(result[3].options[0]).toBeLessThanOrEqual(1);
  });
});
