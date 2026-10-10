# Notifications — Telegram Alerts

Get error alerts and a daily summary on your phone via Telegram.
Free. No app install needed beyond Telegram. Works on any device.

---

## One-time setup (2 minutes)

### Step 1 — Create a Telegram bot

1. Open Telegram → search **@BotFather**
2. Send: `/newbot`
3. Give it a name (e.g. `Automate Hub`)
4. Give it a username ending in `bot` (e.g. `MyAutomateBot`)
5. BotFather replies with your **token** — looks like `7123456789:AAFxyz...`

### Step 2 — Get your Chat ID

1. Open Telegram → search **@userinfobot**
2. Send: `/start`
3. It replies with your **Id** number (e.g. `987654321`)

### Step 3 — Fill in config.json

Open `notifications/config.json` in Notepad:

```json
"telegram_bot_token": "7123456789:AAFxyz...",
"telegram_chat_id":   "987654321"
```

Save. That's it.

---

## Import workflows into n8n

1. Open http://localhost:5679
2. Import `n8n/error-alert.json` → Save → Activate
3. Import `n8n/daily-summary.json` → Save → Activate

### Set error-alert as the global error handler

1. n8n → **Settings** (bottom-left gear)
2. **Workflows** → **Error Workflow**
3. Select **"Error Alert — Telegram"**
4. Save

Now every workflow failure will notify you on Telegram automatically.

---

## What you receive

### On any workflow error
```
🚨 Workflow Failed

📋 Workflow: Image Processor — Resize & Watermark
❌ Error: No image found. Please upload an image.
🕐 Time: 11 Oct 2026, 2:30 PM

— Automate Hub
```

### Every morning at 8 AM
```
📊 Daily Summary — 11 Oct 2026

✅ 7 item(s) generated today

📝 Content files:   3
🖼️  Media batches:   2
🖼️  Wallpapers:      2

— Automate Hub
```

---

## Customise (edit config.json only)

| Setting | What it does |
|---|---|
| `daily_summary_time` | When to send summary — `"08:00"` = 8 AM |
| `notify_on_error` | `false` to mute error alerts |
| `project_name` | Name shown at the bottom of every message |
