/**
 * CONTENT FACTORY - Backend Server
 * Serves the app and provides a persistent templates API
 * Deploy to Railway: set PORT env var automatically handled
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Data directory - on Railway, mount a volume at /data for persistence
// Falls back to ./data for local dev
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default templates (seeded on first run)
const DEFAULT_TEMPLATES = [
  {
    id: 'drake', name: 'Drake Approve/Reject', category: 'meme',
    description: 'Classic two-panel approve/reject format', icon: '🙅‍♂️',
    visible: true,
    zones: [
      { id: 'reject', type: 'text', position: 'top', label: 'Bad option (top)' },
      { id: 'approve', type: 'text', position: 'bottom', label: 'Good option (bottom)' }
    ],
    assetSlots: [
      { id: 'reaction-top', label: 'Reject reaction', position: 'top-left' },
      { id: 'reaction-bottom', label: 'Approve reaction', position: 'bottom-left' }
    ],
    defaultMotion: 'zoom-in'
  },
  {
    id: 'screenshot-caption', name: 'Screenshot + Caption', category: 'screenshot',
    description: 'Your screenshot with bold caption overlay', icon: '📱',
    visible: true,
    zones: [{ id: 'caption', type: 'text', position: 'top', label: 'Caption text' }],
    assetSlots: [{ id: 'screenshot', label: 'Screenshot/image', position: 'center', required: true }],
    defaultMotion: 'pan-up'
  },
  {
    id: 'breaking-news', name: 'Breaking News', category: 'news',
    description: 'News ticker style with headline', icon: '🚨',
    visible: true,
    zones: [
      { id: 'headline', type: 'text', position: 'center', label: 'Headline' },
      { id: 'subtext', type: 'text', position: 'bottom', label: 'Subtext (optional)' }
    ],
    assetSlots: [{ id: 'background', label: 'Background image', position: 'full' }],
    defaultMotion: 'zoom-in'
  },
  {
    id: 'expanding-brain', name: 'Expanding Brain', category: 'meme',
    description: '3-4 tier escalation meme', icon: '🧠',
    visible: true,
    zones: [
      { id: 'level1', type: 'text', position: 'top', label: 'Level 1 (basic)' },
      { id: 'level2', type: 'text', position: 'upper-mid', label: 'Level 2' },
      { id: 'level3', type: 'text', position: 'lower-mid', label: 'Level 3' },
      { id: 'level4', type: 'text', position: 'bottom', label: 'Level 4 (galaxy brain)' }
    ],
    assetSlots: [
      { id: 'brain1', label: 'Brain level 1', position: 'right-1' },
      { id: 'brain2', label: 'Brain level 2', position: 'right-2' },
      { id: 'brain3', label: 'Brain level 3', position: 'right-3' },
      { id: 'brain4', label: 'Brain level 4', position: 'right-4' }
    ],
    defaultMotion: 'pan-down'
  },
  {
    id: 'this-vs-that', name: 'This vs That', category: 'comparison',
    description: 'Side-by-side comparison split', icon: '⚔️',
    visible: true,
    zones: [
      { id: 'left-label', type: 'text', position: 'left', label: 'Left side label' },
      { id: 'right-label', type: 'text', position: 'right', label: 'Right side label' }
    ],
    assetSlots: [
      { id: 'left-image', label: 'Left side image', position: 'left' },
      { id: 'right-image', label: 'Right side image', position: 'right' }
    ],
    defaultMotion: 'parallax'
  },
  {
    id: 'reaction-text', name: 'Reaction + Text', category: 'meme',
    description: 'Big text with reaction image below', icon: '😂',
    visible: true,
    zones: [{ id: 'main-text', type: 'text', position: 'top', label: 'Main text' }],
    assetSlots: [{ id: 'reaction', label: 'Reaction image', position: 'bottom', required: true }],
    defaultMotion: 'scale-bounce'
  },
  {
    id: 'quote-card', name: 'Quote Card', category: 'minimal',
    description: 'Clean minimal quote layout', icon: '💬',
    visible: true,
    zones: [
      { id: 'quote', type: 'text', position: 'center', label: 'Quote text' },
      { id: 'attribution', type: 'text', position: 'bottom', label: 'Attribution (optional)' }
    ],
    assetSlots: [{ id: 'background', label: 'Background (optional)', position: 'full' }],
    defaultMotion: 'fade-in'
  },
  {
    id: 'news-ticker', name: 'News Ticker', category: 'news',
    description: 'Red breaking news ticker style', icon: '📺',
    visible: true,
    zones: [{ id: 'ticker-text', type: 'text', position: 'center', label: 'Ticker headline' }],
    assetSlots: [{ id: 'background', label: 'Background footage/image', position: 'full' }],
    defaultMotion: 'pan-left'
  },
  {
    id: 'pov-stopper', name: 'POV Scroll Stopper', category: 'viral',
    description: 'POV format that stops the scroll', icon: '👁️',
    visible: true,
    zones: [
      { id: 'pov-text', type: 'text', position: 'top', label: 'POV: ...' },
      { id: 'context', type: 'text', position: 'bottom', label: 'Context (optional)' }
    ],
    assetSlots: [{ id: 'main-visual', label: 'Main visual', position: 'center', required: true }],
    defaultMotion: 'zoom-out'
  },
  {
    id: 'before-after', name: 'Before / After', category: 'comparison',
    description: 'Transformation comparison', icon: '✨',
    visible: true,
    zones: [
      { id: 'before-label', type: 'text', position: 'top', label: 'Before label' },
      { id: 'after-label', type: 'text', position: 'bottom', label: 'After label' }
    ],
    assetSlots: [
      { id: 'before-image', label: 'Before image', position: 'top' },
      { id: 'after-image', label: 'After image', position: 'bottom' }
    ],
    defaultMotion: 'pan-down'
  },
  {
    id: 'listicle', name: 'Listicle / Tips', category: 'educational',
    description: 'Numbered list format', icon: '📝',
    visible: true,
    zones: [
      { id: 'title', type: 'text', position: 'top', label: 'Title' },
      { id: 'item1', type: 'text', position: 'upper-mid', label: 'Item 1' },
      { id: 'item2', type: 'text', position: 'center', label: 'Item 2' },
      { id: 'item3', type: 'text', position: 'lower-mid', label: 'Item 3' }
    ],
    assetSlots: [{ id: 'background', label: 'Background', position: 'full' }],
    defaultMotion: 'zoom-in'
  },
  {
    id: 'hot-take', name: 'Hot Take', category: 'viral',
    description: 'Controversial opinion format', icon: '🔥',
    visible: true,
    zones: [{ id: 'take', type: 'text', position: 'center', label: 'Your hot take' }],
    assetSlots: [{ id: 'fire-bg', label: 'Fire/dramatic background', position: 'full' }],
    defaultMotion: 'scale-bounce'
  }
];

// Initialize templates file if it doesn't exist
function initTemplatesFile() {
  if (!fs.existsSync(TEMPLATES_FILE)) {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(DEFAULT_TEMPLATES, null, 2));
    console.log('✅ Initialized templates.json with default templates');
  }
}

// Read templates from disk
function readTemplates() {
  try {
    const data = fs.readFileSync(TEMPLATES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading templates:', e);
    return DEFAULT_TEMPLATES;
  }
}

// Write templates to disk
function writeTemplates(templates) {
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
}

// Initialize
initTemplatesFile();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname)); // serve frontend

// ============================================
// TEMPLATES API
// ============================================

// GET all templates
app.get('/api/templates', (req, res) => {
  const templates = readTemplates();
  res.json(templates);
});

// POST create new template
app.post('/api/templates', (req, res) => {
  const templates = readTemplates();
  const newTemplate = {
    ...req.body,
    id: req.body.id || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    visible: req.body.visible !== false,
    createdAt: new Date().toISOString()
  };

  // Ensure unique ID
  if (templates.find(t => t.id === newTemplate.id)) {
    newTemplate.id = newTemplate.id + '-' + Date.now();
  }

  templates.push(newTemplate);
  writeTemplates(templates);
  res.json(newTemplate);
});

// PUT update template (including visibility toggle)
app.put('/api/templates/:id', (req, res) => {
  const templates = readTemplates();
  const idx = templates.findIndex(t => t.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Template not found' });
  }

  templates[idx] = { ...templates[idx], ...req.body, id: req.params.id };
  writeTemplates(templates);
  res.json(templates[idx]);
});

// DELETE template
app.delete('/api/templates/:id', (req, res) => {
  let templates = readTemplates();
  const idx = templates.findIndex(t => t.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Template not found' });
  }

  templates.splice(idx, 1);
  writeTemplates(templates);
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏭 Content Factory running on port ${PORT}`);
  console.log(`📁 Templates stored at: ${TEMPLATES_FILE}`);
});
