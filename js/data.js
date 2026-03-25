/**
 * CONTENT FACTORY - Data Configuration
 * Asset-driven meme/content generation engine
 */

// Canvas Dimensions (9:16 for Reels/Shorts/TikTok)
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;

// Safe Zones (avoiding platform UI overlays)
const SAFE_TOP = 180;
const SAFE_BOTTOM = 400;

// Motion effect types
const MOTION_EFFECTS = {
  ZOOM_IN: 'zoom-in',
  ZOOM_OUT: 'zoom-out',
  PAN_LEFT: 'pan-left',
  PAN_RIGHT: 'pan-right',
  PAN_UP: 'pan-up',
  PAN_DOWN: 'pan-down',
  PARALLAX: 'parallax',
  FADE_IN: 'fade-in',
  SCALE_BOUNCE: 'scale-bounce'
};

// Format Templates - The core meme/content formats
const FORMAT_TEMPLATES = [
  {
    id: 'drake',
    name: 'Drake Approve/Reject',
    category: 'meme',
    description: 'Classic two-panel approve/reject format',
    zones: [
      { id: 'reject', type: 'text', position: 'top', label: 'Bad option (top)' },
      { id: 'approve', type: 'text', position: 'bottom', label: 'Good option (bottom)' }
    ],
    assetSlots: [
      { id: 'reaction-top', label: 'Reject reaction', position: 'top-left' },
      { id: 'reaction-bottom', label: 'Approve reaction', position: 'bottom-left' }
    ],
    defaultMotion: MOTION_EFFECTS.ZOOM_IN,
    icon: '🙅‍♂️'
  },
  {
    id: 'screenshot-caption',
    name: 'Screenshot + Caption',
    category: 'screenshot',
    description: 'Your screenshot with bold caption overlay',
    zones: [
      { id: 'caption', type: 'text', position: 'top', label: 'Caption text' }
    ],
    assetSlots: [
      { id: 'screenshot', label: 'Screenshot/image', position: 'center', required: true }
    ],
    defaultMotion: MOTION_EFFECTS.PAN_UP,
    icon: '📱'
  },
  {
    id: 'breaking-news',
    name: 'Breaking News',
    category: 'news',
    description: 'News ticker style with headline',
    zones: [
      { id: 'headline', type: 'text', position: 'center', label: 'Headline' },
      { id: 'subtext', type: 'text', position: 'bottom', label: 'Subtext (optional)' }
    ],
    assetSlots: [
      { id: 'background', label: 'Background image', position: 'full' }
    ],
    defaultMotion: MOTION_EFFECTS.ZOOM_IN,
    icon: '🚨'
  },
  {
    id: 'expanding-brain',
    name: 'Expanding Brain',
    category: 'meme',
    description: '3-4 tier escalation meme',
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
    defaultMotion: MOTION_EFFECTS.PAN_DOWN,
    icon: '🧠'
  },
  {
    id: 'this-vs-that',
    name: 'This vs That',
    category: 'comparison',
    description: 'Side-by-side comparison split',
    zones: [
      { id: 'left-label', type: 'text', position: 'left', label: 'Left side label' },
      { id: 'right-label', type: 'text', position: 'right', label: 'Right side label' }
    ],
    assetSlots: [
      { id: 'left-image', label: 'Left side image', position: 'left' },
      { id: 'right-image', label: 'Right side image', position: 'right' }
    ],
    defaultMotion: MOTION_EFFECTS.PARALLAX,
    icon: '⚔️'
  },
  {
    id: 'reaction-text',
    name: 'Reaction + Text',
    category: 'meme',
    description: 'Big text with reaction image below',
    zones: [
      { id: 'main-text', type: 'text', position: 'top', label: 'Main text' }
    ],
    assetSlots: [
      { id: 'reaction', label: 'Reaction image', position: 'bottom', required: true }
    ],
    defaultMotion: MOTION_EFFECTS.SCALE_BOUNCE,
    icon: '😂'
  },
  {
    id: 'quote-card',
    name: 'Quote Card',
    category: 'minimal',
    description: 'Clean minimal quote layout',
    zones: [
      { id: 'quote', type: 'text', position: 'center', label: 'Quote text' },
      { id: 'attribution', type: 'text', position: 'bottom', label: 'Attribution (optional)' }
    ],
    assetSlots: [
      { id: 'background', label: 'Background (optional)', position: 'full' }
    ],
    defaultMotion: MOTION_EFFECTS.FADE_IN,
    icon: '💬'
  },
  {
    id: 'news-ticker',
    name: 'News Ticker',
    category: 'news',
    description: 'Red breaking news ticker style',
    zones: [
      { id: 'ticker-text', type: 'text', position: 'center', label: 'Ticker headline' }
    ],
    assetSlots: [
      { id: 'background', label: 'Background footage/image', position: 'full' }
    ],
    defaultMotion: MOTION_EFFECTS.PAN_LEFT,
    icon: '📺'
  },
  {
    id: 'pov-stopper',
    name: 'POV Scroll Stopper',
    category: 'viral',
    description: 'POV format that stops the scroll',
    zones: [
      { id: 'pov-text', type: 'text', position: 'top', label: 'POV: ...' },
      { id: 'context', type: 'text', position: 'bottom', label: 'Context (optional)' }
    ],
    assetSlots: [
      { id: 'main-visual', label: 'Main visual', position: 'center', required: true }
    ],
    defaultMotion: MOTION_EFFECTS.ZOOM_OUT,
    icon: '👁️'
  },
  {
    id: 'before-after',
    name: 'Before / After',
    category: 'comparison',
    description: 'Transformation comparison',
    zones: [
      { id: 'before-label', type: 'text', position: 'top', label: 'Before label' },
      { id: 'after-label', type: 'text', position: 'bottom', label: 'After label' }
    ],
    assetSlots: [
      { id: 'before-image', label: 'Before image', position: 'top' },
      { id: 'after-image', label: 'After image', position: 'bottom' }
    ],
    defaultMotion: MOTION_EFFECTS.PAN_DOWN,
    icon: '✨'
  },
  {
    id: 'listicle',
    name: 'Listicle / Tips',
    category: 'educational',
    description: 'Numbered list format',
    zones: [
      { id: 'title', type: 'text', position: 'top', label: 'Title' },
      { id: 'item1', type: 'text', position: 'upper-mid', label: 'Item 1' },
      { id: 'item2', type: 'text', position: 'center', label: 'Item 2' },
      { id: 'item3', type: 'text', position: 'lower-mid', label: 'Item 3' }
    ],
    assetSlots: [
      { id: 'background', label: 'Background', position: 'full' }
    ],
    defaultMotion: MOTION_EFFECTS.ZOOM_IN,
    icon: '📝'
  },
  {
    id: 'hot-take',
    name: 'Hot Take',
    category: 'viral',
    description: 'Controversial opinion format',
    zones: [
      { id: 'take', type: 'text', position: 'center', label: 'Your hot take' }
    ],
    assetSlots: [
      { id: 'fire-bg', label: 'Fire/dramatic background', position: 'full' }
    ],
    defaultMotion: MOTION_EFFECTS.SCALE_BOUNCE,
    icon: '🔥'
  }
];

// Asset categories for organization
const ASSET_CATEGORIES = [
  { id: 'reactions', name: 'Reactions', icon: '😂', description: 'Reaction faces and memes' },
  { id: 'backgrounds', name: 'Backgrounds', icon: '🖼️', description: 'Background images and textures' },
  { id: 'screenshots', name: 'Screenshots', icon: '📱', description: 'App/web screenshots' },
  { id: 'videos', name: 'Video Clips', icon: '🎬', description: 'Short video clips' },
  { id: 'brains', name: 'Brain Memes', icon: '🧠', description: 'Expanding brain levels' },
  { id: 'misc', name: 'Miscellaneous', icon: '📦', description: 'Other assets' }
];

// Text style presets
const TEXT_STYLES = {
  bold: {
    fontWeight: 'bold',
    fontSize: 72,
    color: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 4
  },
  caption: {
    fontWeight: 'bold',
    fontSize: 56,
    color: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 3
  },
  news: {
    fontWeight: 'bold',
    fontSize: 64,
    color: '#FFFFFF',
    background: '#CC0000'
  },
  quote: {
    fontWeight: 'normal',
    fontSize: 48,
    color: '#FFFFFF',
    fontStyle: 'italic'
  },
  minimal: {
    fontWeight: '500',
    fontSize: 42,
    color: '#FFFFFF'
  }
};

// Color themes for templates
const COLOR_THEMES = {
  dark: {
    background: '#0a0a0f',
    surface: '#111118',
    text: '#FFFFFF',
    accent: '#ec4899'
  },
  light: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#000000',
    accent: '#3b82f6'
  },
  neon: {
    background: '#0f0f23',
    surface: '#1a1a3e',
    text: '#00ff88',
    accent: '#ff00ff'
  },
  news: {
    background: '#1a1a2e',
    surface: '#CC0000',
    text: '#FFFFFF',
    accent: '#FFD700'
  }
};

// Export configuration
const EXPORT_CONFIG = {
  defaultDuration: 5,
  minDuration: 3,
  maxDuration: 15,
  fps: 30,
  format: 'webm',
  codec: 'vp8'
};

// Global app state initialization
const AppState = {
  assets: [],           // Uploaded assets
  headlines: [],        // User's headlines
  variations: [],       // Generated variations
  exportQueue: [],      // Items to export
  editingVariation: null // Currently editing
};

// Load saved data from localStorage
function loadSavedData() {
  try {
    const savedAssets = localStorage.getItem('cf_assets');
    if (savedAssets) AppState.assets = JSON.parse(savedAssets);
    
    const savedHeadlines = localStorage.getItem('cf_headlines');
    if (savedHeadlines) AppState.headlines = JSON.parse(savedHeadlines);
    
    const savedQueue = localStorage.getItem('cf_export_queue');
    if (savedQueue) AppState.exportQueue = JSON.parse(savedQueue);
  } catch (e) {
    console.log('Error loading saved data:', e);
  }
}

// Save data to localStorage
function saveData() {
  try {
    localStorage.setItem('cf_assets', JSON.stringify(AppState.assets));
    localStorage.setItem('cf_headlines', JSON.stringify(AppState.headlines));
    localStorage.setItem('cf_export_queue', JSON.stringify(AppState.exportQueue));
  } catch (e) {
    console.log('Error saving data:', e);
  }
}

// Initialize on load
loadSavedData();
