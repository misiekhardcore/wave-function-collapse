export type Position = {
  col: number;
  row: number;
};

export type TileObject = Position & {
  options: number[];
  collapsed: boolean;
};

/**
 * The label of one tile edge. Two tiles may sit side by side only when the
 * labels that meet are identical, which is what the adjacency lists below
 * encode.
 */
// /**
//  * A seam inside a multi-tile chip package. The label names the package and the
//  * two cells it joins, so exactly two parts can ever meet across it.
//  */
// export type ChipSeam = `chip:${string}`;

// export type TileEdge =
//   | 'open'
//   | 'wire'
//   | 'green'
//   | 'wall'
//   | 'color-a'
//   | 'color-b'
//   | 'color-c'
//   | 'land'
//   | 'beach'
//   | 'water'
//   | ChipSeam;

export type TileEdges = {
  top: string;
  right: string;
  bottom: string;
  left: string;
};

export type Tile = {
  id: number;
  top: number[];
  right: number[];
  bottom: number[];
  left: number[];
  /**
   * Source labels the adjacency lists were derived from. The tile's art is
   * drawn from these too, so a tile is fully described by its four labels.
   */
  edges: TileEdges;
  /**
   * Relative chance of being picked when collapsing, default 1. Weighed tiles
   * keep rare structures (such as chip packages) sparse.
   */
  weight?: number;
};

export type TileSetId = 'wires' | 'pcb' | 'maze' | 'quilt' | 'terrain';

export type TileSet = {
  id: TileSetId;
  name: string;
  description: string;
  tiles: Tile[];
};
