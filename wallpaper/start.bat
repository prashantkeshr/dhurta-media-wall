@echo off
setlocal EnableDelayedExpansion
title Moment.Labs — Service Launcher

:: ─── PATHS ────────────────────────────────────────────────────────────────────
set "COMFYUI_DIR=%USERPROFILE%\.dhurta\ComfyUI"
set "COMFYUI_PY=%COMFYUI_DIR%\.venv\Scripts\python.exe"
set "AUTOMATE_DIR=%~dp0..\"
set "COMFYUI_PORT=8188"
set "OLLAMA_PORT=11434"
set "N8N_PORT=1080"

:MENU
cls
echo.
echo  ====================================================
echo   ^  Moment.Labs — Service Launcher
echo  ====================================================
echo.
call :STATUS_LINE "Ollama"   "%OLLAMA_PORT%"
call :STATUS_LINE "ComfyUI"  "%COMFYUI_PORT%"
call :STATUS_LINE "n8n"      "%N8N_PORT%"
echo.
echo  ──────────────────────────────────────────────────
echo   [1]  Start ALL  (Ollama + ComfyUI + n8n)
echo   [2]  Start Ollama only
echo   [3]  Start ComfyUI only
echo   [4]  Start n8n only
echo  ──────────────────────────────────────────────────
echo   [5]  Stop n8n  (Docker)
echo   [6]  Open n8n Dashboard in browser
echo   [7]  Open Moment.Labs links page
echo   [8]  Refresh status
echo   [0]  Exit
echo  ──────────────────────────────────────────────────
echo.
set /p CHOICE=  Choose an option:

if "%CHOICE%"=="1" goto START_ALL
if "%CHOICE%"=="2" goto START_OLLAMA
if "%CHOICE%"=="3" goto START_COMFYUI
if "%CHOICE%"=="4" goto START_N8N
if "%CHOICE%"=="5" goto STOP_N8N
if "%CHOICE%"=="6" goto OPEN_N8N
if "%CHOICE%"=="7" goto OPEN_LINKS
if "%CHOICE%"=="8" goto MENU
if "%CHOICE%"=="0" goto EXIT
echo   Invalid choice. Press any key to try again.
pause >nul
goto MENU


:: ─── START ALL ─────────────────────────────────────────────────────────────────
:START_ALL
cls
echo.
echo  Starting all services for Moment.Labs...
echo.
call :DO_OLLAMA
call :DO_COMFYUI
call :DO_N8N
echo.
echo  All services launched. Opening links page in 5 seconds...
timeout /t 5 >nul
start "" "%~dp0..\scheduler\links.html"
goto MENU


:: ─── START INDIVIDUAL ──────────────────────────────────────────────────────────
:START_OLLAMA
cls
echo.
call :DO_OLLAMA
echo.
pause
goto MENU

:START_COMFYUI
cls
echo.
call :DO_COMFYUI
echo.
pause
goto MENU

:START_N8N
cls
echo.
call :DO_N8N
echo.
pause
goto MENU


:: ─── STOP N8N ──────────────────────────────────────────────────────────────────
:STOP_N8N
cls
echo.
echo  Stopping n8n Docker container...
cd /d "%AUTOMATE_DIR%"
docker compose stop n8n
echo.
echo  Done. Press any key to return.
pause >nul
goto MENU


:: ─── OPEN LINKS ────────────────────────────────────────────────────────────────
:OPEN_N8N
start "" "http://localhost:%N8N_PORT%"
goto MENU

:OPEN_LINKS
start "" "%~dp0..\scheduler\links.html"
goto MENU


:: ─── EXIT ──────────────────────────────────────────────────────────────────────
:EXIT
echo.
echo  Bye.
exit /b 0


:: ══════════════════════════════════════════════════════════════════════════════
:: HELPER: Check if a port is listening and print a status line
::   Usage: call :STATUS_LINE "Label" "Port"
:: ══════════════════════════════════════════════════════════════════════════════
:STATUS_LINE
set "_LABEL=%~1"
set "_PORT=%~2"
netstat -an 2>nul | findstr /C:":%_PORT% " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL%==0 (
  echo   [RUNNING]  %_LABEL%  ^(port %_PORT%^)
) else (
  echo   [STOPPED]  %_LABEL%  ^(port %_PORT%^)
)
exit /b


:: ══════════════════════════════════════════════════════════════════════════════
:: DO_OLLAMA  — start Ollama serve in a new window if not already running
:: ══════════════════════════════════════════════════════════════════════════════
:DO_OLLAMA
netstat -an 2>nul | findstr /C:":%OLLAMA_PORT% " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL%==0 (
  echo   [SKIP]     Ollama already running on port %OLLAMA_PORT%
  exit /b
)
echo   [START]    Launching Ollama...
where ollama >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo   [ERROR]    'ollama' not found in PATH. Install from https://ollama.com
  exit /b 1
)
start "Ollama" cmd /k "ollama serve"
timeout /t 3 >nul
echo   [OK]       Ollama window opened.
exit /b


:: ══════════════════════════════════════════════════════════════════════════════
:: DO_COMFYUI  — start ComfyUI in a new window if not already running
:: ══════════════════════════════════════════════════════════════════════════════
:DO_COMFYUI
netstat -an 2>nul | findstr /C:":%COMFYUI_PORT% " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL%==0 (
  echo   [SKIP]     ComfyUI already running on port %COMFYUI_PORT%
  exit /b
)
echo   [START]    Launching ComfyUI...
if not exist "%COMFYUI_PY%" (
  echo   [ERROR]    ComfyUI venv not found at: %COMFYUI_PY%
  echo              Expected location: %COMFYUI_DIR%
  exit /b 1
)
start "ComfyUI" cmd /k "cd /d "%COMFYUI_DIR%" && "%COMFYUI_PY%" main.py --listen 0.0.0.0 --port %COMFYUI_PORT% --gpu-only"
timeout /t 3 >nul
echo   [OK]       ComfyUI window opened  (takes ~30 s to load models).
exit /b


:: ══════════════════════════════════════════════════════════════════════════════
:: DO_N8N  — start n8n via Docker Compose if not already running
:: ══════════════════════════════════════════════════════════════════════════════
:DO_N8N
netstat -an 2>nul | findstr /C:":%N8N_PORT% " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL%==0 (
  echo   [SKIP]     n8n already running on port %N8N_PORT%
  exit /b
)
echo   [START]    Starting n8n via Docker Compose...
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo   [ERROR]    Docker is not running. Start Docker Desktop first.
  exit /b 1
)
cd /d "%AUTOMATE_DIR%"
docker compose up -d n8n
if %ERRORLEVEL% neq 0 (
  echo   [ERROR]    docker compose failed. Check automate\docker-compose.yml
  exit /b 1
)
echo   [OK]       n8n container started. Waiting for it to be ready...
:WAIT_N8N
timeout /t 3 >nul
netstat -an 2>nul | findstr /C:":%N8N_PORT% " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% neq 0 goto WAIT_N8N
echo   [READY]    n8n is live at http://localhost:%N8N_PORT%
exit /b
