const ADMIN_API_BASE = window.ADMIN_API_BASE || (
  window.location.protocol === "file:" ? "http://localhost:3000/api" : "/api"
);

const tokenKey = "adminToken";
const loginPanel = document.querySelector("#loginPanel");
const adminPanel = document.querySelector("#adminPanel");
const adminLoginForm = document.querySelector("#adminLoginForm");
const adminEmail = document.querySelector("#adminEmail");
const adminPassword = document.querySelector("#adminPassword");
const loginBtn = document.querySelector("#loginBtn");
const loginStatus = document.querySelector("#loginStatus");
const refreshBtn = document.querySelector("#refreshBtn");
const exportCsvBtn = document.querySelector("#exportCsvBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const statGrid = document.querySelector("#statGrid");
const leadsList = document.querySelector("#leadsList");
const leadCountLabel = document.querySelector("#leadCountLabel");
const programInterestList = document.querySelector("#programInterestList");
const reportStartDate = document.querySelector("#reportStartDate");
const reportEndDate = document.querySelector("#reportEndDate");
const reportRefreshBtn = document.querySelector("#reportRefreshBtn");
const reportExportBtn = document.querySelector("#reportExportBtn");
const reportStatus = document.querySelector("#reportStatus");
const reportSummaryGrid = document.querySelector("#reportSummaryGrid");
const reportStatusList = document.querySelector("#reportStatusList");
const reportDailyList = document.querySelector("#reportDailyList");
const reportProgramList = document.querySelector("#reportProgramList");
const reportSourceList = document.querySelector("#reportSourceList");
const reportAdvisorList = document.querySelector("#reportAdvisorList");
const leadSearch = document.querySelector("#leadSearch");
const statusFilter = document.querySelector("#statusFilter");
const leadPageSize = document.querySelector("#leadPageSize");
const leadPrevBtn = document.querySelector("#leadPrevBtn");
const leadNextBtn = document.querySelector("#leadNextBtn");
const leadPageLabel = document.querySelector("#leadPageLabel");
const notificationStatusFilter = document.querySelector("#notificationStatusFilter");
const notificationTypeFilter = document.querySelector("#notificationTypeFilter");
const notificationPageSize = document.querySelector("#notificationPageSize");
const notificationPrevBtn = document.querySelector("#notificationPrevBtn");
const notificationNextBtn = document.querySelector("#notificationNextBtn");
const notificationPageLabel = document.querySelector("#notificationPageLabel");
const notificationCountLabel = document.querySelector("#notificationCountLabel");
const notificationList = document.querySelector("#notificationList");
const markAllNotificationsBtn = document.querySelector("#markAllNotificationsBtn");
const messageTemplateCountLabel = document.querySelector("#messageTemplateCountLabel");
const messageTemplateList = document.querySelector("#messageTemplateList");
const messageDeliverySearch = document.querySelector("#messageDeliverySearch");
const messageDeliveryChannelFilter = document.querySelector("#messageDeliveryChannelFilter");
const messageDeliveryStatusFilter = document.querySelector("#messageDeliveryStatusFilter");
const messageDeliveryPageSize = document.querySelector("#messageDeliveryPageSize");
const messageDeliveryPrevBtn = document.querySelector("#messageDeliveryPrevBtn");
const messageDeliveryNextBtn = document.querySelector("#messageDeliveryNextBtn");
const messageDeliveryPageLabel = document.querySelector("#messageDeliveryPageLabel");
const messageDeliveryCountLabel = document.querySelector("#messageDeliveryCountLabel");
const messageDeliveryList = document.querySelector("#messageDeliveryList");
const adminNotice = document.querySelector("#adminNotice");
const roleScopeNotice = document.querySelector("#roleScopeNotice");
const themeToggle = document.querySelector("#themeToggle");
const themeToggleText = document.querySelector("#themeToggleText");
const adminTabs = document.querySelectorAll("[data-admin-tab]");
const adminPanels = document.querySelectorAll("[data-admin-panel]");
const programForm = document.querySelector("#programForm");
const programFormTitle = document.querySelector("#programFormTitle");
const programSaveBtn = document.querySelector("#programSaveBtn");
const programResetBtn = document.querySelector("#programResetBtn");
const programList = document.querySelector("#programList");
const programCountLabel = document.querySelector("#programCountLabel");
const programSearch = document.querySelector("#programSearch");
const programStatusFilter = document.querySelector("#programStatusFilter");
const programPageSize = document.querySelector("#programPageSize");
const programPrevBtn = document.querySelector("#programPrevBtn");
const programNextBtn = document.querySelector("#programNextBtn");
const programPageLabel = document.querySelector("#programPageLabel");
const programImportForm = document.querySelector("#programImportForm");
const programImportFile = document.querySelector("#programImportFile");
const programImportMode = document.querySelector("#programImportMode");
const programImportText = document.querySelector("#programImportText");
const programImportBtn = document.querySelector("#programImportBtn");
const programTemplateBtn = document.querySelector("#programTemplateBtn");
const programImportResult = document.querySelector("#programImportResult");
const leadDetailModal = document.querySelector("#leadDetailModal");
const leadDetailClose = document.querySelector("#leadDetailClose");
const leadDetailTitle = document.querySelector("#leadDetailTitle");
const leadDetailMeta = document.querySelector("#leadDetailMeta");
const leadDetailPrograms = document.querySelector("#leadDetailPrograms");
const leadActivityList = document.querySelector("#leadActivityList");
const leadMessageForm = document.querySelector("#leadMessageForm");
const leadMessageChannel = document.querySelector("#leadMessageChannel");
const leadMessageTemplate = document.querySelector("#leadMessageTemplate");
const leadMessageSubject = document.querySelector("#leadMessageSubject");
const leadMessageBody = document.querySelector("#leadMessageBody");
const leadMessageSendBtn = document.querySelector("#leadMessageSendBtn");
const leadMessageStatus = document.querySelector("#leadMessageStatus");
const activityForm = document.querySelector("#activityForm");
const activitySaveBtn = document.querySelector("#activitySaveBtn");
const userForm = document.querySelector("#userForm");
const userFormTitle = document.querySelector("#userFormTitle");
const userSaveBtn = document.querySelector("#userSaveBtn");
const userResetBtn = document.querySelector("#userResetBtn");
const userList = document.querySelector("#userList");
const userCountLabel = document.querySelector("#userCountLabel");
const settingsForm = document.querySelector("#settingsForm");
const settingsSaveBtn = document.querySelector("#settingsSaveBtn");
const settingsStatus = document.querySelector("#settingsStatus");
const crmForm = document.querySelector("#crmForm");
const crmSaveBtn = document.querySelector("#crmSaveBtn");
const crmTestBtn = document.querySelector("#crmTestBtn");
const crmStatus = document.querySelector("#crmStatus");
const crmDeliverySearch = document.querySelector("#crmDeliverySearch");
const crmDeliveryStatusFilter = document.querySelector("#crmDeliveryStatusFilter");
const crmDeliveryEventFilter = document.querySelector("#crmDeliveryEventFilter");
const crmDeliveryPageSize = document.querySelector("#crmDeliveryPageSize");
const crmDeliveryPrevBtn = document.querySelector("#crmDeliveryPrevBtn");
const crmDeliveryNextBtn = document.querySelector("#crmDeliveryNextBtn");
const crmDeliveryPageLabel = document.querySelector("#crmDeliveryPageLabel");
const crmDeliveryCountLabel = document.querySelector("#crmDeliveryCountLabel");
const crmDeliveryList = document.querySelector("#crmDeliveryList");
const auditSearch = document.querySelector("#auditSearch");
const auditActionFilter = document.querySelector("#auditActionFilter");
const auditEntityFilter = document.querySelector("#auditEntityFilter");
const auditPageSize = document.querySelector("#auditPageSize");
const auditPrevBtn = document.querySelector("#auditPrevBtn");
const auditNextBtn = document.querySelector("#auditNextBtn");
const auditPageLabel = document.querySelector("#auditPageLabel");
const auditCountLabel = document.querySelector("#auditCountLabel");
const auditList = document.querySelector("#auditList");

const statusLabels = {
  new: "Yeni",
  contacted: "Görüşüldü",
  appointment: "Randevu",
  applied: "Başvurdu",
  enrolled: "Kayıt oldu",
  lost: "Vazgeçti",
  qualified: "Takipte",
  archived: "Arşiv"
};

const activityTypeLabels = {
  note: "Not",
  call: "Telefon",
  meeting: "Görüşme",
  email: "E-posta",
  appointment: "Randevu",
  system: "Sistem"
};

const roleLabels = {
  admin: "Admin",
  advisor: "Danışman",
  editor: "Editör"
};

const roleScopeLabels = {
  admin: "Tüm aday, rapor, mesajlaşma, katalog ve sistem ayarlarına tam erişim.",
  advisor: "Sadece sana atanmış ve henüz atanmamış adaylar; bu adayların rapor, bildirim ve mesaj geçmişi.",
  editor: "Aday verisi kapalı; program kataloğu ve yayın/pasif yönetimi açık."
};

const notificationTypeLabels = {
  new_lead: "Yeni aday",
  follow_up: "Takip",
  appointment: "Randevu",
  system: "Sistem"
};

const auditActionLabels = {
  login: "Giriş",
  create: "Oluşturma",
  update: "Güncelleme",
  delete: "Silme / pasife alma",
  import: "Import"
};

const auditEntityLabels = {
  session: "Oturum",
  lead: "Aday",
  lead_activity: "Aday geçmişi",
  program: "Program",
  program_import: "Program import",
  admin_user: "Kullanıcı",
  site_settings: "Site ayarları",
  notification: "Bildirim",
  crm_integration: "CRM entegrasyonu",
  crm_delivery: "CRM gönderimi",
  message_template: "Mesaj şablonu",
  message_delivery: "Mesaj gönderimi"
};

const crmEventLabels = {
  "lead.created": "Yeni aday",
  "lead.updated": "Aday güncellendi",
  "test.ping": "Test"
};

const crmDeliveryStatusLabels = {
  success: "Başarılı",
  failed: "Hatalı",
  skipped: "Atlandı"
};

const messageChannelLabels = {
  email: "E-posta",
  sms: "SMS"
};

const messageDeliveryStatusLabels = {
  sent: "Gönderildi",
  failed: "Hatalı",
  skipped: "Atlandı"
};

const sourceLabels = {
  website: "Web sitesi",
  admin: "Admin",
  import: "Import",
  unknown: "Bilinmiyor"
};

const tabRoles = {
  overview: ["admin", "advisor", "editor"],
  reports: ["admin", "advisor"],
  notifications: ["admin", "advisor"],
  messaging: ["admin", "advisor"],
  leads: ["admin", "advisor"],
  programs: ["admin", "editor"],
  users: ["admin"],
  settings: ["admin"],
  integrations: ["admin"],
  audit: ["admin"],
  backlog: ["admin", "advisor", "editor"]
};

const programImportColumns = [
  "id",
  "university",
  "name",
  "faculty",
  "scoreType",
  "educationType",
  "campus",
  "city",
  "duration",
  "language",
  "scholarshipOptions",
  "quota",
  "careers",
  "baseScore",
  "rank",
  "sourceYear",
  "sourceStatus",
  "category",
  "priorities",
  "summary",
  "feeStatus",
  "baseScoreYear",
  "rankYear",
  "quotaYear",
  "isActive"
];

const programImportSample = [
  "kun-203852181",
  "Kapadokya Üniversitesi",
  "Yapay Zeka ve Makine Ogrenmesi",
  "Bilgisayar ve Bilisim Teknolojileri Fakultesi",
  "SAY",
  "Orgun",
  "Mustafapasa Yerleskesi",
  "Nevsehir",
  "4 yil",
  "Turkce",
  "Burslu",
  "7",
  "Yapay zeka muhendisi|Veri bilimci",
  "324.21",
  "232.687",
  "2025 YKS",
  "Resmi aday sayfasi · Program kodu 203852181",
  "bilisim",
  "kariyer|teknoloji|uygulama",
  "Kapadokya Universitesi resmi aday verisine gore olusturulan program kaydi.",
  "Burslu",
  "2025 YKS",
  "2025 YKS",
  "2025 YKS",
  "true"
];

let adminToken = localStorage.getItem(tokenKey) || "";
let leads = [];
let programs = [];
let users = [];
let advisors = [];
let notifications = [];
let messageTemplates = [];
let messageDeliveries = [];
let messageDeliverySummary = {
  sentTotal: 0,
  failedTotal: 0
};
let auditLogs = [];
let crmIntegration = null;
let crmDeliveries = [];
let siteSettings = null;
let stats = null;
let leadReport = null;
let activeLeadDetail = null;
let currentUser = null;
let leadPagination = {
  page: 1,
  pageSize: 12,
  total: 0,
  totalPages: 1,
  hasPrev: false,
  hasNext: false
};
let notificationPagination = {
  page: 1,
  pageSize: 12,
  total: 0,
  totalPages: 1,
  hasPrev: false,
  hasNext: false
};
let notificationSummary = {
  unreadTotal: 0,
  dueTotal: 0
};
let messageDeliveryPagination = {
  page: 1,
  pageSize: 12,
  total: 0,
  totalPages: 1,
  hasPrev: false,
  hasNext: false
};
let programPagination = {
  page: 1,
  pageSize: 12,
  total: 0,
  totalPages: 1,
  hasPrev: false,
  hasNext: false
};
let auditPagination = {
  page: 1,
  pageSize: 12,
  total: 0,
  totalPages: 1,
  hasPrev: false,
  hasNext: false
};
let crmDeliveryPagination = {
  page: 1,
  pageSize: 12,
  total: 0,
  totalPages: 1,
  hasPrev: false,
  hasNext: false
};
let programSummary = {
  total: 0,
  activeTotal: 0,
  inactiveTotal: 0
};
let leadSearchTimer = null;
let programSearchTimer = null;
let auditSearchTimer = null;
let crmDeliverySearchTimer = null;
let messageDeliverySearchTimer = null;

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[character]);
}

function setStatus(element, message, state = "neutral") {
  element.textContent = message;
  element.dataset.state = state;
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("theme", nextTheme);

  const isDark = nextTheme === "dark";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggleText.textContent = isDark ? "Açık mod" : "Koyu mod";
}

function initTheme() {
  applyTheme(localStorage.getItem("theme") === "dark" ? "dark" : "light");
}

async function fetchAdmin(path, options = {}) {
  const response = await fetch(`${ADMIN_API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.ok === false) {
    if (response.status === 401) {
      clearSession();
    }
    const error = new Error(payload.message || "Admin isteği başarısız.");
    error.status = response.status;
    error.details = payload.details;
    throw error;
  }

  return payload;
}

function setAuthenticated(isAuthenticated) {
  loginPanel.hidden = isAuthenticated;
  adminPanel.hidden = !isAuthenticated;
}

function clearSession() {
  adminToken = "";
  currentUser = null;
  leads = [];
  programs = [];
  notifications = [];
  messageTemplates = [];
  messageDeliveries = [];
  auditLogs = [];
  crmIntegration = null;
  crmDeliveries = [];
  users = [];
  advisors = [];
  siteSettings = null;
  leadReport = null;
  localStorage.removeItem(tokenKey);
  setAuthenticated(false);
  renderRoleScopeNotice();
}

function canUse(role, tabName) {
  return Boolean(role && tabRoles[tabName]?.includes(role));
}

function renderRoleScopeNotice() {
  if (!roleScopeNotice) return;
  const role = currentUser?.role;

  if (!role) {
    roleScopeNotice.textContent = "";
    roleScopeNotice.hidden = true;
    return;
  }

  roleScopeNotice.hidden = false;
  roleScopeNotice.textContent = `${roleLabels[role] || role} kapsamı: ${roleScopeLabels[role] || "Standart panel erişimi."}`;
}

function setActiveAdminTab(tabName) {
  const nextTab = currentUser && !canUse(currentUser.role, tabName)
    ? Object.keys(tabRoles).find(name => canUse(currentUser.role, name))
    : tabName;

  adminTabs.forEach(tab => {
    const isActive = tab.dataset.adminTab === nextTab;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  adminPanels.forEach(panel => {
    panel.classList.toggle("is-active", panel.dataset.adminPanel === nextTab);
  });
}

function applyRoleUi() {
  const role = currentUser?.role;

  adminTabs.forEach(tab => {
    tab.hidden = !canUse(role, tab.dataset.adminTab);
  });

  exportCsvBtn.hidden = !["admin", "advisor"].includes(role);
  renderRoleScopeNotice();
  setActiveAdminTab("overview");
}

async function login(email, password) {
  const response = await fetch(`${ADMIN_API_BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.message || "Giriş başarısız.");
  }

  adminToken = payload.token;
  currentUser = payload.user;
  localStorage.setItem(tokenKey, adminToken);
  setAuthenticated(true);
  applyRoleUi();
  await loadDashboard();
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function toDateTimeLocalValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function toDateInputValue(date) {
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function initReportRange() {
  if (!reportStartDate || reportStartDate.value || reportEndDate.value) return;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 29);
  reportStartDate.value = toDateInputValue(startDate);
  reportEndDate.value = toDateInputValue(endDate);
}

function getNotificationTone(notification) {
  if (notification.isRead) return "is-read";
  if (notification.dueAt && new Date(notification.dueAt) <= new Date()) return "is-due";
  return "is-unread";
}

function renderAdvisorOptions(selectedId, selectedUser = null) {
  const optionUsers = [...advisors];

  if (selectedId && selectedUser && !optionUsers.some(user => user.id === selectedId)) {
    optionUsers.unshift(selectedUser);
  }

  return [
    `<option value="">Atanmamış</option>`,
    ...optionUsers.map(user => `
      <option value="${escapeHTML(user.id)}" ${selectedId === user.id ? "selected" : ""}>
        ${escapeHTML(user.name)} · ${escapeHTML(roleLabels[user.role] || user.role)}
      </option>
    `)
  ].join("");
}

function buildQueryString(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, value);
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

function runDebounced(timerName, callback) {
  if (timerName === "leads") {
    clearTimeout(leadSearchTimer);
    leadSearchTimer = setTimeout(callback, 280);
    return;
  }

  if (timerName === "audit") {
    clearTimeout(auditSearchTimer);
    auditSearchTimer = setTimeout(callback, 280);
    return;
  }

  if (timerName === "crm") {
    clearTimeout(crmDeliverySearchTimer);
    crmDeliverySearchTimer = setTimeout(callback, 280);
    return;
  }

  if (timerName === "messages") {
    clearTimeout(messageDeliverySearchTimer);
    messageDeliverySearchTimer = setTimeout(callback, 280);
    return;
  }

  clearTimeout(programSearchTimer);
  programSearchTimer = setTimeout(callback, 280);
}

function getFilteredLeads() {
  return leads;
}

function renderStats() {
  const statusCounts = stats?.statusCounts || {};
  const cards = [
    ["Toplam", stats?.totalLeads || 0, "Tüm kayıtlar"],
    ["Yeni", statusCounts.new || 0, "İlk temas bekleyen"],
    ["Bildirim", stats?.unreadNotificationCount || 0, `${stats?.dueNotificationCount || 0} zamanı gelen`],
    ["Randevu", stats?.upcomingAppointmentCount || 0, `${stats?.unassignedLeadCount || 0} atanmamış`],
    ["Yayında", stats?.activeProgramCount || 0, "Aktif program"]
  ];

  statGrid.innerHTML = cards.map(([label, value, helper]) => `
    <article class="admin-stat-card">
      <span>${escapeHTML(label)}</span>
      <strong>${escapeHTML(value)}</strong>
      <small>${escapeHTML(helper)}</small>
    </article>
  `).join("");
}

function renderProgramInterest() {
  const items = stats?.programInterest || [];

  if (!items.length) {
    programInterestList.innerHTML = `
      <div class="admin-empty">Henüz program seçimi yok.</div>
    `;
    return;
  }

  const maxCount = Math.max(...items.map(item => item.count), 1);
  programInterestList.innerHTML = items.map(item => {
    const width = Math.round((item.count / maxCount) * 100);
    return `
      <div class="program-interest-item">
        <div>
          <strong>${escapeHTML(item.name)}</strong>
          <span>${escapeHTML(item.count)} seçim</span>
        </div>
        <div class="interest-bar" aria-hidden="true">
          <span style="width: ${width}%"></span>
        </div>
      </div>
    `;
  }).join("");
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("tr-TR");
}

function formatPercent(value) {
  return `${Number(value || 0).toLocaleString("tr-TR", {
    maximumFractionDigits: 1
  })}%`;
}

function renderReportRows(element, items, options = {}) {
  const {
    emptyMessage = "Bu aralık için veri yok.",
    getTitle = item => item.title,
    getMeta = () => "",
    getValue = item => item.count,
    getPercentValue = item => item.percent,
    getTone = () => ""
  } = options;

  if (!element) return;

  if (!items.length) {
    element.innerHTML = `<div class="admin-empty">${escapeHTML(emptyMessage)}</div>`;
    return;
  }

  const maxValue = Math.max(...items.map(item => Number(getValue(item)) || 0), 1);
  element.innerHTML = items.map(item => {
    const value = Number(getValue(item)) || 0;
    const percent = Number(getPercentValue(item)) || 0;
    const width = Math.max(4, Math.round((value / maxValue) * 100));
    const meta = getMeta(item);
    const tone = getTone(item);

    return `
      <article class="admin-report-item ${escapeHTML(tone)}">
        <div>
          <strong>${escapeHTML(getTitle(item))}</strong>
          <span>${escapeHTML(formatNumber(value))}${percent ? ` · ${escapeHTML(formatPercent(percent))}` : ""}</span>
        </div>
        ${meta ? `<small>${escapeHTML(meta)}</small>` : ""}
        <div class="interest-bar" aria-hidden="true">
          <span style="width: ${width}%"></span>
        </div>
      </article>
    `;
  }).join("");
}

function renderLeadReport() {
  if (!reportSummaryGrid) return;

  if (!leadReport) {
    reportSummaryGrid.innerHTML = `<div class="admin-empty">Rapor henüz yüklenmedi.</div>`;
    [reportStatusList, reportDailyList, reportProgramList, reportSourceList, reportAdvisorList].forEach(element => {
      if (element) element.innerHTML = `<div class="admin-empty">Rapor henüz yüklenmedi.</div>`;
    });
    return;
  }

  const summary = leadReport.summary || {};
  const range = leadReport.range || {};
  const trendDelta = Number(summary.trendDelta || 0);
  const trendLabel = `${trendDelta >= 0 ? "+" : ""}${formatNumber(trendDelta)} önceki dönem`;
  const appliedOrEnrolled = Number(summary.appliedCount || 0) + Number(summary.enrolledCount || 0);
  const reportCards = [
    ["Toplam Aday", summary.totalLeads, `${range.days || 0} gün · ${trendLabel}`],
    ["Dönüşüm", formatPercent(summary.conversionRate), `${formatNumber(summary.enrolledCount)} kayıt oldu`],
    ["Başvuru", appliedOrEnrolled, `${formatPercent(summary.applicationRate)} başvuru/kayıt oranı`],
    ["Randevu", summary.appointmentLeadCount, `${formatPercent(summary.appointmentRate)} aday randevuda`],
    ["Program Seçimi", summary.choiceTotal, `${formatNumber(summary.sourceCount)} kaynak kanalı`]
  ];

  reportSummaryGrid.innerHTML = reportCards.map(([label, value, helper]) => `
    <article class="admin-stat-card">
      <span>${escapeHTML(label)}</span>
      <strong>${escapeHTML(value)}</strong>
      <small>${escapeHTML(helper)}</small>
    </article>
  `).join("");

  renderReportRows(reportStatusList, leadReport.statusBreakdown || [], {
    getTitle: item => statusLabels[item.status] || item.status,
    getMeta: item => `${formatPercent(item.percent)} pay`,
    getTone: item => `status-${item.status}`
  });

  renderReportRows(reportDailyList, leadReport.dailyLeads || [], {
    getTitle: item => new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(item.date)),
    getMeta: item => item.count ? "Kayıt alındı" : "Kayıt yok"
  });

  renderReportRows(reportProgramList, leadReport.programInterest || [], {
    emptyMessage: "Bu aralıkta program seçimi yok.",
    getTitle: item => item.name,
    getMeta: item => [item.faculty, item.scoreType].filter(Boolean).join(" · ")
  });

  renderReportRows(reportSourceList, leadReport.sourceBreakdown || [], {
    emptyMessage: "Bu aralıkta kaynak verisi yok.",
    getTitle: item => sourceLabels[item.source] || item.source,
    getMeta: item => `${formatPercent(item.percent)} kanal payı`
  });

  renderReportRows(reportAdvisorList, leadReport.advisorPerformance || [], {
    emptyMessage: "Bu aralıkta danışman ataması yok.",
    getTitle: item => item.name,
    getValue: item => item.leadCount,
    getPercentValue: item => item.conversionRate,
    getMeta: item => `${formatNumber(item.appointmentCount)} randevu · ${formatNumber(item.enrolledCount)} kayıt · ${formatPercent(item.appointmentRate)} randevu oranı`
  });
}

function renderPagination(type) {
  const pagination = type === "leads"
    ? leadPagination
    : type === "notifications"
      ? notificationPagination
      : type === "audit"
        ? auditPagination
        : type === "crm"
          ? crmDeliveryPagination
          : type === "messages"
            ? messageDeliveryPagination
          : programPagination;
  const prevBtn = type === "leads"
    ? leadPrevBtn
    : type === "notifications"
      ? notificationPrevBtn
      : type === "audit"
        ? auditPrevBtn
        : type === "crm"
          ? crmDeliveryPrevBtn
          : type === "messages"
            ? messageDeliveryPrevBtn
          : programPrevBtn;
  const nextBtn = type === "leads"
    ? leadNextBtn
    : type === "notifications"
      ? notificationNextBtn
      : type === "audit"
        ? auditNextBtn
        : type === "crm"
          ? crmDeliveryNextBtn
          : type === "messages"
            ? messageDeliveryNextBtn
          : programNextBtn;
  const label = type === "leads"
    ? leadPageLabel
    : type === "notifications"
      ? notificationPageLabel
      : type === "audit"
        ? auditPageLabel
        : type === "crm"
          ? crmDeliveryPageLabel
          : type === "messages"
            ? messageDeliveryPageLabel
          : programPageLabel;

  prevBtn.disabled = !pagination.hasPrev;
  nextBtn.disabled = !pagination.hasNext;
  label.textContent = `${pagination.page} / ${pagination.totalPages}`;
}

function renderNotifications() {
  notificationCountLabel.textContent = `${notificationPagination.total} bildirim · ${notificationSummary.unreadTotal} okunmamış`;

  if (!notifications.length) {
    notificationList.innerHTML = `
      <div class="admin-empty">Bu filtrelerle bildirim bulunamadı.</div>
    `;
    renderPagination("notifications");
    return;
  }

  notificationList.innerHTML = notifications.map(notification => `
    <article class="admin-notification-item ${getNotificationTone(notification)}" data-notification-id="${escapeHTML(notification.id)}">
      <div>
        <span>${escapeHTML(notificationTypeLabels[notification.type] || notification.type)}</span>
        <time datetime="${escapeHTML(notification.createdAt)}">${escapeHTML(formatDate(notification.createdAt))}</time>
      </div>
      <h3>${escapeHTML(notification.title)}</h3>
      ${notification.body ? `<p>${escapeHTML(notification.body)}</p>` : ""}
      ${notification.dueAt ? `<small>Takip zamanı: ${escapeHTML(formatDate(notification.dueAt))}</small>` : ""}
      <div class="admin-notification-actions">
        ${notification.leadId ? `
          <button class="btn btn-light" type="button" data-notification-lead="${escapeHTML(notification.leadId)}">
            Adayı Aç
          </button>
        ` : ""}
        <button class="btn btn-light" type="button" data-notification-toggle="${escapeHTML(notification.id)}">
          ${notification.isRead ? "Okunmadı yap" : "Okundu yap"}
        </button>
      </div>
    </article>
  `).join("");
  renderPagination("notifications");
}

function renderClientMessageText(text, lead = activeLeadDetail) {
  const values = {
    adSoyad: lead?.fullName || "Aday",
    telefon: lead?.phone || "",
    email: lead?.email || "",
    programlar: lead?.selectedProgramDetails?.map(program => program.name).join(", ") || "Program seçimi yok",
    danisman: lead?.assignedUser?.name || "Danışman ekibi",
    durum: statusLabels[lead?.status] || lead?.status || "",
    randevu: lead?.appointmentAt ? formatDate(lead.appointmentAt) : "",
    takip: lead?.followUpAt ? formatDate(lead.followUpAt) : ""
  };

  return String(text || "").replace(/\{\{([a-zA-ZğüşöçıİĞÜŞÖÇ]+)\}\}/g, (_match, key) => (
    values[key] ?? ""
  ));
}

function renderMessageTemplates() {
  if (!messageTemplateList || !messageTemplateCountLabel) return;
  messageTemplateCountLabel.textContent = `${messageTemplates.length} şablon · ${messageDeliverySummary.sentTotal} gönderim`;

  if (!messageTemplates.length) {
    messageTemplateList.innerHTML = `<div class="admin-empty">Henüz mesaj şablonu yok.</div>`;
    return;
  }

  const canEditTemplates = currentUser?.role === "admin";

  messageTemplateList.innerHTML = messageTemplates.map(template => `
    <form class="admin-message-template-item" data-message-template-id="${escapeHTML(template.id)}">
      <div>
        <span class="status-pill ${template.isActive ? "status-contacted" : "status-archived"}">
          ${escapeHTML(messageChannelLabels[template.channel] || template.channel)}
        </span>
        <strong>${escapeHTML(template.name)}</strong>
        <small>${template.isActive ? "Aktif şablon" : "Pasif şablon"}</small>
      </div>
      <label>
        Şablon Adı
        <input name="name" value="${escapeHTML(template.name)}" ${canEditTemplates ? "" : "disabled"} />
      </label>
      <label>
        Durum
        <select name="isActive" ${canEditTemplates ? "" : "disabled"}>
          <option value="true" ${template.isActive ? "selected" : ""}>Aktif</option>
          <option value="false" ${!template.isActive ? "selected" : ""}>Pasif</option>
        </select>
      </label>
      <label class="form-wide">
        Konu
        <input name="subject" value="${escapeHTML(template.subject)}" ${template.channel === "sms" || !canEditTemplates ? "disabled" : ""} />
      </label>
      <label class="form-wide">
        Mesaj
        <textarea name="body" rows="5" ${canEditTemplates ? "" : "disabled"}>${escapeHTML(template.body)}</textarea>
      </label>
      <div class="admin-program-actions form-wide">
        <button class="btn btn-primary" type="submit" ${canEditTemplates ? "" : "disabled"}>
          Şablonu Kaydet
        </button>
      </div>
    </form>
  `).join("");
}

function renderMessageDeliveries() {
  if (!messageDeliveryList || !messageDeliveryCountLabel) return;
  messageDeliveryCountLabel.textContent = `${messageDeliveryPagination.total} gönderim · ${messageDeliveryPagination.page}. sayfa`;

  if (!messageDeliveries.length) {
    messageDeliveryList.innerHTML = `<div class="admin-empty">Bu filtrelerle mesaj gönderimi bulunamadı.</div>`;
    renderPagination("messages");
    return;
  }

  messageDeliveryList.innerHTML = messageDeliveries.map(delivery => `
    <article class="admin-message-delivery-item status-${escapeHTML(delivery.status)}">
      <div>
        <span>${escapeHTML(messageChannelLabels[delivery.channel] || delivery.channel)}</span>
        <time datetime="${escapeHTML(delivery.createdAt)}">${escapeHTML(formatDate(delivery.createdAt))}</time>
      </div>
      <h3>${escapeHTML(messageDeliveryStatusLabels[delivery.status] || delivery.status)}</h3>
      <p>
        ${delivery.leadName ? `${escapeHTML(delivery.leadName)} · ` : ""}
        ${escapeHTML(delivery.recipient)}
      </p>
      ${delivery.subject ? `<strong>${escapeHTML(delivery.subject)}</strong>` : ""}
      <small>
        ${delivery.templateName ? `${escapeHTML(delivery.templateName)} · ` : ""}
        ${escapeHTML(delivery.provider)}
        ${delivery.error ? ` · ${escapeHTML(delivery.error)}` : ""}
      </small>
    </article>
  `).join("");
  renderPagination("messages");
}

function getLeadMessageTemplates(channel = leadMessageChannel.value) {
  return messageTemplates.filter(template => template.channel === channel && template.isActive);
}

function renderLeadMessageTemplateOptions() {
  if (!leadMessageTemplate || !leadMessageChannel) return;
  const channel = leadMessageChannel.value;
  const templates = getLeadMessageTemplates(channel);

  leadMessageTemplate.innerHTML = [
    `<option value="">Şablon seç</option>`,
    ...templates.map(template => `
      <option value="${escapeHTML(template.id)}">${escapeHTML(template.name)}</option>
    `)
  ].join("");
}

function applyLeadMessageTemplate() {
  if (!activeLeadDetail || !leadMessageTemplate) return;
  const template = messageTemplates.find(item => item.id === leadMessageTemplate.value);
  const isSms = leadMessageChannel.value === "sms";

  leadMessageSubject.disabled = isSms;
  leadMessageSubject.value = isSms ? "" : renderClientMessageText(template?.subject || "", activeLeadDetail);
  leadMessageBody.value = renderClientMessageText(template?.body || "", activeLeadDetail);

  const hasRecipient = isSms ? Boolean(activeLeadDetail.phone) : Boolean(activeLeadDetail.email);
  leadMessageSendBtn.disabled = !hasRecipient;
  setStatus(
    leadMessageStatus,
    hasRecipient
      ? `${messageChannelLabels[leadMessageChannel.value]} alıcısı hazır.`
      : isSms ? "Adayın telefon bilgisi yok." : "Adayın e-posta bilgisi yok.",
    hasRecipient ? "neutral" : "error"
  );
}

function renderLeadMessageForm() {
  if (!leadMessageForm || !activeLeadDetail) return;
  leadMessageForm.reset();
  const emailOption = leadMessageChannel.querySelector('option[value="email"]');
  const smsOption = leadMessageChannel.querySelector('option[value="sms"]');

  emailOption.disabled = !activeLeadDetail.email;
  smsOption.disabled = !activeLeadDetail.phone;
  leadMessageChannel.value = activeLeadDetail.email || !activeLeadDetail.phone ? "email" : "sms";
  renderLeadMessageTemplateOptions();
  const firstTemplate = getLeadMessageTemplates(leadMessageChannel.value)[0];
  leadMessageTemplate.value = firstTemplate?.id || "";
  applyLeadMessageTemplate();
}

function renderAuditMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") return "";
  const entries = Object.entries(metadata)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .slice(0, 4);

  if (!entries.length) return "";

  return `
    <div class="admin-audit-meta">
      ${entries.map(([key, value]) => {
        const displayValue = Array.isArray(value) ? value.join(", ") : String(value);
        return `<span>${escapeHTML(key)}: ${escapeHTML(displayValue)}</span>`;
      }).join("")}
    </div>
  `;
}

function renderAuditLogs() {
  if (!auditList || !auditCountLabel) return;
  auditCountLabel.textContent = `${auditPagination.total} işlem · ${auditPagination.page}. sayfa`;

  if (!auditLogs.length) {
    auditList.innerHTML = `
      <div class="admin-empty">Bu filtrelerle işlem geçmişi bulunamadı.</div>
    `;
    renderPagination("audit");
    return;
  }

  auditList.innerHTML = auditLogs.map(log => `
    <article class="admin-audit-item">
      <div>
        <span>${escapeHTML(auditActionLabels[log.action] || log.action)}</span>
        <time datetime="${escapeHTML(log.createdAt)}">${escapeHTML(formatDate(log.createdAt))}</time>
      </div>
      <h3>${escapeHTML(log.title)}</h3>
      <p>${escapeHTML(log.detail || "Detay yok.")}</p>
      <small>
        ${escapeHTML(log.userName || "Sistem")}
        ${log.userEmail ? ` · ${escapeHTML(log.userEmail)}` : ""}
        · ${escapeHTML(auditEntityLabels[log.entityType] || log.entityType)}
        ${log.entityId ? ` · ${escapeHTML(log.entityId)}` : ""}
      </small>
      ${renderAuditMetadata(log.metadata)}
    </article>
  `).join("");
  renderPagination("audit");
}

function renderLeads() {
  leadCountLabel.textContent = `${leadPagination.total} kayıt · ${leadPagination.page}. sayfa`;

  if (!leads.length) {
    leadsList.innerHTML = `
      <div class="admin-empty">Bu filtrelerle aday kaydı bulunamadı.</div>
    `;
    renderPagination("leads");
    return;
  }

  leadsList.innerHTML = leads.map(lead => {
    const programs = lead.selectedProgramDetails.map(program => `
      <span>${escapeHTML(program.name)}</span>
    `).join("");

    return `
      <article class="admin-lead-card" data-lead-id="${escapeHTML(lead.id)}">
        <div class="admin-lead-main">
          <div>
            <span class="status-pill status-${escapeHTML(lead.status)}">
              ${escapeHTML(statusLabels[lead.status] || lead.status)}
            </span>
            <h3>${escapeHTML(lead.fullName || "İsimsiz aday")}</h3>
            <div class="lead-contact">
              <a href="tel:${escapeHTML(lead.phone)}">${escapeHTML(lead.phone || "Telefon yok")}</a>
              <a href="mailto:${escapeHTML(lead.email)}">${escapeHTML(lead.email || "E-posta yok")}</a>
            </div>
          </div>
          <time datetime="${escapeHTML(lead.createdAt)}">${escapeHTML(formatDate(lead.createdAt))}</time>
        </div>
        <div class="lead-program-tags">${programs}</div>
        ${lead.followUpAt ? `
          <div class="lead-follow-up">
            <strong>Takip</strong>
            <span>${escapeHTML(formatDate(lead.followUpAt))}</span>
            ${lead.followUpNote ? `<span>${escapeHTML(lead.followUpNote)}</span>` : ""}
          </div>
        ` : ""}
        ${(lead.assignedUser || lead.appointmentAt) ? `
          <div class="lead-follow-up">
            <strong>Randevu</strong>
            ${lead.assignedUser ? `<span>Danışman: ${escapeHTML(lead.assignedUser.name)}</span>` : `<span>Danışman atanmamış</span>`}
            ${lead.appointmentAt ? `<span>${escapeHTML(formatDate(lead.appointmentAt))}</span>` : ""}
            ${lead.appointmentNote ? `<span>${escapeHTML(lead.appointmentNote)}</span>` : ""}
          </div>
        ` : ""}
        <div class="admin-lead-controls">
          <label>
            Durum
            <select data-status>
              ${Object.entries(statusLabels).map(([value, label]) => `
                <option value="${value}" ${lead.status === value ? "selected" : ""}>
                  ${escapeHTML(label)}
                </option>
              `).join("")}
            </select>
          </label>
          <label>
            Not
            <textarea data-note rows="3" placeholder="Danışman notu">${escapeHTML(lead.note)}</textarea>
          </label>
          <label>
            Danışman
            <select data-assigned-user-id>
              ${renderAdvisorOptions(lead.assignedUserId, lead.assignedUser)}
            </select>
          </label>
          <label>
            Randevu Zamanı
            <input data-appointment-at type="datetime-local" value="${escapeHTML(toDateTimeLocalValue(lead.appointmentAt))}" />
          </label>
          <label>
            Randevu Notu
            <textarea data-appointment-note rows="3" placeholder="Randevu yeri veya kısa not">${escapeHTML(lead.appointmentNote)}</textarea>
          </label>
          <label>
            Takip Zamanı
            <input data-follow-up-at type="datetime-local" value="${escapeHTML(toDateTimeLocalValue(lead.followUpAt))}" />
          </label>
          <label>
            Takip Notu
            <textarea data-follow-up-note rows="3" placeholder="Takip hatırlatma notu">${escapeHTML(lead.followUpNote)}</textarea>
          </label>
        </div>
        <div class="admin-lead-actions">
          <button class="btn btn-light" type="button" data-detail="${escapeHTML(lead.id)}">
            Detay
          </button>
          <button class="btn btn-primary" type="button" data-save="${escapeHTML(lead.id)}">
            Kaydet
          </button>
          <button class="btn btn-light" type="button" data-delete="${escapeHTML(lead.id)}">
            Sil
          </button>
        </div>
      </article>
    `;
  }).join("");
  renderPagination("leads");
}

function renderLeadDetail(lead) {
  activeLeadDetail = lead;
  leadDetailTitle.textContent = lead.fullName || "İsimsiz aday";
  leadDetailMeta.textContent = [
    lead.phone || "Telefon yok",
    lead.email || "E-posta yok",
    statusLabels[lead.status] || lead.status,
    lead.assignedUser ? `Danışman: ${lead.assignedUser.name}` : "Danışman atanmamış",
    lead.appointmentAt ? `Randevu: ${formatDate(lead.appointmentAt)}` : "",
    lead.followUpAt ? `Takip: ${formatDate(lead.followUpAt)}` : "",
    formatDate(lead.createdAt)
  ].filter(Boolean).join(" · ");

  leadDetailPrograms.innerHTML = lead.selectedProgramDetails.length
    ? lead.selectedProgramDetails.map(program => `
      <article class="lead-detail-program">
        <strong>${escapeHTML(program.name)}</strong>
        <span>${escapeHTML(program.scoreType)} · ${escapeHTML(program.educationType)} · ${escapeHTML(program.duration)}</span>
      </article>
    `).join("")
    : `<div class="admin-empty">Program seçimi yok.</div>`;

  leadActivityList.innerHTML = lead.activities?.length
    ? lead.activities.map(activity => `
      <article class="lead-activity-item">
        <div>
          <span>${escapeHTML(activityTypeLabels[activity.type] || activity.type)}</span>
          <time datetime="${escapeHTML(activity.createdAt)}">${escapeHTML(formatDate(activity.createdAt))}</time>
        </div>
        <strong>${escapeHTML(activity.title)}</strong>
        ${activity.body ? `<p>${escapeHTML(activity.body)}</p>` : ""}
      </article>
    `).join("")
    : `<div class="admin-empty">Henüz görüşme geçmişi yok.</div>`;

  renderLeadMessageForm();
}

async function openLeadDetail(id) {
  setStatus(adminNotice, "Aday detayı yükleniyor...");
  const payload = await fetchAdmin(`/admin/leads/${encodeURIComponent(id)}`);
  renderLeadDetail(payload.lead);
  setStatus(adminNotice, "Aday detayı açıldı.", "success");
  if (leadDetailModal.open) {
    return;
  }

  if (typeof leadDetailModal.showModal === "function") {
    leadDetailModal.showModal();
  } else {
    leadDetailModal.setAttribute("open", "");
  }
}

async function addLeadActivity() {
  if (!activeLeadDetail) return;
  const data = new FormData(activityForm);
  const payload = {
    type: data.get("type"),
    title: String(data.get("title") || "").trim(),
    body: String(data.get("body") || "").trim()
  };

  await fetchAdmin(`/admin/leads/${encodeURIComponent(activeLeadDetail.id)}/activities`, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  activityForm.reset();
  await openLeadDetail(activeLeadDetail.id);
  await refreshAuditIfAdmin();
  setStatus(adminNotice, "Görüşme geçmişi eklendi.", "success");
}

function parseListValue(value) {
  return String(value || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function getFilteredPrograms() {
  return programs;
}

function renderPrograms() {
  const filtered = getFilteredPrograms();
  programCountLabel.textContent = `${programSummary.total} sonuç · ${programSummary.activeTotal} yayında · ${programSummary.inactiveTotal} pasif`;

  if (!filtered.length) {
    programList.innerHTML = `
      <div class="admin-empty">Bu filtrelerle program bulunamadı.</div>
    `;
    renderPagination("programs");
    return;
  }

  programList.innerHTML = filtered.map(program => `
    <article class="admin-program-card" data-program-id="${escapeHTML(program.id)}">
      <div>
        <span class="status-pill ${program.isActive ? "status-contacted" : "status-archived"}">
          ${program.isActive ? "Yayında" : "Pasif"}
        </span>
        <h3>${escapeHTML(program.name)}</h3>
        <p>${escapeHTML(program.university || "Kapadokya Üniversitesi")} · ${escapeHTML(program.faculty)}</p>
      </div>
      <dl class="admin-program-meta">
        <div><dt>Puan</dt><dd>${escapeHTML(program.scoreType)}</dd></div>
        <div><dt>Üniversite</dt><dd>${escapeHTML(program.university || "Kapadokya Üniversitesi")}</dd></div>
        <div><dt>Süre</dt><dd>${escapeHTML(program.duration)}</dd></div>
        <div><dt>Kontenjan</dt><dd>${escapeHTML(program.quota)}</dd></div>
        <div><dt>Taban</dt><dd>${escapeHTML(program.baseScore)}</dd></div>
      </dl>
      <div class="admin-program-card-actions">
        <button class="btn btn-light" type="button" data-program-edit="${escapeHTML(program.id)}">
          Düzenle
        </button>
        <button class="btn btn-light" type="button" data-program-toggle="${escapeHTML(program.id)}">
          ${program.isActive ? "Pasife Al" : "Yayına Al"}
        </button>
      </div>
    </article>
  `).join("");
  renderPagination("programs");
}

function setProgramFormMode(mode, program = null) {
  programForm.reset();
  programForm.elements.mode.value = mode;
  programForm.elements.currentId.value = program?.id || "";
  programForm.elements.id.disabled = false;
  programFormTitle.textContent = mode === "edit" ? "Programı düzenle" : "Yeni program ekle";
  programSaveBtn.textContent = mode === "edit" ? "Değişiklikleri Kaydet" : "Programı Kaydet";

  if (!program) {
    programForm.elements.university.value = "Kapadokya Üniversitesi";
    programForm.elements.city.value = "Nevsehir";
    programForm.elements.sourceYear.value = "2025 YKS";
    programForm.elements.sourceStatus.value = "Resmi aday sayfası";
    programForm.elements.isActive.value = "true";
    return;
  }

  const values = {
    ...program,
    scholarshipOptions: program.scholarshipOptions.join(", "),
    careers: program.careers.join(", "),
    priorities: program.priorities.join(", "),
    isActive: String(Boolean(program.isActive))
  };

  Array.from(programForm.elements).forEach(field => {
    if (!field.name || field.name === "mode" || field.name === "currentId") return;
    field.value = values[field.name] ?? "";
  });

  programForm.elements.id.disabled = true;
}

function getProgramPayload() {
  const data = new FormData(programForm);
  const text = name => String(data.get(name) || "").trim();
  return {
    id: text("id"),
    university: text("university") || "Kapadokya Üniversitesi",
    name: text("name"),
    faculty: text("faculty"),
    scoreType: data.get("scoreType"),
    educationType: data.get("educationType"),
    campus: text("campus"),
    city: text("city"),
    duration: data.get("duration"),
    language: data.get("language"),
    scholarshipOptions: parseListValue(data.get("scholarshipOptions")),
    quota: Number(data.get("quota")),
    careers: parseListValue(data.get("careers")),
    baseScore: Number(data.get("baseScore")),
    rank: text("rank"),
    sourceYear: text("sourceYear"),
    sourceStatus: text("sourceStatus"),
    category: data.get("category"),
    priorities: parseListValue(data.get("priorities")),
    summary: text("summary"),
    isActive: data.get("isActive") === "true"
  };
}

async function saveProgram() {
  const mode = programForm.elements.mode.value;
  const currentId = programForm.elements.currentId.value;
  const payload = getProgramPayload();
  const path = mode === "edit"
    ? `/admin/programs/${encodeURIComponent(currentId)}`
    : "/admin/programs";
  const method = mode === "edit" ? "PATCH" : "POST";

  if (mode === "edit") {
    delete payload.id;
  }

  await fetchAdmin(path, {
    method,
    body: JSON.stringify(payload)
  });

  await loadProgramPage(mode === "edit" ? programPagination.page : 1);
  await refreshStats();
  await refreshLeadReportIfAllowed();
  await refreshAuditIfAdmin();
  setProgramFormMode("create");
  setStatus(adminNotice, mode === "edit" ? "Program güncellendi." : "Program oluşturuldu.", "success");
}

async function toggleProgram(id) {
  const program = programs.find(item => item.id === id);
  if (!program) return;

  const path = `/admin/programs/${encodeURIComponent(id)}`;
  await fetchAdmin(path, {
    method: program.isActive ? "DELETE" : "PATCH",
    body: program.isActive ? undefined : JSON.stringify({ isActive: true })
  });

  await loadProgramPage(programPagination.page);
  await refreshStats();
  await refreshLeadReportIfAllowed();
  await refreshAuditIfAdmin();
  setStatus(adminNotice, program.isActive ? "Program pasife alındı." : "Program yayına alındı.", "success");
}

function buildProgramTemplateCsv() {
  return [
    programImportColumns,
    programImportSample
  ].map(row => row.map(toCsvValue).join(",")).join("\n");
}

function downloadProgramTemplate() {
  const csv = buildProgramTemplateCsv();
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "program-import-sablonu.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function renderProgramImportResult(result, state = "success") {
  if (!result) {
    programImportResult.innerHTML = "";
    programImportResult.dataset.state = "neutral";
    return;
  }

  programImportResult.dataset.state = state;

  if (state === "error") {
    const rows = result.rows || [{ message: result.message || "Import tamamlanamadı." }];
    programImportResult.innerHTML = `
      <strong>Import durduruldu.</strong>
      <ul>
        ${rows.slice(0, 6).map(row => `
          <li>${row.row ? `${escapeHTML(row.row)}. satır: ` : ""}${escapeHTML(row.message)}</li>
        `).join("")}
      </ul>
      ${rows.length > 6 ? `<p>+${rows.length - 6} hata daha var.</p>` : ""}
    `;
    return;
  }

  const summary = result.summary || { created: 0, updated: 0, total: 0 };
  programImportResult.innerHTML = `
    <strong>Import tamamlandı.</strong>
    <span>${escapeHTML(summary.total)} satır işlendi · ${escapeHTML(summary.created)} yeni · ${escapeHTML(summary.updated)} güncelleme</span>
  `;
}

async function importPrograms() {
  const csv = programImportText.value.trim();

  if (!csv) {
    renderProgramImportResult({ rows: [{ message: "CSV dosyası seç veya metin alanına içerik yapıştır." }] }, "error");
    return;
  }

  const response = await fetchAdmin("/admin/programs/import", {
    method: "POST",
    body: JSON.stringify({
      csv,
      mode: programImportMode.value
    })
  });

  await loadProgramPage(1);
  await refreshStats();
  await refreshLeadReportIfAllowed();
  await refreshAuditIfAdmin();
  renderProgramImportResult(response, "success");
  setStatus(adminNotice, "Program import tamamlandı.", "success");
}

function renderUsers() {
  userCountLabel.textContent = `${users.length} kullanıcı`;

  if (!users.length) {
    userList.innerHTML = `<div class="admin-empty">Kullanıcı bulunamadı.</div>`;
    return;
  }

  userList.innerHTML = users.map(user => `
    <article class="admin-user-card" data-user-id="${escapeHTML(user.id)}">
      <div>
        <span class="status-pill ${user.isActive ? "status-contacted" : "status-archived"}">
          ${user.isActive ? "Aktif" : "Pasif"}
        </span>
        <h3>${escapeHTML(user.name)}</h3>
        <p>${escapeHTML(user.email)}</p>
      </div>
      <dl class="admin-program-meta">
        <div><dt>Rol</dt><dd>${escapeHTML(roleLabels[user.role] || user.role)}</dd></div>
        <div><dt>Oluşturma</dt><dd>${escapeHTML(formatDate(user.createdAt))}</dd></div>
      </dl>
      <div class="admin-program-card-actions">
        <button class="btn btn-light" type="button" data-user-edit="${escapeHTML(user.id)}">
          Düzenle
        </button>
        <button
          class="btn btn-light"
          type="button"
          data-user-toggle="${escapeHTML(user.id)}"
          ${user.id === currentUser?.id ? "disabled" : ""}
        >
          ${user.id === currentUser?.id ? "Sen" : user.isActive ? "Pasife Al" : "Aktifleştir"}
        </button>
      </div>
    </article>
  `).join("");
}

function setUserFormMode(mode, user = null) {
  userForm.reset();
  userForm.elements.mode.value = mode;
  userForm.elements.currentId.value = user?.id || "";
  userFormTitle.textContent = mode === "edit" ? "Kullanıcıyı düzenle" : "Yeni kullanıcı ekle";
  userSaveBtn.textContent = mode === "edit" ? "Değişiklikleri Kaydet" : "Kullanıcıyı Kaydet";
  userForm.elements.password.required = mode === "create";
  userForm.elements.password.placeholder = mode === "edit"
    ? "Değişmeyecekse boş bırak"
    : "Yeni kullanıcı için zorunlu";

  if (!user) {
    userForm.elements.role.value = "advisor";
    userForm.elements.isActive.value = "true";
    return;
  }

  userForm.elements.name.value = user.name;
  userForm.elements.email.value = user.email;
  userForm.elements.role.value = user.role;
  userForm.elements.isActive.value = String(Boolean(user.isActive));
}

function renderSettings(settings) {
  if (!settingsForm || !settings) return;
  siteSettings = settings;

  Array.from(settingsForm.elements).forEach(field => {
    if (!field.name) return;
    field.value = settings[field.name] ?? "";
  });
}

function renderCrmIntegration(integration) {
  if (!crmForm || !integration) return;
  crmIntegration = integration;

  crmForm.elements.name.value = integration.name || "CRM Webhook";
  crmForm.elements.webhookUrl.value = integration.webhookUrl || "";
  crmForm.elements.secret.value = "";
  crmForm.elements.secret.placeholder = integration.hasSecret
    ? "Gizli anahtar tanımlı; değiştirmek için yeni değer gir"
    : "İsteğe bağlı HMAC imza anahtarı";
  crmForm.elements.isEnabled.value = String(Boolean(integration.isEnabled));
  Array.from(crmForm.querySelectorAll('input[name="events"]')).forEach(field => {
    field.checked = integration.events?.includes(field.value);
  });
  setStatus(
    crmStatus,
    integration.hasSecret ? "İmza anahtarı tanımlı." : "İmza anahtarı yok.",
    "neutral"
  );
}

function getCrmPayload() {
  const data = new FormData(crmForm);
  const events = data.getAll("events");
  const payload = {
    name: String(data.get("name") || "").trim(),
    webhookUrl: String(data.get("webhookUrl") || "").trim(),
    isEnabled: data.get("isEnabled") === "true",
    events: events.length ? events : ["lead.created"]
  };
  const secret = String(data.get("secret") || "").trim();

  if (secret) {
    payload.secret = secret;
  }

  return payload;
}

function renderCrmDeliveries() {
  if (!crmDeliveryList || !crmDeliveryCountLabel) return;
  crmDeliveryCountLabel.textContent = `${crmDeliveryPagination.total} gönderim · ${crmDeliveryPagination.page}. sayfa`;

  if (!crmDeliveries.length) {
    crmDeliveryList.innerHTML = `
      <div class="admin-empty">Bu filtrelerle CRM gönderimi bulunamadı.</div>
    `;
    renderPagination("crm");
    return;
  }

  crmDeliveryList.innerHTML = crmDeliveries.map(delivery => `
    <article class="admin-crm-delivery-item status-${escapeHTML(delivery.status)}">
      <div>
        <span>${escapeHTML(crmEventLabels[delivery.event] || delivery.event)}</span>
        <time datetime="${escapeHTML(delivery.createdAt)}">${escapeHTML(formatDate(delivery.createdAt))}</time>
      </div>
      <h3>${escapeHTML(crmDeliveryStatusLabels[delivery.status] || delivery.status)}</h3>
      <p>
        ${delivery.leadName ? `${escapeHTML(delivery.leadName)} · ` : ""}
        ${delivery.targetUrl ? escapeHTML(delivery.targetUrl) : "Webhook URL yok"}
      </p>
      <small>
        ${delivery.statusCode ? `HTTP ${escapeHTML(delivery.statusCode)} · ` : ""}
        ${delivery.error ? escapeHTML(delivery.error) : "Hata yok"}
      </small>
    </article>
  `).join("");
  renderPagination("crm");
}

function getSettingsPayload() {
  const data = new FormData(settingsForm);
  return Array.from(data.entries()).reduce((payload, [key, value]) => {
    payload[key] = String(value || "").trim();
    return payload;
  }, {});
}

async function loadSettings() {
  const payload = await fetchAdmin("/admin/settings");
  renderSettings(payload.settings);
}

async function loadCrmIntegration() {
  const payload = await fetchAdmin("/admin/crm");
  renderCrmIntegration(payload.integration);
}

async function saveCrmIntegration() {
  const response = await fetchAdmin("/admin/crm", {
    method: "PATCH",
    body: JSON.stringify(getCrmPayload())
  });

  renderCrmIntegration(response.integration);
  await loadCrmDeliveryPage(1);
  await refreshAuditIfAdmin();
  setStatus(crmStatus, "CRM entegrasyonu kaydedildi.", "success");
  setStatus(adminNotice, "CRM entegrasyonu güncellendi.", "success");
}

async function testCrmIntegration() {
  const response = await fetchAdmin("/admin/crm/test", {
    method: "POST"
  });

  await loadCrmDeliveryPage(1);
  await refreshAuditIfAdmin();
  const state = response.delivery.status === "success" ? "success" : "error";
  setStatus(crmStatus, `Test sonucu: ${crmDeliveryStatusLabels[response.delivery.status] || response.delivery.status}`, state);
}

async function saveSettings() {
  const response = await fetchAdmin("/admin/settings", {
    method: "PATCH",
    body: JSON.stringify(getSettingsPayload())
  });

  renderSettings(response.settings);
  await refreshAuditIfAdmin();
  setStatus(settingsStatus, "Ayarlar kaydedildi.", "success");
  setStatus(adminNotice, "Site ayarları güncellendi.", "success");
}

function getUserPayload() {
  const data = new FormData(userForm);
  return {
    name: String(data.get("name") || "").trim(),
    email: String(data.get("email") || "").trim(),
    role: data.get("role"),
    password: String(data.get("password") || ""),
    isActive: data.get("isActive") === "true"
  };
}

async function saveUser() {
  const mode = userForm.elements.mode.value;
  const currentId = userForm.elements.currentId.value;
  const payload = getUserPayload();
  const path = mode === "edit"
    ? `/admin/users/${encodeURIComponent(currentId)}`
    : "/admin/users";
  const method = mode === "edit" ? "PATCH" : "POST";

  if (mode === "edit" && !payload.password) {
    delete payload.password;
  }

  const response = await fetchAdmin(path, {
    method,
    body: JSON.stringify(payload)
  });

  if (mode === "edit") {
    users = users.map(user => user.id === currentId ? response.user : user);
    if (currentId === currentUser?.id) currentUser = response.user;
  } else {
    users = [response.user, ...users].sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }

  renderUsers();
  await refreshAuditIfAdmin();
  setUserFormMode("create");
  setStatus(adminNotice, mode === "edit" ? "Kullanıcı güncellendi." : "Kullanıcı oluşturuldu.", "success");
}

async function toggleUser(id) {
  const user = users.find(item => item.id === id);
  if (!user || user.id === currentUser?.id) return;

  const response = await fetchAdmin(`/admin/users/${encodeURIComponent(id)}`, {
    method: user.isActive ? "DELETE" : "PATCH",
    body: user.isActive ? undefined : JSON.stringify({ isActive: true })
  });

  users = users.map(item => item.id === id ? response.user : item);
  renderUsers();
  await refreshAuditIfAdmin();
  setStatus(adminNotice, user.isActive ? "Kullanıcı pasife alındı." : "Kullanıcı aktifleştirildi.", "success");
}

async function loadNotificationPage(page = 1) {
  const payload = await fetchAdmin(`/admin/notifications${buildQueryString({
    status: notificationStatusFilter.value,
    type: notificationTypeFilter.value,
    page,
    pageSize: notificationPageSize.value
  })}`);

  notifications = payload.notifications || [];
  notificationPagination = payload.pagination || notificationPagination;
  notificationSummary = payload.summary || notificationSummary;
  renderNotifications();
}

async function loadMessaging() {
  const payload = await fetchAdmin("/admin/messaging");
  messageTemplates = payload.templates || [];
  messageDeliverySummary = payload.summary || messageDeliverySummary;
  renderMessageTemplates();
  if (activeLeadDetail) renderLeadMessageForm();
}

async function loadMessageDeliveryPage(page = 1) {
  const payload = await fetchAdmin(`/admin/messaging/deliveries${buildQueryString({
    q: messageDeliverySearch.value.trim(),
    channel: messageDeliveryChannelFilter.value,
    status: messageDeliveryStatusFilter.value,
    page,
    pageSize: messageDeliveryPageSize.value
  })}`);

  messageDeliveries = payload.deliveries || [];
  messageDeliveryPagination = payload.pagination || messageDeliveryPagination;
  messageDeliverySummary = payload.summary || messageDeliverySummary;
  renderMessageDeliveries();
  renderMessageTemplates();
}

async function saveMessageTemplate(id, form) {
  const data = new FormData(form);
  const payload = {
    name: String(data.get("name") || "").trim(),
    subject: String(data.get("subject") || "").trim(),
    body: String(data.get("body") || "").trim(),
    isActive: data.get("isActive") === "true"
  };

  const response = await fetchAdmin(`/admin/messaging/templates/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });

  messageTemplates = messageTemplates.map(template => template.id === id ? response.template : template);
  renderMessageTemplates();
  if (activeLeadDetail) renderLeadMessageForm();
  await refreshAuditIfAdmin();
  setStatus(adminNotice, "Mesaj şablonu güncellendi.", "success");
}

async function sendLeadMessage() {
  if (!activeLeadDetail) return;
  const data = new FormData(leadMessageForm);
  const payload = {
    channel: data.get("channel"),
    templateId: String(data.get("templateId") || "").trim(),
    subject: String(data.get("subject") || "").trim(),
    body: String(data.get("body") || "").trim()
  };

  await fetchAdmin(`/admin/leads/${encodeURIComponent(activeLeadDetail.id)}/messages`, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  await openLeadDetail(activeLeadDetail.id);
  await loadMessageDeliveryPage(1);
  await refreshAuditIfAdmin();
  setStatus(leadMessageStatus, "Mesaj gönderildi.", "success");
  setStatus(adminNotice, "Adaya mesaj gönderildi.", "success");
}

async function toggleNotification(id) {
  const notification = notifications.find(item => String(item.id) === String(id));
  if (!notification) return;

  await fetchAdmin(`/admin/notifications/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ isRead: !notification.isRead })
  });

  await refreshStats();
  await loadNotificationPage(notificationPagination.page);
  await refreshAuditIfAdmin();
}

async function markAllNotificationsRead() {
  await fetchAdmin("/admin/notifications/read-all", {
    method: "POST"
  });

  await refreshStats();
  await loadNotificationPage(1);
  await refreshAuditIfAdmin();
  setStatus(adminNotice, "Tüm bildirimler okundu yapıldı.", "success");
}

async function loadAuditPage(page = 1) {
  const payload = await fetchAdmin(`/admin/audit-logs${buildQueryString({
    q: auditSearch.value.trim(),
    action: auditActionFilter.value,
    entityType: auditEntityFilter.value,
    page,
    pageSize: auditPageSize.value
  })}`);

  auditLogs = payload.logs || [];
  auditPagination = payload.pagination || auditPagination;
  renderAuditLogs();
}

async function loadCrmDeliveryPage(page = 1) {
  const payload = await fetchAdmin(`/admin/crm/deliveries${buildQueryString({
    q: crmDeliverySearch.value.trim(),
    status: crmDeliveryStatusFilter.value,
    event: crmDeliveryEventFilter.value,
    page,
    pageSize: crmDeliveryPageSize.value
  })}`);

  crmDeliveries = payload.deliveries || [];
  crmDeliveryPagination = payload.pagination || crmDeliveryPagination;
  renderCrmDeliveries();
}

async function loadLeadReport() {
  initReportRange();
  setStatus(reportStatus, "Rapor yükleniyor...");
  const payload = await fetchAdmin(`/admin/reports/leads${buildQueryString({
    startDate: reportStartDate.value,
    endDate: reportEndDate.value
  })}`);

  leadReport = payload.report || null;
  renderLeadReport();
  const range = leadReport?.range;
  setStatus(
    reportStatus,
    range ? `${range.startDate} - ${range.endDate} aralığı yüklendi.` : "Rapor yüklendi.",
    "success"
  );
}

function getLeadReportCsvRows() {
  if (!leadReport) return [];

  const summary = leadReport.summary || {};
  const range = leadReport.range || {};
  const rows = [
    ["Aday Raporu", `${range.startDate || ""} - ${range.endDate || ""}`],
    [],
    ["Özet", "Değer"],
    ["Toplam aday", summary.totalLeads],
    ["Önceki dönem aday", summary.previousLeadCount],
    ["Trend farkı", summary.trendDelta],
    ["Dönüşüm oranı", formatPercent(summary.conversionRate)],
    ["Başvuru/kayıt oranı", formatPercent(summary.applicationRate)],
    ["Randevu oranı", formatPercent(summary.appointmentRate)],
    ["Program seçimi", summary.choiceTotal],
    [],
    ["Pipeline", "Adet", "Pay"]
  ];

  (leadReport.statusBreakdown || []).forEach(item => {
    rows.push([statusLabels[item.status] || item.status, item.count, formatPercent(item.percent)]);
  });

  rows.push([], ["Günlük Akış", "Adet"]);
  (leadReport.dailyLeads || []).forEach(item => {
    rows.push([item.date, item.count]);
  });

  rows.push([], ["Program İlgisi", "Fakülte", "Puan", "Adet", "Pay"]);
  (leadReport.programInterest || []).forEach(item => {
    rows.push([item.name, item.faculty, item.scoreType, item.count, formatPercent(item.percent)]);
  });

  rows.push([], ["Kaynak", "Adet", "Pay"]);
  (leadReport.sourceBreakdown || []).forEach(item => {
    rows.push([sourceLabels[item.source] || item.source, item.count, formatPercent(item.percent)]);
  });

  rows.push([], ["Danışman", "Aday", "Randevu", "Başvuru", "Kayıt", "Dönüşüm"]);
  (leadReport.advisorPerformance || []).forEach(item => {
    rows.push([
      item.name,
      item.leadCount,
      item.appointmentCount,
      item.appliedCount,
      item.enrolledCount,
      formatPercent(item.conversionRate)
    ]);
  });

  return rows;
}

function exportLeadReportCsv() {
  if (!leadReport) {
    setStatus(reportStatus, "Önce raporu yükle.", "error");
    return;
  }

  const csv = getLeadReportCsvRows().map(row => row.map(toCsvValue).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const range = leadReport.range || {};
  link.href = url;
  link.download = `aday-raporu-${range.startDate || "baslangic"}-${range.endDate || "bitis"}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  setStatus(reportStatus, "Rapor CSV hazırlandı.", "success");
}

async function refreshAuditIfAdmin() {
  if (currentUser?.role !== "admin") return;
  try {
    await loadAuditPage(auditPagination.page);
  } catch (error) {}
}

async function loadLeadPage(page = 1) {
  const payload = await fetchAdmin(`/admin/leads${buildQueryString({
    q: leadSearch.value.trim(),
    status: statusFilter.value,
    page,
    pageSize: leadPageSize.value
  })}`);

  leads = payload.leads || [];
  leadPagination = payload.pagination || leadPagination;
  renderLeads();
}

async function loadAdvisors() {
  const payload = await fetchAdmin("/admin/advisors");
  advisors = payload.users || [];
}

async function loadProgramPage(page = 1) {
  const payload = await fetchAdmin(`/admin/programs${buildQueryString({
    q: programSearch.value.trim(),
    status: programStatusFilter.value,
    page,
    pageSize: programPageSize.value
  })}`);

  programs = payload.programs || [];
  programPagination = payload.pagination || programPagination;
  programSummary = payload.summary || programSummary;
  renderPrograms();
}

async function loadDashboard() {
  setStatus(adminNotice, "Kayıtlar yükleniyor...");
  const sessionPayload = await fetchAdmin("/admin/session");
  currentUser = sessionPayload.user;
  applyRoleUi();

  const role = currentUser.role;
  const statPayload = await fetchAdmin("/admin/stats");
  const userPayload = role === "admin"
    ? await fetchAdmin("/admin/users")
    : { users: [] };

  stats = statPayload.stats || null;
  users = userPayload.users || [];
  renderStats();
  renderProgramInterest();
  if (role === "admin") {
    await loadSettings();
    await loadCrmIntegration();
    await loadCrmDeliveryPage(1);
    await loadAuditPage(1);
  } else {
    siteSettings = null;
    crmIntegration = null;
    crmDeliveries = [];
    renderCrmDeliveries();
    auditLogs = [];
    renderAuditLogs();
  }
  if (["admin", "advisor"].includes(role)) {
    await loadAdvisors();
  } else {
    advisors = [];
  }
  if (["admin", "advisor"].includes(role)) {
    await loadLeadReport();
  } else {
    leadReport = null;
    renderLeadReport();
  }
  if (["admin", "advisor"].includes(role)) {
    await loadNotificationPage(1);
  } else {
    notifications = [];
    renderNotifications();
  }
  if (["admin", "advisor"].includes(role)) {
    await loadMessaging();
    await loadMessageDeliveryPage(1);
  } else {
    messageTemplates = [];
    messageDeliveries = [];
    renderMessageTemplates();
    renderMessageDeliveries();
  }
  if (["admin", "advisor"].includes(role)) {
    await loadLeadPage(1);
  } else {
    leads = [];
    renderLeads();
  }
  if (["admin", "editor"].includes(role)) {
    await loadProgramPage(1);
  } else {
    programs = [];
    renderPrograms();
  }
  renderUsers();
  setStatus(adminNotice, "Güncel.", "success");
}

async function saveLead(id) {
  const card = leadsList.querySelector(`[data-lead-id="${CSS.escape(id)}"]`);
  if (!card) return;

  const status = card.querySelector("[data-status]").value;
  const note = card.querySelector("[data-note]").value.trim();
  const assignedUserId = card.querySelector("[data-assigned-user-id]").value;
  const appointmentAt = card.querySelector("[data-appointment-at]").value;
  const appointmentNote = card.querySelector("[data-appointment-note]").value.trim();
  const followUpAt = card.querySelector("[data-follow-up-at]").value;
  const followUpNote = card.querySelector("[data-follow-up-note]").value.trim();
  await fetchAdmin(`/admin/leads/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      note,
      assignedUserId,
      appointmentAt,
      appointmentNote,
      followUpAt,
      followUpNote
    })
  });

  await refreshStats();
  await refreshLeadReportIfAllowed();
  await loadNotificationPage(notificationPagination.page);
  await loadLeadPage(leadPagination.page);
  await refreshAuditIfAdmin();
  setStatus(adminNotice, "Aday kaydı güncellendi.", "success");
}

async function refreshStats() {
  const statPayload = await fetchAdmin("/admin/stats");
  stats = statPayload.stats || null;
  renderStats();
  renderProgramInterest();
}

async function refreshLeadReportIfAllowed() {
  if (!["admin", "advisor"].includes(currentUser?.role)) return;
  await loadLeadReport();
}

async function removeLead(id) {
  const shouldDelete = confirm("Bu aday kaydı silinsin mi?");
  if (!shouldDelete) return;

  await fetchAdmin(`/admin/leads/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });

  await refreshStats();
  await refreshLeadReportIfAllowed();
  await loadNotificationPage(notificationPagination.page);
  await loadLeadPage(leadPagination.page);
  await refreshAuditIfAdmin();
  setStatus(adminNotice, "Aday kaydı silindi.", "success");
}

function toCsvValue(value) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replace(/"/g, "\"\"")}"`;
}

async function getAllFilteredLeads() {
  const allLeads = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const payload = await fetchAdmin(`/admin/leads${buildQueryString({
      q: leadSearch.value.trim(),
      status: statusFilter.value,
      page,
      pageSize: 100
    })}`);

    allLeads.push(...(payload.leads || []));
    hasNext = Boolean(payload.pagination?.hasNext);
    page += 1;
  }

  return allLeads;
}

async function exportCsv() {
  exportCsvBtn.disabled = true;
  setStatus(adminNotice, "CSV hazırlanıyor...");

  try {
    const exportLeads = await getAllFilteredLeads();
    const rows = [
      ["Tarih", "Ad Soyad", "Telefon", "E-posta", "Durum", "Danışman", "Randevu", "Programlar", "Not"],
      ...exportLeads.map(lead => [
        formatDate(lead.createdAt),
        lead.fullName,
        lead.phone,
        lead.email,
        statusLabels[lead.status] || lead.status,
        lead.assignedUser?.name || "",
        lead.appointmentAt ? formatDate(lead.appointmentAt) : "",
        lead.selectedProgramDetails.map(program => program.name).join(" | "),
        lead.note
      ])
    ];
    const csv = rows.map(row => row.map(toCsvValue).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aday-kayitlari-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus(adminNotice, `${exportLeads.length} aday için CSV hazırlandı.`, "success");
  } finally {
    exportCsvBtn.disabled = false;
  }
}

adminLoginForm.addEventListener("submit", async event => {
  event.preventDefault();
  loginBtn.disabled = true;
  setStatus(loginStatus, "Giriş kontrol ediliyor...");

  try {
    await login(adminEmail.value, adminPassword.value);
    adminEmail.value = "";
    adminPassword.value = "";
    setStatus(loginStatus, "");
  } catch (error) {
    setStatus(loginStatus, error.message, "error");
  } finally {
    loginBtn.disabled = false;
  }
});

refreshBtn.addEventListener("click", () => {
  loadDashboard().catch(error => {
    setStatus(adminNotice, error.message, "error");
  });
});

logoutBtn.addEventListener("click", () => {
  clearSession();
  setStatus(loginStatus, "Çıkış yapıldı.", "success");
});

exportCsvBtn.addEventListener("click", () => {
  exportCsv().catch(error => setStatus(adminNotice, error.message, "error"));
});
reportRefreshBtn.addEventListener("click", () => {
  loadLeadReport().catch(error => setStatus(reportStatus, error.message, "error"));
});
reportExportBtn.addEventListener("click", exportLeadReportCsv);
reportStartDate.addEventListener("change", () => {
  loadLeadReport().catch(error => setStatus(reportStatus, error.message, "error"));
});
reportEndDate.addEventListener("change", () => {
  loadLeadReport().catch(error => setStatus(reportStatus, error.message, "error"));
});
notificationStatusFilter.addEventListener("change", () => {
  loadNotificationPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
});
notificationTypeFilter.addEventListener("change", () => {
  loadNotificationPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
});
notificationPageSize.addEventListener("change", () => {
  loadNotificationPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
});
notificationPrevBtn.addEventListener("click", () => {
  if (!notificationPagination.hasPrev) return;
  loadNotificationPage(notificationPagination.page - 1).catch(error => setStatus(adminNotice, error.message, "error"));
});
notificationNextBtn.addEventListener("click", () => {
  if (!notificationPagination.hasNext) return;
  loadNotificationPage(notificationPagination.page + 1).catch(error => setStatus(adminNotice, error.message, "error"));
});
markAllNotificationsBtn.addEventListener("click", () => {
  markAllNotificationsRead().catch(error => setStatus(adminNotice, error.message, "error"));
});
messageTemplateList.addEventListener("submit", event => {
  event.preventDefault();
  const form = event.target.closest("[data-message-template-id]");
  const id = form?.dataset.messageTemplateId;
  if (!id || currentUser?.role !== "admin") return;
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  saveMessageTemplate(id, form)
    .catch(error => setStatus(adminNotice, error.message, "error"))
    .finally(() => {
      button.disabled = false;
    });
});
messageDeliverySearch.addEventListener("input", () => {
  runDebounced("messages", () => {
    loadMessageDeliveryPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
  });
});
messageDeliveryChannelFilter.addEventListener("change", () => {
  loadMessageDeliveryPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
});
messageDeliveryStatusFilter.addEventListener("change", () => {
  loadMessageDeliveryPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
});
messageDeliveryPageSize.addEventListener("change", () => {
  loadMessageDeliveryPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
});
messageDeliveryPrevBtn.addEventListener("click", () => {
  if (!messageDeliveryPagination.hasPrev) return;
  loadMessageDeliveryPage(messageDeliveryPagination.page - 1).catch(error => setStatus(adminNotice, error.message, "error"));
});
messageDeliveryNextBtn.addEventListener("click", () => {
  if (!messageDeliveryPagination.hasNext) return;
  loadMessageDeliveryPage(messageDeliveryPagination.page + 1).catch(error => setStatus(adminNotice, error.message, "error"));
});
auditSearch.addEventListener("input", () => {
  runDebounced("audit", () => {
    loadAuditPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
  });
});
auditActionFilter.addEventListener("change", () => {
  loadAuditPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
});
auditEntityFilter.addEventListener("change", () => {
  loadAuditPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
});
auditPageSize.addEventListener("change", () => {
  loadAuditPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
});
auditPrevBtn.addEventListener("click", () => {
  if (!auditPagination.hasPrev) return;
  loadAuditPage(auditPagination.page - 1).catch(error => setStatus(adminNotice, error.message, "error"));
});
auditNextBtn.addEventListener("click", () => {
  if (!auditPagination.hasNext) return;
  loadAuditPage(auditPagination.page + 1).catch(error => setStatus(adminNotice, error.message, "error"));
});
leadSearch.addEventListener("input", () => {
  runDebounced("leads", () => {
    loadLeadPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
  });
});
statusFilter.addEventListener("change", () => {
  loadLeadPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
});
leadPageSize.addEventListener("change", () => {
  loadLeadPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
});
leadPrevBtn.addEventListener("click", () => {
  if (!leadPagination.hasPrev) return;
  loadLeadPage(leadPagination.page - 1).catch(error => setStatus(adminNotice, error.message, "error"));
});
leadNextBtn.addEventListener("click", () => {
  if (!leadPagination.hasNext) return;
  loadLeadPage(leadPagination.page + 1).catch(error => setStatus(adminNotice, error.message, "error"));
});
programSearch.addEventListener("input", () => {
  runDebounced("programs", () => {
    loadProgramPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
  });
});
programStatusFilter.addEventListener("change", () => {
  loadProgramPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
});
programPageSize.addEventListener("change", () => {
  loadProgramPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
});
programPrevBtn.addEventListener("click", () => {
  if (!programPagination.hasPrev) return;
  loadProgramPage(programPagination.page - 1).catch(error => setStatus(adminNotice, error.message, "error"));
});
programNextBtn.addEventListener("click", () => {
  if (!programPagination.hasNext) return;
  loadProgramPage(programPagination.page + 1).catch(error => setStatus(adminNotice, error.message, "error"));
});
programImportFile.addEventListener("change", async () => {
  const file = programImportFile.files?.[0];
  if (!file) return;

  programImportText.value = await file.text();
  renderProgramImportResult(null);
});

programTemplateBtn.addEventListener("click", downloadProgramTemplate);

programForm.addEventListener("submit", event => {
  event.preventDefault();
  programSaveBtn.disabled = true;

  saveProgram()
    .catch(error => setStatus(adminNotice, error.message, "error"))
    .finally(() => {
      programSaveBtn.disabled = false;
    });
});

programResetBtn.addEventListener("click", () => {
  setProgramFormMode("create");
});

programImportForm.addEventListener("submit", event => {
  event.preventDefault();
  programImportBtn.disabled = true;
  renderProgramImportResult(null);
  setStatus(adminNotice, "Program import kontrol ediliyor...");

  importPrograms()
    .catch(error => {
      renderProgramImportResult(error.details || { message: error.message }, "error");
      setStatus(adminNotice, error.message, "error");
    })
    .finally(() => {
      programImportBtn.disabled = false;
    });
});

userForm.addEventListener("submit", event => {
  event.preventDefault();
  userSaveBtn.disabled = true;

  saveUser()
    .catch(error => setStatus(adminNotice, error.message, "error"))
    .finally(() => {
      userSaveBtn.disabled = false;
    });
});

userResetBtn.addEventListener("click", () => {
  setUserFormMode("create");
});

settingsForm.addEventListener("submit", event => {
  event.preventDefault();
  settingsSaveBtn.disabled = true;
  setStatus(settingsStatus, "Ayarlar kaydediliyor...");

  saveSettings()
    .catch(error => setStatus(settingsStatus, error.message, "error"))
    .finally(() => {
      settingsSaveBtn.disabled = false;
    });
});

crmForm.addEventListener("submit", event => {
  event.preventDefault();
  crmSaveBtn.disabled = true;
  setStatus(crmStatus, "CRM entegrasyonu kaydediliyor...");

  saveCrmIntegration()
    .catch(error => setStatus(crmStatus, error.message, "error"))
    .finally(() => {
      crmSaveBtn.disabled = false;
    });
});

crmTestBtn.addEventListener("click", () => {
  crmTestBtn.disabled = true;
  setStatus(crmStatus, "Test gönderimi yapılıyor...");

  testCrmIntegration()
    .catch(error => setStatus(crmStatus, error.message, "error"))
    .finally(() => {
      crmTestBtn.disabled = false;
    });
});

crmDeliverySearch.addEventListener("input", () => {
  runDebounced("crm", () => {
    loadCrmDeliveryPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
  });
});
crmDeliveryStatusFilter.addEventListener("change", () => {
  loadCrmDeliveryPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
});
crmDeliveryEventFilter.addEventListener("change", () => {
  loadCrmDeliveryPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
});
crmDeliveryPageSize.addEventListener("change", () => {
  loadCrmDeliveryPage(1).catch(error => setStatus(adminNotice, error.message, "error"));
});
crmDeliveryPrevBtn.addEventListener("click", () => {
  if (!crmDeliveryPagination.hasPrev) return;
  loadCrmDeliveryPage(crmDeliveryPagination.page - 1).catch(error => setStatus(adminNotice, error.message, "error"));
});
crmDeliveryNextBtn.addEventListener("click", () => {
  if (!crmDeliveryPagination.hasNext) return;
  loadCrmDeliveryPage(crmDeliveryPagination.page + 1).catch(error => setStatus(adminNotice, error.message, "error"));
});

leadsList.addEventListener("click", event => {
  const saveId = event.target.closest("[data-save]")?.dataset.save;
  const deleteId = event.target.closest("[data-delete]")?.dataset.delete;
  const detailId = event.target.closest("[data-detail]")?.dataset.detail;

  if (saveId) {
    saveLead(saveId).catch(error => setStatus(adminNotice, error.message, "error"));
  }

  if (deleteId) {
    removeLead(deleteId).catch(error => setStatus(adminNotice, error.message, "error"));
  }

  if (detailId) {
    openLeadDetail(detailId).catch(error => setStatus(adminNotice, error.message, "error"));
  }
});

notificationList.addEventListener("click", event => {
  const toggleId = event.target.closest("[data-notification-toggle]")?.dataset.notificationToggle;
  const leadId = event.target.closest("[data-notification-lead]")?.dataset.notificationLead;

  if (toggleId) {
    toggleNotification(toggleId).catch(error => setStatus(adminNotice, error.message, "error"));
  }

  if (leadId) {
    setActiveAdminTab("leads");
    openLeadDetail(leadId).catch(error => setStatus(adminNotice, error.message, "error"));
  }
});

programList.addEventListener("click", event => {
  const editId = event.target.closest("[data-program-edit]")?.dataset.programEdit;
  const toggleId = event.target.closest("[data-program-toggle]")?.dataset.programToggle;

  if (editId) {
    const program = programs.find(item => item.id === editId);
    if (program) {
      setProgramFormMode("edit", program);
      programForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (toggleId) {
    toggleProgram(toggleId).catch(error => setStatus(adminNotice, error.message, "error"));
  }
});

userList.addEventListener("click", event => {
  const editId = event.target.closest("[data-user-edit]")?.dataset.userEdit;
  const toggleId = event.target.closest("[data-user-toggle]")?.dataset.userToggle;

  if (editId) {
    const user = users.find(item => item.id === editId);
    if (user) {
      setUserFormMode("edit", user);
      userForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (toggleId) {
    toggleUser(toggleId).catch(error => setStatus(adminNotice, error.message, "error"));
  }
});

adminTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    setActiveAdminTab(tab.dataset.adminTab);
  });
});

leadDetailClose.addEventListener("click", () => {
  leadDetailModal.close();
});

leadDetailModal.addEventListener("click", event => {
  if (event.target === leadDetailModal) {
    leadDetailModal.close();
  }
});

leadMessageChannel.addEventListener("change", () => {
  renderLeadMessageTemplateOptions();
  const firstTemplate = getLeadMessageTemplates(leadMessageChannel.value)[0];
  leadMessageTemplate.value = firstTemplate?.id || "";
  applyLeadMessageTemplate();
});

leadMessageTemplate.addEventListener("change", applyLeadMessageTemplate);

leadMessageForm.addEventListener("submit", event => {
  event.preventDefault();
  leadMessageSendBtn.disabled = true;
  setStatus(leadMessageStatus, "Mesaj gönderiliyor...");
  sendLeadMessage()
    .catch(error => setStatus(leadMessageStatus, error.message, "error"))
    .finally(() => {
      leadMessageSendBtn.disabled = false;
    });
});

activityForm.addEventListener("submit", event => {
  event.preventDefault();
  activitySaveBtn.disabled = true;
  addLeadActivity()
    .catch(error => setStatus(adminNotice, error.message, "error"))
    .finally(() => {
      activitySaveBtn.disabled = false;
    });
});

themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  applyTheme(currentTheme === "dark" ? "light" : "dark");
});

initTheme();
initReportRange();
renderLeadReport();
setActiveAdminTab("overview");
setProgramFormMode("create");
setUserFormMode("create");
setAuthenticated(Boolean(adminToken));

if (adminToken) {
  loadDashboard().catch(error => {
    setStatus(loginStatus, error.message, "error");
    clearSession();
  });
}
