# Agnes Nails - Docker Setup Guide

This guide explains how to run the Agnes Nails application using Docker and Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0 or higher)

## Project Structure

```
agnes-nails/
├── docker-compose.yml          # Production configuration
├── docker-compose.dev.yml      # Development configuration
├── backend/
│   ├── Dockerfile             # Production backend image
│   ├── Dockerfile.dev         # Development backend image
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile             # Production frontend image
│   ├── Dockerfile.dev         # Development frontend image
│   └── .dockerignore
└── DOCKER.md                  # This file
```

## Services

The Docker Compose setup includes three services:

1. **postgres** - PostgreSQL 15 database
   - Port: 5432
   - Database: agnes_nails
   - Persistent volume for data storage

2. **backend** - NestJS API
   - Port: 3001
   - Connects to PostgreSQL
   - Auto-creates database tables on startup

3. **frontend** - Next.js application
   - Port: 3000
   - Connects to backend API

## Quick Start

### Production Mode

Run all services in production mode:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

### Development Mode

Run all services in development mode with hot reload:

```bash
# Build and start all services in development mode
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop all services
docker-compose -f docker-compose.dev.yml down
```

In development mode:
- Code changes are automatically detected and hot-reloaded
- Source code is mounted as volumes
- Nodemon/Next.js watch mode is enabled

## Common Commands

### View Running Containers

```bash
docker-compose ps
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuild Services

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild and restart
docker-compose up -d --build
```

### Execute Commands in Containers

```bash
# Access backend container shell
docker-compose exec backend sh

# Access frontend container shell
docker-compose exec frontend sh

# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d agnes_nails
```

### Database Management

```bash
# Create database backup
docker-compose exec postgres pg_dump -U postgres agnes_nails > backup.sql

# Restore database from backup
docker-compose exec -T postgres psql -U postgres agnes_nails < backup.sql

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

## Environment Variables

### Backend Environment Variables

The backend service uses these environment variables (configured in docker-compose.yml):

- `DATABASE_HOST=postgres` - Database host (container name)
- `DATABASE_PORT=5432` - Database port
- `DATABASE_USER=postgres` - Database username
- `DATABASE_PASSWORD=postgres` - Database password
- `DATABASE_NAME=agnes_nails` - Database name
- `PORT=3001` - Backend API port
- `NODE_ENV=production` - Node environment

### Frontend Environment Variables

- `NEXT_PUBLIC_API_URL=http://localhost:3001` - Backend API URL
- `NODE_ENV=production` - Node environment

To customize these values, edit the `docker-compose.yml` file or create a `.env` file.

## Networking

All services communicate through a dedicated Docker network called `agnes-nails-network`. This allows:

- Backend to connect to PostgreSQL using hostname `postgres`
- Frontend to connect to Backend using hostname `backend` (internally)
- External access via exposed ports

## Volumes

### Persistent Data

- `postgres_data` - PostgreSQL data (persists between restarts)
- `postgres_data_dev` - Development database data

### Mounted Volumes (Development Mode Only)

- `./backend:/app` - Backend source code
- `./frontend:/app` - Frontend source code
- Node modules are stored in anonymous volumes to prevent conflicts

## Health Checks

- **PostgreSQL**: Checked using `pg_isready`
- **Backend**: Checked via HTTP endpoint
- **Frontend**: No health check (depends on backend)

Services wait for their dependencies to be healthy before starting.

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Find process using the port
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Kill the process or change ports in docker-compose.yml
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Build Errors

```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Permission Issues (Linux/Mac)

```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

## Production Deployment

For production deployment:

1. Update environment variables with secure values
2. Use secrets management for sensitive data
3. Set `synchronize: false` in backend TypeORM config
4. Use proper database migrations
5. Configure proper CORS origins
6. Use a reverse proxy (nginx) for SSL/HTTPS
7. Set up proper logging and monitoring

## Stopping the Application

```bash
# Stop services (keeps containers)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop, remove containers, and delete volumes (WARNING: deletes data)
docker-compose down -v
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
