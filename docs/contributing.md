# Contributing to WFC

Thank you for your interest in contributing! This document outlines the development workflow, code conventions, and areas where contributions are most welcome.

## 📋 Table of Contents

- [Development Setup](#development-setup)
- [Code Style & Conventions](#code-style--conventions)
- [Testing Requirements](#testing-requirements)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Checklist](#pull-request-checklist)
- [Areas of Interest](#areas-of-interest)

---

## Development Setup

### Prerequisites Check

```bash
node@18+    ✅ Required for TypeScript and Next.js 16+
pnpm@12+    ✅ Pinned in package.json (use `pnpm` not npm)
canvaskit   ✅ Auto-loaded via CDN, no extra setup needed
git         ✅ For version control workflow
```

### Initial Setup Commands

```bash
# Clone repository with submodules if any exist
git clone https://github.com/misiekhardcore/wave-function-collapse.git
cd wave-function-collapse

# Install dependencies (uses pnpm 4 PnP)
pnpm install --frozen-lockfile

# Verify installation by running tests
echo "Tests should pass:" && pnpm test --passWithNoTests
```

### Development Workflow Tips

| Task                                 | Command                                  |
| ------------------------------------ | ---------------------------------------- |
| Start dev server                     | `pnpm dev` (opens http://localhost:3000) |
| Build for production + type checking | `pnpm build`                             |
| Run linter with auto-fix             | `pnpm lint --fix`                        |
| Format code automatically            | `pnpm prettier:fix`                      |
| Watch tests during development       | `pnpm test:watch`                        |

---

## Code Style & Conventions

### TypeScript Rules (Strict Mode)

```typescript
// ✅ DO — Type every parameter and return value explicitly
export function collapseGrid(grid: TileObject[], cols: number): TileObject[] {
  // ...
}

// ❌ DON'T — Omit type annotations in .ts files
function badExample(x, y) {               // ← Missing types!

} as const;
```

### Naming Conventions

| Element                      | Convention                                                | Example                                            |
| ---------------------------- | --------------------------------------------------------- | -------------------------------------------------- |
| **Functions**                | camelCase                                                 | `collapseGrid`, `generateInitialGrid`              |
| **Constants / Configs**      | UPPER_SNAKE_CASE                                          | `COLS = 60`, `MIN_ROWS = 2`                        |
| **Private/Internal Members** | single leading underscore `_internalHelper()`             |
| **File Names**               | kebab-case for component directories, camelCase otherwise | `components/Grid/index.tsx`, `lib/collapseGrid.ts` |

### Import Organization (Recommended)

```typescript
// src/app/page.tsx — Example organization pattern:
import { useEffect } from 'react'; // 1. Built-in Node.js APIs

export default function Home() {
  return null;
}
```

---

## Testing Requirements\*\*

All pull requests **must include passing tests**. The project uses a dual testing strategy:

### Unit Tests (Jest)

```bash
pnpm test                   # Run all unit tests with coverage report
pnpm test --watch           # Watch mode for development iterations
pnpm test <pattern>         # Filter by file, e.g., "lib/collapseGrid"
```

**Coverage Threshold**: Core algorithm files must maintain ≥95% line and branch coverage.

### Visual Regression Tests (Canvas Snapshots)

The project uses **Jest Image Snapshot** to verify Canvas rendering correctness:

```bash
pnpm test --update-snapshots    # Update snapshot images after UI changes
```

Snapshot files are stored in `src/components/Grid/__image_snapshots__/` and should never be manually edited.

---

## Commit Guidelines

### Conventional Commits Format

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

| Type                     | Prefix                         | Description                                                    |
| ------------------------ | ------------------------------ | -------------------------------------------------------------- |
| **Feature**              | `feat:`                        | New functionality (e.g., "Add custom tile preset import")      |
| **Fix**                  | `fix:`                         | Bug fixes (e.g., "Fix boundary condition in calculateOptions") |
| **Tests**                | `test:`                        | Test additions, improvements, or refactoring                   |
| **Docs**                 | `docs:`                        | Documentation updates only                                     |
| **Style/Format/Lint**    | `style:`, `format:`, `lint:`   | Code style changes that don't affect behavior                  |
| **Refactor/Maintenance** | `refactor:`, `chore:`, `perf:` | Non-feature code changes, performance improvements             |

### Example Commits ✅

```bash
git commit -m "feat: add support for custom tile import from JSON"

git commit -m "fix: correct neighbor calculation when cols < 2"
    --gh-dates now                    # Records author timestamp per RFC 3164
```

---

## Pull Request Checklist\*\*

Before submitting a PR, verify:

- [ ] All tests pass locally (`pnpm test`)
- [ ] No TypeScript errors on build (`pnpm build` exits cleanly)
- [ ] Linting passes with no warnings (`pnpm lint`)
- [ ] Code is formatted (run `pnpm prettier:fix` if unsure) ✅
- [ ] Changes follow existing code style and conventions
- [ ] New features include corresponding tests or documentation updates
- [ ] No console.error() calls in production paths; use debugging tools instead.

---

## Areas of Interest\*\*

The project welcomes contributions across multiple dimensions:

### 🎨 Content & Features (High Impact)

| Area                | Description                                                                     |
| ------------------- | ------------------------------------------------------------------------------- |
| **New Tile Sets**   | Add diverse tile collections with visual previews (pixel art, organic patterns) |
| **Pattern Presets** | Save/load custom configurations including seed positions and grid sizes         |
| **Export Formats**  | SVG paths for vector graphics; JSON state files for reproducibility             |

### ⚡ Performance & Optimization (Technical)

- WebAssembly port of core algorithms using `@std/wasm` or native Emscripten bindings
- SIMD optimizations in JavaScript via typed arrays and worker threads

### ♿ Accessibility Enhancements (Important Gap)

| Feature                                               | Priority                               |
| ----------------------------------------------------- | -------------------------------------- |
| Keyboard navigation for tile selection                | High — essential screen reader support |
| Screen reader announcements during generation updates | Medium                                 |
| Focus management on modal dialogs / overlays          | Low-Medium                             |

- ARIA labels and roles throughout the DOM tree

### 📱 UX/UI Improvements (Good First Issues)

```bash
git clone https://github.com/misiekhardcore/wave-function-collapse.git
cd wave-function-collapse
pnpm install --frozen-lockfile  # Install dependencies using pnpm PnP mode
```

| Issue                                                | Description                                  |
| ---------------------------------------------------- | -------------------------------------------- |
| Mobile-responsive canvas scaling for smaller screens | Medium priority — works but could be cleaner |

- Touch-friendly controls on mobile devices

---

## 📚 Getting Help

### Resources Before Asking Questions

1. **Existing Documentation**: Check `docs/api-reference.md` and this file first ✅
2. **GitHub Issues**: Search for existing discussions, feature requests: https://github.com/misiekhardcore/wave-function-collapse/issues
3. **TypeScript Playground** — Verify type compatibility before committing changes to interface definitions.

---

## 📜 Code of Conduct

Be respectful and inclusive in all interactions. Report unacceptable behavior via GitHub's issue templates or directly contact the maintainer.

---

_Last updated: 2024 | Maintained by Michael Konopski <misiekhardcore@gmail.com>_
