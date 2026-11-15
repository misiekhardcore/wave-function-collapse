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
   * Frequency of every neighbour pair, keyed by the side the neighbour is on and
   * then by that neighbour's tile id. A tile at a cell is weighed by the mean of
   * the pairs already settled around it, so the number on a pair is that pair's
   * share — write the same number on every pair of a tile that should be equally
   * likely everywhere, and one that should be rare everywhere is rare beside
   * every neighbour it allows.
   */
  pairWeights: Record<keyof TileEdges, Record<number, number>>;
};

export type TileSetId = 'wires' | 'pcb' | 'maze' | 'quilt' | 'terrain';

export type TileSet = {
  id: TileSetId;
  name: string;
  description: string;
  tiles: Tile[];
};
