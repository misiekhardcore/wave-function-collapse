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
- 🗂️ Each set is a JSON file in `src/tileSets/` — a PNG per tile and four edge sockets, checked by a zod schema — so a tile is added without touching the solver
- 🔗 Edges connect on their own when one socket is the reverse of the other, so no tile lists its neighbours; a `connections` entry adds a pair the sockets do not imply, reweighs one, or forbids it with a weight of zero
- 🔄 A tile declares the angles it should appear at, and whether it should be mirrored; its weight is split between those variants and the one PNG is turned when it is drawn, so a four-way tile is not four times as common
- 🏝️ Terrain covers land, sand and water, weighed tile by tile so ground grows into continents and seas and sand stays on the shore; coastlines run along the tile edges and turn at right angles, and no layout is a single stripe of one ground down the middle
- 🌫️ A set can bias its weights: `constant` spreads them evenly, `noise` varies them from cell to cell for a patchier pattern
- 👁️ Interactive preview panel showing the selected tile and the tiles allowed on each side
- 🖼️ Tile art is one PNG per tile, read from the tile's `image` and drawn with the variant's rotation and mirror

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
│   │   ├── tileSetSchema.ts       ← zod schema for the JSON sets
│   │   ├── tileSets.ts            ← Loads and validates the sets, builds adjacency
│   │   ├── tileArt.ts             ← Tile image URLs
│   │   ├── bias.ts                ← Per-cell weight bias
│   │   └── ...utils               ← Helper functions (random pick, etc.)
│   └── types.ts                  # TypeScript interfaces: Tile, TileSet, TileObject
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

Every tile is a name, one PNG, and four edge sockets written north, east, south and west. A socket is read clockwise around the tile, so a shore that is land to the north and water to the south has an east edge `lw` and a west edge `wl`.

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

Two edges connect on their own when one is the reverse of the other: `w` meets `w`, and `lw` meets `wl`. Nothing lists its neighbours. `connections` is only for the rest: `["w", "l", 0.3]` makes the abrupt coast three tenths as likely as the sockets would allow, and a weight of `0` forbids a match that would otherwise be automatic. `weight` is the tile's frequency, split evenly across the variants that `rotate` (and `flip`) produce, so a four-way shore is not four times as common as a fixed tile.

The algorithm ensures that when placing a tile at position `(row, col)`, its sockets must agree with already-placed neighboring tiles.

A socket carried by exactly two tiles, on opposite sides, is a **seam**: it glues a multi-tile structure together. The PCB microcontrollers are packages of 3 × 3 or 5 × 3 parts joined by one seam per interior edge, and `canPlaceTile` only accepts one when all of its cells fit, so a package is always placed whole.

## 🎨 UI Controls Explained

| Control                        | Action                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------- |
| **Columns / Rows**             | Set the grid dimensions with the number field or slider → regenerates instantly |
| **Generate pattern** (instant) | Solve the whole grid at once, with the progress readout climbing as it runs     |
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
- **ts-node** — TypeScript execution for tooling

## 🧩 Extending the Tile Sets

Add a preset by dropping a JSON file into `src/tileSets/`. A tile is a name, an image, four sockets and a weight; the rest is optional:

```json
{
  "version": 1,
  "id": "coast",
  "name": "Coast",
  "description": "Land meeting water, with a beach in between.",
  "bias": "constant",
  "connections": [["w", "l", 0.3]],
  "tiles": {
    "water": { "image": "tiles/coast/water.png", "sockets": ["w", "w", "w", "w"], "weight": 4 },
    "land": { "image": "tiles/coast/land.png", "sockets": ["l", "l", "l", "l"], "weight": 5 },
    "shore": {
      "image": "tiles/coast/shore.png",
      "sockets": ["l", "lw", "w", "wl"],
      "rotate": [0, 90, 180, 270],
      "weight": 2
    }
  }
}
```

`version` must be `1`; `bias` is `constant` or `noise`; `rotate` lists quarter turns and `flip` adds a mirrored variant at each of them. Images are paths under `public`, with or without a leading slash. The loader validates a set with [zod](src/lib/tileSetSchema.ts) when it loads, so a typo fails loudly instead of producing a pattern with a hole in it: it rejects a socket no tile can meet, a rotation that is not a quarter turn or is listed twice, a connection to a socket no tile carries, a forbidden pair that could not happen anyway, and a weight that is not positive.

The weights are read as a tile's frequency multiplied by the pair multipliers around it, averaged over the neighbours already settled, so a tile beside four neighbours weighs what one multiplier says instead of that number to the fourth power.

Then:

1. draw one PNG per tile — a variant is that same image turned and mirrored, so one file is enough — and point the tile's `image` at it,
2. import the file and list it in `SET_DATA` in `src/lib/tileSets.ts`. Ids follow the order the tiles are written; the set's `id` defaults to the slug of its name.

If you replace a PNG in place, bump `TILE_ART_VERSION` in `src/lib/tileArt.ts` so browsers and image caches pick up the new art. The preset shows up in the **Tile set** dropdown automatically.

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
collapseGrid(grid, cols, tiles, bias?): TileObject[]  // Collapse one step of the algorithm
generateInitialGrid(seedCount, cols, rows, tiles, bias?): TileObject[]  // Initialize grid with seed tiles
tileSets: ReadonlyArray<TileSet>       // Five presets, 11–68 tiles each
getTileSet(id): TileSet                 // Look a preset up by id
DEFAULT_TILE_SET_ID: TileSetId          // 'wires'
getTileArtSrc(tile): string             // PNG URL, with the art version appended
getElapsedTime(startTime?: number, endTime?: number): string
```

</details>
