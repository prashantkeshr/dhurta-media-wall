# Content — AI Content Generator

Generates a blog post + social caption from a topic using local Ollama. No internet required.

## How to import

1. Open n8n at http://localhost:5679
2. Top-right → **Import from file**
3. Select `n8n/ai-content-generator.json`
4. Click **Save** → **Activate**

## How to use

Open the form URL shown in n8n under the **Content Form** node trigger URL.
Works from any device on the same network.

**Form fields:**
| Field | Description |
|---|---|
| Topic | What to write about |
| Tone | Professional / Casual / Inspirational / Educational |
| Language | English / Hindi / Hinglish |
| Model | Ollama model to use (default: qwen3:8b) |

## Output

Saved to `output/` as a `.md` file:
```
YYYY-MM-DD_HHmmss_topic-slug.md
```

Each file contains:
- Blog post (350 words max)
- Social caption (4 sentences + 5 hashtags)

## Workflow diagram

```
Content Form
     │
   Setup  (set topic / tone / language / model / timestamp)
     │
   ┌─┴─────────────────────┐
   │                       │
Generate Blog Post    Generate Caption
(Ollama parallel)    (Ollama parallel)
   │                       │
   └──────────┬────────────┘
            Merge
              │
        Save & Package
        (writes .md to output/)
```

## Requirements

- Ollama running on host with at least one model pulled
- n8n container running (docker compose up -d)
- `content/` folder mounted at `/data/content` in container (already in docker-compose.yml)
