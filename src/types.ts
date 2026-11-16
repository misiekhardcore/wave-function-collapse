export type Position = {
  col: number;
  row: number;
};

export type TileObject = Position & {
  options: number[];
  collapsed: boolean;
};

/** One side of a tile, clockwise from the top. */
export type Side = 'top' | 'right' | 'bottom' | 'left';

/**
 * The four edges of a tile, north, east, south and west.
 *
 * An edge is read clockwise around the tile, so an east edge written `lw` starts
 * at land and ends at water on the next tile's west edge, which is written `wl`.
 */
export type Sockets = [string, string, string, string];

export type Tile = {
  id: number;
  /** The key the tile is written under in its set. */
  name: string;
  /** PNG drawn at the centre of the cell. */
  image: string;
  /** Clockwise rotation, in degrees, applied when the image is drawn. */
  rotation: number;
  /** True when the image is mirrored horizontally before it is rotated. */
  flipped: boolean;
  /** Edges after the variant's rotation and mirroring. */
  sockets: Sockets;
  /** The tile's weight, split evenly across its variants. */
  weight: number;
  top: number[];
  right: number[];
  bottom: number[];
  left: number[];
  /**
   * Multiplier on the tile's weight for the pair on each side, keyed by the side
   * the neighbour is on and then by that neighbour's tile id. One is the default
   * pair; an entry in the set's `connections` replaces it, and zero never
   * appears because such a pair is not allowed at all.
   */
  pairWeights: Record<Side, Record<number, number>>;
};

export type TileSetId = string;

/** How tile weights are spread across the board. */
export type Bias = 'constant' | 'noise';

export type TileSet = {
  id: TileSetId;
  name: string;
  description: string;
  bias: Bias;
  tiles: Tile[];
};
