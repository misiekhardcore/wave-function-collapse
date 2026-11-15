import { collapseGrid } from './collapseGrid';
import { generateInitialGrid } from './generateInitialGrid';
import { getTileSet, SIDES } from './tileSets';

const tiles = getTileSet('wires').tiles;

function solve(setId: 'terrain', cols: number, rows: number) {
  const set = getTileSet(setId);
  let grid = generateInitialGrid(10, cols, rows, set.tiles);

  for (let step = 0; step < grid.length; step++) {
    if (grid.every((cell) => cell.collapsed)) break;
    grid = collapseGrid(grid, cols, set.tiles);
  }

  return { grid, tiles: set.tiles };
}

describe('collapseGrid', () => {
  it('should return the next grid with a random tile collapsed', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 1, row: 1, collapsed: false, options: [0, 1] },
    ];
    const cols = 2;
    const result = collapseGrid(grid, cols, tiles);
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

describe('collapseGrid with the terrain set', () => {
  it('paints continents and seas instead of a field of one-cell patches', () => {
    const { grid, tiles: terrainTiles } = solve('terrain', 40, 30);
    const isSolid = (tileId: number) =>
      SIDES.every((side) => terrainTiles[tileId].edges[side] !== 'beach');

    // A beach side only ever occurs where two terrains meet, so a board made of
    // large regions is mostly solid: otherwise the shoreline would be most of
    // the map, which is the salt-and-pepper pattern the weights exist to avoid.
    const solid = grid.filter((cell) => isSolid(cell.options[0])).length;

    expect(solid).toBeGreaterThan(grid.length * 0.6);
  });
});
