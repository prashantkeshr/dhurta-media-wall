# Phase 5 — Scheduler & Dashboard

Date: 2026-10-11

## Design principle

- **No server needed** — `links.html` is a static bookmark page; `status.html` is generated locally
- **job_log.csv** is the data store — plain CSV any workflow can append to
- **Job Logger** is a webhook utility — any workflow logs itself by POSTing one HTTP request

## Checklist

| Item | Status |
|---|---|
| `links.html` — dark-themed bookmark page, all workflow form buttons | PASS |
| `links.html` — tip for phone/tablet access (replace localhost with IP) | PASS |
| `job-logger.json` — webhook receiver, appends to job_log.csv | PASS |
| `job-logger.json` — creates CSV with header on first run | PASS |
| `status-page.json` — nightly schedule trigger | PASS |
| `status-page.json` — reads job_log.csv, generates dark-themed status.html | PASS |
| `status-page.json` — shows today's activity + last 100 history | PASS |
| `status-page.json` — optional Telegram notification | PASS |
| `config.json` — all settings centralised, self-documented | PASS |
| docker-compose.yml — scheduler volume already added in Phase 4 | PASS |

## Files

| File | Purpose |
|---|---|
| `scheduler/links.html` | Static bookmark page — one-click form access |
| `scheduler/status.html` | Generated nightly — activity log |
| `scheduler/job_log.csv` | Auto-created — raw log |
| `scheduler/config.json` | Settings |
| `scheduler/n8n/job-logger.json` | Webhook utility — receives log POSTs |
| `scheduler/n8n/status-page.json` | Nightly HTML generator |

## How any workflow logs itself

Add one HTTP Request node at the end of any workflow:
```
POST http://localhost:5679/webhook/automate-job-log
{ "workflow": "Name", "status": "success", "details": "..." }
```

## Project complete

All 5 phases done (Phase 1 Wallpaper skipped per user — can be added any time).

| Phase | Name | Status |
|---|---|---|
| 0 | Foundation | ✅ |
| 1 | Wallpaper Generation | ⏭ skipped |
| 2 | AI Content Generation | ✅ |
| 3 | Media Processing | ✅ |
| 4 | Notification Hub | ✅ |
| 5 | Scheduler & Dashboard | ✅ |
