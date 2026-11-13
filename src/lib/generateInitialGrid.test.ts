import { generateInitialGrid } from './generateInitialGrid';
import { getTileSet } from './tileSets';

const tiles = getTileSet('wires').tiles;

describe('generateInitialGrid', () => {
  it('should return the initial grid', () => {
    const initialTiles = 2;
    const cols = 2;
    const rows = 2;
    const result = generateInitialGrid(initialTiles, cols, rows, tiles);
    expect(result).toHaveLength(cols * rows);
    expect(result.filter((tile) => tile.collapsed)).toHaveLength(initialTiles);
  });

  it('should offer every tile of the chosen set as an option', () => {
    const terrainTiles = getTileSet('terrain').tiles;
    const result = generateInitialGrid(3, 4, 4, terrainTiles);
    const options = new Set(result.flatMap((tile) => tile.options));

    expect([...options].sort((a, b) => a - b)).toEqual(terrainTiles.map((tile) => tile.id));
  });
});
