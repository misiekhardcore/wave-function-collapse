import type { Side, Sockets, Tile, TileSet, TileSetId } from '@/types';

import mazeData from '../tileSets/maze.json';
import pcbData from '../tileSets/pcb.json';
import quiltData from '../tileSets/quilt.json';
import terrainData from '../tileSets/terrain.json';
import wiresData from '../tileSets/wires.json';

import {
  parseTileSetData,
  reverseSocket,
  type TileDefinition,
  type TileSetData,
} from './tileSetSchema';

export { parseTileSetData, type TileSetData } from './tileSetSchema';

export const SIDES: Side[] = ['top', 'right', 'bottom', 'left'];

/** The side a neighbour shares with a tile when it sits on the given side. */
export const OPPOSITE_SIDE: Record<Side, Side> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
};

/** A side's index in a tile's sockets, which are written north to west. */
const SIDE_INDEX: Record<Side, number> = { top: 0, right: 1, bottom: 2, left: 3 };

/** Mirrors an edge, which is what a tile seen in a mirror shows instead. */
function mirrorSocket(socket: string): string {
  return reverseSocket(socket);
}

/**
 * Turns sockets clockwise by whole quarter-turns: the north edge becomes the
 * east edge, and each edge keeps its own clockwise reading.
 */
export function rotateSockets(sockets: Sockets, degrees: number): Sockets {
  const steps = (((degrees / 90) % 4) + 4) % 4;
  let rotated: Sockets = [...sockets];

  for (let step = 0; step < steps; step++) {
    rotated = [rotated[3], rotated[0], rotated[1], rotated[2]];
  }

  return rotated;
}

/** A mirrored tile keeps its north and south edges but reads them backwards. */
export function mirrorSockets(sockets: Sockets): Sockets {
  return [
    mirrorSocket(sockets[0]),
    mirrorSocket(sockets[3]),
    mirrorSocket(sockets[2]),
    mirrorSocket(sockets[1]),
  ];
}

type Variant = {
  name: string;
  image: string;
  sockets: Sockets;
  rotation: number;
  flipped: boolean;
  weight: number;
};

/**
 * Every tile is instantiated at each angle it lists, mirrored too when it asks
 * for it, and the tile's weight is split between the variants so a four-way
 * rotation is not four times as common as a fixed tile.
 *
 * Two variants with the same sockets are the same tile: a symmetric tile does
 * not get to weigh more by listing rotations that change nothing.
 */
function expandVariants(name: string, definition: TileDefinition): Variant[] {
  const variants: Omit<Variant, 'weight'>[] = [];
  const seen = new Set<string>();
  const mirrors = definition.flip ? [false, true] : [false];

  for (const flipped of mirrors) {
    const base = flipped ? mirrorSockets(definition.sockets) : definition.sockets;

    for (const rotation of definition.rotate) {
      const sockets = rotateSockets(base, rotation);
      const key = sockets.join('\u0000');

      if (seen.has(key)) continue;

      seen.add(key);
      variants.push({ name, image: definition.image, sockets, rotation, flipped });
    }
  }

  const weight = definition.weight / variants.length;

  return variants.map((variant) => ({ ...variant, weight }));
}

/**
 * The weight a set writes for two sockets meeting, keyed in both directions.
 * A pair the set does not mention connects on its own when the sockets are
 * reverses of each other; anything else does not connect at all.
 */
function connectionWeights(connections: TileSetData['connections']): Map<string, number> {
  const weights = new Map<string, number>();

  for (const [a, b, weight] of connections) {
    weights.set(`${a}\u0000${b}`, weight);
    weights.set(`${b}\u0000${a}`, weight);
  }

  return weights;
}

function pairWeight(a: string, b: string, connections: Map<string, number>): number {
  const written = connections.get(`${a}\u0000${b}`);
  if (written !== undefined) return written;

  return reverseSocket(a) === b ? 1 : 0;
}

/**
 * Turns a written set into tiles with their neighbours resolved.
 *
 * What may meet what is read from the sockets, so a set never lists the pairs
 * that already follow from them. `connections` only adds pairs the sockets do
 * not imply, reweighs automatic ones, or forbids one with a weight of zero.
 */
export function createTiles(data: TileSetData): Tile[] {
  const variants = Object.entries(data.tiles).flatMap(([name, definition]) =>
    expandVariants(name, definition)
  );
  const connections = connectionWeights(data.connections);

  return variants.map((variant, id) => {
    const pairWeights = {} as Record<Side, Record<number, number>>;

    const lists = SIDES.map((side) => {
      const index = SIDE_INDEX[side];
      const opposite = (index + 2) % 4;
      const ids: number[] = [];
      const factors: Record<number, number> = {};

      for (let other = 0; other < variants.length; other++) {
        const weight = pairWeight(
          variant.sockets[index],
          variants[other].sockets[opposite],
          connections
        );

        if (weight <= 0) continue;

        ids.push(other);
        factors[other] = weight;
      }

      pairWeights[side] = factors;

      return ids;
    });

    const [top, right, bottom, left] = lists;

    return {
      id,
      name: variant.name,
      image: variant.image,
      rotation: variant.rotation,
      flipped: variant.flipped,
      sockets: variant.sockets,
      weight: variant.weight,
      top,
      right,
      bottom,
      left,
      pairWeights,
    };
  });
}

/** A tile nobody can sit beside is dead weight, so the set is refused instead. */
function assertEverySideHasANeighbour(tiles: Tile[], setId: string) {
  for (const tile of tiles) {
    for (const side of SIDES) {
      if (tile[side].length > 0) continue;

      throw new Error(
        `Tile set "${setId}": tile "${tile.name}" has socket "${tile.sockets[SIDE_INDEX[side]]}" on its ${side}, and no tile carries "${reverseSocket(tile.sockets[SIDE_INDEX[side]])}" on the opposite side.`
      );
    }
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** The order the sets are offered in. Every set is plain data in its own file. */
const SET_DATA = [wiresData, pcbData, mazeData, quiltData, terrainData].map(parseTileSetData);

function idOf(data: TileSetData): TileSetId {
  return data.id ?? slugify(data.name);
}

export const DEFAULT_TILE_SET_ID: TileSetId = idOf(SET_DATA[0]);

export const tileSets: TileSet[] = SET_DATA.map((data) => {
  const id = idOf(data);
  const tiles = createTiles(data);

  assertEverySideHasANeighbour(tiles, id);

  return {
    id,
    name: data.name,
    description: data.description,
    bias: data.bias,
    tiles,
  };
});

const duplicateIds = tileSets
  .map((set) => set.id)
  .filter((id, index, ids) => ids.indexOf(id) !== index);

if (duplicateIds.length > 0) {
  throw new Error(`Two tile sets share the id "${duplicateIds[0]}".`);
}

export function getTileSet(id: TileSetId): TileSet {
  return tileSets.find((set) => set.id === id) ?? tileSets[0];
}
