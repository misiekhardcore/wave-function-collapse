import { TileObject } from '@/app/types';

export function findTilesIndicesWithLeastOptions(grid: TileObject[]): number[] {
  const minOptions = Math.min(
    ...grid.filter((tile) => !tile.collapsed).map((tile) => tile.options.length)
  );
  return grid.reduce<number[]>((acc, tile, idx) => {
    if (tile.options.length === minOptions) {
      acc.push(idx);
    }
    return acc;
  }, []);
}
