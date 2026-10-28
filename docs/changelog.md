# Changelog

> **All notable changes to WFC (Wave Function Collapse Visualizer)**
>
> This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## Unreleased — `v1.x.x`

### UI Modernisation 🎨 _(This release)_

#### Layout

- Added a sticky header with the project title, a tagline and a light/system/dark theme switch, so the page has a single `h1` and a real document outline.
- Split the single stacked column into a responsive two-column layout: control panels on the left, the pattern stage and tile explorer on the right. Below `lg` the panels stack and the canvas scales down to the viewport instead of scrolling sideways.
- Added `shadcn/ui` on top of Radix UI, with `lucide-react` icons and `next-themes`; design tokens now live in `src/app/globals.css` and replace the ad-hoc `label`/`button`/`input` element styling.

#### Rendering

- The canvas is now backed by a device-pixel-ratio buffer, so tiles stay sharp on HiDPI screens.
- Fixed a draw bug that aborted the whole render at the first tile image that had not finished loading, which left most of the grid blank.
- Canvas colours are read from CSS custom properties (`--canvas-surface`, `--canvas-void`, `--canvas-grid`) at draw time and repaint when the theme changes. Unresolved cells render as quiet voids instead of hardcoded black squares with blue outlines.
- The canvas is capped at its intrinsic size rather than stretched to the panel width, so a narrow grid such as 12×70 no longer becomes a several-thousand-pixel-tall strip.

#### Interaction

- Number fields keep a local draft and commit on blur or Enter, so a value can be typed from scratch instead of snapping to the minimum on the first keystroke. Sliders regenerate the grid on release only.
- Animated mode is throttled to a fixed frame delay and resolves several tiles per frame, keeping a full 100×70 solve at roughly 20 seconds instead of either freezing or running for minutes. Restart cancels a run in flight.
- Instant mode no longer performs side effects inside a state updater; it yields a frame so the "solving" state is painted before the synchronous loop starts.
- The tile picker is a group of `aria-pressed` buttons with focus rings and screen-reader labels instead of clickable images, and the stage exposes a progress bar plus an `aria-live` status.

#### Docs

- `getElapsedTime` moved to `src/lib` so the documented API export actually exists.

### Documentation Updates 📚

The following documentation has been added or updated:

#### New Files Created ✅

| File                                | Description                                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `/README.md`                        | Comprehensive project overview, features list, architecture diagrams, getting started guide |
| `/.github/pull_request_template.md` | Standardized PR template with type selection, testing checklist, and context fields         |
| `docs/api-reference.md`             | Complete API reference for all core algorithm modules, utilities, and data types            |
| `docs/contributing.md`              | Developer workflow guide covering setup, code style conventions, testing requirements       |

#### Configuration Files Created ⚙️

| File                          | Description                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------- |
| `/LICENSE.txt`                | MIT license with commercial use guidelines and third-party component attribution |
| `/.github/CODE_OF_CONDUCT.md` | Contributor Covenant Code of Conduct for community behavior standards            |

#### Configuration Updates 🔧

- `.eslint.config.mjs`: Modern flat config setup using Next.js core preset + TypeScript ESLint strict rules
- `.prettierrc.json`: Complete formatting configuration with explicit schema validation reference ✅

---

## v1.0.0 — Initial Release

### Core Features 🎯

#### Algorithm Implementation

| Module                   | Functionality                                                     |
| ------------------------ | ----------------------------------------------------------------- |
| `collapseGrid.ts`        | Main WFC algorithm loop using MRV heuristic                       |
| `generateInitialGrid.ts` | Grid initialization with N seed tiles placed randomly             |
| `calculateOptions.ts`    | Constraint propagation solver for neighbor compatibility checking |

#### UI Components

- Real-time "Generate on Fly" visualization mode (interval-based updates)
- Instant pattern generation completion display
- Canvas rendering via HTML5 `<canvas>` element
- Tile preview panel showing selected tile and compatible neighbors
- Grid size controls: 2–100 columns × 2–70 rows configurable at runtime

#### Developer Experience

| Feature            | Description                                                                   |
| ------------------ | ----------------------------------------------------------------------------- |
| TypeScript         | Full type coverage with strict mode enabled, path aliases (`@/*` → `./src/*`) |
| Testing Framework  | Jest + Image Snapshots for visual regression testing of Canvas rendering ✅   |
| Code Quality Tools | ESLint (Next.js config) + Prettier integrated into CI/CD via GitHub Actions   |

---

## v0.x — Pre-1.0 Experiments

_This project was originally bootstrapped with `create-next-app` and included default template content._  
The wave function collapse algorithm implementation has been completely refactored since then.

---

### Legend | Status Code Reference

| Symbol | Meaning |
| 📚 | Documentation focus (readmes, guides, API refs) |
| ⚙️ | Configuration files (.json, .yml, etc.) |
| ✅ | New file created in this changelog entry |

> **Note**: This project is actively maintained. For feature requests and bug reports:
> https://github.com/misiekhardcore/wave-function-collapse/issues
