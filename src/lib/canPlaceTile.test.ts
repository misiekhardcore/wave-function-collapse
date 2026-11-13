import type { TileObject } from '@/types';

import { canPlaceTile } from './canPlaceTile';
import { collapseGrid } from './collapseGrid';
import { generateInitialGrid } from './generateInitialGrid';
import { getTileSet, OPPOSITE_SIDE, PCB_CHIP_SHAPES, SIDES } from './tileSets';

const { tiles } = getTileSet('pcb');
const chipParts = tiles.filter((tile) => tile.art === 'chip' || tile.art === 'chip-body');
const northWest = chipParts[0];
const body = chipParts.find((tile) => tile.art === 'chip-body') as (typeof chipParts)[number];
const wide = PCB_CHIP_SHAPES.find(
  (shape) => shape.id === 'wide'
) as (typeof PCB_CHIP_SHAPES)[number];
const widePart = chipParts.find((tile) =>
  SIDES.some((side) => tile.edges[side].startsWith(`chip:${wide.id}:`))
) as (typeof chipParts)[number];

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

    expect(canPlaceTile(northWest.id, 4 * cols + 4, emptyGrid(cols, 9), cols, tiles)).toBe(true);
  });

  it('should allow a package flush against the board corner', () => {
    const cols = 9;

    expect(canPlaceTile(northWest.id, 0, emptyGrid(cols, 9), cols, tiles)).toBe(true);
  });

  it('should refuse a package that runs off the board', () => {
    const cols = 9;

    expect(canPlaceTile(body.id, 0, emptyGrid(cols, 9), cols, tiles)).toBe(false);
  });

  it('should refuse a package whose cell is already collapsed', () => {
    const cols = 9;
    const grid = emptyGrid(cols, 9);
    const index = 4 * cols + 4;

    grid[index + 1] = { ...grid[index + 1], collapsed: true, options: [0] };

    expect(canPlaceTile(northWest.id, index, grid, cols, tiles)).toBe(false);
  });

  it('should refuse a package whose cell no longer offers its part', () => {
    const cols = 9;
    const grid = emptyGrid(cols, 9);
    const index = 4 * cols + 4;

    grid[index + 1] = { ...grid[index + 1], options: [0] };

    expect(canPlaceTile(northWest.id, index, grid, cols, tiles)).toBe(false);
  });

  it('should always allow a tile that is not part of a package', () => {
    const cols = 9;
    const grid = emptyGrid(cols, 9);

    expect(canPlaceTile(0, 0, grid, cols, tiles)).toBe(true);
  });

  it('should allow a rectangular package when every one of its cells fits', () => {
    const cols = 9;

    expect(canPlaceTile(widePart.id, 2 * cols + 2, emptyGrid(cols, 9), cols, tiles)).toBe(true);
  });

  it('should refuse a rectangular package that runs past the right edge', () => {
    const cols = 9;

    expect(canPlaceTile(widePart.id, 2 * cols + 6, emptyGrid(cols, 9), cols, tiles)).toBe(false);
  });
});

describe('PCB solving', () => {
  it('should finish with whole chip packages', () => {
    const cols = 30;
    const rows = 20;
    const chipIds = new Set(chipParts.map((tile) => tile.id));

    for (let run = 0; run < 3; run++) {
      let grid = generateInitialGrid(5, cols, rows, tiles);

      for (let step = 0; step < grid.length; step++) {
        if (grid.every((tile) => tile.collapsed)) break;
        grid = collapseGrid(grid, cols, tiles);
      }

      for (let index = 0; index < grid.length; index++) {
        const tile = tiles[grid[index].options[0]];
        if (!chipIds.has(tile.id)) continue;

        for (const side of SIDES) {
          const label = tile.edges[side];
          if (!label.startsWith('chip')) continue;

          const neighbour = neighbourOf(index, side, cols, grid.length);
          expect(neighbour).toBeGreaterThanOrEqual(0);
          expect(tiles[grid[neighbour].options[0]].edges[OPPOSITE_SIDE[side]]).toBe(label);
        }
      }
    }
  });
});

function neighbourOf(index: number, side: keyof typeof OPPOSITE_SIDE, cols: number, count: number) {
  if (side === 'top') return index - cols >= 0 ? index - cols : -1;
  if (side === 'bottom') return index + cols < count ? index + cols : -1;
  if (side === 'left') return index % cols > 0 ? index - 1 : -1;

  return index % cols < cols - 1 ? index + 1 : -1;
}
