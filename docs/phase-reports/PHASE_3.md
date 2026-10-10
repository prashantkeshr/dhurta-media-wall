# Phase 3 — Media Processing Toolkit

Date: 2026-10-11

## Design principle

All customisable settings live in plain JSON files a non-coder can edit in Notepad.
Nobody needs to touch the n8n workflow itself.

| What to change | Where to change it |
|---|---|
| Platform sizes / add new platform | `media/platforms.json` |
| Watermark text, size, color, position | `media/watermark.json` |
| Disable watermark | Set `"text": ""` in watermark.json |

## Checklist

| Item | Status |
|---|---|
| `platforms.json` — self-documented with _help keys | PASS |
| `watermark.json` — self-documented with _tip keys | PASS |
| Workflow reads both JSON files at runtime | PASS |
| One branch per platform (parallel processing) | PASS |
| Resize node uses platform w×h from config | PASS |
| Watermark node skips gracefully when text = "" | PASS |
| Output saved per-platform under timestamped folder | PASS |
| Summary node shows file count + list | PASS |
| README with plain-language change instructions | PASS |

## Workflow: `media/n8n/image-processor.json`

```
Upload Image → Read Config & Split → Resize → Watermark → Save → Summary
```

- **Upload Image** — n8n form; one file field; works from any device on LAN
- **Read Config & Split** — Code node reads platforms.json + watermark.json from /data/media/; creates one output item per platform; all carry the original image binary
- **Resize to Platform Size** — editImage node; dimensions from $json.width / $json.height
- **Apply Watermark** — editImage text node; no-op when watermark_text = ""
- **Save to Disk** — writeBinaryFile; path = /data/media/output/ts/platform/name_platform.jpg
- **Summary** — aggregates all items; returns total count + file list

## Output structure

```
media/output/
  └── 2026-10-11-14-30-00/
        ├── instagram_square/    photo_instagram_square.jpg
        ├── instagram_story/     photo_instagram_story.jpg
        ├── youtube_thumbnail/   photo_youtube_thumbnail.jpg
        └── ...
```

## Next

Phase 1 — Wallpaper Generation Pipeline (Google Sheet → ComfyUI → output)
