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
 * @param tiles - Tile definitions of the active set (rules + art labels)
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

A tile is declared as the edge label on each of its four sides. `createTiles` derives the compatibility lists from those labels, so the rules are always symmetric and closed:

```typescript
// The declared tile: what is on each edge
{ top: 'wire', right: 'open', bottom: 'wire', left: 'wire' }

// Derived: tiles that may sit above are those with `wire` on their bottom
top: [2, 3, 4, 5, 9, 10];
```

```typescript
interface Tile {
  id: number;
  top: ReadonlyArray<number>; // Compatible tiles above this one
  right: ReadonlyArray<number>;
  bottom: ReadonlyArray<number>;
  left: ReadonlyArray<number>;
  edges: TileEdges; // Source labels the lists were derived from
}
```

**Example tile (wire set, ID = 0):**

```typescript
{
  id: 0,
  top:     [0, 1, 6, 7, 8],    // Can connect to tiles {0,1,6,7,8} above
  right:   [0, 2, 5, 8, 9],
  bottom:  [0, 3, 6, 9, 10],
  left:    [0, 4, 5, 7, 10],   // Can connect to tiles {0,4,5,7,10} on the left
  edges:   { top: 'open', right: 'open', bottom: 'open', left: 'open' }
}
```

The five bundled sets — `wires` (11 tiles), `pcb` (45), `maze` (16), `quilt` (27) and `terrain` (35) — live in `src/lib/tileSets.ts` as `tileSets`, with `getTileSet(id)` and `DEFAULT_TILE_SET_ID` (`'wires'`) alongside them.

`pcb` draws green copper traces on soldermask. Corners come in a rounded bend and a straight 45° run, straights in a true line and a 45° jog, tees meet at a via, and terminals end in a silver pad — silver appears only in those round pads. Most of its remaining tiles build microcontrollers: each of `PCB_CHIP_SHAPES` (a 3 × 3 square and a 5 × 3 rectangle) is generated as one part per cell, joined by unique `chip:<package>:<cell>|<cell>` seam labels so a package can only come out assembled, with pin legs drawn in the clearance around every board-facing edge and a die on the centre part. Those parts are **weighted down** (`weight`), because a package costs nine or fifteen cells and would otherwise carpet the board.

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
 * Picks one of the given tile ids, honouring each tile's weight (default 1).
 * Keeps rare structures — such as a multi-tile chip package — sparse without
 * touching any of the rules.
 */
function pickWeightedTile(options: number[], tiles: Tile[]): number;
```

Used both for the seed tiles in `generateInitialGrid` and for every collapse in
`collapseGrid`, so a set without weights behaves exactly as before.

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
  /** Label on each side; the adjacency lists above are derived from these */
  edges: TileEdges;
  /** Art variant (diagonal, jog, terminal, chip, chip-body); ignored by the solver */
  art?: 'diagonal' | 'jog' | 'terminal' | 'chip' | 'chip-body';
  /** Relative chance of being collapsed into, default 1 */
  weight?: number;
}

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

/**
 * Seams inside a multi-tile chip package, named after the package and the two
 * cells they join (e.g. `chip:wide:1x1|2x1`). Exactly two parts can meet across
 * one, which is what keeps a package from assembling half-built.
 */
export type ChipSeam = `chip:${string}`;

export type TileEdges = {
  top: TileEdge;
  right: TileEdge;
  bottom: TileEdge;
  left: TileEdge;
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
