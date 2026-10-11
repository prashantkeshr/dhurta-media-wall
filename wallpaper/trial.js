#!/usr/bin/env node
// ─── MOMENT.LABS TRIAL RUN ───────────────────────────────────────────────────
// Runs the full pipeline: Google Sheet → Ollama → ComfyUI → save
// Usage: node /data/wallpaper/trial.js

const fs   = require('fs');
const path = require('path');
const http = require('http');

const log = (tag, msg) => console.log(`[${tag}] ${msg}`);

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchJson(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.json();
}

async function main() {
  // ── 1. LOAD CONFIG ──────────────────────────────────────────────────────────
  const config  = JSON.parse(fs.readFileSync('/data/wallpaper/config.json',  'utf8'));
  const styles  = JSON.parse(fs.readFileSync('/data/wallpaper/styles.json',  'utf8'));
  const social  = JSON.parse(fs.readFileSync('/data/wallpaper/social.json',  'utf8'));
  const processedPath = '/data/wallpaper/processed.json';

  log('CONFIG', `Ollama: ${config.ollama_url}  ComfyUI: ${config.comfyui_url}`);
  log('CONFIG', `Source: ${config.projects_source || 'local'}`);

  // ── 2. FETCH PROJECT QUEUE ──────────────────────────────────────────────────
  let csvRaw;
  if ((config.projects_source || 'local') === 'google_sheet' && config.google_sheet_csv_url) {
    log('SHEET', `Fetching: ${config.google_sheet_csv_url}`);
    const res = await fetch(config.google_sheet_csv_url);
    if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
    csvRaw = await res.text();
    log('SHEET', 'Fetched OK');
  } else {
    csvRaw = fs.readFileSync('/data/wallpaper/projects.csv', 'utf8');
    log('SHEET', 'Using local projects.csv');
  }

  // ── 3. PARSE CSV ─────────────────────────────────────────────────────────────
  function parseLine(line) {
    const r = []; let cur = '', inQ = false;
    for (const c of line) {
      if (c === '"') { inQ = !inQ; }
      else if (c === ',' && !inQ) { r.push(cur.trim()); cur = ''; }
      else cur += c;
    }
    r.push(cur.trim()); return r;
  }
  const lines  = csvRaw.trim().split('\n');
  const header = parseLine(lines[0]);

  let processed = [];
  try { processed = JSON.parse(fs.readFileSync(processedPath, 'utf8')); } catch(e) {}
  const doneKeys = new Set(processed.map(p => p.key));

  const pending = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = parseLine(lines[i]);
    const row  = {};
    header.forEach((k, idx) => { row[k] = (vals[idx] || '').replace(/^"|"$/g, ''); });
    if (!row['S.No'] || isNaN(Number(row['S.No'])) || !row.project_name) continue;
    const key = `${row['S.No']}_${row.project_name}`;
    if (doneKeys.has(key)) { log('SKIP', `Already done: ${row.project_name}`); continue; }
    const st = (row.status || '').toLowerCase().trim();
    if (st && st !== 'pending') { log('SKIP', `Status=${st}: ${row.project_name}`); continue; }
    pending.push({ ...row, _key: key });
  }

  log('QUEUE', `${pending.length} pending project(s)`);
  if (pending.length === 0) { log('DONE', 'Nothing to process.'); return; }

  // ── 4. PROCESS FIRST PENDING ROW ────────────────────────────────────────────
  const row      = pending[0];
  const styleKey = row.style || 'Cinematic';
  const preset   = styles[styleKey] || styles['Cinematic'];
  const useCase  = (row['Use Case'] || 'wallpaper').toLowerCase();
  const aura     = { wallpaper:'full-bleed immersive background', poster:'studio product shot', sticker:'isolated subject transparent bg', frame:'ornate decorative border' }[useCase] || 'full-bleed';

  log('ROW', `Project: "${row.project_name}"  Style: ${styleKey}  UseCase: ${useCase}  Count: ${row.count || 4}`);

  // ── 5. OLLAMA ENRICHMENT ─────────────────────────────────────────────────────
  log('OLLAMA', `Calling ${config.ollama_model} ...`);
  const systemPrompt = `You are an AI art director. Respond ONLY with a JSON object — no markdown. Required keys: main_prompt, negative_prompt, title, description, tags (array 10), mood, color_palette, subject_details`;
  const userPrompt   = `Project: ${row.project_name}\nTheme: ${row.theme}\nStyle: ${styleKey}\nUse Case: ${useCase} (${aura})\nMood: ${row.mood||''}\nColors: ${row.color_palette||''}\nCustom: ${row.custom_prompt||''}\nExtra: ${row.prompt_add||''}\nSubject: ${row.subject_details||''}\nStyle prefix: ${preset.prompt_prefix}\nStyle suffix: ${preset.prompt_suffix}\nMake vivid SDXL prompt for 9:16 vertical image. Include #momentlabs in tags.`;

  let enriched;
  try {
    const oData = await fetchJson(`${config.ollama_url}/api/chat`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ model: config.ollama_model, messages:[{role:'system',content:systemPrompt},{role:'user',content:userPrompt}], stream:false, options:{temperature:0.8,num_predict:2000} })
    });
    const raw = oData.message?.content || oData.response || '{}';
    const m   = raw.match(/\{[\s\S]*\}/);
    let jsonStr = m ? m[0] : raw;
    // Repair truncated JSON: close any open arrays/objects
    try { enriched = JSON.parse(jsonStr); }
    catch(pe) {
      // Count brackets to close
      let opens = 0, openArr = 0, inStr = false, esc = false;
      for (const c of jsonStr) {
        if (esc) { esc=false; continue; }
        if (c==='\\') { esc=true; continue; }
        if (c==='"') inStr=!inStr;
        if (!inStr) { if(c==='{') opens++; else if(c==='}') opens--; else if(c==='[') openArr++; else if(c===']') openArr--; }
      }
      if (inStr) jsonStr += '"';
      while (openArr-- > 0) jsonStr += ']';
      while (opens-- > 0) jsonStr += '}';
      enriched = JSON.parse(jsonStr);
    }
    log('OLLAMA', `✓ Title: "${enriched.title}"`);
    log('OLLAMA', `  Prompt: ${enriched.main_prompt?.substring(0,80)}...`);
  } catch(e) {
    log('OLLAMA', `WARN fallback: ${e.message}`);
    enriched = { main_prompt:`${preset.prompt_prefix}, ${row.theme}, ${preset.prompt_suffix}`, negative_prompt:preset.negative_prompt, title:row.project_name, description:row.theme, tags:['#momentlabs'], mood:row.mood, color_palette:row.color_palette, subject_details:row.theme };
  }

  // ── 6. COMFYUI SUBMIT ────────────────────────────────────────────────────────
  const models   = config.models || {};
  const modelKey = row.model || config.default_model || 'realvis';
  const modelFile= models[modelKey] || models['realvis'];
  const count    = parseInt(row.count) || config.default_count || 4;
  const steps    = parseInt(row.steps) || preset.steps || config.default_steps || 25;
  const cfg      = parseFloat(row.cfg_scale) || preset.cfg || config.default_cfg || 7.5;
  const W = config.image?.width || 1080, H = config.image?.height || 1920;

  log('COMFYUI', `Model: ${modelFile}  Steps: ${steps}  CFG: ${cfg}  Size: ${W}x${H}  Count: ${count}`);

  const workflow = {
    "1": { class_type:"CheckpointLoaderSimple", inputs:{ckpt_name:modelFile} },
    "2": { class_type:"CLIPTextEncode", inputs:{text:enriched.main_prompt, clip:["1",1]} },
    "3": { class_type:"CLIPTextEncode", inputs:{text:enriched.negative_prompt||'watermark,text,blur', clip:["1",1]} },
    "4": { class_type:"EmptyLatentImage", inputs:{width:W, height:H, batch_size:count} },
    "5": { class_type:"KSampler", inputs:{model:["1",0], positive:["2",0], negative:["3",0], latent_image:["4",0], seed:Math.floor(Math.random()*9999999999), steps, cfg, sampler_name:preset.sampler||"euler_ancestral", scheduler:"karras", denoise:1.0} },
    "6": { class_type:"VAEDecode", inputs:{samples:["5",0], vae:["1",2]} },
    "7": { class_type:"SaveImage", inputs:{images:["6",0], filename_prefix:`ml_${row.project_name.replace(/\s+/g,'_').toLowerCase()}`} }
  };

  const submitData = await fetchJson(`${config.comfyui_url}/prompt`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ prompt:workflow, client_id:'moment_labs_trial' })
  });
  const promptId = submitData.prompt_id;
  if (!promptId) throw new Error('ComfyUI returned no prompt_id');
  log('COMFYUI', `✓ Job queued: ${promptId}`);

  // ── 7. POLL UNTIL DONE ───────────────────────────────────────────────────────
  log('POLL', `Waiting for generation (max ${config.poll_max_attempts||36} × ${config.poll_interval_sec||5}s)...`);
  let images = null;
  for (let i = 1; i <= (config.poll_max_attempts||36); i++) {
    await sleep((config.poll_interval_sec||5) * 1000);
    try {
      const hist  = await fetchJson(`${config.comfyui_url}/history/${promptId}`);
      const entry = hist[promptId];
      if (entry?.status?.completed) {
        images = [];
        Object.values(entry.outputs||{}).forEach(o => { if(o.images) o.images.forEach(img => images.push(img)); });
        log('POLL', `✓ Done at attempt ${i}  —  ${images.length} image(s)`);
        break;
      } else {
        const queuePos = entry?.status?.messages?.find(m=>m[0]==='execution_cached') ? 'cached' : 'generating';
        process.stdout.write(`\r[POLL] Attempt ${i}/${config.poll_max_attempts||36} — ${queuePos}...`);
      }
    } catch(e) { /* still running */ }
  }
  console.log('');
  if (!images || images.length === 0) throw new Error('ComfyUI timed out or returned no images');

  // ── 8. DOWNLOAD & SAVE ───────────────────────────────────────────────────────
  const safeP     = row.project_name.replace(/[^a-zA-Z0-9_\-]/g,'_');
  const ts        = new Date().toISOString().split('T')[0];
  const outFolder = path.join(config.output_folder || '/data/wallpaper/output', `${ts}_${safeP}`);
  fs.mkdirSync(outFolder, {recursive:true});

  const saved = [];
  for (let i = 0; i < images.length; i++) {
    const img    = images[i];
    const fname  = `${safeP}_${String(i+1).padStart(2,'0')}.png`;
    const fpath  = path.join(outFolder, fname);
    const dlUrl  = `${config.comfyui_url}/view?filename=${img.filename}&type=${img.type}&subfolder=${img.subfolder||''}`;
    await new Promise((res,rej) => {
      const f = fs.createWriteStream(fpath);
      http.get(dlUrl, r => { r.pipe(f); f.on('finish', ()=>{ f.close(); res(); }); }).on('error', rej);
    });
    saved.push(fname);
    log('SAVE', `${fname}`);
  }

  // meta.json
  const meta = { project_name:row.project_name, use_case:useCase, style:styleKey, date:new Date().toISOString(), title:enriched.title, description:enriched.description, tags:enriched.tags, mood:enriched.mood, color_palette:enriched.color_palette, subject_details:enriched.subject_details, main_prompt:enriched.main_prompt, negative_prompt:enriched.negative_prompt, model:modelKey, steps, cfg, image_count:saved.length, images:saved };
  fs.writeFileSync(path.join(outFolder,'meta.json'), JSON.stringify(meta,null,2));
  log('SAVE', `meta.json written`);

  // mark processed
  processed.push({ key:row._key, name:row.project_name, date:new Date().toISOString(), folder:outFolder, images:saved.length });
  fs.writeFileSync(processedPath, JSON.stringify(processed,null,2));

  log('✅', `DONE — "${row.project_name}"  →  ${outFolder}`);
  log('✅', `Images: ${saved.join(', ')}`);
}

main().catch(e => { console.error('\n[ERROR]', e.message); process.exit(1); });
