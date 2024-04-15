import { TileObject } from '@/app/types';

import { calculateOptions } from './calculateOptions';
import { findTilesIndicesWithLeastOptions } from './findTilesIndicesWithLeastOptions';
import { pickRandomArrayIndex } from './pickRandomArrayIndex';

export function collapseGrid(grid: TileObject[], cols: number, rows: number): TileObject[] {
  const tilesWithNewOptions = calculateOptions(grid, cols, rows);
  const leastOptionsTiles = findTilesIndicesWithLeastOptions(tilesWithNewOptions);
  const randomTileIndex = leastOptionsTiles[pickRandomArrayIndex(leastOptionsTiles)];

  tilesWithNewOptions[randomTileIndex].collapsed = true;
  tilesWithNewOptions[randomTileIndex].options = [
    tilesWithNewOptions[randomTileIndex].options[
      pickRandomArrayIndex(tilesWithNewOptions[randomTileIndex].options)
    ],
  ];

  return tilesWithNewOptions;
}
