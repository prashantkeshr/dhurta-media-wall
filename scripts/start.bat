@echo off
cd /d "%~dp0.."
echo Starting Automate n8n...
docker compose up -d
echo.
echo n8n UI  : http://localhost:5679
echo User    : admin
echo Pass    : automate2026
echo.
pause
