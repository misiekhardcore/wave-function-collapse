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
 * @param tiles - Tile definitions of the active set (side labels + weights)
 * @returns Updated tile states after one collapse step, or early termination if stuck
 */
export function collapseGrid(grid: TileObject[], cols: number, tiles: Tile[]): TileObject[];
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
 * @returns Complete grid state with initialized seeds and empty cells ready for solving
 */
export function generateInitialGrid(
  countOfInitialTiles: number,
  cols: number,
  rows: number,
  tiles: Tile[]
): TileObject[];
```

**Key Details:**

- Seeds placed at unique random positions (no duplicates)
- Each seed gets a randomly chosen valid tile from the full set
- Immediately collapsed to that single option value
- Returns grid ready for `collapseGrid()` iteration loop

---

### Tile Compatibility Rules

A tile declares, on each of its four sides, the tiles that may sit there. Nothing is inferred from anything else: `createTiles` copies those lists onto the tile, and the solver reads only them.

```typescript
// The written tile: what may sit on each side, and the labels the art uses
{
  top: 'wire', right: 'wire', bottom: 'open', left: 'wire',
  neighbours: {
    top:    [2, 3, 4, 5, 9, 10], // tiles carrying `wire` along their bottom
    right:  [1, 3, 4, 6, 7, 10],
    bottom: [0, 3, 6, 9, 10],
    left:   [1, 2, 3, 6, 8, 9]
  }
}
```

```typescript
interface Tile {
  id: number;
  top: ReadonlyArray<number>; // Neighbours written for this side
  right: ReadonlyArray<number>;
  bottom: ReadonlyArray<number>;
  left: ReadonlyArray<number>;
  edges: TileEdges; // Labels the artwork is drawn from
  weight?: number; // Prior chance of being picked, default 1
  pairWeights?: Partial<Record<keyof TileEdges, Record<number, number>>>; // Per pair
}
```

**Example tile (wire set, ID = 1):**

```typescript
{
  id: 1,
  top:     [2, 3, 4, 5, 9, 10], // Can connect to tiles {2,3,4,5,9,10} above
  right:   [1, 3, 4, 6, 7, 10],
  bottom:  [0, 3, 6, 9, 10],
  left:    [1, 2, 3, 6, 8, 9],  // Can connect to tiles {1,2,3,6,8,9} on the left
  edges:   { top: 'wire', right: 'wire', bottom: 'open', left: 'wire' }
}
```

### Tile set definitions

The five bundled sets — `wires` (11 tiles), `pcb` (45), `maze` (16), `quilt` (27) and `terrain` (68) — are data, not code. Each one is a JSON file in `src/tileSets/`:

````json
{
  "id": "wires",
  "name": "Wires",
  "description": "Circuit traces in ink that branch, bend and cross.",
  "tiles": [
    {
      "top": "open",
      "right": "open",
      "bottom": "open",
      "left": "open",
      "neighbours": {
        "top": [0, 1, 6, 7, 8],
        "right": [0, 2, 5, 8, 9],
        "bottom": [0, 3, 6, 9, 10],
        "left": [0, 4, 5, 7, 10]
      }
    }
  ]
}
```A tile is its four labels, its four neighbour lists and two optional weights. A side is either a list of ids — every pair weighed alike — or a map from id to that pair's weight:

```json
{ "top": "land", "right": "beach", "bottom": "land", "left": "land",
  "weight": 1.5,
  "neighbours": {
    "top": [7, 9],
    "right": { "12": 0.25, "31": 3 },
    "bottom": [3, 5],
    "left": [0, 4]
  } }
````

That right side makes the tile a quarter as likely when tile 12 is on its right and three times as likely when tile 31 is, even if those two carry the same right-hand label; the lists all weigh one. `weight` is the prior — how common the tile is anywhere — and a pair weight multiplies it once that neighbour is decided. A pair left at 1, a side whose neighbour is still open, or a tile with no pair weights at all leaves the prior alone.

The labels are what the artwork is drawn from, so a set cannot describe a picture its rules contradict: the loader rejects a pair whose labels disagree. It also rejects a side that is missing or names a tile outside the set, an id listed twice, a weight that is not positive, and a pair only one of the two tiles names. The tile's array position is its id. `src/lib/tileSets.ts` loads the files, validates them, and exposes `tileSets`, `getTileSet(id)` and `DEFAULT_TILE_SET_ID` (`'wires'`).

`pcb` draws green copper traces on soldermask. A corner bends through the centre, a straight holds its line, three or more traces meet at a via, and a tile with a single trace ends in a silver pad — silver appears only in those round pads. Every one of those looks is read from the labels: one trace side makes a terminal, so no flag is needed. Most of the remaining tiles build microcontrollers: a 3 × 3 square and a 5 × 3 rectangle, one part per cell, joined by unique `chip:<package>:<cell>|<cell>` seam labels so a package can only come out assembled, with pin legs drawn in the clearance around every board-facing edge and a die on the part standing on the middle cell of its package. Those parts are **weighted down** (`weight`), because a package costs nine or fifteen cells and would otherwise carpet the board.

`terrain` describes **68** assignments of `land`, `beach` and `water` to its four sides: all 81 layouts except the 13 that paint as a single thin band of one ground through the middle of the tile (sand with water on both sides, a grass strip between sand, and so on), which read as seams rather than terrain. Weighting decides the look, not the rules: solid land (140) and water (100) outrank sand, so land and sea grow into regions instead of scattering one-cell ponds; a tile that is mostly sand on three sides (3) is the shore band, and a coast with no sand at all — land and water only (1), or all three grounds in one tile (0.2) — is rare, so sand reads as a beach rather than as filler. Each tile is painted as a block: the ground most of its sides carry, with a band of another ground along every side that disagrees, so a coastline runs along the tile edges and turns at right angles rather than cutting across a tile diagonally.

Tile art is addressed through `getTileArtSrc(setId, tileId)` in `src/lib/tileArt.ts`, which appends `?v=TILE_ART_VERSION` to the PNG path. The file names are stable across regenerations, so after `pnpm tiles` changes the art, bump that constant: otherwise browsers, the Next image optimiser and any CDN keep serving the previous bitmaps, and one pattern ends up mixing old and new tiles.

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
 * Picks one of the given tile ids, honouring each tile's weight (default 1)
 * and, when the cell is known, its per-neighbour-pair weights.
 */
function pickWeightedTile(
  options: number[],
  tiles: Tile[],
  context?: { index: number; grid: TileObject[]; cols: number }
): number;
```

Used both for the seed tiles in `generateInitialGrid` and for every collapse in
`collapseGrid`, which pass the cell so a tile's pair weights apply against the
neighbours already decided there. Without a context only the priors count, so a
set without weights behaves exactly as before.

---

### `getTileWeight` (internal)

```typescript
/**
 * The weight a tile carries at one cell: its prior, multiplied by the weight of
 * every neighbour pair already decided around it. A pair the tile says nothing
 * about, or a side whose neighbour is still open, leaves the prior alone.
 */
function getTileWeight(tile: Tile, index: number, grid: TileObject[], cols: number): number;
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

A _package_ is any group of tiles glued by seam labels — an edge label carried
by exactly two tiles, on opposite sides. The PCB microcontrollers are 3 × 3 or
5 × 3 parts joined by one seam per interior edge, so a package is placed whole
or not at all; one that would run off the board or overlap a decided cell is
never chosen.

---

## Data Types & Interfaces

### `Tile` (src/types.ts)

```typescript
export interface Tile {
  /** Unique identifier for the tile type */
  id: number;
  /** Indices of compatible tiles that can be placed above this one's top edge */
  top: ReadonlyArray<number>;
  /** Compatible neighbors on the right side (tile to its east) */
  right: ReadonlyArray<number>;
  /** Compatible neighbors below this tile's bottom edge */
  bottom: ReadonlyArray<number>;
  /** Indices of tiles that can be placed to the left (west) of this one */
  left: ReadonlyArray<number>;
  /** Label on each side; what the art is drawn from */
  edges: TileEdges;
  /** Relative chance of being collapsed into, default 1 */
  weight?: number;
  /** Weight of one neighbour pair: side, then the id of the tile on that side */
  pairWeights?: Partial<Record<keyof TileEdges, Record<number, number>>>;
}

/** A written set, as loaded from `src/tileSets/<id>.json` before it is built. */
export type TileSpec = TileEdges & {
  /** Per side: neighbour ids, or the weight of each of them */
  neighbours: Record<keyof TileEdges, number[] | Record<number, number>>;
  weight?: number;
};

/**
 * A side label. Two sides may meet only when their labels are identical, so a
 * label names a whole class of neighbour pairs; seams inside a multi-tile chip
 * package are labels too (`chip:<package>:<cell>|<cell>`), carried by exactly
 * two parts on opposite sides.
 */
export type TileEdges = {
  top: string;
  right: string;
  bottom: string;
  left: string;
};
```

### `TileSet` (src/types.ts)

```typescript
export type TileSetId = 'wires' | 'pcb' | 'maze' | 'quilt' | 'terrain';

export type TileSet = {
  id: TileSetId;
  name: string;
  description: string;
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
