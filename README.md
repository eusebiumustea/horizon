# Horizon - Fullstack Monorepo

A fullstack monorepo built with Turborepo, React Native Expo, NestJS, and SQLite.

## Features

- **Real-time messaging** with Socket.io
- **Direct and group conversations**
- **Message persistence** with Prisma ORM
- **Cross-platform mobile app** with Expo
- **RESTful API** with NestJS

## Project Structure

```
horizon/
├── apps/
│   ├── api/          # NestJS backend API
│   └── mobile/       # React Native Expo app
├── packages/
│   ├── shared/       # Shared types and utilities
│   ├── eslint-config/# ESLint configurations
│   └── typescript-config/ # TypeScript configurations
└── turbo.json        # Turborepo configuration
```

## Prerequisites

- Node.js >= 18
- pnpm >= 9.0.0
- PostgreSQL database

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up the database

Copy the environment file in the API app:

```bash
cp apps/api/.env.example apps/api/.env
```

Update the `DATABASE_URL` in `apps/api/.env` with your PostgreSQL connection string.

### 3. Generate Prisma client and run migrations

```bash
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate
```

### 4. Run the development servers

From the root directory:

```bash
pnpm dev
```

This will start:

- **API** at http://localhost:3000
- **Mobile** Expo dev server

## Available Scripts

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `pnpm dev`         | Start all apps in development mode |
| `pnpm build`       | Build all apps and packages        |
| `pnpm lint`        | Lint all apps and packages         |
| `pnpm check-types` | Type check all apps and packages   |

### API Scripts

| Command                | Description             |
| ---------------------- | ----------------------- |
| `pnpm prisma:generate` | Generate Prisma client  |
| `pnpm prisma:migrate`  | Run database migrations |
| `pnpm prisma:studio`   | Open Prisma Studio      |

## API Endpoints

### Conversations

- `GET /conversations` - Get user's conversations
- `POST /conversations` - Create new conversation
- `GET /conversations/:id` - Get conversation details
- `GET /conversations/:id/messages` - Get conversation messages
- `POST /conversations/:id/messages` - Send message

### Socket Events

- `join_conversation` - Join a conversation room
- `leave_conversation` - Leave a conversation room
- `send_message` - Send a message
- `message_received` - Receive new messages
- `typing_start` / `typing_stop` - Typing indicators

## Tech Stack

- **Monorepo**: Turborepo
- **Mobile**: React Native + Expo + Socket.io Client
- **Backend**: NestJS + Socket.io + Prisma ORM
- **Database**: SQLite (development) / PostgreSQL (production)
- **Package Manager**: pnpm

## License

Private
