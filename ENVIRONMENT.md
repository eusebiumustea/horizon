# Environment Variables for Horizon

## API Service

- `DATABASE_URL` - Connection string for the database
- `PORT` - Port for the API server (default: 3000)
- `NODE_ENV` - Environment (development, production, etc.)

## Mobile App

- Add any mobile-specific environment variables in a `.env` file in the `apps/mobile` directory if needed.

## Usage

- Copy `.env.example` to `.env` and fill in the values for your environment.
- Never commit secrets or production credentials to version control.
