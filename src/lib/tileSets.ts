import type { Tile, TileEdges, TileSet, TileSetId } from '@/types';

import mazeData from '../tileSets/maze.json';
import pcbData from '../tileSets/pcb.json';
import quiltData from '../tileSets/quilt.json';
import terrainData from '../tileSets/terrain.json';
import wiresData from '../tileSets/wires.json';

type Side = keyof TileEdges;

/** One side as written down: neighbour ids, or a weight for each of them. */
export type TileNeighbours = number[] | Record<number, number>;

/** One tile of a set as it is written down in `src/tileSets/<id>.json`. */
export type TileSpec = TileEdges & {
  neighbours: Record<Side, TileNeighbours>;
};

export type TileSetData = {
  id: string;
  name: string;
  description: string;
  tiles: TileSpec[];
};

export const SIDES: Side[] = ['top', 'right', 'bottom', 'left'];

/** The side a neighbour shares with a tile when it sits on the given side. */
export const OPPOSITE_SIDE: Record<Side, Side> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
};

/** The neighbours on one side as (id, weight) pairs, in the order written. */
export function neighboursOf(side: TileNeighbours): [number, number][] {
  return Array.isArray(side)
    ? side.map((id) => [id, 1])
    : Object.entries(side).map(([id, weight]) => [Number(id), weight]);
}

/**
 * Turns a written set into tiles with adjacency lists.
 *
 * What may meet what, and how often, is written down in `neighbours`, so the
 * rules and their frequencies are the data and nothing is inferred from the
 * labels the artwork is drawn from. A side written as a list weighs every pair
 * alike; a side written as an object gives each pair its own weight.
 */
export function createTiles(specs: TileSpec[]): Tile[] {
  return specs.map((spec, id) => {
    const pairs = Object.fromEntries(
      SIDES.map((side) => [side, neighboursOf(spec.neighbours[side])])
    ) as Record<Side, [number, number][]>;

    const ids = (side: Side) => pairs[side].map(([neighbour]) => neighbour);

    return {
      id,
      top: ids('top'),
      right: ids('right'),
      bottom: ids('bottom'),
      left: ids('left'),
      edges: { top: spec.top, right: spec.right, bottom: spec.bottom, left: spec.left },
      pairWeights: Object.fromEntries(
        SIDES.map((side) => [side, Object.fromEntries(pairs[side])])
      ) as Record<Side, Record<number, number>>,
    };
  });
}

/** A definition is data, so a typo in it has to fail loudly and early. */
export function parseTileSetData(data: unknown): TileSetData {
  const set = data as TileSetData;

  if (!set?.id || !set.name || !Array.isArray(set.tiles) || set.tiles.length === 0) {
    throw new Error('A tile set needs an id, a name and at least one tile.');
  }

  for (const [index, tile] of set.tiles.entries()) {
    for (const side of SIDES) {
      if (typeof tile[side] !== 'string' || tile[side].length === 0) {
        throw new Error(`Tile ${index} of "${set.id}" has no "${side}" label.`);
      }
    }

    const written = tile.neighbours as Record<string, TileNeighbours> | undefined;

    if (written === undefined || typeof written !== 'object') {
      throw new Error(`Tile ${index} of "${set.id}" does not say which tiles sit beside it.`);
    }

    for (const side of Object.keys(written)) {
      if (!SIDES.includes(side as Side)) {
        throw new Error(
          `Tile ${index} of "${set.id}" lists neighbours on "${side}", which is not one of its sides.`
        );
      }
    }

    for (const side of SIDES) {
      const sideNeighbours = written[side];

      if (sideNeighbours === undefined) {
        throw new Error(
          `Tile ${index} of "${set.id}" does not say which tiles sit on its ${side}.`
        );
      }

      const pairs = neighboursOf(sideNeighbours);

      if (pairs.length === 0) {
        throw new Error(`Tile ${index} of "${set.id}" has no neighbour on its ${side}.`);
      }

      if (new Set(pairs.map(([neighbourId]) => neighbourId)).size !== pairs.length) {
        throw new Error(`Tile ${index} of "${set.id}" lists a neighbour twice on its ${side}.`);
      }

      for (const [neighbourId, weight] of pairs) {
        const neighbour = set.tiles[neighbourId];

        if (neighbour === undefined) {
          throw new Error(
            `Tile ${index} of "${set.id}" lists tile ${neighbourId} on its ${side}, which is not in the set.`
          );
        }

        if (typeof weight !== 'number' || !(weight > 0)) {
          throw new Error(
            `Tile ${index} of "${set.id}" gives tile ${neighbourId} on its ${side} a weight that is not positive.`
          );
        }

        // The artwork is drawn from the labels, so a pair whose labels disagree
        // would draw a picture the rules contradict.
        if (neighbour[OPPOSITE_SIDE[side]] !== tile[side]) {
          throw new Error(
            `Tile ${index} of "${set.id}" lists tile ${neighbourId} on its ${side}, but their labels disagree.`
          );
        }

        // One side has to name the other, or the rule is only half written.
        const back = neighboursOf(neighbour.neighbours?.[OPPOSITE_SIDE[side]] ?? []);
        if (!back.some(([id]) => id === index)) {
          throw new Error(
            `Tile ${index} of "${set.id}" lists tile ${neighbourId} on its ${side}, but tile ${neighbourId} does not list it back.`
          );
        }
      }
    }
  }

  return set;
}

/** The order the sets are offered in. Every set is plain data in its own file. */
const TILE_SET_DATA: TileSetData[] = [wiresData, pcbData, mazeData, quiltData, terrainData].map(
  parseTileSetData
);

export const DEFAULT_TILE_SET_ID: TileSetId = TILE_SET_DATA[0].id as TileSetId;

export const tileSets: TileSet[] = TILE_SET_DATA.map((set) => ({
  id: set.id as TileSetId,
  name: set.name,
  description: set.description,
  tiles: createTiles(set.tiles),
}));

export function getTileSet(id: TileSetId): TileSet {
  return tileSets.find((set) => set.id === id) ?? tileSets[0];
}
