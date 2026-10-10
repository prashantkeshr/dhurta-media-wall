@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

title AUTOMATE — Setup

echo.
echo  ============================================
echo    AUTOMATE  ^|  n8n Automation Hub Setup
echo  ============================================
echo.

:: ── 1. Check Docker ──────────────────────────────────────────────────────────
echo [1/6] Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo.
    echo  ERROR: Docker is not running or not installed.
    echo  Please start Docker Desktop and re-run this script.
    echo.
    pause
    exit /b 1
)
echo        Docker OK.

:: ── 2. Create folder structure ───────────────────────────────────────────────
echo [2/6] Creating folder structure...
for %%d in (
    wallpaper\n8n
    wallpaper\output
    content\n8n
    content\output
    media\n8n
    media\input
    media\output
    notifications\n8n
    scheduler\n8n
    assets
    docs\phase-reports
    scripts
) do (
    if not exist "%%d" mkdir "%%d"
)
echo        Folders ready.

:: ── 3. Create .env from example if missing ───────────────────────────────────
echo [3/6] Checking config...
if not exist ".env" (
    copy ".env.example" ".env" >nul
    echo        .env created from defaults.
) else (
    echo        .env already exists, skipping.
)

:: ── 4. Pull n8n image ────────────────────────────────────────────────────────
echo [4/6] Pulling n8n image (this may take a minute on first run)...
docker pull n8nio/n8n:latest
if errorlevel 1 (
    echo  ERROR: Failed to pull n8n image. Check your internet connection.
    pause
    exit /b 1
)
echo        Image ready.

:: ── 5. Start container ───────────────────────────────────────────────────────
echo [5/6] Starting n8n container...
docker compose down --remove-orphans >nul 2>&1
docker compose up -d
if errorlevel 1 (
    echo  ERROR: Failed to start container. See logs with: docker compose logs
    pause
    exit /b 1
)
echo        Container started.

:: ── 6. Wait for healthy ──────────────────────────────────────────────────────
echo [6/6] Waiting for n8n to be ready...
set /a attempts=0
:wait_loop
set /a attempts+=1
if !attempts! gtr 30 (
    echo.
    echo  WARNING: n8n is taking longer than expected.
    echo  Check logs: docker compose logs automate-n8n
    goto done
)
docker inspect --format="{{.State.Health.Status}}" automate-n8n 2>nul | findstr /i "healthy" >nul
if errorlevel 1 (
    <nul set /p=.
    ping -n 2 127.0.0.1 >nul
    goto wait_loop
)

:done
echo.
echo.
echo  ============================================
echo    Setup complete!
echo  ============================================
echo.
echo    n8n UI  :  http://localhost:5679
echo    User    :  admin
echo    Password:  automate2026
echo.
echo    Edit .env to change port or credentials.
echo    Run launcher.bat to start/stop/view logs.
echo.
start http://localhost:5679
pause
