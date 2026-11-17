/**
 * Cloud Technologies — Core Application & Live CMS Portfolio Controller
 * Founder: Shashank Pawar | Satara, Maharashtra
 * Direct WhatsApp: +91 8830464841
 */

const WHATSAPP_NUMBER = "918830464841";
const LEADS_STORAGE_KEY = "cloudtech_leads";

document.addEventListener("DOMContentLoaded", () => {
  // Ensure normal vertical scrolling is active on page load
  document.body.classList.remove("menu-open");
  document.body.style.overflow = "";

  initLeadForm();
  initMobileMenu();
  initSmoothScroll();
  initDynamicPortfolio();
});

// -------------------------------------------------------------
// 1. Smooth Scroll Helper for In-Page Navigation
// -------------------------------------------------------------
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#' || targetId === '#!' || !targetId.startsWith('#')) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.closeMobileMenu) window.closeMobileMenu();
      }
    });
  });
}

// -------------------------------------------------------------
// 2. Service Preselection & Smooth Scroll Helper
// -------------------------------------------------------------
window.preselectServiceAndScroll = function(serviceName) {
  const select = document.getElementById("clientService");
  if (select && serviceName) {
    for (let i = 0; i < select.options.length; i++) {
      const optVal = select.options[i].value.toLowerCase();
      const targetVal = serviceName.toLowerCase();
      if (optVal.includes(targetVal) || targetVal.includes(optVal)) {
        select.selectedIndex = i;
        break;
      }
    }
  }

  const contactSection = document.getElementById("contact");
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      const nameInput = document.getElementById("clientName");
      if (nameInput) nameInput.focus();
    }, 450);
  }
};

// -------------------------------------------------------------
// 3. Lead Generation Form Handler (Validation + Storage + WhatsApp)
// -------------------------------------------------------------
let lastSubmitTime = 0;

function initLeadForm() {
  const form = document.getElementById("leadGenerationForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Anti-Spam Check 1: Honeypot field (bots fill hidden fields)
    const honeypot = document.getElementById("formHoneypot");
    if (honeypot && honeypot.value.trim() !== "") {
      console.warn("Spam submission blocked.");
      return;
    }

    // Anti-Spam Check 2: Submission debounce (min 4 seconds between submits)
    const now = Date.now();
    if (now - lastSubmitTime < 4000) {
      alert("Please wait a moment before submitting again.");
      return;
    }

    const nameInput = document.getElementById("clientName");
    const phoneInput = document.getElementById("clientPhone");
    const serviceSelect = document.getElementById("clientService");
    const reqTextarea = document.getElementById("clientRequirements");

    const grpName = document.getElementById("grpName");
    const grpPhone = document.getElementById("grpPhone");
    const grpService = document.getElementById("grpService");
    const grpRequirements = document.getElementById("grpRequirements");

    // Reset error states
    [grpName, grpPhone, grpService, grpRequirements].forEach(g => {
      if (g) g.classList.remove("has-error");
    });

    let isValid = true;

    // Validate Name
    const nameVal = nameInput ? nameInput.value.trim() : "";
    if (nameVal.length < 2) {
      if (grpName) grpName.classList.add("has-error");
      isValid = false;
    }

    // Validate Mobile Number (10 digits)
    const rawPhone = phoneInput ? phoneInput.value.replace(/[^0-9]/g, "") : "";
    if (rawPhone.length !== 10) {
      if (grpPhone) grpPhone.classList.add("has-error");
      isValid = false;
    }

    // Validate Service
    const serviceVal = serviceSelect ? serviceSelect.value : "";
    if (!serviceVal) {
      if (grpService) grpService.classList.add("has-error");
      isValid = false;
    }

    // Validate Requirements
    const reqVal = reqTextarea ? reqTextarea.value.trim() : "";
    if (reqVal.length < 5) {
      if (grpRequirements) grpRequirements.classList.add("has-error");
      isValid = false;
    }

    if (!isValid) {
      const firstErr = document.querySelector(".form-group.has-error");
      if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    lastSubmitTime = now;

    // Create Lead Record
    const lead = {
      id: "LEAD-" + Math.floor(100000 + Math.random() * 900000),
      name: nameVal,
      phone: rawPhone,
      service: serviceVal,
      type: serviceVal,
      requirements: reqVal,
      notes: reqVal,
      createdAt: new Date().toISOString(),
      status: "New",
      adminNotes: "Received via Website Lead Form."
    };

    // Save to localStorage backend backup
    try {
      const existing = localStorage.getItem(LEADS_STORAGE_KEY) || "[]";
      const list = JSON.parse(existing);
      list.unshift(lead);
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.warn("Storage error saving lead:", err);
    }

    // Build Form-to-WhatsApp Message
    const waMessage = `Hello Cloud Technologies,\n\nI would like to discuss a project.\n\nName: ${lead.name}\nMobile: ${lead.phone}\nService: ${lead.service}\nRequirements: ${lead.requirements}\n\nPlease contact me regarding this enquiry.`;
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

    // Show Submission Feedback Modal
    const modal = document.getElementById("leadModalOverlay");
    const nameSpan = document.getElementById("modalCustomerName");
    const waBtn = document.getElementById("modalWhatsAppBtn");

    if (nameSpan) nameSpan.textContent = lead.name;
    if (waBtn) waBtn.href = waUrl;
    if (modal) modal.style.display = "flex";

    // Reset Form
    form.reset();
  });
}

window.closeSubmissionModal = function() {
  const modal = document.getElementById("leadModalOverlay");
  if (modal) modal.style.display = "none";
};

// -------------------------------------------------------------
// 4. Mobile Navigation Menu
// -------------------------------------------------------------
function initMobileMenu() {
  const toggleBtn = document.getElementById("mobileMenuToggle");
  const drawer = document.getElementById("mobileNavDrawer");
  const backdrop = document.getElementById("mobileNavBackdrop");
  if (!toggleBtn || !drawer) return;

  function openMenu() {
    drawer.classList.add("open");
    if (backdrop) backdrop.classList.add("open");
    document.body.classList.add("menu-open");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    drawer.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
    document.body.classList.remove("menu-open");
    document.body.style.overflow = "";
  }

  window.openMobileMenu = openMenu;
  window.closeMobileMenu = closeMenu;

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (drawer.classList.contains("open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (backdrop) {
    backdrop.addEventListener("click", closeMenu);
  }

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open")) {
      closeMenu();
    }
  });
}

// -------------------------------------------------------------
// 5. Automatic Horizontal Client Logo Carousel (3s Interval + Arrows)
// -------------------------------------------------------------
// 5. Dynamic Client Showcase — 3D Depth Carousel & Shuffle
// -------------------------------------------------------------
let showcaseAutoplayTimer = null;
let currentShowcaseIndex = 0;
// Global robust fallback for client showcase & portfolio covers
function handleCoverError(img, clientId) {
  if (!img) return;
  img.onerror = null;
  const fallbacks = {
    'client-sk-relax': 'images/sk-relax-showcase.png',
    'gallery-sk-relax': 'images/sk-relax-showcase.png',
    'client-hiramoti': 'images/hiramoti-showcase.png',
    'gallery-hiramoti': 'images/hiramoti-showcase.png',
    'client-mahajan': 'images/mahajan-hospital-showcase.png',
    'gallery-mahajan': 'images/mahajan-hospital-showcase.png',
    'client-knotberry-creations-592': 'images/knotberry-studios.png',
    'gallery-knotberry': 'images/knotberry-studios.png',
    'gallery-billing-software': 'images/billing-software-preview.png'
  };
  if (clientId && fallbacks[clientId]) {
    img.src = fallbacks[clientId];
    return;
  }
  const alt = (img.alt || '').toLowerCase();
  const src = (img.src || '').toLowerCase();
  if (alt.includes('sk relax') || src.includes('sk-relax')) {
    img.src = 'images/sk-relax-showcase.png';
  } else if (alt.includes('hiramoti') || src.includes('hiramoti')) {
    img.src = 'images/hiramoti-showcase.png';
  } else if (alt.includes('mahajan') || src.includes('mahajan')) {
    img.src = 'images/mahajan-hospital-showcase.png';
  } else if (alt.includes('knotberry') || src.includes('knotberry')) {
    img.src = 'images/knotberry-studios.png';
  } else {
    img.src = 'images/billing-software-preview.png';
  }
}
window.handleCoverError = handleCoverError;

let showcaseClients = [];

function initDynamicClientShowcase(clientsList) {
  const track = document.getElementById("clientShowcaseTrack");
  const viewport = document.getElementById("clientShowcaseViewport");
  const prevBtn = document.getElementById("clientShowcasePrev");
  const nextBtn = document.getElementById("clientShowcaseNext");
  const shuffleBtn = document.getElementById("btnShuffleClients");
  const dotsContainer = document.getElementById("clientShowcaseDots");

  if (!track || !viewport) return;

  function resolveAssetUrl(url) {
    if (!url) return 'images/cloud-logo.png';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    if (url.includes('client-sk-relax') || url.includes('logo-sk-relax')) return 'images/client-sk-relax.png';
    if (url.includes('client-hiramoti') || url.includes('logo-hiramoti')) return 'images/client-hiramoti.png';
    if (url.includes('091954') || url.includes('sk-relax-showcase')) return 'images/sk-relax-showcase.png';
    if (url.includes('092029') || url.includes('hiramoti-showcase')) return 'images/hiramoti-showcase.png';
    const apiBase = (window.CLOUD_CONFIG && window.CLOUD_CONFIG.apiUrl ? window.CLOUD_CONFIG.apiUrl : '').replace(/\/$/, '');
    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
      const barePath = url.replace(/^\/+/, '');
      return apiBase ? `${apiBase}/${barePath}` : barePath;
    }
    return url.replace(/^\/+/, '');
  }

  // Filter genuine published clients and deduplicate
  const seen = new Set();
  showcaseClients = [];

  if (Array.isArray(clientsList) && clientsList.length > 0) {
    clientsList.forEach(c => {
      const nameKey = (c.client_name || c.name || '').trim().toLowerCase();
      if (!seen.has(nameKey) && (c.publish_status === 'published' || !c.publish_status)) {
        seen.add(nameKey);
        showcaseClients.push(c);
      }
    });
  }

  // Fallback if list empty
  if (showcaseClients.length === 0 && window.INITIAL_PORTFOLIO_CLIENTS) {
    showcaseClients = window.INITIAL_PORTFOLIO_CLIENTS.filter(c => c.publish_status === 'published' || !c.publish_status);
  }

  if (showcaseClients.length === 0) {
    track.innerHTML = '<div style="padding: 2rem; color: #64748B;">No featured client projects available at this time.</div>';
    return;
  }

  // Render cards
  track.innerHTML = showcaseClients.map((client, index) => {
    const name = client.client_name || client.name || 'Featured Client';
    const logoSrc = resolveAssetUrl(client.logo_url || client.logo);
    const coverSrc = resolveAssetUrl(client.cover_image_url || (client.project_images && client.project_images[0]) || 'images/billing-software-preview.png');
    const industry = client.industry || 'Digital Solutions';
    const desc = client.project_description || client.description || 'High-performance digital solution engineered for measurable business impact.';
    
    // Services pills
    let services = [];
    if (Array.isArray(client.services)) services = client.services;
    else if (typeof client.services === 'string' && client.services) {
      try { services = JSON.parse(client.services); } catch(e) { services = client.services.split(',').map(s=>s.trim()); }
    }
    const servicesHtml = services.slice(0, 3).map(s => `<span class="showcase-service-tag">${escapeHtml(s)}</span>`).join('');

    const waText = encodeURIComponent(`Hello Cloud Technologies, I saw your work for ${name} in your featured client showcase and want to discuss a similar project.`);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;

    return `
      <article class="showcase-client-card" data-index="${index}">
        <div class="showcase-card-cover">
          <img src="${escapeHtml(coverSrc)}" alt="${escapeHtml(name)} Project Preview" loading="lazy" onerror="handleCoverError(this, '${escapeHtml(client.id)}')">
          <span class="showcase-featured-badge">★ Featured Project</span>
        </div>
        <div class="showcase-card-body">
          <div class="showcase-identity-row">
            <div class="showcase-brand-avatar">
              <img src="${escapeHtml(logoSrc)}" alt="${escapeHtml(name)} Logo" onerror="this.src='images/cloud-logo.png'">
            </div>
            <div>
              <span class="showcase-industry-pill">${escapeHtml(industry)}</span>
              <h3 class="showcase-client-name">${escapeHtml(name)}</h3>
            </div>
          </div>
          ${servicesHtml ? `<div class="showcase-services-row">${servicesHtml}</div>` : ''}
          <p class="showcase-desc">${escapeHtml(desc)}</p>
          <div class="showcase-card-footer">
            <a href="${client.website_url || waUrl}" target="_blank" rel="noopener" class="btn-showcase-view" title="View project details">
              <span>View Project</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
            <a href="${waUrl}" target="_blank" rel="noopener" class="btn-showcase-wa" title="Discuss on WhatsApp">
              <span>WhatsApp Chat →</span>
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Render pagination dots
  if (dotsContainer) {
    dotsContainer.innerHTML = showcaseClients.map((_, i) => 
      `<button type="button" class="client-showcase-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>`
    ).join('');

    dotsContainer.querySelectorAll('.client-showcase-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = Number(dot.getAttribute('data-index'));
        goToSlide(idx);
        restartAutoplay();
      });
    });
  }

  // Update layout position and highlight active card with 3D depth & scale
  function updateShowcasePosition(animate = true) {
    const cards = Array.from(track.querySelectorAll('.showcase-client-card'));
    if (cards.length === 0) return;

    if (currentShowcaseIndex < 0) currentShowcaseIndex = cards.length - 1;
    if (currentShowcaseIndex >= cards.length) currentShowcaseIndex = 0;

    const viewportWidth = viewport.clientWidth;
    const cardEl = cards[currentShowcaseIndex];
    if (!cardEl) return;
    const cardWidth = cardEl.offsetWidth;
    const cardLeft = cardEl.offsetLeft;

    // Calculate center offset
    const targetOffset = (viewportWidth / 2) - (cardLeft + cardWidth / 2);

    track.style.transition = animate ? 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
    track.style.transform = `translateX(${targetOffset}px)`;

    // Update classes: active card gets scale 1.04, glowing border; adjacent cards get scale 0.93 & partial opacity
    cards.forEach((c, idx) => {
      c.classList.remove('active', 'adjacent');
      if (idx === currentShowcaseIndex) {
        c.classList.add('active');
      } else if (Math.abs(idx - currentShowcaseIndex) === 1 || (currentShowcaseIndex === 0 && idx === cards.length - 1) || (currentShowcaseIndex === cards.length - 1 && idx === 0)) {
        c.classList.add('adjacent');
      }
    });

    // Update dots
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.client-showcase-dot').forEach((d, idx) => {
        if (idx === currentShowcaseIndex) d.classList.add('active');
        else d.classList.remove('active');
      });
    }
  }

  function goToSlide(index, animate = true) {
    currentShowcaseIndex = index;
    updateShowcasePosition(animate);
  }

  function advanceNext() {
    goToSlide((currentShowcaseIndex + 1) % showcaseClients.length, true);
  }

  function advancePrev() {
    goToSlide((currentShowcaseIndex - 1 + showcaseClients.length) % showcaseClients.length, true);
  }

  // Click on any card directly to center it
  track.querySelectorAll('.showcase-client-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a') || e.target.closest('button')) return;
      const idx = Number(card.getAttribute('data-index'));
      if (idx !== currentShowcaseIndex) {
        goToSlide(idx);
        restartAutoplay();
      }
    });
  });

  // Autoplay functionality
  function startAutoplay() {
    stopAutoplay();
    showcaseAutoplayTimer = setInterval(advanceNext, 4000);
  }

  function stopAutoplay() {
    if (showcaseAutoplayTimer) {
      clearInterval(showcaseAutoplayTimer);
      showcaseAutoplayTimer = null;
    }
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Navigation Arrows
  if (prevBtn) {
    prevBtn.onclick = () => {
      advancePrev();
      restartAutoplay();
    };
  }
  if (nextBtn) {
    nextBtn.onclick = () => {
      advanceNext();
      restartAutoplay();
    };
  }

  // Shuffle Interaction (Deterministic, reveals new clients without duplicates or data loss)
  if (shuffleBtn) {
    shuffleBtn.onclick = () => {
      stopAutoplay();
      track.classList.add('shuffling');

      setTimeout(() => {
        const jump = Math.max(1, Math.floor(showcaseClients.length / 2));
        currentShowcaseIndex = (currentShowcaseIndex + jump) % showcaseClients.length;
        updateShowcasePosition(false);
        track.classList.remove('shuffling');
        updateShowcasePosition(true);
        startAutoplay();
      }, 250);
    };
  }

  // Hover Pause & Resume
  viewport.addEventListener('mouseenter', stopAutoplay);
  viewport.addEventListener('mouseleave', startAutoplay);

  // Mobile Touch Gestures (Swipe friendly)
  let touchStartX = 0;
  let touchDeltaX = 0;
  let isSwiping = false;

  viewport.addEventListener('touchstart', (e) => {
    stopAutoplay();
    isSwiping = true;
    touchStartX = e.touches[0].clientX;
    touchDeltaX = 0;
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    touchDeltaX = e.touches[0].clientX - touchStartX;
  }, { passive: true });

  viewport.addEventListener('touchend', () => {
    if (!isSwiping) return;
    isSwiping = false;
    if (touchDeltaX < -40) {
      advanceNext();
    } else if (touchDeltaX > 40) {
      advancePrev();
    } else {
      updateShowcasePosition(true);
    }
    startAutoplay();
  });

  // Handle Resize smoothly
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateShowcasePosition(false);
    }, 100);
  });

  // Initial draw & launch
  setTimeout(() => {
    updateShowcasePosition(false);
    startAutoplay();
  }, 100);
}

function initClientCarousel(clientsList) {
  initDynamicClientShowcase(clientsList);
}

// -------------------------------------------------------------
// 6. Dynamic Live Portfolio CMS Integration
// -------------------------------------------------------------
let allPublishedClients = [];
let currentPortfolioFilter = 'all';

async function initDynamicPortfolio() {
  const grid = document.getElementById("portfolioDynamicGrid");
  const filterBar = document.getElementById("portfolioFilterBar");
  if (!grid) return;

  // 1. Fetch from live REST API or fall back to bundled seed data
  let clients = [];
  const apiBase = window.CLOUD_CONFIG ? window.CLOUD_CONFIG.apiUrl : "";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${apiBase}/api/portfolio?_t=${Date.now()}`, {
      headers: { "Accept": "application/json" },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        clients = json.data;
      }
    }
  } catch (err) {
    console.info("Backend API connecting or offline. Using bundled portfolio dataset.", err.message);
  }

  // Resilient fallback if API failed or returned 0
  if (!clients || clients.length === 0) {
    if (window.INITIAL_PORTFOLIO_CLIENTS && window.INITIAL_PORTFOLIO_CLIENTS.length > 0) {
      clients = window.INITIAL_PORTFOLIO_CLIENTS.filter(c => c.publish_status === "published");
    }
  }

  // Ensure published status
  allPublishedClients = (clients || []).filter(c => c.publish_status === "published" || !c.publish_status);

  // Sort: Featured first, then display_order ascending
  allPublishedClients.sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return (a.display_order || 99) - (b.display_order || 99);
  });

  // 2. Sync Client Logo Carousel with all genuine published clients
  initClientCarousel(allPublishedClients);

  // 3. Render Filter Bar
  renderPortfolioFilterBar(filterBar);

  // 4. Render Portfolio Grid
  renderPortfolioGrid(grid, allPublishedClients);
}

function renderPortfolioFilterBar(container) {
  if (!container) return;

  // Extract unique industries
  const industries = new Set();
  allPublishedClients.forEach(c => {
    if (c.industry) industries.add(c.industry.trim());
  });

  const sortedIndustries = Array.from(industries).sort();

  let html = `
    <button class="portfolio-filter-btn ${currentPortfolioFilter === 'all' ? 'active' : ''}" data-filter="all">
      All Solutions <span class="filter-count">${allPublishedClients.length}</span>
    </button>
  `;

  sortedIndustries.forEach(ind => {
    const count = allPublishedClients.filter(c => c.industry && c.industry.trim() === ind).length;
    const isActive = currentPortfolioFilter === ind ? 'active' : '';
    html += `
      <button class="portfolio-filter-btn ${isActive}" data-filter="${escapeHtml(ind)}">
        ${escapeHtml(ind)} <span class="filter-count">${count}</span>
      </button>
    `;
  });

  container.innerHTML = html;

  // Attach filter click handlers
  container.querySelectorAll(".portfolio-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".portfolio-filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentPortfolioFilter = btn.getAttribute("data-filter");
      filterAndRenderPortfolio();
    });
  });
}

function filterAndRenderPortfolio() {
  const grid = document.getElementById("portfolioDynamicGrid");
  if (!grid) return;

  let filtered = allPublishedClients;
  if (currentPortfolioFilter && currentPortfolioFilter !== 'all') {
    filtered = allPublishedClients.filter(c => c.industry && c.industry.trim() === currentPortfolioFilter);
  }

  renderPortfolioGrid(grid, filtered);
}

function renderPortfolioGrid(container, list) {
  if (!container) return;

  if (!list || list.length === 0) {
    container.innerHTML = `
      <div class="portfolio-empty-state">
        <h4>No Projects Found In This Category</h4>
        <p>Explore other industries or contact us to build a tailored solution for your business.</p>
        <button class="portfolio-filter-btn" style="margin-top: 1rem; display: inline-flex;" onclick="resetPortfolioFilter()">
          View All Solutions
        </button>
      </div>
    `;
    return;
  }

  function resolveAssetUrl(url) {
    if (!url) return 'images/cloud-logo.png';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    if (url.includes('client-sk-relax') || url.includes('logo-sk-relax')) return 'images/client-sk-relax.png';
    if (url.includes('client-hiramoti') || url.includes('logo-hiramoti')) return 'images/client-hiramoti.png';
    if (url.includes('091954') || url.includes('sk-relax-showcase')) return 'images/sk-relax-showcase.png';
    if (url.includes('092029') || url.includes('hiramoti-showcase')) return 'images/hiramoti-showcase.png';
    const apiBase = (window.CLOUD_CONFIG && window.CLOUD_CONFIG.apiUrl ? window.CLOUD_CONFIG.apiUrl : '').replace(/\/$/, '');
    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
      const barePath = url.replace(/^\/+/, '');
      return apiBase ? `${apiBase}/${barePath}` : barePath;
    }
    return url.replace(/^\/+/, '');
  }

  container.innerHTML = list.map(client => {
    // Resolve logo and project cover URLs
    const logoSrc = resolveAssetUrl(client.logo_url);
    const coverSrc = client.cover_image_url ? resolveAssetUrl(client.cover_image_url) : (client.project_images && client.project_images.length > 0 ? resolveAssetUrl(client.project_images[0]) : null);

    const coverHtml = coverSrc ? `
      <div class="project-cover-box">
        <img src="${escapeHtml(coverSrc)}" alt="${escapeHtml(client.client_name)} Showcase" class="project-cover-img" loading="lazy" onerror="handleCoverError(this, '${escapeHtml(client.id)}')">
      </div>
    ` : `
      <div class="project-cover-box placeholder">
        <div class="project-cover-placeholder-glow"></div>
      </div>
    `;

    // Resolve services array
    let servicesArr = [];
    if (Array.isArray(client.services)) {
      servicesArr = client.services;
    } else if (typeof client.services === "string" && client.services.trim()) {
      try {
        const parsed = JSON.parse(client.services);
        if (Array.isArray(parsed)) servicesArr = parsed;
        else servicesArr = client.services.split(",").map(s => s.trim());
      } catch (e) {
        servicesArr = client.services.split(",").map(s => s.trim());
      }
    }

    const servicesHtml = servicesArr.slice(0, 3).map(s => 
      `<span class="service-pill-tag">${escapeHtml(s)}</span>`
    ).join("");

    // Build prefilled WhatsApp message for this specific client project
    const waText = encodeURIComponent(`Hello Cloud Technologies, I saw your work for ${client.client_name} and would like to discuss a similar project for my business.`);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;

    // Website link button if URL provided
    const websiteBtn = client.website_url ? `
      <a href="${escapeHtml(client.website_url)}" target="_blank" rel="noopener" class="btn-project-link" title="Visit Live Website">
        Visit Website ↗
      </a>
    ` : '';

    const featuredBadge = client.is_featured ? `
      <div class="project-card-featured-badge">★ Featured</div>
    ` : '';

    return `
      <div class="project-card" data-id="${escapeHtml(client.id || '')}">
        ${featuredBadge}
        ${coverHtml}
        <div class="project-info-body">
          <div class="project-identity-row">
            <div class="project-brand-avatar">
              <img src="${escapeHtml(logoSrc)}" alt="${escapeHtml(client.client_name)} Logo" class="project-badge-logo" onerror="this.src='images/cloud-logo.png'">
            </div>
            <div>
              <span class="project-industry-tag">${escapeHtml(client.industry || 'Business Solutions')}</span>
              <h3 class="project-client-name">${escapeHtml(client.client_name)}</h3>
            </div>
          </div>
          
          ${servicesHtml ? `<div class="project-services-pills">${servicesHtml}</div>` : ''}

          <p class="project-solution-desc">
            ${escapeHtml(client.project_description || 'High-performance digital solution engineered for measurable business growth.')}
          </p>

          <div class="project-actions-row">
            ${websiteBtn}
            <a href="${waUrl}" target="_blank" rel="noopener" class="btn-project-wa" title="Discuss a project like this on WhatsApp">
              <svg viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.587 1.838.934 2.802.934 3.181 0 5.767-2.587 5.767-5.766.001-3.187-2.575-5.77-5.773-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.155.57 4.178 1.564 5.927l-1.664 6.073 6.223-1.632c1.701.928 3.655 1.458 5.733 1.458 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z"/></svg>
              Discuss Similar Project →
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

window.resetPortfolioFilter = function() {
  currentPortfolioFilter = 'all';
  const filterBar = document.getElementById("portfolioFilterBar");
  if (filterBar) {
    filterBar.querySelectorAll(".portfolio-filter-btn").forEach(b => {
      if (b.getAttribute("data-filter") === "all") b.classList.add("active");
      else b.classList.remove("active");
    });
  }
  filterAndRenderPortfolio();
};

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
