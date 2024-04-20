import { TileObject } from '../types';
import { tiles } from './tiles';

export function getTopOptions(tileIndex: number, grid: TileObject[], cols: number): number[] {
  const neighborIndex = tileIndex - cols >= 0 ? tileIndex - cols : undefined;
  if (neighborIndex === undefined) return [];
  const northNeighbor = grid[neighborIndex];
  if (!northNeighbor?.collapsed) return [];
  return tiles[northNeighbor.options[0]].bottom;
}

export function getRightOptions(tileIndex: number, grid: TileObject[], cols: number): number[] {
  const neighborIndex = (tileIndex % cols) + 1 < cols ? tileIndex + 1 : undefined;
  if (neighborIndex === undefined) return [];
  const eastNeighbor = grid[neighborIndex];
  if (!eastNeighbor?.collapsed) return [];
  return tiles[eastNeighbor.options[0]].left;
}

export function getBottomOptions(tileIndex: number, grid: TileObject[], cols: number): number[] {
  const neighborIndex = tileIndex + cols < grid.length ? tileIndex + cols : undefined;
  if (neighborIndex === undefined) return [];
  const southNeighbor = grid[neighborIndex];
  if (!southNeighbor?.collapsed) return [];
  return tiles[southNeighbor.options[0]].top;
}

export function getLeftOptions(tileIndex: number, grid: TileObject[], cols: number): number[] {
  const neighborIndex = (tileIndex % cols) - 1 >= 0 ? tileIndex - 1 : undefined;
  if (neighborIndex === undefined) return [];
  const westNeighbor = grid[neighborIndex];
  if (!westNeighbor?.collapsed) return [];
  return tiles[westNeighbor.options[0]].right;
}
