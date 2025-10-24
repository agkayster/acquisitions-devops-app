-- Database initialization script for Neon Local development environment
-- This script runs when the PostgreSQL container starts for the first time

-- Create additional databases if needed
-- CREATE DATABASE acquisitions_test;

-- Create extensions that might be needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE main TO neondb_owner;

-- You can add your initial schema here if not using migrations
-- Or add seed data for development

-- Log initialization
SELECT 'Neon Local database initialized successfully' as message;