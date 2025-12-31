@echo off
REM Quick Docker deployment script for Hospital AI Assistant (Windows)

echo ========================================
echo Hospital AI Assistant - Docker Deployment
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo WARNING: .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo .env file created. Please edit it with your API keys:
    echo    - GROQ_API_KEY (required for AI features^)
    echo    - DB_PASSWORD (optional, defaults to postgres123^)
    echo.
    pause
)

echo Starting Docker containers...
docker-compose up -d

echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo Deployment complete!
echo.
echo Container Status:
docker-compose ps

echo.
echo ========================================
echo Access the application:
echo    http://localhost:3000
echo ========================================
echo.
echo Useful commands:
echo    View logs:        docker-compose logs -f
echo    Stop services:    docker-compose down
echo    Restart:          docker-compose restart
echo    Reset database:   docker-compose down -v ^&^& docker-compose up -d
echo.
pause
