/**
 * Cloud Technologies — Core App Controller & Client Interactions
 * Visual Identity: Modern Blue, Warm Ivory & Tech-Forward Engineering
 */

const WHATSAPP_NUMBER = "918830464841";
const CLIENTS_STORAGE_KEY = "cloudtech_clients";

// Approved Client Collaborations (SK Relax Studio, HIRAMOTI Collection, Mhaswadkar Machineries)
const DEFAULT_CLIENTS = [
  {
    id: "c1",
    name: "SK Relax Studio",
    industry: "Beauty Academy & Salon",
    logo: "images/client-sk-relax.png",
    badge: "Satara",
    active: true
  },
  {
    id: "c2",
    name: "HIRAMOTI Collection",
    industry: "Catalogue & Collections",
    logo: "images/client-hiramoti.png",
    badge: "E-Catalogue",
    active: true
  },
  {
    id: "c3",
    name: "Mhaswadkar Machineries",
    industry: "Machineries Trading Co.",
    logo: "images/client-mhaswadkar.svg",
    badge: "Industrial",
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
    highlights: ["High-Capacity Product Engines", "1-Click WhatsApp Direct Checkout", "Custom Product Bundles Engine", "Live Inventory Telemetry"]
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
  // Initialize 1.5-Second Collaborations Carousel
  initCollaborationsCarousel();

  // Initialize Dual-Line Growth Comparison Chart (if on page)
  initGrowthComparisonChart();

  // Initialize SK Relax Case Study Chart (if on page)
  initSKRelaxChart();

  // Initialize Digital Marketing Form & Funnel (if on page)
  initMarketingEnquiryForm();

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
// Collaborations Section: 1.5-Second Stepping Carousel
// Moving one logo position at a time every 1500ms with smooth 600ms slide
// -------------------------------------------------------------
function initCollaborationsCarousel() {
  const container = document.getElementById("collabCarouselContainer");
  const wrapper = document.getElementById("collabTrackWrapper");
  const track = document.getElementById("collabTrack");
  const prevBtn = document.getElementById("collabPrevBtn");
  const nextBtn = document.getElementById("collabNextBtn");

  if (!wrapper || !track) return;

  // Retrieve active clients from storage or fallback to defaults
  let clients = DEFAULT_CLIENTS;
  try {
    const stored = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out legacy mama / punita entries
        const filtered = parsed.filter(c => c.active && !/mama|pedhewale|punita/i.test(c.name));
        if (filtered.length > 0) clients = filtered;
      }
    }
  } catch (e) {}

  // Duplicate logos 4 times for a perfectly seamless infinite loop
  const copies = 4;
  const originalCount = clients.length;
  track.innerHTML = "";

  for (let c = 0; c < copies; c++) {
    clients.forEach((client, idx) => {
      const card = document.createElement("div");
      card.className = "collab-logo-card";
      card.dataset.index = (c * originalCount + idx).toString();

      // Only display logo image with object-fit: contain (no text labels)
      const img = document.createElement("img");
      img.src = client.logo;
      img.alt = client.name;
      img.className = "collab-brand-logo";
      img.loading = "lazy";

      card.appendChild(img);
      track.appendChild(card);
    });
  }

  let currentIndex = 0;
  let isTransitioning = false;
  let timer = null;
  const INTERVAL_MS = 1500; // 1.5 seconds per logo movement
  const TRANSITION_DURATION = 600; // 600ms smooth cubic-bezier slide

  const getStepWidth = () => {
    const firstCard = track.querySelector(".collab-logo-card");
    if (!firstCard) return 260;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 32;
    return firstCard.offsetWidth + gap;
  };

  const updatePosition = (animate = true) => {
    const step = getStepWidth();
    if (animate) {
      track.style.transition = `transform ${TRANSITION_DURATION}ms cubic-bezier(0.25, 1, 0.5, 1)`;
    } else {
      track.style.transition = "none";
    }
    track.style.transform = `translateX(-${currentIndex * step}px)`;
  };

  const slideNext = () => {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex++;
    updatePosition(true);
  };

  const slidePrev = () => {
    if (isTransitioning) return;
    if (currentIndex <= 0) {
      currentIndex = originalCount;
      updatePosition(false);
      track.offsetHeight; // force reflow
    }
    isTransitioning = true;
    currentIndex--;
    updatePosition(true);
  };

  track.addEventListener("transitionend", () => {
    isTransitioning = false;
    // Seamless reset when completing two cycles
    if (currentIndex >= originalCount * 2) {
      currentIndex = currentIndex - originalCount;
      updatePosition(false);
      track.offsetHeight; // force reflow
    }
  });

  const startTimer = () => {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!timer) {
      timer = setInterval(slideNext, INTERVAL_MS);
    }
  };

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      stopTimer();
      slideNext();
      startTimer();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      stopTimer();
      slidePrev();
      startTimer();
    });
  }

  // Pause on hover, resume on mouseleave
  const hoverZone = container || wrapper;
  hoverZone.addEventListener("mouseenter", stopTimer);
  hoverZone.addEventListener("mouseleave", startTimer);

  // Mobile Touch / Swipe Handling
  let touchStartX = 0;
  let touchEndX = 0;
  wrapper.addEventListener("touchstart", (e) => {
    stopTimer();
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  wrapper.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        slideNext();
      } else {
        slidePrev();
      }
    }
    setTimeout(startTimer, 1000);
  }, { passive: true });

  window.addEventListener("resize", () => {
    updatePosition(false);
  });

  // Start automated sliding
  startTimer();
}

// -------------------------------------------------------------
// Dual-Line Growth Comparison Chart (From Reference Image)
// -------------------------------------------------------------
function initGrowthComparisonChart() {
  const canvas = document.getElementById("growthComparisonChart");
  if (!canvas || typeof Chart === "undefined") return;

  const ctx = canvas.getContext("2d");

  // Create smooth gradients for fills
  const tealGrad = ctx.createLinearGradient(0, 0, 0, 260);
  tealGrad.addColorStop(0, "rgba(13, 122, 104, 0.28)");
  tealGrad.addColorStop(1, "rgba(13, 122, 104, 0.01)");

  const tanGrad = ctx.createLinearGradient(0, 0, 0, 260);
  tanGrad.addColorStop(0, "rgba(192, 138, 78, 0.20)");
  tanGrad.addColorStop(1, "rgba(192, 138, 78, 0.01)");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: [
        "Digital Visibility",
        "Customer Engagement",
        "Lead Generation",
        "Campaign Optimization",
        "Business Growth"
      ],
      datasets: [
        {
          label: "Without Cloud Technologies",
          data: [12, 16, 21, 24, 26],
          borderColor: "#C08A4E",
          backgroundColor: tanGrad,
          fill: true,
          tension: 0.32,
          borderWidth: 2.5,
          pointBackgroundColor: "#FFFFFF",
          pointBorderColor: "#C08A4E",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        },
        {
          label: "With Cloud Technologies",
          data: [16, 34, 51, 71, 96],
          borderColor: "#0D7A68",
          backgroundColor: tealGrad,
          fill: true,
          tension: 0.32,
          borderWidth: 3,
          pointBackgroundColor: "#FFFFFF",
          pointBorderColor: "#0D7A68",
          pointBorderWidth: 2.5,
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // Displayed in custom styled HTML below
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.92)",
          titleFont: { family: "Manrope, sans-serif", weight: "bold", size: 12 },
          bodyFont: { family: "Inter, sans-serif", size: 11 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              return ` ${context.dataset.label}: ${context.parsed.y} Index`;
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            font: { family: "Inter, sans-serif", size: 10 },
            color: "#8C8980"
          },
          grid: {
            color: "#F1EEE6"
          },
          title: {
            display: true,
            text: "Business Growth (Conceptual)",
            font: { family: "Inter, sans-serif", size: 10, weight: "600" },
            color: "#8C8980"
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: { family: "Manrope, sans-serif", size: 11, weight: "600" },
            color: "#47453E"
          }
        }
      }
    }
  });
}

// -------------------------------------------------------------
// SK Relax Visual Case Study Grouped Bar Chart
// -------------------------------------------------------------
function initSKRelaxChart() {
  const canvas = document.getElementById("skRelaxChart");
  if (!canvas || typeof Chart === "undefined") return;

  const ctx = canvas.getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: [
        "Hair Care Products",
        "Skin Care Products",
        "Beauty Services",
        "Hair Treatments",
        "Salon Packages"
      ],
      datasets: [
        {
          label: "Before Cloud Technologies",
          data: [28, 22, 35, 20, 18],
          backgroundColor: "#CBD5E1",
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.7
        },
        {
          label: "With Cloud Technologies Marketing",
          data: [84, 72, 94, 68, 62],
          backgroundColor: "#2563EB",
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.7
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          align: "end",
          labels: {
            boxWidth: 12,
            font: { family: "Inter, sans-serif", size: 11, weight: "600" },
            color: "#475569"
          }
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.92)",
          titleFont: { family: "Manrope, sans-serif", weight: "bold", size: 12 },
          bodyFont: { family: "Inter, sans-serif", size: 11 },
          padding: 10,
          cornerRadius: 8
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            callback: value => value + "%",
            font: { family: "Inter, sans-serif", size: 10 },
            color: "#64748B"
          },
          grid: {
            color: "#F1F5F9"
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: { family: "Manrope, sans-serif", size: 11, weight: "600" },
            color: "#334155"
          }
        }
      }
    }
  });
}

// -------------------------------------------------------------
// Interactive 7-Stage Funnel Accordion Toggle
// -------------------------------------------------------------
window.toggleFunnelStage = function(headerEl) {
  const card = headerEl.closest(".funnel-stage-card");
  if (!card) return;
  card.classList.toggle("open");
};

// -------------------------------------------------------------
// 10-Field Digital Marketing Intake Form Handler
// -------------------------------------------------------------
function initMarketingEnquiryForm() {
  const form = document.getElementById("marketingForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("mktName");
    const brandInput = document.getElementById("mktBrand");
    const phoneInput = document.getElementById("mktPhone");
    const categorySelect = document.getElementById("mktCategory");
    const locationInput = document.getElementById("mktLocation");
    const urlInput = document.getElementById("mktUrl");
    const adBudgetSelect = document.getElementById("mktAdBudget");
    const challengeSelect = document.getElementById("mktChallenge");
    const notesInput = document.getElementById("mktNotes");

    let isValid = true;

    // Reset error classes
    document.querySelectorAll(".form-group").forEach(fg => fg.classList.remove("has-error"));

    if (!nameInput || !nameInput.value.trim()) {
      if (nameInput) nameInput.closest(".form-group").classList.add("has-error");
      isValid = false;
    }
    if (!brandInput || !brandInput.value.trim()) {
      if (brandInput) brandInput.closest(".form-group").classList.add("has-error");
      isValid = false;
    }
    const cleanPhone = phoneInput ? phoneInput.value.replace(/[^0-9]/g, "") : "";
    if (cleanPhone.length < 10) {
      if (phoneInput) phoneInput.closest(".form-group").classList.add("has-error");
      isValid = false;
    }
    if (!categorySelect || !categorySelect.value) {
      if (categorySelect) categorySelect.closest(".form-group").classList.add("has-error");
      isValid = false;
    }
    if (!locationInput || !locationInput.value.trim()) {
      if (locationInput) locationInput.closest(".form-group").classList.add("has-error");
      isValid = false;
    }

    // Check services
    const checkedServices = [];
    document.querySelectorAll("input[name='mktServices']:checked").forEach(cb => {
      checkedServices.push(cb.value);
    });
    if (checkedServices.length === 0) {
      const errEl = document.getElementById("errServices");
      if (errEl) errEl.closest(".form-group").classList.add("has-error");
      isValid = false;
    }

    if (!adBudgetSelect || !adBudgetSelect.value) {
      if (adBudgetSelect) adBudgetSelect.closest(".form-group").classList.add("has-error");
      isValid = false;
    }
    if (!challengeSelect || !challengeSelect.value) {
      if (challengeSelect) challengeSelect.closest(".form-group").classList.add("has-error");
      isValid = false;
    }

    if (!isValid) {
      const firstErr = document.querySelector(".form-group.has-error");
      if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const lead = {
      id: "mkt_" + Date.now(),
      submittedAt: new Date().toISOString(),
      fullName: nameInput.value.trim(),
      brandName: brandInput.value.trim(),
      phone: cleanPhone,
      category: categorySelect.value,
      location: locationInput.value.trim(),
      url: urlInput ? urlInput.value.trim() : "",
      services: checkedServices,
      adBudget: adBudgetSelect.value,
      challenge: challengeSelect.value,
      notes: notesInput ? notesInput.value.trim() : "",
      status: "New"
    };

    // Save to localStorage
    try {
      const stored = localStorage.getItem("cloudtech_marketing_leads") || "[]";
      const list = JSON.parse(stored);
      list.unshift(lead);
      localStorage.setItem("cloudtech_marketing_leads", JSON.stringify(list));
    } catch (err) {
      console.warn("Storage error:", err);
    }

    // Show modal & build prefilled WhatsApp link
    const modal = document.getElementById("mktSuccessModal");
    const nameEl = document.getElementById("successLeadName");
    const brandEl = document.getElementById("successBrandName");
    const waCTA = document.getElementById("directWhatsAppCTA");

    if (nameEl) nameEl.textContent = lead.fullName;
    if (brandEl) brandEl.textContent = lead.brandName;

    const waText = `*New Marketing Strategy Enquiry - Cloud Technologies*\n\n` +
      `*Client Name:* ${lead.fullName}\n` +
      `*Brand / Business:* ${lead.brandName}\n` +
      `*WhatsApp:* +91 ${lead.phone}\n` +
      `*Category:* ${lead.category}\n` +
      `*Location:* ${lead.location}\n` +
      `*Ad Budget:* ${lead.adBudget}\n` +
      `*Primary Challenge:* ${lead.challenge}\n` +
      `*Services:* ${lead.services.join(", ")}\n` +
      (lead.notes ? `*Notes:* ${lead.notes}\n` : "") +
      `\nHello Shashank! I just submitted my digital marketing enquiry on cloudtechnologies.in. Let's discuss our growth strategy!`;

    if (waCTA) {
      waCTA.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;
    }

    if (modal) {
      modal.style.display = "flex";
    }

    form.reset();
  });
}

window.closeMarketingSuccess = function() {
  const modal = document.getElementById("mktSuccessModal");
  if (modal) modal.style.display = "none";
};

// -------------------------------------------------------------
// Consultation Modal Functions
// -------------------------------------------------------------
window.openConsultationModal = function(serviceType) {
  const modal = document.getElementById("consultationModal");
  if (!modal) return;
  modal.style.display = "flex";

  if (serviceType) {
    const select = document.getElementById("modalServiceSelect");
    if (select) {
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value.toLowerCase().includes(serviceType.toLowerCase())) {
          select.selectedIndex = i;
          break;
        }
      }
    }
  }
};

window.closeConsultationModal = function() {
  const modal = document.getElementById("consultationModal");
  if (modal) modal.style.display = "none";
};

function initConsultationModal() {
  const modal = document.getElementById("consultationModal");
  const form = document.getElementById("consultationForm");
  if (!modal || !form) return;

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeConsultationModal();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("modalClientName").value.trim();
    const phone = document.getElementById("modalClientPhone").value.trim();
    const business = document.getElementById("modalBusinessName").value.trim();
    const service = document.getElementById("modalServiceSelect").value;
    const notes = document.getElementById("modalClientNotes").value.trim();

    if (!name || !phone) {
      alert("Please provide your Name and WhatsApp phone number.");
      return;
    }

    // Save lead
    saveLeadToStorage({
      id: "lead_" + Date.now(),
      submittedAt: new Date().toISOString(),
      name,
      phone,
      business,
      service,
      notes,
      type: "Proposal Request",
      status: "New"
    });

    const msg = `*New Proposal Request - Cloud Technologies*\n\n` +
      `*Name:* ${name}\n` +
      `*WhatsApp:* +91 ${phone}\n` +
      `*Business:* ${business || "Not specified"}\n` +
      `*Service Interested:* ${service}\n` +
      (notes ? `*Notes:* ${notes}\n` : "") +
      `\nHello Shashank! I would like to schedule a proposal call for my project.`;

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    closeConsultationModal();
    window.open(waUrl, "_blank");
  });
}

// -------------------------------------------------------------
// Demo Modal Functions
// -------------------------------------------------------------
window.openDemoModal = function() {
  const modal = document.getElementById("demoModal");
  if (modal) modal.style.display = "flex";
};

window.closeDemoModal = function() {
  const modal = document.getElementById("demoModal");
  if (modal) modal.style.display = "none";
};

// -------------------------------------------------------------
// Intro Modal Functions
// -------------------------------------------------------------
window.openIntroModal = function() {
  const modal = document.getElementById("introModal");
  if (modal) modal.style.display = "flex";
};

window.closeIntroModal = function() {
  const modal = document.getElementById("introModal");
  if (modal) modal.style.display = "none";
};

// -------------------------------------------------------------
// Mobile Menu Toggle
// -------------------------------------------------------------
function initMobileMenu() {
  const toggleBtn = document.getElementById("mobileMenuToggle");
  const drawer = document.getElementById("mobileNavDrawer");
  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener("click", () => {
    drawer.classList.toggle("open");
  });

  drawer.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      drawer.classList.remove("open");
    });
  });
}

window.toggleMobileMenu = function() {
  const drawer = document.getElementById("mobileNavDrawer");
  if (drawer) drawer.classList.toggle("open");
};

// -------------------------------------------------------------
// FAQ Accordion
// -------------------------------------------------------------
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");
    if (!question) return;

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      faqItems.forEach(i => i.classList.remove("open"));
      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });
}

// -------------------------------------------------------------
// Storage Helper
// -------------------------------------------------------------
window.saveLeadToStorage = function(leadData) {
  try {
    const raw = localStorage.getItem("cloudtech_leads") || "[]";
    const list = JSON.parse(raw);
    list.unshift(leadData);
    localStorage.setItem("cloudtech_leads", JSON.stringify(list));
  } catch (err) {
    console.warn("Storage error:", err);
  }
};

// -------------------------------------------------------------
// Apply Live Site Config from Admin Panel
// -------------------------------------------------------------
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
