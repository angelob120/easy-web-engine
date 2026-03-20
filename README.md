# Easy Web Studios - Content Engine

A content variation engine for generating social media images optimized for TikTok, YouTube Shorts, Instagram Reels, and Facebook Reels.

## Features

- **9:16 Vertical Format** (1080×1920) - Exact dimensions for all short-form video platforms
- **Safe Zones** - Content avoids platform UI overlays (top 180px, bottom 400px)
- **4 Viral Templates** - Hook + Value Bomb, POV Scroll Stopper, City Call-Out, Before/After Tease
- **Bulk Generation** - Generate up to 500 variations at once
- **Auto Captions** - Pre-written captions and hashtags for each image
- **ZIP Export** - Download all images with captions in one package

## Getting Started

### Option 1: Simple (No Install)

Just open `index.html` in your browser. That's it!

```bash
# On Mac
open index.html

# On Windows
start index.html

# On Linux
xdg-open index.html
```

### Option 2: Local Server (Recommended)

Using npm:
```bash
npm install
npm run dev
```

Or with Python:
```bash
python -m http.server 3000
```

Then open http://localhost:3000

## Project Structure

```
easy-web-engine/
├── index.html          # Main HTML file
├── package.json        # NPM config
├── README.md           # This file
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── data.js         # Default data & config
│   ├── templates.js    # Canvas rendering
│   └── app.js          # Main app logic
└── assets/             # (Optional) Custom assets
```

## How to Use

1. **Dashboard** - Overview of templates and stats
2. **Templates** - Browse and select viral templates
3. **Generate** - Pick a template, select variables, generate variations
4. **Content** - View, select, and download your generated content
5. **Settings** - Add/remove niches, cities, hooks, and taglines

## Customization

### Adding New Niches

Edit `js/data.js`:
```javascript
const DEFAULT_NICHES = [
  'Plumber',
  'Roofer',
  // Add your niches here
  'Your New Niche'
];

const NICHE_COLORS = {
  // Add matching color
  'Your New Niche': '#FF5733'
};

const NICHE_EMOJIS = {
  // Add matching emoji
  'Your New Niche': '🔥'
};
```

### Adding New Cities

Edit `js/data.js`:
```javascript
const DEFAULT_CITIES = [
  'Detroit',
  // Add your cities
  'Chicago',
  'New York'
];
```

### Creating New Templates

Edit `js/data.js` to add template definition:
```javascript
const TEMPLATES = [
  // ... existing templates
  {
    id: '5',
    name: 'Your Template',
    type: 'viral',
    layout: 'your-layout',
    variables: ['NICHE', 'CITY']
  }
];
```

Then add the rendering function in `js/templates.js`:
```javascript
renderYourLayout(w, h, vars) {
  // Canvas drawing code
}
```

## Workflow for Creating Videos

1. Generate your content variations
2. Download the ZIP file
3. Import images into CapCut, Premiere, or any video editor
4. Set each image to 3-5 seconds duration
5. Add trending music
6. Export as vertical video (9:16)
7. Copy caption from `captions.txt`
8. Post to TikTok, YouTube Shorts, Instagram Reels, Facebook Reels

## Tech Stack

- Vanilla JavaScript (no frameworks)
- HTML5 Canvas for image generation
- JSZip for ZIP creation
- FileSaver.js for downloads

## Browser Support

Works in all modern browsers:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT License - Free for personal and commercial use.

---

Built by Easy Web Studios 🚀
