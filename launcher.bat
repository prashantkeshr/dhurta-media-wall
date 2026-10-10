@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

:: Load port from .env if present
set N8N_PORT=5679
if exist ".env" (
    for /f "tokens=1,2 delims==" %%a in (.env) do (
        if "%%a"=="N8N_PORT" set N8N_PORT=%%b
    )
)

:menu
cls
echo.
echo  ============================================
echo    AUTOMATE  ^|  n8n Automation Hub
echo  ============================================
echo.
docker ps --filter name=automate-n8n --format "  Status: {{.Status}}" 2>nul || echo   Status: not running
echo.
echo   1. Start n8n
echo   2. Stop n8n
echo   3. Restart n8n
echo   4. View logs (live)
echo   5. Open n8n in browser  ^(http://localhost:!N8N_PORT!^)
echo   6. Container status
echo   7. Exit
echo.
set /p choice=Select:

if "%choice%"=="1" (
    docker compose up -d
    echo Started. Opening browser...
    ping -n 3 127.0.0.1 >nul
    start http://localhost:!N8N_PORT!
    pause
    goto menu
)
if "%choice%"=="2" (
    docker compose down
    pause
    goto menu
)
if "%choice%"=="3" (
    docker compose restart
    pause
    goto menu
)
if "%choice%"=="4" (
    docker compose logs -f --tail=50
    goto menu
)
if "%choice%"=="5" (
    start http://localhost:!N8N_PORT!
    goto menu
)
if "%choice%"=="6" (
    docker ps -a --filter name=automate-n8n
    pause
    goto menu
)
if "%choice%"=="7" exit
goto menu
