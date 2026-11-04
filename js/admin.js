// Cloud Technologies - Admin Control Panel Controller
// Credentials: username "cloud" / password "Cloud@2005"

const ADMIN_USER = "cloud";
const ADMIN_PASS = "Cloud@2005";
const SESSION_KEY = "cloudtech_admin_session";
const LEADS_KEY = "cloudtech_leads";
const CONFIG_KEY = "cloudtech_site_config";
const CLIENTS_KEY = "cloudtech_clients";

const DEFAULT_LEADS = [
  {
    id: "REQ-MAMA1948",
    type: "Demo Booking",
    name: "Mama Pedhewale (Satara)",
    industry: "D2C E-Commerce & Sweets",
    phone: "8830464841",
    features: ["Zero-Timeout UPI Payments", "WhatsApp Direct Orders", "Pincode Delivery Checker"],
    notes: "Festive rush traffic shield and custom gift box prototype requested.",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: "Converted / Won",
    adminNotes: "Client live at mamapedhewale.com! Great response during Diwali."
  },
  {
    id: "REQ-KNOTBERRY",
    type: "Demo Booking",
    name: "knotberry.studios",
    industry: "Handmade Boutique & Lifestyle",
    phone: "8830464841",
    features: ["Custom UI/UX & Brand Colors", "WhatsApp Direct Orders", "Product / Service Catalog"],
    notes: "Pastel aesthetics, custom gift cards, and direct Instagram Meta Ads checkout funnel.",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    status: "Completed",
    adminNotes: "Delivered interactive boutique prototype within 24 hours."
  },
  {
    id: "REQ-DRKULKARNI",
    type: "Custom Proposal",
    name: "Dr. Arvind Kulkarni (Apex Hospital)",
    industry: "Clinic, Doctor & Healthcare Portal",
    phone: "9822012345",
    features: ["Online Appointment Booking", "WhatsApp Direct Orders"],
    notes: "Needs clean responsive clinic booking site with sub-1.5s mobile speed.",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: "New",
    adminNotes: "Awaiting consultation call on WhatsApp."
  }
];

const DEFAULT_CONFIG = {
  brandName: "Cloud Technologies",
  brandTag: "Digital Solutions Agency",
  directPhone: "8830464841",
  whatsappNumber: "8830464841",
  supportEmail: "contact@cloudtechnologies.in",
  uptimeBadge: "99.9% Uptime • Free SSL Security",
  deliveryBadge: "24h Rapid Delivery",
  heroTag: "Full-Service Digital Engineering & Growth",
  heroTitle: "Websites, UI/UX & Cloud Solutions Built for Real Business Scale",
  heroDesc: "We don't sell generic boxes or template sites. Cloud Technologies partners with growing businesses as a full-service technology team — designing intuitive UI/UX, engineering high-speed web apps, running high-ROI Meta Ads, and hosting everything on secure cloud infrastructure.",
  demoCalloutTitle: "Interactive Demo Website Built As Per Your Demand",
  demoCalloutDesc: "Want to see how your site looks & works before committing? We build a working demo prototype tailored to your exact industry. 100% Free!",
  founderName: "Shashank Pawar",
  founderTitle: "Founder & Principal Cloud Solutions Architect",
  founderQuote: "We founded Cloud Technologies on a clear conviction: ambitious businesses shouldn't have to suffer through template websites, inflated retainers, or agency account managers who don't know how to code. You get direct engineering excellence, built to your exact demands.",
  founderPhone: "8830464841"
};

// State
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

let allClients = [];

let allLeads = [];
let siteConfig = {};

document.addEventListener("DOMContentLoaded", () => {
  initAuth();
  initStorage();
  initTabs();
  initLeadsTable();
  initConfigEditor();
  initClientsManager();
});

// -------------------------------------------------------------
// Authentication
// -------------------------------------------------------------
function initAuth() {
  const loginOverlay = document.getElementById("adminLoginOverlay");
  const loginForm = document.getElementById("adminLoginForm");
  const loginError = document.getElementById("loginError");
  const logoutBtn = document.getElementById("adminLogoutBtn");

  function checkSession() {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session === "authenticated") {
      loginOverlay.style.display = "none";
      document.body.style.overflow = "auto";
    } else {
      loginOverlay.style.display = "flex";
      document.body.style.overflow = "hidden";
    }
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = document.getElementById("adminUsername").value.trim();
      const pass = document.getElementById("adminPassword").value.trim();

      if (user === ADMIN_USER && pass === ADMIN_PASS) {
        sessionStorage.setItem(SESSION_KEY, "authenticated");
        loginError.style.display = "none";
        checkSession();
        showToast("✓ Welcome back, Shashank! Logged in as cloud");
        renderDashboard();
      } else {
        loginError.style.display = "block";
        loginError.textContent = "Invalid username or password. Please try again.";
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem(SESSION_KEY);
      checkSession();
      showToast("Logged out successfully.");
    });
  }

  checkSession();
}

// -------------------------------------------------------------
// Storage Initialization
// -------------------------------------------------------------
function initStorage() {
  // Leads
  try {
    const storedLeads = localStorage.getItem(LEADS_KEY);
    if (!storedLeads) {
      allLeads = DEFAULT_LEADS;
      localStorage.setItem(LEADS_KEY, JSON.stringify(allLeads));
    } else {
      allLeads = JSON.parse(storedLeads);
    }
  } catch (e) {
    allLeads = DEFAULT_LEADS;
  }

  // Config
  try {
    const storedConfig = localStorage.getItem(CONFIG_KEY);
    if (!storedConfig) {
      siteConfig = DEFAULT_CONFIG;
      localStorage.setItem(CONFIG_KEY, JSON.stringify(siteConfig));
    } else {
      siteConfig = { ...DEFAULT_CONFIG, ...JSON.parse(storedConfig) };
    }
  } catch (e) {
    siteConfig = DEFAULT_CONFIG;
  }

  // Clients
  try {
    const storedClients = localStorage.getItem(CLIENTS_KEY);
    if (!storedClients) {
      allClients = DEFAULT_CLIENTS;
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(allClients));
    } else {
      allClients = JSON.parse(storedClients);
    }
  } catch (e) {
    allClients = DEFAULT_CLIENTS;
  }
}

// -------------------------------------------------------------
// Tabs Switching
// -------------------------------------------------------------
function initTabs() {
  const tabs = document.querySelectorAll(".admin-tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const targetId = tab.getAttribute("data-tab");
      document.querySelectorAll(".admin-tab-pane").forEach(pane => {
        pane.style.display = pane.id === targetId ? "block" : "none";
      });
    });
  });
}

// -------------------------------------------------------------
// Leads Management & Table Rendering
// -------------------------------------------------------------
function initLeadsTable() {
  const searchInput = document.getElementById("leadSearchInput");
  const statusFilter = document.getElementById("leadStatusFilter");
  const typeFilter = document.getElementById("leadTypeFilter");

  if (searchInput) searchInput.addEventListener("input", filterAndRenderLeads);
  if (statusFilter) statusFilter.addEventListener("change", filterAndRenderLeads);
  if (typeFilter) typeFilter.addEventListener("change", filterAndRenderLeads);

  renderDashboard();
}

function renderDashboard() {
  updateMetrics();
  filterAndRenderLeads();
  populateConfigFields();
}

function updateMetrics() {
  const totalEl = document.getElementById("metricTotalRequests");
  const newEl = document.getElementById("metricNewRequests");
  const progressEl = document.getElementById("metricActiveDemos");
  const wonEl = document.getElementById("metricConvertedClients");

  if (totalEl) totalEl.textContent = allLeads.length;
  if (newEl) newEl.textContent = allLeads.filter(l => l.status === "New").length;
  if (progressEl) progressEl.textContent = allLeads.filter(l => l.status === "Demo In Progress" || l.status === "Contacted").length;
  if (wonEl) wonEl.textContent = allLeads.filter(l => l.status === "Converted / Won" || l.status === "Completed").length;
}

function filterAndRenderLeads() {
  const tableBody = document.getElementById("leadsTableBody");
  if (!tableBody) return;

  const search = (document.getElementById("leadSearchInput") ? document.getElementById("leadSearchInput").value.toLowerCase() : "");
  const statusFilter = (document.getElementById("leadStatusFilter") ? document.getElementById("leadStatusFilter").value : "all");
  const typeFilter = (document.getElementById("leadTypeFilter") ? document.getElementById("leadTypeFilter").value : "all");

  const filtered = allLeads.filter(lead => {
    const matchesSearch = (
      (lead.name && lead.name.toLowerCase().includes(search)) ||
      (lead.phone && lead.phone.includes(search)) ||
      (lead.industry && lead.industry.toLowerCase().includes(search)) ||
      (lead.notes && lead.notes.toLowerCase().includes(search))
    );
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesType = typeFilter === "all" || lead.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 3rem; color: #94a3b8;">
          No matching client requests found.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(lead => {
    const dateFormatted = new Date(lead.createdAt).toLocaleDateString("en-IN", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });

    const statusClass = getStatusClass(lead.status);

    const featurePills = (lead.features && lead.features.length > 0)
      ? lead.features.map(f => `<span class="feature-badge-mini">${escapeHtml(f)}</span>`).join("")
      : `<span style="color: #64748b; font-size: 0.75rem;">Standard Prototype</span>`;

    const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, "") : "";
    const waPhone = cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone;
    const clientWaMsg = encodeURIComponent(
      `Hello ${lead.name}!
This is Shashank Pawar from Cloud Technologies. I received your request for a ${lead.industry || 'custom'} website prototype. Let me know when is a good time to connect!`
    );

    return `
      <tr id="row-${lead.id}">
        <td>
          <strong style="color: #ffffff; display: block;">${escapeHtml(lead.name || 'N/A')}</strong>
          <span style="font-size: 0.72rem; color: var(--admin-teal);">${escapeHtml(lead.id)}</span>
        </td>
        <td>
          <span style="font-size: 0.82rem; color: #cbd5e1; display: block;">${escapeHtml(lead.industry || 'General Demand')}</span>
          <span style="font-size: 0.74rem; color: #94a3b8;">${escapeHtml(lead.type || 'Demo Request')}</span>
        </td>
        <td>
          <div style="font-size: 0.84rem; font-weight: 600; color: #ffffff; margin-bottom: 0.25rem;">
            ${escapeHtml(lead.phone || 'N/A')}
          </div>
          <a href="https://wa.me/${waPhone}?text=${clientWaMsg}" target="_blank" class="btn-lead-wa">
            <span>💬 Chat on WhatsApp</span>
          </a>
        </td>
        <td style="max-width: 220px;">
          <div style="margin-bottom: 0.3rem;">${featurePills}</div>
          <div style="font-size: 0.76rem; color: #94a3b8; font-style: italic; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${escapeHtml(lead.notes || 'No custom notes')}
          </div>
        </td>
        <td style="font-size: 0.78rem; color: #94a3b8; white-space: nowrap;">
          ${dateFormatted}
        </td>
        <td>
          <select class="admin-filter-select" style="padding: 0.35rem 0.5rem; font-size: 0.78rem;" onchange="updateLeadStatus('${lead.id}', this.value)">
            <option value="New" ${lead.status === "New" ? "selected" : ""}>New</option>
            <option value="Contacted" ${lead.status === "Contacted" ? "selected" : ""}>Contacted</option>
            <option value="Demo In Progress" ${lead.status === "Demo In Progress" ? "selected" : ""}>Demo In Progress</option>
            <option value="Converted / Won" ${lead.status === "Converted / Won" ? "selected" : ""}>Converted / Won</option>
            <option value="Completed" ${lead.status === "Completed" ? "selected" : ""}>Completed</option>
            <option value="Closed" ${lead.status === "Closed" ? "selected" : ""}>Closed</option>
          </select>
        </td>
        <td style="white-space: nowrap;">
          <button class="btn-row-action" onclick="openLeadModal('${lead.id}')" title="View & Edit Notes">
            📝 Notes
          </button>
          <button class="btn-row-action" style="color: #ef4444;" onclick="deleteLead('${lead.id}')" title="Delete Request">
            🗑
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

function getStatusClass(status) {
  switch (status) {
    case "New": return "status-new";
    case "Contacted": return "status-contacted";
    case "Demo In Progress": return "status-progress";
    case "Converted / Won":
    case "Completed": return "status-converted";
    default: return "status-closed";
  }
}

window.updateLeadStatus = function(id, newStatus) {
  const lead = allLeads.find(l => l.id === id);
  if (lead) {
    lead.status = newStatus;
    saveLeadsToStorage();
    updateMetrics();
    showToast(`✓ Updated ${lead.name} status to: ${newStatus}`);
  }
};

window.deleteLead = function(id) {
  if (!confirm("Are you sure you want to delete this request record?")) return;
  allLeads = allLeads.filter(l => l.id !== id);
  saveLeadsToStorage();
  renderDashboard();
  showToast("Request record deleted.");
};

window.openLeadModal = function(id) {
  const lead = allLeads.find(l => l.id === id);
  if (!lead) return;

  const modal = document.getElementById("leadDetailModal");
  if (!modal) return;

  document.getElementById("modalLeadClientName").textContent = lead.name;
  document.getElementById("modalLeadPhone").textContent = lead.phone;
  document.getElementById("modalLeadIndustry").textContent = lead.industry;
  document.getElementById("modalLeadType").textContent = lead.type;
  document.getElementById("modalLeadFeatures").textContent = (lead.features && lead.features.length > 0) ? lead.features.join(", ") : "None specified";
  document.getElementById("modalLeadNotes").textContent = lead.notes || "None";
  document.getElementById("modalLeadAdminNotes").value = lead.adminNotes || "";

  document.getElementById("btnSaveLeadNotes").onclick = function() {
    lead.adminNotes = document.getElementById("modalLeadAdminNotes").value.trim();
    saveLeadsToStorage();
    modal.classList.remove("show");
    showToast("✓ Admin internal notes updated.");
    filterAndRenderLeads();
  };

  modal.classList.add("show");
};

window.closeLeadModal = function() {
  const modal = document.getElementById("leadDetailModal");
  if (modal) modal.classList.remove("show");
};

function saveLeadsToStorage() {
  localStorage.setItem(LEADS_KEY, JSON.stringify(allLeads));
}

// Export CSV
window.exportLeadsCSV = function() {
  if (allLeads.length === 0) {
    alert("No requests to export.");
    return;
  }
  const headers = ["ID", "Type", "Client Name", "Phone", "Industry", "Features Requested", "Client Notes", "Status", "Date", "Admin Notes"];
  const rows = allLeads.map(l => [
    l.id,
    `"${l.type || ''}"`,
    `"${(l.name || '').replace(/"/g, '""')}"`,
    `"${l.phone || ''}"`,
    `"${(l.industry || '').replace(/"/g, '""')}"`,
    `"${((l.features || []).join('; ')).replace(/"/g, '""')}"`,
    `"${(l.notes || '').replace(/"/g, '""')}"`,
    `"${l.status || ''}"`,
    `"${l.createdAt || ''}"`,
    `"${(l.adminNotes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `CloudTechnologies_Requests_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("✓ Exported CSV successfully!");
};

// -------------------------------------------------------------
// TAB 2: Website Content & Settings Editor ("Edit Changes")
// -------------------------------------------------------------
function initConfigEditor() {
  const form = document.getElementById("siteConfigForm");
  const resetBtn = document.getElementById("btnResetConfig");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      siteConfig.brandName = document.getElementById("cfgBrandName").value.trim();
      siteConfig.brandTag = document.getElementById("cfgBrandTag").value.trim();
      siteConfig.directPhone = document.getElementById("cfgDirectPhone").value.trim();
      siteConfig.whatsappNumber = document.getElementById("cfgWhatsappNumber").value.trim();
      siteConfig.supportEmail = document.getElementById("cfgSupportEmail").value.trim();
      siteConfig.uptimeBadge = document.getElementById("cfgUptimeBadge").value.trim();
      siteConfig.deliveryBadge = document.getElementById("cfgDeliveryBadge").value.trim();
      
      siteConfig.heroTag = document.getElementById("cfgHeroTag").value.trim();
      siteConfig.heroTitle = document.getElementById("cfgHeroTitle").value.trim();
      siteConfig.heroDesc = document.getElementById("cfgHeroDesc").value.trim();
      siteConfig.demoCalloutTitle = document.getElementById("cfgDemoCalloutTitle").value.trim();
      siteConfig.demoCalloutDesc = document.getElementById("cfgDemoCalloutDesc").value.trim();

      siteConfig.founderName = document.getElementById("cfgFounderName").value.trim();
      siteConfig.founderTitle = document.getElementById("cfgFounderTitle").value.trim();
      siteConfig.founderQuote = document.getElementById("cfgFounderQuote").value.trim();

      localStorage.setItem(CONFIG_KEY, JSON.stringify(siteConfig));
      showToast("✓ Website configuration & changes saved successfully! Live site updated.");
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (!confirm("Reset all website settings to factory defaults?")) return;
      siteConfig = { ...DEFAULT_CONFIG };
      localStorage.setItem(CONFIG_KEY, JSON.stringify(siteConfig));
      populateConfigFields();
      showToast("Reset to factory defaults.");
    });
  }
}

function populateConfigFields() {
  if (document.getElementById("cfgBrandName")) document.getElementById("cfgBrandName").value = siteConfig.brandName || "";
  if (document.getElementById("cfgBrandTag")) document.getElementById("cfgBrandTag").value = siteConfig.brandTag || "";
  if (document.getElementById("cfgDirectPhone")) document.getElementById("cfgDirectPhone").value = siteConfig.directPhone || "";
  if (document.getElementById("cfgWhatsappNumber")) document.getElementById("cfgWhatsappNumber").value = siteConfig.whatsappNumber || "";
  if (document.getElementById("cfgSupportEmail")) document.getElementById("cfgSupportEmail").value = siteConfig.supportEmail || "";
  if (document.getElementById("cfgUptimeBadge")) document.getElementById("cfgUptimeBadge").value = siteConfig.uptimeBadge || "";
  if (document.getElementById("cfgDeliveryBadge")) document.getElementById("cfgDeliveryBadge").value = siteConfig.deliveryBadge || "";

  if (document.getElementById("cfgHeroTag")) document.getElementById("cfgHeroTag").value = siteConfig.heroTag || "";
  if (document.getElementById("cfgHeroTitle")) document.getElementById("cfgHeroTitle").value = siteConfig.heroTitle || "";
  if (document.getElementById("cfgHeroDesc")) document.getElementById("cfgHeroDesc").value = siteConfig.heroDesc || "";
  if (document.getElementById("cfgDemoCalloutTitle")) document.getElementById("cfgDemoCalloutTitle").value = siteConfig.demoCalloutTitle || "";
  if (document.getElementById("cfgDemoCalloutDesc")) document.getElementById("cfgDemoCalloutDesc").value = siteConfig.demoCalloutDesc || "";

  if (document.getElementById("cfgFounderName")) document.getElementById("cfgFounderName").value = siteConfig.founderName || "";
  if (document.getElementById("cfgFounderTitle")) document.getElementById("cfgFounderTitle").value = siteConfig.founderTitle || "";
  if (document.getElementById("cfgFounderQuote")) document.getElementById("cfgFounderQuote").value = siteConfig.founderQuote || "";
}

// -------------------------------------------------------------
// Toast & Utility Helpers
// -------------------------------------------------------------
function showToast(message) {
  let toast = document.getElementById("adminToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "adminToast";
    toast.className = "admin-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
