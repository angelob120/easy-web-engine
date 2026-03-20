/**
 * EASY WEB STUDIOS - CONTENT ENGINE
 * Data Configuration
 */

// Default Niches (these are the variation factors for mockup template)
const DEFAULT_NICHES = [
  'Plumber',
  'Roofer',
  'Landscaper',
  'Barber',
  'Salon',
  'Contractor',
  'Dentist',
  'Auto Shop',
  'HVAC',
  'Electrician'
];

// Default Cities (Metro Detroit) - for other templates
const DEFAULT_CITIES = [
  'Detroit',
  'Dearborn',
  'Warren',
  'Southfield',
  'Ann Arbor',
  'Flint',
  'Lansing',
  'Troy',
  'Livonia',
  'Sterling Heights'
];

// Default Hook Lines
const DEFAULT_HOOKS = [
  'Your competitors are doing this',
  'Stop losing customers',
  'This took 60 seconds',
  'FREE website? Yes really',
  'Watch me build this'
];

// Default Taglines
const DEFAULT_TAGLINES = [
  'Just Pay Hosting',
  'No Design Fees',
  'Launch in 24 Hours',
  'Built For You',
  '100% Custom'
];

// Niche Accent Colors (the colored text - subtitle)
const NICHE_COLORS = {
  'Plumber': '#67D4E8',      // Cyan/light blue
  'Roofer': '#D4A03C',       // Gold
  'Landscaper': '#4ADE80',   // Bright green
  'Barber': '#A78BFA',       // Purple
  'Salon': '#F472B6',        // Pink
  'Contractor': '#FB923C',   // Orange
  'Dentist': '#22D3EE',      // Cyan
  'Auto Shop': '#F87171',    // Red
  'HVAC': '#818CF8',         // Indigo
  'Electrician': '#FACC15'   // Yellow
};

// Niche Background Colors (dark gradient base)
const NICHE_BG_COLORS = {
  'Plumber': '#1A2D33',      // Dark teal
  'Roofer': '#2A2015',       // Dark brown
  'Landscaper': '#162016',   // Dark green
  'Barber': '#1F1A2E',       // Dark purple
  'Salon': '#2A1520',        // Dark pink
  'Contractor': '#2A1A10',   // Dark orange
  'Dentist': '#152530',      // Dark cyan
  'Auto Shop': '#2A1515',    // Dark red
  'HVAC': '#1A1A30',         // Dark indigo
  'Electrician': '#2A2815'   // Dark yellow
};

// Niche Emojis
const NICHE_EMOJIS = {
  'Plumber': '🔧',
  'Roofer': '🏠',
  'Landscaper': '🌿',
  'Barber': '💈',
  'Salon': '💅',
  'Contractor': '🔨',
  'Dentist': '🦷',
  'Auto Shop': '🚗',
  'HVAC': '❄️',
  'Electrician': '⚡'
};

// Niche display names for subtitle (some need adjustment)
const NICHE_DISPLAY = {
  'Plumber': 'PLUMBING',
  'Roofer': 'ROOFING',
  'Landscaper': 'LANDSCAPER',
  'Barber': 'BARBER',
  'Salon': 'SALON',
  'Contractor': 'CONTRACTOR',
  'Dentist': 'DENTAL',
  'Auto Shop': 'AUTO SHOP',
  'HVAC': 'HVAC',
  'Electrician': 'ELECTRICIAN'
};

// Niche Mockup Images (stored as data URLs)
// Users upload their device mockup composites per niche
let NICHE_MOCKUPS = {};

// Load saved mockups from localStorage
try {
  const saved = localStorage.getItem('niche_mockups');
  if (saved) {
    NICHE_MOCKUPS = JSON.parse(saved);
  }
} catch (e) {
  console.log('No saved mockups found');
}

// Template Definitions
const TEMPLATES = [
  {
    id: 'mockup-showcase',
    name: 'Device Mockup Showcase',
    type: 'professional',
    layout: 'mockup-showcase',
    variables: ['NICHE'],  // Only niche - each niche = 1 variation
    description: '100% FREE headline with device mockups - 1 per niche',
    requiresMockup: true
  },
  {
    id: 'simple-offer',
    name: 'Simple Offer',
    type: 'professional',
    layout: 'simple-offer',
    variables: ['NICHE', 'CITY'],
    description: 'Clean offer layout without mockups'
  },
  {
    id: '1',
    name: 'Hook + Value Bomb',
    type: 'viral',
    layout: 'hook-value',
    variables: ['NICHE', 'CITY', 'HOOK'],
    description: 'Big hook text with emoji pointer and free offer'
  },
  {
    id: '2',
    name: 'POV Scroll Stopper',
    type: 'viral',
    layout: 'pov-scroll',
    variables: ['NICHE', 'HOOK'],
    description: 'POV format with niche emoji and CTA'
  },
  {
    id: '3',
    name: 'City Call-Out',
    type: 'viral',
    layout: 'city-callout',
    variables: ['NICHE', 'CITY', 'TAGLINE'],
    description: 'Hyper-local targeting with city name'
  },
  {
    id: '4',
    name: 'Before/After Tease',
    type: 'viral',
    layout: 'before-after',
    variables: ['NICHE', 'CITY'],
    description: 'Split comparison with checkmarks'
  }
];

// Canvas Dimensions (9:16 for Reels/Shorts/TikTok)
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;

// Safe Zones (avoiding platform UI overlays)
const SAFE_TOP = 180;
const SAFE_BOTTOM = 400;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEFAULT_NICHES,
    DEFAULT_CITIES,
    DEFAULT_HOOKS,
    DEFAULT_TAGLINES,
    NICHE_COLORS,
    NICHE_BG_COLORS,
    NICHE_EMOJIS,
    NICHE_DISPLAY,
    NICHE_MOCKUPS,
    TEMPLATES,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    SAFE_TOP,
    SAFE_BOTTOM
  };
}
