@echo off
REM Agnes Nails - Docker Start Script (Windows)

echo ===================================
echo Agnes Nails - Appointment System
echo ===================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Parse arguments
set MODE=%1
if "%MODE%"=="" set MODE=prod

if "%MODE%"=="dev" (
    echo Starting in DEVELOPMENT mode...
    docker-compose -f docker-compose.dev.yml up -d
) else if "%MODE%"=="prod" (
    echo Starting in PRODUCTION mode...
    docker-compose up -d
) else (
    echo Invalid mode. Use 'dev' or 'prod'
    echo Usage: start.bat [dev^|prod]
    exit /b 1
)

echo.
echo Waiting for services to start...
timeout /t 5 /nobreak >nul

REM Check service status
echo.
echo ===================================
echo Service Status:
echo ===================================
docker-compose ps

echo.
echo ===================================
echo Application URLs:
echo ===================================
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:3001
echo Database:  localhost:5432
echo.
echo To view logs: docker-compose logs -f
echo To stop:      docker-compose down
echo ===================================
