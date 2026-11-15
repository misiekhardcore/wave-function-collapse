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
  const COLS = 30;

  it('never leaves two neighbouring tiles whose labels disagree', () => {
    for (let run = 0; run < 3; run++) {
      const { grid, tiles } = solve('terrain', COLS, 20);

      expect(grid.every((cell) => cell.collapsed)).toBe(true);

      const seams: [string, string][] = [];

      for (let index = 0; index < grid.length; index++) {
        const tile = tiles[grid[index].options[0]];
        const east = index % COLS === COLS - 1 ? undefined : grid[index + 1];
        const south = index + COLS < grid.length ? grid[index + COLS] : undefined;

        if (east) seams.push([tile.edges.right, tiles[east.options[0]].edges.left]);
        if (south) seams.push([tile.edges.bottom, tiles[south.options[0]].edges.top]);
      }

      expect(seams.filter(([here, there]) => here !== there)).toEqual([]);
    }
  });

  it('fills the whole board, so no cell is left without a tile', () => {
    const { grid, tiles } = solve('terrain', COLS, 20);
    const terrains = new Set(
      grid.flatMap((cell) => SIDES.map((side) => tiles[cell.options[0]].edges[side]))
    );

    expect(grid.every((cell) => cell.collapsed)).toBe(true);
    expect([...terrains].sort()).toEqual(['beach', 'land', 'water']);
  });
});
