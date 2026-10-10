# Phase 4 — Notification & Reporting Hub

Date: 2026-10-11

## Design principle

- **Telegram only** — free, works on every device, no email config needed
- **No n8n credentials required** — bot token lives in config.json, calls Telegram API directly via HTTP Request node
- **Zero code to change** — all settings in `notifications/config.json`

## Checklist

| Item | Status |
|---|---|
| `notifications/config.json` — self-documented with _help/_tip keys | PASS |
| `error-alert.json` — triggers on any workflow failure | PASS |
| `error-alert.json` — skips silently if notify_on_error = false | PASS |
| `error-alert.json` — clear error if token not yet configured | PASS |
| `daily-summary.json` — scheduled trigger (default 8 AM) | PASS |
| `daily-summary.json` — counts content, media, wallpaper output files | PASS |
| `daily-summary.json` — graceful "nothing today" message | PASS |
| Messages use Telegram HTML formatting (bold, italic) | PASS |
| docker-compose.yml updated — notifications + scheduler volumes added | PASS |
| README with step-by-step Telegram setup (2 min) | PASS |

## Workflows

### `notifications/n8n/error-alert.json`
```
On Any Workflow Error → Read Config & Build Message → Send Telegram Alert
```
Set this as the **global error workflow** in n8n Settings → Workflows → Error Workflow.

### `notifications/n8n/daily-summary.json`
```
Every Day at 8 AM → Count Today's Output → Send Daily Summary
```
Scans `/data/content/output`, `/data/media/output`, `/data/wallpaper/output` for files modified today.

## Telegram message examples

**Error alert:**
```
🚨 Workflow Failed
📋 Workflow: Image Processor
❌ Error: No image found
🕐 Time: 11 Oct 2026, 2:30 PM
```

**Daily summary:**
```
📊 Daily Summary — 11 Oct 2026
✅ 7 item(s) generated today
📝 Content files:  3
🖼️  Media batches:  2
🖼️  Wallpapers:     2
```

## Next

Phase 5 — Scheduler & Dashboard (central job board, status page)
