// Cloud Technologies - Admin Portfolio & Gallery CMS Controller
// Connects Admin Panel -> Backend API -> Database -> Live Website

(function() {
  'use strict';

  // Constants & Storage Keys
  const ADMIN_USER = 'cloud';
  const ADMIN_PASS = 'Cloud@2005';
  const SESSION_KEY = 'cloudtech_admin_session';
  const TOKEN_KEY = 'cloudtech_auth_token';
  const LOCAL_CACHE_KEY = 'cloudtech_portfolio_cache';
  const GALLERY_CACHE_KEY = 'cloudtech_gallery_cache';

  // API Configuration
  const API_BASE = (window.CLOUD_CONFIG && window.CLOUD_CONFIG.apiUrl) || 'http://localhost:5000';

  // State
  let clients = [];
  let galleryItems = [];
  let activeTab = 'tab-portfolio';
  let activeFilterIndustry = 'all';
  let activeFilterStatus = 'all';
  let searchQuery = '';

  let activeGalleryCategory = 'all';
  let activeGalleryStatus = 'all';
  let gallerySearchQuery = '';

  let pendingDeleteId = null;
  let pendingDeleteType = 'client'; // 'client' or 'gallery'

  // DOM Elements Cache
  let el = {};

  document.addEventListener('DOMContentLoaded', initAdmin);

  function initAdmin() {
    cacheDOMElements();
    initAuth();
    initSidebar();
    initEventListeners();

    if (isAuthenticated()) {
      showDashboard();
      loadPortfolioData();
      loadGalleryData();
    } else {
      showLoginOverlay();
    }
  }

  function cacheDOMElements() {
    el = {
      loginOverlay: document.getElementById('adminLoginOverlay'),
      loginForm: document.getElementById('adminLoginForm'),
      loginUser: document.getElementById('adminUsername'),
      loginPass: document.getElementById('adminPassword'),
      loginError: document.getElementById('loginError'),
      logoutBtn: document.getElementById('adminLogoutBtn'),
      apiStatusBadge: document.getElementById('apiStatusBadge'),
      apiStatusText: document.getElementById('apiStatusText'),
      
      sidebar: document.getElementById('adminSidebar'),
      sidebarToggle: document.getElementById('mobileSidebarToggle'),
      sidebarLinks: document.querySelectorAll('.sidebar-link'),
      tabPanes: document.querySelectorAll('.tab-pane'),

      // Portfolio Elements
      statTotal: document.getElementById('statTotalClients'),
      statPublished: document.getElementById('statPublishedClients'),
      statDraft: document.getElementById('statDraftClients'),
      statFeatured: document.getElementById('statFeaturedClients'),
      sideBadgeClients: document.getElementById('sideBadgeClients'),

      searchInput: document.getElementById('portfolioSearch'),
      filterIndustry: document.getElementById('filterIndustry'),
      filterStatus: document.getElementById('filterStatus'),
      btnRefresh: document.getElementById('btnRefreshPortfolio'),
      btnAddNew: document.getElementById('btnAddNewClient'),
      tableBody: document.getElementById('portfolioTableBody'),
      emptyState: document.getElementById('tableEmptyState'),

      clientModal: document.getElementById('clientModalOverlay'),
      clientModalTitle: document.getElementById('clientModalTitle'),
      clientForm: document.getElementById('clientForm'),
      clientId: document.getElementById('clientId'),
      clientName: document.getElementById('clientNameInput'),
      logoFile: document.getElementById('logoFileInput'),
      logoPreview: document.getElementById('logoPreviewImg'),
      logoUrl: document.getElementById('logoUrlInput'),
      coverFile: document.getElementById('coverFileInput'),
      coverPreview: document.getElementById('coverPreviewImg'),
      coverUrl: document.getElementById('coverUrlInput'),
      industry: document.getElementById('industrySelect'),
      servicesCheckboxes: document.querySelectorAll('input[name="services"]'),
      projectDesc: document.getElementById('projectDescInput'),
      websiteUrl: document.getElementById('websiteUrlInput'),
      instagramUrl: document.getElementById('instagramUrlInput'),
      featuredToggle: document.getElementById('featuredToggle'),
      displayOrder: document.getElementById('displayOrderInput'),
      radioPublished: document.getElementById('radioPublished'),
      radioDraft: document.getElementById('radioDraft'),
      btnCloseClientModal: document.getElementById('btnCloseClientModal'),
      btnCancelClientModal: document.getElementById('btnCancelClientModal'),
      btnSaveDraft: document.getElementById('btnSaveDraft'),
      btnSubmitClient: document.getElementById('btnSubmitClient'),

      // Gallery Elements
      statTotalGallery: document.getElementById('statTotalGallery'),
      statPublishedGallery: document.getElementById('statPublishedGallery'),
      statDraftGallery: document.getElementById('statDraftGallery'),
      statRecentGallery: document.getElementById('statRecentGallery'),
      sideBadgeGallery: document.getElementById('sideBadgeGallery'),

      gallerySearch: document.getElementById('gallerySearch'),
      filterGalleryCategory: document.getElementById('filterGalleryCategory'),
      filterGalleryStatus: document.getElementById('filterGalleryStatus'),
      btnRefreshGallery: document.getElementById('btnRefreshGallery'),
      btnAddNewGallery: document.getElementById('btnAddNewGallery'),
      galleryTableBody: document.getElementById('galleryTableBody'),
      galleryTableEmptyState: document.getElementById('galleryTableEmptyState'),

      galleryModal: document.getElementById('galleryModalOverlay'),
      galleryModalTitle: document.getElementById('galleryModalTitle'),
      galleryForm: document.getElementById('galleryForm'),
      galleryId: document.getElementById('galleryId'),
      galleryTitle: document.getElementById('galleryTitleInput'),
      galleryClientSelect: document.getElementById('galleryClientSelect'),
      galleryClientCustom: document.getElementById('galleryClientCustomInput'),
      galleryCategory: document.getElementById('galleryCategorySelect'),
      galleryDesc: document.getElementById('galleryDescInput'),
      galleryUrl: document.getElementById('galleryUrlInput'),
      galleryOrder: document.getElementById('galleryOrderInput'),
      galleryFeaturedToggle: document.getElementById('galleryFeaturedToggle'),
      galleryRadioPublished: document.getElementById('galleryRadioPublished'),
      galleryRadioDraft: document.getElementById('galleryRadioDraft'),
      galleryFile: document.getElementById('galleryFileInput'),
      galleryPreview: document.getElementById('galleryPreviewImg'),
      galleryImageUrl: document.getElementById('galleryImageUrlInput'),
      btnCloseGalleryModal: document.getElementById('btnCloseGalleryModal'),
      btnCancelGalleryModal: document.getElementById('btnCancelGalleryModal'),
      btnSaveGalleryDraft: document.getElementById('btnSaveGalleryDraft'),
      btnSubmitGallery: document.getElementById('btnSubmitGallery'),

      galleryPreviewModal: document.getElementById('galleryPreviewModalOverlay'),
      galleryPreviewModalImg: document.getElementById('galleryPreviewModalImg'),
      galleryPreviewModalTitle: document.getElementById('galleryPreviewModalTitle'),
      btnCloseGalleryPreviewModal: document.getElementById('btnCloseGalleryPreviewModal'),
      btnDismissGalleryPreviewModal: document.getElementById('btnDismissGalleryPreviewModal'),

      // Shared Modals
      viewModal: document.getElementById('viewModalOverlay'),
      viewModalTitle: document.getElementById('viewModalTitle'),
      viewModalBody: document.getElementById('viewModalBody'),
      btnCloseViewModal: document.getElementById('btnCloseViewModal'),
      btnDismissViewModal: document.getElementById('btnDismissViewModal'),

      deleteModal: document.getElementById('deleteModalOverlay'),
      deleteModalTitle: document.getElementById('deleteModalTitle'),
      deleteModalDesc: document.getElementById('deleteModalDesc'),
      btnCancelDelete: document.getElementById('btnCancelDelete'),
      btnConfirmDelete: document.getElementById('btnConfirmDelete'),

      toastContainer: document.getElementById('toastContainer'),
      overviewApiUrl: document.getElementById('overviewApiUrl')
    };
  }

  // =========================================================
  // AUTHENTICATION
  // =========================================================
  function initAuth() {
    if (!el.loginForm) return;

    el.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const u = el.loginUser.value.trim();
      const p = el.loginPass.value.trim();

      if (!u || !p) {
        showLoginError('Please enter both username and password.');
        return;
      }

      // Try Backend Authentication Endpoint
      try {
        const response = await fetch(`${API_BASE}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.token) {
            setAuthToken(result.token);
            setSessionAuth(true);
            showDashboard();
            loadPortfolioData();
            loadGalleryData();
            showToast('Authenticated successfully with Cloud Technologies CMS.');
            return;
          }
        }
      } catch (err) {
        console.warn('[Admin] Backend login offline, attempting direct credential fallback:', err);
      }

      // Fallback Direct Verification
      if (u === ADMIN_USER && p === ADMIN_PASS) {
        setAuthToken('authenticated_session_token');
        setSessionAuth(true);
        showDashboard();
        loadPortfolioData();
        loadGalleryData();
        showToast('Authenticated via security credentials.');
      } else {
        showLoginError('Invalid administrator credentials. Access denied.');
      }
    });

    if (el.logoutBtn) {
      el.logoutBtn.addEventListener('click', () => {
        clearAuth();
        showLoginOverlay();
        showToast('Signed out of Admin Console.');
      });
    }
  }

  function isAuthenticated() {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  }

  function setSessionAuth(val) {
    if (val) {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }

  function getAuthToken() {
    return sessionStorage.getItem(TOKEN_KEY) || 'authenticated_session_token';
  }

  function setAuthToken(token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  function clearAuth() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }

  function showDashboard() {
    if (el.loginOverlay) el.loginOverlay.style.display = 'none';
    if (el.overviewApiUrl) el.overviewApiUrl.textContent = API_BASE;
  }

  function showLoginOverlay() {
    if (el.loginOverlay) {
      el.loginOverlay.style.display = 'flex';
      if (el.loginUser) el.loginUser.value = '';
      if (el.loginPass) el.loginPass.value = '';
      if (el.loginError) el.loginError.style.display = 'none';
    }
  }

  function showLoginError(msg) {
    if (el.loginError) {
      el.loginError.textContent = msg;
      el.loginError.style.display = 'block';
    }
  }

  // =========================================================
  // SIDEBAR & TABS
  // =========================================================
  function initSidebar() {
    if (el.sidebarToggle && el.sidebar) {
      el.sidebarToggle.addEventListener('click', () => {
        el.sidebar.classList.toggle('open');
      });
    }

    if (el.sidebarLinks) {
      el.sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
          const targetTab = link.getAttribute('data-tab');
          switchTab(targetTab);
          if (window.innerWidth <= 1024 && el.sidebar) {
            el.sidebar.classList.remove('open');
          }
        });
      });
    }
  }

  function switchTab(tabId) {
    activeTab = tabId;
    el.sidebarLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('data-tab') === tabId);
    });
    el.tabPanes.forEach(pane => {
      const isTarget = pane.id === tabId;
      pane.style.display = isTarget ? 'block' : 'none';
      pane.classList.toggle('active', isTarget);
    });
  }

  // =========================================================
  // DATA ACCESS: PORTFOLIO API & CACHE
  // =========================================================
  async function loadPortfolioData() {
    updateApiStatus('connecting', 'Connecting API...');

    try {
      const response = await fetch(`${API_BASE}/api/admin/portfolio?_t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          clients = result.data;
          saveLocalCache(clients);
          updateApiStatus('online', 'API Connected (Live Database)');
          renderAll();
          populateGalleryClientDropdown();
          return;
        }
      }
    } catch (err) {
      console.warn('[Admin] Live Portfolio API failed, falling back to cache/seed:', err);
    }

    // Fallback: Read from LocalStorage cache or bundled seed data
    const cached = getLocalCache();
    if (cached && cached.length > 0) {
      clients = cached;
      updateApiStatus('offline', 'Offline Cache Mode');
    } else if (window.INITIAL_PORTFOLIO_CLIENTS && window.INITIAL_PORTFOLIO_CLIENTS.length > 0) {
      clients = JSON.parse(JSON.stringify(window.INITIAL_PORTFOLIO_CLIENTS));
      saveLocalCache(clients);
      updateApiStatus('offline', 'Initial Seed Mode');
    } else {
      clients = [];
      updateApiStatus('offline', 'No Data Available');
    }

    renderAll();
    populateGalleryClientDropdown();
  }

  function getLocalCache() {
    try {
      const raw = localStorage.getItem(LOCAL_CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveLocalCache(data) {
    try {
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('cloudtech:portfolio-updated', { detail: data }));
    } catch (e) {
      console.warn('[Admin] Could not cache to localStorage:', e);
    }
  }

  function updateApiStatus(status, label) {
    if (!el.apiStatusBadge || !el.apiStatusText) return;
    el.apiStatusText.textContent = label;
    const dot = el.apiStatusBadge.querySelector('.status-dot');
    if (dot) {
      dot.className = 'status-dot' + (status === 'offline' ? ' amber' : '');
    }
  }

  // =========================================================
  // DATA ACCESS: GALLERY API & CACHE
  // =========================================================
  async function loadGalleryData() {
    try {
      const response = await fetch(`${API_BASE}/api/admin/gallery?_t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          galleryItems = result.data;
          saveGalleryCache(galleryItems);
          renderGalleryAll();
          return;
        }
      }
    } catch (err) {
      console.warn('[Admin] Live Gallery API failed, falling back to cache/seed:', err);
    }

    // Fallback
    const cached = getGalleryCache();
    if (cached && cached.length > 0) {
      galleryItems = cached;
    } else if (window.INITIAL_GALLERY_ITEMS && window.INITIAL_GALLERY_ITEMS.length > 0) {
      galleryItems = JSON.parse(JSON.stringify(window.INITIAL_GALLERY_ITEMS));
      saveGalleryCache(galleryItems);
    } else {
      galleryItems = [];
    }

    renderGalleryAll();
  }

  function getGalleryCache() {
    try {
      const raw = localStorage.getItem(GALLERY_CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveGalleryCache(data) {
    try {
      localStorage.setItem(GALLERY_CACHE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('cloudtech:gallery-updated', { detail: data }));
    } catch (e) {
      console.warn('[Admin] Could not cache gallery to localStorage:', e);
    }
  }

  function populateGalleryClientDropdown() {
    if (!el.galleryClientSelect) return;
    const currentVal = el.galleryClientSelect.value;
    el.galleryClientSelect.innerHTML = '<option value="">-- Standalone Project (No Client) --</option>';
    clients.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.client_name} (${c.industry || 'General'})`;
      opt.setAttribute('data-name', c.client_name);
      el.galleryClientSelect.appendChild(opt);
    });
    if (currentVal) el.galleryClientSelect.value = currentVal;
  }

  // =========================================================
  // EVENT LISTENERS & FILTERING
  // =========================================================
  function initEventListeners() {
    // Portfolio Search & Filter
    if (el.searchInput) {
      el.searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderTable();
      });
    }

    if (el.filterIndustry) {
      el.filterIndustry.addEventListener('change', (e) => {
        activeFilterIndustry = e.target.value;
        renderTable();
      });
    }

    if (el.filterStatus) {
      el.filterStatus.addEventListener('change', (e) => {
        activeFilterStatus = e.target.value;
        renderTable();
      });
    }

    if (el.btnRefresh) {
      el.btnRefresh.addEventListener('click', () => {
        loadPortfolioData();
        showToast('Refreshing portfolio from live API...');
      });
    }

    // Portfolio Modal Triggers
    if (el.btnAddNew) {
      el.btnAddNew.addEventListener('click', () => openClientModal(null));
    }
    if (el.btnCloseClientModal) {
      el.btnCloseClientModal.addEventListener('click', closeClientModal);
    }
    if (el.btnCancelClientModal) {
      el.btnCancelClientModal.addEventListener('click', closeClientModal);
    }

    // Logo Upload & Live Preview
    if (el.logoFile) {
      el.logoFile.addEventListener('change', handleLogoFileSelect);
    }
    if (el.logoUrl) {
      el.logoUrl.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (el.logoPreview) {
          el.logoPreview.src = val ? resolveLogoSrc(val) : 'images/cloud-logo.png';
        }
      });
    }

    // Project Cover Upload & Live Preview
    if (el.coverFile) {
      el.coverFile.addEventListener('change', handleCoverFileSelect);
    }
    if (el.coverUrl) {
      el.coverUrl.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (el.coverPreview) {
          el.coverPreview.src = val ? resolveLogoSrc(val) : 'images/cloud-logo.png';
        }
      });
    }

    // Portfolio Form Submissions
    if (el.btnSaveDraft) {
      el.btnSaveDraft.addEventListener('click', () => {
        if (el.radioDraft) el.radioDraft.checked = true;
        submitClientForm();
      });
    }

    if (el.clientForm) {
      el.clientForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitClientForm();
      });
    }

    // Gallery Search & Filter
    if (el.gallerySearch) {
      el.gallerySearch.addEventListener('input', (e) => {
        gallerySearchQuery = e.target.value.toLowerCase().trim();
        renderGalleryTable();
      });
    }

    if (el.filterGalleryCategory) {
      el.filterGalleryCategory.addEventListener('change', (e) => {
        activeGalleryCategory = e.target.value;
        renderGalleryTable();
      });
    }

    if (el.filterGalleryStatus) {
      el.filterGalleryStatus.addEventListener('change', (e) => {
        activeGalleryStatus = e.target.value;
        renderGalleryTable();
      });
    }

    if (el.btnRefreshGallery) {
      el.btnRefreshGallery.addEventListener('click', () => {
        loadGalleryData();
        showToast('Refreshing gallery from live API...');
      });
    }

    // Gallery Modal Triggers
    if (el.btnAddNewGallery) {
      el.btnAddNewGallery.addEventListener('click', () => openGalleryModal(null));
    }
    if (el.btnCloseGalleryModal) {
      el.btnCloseGalleryModal.addEventListener('click', closeGalleryModal);
    }
    if (el.btnCancelGalleryModal) {
      el.btnCancelGalleryModal.addEventListener('click', closeGalleryModal);
    }

    // Gallery Image Upload & Live Preview
    if (el.galleryFile) {
      el.galleryFile.addEventListener('change', handleGalleryFileSelect);
    }
    if (el.galleryImageUrl) {
      el.galleryImageUrl.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (el.galleryPreview) {
          el.galleryPreview.src = val ? resolveLogoSrc(val) : 'images/cloud-logo.png';
        }
      });
    }

    if (el.galleryClientSelect) {
      el.galleryClientSelect.addEventListener('change', (e) => {
        const sel = e.target.options[e.target.selectedIndex];
        if (sel && sel.value && !el.galleryClientCustom.value.trim()) {
          el.galleryClientCustom.value = sel.getAttribute('data-name') || '';
        }
      });
    }

    // Gallery Form Submissions
    if (el.btnSaveGalleryDraft) {
      el.btnSaveGalleryDraft.addEventListener('click', () => {
        if (el.galleryRadioDraft) el.galleryRadioDraft.checked = true;
        submitGalleryForm();
      });
    }

    if (el.galleryForm) {
      el.galleryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitGalleryForm();
      });
    }

    // Gallery Preview Modal
    if (el.btnCloseGalleryPreviewModal) el.btnCloseGalleryPreviewModal.addEventListener('click', closeGalleryPreview);
    if (el.btnDismissGalleryPreviewModal) el.btnDismissGalleryPreviewModal.addEventListener('click', closeGalleryPreview);

    // View Modal
    if (el.btnCloseViewModal) el.btnCloseViewModal.addEventListener('click', closeViewModal);
    if (el.btnDismissViewModal) el.btnDismissViewModal.addEventListener('click', closeViewModal);

    // Delete Modal
    if (el.btnCancelDelete) el.btnCancelDelete.addEventListener('click', closeDeleteModal);
    if (el.btnConfirmDelete) el.btnConfirmDelete.addEventListener('click', confirmDelete);

    // Universal Escape Key & Overlay Click Handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });

    [el.clientModal, el.galleryModal, el.viewModal, el.deleteModal, el.galleryPreviewModal].forEach(modalOverlay => {
      if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
          if (e.target === modalOverlay) {
            closeAllModals();
          }
        });
      }
    });

    // Settings Form
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Website contact settings updated successfully!');
      });
    }
  }

  function closeAllModals() {
    closeClientModal();
    closeGalleryModal();
    closeViewModal();
    closeDeleteModal();
    closeGalleryPreview();
  }

  // =========================================================
  // PORTFOLIO MODAL OPERATIONS & SCROLL MANAGEMENT
  // =========================================================
  function openClientModal(clientId = null) {
    if (!el.clientForm || !el.clientModal) return;

    el.clientForm.reset();
    el.clientId.value = '';

    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      if (!client) return;

      el.clientModalTitle.textContent = 'Edit Client Project';
      el.clientId.value = client.id;
      el.clientName.value = client.client_name || '';
      el.logoUrl.value = client.logo_url || '';
      el.logoPreview.src = resolveLogoSrc(client.logo_url);
      if (el.coverUrl) el.coverUrl.value = client.cover_image_url || '';
      if (el.coverPreview) el.coverPreview.src = client.cover_image_url ? resolveLogoSrc(client.cover_image_url) : 'images/cloud-logo.png';
      el.industry.value = client.industry || 'Other';
      el.projectDesc.value = client.project_description || '';
      el.websiteUrl.value = client.website_url || '';
      el.instagramUrl.value = client.instagram_url || '';
      el.featuredToggle.checked = Boolean(client.is_featured);
      el.displayOrder.value = client.display_order || 1;

      if (client.publish_status === 'draft') {
        el.radioDraft.checked = true;
      } else {
        el.radioPublished.checked = true;
      }

      const currentServices = client.services || [];
      el.servicesCheckboxes.forEach(cb => {
        cb.checked = currentServices.includes(cb.value);
      });

      if (el.btnSubmitClient) el.btnSubmitClient.textContent = 'Update Client';
    } else {
      el.clientModalTitle.textContent = 'Add New Client Project';
      el.logoPreview.src = 'images/cloud-logo.png';
      if (el.logoUrl) el.logoUrl.value = '';
      if (el.coverPreview) el.coverPreview.src = 'images/cloud-logo.png';
      if (el.coverUrl) el.coverUrl.value = '';
      el.displayOrder.value = clients.length + 1;
      el.radioPublished.checked = true;
      if (el.btnSubmitClient) el.btnSubmitClient.textContent = 'Publish Client';
    }

    // Universal modal lock & open
    document.body.classList.add('modal-open');
    el.clientModal.style.display = 'flex';
  }

  function closeClientModal() {
    if (el.clientModal) {
      el.clientModal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  }

  async function handleLogoFileSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds 10MB limit. Please choose a smaller image.', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (re) => {
      if (el.logoPreview) el.logoPreview.src = re.target.result;
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('image', file);

    try {
      showToast('Uploading logo image to persistent storage...');
      const response = await fetch(`${API_BASE}/api/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.url) {
          el.logoUrl.value = result.url;
          showToast('Logo uploaded successfully.');
          return;
        }
      }
    } catch (err) {
      console.warn('[Admin] Direct upload API failed, keeping local preview:', err);
    }

    showToast('Image cached locally.');
  }

  async function handleCoverFileSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds 10MB limit. Please choose a smaller image.', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (re) => {
      if (el.coverPreview) el.coverPreview.src = re.target.result;
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('image', file);

    try {
      showToast('Uploading project cover to persistent storage...');
      const response = await fetch(`${API_BASE}/api/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.url) {
          if (el.coverUrl) el.coverUrl.value = result.url;
          showToast('Project cover uploaded successfully.');
          return;
        }
      }
    } catch (err) {
      console.warn('[Admin] Direct upload API failed, keeping local preview:', err);
    }

    showToast('Cover image cached locally.');
  }

  async function submitClientForm() {
    const name = el.clientName.value.trim();
    if (!name) {
      showToast('Client Name is required.', true);
      return;
    }

    const selectedServices = [];
    el.servicesCheckboxes.forEach(cb => {
      if (cb.checked) selectedServices.push(cb.value);
    });

    const isEdit = Boolean(el.clientId.value);
    const clientData = {
      client_name: name,
      logo_url: el.logoUrl.value.trim() || (el.logoPreview.src.startsWith('data:') ? el.logoPreview.src : 'images/cloud-logo.png'),
      cover_image_url: el.coverUrl ? el.coverUrl.value.trim() : '',
      industry: el.industry.value,
      services: selectedServices,
      project_description: el.projectDesc.value.trim(),
      website_url: el.websiteUrl.value.trim(),
      instagram_url: el.instagramUrl.value.trim(),
      is_featured: el.featuredToggle.checked,
      display_order: Number(el.displayOrder.value) || 1,
      publish_status: el.radioDraft.checked ? 'draft' : 'published'
    };

    const targetUrl = isEdit 
      ? `${API_BASE}/api/admin/portfolio/${el.clientId.value}`
      : `${API_BASE}/api/admin/portfolio`;

    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(targetUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(clientData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          showToast(isEdit ? 'Client updated successfully.' : 'New client published to live website.');
          closeClientModal();
          await loadPortfolioData();
          await loadGalleryData();
          return;
        }
      }
    } catch (err) {
      console.warn('[Admin] API call failed, updating local state:', err);
    }

    // Local fallback update
    if (isEdit) {
      const idx = clients.findIndex(c => c.id === el.clientId.value);
      if (idx !== -1) {
        clients[idx] = { ...clients[idx], ...clientData, updated_at: new Date().toISOString() };
      }
    } else {
      const newId = `client-${Date.now()}`;
      clients.push({ id: newId, ...clientData, created_at: new Date().toISOString() });
    }

    saveLocalCache(clients);
    closeClientModal();
    renderAll();
    populateGalleryClientDropdown();
    showToast(isEdit ? 'Client updated in local cache.' : 'Client saved to local cache.');
  }

  // =========================================================
  // GALLERY MODAL OPERATIONS & SCROLL MANAGEMENT
  // =========================================================
  function openGalleryModal(galleryId = null) {
    if (!el.galleryForm || !el.galleryModal) return;

    el.galleryForm.reset();
    el.galleryId.value = '';
    populateGalleryClientDropdown();

    if (galleryId) {
      const item = galleryItems.find(g => g.id === galleryId);
      if (!item) return;

      el.galleryModalTitle.textContent = 'Edit Gallery Image';
      el.galleryId.value = item.id;
      el.galleryTitle.value = item.project_title || '';
      el.galleryImageUrl.value = item.image_url || '';
      el.galleryPreview.src = resolveLogoSrc(item.image_url);
      el.galleryCategory.value = item.category || 'Website Development';
      el.galleryDesc.value = item.short_description || '';
      el.galleryUrl.value = item.project_url || '';
      el.galleryOrder.value = item.display_order || 1;
      el.galleryFeaturedToggle.checked = Boolean(item.is_featured);

      if (item.client_id && el.galleryClientSelect) {
        el.galleryClientSelect.value = item.client_id;
      }
      el.galleryClientCustom.value = item.client_name || '';

      if (item.publish_status === 'draft') {
        el.galleryRadioDraft.checked = true;
      } else {
        el.galleryRadioPublished.checked = true;
      }

      if (el.btnSubmitGallery) el.btnSubmitGallery.textContent = 'Update Image';
    } else {
      el.galleryModalTitle.textContent = 'Add Gallery Image';
      el.galleryPreview.src = 'images/cloud-logo.png';
      el.galleryOrder.value = galleryItems.length + 1;
      el.galleryRadioPublished.checked = true;
      if (el.btnSubmitGallery) el.btnSubmitGallery.textContent = 'Publish Image';
    }

    document.body.classList.add('modal-open');
    el.galleryModal.style.display = 'flex';
  }

  function closeGalleryModal() {
    if (el.galleryModal) {
      el.galleryModal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  }

  async function handleGalleryFileSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image file exceeds 10MB limit. Please choose a smaller file.', true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (re) => {
      if (el.galleryPreview) el.galleryPreview.src = re.target.result;
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('image', file);

    try {
      showToast('Uploading project image...');
      const response = await fetch(`${API_BASE}/api/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.url) {
          el.galleryImageUrl.value = result.url;
          showToast('Image uploaded successfully.');
          return;
        }
      }
    } catch (err) {
      console.warn('[Admin] Direct upload API failed, caching local image data:', err);
    }

    showToast('Image loaded locally.');
  }

  async function submitGalleryForm() {
    const title = el.galleryTitle.value.trim();
    if (!title) {
      showToast('Project Title is required.', true);
      return;
    }

    let imgUrl = el.galleryImageUrl.value.trim();
    if (!imgUrl && el.galleryPreview.src.startsWith('data:')) {
      imgUrl = el.galleryPreview.src;
    }
    if (!imgUrl) {
      showToast('Please upload or specify a project image.', true);
      return;
    }

    let clientName = el.galleryClientCustom.value.trim();
    let clientId = el.galleryClientSelect.value;
    if (clientId && !clientName) {
      const selectedOption = el.galleryClientSelect.options[el.galleryClientSelect.selectedIndex];
      clientName = selectedOption ? (selectedOption.getAttribute('data-name') || '') : '';
    }

    const isEdit = Boolean(el.galleryId.value);
    const galleryData = {
      project_title: title,
      client_name: clientName,
      client_id: clientId,
      image_url: imgUrl,
      category: el.galleryCategory.value,
      short_description: el.galleryDesc.value.trim(),
      project_url: el.galleryUrl.value.trim(),
      display_order: Number(el.galleryOrder.value) || 1,
      is_featured: el.galleryFeaturedToggle.checked,
      publish_status: el.galleryRadioDraft.checked ? 'draft' : 'published'
    };

    const targetUrl = isEdit 
      ? `${API_BASE}/api/admin/gallery/${el.galleryId.value}`
      : `${API_BASE}/api/admin/gallery`;

    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(targetUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(galleryData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          showToast(isEdit ? 'Gallery image updated successfully.' : 'New image published to live gallery.');
          closeGalleryModal();
          await loadGalleryData();
          await loadPortfolioData();
          return;
        }
      }
    } catch (err) {
      console.warn('[Admin] Gallery API failed, updating local state:', err);
    }

    // Local fallback
    if (isEdit) {
      const idx = galleryItems.findIndex(g => g.id === el.galleryId.value);
      if (idx !== -1) {
        galleryItems[idx] = { ...galleryItems[idx], ...galleryData, updated_at: new Date().toISOString() };
      }
    } else {
      const newId = `gallery-${Date.now()}`;
      galleryItems.push({ id: newId, ...galleryData, created_at: new Date().toISOString() });
    }

    saveGalleryCache(galleryItems);
    closeGalleryModal();
    renderGalleryAll();
    showToast(isEdit ? 'Gallery image updated locally.' : 'Gallery image saved locally.');
  }

  function openGalleryPreview(imgUrl, title) {
    if (!el.galleryPreviewModal || !el.galleryPreviewModalImg) return;
    el.galleryPreviewModalImg.src = resolveLogoSrc(imgUrl);
    if (el.galleryPreviewModalTitle) el.galleryPreviewModalTitle.textContent = title || 'Image Preview';
    document.body.classList.add('modal-open');
    el.galleryPreviewModal.style.display = 'flex';
  }

  function closeGalleryPreview() {
    if (el.galleryPreviewModal) {
      el.galleryPreviewModal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  }

  async function toggleGalleryStatus(id) {
    const item = galleryItems.find(g => g.id === id);
    if (!item) return;

    const nextStatus = item.publish_status === 'published' ? 'draft' : 'published';

    try {
      const response = await fetch(`${API_BASE}/api/admin/gallery/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ publish_status: nextStatus })
      });

      if (response.ok) {
        showToast(`"${item.project_title}" status changed to ${nextStatus}.`);
        await loadGalleryData();
        await loadPortfolioData();
        return;
      }
    } catch (err) {
      console.warn('[Admin] Gallery status toggle API failed:', err);
    }

    item.publish_status = nextStatus;
    saveGalleryCache(galleryItems);
    renderGalleryAll();
    showToast(`Status updated to ${nextStatus}.`);
  }

  function promptDeleteGallery(id) {
    const item = galleryItems.find(g => g.id === id);
    if (!item || !el.deleteModal) return;

    pendingDeleteId = id;
    pendingDeleteType = 'gallery';
    if (el.deleteModalTitle) el.deleteModalTitle.textContent = 'Delete Gallery Image';
    if (el.deleteModalDesc) {
      el.deleteModalDesc.textContent = `Are you sure you want to permanently delete "${item.project_title}"? This will remove the image from the live public gallery.`;
    }
    document.body.classList.add('modal-open');
    el.deleteModal.style.display = 'flex';
  }

  // =========================================================
  // VIEW & DELETE SHARED MODALS
  // =========================================================
  function viewClient(id) {
    const client = clients.find(c => c.id === id);
    if (!client || !el.viewModal || !el.viewModalBody) return;

    el.viewModalTitle.textContent = client.client_name;
    const services = client.services || [];

    el.viewModalBody.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem;">
        <div class="logo-preview-box" style="width: 64px; height: 64px;">
          <img src="${resolveLogoSrc(client.logo_url)}" alt="${escapeHTML(client.client_name)}" class="logo-preview-element">
        </div>
        <div>
          <h3 style="margin: 0 0 0.25rem 0; font-size: 1.15rem; color: var(--admin-navy-dark);">${escapeHTML(client.client_name)}</h3>
          <span class="badge-pill blue">${escapeHTML(client.industry || 'General')}</span>
        </div>
      </div>

      ${client.cover_image_url ? `
        <div class="view-detail-row">
          <span class="view-label">Project Cover Showcase</span>
          <div style="max-width: 480px; aspect-ratio: 16/10; border-radius: 8px; overflow: hidden; border: 1px solid var(--admin-border); margin-top: 0.4rem; background: #0F172A;">
            <img src="${resolveLogoSrc(client.cover_image_url)}" alt="${escapeHTML(client.client_name)} Cover" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        </div>
      ` : ''}

      <div class="view-detail-row">
        <span class="view-label">Project Description</span>
        <span class="view-val">${escapeHTML(client.project_description || 'No description provided.')}</span>
      </div>

      <div class="view-detail-row">
        <span class="view-label">Services Delivered</span>
        <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.35rem;">
          ${services.map(s => `<span class="service-chip">${escapeHTML(s)}</span>`).join('') || '<span style="color: var(--admin-text-muted);">None specified</span>'}
        </div>
      </div>

      ${client.website_url ? `
        <div class="view-detail-row">
          <span class="view-label">Live Website</span>
          <span class="view-val"><a href="${escapeHTML(client.website_url)}" target="_blank" rel="noopener" style="color: var(--admin-blue); font-weight: 600;">${escapeHTML(client.website_url)} ↗</a></span>
        </div>
      ` : ''}

      ${client.instagram_url ? `
        <div class="view-detail-row">
          <span class="view-label">Instagram Profile</span>
          <span class="view-val"><a href="${escapeHTML(client.instagram_url)}" target="_blank" rel="noopener" style="color: var(--admin-blue); font-weight: 600;">${escapeHTML(client.instagram_url)} ↗</a></span>
        </div>
      ` : ''}

      <div class="view-detail-row">
        <span class="view-label">Visibility Status</span>
        <span class="view-val">
          <span class="status-badge ${client.publish_status === 'published' ? 'published' : 'draft'}">
            ${client.publish_status === 'published' ? 'Published on Live Website' : 'Draft (Admin Only)'}
          </span>
          ${client.is_featured ? '<span class="featured-indicator">★ Featured</span>' : ''}
          <span style="margin-left: 0.5rem; font-size: 0.75rem; color: var(--admin-text-muted);">Display Order: #${client.display_order || 1}</span>
        </span>
      </div>
    `;

    document.body.classList.add('modal-open');
    el.viewModal.style.display = 'flex';
  }

  function closeViewModal() {
    if (el.viewModal) {
      el.viewModal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  }

  async function toggleStatus(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;

    const nextStatus = client.publish_status === 'published' ? 'draft' : 'published';

    try {
      const response = await fetch(`${API_BASE}/api/admin/portfolio/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ publish_status: nextStatus })
      });

      if (response.ok) {
        showToast(`Client "${client.client_name}" set to ${nextStatus}.`);
        await loadPortfolioData();
        await loadGalleryData();
        return;
      }
    } catch (err) {
      console.warn('[Admin] Status toggle API call failed, updating local state:', err);
    }

    client.publish_status = nextStatus;
    saveLocalCache(clients);
    renderAll();
    showToast(`Status updated to ${nextStatus}.`);
  }

  function promptDelete(id) {
    const client = clients.find(c => c.id === id);
    if (!client || !el.deleteModal) return;

    pendingDeleteId = id;
    pendingDeleteType = 'client';
    if (el.deleteModalTitle) el.deleteModalTitle.textContent = 'Delete Client Project';
    if (el.deleteModalDesc) {
      el.deleteModalDesc.textContent = `Are you sure you want to permanently delete "${client.client_name}"? This will safely remove the client record from the portfolio database.`;
    }
    document.body.classList.add('modal-open');
    el.deleteModal.style.display = 'flex';
  }

  function closeDeleteModal() {
    pendingDeleteId = null;
    if (el.deleteModal) {
      el.deleteModal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    const targetId = pendingDeleteId;
    const type = pendingDeleteType;

    if (type === 'gallery') {
      try {
        const response = await fetch(`${API_BASE}/api/admin/gallery/${targetId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getAuthToken()}` }
        });

        if (response.ok) {
          showToast('Gallery image deleted successfully.');
          closeDeleteModal();
          await loadGalleryData();
          await loadPortfolioData();
          return;
        }
      } catch (err) {
        console.warn('[Admin] Delete gallery item API failed, removing locally:', err);
      }

      galleryItems = galleryItems.filter(g => g.id !== targetId);
      saveGalleryCache(galleryItems);
      closeDeleteModal();
      renderGalleryAll();
      showToast('Image removed from gallery.');
      return;
    }

    // Client Delete
    try {
      const response = await fetch(`${API_BASE}/api/admin/portfolio/${targetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });

      if (response.ok) {
        showToast('Client deleted successfully.');
        closeDeleteModal();
        await loadPortfolioData();
        await loadGalleryData();
        return;
      }
    } catch (err) {
      console.warn('[Admin] Delete API call failed, removing from local state:', err);
    }

    clients = clients.filter(c => c.id !== targetId);
    saveLocalCache(clients);
    closeDeleteModal();
    renderAll();
    populateGalleryClientDropdown();
    showToast('Client deleted from local portfolio.');
  }

  // =========================================================
  // RENDERING
  // =========================================================
  function renderAll() {
    updatePortfolioStats();
    renderTable();
  }

  function updatePortfolioStats() {
    const total = clients.length;
    const published = clients.filter(c => c.publish_status === 'published').length;
    const drafts = clients.filter(c => c.publish_status === 'draft').length;
    const featured = clients.filter(c => c.is_featured).length;

    if (el.statTotal) el.statTotal.textContent = total;
    if (el.statPublished) el.statPublished.textContent = published;
    if (el.statDraft) el.statDraft.textContent = drafts;
    if (el.statFeatured) el.statFeatured.textContent = featured;
    if (el.sideBadgeClients) el.sideBadgeClients.textContent = total;
  }

  function renderTable() {
    if (!el.tableBody) return;

    let filtered = [...clients];

    if (activeFilterIndustry !== 'all') {
      filtered = filtered.filter(c => c.industry === activeFilterIndustry);
    }

    if (activeFilterStatus !== 'all') {
      filtered = filtered.filter(c => c.publish_status === activeFilterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(c => {
        const name = (c.client_name || '').toLowerCase();
        const ind = (c.industry || '').toLowerCase();
        const serv = (c.services || []).join(' ').toLowerCase();
        return name.includes(searchQuery) || ind.includes(searchQuery) || serv.includes(searchQuery);
      });
    }

    filtered.sort((a, b) => {
      const orderA = Number(a.display_order) || 999;
      const orderB = Number(b.display_order) || 999;
      return orderA - orderB;
    });

    if (filtered.length === 0) {
      el.tableBody.innerHTML = '';
      if (el.emptyState) el.emptyState.style.display = 'block';
      return;
    }

    if (el.emptyState) el.emptyState.style.display = 'none';

    el.tableBody.innerHTML = filtered.map(c => `
      <tr>
        <td>
          <div class="table-logo-box" onclick="adminApp.viewClient('${c.id}')" title="Click to view details">
            <img src="${resolveLogoSrc(c.logo_url)}" alt="${escapeHTML(c.client_name)}" class="table-logo-img">
          </div>
        </td>
        <td>
          <div class="client-name-cell">
            <span class="client-primary-name" onclick="adminApp.viewClient('${c.id}')">${escapeHTML(c.client_name)}</span>
            ${c.is_featured ? '<span class="featured-indicator">★ Featured</span>' : ''}
          </div>
          <div class="client-desc-snippet">${escapeHTML(c.project_description || '')}</div>
        </td>
        <td>
          <span class="badge-pill blue">${escapeHTML(c.industry || 'General')}</span>
        </td>
        <td>
          <div class="services-list-cell">
            ${(c.services || []).slice(0, 2).map(s => `<span class="service-chip">${escapeHTML(s)}</span>`).join('')}
            ${(c.services || []).length > 2 ? `<span class="service-chip more">+${(c.services || []).length - 2} more</span>` : ''}
          </div>
        </td>
        <td>
          <span class="status-badge ${c.publish_status === 'published' ? 'published' : 'draft'}">
            ${c.publish_status === 'published' ? 'Published' : 'Draft'}
          </span>
        </td>
        <td style="text-align: right;">
          <div class="actions-cell">
            <button type="button" class="action-btn" title="View Project Details" onclick="adminApp.viewClient('${c.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button type="button" class="action-btn edit" title="Edit Client Project" onclick="adminApp.editClient('${c.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button type="button" class="action-btn toggle" title="${c.publish_status === 'published' ? 'Unpublish (Make Draft)' : 'Publish Live'}" onclick="adminApp.toggleStatus('${c.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
            <button type="button" class="action-btn delete" title="Delete Client" onclick="adminApp.promptDelete('${c.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function renderGalleryAll() {
    updateGalleryStats();
    renderGalleryTable();
  }

  function updateGalleryStats() {
    const total = galleryItems.length;
    const published = galleryItems.filter(g => g.publish_status === 'published').length;
    const drafts = galleryItems.filter(g => g.publish_status === 'draft').length;

    if (el.statTotalGallery) el.statTotalGallery.textContent = total;
    if (el.statPublishedGallery) el.statPublishedGallery.textContent = published;
    if (el.statDraftGallery) el.statDraftGallery.textContent = drafts;
    if (el.statRecentGallery) el.statRecentGallery.textContent = Math.min(total, 5);
    if (el.sideBadgeGallery) el.sideBadgeGallery.textContent = total;
  }

  function renderGalleryTable() {
    if (!el.galleryTableBody) return;

    let filtered = [...galleryItems];

    if (activeGalleryCategory !== 'all') {
      filtered = filtered.filter(g => g.category === activeGalleryCategory);
    }

    if (activeGalleryStatus !== 'all') {
      filtered = filtered.filter(g => g.publish_status === activeGalleryStatus);
    }

    if (gallerySearchQuery) {
      filtered = filtered.filter(g => {
        const title = (g.project_title || '').toLowerCase();
        const client = (g.client_name || '').toLowerCase();
        const cat = (g.category || '').toLowerCase();
        return title.includes(gallerySearchQuery) || client.includes(gallerySearchQuery) || cat.includes(gallerySearchQuery);
      });
    }

    filtered.sort((a, b) => {
      const orderA = Number(a.display_order) || 999;
      const orderB = Number(b.display_order) || 999;
      return orderA - orderB;
    });

    if (filtered.length === 0) {
      el.galleryTableBody.innerHTML = '';
      if (el.galleryTableEmptyState) el.galleryTableEmptyState.style.display = 'block';
      return;
    }

    if (el.galleryTableEmptyState) el.galleryTableEmptyState.style.display = 'none';

    el.galleryTableBody.innerHTML = filtered.map(g => `
      <tr>
        <td>
          <div class="gallery-thumb-box" onclick="adminApp.previewGallery('${g.image_url}', '${escapeHTML(g.project_title)}')" title="Click to view large preview">
            <img src="${resolveLogoSrc(g.image_url)}" alt="${escapeHTML(g.project_title)}" class="gallery-thumb-img">
          </div>
        </td>
        <td>
          <div class="client-name-cell">
            <span class="client-primary-name" onclick="adminApp.editGallery('${g.id}')">${escapeHTML(g.project_title)}</span>
            ${g.is_featured ? '<span class="featured-indicator">★ Top</span>' : ''}
          </div>
          ${g.client_name ? `<div class="client-desc-snippet">Client: <strong>${escapeHTML(g.client_name)}</strong></div>` : ''}
        </td>
        <td>
          <span class="gallery-cat-badge">${escapeHTML(g.category || 'Website')}</span>
        </td>
        <td style="text-align: center; font-weight: 600; color: var(--admin-text-secondary);">
          #${g.display_order || 1}
        </td>
        <td>
          <span class="status-badge ${g.publish_status === 'published' ? 'published' : 'draft'}">
            ${g.publish_status === 'published' ? 'Published' : 'Draft'}
          </span>
        </td>
        <td style="text-align: right;">
          <div class="actions-cell">
            <button type="button" class="action-btn" title="View Fullscreen" onclick="adminApp.previewGallery('${g.image_url}', '${escapeHTML(g.project_title)}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            <button type="button" class="action-btn edit" title="Edit Gallery Item" onclick="adminApp.editGallery('${g.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button type="button" class="action-btn toggle" title="${g.publish_status === 'published' ? 'Unpublish' : 'Publish Live'}" onclick="adminApp.toggleGalleryStatus('${g.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
            <button type="button" class="action-btn delete" title="Delete Image" onclick="adminApp.promptDeleteGallery('${g.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function resolveLogoSrc(url) {
    if (!url) return 'images/cloud-logo.png';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/uploads/')) {
      return `${API_BASE}${url}`;
    }
    return url;
  }

  // =========================================================
  // TOAST NOTIFICATIONS & UTILS
  // =========================================================
  function showToast(message, isError = false) {
    if (!el.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast' + (isError ? ' error' : '');
    toast.innerHTML = `
      <span>${isError ? '⚠️' : '✓'}</span>
      <span>${escapeHTML(message)}</span>
    `;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
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

  // Expose global window API for inline onclick handlers
  window.adminApp = {
    viewClient,
    editClient: openClientModal,
    toggleStatus,
    promptDelete,
    editGallery: openGalleryModal,
    previewGallery: openGalleryPreview,
    toggleGalleryStatus,
    promptDeleteGallery
  };

})();
