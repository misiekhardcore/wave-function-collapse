import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { getTileSet, OPPOSITE_SIDE, PCB_CHIP_SHAPES, SIDES, tileSets } from './tileSets';

function artPath(setId: string, tileId: number): string {
  return join(process.cwd(), 'public', 'tiles', setId, `${tileId}.png`);
}

describe('tile sets', () => {
  it.each(tileSets)('$name numbers its tiles from zero', (set) => {
    expect(set.tiles.map((tile) => tile.id)).toEqual(set.tiles.map((_, index) => index));
  });

  it.each(tileSets)('$name only allows mutual neighbours', (set) => {
    for (const tile of set.tiles) {
      for (const side of SIDES) {
        for (const neighbourId of tile[side]) {
          expect(set.tiles[neighbourId][OPPOSITE_SIDE[side]]).toContain(tile.id);
        }
      }
    }
  });

  it.each(tileSets)('$name never leaves a side without options', (set) => {
    for (const tile of set.tiles) {
      for (const side of SIDES) {
        expect(tile[side].length).toBeGreaterThan(0);
      }
    }
  });

  it.each(tileSets)('$name has a neighbour for every edge label', (set) => {
    for (const tile of set.tiles) {
      for (const side of SIDES) {
        const label = tile.edges[side];
        expect(set.tiles.some((other) => other.edges[OPPOSITE_SIDE[side]] === label)).toBe(true);
      }
    }
  });

  it.each(tileSets)('$name has art for every tile', (set) => {
    for (const tile of set.tiles) {
      expect(existsSync(artPath(set.id, tile.id))).toBe(true);
    }
  });

  it('assembles each PCB microcontroller from parts that only fit each other', () => {
    const parts = getTileSet('pcb').tiles.filter(
      (tile) => tile.art === 'chip' || tile.art === 'chip-body'
    );

    expect(parts).toHaveLength(
      PCB_CHIP_SHAPES.reduce((count, shape) => count + shape.cols * shape.rows, 0)
    );
    expect(parts.every((tile) => (tile.weight ?? 1) < 1)).toBe(true);

    const seams = new Set(
      parts.flatMap((tile) =>
        SIDES.map((side) => tile.edges[side]).filter((edge) => edge.startsWith('chip'))
      )
    );

    // One seam per interior edge, so a package of cols x rows has
    // cols * (rows - 1) + rows * (cols - 1) of them.
    expect(seams.size).toBe(
      PCB_CHIP_SHAPES.reduce(
        (count, { cols, rows }) => count + cols * (rows - 1) + rows * (cols - 1),
        0
      )
    );

    for (const seam of seams) {
      const touching = parts.flatMap((tile) =>
        SIDES.filter((side) => tile.edges[side] === seam).map((side) => ({ tile, side }))
      );

      expect(touching).toHaveLength(2);
      expect(touching[0].tile.id).not.toBe(touching[1].tile.id);
      expect(OPPOSITE_SIDE[touching[0].side]).toBe(touching[1].side);
    }
  });

  it('offers both a square and a rectangular PCB microcontroller footprint', () => {
    const parts = getTileSet('pcb').tiles.filter((tile) => tile.art?.startsWith('chip'));
    const extent = (packageId: string) => {
      const cells = parts.flatMap((tile) =>
        SIDES.map((side) => tile.edges[side])
          .filter((edge) => edge.startsWith(`chip:${packageId}:`))
          .flatMap((edge) => edge.split(':')[2].split('|'))
          .map((cell) => cell.split('x').map(Number))
      );
      const cols = cells.map(([col]) => col);
      const rows = cells.map(([, row]) => row);

      return {
        cols: Math.max(...cols) - Math.min(...cols) + 1,
        rows: Math.max(...rows) - Math.min(...rows) + 1,
      };
    };

    expect(PCB_CHIP_SHAPES.map((shape) => extent(shape.id))).toEqual([
      { cols: 3, rows: 3 },
      { cols: 5, rows: 3 },
    ]);
  });

  it('keeps the wire set rules unchanged', () => {
    const wires = getTileSet('wires').tiles.map(({ top, right, bottom, left }) => [
      top,
      right,
      bottom,
      left,
    ]);

    expect(wires).toEqual([
      [
        [0, 1, 6, 7, 8],
        [0, 2, 5, 8, 9],
        [0, 3, 6, 9, 10],
        [0, 4, 5, 7, 10],
      ],
      [
        [2, 3, 4, 5, 9, 10],
        [1, 3, 4, 6, 7, 10],
        [0, 3, 6, 9, 10],
        [1, 2, 3, 6, 8, 9],
      ],
      [
        [2, 3, 4, 5, 9, 10],
        [1, 3, 4, 6, 7, 10],
        [1, 2, 4, 5, 7, 8],
        [0, 4, 5, 7, 10],
      ],
      [
        [0, 1, 6, 7, 8],
        [1, 3, 4, 6, 7, 10],
        [1, 2, 4, 5, 7, 8],
        [1, 2, 3, 6, 8, 9],
      ],
      [
        [2, 3, 4, 5, 9, 10],
        [0, 2, 5, 8, 9],
        [1, 2, 4, 5, 7, 8],
        [1, 2, 3, 6, 8, 9],
      ],
      [
        [2, 3, 4, 5, 9, 10],
        [0, 2, 5, 8, 9],
        [1, 2, 4, 5, 7, 8],
        [0, 4, 5, 7, 10],
      ],
      [
        [0, 1, 6, 7, 8],
        [1, 3, 4, 6, 7, 10],
        [0, 3, 6, 9, 10],
        [1, 2, 3, 6, 8, 9],
      ],
      [
        [2, 3, 4, 5, 9, 10],
        [0, 2, 5, 8, 9],
        [0, 3, 6, 9, 10],
        [1, 2, 3, 6, 8, 9],
      ],
      [
        [2, 3, 4, 5, 9, 10],
        [1, 3, 4, 6, 7, 10],
        [0, 3, 6, 9, 10],
        [0, 4, 5, 7, 10],
      ],
      [
        [0, 1, 6, 7, 8],
        [1, 3, 4, 6, 7, 10],
        [1, 2, 4, 5, 7, 8],
        [0, 4, 5, 7, 10],
      ],
      [
        [0, 1, 6, 7, 8],
        [0, 2, 5, 8, 9],
        [1, 2, 4, 5, 7, 8],
        [1, 2, 3, 6, 8, 9],
      ],
    ]);
  });

  it('ships the expected number of tiles per set', () => {
    expect(tileSets.map((set) => [set.id, set.tiles.length])).toEqual([
      ['wires', 11],
      ['pcb', 45],
      ['maze', 16],
      ['quilt', 27],
      ['terrain', 35],
    ]);
  });
});
