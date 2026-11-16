import type { Side, TileObject } from '@/types';

import { canPlaceTile, getPackagePartners } from './canPlaceTile';
import { collapseGrid } from './collapseGrid';
import { generateInitialGrid } from './generateInitialGrid';
import { getTileSet, SIDES } from './tileSets';

const { tiles } = getTileSet('pcb');
const partners = getPackagePartners(tiles);

/** The tiles that belong to a multi-tile structure. */
const chipParts = tiles.filter((tile) => partners.has(tile.id));

/** Every tile reachable from `start` through seams. */
function component(start: number): number[] {
  const found = [start];
  const seen = new Set(found);

  for (let index = 0; index < found.length; index++) {
    for (const partner of partners.get(found[index])?.values() ?? []) {
      if (seen.has(partner)) continue;

      seen.add(partner);
      found.push(partner);
    }
  }

  return found;
}

const components = chipParts
  .map((tile) => component(tile.id))
  .filter((ids, index, all) => all.findIndex((other) => other.includes(ids[0])) === index);

const square = components.find((ids) => ids.length === 9) as number[];
const wide = components.find((ids) => ids.length === 15) as number[];

const seamsOf = (id: number): Side[] => [...(partners.get(id)?.keys() ?? [])];

// The top-left part of a package is the one with seams only to its right and
// below; the middle of the square package has one on every side.
const northWest = square.find((id) => {
  const sides = seamsOf(id).sort();

  return sides.length === 2 && sides[0] === 'bottom' && sides[1] === 'right';
}) as number;
const body = square.find((id) => seamsOf(id).length === 4) as number;
const widePart = wide[0];

function emptyGrid(cols: number, rows: number): TileObject[] {
  return Array.from({ length: cols * rows }, (_, index) => ({
    col: index % cols,
    row: Math.floor(index / cols),
    options: tiles.map((tile) => tile.id),
    collapsed: false,
  }));
}

describe('canPlaceTile', () => {
  it('should allow a package when every cell of it fits', () => {
    const cols = 9;

    expect(canPlaceTile(northWest, 4 * cols + 4, emptyGrid(cols, 9), cols, tiles)).toBe(true);
  });

  it('should allow a package flush against the board corner', () => {
    const cols = 9;

    expect(canPlaceTile(northWest, 0, emptyGrid(cols, 9), cols, tiles)).toBe(true);
  });

  it('should refuse a package that runs off the board', () => {
    const cols = 9;

    expect(canPlaceTile(body, 0, emptyGrid(cols, 9), cols, tiles)).toBe(false);
  });

  it('should refuse a package whose cell is already collapsed', () => {
    const cols = 9;
    const grid = emptyGrid(cols, 9);
    const index = 4 * cols + 4;

    grid[index + 1] = { ...grid[index + 1], collapsed: true, options: [0] };

    expect(canPlaceTile(northWest, index, grid, cols, tiles)).toBe(false);
  });

  it('should refuse a package whose cell no longer offers its part', () => {
    const cols = 9;
    const grid = emptyGrid(cols, 9);
    const index = 4 * cols + 4;

    grid[index + 1] = { ...grid[index + 1], options: [0] };

    expect(canPlaceTile(northWest, index, grid, cols, tiles)).toBe(false);
  });

  it('should always allow a tile that is not part of a package', () => {
    const cols = 9;
    const grid = emptyGrid(cols, 9);

    expect(canPlaceTile(0, 0, grid, cols, tiles)).toBe(true);
  });

  it('should allow a rectangular package when every one of its cells fits', () => {
    const cols = 9;

    expect(canPlaceTile(widePart, 2 * cols + 2, emptyGrid(cols, 9), cols, tiles)).toBe(true);
  });

  it('should refuse a rectangular package that runs past the right edge', () => {
    const cols = 9;

    expect(canPlaceTile(widePart, 2 * cols + 6, emptyGrid(cols, 9), cols, tiles)).toBe(false);
  });
});

describe('PCB solving', () => {
  it('should finish with whole chip packages', () => {
    const cols = 30;
    const rows = 20;

    for (let run = 0; run < 3; run++) {
      let grid = generateInitialGrid(5, cols, rows, tiles);

      for (let step = 0; step < grid.length; step++) {
        if (grid.every((tile) => tile.collapsed)) break;
        grid = collapseGrid(grid, cols, tiles);
      }

      for (let index = 0; index < grid.length; index++) {
        const tile = tiles[grid[index].options[0]];
        const seams = partners.get(tile.id);
        if (!seams) continue;

        for (const side of SIDES) {
          const partner = seams.get(side);
          if (partner === undefined) continue;

          const neighbour = neighbourOf(index, side, cols, grid.length);
          expect(neighbour).toBeGreaterThanOrEqual(0);

          // A run can end with the board around a package still open; what is
          // never allowed is a decided neighbour that is the wrong part.
          if (!grid[neighbour].collapsed) continue;

          expect(grid[neighbour].options[0]).toBe(partner);
        }
      }
    }
  });
});

function neighbourOf(index: number, side: Side, cols: number, count: number) {
  if (side === 'top') return index - cols >= 0 ? index - cols : -1;
  if (side === 'bottom') return index + cols < count ? index + cols : -1;
  if (side === 'left') return index % cols > 0 ? index - 1 : -1;

  return index % cols < cols - 1 ? index + 1 : -1;
}
