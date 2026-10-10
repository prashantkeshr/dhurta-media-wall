# Moment.Labs — Wallpaper Generation Studio

Premium AI-generated wallpaper packs for social media. One CSV row = one project.
Ollama enriches every prompt. ComfyUI generates the images. Everything saves itself.

---

## How it works

```
projects.csv  →  Ollama (enrich)  →  ComfyUI (generate)  →  output/  +  meta.json
                                                           →  Telegram notify
```

---

## Quick start

1. **Start n8n** — run `launcher.bat` → option 1
2. **Import workflows** — n8n → Workflows → Import from file
   - `n8n/moment-labs-batch.json` — runs automatically at the hour in `config.json`
   - `n8n/moment-labs-instant.json` — form you open in a browser, generates on demand
3. **Activate both workflows**
4. **Edit `projects.csv`** — add your projects, set `status` to `pending`
5. **Wait for batch time** or use the Instant form from `scheduler/links.html`

---

## Files

| File | What to edit |
|---|---|
| `config.json` | ComfyUI URL, model names, image size, schedule time |
| `styles.json` | Style presets — add/edit styles |
| `social.json` | Instagram handle, watermark, DM text |
| `projects.csv` | Your project queue |
| `backgrounds/gaming/` | Drop `.jpg`/`.png` gaming backgrounds here |

---

## projects.csv — Column guide

| Column | Required | Example | Notes |
|---|---|---|---|
| S.No | yes | 1 | Row number |
| project_name | yes | Cyber City Night | Folder name |
| style | yes | Neon | Must match a key in `styles.json` |
| theme | yes | futuristic city | Main subject |
| count | yes | 4 | Images per project |
| status | yes | pending | pending → done after generation |
| Use Case | yes | wallpaper | wallpaper / poster / sticker / frame |
| custom_prompt | no | glowing neons | Specific prompt — Ollama builds on it |
| prompt_add | no | rain on street | Extra detail added to prompt |
| negative_prompt | no | blur text | Overrides style default |
| mood | no | dark energetic | Passed to Ollama |
| color_palette | no | deep blue cyan | Passed to Ollama |
| subject_details | no | close-up on face | Passed to Ollama |
| model | no | realvis | Overrides `default_model` in config |
| steps | no | 30 | Overrides style default |
| cfg_scale | no | 8.5 | Guidance scale |
| aspect_ratio | no | 9:16 | Always 9:16 for now |
| background | no | gaming | gaming / studio / transparent |
| recycle_after_days | no | 30 | Days until folder can be recycled |
| priority | no | high | For your reference — not used by workflow |
| notes | no | First test | Your notes |

---

## Use Case auras

| Use Case | What Ollama does |
|---|---|
| **wallpaper** | Full-bleed immersive background — seamless, no UI elements |
| **poster** | Studio product shot — strong focal point, premium ad feel |
| **sticker** | Isolated subject on solid/transparent bg — bold clean edges |
| **frame** | Ornate border design — baroque or luxury frame, elegant inner space |

---

## Output structure

```
wallpaper/output/
  2026-10-11_Cyber_City_Night/
    Cyber_City_Night_01.png
    Cyber_City_Night_02.png
    Cyber_City_Night_03.png
    Cyber_City_Night_04.png
    meta.json          ← title, description, tags, prompts, date
```

---

## Customise without coding

Everything that matters is in a JSON or CSV file. No workflow nodes to touch.

- **Change image size** → `config.json` → `image.width` / `image.height`
- **Change schedule** → `config.json` → `batch_schedule_hour`
- **Add a new style** → `styles.json` → copy any block, rename the key
- **Change watermark** → `social.json` → `watermark.text`
- **Disable Telegram** → `social.json` → `"telegram_notify": false`
- **Add a project** → open `projects.csv` in Notepad, add a row, set `status` to `pending`

---

## Phone / tablet access

Open `scheduler/links.html` in your browser.
Replace `localhost` in the Instant form URL with your PC's IP address.
Bookmark it on your phone.
