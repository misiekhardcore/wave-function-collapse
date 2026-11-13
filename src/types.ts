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
/**
 * A seam inside a multi-tile chip package. The label names the package and the
 * two cells it joins, so exactly two parts can ever meet across it.
 */
export type ChipSeam = `chip:${string}`;

export type TileEdge =
  | 'open'
  | 'wire'
  | 'green'
  | 'wall'
  | 'color-a'
  | 'color-b'
  | 'color-c'
  | 'land'
  | 'beach'
  | 'water'
  | ChipSeam;

/** How a tile's art is drawn; the rules never depend on it. */
export type TileArt = 'diagonal' | 'jog' | 'terminal' | 'chip' | 'chip-body';

export type TileEdges = {
  top: TileEdge;
  right: TileEdge;
  bottom: TileEdge;
  left: TileEdge;
};

export type Tile = {
  id: number;
  top: number[];
  right: number[];
  bottom: number[];
  left: number[];
  /** Source labels the adjacency lists were derived from; used to draw the art. */
  edges: TileEdges;
  /** Optional decoration for tiles with no traces; ignored by the solver. */
  art?: TileArt;
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
