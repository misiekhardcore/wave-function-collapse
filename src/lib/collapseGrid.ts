import type { Tile, TileObject } from '@/types';

import { calculateOptions } from './calculateOptions';
import { canPlaceTile } from './canPlaceTile';
import { findTilesIndicesWithLeastOptions } from './findTilesIndicesWithLeastOptions';
import { isCompatibleWithNeighbours } from './isCompatibleWithNeighbours';
import { pickRandomArrayElement } from './pickRandomArrayElement';
import { pickWeightedTile } from './pickWeightedTile';

/** True when any decided neighbour belongs to a chip package. */
function touchesPackage(index: number, grid: TileObject[], cols: number, tiles: Tile[]): boolean {
  const neighbours = [
    index - cols >= 0 ? index - cols : -1,
    index % cols < cols - 1 ? index + 1 : -1,
    index + cols < grid.length ? index + cols : -1,
    index % cols > 0 ? index - 1 : -1,
  ];

  return neighbours.some((neighbour) => {
    if (neighbour === -1) return false;

    const cell = grid[neighbour];
    if (!cell.collapsed) return false;

    const art = tiles[cell.options[0]].art;

    return art === 'chip' || art === 'chip-body';
  });
}

export function collapseGrid(grid: TileObject[], cols: number, tiles: Tile[]): TileObject[] {
  const tilesWithNewOptions = calculateOptions(grid, cols, tiles);
  const leastOptionsTilesIndices = findTilesIndicesWithLeastOptions(tilesWithNewOptions);

  if (leastOptionsTilesIndices.length === 0) {
    return tilesWithNewOptions;
  }

  const randomTileIndex = pickRandomArrayElement(leastOptionsTilesIndices);
  const candidates = tilesWithNewOptions[randomTileIndex].options;

  // A package that cannot fit here is not chosen, and a tile only goes in when
  // its edges agree with every decided neighbour. Without that second check a
  // stale option list could strand a chip package next to a tile that does not
  // accept it.
  const fitting = candidates.filter(
    (candidate) =>
      canPlaceTile(candidate, randomTileIndex, tilesWithNewOptions, cols, tiles) &&
      isCompatibleWithNeighbours(candidate, randomTileIndex, tilesWithNewOptions, cols, tiles)
  );

  // Around a package there is no safe alternative: leave the cell open and let
  // the run end rather than drawing a tile the package cannot meet.
  if (fitting.length === 0 && touchesPackage(randomTileIndex, tilesWithNewOptions, cols, tiles)) {
    return tilesWithNewOptions;
  }

  const fallback = candidates.filter((candidate) =>
    canPlaceTile(candidate, randomTileIndex, tilesWithNewOptions, cols, tiles)
  );
  const pool = fitting.length > 0 ? fitting : fallback.length > 0 ? fallback : candidates;
  const tileId = pickWeightedTile(pool, tiles);

  tilesWithNewOptions[randomTileIndex].collapsed = true;
  tilesWithNewOptions[randomTileIndex].options = [tileId];

  return tilesWithNewOptions;
}
