# WFC — Wave Function Collapse Visualizer

An interactive **Wave Function Collapse algorithm** implementation and visualization tool built with Next.js, TypeScript, React, and HTML5 Canvas.

![WFC Algorithm Visualization](https://img.shields.io/badge/WF-Algorithm-blue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blueviolet?logo=typescript)]()

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

- ⚙️ **10 unique tile types** with complex neighbor compatibility rules
- 🔗 Each tile defines which tiles can connect on all 4 sides (top, right, bottom, left)
- 👁️ Interactive preview panel showing selected tile and compatible neighbors

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
│   │   ├── TilesPreview/
│   │   │   └── TilesPreview.tsx  # Tile selector + neighbor compatibility diagram
│   │   └── ui/                   # shadcn/ui primitives (button, card, slider, …)
│   ├── hooks/
│   │   └── usePatternGenerator.ts # Grid state machine: animate, generate, restart, export
│   ├── lib/                      # WFC Algorithm Core (100% tested)
│   │   ├── collapseGrid.ts        ← Main algorithm loop
│   │   ├── generateInitialGrid.ts ← Grid initialization with seed tiles
│   │   ├── calculateOptions.ts    ← Constraint propagation solver
│   │   ├── findTilesIndicesWithLeastOptions.ts  ← MRV heuristic implementation
│   │   ├── getNeighborOptions.ts  ← Tile compatibility checker
│   │   └── ...utils               ← Helper functions (random pick, etc.)
│   ├── types.ts                  # TypeScript interfaces: Tile, TileObject
│   └── tiles.ts                  ← 10 tile definitions with connectivity rules
├── docs/                          # API documentation (TODO)
└── tests/
    ├── __image_snapshots__/       ✅ Visual regression test images
```

## 🚀 Getting Started

### Prerequisites

```bash
yarn@4.12+
npm     or pnpm   or bun
canvaskit (for canvas rendering in browser)
```

### Installation & Development

```bash
# Clone and install dependencies
git clone https://github.com/misiekhardcore/wave-function-collapse.git
cd wave-function-collapse
yarn install  # OR: npm install / pnpm install / bun install

# Start development server
yarn dev      # Opens http://localhost:3000
```

### Build & Deploy

```bash
# Production build (includes type checking)
yarn build    # Runs lint + TypeScript checks, then builds

# Preview production build
yarn start
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
yarn lint --fix                   # Auto-fix formatting issues     │    calculateOptions.test.ts           ✓ 98.5%
yarn prettier:fix                  # Prettier auto-format        │    findTilesIndicesWithLeastOptions.test.ts   ✓
```

## 📁 Tile Definitions (Sample)

Each tile defines compatible neighbors for all four sides:

```typescript
// Example: Tile ID 0 compatibility rules
top: [0, 1, 6, 7, 8]; // Can connect to these tiles above
right: [0, 2, 5, 8, 9];
bottom: [0, 3, 6, 9, 10];
left: [0, 4, 5, 7, 10]; // Can connect to these tiles on left
```

The algorithm ensures that when placing a tile at position `(row, col)`, its edges must be compatible with already-placed neighboring tiles.

## 🎨 UI Controls Explained

| Control                        | Action                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------- |
| **Columns / Rows**             | Set the grid dimensions with the number field or slider → regenerates instantly |
| **Generate pattern** (instant) | Solve the whole grid in one go                                                  |
| **Watch it solve** (animated)  | Step through the algorithm frame by frame, about 20 s for a full grid           |
| **Restart**                    | Reset to the current size with fresh seed tiles (also cancels a run in flight)  |
| **PNG**                        | Save the completed grid as an image; disabled until the pattern is solved       |
| **Theme switch**               | Pin light or dark, or follow the operating system                               |
| **Tile picker**                | Inspect a tile and the tiles allowed on each of its four sides                  |

## 📊 Performance Benchmarks

| Grid Size      | Avg Completion Time | Memory Usage |
| -------------- | ------------------- | ------------ | --- | -------------------- | ---------------- | ---------- |
| 10×8 (small)   | ~45ms               | <2MB heap    |
| 30×20 (medium) | ~1.2s               | ~8MB heap    |     | **100×70** (default) | **~2–3 seconds** | ~15MB heap |
| 90×70 (large)  | ~8–12s              | ~25MB heap   |

_Measured on modern desktop browsers with CanvasKit optimization enabled._

## 🛠️ Tech Stack & Dependencies

### Frontend Framework

- **Next.js** — React framework with App Router, Server Components ready for migration
- **React 19+** — Latest features including Hooks improvements and Server Actions foundation
- **TypeScript 5.9+** — Full type safety from component to algorithm layer

### Styling & UI

| Library         | Version | Purpose                                                |
| --------------- | ------- | ------------------------------------------------------ |
| Tailwind CSS v4 | 4.x     | Utility-first styling with PostCSS integration         |
| shadcn/ui       | 4.x     | Accessible component primitives copied into `ui/`      |
| Radix UI        | 1.8.x   | Underlying primitives (label, slider, toggle group, …) |
| next-themes     | 0.4.x   | Light / dark / system theme with persistence           |
| lucide-react    | 1.63.x  | Icon set                                               |
| classnames      | 2.5.x   | Runtime conditional className composition              |

### Development Tools (DevDeps)

- **Jest + Image Snapshots** — Visual regression testing for Canvas rendering ✅
- **ESLint + Prettier** — Linting and formatting with Next.js config preset
- **Husky + lint-staged** — Git hooks that validate before committing
- **ts-node + jiti** — Fast TypeScript execution in development

## 🧩 Extending the Tile Set

Want to add custom tiles? Extend `src/lib/tiles.ts`:

```typescript
// src/lib/customTiles.ts
import { Tile } from '@/types';

export const myCustomTile: Tile = {
  id: 10,
  top: [0, 2], // Only compatible with tiles 0 and 2 above
  right: [4, 5, 8],
  bottom: [3, 7],
  left: [6, 9],
};
```

Then use in the main tile array:

```typescript
import { myCustomTile } from './customTiles'; // ...
tiles.push(myCustomTile);
```

## 📚 Algorithm Reference Implementation Notes

### Key Design Decisions

1. **Memory-efficient**: All grid state stored as single-dimensional arrays for cache locality and minimal memory footprint.
2. **Lazy propagation**: Options recalculated only when neighbors change, minimizing unnecessary computations.
3. **Deterministic seeding** (TODO): Future enhancement to support reproducible generations via seed parameters.

### Planned Improvements

- [ ] Multiple tile set presets (pixel art styles, organic patterns)
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
collapseGrid(grid, cols): TileObject[]  // Collapse one step of the algorithm
generateInitialGrid(seedCount, cols, rows): TileObject[]  // Initialize grid with seed tiles
tiles: ReadonlyArray<Tile>              // All available tile definitions (10 total)
getElapsedTime(startTime?: number, endTime?: number): string
```

</details>
