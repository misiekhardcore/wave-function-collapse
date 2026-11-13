import type { Tile, TileArt, TileEdge, TileEdges, TileSet, TileSetId } from '@/types';

type Side = keyof TileEdges;

export type TileSpec = TileEdges & { art?: TileArt; weight?: number };

export const SIDES: Side[] = ['top', 'right', 'bottom', 'left'];

/** The side a neighbour shares with a tile when it sits on the given side. */
export const OPPOSITE_SIDE: Record<Side, Side> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
};

/**
 * Turns per-side edge labels into tiles with adjacency lists.
 *
 * A tile can sit above this one when its bottom label matches this tile's top
 * label, so every list is "the ids of the tiles whose opposite side carries the
 * same label". Deriving the lists instead of listing tile ids by hand keeps the
 * rules symmetric and closed: a label used on one side is always available for
 * a neighbour to match on the other.
 */
export function createTiles(specs: TileSpec[]): Tile[] {
  const idsWithLabel = (label: TileEdge, side: Side) =>
    specs.reduce<number[]>((ids, spec, id) => (spec[side] === label ? [...ids, id] : ids), []);

  return specs.map(({ top, right, bottom, left, art, weight }, id) => ({
    id,
    top: idsWithLabel(top, 'bottom'),
    right: idsWithLabel(right, 'left'),
    bottom: idsWithLabel(bottom, 'top'),
    left: idsWithLabel(left, 'right'),
    edges: { top, right, bottom, left },
    art,
    weight,
  }));
}

function edgesFor(connected: readonly Side[], on: TileEdge, off: TileEdge): TileSpec {
  const edge = (side: Side) => (connected.includes(side) ? on : off);

  return { top: edge('top'), right: edge('right'), bottom: edge('bottom'), left: edge('left') };
}

/**
 * The classic circuit set: a tile either continues the trace on a side or not,
 * in every shape that allows (blank, straight, elbow, tee).
 */
const WIRES_SPECS: TileSpec[] = [
  edgesFor([], 'wire', 'open'),
  edgesFor(['top', 'left', 'right'], 'wire', 'open'),
  edgesFor(['top', 'right', 'bottom'], 'wire', 'open'),
  edgesFor(['left', 'right', 'bottom'], 'wire', 'open'),
  edgesFor(['top', 'bottom', 'left'], 'wire', 'open'),
  edgesFor(['top', 'bottom'], 'wire', 'open'),
  edgesFor(['left', 'right'], 'wire', 'open'),
  edgesFor(['top', 'left'], 'wire', 'open'),
  edgesFor(['top', 'right'], 'wire', 'open'),
  edgesFor(['bottom', 'right'], 'wire', 'open'),
  edgesFor(['bottom', 'left'], 'wire', 'open'),
];

const OPEN_SPEC: TileSpec = { top: 'open', right: 'open', bottom: 'open', left: 'open' };

const PCB_CORNERS: Side[][] = [
  ['top', 'left'],
  ['top', 'right'],
  ['bottom', 'left'],
  ['bottom', 'right'],
];

const PCB_STRAIGHTS: Side[][] = [
  ['top', 'bottom'],
  ['left', 'right'],
];

const PCB_TEES: Side[][] = [
  ['top', 'left', 'right'],
  ['top', 'right', 'bottom'],
  ['left', 'right', 'bottom'],
  ['top', 'bottom', 'left'],
];

/** Test points are accents, not the bulk of the board. */
const PCB_TERMINAL_WEIGHT = 0.3;

/** A lane change is less common than a straight run, so traces stay long. */
const PCB_JOG_WEIGHT = 0.5;

/** Footprint of a microcontroller package, in tiles. */
export type ChipPackageShape = {
  id: string;
  cols: number;
  rows: number;
  /** Chance of collapsing into one of its parts; default 1. */
  weight: number;
};

/**
 * The packages the PCB set can assemble. A package costs cols x rows cells, so
 * each shape is weighted below a single trace tile — the wider package sits
 * lower, since it covers five cells for every three of the square one.
 */
export const PCB_CHIP_SHAPES: ChipPackageShape[] = [
  { id: 'square', cols: 3, rows: 3, weight: 0.3 },
  { id: 'wide', cols: 5, rows: 3, weight: 0.2 },
];

/**
 * Builds one package as cols x rows parts.
 *
 * Exterior sides are bare board, and every interior side carries a seam label
 * built from the package id and the two cells it joins, so only the part on the
 * other side of that seam accepts it. The labels scale with the footprint, which
 * is what lets packages of different shapes share the board.
 */
function createChipPackage({ id, cols, rows, weight }: ChipPackageShape): TileSpec[] {
  const cellKey = (col: number, row: number) => `${col}x${row}`;
  const seam = (a: string, b: string): TileEdge => `chip:${id}:${[a, b].sort().join('|')}`;

  const centreCol = Math.floor((cols - 1) / 2);
  const centreRow = Math.floor((rows - 1) / 2);
  const hasInterior = cols > 2 && rows > 2;
  const specs: TileSpec[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const key = cellKey(col, row);
      const isCentre = hasInterior && col === centreCol && row === centreRow;

      specs.push({
        top: row === 0 ? 'open' : seam(cellKey(col, row - 1), key),
        right: col === cols - 1 ? 'open' : seam(key, cellKey(col + 1, row)),
        bottom: row === rows - 1 ? 'open' : seam(key, cellKey(col, row + 1)),
        left: col === 0 ? 'open' : seam(cellKey(col - 1, row), key),
        art: isCentre ? 'chip-body' : 'chip',
        weight,
      });
    }
  }

  return specs;
}

function createChipSpecs(): TileSpec[] {
  return PCB_CHIP_SHAPES.flatMap(createChipPackage);
}

/**
 * Green copper traces on soldermask: elbows in a rounded bend or a straight 45°
 * run, straights that either hold their line or jog sideways, tees that meet at
 * a via, and test points that end in a terminal pad. The remaining tiles build
 * microcontrollers in each of `PCB_CHIP_SHAPES`.
 */
function createPcbSpecs(): TileSpec[] {
  const specs: TileSpec[] = [OPEN_SPEC];

  for (const shape of PCB_CORNERS) {
    const corner = edgesFor(shape, 'green', 'open');

    specs.push(corner, { ...corner, art: 'diagonal' });
  }

  for (const shape of PCB_STRAIGHTS) {
    const straight = edgesFor(shape, 'green', 'open');

    specs.push(straight, { ...straight, art: 'jog', weight: PCB_JOG_WEIGHT });
  }

  for (const shape of PCB_TEES) specs.push(edgesFor(shape, 'green', 'open'));

  for (const side of SIDES) {
    specs.push({
      ...edgesFor([side], 'green', 'open'),
      art: 'terminal',
      weight: PCB_TERMINAL_WEIGHT,
    });
  }

  specs.push(...createChipSpecs());

  return specs;
}

/** Walls on a side must meet walls on the neighbouring side: all 16 layouts. */
function createMazeSpecs(): TileSpec[] {
  const specs: TileSpec[] = [];

  for (let mask = 0; mask < 16; mask++) {
    specs.push({
      top: mask & 1 ? 'wall' : 'open',
      right: mask & 2 ? 'wall' : 'open',
      bottom: mask & 4 ? 'wall' : 'open',
      left: mask & 8 ? 'wall' : 'open',
    });
  }

  return specs;
}

const QUILT_COLORS: TileEdge[] = ['color-a', 'color-b', 'color-c'];

/** Each layout assigns the two colours to the four sides, a through b. */
const QUILT_LAYOUTS: ((a: TileEdge, b: TileEdge) => TileSpec)[] = [
  (a, b) => ({ top: a, right: a, bottom: b, left: b }),
  (a, b) => ({ top: a, right: b, bottom: a, left: b }),
  (a, b) => ({ top: a, right: b, bottom: b, left: a }),
  (a, b) => ({ top: a, right: a, bottom: a, left: b }),
];

/**
 * Three solid tiles plus every ordered colour pair in four layouts. Ordered
 * pairs keep mirrored layouts in the set, which is what lets the patchwork turn
 * corners instead of only drifting one way.
 */
function createQuiltSpecs(): TileSpec[] {
  const specs: TileSpec[] = QUILT_COLORS.map((color) => ({
    top: color,
    right: color,
    bottom: color,
    left: color,
  }));

  for (const a of QUILT_COLORS) {
    for (const b of QUILT_COLORS) {
      if (a === b) continue;
      for (const layout of QUILT_LAYOUTS) specs.push(layout(a, b));
    }
  }

  return specs;
}

const TERRAINS: TileEdge[] = ['land', 'beach', 'water'];

function terrainStep(a: TileEdge, b: TileEdge): number {
  return Math.abs(TERRAINS.indexOf(a) - TERRAINS.indexOf(b));
}

/**
 * Every assignment of terrains to sides that could occur on a coastline: land
 * may only touch beach, and beach may only touch water, so a side that changes
 * from one terrain to the next around the tile moves at most one step.
 */
function createTerrainSpecs(): TileSpec[] {
  const specs: TileSpec[] = [];

  for (const top of TERRAINS) {
    for (const right of TERRAINS) {
      for (const bottom of TERRAINS) {
        for (const left of TERRAINS) {
          const sides = [top, right, bottom, left];
          const isCoastal = sides.every(
            (edge, index) => terrainStep(edge, sides[(index + 1) % sides.length]) <= 1
          );

          if (isCoastal) specs.push({ top, right, bottom, left });
        }
      }
    }
  }

  return specs;
}

export const DEFAULT_TILE_SET_ID: TileSetId = 'wires';

export const tileSets: TileSet[] = [
  {
    id: 'wires',
    name: 'Wires',
    description: 'Circuit traces in ink that branch, bend and cross.',
    tiles: createTiles(WIRES_SPECS),
  },
  {
    id: 'pcb',
    name: 'PCB',
    description: 'Green board: copper traces, terminal pads and microcontroller packages.',
    tiles: createTiles(createPcbSpecs()),
  },
  {
    id: 'maze',
    name: 'Maze',
    description: 'Walled corridors that link up into rooms and passages.',
    tiles: createTiles(createMazeSpecs()),
  },
  {
    id: 'quilt',
    name: 'Quilt',
    description: 'Colour-blocked corners sewn into a patchwork.',
    tiles: createTiles(createQuiltSpecs()),
  },
  {
    id: 'terrain',
    name: 'Terrain',
    description: 'Land, beach and water, meeting only where they should.',
    tiles: createTiles(createTerrainSpecs()),
  },
];

export function getTileSet(id: TileSetId): TileSet {
  return tileSets.find((set) => set.id === id) ?? tileSets[0];
}
