import { collapseGrid } from './collapseGrid';
import { generateInitialGrid } from './generateInitialGrid';
import { getTileSet } from './tileSets';
import { reverseSocket } from './tileSetSchema';

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

  it('never leaves two neighbouring sockets that do not meet', () => {
    for (let run = 0; run < 3; run++) {
      const { grid, tiles } = solve('terrain', COLS, 20);

      expect(grid.every((cell) => cell.collapsed)).toBe(true);

      const seams: [string, string][] = [];

      for (let index = 0; index < grid.length; index++) {
        const tile = tiles[grid[index].options[0]];
        const east = index % COLS === COLS - 1 ? undefined : grid[index + 1];
        const south = index + COLS < grid.length ? grid[index + COLS] : undefined;

        if (east) seams.push([tile.sockets[1], tiles[east.options[0]].sockets[3]]);
        if (south) seams.push([tile.sockets[2], tiles[south.options[0]].sockets[0]]);
      }

      expect(seams.filter(([here, there]) => there !== reverseSocket(here))).toEqual([]);
    }
  });

  it('fills the whole board, so no cell is left without a tile', () => {
    const { grid, tiles } = solve('terrain', COLS, 20);
    const sockets = new Set(grid.flatMap((cell) => tiles[cell.options[0]].sockets));

    expect(grid.every((cell) => cell.collapsed)).toBe(true);
    expect([...sockets].sort()).toEqual(['b', 'l', 'w']);
  });
});
