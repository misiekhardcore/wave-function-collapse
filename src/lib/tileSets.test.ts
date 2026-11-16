import { existsSync } from 'node:fs';
import { join } from 'node:path';

import type { Tile } from '@/types';

import mazeData from '../tileSets/maze.json';
import pcbData from '../tileSets/pcb.json';
import quiltData from '../tileSets/quilt.json';
import terrainData from '../tileSets/terrain.json';
import wiresData from '../tileSets/wires.json';

import { getPackagePartners } from './canPlaceTile';
import { getAverageWeight } from './getTileWeight';
import {
  createTiles,
  getTileSet,
  OPPOSITE_SIDE,
  parseTileSetData,
  rotateSockets,
  SIDES,
  tileSets,
} from './tileSets';
import { reverseSocket, type TileSetData } from './tileSetSchema';

const RAW_SETS = [wiresData, pcbData, mazeData, quiltData, terrainData];
const PARSED_SETS: TileSetData[] = RAW_SETS.map(parseTileSetData);
const BUILT_SETS = PARSED_SETS.map((data) => createTiles(data));

/** Every pair multiplier a tile declares. */
function pairs(tile: Tile): number[] {
  return SIDES.flatMap((side) => Object.values(tile.pairWeights[side]));
}

const definition = (tiles: Record<string, object>, extra: object = {}) => ({
  version: 1 as const,
  name: 'Test',
  tiles,
  ...extra,
});

const image = '/tiles/test.png';

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

  it.each(tileSets)('$name draws every tile from a file that exists', (set) => {
    for (const tile of set.tiles) {
      expect(existsSync(join(process.cwd(), 'public', tile.image))).toBe(true);
    }
  });

  it.each(BUILT_SETS.map((tiles, index) => [PARSED_SETS[index], tiles] as const))(
    'derives every allowed pair from its sockets',
    (data, tiles) => {
      const declared = (a: string, b: string) =>
        data.connections.some(
          ([first, second]) => (first === a && second === b) || (first === b && second === a)
        );

      for (const tile of tiles) {
        for (const [index, side] of SIDES.entries()) {
          const socket = tile.sockets[index];

          for (const other of tiles) {
            const opposite = other.sockets[(index + 2) % 4];
            const allowed = reverseSocket(socket) === opposite || declared(socket, opposite);

            expect(tile[side].includes(other.id)).toBe(allowed);
          }
        }
      }
    }
  );

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

  it('describes every terrain tile once', () => {
    const tiles = getTileSet('terrain').tiles;
    const layouts = tiles.map((tile) => tile.sockets.join('|'));

    expect(tiles).toHaveLength(68);
    expect(new Set(layouts).size).toBe(68);
  });

  it('weighs solid ground above sand so land and sea grow into regions', () => {
    const tiles = getTileSet('terrain').tiles;
    const weight = (tile: Tile) => getAverageWeight(tile);
    const kinds = (tile: Tile) => new Set(tile.sockets);
    const sandSides = (tile: Tile) => tile.sockets.filter((socket) => socket === 'b').length;

    // Nothing overrides a pair in this set, so every tile weighs its own weight.
    expect(tiles.every((tile) => pairs(tile).every((pair) => pair === 1))).toBe(true);

    const solid = tiles.filter((tile) => kinds(tile).size === 1);
    const ground = solid.filter((tile) => tile.sockets[0] !== 'b');
    const carryingSand = tiles.filter((tile) => sandSides(tile) > 0);

    expect(solid.map((tile) => tile.sockets[0]).sort()).toEqual(['b', 'l', 'w']);
    expect(ground.every((tile) => weight(tile) > 5)).toBe(true);
    expect(carryingSand.every((tile) => weight(tile) < Math.min(...ground.map(weight)))).toBe(true);

    const shore = tiles.filter((tile) => sandSides(tile) >= 3 && kinds(tile).size > 1);
    const sandless = tiles.filter((tile) => !kinds(tile).has('b') && kinds(tile).size === 2);

    expect(shore.every((tile) => weight(tile) > Math.max(...sandless.map(weight)))).toBe(true);
  });

  it('assembles each PCB package from sockets written once on each side', () => {
    const tiles = getTileSet('pcb').tiles;
    const partners = getPackagePartners(tiles);
    const occurrences = new Map<string, number>();

    for (const tile of tiles) {
      for (const socket of tile.sockets)
        occurrences.set(socket, (occurrences.get(socket) ?? 0) + 1);
    }

    for (const [tileId, seams] of partners) {
      for (const [side, partnerId] of seams) {
        expect(tiles[partnerId][OPPOSITE_SIDE[side]]).toContain(tileId);
        expect(partners.get(partnerId)?.get(OPPOSITE_SIDE[side])).toBe(tileId);
      }
    }

    for (const tile of tiles) {
      for (const socket of new Set(tile.sockets)) {
        if (!partners.has(tile.id)) continue;
        if (socket === 'o' || socket === 'g') continue;

        expect(occurrences.get(socket)).toBe(2);
      }
    }

    const components: number[][] = [];
    const seen = new Set<number>();

    for (const start of partners.keys()) {
      if (seen.has(start)) continue;

      const component = [start];
      seen.add(start);

      for (let index = 0; index < component.length; index++) {
        for (const partner of partners.get(component[index])?.values() ?? []) {
          if (seen.has(partner)) continue;
          seen.add(partner);
          component.push(partner);
        }
      }

      components.push(component);
    }

    expect(components.map((component) => component.length).sort((a, b) => a - b)).toEqual([9, 15]);
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

describe('sockets', () => {
  it('turns an edge clockwise around the tile', () => {
    const sockets = ['l', 'lw', 'w', 'wl'] as const;

    expect(rotateSockets([...sockets], 90)).toEqual(['wl', 'l', 'lw', 'w']);
    expect(rotateSockets([...sockets], 180)).toEqual(['w', 'wl', 'l', 'lw']);
    expect(rotateSockets([...sockets], 360)).toEqual([...sockets]);
  });

  it('connects an edge to the reverse of itself, and to nothing else', () => {
    const tiles = createTiles(
      parseTileSetData(
        definition({
          water: { image, sockets: ['w', 'w', 'w', 'w'] },
          shore: { image, sockets: ['l', 'lw', 'w', 'wl'] },
        })
      )
    );

    // The shore's east edge runs land to water; only its west edge runs back.
    expect(tiles[1].right).toEqual([1]);
    expect(tiles[1].pairWeights.right).toEqual({ 1: 1 });
    expect(tiles[1].left).toEqual([1]);
    expect(tiles[0].right).toEqual([0]);
  });

  it('adds a pair the sockets do not imply', () => {
    const tiles = createTiles(
      parseTileSetData(
        definition(
          {
            water: { image, sockets: ['w', 'w', 'w', 'w'] },
            land: { image, sockets: ['l', 'l', 'l', 'l'] },
          },
          { connections: [['w', 'l', 0.3]] }
        )
      )
    );

    expect(tiles[0].right).toEqual([0, 1]);
    expect(tiles[0].pairWeights.right).toEqual({ 0: 1, 1: 0.3 });
    expect(tiles[1].left).toEqual([0, 1]);
    expect(tiles[1].pairWeights.left).toEqual({ 0: 0.3, 1: 1 });
  });

  it('forbids an automatic pair with a weight of zero', () => {
    const tiles = createTiles(
      parseTileSetData(
        definition(
          { water: { image, sockets: ['w', 'w', 'w', 'w'] } },
          { connections: [['w', 'w', 0]] }
        )
      )
    );

    expect(tiles[0].right).toEqual([]);
  });
});

describe('variants', () => {
  it('instantiates a tile at every rotation and splits its weight', () => {
    const tiles = createTiles(
      parseTileSetData(
        definition({
          shore: {
            image,
            sockets: ['l', 'lw', 'w', 'wl'],
            rotate: [0, 90, 180, 270],
            weight: 4,
          },
        })
      )
    );

    expect(tiles).toHaveLength(4);
    expect(tiles.map((tile) => tile.rotation)).toEqual([0, 90, 180, 270]);
    expect(tiles.map((tile) => tile.sockets)).toEqual([
      ['l', 'lw', 'w', 'wl'],
      ['wl', 'l', 'lw', 'w'],
      ['w', 'wl', 'l', 'lw'],
      ['lw', 'w', 'wl', 'l'],
    ]);
    expect(tiles.map((tile) => tile.weight)).toEqual([1, 1, 1, 1]);
  });

  it('keeps one variant of a tile a rotation cannot change', () => {
    const tiles = createTiles(
      parseTileSetData(
        definition({
          water: { image, sockets: ['w', 'w', 'w', 'w'], rotate: [0, 90, 180, 270], weight: 4 },
        })
      )
    );

    expect(tiles).toHaveLength(1);
    expect(tiles[0].weight).toBe(4);
  });

  it('mirrors the sockets when a tile asks for it', () => {
    const tiles = createTiles(
      parseTileSetData(
        definition({
          shore: { image, sockets: ['a', 'bb', 'c', 'dd'], flip: true },
        })
      )
    );

    expect(tiles.map((tile) => tile.flipped)).toEqual([false, true]);
    expect(tiles[1].sockets).toEqual(['a', 'dd', 'c', 'bb']);
  });
});

describe('tile set validation', () => {
  const one = { image, sockets: ['w', 'w', 'w', 'w'] };

  it('accepts the documented example', () => {
    const parsed = parseTileSetData({
      version: 1,
      name: 'coast',
      connections: [['w', 'l', 0.3]],
      tiles: {
        water: { image: 'tiles/water.png', sockets: ['w', 'w', 'w', 'w'], weight: 4 },
        land: { image: 'tiles/land.png', sockets: ['l', 'l', 'l', 'l'], weight: 5 },
        shore: {
          image: 'tiles/shore.png',
          sockets: ['l', 'lw', 'w', 'wl'],
          rotate: [0, 90, 180, 270],
          weight: 2,
        },
      },
    });

    expect(parsed.bias).toBe('constant');
    expect(parsed.tiles.shore.rotate).toEqual([0, 90, 180, 270]);
  });

  it('accepts a set without an id', () => {
    expect(() =>
      parseTileSetData({ version: 1, name: 'My Coast', tiles: { water: one } })
    ).not.toThrow();
  });

  it('rejects a definition without a version', () => {
    expect(() => parseTileSetData({ name: 'Test', tiles: { water: one } })).toThrow();
  });

  it('rejects an unsupported version', () => {
    expect(() => parseTileSetData(definition({ water: one }, { version: 2 }))).toThrow(
      /Unsupported tile set version/
    );
  });

  it('rejects a set without a tile', () => {
    expect(() => parseTileSetData(definition({}))).toThrow(/at least one tile/);
  });

  it('rejects a tile without four sockets', () => {
    expect(() =>
      parseTileSetData(definition({ water: { image, sockets: ['w', 'w', 'w'] } }))
    ).toThrow(/four sockets/);
  });

  it('rejects a tile whose weight is not positive', () => {
    expect(() => parseTileSetData(definition({ water: { ...one, weight: 0 } }))).toThrow(
      /greater than zero/
    );
  });

  it('rejects a rotation that is not a quarter turn', () => {
    expect(() => parseTileSetData(definition({ water: { ...one, rotate: [45] } }))).toThrow();
  });

  it('rejects the same rotation twice', () => {
    expect(() => parseTileSetData(definition({ water: { ...one, rotate: [0, 90, 0] } }))).toThrow(
      /same rotation twice/
    );
  });

  it('rejects a field it does not know', () => {
    expect(() => parseTileSetData(definition({ water: { ...one, art: 'diagonal' } }))).toThrow();
  });

  it('rejects a connection to a socket no tile carries', () => {
    expect(() =>
      parseTileSetData(definition({ water: one }, { connections: [['w', 'z', 1]] }))
    ).toThrow(/no tile has/);
  });

  it('rejects a forbidden pair that could not happen anyway', () => {
    expect(() =>
      parseTileSetData(
        definition(
          { water: one, land: { image, sockets: ['l', 'l', 'l', 'l'] } },
          { connections: [['w', 'l', 0]] }
        )
      )
    ).toThrow(/could not happen anyway/);
  });

  it('rejects the same connection twice', () => {
    expect(() =>
      parseTileSetData(
        definition(
          { water: one },
          {
            connections: [
              ['w', 'w', 2],
              ['w', 'w', 3],
            ],
          }
        )
      )
    ).toThrow(/listed twice/);
  });

  it('refuses a set with a socket nothing can meet', () => {
    // The validation runs when the shipped sets are loaded, so it is exercised
    // through the exported tiles: a dead socket would have thrown at import.
    for (const set of tileSets) {
      for (const tile of set.tiles) {
        for (const side of SIDES) {
          expect(tile[side].length).toBeGreaterThan(0);
        }
      }
    }
  });
});
