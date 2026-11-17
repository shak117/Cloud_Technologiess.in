// Cloud Technologies - Public Creative Gallery Controller
// Connects to Backend API (/api/gallery) with fallback to bundled static data

(function() {
  'use strict';

  const API_BASE = (window.CLOUD_CONFIG && window.CLOUD_CONFIG.apiUrl) || 'http://localhost:5000';
  const CACHE_KEY = 'cloudtech_gallery_cache';

  let items = [];
  let activeCategory = 'all';
  let currentLightboxIndex = -1;
  let filteredItems = [];

  // DOM Elements
  let el = {};

  document.addEventListener('DOMContentLoaded', initGallery);

  function initGallery() {
    cacheDOMElements();
    initLightboxEvents();
    initMobileNav();
    loadGalleryContent();

    // Listen for storage / cross-tab updates
    window.addEventListener('cloudtech:gallery-updated', (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        items = e.detail;
        renderAll();
      }
    });
  }

  function cacheDOMElements() {
    el = {
      grid: document.getElementById('galleryGrid'),
      filterBar: document.getElementById('galleryFilterBar'),
      emptyState: document.getElementById('galleryEmptyState'),
      
      // Lightbox
      lightbox: document.getElementById('galleryLightbox'),
      lightboxImg: document.getElementById('lightboxImg'),
      lightboxTitle: document.getElementById('lightboxTitle'),
      lightboxClient: document.getElementById('lightboxClient'),
      lightboxCat: document.getElementById('lightboxCategory'),
      lightboxDesc: document.getElementById('lightboxDesc'),
      lightboxLink: document.getElementById('lightboxLink'),
      lightboxCounter: document.getElementById('lightboxCounter'),
      btnCloseLightbox: document.getElementById('lightboxCloseBtn'),
      btnPrevLightbox: document.getElementById('lightboxPrevBtn'),
      btnNextLightbox: document.getElementById('lightboxNextBtn'),

      // Mobile Menu
      mobileToggle: document.getElementById('mobileMenuToggle'),
      mobileDrawer: document.getElementById('mobileNavDrawer'),
      mobileBackdrop: document.getElementById('mobileNavBackdrop')
    };
  }

  async function loadGalleryContent() {
    // 1. Try Live API
    try {
      const response = await fetch(`${API_BASE}/api/gallery?_t=${Date.now()}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          items = result.data;
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(items)); } catch(e){}
          renderAll();
          return;
        }
      }
    } catch (err) {
      console.warn('[Gallery] Live API unreachable, using cached/static data:', err);
    }

    // 2. Try Cached data
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          items = parsed;
          renderAll();
          return;
        }
      }
    } catch (e) {}

    // 3. Fallback to bundled dataset
    if (window.INITIAL_GALLERY_ITEMS && Array.isArray(window.INITIAL_GALLERY_ITEMS)) {
      items = JSON.parse(JSON.stringify(window.INITIAL_GALLERY_ITEMS));
      renderAll();
    } else {
      items = [];
      renderAll();
    }
  }

  function renderAll() {
    renderCategoryFilters();
    renderGalleryGrid();
  }

  // Only display categories that have actual published content!
  function renderCategoryFilters() {
    if (!el.filterBar) return;

    const availableCategories = new Set();
    items.forEach(it => {
      if (it.category) availableCategories.add(it.category);
    });

    const categoryOrder = [
      'Website Development',
      'E-commerce',
      'UI/UX Design',
      'Digital Marketing',
      'Software & Applications',
      'Branding & Creative Work'
    ];

    let buttonsHTML = `
      <button class="gallery-cat-btn ${activeCategory === 'all' ? 'active' : ''}" data-cat="all">
        All Work <span class="cat-count">(${items.length})</span>
      </button>
    `;

    categoryOrder.forEach(cat => {
      if (availableCategories.has(cat)) {
        const count = items.filter(it => it.category === cat).length;
        buttonsHTML += `
          <button class="gallery-cat-btn ${activeCategory === cat ? 'active' : ''}" data-cat="${escapeHTML(cat)}">
            ${escapeHTML(cat)} <span class="cat-count">(${count})</span>
          </button>
        `;
      }
    });

    // Handle any extra custom categories
    availableCategories.forEach(cat => {
      if (!categoryOrder.includes(cat)) {
        const count = items.filter(it => it.category === cat).length;
        buttonsHTML += `
          <button class="gallery-cat-btn ${activeCategory === cat ? 'active' : ''}" data-cat="${escapeHTML(cat)}">
            ${escapeHTML(cat)} <span class="cat-count">(${count})</span>
          </button>
        `;
      }
    });

    el.filterBar.innerHTML = buttonsHTML;

    // Attach click events
    el.filterBar.querySelectorAll('.gallery-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.getAttribute('data-cat');
        renderCategoryFilters();
        renderGalleryGrid();
      });
    });
  }

  function renderGalleryGrid() {
    if (!el.grid) return;

    if (activeCategory === 'all') {
      filteredItems = [...items];
    } else {
      filteredItems = items.filter(it => it.category === activeCategory);
    }

    filteredItems.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      const orderA = Number(a.display_order) || 999;
      const orderB = Number(b.display_order) || 999;
      return orderA - orderB;
    });

    if (filteredItems.length === 0) {
      el.grid.innerHTML = '';
      if (el.emptyState) el.emptyState.style.display = 'block';
      return;
    }

    if (el.emptyState) el.emptyState.style.display = 'none';

    el.grid.innerHTML = filteredItems.map((item, index) => {
      const imgSrc = resolveImageSrc(item.image_url);
      const isExternalLink = item.project_url && item.project_url.startsWith('http');

      return `
        <article class="gallery-card" data-index="${index}">
          <div class="gallery-card-media" onclick="galleryApp.openLightbox(${index})" title="Click to view full preview">
            <img 
              src="${imgSrc}" 
              alt="${escapeHTML(item.project_title)}" 
              class="gallery-card-img" 
              loading="lazy"
              onerror="if (window.handleCoverError) { window.handleCoverError(this, '${escapeHTML(item.id)}'); } else { this.src='images/sk-relax-showcase.png'; }"
            >
            <div class="gallery-card-overlay">
              <span class="gallery-zoom-pill">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
                <span>View Project</span>
              </span>
            </div>
            ${item.is_featured ? '<span class="gallery-featured-tag">★ Featured Work</span>' : ''}
          </div>

          <div class="gallery-card-body">
            <div class="gallery-card-meta">
              <span class="gallery-card-cat">${escapeHTML(item.category || 'Website')}</span>
              ${item.client_name ? `
                <span class="gallery-card-client">
                  ${item.client_logo ? `<img src="${resolveImageSrc(item.client_logo)}" class="gallery-client-tiny-logo" alt="${escapeHTML(item.client_name)} Logo">` : ''}
                  <span>${escapeHTML(item.client_name)}</span>
                </span>
              ` : ''}
            </div>

            <h3 class="gallery-card-title" onclick="galleryApp.openLightbox(${index})">${escapeHTML(item.project_title)}</h3>
            
            <p class="gallery-card-desc">
              ${escapeHTML(item.short_description || '')}
            </p>

            <div class="gallery-card-footer">
              <button type="button" class="btn-gallery-details" onclick="galleryApp.openLightbox(${index})">
                <span>View Details</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>

              ${item.project_url ? `
                <a href="${escapeHTML(item.project_url)}" ${isExternalLink ? 'target="_blank" rel="noopener"' : ''} class="gallery-ext-link" title="Open live project">
                  <span>Visit</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              ` : ''}
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // =========================================================
  // LIGHTBOX OPERATIONS & ACCESSIBILITY
  // =========================================================
  function initLightboxEvents() {
    if (el.btnCloseLightbox) {
      el.btnCloseLightbox.addEventListener('click', closeLightbox);
    }
    if (el.btnPrevLightbox) {
      el.btnPrevLightbox.addEventListener('click', showPrevLightbox);
    }
    if (el.btnNextLightbox) {
      el.btnNextLightbox.addEventListener('click', showNextLightbox);
    }

    if (el.lightbox) {
      el.lightbox.addEventListener('click', (e) => {
        if (e.target === el.lightbox) {
          closeLightbox();
        }
      });
    }

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
      if (!el.lightbox || el.lightbox.style.display !== 'flex') return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        showPrevLightbox();
      } else if (e.key === 'ArrowRight') {
        showNextLightbox();
      }
    });

    // Touch Swipe on Mobile for Lightbox
    let touchStartX = 0;
    let touchEndX = 0;

    if (el.lightbox) {
      el.lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      el.lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleLightboxSwipe();
      }, { passive: true });
    }

    function handleLightboxSwipe() {
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          showPrevLightbox();
        } else {
          showNextLightbox();
        }
      }
    }
  }

  function openLightbox(index) {
    if (index < 0 || index >= filteredItems.length) return;
    currentLightboxIndex = index;
    updateLightboxContent();

    document.body.classList.add('lightbox-open');
    if (el.lightbox) {
      el.lightbox.style.display = 'flex';
      el.lightbox.setAttribute('aria-hidden', 'false');
    }
  }

  function closeLightbox() {
    currentLightboxIndex = -1;
    document.body.classList.remove('lightbox-open');
    if (el.lightbox) {
      el.lightbox.style.display = 'none';
      el.lightbox.setAttribute('aria-hidden', 'true');
    }
  }

  function showPrevLightbox() {
    if (filteredItems.length === 0) return;
    currentLightboxIndex = (currentLightboxIndex - 1 + filteredItems.length) % filteredItems.length;
    updateLightboxContent();
  }

  function showNextLightbox() {
    if (filteredItems.length === 0) return;
    currentLightboxIndex = (currentLightboxIndex + 1) % filteredItems.length;
    updateLightboxContent();
  }

  function updateLightboxContent() {
    const item = filteredItems[currentLightboxIndex];
    if (!item) return;

    if (el.lightboxImg) {
      el.lightboxImg.src = resolveImageSrc(item.image_url);
      el.lightboxImg.alt = item.project_title || 'Project preview';
    }

    if (el.lightboxTitle) {
      el.lightboxTitle.textContent = item.project_title || '';
    }

    if (el.lightboxClient) {
      if (item.client_name) {
        const logoImg = item.client_logo ? `<img src="${resolveImageSrc(item.client_logo)}" class="lightbox-client-mini-logo" alt="">` : '';
        el.lightboxClient.innerHTML = `${logoImg} <span>Client: ${escapeHTML(item.client_name)}</span>`;
        el.lightboxClient.style.display = 'inline-flex';
        el.lightboxClient.style.alignItems = 'center';
        el.lightboxClient.style.gap = '0.45rem';
      } else {
        el.lightboxClient.style.display = 'none';
      }
    }

    if (el.lightboxCat) {
      el.lightboxCat.textContent = item.category || 'Website';
    }

    if (el.lightboxDesc) {
      el.lightboxDesc.textContent = item.short_description || 'Custom digital solution engineered by Cloud Technologies.';
    }

    if (el.lightboxCounter) {
      el.lightboxCounter.textContent = `${currentLightboxIndex + 1} of ${filteredItems.length}`;
    }

    if (el.lightboxLink) {
      if (item.project_url) {
        el.lightboxLink.href = item.project_url;
        el.lightboxLink.style.display = 'inline-flex';
        if (item.project_url.startsWith('http')) {
          el.lightboxLink.target = '_blank';
          el.lightboxLink.rel = 'noopener';
        } else {
          el.lightboxLink.removeAttribute('target');
        }
      } else {
        el.lightboxLink.style.display = 'none';
      }
    }
  }

  // =========================================================
  // MOBILE NAVIGATION DRAWER
  // =========================================================
  function initMobileNav() {
    if (el.mobileToggle) {
      el.mobileToggle.addEventListener('click', toggleMobileMenu);
    }
  }

  function toggleMobileMenu() {
    const isOpen = el.mobileDrawer && el.mobileDrawer.classList.contains('open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  function openMobileMenu() {
    if (el.mobileDrawer) el.mobileDrawer.classList.add('open');
    if (el.mobileBackdrop) el.mobileBackdrop.classList.add('open');
    document.body.classList.add('menu-open');
  }

  function closeMobileMenu() {
    if (el.mobileDrawer) el.mobileDrawer.classList.remove('open');
    if (el.mobileBackdrop) el.mobileBackdrop.classList.remove('open');
    document.body.classList.remove('menu-open');
  }

  // Utilities
  function resolveImageSrc(url) {
    if (!url) return 'images/cloud-logo.png';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (url.includes('client-sk-relax') || url.includes('logo-sk-relax')) return 'images/client-sk-relax.png';
    if (url.includes('client-hiramoti') || url.includes('logo-hiramoti')) return 'images/client-hiramoti.png';
    if (url.includes('091954') || url.includes('sk-relax-showcase')) return 'images/sk-relax-showcase.png';
    if (url.includes('092029') || url.includes('hiramoti-showcase')) return 'images/hiramoti-showcase.png';
    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
      const barePath = url.replace(/^\/+/, '');
      return API_BASE ? `${API_BASE}/${barePath}` : barePath;
    }
    return url.replace(/^\/+/, '');
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Expose global controller
  window.galleryApp = {
    openLightbox,
    closeLightbox,
    showPrevLightbox,
    showNextLightbox,
    toggleMobileMenu,
    closeMobileMenu
  };

  // Expose helper on window for mobile drawer inline handlers
  window.closeMobileMenu = closeMobileMenu;

})();
