# Acquisitions DevOps App

> A modern Express.js API with comprehensive security, database management, and Docker deployment.

## 🚀 Quick Start

### Local Development (Traditional)
```bash
npm install
npm run dev
```

### Docker Development (Recommended)
```bash
# Using npm scripts
npm run docker:dev

# Or using Make
make dev-up
```

### Docker Production
```bash
# Set environment variables
export DATABASE_URL="your-neon-cloud-url"
export ARCJET_KEY="your-arcjet-key"
export JWT_SECRET="your-jwt-secret"

# Start production
npm run docker:prod
# or
make prod-up
```

## 📋 Table of Contents

- [🏗️ Architecture](#️-architecture)
- [🔧 Development Setup](#-development-setup)
- [🐳 Docker Setup](#-docker-setup)
- [🗄️ Database](#️-database)
- [🔒 Security](#-security)
- [🚢 Deployment](#-deployment)
- [📚 API Documentation](#-api-documentation)

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js 20 with ES modules
- **Framework**: Express.js 5.1.0
- **Database**: PostgreSQL via Neon (Cloud/Local)
- **ORM**: Drizzle ORM with HTTP adapter
- **Authentication**: JWT with bcrypt password hashing
- **Security**: Arcjet protection (rate limiting, bot detection, email validation)
- **Validation**: Zod schemas
- **Logging**: Winston with file and console transports
- **Containerization**: Docker with multi-stage builds

### Project Structure
```
src/
├── app.js           # Express app configuration
├── server.js        # Server startup
├── index.js         # Entry point
├── config/          # Configuration files
│   ├── database.js  # Drizzle/Neon connection
│   ├── logger.js    # Winston logger setup
│   └── arcjet.js    # Security configuration
├── models/          # Database schemas (Drizzle)
├── routes/          # Express route definitions
├── controllers/     # Request handlers and business logic
├── services/        # Data access layer
├── middleware/      # Express middleware
├── utils/           # Helper utilities (JWT, cookies, formatters)
└── validations/     # Zod validation schemas
```

## 🔧 Development Setup

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- npm or yarn

### Local Development
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your environment variables in .env
# DATABASE_URL=your-neon-database-url
# ARCJET_KEY=your-arcjet-key

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start development server with file watching
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Drizzle Studio (database GUI)
```

## 🐳 Docker Setup

### Development Environment
Uses **Neon Local** (PostgreSQL) for local database development:

```bash
# Start development environment
make dev-up
# or
npm run docker:dev

# Access services:
# - Application: http://localhost:8000
# - Database GUI: http://localhost:8080 (Adminer)
# - Health Check: http://localhost:8000/health

# View logs
make dev-logs

# Stop environment
make dev-down
```

### Production Environment
Uses **Neon Cloud** (serverless) for production database:

```bash
# Set environment variables
export DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
export ARCJET_KEY="ajkey_your_production_key"
export JWT_SECRET="your-secure-jwt-secret"

# Start production environment
make prod-up
# or
npm run docker:prod

# Start with monitoring and proxy
make prod-full

# View logs
make prod-logs
```

### Docker Commands Reference
```bash
# Development
make dev-up         # Start development environment
make dev-up-d       # Start in detached mode
make dev-down       # Stop environment
make dev-shell      # Access app container shell
make dev-db-shell   # Access database shell

# Production
make prod-up        # Start production environment
make prod-monitoring # Start with monitoring stack
make prod-proxy     # Start with reverse proxy
make prod-full      # Start with all services

# Database
make migrate        # Run database migrations
make generate       # Generate database migrations
make studio         # Open database studio

# Utilities
make build          # Build application image
make clean          # Clean up Docker resources
make status         # Show container status
make help           # Show all available commands
```

## 🗄️ Database

### Development Database (Neon Local)
- **Type**: PostgreSQL 15 in Docker container
- **Connection**: Direct PostgreSQL connection
- **URL**: `postgres://neondb_owner:localpassword@localhost:5432/main`
- **Features**: Persistent data, GUI access via Adminer

### Production Database (Neon Cloud)
- **Type**: Neon serverless PostgreSQL
- **Connection**: HTTP-based Neon client
- **URL**: Your Neon Cloud connection string
- **Features**: Serverless scaling, automatic backups, branching

### Database Operations
```bash
# Generate migrations after schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Open database GUI
npm run db:studio

# Direct database access (development)
make dev-db-shell
```

## 🔒 Security

### Arcjet Protection
- **Rate Limiting**: Different limits per endpoint type
  - Global: 100 requests/minute
  - Auth: 5 requests/15 minutes
  - API: 60 requests/minute
  - Health: 300 requests/minute
- **Bot Detection**: Blocks automated requests, allows search engines
- **Email Validation**: Blocks invalid and disposable emails
- **Shield**: Protection against common web attacks

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with 10 salt rounds
- **Secure Cookies**: HTTP-only cookies for token storage

### Additional Security
- **Helmet**: Security headers
- **CORS**: Cross-origin request handling
- **Input Validation**: Zod schema validation
- **Comprehensive Logging**: Security events and access logs

## 🚢 Deployment

### Environment Variables

#### Required for Production
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host/db
ARCJET_KEY=ajkey_your_production_key
JWT_SECRET=your-secure-jwt-secret-256-bits
```

#### Optional
```env
PORT=8000
LOG_LEVEL=info
JWT_EXPIRES_IN=1h
```

### Docker Deployment Options

1. **Basic Production**
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

2. **With Reverse Proxy (Nginx)**
   ```bash
   docker compose -f docker-compose.prod.yml --profile proxy up -d
   ```

3. **With Monitoring Stack**
   ```bash
   docker compose -f docker-compose.prod.yml --profile monitoring up -d
   ```

4. **Full Production Setup**
   ```bash
   docker compose -f docker-compose.prod.yml --profile proxy --profile monitoring up -d
   ```

## 📚 API Documentation

### Endpoints

#### Health Check
```
GET /health
```
Returns server status and uptime.

#### Root
```
GET /
```
Basic API greeting.

#### API Information
```
GET /api
```
API documentation and available endpoints.

#### Authentication
```
POST /api/auth/sign-up
POST /api/auth/sign-in
POST /api/auth/sign-out
```

### Testing API
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test with Arcjet protection
node test-arcjet.js
```

## 📁 Configuration Files

- **Docker**
  - `Dockerfile` - Multi-stage Docker build
  - `docker-compose.dev.yml` - Development environment
  - `docker-compose.prod.yml` - Production environment
  - `.dockerignore` - Docker build exclusions

- **Environment**
  - `.env.development` - Development configuration
  - `.env.production` - Production configuration
  - `.env.example` - Configuration template

- **Documentation**
  - `DOCKER.md` - Detailed Docker setup guide
  - `WARP.md` - Development environment guidance

## 🛠️ Troubleshooting

### Common Issues

1. **Port 8000 already in use**
   ```bash
   lsof -ti:8000 | xargs kill -9
   ```

2. **Docker build fails**
   ```bash
   make clean
   docker system prune -f
   ```

3. **Database connection issues**
   ```bash
   make dev-logs
   # Check database container status
   ```

4. **Missing dependencies**
   ```bash
   npm install
   # or in Docker
   make dev-up --build
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker: `make test-build`
5. Run linter: `make lint`
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

For detailed Docker setup instructions, see [DOCKER.md](./DOCKER.md).

For development environment setup, see [WARP.md](./WARP.md).