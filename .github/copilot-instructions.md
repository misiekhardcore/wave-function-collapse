# Copilot Instructions for Wave Function Collapse

## Project Overview

This is a Next.js application that implements the Wave Function Collapse algorithm to generate 2D patterns. The algorithm uses constraint propagation to create procedurally generated content based on predefined tiles and their adjacency rules.

## Technology Stack

- **Framework**: Next.js 15.5.6 with React 19.2.0
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.1.16
- **Testing**: Jest 30.2.0 with React Testing Library
- **Linting**: ESLint 9.39.1 with TypeScript ESLint and Prettier
- **Package Manager**: Yarn 4.11.0

## Development Workflow

### Installation

```bash
yarn install
```

### Running the Development Server

```bash
yarn dev
```

The application will be available at `http://localhost:3000`.

### Building the Project

```bash
yarn build
```

This command runs linting before building, so ensure code passes all checks.

### Testing

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch
```

- All tests are located alongside their source files with `.test.ts` or `.test.tsx` extensions
- Use Jest with React Testing Library for component tests
- Tests should cover both logic functions and React components
- Snapshot testing is used for visual components (e.g., CanvasGrid)

### Linting and Formatting

```bash
# Check for linting and formatting issues
yarn lint

# Auto-fix linting and formatting issues
yarn lint:fix

# Check ESLint only
yarn eslint

# Check Prettier only
yarn prettier
```

## Code Style and Standards

### TypeScript

- Strict mode is enabled in `tsconfig.json`
- Use explicit types where it improves code clarity
- Unused variables prefixed with `_` are allowed (e.g., `_unusedParam`)
- Target ES6 with modern ESNext modules

### Formatting

- **Print Width**: 100 characters
- **Quotes**: Single quotes for strings
- **Trailing Commas**: ES5 style (objects, arrays, etc.)
- **Line Endings**: LF (Unix style)
- Prettier is enforced via ESLint - all formatting violations should be fixed automatically

### ESLint Rules

- TypeScript recommended rules are enforced
- Prettier errors are treated as ESLint errors
- Testing Library plugin is configured for test files
- Next.js core web vitals and TypeScript rules are enabled

### File Organization

```
src/
├── app/              # Next.js app directory (pages, layouts)
├── components/       # React components
│   ├── Grid/        # Grid-related components
│   └── TilesPreview/
├── lib/             # Core algorithm logic and utilities
│   ├── calculateOptions.ts
│   ├── collapseGrid.ts
│   ├── generateInitialGrid.ts
│   ├── getNeighborOptions.ts
│   ├── tiles.ts
│   └── ...
└── types.ts         # Shared TypeScript types
```

### Import Aliases

- Use `@/*` to import from `src/*` (e.g., `import { Grid } from '@/components'`)

## Testing Requirements

- **Unit Tests**: All utility functions in `lib/` should have corresponding `.test.ts` files
- **Component Tests**: React components should have `.test.tsx` files
- **Test Structure**: Follow the Arrange-Act-Assert pattern
- **Coverage**: Aim for comprehensive coverage of core algorithm logic

### Example Test Structure

```typescript
describe('functionName', () => {
  it('should do something specific', () => {
    // Arrange
    const input = setupTestData();
    
    // Act
    const result = functionName(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

## Key Concepts

### Wave Function Collapse Algorithm

The core algorithm is implemented across several modules:

1. **Grid Generation** (`generateInitialGrid.ts`): Creates initial grid with all possibilities
2. **Option Calculation** (`calculateOptions.ts`): Determines valid tiles for each cell
3. **Neighbor Analysis** (`getNeighborOptions.ts`): Checks adjacency constraints
4. **Grid Collapse** (`collapseGrid.ts`): Iteratively collapses superpositions to concrete values
5. **Tile System** (`tiles.ts`): Defines tile types and adjacency rules

### Components

- **CanvasGrid**: Renders the generated pattern using HTML Canvas
- **TilesPreview**: Displays available tile options

## Pre-commit Hooks

Husky is configured to run lint-staged before commits:
- Automatically formats and lints staged files
- Ensures code quality before changes are committed

## Common Tasks

### Adding a New Feature

1. Implement the feature with TypeScript
2. Add comprehensive tests
3. Ensure code follows existing patterns in `lib/` or `components/`
4. Run `yarn lint:fix` to format code
5. Run `yarn test` to verify tests pass
6. Run `yarn build` to ensure no build errors

### Fixing a Bug

1. Write a failing test that reproduces the bug
2. Fix the bug
3. Verify the test now passes
4. Check for any related edge cases

### Adding a New Component

1. Create component in appropriate directory under `src/components/`
2. Export from `index.tsx` in the component directory
3. Add tests in `.test.tsx` file
4. Follow React 19 best practices (use hooks, functional components)
5. Use Tailwind CSS for styling

## Important Notes

- This is a Next.js App Router project (not Pages Router)
- The app uses Turbopack for development (`yarn dev --turbopack`)
- Canvas rendering is used for grid visualization
- Keep algorithm logic separate from UI components
- Maintain test coverage when modifying core algorithm files
