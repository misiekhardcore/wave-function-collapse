import { generateInitialGrid } from './generateInitialGrid';

describe('generateInitialGrid', () => {
  it('should return the initial grid', () => {
    const initialTiles = 2;
    const cols = 2;
    const rows = 2;
    const result = generateInitialGrid(initialTiles, cols, rows);
    expect(result).toHaveLength(cols * rows);
    expect(result.filter((tile) => tile.collapsed)).toHaveLength(initialTiles);
  });
});
