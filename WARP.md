# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Running the Application
```bash
npm run dev          # Start development server with file watching
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

### Database Operations
```bash
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Drizzle Studio (database GUI)
```

## Architecture Overview

### Technology Stack
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js 5.1.0
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with HTTP adapter
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Zod schemas
- **Logging**: Winston with file and console transports

### Project Structure
The codebase follows a layered architecture pattern with path aliases for clean imports:

```
src/
├── app.js           # Express app configuration
├── server.js        # Server startup
├── index.js         # Entry point
├── config/          # Configuration files
│   ├── database.js  # Drizzle/Neon connection
│   └── logger.js    # Winston logger setup
├── models/          # Database schemas (Drizzle)
├── routes/          # Express route definitions
├── controllers/     # Request handlers and business logic
├── services/        # Data access layer
├── middleware/      # Express middleware
├── utils/           # Helper utilities (JWT, cookies, formatters)
└── validations/     # Zod validation schemas
```

### Path Aliases
The project uses import maps for cleaner imports:
- `#config/*` → `./src/config/*`
- `#db/*` → `./src/db/*`
- `#models/*` → `./src/models/*`
- `#routes/*` → `./src/routes/*`
- `#controllers/*` → `./src/controllers/*`
- `#middleware/*` → `./src/middleware/*`
- `#utils/*` → `./src/utils/*`
- `#services/*` → `./src/services/*`
- `#validations/*` → `./src/validations/*`

### Database Layer
- Uses Drizzle ORM with PostgreSQL dialect
- Database connection via Neon serverless (@neondatabase/serverless)
- Schema definitions in `src/models/` directory
- Migrations managed by Drizzle Kit in `drizzle/` directory
- Database URL configured via `DATABASE_URL` environment variable

### Authentication Flow
1. **Validation**: Zod schemas validate request data
2. **Service Layer**: `auth.service.js` handles user creation/lookup
3. **Password Security**: bcrypt with 10 salt rounds
4. **JWT**: Custom utility in `utils/jwt.js` with configurable expiry
5. **Cookies**: JWT stored in HTTP cookies via `utils/cookies.js`

### Logging Strategy
- Winston logger with structured JSON format
- File logging: `logs/error.log` (errors only), `logs/combined.log` (all levels)
- Console logging in non-production environments
- Request logging via Morgan middleware integrated with Winston
- Service identifier: `acquisitions-api`

### Environment Configuration
Required environment variables (see `.env.example`):
- `PORT` - Server port (default: 8000)
- `NODE_ENV` - Environment mode
- `LOG_LEVEL` - Logging level (default: info)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time (default: 1h)

### Code Style Standards
- ESLint with ES2024 features, 2-space indentation, single quotes, semicolons
- Prettier with 80 character line width, trailing commas (ES5)
- Arrow functions preferred, const over let/var
- Unix line endings (LF)

### API Endpoints
- `GET /` - Root endpoint
- `GET /health` - Health check with uptime
- `GET /api` - API documentation
- `POST /api/auth/sign-up` - User registration (implemented)
- `POST /api/auth/sign-in` - User login (placeholder)
- `POST /api/auth/sign-out` - User logout (placeholder)