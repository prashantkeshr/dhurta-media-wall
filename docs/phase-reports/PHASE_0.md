# Phase 0 — Foundation

Date: 2026-10-11

## Philosophy

- **No custom dashboard** — n8n IS the UI when needed; everything else is headless
- **Any device** — just Docker; bring this folder to any machine and run setup.bat
- **One command setup** — setup.bat handles Docker check → folder creation → image pull → container start → health wait → browser open
- **Economical** — n8n community edition (free), local execution, no paid APIs required

## Checklist

| Item | Status |
|---|---|
| Folder structure with per-automation n8n/ subfolders | PASS |
| docker-compose.yml — port 5679, health check, pruning enabled | PASS |
| .env.example — port/credentials configurable without editing yml | PASS |
| setup.bat — fully automated cold-start (6 steps, no manual steps) | PASS |
| launcher.bat — start/stop/restart/logs/open with live status | PASS |

## Folder Layout

```
automate/
├── wallpaper/
│   ├── n8n/        ← workflow JSONs
│   └── output/     ← generated wallpapers
├── content/
│   ├── n8n/
│   └── output/
├── media/
│   ├── n8n/
│   ├── input/
│   └── output/
├── notifications/
│   └── n8n/
├── scheduler/
│   └── n8n/
├── assets/
├── docs/phase-reports/
├── .env.example    ← copy to .env to override port/credentials
├── docker-compose.yml
├── setup.bat       ← run once on any new machine
└── launcher.bat    ← daily driver
```

## How to use on a new machine

1. Install Docker Desktop
2. Copy this folder
3. Double-click `setup.bat`
4. Done — browser opens at n8n

## n8n Access (defaults)

- UI: http://localhost:5679
- User: admin
- Pass: automate2026

## Next

Phase 1 — Wallpaper Generation Pipeline
