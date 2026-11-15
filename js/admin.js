// Cloud Technologies - Admin Control Panel Controller
// Credentials: username "cloud" / password "Cloud@2005"

const ADMIN_USER = "cloud";
const ADMIN_PASS = "Cloud@2005";
const SESSION_KEY = "cloudtech_admin_session";
const LEADS_KEY = "cloudtech_leads";
const MKT_LEADS_KEY = "cloudtech_marketing_leads";
const CONFIG_KEY = "cloudtech_site_config";
const CLIENTS_KEY = "cloudtech_clients";

// Default seed inquiries
const DEFAULT_LEADS = [
  {
    id: "LEAD-101",
    name: "Dr. Arvind Kulkarni",
    phone: "9822012345",
    service: "Website Development",
    requirements: "Need a clean, mobile-responsive clinic website with appointment booking and patient inquiry forms.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "New",
    adminNotes: "Consultation call scheduled on WhatsApp."
  },
  {
    id: "LEAD-102",
    name: "Shree Ganesh Electricals",
    phone: "8830464841",
    service: "Billing Software",
    requirements: "Need Cloud Billing Software for retail counter POS, GST invoicing, barcode scanning, and inventory stock tracking.",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: "Interested",
    adminNotes: "Demo demonstrated. Client reviewing pricing package."
  },
  {
    id: "LEAD-103",
    name: "SK Relax Studio",
    phone: "8830464841",
    service: "Digital Marketing / Meta Ads",
    requirements: "Targeted Instagram & Facebook campaigns for bridal packages and academy student enrollment.",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: "Converted",
    adminNotes: "Campaign launched successfully. Steady stream of WhatsApp leads."
  }
];

const DEFAULT_CLIENTS = [
  {
    id: "client-sk-relax",
    name: "SK Relax Beauty Academy & Salon",
    industry: "Beauty Academy & Salon",
    logo: "images/client-sk-relax.png",
    active: true
  },
  {
    id: "client-hiramoti",
    name: "HIRAMOTI Collection",
    industry: "Catalogue & Collections",
    logo: "images/client-hiramoti.png",
    active: true
  },
  {
    id: "client-mama",
    name: "Mama Pedhewale",
    industry: "Heritage Sweets & D2C",
    logo: "images/client-mama-pedhewale.png",
    active: true
  },
  {
    id: "client-mhaswadkar",
    name: "Mhaswadkar Machineries",
    industry: "Industrial Machinery Trading",
    logo: "images/client-mhaswadkar.svg",
    active: true
  },
  {
    id: "client-punita",
    name: "Punita Collection",
    industry: "Ethnic & Western Boutique",
    logo: "images/client-punita.svg",
    active: true
  },
  {
    id: "client-jogeshwari",
    name: "Jogeshwari Misal",
    industry: "Food & QSR Franchise",
    logo: "images/client-jogeshwari.svg",
    active: true
  }
];

const DEFAULT_CONFIG = {
  brandName: "Cloud Technologies",
  brandTag: "Digital Solutions & Software",
  directPhone: "8830464841",
  whatsappNumber: "8830464841",
  supportEmail: "contact@cloudtechnologies.in",
  uptimeBadge: "99.9% Uptime • Free SSL Security",
  deliveryBadge: "Rapid Solutions Deployment",
  heroTag: "Full-Service Digital Engineering & Growth",
  heroTitle: "Building Digital Solutions That Help <span class=\"highlight-blue\">Businesses Grow.</span>",
  heroDesc: "We help businesses establish their digital presence, automate everyday operations and reach more customers through modern websites, business software and result-driven digital marketing.",
  founderName: "Shashank Pawar",
  founderTitle: "Founder & Principal Solutions Architect",
  founderQuote: "Hi, I'm Shashank Pawar, Founder of Cloud Technologies. I work with businesses to turn their ideas and everyday operational challenges into practical digital solutions.",
  founderPhone: "8830464841"
};

// Application State
let leads = [];
let mktLeads = [];
let clients = [];
let siteConfig = {};
let currentLeadId = null;

document.addEventListener("DOMContentLoaded", () => {
  initAuth();
  if (checkSession()) {
    initStorage();
    initTabs();
    initLeadsTable();
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
      leads = JSON.parse(rawLeads);
      // Migrate old statuses if any
      leads.forEach(l => {
        if (!l.service && l.type) l.service = l.type;
        if (!l.requirements && l.notes) l.requirements = l.notes;
        if (l.status === "Converted / Won" || l.status === "Completed") l.status = "Converted";
        if (l.status === "Closed") l.status = "Not Interested";
        if (l.status === "Demo In Progress") l.status = "Interested";
      });
    }

    const rawClients = localStorage.getItem(CLIENTS_KEY);
    if (!rawClients) {
      clients = [...DEFAULT_CLIENTS];
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    } else {
      clients = JSON.parse(rawClients);
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

      if (targetId === "tab-clients") renderClientsManager();
    });
  });
}

// Dashboard Metrics
function renderDashboard() {
  updateMetrics();
  filterAndRenderLeads();
  renderClientsManager();
  populateConfigFields();
}

function updateMetrics() {
  const totalEl = document.getElementById("metricTotalRequests");
  const newEl = document.getElementById("metricNewRequests");
  const activeEl = document.getElementById("metricActiveDemos");
  const wonEl = document.getElementById("metricConvertedClients");

  const total = leads.length;
  const newCount = leads.filter(l => l.status === "New").length;
  const interested = leads.filter(l => l.status === "Interested" || l.status === "Contacted").length;
  const converted = leads.filter(l => l.status === "Converted").length;

  if (totalEl) totalEl.textContent = total;
  if (newEl) newEl.textContent = newCount;
  if (activeEl) activeEl.textContent = interested;
  if (wonEl) wonEl.textContent = converted;
}

// TAB 1: Inquiries Management
const VALID_STATUSES = ["New", "Contacted", "Interested", "Converted", "Not Interested"];

function initLeadsTable() {
  const searchInput = document.getElementById("leadSearchInput");
  const statusFilter = document.getElementById("leadStatusFilter");

  if (searchInput) searchInput.addEventListener("input", filterAndRenderLeads);
  if (statusFilter) statusFilter.addEventListener("change", filterAndRenderLeads);

  const saveNotesBtn = document.getElementById("btnSaveLeadNotes");
  if (saveNotesBtn) {
    saveNotesBtn.addEventListener("click", () => {
      if (!currentLeadId) return;
      const lead = leads.find(l => l.id === currentLeadId);
      if (lead) {
        lead.adminNotes = document.getElementById("modalLeadAdminNotes").value;
        const statusSelect = document.getElementById("modalLeadStatusSelect");
        if (statusSelect) lead.status = statusSelect.value;
        saveLeadsToStorage();
        updateMetrics();
        filterAndRenderLeads();
        closeLeadModal();
        showToast("Lead updated successfully.");
      }
    });
  }
}

function filterAndRenderLeads() {
  const tbody = document.getElementById("leadsTableBody");
  if (!tbody) return;

  const search = (document.getElementById("leadSearchInput")?.value || "").toLowerCase();
  const status = document.getElementById("leadStatusFilter")?.value || "all";

  const filtered = leads.filter(l => {
    const matchSearch = (l.name || "").toLowerCase().includes(search) ||
                        (l.phone || "").toLowerCase().includes(search) ||
                        (l.service || l.type || "").toLowerCase().includes(search) ||
                        (l.requirements || l.notes || "").toLowerCase().includes(search);
    const matchStatus = status === "all" || l.status === status;
    return matchSearch && matchStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--admin-text-muted); padding: 2.5rem;">No enquiries found matching your criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(l => {
    const dateStr = l.createdAt ? new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";
    const statusCls = getStatusClass(l.status);
    const serviceName = l.service || l.type || "General Inquiry";
    const reqText = l.requirements || l.notes || "No details provided";

    return `
      <tr>
        <td>
          <strong style="color: var(--admin-text); display: block;">${escapeHtml(l.name)}</strong>
          <span style="font-size: 0.74rem; color: var(--admin-text-muted);">${escapeHtml(l.id)}</span>
        </td>
        <td>
          <a href="https://wa.me/91${l.phone}" target="_blank" style="color: #25D366; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem;">
            💬 +91 ${escapeHtml(l.phone)}
          </a>
        </td>
        <td>
          <span class="type-pill" style="font-weight: 700;">${escapeHtml(serviceName)}</span>
        </td>
        <td style="max-width: 280px;">
          <div style="font-size: 0.84rem; color: var(--admin-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(reqText)}">
            ${escapeHtml(reqText)}
          </div>
        </td>
        <td style="font-size: 0.8rem; color: var(--admin-text-muted); white-space: nowrap;">
          ${escapeHtml(dateStr)}
        </td>
        <td>
          <select class="status-select ${statusCls}" onchange="changeLeadStatus('${l.id}', this.value)">
            ${VALID_STATUSES.map(s => `
              <option value="${s}" ${l.status === s ? "selected" : ""}>${s}</option>
            `).join("")}
          </select>
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="action-btn" onclick="openLeadModal('${l.id}')">View</button>
            <button class="action-btn" style="color: #DC2626;" onclick="deleteLead('${l.id}')">×</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function getStatusClass(status) {
  switch (status) {
    case "New": return "status-new";
    case "Contacted": return "status-contacted";
    case "Interested": return "status-demo";
    case "Converted": return "status-won";
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
  document.getElementById("modalLeadType").textContent = lead.service || lead.type || "Inquiry";
  document.getElementById("modalLeadIndustry").textContent = lead.requirements || lead.notes || "-";
  document.getElementById("modalLeadFeatures").textContent = lead.createdAt ? new Date(lead.createdAt).toLocaleString("en-IN") : "-";
  document.getElementById("modalLeadNotes").textContent = lead.requirements || lead.notes || "None";
  document.getElementById("modalLeadAdminNotes").value = lead.adminNotes || "";

  // WhatsApp quick button in modal
  const waBtn = document.getElementById("modalLeadWhatsAppLink");
  if (waBtn) {
    const waMsg = `Hi ${lead.name}! Shashank here from Cloud Technologies regarding your enquiry for ${lead.service || "our services"}. Let's discuss your requirements!`;
    waBtn.href = `https://wa.me/91${lead.phone}?text=${encodeURIComponent(waMsg)}`;
  }

  document.getElementById("leadDetailModal").style.display = "flex";
};

window.closeLeadModal = function() {
  document.getElementById("leadDetailModal").style.display = "none";
  currentLeadId = null;
};

window.deleteLead = function(leadId) {
  if (!confirm("Are you sure you want to delete this enquiry?")) return;
  leads = leads.filter(l => l.id !== leadId);
  saveLeadsToStorage();
  updateMetrics();
  filterAndRenderLeads();
  showToast("Enquiry deleted.");
};

window.exportLeadsCSV = function() {
  if (leads.length === 0) {
    alert("No enquiries available to export.");
    return;
  }
  const headers = ["ID", "Customer Name", "Mobile Number", "Service Requested", "Project Requirements", "Date Received", "Lead Status", "Admin Notes"];
  const rows = leads.map(l => [
    l.id,
    `"${(l.name || "").replace(/"/g, '""')}"`,
    l.phone,
    `"${(l.service || l.type || "").replace(/"/g, '""')}"`,
    `"${(l.requirements || l.notes || "").replace(/"/g, '""')}"`,
    l.createdAt || "",
    l.status || "New",
    `"${(l.adminNotes || "").replace(/"/g, '""')}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `cloud_technologies_enquiries_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function saveLeadsToStorage() {
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
}

// TAB 2: Client Collaborations Manager
function initClientsManager() {
  renderClientsManager();
}

function renderClientsManager() {
  const grid = document.getElementById("clientsManagerGrid");
  if (!grid) return;

  grid.innerHTML = clients.map(c => `
    <div style="background: #FFFFFF; border: 1px solid var(--admin-border); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1rem;">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div style="width: 74px; height: 50px; background: #F8FAFC; border: 1px solid var(--admin-border-subtle); border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 0.35rem;">
          <img src="${escapeHtml(c.logo)}" alt="${escapeHtml(c.name)}" style="max-height: 40px; max-width: 66px; object-fit: contain;">
        </div>
        <div>
          <strong style="display: block; font-size: 0.95rem; color: var(--admin-text);">${escapeHtml(c.name)}</strong>
          <span style="font-size: 0.78rem; color: var(--admin-text-muted);">${escapeHtml(c.industry)}</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--admin-border-subtle); padding-top: 0.85rem;">
        <span style="font-size: 0.82rem; font-weight: 700; color: ${c.active ? '#16A34A' : '#64748B'};">
          ${c.active ? '● Active' : '○ Inactive'}
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
    showToast(`${c.name} is now ${c.active ? 'Active' : 'Hidden'}.`);
  }
};

window.openAddClientModal = function() {
  const name = prompt("Enter Client / Brand Name:");
  if (!name) return;
  const industry = prompt("Enter Industry / Solution Type:", "Satara Business");
  const logo = prompt("Enter Logo Image Path (e.g. images/client-jogeshwari.svg):", "images/cloud-logo.png");

  const newClient = {
    id: "client_" + Date.now(),
    name,
    industry: industry || "Business Solution",
    logo: logo || "images/cloud-logo.png",
    active: true
  };

  clients.push(newClient);
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  renderClientsManager();
  showToast(`Added ${name} to Collaborations.`);
};

// TAB 3: Website Content & Settings Editor
function initConfigEditor() {
  const form = document.getElementById("siteConfigForm");
  const resetBtn = document.getElementById("btnResetConfig");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      siteConfig = {
        brandName: document.getElementById("cfgBrandName")?.value.trim() || siteConfig.brandName,
        brandTag: document.getElementById("cfgBrandTag")?.value.trim() || siteConfig.brandTag,
        directPhone: document.getElementById("cfgDirectPhone")?.value.trim() || siteConfig.directPhone,
        whatsappNumber: document.getElementById("cfgWhatsappNumber")?.value.trim() || siteConfig.whatsappNumber,
        supportEmail: document.getElementById("cfgSupportEmail")?.value.trim() || siteConfig.supportEmail,
        uptimeBadge: document.getElementById("cfgUptimeBadge")?.value.trim() || siteConfig.uptimeBadge,
        deliveryBadge: document.getElementById("cfgDeliveryBadge")?.value.trim() || siteConfig.deliveryBadge,
        heroTag: document.getElementById("cfgHeroTag")?.value.trim() || siteConfig.heroTag,
        heroTitle: document.getElementById("cfgHeroTitle")?.value.trim() || siteConfig.heroTitle,
        heroDesc: document.getElementById("cfgHeroDesc")?.value.trim() || siteConfig.heroDesc,
        founderName: document.getElementById("cfgFounderName")?.value.trim() || siteConfig.founderName,
        founderTitle: document.getElementById("cfgFounderTitle")?.value.trim() || siteConfig.founderTitle,
        founderQuote: document.getElementById("cfgFounderQuote")?.value.trim() || siteConfig.founderQuote
      };
      localStorage.setItem(CONFIG_KEY, JSON.stringify(siteConfig));
      showToast("Website settings saved. Live changes will reflect on reload!");
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Reset all settings to default values?")) {
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
