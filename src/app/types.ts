export type Position = {
  col: number;
  row: number;
};

export type TileObject = Position & {
  options: number[];
  collapsed: boolean;
};

export type Tile = {
  id: number;
  n: number[];
  e: number[];
  s: number[];
  w: number[];
};
