# Copilot Instructions for Wave Function Collapse

## Project Overview

This is a Next.js application that implements the Wave Function Collapse algorithm to generate 2D patterns. The algorithm uses constraint propagation to create procedurally generated content based on predefined tiles and their adjacency rules.

## Technology Stack

- **Framework**: Next.js with React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Jest with React Testing Library
- **Linting**: ESLint with TypeScript ESLint and Prettier
- **Package Manager**: Yarn (see `package.json` for specific versions)

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
- Visual regression testing uses `jest-image-snapshot` with configurable failure thresholds

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

- Strict mode is enabled - see `tsconfig.json` for complete configuration
- Use explicit types where it improves code clarity
- Unused variables prefixed with `_` are allowed per ESLint configuration

### Formatting

- Code formatting is managed by Prettier - see `prettier.config.js` for configuration
- Prettier is enforced via ESLint - all formatting violations should be fixed automatically
- Key Prettier settings: 100 char line width, single quotes, ES5 trailing commas, LF line endings

### ESLint Rules

- ESLint configuration is in `eslint.config.mjs`
- TypeScript, Prettier, and Testing Library plugins are configured
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

- Use `@/*` to import from `src/*` (e.g., `import { CanvasGrid } from '@/components'`)

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

- Runs TypeScript type checking (`tsc --noEmit`) on TypeScript files
- Automatically formats and lints staged files
- Ensures code quality before changes are committed
- See `lint-staged.config.js` for complete configuration

## Common Tasks

### Code Quality Principles

Follow these best practices when writing code:

- **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **KISS**: Keep It Simple, Stupid - favor simple, readable solutions over complex ones
- **DRY**: Don't Repeat Yourself - extract common logic into reusable functions

### Adding a New Feature

Work iteratively in small increments:

1. Break down the feature into small, self-contained modules
2. For each module:
   - Implement the functionality with TypeScript
   - Write comprehensive tests for the new code
   - Run `yarn lint:fix` to format code
   - Run `yarn test` to verify tests pass
   - Run `yarn build` to ensure no build errors
3. Repeat until all criteria are met, linting works, and all tests pass
4. Ensure code follows existing patterns in `lib/` or `components/`

### Fixing a Bug

1. Write a failing test that reproduces the bug
2. Fix the bug
3. Verify the test now passes
4. Check for any related edge cases

### Adding a New Component

Work iteratively in small increments:

1. Create component in appropriate directory under `src/components/`
2. Export from `index.tsx` in the component directory
3. Implement component logic incrementally:
   - Write the basic component structure
   - Add tests in `.test.tsx` file
   - Run `yarn lint:fix` and `yarn test`
   - Add more functionality in small steps
   - Test after each change
4. Repeat until all criteria are met, linting works, and all tests pass
5. Follow React best practices (use hooks, functional components)
6. Use Tailwind CSS for styling

## Important Notes

- This is a Next.js App Router project (not Pages Router)
- Canvas rendering is used for grid visualization
- Keep algorithm logic separate from UI components
- Maintain test coverage when modifying core algorithm files
