import { TileObject } from '@/types';

import { calculateOptions } from './calculateOptions';
import { findTilesIndicesWithLeastOptions } from './findTilesIndicesWithLeastOptions';
import { pickRandomArrayElement } from './pickRandomArrayElement';

export function collapseGrid(grid: TileObject[], cols: number): TileObject[] {
  const tilesWithNewOptions = calculateOptions(grid, cols);
  const leastOptionsTilesIndices = findTilesIndicesWithLeastOptions(tilesWithNewOptions);

  if (leastOptionsTilesIndices.length === 0) {
    return tilesWithNewOptions;
  }

  const randomTileIndex = pickRandomArrayElement(leastOptionsTilesIndices);

  tilesWithNewOptions[randomTileIndex].collapsed = true;
  tilesWithNewOptions[randomTileIndex].options = [
    pickRandomArrayElement(tilesWithNewOptions[randomTileIndex].options),
  ];

  return tilesWithNewOptions;
}
