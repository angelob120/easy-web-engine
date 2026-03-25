/**
 * CONTENT FACTORY - Main Application
 * Templates loaded from server API (Railway-ready)
 */

const App = {
  currentPage: 'dashboard',
  selectedTemplate: null,
  selectedAssets: {},
  headlines: [],
  generatedVariations: [],
  exportQueue: [],
  editingVariation: null,
  templates: [],

  async init() {
    TemplateRenderer.init();
    this.loadSavedState();
    this.setupNavigation();
    this.setupEventListeners();
    await this.loadTemplates();
    this.renderDashboard();
  },

  // ============================================
  // TEMPLATE SERVER API
  // ============================================

  async loadTemplates() {
    try {
      const res = await fetch('/api/templates');
      this.templates = await res.json();
    } catch (e) {
      console.error('Failed to load templates:', e);
      this.templates = [];
    }
  },

  async apiCreateTemplate(data) {
    const res = await fetch('/api/templates', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create template');
    return res.json();
  },

  async apiUpdateTemplate(id, data) {
    const res = await fetch('/api/templates/' + id, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update template');
    return res.json();
  },

  async apiDeleteTemplate(id) {
    const res = await fetch('/api/templates/' + id, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete template');
    return res.json();
  },

  // ============================================
  // STATE
  // ============================================

  loadSavedState() {
    try {
      const assets = localStorage.getItem('cf_assets');
      if (assets) AppState.assets = JSON.parse(assets);
      const headlines = localStorage.getItem('cf_headlines');
      if (headlines) this.headlines = JSON.parse(headlines);
      const queue = localStorage.getItem('cf_export_queue');
      if (queue) this.exportQueue = JSON.parse(queue);
    } catch (e) { console.log('Error loading state:', e); }
  },

  saveState() {
    try {
      localStorage.setItem('cf_assets', JSON.stringify(AppState.assets));
      localStorage.setItem('cf_headlines', JSON.stringify(this.headlines));
      localStorage.setItem('cf_export_queue', JSON.stringify(this.exportQueue));
    } catch (e) { console.log('Error saving state:', e); }
  },

  // ============================================
  // NAVIGATION
  // ============================================

  setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.navigateTo(btn.dataset.page));
    });
  },

  navigateTo(page) {
    this.currentPage = page;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-page="' + page + '"]')?.classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page)?.classList.add('active');
    switch (page) {
      case 'dashboard': this.renderDashboard(); break;
      case 'assets': this.renderAssetsPage(); break;
      case 'templates': this.renderTemplatesPage(); break;
      case 'generate': this.renderGeneratePage(); break;
      case 'browse': this.renderBrowsePage(); break;
      case 'export': this.renderExportPage(); break;
    }
  },

  setupEventListeners() {
    document.addEventListener('dragover', e => e.preventDefault());
    document.addEventListener('drop', e => {
      e.preventDefault();
      if (this.currentPage === 'assets' && e.dataTransfer.files.length) {
        this.handleAssetUpload(e.dataTransfer.files);
      }
    });
  },

  // ============================================
  // DASHBOARD
  // ============================================

  async renderDashboard() {
    const visibleTemplates = this.templates.filter(t => t.visible !== false);
    const imgflipTemplates = this.templates.filter(t => t.type === 'imgflip' || t.imgflipId);
    
    // Load meme stats from server
    let memeStats = { totalFiles: 0, images: 0, gifs: 0 };
    try {
      const res = await fetch('/api/assets/stats');
      memeStats = await res.json();
    } catch (e) { console.log('Could not load meme stats'); }
    
    document.getElementById('stat-assets').textContent = AppState.assets.length + (memeStats.totalFiles > 0 ? ' + ' + memeStats.totalFiles : '');
    document.getElementById('stat-templates').textContent = visibleTemplates.length;
    document.getElementById('stat-headlines').textContent = this.headlines.length;
    document.getElementById('stat-queue').textContent = this.exportQueue.length;
    const headlines = Math.max(1, this.headlines.length);
    const assets = Math.max(1, AppState.assets.length + memeStats.totalFiles);
    document.getElementById('stat-variations').textContent = (headlines * assets * visibleTemplates.length).toLocaleString();
    
    // Recent templates
    document.getElementById('recent-templates').innerHTML = visibleTemplates.slice(0, 6).map(t =>
      '<div class="template-mini" onclick="App.selectTemplateAndGenerate(\'' + t.id + '\')">' +
        '<div class="template-mini-icon">' + t.icon + '</div>' +
        '<div class="template-mini-info">' +
          '<div class="template-mini-name">' + t.name + '</div>' +
          '<div class="template-mini-category">' + t.category + '</div>' +
        '</div>' +
      '</div>'
    ).join('');
    
    // Add meme library section if it doesn't exist
    let memeSection = document.getElementById('meme-library-section');
    if (!memeSection) {
      const dashboardPage = document.getElementById('page-dashboard');
      const section = document.createElement('div');
      section.className = 'card';
      section.id = 'meme-library-section';
      dashboardPage.appendChild(section);
      memeSection = section;
    }
    
    memeSection.innerHTML = 
      '<h3 class="card-title">🖼️ Meme Library</h3>' +
      '<div class="meme-stats-row">' +
        '<div class="meme-stat"><span class="meme-stat-value">' + memeStats.totalFiles + '</span><span class="meme-stat-label">Total Images</span></div>' +
        '<div class="meme-stat"><span class="meme-stat-value">' + memeStats.images + '</span><span class="meme-stat-label">Memes</span></div>' +
        '<div class="meme-stat"><span class="meme-stat-value">' + memeStats.gifs + '</span><span class="meme-stat-label">GIFs</span></div>' +
        '<div class="meme-stat"><span class="meme-stat-value">' + imgflipTemplates.length + '</span><span class="meme-stat-label">Templates</span></div>' +
        '<div class="meme-stat"><span class="meme-stat-value">' + (memeStats.totalSizeMB || '0') + ' MB</span><span class="meme-stat-label">Storage</span></div>' +
      '</div>' +
      '<div class="meme-library-actions">' +
        (memeStats.totalFiles === 0 
          ? '<p class="hint">No meme images scraped yet. Click below to import from imgflip.</p>'
          : '<p class="hint">Meme images are stored on your Railway volume and ready to use!</p>') +
        '<div class="action-btns">' +
          '<button class="btn btn-purple" onclick="App.importAllImgflip()">🌐 Import All from Imgflip</button>' +
          '<button class="btn btn-secondary" onclick="App.navigateTo(\'assets\')">📁 Browse Assets</button>' +
          '<button class="btn btn-secondary" onclick="App.migrateImgflipTemplates()">🔧 Fix Templates</button>' +
        '</div>' +
      '</div>';
  },

  async migrateImgflipTemplates() {
    try {
      const res = await fetch('/api/templates/migrate-imgflip', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Migrated ' + data.migrated + ' templates. Reloading...');
        await this.loadTemplates();
        this.renderDashboard();
      } else {
        alert('Migration failed: ' + data.error);
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  },

  selectTemplateAndGenerate(id) {
    this.selectedTemplate = this.templates.find(t => t.id === id);
    this.navigateTo('generate');
  },

  // ============================================
  // ASSETS PAGE
  // ============================================

  memeImages: [], // Cache for loaded meme images from server

  async renderAssetsPage() {
    const container = document.getElementById('assets-grid');
    
    // First, load meme images from server if not cached
    if (this.memeImages.length === 0) {
      await this.loadMemeImages();
    }
    
    // Group user assets
    const grouped = {};
    ASSET_CATEGORIES.forEach(cat => grouped[cat.id] = []);
    AppState.assets.forEach(asset => {
      const cat = asset.category || 'misc';
      if (grouped[cat]) grouped[cat].push(asset); else grouped['misc'].push(asset);
    });
    
    // Add meme images to the meme-images category
    grouped['meme-images'] = this.memeImages;
    
    const totalAssets = AppState.assets.length + this.memeImages.length;
    
    let html = '<div class="assets-header">' +
      '<div class="assets-actions">' +
        '<label class="btn btn-pink">📤 Upload Assets<input type="file" multiple accept="image/*,video/*" onchange="App.handleAssetUpload(this.files)" hidden></label>' +
        '<button class="btn btn-secondary" onclick="App.refreshMemeImages()">🔄 Refresh Meme Library</button>' +
      '</div>' +
      '<span class="asset-count">' + totalAssets + ' assets (' + this.memeImages.length + ' meme images)</span>' +
    '</div>';
    
    // Render meme images category first (if any exist)
    if (this.memeImages.length > 0) {
      html += '<div class="asset-category">' +
        '<h3>🖼️ Meme Images Library (' + this.memeImages.length + ')</h3>' +
        '<p class="category-desc">Scraped from imgflip - use these as backgrounds for your memes</p>' +
        '<div class="meme-filter"><input type="text" id="meme-search" placeholder="Search memes..." oninput="App.filterMemeImages(this.value)"></div>' +
        '<div class="asset-grid meme-grid" id="meme-images-grid">';
      
      this.memeImages.slice(0, 50).forEach(meme => {
        html += '<div class="asset-card meme-card" data-name="' + meme.name.toLowerCase() + '" onclick="App.useMemeAsAsset(\'' + meme.id + '\')">' +
          '<div class="asset-preview">' +
            '<img src="' + meme.url + '" alt="' + meme.name + '" loading="lazy">' +
            (meme.isGif ? '<span class="gif-badge">GIF</span>' : '') +
          '</div>' +
          '<div class="asset-info">' +
            '<span class="asset-name">' + meme.name.substring(0, 25) + '</span>' +
          '</div>' +
        '</div>';
      });
      
      if (this.memeImages.length > 50) {
        html += '<div class="load-more"><button class="btn btn-secondary" onclick="App.showAllMemeImages()">Show All (' + this.memeImages.length + ')</button></div>';
      }
      html += '</div></div>';
    }
    
    // Render user-uploaded assets by category
    ASSET_CATEGORIES.filter(cat => cat.id !== 'meme-images').forEach(cat => {
      if (grouped[cat.id].length === 0) return;
      html += '<div class="asset-category"><h3>' + cat.icon + ' ' + cat.name + ' (' + grouped[cat.id].length + ')</h3><div class="asset-grid">';
      grouped[cat.id].forEach(asset => {
        html += '<div class="asset-card"><div class="asset-preview">' +
          (asset.type === 'video' ? '<video src="' + asset.dataUrl + '" muted></video><span class="video-badge">🎬</span>' : '<img src="' + asset.dataUrl + '" alt="' + asset.name + '">') +
          '</div><div class="asset-info"><span class="asset-name">' + asset.name + '</span><button class="asset-delete" onclick="App.deleteAsset(\'' + asset.id + '\')">🗑️</button></div>' +
          '<select class="asset-category-select" onchange="App.updateAssetCategory(\'' + asset.id + '\', this.value)">' +
          ASSET_CATEGORIES.filter(c => c.id !== 'meme-images').map(c => '<option value="' + c.id + '"' + (asset.category === c.id ? ' selected' : '') + '>' + c.icon + ' ' + c.name + '</option>').join('') +
          '</select></div>';
      });
      html += '</div></div>';
    });
    
    if (totalAssets === 0) {
      html = '<div class="empty-state full-width">' +
        '<div class="icon">📁</div>' +
        '<p>No assets yet</p>' +
        '<div class="empty-actions">' +
          '<label class="btn btn-pink">📤 Upload Assets<input type="file" multiple accept="image/*,video/*" onchange="App.handleAssetUpload(this.files)" hidden></label>' +
          '<button class="btn btn-secondary" onclick="App.goToScraper()">🔄 Import from Imgflip</button>' +
        '</div>' +
      '</div>';
    }
    
    container.innerHTML = html;
  },

  async loadMemeImages() {
    try {
      const res = await fetch('/api/assets/memes');
      const data = await res.json();
      this.memeImages = data.assets || [];
    } catch (e) {
      console.error('Failed to load meme images:', e);
      this.memeImages = [];
    }
  },

  async refreshMemeImages() {
    this.memeImages = [];
    await this.loadMemeImages();
    this.renderAssetsPage();
  },

  filterMemeImages(query) {
    const grid = document.getElementById('meme-images-grid');
    if (!grid) return;
    const cards = grid.querySelectorAll('.meme-card');
    const q = query.toLowerCase();
    cards.forEach(card => {
      const name = card.dataset.name || '';
      card.style.display = name.includes(q) ? '' : 'none';
    });
  },

  showAllMemeImages() {
    const grid = document.getElementById('meme-images-grid');
    if (!grid) return;
    
    // Clear and show all
    let html = '';
    this.memeImages.forEach(meme => {
      html += '<div class="asset-card meme-card" data-name="' + meme.name.toLowerCase() + '" onclick="App.useMemeAsAsset(\'' + meme.id + '\')">' +
        '<div class="asset-preview">' +
          '<img src="' + meme.url + '" alt="' + meme.name + '" loading="lazy">' +
          (meme.isGif ? '<span class="gif-badge">GIF</span>' : '') +
        '</div>' +
        '<div class="asset-info">' +
          '<span class="asset-name">' + meme.name.substring(0, 25) + '</span>' +
        '</div>' +
      '</div>';
    });
    grid.innerHTML = html;
  },

  useMemeAsAsset(memeId) {
    const meme = this.memeImages.find(m => m.id === memeId);
    if (!meme) return;
    
    // Convert server meme to usable asset format
    const asset = {
      id: memeId,
      name: meme.name,
      type: 'image',
      category: 'meme-images',
      dataUrl: window.location.origin + meme.url,  // Full URL for canvas drawing
      serverUrl: meme.url,
      isGif: meme.isGif,
      isMemeImage: true
    };
    
    // Check if already added
    if (!AppState.assets.find(a => a.id === memeId)) {
      AppState.assets.push(asset);
      this.saveState();
    }
    
    alert('Added "' + meme.name + '" to your assets! Go to Generate to use it.');
  },

  goToScraper() {
    this.navigateTo('dashboard');
    // Scroll to or highlight the scraper section if it exists
  },

  async handleAssetUpload(files) {
    for (const file of files) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) continue;
      const reader = new FileReader();
      reader.onload = (e) => {
        const asset = {
          id: 'asset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          name: file.name, type: file.type.startsWith('video/') ? 'video' : 'image',
          dataUrl: e.target.result, category: this.detectAssetCategory(file.name), uploadedAt: Date.now()
        };
        if (asset.type === 'image') {
          this.resizeImage(asset.dataUrl, 1200, 1200).then(resized => {
            asset.dataUrl = resized; AppState.assets.push(asset); this.saveState(); this.renderAssetsPage();
          });
        } else { AppState.assets.push(asset); this.saveState(); this.renderAssetsPage(); }
      };
      reader.readAsDataURL(file);
    }
  },

  detectAssetCategory(filename) {
    const lower = filename.toLowerCase();
    if (lower.includes('reaction') || lower.includes('face')) return 'reactions';
    if (lower.includes('bg') || lower.includes('background')) return 'backgrounds';
    if (lower.includes('screen') || lower.includes('shot')) return 'screenshots';
    if (lower.includes('brain')) return 'brains';
    return 'misc';
  },

  resizeImage(dataUrl, maxWidth, maxHeight) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width <= maxWidth && height <= maxHeight) { resolve(dataUrl); return; }
        if (width > maxWidth) { height = height * maxWidth / width; width = maxWidth; }
        if (height > maxHeight) { width = width * maxHeight / height; height = maxHeight; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = dataUrl;
    });
  },

  deleteAsset(id) {
    if (!confirm('Delete this asset?')) return;
    AppState.assets = AppState.assets.filter(a => a.id !== id);
    this.saveState(); this.renderAssetsPage();
  },

  updateAssetCategory(id, category) {
    const asset = AppState.assets.find(a => a.id === id);
    if (asset) { asset.category = category; this.saveState(); }
  },

  // ============================================
  // TEMPLATES PAGE - Full Management UI
  // ============================================

  renderTemplatesPage() {
    const container = document.getElementById('templates-grid');
    const all = this.templates;
    const visibleCount = all.filter(t => t.visible !== false).length;

    let html = '<div class="template-mgmt-header">' +
      '<div class="template-mgmt-info">' +
        '<span class="tpl-count">' + all.length + ' templates total</span>' +
        '<span class="tpl-visible-count">👁️ ' + visibleCount + ' shown in editor</span>' +
      '</div>' +
      '<div class="template-mgmt-btns">' +
        '<button class="btn btn-secondary" onclick="App.openImgflipImporter()">📥 Pick from Imgflip</button>' +
        '<button class="btn btn-purple" onclick="App.importAllImgflip()">🌐 Import All (Memes + GIFs)</button>' +
        '<button class="btn btn-pink" onclick="App.openTemplateEditor(null)">+ New Template</button>' +
      '</div>' +
    '</div>' +
    '<div class="template-mgmt-grid">';

    all.forEach(t => {
      const isVisible = t.visible !== false;
      html += '<div class="template-mgmt-card' + (isVisible ? '' : ' tpl-hidden') + '">' +
        '<div class="tpl-card-top">' +
          '<span class="tpl-icon">' + (t.icon || '🎨') + '</span>' +
          '<div class="tpl-card-info"><strong>' + t.name + '</strong><span class="tpl-category">' + t.category + '</span></div>' +
          '<div class="tpl-card-actions">' +
            '<button class="tpl-visibility-btn' + (isVisible ? ' active' : '') + '" onclick="App.toggleTemplateVisibility(\'' + t.id + '\')" title="' + (isVisible ? 'Hide from editor' : 'Show in editor') + '">' + (isVisible ? '👁️' : '🚫') + '</button>' +
            '<button class="tpl-edit-btn" onclick="App.openTemplateEditor(\'' + t.id + '\')" title="Edit">✏️</button>' +
            '<button class="tpl-delete-btn" onclick="App.deleteTemplate(\'' + t.id + '\')" title="Delete">🗑️</button>' +
          '</div>' +
        '</div>' +
        '<p class="tpl-description">' + t.description + '</p>' +
        '<div class="tpl-zones-preview">' +
          (t.zones || []).map(z => '<span class="badge">' + z.label + '</span>').join('') +
          (t.assetSlots || []).map(s => '<span class="badge badge-asset">🖼️ ' + s.label + '</span>').join('') +
        '</div>' +
        '<div class="tpl-status-bar ' + (isVisible ? 'status-visible' : 'status-hidden') + '">' +
          (isVisible ? '✓ Shown in Generate editor' : '◯ Hidden from editor') +
        '</div>' +
      '</div>';
    });

    html += '</div>';
    container.innerHTML = html;
  },

  async toggleTemplateVisibility(id) {
    const t = this.templates.find(t => t.id === id);
    if (!t) return;
    try {
      const updated = await this.apiUpdateTemplate(id, { visible: t.visible === false });
      const idx = this.templates.findIndex(t => t.id === id);
      this.templates[idx] = updated;
      this.renderTemplatesPage();
    } catch (e) { alert('Failed to update: ' + e.message); }
  },

  async deleteTemplate(id) {
    if (!confirm('Delete this template?')) return;
    try {
      await this.apiDeleteTemplate(id);
      this.templates = this.templates.filter(t => t.id !== id);
      this.renderTemplatesPage();
    } catch (e) { alert('Failed to delete: ' + e.message); }
  },

  // ============================================
  // IMGFLIP IMPORTER
  // ============================================

  async openImgflipImporter() {
    // Show loading modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'imgflip-importer-modal';
    modal.innerHTML =
      '<div class="modal modal-large imgflip-importer">' +
        '<div class="modal-header">' +
          '<h3>📥 Import from Imgflip</h3>' +
          '<button class="close-btn" onclick="document.getElementById(\'imgflip-importer-modal\').remove()">×</button>' +
        '</div>' +
        '<div class="imgflip-importer-body">' +
          '<div class="imgflip-loading">Loading meme templates... ⏳</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    // Fetch memes from server proxy
    let memes = [];
    try {
      const res = await fetch('/api/imgflip/memes');
      const data = await res.json();
      memes = data.data?.memes || [];
    } catch (e) {
      modal.querySelector('.imgflip-loading').textContent = '❌ Failed to load memes. Check your connection.';
      return;
    }

    // Already imported ids
    const importedIds = new Set(this.templates.filter(t => t.imgflipId).map(t => t.imgflipId));
    const selected = new Set();

    const body = modal.querySelector('.imgflip-importer-body');
    body.innerHTML =
      '<div class="imgflip-toolbar">' +
        '<span class="imgflip-count"><span id="imgflip-selected-count">0</span> selected of ' + memes.length + ' memes</span>' +
        '<div class="imgflip-toolbar-btns">' +
          '<button class="btn-small" onclick="App.imgflipSelectAll()">Select All</button>' +
          '<button class="btn-small" onclick="App.imgflipSelectNone()">Clear</button>' +
        '</div>' +
      '</div>' +
      '<div class="imgflip-grid" id="imgflip-grid">' +
        memes.map(m => {
          const alreadyImported = importedIds.has(String(m.id));
          return '<div class="imgflip-card' + (alreadyImported ? ' already-imported' : '') + '" ' +
            'data-id="' + m.id + '" ' +
            (alreadyImported ? '' : 'onclick="App.imgflipToggleSelect(\'' + m.id + '\')"') + '>' +
            '<img src="' + m.url + '" alt="' + m.name + '" loading="lazy">' +
            '<div class="imgflip-card-info">' +
              '<span class="imgflip-name">' + m.name + '</span>' +
              '<span class="imgflip-boxes">' + m.box_count + ' text ' + (m.box_count === 1 ? 'zone' : 'zones') + '</span>' +
            '</div>' +
            (alreadyImported ? '<div class="imgflip-imported-badge">✓ Added</div>' : '<div class="imgflip-select-indicator">+</div>') +
          '</div>';
        }).join('') +
      '</div>' +
      '<div class="modal-footer">' +
        '<button class="btn btn-secondary" onclick="document.getElementById(\'imgflip-importer-modal\').remove()">Cancel</button>' +
        '<button class="btn btn-pink" id="imgflip-import-btn" onclick="App.doImportImgflip()" disabled>Import Selected</button>' +
      '</div>';

    // Store memes list for later use
    this._imgflipMemes = memes;
    this._imgflipSelected = selected;
  },

  imgflipToggleSelect(id) {
    const card = document.querySelector('.imgflip-card[data-id="' + id + '"]');
    if (!card || card.classList.contains('already-imported')) return;
    if (this._imgflipSelected.has(id)) {
      this._imgflipSelected.delete(id);
      card.classList.remove('selected');
    } else {
      this._imgflipSelected.add(id);
      card.classList.add('selected');
    }
    document.getElementById('imgflip-selected-count').textContent = this._imgflipSelected.size;
    document.getElementById('imgflip-import-btn').disabled = this._imgflipSelected.size === 0;
  },

  imgflipSelectAll() {
    this._imgflipMemes.forEach(m => {
      const alreadyImported = this.templates.some(t => t.imgflipId === String(m.id));
      if (!alreadyImported) {
        this._imgflipSelected.add(String(m.id));
        document.querySelector('.imgflip-card[data-id="' + m.id + '"]')?.classList.add('selected');
      }
    });
    document.getElementById('imgflip-selected-count').textContent = this._imgflipSelected.size;
    document.getElementById('imgflip-import-btn').disabled = this._imgflipSelected.size === 0;
  },

  imgflipSelectNone() {
    this._imgflipSelected.clear();
    document.querySelectorAll('.imgflip-card.selected').forEach(c => c.classList.remove('selected'));
    document.getElementById('imgflip-selected-count').textContent = '0';
    document.getElementById('imgflip-import-btn').disabled = true;
  },

  async doImportImgflip() {
    const btn = document.getElementById('imgflip-import-btn');
    btn.textContent = 'Downloading...';
    btn.disabled = true;

    const selectedMemes = this._imgflipMemes.filter(m => this._imgflipSelected.has(String(m.id)));
    const total = selectedMemes.length;

    // Show progress bar in modal
    const body = document.querySelector('#imgflip-importer-modal .imgflip-importer-body');
    body.innerHTML =
      '<div class="imgflip-download-progress">' +
        '<div class="imgflip-dl-title">Downloading ' + total + ' images to server...</div>' +
        '<div class="imgflip-dl-bar-wrap"><div class="imgflip-dl-bar" id="imgflip-dl-bar"></div></div>' +
        '<div class="imgflip-dl-status" id="imgflip-dl-status">Starting...</div>' +
        '<div class="imgflip-dl-log" id="imgflip-dl-log"></div>' +
      '</div>';

    const bar = document.getElementById('imgflip-dl-bar');
    const status = document.getElementById('imgflip-dl-status');
    const log = document.getElementById('imgflip-dl-log');

    try {
      const res = await fetch('/api/imgflip/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memes: selectedMemes })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let importedTemplates = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const msg = JSON.parse(line);
            if (msg.type === 'progress') {
              const pct = Math.round((msg.done / msg.total) * 100);
              bar.style.width = pct + '%';
              status.textContent = msg.done + ' / ' + msg.total + ' — ' + (msg.skipped ? '(skipped) ' : '✓ ') + msg.name;
              if (!msg.skipped) {
                const entry = document.createElement('div');
                entry.className = 'imgflip-dl-entry';
                entry.textContent = '✓ ' + msg.name;
                log.insertBefore(entry, log.firstChild);
              }
            } else if (msg.type === 'done') {
              importedTemplates = msg.templates || [];
              bar.style.width = '100%';
              status.textContent = '✅ Done! ' + msg.imported + ' memes saved to server.';
            }
          } catch (e) { /* ignore parse errors */ }
        }
      }

      // Add to local templates list
      this.templates.push(...importedTemplates);
      await new Promise(r => setTimeout(r, 1200));
      document.getElementById('imgflip-importer-modal').remove();
      this.renderTemplatesPage();

    } catch (e) {
      status.textContent = '❌ Import failed: ' + e.message;
      btn.textContent = 'Retry';
      btn.disabled = false;
    }
  },

  // Import ALL memes + GIFs — full scrape, no selection needed
  async importAllImgflip() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'imgflip-all-modal';
    modal.innerHTML =
      '<div class="modal modal-large imgflip-importer">' +
        '<div class="modal-header">' +
          '<h3>🌐 Import All Imgflip Memes + GIFs</h3>' +
          '<button class="close-btn" id="imgflip-all-close" onclick="document.getElementById(\'imgflip-all-modal\').remove()" disabled>×</button>' +
        '</div>' +
        '<div class="imgflip-download-progress" style="min-height:300px">' +
          '<div class="imgflip-dl-title">Scraping all imgflip template pages...</div>' +
          '<div class="imgflip-dl-bar-wrap"><div class="imgflip-dl-bar" id="all-dl-bar" style="width:0%"></div></div>' +
          '<div class="imgflip-dl-status" id="all-dl-status">Starting — this may take a few minutes...</div>' +
          '<div class="imgflip-dl-log" id="all-dl-log"></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    const bar = document.getElementById('all-dl-bar');
    const status = document.getElementById('all-dl-status');
    const log = document.getElementById('all-dl-log');
    const closeBtn = document.getElementById('imgflip-all-close');

    const addLog = (text, color) => {
      const el = document.createElement('div');
      el.className = 'imgflip-dl-entry';
      if (color) el.style.color = color;
      el.textContent = text;
      log.insertBefore(el, log.firstChild);
    };

    try {
      const res = await fetch('/api/imgflip/import-all', { method: 'POST' });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let total = 0;
      let done = 0;

      while (true) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const msg = JSON.parse(line);
            if (msg.type === 'status') {
              status.textContent = msg.msg;
              addLog('ℹ️ ' + msg.msg, '#60a5fa');
            } else if (msg.type === 'progress') {
              done = msg.done;
              if (msg.total > total) total = msg.total;
              if (total > 0) bar.style.width = Math.round((done / total) * 100) + '%';
              status.textContent = done + ' / ' + total + ' — ' + (msg.skipped ? '(skip) ' : (msg.isGif ? '🎞️ ' : '🖼️ ')) + msg.name;
              if (!msg.skipped) addLog((msg.isGif ? '🎞️' : '✓') + ' ' + msg.name);
            } else if (msg.type === 'done') {
              bar.style.width = '100%';
              status.textContent = '✅ Done! ' + msg.imported + ' new templates imported.';
              addLog('✅ Complete — ' + msg.imported + ' imported, ' + (msg.total - msg.imported) + ' already existed.', '#4ade80');
              closeBtn.disabled = false;
              // Reload templates from server
              await this.loadTemplates();
              this.renderTemplatesPage();
            } else if (msg.type === 'error') {
              status.textContent = '❌ ' + msg.msg;
              addLog('❌ ' + msg.msg, '#f87171');
              closeBtn.disabled = false;
            }
          } catch (e) { /* ignore parse errors on partial lines */ }
        }
      }
    } catch (e) {
      status.textContent = '❌ Connection failed: ' + e.message;
      closeBtn.disabled = false;
    }
  },

  // ============================================
  // TEMPLATE EDITOR MODAL
  // ============================================

  openTemplateEditor(id) {
    const existing = id ? this.templates.find(t => t.id === id) : null;
    const motionOptions = ['zoom-in','zoom-out','pan-left','pan-right','pan-up','pan-down','parallax','fade-in','scale-bounce'];
    const positions = ['top','upper-mid','center','lower-mid','bottom','left','right'];
    const slotPositions = ['full','center','top','bottom','left','right','top-left','bottom-left','right-1','right-2','right-3','right-4'];
    const zones = existing?.zones || [];
    const slots = existing?.assetSlots || [];

    const zoneRowsHtml = zones.map((z, i) =>
      '<div class="zone-row">' +
        '<input type="text" class="zone-id" value="' + z.id + '" placeholder="id">' +
        '<input type="text" class="zone-label" value="' + z.label + '" placeholder="Label">' +
        '<select class="zone-position">' + positions.map(p => '<option value="' + p + '"' + (z.position === p ? ' selected' : '') + '>' + p + '</option>').join('') + '</select>' +
        '<button class="btn-icon-sm" onclick="this.closest(\'.zone-row\').remove()">✕</button>' +
      '</div>'
    ).join('');

    const slotRowsHtml = slots.map((s, i) =>
      '<div class="slot-row">' +
        '<input type="text" class="slot-id" value="' + s.id + '" placeholder="id">' +
        '<input type="text" class="slot-label" value="' + s.label + '" placeholder="Label">' +
        '<select class="slot-position">' + slotPositions.map(p => '<option value="' + p + '"' + (s.position === p ? ' selected' : '') + '>' + p + '</option>').join('') + '</select>' +
        '<label class="slot-required-label"><input type="checkbox" class="slot-required"' + (s.required ? ' checked' : '') + '> Req</label>' +
        '<button class="btn-icon-sm" onclick="this.closest(\'.slot-row\').remove()">✕</button>' +
      '</div>'
    ).join('');

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'template-editor-modal';
    modal.innerHTML =
      '<div class="modal modal-large template-editor">' +
        '<div class="modal-header">' +
          '<h3>' + (existing ? '✏️ Edit Template' : '✨ New Template') + '</h3>' +
          '<button class="close-btn" onclick="App.closeTemplateEditor()">×</button>' +
        '</div>' +
        '<div class="template-editor-body">' +
          '<div class="editor-section">' +
            '<h4>Basic Info</h4>' +
            '<div class="editor-row">' +
              '<div class="editor-field"><label>Icon</label><input type="text" id="tpl-icon" value="' + (existing?.icon || '🎨') + '" maxlength="4" class="icon-input"></div>' +
              '<div class="editor-field flex-1"><label>Name</label><input type="text" id="tpl-name" value="' + (existing?.name || '') + '" placeholder="Template name"></div>' +
            '</div>' +
            '<div class="editor-row">' +
              '<div class="editor-field flex-1"><label>Category</label><input type="text" id="tpl-category" value="' + (existing?.category || '') + '" placeholder="meme, viral, news..."></div>' +
              '<div class="editor-field flex-1"><label>Default Motion</label><select id="tpl-motion">' + motionOptions.map(m => '<option value="' + m + '"' + (existing?.defaultMotion === m ? ' selected' : '') + '>' + m + '</option>').join('') + '</select></div>' +
            '</div>' +
            '<div class="editor-field"><label>Description</label><input type="text" id="tpl-description" value="' + (existing?.description || '') + '" placeholder="Short description"></div>' +
            '<div class="editor-field checkbox-field"><label><input type="checkbox" id="tpl-visible"' + (existing?.visible !== false ? ' checked' : '') + '> Show in Generate editor</label></div>' +
          '</div>' +
          '<div class="editor-section">' +
            '<div class="section-header"><h4>Text Zones</h4><button class="btn-small btn-add" onclick="App.addZoneRow()">+ Add Zone</button></div>' +
            '<p class="hint">Text areas users fill in (headline, caption, etc.)</p>' +
            '<div id="zones-list">' + zoneRowsHtml + '</div>' +
          '</div>' +
          '<div class="editor-section">' +
            '<div class="section-header"><h4>Asset Slots</h4><button class="btn-small btn-add" onclick="App.addSlotRow()">+ Add Slot</button></div>' +
            '<p class="hint">Image/video slots for this template</p>' +
            '<div id="slots-list">' + slotRowsHtml + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-secondary" onclick="App.closeTemplateEditor()">Cancel</button>' +
          '<button class="btn btn-pink" onclick="App.saveTemplate(\'' + (id || '') + '\')">' + (existing ? '💾 Save Changes' : '✨ Create Template') + '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) this.closeTemplateEditor(); });
  },

  addZoneRow() {
    const positions = ['top','upper-mid','center','lower-mid','bottom','left','right'];
    const div = document.createElement('div');
    div.className = 'zone-row';
    div.innerHTML = '<input type="text" class="zone-id" placeholder="id (e.g. headline)">' +
      '<input type="text" class="zone-label" placeholder="Label">' +
      '<select class="zone-position">' + positions.map(p => '<option>' + p + '</option>').join('') + '</select>' +
      '<button class="btn-icon-sm" onclick="this.closest(\'.zone-row\').remove()">✕</button>';
    document.getElementById('zones-list').appendChild(div);
  },

  addSlotRow() {
    const slotPositions = ['full','center','top','bottom','left','right','top-left','bottom-left','right-1','right-2','right-3','right-4'];
    const div = document.createElement('div');
    div.className = 'slot-row';
    div.innerHTML = '<input type="text" class="slot-id" placeholder="id (e.g. background)">' +
      '<input type="text" class="slot-label" placeholder="Label">' +
      '<select class="slot-position">' + slotPositions.map(p => '<option>' + p + '</option>').join('') + '</select>' +
      '<label class="slot-required-label"><input type="checkbox" class="slot-required"> Req</label>' +
      '<button class="btn-icon-sm" onclick="this.closest(\'.slot-row\').remove()">✕</button>';
    document.getElementById('slots-list').appendChild(div);
  },

  async saveTemplate(existingId) {
    const name = document.getElementById('tpl-name').value.trim();
    if (!name) { alert('Template name is required'); return; }
    const zones = [];
    document.querySelectorAll('#zones-list .zone-row').forEach(row => {
      const id = row.querySelector('.zone-id').value.trim();
      const label = row.querySelector('.zone-label').value.trim();
      if (id && label) zones.push({ id, type: 'text', position: row.querySelector('.zone-position').value, label });
    });
    const assetSlots = [];
    document.querySelectorAll('#slots-list .slot-row').forEach(row => {
      const id = row.querySelector('.slot-id').value.trim();
      const label = row.querySelector('.slot-label').value.trim();
      if (id && label) assetSlots.push({ id, label, position: row.querySelector('.slot-position').value, required: row.querySelector('.slot-required').checked || undefined });
    });
    const data = {
      name, zones, assetSlots,
      icon: document.getElementById('tpl-icon').value || '🎨',
      category: document.getElementById('tpl-category').value.trim() || 'custom',
      description: document.getElementById('tpl-description').value.trim(),
      defaultMotion: document.getElementById('tpl-motion').value,
      visible: document.getElementById('tpl-visible').checked
    };
    try {
      if (existingId) {
        const updated = await this.apiUpdateTemplate(existingId, data);
        const idx = this.templates.findIndex(t => t.id === existingId);
        this.templates[idx] = updated;
      } else {
        const created = await this.apiCreateTemplate(data);
        this.templates.push(created);
      }
      this.closeTemplateEditor();
      this.renderTemplatesPage();
    } catch (e) { alert('Failed to save: ' + e.message); }
  },

  closeTemplateEditor() {
    document.getElementById('template-editor-modal')?.remove();
  },

  // ============================================
  // GENERATE PAGE
  // ============================================

  renderGeneratePage() {
    const visibleTemplates = this.templates.filter(t => t.visible !== false);
    const templateSelector = document.getElementById('template-selector-gen');
    if (visibleTemplates.length === 0) {
      templateSelector.innerHTML = '<p class="hint">No templates visible. <a href="#" onclick="App.navigateTo(\'templates\')">Manage templates →</a></p>';
    } else {
      templateSelector.innerHTML = visibleTemplates.map(t =>
        '<div class="template-option ' + (this.selectedTemplate?.id === t.id ? 'selected' : '') + '" onclick="App.selectTemplate(\'' + t.id + '\')">' +
          '<span class="template-option-icon">' + t.icon + '</span>' +
          '<div class="template-option-info"><strong>' + t.name + '</strong><small>' + t.category + '</small></div>' +
        '</div>'
      ).join('');
    }
    this.renderHeadlinesSection();
    this.renderAssetSelection();
    this.updateVariationCount();
    document.getElementById('generate-btn').disabled = !this.selectedTemplate || this.headlines.length === 0;
  },

  selectTemplate(id) {
    this.selectedTemplate = this.templates.find(t => t.id === id);
    this.renderGeneratePage();
    this.updatePreview();
  },

  renderHeadlinesSection() {
    const container = document.getElementById('headlines-section');
    container.innerHTML =
      '<div class="headlines-input">' +
        '<textarea id="headline-input" placeholder="Enter headlines (one per line)..." rows="4">' + this.headlines.join('\n') + '</textarea>' +
        '<button class="btn btn-secondary" onclick="App.updateHeadlines()">Update Headlines</button>' +
      '</div>' +
      '<div class="headlines-list">' +
        this.headlines.map((h, i) => '<div class="headline-tag"><span>' + h + '</span><button onclick="App.removeHeadline(' + i + ')">×</button></div>').join('') +
      '</div>' +
      '<div class="headline-count">' + this.headlines.length + ' headlines</div>';
  },

  updateHeadlines() {
    const input = document.getElementById('headline-input');
    this.headlines = input.value.split('\n').map(h => h.trim()).filter(h => h.length > 0);
    this.saveState(); this.renderHeadlinesSection(); this.updateVariationCount();
  },

  removeHeadline(index) {
    this.headlines.splice(index, 1);
    this.saveState(); this.renderHeadlinesSection(); this.updateVariationCount();
  },

  renderAssetSelection() {
    const container = document.getElementById('asset-selection');
    if (!this.selectedTemplate) { container.innerHTML = '<p class="hint">Select a template to see asset slots</p>'; return; }
    let html = '<h4>Asset Slots for ' + this.selectedTemplate.name + '</h4><div class="asset-slots">';
    this.selectedTemplate.assetSlots.forEach(slot => {
      html += '<div class="asset-slot"><label>' + slot.label + (slot.required ? ' <span class="required">*</span>' : '') + '</label>' +
        '<div class="asset-slot-picker" onclick="App.openAssetPicker(\'' + slot.id + '\')">' +
          (this.selectedAssets[slot.id] ? '<img src="' + this.selectedAssets[slot.id].dataUrl + '" alt="Selected">' : '<span class="placeholder">+ Select asset</span>') +
        '</div>' +
        '<div class="asset-slot-actions"><label class="btn-small">All matching<input type="checkbox" id="slot-all-' + slot.id + '"' + (this.selectedAssets[slot.id + '_all'] ? ' checked' : '') + ' onchange="App.toggleAllAssets(\'' + slot.id + '\', this.checked)"></label></div>' +
      '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  },

  toggleAllAssets(slotId, useAll) { this.selectedAssets[slotId + '_all'] = useAll; this.updateVariationCount(); },

  openAssetPicker(slotId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'asset-picker-modal';
    
    // Build tabs for user assets vs meme library
    const userAssets = AppState.assets.filter(a => !a.isMemeImage);
    const memeAssets = this.memeImages || [];
    
    modal.innerHTML = 
      '<div class="modal modal-large">' +
        '<div class="modal-header">' +
          '<h3>Select Asset for ' + slotId + '</h3>' +
          '<button class="close-btn" onclick="this.closest(\'.modal-overlay\').remove()">×</button>' +
        '</div>' +
        '<div class="asset-picker-tabs">' +
          '<button class="tab-btn active" onclick="App.switchAssetTab(\'user\')">📁 Your Assets (' + userAssets.length + ')</button>' +
          '<button class="tab-btn" onclick="App.switchAssetTab(\'memes\')">🖼️ Meme Library (' + memeAssets.length + ')</button>' +
        '</div>' +
        '<div class="asset-picker-search">' +
          '<input type="text" id="asset-picker-search" placeholder="Search assets..." oninput="App.filterAssetPicker(this.value)">' +
        '</div>' +
        '<div class="modal-body">' +
          '<div id="asset-picker-user" class="asset-picker-grid">' +
            (userAssets.length === 0 
              ? '<p class="hint">No assets uploaded yet. Go to Assets tab to upload.</p>' 
              : userAssets.map(a => 
                  '<div class="asset-picker-item" data-name="' + a.name.toLowerCase() + '" onclick="App.selectAssetForSlot(\'' + slotId + '\', \'' + a.id + '\')">' +
                    '<img src="' + a.dataUrl + '" alt="' + a.name + '">' +
                    '<span>' + a.name.substring(0, 20) + '</span>' +
                  '</div>'
                ).join('')) +
          '</div>' +
          '<div id="asset-picker-memes" class="asset-picker-grid" style="display:none">' +
            (memeAssets.length === 0 
              ? '<p class="hint">No meme images scraped yet. Go to Templates tab and use "Import from Imgflip".</p>' 
              : memeAssets.slice(0, 100).map(m => 
                  '<div class="asset-picker-item meme-item" data-name="' + m.name.toLowerCase() + '" onclick="App.selectMemeForSlot(\'' + slotId + '\', \'' + m.id + '\')">' +
                    '<img src="' + m.url + '" alt="' + m.name + '" loading="lazy">' +
                    (m.isGif ? '<span class="gif-badge">GIF</span>' : '') +
                    '<span>' + m.name.substring(0, 20) + '</span>' +
                  '</div>'
                ).join('') +
              (memeAssets.length > 100 ? '<div class="load-more-picker"><button class="btn btn-secondary" onclick="App.loadMoreMemeAssets(\'' + slotId + '\')">Load More (' + (memeAssets.length - 100) + ' more)</button></div>' : '')) +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  },

  switchAssetTab(tab) {
    const userGrid = document.getElementById('asset-picker-user');
    const memeGrid = document.getElementById('asset-picker-memes');
    const tabs = document.querySelectorAll('.asset-picker-tabs .tab-btn');
    
    tabs.forEach((t, i) => {
      t.classList.toggle('active', (tab === 'user' && i === 0) || (tab === 'memes' && i === 1));
    });
    
    if (tab === 'user') {
      userGrid.style.display = '';
      memeGrid.style.display = 'none';
    } else {
      userGrid.style.display = 'none';
      memeGrid.style.display = '';
    }
  },

  filterAssetPicker(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('.asset-picker-item').forEach(item => {
      const name = item.dataset.name || '';
      item.style.display = name.includes(q) ? '' : 'none';
    });
  },

  loadMoreMemeAssets(slotId) {
    const grid = document.getElementById('asset-picker-memes');
    if (!grid) return;
    
    // Show all memes
    grid.innerHTML = this.memeImages.map(m => 
      '<div class="asset-picker-item meme-item" data-name="' + m.name.toLowerCase() + '" onclick="App.selectMemeForSlot(\'' + slotId + '\', \'' + m.id + '\')">' +
        '<img src="' + m.url + '" alt="' + m.name + '" loading="lazy">' +
        (m.isGif ? '<span class="gif-badge">GIF</span>' : '') +
        '<span>' + m.name.substring(0, 20) + '</span>' +
      '</div>'
    ).join('');
  },

  selectMemeForSlot(slotId, memeId) {
    const meme = this.memeImages.find(m => m.id === memeId);
    if (!meme) return;
    
    // Create asset from meme
    const asset = {
      id: memeId,
      name: meme.name,
      type: 'image',
      category: 'meme-images',
      dataUrl: window.location.origin + meme.url,
      serverUrl: meme.url,
      isGif: meme.isGif,
      isMemeImage: true
    };
    
    this.selectedAssets[slotId] = asset;
    document.querySelector('.modal-overlay')?.remove();
    this.renderAssetSelection();
    this.updatePreview();
    this.updateVariationCount();
  },

  selectAssetForSlot(slotId, assetId) {
    this.selectedAssets[slotId] = AppState.assets.find(a => a.id === assetId);
    document.querySelector('.modal-overlay')?.remove();
    this.renderAssetSelection(); this.updatePreview(); this.updateVariationCount();
  },

  updateVariationCount() {
    const headlines = this.headlines.length || 1;
    let assetCombinations = 1;
    if (this.selectedTemplate) {
      this.selectedTemplate.assetSlots.forEach(slot => {
        if (this.selectedAssets[slot.id + '_all']) {
          const matching = AppState.assets.filter(a => a.category === this.detectSlotCategory(slot.id)).length;
          assetCombinations *= Math.max(1, matching);
        }
      });
    }
    const total = headlines * assetCombinations;
    document.getElementById('variation-count').textContent = total.toLocaleString();
    document.getElementById('generate-btn').disabled = total === 0 || !this.selectedTemplate;
  },

  detectSlotCategory(slotId) {
    if (slotId.includes('reaction')) return 'reactions';
    if (slotId.includes('background') || slotId.includes('bg')) return 'backgrounds';
    if (slotId.includes('screenshot')) return 'screenshots';
    if (slotId.includes('brain')) return 'brains';
    return 'misc';
  },

  async updatePreview() {
    if (!this.selectedTemplate) return;
    const content = {};
    if (this.headlines.length > 0) {
      this.selectedTemplate.zones.forEach(zone => { content[zone.id] = this.headlines[0]; });
    }
    const dataUrl = await TemplateRenderer.renderToCanvas(this.selectedTemplate, content, this.selectedAssets);
    document.getElementById('generate-preview').innerHTML = '<img src="' + dataUrl + '" alt="Preview">';
  },

  async generateVariations() {
    if (!this.selectedTemplate || this.headlines.length === 0) return;
    const modal = document.getElementById('generate-modal');
    const progressBar = document.getElementById('generate-progress');
    const statusText = document.getElementById('generate-status');
    modal.classList.add('active');
    this.generatedVariations = [];
    const variations = [];
    const assetCombos = this.buildAssetCombinations();
    for (const headline of this.headlines) {
      for (const assetCombo of assetCombos) {
        const content = {};
        this.selectedTemplate.zones.forEach(zone => { content[zone.id] = headline; });
        variations.push({ id: 'var_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9), templateId: this.selectedTemplate.id, content, assets: assetCombo, duration: 5, motion: this.selectedTemplate.defaultMotion, createdAt: Date.now() });
      }
    }
    for (let i = 0; i < variations.length; i++) {
      const v = variations[i];
      v.previewUrl = await TemplateRenderer.renderToCanvas(this.selectedTemplate, v.content, v.assets);
      this.generatedVariations.push(v);
      progressBar.style.width = ((i + 1) / variations.length * 100) + '%';
      statusText.textContent = 'Generated ' + (i + 1) + ' of ' + variations.length;
      await new Promise(r => setTimeout(r, 10));
    }
    statusText.textContent = 'Complete!';
    await new Promise(r => setTimeout(r, 500));
    modal.classList.remove('active');
    this.navigateTo('browse');
  },

  buildAssetCombinations() {
    if (!this.selectedTemplate) return [{}];
    const combos = [{}];
    this.selectedTemplate.assetSlots.forEach(slot => {
      if (this.selectedAssets[slot.id + '_all']) {
        const matching = AppState.assets.filter(a => a.category === this.detectSlotCategory(slot.id));
        if (matching.length > 0) {
          const newCombos = [];
          combos.forEach(combo => { matching.forEach(asset => { newCombos.push(Object.assign({}, combo, { [slot.id]: asset })); }); });
          combos.length = 0; combos.push(...newCombos);
        }
      } else if (this.selectedAssets[slot.id]) {
        combos.forEach(combo => { combo[slot.id] = this.selectedAssets[slot.id]; });
      }
    });
    return combos;
  },

  // ============================================
  // BROWSE PAGE
  // ============================================

  renderBrowsePage() {
    const container = document.getElementById('browse-grid');
    if (this.generatedVariations.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="icon">🎬</div><p>No variations generated yet</p><button class="btn btn-pink" onclick="App.navigateTo(\'generate\')">Generate Content</button></div>';
      return;
    }
    let html = '<div class="browse-header"><h3>' + this.generatedVariations.length + ' Variations</h3><div class="browse-actions"><button class="btn btn-secondary" onclick="App.addAllToQueue()">Add All to Export</button></div></div><div class="variations-grid">';
    this.generatedVariations.forEach(v => {
      const inQueue = this.exportQueue.some(q => q.id === v.id);
      html += '<div class="variation-card' + (inQueue ? ' in-queue' : '') + '" onclick="App.openEditor(\'' + v.id + '\')">' +
        '<img src="' + v.previewUrl + '" alt="Variation">' +
        '<div class="variation-overlay"><button class="btn-icon" onclick="event.stopPropagation(); App.toggleQueue(\'' + v.id + '\')">' + (inQueue ? '✓' : '+') + '</button></div>' +
        (inQueue ? '<div class="queue-badge">In Queue</div>' : '') +
      '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  },

  toggleQueue(variationId) {
    const index = this.exportQueue.findIndex(q => q.id === variationId);
    if (index >= 0) this.exportQueue.splice(index, 1);
    else { const v = this.generatedVariations.find(v => v.id === variationId); if (v) this.exportQueue.push(v); }
    this.saveState(); this.renderBrowsePage(); this.updateQueueCount();
  },

  addAllToQueue() {
    this.generatedVariations.forEach(v => { if (!this.exportQueue.some(q => q.id === v.id)) this.exportQueue.push(v); });
    this.saveState(); this.renderBrowsePage(); this.updateQueueCount();
  },

  updateQueueCount() {
    document.getElementById('stat-queue').textContent = this.exportQueue.length;
    const badge = document.getElementById('export-queue-count');
    if (badge) badge.textContent = this.exportQueue.length;
  },

  // ============================================
  // EDITOR MODAL
  // ============================================

  openEditor(variationId) {
    const variation = this.generatedVariations.find(v => v.id === variationId);
    if (!variation) return;
    this.editingVariation = Object.assign({}, variation);
    const template = this.templates.find(t => t.id === variation.templateId);
    const modal = document.getElementById('editor-modal');
    modal.innerHTML =
      '<div class="editor-container"><div class="editor-header"><h3>Edit Variation</h3><button class="close-btn" onclick="App.closeEditor()">×</button></div>' +
      '<div class="editor-body"><div class="editor-preview"><img id="editor-preview-img" src="' + variation.previewUrl + '" alt="Preview"></div>' +
      '<div class="editor-controls"><div class="control-group"><h4>Text Content</h4>' +
      template.zones.map(zone =>
        '<div class="control-item"><label>' + zone.label + '</label><textarea data-zone="' + zone.id + '" onchange="App.updateEditorContent(\'' + zone.id + '\', this.value)">' + (this.editingVariation.content[zone.id] || '') + '</textarea></div>'
      ).join('') +
      '</div><div class="control-group"><h4>Video Settings</h4>' +
      '<div class="control-item"><label>Duration: <span id="duration-value">' + this.editingVariation.duration + '</span>s</label><input type="range" min="3" max="15" value="' + this.editingVariation.duration + '" oninput="App.updateEditorDuration(this.value)"></div>' +
      '<div class="control-item"><label>Motion Effect</label><select onchange="App.updateEditorMotion(this.value)">' +
      Object.entries(MOTION_EFFECTS).map(([key, value]) => '<option value="' + value + '"' + (this.editingVariation.motion === value ? ' selected' : '') + '>' + key.replace(/_/g, ' ') + '</option>').join('') +
      '</select></div></div>' +
      '<div class="editor-actions"><button class="btn btn-secondary" onclick="App.closeEditor()">Cancel</button><button class="btn btn-pink" onclick="App.saveAndAddToQueue()">✓ Add to Export Queue</button></div>' +
      '</div></div></div>';
    modal.classList.add('active');
  },

  async updateEditorContent(zoneId, value) {
    this.editingVariation.content[zoneId] = value;
    await this.refreshEditorPreview();
  },

  updateEditorDuration(value) { this.editingVariation.duration = parseInt(value); document.getElementById('duration-value').textContent = value; },
  updateEditorMotion(value) { this.editingVariation.motion = value; },

  async refreshEditorPreview() {
    const template = this.templates.find(t => t.id === this.editingVariation.templateId);
    const previewUrl = await TemplateRenderer.renderToCanvas(template, this.editingVariation.content, this.editingVariation.assets);
    this.editingVariation.previewUrl = previewUrl;
    document.getElementById('editor-preview-img').src = previewUrl;
  },

  saveAndAddToQueue() {
    const index = this.generatedVariations.findIndex(v => v.id === this.editingVariation.id);
    if (index >= 0) this.generatedVariations[index] = Object.assign({}, this.editingVariation);
    if (!this.exportQueue.some(q => q.id === this.editingVariation.id)) this.exportQueue.push(Object.assign({}, this.editingVariation));
    else { const qi = this.exportQueue.findIndex(q => q.id === this.editingVariation.id); if (qi >= 0) this.exportQueue[qi] = Object.assign({}, this.editingVariation); }
    this.saveState(); this.closeEditor(); this.renderBrowsePage(); this.updateQueueCount();
  },

  closeEditor() { document.getElementById('editor-modal').classList.remove('active'); this.editingVariation = null; },

  // ============================================
  // EXPORT PAGE
  // ============================================

  renderExportPage() {
    const container = document.getElementById('export-content');
    if (this.exportQueue.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="icon">📦</div><p>Export queue is empty</p><button class="btn btn-pink" onclick="App.navigateTo(\'browse\')">Browse Variations</button></div>';
      return;
    }
    let html = '<div class="export-header"><h3>' + this.exportQueue.length + ' Videos Ready to Export</h3><div class="export-actions"><button class="btn btn-secondary" onclick="App.clearQueue()">Clear Queue</button><button class="btn btn-success" onclick="App.exportAll()">🎬 Export All Videos</button></div></div><div class="export-grid">';
    this.exportQueue.forEach((v, i) => {
      html += '<div class="export-item"><div class="export-preview"><img src="' + v.previewUrl + '" alt="Export ' + (i + 1) + '"><span class="export-duration">' + v.duration + 's</span></div><div class="export-info"><span class="export-motion">' + v.motion + '</span><button class="btn-icon" onclick="App.removeFromQueue(\'' + v.id + '\')">🗑️</button></div></div>';
    });
    html += '</div>';
    container.innerHTML = html;
  },

  removeFromQueue(id) { this.exportQueue = this.exportQueue.filter(v => v.id !== id); this.saveState(); this.renderExportPage(); this.updateQueueCount(); },

  clearQueue() {
    if (!confirm('Clear entire export queue?')) return;
    this.exportQueue = []; this.saveState(); this.renderExportPage(); this.updateQueueCount();
  },

  async exportAll() {
    if (this.exportQueue.length === 0) return;
    const modal = document.getElementById('export-modal');
    const progressBar = document.getElementById('export-progress');
    const statusText = document.getElementById('export-status');
    modal.classList.add('active');
    statusText.textContent = 'Generating videos...';
    const results = await VideoGenerator.batchGenerate(this.exportQueue, (progress, current, total) => {
      progressBar.style.width = (progress * 50) + '%';
      statusText.textContent = 'Rendering video ' + current + ' of ' + total + '...';
    });
    statusText.textContent = 'Creating ZIP file...';
    const zipBlob = await ExportHelper.createExportZip(results, (progress) => {
      progressBar.style.width = (50 + progress * 50) + '%';
    });
    saveAs(zipBlob, 'content-factory-' + new Date().toISOString().slice(0, 10) + '.zip');
    statusText.textContent = 'Download complete!';
    progressBar.style.width = '100%';
    await new Promise(r => setTimeout(r, 1500));
    modal.classList.remove('active');
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
