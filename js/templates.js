/**
 * EASY WEB STUDIOS - CONTENT ENGINE
 * Template Rendering Functions
 */

const TemplateRenderer = {
  canvas: null,
  ctx: null,

  /**
   * Initialize the canvas
   */
  init() {
    this.canvas = document.getElementById('render-canvas');
    this.ctx = this.canvas.getContext('2d');
  },

  /**
   * Draw a rounded rectangle
   */
  roundRect(x, y, w, h, r) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h - r);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.ctx.lineTo(x + r, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
  },

  /**
   * Wrap text to fit within maxWidth
   */
  wrapText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let lines = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = this.ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    lines.forEach((l, i) => {
      this.ctx.fillText(l.trim(), x, y + (i * lineHeight));
    });

    return lines.length;
  },

  /**
   * Render template to canvas and return data URL
   */
  renderToCanvas(template, vars) {
    const niche = vars.NICHE || 'Roofer';
    const city = vars.CITY || 'Detroit';
    const hook = vars.HOOK || 'Your competitors are doing this';
    const tagline = vars.TAGLINE || 'Just Pay Hosting';
    const color = NICHE_COLORS[niche] || '#3B82F6';
    const emoji = NICHE_EMOJIS[niche] || '🔥';

    const w = CANVAS_WIDTH;
    const h = CANVAS_HEIGHT;
    this.canvas.width = w;
    this.canvas.height = h;

    this.ctx.clearRect(0, 0, w, h);

    // Render based on template layout
    switch (template.layout) {
      case 'hook-value':
        this.renderHookValue(w, h, { niche, city, hook, tagline, color, emoji });
        break;
      case 'pov-scroll':
        this.renderPovScroll(w, h, { niche, city, hook, tagline, color, emoji });
        break;
      case 'city-callout':
        this.renderCityCallout(w, h, { niche, city, hook, tagline, color, emoji });
        break;
      case 'before-after':
        this.renderBeforeAfter(w, h, { niche, city, hook, tagline, color, emoji });
        break;
    }

    return this.canvas.toDataURL('image/png');
  },

  /**
   * Hook + Value Bomb Template
   */
  renderHookValue(w, h, vars) {
    const { niche, city, hook, color } = vars;

    // Gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#000');
    gradient.addColorStop(0.5, color + '44');
    gradient.addColorStop(1, '#000');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, w, h);

    // Top hook text (in safe zone)
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.textAlign = 'center';
    const hookLines = this.wrapText(hook.toUpperCase(), w / 2, SAFE_TOP + 100, w - 120, 85);

    // Attention grabber
    this.ctx.font = '120px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('👇', w / 2, SAFE_TOP + 100 + (hookLines * 85) + 100);

    // Main value prop (center)
    const centerY = h / 2 + 50;
    this.ctx.font = 'bold 64px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillStyle = color;
    this.ctx.fillText('FREE', w / 2, centerY - 80);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 80px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText(`${niche} Website`, w / 2, centerY + 20);

    // City badge
    this.ctx.fillStyle = color;
    const cityText = `📍 ${city}`;
    this.ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif';
    const cityWidth = this.ctx.measureText(cityText).width + 60;
    this.roundRect(w / 2 - cityWidth / 2, centerY + 80, cityWidth, 80, 40);
    this.ctx.fill();
    this.ctx.fillStyle = '#fff';
    this.ctx.fillText(cityText, w / 2, centerY + 135);

    // Bottom CTA (above safe zone)
    const bottomY = h - SAFE_BOTTOM - 50;
    this.ctx.fillStyle = 'rgba(255,255,255,0.9)';
    this.ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('Link in bio 🔗', w / 2, bottomY);

    this.ctx.textAlign = 'left';
  },

  /**
   * POV Scroll Stopper Template
   */
  renderPovScroll(w, h, vars) {
    const { niche, hook, color, emoji } = vars;

    // Black background with accent
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, w, h);

    // POV text at top (safe zone)
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('POV:', w / 2, SAFE_TOP + 80);

    this.ctx.font = 'bold 64px -apple-system, BlinkMacSystemFont, sans-serif';
    this.wrapText(hook, w / 2, SAFE_TOP + 180, w - 100, 80);

    // Center content area
    const centerY = h / 2;
    this.ctx.fillStyle = color + '33';
    this.roundRect(60, centerY - 250, w - 120, 500, 30);
    this.ctx.fill();

    // Emoji and content
    this.ctx.font = '180px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText(emoji, w / 2, centerY + 20);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText(`${niche} Website`, w / 2, centerY + 150);
    this.ctx.font = '40px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillStyle = 'rgba(255,255,255,0.7)';
    this.ctx.fillText('Built in 60 seconds', w / 2, centerY + 210);

    // Bottom branding
    const bottomY = h - SAFE_BOTTOM - 30;
    this.ctx.fillStyle = color;
    this.roundRect(w / 2 - 200, bottomY - 60, 400, 80, 40);
    this.ctx.fill();
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('Easy Web Studios', w / 2, bottomY);

    this.ctx.textAlign = 'left';
  },

  /**
   * City Call-Out Template
   */
  renderCityCallout(w, h, vars) {
    const { niche, city, tagline, color } = vars;

    // Vibrant gradient
    const gradient = this.ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, color + 'aa');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, w, h);

    // Decorative elements
    this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
    this.ctx.beginPath();
    this.ctx.arc(w - 100, 300, 400, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(100, h - 400, 300, 0, Math.PI * 2);
    this.ctx.fill();

    // Top attention (safe zone)
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('🚨 ATTENTION 🚨', w / 2, SAFE_TOP + 80);

    // City call-out
    const centerY = h / 2 - 100;
    this.ctx.font = 'bold 140px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText(city.toUpperCase(), w / 2, centerY);

    this.ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText(`${niche}s!`, w / 2, centerY + 100);

    // Value prop box
    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.roundRect(60, centerY + 160, w - 120, 200, 24);
    this.ctx.fill();

    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('FREE Website Design', w / 2, centerY + 250);
    this.ctx.font = '40px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText(tagline, w / 2, centerY + 320);

    // Bottom CTA
    const bottomY = h - SAFE_BOTTOM - 30;
    this.ctx.fillStyle = '#000';
    this.roundRect(w / 2 - 180, bottomY - 70, 360, 90, 45);
    this.ctx.fill();
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('DM "FREE" 💬', w / 2, bottomY);

    this.ctx.textAlign = 'left';
  },

  /**
   * Before/After Tease Template
   */
  renderBeforeAfter(w, h, vars) {
    const { niche, city, color } = vars;

    // Split design
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, w, h);

    // Top label (safe zone)
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText(`${city} ${niche}`, w / 2, SAFE_TOP + 60);

    // Before section
    const boxTop = SAFE_TOP + 120;
    const boxHeight = (h - SAFE_TOP - SAFE_BOTTOM - 200) / 2;

    this.ctx.fillStyle = '#2a2a2a';
    this.roundRect(60, boxTop, w - 120, boxHeight, 24);
    this.ctx.fill();

    this.ctx.fillStyle = '#ef4444';
    this.ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('❌ BEFORE', w / 2, boxTop + 80);
    this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
    this.ctx.font = '36px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('Outdated website', w / 2, boxTop + 150);
    this.ctx.fillText('Losing customers daily', w / 2, boxTop + 200);
    this.ctx.fillText('No mobile support', w / 2, boxTop + 250);

    // After section
    const afterTop = boxTop + boxHeight + 40;
    this.ctx.fillStyle = color + '44';
    this.roundRect(60, afterTop, w - 120, boxHeight, 24);
    this.ctx.fill();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 4;
    this.roundRect(60, afterTop, w - 120, boxHeight, 24);
    this.ctx.stroke();

    this.ctx.fillStyle = '#22c55e';
    this.ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('✅ AFTER', w / 2, afterTop + 80);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '36px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('Modern, fast website', w / 2, afterTop + 150);
    this.ctx.fillText('Converting visitors', w / 2, afterTop + 200);
    this.ctx.fillText('100% mobile ready', w / 2, afterTop + 250);

    // Bottom CTA
    const bottomY = h - SAFE_BOTTOM - 30;
    this.ctx.fillStyle = color;
    this.roundRect(w / 2 - 220, bottomY - 70, 440, 90, 45);
    this.ctx.fill();
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('Get yours FREE 🔥', w / 2, bottomY);

    this.ctx.textAlign = 'left';
  },

  /**
   * Render mini preview for UI display
   */
  renderMiniPreview(template, vars, container) {
    const niche = vars.NICHE || 'Roofer';
    const city = vars.CITY || 'Detroit';
    const hook = vars.HOOK || 'Your competitors...';
    const color = NICHE_COLORS[niche] || '#3B82F6';
    const emoji = NICHE_EMOJIS[niche] || '🔥';

    let html = '';

    switch (template.layout) {
      case 'hook-value':
        html = `<div style="height:100%;background:linear-gradient(#000,${color}44,#000);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;text-align:center;">
          <div style="font-size:8px;font-weight:700;color:#fff;margin-bottom:4px;">FREE</div>
          <div style="font-size:10px;font-weight:700;color:#fff;">${niche}</div>
          <div style="font-size:7px;color:${color};margin-top:4px;">📍 ${city}</div>
        </div>`;
        break;
      case 'pov-scroll':
        html = `<div style="height:100%;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;text-align:center;">
          <div style="font-size:7px;color:#fff;margin-bottom:4px;">POV:</div>
          <div style="font-size:20px;">${emoji}</div>
          <div style="font-size:8px;color:#fff;margin-top:4px;">${niche}</div>
        </div>`;
        break;
      case 'city-callout':
        html = `<div style="height:100%;background:${color};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;text-align:center;">
          <div style="font-size:7px;color:#fff;">🚨</div>
          <div style="font-size:12px;font-weight:700;color:#fff;">${city}</div>
          <div style="font-size:8px;color:#fff;">${niche}s</div>
        </div>`;
        break;
      case 'before-after':
        html = `<div style="height:100%;background:#1a1a1a;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;text-align:center;">
          <div style="font-size:7px;color:#ef4444;">❌ Before</div>
          <div style="width:80%;height:1px;background:#333;margin:4px 0;"></div>
          <div style="font-size:7px;color:#22c55e;">✅ After</div>
        </div>`;
        break;
    }

    container.innerHTML = html;
  }
};

/**
 * Caption Generator
 */
const CaptionGenerator = {
  /**
   * Generate a caption for the given variables
   */
  generate(vars) {
    const niche = vars.NICHE || 'business';
    const city = vars.CITY || '';
    const emoji = NICHE_EMOJIS[niche] || '🔥';

    const captions = [
      `We just built a FREE website for ${city} ${niche}s ${emoji}\n\nNo design fees. No contracts. Just pay hosting.\n\nDM "FREE" to get started 💬`,
      `${city} ${niche}s - your competitors are upgrading their websites ${emoji}\n\nWe build yours FREE. Seriously.\n\nLink in bio 🔗`,
      `POV: You finally got a professional website for your ${niche.toLowerCase()} business ${emoji}\n\n100% free design. ${city} locals only.\n\nComment "INFO" 👇`,
      `Attention ${city} ${niche}s! 🚨\n\nWe're giving away FREE website designs this month.\n\nNo catch. Just pay hosting.\n\nDM to claim yours ${emoji}`
    ];

    return captions[Math.floor(Math.random() * captions.length)];
  },

  /**
   * Generate hashtags for the given variables
   */
  generateHashtags(vars) {
    const niche = (vars.NICHE || 'business').toLowerCase().replace(' ', '');
    const city = (vars.CITY || 'local').toLowerCase().replace(' ', '');

    return `#${niche} #${city}business #freewebsite #smallbusiness #entrepreneur #${city} #webdesign #localbusiness #businessowner #marketing`;
  }
};
