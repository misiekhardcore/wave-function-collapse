import { TileObject } from '../types';
import { tiles } from './tiles';

export function getTopOptions(
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
  return tiles[northNeighbor.options[0]].bottom;
}

export function getRightOptions(
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
  return tiles[eastNeighbor.options[0]].left;
}

export function getBottomOptions(
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
  return tiles[southNeighbor.options[0]].top;
}

export function getLeftOptions(
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
  return tiles[westNeighbor.options[0]].right;
}
