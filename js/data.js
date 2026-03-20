/**
 * EASY WEB STUDIOS - CONTENT ENGINE
 * Data Configuration
 */

// Default Niches
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

// Default Cities (Metro Detroit)
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

// Niche Colors (for branding consistency)
const NICHE_COLORS = {
  'Plumber': '#3B82F6',
  'Roofer': '#F59E0B',
  'Landscaper': '#22C55E',
  'Barber': '#8B5CF6',
  'Salon': '#EC4899',
  'Contractor': '#F97316',
  'Dentist': '#06B6D4',
  'Auto Shop': '#EF4444',
  'HVAC': '#6366F1',
  'Electrician': '#EAB308'
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

// Template Definitions
const TEMPLATES = [
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
const SAFE_TOP = 180;      // Top safe zone in pixels
const SAFE_BOTTOM = 400;   // Bottom safe zone in pixels

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEFAULT_NICHES,
    DEFAULT_CITIES,
    DEFAULT_HOOKS,
    DEFAULT_TAGLINES,
    NICHE_COLORS,
    NICHE_EMOJIS,
    TEMPLATES,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    SAFE_TOP,
    SAFE_BOTTOM
  };
}
