/**
 * EASY WEB STUDIOS - CONTENT ENGINE
 * Main Application Logic
 */

const App = {
  // State
  niches: [...DEFAULT_NICHES],
  cities: [...DEFAULT_CITIES],
  hooks: [...DEFAULT_HOOKS],
  taglines: [...DEFAULT_TAGLINES],
  templates: [...TEMPLATES],
  
  selectedTemplate: null,
  variations: [],
  selectedVariations: [],
  
  // Variable toggles
  useNiches: true,
  useCities: true,
  useHooks: true,
  useTaglines: true,
  
  maxVariations: 50,
  videoDuration: 5, // seconds

  /**
   * Initialize the application
   */
  init() {
    // Initialize template renderer
    TemplateRenderer.init();
    
    // Setup navigation
    this.setupNavigation();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Render initial page
    this.renderDashboard();
    
    console.log('Easy Web Content Engine initialized');
  },

  /**
   * Setup navigation event listeners
   */
  setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.navigateTo(btn.dataset.page);
      });
    });
  },

  /**
   * Setup general event listeners
   */
  setupEventListeners() {
    // Max slider
    const maxSlider = document.getElementById('max-slider');
    if (maxSlider) {
      maxSlider.addEventListener('input', (e) => {
        this.maxVariations = parseInt(e.target.value);
        document.getElementById('max-value').textContent = this.maxVariations;
        this.updateVariationCount();
      });
    }

    // Video duration slider (use event delegation since it may not exist initially)
    document.addEventListener('input', (e) => {
      if (e.target.id === 'video-duration') {
        this.videoDuration = parseInt(e.target.value);
        const display = document.getElementById('video-duration-value');
        if (display) display.textContent = this.videoDuration;
      }
    });

    // Settings inputs
    this.setupSettingsInput('new-niche', 'niches');
    this.setupSettingsInput('new-city', 'cities');
    this.setupSettingsInput('new-hook', 'hooks');
    this.setupSettingsInput('new-tagline', 'taglines');
  },

  /**
   * Setup settings input field
   */
  setupSettingsInput(inputId, listName) {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
          this[listName].push(input.value.trim());
          input.value = '';
          this.renderSettings();
          this.renderDashboard();
        }
      });
    }
  },

  /**
   * Navigate to a page
   */
  navigateTo(page) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    
    // Update pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');

    // Render page content
    switch (page) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'templates':
        this.renderTemplateGrid();
        break;
      case 'generate':
        this.renderGeneratePage();
        break;
      case 'variations':
        this.renderVariationsPage();
        break;
      case 'settings':
        this.renderSettings();
        break;
    }
  },

  /**
   * Render dashboard page
   */
  renderDashboard() {
    document.getElementById('stat-templates').textContent = this.templates.length;
    document.getElementById('stat-variations').textContent = this.variations.length;
    document.getElementById('stat-niches').textContent = this.niches.length;
    document.getElementById('stat-cities').textContent = this.cities.length;

    // Recent templates
    const recentTemplates = document.getElementById('recent-templates');
    recentTemplates.innerHTML = this.templates.slice(0, 4).map(t => {
      const previewId = `dash-preview-${t.id}`;
      return `
        <div class="template-row" onclick="App.selectTemplateAndNavigate('${t.id}')">
          <div class="template-row-preview" id="${previewId}"></div>
          <div class="template-row-info">
            <p class="template-row-name">${t.name}</p>
            <p class="template-row-type">${t.type}</p>
          </div>
        </div>
      `;
    }).join('');

    // Add inline styles for template rows
    const style = document.createElement('style');
    style.textContent = `
      .template-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px;
        border-radius: 8px;
        cursor: pointer;
        margin-bottom: 4px;
        transition: background 0.2s;
      }
      .template-row:hover { background: #1a1a2e; }
      .template-row-preview {
        width: 32px;
        height: 56px;
        background: #1f1f2e;
        border-radius: 6px;
        overflow: hidden;
      }
      .template-row-name { font-size: 13px; font-weight: 500; }
      .template-row-type { font-size: 11px; color: #666; }
    `;
    if (!document.getElementById('template-row-styles')) {
      style.id = 'template-row-styles';
      document.head.appendChild(style);
    }

    // Render mini previews
    this.templates.slice(0, 4).forEach(t => {
      const el = document.getElementById(`dash-preview-${t.id}`);
      if (el) TemplateRenderer.renderMiniPreview(t, {}, el);
    });
  },

  /**
   * Select template and navigate to generate page
   */
  selectTemplateAndNavigate(id) {
    this.selectedTemplate = this.templates.find(t => t.id === id);
    this.navigateTo('generate');
  },

  /**
   * Render template grid
   */
  renderTemplateGrid() {
    const grid = document.getElementById('template-grid');
    grid.innerHTML = this.templates.map(t => {
      const previewId = `tpl-preview-${t.id}`;
      return `
        <div class="template-card">
          <div class="template-preview">
            <div id="${previewId}" style="width:120px;height:200px;border-radius:12px;overflow:hidden;border:2px solid #333;"></div>
          </div>
          <div class="template-info">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h3>${t.name}</h3>
              <span class="badge badge-pink">${t.type}</span>
            </div>
            <p>Variables: ${t.variables.join(', ')}</p>
            <div class="template-actions">
              <button class="btn btn-pink" onclick="App.selectTemplateAndNavigate('${t.id}')">Use Template</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Render previews
    this.templates.forEach(t => {
      setTimeout(() => {
        const el = document.getElementById(`tpl-preview-${t.id}`);
        if (el) TemplateRenderer.renderMiniPreview(t, {}, el);
      }, 0);
    });
  },

  /**
   * Render generate page
   */
  renderGeneratePage() {
    // Template selector
    const selector = document.getElementById('template-selector');
    selector.innerHTML = this.templates.map(t => {
      const previewId = `sel-preview-${t.id}`;
      const isSelected = this.selectedTemplate?.id === t.id;
      return `
        <div class="template-option ${isSelected ? 'selected' : ''}" onclick="App.selectTemplate('${t.id}')">
          <div class="template-option-preview" id="${previewId}"></div>
          <div class="template-option-info">
            <h4>${t.name}</h4>
            <p>${t.variables.join(', ')}</p>
          </div>
        </div>
      `;
    }).join('');

    // Render mini previews
    this.templates.forEach(t => {
      setTimeout(() => {
        const el = document.getElementById(`sel-preview-${t.id}`);
        if (el) TemplateRenderer.renderMiniPreview(t, {}, el);
      }, 0);
    });

    this.updateGenerateUI();
  },

  /**
   * Select a template
   */
  selectTemplate(id) {
    this.selectedTemplate = this.templates.find(t => t.id === id);
    this.renderGeneratePage();
  },

  /**
   * Update generate page UI based on selected template
   */
  updateGenerateUI() {
    const hasTemplate = !!this.selectedTemplate;
    
    document.getElementById('preview-card').style.display = hasTemplate ? 'block' : 'none';
    document.getElementById('variables-card').style.display = hasTemplate ? 'block' : 'none';
    document.getElementById('math-card').style.display = hasTemplate ? 'block' : 'none';
    document.getElementById('no-template-card').style.display = hasTemplate ? 'none' : 'block';

    if (hasTemplate) {
      // Render preview
      const previewEl = document.getElementById('generate-preview');
      TemplateRenderer.renderMiniPreview(this.selectedTemplate, {}, previewEl);

      // Update captions
      document.getElementById('preview-caption').textContent = CaptionGenerator.generate({});
      document.getElementById('preview-hashtags').textContent = CaptionGenerator.generateHashtags({});

      // Render variable sections
      this.renderVariableSections();
      this.updateVariationCount();
    }
  },

  /**
   * Render variable sections
   */
  renderVariableSections() {
    let html = '';
    const vars = this.selectedTemplate.variables;
    const isMockupTemplate = this.selectedTemplate.requiresMockup;

    if (vars.includes('NICHE')) {
      if (isMockupTemplate) {
        // Show niches with mockup status indicators
        html += this.createMockupNicheSection();
      } else {
        html += this.createVarSection('Niches', this.niches, 'useNiches', true);
      }
    }
    if (vars.includes('CITY')) {
      html += this.createVarSection('Cities', this.cities, 'useCities', false);
    }
    if (vars.includes('HOOK')) {
      html += this.createVarSection('Hooks', this.hooks, 'useHooks', false);
    }
    if (vars.includes('TAGLINE')) {
      html += this.createVarSection('Taglines', this.taglines, 'useTaglines', false);
    }

    document.getElementById('variable-sections').innerHTML = html;
  },

  /**
   * Create mockup niche section with upload status
   */
  createMockupNicheSection() {
    const nichesWithMockups = this.niches.filter(n => NICHE_MOCKUPS && NICHE_MOCKUPS[n]);
    const nichesWithoutMockups = this.niches.filter(n => !NICHE_MOCKUPS || !NICHE_MOCKUPS[n]);
    
    const tags = this.niches.map(niche => {
      const hasMockup = NICHE_MOCKUPS && NICHE_MOCKUPS[niche];
      const color = NICHE_COLORS[niche] || '#666';
      const statusIcon = hasMockup ? '✓' : '⚠️';
      const statusClass = hasMockup ? 'has-mockup' : 'no-mockup';
      return `<span class="tag ${statusClass}">
        <span class="color-dot" style="background: ${color}"></span>
        ${niche} ${statusIcon}
      </span>`;
    }).join('');

    const note = nichesWithoutMockups.length > 0 
      ? `<p class="mockup-note">⚠️ ${nichesWithoutMockups.length} niches need mockup images. <a href="#" onclick="App.navigateTo('settings'); return false;">Upload in Settings</a></p>`
      : `<p class="mockup-note" style="color: #22c55e;">✓ All ${this.niches.length} niches have mockup images!</p>`;

    return `
      <div class="var-section">
        <div class="var-header">
          <input type="checkbox" checked onchange="App.useNiches=this.checked; App.updateVariationCount()">
          <label>Niches (${this.niches.length}) - 1 variation per niche</label>
        </div>
        ${note}
        <div class="tag-list">${tags}</div>
      </div>
    `;
  },

  /**
   * Create a variable section HTML
   */
  createVarSection(label, items, toggleVar, showColor) {
    const checked = this[toggleVar] ? 'checked' : '';
    const tags = items.map(item => {
      const colorDot = showColor ? `<span class="color-dot" style="background: ${NICHE_COLORS[item] || '#666'}"></span>` : '';
      return `<span class="tag">${colorDot}${item}</span>`;
    }).join('');

    return `
      <div class="var-section">
        <div class="var-header">
          <input type="checkbox" ${checked} onchange="App.${toggleVar}=this.checked; App.updateVariationCount()">
          <label>${label} (${items.length})</label>
        </div>
        <div class="tag-list">${tags}</div>
      </div>
    `;
  },

  /**
   * Update variation count display
   */
  updateVariationCount() {
    if (!this.selectedTemplate) return;

    let count = 1;
    const vars = this.selectedTemplate.variables;

    if (vars.includes('NICHE') && this.useNiches) count *= this.niches.length;
    if (vars.includes('CITY') && this.useCities) count *= this.cities.length;
    if (vars.includes('HOOK') && this.useHooks) count *= this.hooks.length;
    if (vars.includes('TAGLINE') && this.useTaglines) count *= this.taglines.length;

    document.getElementById('variation-count').textContent = count.toLocaleString();
    document.getElementById('generate-btn').textContent = `🎬 Generate ${Math.min(count, this.maxVariations)} Videos`;
  },

  /**
   * Generate variations
   */
  generateVariations() {
    if (!this.selectedTemplate) return;

    document.getElementById('progress-section').style.display = 'block';
    document.getElementById('generate-btn').style.display = 'none';

    const allCombinations = [];
    const vars = this.selectedTemplate.variables;

    const nicheList = this.useNiches && vars.includes('NICHE') ? this.niches : [''];
    const cityList = this.useCities && vars.includes('CITY') ? this.cities : [''];
    const hookList = this.useHooks && vars.includes('HOOK') ? this.hooks : [''];
    const taglineList = this.useTaglines && vars.includes('TAGLINE') ? this.taglines : [''];

    for (const niche of nicheList) {
      for (const city of cityList) {
        for (const hook of hookList) {
          for (const tagline of taglineList) {
            if (allCombinations.length >= this.maxVariations) break;
            allCombinations.push({
              id: `var-${Date.now()}-${allCombinations.length}`,
              templateId: this.selectedTemplate.id,
              variables: {
                NICHE: niche || undefined,
                CITY: city || undefined,
                HOOK: hook || undefined,
                TAGLINE: tagline || undefined
              }
            });
          }
        }
      }
    }

    // Animate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      document.getElementById('progress-fill').style.width = progress + '%';
      document.getElementById('progress-percent').textContent = progress;
      
      if (progress >= 100) {
        clearInterval(interval);
        this.variations = allCombinations;
        document.getElementById('progress-section').style.display = 'none';
        document.getElementById('generate-btn').style.display = 'block';
        this.navigateTo('variations');
      }
    }, 80);
  },

  /**
   * Render variations page
   */
  renderVariationsPage() {
    document.getElementById('variation-total').textContent = this.variations.length;
    document.getElementById('zip-all-btn').style.display = this.variations.length > 0 ? 'inline-flex' : 'none';
    this.updateSelectedCount();

    const container = document.getElementById('gallery-content');

    if (this.variations.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">🎬</div>
          <p>No content generated yet</p>
          <button class="btn btn-pink" onclick="App.navigateTo('generate')">Create Content</button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="gallery-grid">
        ${this.variations.map(v => {
          const template = this.templates.find(t => t.id === v.templateId);
          const previewId = `var-preview-${v.id}`;
          const isSelected = this.selectedVariations.includes(v.id);
          return `
            <div class="variation-card ${isSelected ? 'selected' : ''}" onclick="App.toggleVariation('${v.id}')">
              <div id="${previewId}" class="preview-inner"></div>
              <div class="check">✓</div>
              <button class="download-single" onclick="event.stopPropagation(); App.downloadSingleImage('${v.id}')" title="Download PNG">⬇️</button>
              <div class="label">${v.variables.CITY || ''} ${v.variables.NICHE || ''}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Render previews
    this.variations.forEach(v => {
      setTimeout(() => {
        const template = this.templates.find(t => t.id === v.templateId);
        const el = document.getElementById(`var-preview-${v.id}`);
        if (el && template) TemplateRenderer.renderMiniPreview(template, v.variables, el);
      }, 0);
    });
  },

  /**
   * Toggle variation selection
   */
  toggleVariation(id) {
    if (this.selectedVariations.includes(id)) {
      this.selectedVariations = this.selectedVariations.filter(v => v !== id);
    } else {
      this.selectedVariations.push(id);
    }
    this.renderVariationsPage();
  },

  /**
   * Select all variations
   */
  selectAllVariations() {
    this.selectedVariations = this.variations.map(v => v.id);
    this.renderVariationsPage();
  },

  /**
   * Clear selection
   */
  clearSelection() {
    this.selectedVariations = [];
    this.renderVariationsPage();
  },

  /**
   * Update selected count display
   */
  updateSelectedCount() {
    document.getElementById('selected-count').textContent = this.selectedVariations.length;
    document.getElementById('zip-selected-btn').style.display = this.selectedVariations.length > 0 ? 'inline-flex' : 'none';
  },

  /**
   * Download single image
   */
  downloadSingleImage(variationId) {
    const variation = this.variations.find(v => v.id === variationId);
    if (!variation) return;

    const template = this.templates.find(t => t.id === variation.templateId);
    if (!template) return;

    const dataUrl = TemplateRenderer.renderToCanvas(template, variation.variables);
    const link = document.createElement('a');
    link.download = `${variation.variables.NICHE || 'content'}-${variation.variables.CITY || 'reel'}.png`;
    link.href = dataUrl;
    link.click();
  },

  /**
   * Convert data URL to Blob
   */
  dataURLtoBlob(dataurl) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  },

  /**
   * Create video from canvas using native MediaRecorder API
   * Works locally without CORS issues
   */
  async createVideoFromCanvas(template, variables, duration) {
    return new Promise((resolve, reject) => {
      // Create a dedicated canvas for video recording
      const videoCanvas = document.createElement('canvas');
      videoCanvas.width = CANVAS_WIDTH;
      videoCanvas.height = CANVAS_HEIGHT;
      const ctx = videoCanvas.getContext('2d');
      
      // Render the template to our video canvas
      const mainCanvas = document.getElementById('render-canvas');
      TemplateRenderer.renderToCanvas(template, variables);
      ctx.drawImage(mainCanvas, 0, 0);
      
      // Get canvas stream
      const stream = videoCanvas.captureStream(30); // 30 FPS
      
      // Use VP8 codec for best compatibility (works on all platforms when uploaded)
      let mimeType = 'video/webm;codecs=vp8';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      
      const chunks = [];
      const recorder = new MediaRecorder(stream, { 
        mimeType,
        videoBitsPerSecond: 8000000 // 8 Mbps for high quality
      });
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };
      
      recorder.onerror = (e) => {
        reject(e.error || new Error('Recording failed'));
      };
      
      // Start recording and request data frequently
      recorder.start(100); // Get data every 100ms for smoother video
      
      // Keep drawing frames for the full duration
      const startTime = Date.now();
      const drawFrame = () => {
        ctx.drawImage(mainCanvas, 0, 0);
        if (Date.now() - startTime < duration * 1000) {
          requestAnimationFrame(drawFrame);
        }
      };
      drawFrame();
      
      // Stop after duration
      setTimeout(() => {
        recorder.stop();
        stream.getTracks().forEach(track => track.stop());
      }, duration * 1000);
    });
  },

  /**
   * Download ZIP file with videos
   */
  async downloadZip(mode) {
    const list = mode === 'all' 
      ? this.variations 
      : this.variations.filter(v => this.selectedVariations.includes(v.id));
    
    if (list.length === 0) return;

    const modal = document.getElementById('download-modal');
    const progressBar = document.getElementById('download-progress');
    const statusText = document.getElementById('download-status');

    document.getElementById('modal-title').textContent = '🎬 Creating Videos';
    document.getElementById('modal-desc').textContent = `Rendering ${list.length} videos (${this.videoDuration}s each) for TikTok, Reels & Shorts...`;

    modal.classList.add('active');
    progressBar.style.width = '0%';
    statusText.textContent = 'Initializing video encoder...';

    try {
      const zip = new JSZip();
      const videoFolder = zip.folder('videos');
      
      // Always use .webm - it's what browsers create and all social platforms accept it
      const fileExt = 'webm';
      
      let captionsTxt = 'EASY WEB STUDIOS - VIDEO CAPTIONS\n';
      captionsTxt += '=====================================\n\n';
      captionsTxt += `Format: 1080x1920 (9:16) - ${this.videoDuration}s videos\n`;
      captionsTxt += 'Optimized for TikTok, YT Shorts, IG Reels, FB Reels\n\n';

      for (let i = 0; i < list.length; i++) {
        const variation = list[i];
        const template = this.templates.find(t => t.id === variation.templateId);

        if (template) {
          statusText.textContent = `Recording video ${i + 1} of ${list.length}... (${this.videoDuration}s)`;
          
          // Create video from canvas
          const baseFilename = `${(i + 1).toString().padStart(3, '0')}-${(variation.variables.NICHE || 'post').replace(/\s+/g, '-')}-${(variation.variables.CITY || 'content').replace(/\s+/g, '-')}`;
          const videoFilename = `${baseFilename}.${fileExt}`;
          
          const videoBlob = await this.createVideoFromCanvas(
            template,
            variation.variables,
            this.videoDuration
          );
          
          videoFolder.file(videoFilename, videoBlob);

          // Add caption to txt file
          captionsTxt += `--- ${videoFilename} ---\n`;
          captionsTxt += CaptionGenerator.generate(variation.variables) + '\n\n';
          captionsTxt += CaptionGenerator.generateHashtags(variation.variables) + '\n\n\n';
        }

        const progress = ((i + 1) / list.length) * 100;
        progressBar.style.width = progress + '%';
      }

      // Add captions file
      zip.file('captions.txt', captionsTxt);

      // Add readme
      const readme = `EASY WEB STUDIOS VIDEO PACK
==============================

This ZIP contains ${list.length} videos ready to upload:
- TikTok ✓
- YouTube Shorts ✓
- Instagram Reels ✓
- Facebook Reels ✓

FORMAT: 1080x1920 pixels (9:16 vertical)
DURATION: ${this.videoDuration} seconds each
FORMAT: WebM (VP8 codec)

⚠️  IMPORTANT FOR MAC USERS:
QuickTime cannot play WebM files. To preview videos:
- Use VLC Player (free): https://www.videolan.org/vlc/
- Or drag into Chrome browser to play
- Or just upload directly - all platforms accept WebM!

UPLOAD DIRECTLY:
These videos work immediately on all social platforms.
Just upload, add music in-app, and post!

HOW TO CONVERT TO MP4 (optional):
- Use CloudConvert.com (free, online)
- Or HandBrake (free desktop app)

Generated by Easy Web Studios Content Engine
`;
      zip.file('README.txt', readme);

      statusText.textContent = 'Compressing ZIP...';

      const content = await zip.generateAsync({ type: 'blob' });

      const timestamp = new Date().toISOString().slice(0, 10);
      saveAs(content, `easy-web-videos-${timestamp}.zip`);

      statusText.textContent = 'Complete! ✓';
      await new Promise(r => setTimeout(r, 1000));
      modal.classList.remove('active');
      
    } catch (error) {
      console.error('Video creation error:', error);
      statusText.textContent = `Error: ${error.message}. Trying image fallback...`;
      
      // Fallback to image export
      await new Promise(r => setTimeout(r, 1500));
      await this.downloadImagesZip(list, modal, progressBar, statusText);
    }
  },

  /**
   * Fallback: Download ZIP with images (if video creation fails)
   */
  async downloadImagesZip(list, modal, progressBar, statusText) {
    const zip = new JSZip();
    const imgFolder = zip.folder('images');
    
    let captionsTxt = 'EASY WEB STUDIOS - CONTENT CAPTIONS\n';
    captionsTxt += '=====================================\n\n';
    captionsTxt += 'Format: 1080x1920 (9:16) - Optimized for TikTok, YT Shorts, IG Reels, FB Reels\n\n';

    for (let i = 0; i < list.length; i++) {
      const variation = list[i];
      const template = this.templates.find(t => t.id === variation.templateId);

      if (template) {
        const dataUrl = TemplateRenderer.renderToCanvas(template, variation.variables);
        const blob = this.dataURLtoBlob(dataUrl);
        const filename = `${(i + 1).toString().padStart(3, '0')}-${variation.variables.NICHE || 'post'}-${variation.variables.CITY || 'content'}.png`;
        imgFolder.file(filename, blob);

        captionsTxt += `--- ${filename} ---\n`;
        captionsTxt += CaptionGenerator.generate(variation.variables) + '\n\n';
        captionsTxt += CaptionGenerator.generateHashtags(variation.variables) + '\n\n\n';
      }

      const progress = ((i + 1) / list.length) * 100;
      progressBar.style.width = progress + '%';
      statusText.textContent = `Rendered ${i + 1} of ${list.length}`;

      await new Promise(r => setTimeout(r, 10));
    }

    zip.file('captions.txt', captionsTxt);
    zip.file('README.txt', `Images exported as fallback. Import into CapCut/Premiere and set ${this.videoDuration}s duration per image.`);

    statusText.textContent = 'Compressing ZIP...';

    const content = await zip.generateAsync({ type: 'blob' });
    const timestamp = new Date().toISOString().slice(0, 10);
    saveAs(content, `easy-web-images-${timestamp}.zip`);

    statusText.textContent = 'Complete! ✓';
    await new Promise(r => setTimeout(r, 1000));
    modal.classList.remove('active');
  },

  /**
   * Render settings page
   */
  renderSettings() {
    this.renderTagList('niche-tags', this.niches, 'niches', true);
    this.renderTagList('city-tags', this.cities, 'cities', false);
    this.renderTagList('hook-tags', this.hooks, 'hooks', false);
    this.renderTagList('tagline-tags', this.taglines, 'taglines', false);
    this.renderMockupGrid();
  },

  /**
   * Render mockup image upload grid
   */
  renderMockupGrid() {
    const container = document.getElementById('mockup-grid');
    if (!container) return;

    container.innerHTML = this.niches.map(niche => {
      const color = NICHE_COLORS[niche] || '#666';
      const emoji = NICHE_EMOJIS[niche] || '🔥';
      const hasMockup = NICHE_MOCKUPS && NICHE_MOCKUPS[niche];
      
      return `
        <div class="mockup-item ${hasMockup ? 'has-image' : ''}" data-niche="${niche}">
          <div class="niche-name">
            <span class="niche-color" style="background: ${color}"></span>
            ${emoji} ${niche}
          </div>
          <div class="mockup-preview">
            ${hasMockup 
              ? `<img src="${NICHE_MOCKUPS[niche]}" alt="${niche} mockup">` 
              : `<span class="placeholder">📱</span>`
            }
          </div>
          <input type="file" id="mockup-${niche.replace(/\s+/g, '-')}" accept="image/*" onchange="App.handleMockupUpload('${niche}', this)">
          <button class="upload-btn" onclick="document.getElementById('mockup-${niche.replace(/\s+/g, '-')}').click()">
            ${hasMockup ? '🔄 Replace' : '📤 Upload'} Mockup
          </button>
          ${hasMockup ? `<button class="remove-btn" onclick="App.removeMockup('${niche}')">🗑️ Remove</button>` : ''}
        </div>
      `;
    }).join('');
  },

  /**
   * Handle mockup image upload
   */
  handleMockupUpload(niche, input) {
    const file = input.files[0];
    if (!file) return;

    // Check file size (max 2MB for localStorage)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image too large! Please use an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      
      // Resize image to reasonable dimensions
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 800;
        const maxHeight = 600;
        
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        
        // Save to storage and renderer
        TemplateRenderer.addMockupImage(niche, resizedDataUrl);
        
        // Re-render settings
        this.renderSettings();
        
        console.log(`Mockup uploaded for ${niche}`);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  },

  /**
   * Remove mockup image
   */
  removeMockup(niche) {
    if (confirm(`Remove mockup image for ${niche}?`)) {
      TemplateRenderer.removeMockupImage(niche);
      this.renderSettings();
    }
  },

  /**
   * Render tag list
   */
  renderTagList(containerId, list, listName, showColor) {
    const container = document.getElementById(containerId);
    container.innerHTML = list.map((item, i) => {
      const colorDot = showColor ? `<span class="color-dot" style="background: ${NICHE_COLORS[item] || '#666'}"></span>` : '';
      return `
        <span class="tag">
          ${colorDot}${item}
          <button class="remove" onclick="App.removeFromList('${listName}', ${i})">×</button>
        </span>
      `;
    }).join('');
  },

  /**
   * Remove item from list
   */
  removeFromList(listName, index) {
    this[listName].splice(index, 1);
    this.renderSettings();
    this.renderDashboard();
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
