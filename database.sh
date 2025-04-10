#!/bin/bash

# Stop and remove any existing container with the same name
docker stop agstack-postgres || true
docker rm agstack-postgres || true

# Create and run PostgreSQL container
docker run --name agstack-postgres \
  -e POSTGRES_USER=avik \
  -e POSTGRES_PASSWORD=avik \
  -e POSTGRES_DB=datastack \
  -p 5433:5432 \
  -d postgres:14

echo "PostgreSQL database is running on postgresql://avik:avik@localhost:5433/datastack"
echo "You can connect to it using: psql postgresql://avik:avik@localhost:5433/datastack" 