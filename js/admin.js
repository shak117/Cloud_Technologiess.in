// Cloud Technologies - Admin Control Panel Controller
// Credentials: username "cloud" / password "Cloud@2005"

const ADMIN_USER = "cloud";
const ADMIN_PASS = "Cloud@2005";
const SESSION_KEY = "cloudtech_admin_session";
const LEADS_KEY = "cloudtech_leads";
const MKT_LEADS_KEY = "cloudtech_marketing_leads";
const CONFIG_KEY = "cloudtech_site_config";
const CLIENTS_KEY = "cloudtech_clients";

const DEFAULT_LEADS = [
  {
    id: "REQ-SKRELAX",
    type: "Digital Marketing",
    name: "SK Relax Studio",
    industry: "Beauty Academy & Salon",
    phone: "8830464841",
    features: ["Targeted Meta Ads", "WhatsApp Funnel", "Reel Video Shoots"],
    notes: "Academy course admissions and premium bridal service campaign requested.",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: "Converted / Won",
    adminNotes: "Client live! Significant increase in direct WhatsApp consultation leads."
  },
  {
    id: "REQ-HIRAMOTI",
    type: "Digital Catalogue",
    name: "HIRAMOTI Collection",
    industry: "Catalogue & Collections",
    phone: "8830464841",
    features: ["Digital Catalogue", "Mobile Speed Optimization", "WhatsApp Direct Order"],
    notes: "High-speed mobile showcase for seasonal collections.",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    status: "Completed",
    adminNotes: "Digital showcase platform deployed and running."
  },
  {
    id: "REQ-MHASWADKAR",
    type: "Industrial Platform",
    name: "Mhaswadkar Machineries",
    industry: "Machineries & Equipment Trading",
    phone: "8830464841",
    features: ["Product Showcase", "B2B Lead Funnel", "Hosting Infrastructure"],
    notes: "Industrial machinery inquiries from Satara and Western Maharashtra.",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: "New",
    adminNotes: "Follow up scheduled on WhatsApp."
  }
];

const DEFAULT_CLIENTS = [
  {
    id: "client-sk-relax",
    name: "SK Relax Studio",
    industry: "Beauty Academy & Salon",
    logo: "images/client-sk-relax.png",
    badge: "Satara",
    active: true
  },
  {
    id: "client-hiramoti",
    name: "HIRAMOTI Collection",
    industry: "Catalogue & Collections",
    logo: "images/client-hiramoti.png",
    badge: "E-Catalogue",
    active: true
  },
  {
    id: "client-mhaswadkar",
    name: "Mhaswadkar Machineries",
    industry: "Machineries Trading Co.",
    logo: "images/client-mhaswadkar.svg",
    badge: "Industrial",
    active: true
  },
  {
    id: "client-mahajan",
    name: "Mahajan Hospital",
    industry: "Healthcare & Clinic Services",
    logo: "images/cloud-logo.png",
    badge: "Healthcare",
    active: false
  }
];

const DEFAULT_CONFIG = {
  brandName: "Cloud Technologies",
  brandTag: "Digital Solutions & Cloud Agency",
  directPhone: "8830464841",
  whatsappNumber: "8830464841",
  supportEmail: "contact@cloudtechnologies.in",
  uptimeBadge: "99.9% Uptime • Free SSL Security",
  deliveryBadge: "Rapid Campaign Deployment",
  heroTag: "Full-Service Digital Engineering & Growth",
  heroTitle: "Digital Solutions to Grow <span class=\"highlight-blue\">Your Business</span>",
  heroDesc: "We build modern websites, powerful web applications and run result-driven digital marketing campaigns to help businesses in Satara go online, get customers and grow.",
  demoCalloutTitle: "Interactive Demo Website Built As Per Your Demand",
  demoCalloutDesc: "Want to see how your site looks & works before committing? We build a working demo prototype tailored to your exact industry. 100% Free!",
  founderName: "Shashank Pawar",
  founderTitle: "Founder & Principal Solutions Architect",
  founderQuote: "We founded Cloud Technologies to bring high-performance web engineering, data-driven Meta ads, and robust cloud infrastructure to ambitious businesses in Satara and across India.",
  founderPhone: "8830464841"
};

// Application State
let leads = [];
let mktLeads = [];
let clients = [];
let siteConfig = {};
let currentLeadId = null;
let currentMktLeadId = null;

document.addEventListener("DOMContentLoaded", () => {
  initAuth();
  if (checkSession()) {
    initStorage();
    initTabs();
    initLeadsTable();
    initMarketingTable();
    initClientsManager();
    initConfigEditor();
    renderDashboard();
  }
});

// Authentication
function initAuth() {
  const loginForm = document.getElementById("adminLoginForm");
  const overlay = document.getElementById("adminLoginOverlay");
  const logoutBtn = document.getElementById("adminLogoutBtn");
  const loginError = document.getElementById("loginError");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const u = document.getElementById("adminUsername").value.trim();
      const p = document.getElementById("adminPassword").value.trim();

      if (u === ADMIN_USER && p === ADMIN_PASS) {
        sessionStorage.setItem(SESSION_KEY, "authenticated");
        overlay.style.display = "none";
        loginError.style.display = "none";
        initStorage();
        initTabs();
        initLeadsTable();
        initMarketingTable();
        initClientsManager();
        initConfigEditor();
        renderDashboard();
        showToast("Welcome to Cloud Technologies Admin Panel!");
      } else {
        loginError.style.display = "block";
        loginError.textContent = "Invalid username or password. Please try again.";
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.reload();
    });
  }
}

function checkSession() {
  const isAuth = sessionStorage.getItem(SESSION_KEY) === "authenticated";
  const overlay = document.getElementById("adminLoginOverlay");
  if (overlay) {
    overlay.style.display = isAuth ? "none" : "flex";
  }
  return isAuth;
}

// Storage Initialization
function initStorage() {
  try {
    const rawLeads = localStorage.getItem(LEADS_KEY);
    if (!rawLeads) {
      leads = [...DEFAULT_LEADS];
      localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    } else {
      leads = JSON.parse(rawLeads).filter(l => !/mama|pedhewale|punita/i.test(l.name));
    }

    const rawMkt = localStorage.getItem(MKT_LEADS_KEY);
    if (!rawMkt) {
      mktLeads = [];
      localStorage.setItem(MKT_LEADS_KEY, JSON.stringify(mktLeads));
    } else {
      mktLeads = JSON.parse(rawMkt);
    }

    const rawClients = localStorage.getItem(CLIENTS_KEY);
    if (!rawClients) {
      clients = [...DEFAULT_CLIENTS];
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    } else {
      clients = JSON.parse(rawClients).filter(c => !/mama|pedhewale|punita/i.test(c.name));
      if (clients.length === 0) clients = [...DEFAULT_CLIENTS];
    }

    const rawConfig = localStorage.getItem(CONFIG_KEY);
    if (!rawConfig) {
      siteConfig = { ...DEFAULT_CONFIG };
      localStorage.setItem(CONFIG_KEY, JSON.stringify(siteConfig));
    } else {
      siteConfig = JSON.parse(rawConfig);
    }
  } catch (err) {
    console.warn("Storage error in admin:", err);
    leads = [...DEFAULT_LEADS];
    clients = [...DEFAULT_CLIENTS];
    siteConfig = { ...DEFAULT_CONFIG };
  }
}

// Tabs Handling
function initTabs() {
  const tabBtns = document.querySelectorAll(".admin-tab-btn");
  const tabPanes = document.querySelectorAll(".admin-tab-pane");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");
      tabBtns.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.style.display = "none");

      btn.classList.add("active");
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.style.display = "block";

      if (targetId === "tab-marketing-leads") renderMarketingTable();
      if (targetId === "tab-clients") renderClientsManager();
    });
  });
}

// Dashboard Metrics
function renderDashboard() {
  updateMetrics();
  filterAndRenderLeads();
  renderMarketingTable();
  renderClientsManager();
  populateConfigFields();
}

function updateMetrics() {
  const totalEl = document.getElementById("metricTotalRequests");
  const newEl = document.getElementById("metricNewRequests");
  const activeEl = document.getElementById("metricActiveDemos");
  const wonEl = document.getElementById("metricConvertedClients");

  const total = leads.length + mktLeads.length;
  const newCount = leads.filter(l => l.status === "New").length + mktLeads.filter(m => m.status === "New").length;
  const inProgress = leads.filter(l => l.status === "Demo In Progress" || l.status === "Contacted").length;
  const won = leads.filter(l => l.status === "Converted / Won" || l.status === "Completed" || l.status === "Active Client").length;

  if (totalEl) totalEl.textContent = total;
  if (newEl) newEl.textContent = newCount;
  if (activeEl) activeEl.textContent = inProgress;
  if (wonEl) wonEl.textContent = won;

  const mktBadge = document.getElementById("mktBadgeCount");
  if (mktBadge) mktBadge.textContent = mktLeads.length;
}

// TAB 1: Proposals & Demos Table
function initLeadsTable() {
  const searchInput = document.getElementById("leadSearchInput");
  const statusFilter = document.getElementById("leadStatusFilter");
  const typeFilter = document.getElementById("leadTypeFilter");

  if (searchInput) searchInput.addEventListener("input", filterAndRenderLeads);
  if (statusFilter) statusFilter.addEventListener("change", filterAndRenderLeads);
  if (typeFilter) typeFilter.addEventListener("change", filterAndRenderLeads);

  const saveNotesBtn = document.getElementById("btnSaveLeadNotes");
  if (saveNotesBtn) {
    saveNotesBtn.addEventListener("click", () => {
      if (!currentLeadId) return;
      const lead = leads.find(l => l.id === currentLeadId);
      if (lead) {
        const notes = document.getElementById("modalLeadAdminNotes").value;
        lead.adminNotes = notes;
        saveLeadsToStorage();
        filterAndRenderLeads();
        closeLeadModal();
        showToast("Lead notes updated successfully.");
      }
    });
  }
}

function filterAndRenderLeads() {
  const tbody = document.getElementById("leadsTableBody");
  if (!tbody) return;

  const search = (document.getElementById("leadSearchInput")?.value || "").toLowerCase();
  const status = document.getElementById("leadStatusFilter")?.value || "all";
  const type = document.getElementById("leadTypeFilter")?.value || "all";

  const filtered = leads.filter(l => {
    const matchSearch = (l.name || "").toLowerCase().includes(search) ||
                        (l.phone || "").toLowerCase().includes(search) ||
                        (l.industry || "").toLowerCase().includes(search);
    const matchStatus = status === "all" || l.status === status;
    const matchType = type === "all" || l.type === type;
    return matchSearch && matchStatus && matchType;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--admin-text-muted); padding: 2rem;">No matching inquiries found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(l => {
    const dateStr = l.createdAt ? new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-";
    const statusCls = getStatusClass(l.status);
    return `
      <tr>
        <td><strong>${escapeHtml(l.id)}</strong></td>
        <td>
          <div style="font-weight: 700; color: var(--admin-text);">${escapeHtml(l.name)}</div>
          <div style="font-size: 0.78rem; color: var(--admin-text-muted);">${escapeHtml(l.industry || "")}</div>
        </td>
        <td>
          <a href="https://wa.me/91${l.phone}" target="_blank" style="color: #25D366; font-weight: 600; text-decoration: none;">
            +91 ${escapeHtml(l.phone)}
          </a>
        </td>
        <td><span class="type-pill">${escapeHtml(l.type || "Inquiry")}</span></td>
        <td>
          <select class="status-select ${statusCls}" onchange="changeLeadStatus('${l.id}', this.value)">
            ${["New", "Contacted", "Demo In Progress", "Converted / Won", "Completed", "Closed"].map(s => `
              <option value="${s}" ${l.status === s ? "selected" : ""}>${s}</option>
            `).join("")}
          </select>
        </td>
        <td>
          <button class="action-btn" onclick="openLeadModal('${l.id}')">View Details</button>
        </td>
      </tr>
    `;
  }).join("");
}

function getStatusClass(status) {
  switch (status) {
    case "New": return "status-new";
    case "Contacted": return "status-contacted";
    case "Demo In Progress": return "status-demo";
    case "Converted / Won": return "status-won";
    case "Completed": return "status-won";
    default: return "status-closed";
  }
}

window.changeLeadStatus = function(leadId, newStatus) {
  const lead = leads.find(l => l.id === leadId);
  if (lead) {
    lead.status = newStatus;
    saveLeadsToStorage();
    updateMetrics();
    filterAndRenderLeads();
    showToast(`Status updated to "${newStatus}"`);
  }
};

window.openLeadModal = function(leadId) {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;
  currentLeadId = leadId;

  document.getElementById("modalLeadClientName").textContent = lead.name;
  document.getElementById("modalLeadPhone").textContent = "+91 " + lead.phone;
  document.getElementById("modalLeadType").textContent = lead.type;
  document.getElementById("modalLeadIndustry").textContent = lead.industry || "-";
  document.getElementById("modalLeadFeatures").textContent = Array.isArray(lead.features) ? lead.features.join(", ") : "-";
  document.getElementById("modalLeadNotes").textContent = lead.notes || "None";
  document.getElementById("modalLeadAdminNotes").value = lead.adminNotes || "";

  document.getElementById("leadDetailModal").style.display = "flex";
};

window.closeLeadModal = function() {
  document.getElementById("leadDetailModal").style.display = "none";
  currentLeadId = null;
};

function saveLeadsToStorage() {
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
}

// TAB 2: Digital Marketing Inquiries Table
function initMarketingTable() {
  const searchInput = document.getElementById("mktSearchInput");
  const statusFilter = document.getElementById("mktStatusFilter");
  const budgetFilter = document.getElementById("mktBudgetFilter");
  const exportBtn = document.getElementById("btnExportMktCsv");

  if (searchInput) searchInput.addEventListener("input", renderMarketingTable);
  if (statusFilter) statusFilter.addEventListener("change", renderMarketingTable);
  if (budgetFilter) budgetFilter.addEventListener("change", renderMarketingTable);

  if (exportBtn) {
    exportBtn.addEventListener("click", exportMarketingCsv);
  }

  const saveMktStatusBtn = document.getElementById("btnSaveMktStatus");
  if (saveMktStatusBtn) {
    saveMktStatusBtn.addEventListener("click", () => {
      if (!currentMktLeadId) return;
      const lead = mktLeads.find(m => m.id === currentMktLeadId);
      if (lead) {
        lead.status = document.getElementById("mktModalStatusSelect").value;
        localStorage.setItem(MKT_LEADS_KEY, JSON.stringify(mktLeads));
        renderMarketingTable();
        updateMetrics();
        closeMktModal();
        showToast("Marketing inquiry status updated.");
      }
    });
  }
}

function renderMarketingTable() {
  const tbody = document.getElementById("mktTableBody");
  if (!tbody) return;

  const search = (document.getElementById("mktSearchInput")?.value || "").toLowerCase();
  const status = document.getElementById("mktStatusFilter")?.value || "all";
  const budget = document.getElementById("mktBudgetFilter")?.value || "all";

  const filtered = mktLeads.filter(m => {
    const matchSearch = (m.fullName || "").toLowerCase().includes(search) ||
                        (m.brandName || "").toLowerCase().includes(search) ||
                        (m.location || "").toLowerCase().includes(search) ||
                        (m.phone || "").toLowerCase().includes(search);
    const matchStatus = status === "all" || m.status === status;
    const matchBudget = budget === "all" || m.adBudget === budget;
    return matchSearch && matchStatus && matchBudget;
  });

  const mktBadge = document.getElementById("mktBadgeCount");
  if (mktBadge) mktBadge.textContent = mktLeads.length;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--admin-text-muted); padding: 2.5rem;">No digital marketing inquiries found. Submissions from <code>digital-marketing-enquiry.html</code> will appear here automatically!</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(m => {
    const dateStr = m.submittedAt ? new Date(m.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";
    return `
      <tr>
        <td style="font-size: 0.8rem; color: var(--admin-text-muted);">${escapeHtml(dateStr)}</td>
        <td>
          <div style="font-weight: 700; color: var(--admin-text);">${escapeHtml(m.brandName)}</div>
          <div style="font-size: 0.8rem; color: var(--admin-text-muted);">By ${escapeHtml(m.fullName)}</div>
        </td>
        <td>
          <a href="https://wa.me/91${m.phone}" target="_blank" style="color: #25D366; font-weight: 700; text-decoration: none;">
            +91 ${escapeHtml(m.phone)}
          </a>
        </td>
        <td>
          <div style="font-size: 0.84rem;">${escapeHtml(m.category)}</div>
          <div style="font-size: 0.76rem; color: var(--admin-text-muted);">📍 ${escapeHtml(m.location)}</div>
        </td>
        <td>
          <span style="font-weight: 700; color: #2563EB; font-size: 0.84rem;">${escapeHtml(m.adBudget)}</span>
        </td>
        <td>
          <span style="font-size: 0.8rem; color: var(--admin-text-secondary);">${escapeHtml(m.challenge || "-")}</span>
        </td>
        <td>
          <span class="type-pill" style="background: rgba(37, 99, 235, 0.1); color: #2563EB;">${escapeHtml(m.status || "New")}</span>
        </td>
        <td>
          <div style="display: flex; gap: 0.35rem;">
            <button class="action-btn" onclick="openMktModal('${m.id}')">View</button>
            <button class="action-btn" style="color: #DC2626;" onclick="deleteMktLead('${m.id}')">×</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

window.openMktModal = function(mktId) {
  const m = mktLeads.find(l => l.id === mktId);
  if (!m) return;
  currentMktLeadId = mktId;

  document.getElementById("mktModalName").textContent = m.fullName;
  document.getElementById("mktModalBrand").textContent = m.brandName;
  document.getElementById("mktModalPhone").textContent = "+91 " + m.phone;
  document.getElementById("mktModalCategory").textContent = m.category;
  document.getElementById("mktModalLocation").textContent = m.location;
  document.getElementById("mktModalUrl").textContent = m.url || "None provided";
  document.getElementById("mktModalBudget").textContent = m.adBudget;
  document.getElementById("mktModalServices").textContent = Array.isArray(m.services) ? m.services.join(", ") : "-";
  document.getElementById("mktModalChallenge").textContent = m.challenge;
  document.getElementById("mktModalNotes").textContent = m.notes || "None";
  document.getElementById("mktModalStatusSelect").value = m.status || "New";

  const waBtn = document.getElementById("mktModalWhatsAppBtn");
  if (waBtn) {
    const waText = `Hi ${m.fullName}! Shashank here from Cloud Technologies regarding your marketing inquiry for ${m.brandName}. Let's discuss your ad strategy!`;
    waBtn.href = `https://wa.me/91${m.phone}?text=${encodeURIComponent(waText)}`;
  }

  document.getElementById("mktDetailModal").style.display = "flex";
};

window.closeMktModal = function() {
  document.getElementById("mktDetailModal").style.display = "none";
  currentMktLeadId = null;
};

window.deleteMktLead = function(mktId) {
  if (!confirm("Are you sure you want to delete this marketing enquiry?")) return;
  mktLeads = mktLeads.filter(m => m.id !== mktId);
  localStorage.setItem(MKT_LEADS_KEY, JSON.stringify(mktLeads));
  renderMarketingTable();
  updateMetrics();
  showToast("Enquiry deleted.");
};

function exportMarketingCsv() {
  if (mktLeads.length === 0) {
    alert("No marketing leads to export.");
    return;
  }
  const headers = ["ID", "Submitted At", "Client Name", "Brand Name", "WhatsApp", "Category", "Location", "Website URL", "Monthly Ad Budget", "Primary Challenge", "Services", "Notes", "Status"];
  const rows = mktLeads.map(m => [
    m.id,
    m.submittedAt,
    `"${(m.fullName || "").replace(/"/g, '""')}"`,
    `"${(m.brandName || "").replace(/"/g, '""')}"`,
    m.phone,
    `"${(m.category || "").replace(/"/g, '""')}"`,
    `"${(m.location || "").replace(/"/g, '""')}"`,
    `"${(m.url || "").replace(/"/g, '""')}"`,
    `"${(m.adBudget || "").replace(/"/g, '""')}"`,
    `"${(m.challenge || "").replace(/"/g, '""')}"`,
    `"${(Array.isArray(m.services) ? m.services.join(", ") : "").replace(/"/g, '""')}"`,
    `"${(m.notes || "").replace(/"/g, '""')}"`,
    m.status || "New"
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `cloud_marketing_leads_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// TAB 3: Client Collaborations Manager
function initClientsManager() {
  renderClientsManager();
}

function renderClientsManager() {
  const grid = document.getElementById("clientsManagerGrid");
  if (!grid) return;

  grid.innerHTML = clients.map(c => `
    <div style="background: #FFFFFF; border: 1px solid var(--admin-border); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1rem;">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div style="width: 80px; height: 50px; background: #F8FAFC; border: 1px solid var(--admin-border-subtle); border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 0.35rem;">
          <img src="${escapeHtml(c.logo)}" alt="${escapeHtml(c.name)}" style="max-height: 40px; max-width: 70px; object-fit: contain;">
        </div>
        <div>
          <strong style="display: block; font-size: 0.95rem; color: var(--admin-text);">${escapeHtml(c.name)}</strong>
          <span style="font-size: 0.78rem; color: var(--admin-text-muted);">${escapeHtml(c.industry)}</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--admin-border-subtle); padding-top: 0.85rem;">
        <span style="font-size: 0.82rem; font-weight: 700; color: ${c.active ? '#16A34A' : '#64748B'};">
          ${c.active ? '● Active on Homepage' : '○ Inactive / Hidden'}
        </span>
        <button class="action-btn" onclick="toggleClientStatus('${c.id}')" style="font-weight: 700;">
          ${c.active ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  `).join("");
}

window.toggleClientStatus = function(clientId) {
  const c = clients.find(item => item.id === clientId);
  if (c) {
    c.active = !c.active;
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    renderClientsManager();
    showToast(`${c.name} is now ${c.active ? 'Active' : 'Hidden'} on website.`);
  }
};

window.openAddClientModal = function() {
  const name = prompt("Enter Client / Brand Name:");
  if (!name) return;
  const industry = prompt("Enter Industry / Subtitle:", "Satara Business");
  const logo = prompt("Enter Logo Image Path (e.g. images/client-mahajan.png):", "images/cloud-logo.png");

  const newClient = {
    id: "client_" + Date.now(),
    name,
    industry: industry || "Business",
    logo: logo || "images/cloud-logo.png",
    badge: "Verified",
    active: true
  };

  clients.push(newClient);
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  renderClientsManager();
  showToast(`Added ${name} to Collaborations.`);
};

// TAB 4: Website Content & Settings Editor
function initConfigEditor() {
  const form = document.getElementById("siteConfigForm");
  const resetBtn = document.getElementById("btnResetConfig");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      siteConfig = {
        brandName: document.getElementById("cfgBrandName").value.trim(),
        brandTag: document.getElementById("cfgBrandTag").value.trim(),
        directPhone: document.getElementById("cfgDirectPhone").value.trim(),
        whatsappNumber: document.getElementById("cfgWhatsappNumber").value.trim(),
        supportEmail: document.getElementById("cfgSupportEmail").value.trim(),
        uptimeBadge: document.getElementById("cfgUptimeBadge").value.trim(),
        deliveryBadge: document.getElementById("cfgDeliveryBadge").value.trim(),
        heroTag: document.getElementById("cfgHeroTag").value.trim(),
        heroTitle: document.getElementById("cfgHeroTitle").value.trim(),
        heroDesc: document.getElementById("cfgHeroDesc").value.trim(),
        demoCalloutTitle: document.getElementById("cfgDemoCalloutTitle").value.trim(),
        demoCalloutDesc: document.getElementById("cfgDemoCalloutDesc").value.trim(),
        founderName: document.getElementById("cfgFounderName").value.trim(),
        founderTitle: document.getElementById("cfgFounderTitle").value.trim(),
        founderQuote: document.getElementById("cfgFounderQuote").value.trim()
      };
      localStorage.setItem(CONFIG_KEY, JSON.stringify(siteConfig));
      showToast("Website settings saved. Live changes will reflect on reload!");
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Reset all settings to default Cloud Technologies values?")) {
        siteConfig = { ...DEFAULT_CONFIG };
        localStorage.setItem(CONFIG_KEY, JSON.stringify(siteConfig));
        populateConfigFields();
        showToast("Settings reset to defaults.");
      }
    });
  }
}

function populateConfigFields() {
  for (const [key, val] of Object.entries(siteConfig)) {
    const elId = "cfg" + key.charAt(0).toUpperCase() + key.slice(1);
    const el = document.getElementById(elId);
    if (el) el.value = val;
  }
}

// Toast Helper
function showToast(msg) {
  const toast = document.getElementById("adminToast");
  if (!toast) return;
  toast.textContent = msg;
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
