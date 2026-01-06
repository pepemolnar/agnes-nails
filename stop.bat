@echo off
REM Agnes Nails - Docker Stop Script (Windows)

echo ===================================
echo Stopping Agnes Nails Services
echo ===================================
echo.

REM Parse arguments
set REMOVE_VOLUMES=%1

if "%REMOVE_VOLUMES%"=="clean" (
    echo WARNING: This will remove all data including the database!
    set /p CONFIRM="Are you sure? (yes/no): "
    if /i "%CONFIRM%"=="yes" (
        echo Stopping and removing all containers, networks, and volumes...
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v
    ) else (
        echo Cancelled.
        exit /b 0
    )
) else (
    echo Stopping containers...
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
)

echo.
echo Services stopped successfully.
echo.
echo To start again: start.bat [dev^|prod]
echo ===================================
