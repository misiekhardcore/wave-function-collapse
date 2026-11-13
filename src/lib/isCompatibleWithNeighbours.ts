import type { Tile, TileObject } from '@/types';

/**
 * True when the tile can sit at the index next to every decided neighbour.
 *
 * Option lists can go stale: `calculateOptions` keeps a cell's options when the
 * intersection with its neighbours is empty, so the list is not on its own a
 * guarantee that a tile still fits. Collapsing through this check means the
 * pattern never gains an edge whose two labels disagree.
 */
export function isCompatibleWithNeighbours(
  tileId: number,
  index: number,
  grid: TileObject[],
  cols: number,
  tiles: Tile[]
): boolean {
  const tile = tiles[tileId];
  if (!tile) return false;

  const check = (neighbour: number | undefined, side: keyof Tile['edges']) => {
    if (neighbour === undefined) return true;

    const cell = grid[neighbour];
    if (!cell.collapsed) return true;

    return tile[side].includes(cell.options[0]);
  };

  return (
    check(index - cols >= 0 ? index - cols : undefined, 'top') &&
    check(index % cols < cols - 1 ? index + 1 : undefined, 'right') &&
    check(index + cols < grid.length ? index + cols : undefined, 'bottom') &&
    check(index % cols > 0 ? index - 1 : undefined, 'left')
  );
}
