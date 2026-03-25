/**
 * CONTENT FACTORY - Backend Server
 * Deploy to Railway: add a Volume at /data, set DATA_DIR=/data
 *
 * Gets ALL imgflip memes + GIFs by:
 *   1. Hitting the JSON API for top 100 (with accurate box_count)
 *   2. Scraping every page of /memetemplates
 *   3. Scraping every page of /gif-templates
 * Everything is downloaded to disk - zero runtime dependency on imgflip.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');
const MEMES_DIR = path.join(DATA_DIR, 'memes');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(MEMES_DIR)) fs.mkdirSync(MEMES_DIR, { recursive: true });

// ============================================
// DEFAULTS
// ============================================

const DEFAULT_TEMPLATES = [
  { id: 'drake', name: 'Drake Approve/Reject', category: 'meme', description: 'Classic two-panel approve/reject format', icon: '🙅', visible: true, defaultMotion: 'zoom-in', type: 'custom', zones: [{ id: 'reject', type: 'text', position: 'top', label: 'Bad option (top)' }, { id: 'approve', type: 'text', position: 'bottom', label: 'Good option (bottom)' }], assetSlots: [] },
  { id: 'screenshot-caption', name: 'Screenshot + Caption', category: 'screenshot', description: 'Bold caption overlay', icon: '📱', visible: true, defaultMotion: 'pan-up', type: 'custom', zones: [{ id: 'caption', type: 'text', position: 'top', label: 'Caption text' }], assetSlots: [{ id: 'screenshot', label: 'Screenshot', position: 'center', required: true }] },
  { id: 'breaking-news', name: 'Breaking News', category: 'news', description: 'News ticker with headline', icon: '🚨', visible: true, defaultMotion: 'zoom-in', type: 'custom', zones: [{ id: 'headline', type: 'text', position: 'center', label: 'Headline' }, { id: 'subtext', type: 'text', position: 'bottom', label: 'Subtext' }], assetSlots: [] },
  { id: 'expanding-brain', name: 'Expanding Brain', category: 'meme', description: '4-tier escalation meme', icon: '🧠', visible: true, defaultMotion: 'pan-down', type: 'custom', zones: [{ id: 'level1', type: 'text', position: 'top', label: 'Level 1' }, { id: 'level2', type: 'text', position: 'upper-mid', label: 'Level 2' }, { id: 'level3', type: 'text', position: 'lower-mid', label: 'Level 3' }, { id: 'level4', type: 'text', position: 'bottom', label: 'Level 4' }], assetSlots: [] },
  { id: 'this-vs-that', name: 'This vs That', category: 'comparison', description: 'Side-by-side comparison', icon: '⚔️', visible: true, defaultMotion: 'parallax', type: 'custom', zones: [{ id: 'left-label', type: 'text', position: 'left', label: 'Left label' }, { id: 'right-label', type: 'text', position: 'right', label: 'Right label' }], assetSlots: [] },
  { id: 'quote-card', name: 'Quote Card', category: 'minimal', description: 'Clean quote layout', icon: '💬', visible: true, defaultMotion: 'fade-in', type: 'custom', zones: [{ id: 'quote', type: 'text', position: 'center', label: 'Quote text' }, { id: 'attribution', type: 'text', position: 'bottom', label: 'Attribution' }], assetSlots: [] },
  { id: 'hot-take', name: 'Hot Take', category: 'viral', description: 'Controversial opinion format', icon: '🔥', visible: true, defaultMotion: 'scale-bounce', type: 'custom', zones: [{ id: 'take', type: 'text', position: 'center', label: 'Your hot take' }], assetSlots: [] },
  { id: 'pov-stopper', name: 'POV Scroll Stopper', category: 'viral', description: 'POV format', icon: '👁️', visible: true, defaultMotion: 'zoom-out', type: 'custom', zones: [{ id: 'pov-text', type: 'text', position: 'top', label: 'POV: ...' }, { id: 'context', type: 'text', position: 'bottom', label: 'Context' }], assetSlots: [] },
  { id: 'listicle', name: 'Listicle / Tips', category: 'educational', description: 'Numbered list format', icon: '📝', visible: true, defaultMotion: 'zoom-in', type: 'custom', zones: [{ id: 'title', type: 'text', position: 'top', label: 'Title' }, { id: 'item1', type: 'text', position: 'upper-mid', label: 'Item 1' }, { id: 'item2', type: 'text', position: 'center', label: 'Item 2' }, { id: 'item3', type: 'text', position: 'lower-mid', label: 'Item 3' }], assetSlots: [] },
  { id: 'before-after', name: 'Before / After', category: 'comparison', description: 'Transformation comparison', icon: '✨', visible: true, defaultMotion: 'pan-down', type: 'custom', zones: [{ id: 'before-label', type: 'text', position: 'top', label: 'Before' }, { id: 'after-label', type: 'text', position: 'bottom', label: 'After' }], assetSlots: [] }
];

// ============================================
// FILE HELPERS
// ============================================

function initTemplatesFile() {
  if (!fs.existsSync(TEMPLATES_FILE)) {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(DEFAULT_TEMPLATES, null, 2));
    console.log('Seeded templates.json');
  }
}

function readTemplates() {
  try { return JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf8')); }
  catch (e) { return DEFAULT_TEMPLATES; }
}

function writeTemplates(templates) {
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
}

initTemplatesFile();

// ============================================
// NETWORK HELPERS
// ============================================

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function fetchText(url, redirects) {
  redirects = redirects || 0;
  if (redirects > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, { headers: { 'User-Agent': UA, 'Accept': 'text/html,*/*', 'Accept-Language': 'en-US,en;q=0.9' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = res.headers.location.startsWith('http') ? res.headers.location : 'https://imgflip.com' + res.headers.location;
        res.resume();
        return fetchText(next, redirects + 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function downloadFile(remoteUrl, filename, redirects) {
  redirects = redirects || 0;
  if (redirects > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    const filePath = path.join(MEMES_DIR, filename);
    if (fs.existsSync(filePath)) { resolve('/memes/' + filename); return; }
    const proto = remoteUrl.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filePath);
    proto.get(remoteUrl, { headers: { 'User-Agent': UA } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close(); fs.unlink(filePath, () => {});
        return downloadFile(res.headers.location, filename, redirects + 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close(); fs.unlink(filePath, () => {});
        return reject(new Error('HTTP ' + res.statusCode + ' for ' + remoteUrl));
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve('/memes/' + filename)));
    }).on('error', err => { file.close(); fs.unlink(filePath, () => {}); reject(err); });
    file.on('error', err => { file.close(); fs.unlink(filePath, () => {}); reject(err); });
  });
}

// ============================================
// SCRAPER
// ============================================

/**
 * Parse one imgflip page HTML → array of { id, name, url, box_count, isGif }
 */
function parsePage(html) {
  const results = [];
  const seen = new Set();

  // Strategy 1: match anchor → img pairs inside meme cards
  // <a href="/meme/123/Some-Name"><img src="https://i.imgflip.com/4/abc.jpg">
  const re1 = /href=["'](\/meme\/[^"']+)["'][^>]*>[\s\S]*?<img[^>]+src=["']([^"']*i\.imgflip\.com\/[^"']+\.(?:jpg|jpeg|png|gif|webp))["']/gi;
  let m;
  while ((m = re1.exec(html)) !== null) {
    const link = m[1];
    const imgUrl = m[2];
    const numericId = (link.match(/\/meme\/(\d+)/) || [])[1];
    const hashId = (imgUrl.match(/\/([a-z0-9]+)\.(?:jpg|gif|png|webp)$/i) || [])[1];
    const id = numericId || hashId;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const slug = link.replace(/\/meme\/\d*\/?/, '').replace(/[_-]/g, ' ');
    const name = slug.replace(/\b\w/g, c => c.toUpperCase()).trim() || ('Template ' + id);
    const ext = (imgUrl.match(/\.(gif|jpg|jpeg|png|webp)$/i) || ['', 'jpg'])[1].toLowerCase();
    results.push({ id, name, url: imgUrl, box_count: 2, isGif: ext === 'gif' });
  }

  // Strategy 2: fallback — every imgflip CDN image on the page
  const re2 = /src=["']https?:\/\/i\.imgflip\.com\/(?:4\/)?([a-z0-9]{3,})\.(?:jpg|gif|png|webp)["']/gi;
  while ((m = re2.exec(html)) !== null) {
    const id = m[1];
    if (seen.has(id)) continue;
    // Extract full URL
    const urlMatch = html.slice(m.index).match(/src=["'](https?:\/\/i\.imgflip\.com[^"']+)["']/i);
    if (!urlMatch) continue;
    seen.add(id);
    const imgUrl = urlMatch[1];
    const ext = (imgUrl.match(/\.(gif|jpg|jpeg|png|webp)$/i) || ['', 'jpg'])[1].toLowerCase();
    results.push({ id, name: 'Template ' + id, url: imgUrl, box_count: 2, isGif: ext === 'gif' });
  }

  return results;
}

/**
 * Scrape all pages of a section until empty
 */
async function scrapeAllPages(baseUrl, label, onPage) {
  const all = [];
  const seen = new Set();
  for (let page = 1; page <= 100; page++) {
    const url = page === 1 ? baseUrl : baseUrl + '?page=' + page;
    let html;
    try { html = await fetchText(url); }
    catch (e) { console.warn(label, 'page', page, 'error:', e.message); break; }

    const items = parsePage(html);
    if (items.length === 0) { console.log(label, 'page', page, '— empty, stopping'); break; }

    let added = 0;
    for (const item of items) {
      if (!seen.has(item.id)) { seen.add(item.id); all.push(item); added++; }
    }
    if (onPage) onPage(page, added, all.length);
    if (added === 0) break; // all duplicates
    await new Promise(r => setTimeout(r, 250)); // polite delay
  }
  return all;
}

// ============================================
// MIDDLEWARE + STATIC
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));
app.use('/memes', express.static(MEMES_DIR));

// ============================================
// TEMPLATES CRUD
// ============================================

app.get('/api/templates', (req, res) => res.json(readTemplates()));

app.post('/api/templates', (req, res) => {
  const templates = readTemplates();
  const t = { ...req.body, id: req.body.id || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now(), visible: req.body.visible !== false, createdAt: new Date().toISOString() };
  templates.push(t);
  writeTemplates(templates);
  res.json(t);
});

app.put('/api/templates/:id', (req, res) => {
  const templates = readTemplates();
  const idx = templates.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  templates[idx] = { ...templates[idx], ...req.body, id: req.params.id };
  writeTemplates(templates);
  res.json(templates[idx]);
});

app.delete('/api/templates/:id', (req, res) => {
  const templates = readTemplates();
  const idx = templates.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const tpl = templates[idx];
  if (tpl.localImagePath) {
    const fp = path.join(MEMES_DIR, path.basename(tpl.localImagePath));
    if (fs.existsSync(fp)) fs.unlink(fp, () => {});
  }
  templates.splice(idx, 1);
  writeTemplates(templates);
  res.json({ success: true });
});

// ============================================
// IMGFLIP — preview list (top 100 from API)
// ============================================

app.get('/api/imgflip/memes', async (req, res) => {
  try {
    const body = await fetchText('https://api.imgflip.com/get_memes');
    res.json(JSON.parse(body));
  } catch (e) {
    res.status(500).json({ error: 'Failed: ' + e.message });
  }
});

// ============================================
// IMGFLIP — import selected memes (from picker)
// ============================================

app.post('/api/imgflip/import', async (req, res) => {
  const { memes } = req.body;
  if (!Array.isArray(memes) || memes.length === 0)
    return res.status(400).json({ error: 'No memes provided' });
  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Transfer-Encoding', 'chunked');
  const templates = readTemplates();
  await doImport(memes, templates, res);
  res.end();
});

// ============================================
// IMGFLIP — import ALL (full scrape + download)
// ============================================

app.post('/api/imgflip/import-all', async (req, res) => {
  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Transfer-Encoding', 'chunked');
  const write = obj => res.write(JSON.stringify(obj) + '\n');

  write({ type: 'status', msg: 'Starting full scrape of imgflip memes + GIFs...' });

  let allMemes = [];

  // 1. JSON API (top 100, has box_count)
  try {
    write({ type: 'status', msg: 'Fetching imgflip API (top 100)...' });
    const body = await fetchText('https://api.imgflip.com/get_memes');
    const apiMemes = JSON.parse(body)?.data?.memes || [];
    const seen = new Set();
    for (const m of apiMemes) {
      seen.add(String(m.id));
      allMemes.push({ id: String(m.id), name: m.name, url: m.url, box_count: m.box_count, isGif: false });
    }
    write({ type: 'status', msg: 'API done: ' + allMemes.length + ' memes.' });

    // 2. Meme template pages
    write({ type: 'status', msg: 'Scraping all meme template pages...' });
    const memePages = await scrapeAllPages('https://imgflip.com/memetemplates', 'Memes', (page, added, total) => {
      write({ type: 'status', msg: 'Meme pages: page ' + page + ', +' + added + ' new (' + total + ' scraped so far)' });
    });
    for (const item of memePages) {
      if (!seen.has(item.id)) { seen.add(item.id); allMemes.push(item); }
    }
    write({ type: 'status', msg: 'Meme pages done. Total: ' + allMemes.length });

    // 3. GIF template pages
    write({ type: 'status', msg: 'Scraping all GIF template pages...' });
    const gifPages = await scrapeAllPages('https://imgflip.com/gif-templates', 'GIFs', (page, added, total) => {
      write({ type: 'status', msg: 'GIF pages: page ' + page + ', +' + added + ' new (' + total + ' scraped so far)' });
    });
    for (const item of gifPages) {
      if (!seen.has(item.id)) { seen.add(item.id); allMemes.push({ ...item, isGif: true }); }
    }
    write({ type: 'status', msg: 'GIF pages done. Grand total: ' + allMemes.length + ' templates found.' });

  } catch (e) {
    write({ type: 'error', msg: 'Scrape error: ' + e.message });
    res.end(); return;
  }

  // Filter already imported
  const templates = readTemplates();
  const importedIds = new Set(templates.filter(t => t.imgflipId).map(t => t.imgflipId));
  const toImport = allMemes.filter(m => !importedIds.has(String(m.id)));
  write({ type: 'status', msg: toImport.length + ' new to download (' + (allMemes.length - toImport.length) + ' already imported).' });

  await doImport(toImport, templates, res);
  res.end();
});

// ============================================
// SHARED DOWNLOAD + SAVE
// ============================================

async function doImport(memes, templates, res) {
  const write = obj => res.write(JSON.stringify(obj) + '\n');
  const importedIds = new Set(templates.filter(t => t.imgflipId).map(t => t.imgflipId));
  const total = memes.length;
  let done = 0;
  let imported = 0;

  for (const meme of memes) {
    if (importedIds.has(String(meme.id))) {
      done++;
      write({ type: 'progress', done, total, skipped: true, name: meme.name });
      continue;
    }

    const rawUrl = String(meme.url || '').trim();
    const extMatch = rawUrl.match(/\.(gif|jpg|jpeg|png|webp)$/i);
    const ext = extMatch ? '.' + extMatch[1].toLowerCase() : '.jpg';
    const isGif = ext === '.gif';
    const filename = 'imgflip-' + meme.id + ext;

    let localImagePath = null;
    if (!rawUrl || !rawUrl.startsWith('http')) {
      console.warn('Download skipped (no valid URL):', meme.name, '| url:', rawUrl || '(empty)');
    } else {
      try { localImagePath = await downloadFile(rawUrl, filename); }
      catch (e) { console.warn('Download failed:', meme.name, e.message); }
    }

    const boxCount = Math.max(1, parseInt(meme.box_count) || 2);
    const zoneLabels = ['Top text', 'Bottom text', 'Middle text', 'Text 4', 'Text 5', 'Text 6'];
    const zonePos    = ['top', 'bottom', 'center', 'upper-mid', 'lower-mid', 'center'];
    const zones = Array.from({ length: boxCount }, (_, i) => ({
      id: 'text' + (i + 1), type: 'text',
      position: zonePos[i] || 'center',
      label: zoneLabels[i] || 'Text ' + (i + 1)
    }));

    const tpl = {
      id: 'imgflip-' + meme.id,
      imgflipId: String(meme.id),
      localImagePath,
      name: meme.name,
      category: isGif ? 'gif-template' : 'imgflip',
      description: boxCount + '-panel ' + (isGif ? 'GIF' : 'meme'),
      icon: isGif ? '🎞️' : '🖼️',
      visible: true,
      defaultMotion: 'zoom-in',
      type: 'imgflip',
      zones,
      assetSlots: [],
      importedAt: new Date().toISOString()
    };

    templates.push(tpl);
    importedIds.add(String(meme.id));
    imported++;
    done++;

    // Save every 50 so a crash doesn't lose everything
    if (imported % 50 === 0) writeTemplates(templates);

    write({ type: 'progress', done, total, name: meme.name, isGif, localImagePath });
  }

  writeTemplates(templates);
  write({ type: 'done', imported, total });
}

// ============================================
// START
// ============================================

app.listen(PORT, () => {
  const memeCount = fs.readdirSync(MEMES_DIR).length;
  console.log('Content Factory running on port ' + PORT);
  console.log('Data: ' + DATA_DIR + ' | Memes on disk: ' + memeCount);
});