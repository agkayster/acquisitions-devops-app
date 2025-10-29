#!/bin/bash
echo "🚀 Starting Acquisition App in Development Mode"
echo "================================================"

# Check if .env.development exists
if [ ! -f .env.development ]; then
    echo "❌ Error: .env.development file not found!"
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    exit 1
fi

# Clean up any existing containers and volumes
echo "🧹 Cleaning up existing containers..."
docker compose -f docker-compose.dev.yml down -v

echo "📦 Building and starting development containers..."
docker compose -f docker-compose.dev.yml up -d

# Wait for PostgreSQL to be healthy
echo "⏳ Waiting for database to be ready..."
timeout=60
elapsed=0

while [ $elapsed -lt $timeout ]; do
    if docker compose -f docker-compose.dev.yml exec -T neon-local pg_isready -U neondb_owner -d neondb >/dev/null 2>&1; then
        echo "✅ Database is ready!"
        sleep 2
        break
    fi
    sleep 2
    elapsed=$((elapsed + 2))
    echo "   Waiting... ${elapsed}s/${timeout}s"
done

if [ $elapsed -ge $timeout ]; then
    echo "❌ Database failed to start!"
    docker compose -f docker-compose.dev.yml logs neon-local
    exit 1
fi

# Initialize database user and permissions
echo "👤 Setting up database user and permissions..."
docker compose -f docker-compose.dev.yml exec -T neon-local psql -U neondb_owner -d neondb <<-EOSQL
    -- Create the application user if it doesn't exist
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'neondb_owner') THEN
            CREATE USER neondb_owner WITH PASSWORD 'localpassword' CREATEDB;
        END IF;
    END
    \$\$;
    
    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE neondb TO neondb_owner;
    GRANT ALL ON SCHEMA public TO neondb_owner;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO neondb_owner;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO neondb_owner;
EOSQL

echo "✅ Database user configured!"

# For migrations, use localhost since we're running from host
export DATABASE_URL="postgresql://neondb_owner:localpassword@localhost:5432/neondb"

# Run migrations
echo "📜 Running database migrations..."
npm run db:migrate

if [ $? -ne 0 ]; then
    echo "❌ Migration failed!"
    exit 1
fi

echo "✅ Migrations completed successfully!"

echo ""
echo "🎉 Development environment is ready!"
echo "   Application: http://localhost:3000"
echo "   Database: postgresql://neondb_owner:localpassword@localhost:5432/neondb"
echo "   Adminer (DB GUI): http://localhost:8080 (run with --profile tools)"
echo ""
echo "📋 Showing logs (Ctrl+C to exit, containers will keep running):"
docker compose -f docker-compose.dev.yml logs -f