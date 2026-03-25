/**
 * CONTENT FACTORY - Main Application
 * Asset-driven meme/content generation engine
 */

const App = {
  // Current state
  currentPage: 'dashboard',
  selectedTemplate: null,
  selectedAssets: {},
  headlines: [],
  generatedVariations: [],
  exportQueue: [],
  editingVariation: null,

  // Initialize
  init() {
    TemplateRenderer.init();
    this.loadSavedState();
    this.setupNavigation();
    this.setupEventListeners();
    this.renderDashboard();
    console.log('Content Factory initialized');
  },

  // Load saved state from localStorage
  loadSavedState() {
    try {
      const assets = localStorage.getItem('cf_assets');
      if (assets) AppState.assets = JSON.parse(assets);

      const headlines = localStorage.getItem('cf_headlines');
      if (headlines) this.headlines = JSON.parse(headlines);

      const queue = localStorage.getItem('cf_export_queue');
      if (queue) this.exportQueue = JSON.parse(queue);
    } catch (e) {
      console.log('Error loading state:', e);
    }
  },

  // Save state
  saveState() {
    try {
      localStorage.setItem('cf_assets', JSON.stringify(AppState.assets));
      localStorage.setItem('cf_headlines', JSON.stringify(this.headlines));
      localStorage.setItem('cf_export_queue', JSON.stringify(this.exportQueue));
    } catch (e) {
      console.log('Error saving state:', e);
    }
  },

  // Navigation
  setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.navigateTo(btn.dataset.page));
    });
  },

  navigateTo(page) {
    this.currentPage = page;
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`)?.classList.add('active');

    switch (page) {
      case 'dashboard': this.renderDashboard(); break;
      case 'assets': this.renderAssetsPage(); break;
      case 'templates': this.renderTemplatesPage(); break;
      case 'generate': this.renderGeneratePage(); break;
      case 'browse': this.renderBrowsePage(); break;
      case 'export': this.renderExportPage(); break;
    }
  },

  // Event listeners
  setupEventListeners() {
    // Asset upload drop zone
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

  renderDashboard() {
    document.getElementById('stat-assets').textContent = AppState.assets.length;
    document.getElementById('stat-templates').textContent = FORMAT_TEMPLATES.length;
    document.getElementById('stat-headlines').textContent = this.headlines.length;
    document.getElementById('stat-queue').textContent = this.exportQueue.length;

    // Quick stats
    const variations = this.calculatePossibleVariations();
    document.getElementById('stat-variations').textContent = variations.toLocaleString();

    // Recent templates
    const recentContainer = document.getElementById('recent-templates');
    recentContainer.innerHTML = FORMAT_TEMPLATES.slice(0, 6).map(t => `
      <div class="template-mini" onclick="App.selectTemplateAndGenerate('${t.id}')">
        <div class="template-mini-icon">${t.icon}</div>
        <div class="template-mini-info">
          <div class="template-mini-name">${t.name}</div>
          <div class="template-mini-category">${t.category}</div>
        </div>
      </div>
    `).join('');
  },

  calculatePossibleVariations() {
    const headlines = Math.max(1, this.headlines.length);
    const assets = Math.max(1, AppState.assets.length);
    const templates = FORMAT_TEMPLATES.length;
    return headlines * assets * templates;
  },

  selectTemplateAndGenerate(id) {
    this.selectedTemplate = FORMAT_TEMPLATES.find(t => t.id === id);
    this.navigateTo('generate');
  },

  // ============================================
  // ASSETS PAGE
  // ============================================

  renderAssetsPage() {
    const container = document.getElementById('assets-grid');
    
    if (AppState.assets.length === 0) {
      container.innerHTML = `
        <div class="empty-state full-width">
          <div class="icon">📁</div>
          <p>No assets uploaded yet</p>
          <p class="hint">Drag & drop images or videos, or click below</p>
          <label class="btn btn-pink">
            📤 Upload Assets
            <input type="file" multiple accept="image/*,video/*" onchange="App.handleAssetUpload(this.files)" hidden>
          </label>
        </div>
      `;
      return;
    }

    // Group by category
    const grouped = {};
    ASSET_CATEGORIES.forEach(cat => grouped[cat.id] = []);
    
    AppState.assets.forEach(asset => {
      const cat = asset.category || 'misc';
      if (grouped[cat]) grouped[cat].push(asset);
      else grouped['misc'].push(asset);
    });

    let html = `
      <div class="assets-header">
        <label class="btn btn-pink">
          📤 Upload More
          <input type="file" multiple accept="image/*,video/*" onchange="App.handleAssetUpload(this.files)" hidden>
        </label>
        <span class="asset-count">${AppState.assets.length} assets</span>
      </div>
    `;

    ASSET_CATEGORIES.forEach(cat => {
      if (grouped[cat.id].length === 0) return;
      
      html += `
        <div class="asset-category">
          <h3>${cat.icon} ${cat.name} (${grouped[cat.id].length})</h3>
          <div class="asset-grid">
            ${grouped[cat.id].map(asset => `
              <div class="asset-card" data-id="${asset.id}">
                <div class="asset-preview">
                  ${asset.type === 'video' 
                    ? `<video src="${asset.dataUrl}" muted></video>`
                    : `<img src="${asset.dataUrl}" alt="${asset.name}">`
                  }
                  ${asset.type === 'video' ? '<span class="video-badge">🎬</span>' : ''}
                </div>
                <div class="asset-info">
                  <span class="asset-name">${asset.name}</span>
                  <button class="asset-delete" onclick="App.deleteAsset('${asset.id}')">🗑️</button>
                </div>
                <select class="asset-category-select" onchange="App.updateAssetCategory('${asset.id}', this.value)">
                  ${ASSET_CATEGORIES.map(c => `
                    <option value="${c.id}" ${asset.category === c.id ? 'selected' : ''}>${c.icon} ${c.name}</option>
                  `).join('')}
                </select>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  async handleAssetUpload(files) {
    for (const file of files) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) continue;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const asset = {
          id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          dataUrl: e.target.result,
          category: this.detectAssetCategory(file.name),
          uploadedAt: Date.now()
        };

        // Resize images if too large
        if (asset.type === 'image') {
          this.resizeImage(asset.dataUrl, 1200, 1200).then(resized => {
            asset.dataUrl = resized;
            AppState.assets.push(asset);
            this.saveState();
            this.renderAssetsPage();
          });
        } else {
          AppState.assets.push(asset);
          this.saveState();
          this.renderAssetsPage();
        }
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
        
        if (width <= maxWidth && height <= maxHeight) {
          resolve(dataUrl);
          return;
        }

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = dataUrl;
    });
  },

  deleteAsset(id) {
    if (!confirm('Delete this asset?')) return;
    AppState.assets = AppState.assets.filter(a => a.id !== id);
    this.saveState();
    this.renderAssetsPage();
  },

  updateAssetCategory(id, category) {
    const asset = AppState.assets.find(a => a.id === id);
    if (asset) {
      asset.category = category;
      this.saveState();
    }
  },

  // ============================================
  // TEMPLATES PAGE
  // ============================================

  renderTemplatesPage() {
    const container = document.getElementById('templates-grid');
    
    // Group by category
    const categories = [...new Set(FORMAT_TEMPLATES.map(t => t.category))];
    
    container.innerHTML = categories.map(cat => `
      <div class="template-category">
        <h3>${cat.charAt(0).toUpperCase() + cat.slice(1)} Templates</h3>
        <div class="template-grid">
          ${FORMAT_TEMPLATES.filter(t => t.category === cat).map(t => `
            <div class="template-card" onclick="App.selectTemplateAndGenerate('${t.id}')">
              <div class="template-preview" id="tpl-preview-${t.id}"></div>
              <div class="template-info">
                <div class="template-header">
                  <span class="template-icon">${t.icon}</span>
                  <h4>${t.name}</h4>
                </div>
                <p>${t.description}</p>
                <div class="template-meta">
                  <span class="badge">${t.zones.length} text zones</span>
                  <span class="badge">${t.assetSlots.length} asset slots</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    // Render mini previews
    FORMAT_TEMPLATES.forEach(t => {
      const el = document.getElementById(`tpl-preview-${t.id}`);
      if (el) TemplateRenderer.renderMiniPreview(t, el);
    });
  },

  // ============================================
  // GENERATE PAGE
  // ============================================

  renderGeneratePage() {
    // Template selector
    const templateSelector = document.getElementById('template-selector-gen');
    templateSelector.innerHTML = FORMAT_TEMPLATES.map(t => `
      <div class="template-option ${this.selectedTemplate?.id === t.id ? 'selected' : ''}" 
           onclick="App.selectTemplate('${t.id}')">
        <span class="template-option-icon">${t.icon}</span>
        <div class="template-option-info">
          <strong>${t.name}</strong>
          <small>${t.category}</small>
        </div>
      </div>
    `).join('');

    // Headlines input
    this.renderHeadlinesSection();

    // Asset selection
    this.renderAssetSelection();

    // Update variation count
    this.updateVariationCount();

    // Show/hide generate button
    const canGenerate = this.selectedTemplate && this.headlines.length > 0;
    document.getElementById('generate-btn').disabled = !canGenerate;
  },

  selectTemplate(id) {
    this.selectedTemplate = FORMAT_TEMPLATES.find(t => t.id === id);
    this.renderGeneratePage();
    this.updatePreview();
  },

  renderHeadlinesSection() {
    const container = document.getElementById('headlines-section');
    
    container.innerHTML = `
      <div class="headlines-input">
        <textarea id="headline-input" placeholder="Enter headlines (one per line)..."
                  rows="4">${this.headlines.join('\n')}</textarea>
        <button class="btn btn-secondary" onclick="App.updateHeadlines()">Update Headlines</button>
      </div>
      <div class="headlines-list">
        ${this.headlines.map((h, i) => `
          <div class="headline-tag">
            <span>${h}</span>
            <button onclick="App.removeHeadline(${i})">×</button>
          </div>
        `).join('')}
      </div>
      <div class="headline-count">${this.headlines.length} headlines</div>
    `;
  },

  updateHeadlines() {
    const input = document.getElementById('headline-input');
    this.headlines = input.value.split('\n').map(h => h.trim()).filter(h => h.length > 0);
    this.saveState();
    this.renderHeadlinesSection();
    this.updateVariationCount();
  },

  removeHeadline(index) {
    this.headlines.splice(index, 1);
    this.saveState();
    this.renderHeadlinesSection();
    this.updateVariationCount();
  },

  renderAssetSelection() {
    const container = document.getElementById('asset-selection');
    
    if (!this.selectedTemplate) {
      container.innerHTML = '<p class="hint">Select a template to see asset slots</p>';
      return;
    }

    container.innerHTML = `
      <h4>Asset Slots for ${this.selectedTemplate.name}</h4>
      <div class="asset-slots">
        ${this.selectedTemplate.assetSlots.map(slot => `
          <div class="asset-slot">
            <label>${slot.label} ${slot.required ? '<span class="required">*</span>' : ''}</label>
            <div class="asset-slot-picker" onclick="App.openAssetPicker('${slot.id}')">
              ${this.selectedAssets[slot.id] 
                ? `<img src="${this.selectedAssets[slot.id].dataUrl}" alt="Selected">`
                : '<span class="placeholder">+ Select asset</span>'
              }
            </div>
            <div class="asset-slot-actions">
              <label class="btn-small">
                All matching
                <input type="checkbox" id="slot-all-${slot.id}" 
                       ${this.selectedAssets[slot.id + '_all'] ? 'checked' : ''}
                       onchange="App.toggleAllAssets('${slot.id}', this.checked)">
              </label>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  toggleAllAssets(slotId, useAll) {
    this.selectedAssets[slotId + '_all'] = useAll;
    this.updateVariationCount();
  },

  openAssetPicker(slotId) {
    // Create modal for asset selection
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal modal-large">
        <div class="modal-header">
          <h3>Select Asset</h3>
          <button onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="asset-picker-grid">
            ${AppState.assets.map(asset => `
              <div class="asset-picker-item" onclick="App.selectAssetForSlot('${slotId}', '${asset.id}')">
                <img src="${asset.dataUrl}" alt="${asset.name}">
                <span>${asset.name}</span>
              </div>
            `).join('')}
            ${AppState.assets.length === 0 ? '<p class="hint">No assets uploaded. Go to Assets tab to add some.</p>' : ''}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  },

  selectAssetForSlot(slotId, assetId) {
    this.selectedAssets[slotId] = AppState.assets.find(a => a.id === assetId);
    document.querySelector('.modal-overlay')?.remove();
    this.renderAssetSelection();
    this.updatePreview();
    this.updateVariationCount();
  },

  updateVariationCount() {
    const headlines = this.headlines.length || 1;
    let assetCombinations = 1;

    if (this.selectedTemplate) {
      this.selectedTemplate.assetSlots.forEach(slot => {
        if (this.selectedAssets[slot.id + '_all']) {
          const matchingAssets = AppState.assets.filter(a => 
            a.category === this.detectSlotCategory(slot.id)
          ).length;
          assetCombinations *= Math.max(1, matchingAssets);
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

    const previewContainer = document.getElementById('generate-preview');
    const content = {};
    
    // Use first headline for preview
    if (this.headlines.length > 0) {
      this.selectedTemplate.zones.forEach((zone, i) => {
        content[zone.id] = this.headlines[0];
      });
    }

    // Render preview
    const dataUrl = await TemplateRenderer.renderToCanvas(
      this.selectedTemplate, 
      content, 
      this.selectedAssets
    );
    
    previewContainer.innerHTML = `<img src="${dataUrl}" alt="Preview">`;
  },

  // Generate all variations
  async generateVariations() {
    if (!this.selectedTemplate || this.headlines.length === 0) return;

    const modal = document.getElementById('generate-modal');
    const progressBar = document.getElementById('generate-progress');
    const statusText = document.getElementById('generate-status');
    modal.classList.add('active');

    this.generatedVariations = [];
    const variations = [];

    // Build all combinations
    const assetCombos = this.buildAssetCombinations();
    
    for (const headline of this.headlines) {
      for (const assetCombo of assetCombos) {
        const content = {};
        this.selectedTemplate.zones.forEach(zone => {
          content[zone.id] = headline;
        });

        variations.push({
          id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          templateId: this.selectedTemplate.id,
          content,
          assets: assetCombo,
          duration: 5,
          motion: this.selectedTemplate.defaultMotion,
          createdAt: Date.now()
        });
      }
    }

    // Generate previews
    for (let i = 0; i < variations.length; i++) {
      const v = variations[i];
      v.previewUrl = await TemplateRenderer.renderToCanvas(
        this.selectedTemplate,
        v.content,
        v.assets
      );
      
      this.generatedVariations.push(v);
      
      const progress = ((i + 1) / variations.length) * 100;
      progressBar.style.width = `${progress}%`;
      statusText.textContent = `Generated ${i + 1} of ${variations.length}`;

      // Yield to UI
      await new Promise(r => setTimeout(r, 10));
    }

    statusText.textContent = 'Complete!';
    await new Promise(r => setTimeout(r, 500));
    modal.classList.remove('active');

    // Navigate to browse
    this.navigateTo('browse');
  },

  buildAssetCombinations() {
    if (!this.selectedTemplate) return [{}];

    const slots = this.selectedTemplate.assetSlots;
    const combos = [{}];

    slots.forEach(slot => {
      if (this.selectedAssets[slot.id + '_all']) {
        // Use all matching assets
        const matching = AppState.assets.filter(a => 
          a.category === this.detectSlotCategory(slot.id)
        );
        
        if (matching.length > 0) {
          const newCombos = [];
          combos.forEach(combo => {
            matching.forEach(asset => {
              newCombos.push({ ...combo, [slot.id]: asset });
            });
          });
          combos.length = 0;
          combos.push(...newCombos);
        }
      } else if (this.selectedAssets[slot.id]) {
        // Use selected asset
        combos.forEach(combo => {
          combo[slot.id] = this.selectedAssets[slot.id];
        });
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
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">🎬</div>
          <p>No variations generated yet</p>
          <button class="btn btn-pink" onclick="App.navigateTo('generate')">Generate Content</button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="browse-header">
        <h3>${this.generatedVariations.length} Variations</h3>
        <div class="browse-actions">
          <button class="btn btn-secondary" onclick="App.addAllToQueue()">Add All to Export</button>
        </div>
      </div>
      <div class="variations-grid">
        ${this.generatedVariations.map(v => {
          const inQueue = this.exportQueue.some(q => q.id === v.id);
          return `
            <div class="variation-card ${inQueue ? 'in-queue' : ''}" onclick="App.openEditor('${v.id}')">
              <img src="${v.previewUrl}" alt="Variation">
              <div class="variation-overlay">
                <button class="btn-icon" onclick="event.stopPropagation(); App.toggleQueue('${v.id}')">
                  ${inQueue ? '✓' : '+'}
                </button>
              </div>
              ${inQueue ? '<div class="queue-badge">In Queue</div>' : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  toggleQueue(variationId) {
    const index = this.exportQueue.findIndex(q => q.id === variationId);
    if (index >= 0) {
      this.exportQueue.splice(index, 1);
    } else {
      const variation = this.generatedVariations.find(v => v.id === variationId);
      if (variation) this.exportQueue.push(variation);
    }
    this.saveState();
    this.renderBrowsePage();
    this.updateQueueCount();
  },

  addAllToQueue() {
    this.generatedVariations.forEach(v => {
      if (!this.exportQueue.some(q => q.id === v.id)) {
        this.exportQueue.push(v);
      }
    });
    this.saveState();
    this.renderBrowsePage();
    this.updateQueueCount();
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

    this.editingVariation = { ...variation };
    const template = FORMAT_TEMPLATES.find(t => t.id === variation.templateId);

    const modal = document.getElementById('editor-modal');
    modal.innerHTML = `
      <div class="editor-container">
        <div class="editor-header">
          <h3>Edit Variation</h3>
          <button class="close-btn" onclick="App.closeEditor()">×</button>
        </div>
        
        <div class="editor-body">
          <div class="editor-preview">
            <img id="editor-preview-img" src="${variation.previewUrl}" alt="Preview">
          </div>
          
          <div class="editor-controls">
            <div class="control-group">
              <h4>Text Content</h4>
              ${template.zones.map(zone => `
                <div class="control-item">
                  <label>${zone.label}</label>
                  <textarea data-zone="${zone.id}" 
                            onchange="App.updateEditorContent('${zone.id}', this.value)"
                  >${this.editingVariation.content[zone.id] || ''}</textarea>
                </div>
              `).join('')}
            </div>
            
            <div class="control-group">
              <h4>Video Settings</h4>
              <div class="control-item">
                <label>Duration: <span id="duration-value">${this.editingVariation.duration}</span>s</label>
                <input type="range" min="3" max="15" value="${this.editingVariation.duration}"
                       oninput="App.updateEditorDuration(this.value)">
              </div>
              
              <div class="control-item">
                <label>Motion Effect</label>
                <select onchange="App.updateEditorMotion(this.value)">
                  ${Object.entries(MOTION_EFFECTS).map(([key, value]) => `
                    <option value="${value}" ${this.editingVariation.motion === value ? 'selected' : ''}>
                      ${key.replace(/_/g, ' ')}
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>
            
            <div class="editor-actions">
              <button class="btn btn-secondary" onclick="App.closeEditor()">Cancel</button>
              <button class="btn btn-pink" onclick="App.saveAndAddToQueue()">
                ✓ Add to Export Queue
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
  },

  async updateEditorContent(zoneId, value) {
    this.editingVariation.content[zoneId] = value;
    await this.refreshEditorPreview();
  },

  updateEditorDuration(value) {
    this.editingVariation.duration = parseInt(value);
    document.getElementById('duration-value').textContent = value;
  },

  updateEditorMotion(value) {
    this.editingVariation.motion = value;
  },

  async refreshEditorPreview() {
    const template = FORMAT_TEMPLATES.find(t => t.id === this.editingVariation.templateId);
    const previewUrl = await TemplateRenderer.renderToCanvas(
      template,
      this.editingVariation.content,
      this.editingVariation.assets
    );
    this.editingVariation.previewUrl = previewUrl;
    document.getElementById('editor-preview-img').src = previewUrl;
  },

  saveAndAddToQueue() {
    // Update the variation in generated list
    const index = this.generatedVariations.findIndex(v => v.id === this.editingVariation.id);
    if (index >= 0) {
      this.generatedVariations[index] = { ...this.editingVariation };
    }

    // Add to queue if not already
    if (!this.exportQueue.some(q => q.id === this.editingVariation.id)) {
      this.exportQueue.push({ ...this.editingVariation });
    } else {
      // Update in queue
      const qIndex = this.exportQueue.findIndex(q => q.id === this.editingVariation.id);
      if (qIndex >= 0) {
        this.exportQueue[qIndex] = { ...this.editingVariation };
      }
    }

    this.saveState();
    this.closeEditor();
    this.renderBrowsePage();
    this.updateQueueCount();
  },

  closeEditor() {
    document.getElementById('editor-modal').classList.remove('active');
    this.editingVariation = null;
  },

  // ============================================
  // EXPORT PAGE
  // ============================================

  renderExportPage() {
    const container = document.getElementById('export-content');

    if (this.exportQueue.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">📦</div>
          <p>Export queue is empty</p>
          <p class="hint">Browse variations and add them to the queue</p>
          <button class="btn btn-pink" onclick="App.navigateTo('browse')">Browse Variations</button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="export-header">
        <h3>${this.exportQueue.length} Videos Ready to Export</h3>
        <div class="export-actions">
          <button class="btn btn-secondary" onclick="App.clearQueue()">Clear Queue</button>
          <button class="btn btn-success" onclick="App.exportAll()">
            🎬 Export All Videos
          </button>
        </div>
      </div>
      
      <div class="export-grid">
        ${this.exportQueue.map((v, i) => `
          <div class="export-item">
            <div class="export-preview">
              <img src="${v.previewUrl}" alt="Export ${i + 1}">
              <span class="export-duration">${v.duration}s</span>
            </div>
            <div class="export-info">
              <span class="export-motion">${v.motion}</span>
              <button class="btn-icon" onclick="App.removeFromQueue('${v.id}')">🗑️</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  removeFromQueue(id) {
    this.exportQueue = this.exportQueue.filter(v => v.id !== id);
    this.saveState();
    this.renderExportPage();
    this.updateQueueCount();
  },

  clearQueue() {
    if (!confirm('Clear entire export queue?')) return;
    this.exportQueue = [];
    this.saveState();
    this.renderExportPage();
    this.updateQueueCount();
  },

  async exportAll() {
    if (this.exportQueue.length === 0) return;

    const modal = document.getElementById('export-modal');
    const progressBar = document.getElementById('export-progress');
    const statusText = document.getElementById('export-status');
    modal.classList.add('active');

    statusText.textContent = 'Generating videos...';

    // Generate all videos
    const results = await VideoGenerator.batchGenerate(
      this.exportQueue,
      (progress, current, total) => {
        progressBar.style.width = `${progress * 50}%`;
        statusText.textContent = `Rendering video ${current} of ${total}...`;
      }
    );

    statusText.textContent = 'Creating ZIP file...';

    // Create ZIP
    const zipBlob = await ExportHelper.createExportZip(results, (progress) => {
      progressBar.style.width = `${50 + progress * 50}%`;
    });

    // Download
    const timestamp = new Date().toISOString().slice(0, 10);
    saveAs(zipBlob, `content-factory-${timestamp}.zip`);

    statusText.textContent = 'Download complete!';
    progressBar.style.width = '100%';

    await new Promise(r => setTimeout(r, 1500));
    modal.classList.remove('active');
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
