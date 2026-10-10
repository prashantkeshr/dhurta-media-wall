# Phase 2 — AI Content Generation

Date: 2026-10-11

## Checklist

| Item | Status |
|---|---|
| Workflow JSON importable into n8n | PASS |
| Form trigger — works from any device on LAN | PASS |
| Parallel Ollama calls (blog + caption simultaneously) | PASS |
| Merge node waits for both before saving | PASS |
| Output saved as `.md` to `content/output/` | PASS |
| Model selectable at runtime (not hardcoded) | PASS |
| Language support: English / Hindi / Hinglish | PASS |
| Tone support: Professional / Casual / Inspirational / Educational | PASS |
| README with import steps | PASS |

## Workflow: `content/n8n/ai-content-generator.json`

```
Content Form → Setup → [Blog Post ‖ Caption] → Merge → Save & Package
```

- **Content Form** — n8n form trigger; form URL works on any device on the network
- **Setup** — normalises inputs, adds timestamp for filename
- **Generate Blog Post / Generate Caption** — parallel HTTP POST to `host.docker.internal:11434/api/generate` (Ollama)
- **Merge** — waits for both Ollama responses before proceeding
- **Save & Package** — Code node writes timestamped `.md` to `/data/content/output/`

## Output format

```
YYYY-MM-DD_HHmmss_topic-slug.md
---
# Topic
> Generated: …  Tone: … Language: … Model: …

## Blog Post
…350 words…

## Social Caption
…4 sentences + 5 hashtags…
```

## How to import

1. Start n8n: `launcher.bat` → option 1
2. Open http://localhost:5679
3. Import `content/n8n/ai-content-generator.json`
4. Save + Activate
5. Copy the form URL from the Content Form node
6. Open URL on any device → fill form → content saved to `content/output/`

## Next

Phase 3 — Media Processing Toolkit (batch resize, watermark, FFmpeg thumbnails)
