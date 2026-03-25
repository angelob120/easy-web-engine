/**
 * CONTENT FACTORY - Template Renderer
 * Renders all format templates to canvas with motion effects
 */

const TemplateRenderer = {
  canvas: null,
  ctx: null,
  loadedAssets: {}, // Cache for loaded images/videos

  init() {
    this.canvas = document.getElementById('render-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
  },

  // Load an asset (image or video frame)
  async loadAsset(asset) {
    if (!asset || !asset.dataUrl) return null;
    
    if (this.loadedAssets[asset.id]) {
      return this.loadedAssets[asset.id];
    }

    return new Promise((resolve) => {
      if (asset.type === 'video') {
        const video = document.createElement('video');
        video.src = asset.dataUrl;
        video.onloadeddata = () => {
          this.loadedAssets[asset.id] = video;
          resolve(video);
        };
        video.onerror = () => resolve(null);
      } else {
        const img = new Image();
        img.onload = () => {
          this.loadedAssets[asset.id] = img;
          resolve(img);
        };
        img.onerror = () => resolve(null);
        img.src = asset.dataUrl;
      }
    });
  },

  // Main render function
  async renderToCanvas(template, content, assets) {
    const w = CANVAS_WIDTH;
    const h = CANVAS_HEIGHT;
    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx.clearRect(0, 0, w, h);

    // Render based on template
    switch (template.id) {
      case 'drake':
        await this.renderDrake(w, h, content, assets);
        break;
      case 'screenshot-caption':
        await this.renderScreenshotCaption(w, h, content, assets);
        break;
      case 'breaking-news':
        await this.renderBreakingNews(w, h, content, assets);
        break;
      case 'expanding-brain':
        await this.renderExpandingBrain(w, h, content, assets);
        break;
      case 'this-vs-that':
        await this.renderThisVsThat(w, h, content, assets);
        break;
      case 'reaction-text':
        await this.renderReactionText(w, h, content, assets);
        break;
      case 'quote-card':
        await this.renderQuoteCard(w, h, content, assets);
        break;
      case 'news-ticker':
        await this.renderNewsTicker(w, h, content, assets);
        break;
      case 'pov-stopper':
        await this.renderPovStopper(w, h, content, assets);
        break;
      case 'before-after':
        await this.renderBeforeAfter(w, h, content, assets);
        break;
      case 'listicle':
        await this.renderListicle(w, h, content, assets);
        break;
      case 'hot-take':
        await this.renderHotTake(w, h, content, assets);
        break;
      default:
        this.renderPlaceholder(w, h, template.name);
    }

    return this.canvas.toDataURL('image/png');
  },

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  drawBackground(color = '#0a0a0f') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  },

  async drawAsset(asset, x, y, width, height, fit = 'cover') {
    if (!asset) return;
    const media = await this.loadAsset(asset);
    if (!media) return;

    const sourceW = media.videoWidth || media.width;
    const sourceH = media.videoHeight || media.height;

    if (fit === 'cover') {
      const scale = Math.max(width / sourceW, height / sourceH);
      const scaledW = sourceW * scale;
      const scaledH = sourceH * scale;
      const offsetX = (width - scaledW) / 2;
      const offsetY = (height - scaledH) / 2;
      
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(x, y, width, height);
      this.ctx.clip();
      this.ctx.drawImage(media, x + offsetX, y + offsetY, scaledW, scaledH);
      this.ctx.restore();
    } else {
      const scale = Math.min(width / sourceW, height / sourceH);
      const scaledW = sourceW * scale;
      const scaledH = sourceH * scale;
      const offsetX = (width - scaledW) / 2;
      const offsetY = (height - scaledH) / 2;
      this.ctx.drawImage(media, x + offsetX, y + offsetY, scaledW, scaledH);
    }
  },

  drawText(text, x, y, maxWidth, style = {}) {
    const {
      fontSize = 64,
      fontWeight = 'bold',
      fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      color = '#FFFFFF',
      stroke = null,
      strokeWidth = 0,
      align = 'center',
      lineHeight = 1.2,
      maxLines = 5
    } = style;

    this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'top';

    // Word wrap
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = this.ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    // Limit lines
    const displayLines = lines.slice(0, maxLines);
    const actualLineHeight = fontSize * lineHeight;

    // Draw each line
    displayLines.forEach((line, i) => {
      const lineY = y + (i * actualLineHeight);
      
      if (stroke && strokeWidth > 0) {
        this.ctx.strokeStyle = stroke;
        this.ctx.lineWidth = strokeWidth;
        this.ctx.lineJoin = 'round';
        this.ctx.strokeText(line, x, lineY);
      }
      
      this.ctx.fillStyle = color;
      this.ctx.fillText(line, x, lineY);
    });

    return displayLines.length * actualLineHeight;
  },

  drawRoundedRect(x, y, w, h, r) {
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

  renderPlaceholder(w, h, name) {
    this.drawBackground('#1a1a2e');
    this.ctx.fillStyle = '#333';
    this.drawRoundedRect(w/2 - 200, h/2 - 100, 400, 200, 20);
    this.ctx.fill();
    this.drawText(name, w/2, h/2 - 20, w - 100, { fontSize: 36, color: '#888' });
    this.drawText('Add assets to preview', w/2, h/2 + 30, w - 100, { fontSize: 24, color: '#555' });
  },

  // ============================================
  // TEMPLATE RENDERERS
  // ============================================

  async renderDrake(w, h, content, assets) {
    this.drawBackground('#0a0a0f');
    
    const panelHeight = h / 2;
    const imageWidth = w * 0.4;
    const textX = imageWidth + (w - imageWidth) / 2;
    const textWidth = w - imageWidth - 80;

    // Top panel (reject)
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, w, panelHeight);
    
    if (assets['reaction-top']) {
      await this.drawAsset(assets['reaction-top'], 0, 0, imageWidth, panelHeight);
    } else {
      // Placeholder
      this.ctx.fillStyle = '#2a2a2a';
      this.ctx.fillRect(20, 20, imageWidth - 40, panelHeight - 40);
      this.drawText('❌', imageWidth/2, panelHeight/2 - 40, imageWidth, { fontSize: 80 });
    }

    // Top text
    const rejectText = content.reject || 'Bad option here...';
    this.drawText(rejectText, textX, panelHeight/2 - 60, textWidth, {
      fontSize: 52,
      stroke: '#000',
      strokeWidth: 4
    });

    // Bottom panel (approve)
    this.ctx.fillStyle = '#111111';
    this.ctx.fillRect(0, panelHeight, w, panelHeight);
    
    if (assets['reaction-bottom']) {
      await this.drawAsset(assets['reaction-bottom'], 0, panelHeight, imageWidth, panelHeight);
    } else {
      this.ctx.fillStyle = '#1f2f1f';
      this.ctx.fillRect(20, panelHeight + 20, imageWidth - 40, panelHeight - 40);
      this.drawText('✅', imageWidth/2, panelHeight + panelHeight/2 - 40, imageWidth, { fontSize: 80 });
    }

    // Bottom text
    const approveText = content.approve || 'Good option here...';
    this.drawText(approveText, textX, panelHeight + panelHeight/2 - 60, textWidth, {
      fontSize: 52,
      stroke: '#000',
      strokeWidth: 4
    });

    // Divider line
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(0, panelHeight);
    this.ctx.lineTo(w, panelHeight);
    this.ctx.stroke();
  },

  async renderScreenshotCaption(w, h, content, assets) {
    this.drawBackground('#0a0a0f');

    // Draw screenshot
    if (assets['screenshot']) {
      await this.drawAsset(assets['screenshot'], 0, 0, w, h);
      
      // Darken top for caption
      const gradient = this.ctx.createLinearGradient(0, 0, 0, h * 0.4);
      gradient.addColorStop(0, 'rgba(0,0,0,0.8)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, w, h * 0.4);
    }

    // Caption
    const caption = content.caption || 'Your caption here...';
    this.drawText(caption, w/2, SAFE_TOP + 40, w - 100, {
      fontSize: 64,
      fontWeight: 'bold',
      stroke: '#000',
      strokeWidth: 5
    });
  },

  async renderBreakingNews(w, h, content, assets) {
    // Background
    if (assets['background']) {
      await this.drawAsset(assets['background'], 0, 0, w, h);
      // Dark overlay
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(0, 0, w, h);
    } else {
      this.drawBackground('#0f1628');
    }

    // Breaking news banner at top
    this.ctx.fillStyle = '#CC0000';
    this.ctx.fillRect(0, SAFE_TOP, w, 80);
    this.drawText('🚨 BREAKING NEWS 🚨', w/2, SAFE_TOP + 20, w, {
      fontSize: 42,
      color: '#FFFFFF'
    });

    // Main headline
    const headline = content.headline || 'Your headline here...';
    const centerY = h / 2 - 100;
    
    // Headline background box
    this.ctx.fillStyle = 'rgba(0,0,0,0.85)';
    this.drawRoundedRect(40, centerY - 20, w - 80, 280, 16);
    this.ctx.fill();
    
    this.drawText(headline, w/2, centerY, w - 120, {
      fontSize: 58,
      fontWeight: 'bold',
      lineHeight: 1.3
    });

    // Subtext
    if (content.subtext) {
      this.drawText(content.subtext, w/2, h - SAFE_BOTTOM - 100, w - 80, {
        fontSize: 36,
        color: '#cccccc'
      });
    }
  },

  async renderExpandingBrain(w, h, content, assets) {
    this.drawBackground('#0a0a0f');
    
    const levels = 4;
    const levelHeight = (h - SAFE_TOP - SAFE_BOTTOM) / levels;
    const textWidth = w * 0.55;
    const imageWidth = w * 0.4;

    for (let i = 0; i < levels; i++) {
      const y = SAFE_TOP + (i * levelHeight);
      const levelNum = i + 1;
      
      // Alternating background
      this.ctx.fillStyle = i % 2 === 0 ? '#111118' : '#0a0a0f';
      this.ctx.fillRect(0, y, w, levelHeight);
      
      // Brain image on right
      const brainAsset = assets[`brain${levelNum}`];
      if (brainAsset) {
        await this.drawAsset(brainAsset, textWidth + 20, y + 10, imageWidth - 40, levelHeight - 20, 'contain');
      } else {
        // Placeholder brain emojis
        const brains = ['🧠', '🧠✨', '🧠💫', '🧠🌌'];
        this.drawText(brains[i], textWidth + imageWidth/2, y + levelHeight/2 - 30, imageWidth, { fontSize: 64 });
      }

      // Text on left
      const text = content[`level${levelNum}`] || `Level ${levelNum} text...`;
      this.drawText(text, 50, y + levelHeight/2 - 40, textWidth - 80, {
        fontSize: 42,
        align: 'left',
        stroke: '#000',
        strokeWidth: 2
      });

      // Divider
      if (i < levels - 1) {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(20, y + levelHeight);
        this.ctx.lineTo(w - 20, y + levelHeight);
        this.ctx.stroke();
      }
    }
  },

  async renderThisVsThat(w, h, content, assets) {
    this.drawBackground('#0a0a0f');
    
    const halfWidth = w / 2;

    // Left side
    if (assets['left-image']) {
      await this.drawAsset(assets['left-image'], 0, 0, halfWidth, h);
    } else {
      this.ctx.fillStyle = '#1a1a2e';
      this.ctx.fillRect(0, 0, halfWidth, h);
    }

    // Right side
    if (assets['right-image']) {
      await this.drawAsset(assets['right-image'], halfWidth, 0, halfWidth, h);
    } else {
      this.ctx.fillStyle = '#2e1a1a';
      this.ctx.fillRect(halfWidth, 0, halfWidth, h);
    }

    // Center divider
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(halfWidth - 3, 0, 6, h);

    // VS badge
    this.ctx.fillStyle = '#ec4899';
    this.ctx.beginPath();
    this.ctx.arc(halfWidth, h/2, 60, 0, Math.PI * 2);
    this.ctx.fill();
    this.drawText('VS', halfWidth, h/2 - 25, 100, { fontSize: 42, color: '#FFFFFF' });

    // Labels with background
    const leftLabel = content['left-label'] || 'This';
    const rightLabel = content['right-label'] || 'That';

    // Left label
    this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
    this.drawRoundedRect(20, h - SAFE_BOTTOM - 100, halfWidth - 60, 80, 12);
    this.ctx.fill();
    this.drawText(leftLabel, halfWidth/2, h - SAFE_BOTTOM - 85, halfWidth - 80, {
      fontSize: 42,
      stroke: '#000',
      strokeWidth: 3
    });

    // Right label
    this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
    this.drawRoundedRect(halfWidth + 20, h - SAFE_BOTTOM - 100, halfWidth - 60, 80, 12);
    this.ctx.fill();
    this.drawText(rightLabel, halfWidth + halfWidth/2, h - SAFE_BOTTOM - 85, halfWidth - 80, {
      fontSize: 42,
      stroke: '#000',
      strokeWidth: 3
    });
  },

  async renderReactionText(w, h, content, assets) {
    this.drawBackground('#0a0a0f');

    // Main text at top
    const mainText = content['main-text'] || 'Your text here...';
    
    // Text background
    this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
    this.ctx.fillRect(0, SAFE_TOP, w, 350);
    
    this.drawText(mainText, w/2, SAFE_TOP + 50, w - 80, {
      fontSize: 64,
      fontWeight: 'bold',
      stroke: '#000',
      strokeWidth: 4,
      lineHeight: 1.3
    });

    // Reaction image
    if (assets['reaction']) {
      await this.drawAsset(assets['reaction'], 0, h * 0.35, w, h * 0.55);
    } else {
      this.drawText('😂', w/2, h/2 + 100, w, { fontSize: 200 });
    }
  },

  async renderQuoteCard(w, h, content, assets) {
    // Background
    if (assets['background']) {
      await this.drawAsset(assets['background'], 0, 0, w, h);
      this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
      this.ctx.fillRect(0, 0, w, h);
    } else {
      // Elegant gradient
      const gradient = this.ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#0f0f1e');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, w, h);
    }

    // Quote marks
    this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
    this.ctx.font = 'bold 300px Georgia, serif';
    this.ctx.fillText('"', 60, 400);
    this.ctx.fillText('"', w - 200, h - 200);

    // Quote text
    const quote = content.quote || 'Your quote here...';
    this.drawText(quote, w/2, h/2 - 150, w - 160, {
      fontSize: 52,
      fontWeight: 'normal',
      fontFamily: 'Georgia, serif',
      lineHeight: 1.5
    });

    // Attribution
    if (content.attribution) {
      this.drawText(`— ${content.attribution}`, w/2, h - SAFE_BOTTOM - 80, w - 100, {
        fontSize: 32,
        color: '#888888'
      });
    }
  },

  async renderNewsTicker(w, h, content, assets) {
    // Background
    if (assets['background']) {
      await this.drawAsset(assets['background'], 0, 0, w, h);
    } else {
      this.drawBackground('#0f1628');
    }

    // Red ticker bar
    const tickerY = h / 2 - 60;
    this.ctx.fillStyle = '#CC0000';
    this.ctx.fillRect(0, tickerY, w, 120);

    // Ticker text
    const tickerText = content['ticker-text'] || 'BREAKING: Your headline here...';
    this.drawText(tickerText, w/2, tickerY + 25, w - 60, {
      fontSize: 44,
      fontWeight: 'bold',
      color: '#FFFFFF'
    });

    // "LIVE" badge
    this.ctx.fillStyle = '#FFFFFF';
    this.drawRoundedRect(40, SAFE_TOP + 20, 120, 50, 8);
    this.ctx.fill();
    this.ctx.fillStyle = '#CC0000';
    this.ctx.beginPath();
    this.ctx.arc(75, SAFE_TOP + 45, 10, 0, Math.PI * 2);
    this.ctx.fill();
    this.drawText('LIVE', 110, SAFE_TOP + 25, 80, { fontSize: 28, color: '#000', align: 'left' });
  },

  async renderPovStopper(w, h, content, assets) {
    // Main visual
    if (assets['main-visual']) {
      await this.drawAsset(assets['main-visual'], 0, 0, w, h);
    } else {
      this.drawBackground('#0a0a0f');
    }

    // Dark overlay at top
    const gradient = this.ctx.createLinearGradient(0, 0, 0, h * 0.5);
    gradient.addColorStop(0, 'rgba(0,0,0,0.9)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, w, h * 0.5);

    // POV text
    const povText = content['pov-text'] || 'POV: Something happens...';
    this.drawText(povText, w/2, SAFE_TOP + 60, w - 80, {
      fontSize: 58,
      fontWeight: 'bold',
      stroke: '#000',
      strokeWidth: 5,
      lineHeight: 1.3
    });

    // Context at bottom
    if (content.context) {
      const bottomGradient = this.ctx.createLinearGradient(0, h * 0.7, 0, h);
      bottomGradient.addColorStop(0, 'rgba(0,0,0,0)');
      bottomGradient.addColorStop(1, 'rgba(0,0,0,0.9)');
      this.ctx.fillStyle = bottomGradient;
      this.ctx.fillRect(0, h * 0.7, w, h * 0.3);

      this.drawText(content.context, w/2, h - SAFE_BOTTOM - 60, w - 80, {
        fontSize: 36,
        color: '#cccccc'
      });
    }
  },

  async renderBeforeAfter(w, h, content, assets) {
    this.drawBackground('#0a0a0f');
    
    const halfHeight = h / 2;

    // Before (top)
    if (assets['before-image']) {
      await this.drawAsset(assets['before-image'], 0, 0, w, halfHeight);
    } else {
      this.ctx.fillStyle = '#2a1a1a';
      this.ctx.fillRect(0, 0, w, halfHeight);
    }

    // Before label
    this.ctx.fillStyle = '#ef4444';
    this.drawRoundedRect(40, SAFE_TOP + 20, 200, 60, 8);
    this.ctx.fill();
    this.drawText('BEFORE', 140, SAFE_TOP + 32, 180, { fontSize: 32 });

    const beforeLabel = content['before-label'] || '';
    if (beforeLabel) {
      this.drawText(beforeLabel, w/2, halfHeight - 100, w - 80, {
        fontSize: 42,
        stroke: '#000',
        strokeWidth: 3
      });
    }

    // After (bottom)
    if (assets['after-image']) {
      await this.drawAsset(assets['after-image'], 0, halfHeight, w, halfHeight);
    } else {
      this.ctx.fillStyle = '#1a2a1a';
      this.ctx.fillRect(0, halfHeight, w, halfHeight);
    }

    // After label
    this.ctx.fillStyle = '#22c55e';
    this.drawRoundedRect(40, halfHeight + 20, 200, 60, 8);
    this.ctx.fill();
    this.drawText('AFTER', 140, halfHeight + 32, 180, { fontSize: 32 });

    const afterLabel = content['after-label'] || '';
    if (afterLabel) {
      this.drawText(afterLabel, w/2, h - SAFE_BOTTOM - 60, w - 80, {
        fontSize: 42,
        stroke: '#000',
        strokeWidth: 3
      });
    }

    // Divider
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(0, halfHeight);
    this.ctx.lineTo(w, halfHeight);
    this.ctx.stroke();
  },

  async renderListicle(w, h, content, assets) {
    // Background
    if (assets['background']) {
      await this.drawAsset(assets['background'], 0, 0, w, h);
      this.ctx.fillStyle = 'rgba(0,0,0,0.75)';
      this.ctx.fillRect(0, 0, w, h);
    } else {
      const gradient = this.ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#0a0a0f');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, w, h);
    }

    // Title
    const title = content.title || '3 Things You Need to Know';
    this.drawText(title, w/2, SAFE_TOP + 40, w - 80, {
      fontSize: 56,
      fontWeight: 'bold',
      stroke: '#000',
      strokeWidth: 4
    });

    // Items
    const items = [content.item1, content.item2, content.item3].filter(Boolean);
    const itemStartY = SAFE_TOP + 280;
    const itemSpacing = 300;

    items.forEach((item, i) => {
      const y = itemStartY + (i * itemSpacing);
      
      // Number badge
      this.ctx.fillStyle = '#ec4899';
      this.ctx.beginPath();
      this.ctx.arc(100, y + 30, 50, 0, Math.PI * 2);
      this.ctx.fill();
      this.drawText(`${i + 1}`, 100, y + 5, 80, { fontSize: 48 });

      // Item text
      this.drawText(item || `Item ${i + 1}`, 180, y, w - 220, {
        fontSize: 44,
        align: 'left',
        stroke: '#000',
        strokeWidth: 3
      });
    });
  },

  async renderHotTake(w, h, content, assets) {
    // Background
    if (assets['fire-bg']) {
      await this.drawAsset(assets['fire-bg'], 0, 0, w, h);
    } else {
      // Dramatic gradient
      const gradient = this.ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
      gradient.addColorStop(0, '#4a1515');
      gradient.addColorStop(0.5, '#2a0a0a');
      gradient.addColorStop(1, '#0a0a0f');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, w, h);
    }

    // Fire emojis at top
    this.drawText('🔥🔥🔥', w/2, SAFE_TOP + 40, w, { fontSize: 80 });

    // "HOT TAKE" label
    this.ctx.fillStyle = '#ef4444';
    this.drawRoundedRect(w/2 - 150, SAFE_TOP + 160, 300, 70, 12);
    this.ctx.fill();
    this.drawText('HOT TAKE', w/2, SAFE_TOP + 175, 280, { fontSize: 42 });

    // Main take
    const take = content.take || 'Your controversial opinion here...';
    this.drawText(take, w/2, h/2 - 100, w - 100, {
      fontSize: 58,
      fontWeight: 'bold',
      stroke: '#000',
      strokeWidth: 5,
      lineHeight: 1.4
    });

    // Fire emojis at bottom
    this.drawText('🔥🔥🔥', w/2, h - SAFE_BOTTOM - 80, w, { fontSize: 80 });
  },

  // ============================================
  // MINI PREVIEW FOR UI
  // ============================================

  renderMiniPreview(template, container) {
    const colors = {
      'drake': ['#2a2a2a', '#1f2f1f'],
      'screenshot-caption': ['#1a1a2e', '#2a2a3e'],
      'breaking-news': ['#0f1628', '#CC0000'],
      'expanding-brain': ['#111118', '#1a1a2e'],
      'this-vs-that': ['#1a1a2e', '#2e1a1a'],
      'reaction-text': ['#0a0a0f', '#1a1a2e'],
      'quote-card': ['#1a1a2e', '#0f0f1e'],
      'news-ticker': ['#0f1628', '#CC0000'],
      'pov-stopper': ['#0a0a0f', '#1a1a2e'],
      'before-after': ['#2a1a1a', '#1a2a1a'],
      'listicle': ['#1a1a2e', '#ec4899'],
      'hot-take': ['#4a1515', '#ef4444']
    };

    const [bg, accent] = colors[template.id] || ['#1a1a2e', '#3b82f6'];

    container.innerHTML = `
      <div style="height:100%;background:linear-gradient(135deg,${bg},#0a0a0f);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;text-align:center;border-radius:8px;">
        <div style="font-size:24px;margin-bottom:4px;">${template.icon}</div>
        <div style="font-size:9px;font-weight:600;color:#fff;margin-bottom:2px;">${template.name}</div>
        <div style="font-size:7px;color:${accent};text-transform:uppercase;">${template.category}</div>
      </div>
    `;
  }
};
