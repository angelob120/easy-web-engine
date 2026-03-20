/**
 * EASY WEB STUDIOS - CONTENT ENGINE
 * Template Rendering Functions
 */

const TemplateRenderer = {
  canvas: null,
  ctx: null,
  mockupImages: {}, // Store loaded mockup images

  /**
   * Initialize the canvas
   */
  init() {
    this.canvas = document.getElementById('render-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.loadMockupImages();
  },

  /**
   * Load mockup images from storage
   */
  loadMockupImages() {
    Object.keys(NICHE_MOCKUPS).forEach(niche => {
      const dataUrl = NICHE_MOCKUPS[niche];
      if (dataUrl) {
        const img = new Image();
        img.onload = () => {
          this.mockupImages[niche] = img;
        };
        img.src = dataUrl;
      }
    });
  },

  /**
   * Add a mockup image for a niche
   */
  addMockupImage(niche, dataUrl) {
    NICHE_MOCKUPS[niche] = dataUrl;
    localStorage.setItem('niche_mockups', JSON.stringify(NICHE_MOCKUPS));
    
    const img = new Image();
    img.onload = () => {
      this.mockupImages[niche] = img;
    };
    img.src = dataUrl;
  },

  /**
   * Remove a mockup image for a niche
   */
  removeMockupImage(niche) {
    delete NICHE_MOCKUPS[niche];
    delete this.mockupImages[niche];
    localStorage.setItem('niche_mockups', JSON.stringify(NICHE_MOCKUPS));
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
    const color = NICHE_COLORS[niche] || '#D4A03C';
    const bgColor = NICHE_BG_COLORS ? (NICHE_BG_COLORS[niche] || '#1a1a2e') : '#1a1a2e';
    const emoji = NICHE_EMOJIS[niche] || '🔥';
    const displayName = NICHE_DISPLAY ? (NICHE_DISPLAY[niche] || niche.toUpperCase()) : niche.toUpperCase();

    const w = CANVAS_WIDTH;
    const h = CANVAS_HEIGHT;
    this.canvas.width = w;
    this.canvas.height = h;

    this.ctx.clearRect(0, 0, w, h);

    // Render based on template layout
    switch (template.layout) {
      case 'mockup-showcase':
        this.renderMockupShowcase(w, h, { niche, city, hook, tagline, color, bgColor, emoji, displayName });
        break;
      case 'simple-offer':
        this.renderSimpleOffer(w, h, { niche, city, hook, tagline, color, bgColor, emoji });
        break;
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
   * Device Mockup Showcase Template - EXACT MATCH to professional examples
   */
  renderMockupShowcase(w, h, vars) {
    const { niche, color, bgColor, displayName } = vars;
    
    // === BACKGROUND ===
    // Dark base
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, w, h);
    
    // Radial gradient glow from center (slightly below center)
    const glowCenterY = h * 0.52;
    const glow = this.ctx.createRadialGradient(w/2, glowCenterY, 0, w/2, glowCenterY, w * 0.8);
    glow.addColorStop(0, color + '50');  // Stronger color in center
    glow.addColorStop(0.4, color + '25');
    glow.addColorStop(0.7, color + '10');
    glow.addColorStop(1, 'transparent');
    this.ctx.fillStyle = glow;
    this.ctx.fillRect(0, 0, w, h);

    // === "100% FREE" HEADER ===
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 130px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    this.ctx.fillText('100% FREE', w/2, 320);
    
    // === NICHE SUBTITLE ===
    this.ctx.fillStyle = color;
    this.ctx.font = 'bold 58px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    this.ctx.fillText(`${displayName} WEBSITE DESIGN`, w/2, 420);

    // === DEVICE MOCKUP IMAGE ===
    const mockupCenterY = h * 0.52;
    const mockupMaxWidth = w * 0.85;
    const mockupMaxHeight = h * 0.38;
    
    if (NICHE_MOCKUPS[niche] && this.mockupImages && this.mockupImages[niche]) {
      // Draw the uploaded mockup image
      const img = this.mockupImages[niche];
      const imgAspect = img.width / img.height;
      
      let drawW, drawH;
      // Fit to max dimensions while preserving aspect ratio
      if (imgAspect > mockupMaxWidth / mockupMaxHeight) {
        drawW = mockupMaxWidth;
        drawH = mockupMaxWidth / imgAspect;
      } else {
        drawH = mockupMaxHeight;
        drawW = mockupMaxHeight * imgAspect;
      }
      
      const drawX = (w - drawW) / 2;
      const drawY = mockupCenterY - drawH / 2;
      
      this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } else {
      // No mockup uploaded - show placeholder
      this.drawDevicePlaceholder(w, h, mockupCenterY, color, niche);
    }

    // === FEATURE CALLOUTS WITH ARROWS ===
    const calloutY_top = mockupCenterY - 200;
    const calloutY_bottom = mockupCenterY + 230;
    const calloutX_left = 130;
    const calloutX_right = w - 130;
    
    // Top-left: "Tailored Design"
    this.drawFeatureCallout(calloutX_left, calloutY_top, 'Tailored\nDesign', 'top-left');
    
    // Top-right: "Get Your Business Online"
    this.drawFeatureCallout(calloutX_right, calloutY_top, 'Get Your\nBusiness\nOnline', 'top-right');
    
    // Bottom-left: "Built for Desktop, Tablet & Mobile"
    this.drawFeatureCallout(calloutX_left, calloutY_bottom, 'Built for\nDesktop,\nTablet\n& Mobile', 'bottom-left');
    
    // Bottom-right: "Search Engine Optimized"
    this.drawFeatureCallout(calloutX_right, calloutY_bottom, 'Search\nEngine\nOptimized', 'bottom-right');

    // === TAGLINE ===
    this.ctx.fillStyle = color;
    this.ctx.font = 'italic bold 46px Georgia, "Times New Roman", serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Just Pay For Hosting', w/2, h - 370);
    this.ctx.fillText('& Your Domain', w/2, h - 310);

    // === 5.0 STAR RATING BADGE ===
    this.drawRatingBadge(w/2, h - 170);
    
    this.ctx.textAlign = 'left';
  },

  /**
   * Draw device placeholder when no mockup is uploaded
   */
  drawDevicePlaceholder(w, h, centerY, color, niche) {
    const displayName = NICHE_DISPLAY ? (NICHE_DISPLAY[niche] || niche) : niche;
    
    // Desktop monitor (center, largest)
    const monitorW = 380;
    const monitorH = 240;
    this.ctx.fillStyle = '#2a2a2a';
    this.roundRect(w/2 - monitorW/2, centerY - monitorH/2 - 20, monitorW, monitorH, 12);
    this.ctx.fill();
    this.ctx.strokeStyle = '#444';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Screen area
    this.ctx.fillStyle = color + '15';
    this.roundRect(w/2 - monitorW/2 + 15, centerY - monitorH/2 - 5, monitorW - 30, monitorH - 40, 4);
    this.ctx.fill();
    
    // Monitor stand
    this.ctx.fillStyle = '#3a3a3a';
    this.ctx.fillRect(w/2 - 50, centerY + monitorH/2 - 25, 100, 40);
    this.ctx.fillRect(w/2 - 70, centerY + monitorH/2 + 10, 140, 15);
    
    // Phone (left of monitor)
    const phoneW = 90;
    const phoneH = 170;
    const phoneX = w/2 - monitorW/2 - phoneW - 30;
    const phoneY = centerY - phoneH/2 + 20;
    this.ctx.fillStyle = '#2a2a2a';
    this.roundRect(phoneX, phoneY, phoneW, phoneH, 12);
    this.ctx.fill();
    this.ctx.fillStyle = color + '20';
    this.roundRect(phoneX + 6, phoneY + 15, phoneW - 12, phoneH - 30, 6);
    this.ctx.fill();
    
    // Tablet (right, behind phone)
    const tabletW = 130;
    const tabletH = 180;
    const tabletX = w/2 + monitorW/2 + 20;
    const tabletY = centerY - tabletH/2;
    this.ctx.fillStyle = '#2a2a2a';
    this.roundRect(tabletX, tabletY, tabletW, tabletH, 12);
    this.ctx.fill();
    this.ctx.fillStyle = color + '20';
    this.roundRect(tabletX + 8, tabletY + 12, tabletW - 16, tabletH - 24, 6);
    this.ctx.fill();
    
    // Placeholder text
    this.ctx.fillStyle = '#666';
    this.ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Upload mockup image', w/2, centerY + 10);
    this.ctx.font = '18px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('in Settings →', w/2, centerY + 40);
  },

  /**
   * Draw feature callout with curved arrow
   */
  drawFeatureCallout(x, y, text, position) {
    const lines = text.split('\n');
    const lineHeight = 38;
    const isLeft = position.includes('left');
    const isTop = position.includes('top');
    
    // Text
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.textAlign = isLeft ? 'left' : 'right';
    
    lines.forEach((line, i) => {
      this.ctx.fillText(line, x, y + (i * lineHeight));
    });
    
    // Curved arrow
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    
    const textWidth = Math.max(...lines.map(l => this.ctx.measureText(l).width));
    const textHeight = lines.length * lineHeight;
    
    // Arrow start point (from text)
    let startX, startY, endX, endY, controlX, controlY;
    
    if (isLeft && isTop) {
      // Top-left: arrow curves down-right
      startX = x + textWidth + 15;
      startY = y + textHeight/2 - 10;
      endX = startX + 70;
      endY = startY + 60;
      controlX = startX + 60;
      controlY = startY;
    } else if (!isLeft && isTop) {
      // Top-right: arrow curves down-left
      startX = x - textWidth - 15;
      startY = y + textHeight/2 - 10;
      endX = startX - 70;
      endY = startY + 60;
      controlX = startX - 60;
      controlY = startY;
    } else if (isLeft && !isTop) {
      // Bottom-left: arrow curves up-right
      startX = x + textWidth + 15;
      startY = y - 20;
      endX = startX + 70;
      endY = startY - 50;
      controlX = startX + 60;
      controlY = startY;
    } else {
      // Bottom-right: arrow curves up-left
      startX = x - textWidth - 15;
      startY = y - 20;
      endX = startX - 70;
      endY = startY - 50;
      controlX = startX - 60;
      controlY = startY;
    }
    
    // Draw curved line
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    this.ctx.stroke();
    
    // Arrow head
    const headLen = 12;
    const dx = endX - controlX;
    const dy = endY - controlY;
    const angle = Math.atan2(dy, dx);
    
    this.ctx.beginPath();
    this.ctx.moveTo(endX, endY);
    this.ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI/6), endY - headLen * Math.sin(angle - Math.PI/6));
    this.ctx.moveTo(endX, endY);
    this.ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI/6), endY - headLen * Math.sin(angle + Math.PI/6));
    this.ctx.stroke();
    
    this.ctx.textAlign = 'left';
  },

  /**
   * Draw 5.0 star rating badge (golden/yellow style)
   */
  drawRatingBadge(x, y) {
    const badgeW = 280;
    const badgeH = 65;
    
    // Golden pill background
    const gradient = this.ctx.createLinearGradient(x - badgeW/2, y, x + badgeW/2, y);
    gradient.addColorStop(0, '#D4A03C');
    gradient.addColorStop(0.5, '#F4C55C');
    gradient.addColorStop(1, '#D4A03C');
    
    this.ctx.fillStyle = gradient;
    this.roundRect(x - badgeW/2, y - badgeH/2, badgeW, badgeH, badgeH/2);
    this.ctx.fill();
    
    // Border
    this.ctx.strokeStyle = '#B8860B';
    this.ctx.lineWidth = 2;
    this.roundRect(x - badgeW/2 + 3, y - badgeH/2 + 3, badgeW - 6, badgeH - 6, (badgeH - 6)/2);
    this.ctx.stroke();
    
    // "5.0" text
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('5.0', x - 70, y + 10);
    
    // Stars
    this.ctx.font = '26px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('★★★★★', x + 40, y + 10);
  },

  /**
   * Simple Offer Template (no mockup required)
   */
  renderSimpleOffer(w, h, vars) {
    const { niche, city, color, bgColor, emoji } = vars;
    
    // Dark gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#111111');
    gradient.addColorStop(0.5, bgColor);
    gradient.addColorStop(1, '#111111');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, w, h);
    
    // Center glow
    const glow = this.ctx.createRadialGradient(w/2, h * 0.45, 0, w/2, h * 0.45, 400);
    glow.addColorStop(0, color + '40');
    glow.addColorStop(1, 'transparent');
    this.ctx.fillStyle = glow;
    this.ctx.fillRect(0, 0, w, h);

    // "100% FREE" Header
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 130px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('100% FREE', w/2, 350);
    
    // Niche + Website Design
    this.ctx.fillStyle = color;
    this.ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText(`${niche.toUpperCase()}`, w/2, 480);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 60px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('WEBSITE DESIGN', w/2, 560);

    // Large emoji
    this.ctx.font = '200px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText(emoji, w/2, h * 0.52);

    // City badge
    if (city) {
      this.ctx.fillStyle = color;
      const cityText = `📍 ${city}`;
      this.ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif';
      const cityWidth = this.ctx.measureText(cityText).width + 60;
      this.roundRect(w/2 - cityWidth/2, h * 0.62, cityWidth, 80, 40);
      this.ctx.fill();
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillText(cityText, w/2, h * 0.62 + 55);
    }

    // Features list
    const features = ['✓ Tailored Design', '✓ Mobile Ready', '✓ SEO Optimized'];
    this.ctx.fillStyle = 'rgba(255,255,255,0.9)';
    this.ctx.font = '36px -apple-system, BlinkMacSystemFont, sans-serif';
    features.forEach((f, i) => {
      this.ctx.fillText(f, w/2, h * 0.75 + (i * 50));
    });

    // Tagline
    this.ctx.fillStyle = color;
    this.ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('Just Pay For Hosting & Your Domain', w/2, h - 320);

    // Rating badge
    this.drawRatingBadge(w/2, h - 180, color);
    
    this.ctx.textAlign = 'left';
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
    const bgColor = NICHE_BG_COLORS ? (NICHE_BG_COLORS[niche] || '#1a1a2e') : '#1a1a2e';
    const emoji = NICHE_EMOJIS[niche] || '🔥';
    const hasMockup = NICHE_MOCKUPS && NICHE_MOCKUPS[niche];

    let html = '';

    switch (template.layout) {
      case 'mockup-showcase':
        html = `<div style="height:100%;background:radial-gradient(circle at center, ${color}40, ${bgColor}, #111);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;text-align:center;">
          <div style="font-size:9px;font-weight:700;color:#fff;">100% FREE</div>
          <div style="font-size:7px;font-weight:700;color:${color};margin:2px 0;">${niche.toUpperCase()}</div>
          <div style="font-size:18px;margin:4px 0;">${hasMockup ? '🖥️📱' : '📱'}</div>
          <div style="font-size:6px;color:${color};">★★★★★</div>
        </div>`;
        break;
      case 'simple-offer':
        html = `<div style="height:100%;background:linear-gradient(${bgColor}, #111);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;text-align:center;">
          <div style="font-size:9px;font-weight:700;color:#fff;">100% FREE</div>
          <div style="font-size:7px;font-weight:700;color:${color};">${niche.toUpperCase()}</div>
          <div style="font-size:18px;margin:4px 0;">${emoji}</div>
          <div style="font-size:6px;color:#888;">📍 ${city}</div>
        </div>`;
        break;
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
