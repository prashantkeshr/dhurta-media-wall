@echo off
cd /d "%~dp0.."
echo Stopping Automate n8n...
docker compose down
pause
