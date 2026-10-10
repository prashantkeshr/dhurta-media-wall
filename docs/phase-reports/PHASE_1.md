# Phase 1 — Moment.Labs: Wallpaper Generation Studio

Date: 2026-10-11

## Design principles

- **Ollama always runs** — enriches every row whether prompt fields are full or empty
- **Use Case drives the entire aura** — wallpaper / poster / sticker / frame changes how Ollama composes the prompt
- **9:16 vertical master size** (1080×1920) — one image fits all platforms: phone wallpaper, Stories, Reels, TikTok, Pinterest
- **meta.json per project** — title, description, tags, prompts, model settings saved alongside images
- **Non-coder friendly** — edit CSV + 3 JSON files; no workflow nodes to touch

---

## Checklist

| Item | Status |
|---|---|
| `config.json` — ComfyUI URL, models, image size, schedule, Ollama config | PASS |
| `styles.json` — 8 style presets (Cinematic, Minimalist, Nature, Abstract, Neon, Vintage, Architecture, Space) | PASS |
| `styles.json` — each preset has `prompt_prefix`, `prompt_suffix`, `negative_prompt`, `steps`, `cfg`, `sampler` | PASS |
| `social.json` — instagram handle, watermark, DM text, cover card, device type | PASS |
| `projects.csv` — 10 sample rows with all columns including Use Case | PASS |
| `n8n/moment-labs-batch.json` — schedule trigger, reads CSV, processes pending rows | PASS |
| `n8n/moment-labs-batch.json` — Ollama enrichment node (fills ALL gaps, use-case aura) | PASS |
| `n8n/moment-labs-batch.json` — ComfyUI job submit (SDXL API workflow) | PASS |
| `n8n/moment-labs-batch.json` — bash polling node (max 36 × 5s = 3 min timeout) | PASS |
| `n8n/moment-labs-batch.json` — download images, write meta.json, update CSV status | PASS |
| `n8n/moment-labs-batch.json` — Telegram notification on completion | PASS |
| `n8n/moment-labs-batch.json` — logs to central job_log.csv via Job Logger | PASS |
| `n8n/moment-labs-instant.json` — form trigger with all key fields | PASS |
| `n8n/moment-labs-instant.json` — same Ollama + ComfyUI + save pipeline | PASS |
| `n8n/moment-labs-instant.json` — form response shows image count + folder path | PASS |
| `backgrounds/gaming/` — folder created with instructions | PASS |
| `README.md` — non-coder guide, column reference, Use Case table | PASS |

---

## Files

| File | Purpose |
|---|---|
| `wallpaper/config.json` | All settings — ComfyUI, Ollama, schedule, image size |
| `wallpaper/styles.json` | 8 style presets — Ollama base context |
| `wallpaper/social.json` | Social identity — handle, watermark, DM text |
| `wallpaper/projects.csv` | Project queue — one row = one wallpaper pack |
| `wallpaper/n8n/moment-labs-batch.json` | Scheduled batch pipeline |
| `wallpaper/n8n/moment-labs-instant.json` | Form-triggered instant generation |
| `wallpaper/backgrounds/gaming/` | Drop gaming backgrounds here |
| `wallpaper/README.md` | Non-coder guide |

---

## How to import and run

1. Start n8n: `launcher.bat` → option 1
2. Open n8n at `http://localhost:5679`
3. Workflows → Import → select `moment-labs-batch.json` → Save → Activate
4. Workflows → Import → select `moment-labs-instant.json` → Save → Activate
5. Open `scheduler/links.html` → click **Moment.Labs Instant** to test immediately
6. Edit `wallpaper/projects.csv` to add your real projects

---

## Use Case pipeline

| Use Case | Ollama aura | Best for |
|---|---|---|
| wallpaper | full-bleed immersive, no UI | phone/desktop bg, Stories |
| poster | studio focal point, ad quality | product drops, brand posts |
| sticker | isolated subject, transparent bg | Telegram stickers, merch |
| frame | ornate border, luxury style | certificates, special posts |

---

## Phase summary

| Phase | Name | Status |
|---|---|---|
| 0 | Foundation | ✅ |
| 1 | Moment.Labs — Wallpaper Studio | ✅ |
| 2 | AI Content Generator | ✅ |
| 3 | Image Processor | ✅ |
| 4 | Notification Hub | ✅ |
| 5 | Scheduler & Dashboard | ✅ |
