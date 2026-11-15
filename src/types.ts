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
 * encode. Every pair of sides that can meet is therefore identified by the
 * label on either of them.
 */
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
  /**
   * Weight of a single neighbour pair, default 1, keyed by the side the
   * neighbour is on and then by that neighbour's tile id. It multiplies the
   * prior once the neighbour is decided, so the same tile can be common beside
   * one neighbour and rare beside another even when both carry the label of the
   * side that meets them.
   */
  pairWeights?: Partial<Record<keyof TileEdges, Record<number, number>>>;
};

export type TileSetId = 'wires' | 'pcb' | 'maze' | 'quilt' | 'terrain';

export type TileSet = {
  id: TileSetId;
  name: string;
  description: string;
  tiles: Tile[];
};
