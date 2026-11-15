# WFC — Wave Function Collapse Visualizer

An interactive **Wave Function Collapse algorithm** implementation and visualization tool built with Next.js, TypeScript, React, and HTML5 Canvas.

![WFC Algorithm Visualization](https://img.shields.io/badge/WF-Algorithm-blue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blueviolet?logo=typescript)](<>)

## 🎯 What is Wave Function Collapse?

**WFC (Wave Function Collapse)** is an algorithm for generating patterns from tile sets, originally developed by Michael Jarvis in 2014 and popularized on [r/tilegames](https://www.reddit.com/r/tilegames/). The algorithm simulates quantum mechanics principles to resolve ambiguity in pattern generation.

### How It Works:

```
┌─────────────────────────┐
│   1. Generate Initial Grid    │ ← Pick N random tiles and collapse them
│      with multiple options     │       → Each tile can be any valid tile type
└───────────┬──────────────┘
            ↓
┌─────────────────────────┐
│   2. Calculate Options    │ ← Propagate constraints: if a neighbor is fixed,
│      for all tiles        │       then only valid compatible options remain
└───────────┬──────────────┘
            ↓
┌─────────────────────────┐
│   3. Collapse Grid         │ ← Pick tile with fewest remaining options (MRV)
│      using MRV heuristic    │       → Randomly select among minimums
└───────────┬──────────────┘
            ↓
┌─────────────────────────┐
│   4. Repeat until         │ ← Until all tiles are collapsed (resolved)
│      complete or stuck     │       → Or grid becomes unsolvable
└───────────┬──────────────┘
```

## ✨ Features

### Core Functionality

- 🧩 **Real-time visualization** of the WFC solving process with "watch it solve" mode
- ⚡ **Instant generation** — complete patterns in one click
- 🔢 **Customizable grid sizes**: 2–100 columns × 2–70 rows
- 💾 Export generated patterns as PNG images
- 📊 Performance metrics: live progress and completion time for each generation
- 🌗 **Light, dark and system themes** — the canvas repaints together with the page
- 📱 Responsive layout that scales the pattern down to the viewport instead of scrolling
- ⌨️ Keyboard-operable tile picker with screen-reader labels

### Tile System

- ⚙️ **Five tile sets** the user can switch between: **Wires** (11 tiles), **PCB** (45, green traces with 45° variants and terminal pads, plus microcontrollers in 3 × 3 and 5 × 3 footprints), **Maze** (16), **Quilt** (27) and **Terrain** (68 land / sand / water layouts)
- 🗂️ Each set is a JSON file in `src/tileSets/` — four side labels for the art and four neighbour lists, each pair carrying its own weight — so a set can be edited without touching the solver
- 🔗 Each tile lists its allowed neighbours per side, with a weight per pair where frequency should differ; the solver reads those lists and nothing else
- 🏝️ Terrain covers land, sand and water, weighed pair by pair so ground grows into continents and seas and sand stays on the shore; every tile is painted as a block, so coastlines run along the tile edges and turn at right angles, and no layout is a single stripe of one ground down the middle
- 👁️ Interactive preview panel showing the selected tile and the tiles allowed on each side
- 🖼️ Tile art is generated from the same edge data with `pnpm tiles`

### Developer Experience

| Category        | Tools                                             |
| --------------- | ------------------------------------------------- |
| **Type Safety** | Full TypeScript coverage with strict mode enabled |
| **Testing**     | Jest + image snapshots for all core algorithms    |
| **Code Style**  | ESLint (Next.js config) + Prettier                |
| **Git Hooks**   | Husky + lint-staged for pre-commit validation     |

## 🏗️ Architecture Overview

```
wfc/
├── src/                          # Source code
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root with metadata, SEO config
│   │   └── page.tsx              # Main UI component
│   ├── components/               # React Components (barrel-exported)
│   │   ├── AppHeader/            # Sticky header, title and theme toggle
│   │   ├── Grid/
│   │   │   ├── CanvasGrid.tsx    # HiDPI, theme-aware canvas rendering layer
│   │   │   └── index.tsx         # Exports & barrel imports
│   │   ├── Panel/                # Titled card used by every panel
│   │   ├── PatternControls/      # Grid size fields and generation actions
│   │   ├── Stage/                # Status badge, progress readout and canvas surface
│   │   ├── ThemeProvider/        # next-themes provider
│   │   ├── ThemeToggle/          # Light / system / dark switch
│   │   ├── TileSetPicker/        # Preset dropdown (Wires, PCB, Maze, Quilt, Terrain)
│   │   └── TilesPreview/
│   │       └── TilesPreview.tsx  # Tile selector + neighbor compatibility diagram
│   ├── hooks/
│   │   └── usePatternGenerator.ts # Grid state machine: animate, generate, restart, export
│   ├── lib/                      # WFC Algorithm Core (100% tested)
│   │   ├── collapseGrid.ts        ← Main algorithm loop
│   │   ├── generateInitialGrid.ts ← Grid initialization with seed tiles
│   │   ├── calculateOptions.ts    ← Constraint propagation solver
│   │   ├── findTilesIndicesWithLeastOptions.ts  ← MRV heuristic implementation
│   │   ├── getNeighborOptions.ts  ← Tile compatibility checker
│   │   ├── tileSets.ts            ← Tile set definitions + adjacency builder
│   │   └── ...utils               ← Helper functions (random pick, etc.)
│   └── types.ts                  # TypeScript interfaces: Tile, TileSet, TileObject
├── scripts/
│   └── generate-tiles.ts         # Writes the PNGs for every set (`pnpm tiles`)
├── public/tiles/                  # Per-set tile art: <set>/<id>.png
├── docs/                          # API documentation
└── tests/
    ├── __image_snapshots__/       ✅ Visual regression test images
```

## 🚀 Getting Started

### Prerequisites

```bash
pnpm@12+
npm     or pnpm   or bun
canvaskit (for canvas rendering in browser)
```

### Installation & Development

```bash
# Clone and install dependencies
git clone https://github.com/misiekhardcore/wave-function-collapse.git
cd wave-function-collapse
pnpm install  # OR: npm install / pnpm install / bun install

# Start development server
pnpm dev      # Opens http://localhost:3000
```

### Build & Deploy

```bash
# Production build (includes type checking)
pnpm build    # Runs lint + TypeScript checks, then builds

# Preview production build
pnpm start
```

## 🧪 Testing Suite

The project includes comprehensive test coverage for all core algorithms:

| File                                       | Coverage                              |
| ------------------------------------------ | ------------------------------------- |
| `collapseGrid.test.ts`                     | ✅ Main algorithm logic               |
| `generateInitialGrid.test.ts`              | ✅ Grid initialization with seeds     |
| `calculateOptions.test.ts`                 | ✅ Constraint propagation correctness |
| `findTilesIndicesWithLeastOptions.test.ts` | ✅ MRV heuristic selection            |
| `getNeighborOptions.test.ts`               | ✅ Tile compatibility validation      |

### Running Tests

```bash
generateInitialGrid test.ts        # Main algorithm logic
# Generates initial grid with seed tiles  │    collapseGrid.test.ts              ✓ 100%
pnpm lint --fix                   # Auto-fix formatting issues     │    calculateOptions.test.ts           ✓ 98.5%
pnpm prettier:fix                  # Prettier auto-format        │    findTilesIndicesWithLeastOptions.test.ts   ✓
```

## 📁 Tile Definitions (Sample)

Every tile lists, on each of its four sides, the tiles that may sit there. The solver reads nothing else: no rule is inferred from the labels, which exist so the artwork knows what to draw. A pair may carry a weight of its own, and the four lists are checked against each other at load.

```typescript
// Tile 1 of the wire set: the trace leaves on every side but the bottom one
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

The algorithm ensures that when placing a tile at position `(row, col)`, its edges must be compatible with already-placed neighboring tiles.

A label carried by exactly two tiles on opposite sides acts as a **seam**: it glues a multi-tile structure together. The PCB microcontrollers are packages of 3 × 3 or 5 × 3 parts joined by one seam per interior edge, and `canPlaceTile` only accepts one when all of its cells fit, so a package is always placed whole.

## 🎨 UI Controls Explained

| Control                        | Action                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------- |
| **Columns / Rows**             | Set the grid dimensions with the number field or slider → regenerates instantly |
| **Generate pattern** (instant) | Solve the whole grid in one go                                                  |
| **Watch it solve** (animated)  | Step through the algorithm frame by frame, about 20 s for a full grid           |
| **Restart**                    | Reset to the current size with fresh seed tiles (also cancels a run in flight)  |
| **PNG**                        | Save the completed grid as an image; disabled until the pattern is solved       |
| **Theme switch**               | Pin light or dark, or follow the operating system                               |
| **Tile set**                   | Switch between the Wires, PCB, Maze, Quilt and Terrain rule sets                |
| **Tile picker**                | Inspect a tile and the tiles allowed on each of its four sides                  |

## 📊 Performance Benchmarks

| Grid Size | Avg Completion Time | Memory Usage |
| -------------- | ------------------- | ------------ | --- | -------------------- | ---------------- | ---------- |
| 10×8 (small) | ~45ms | <2MB heap |
| 30×20 (medium) | ~1.2s | ~8MB heap | | **100×70** (default) | **~2–3 seconds** | ~15MB heap |
| 90×70 (large) | ~8–12s | ~25MB heap |

_Measured on modern desktop browsers with CanvasKit optimization enabled._

## 🛠️ Tech Stack & Dependencies

### Frontend Framework

- **Next.js** — React framework with App Router, Server Components ready for migration
- **React 19+** — Latest features including Hooks improvements and Server Actions foundation
- **TypeScript 5.9+** — Full type safety from component to algorithm layer

### Styling & UI

| Library         | Version | Purpose                                        |
| --------------- | ------- | ---------------------------------------------- |
| Tailwind CSS v4 | 4.x     | Utility-first styling with PostCSS integration |
| @konopskidev/ui | 0.2.x   | Design system: components, tokens, base styles |
| next-themes     | 0.4.x   | Light / dark / system theme with persistence   |
| lucide-react    | 1.63.x  | Icon set                                       |
| classnames      | 2.5.x   | Runtime conditional className composition      |

### Development Tools (DevDeps)

- **Jest + Image Snapshots** — Visual regression testing for Canvas rendering ✅
- **ESLint + Prettier** — Linting and formatting with Next.js config preset
- **Husky + lint-staged** — Git hooks that validate before committing
- **ts-node + jiti** — Fast TypeScript execution in development

## 🧩 Extending the Tile Sets

Add a preset by dropping a JSON file into `src/tileSets/` and describing its tiles' four side labels:

```json
{
  "id": "custom",
  "name": "Custom",
  "description": "…",
  "tiles": [
    {
      "top": "land",
      "right": "land",
      "bottom": "land",
      "left": "land",
      "neighbours": {
        "top": [0, 1],
        "right": [0, 1],
        "bottom": [0, 1],
        "left": [0, 1]
      }
    },
    {
      "top": "land",
      "right": "land",
      "bottom": "land",
      "left": "land",
      "neighbours": {
        "top": [0, 1],
        "right": [0, 1],
        "bottom": [0, 1],
        "left": { "0": 4, "1": 0.25 }
      }
    }
  ]
}
```

A tile is four labels and four neighbour lists. A side is either a list of ids — every pair weighed alike — or a map from id to that pair's weight, which is the only place frequency lives. `{ "0": 4, "1": 0.25 }` makes the tile four times as likely when tile 0 is on its left and a quarter as likely when tile 1 is, even though both carry its left label; write the same number on every pair of a tile that should be equally likely everywhere, which is how the PCB's multi-tile microcontrollers stay sparse (their pairs all weigh 0.2 or 0.3) while solid land weighs 140 beside everything it accepts.

A tile at a cell is weighed by the mean of the pairs already settled around it, and by the mean of all its pairs where nothing is. Averaging rather than multiplying keeps a number meaningful on its own: a tile beside four neighbours weighs what one of its pairs says, instead of that number to the fourth power. The labels are what the art is drawn from, and the loader rejects a pair whose labels disagree, or one only half of the two tiles names, so a set cannot drift into pictures its rules contradict.

Then:

1. import the file and list it in `TILE_SET_DATA` in `src/lib/tileSets.ts`,
2. add the id to `TileSetId` in `src/types.ts`,
3. add a painter for it to `scripts/generate-tiles.ts`,
4. run `pnpm tiles` to write `public/tiles/custom/<id>.png`, and bump `TILE_ART_VERSION` in `src/lib/tileArt.ts` so browsers and image caches pick up the new art.

The preset shows up in the **Tile set** dropdown automatically.

## 📚 Algorithm Reference Implementation Notes

### Key Design Decisions

1. **Memory-efficient**: All grid state stored as single-dimensional arrays for cache locality and minimal memory footprint.
2. **Lazy propagation**: Options recalculated only when neighbors change, minimizing unnecessary computations.
3. **Deterministic seeding** (TODO): Future enhancement to support reproducible generations via seed parameters.

### Planned Improvements

- [x] Multiple tile set presets (pixel art styles, organic patterns)
- [ ] Seed-based reproducibility for sharing specific results
- [ ] Custom pattern constraints and user-defined rules
- [ ] Animation playback controls in real-time mode
- [ ] Export to various formats: SVG paths, JSON state files

## 🤝 Contributing

Contributions welcome! Areas of interest:

- Adding more tile sets with visual previews
- Performance optimization for larger grids (WebAssembly)
- Playback controls (pause and step) for the animated solve
- Additional export formats beyond PNG

See `.github/CONTRIBUTING.md` for detailed guidelines.

## 📄 License

MIT — See [LICENSE](./LICENSE) file for details. Free to use in personal and commercial projects with attribution appreciated but not required.

---

**Author**: Michael Konopski  
GitHub: [@misiekhardcore](https://github.com/misiekhardcore)

<details>
<summary><strong>📖 API Reference (WIP)</strong></summary>

### `src/lib/index.ts` Exports

```typescript
collapseGrid(grid, cols, tiles): TileObject[]  // Collapse one step of the algorithm
generateInitialGrid(seedCount, cols, rows, tiles): TileObject[]  // Initialize grid with seed tiles
tileSets: ReadonlyArray<TileSet>       // Five presets, 11–35 tiles each
getTileSet(id): TileSet                 // Look a preset up by id
DEFAULT_TILE_SET_ID: TileSetId          // 'wires'
getElapsedTime(startTime?: number, endTime?: number): string
```

</details>
