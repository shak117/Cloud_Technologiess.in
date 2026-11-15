/**
 * Cloud Technologies — Core Application & Lead Generation Controller
 * Founder: Shashank Pawar | Satara, Maharashtra
 */

const WHATSAPP_NUMBER = "918830464841";
const LEADS_STORAGE_KEY = "cloudtech_leads";

document.addEventListener("DOMContentLoaded", () => {
  initLeadForm();
  initMobileMenu();
  initSmoothScroll();
});

// -------------------------------------------------------------
// 1. Service Preselection & Smooth Scroll Helper
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
// 2. Lead Generation Form Handler (Validation + Storage + WhatsApp)
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

    // Save to localStorage backend
    try {
      const existing = localStorage.getItem(LEADS_STORAGE_KEY) || "[]";
      const list = JSON.parse(existing);
      list.unshift(lead);
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.warn("Storage error saving lead:", err);
    }

    // Build Form-to-WhatsApp Message using exact required template
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
// 3. Mobile Navigation Menu
// -------------------------------------------------------------
function initMobileMenu() {
  const toggleBtn = document.getElementById("mobileMenuToggle");
  const drawer = document.getElementById("mobileNavDrawer");
  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener("click", () => {
    drawer.classList.toggle("open");
  });
}

window.closeMobileMenu = function() {
  const drawer = document.getElementById("mobileNavDrawer");
  if (drawer) drawer.classList.remove("open");
};

// -------------------------------------------------------------
// 4. Smooth Scrolling for Internal Hash Anchors
// -------------------------------------------------------------
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#" || targetId === "") return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: "smooth" });
        closeMobileMenu();
      }
    });
  });
}
