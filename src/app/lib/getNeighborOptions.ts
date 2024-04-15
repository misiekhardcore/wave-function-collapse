import { TileObject } from '../types';
import { tiles } from './tiles';

export function getNorthNeighborOptions(
  { col, row }: TileObject,
  grid: TileObject[],
  _cols: number,
  _rows: number
): number[] {
  const northNeighbor =
    row > 0
      ? grid.find((tile) => tile.col === col && tile.row === row - 1 && tile.collapsed)
      : undefined;
  if (!northNeighbor) return [];
  return tiles[northNeighbor.options[0]].s;
}

export function getEastNeighborOptions(
  { col, row }: TileObject,
  grid: TileObject[],
  cols: number,
  _rows: number
): number[] {
  const eastNeighbor =
    col < cols - 1
      ? grid.find((tile) => tile.col === col + 1 && tile.row === row && tile.collapsed)
      : undefined;
  if (!eastNeighbor) return [];
  return tiles[eastNeighbor.options[0]].w;
}

export function getSouthNeighborOptions(
  { col, row }: TileObject,
  grid: TileObject[],
  _cols: number,
  rows: number
): number[] {
  const southNeighbor =
    row < rows - 1
      ? grid.find((tile) => tile.col === col && tile.row === row + 1 && tile.collapsed)
      : undefined;
  if (!southNeighbor) return [];
  return tiles[southNeighbor.options[0]].n;
}

export function getWestNeighborOptions(
  { col, row }: TileObject,
  grid: TileObject[],
  _cols: number,
  _rows: number
): number[] {
  const westNeighbor =
    col > 0
      ? grid.find((tile) => tile.col === col - 1 && tile.row === row && tile.collapsed)
      : undefined;
  if (!westNeighbor) return [];
  return tiles[westNeighbor.options[0]].e;
}
