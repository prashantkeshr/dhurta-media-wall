# Media — Image Processor

Resize any image to all your platform sizes and add a watermark — in one click.

---

## How to customise (no coding needed)

### Change platform sizes
Open `platforms.json` in Notepad and edit the numbers:

```json
{ "name": "instagram_square", "w": 1080, "h": 1080 }
```

- `w` = width in pixels
- `h` = height in pixels
- `name` = output folder name

To add a new platform → copy any line and change the values.
To remove a platform → delete its line.

---

### Change the watermark
Open `watermark.json` in Notepad:

```json
{
  "text":       "your text here",   ← change this
  "font_size":  32,                 ← 8, 10, 12, 14, 16, 32, 64, or 128
  "color":      "#ffffff",          ← #ffffff = white, #000000 = black
  "position_x": 24,                 ← pixels from left edge
  "position_y": 24                  ← pixels from top edge
}
```

To **disable** the watermark: change `"text"` to `""`

---

## How to import into n8n

1. Open http://localhost:5679
2. Top-right → **Import from file**
3. Select `n8n/image-processor.json`
4. **Save** → **Activate**

---

## How to use

1. Open the form URL shown on the **Upload Image** node in n8n
2. Upload any `.jpg`, `.png`, or `.webp` file
3. Done — all platform sizes are saved to:

```
media/output/
  └── YYYY-MM-DD-HH-mm-ss/
        ├── instagram_square/   image_instagram_square.jpg
        ├── instagram_story/    image_instagram_story.jpg
        ├── youtube_thumbnail/  image_youtube_thumbnail.jpg
        └── ...
```

---

## Workflow

```
Upload Image
     │
Read Config & Split          ← reads platforms.json + watermark.json
(one branch per platform)    ← runs in parallel
     │
Resize to Platform Size      ← crops/stretches to w×h
     │
Apply Watermark              ← skipped automatically if text is empty
     │
Save to Disk                 ← writes to media/output/
     │
Summary                      ← shows total files saved + file list
```
