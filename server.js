/**
 * CONTENT FACTORY - Backend Server
 * Deploy to Railway: add a Volume at /data, set DATA_DIR=/data
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

const DEFAULT_TEMPLATES = [
  { id: 'drake', name: 'Drake Approve/Reject', category: 'meme', description: 'Classic two-panel approve/reject format', icon: '🙅‍♂️', visible: true, zones: [{ id: 'reject', type: 'text', position: 'top', label: 'Bad option (top)' }, { id: 'approve', type: 'text', position: 'bottom', label: 'Good option (bottom)' }], assetSlots: [{ id: 'reaction-top', label: 'Reject reaction', position: 'top-left' }, { id: 'reaction-bottom', label: 'Approve reaction', position: 'bottom-left' }], defaultMotion: 'zoom-in' },
  { id: 'screenshot-caption', name: 'Screenshot + Caption', category: 'screenshot', description: 'Your screenshot with bold caption overlay', icon: '📱', visible: true, zones: [{ id: 'caption', type: 'text', position: 'top', label: 'Caption text' }], assetSlots: [{ id: 'screenshot', label: 'Screenshot/image', position: 'center', required: true }], defaultMotion: 'pan-up' },
  { id: 'breaking-news', name: 'Breaking News', category: 'news', description: 'News ticker style with headline', icon: '🚨', visible: true, zones: [{ id: 'headline', type: 'text', position: 'center', label: 'Headline' }, { id: 'subtext', type: 'text', position: 'bottom', label: 'Subtext (optional)' }], assetSlots: [{ id: 'background', label: 'Background image', position: 'full' }], defaultMotion: 'zoom-in' },
  { id: 'expanding-brain', name: 'Expanding Brain', category: 'meme', description: '3-4 tier escalation meme', icon: '🧠', visible: true, zones: [{ id: 'level1', type: 'text', position: 'top', label: 'Level 1 (basic)' }, { id: 'level2', type: 'text', position: 'upper-mid', label: 'Level 2' }, { id: 'level3', type: 'text', position: 'lower-mid', label: 'Level 3' }, { id: 'level4', type: 'text', position: 'bottom', label: 'Level 4 (galaxy brain)' }], assetSlots: [{ id: 'brain1', label: 'Brain level 1', position: 'right-1' }, { id: 'brain2', label: 'Brain level 2', position: 'right-2' }, { id: 'brain3', label: 'Brain level 3', position: 'right-3' }, { id: 'brain4', label: 'Brain level 4', position: 'right-4' }], defaultMotion: 'pan-down' },
  { id: 'this-vs-that', name: 'This vs That', category: 'comparison', description: 'Side-by-side comparison split', icon: '⚔️', visible: true, zones: [{ id: 'left-label', type: 'text', position: 'left', label: 'Left side label' }, { id: 'right-label', type: 'text', position: 'right', label: 'Right side label' }], assetSlots: [{ id: 'left-image', label: 'Left side image', position: 'left' }, { id: 'right-image', label: 'Right side image', position: 'right' }], defaultMotion: 'parallax' },
  { id: 'reaction-text', name: 'Reaction + Text', category: 'meme', description: 'Big text with reaction image below', icon: '😂', visible: true, zones: [{ id: 'main-text', type: 'text', position: 'top', label: 'Main text' }], assetSlots: [{ id: 'reaction', label: 'Reaction image', position: 'bottom', required: true }], defaultMotion: 'scale-bounce' },
  { id: 'quote-card', name: 'Quote Card', category: 'minimal', description: 'Clean minimal quote layout', icon: '💬', visible: true, zones: [{ id: 'quote', type: 'text', position: 'center', label: 'Quote text' }, { id: 'attribution', type: 'text', position: 'bottom', label: 'Attribution (optional)' }], assetSlots: [{ id: 'background', label: 'Background (optional)', position: 'full' }], defaultMotion: 'fade-in' },
  { id: 'news-ticker', name: 'News Ticker', category: 'news', description: 'Red breaking news ticker style', icon: '📺', visible: true, zones: [{ id: 'ticker-text', type: 'text', position: 'center', label: 'Ticker headline' }], assetSlots: [{ id: 'background', label: 'Background footage/image', position: 'full' }], defaultMotion: 'pan-left' },
  { id: 'pov-stopper', name: 'POV Scroll Stopper', category: 'viral', description: 'POV format that stops the scroll', icon: '👁️', visible: true, zones: [{ id: 'pov-text', type: 'text', position: 'top', label: 'POV: ...' }, { id: 'context', type: 'text', position: 'bottom', label: 'Context (optional)' }], assetSlots: [{ id: 'main-visual', label: 'Main visual', position: 'center', required: true }], defaultMotion: 'zoom-out' },
  { id: 'before-after', name: 'Before / After', category: 'comparison', description: 'Transformation comparison', icon: '✨', visible: true, zones: [{ id: 'before-label', type: 'text', position: 'top', label: 'Before label' }, { id: 'after-label', type: 'text', position: 'bottom', label: 'After label' }], assetSlots: [{ id: 'before-image', label: 'Before image', position: 'top' }, { id: 'after-image', label: 'After image', position: 'bottom' }], defaultMotion: 'pan-down' },
  { id: 'listicle', name: 'Listicle / Tips', category: 'educational', description: 'Numbered list format', icon: '📝', visible: true, zones: [{ id: 'title', type: 'text', position: 'top', label: 'Title' }, { id: 'item1', type: 'text', position: 'upper-mid', label: 'Item 1' }, { id: 'item2', type: 'text', position: 'center', label: 'Item 2' }, { id: 'item3', type: 'text', position: 'lower-mid', label: 'Item 3' }], assetSlots: [{ id: 'background', label: 'Background', position: 'full' }], defaultMotion: 'zoom-in' },
  { id: 'hot-take', name: 'Hot Take', category: 'viral', description: 'Controversial opinion format', icon: '🔥', visible: true, zones: [{ id: 'take', type: 'text', position: 'center', label: 'Your hot take' }], assetSlots: [{ id: 'fire-bg', label: 'Fire/dramatic background', position: 'full' }], defaultMotion: 'scale-bounce' }
];

function initTemplatesFile() {
  if (!fs.existsSync(TEMPLATES_FILE)) {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(DEFAULT_TEMPLATES, null, 2));
    console.log('✅ Seeded templates.json');
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

// Download a remote image/GIF and save to MEMES_DIR
// Returns the local web path: "/memes/imgflip-12345.jpg"
function downloadImage(remoteUrl, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(MEMES_DIR, filename);
    if (fs.existsSync(filePath)) { resolve('/memes/' + filename); return; }

    const protocol = remoteUrl.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filePath);

    protocol.get(remoteUrl, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        fs.unlink(filePath, () => {});
        return downloadImage(response.headers.location, filename).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(filePath, () => {});
        return reject(new Error('HTTP ' + response.statusCode));
      }
      response.pipe(file);
      file.on('finish', () => file.close(() => resolve('/memes/' + filename)));
    }).on('error', (err) => {
      file.close();
      fs.unlink(filePath, () => {});
      reject(err);
    });

    file.on('error', (err) => {
      file.close();
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));
app.use('/memes', express.static(MEMES_DIR));

// Templates API
app.get('/api/templates', (req, res) => res.json(readTemplates()));

app.post('/api/templates', (req, res) => {
  const templates = readTemplates();
  const t = { ...req.body, id: req.body.id || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), visible: req.body.visible !== false, createdAt: new Date().toISOString() };
  if (templates.find(x => x.id === t.id)) t.id = t.id + '-' + Date.now();
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
  // Delete stored image file if present
  if (tpl.localImagePath) {
    const fp = path.join(MEMES_DIR, path.basename(tpl.localImagePath));
    if (fs.existsSync(fp)) fs.unlink(fp, () => {});
  }
  templates.splice(idx, 1);
  writeTemplates(templates);
  res.json({ success: true });
});

// Imgflip meme list proxy (used only during the import wizard)
app.get('/api/imgflip/memes', async (req, res) => {
  try {
    const body = await new Promise((resolve, reject) => {
      https.get('https://api.imgflip.com/get_memes', (r) => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => resolve(d));
        r.on('error', reject);
      }).on('error', reject);
    });
    res.json(JSON.parse(body));
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch from imgflip' });
  }
});

// Import: download every selected meme image to disk, stream progress back
app.post('/api/imgflip/import', async (req, res) => {
  const { memes } = req.body;
  if (!Array.isArray(memes) || memes.length === 0)
    return res.status(400).json({ error: 'No memes provided' });

  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Transfer-Encoding', 'chunked');

  const templates = readTemplates();
  const imported = [];
  let done = 0;

  for (const meme of memes) {
    if (templates.find(t => t.imgflipId === String(meme.id))) {
      done++;
      res.write(JSON.stringify({ type: 'progress', done, total: memes.length, skipped: true, name: meme.name }) + '\n');
      continue;
    }

    const ext = (new URL(meme.url).pathname.match(/\.(gif|jpg|jpeg|png|webp)$/i) || ['.jpg'])[0];
    const filename = 'imgflip-' + meme.id + ext;
    let localImagePath = null;

    try {
      localImagePath = await downloadImage(meme.url, filename);
    } catch (e) {
      console.warn('Failed to download', meme.name, e.message);
    }

    const labels = ['Top text', 'Bottom text', 'Middle text', 'Text 4', 'Text 5', 'Text 6'];
    const positions = ['top', 'bottom', 'center', 'upper-mid', 'lower-mid', 'center'];
    const zones = Array.from({ length: meme.box_count }, (_, i) => ({
      id: 'text' + (i + 1), type: 'text',
      position: positions[i] || 'center',
      label: labels[i] || ('Text ' + (i + 1))
    }));

    const template = {
      id: 'imgflip-' + meme.id,
      imgflipId: String(meme.id),
      localImagePath,
      name: meme.name,
      category: 'imgflip',
      description: meme.box_count + '-panel meme',
      icon: ext === '.gif' ? '🎞️' : '🖼️',
      visible: true,
      defaultMotion: 'zoom-in',
      type: 'imgflip',
      zones,
      assetSlots: [],
      importedAt: new Date().toISOString()
    };

    templates.push(template);
    imported.push(template);
    done++;
    res.write(JSON.stringify({ type: 'progress', done, total: memes.length, name: meme.name, localImagePath }) + '\n');
  }

  writeTemplates(templates);
  res.write(JSON.stringify({ type: 'done', imported: imported.length, templates: imported }) + '\n');
  res.end();
});

app.listen(PORT, () => {
  console.log('🏭 Content Factory on port ' + PORT);
  console.log('📁 Data: ' + DATA_DIR);
  console.log('🖼️  Memes: ' + MEMES_DIR);
});
