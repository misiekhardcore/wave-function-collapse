import type { Tile, TileEdges, TileObject } from '@/types';

import { OPPOSITE_SIDE, SIDES } from './tileSets';

type Side = keyof TileEdges;

/**
 * A seam is an edge label carried by exactly two tiles, on opposite sides. Such
 * a label glues a multi-tile structure together (a PCB chip package is built
 * from one per interior edge).
 *
 * The map is keyed by the tile array so the scan happens once per tile set.
 */
const partnersByTiles = new WeakMap<Tile[], Map<number, Map<Side, number>>>();

function setPartner(
  partners: Map<number, Map<Side, number>>,
  tileId: number,
  side: Side,
  partnerId: number
) {
  const sides = partners.get(tileId) ?? new Map<Side, number>();

  sides.set(side, partnerId);
  partners.set(tileId, sides);
}

export function getPackagePartners(tiles: Tile[]): Map<number, Map<Side, number>> {
  const cached = partnersByTiles.get(tiles);
  if (cached) return cached;

  const byLabel = new Map<string, { tileId: number; side: Side }[]>();

  for (const tile of tiles) {
    for (const side of SIDES) {
      const label = tile.edges[side];
      byLabel.set(label, [...(byLabel.get(label) ?? []), { tileId: tile.id, side }]);
    }
  }

  const partners = new Map<number, Map<Side, number>>();

  for (const entries of byLabel.values()) {
    if (entries.length !== 2) continue;

    const [first, second] = entries;
    if (OPPOSITE_SIDE[first.side] !== second.side) continue;

    setPartner(partners, first.tileId, first.side, second.tileId);
    setPartner(partners, second.tileId, second.side, first.tileId);
  }

  partnersByTiles.set(tiles, partners);

  return partners;
}

function neighbourIndex(index: number, side: Side, count: number, cols: number): number {
  if (side === 'top') return index - cols >= 0 ? index - cols : -1;
  if (side === 'bottom') return index + cols < count ? index + cols : -1;
  if (side === 'left') return index % cols > 0 ? index - 1 : -1;

  return index % cols < cols - 1 ? index + 1 : -1;
}

/**
 * True when the tile can be placed at the index without splitting a package.
 *
 * Every cell the package would occupy must still be open and must still accept
 * its part, and the package must sit inside the board. A structure either fits
 * whole or is not chosen at all, which keeps chip packages from turning into
 * half-built blocks.
 */
export function canPlaceTile(
  tileId: number,
  index: number,
  grid: TileObject[],
  cols: number,
  tiles: Tile[]
): boolean {
  const partners = getPackagePartners(tiles);
  if (!partners.has(tileId)) return true;

  const expected = new Map<number, number>([[index, tileId]]);
  const pending = [index];

  while (pending.length > 0) {
    const cellIndex = pending.pop() as number;
    const seams = partners.get(expected.get(cellIndex) as number);
    if (!seams) continue;

    for (const [side, partnerId] of seams) {
      const neighbour = neighbourIndex(cellIndex, side, grid.length, cols);
      if (neighbour === -1) return false;

      const known = expected.get(neighbour);
      if (known !== undefined) {
        if (known !== partnerId) return false;
        continue;
      }

      if (grid[neighbour].collapsed) return false;
      if (!grid[neighbour].options.includes(partnerId)) return false;

      expected.set(neighbour, partnerId);
      pending.push(neighbour);
    }
  }

  return true;
}
