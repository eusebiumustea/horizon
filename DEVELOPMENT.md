# Development & Testing Guide

## Monorepo Setup

- Install dependencies: `pnpm install`
- Build all packages: `pnpm build`
- Start development servers: `pnpm dev`

## API (NestJS)

- Start API: `pnpm --filter api run dev` (or `cd apps/api && pnpm dev`)
- Run tests: `pnpm --filter api run test` or `pnpm --filter api run test:e2e`
- Lint: `pnpm --filter api run lint`
- Format: `pnpm format`

## Mobile (Expo)

- Start Expo: `pnpm --filter mobile run dev` (or `cd apps/mobile && pnpm dev`)
- Android: `pnpm --filter mobile run android`
- iOS: `pnpm --filter mobile run ios`
- Lint: `pnpm --filter mobile run lint`
- Format: `pnpm format`

## Shared Packages

- Build shared: `pnpm --filter @repo/shared run build`

## Tips

- Use `.env.example` as a template for environment variables.
- Use Prettier and ESLint for consistent code style.
- Use pnpm recursive commands for monorepo tasks.

## Troubleshooting

- If you encounter dependency issues, try `pnpm install --force`.
- For database issues, check your `DATABASE_URL` and run migrations.
