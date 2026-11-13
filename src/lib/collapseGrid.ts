import type { Tile, TileObject } from '@/types';

import { calculateOptions } from './calculateOptions';
import { canPlaceTile } from './canPlaceTile';
import { findTilesIndicesWithLeastOptions } from './findTilesIndicesWithLeastOptions';
import { pickRandomArrayElement } from './pickRandomArrayElement';
import { pickWeightedTile } from './pickWeightedTile';

export function collapseGrid(grid: TileObject[], cols: number, tiles: Tile[]): TileObject[] {
  const tilesWithNewOptions = calculateOptions(grid, cols, tiles);
  const leastOptionsTilesIndices = findTilesIndicesWithLeastOptions(tilesWithNewOptions);

  if (leastOptionsTilesIndices.length === 0) {
    return tilesWithNewOptions;
  }

  const randomTileIndex = pickRandomArrayElement(leastOptionsTilesIndices);
  const candidates = tilesWithNewOptions[randomTileIndex].options;
  let tileId = pickWeightedTile(candidates, tiles);

  // A package that cannot fit here is not chosen; the reroll keeps the same
  // distribution as filtering the package out before picking, without paying
  // the feasibility check on every ordinary tile.
  if (!canPlaceTile(tileId, randomTileIndex, tilesWithNewOptions, cols, tiles)) {
    const placeable = candidates.filter((candidate) =>
      canPlaceTile(candidate, randomTileIndex, tilesWithNewOptions, cols, tiles)
    );

    tileId = pickWeightedTile(placeable.length > 0 ? placeable : candidates, tiles);
  }

  tilesWithNewOptions[randomTileIndex].collapsed = true;
  tilesWithNewOptions[randomTileIndex].options = [tileId];

  return tilesWithNewOptions;
}
