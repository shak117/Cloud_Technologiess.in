// Cloud Technologies - Main Application Controller
// Full-Service Digital Agency & Cloud Solutions (WhatsApp: 8830464841)

const WHATSAPP_NUMBER = "918830464841";
const CLIENTS_STORAGE_KEY = "cloudtech_clients";

const DEFAULT_CLIENTS = [
  {
    id: "client-mama",
    name: "Mama Pedhewale",
    industry: "Heritage D2C E-Commerce",
    logo: "images/client-mama-pedhewale.png",
    link: "https://mamapedhewale.com",
    badge: "Satara Since 1948",
    active: true
  },
  {
    id: "client-knotberry",
    name: "knotberry.studios",
    industry: "Handmade Boutique & Lifestyle",
    logo: "images/client-knotberry.png",
    link: "https://knotberry.studios",
    badge: "Boutique & UI/UX",
    active: true
  }
];

const SERVICES_SCOPE = {
  "business-site": {
    name: "High-Impact Business Website",
    category: "Web Development & Cloud",
    tagline: "3–6 page fast corporate presence designed to turn visitors into inquiries.",
    highlights: [
      "Custom responsive design (mobile-first)",
      "Sub-1.5s loading speed on mobile",
      "Direct Click-to-WhatsApp & Lead Forms",
      "Free SSL Security & 24h Deployment"
    ],
    why: "Perfect for doctors, lawyers, consultants, local shops, and corporate firms needing a credible, modern online presence."
  },
  "ecommerce": {
    name: "Full-Scale Online Shopping Store",
    category: "E-Commerce Engineering",
    tagline: "High-capacity digital store with cart, checkout, UPI payments, and order tracking.",
    highlights: [
      "Full Shopping Cart + Smooth Checkout",
      "Zero-Timeout UPI (GPay/PhonePe) & Cards",
      "Live Google Maps Order Tracking",
      "Anti-Crash Shield for Diwali & Festival Rushes"
    ],
    why: "Perfect for retail shops, sweet stores (like Mama Pedhewale), clothing boutiques, and D2C brands selling products online."
  },
  "ui-ux": {
    name: "Custom UI/UX Design & Prototyping",
    category: "Design & Brand Experience",
    tagline: "Pixel-perfect mobile interfaces, user journey mapping, and Figma prototypes.",
    highlights: [
      "Interactive prototypes you test on your phone",
      "Conversion Rate Optimization (CRO)",
      "Design systems & typography palettes",
      "Frictionless user flow to consultation"
    ],
    why: "Perfect for ambitious brands that want to stand out from generic templates and provide an exceptional user experience."
  },
  "meta-ads": {
    name: "Meta Ads (Facebook & Instagram)",
    category: "Performance Growth & Paid Media",
    tagline: "Targeted advertising funnels designed to drive inquiries and direct sales.",
    highlights: [
      "Precision demographic & local targeting",
      "High-converting video reels & carousel copy",
      "100% accurate Pixel & Conversions API",
      "Full funnel retargeting & weekly reports"
    ],
    why: "Perfect for businesses wanting a steady, predictable flow of high-intent customer leads and online sales every week."
  },
  "cloud-hosting": {
    name: "Managed Cloud Infrastructure",
    category: "Tier-III Cloud Hosting",
    tagline: "High-speed solid-state cloud hosting, automated backups, and 99.9% uptime.",
    highlights: [
      "Sub-1.5s mobile loading SLA",
      "Free auto-renewing SSL green padlock",
      "Automated regular safe backups",
      "24-Hour rapid server & domain setup"
    ],
    why: "Perfect for mission-critical business websites and web applications that cannot afford downtime or slow speeds."
  },
  "retainer": {
    name: "Full-Stack Growth Partnership",
    category: "Dedicated Tech & Media Team",
    tagline: "All-in-one digital execution: Web development + UI/UX + Meta Ads + Cloud hosting.",
    highlights: [
      "Dedicated engineer & designer team",
      "Continuous feature updates & optimizations",
      "Active Meta Ads management & scaling",
      "Direct WhatsApp priority support line"
    ],
    why: "Perfect for high-growth businesses and brands wanting a complete in-house digital team without the overhead."
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Client Marquee
  initClientMarquee();

  // Interactive Service Matcher / Scope Finder
  initServiceMatcher();

  // Consultation Modal Handling
  initConsultationModal();

  // Mobile Menu Toggle
  initMobileMenu();

  // Gallery Filters
  initGalleryFilters();

  // Apply Live Config from Admin Panel
  applyLiveSiteConfig();
});

// -------------------------------------------------------------
// Gallery Filter Tabs Controller
// -------------------------------------------------------------
function initGalleryFilters() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryCards = document.querySelectorAll('.gallery-card');
  if (!filterBtns.length || !galleryCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter') || 'all';

      galleryCards.forEach(card => {
        const cat = card.getAttribute('data-category') || '';
        if (filter === 'all' || cat.split(' ').includes(filter)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// -------------------------------------------------------------
// Direct WhatsApp Link Helper
// -------------------------------------------------------------
window.chatOnWhatsApp = function(goalKey, customMessage) {
  let text = "";

  if (customMessage) {
    text = customMessage;
  } else if (goalKey && SERVICES_SCOPE[goalKey]) {
    const s = SERVICES_SCOPE[goalKey];
    text = `Hello Cloud Technologies! I am interested in your *${s.name}* (${s.category}) service for my business.

Please share details and how we can get started!`;
  } else {
    text = `Hello Cloud Technologies! I want to discuss digital services (Web Development, UI/UX, Meta Ads, Cloud Hosting) for my business. Please guide me.`;
  }

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
};

// -------------------------------------------------------------
// Priority Feature: Dynamic Client Collaborations Marquee
// -------------------------------------------------------------
function initClientMarquee() {
  const track = document.getElementById("clientsMarqueeTrack");
  if (!track) return;

  let clients = [];
  try {
    const stored = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!stored) {
      clients = DEFAULT_CLIENTS;
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(DEFAULT_CLIENTS));
    } else {
      clients = JSON.parse(stored);
      if (!Array.isArray(clients) || clients.length === 0) {
        clients = DEFAULT_CLIENTS;
      }
    }
  } catch(e) {
    clients = DEFAULT_CLIENTS;
  }

  const activeClients = clients.filter(c => c.active !== false);
  if (activeClients.length === 0) return;

  // Duplicate items 6 times to ensure a seamless looping horizontal marquee
  const repeatCount = Math.max(6, Math.ceil(12 / activeClients.length));
  let fullList = [];
  for (let i = 0; i < repeatCount; i++) {
    fullList = fullList.concat(activeClients);
  }

  track.innerHTML = fullList.map(c => `
    <a href="${c.link || 'javascript:void(0)'}" target="${c.link && c.link.startsWith('http') ? '_blank' : '_self'}" class="client-logo-card" title="${c.name} — ${c.industry}">
      ${c.logo ? `<img src="${c.logo}" alt="${c.name} Logo" class="client-logo-img" loading="lazy" />` : ''}
      <div>
        <span class="client-logo-name">${c.name}</span>
        ${c.badge ? `<span class="client-logo-badge">${c.badge}</span>` : ''}
      </div>
    </a>
  `).join("");
}

window.reloadClientMarquee = initClientMarquee;

// -------------------------------------------------------------
// Interactive Service Matcher (Quiz Style)
// -------------------------------------------------------------
function initServiceMatcher() {
  const buttons = document.querySelectorAll(".quiz-btn, .matcher-option-btn");
  const resultCard = document.getElementById("planFinderResult");

  if (!buttons.length || !resultCard) return;

  const showService = (goalKey) => {
    const s = SERVICES_SCOPE[goalKey] || SERVICES_SCOPE["business-site"];

    resultCard.innerHTML = `
      <div class="finder-rec-box">
        <div class="rec-badge" style="font-family:var(--font-heading); font-size:0.75rem; font-weight:700; color:var(--accent-gold); letter-spacing:0.06em; margin-bottom:0.4rem;">RECOMMENDED SOLUTION ROADMAP</div>
        <h3 class="rec-title" style="font-size:1.4rem; font-weight:800; margin-bottom:0.4rem;">${s.name}</h3>
        <p class="rec-tagline" style="color:var(--text-secondary); font-size:0.95rem; margin-bottom:1rem;">${s.tagline}</p>

        <div class="rec-highlights" style="display:flex; flex-direction:column; gap: 0.5rem; margin: 1.2rem 0;">
          ${s.highlights.map(h => `<div style="display:flex; align-items:center; gap:0.5rem; font-size:0.9rem;"><span style="color:var(--accent-gold); font-weight:bold;">✓</span> ${h}</div>`).join("")}
        </div>

        <p style="margin-bottom: 1.5rem; font-size:0.92rem; color:var(--text-secondary);">
          <strong style="color:var(--text-primary);">Why this fits your business:</strong> ${s.why}
        </p>

        <button class="btn-hero-primary" onclick="chatOnWhatsApp('${goalKey}')">
          Discuss ${s.name} on WhatsApp →
        </button>
      </div>
    `;
  };

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const goal = btn.getAttribute("data-goal");
      showService(goal);
    });
  });

  // Initial load
  showService("ecommerce");
}

// -------------------------------------------------------------
// Consultation Modal
// -------------------------------------------------------------
function initConsultationModal() {
  const modal = document.getElementById("consultationModal");
  const closeBtn = document.getElementById("modalCloseBtn");
  const form = document.getElementById("consultationModalForm");

  if (!modal) return;

  window.openConsultationModal = function(serviceKey) {
    const select = document.getElementById("projectTypeSelect") || document.getElementById("modalServiceSelect");
    if (select && serviceKey && serviceKey !== 'general') {
      select.value = serviceKey;
    }
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  };

  window.closeConsultationModal = function() {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
  };

  if (closeBtn) {
    closeBtn.addEventListener("click", window.closeConsultationModal);
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      window.closeConsultationModal();
    }
  });

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameEl = document.getElementById("clientName");
      const domainEl = document.getElementById("clientDomain");
      const serviceEl = document.getElementById("projectTypeSelect") || document.getElementById("modalServiceSelect");
      const phoneEl = document.getElementById("clientPhone");
      const notesEl = document.getElementById("clientNotes");

      const name = nameEl ? nameEl.value.trim() : "";
      const domain = domainEl ? domainEl.value.trim() : "";
      const service = serviceEl ? serviceEl.value : "General Consultation";
      const phone = phoneEl ? phoneEl.value.trim() : "";
      const notes = notesEl ? notesEl.value.trim() : "";

      const whatsappText = (
        `Hello Cloud Technologies!

` +
        `I would like to discuss a custom digital project:
` +
        `• Name: ${name || 'N/A'}
` +
        `• Services Required: ${service}
` +
        `• Existing Domain / Business: ${domain || 'New project'}
` +
        `• Contact Phone: ${phone || 'N/A'}
` +
        `• Project Goals: ${notes || 'Ready for strategy discussion'}

` +
        `Please share your availability for a consultation call!`
      );

      // Save lead locally for Admin Panel
      window.saveLeadToStorage({
        type: "Custom Proposal",
        name: name || "Anonymous Client",
        industry: service,
        phone: phone || "N/A",
        features: [service],
        notes: (domain ? `Domain: ${domain}. ` : "") + (notes || "")
      });

      chatOnWhatsApp(null, whatsappText);
      window.closeConsultationModal();
    });
  }
}

// -------------------------------------------------------------
// Mobile Menu Controller
// -------------------------------------------------------------
function initMobileMenu() {
  const toggleBtn = document.getElementById("mobileMenuToggle");
  const drawer = document.getElementById("mobileNavDrawer");
  const navMenu = document.getElementById("navLinks");

  window.toggleMobileMenu = function() {
    if (drawer) {
      drawer.classList.toggle("show");
    } else if (navMenu) {
      navMenu.classList.toggle("open");
    }
  };

  if (!toggleBtn) return;
  if (toggleBtn.dataset.boundMobileMenu) return;
  toggleBtn.dataset.boundMobileMenu = "true";

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    window.toggleMobileMenu();
  });

  document.querySelectorAll(".mobile-drawer-link").forEach(link => {
    link.addEventListener("click", () => {
      if (drawer) drawer.classList.remove("show");
      if (navMenu) navMenu.classList.remove("open");
    });
  });

  document.addEventListener("click", (e) => {
    if (drawer && drawer.classList.contains("show") && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
      drawer.classList.remove("show");
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (typeof window.closeDemoModal === "function") window.closeDemoModal();
    if (typeof window.closeConsultationModal === "function") window.closeConsultationModal();
    if (typeof window.closeServiceModal === "function") window.closeServiceModal();
    if (typeof window.closeGalleryModal === "function") window.closeGalleryModal();
    const drawer = document.getElementById("mobileNavDrawer");
    if (drawer) drawer.classList.remove("show");
  }
});

// Demo Modal Controller
window.openDemoModal = function() {
  const modal = document.getElementById("demoModal");
  if (modal) {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
};

window.closeDemoModal = function() {
  const modal = document.getElementById("demoModal");
  if (modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const demoModal = document.getElementById("demoModal");
  const demoForm = document.getElementById("demoModalForm");

  if (demoModal) {
    demoModal.addEventListener("click", (e) => {
      if (e.target === demoModal) {
        window.closeDemoModal();
      }
    });
  }

  if (demoForm) {
    demoForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = (document.getElementById("demoClientName") ? document.getElementById("demoClientName").value.trim() : "");
      const industry = (document.getElementById("demoIndustrySelect") ? document.getElementById("demoIndustrySelect").value : (document.getElementById("demoBusinessType") ? document.getElementById("demoBusinessType").value : "General"));
      const phone = (document.getElementById("demoClientPhone") ? document.getElementById("demoClientPhone").value.trim() : (document.getElementById("demoPhone") ? document.getElementById("demoPhone").value.trim() : ""));
      const notes = (document.getElementById("demoClientNotes") ? document.getElementById("demoClientNotes").value.trim() : (document.getElementById("demoNotes") ? document.getElementById("demoNotes").value.trim() : "N/A"));

      const selectedFeatures = [];
      document.querySelectorAll(".demo-feature-chk:checked").forEach(cb => {
        selectedFeatures.push(cb.value);
      });
      const featuresStr = selectedFeatures.length > 0 ? selectedFeatures.join(", ") : "Standard Custom Features";

      const message = (
        `Hello Cloud Technologies! 🚀

` +
        `I would like to book a Custom Demo Website as per my demand:
` +
        `• Name/Business: ${name}
` +
        `• Industry: ${industry}
` +
        `• Features Requested: ${featuresStr}
` +
        `• WhatsApp Number: ${phone}
` +
        `• Demand & Notes: ${notes}

` +
        `Please share details on when my demo will be ready!`
      );

      // Save lead locally for Admin Panel
      window.saveLeadToStorage({
        type: "Demo Booking",
        name: name || "Anonymous Client",
        industry: industry,
        phone: phone || "N/A",
        features: selectedFeatures,
        notes: notes || "Standard prototype demand"
      });

      window.open(`https://wa.me/918830464841?text=${encodeURIComponent(message)}`, "_blank");
      window.closeDemoModal();
    });
  }
});

// -------------------------------------------------------------
// Admin Integration Helpers
// -------------------------------------------------------------
window.saveLeadToStorage = function(leadData) {
  try {
    const LEADS_KEY = "cloudtech_leads";
    const existing = JSON.parse(localStorage.getItem(LEADS_KEY) || "[]");
    const newLead = {
      id: "REQ-" + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      status: "New",
      adminNotes: "",
      ...leadData
    };
    existing.unshift(newLead);
    localStorage.setItem(LEADS_KEY, JSON.stringify(existing));
    return newLead;
  } catch (e) {
    console.warn("Could not save lead locally:", e);
  }
};

function applyLiveSiteConfig() {
  try {
    const raw = localStorage.getItem("cloudtech_site_config");
    if (!raw) return;
    const cfg = JSON.parse(raw);
    if (!cfg) return;

    if (cfg.directPhone) {
      document.querySelectorAll("a[href^='tel:']").forEach(a => {
        a.href = "tel:+91" + cfg.directPhone.replace(/[^0-9]/g, "");
        a.textContent = "+91 " + cfg.directPhone;
      });
    }

    if (cfg.whatsappNumber) {
      const cleanWa = cfg.whatsappNumber.replace(/[^0-9]/g, "");
      document.querySelectorAll("a[href*='wa.me/']").forEach(a => {
        try {
          const url = new URL(a.href);
          const textParam = url.searchParams.get("text") || "";
          a.href = `https://wa.me/91${cleanWa}${textParam ? `?text=${encodeURIComponent(textParam)}` : ""}`;
        } catch(err) {}
      });
    }

    if (cfg.heroTitle) {
      const heroTitleEl = document.querySelector(".hero-title");
      if (heroTitleEl) {
        heroTitleEl.innerHTML = cfg.heroTitle;
      }
    }

    if (cfg.heroDesc) {
      const heroDescEl = document.querySelector(".hero-desc");
      if (heroDescEl) heroDescEl.textContent = cfg.heroDesc;
    }

    if (cfg.deliveryBadge) {
      document.querySelectorAll(".telemetry-badge").forEach(el => el.textContent = cfg.deliveryBadge);
    }
  } catch (e) {
    console.warn("Error applying live site config:", e);
  }
}
