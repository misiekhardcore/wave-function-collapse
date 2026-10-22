# Changelog

> **All notable changes to WFC (Wave Function Collapse Visualizer)**
>
> This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## Unreleased — `v1.x.x`

### Documentation Updates 📚 _(This release)_

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
