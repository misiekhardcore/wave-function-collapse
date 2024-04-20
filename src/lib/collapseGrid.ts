import { TileObject } from '@/types';

import { calculateOptions } from './calculateOptions';
import { findTilesIndicesWithLeastOptions } from './findTilesIndicesWithLeastOptions';
import { pickRandomArrayIndex } from './pickRandomArrayIndex';

export function collapseGrid(grid: TileObject[], cols: number, rows: number): TileObject[] {
  const tilesWithNewOptions = calculateOptions(grid, cols, rows);
  const leastOptionsTilesIndices = findTilesIndicesWithLeastOptions(tilesWithNewOptions);

  if (leastOptionsTilesIndices.length === 0) {
    return tilesWithNewOptions;
  }

  const randomTileIndex = leastOptionsTilesIndices[pickRandomArrayIndex(leastOptionsTilesIndices)];

  tilesWithNewOptions[randomTileIndex].collapsed = true;
  tilesWithNewOptions[randomTileIndex].options = [
    tilesWithNewOptions[randomTileIndex].options[
      pickRandomArrayIndex(tilesWithNewOptions[randomTileIndex].options)
    ],
  ];

  return tilesWithNewOptions;
}
