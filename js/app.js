// Cloud Technologies - Main Application Controller
// Full-Service Digital Agency & Cloud Solutions (WhatsApp: 8830464841)

const WHATSAPP_NUMBER = "918830464841";

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
  // Interactive Service Matcher / Scope Finder
  initServiceMatcher();

  // Consultation Modal Handling
  initConsultationModal();

  // Mobile Menu Toggle
  initMobileMenu();

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
    text = `Hello Cloud Technologies! I want to discuss digital services (Web Development, UI/UX, Meta Ads, Cloud Hosting) for my business. Please guide me.`;
  }

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
};

// -------------------------------------------------------------
// Interactive Service Matcher (Quiz Style)
// -------------------------------------------------------------
function initServiceMatcher() {
  const buttons = document.querySelectorAll(".quiz-btn");
  const resultCard = document.getElementById("planFinderResult");

  if (!buttons || !resultCard) return;

  const showService = (goalKey) => {
    const s = SERVICES_SCOPE[goalKey] || SERVICES_SCOPE["business-site"];

    resultCard.innerHTML = `
      <div class="finder-rec-box">
        <div class="rec-badge">RECOMMENDED SOLUTION ROADMAP</div>
        <h3 class="rec-title">${s.name}</h3>
        <p class="rec-tagline">${s.tagline}</p>

        <div class="rec-highlights" style="grid-template-columns: 1fr; gap: 0.5rem; margin: 1.2rem 0;">
          ${s.highlights.map(h => `<div class="rec-pill" style="display:flex; align-items:center; gap:0.5rem;"><span style="color:var(--accent-teal); font-weight:bold;">✓</span> ${h}</div>`).join("")}
        </div>

        <p class="rec-explanation" style="margin-bottom: 1.5rem;">
          <strong>Why this fits your business:</strong> ${s.why}
        </p>

        <button class="btn-rec-whatsapp" onclick="chatOnWhatsApp('${goalKey}')">
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
    const select = document.getElementById("modalServiceSelect");
    if (select && serviceKey) {
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
      const name = document.getElementById("clientName").value.trim();
      const domain = document.getElementById("clientDomain").value.trim();
      const service = document.getElementById("modalServiceSelect").value;
      const phone = document.getElementById("clientPhone").value.trim();
      const notes = document.getElementById("clientNotes").value.trim();

      const whatsappText = (
        `Hello Cloud Technologies!\n\n` +
        `I would like to discuss a custom digital project:\n` +
        `• Name: ${name || 'N/A'}\n` +
        `• Services Required: ${service}\n` +
        `• Existing Domain / Business: ${domain || 'New project'}\n` +
        `• Contact Phone: ${phone || 'N/A'}\n` +
        `• Project Goals: ${notes || 'Ready for strategy discussion'}\n\n` +
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
// Mobile Menu
// -------------------------------------------------------------
function initMobileMenu() {
  const toggleBtn = document.getElementById("mobileMenuToggle");
  const navMenu = document.getElementById("navLinks");

  if (!toggleBtn || !navMenu) return;

  if (toggleBtn.dataset.boundMobileMenu) return;
  toggleBtn.dataset.boundMobileMenu = "true";

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navMenu.classList.toggle("open");
  });

  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
    });
  });

  document.addEventListener("click", (e) => {
    if (navMenu.classList.contains("open") && !navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
      navMenu.classList.remove("open");
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (typeof window.closeDemoModal === "function") window.closeDemoModal();
    if (typeof window.closeConsultationModal === "function") window.closeConsultationModal();
    if (typeof window.closeServiceModal === "function") window.closeServiceModal();
    if (typeof window.closeGalleryModal === "function") window.closeGalleryModal();
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
  const demoCloseBtn = document.getElementById("demoModalCloseBtn");
  const demoForm = document.getElementById("demoModalForm");

  if (demoCloseBtn) {
    demoCloseBtn.addEventListener("click", window.closeDemoModal);
  }

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
      const name = document.getElementById("demoClientName") ? document.getElementById("demoClientName").value.trim() : "";
      const industry = document.getElementById("demoBusinessType") ? document.getElementById("demoBusinessType").value : "General";
      const phone = document.getElementById("demoPhone") ? document.getElementById("demoPhone").value.trim() : "";
      const notes = document.getElementById("demoNotes") ? document.getElementById("demoNotes").value.trim() : "N/A";

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
        `• Features Requested: ${featuresStr}\n` +
        `• WhatsApp Number: ${phone}\n` +
        `• Demand & Notes: ${notes}\n\n` +
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
