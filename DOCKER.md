# Docker Setup Guide

This document explains how to run the Acquisitions DevOps App in both development and production environments using Docker.

## 🏗️ Architecture Overview

### Development Environment

- **Application**: Express.js app with hot reload
- **Database**: Neon Local (PostgreSQL proxy) running in Docker
- **Connection**: Direct PostgreSQL connection via `postgres://` URL
- **Features**: File watching, debug logging, database GUI (Adminer)

### Production Environment

- **Application**: Optimized Express.js app
- **Database**: Neon Cloud (serverless)
- **Connection**: HTTP-based Neon serverless client
- **Features**: Nginx reverse proxy, monitoring, logging

## 🚀 Quick Start

### Development Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Development Environment**

   ```bash
   npm run docker:dev
   ```

3. **Access Services**
   - Application: http://localhost:8000
   - Database GUI: http://localhost:8080 (Adminer)
   - Health Check: http://localhost:8000/health

4. **View Logs**

   ```bash
   npm run docker:dev:logs
   ```

5. **Stop Development Environment**
   ```bash
   npm run docker:dev:down
   ```

### Production Setup

1. **Set Environment Variables**

   ```bash
   export DATABASE_URL="your-neon-cloud-url"
   export ARCJET_KEY="your-arcjet-key"
   export JWT_SECRET="your-jwt-secret"
   ```

2. **Start Production Environment**

   ```bash
   npm run docker:prod
   ```

3. **Access Application**
   - Application: http://localhost:8000
   - With Nginx: http://localhost:80

4. **Stop Production Environment**
   ```bash
   npm run docker:prod:down
   ```

## 📁 File Structure

```
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.dev.yml        # Development environment
├── docker-compose.prod.yml       # Production environment
├── .dockerignore                 # Docker build context exclusions
├── .env.development             # Development environment variables
├── .env.production              # Production environment variables
└── docker/
    ├── init-scripts/            # Database initialization scripts
    │   └── 01-init-db.sql
    ├── nginx/                   # Nginx configuration
    │   └── conf.d/
    │       └── default.conf
    ├── fluentd/                 # Log aggregation config
    └── prometheus/              # Metrics collection config
```

## 🔧 Configuration Details

### Environment Variables

#### Development (.env.development)

```env
NODE_ENV=development
PORT=8000
LOG_LEVEL=debug
DATABASE_URL=postgres://neondb_owner:localpassword@neon-local:5432/main
ARCJET_KEY=ajkey_test_development_key
JWT_SECRET=your-dev-jwt-secret-key-here
JWT_EXPIRES_IN=24h
DEBUG=true
```

#### Production (.env.production)

```env
NODE_ENV=production
PORT=8000
LOG_LEVEL=info
DATABASE_URL=${DATABASE_URL}
ARCJET_KEY=${ARCJET_KEY}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=1h
DEBUG=false
```

### Database Configuration

The application automatically detects the environment and uses the appropriate database client:

- **Development**: Direct PostgreSQL connection (better for local development)
- **Production**: Neon HTTP client (optimized for serverless)

## 🐳 Docker Commands

### Basic Operations

```bash
# Build only the application image
npm run docker:build

# Clean up Docker resources
npm run docker:clean

# View logs for specific service
docker compose -f docker-compose.dev.yml logs app
docker compose -f docker-compose.dev.yml logs neon-local
```

### Development Commands

```bash
# Start with rebuild
docker compose -f docker-compose.dev.yml up --build

# Start in detached mode
docker compose -f docker-compose.dev.yml up -d

# Follow logs
docker compose -f docker-compose.dev.yml logs -f

# Restart specific service
docker compose -f docker-compose.dev.yml restart app

# Execute commands in running container
docker compose -f docker-compose.dev.yml exec app sh
```

### Production Commands

```bash
# Start production with all services
docker compose -f docker-compose.prod.yml up -d

# Start with monitoring stack
docker compose -f docker-compose.prod.yml --profile monitoring up -d

# Start with reverse proxy
docker compose -f docker-compose.prod.yml --profile proxy up -d

# Scale application instances
docker compose -f docker-compose.prod.yml up -d --scale app=3
```

## 🗄️ Database Management

### Development Database (Neon Local)

1. **Access Database CLI**

   ```bash
   docker compose -f docker-compose.dev.yml exec neon-local psql -U neondb_owner -d main
   ```

2. **Run Migrations**

   ```bash
   # From host machine
   npm run db:migrate

   # Or from container
   docker compose -f docker-compose.dev.yml exec app npm run db:migrate
   ```

3. **Open Database Studio**

   ```bash
   npm run db:studio
   ```

4. **Access Adminer (Web GUI)**
   - URL: http://localhost:8080
   - Server: neon-local
   - Username: neondb_owner
   - Password: localpassword
   - Database: main

### Production Database (Neon Cloud)

Production uses your existing Neon Cloud database. Ensure your `DATABASE_URL` points to the correct production database.

## 📊 Monitoring and Logging

### Production Monitoring Stack

Enable monitoring with:

```bash
docker compose -f docker-compose.prod.yml --profile monitoring up -d
```

Services included:

- **Prometheus**: Metrics collection (http://localhost:9090)
- **Fluentd**: Log aggregation
- **Application Logs**: Available in Docker volumes

### Log Access

```bash
# Application logs
docker compose -f docker-compose.prod.yml logs app

# Nginx logs (if using proxy profile)
docker compose -f docker-compose.prod.yml logs nginx

# All services logs
docker compose -f docker-compose.prod.yml logs
```

## 🚦 Health Checks

Both development and production containers include health checks:

- **Endpoint**: `/health`
- **Internal**: Docker health check every 30 seconds
- **Manual**: `curl http://localhost:8000/health`

## 🔒 Security Features

### Development

- Non-root user execution
- Basic security headers
- Development-friendly rate limiting

### Production

- Multi-stage build for smaller images
- No unnecessary packages in final image
- Security headers via Nginx
- Rate limiting and DDoS protection
- Non-root user execution
- Read-only filesystem options
- Resource limits

## 🛠️ Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   # Find and kill process using port 8000
   lsof -ti:8000 | xargs kill -9
   ```

2. **Database Connection Failed**

   ```bash
   # Check if Neon Local is healthy
   docker compose -f docker-compose.dev.yml ps

   # View database logs
   docker compose -f docker-compose.dev.yml logs neon-local
   ```

3. **Container Won't Start**

   ```bash
   # Check container logs
   docker compose -f docker-compose.dev.yml logs app

   # Debug by running shell
   docker compose -f docker-compose.dev.yml run app sh
   ```

4. **Build Fails**

   ```bash
   # Clean Docker build cache
   docker builder prune -f

   # Rebuild without cache
   docker compose -f docker-compose.dev.yml build --no-cache
   ```

### Performance Optimization

1. **Faster Development Builds**

   ```bash
   # Use BuildKit for faster builds
   export DOCKER_BUILDKIT=1
   ```

2. **Development File Watching**
   The development setup uses Docker Compose watch mode for automatic reloading when files change.

### Environment-Specific Debugging

#### Development

```bash
# Access development container
docker compose -f docker-compose.dev.yml exec app sh

# Check environment variables
docker compose -f docker-compose.dev.yml exec app env

# Test database connection
docker compose -f docker-compose.dev.yml exec app node -e "import('./src/config/database.js')"
```

#### Production

```bash
# Check production container health
docker compose -f docker-compose.prod.yml exec app wget -qO- http://localhost:8000/health

# Monitor resource usage
docker stats
```

## 📚 Additional Resources

- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
