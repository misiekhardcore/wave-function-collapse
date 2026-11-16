# WFC Library — Complete API Reference

> **Table of Contents**
>
> - [Core Algorithm Modules](#core-algorithm-modules)
> - [Utility Functions](#utility-functions)
> - [Data Types & Interfaces](#data-types--interfaces)

---

## Core Algorithm Modules

### `collapseGrid`

The heart of the WFC algorithm — performs one iteration step.

```typescript
/**
 * Performs a single collapse iteration on the grid using the MRV heuristic.
 *
 * @param grid - Current state of all tiles with their options and collapsed status
 * @param cols - Number of columns in the grid (used for neighbor calculations)
 * @param tiles - Tile definitions of the active set (sockets and derived neighbours)
 * @param bias - How the set's weights are spread across cells; constant by default
 * @returns Updated tile states after one collapse step, or early termination if stuck
 */
export function collapseGrid(
  grid: TileObject[],
  cols: number,
  tiles: Tile[],
  bias?: Bias
): TileObject[];
```

**Algorithm Flow:**

1. **Calculate Options**: Propagate constraints from collapsed tiles → all neighbors get updated compatible options only
2. **Find MRV Candidates**: Identify tiles with minimum remaining valid options (Minimum Remaining Values heuristic)
3. **Select Randomly**: Pick one candidate randomly among those tied for minimum
4. **Collapse Selected Tile**: Mark as resolved and assign single option value to it
5. **Early Termination Returns** if no candidates found (grid stuck in local optimum or solved)

---

### `generateInitialGrid`

Creates the initial state with seed tiles already fixed.

```typescript
/**
 * Generates an empty grid and populates N random positions as "seed" tiles.
 * Seed tiles are immediately collapsed to a single option, starting constraint propagation.
 *
 * @param countOfInitialTiles - Number of randomly placed seed tiles (typically 8-15)
 * @param cols - Grid width in columns
 * @param rows - Grid height in rows
 * @param tiles - Tile definitions of the active set; its length bounds the options
 * @param bias - How the set's weights are spread across cells; constant by default
 * @returns Complete grid state with initialized seeds and empty cells ready for solving
 */
export function generateInitialGrid(
  countOfInitialTiles: number,
  cols: number,
  rows: number,
  tiles: Tile[],
  bias?: Bias
): TileObject[];
```

**Key Details:**

- Seeds placed at unique random positions (no duplicates)
- Each seed gets a randomly chosen valid tile from the full set
- Immediately collapsed to that single option value
- Returns grid ready for `collapseGrid()` iteration loop

---

### Tile Compatibility Rules

A tile declares four edge sockets, written north, east, south and west and read clockwise around the tile. Two edges connect when one is the reverse of the other, so the neighbour pairs are derived, not listed: `w` meets `w`, `lw` meets `wl`, and nothing else meets either.

```typescript
// One tile of a coast set: land to the north, water to the south, and two
// shore edges running between them.
{
  image: 'tiles/shore.png',
  sockets: ['l', 'lw', 'w', 'wl'],
  weight: 2,
  rotate: [0, 90, 180, 270],
}
```

```typescript
interface Tile {
  id: number;
  name: string; // The key the tile is written under
  image: string; // PNG under public
  rotation: number; // Degrees clockwise applied when drawn
  flipped: boolean; // Mirrored before it is rotated
  sockets: Sockets; // North, east, south, west after the variant's transform
  weight: number; // The tile's weight, split across its variants
  top: ReadonlyArray<number>; // Derived neighbours, one list per side
  right: ReadonlyArray<number>;
  bottom: ReadonlyArray<number>;
  left: ReadonlyArray<number>;
  pairWeights: Record<Side, Record<number, number>>; // Multiplier per pair
}
```

**Example tile (wire set, ID = 1):**

```typescript
{
  id: 1,
  name: 'w-w-o-w',
  sockets: ['w', 'w', 'o', 'w'],
  top:     [2, 3, 4, 5, 9, 10], // Every tile carrying `w` on its bottom
  right:   [1, 3, 4, 6, 7, 10],
  bottom:  [0, 3, 6, 9, 10],
  left:    [1, 2, 3, 6, 8, 9],
}
```

### Tile set definitions

The five bundled sets — `wires` (11 tiles), `pcb` (45), `maze` (16), `quilt` (27) and `terrain` (68) — are data, not code. Each one is a JSON file in `src/tileSets/`, validated with the zod schema in `src/lib/tileSetSchema.ts`:

```json
{
  "version": 1,
  "name": "coast",
  "connections": [["w", "l", 0.3]],
  "tiles": {
    "water": { "image": "tiles/water.png", "sockets": ["w", "w", "w", "w"], "weight": 4 },
    "land": { "image": "tiles/land.png", "sockets": ["l", "l", "l", "l"], "weight": 5 },
    "shore": {
      "image": "tiles/shore.png",
      "sockets": ["l", "lw", "w", "wl"],
      "rotate": [0, 90, 180, 270],
      "weight": 2
    }
  }
}
```

| Field         | Meaning                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `version`     | Must be `1`.                                                                                                                   |
| `id`          | Optional; defaults to the slug of `name`.                                                                                      |
| `bias`        | `constant` (default) or `noise`, which multiplies each weight at a cell by a factor between 0.5 and 1.5 derived from the cell. |
| `connections` | `[socketA, socketB, weight]` for pairs the sockets do not imply, to reweigh automatic ones, or `0` to forbid one.              |
| `tiles`       | A map from tile name to its definition.                                                                                        |

A tile has an `image` under `public`, four `sockets`, a `weight`, the `rotate` angles it should be instantiated at, and an optional `flip` that adds a mirrored variant at each of them. A tile's weight is split evenly across its variants, and variants whose sockets come out identical are merged, so a symmetric four-way tile is not four times as common as a fixed one.

At a cell, a tile weighs its weight times the **mean** of the pair multipliers already settled around it, and the mean over all its pairs where nothing is settled. Averaging rather than multiplying keeps a multiplier meaningful on its own: four decided neighbours weigh a tile what one says, not that number to the fourth power.

Validation is part of loading, so a typo fails loudly instead of leaving a hole in a pattern: a set is rejected for an unknown version or field, a socket that is empty or holds a space, anything but four sockets, a weight that is not positive, a rotation that is not a quarter turn or is listed twice, a connection naming a socket no tile carries, the same connection twice, a weight of `0` on a pair the sockets would not allow anyway, and a tile with a socket nothing can meet. `src/lib/tileSets.ts` loads the files, expands the variants, derives the neighbour lists and exposes `tileSets`, `getTileSet(id)` and `DEFAULT_TILE_SET_ID` (`'wires'`).

`wires`, `maze`, `quilt` and `terrain` use one-letter sockets and no connections: `o`/`w` for open and wire, `o`/`w` for open and wall, `a`/`b`/`c` for the quilt colours, and `l`/`b`/`w` for land, beach and water. A socket carried by exactly two tiles, on opposite sides, is a **seam**; `pcb` adds `g` for a green trace and one `sN` socket per package edge, tied by a `connections` entry, so the microcontrollers can only assemble from the right parts.

`pcb` draws green copper traces on soldermask, with a 3 × 3 square and a 5 × 3 rectangular microcontroller built one part per cell. Those parts weigh 0.2 or 0.3, because a package costs nine or fifteen cells and would otherwise carpet the board.

`terrain` describes **68** assignments of `land`, `beach` and `water` to its four sides: all 81 layouts except the 13 that read as a single thin band of one ground through the middle of the tile (sand with water on both sides, a grass strip between sand, and so on). Weighting decides the look, not the rules: solid land (140) and water (100) outrank sand, so land and sea grow into regions instead of scattering one-cell ponds; a tile that is mostly sand on three sides (3) is the shore band, and a coast with no sand at all — land and water only (1), or all three grounds in one tile (0.2) — is rare, so sand reads as a beach rather than as filler.

Tile images are addressed through `getTileArtSrc(tile)` in `src/lib/tileArt.ts`, which resolves the tile's `image` against `public` and appends `?v=TILE_ART_VERSION`. The renderer applies the variant's rotation and mirror when it draws, so one PNG serves every angle of a tile. Bump that constant when you replace a PNG in place, or browsers, the Next image optimiser and any CDN keep serving the previous bitmap.

---

## Utility Functions

### `calculateOptions` (internal)

```typescript
/**
 * Propagates constraints through the entire grid. Updates all non-collapsed
 * tiles with only their compatible options based on fixed neighbors.
 */
function calculateOptions(grid: TileObject[], cols: number, tiles: Tile[]): TileObject[];
```

---

### `findTilesIndicesWithLeastOptions` (internal)

```typescript
/**
 * Implements MRV heuristic — identifies tiles with the minimum remaining
 * valid options. These are statistically most likely to resolve quickly.
 */
function findTilesIndicesWithLeastOptions(grid: TileObject[], cols?: number): ReadonlyArray<number>;
```

---

### `pickRandomArrayElement` (internal)

```typescript
/**
 * Selects and removes a random element from array, returning its index.
 */
function pickRandomArrayElement<T>(array: T[]): {
  item?: T;
  removedIndex: number;
};
```

---

### `pickWeightedTile` (internal)

```typescript
/**
 * Picks one of the given tile ids, honouring the tile's weight and the
 * multiplier of the pair it would make with each settled neighbour.
 */
function pickWeightedTile(
  options: number[],
  tiles: Tile[],
  context?: { index: number; grid: TileObject[]; cols: number; bias: Bias }
): number;
```

Used both for the seed tiles in `generateInitialGrid` and for every collapse in
`collapseGrid`, which pass the cell so a tile is weighed by its settled
neighbours and by the bias at that cell. Without a context the tile's average
pair decides and no bias applies.

---

### `getTileWeight` (internal)

```typescript
/**
 * The weight a tile carries at one cell: the tile's own weight times the mean of
 * the pair multipliers settled around it, or the mean over all its pairs when
 * nothing is. An open side, or a side at the edge of the board, does not count.
 */
function getTileWeight(tile: Tile, index: number, grid: TileObject[], cols: number): number;
function getAverageWeight(tile: Tile): number;
```

---

### `canPlaceTile` (internal)

```typescript
/**
 * True when the tile can be placed at the index without splitting a package.
 * Every cell the package would occupy must still be open, must still accept its
 * part, and the package must sit inside the board.
 */
function canPlaceTile(
  tileId: number,
  index: number,
  grid: TileObject[],
  cols: number,
  tiles: Tile[]
): boolean;
```

A _package_ is any group of tiles glued by seam sockets — a socket carried by
exactly two tiles, on opposite sides. The PCB microcontrollers are 3 × 3 or
5 × 3 parts joined by one seam per interior edge, so a package is placed whole
or not at all; one that would run off the board or overlap a decided cell is
never chosen.

---

## Data Types & Interfaces

### `Tile` (src/types.ts)

```typescript
export type Side = 'top' | 'right' | 'bottom' | 'left';

/** The four edges of a tile, north, east, south and west. */
export type Sockets = [string, string, string, string];

export interface Tile {
  /** Position in the expanded set; variants get their own ids */
  id: number;
  /** The key the tile is written under */
  name: string;
  /** PNG under public */
  image: string;
  /** Degrees clockwise applied when the image is drawn */
  rotation: number;
  /** True when the image is mirrored before it is rotated */
  flipped: boolean;
  /** Edges after the variant's rotation and mirroring */
  sockets: Sockets;
  /** The tile's weight, split evenly across its variants */
  weight: number;
  /** Derived neighbours, one list per side */
  top: ReadonlyArray<number>;
  right: ReadonlyArray<number>;
  bottom: ReadonlyArray<number>;
  left: ReadonlyArray<number>;
  /** Multiplier on the tile's weight per pair: side, then the tile on that side */
  pairWeights: Record<Side, Record<number, number>>;
}
```

### `TileSet` (src/types.ts)

```typescript
/** A set's id; any string, so a new file needs no type change. */
export type TileSetId = string;

/** How the set's weights are spread across the board. */
export type Bias = 'constant' | 'noise';

export type TileSet = {
  id: TileSetId;
  name: string;
  description: string;
  bias: Bias;
  tiles: Tile[];
};
```

### `TileObject` — Runtime State for Individual Cell

```typescript
export interface TileObject {
  col: number; // Column position [0, cols)
  row: number; // Row position [0, rows)
  options: ReadonlyArray<number>; // Possible tile IDs still valid here (shrinks as constraints propagate)
  collapsed: boolean; // Whether this cell has been resolved to single option
}
```

---

## Usage Examples

### Basic Pattern Generation Loop

```typescript
import { generateInitialGrid, collapseGrid, getTileSet } from '@/lib';

const COLS = 60;
const ROWS = 40;
const SEED_COUNT = 12;
const { tiles } = getTileSet('wires'); // or 'pcb' / 'maze' / 'quilt' / 'terrain'

// Initialize grid with random seed tiles
let currentGrid: TileObject[] = generateInitialGrid(SEED_COUNT, COLS, ROWS, tiles);

currentGrid.forEach((tile) => {
  console.log(`[${tile.row}:${tile.col}] options=${tile.options.length}`);
});

// Iteratively collapse until complete or stuck
while (!currentGrid.every((t) => t.collapsed)) {
  currentGrid = collapseGrid(currentGrid, COLS, tiles);
}
```

### Real-Time Visualization Mode (Current Page Implementation)

```typescript
setInterval(() => {
  setGrid((grid) => {
    const nextGrid: TileObject[] = [...grid]; // Shallow copy to preserve immutability in tests
    try {
      nextGrid = collapseGrid(nextGrid, cols, tiles);

      if (nextGrid.every((tile) => tile.collapsed)) {
        setInProgress(false); // Pattern complete!
        return nextGrid;
      }

      return nextGrid.slice();
    } catch (_error) {
      console.error('Algorithm stuck or error:', _error);
      setInProgress(false);
      return grid; // Return unchanged to prevent infinite loop
    }
  });
}, RATE_MS); // ~50ms = smooth animation at ~20 FPS
```

---

## Performance Considerations

### Memory Layout Optimizations

- Grid stored as **single-dimensional array** → better cache locality, simpler indexing:

  ```typescript
  const tileAtRowCol: TileObject[];
  // Row-major ordering for efficient neighbor access patterns

  const rightNeighbor = grid[tileIndex + 1];
  const leftNeighbor = grid[tileIndex - 1];
  const bottomNeighbor = grid[tileIndex + cols];
  ```

### Time Complexity Analysis

| Operation                   | Per Iteration                                  | Total (N tiles) |
| --------------------------- | ---------------------------------------------- | --------------- |
| Calculate Options           | O(N × tileCompatibilityAvg)                    | —               |
| Find MRV Candidates         | O(N)                                           | —               |
| Collapse Selection + Update | O(1) amortized with optimized array operations | N               |

---

## Testing Guidelines

### Unit Tests (Jest)

All algorithm functions should be tested using **pure function** testing patterns:

```typescript
// ✅ Good: Pure, testable isolation
function collapseGrid(grid, cols, tiles): TileObject[] {
  // No side effects — only reads input state
}
describe('collapseGrid', () => {
  it('correctly resolves a tile with single option remaining', () => {
    const grid = [
      {
        col: 0,
        row: 0,
        options: [5], // Already resolved to tile ID 5
        collapsed: false,
      },
    ];

    expect(collapseGrid(grid, 10)).toEqual([...grid]); // No-op as expected
  });
});
```

### Visual Regression Tests (Canvas)

Snapshot tests verify rendering correctness:

```bash
pnpm test --update-snapshots   # Update visual snapshots after layout changes
pnpm test                      # Compare current renders against stored images
```

---

## Future API Extensions (Planned)

- `collapseGridWithCallback(grid, cols): Generator<TileObject[]>` — yield each step for animation control
- `solveOptimalPathfinding(): Tile[] → boolean` — WFC with path constraints between points A and B
- `getSeedForResult(resultState: Grid)`: string — reproducible seed generation from solved state
