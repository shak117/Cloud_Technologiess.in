/**
 * Cloud Technologies — Modern Client Experience & Core App Controller
 * Palette: Navy Blue, Royal Blue, Vibrant Cyan & Pure White
 */

const WHATSAPP_NUMBER = "918830464841";
const CLIENTS_STORAGE_KEY = "cloudtech_clients";

// Default Client Collaborations
const DEFAULT_CLIENTS = [
  {
    id: "c1",
    name: "SK Relax Beauty Academy & Salon",
    industry: "Beauty Academy & Salon",
    logo: "images/client-sk-relax.png",
    badge: "Satara",
    active: true
  },
  {
    id: "c2",
    name: "HIRAMOTI Catalogue",
    industry: "Catalogue & Collections",
    logo: "images/client-hiramoti.png",
    badge: "E-Catalogue",
    active: true
  },
  {
    id: "c3",
    name: "Mama Pedhewale – Traditional Sweets",
    industry: "Traditional Sweets Satara",
    logo: "images/client-mama-pedhewale.png",
    badge: "Since 1948",
    active: true
  },
  {
    id: "c4",
    name: "Mhaswadkar Machineries",
    industry: "Machineries Trading Co.",
    logo: "images/client-mhaswadkar.svg",
    badge: "Estd. 1982",
    active: true
  },
  {
    id: "c5",
    name: "Punita Collection",
    industry: "Ethnic & Western Boutique",
    logo: "images/client-punita.svg",
    badge: "Boutique",
    active: true
  }
];

// Scope Definitions
const SERVICES_SCOPE = {
  "web-dev": {
    name: "Website & Web Application Development",
    category: "Full-Stack Web Engineering",
    tagline: "High-performance, mobile-first web applications built for business conversion.",
    highlights: ["React, Next.js or Custom CMS", "Sub-1.5s Load Time SLA", "Zero-Timeout UPI Gateways", "Pincode & WhatsApp Ordering"]
  },
  "ecommerce": {
    name: "E-Commerce & Online Store Architecture",
    category: "High-Conversion E-Commerce",
    tagline: "Custom online storefronts engineered to process orders without crash or timeouts.",
    highlights: ["Diwali / Rush Hour Surge Shield", "1-Click WhatsApp Direct Checkout", "Custom Product Bundles Engine", "Live Inventory Telemetry"]
  },
  "ui-ux": {
    name: "Conversion UI/UX Design & Prototyping",
    category: "Design Systems & Visual Strategy",
    tagline: "Human-centered interfaces that guide visitors into qualified buyers.",
    highlights: ["Interactive Figma Prototypes", "Custom Design Tokens & Styleguides", "Frictionless Checkout UX", "Mobile Viewport First Fidelity"]
  },
  "meta-ads": {
    name: "Meta Ads & Performance Paid Growth",
    category: "Performance Acquisition",
    tagline: "Hyper-targeted Facebook & Instagram campaigns generating high-intent client inquiries.",
    highlights: ["Conversions API (CAPI) Tracking", "High-ROAS Direct-to-WhatsApp Ads", "Custom Audience Retargeting", "Weekly Transparent ROI Telemetry"]
  },
  "cloud-hosting": {
    name: "Managed Cloud Hosting & Infrastructure",
    category: "Cloud Operations & Security",
    tagline: "Sub-1.5s load speeds, 99.9% uptime SLA, and automated daily off-site backups.",
    highlights: ["NVMe SSD High-Speed Storage", "Global CDN Edge Caching", "Free Automated SSL Certificates", "24/7 Security & Server Telemetry"]
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Collaborations Carousel
  initCollaborationsCarousel();

  // Consultation Modal Handling
  initConsultationModal();

  // Mobile Menu Toggle
  initMobileMenu();

  // FAQ Accordion
  initFaqAccordion();

  // Apply Live Config from Admin Panel
  applyLiveSiteConfig();
});

// -------------------------------------------------------------
// Direct WhatsApp Link Helper
// -------------------------------------------------------------
window.chatOnWhatsApp = function(goalKey, customMessage) {
  let text = "";

  if (customMessage) {
    text = customMessage;
  } else if (goalKey && SERVICES_SCOPE[goalKey]) {
    const s = SERVICES_SCOPE[goalKey];
    text = `Hello Cloud Technologies! I am interested in your *${s.name}* (${s.category}) service for my business.\n\nPlease share details and how we can get started!`;
  } else {
    text = `Hello Cloud Technologies! I want to discuss digital solutions (Web Development, UI/UX, Meta Ads, Cloud Hosting) for my business. Please guide me.`;
  }

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
};

// -------------------------------------------------------------
// Collaborations Section: Horizontal Scrolling Carousel
// -------------------------------------------------------------
function initCollaborationsCarousel() {
  const wrapper = document.getElementById("collabTrackWrapper");
  const track = document.getElementById("collabTrack");
  const prevBtn = document.getElementById("collabPrevBtn");
  const nextBtn = document.getElementById("collabNextBtn");

  if (!wrapper || !track) return;

  let autoScrollTimer = null;
  const SCROLL_INTERVAL = 3000; // 3 seconds

  const getScrollStep = () => {
    const item = track.querySelector(".collab-item");
    return item ? (item.offsetWidth + 32) : 220;
  };

  const scrollNext = () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (track.scrollLeft >= maxScroll - 15) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      track.scrollBy({ left: getScrollStep(), behavior: "smooth" });
    }
  };

  const scrollPrev = () => {
    if (track.scrollLeft <= 15) {
      track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
    } else {
      track.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
    }
  };

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      scrollNext();
      restartTimer();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      scrollPrev();
      restartTimer();
    });
  }

  const startTimer = () => {
    if (!autoScrollTimer) {
      autoScrollTimer = setInterval(scrollNext, SCROLL_INTERVAL);
    }
  };

  const stopTimer = () => {
    if (autoScrollTimer) {
      clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
  };

  const restartTimer = () => {
    stopTimer();
    startTimer();
  };

  wrapper.addEventListener("mouseenter", stopTimer);
  wrapper.addEventListener("mouseleave", startTimer);
  wrapper.addEventListener("touchstart", stopTimer, { passive: true });
  wrapper.addEventListener("touchend", () => {
    setTimeout(startTimer, 1500);
  }, { passive: true });

  startTimer();
}

// -------------------------------------------------------------
// Consultation Modal Controller
// -------------------------------------------------------------
window.openConsultationModal = function(serviceType) {
  const modal = document.getElementById("consultationModal");
  const select = document.getElementById("projectTypeSelect");

  if (select && serviceType && serviceType !== "general") {
    select.value = serviceType;
  }

  if (modal) {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
};

window.closeConsultationModal = function() {
  const modal = document.getElementById("consultationModal");
  if (modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
  }
};

function initConsultationModal() {
  const modal = document.getElementById("consultationModal");
  const form = document.getElementById("consultationModalForm");

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        window.closeConsultationModal();
      }
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = (document.getElementById("clientName") ? document.getElementById("clientName").value.trim() : "");
      const service = (document.getElementById("projectTypeSelect") ? document.getElementById("projectTypeSelect").value : "Web Development");
      const phone = (document.getElementById("clientPhone") ? document.getElementById("clientPhone").value.trim() : "");
      const notes = (document.getElementById("clientNotes") ? document.getElementById("clientNotes").value.trim() : "");

      const whatsappText = (
        `Hello Cloud Technologies!\n\n` +
        `I would like to request a quote / proposal for my business:\n` +
        `• Name/Business: ${name || 'N/A'}\n` +
        `• Service: ${service}\n` +
        `• Phone/WhatsApp: ${phone || 'N/A'}\n` +
        `• Project Notes: ${notes || 'Ready to discuss requirements'}\n\n` +
        `Please share pricing and details at your earliest convenience!`
      );

      // Save lead locally for Admin Panel
      window.saveLeadToStorage({
        type: "Project Quote",
        name: name || "Anonymous Client",
        industry: service,
        phone: phone || "N/A",
        features: [service],
        notes: notes || "Direct quote inquiry"
      });

      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`, "_blank");
      window.closeConsultationModal();
    });
  }
}

// -------------------------------------------------------------
// Demo Modal Controller
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// Intro Video Modal Controller
// -------------------------------------------------------------
window.openIntroModal = function() {
  const modal = document.getElementById("introModal");
  if (modal) {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
};

window.closeIntroModal = function() {
  const modal = document.getElementById("introModal");
  if (modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
  }
};

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

// -------------------------------------------------------------
// FAQ Accordion
// -------------------------------------------------------------
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    item.addEventListener("click", () => {
      item.classList.toggle("active");
    });
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (typeof window.closeDemoModal === "function") window.closeDemoModal();
    if (typeof window.closeConsultationModal === "function") window.closeConsultationModal();
    if (typeof window.closeIntroModal === "function") window.closeIntroModal();
    const drawer = document.getElementById("mobileNavDrawer");
    if (drawer) drawer.classList.remove("show");
  }
});

// Demo Form Handler
document.addEventListener("DOMContentLoaded", () => {
  const demoModal = document.getElementById("demoModal");
  const demoForm = document.getElementById("demoModalForm");
  const introModal = document.getElementById("introModal");

  if (demoModal) {
    demoModal.addEventListener("click", (e) => {
      if (e.target === demoModal) window.closeDemoModal();
    });
  }

  if (introModal) {
    introModal.addEventListener("click", (e) => {
      if (e.target === introModal) window.closeIntroModal();
    });
  }

  if (demoForm) {
    demoForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = (document.getElementById("demoClientName") ? document.getElementById("demoClientName").value.trim() : "");
      const industry = (document.getElementById("demoIndustrySelect") ? document.getElementById("demoIndustrySelect").value : "General");
      const phone = (document.getElementById("demoClientPhone") ? document.getElementById("demoClientPhone").value.trim() : "");
      const notes = (document.getElementById("demoClientNotes") ? document.getElementById("demoClientNotes").value.trim() : "N/A");

      const selectedFeatures = [];
      document.querySelectorAll(".demo-feature-chk:checked").forEach(cb => {
        selectedFeatures.push(cb.value);
      });
      const featuresStr = selectedFeatures.length > 0 ? selectedFeatures.join(", ") : "Standard Custom Features";

      const message = (
        `Hello Cloud Technologies! 🚀\n\n` +
        `I would like to book a Custom Demo Website as per my demand:\n` +
        `• Name/Business: ${name}\n` +
        `• Industry: ${industry}\n` +
        `• Features: ${featuresStr}\n` +
        `• WhatsApp: ${phone}\n` +
        `• Notes: ${notes}\n\n` +
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

      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
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
  } catch (e) {
    console.warn("Error applying live site config:", e);
  }
}
