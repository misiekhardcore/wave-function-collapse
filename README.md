This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Continuous Integration

This project includes a CI workflow that runs on all pull requests and pushes to the main branch. The workflow performs the following checks in parallel:

- **Build**: Runs linting (ESLint + Prettier), TypeScript type checking, and Next.js build
- **Test**: Runs the full test suite with Jest

The build step runs `yarn build`, which executes:

1. `yarn lint` - ESLint checks (including Prettier formatting via eslint-plugin-prettier)
2. `next build` - Next.js build with TypeScript type checking

All checks must pass before a pull request can be merged.

To run these checks locally:

```bash
# Run build (includes lint and TypeScript checks)
yarn build

# Run tests
yarn test

# Or run checks individually:
yarn lint          # ESLint + Prettier
yarn tsc --noEmit  # TypeScript type checking
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
