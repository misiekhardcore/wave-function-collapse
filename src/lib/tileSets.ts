import type { Tile, TileEdges, TileSet, TileSetId } from '@/types';

import mazeData from '../tileSets/maze.json';
import pcbData from '../tileSets/pcb.json';
import quiltData from '../tileSets/quilt.json';
import terrainData from '../tileSets/terrain.json';
import wiresData from '../tileSets/wires.json';

type Side = keyof TileEdges;

/** One tile of a set as it is written down in `src/tileSets/<id>.json`. */
export type TileSpec = TileEdges & {
  weight?: number;
  pairWeights?: Partial<Record<Side, Record<number, number>>>;
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

/**
 * Turns per-side edge labels into tiles with adjacency lists.
 *
 * A tile can sit above this one when its bottom label matches this tile's top
 * label, so every list is "the ids of the tiles whose opposite side carries the
 * same label". Deriving the lists from the labels keeps the rules symmetric and
 * closed: a label used on one side is always available for a neighbour to match
 * on the other. A set only has to describe its tiles, never its neighbours.
 */
export function createTiles(specs: TileSpec[]): Tile[] {
  const idsWithLabel = (label: string, side: Side) =>
    specs.reduce<number[]>((ids, spec, id) => (spec[side] === label ? [...ids, id] : ids), []);

  return specs.map(({ top, right, bottom, left, weight, pairWeights }, id) => ({
    id,
    top: idsWithLabel(top, 'bottom'),
    right: idsWithLabel(right, 'left'),
    bottom: idsWithLabel(bottom, 'top'),
    left: idsWithLabel(left, 'right'),
    edges: { top, right, bottom, left },
    weight,
    pairWeights,
  }));
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

    if (tile.weight !== undefined && !(tile.weight > 0)) {
      throw new Error(`Tile ${index} of "${set.id}" has a weight that is not positive.`);
    }

    for (const [side, pairs] of Object.entries(tile.pairWeights ?? {})) {
      if (!SIDES.includes(side as Side)) {
        throw new Error(
          `Tile ${index} of "${set.id}" weighs a "${side}" side, which is not one of its sides.`
        );
      }

      for (const [neighbourId, factor] of Object.entries(pairs ?? {})) {
        const neighbour = set.tiles[Number(neighbourId)];
        const shared = side as Side;

        if (neighbour === undefined) {
          throw new Error(
            `Tile ${index} of "${set.id}" weighs a pair with tile ${neighbourId}, which is not in the set.`
          );
        }

        // A pair weight on two tiles that cannot meet would be silently dead.
        if (neighbour[OPPOSITE_SIDE[shared]] !== tile[shared]) {
          throw new Error(
            `Tile ${index} of "${set.id}" weighs a pair with tile ${neighbourId}, which cannot sit on its ${shared}.`
          );
        }

        if (typeof factor !== 'number' || !(factor > 0)) {
          throw new Error(
            `Tile ${index} of "${set.id}" has a weight for tile ${neighbourId} on its ${shared} that is not positive.`
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
