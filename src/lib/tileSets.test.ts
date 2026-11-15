import { existsSync } from 'node:fs';
import { join } from 'node:path';

import type { Tile } from '@/types';

import { getTileSet, OPPOSITE_SIDE, SIDES, tileSets } from './tileSets';

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

  const chipParts = () => getTileSet('pcb').tiles.filter((tile) => tile.art?.startsWith('chip'));

  /** Package ids are written into the seam labels: `chip:<id>:<cell>|<cell>`. */
  const packageIds = (parts: Tile[]) => [
    ...new Set(
      parts
        .flatMap((tile) => SIDES.map((side) => tile.edges[side]))
        .filter((edge) => edge.startsWith('chip:'))
        .map((edge) => edge.split(':')[1])
    ),
  ];

  /** Footprint of a package, read back from the cells named in its seams. */
  const extent = (packageId: string, parts: Tile[]) => {
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

  it('assembles each PCB microcontroller from parts that only fit each other', () => {
    const parts = chipParts();

    expect(parts.every((tile) => (tile.weight ?? 1) < 1)).toBe(true);

    const seams = new Set(
      parts.flatMap((tile) =>
        SIDES.map((side) => tile.edges[side]).filter((edge) => edge.startsWith('chip'))
      )
    );

    // One seam per interior edge, so a package of cols x rows has
    // cols * (rows - 1) + rows * (cols - 1) of them.
    const interiorEdges = packageIds(parts).reduce((count, packageId) => {
      const { cols, rows } = extent(packageId, parts);

      return count + cols * (rows - 1) + rows * (cols - 1);
    }, 0);

    expect(seams.size).toBe(interiorEdges);

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
    const parts = chipParts();

    expect(packageIds(parts).map((packageId) => extent(packageId, parts))).toEqual([
      { cols: 3, rows: 3 },
      { cols: 5, rows: 3 },
    ]);
  });

  it('describes every terrain tile once', () => {
    const tiles = getTileSet('terrain').tiles;
    const layouts = tiles.map((tile) => SIDES.map((side) => tile.edges[side]).join('|'));

    expect(tiles).toHaveLength(68);
    expect(new Set(layouts).size).toBe(68);
  });

  it('offers no layout that paints one ground as a stripe down the middle', () => {
    const tiles = getTileSet('terrain').tiles;
    const layouts = new Set(tiles.map((tile) => SIDES.map((side) => tile.edges[side]).join('|')));

    // These are the layouts whose art came out as a single thin band of one
    // ground through the middle of the tile — sand with water on both sides, a
    // grass strip between sand, and so on. They read as seams rather than
    // terrain, so the set leaves them out.
    const stripes = [
      'land|beach|land|beach',
      'land|beach|land|water',
      'land|water|land|beach',
      'land|water|land|water',
      'land|water|beach|water',
      'beach|land|beach|land',
      'beach|land|water|land',
      'beach|water|land|water',
      'beach|water|beach|water',
      'water|land|beach|land',
      'water|land|water|land',
      'water|beach|water|land',
      'water|beach|water|beach',
    ];

    expect(stripes.filter((layout) => layouts.has(layout))).toEqual([]);
  });

  it('weighs solid ground above sand so land and sea grow into regions', () => {
    const tiles = getTileSet('terrain').tiles;
    const weight = (tile: Tile) => tile.weight ?? 1;
    const kinds = (tile: Tile) => new Set(SIDES.map((side) => tile.edges[side]));
    const sandSides = (tile: Tile) => SIDES.filter((side) => tile.edges[side] === 'beach').length;

    const solid = tiles.filter((tile) => kinds(tile).size === 1);
    const ground = solid.filter((tile) => tile.edges.top !== 'beach');
    const carryingSand = tiles.filter((tile) => sandSides(tile) > 0);

    expect(solid.map((tile) => tile.edges.top).sort()).toEqual(['beach', 'land', 'water']);
    expect(ground.every((tile) => (tile.weight ?? 1) > 5)).toBe(true);

    // Sand belongs on the shore: a tile carrying it must never outrank open
    // ground, or the map fills with sand instead of land and water.
    expect(carryingSand.every((tile) => (tile.weight ?? 1) < Math.min(...ground.map(weight)))).toBe(
      true
    );

    // A shore is mostly sand, so it is far likelier than a sand-free cliff coast
    // or a tile where all three grounds meet. Solid sand is not a shore: it is a
    // sand flat, and it stays as rare as the sand-free coast.
    const shore = tiles.filter((tile) => sandSides(tile) >= 3 && kinds(tile).size > 1);
    const sandless = tiles.filter((tile) => !kinds(tile).has('beach') && kinds(tile).size === 2);

    expect(shore.every((tile) => weight(tile) > Math.max(...sandless.map(weight)))).toBe(true);
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
      ['terrain', 68],
    ]);
  });
});
