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
  top: number[];
  right: number[];
  bottom: number[];
  left: number[];
};
