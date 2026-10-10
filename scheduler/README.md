# Scheduler & Dashboard

Central hub for accessing workflows and tracking activity.

---

## Quick access

**Open `links.html` in your browser and bookmark it.**

It has one-click buttons for every workflow form. Works on any device on your network
(replace `localhost` with your PC's IP for phone/tablet access).

---

## What's in this folder

| File | What it does |
|---|---|
| `links.html` | Bookmark page — one-click access to all workflow forms |
| `status.html` | Activity log — generated every night at 11 PM |
| `job_log.csv` | Raw log file — every workflow writes here when it finishes |
| `config.json` | Settings — n8n host/port, workflow IDs, schedule time |

---

## Workflows to import

### 1. Job Logger
- Import `n8n/job-logger.json` → Save → Activate
- This is a **webhook utility** — other workflows call it to log their completion
- Webhook URL: `http://localhost:5679/webhook/automate-job-log`

**To make any workflow log itself:** add an HTTP Request node at the very end:
```
Method: POST
URL:    http://localhost:5679/webhook/automate-job-log
Body (JSON):
{
  "workflow": "My Workflow Name",
  "status":   "success",
  "details":  "whatever you want to record"
}
```

### 2. Status Page Generator
- Import `n8n/status-page.json` → Save → Activate
- Runs every night at 11 PM
- Reads `job_log.csv` → writes `status.html`
- Optionally sends a Telegram summary (uses `notifications/config.json`)

---

## Customise (edit config.json only)

| Setting | What it does |
|---|---|
| `n8n_host` | Change to your PC's IP for phone/tablet access links |
| `status_page_schedule` | Time to generate status page — `"23:00"` = 11 PM |
| `send_status_to_telegram` | `false` to disable nightly Telegram notification |
