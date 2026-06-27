let programs = (Array.isArray(window.PROGRAM_DATA) ? window.PROGRAM_DATA : []).map(normalizeProgram);
let programDataVersion = window.PROGRAM_DATA_VERSION || "local";
const universityInfo = window.UNIVERSITY_INFO || {};
const API_BASE = window.API_BASE || (
  window.location.protocol === "file:" ? "http://localhost:3000/api" : "/api"
);

const form = document.querySelector("#preferenceForm");
const resetBtn = document.querySelector("#resetBtn");
const programGrid = document.querySelector("#programGrid");
const resultInfo = document.querySelector("#resultInfo");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const filterChips = document.querySelector("#filterChips");
const choiceList = document.querySelector("#choiceList");
const choiceCount = document.querySelector("#choiceCount");
const compareBody = document.querySelector("#compareBody");
const compareCards = document.querySelector("#compareCards");
const compareCount = document.querySelector("#compareCount");
const clearListBtn = document.querySelector("#clearListBtn");
const copyListBtn = document.querySelector("#copyListBtn");
const printListBtn = document.querySelector("#printListBtn");
const shareFiltersBtn = document.querySelector("#shareFiltersBtn");
const copyStatus = document.querySelector("#copyStatus");
const leadForm = document.querySelector("#leadForm");
const leadStatus = document.querySelector("#leadStatus");
const leadSubmitBtn = document.querySelector("#leadSubmitBtn");
const programModal = document.querySelector("#programModal");
const modalContent = document.querySelector("#modalContent");
const modalClose = document.querySelector("#modalClose");
const kvkkModal = document.querySelector("#kvkkModal");
const kvkkOpen = document.querySelector("#kvkkOpen");
const kvkkClose = document.querySelector("#kvkkClose");
const kvkkBody = document.querySelector("#kvkkBody");
const themeToggle = document.querySelector("#themeToggle");
const themeToggleText = document.querySelector("#themeToggleText");
const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");
const footerEmail = document.querySelector("#footerEmail");
const footerPhone = document.querySelector("#footerPhone");
const universityName = document.querySelector("#universityName");
const universityDescription = document.querySelector("#universityDescription");
const universityCampuses = document.querySelector("#universityCampuses");
const universityContact = document.querySelector("#universityContact");
const universitySource = document.querySelector("#universitySource");

const filterLabels = {
  scoreType: "Puan",
  interest: "Alan",
  educationType: "Eğitim",
  priority: "Öncelik",
  language: "Dil",
  duration: "Süre",
  scholarship: "Burs"
};

const filterValueLabels = {
  all: "Tümü",
  SAY: "Sayısal",
  EA: "Eşit Ağırlık",
  SÖZ: "Sözel",
  DİL: "Dil",
  TYT: "TYT",
  bilişim: "Bilişim",
  sağlık: "Sağlık",
  havacılık: "Havacılık",
  sosyal: "Sosyal Bilimler",
  dil: "Dil",
  tasarım: "Tasarım",
  turizm: "Turizm",
  Örgün: "Örgün",
  Uzaktan: "Uzaktan",
  Türkçe: "Türkçe",
  İngilizce: "İngilizce",
  "2 yıl": "2 yıl",
  "4 yıl": "4 yıl",
  "5 yıl": "5 yıl",
  Burslu: "Burslu",
  "%25 İndirimli": "%25 İndirimli",
  "%50 İndirimli": "%50 İndirimli",
  "%50 Burslu": "%50 Burslu",
  Ücretli: "Ücretli",
  kariyer: "Kariyer",
  uygulama: "Uygulama",
  teknoloji: "Teknoloji",
  insan: "Sosyal Etki"
};

const categoryCodes = {
  bilişim: "BT",
  sağlık: "SA",
  havacılık: "HV",
  sosyal: "SB",
  dil: "Dİ",
  tasarım: "TS",
  turizm: "TU"
};

let currentFilters = {
  scoreType: "all",
  interest: "all",
  educationType: "all",
  priority: "all",
  language: "all",
  duration: "all",
  scholarship: "all",
  sort: "match",
  search: ""
};

const filterParamMap = {
  scoreType: "puan",
  interest: "alan",
  educationType: "egitim",
  priority: "oncelik",
  language: "dil",
  duration: "sure",
  scholarship: "burs",
  sort: "siralama",
  search: "arama"
};

let selectedPrograms = getStoredSelectedPrograms();
let lastFocusedElement = null;
let activeProgramHash = "";
let isApiConnected = false;
let siteSettings = {};

function getStoredSelectedPrograms() {
  try {
    const saved = JSON.parse(localStorage.getItem("selectedPrograms") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function normalizeProgram(program) {
  return {
    university: program.university || "Kapadokya Üniversitesi",
    city: program.city || "Nevşehir",
    feeStatus: program.feeStatus || (program.scholarshipOptions || []).join(", "),
    baseScoreYear: program.baseScoreYear || program.sourceYear || "2025 YKS",
    rankYear: program.rankYear || program.sourceYear || "2025 YKS",
    quotaYear: program.quotaYear || program.sourceYear || "2025 YKS",
    ...program,
    scholarshipOptions: Array.isArray(program.scholarshipOptions) ? program.scholarshipOptions : [],
    careers: Array.isArray(program.careers) ? program.careers : [],
    priorities: Array.isArray(program.priorities) ? program.priorities : []
  };
}

function getSafeProgram(program) {
  return {
    id: escapeHTML(program.id),
    university: escapeHTML(program.university),
    name: escapeHTML(program.name),
    faculty: escapeHTML(program.faculty),
    scoreType: escapeHTML(program.scoreType),
    educationType: escapeHTML(program.educationType),
    campus: escapeHTML(program.campus),
    duration: escapeHTML(program.duration),
    language: escapeHTML(program.language),
    category: escapeHTML(program.category),
    summary: escapeHTML(program.summary),
    baseScore: escapeHTML(program.baseScore),
    rank: escapeHTML(program.rank),
    quota: escapeHTML(program.quota),
    sourceYear: escapeHTML(program.sourceYear),
    sourceStatus: escapeHTML(program.sourceStatus),
    city: escapeHTML(program.city),
    feeStatus: escapeHTML(program.feeStatus),
    baseScoreYear: escapeHTML(program.baseScoreYear),
    rankYear: escapeHTML(program.rankYear),
    quotaYear: escapeHTML(program.quotaYear),
    scholarshipOptions: program.scholarshipOptions.map(escapeHTML),
    careers: program.careers.map(escapeHTML),
    priorities: program.priorities.map(escapeHTML)
  };
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  try {
    localStorage.setItem("theme", nextTheme);
  } catch (error) {}

  if (!themeToggle || !themeToggleText) return;

  const isDark = nextTheme === "dark";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggleText.textContent = isDark ? "Açık mod" : "Koyu mod";
}

function initTheme() {
  let savedTheme = "light";
  try {
    savedTheme = localStorage.getItem("theme");
  } catch (error) {}
  applyTheme(savedTheme === "dark" ? "dark" : "light");
}

function setMenuOpen(isOpen) {
  if (!menuToggle || !navLinks) return;
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Menüyü kapat" : "Menüyü aç");
  navLinks.classList.toggle("is-open", isOpen);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[character]);
}

function calculateMatch(program) {
  let score = 34;
  if (currentFilters.scoreType !== "all" && program.scoreType === currentFilters.scoreType) score += 20;
  if (currentFilters.interest !== "all" && program.category === currentFilters.interest) score += 20;
  if (currentFilters.educationType !== "all" && program.educationType === currentFilters.educationType) score += 10;
  if (currentFilters.priority !== "all" && program.priorities.includes(currentFilters.priority)) score += 10;
  if (currentFilters.language !== "all" && program.language === currentFilters.language) score += 6;
  if (currentFilters.duration !== "all" && program.duration === currentFilters.duration) score += 5;
  if (currentFilters.scholarship !== "all" && program.scholarshipOptions.includes(currentFilters.scholarship)) score += 5;
  return Math.min(score, 100);
}

function getMatchReasons(program) {
  const reasons = [];
  if (currentFilters.scoreType !== "all" && program.scoreType === currentFilters.scoreType) {
    reasons.push("puan türü eşleşiyor");
  }
  if (currentFilters.interest !== "all" && program.category === currentFilters.interest) {
    reasons.push("ilgi alanına uygun");
  }
  if (currentFilters.educationType !== "all" && program.educationType === currentFilters.educationType) {
    reasons.push("eğitim türü tercihinle uyumlu");
  }
  if (currentFilters.priority !== "all" && program.priorities.includes(currentFilters.priority)) {
    reasons.push("önceliğini destekliyor");
  }
  if (currentFilters.language !== "all" && program.language === currentFilters.language) {
    reasons.push("eğitim dili tercihinle uyumlu");
  }
  if (currentFilters.duration !== "all" && program.duration === currentFilters.duration) {
    reasons.push("program süresi eşleşiyor");
  }
  if (currentFilters.scholarship !== "all" && program.scholarshipOptions.includes(currentFilters.scholarship)) {
    reasons.push("burs seçeneği mevcut");
  }
  return reasons.length ? reasons : ["genel program profiline göre listelendi"];
}

function getFilteredPrograms() {
  const search = currentFilters.search.trim().toLocaleLowerCase("tr-TR");

  return programs
    .filter(program => currentFilters.scoreType === "all" || program.scoreType === currentFilters.scoreType)
    .filter(program => currentFilters.interest === "all" || program.category === currentFilters.interest)
    .filter(program => currentFilters.educationType === "all" || program.educationType === currentFilters.educationType)
    .filter(program => currentFilters.priority === "all" || program.priorities.includes(currentFilters.priority))
    .filter(program => currentFilters.language === "all" || program.language === currentFilters.language)
    .filter(program => currentFilters.duration === "all" || program.duration === currentFilters.duration)
    .filter(program => currentFilters.scholarship === "all" || program.scholarshipOptions.includes(currentFilters.scholarship))
    .filter(program => {
      if (!search) return true;
      return [program.name, program.university, program.faculty, program.category, program.campus, program.language, program.duration, ...program.careers]
        .join(" ")
        .toLocaleLowerCase("tr-TR")
        .includes(search);
    })
    .map(program => ({ ...program, match: calculateMatch(program) }))
    .sort((a, b) => {
      if (currentFilters.sort === "name") return a.name.localeCompare(b.name, "tr");
      if (currentFilters.sort === "duration") return parseInt(a.duration, 10) - parseInt(b.duration, 10) || a.name.localeCompare(b.name, "tr");
      return b.match - a.match || a.name.localeCompare(b.name, "tr");
    });
}

function getSelectedPrograms() {
  return selectedPrograms
    .map(id => programs.find(program => program.id === id))
    .filter(Boolean);
}

function getCategoryCode(category) {
  return categoryCodes[category] || category.slice(0, 2).toLocaleUpperCase("tr-TR");
}

function getDurationValue(program) {
  return parseInt(program.duration, 10);
}

function getRankValue(program) {
  return parseInt(program.rank.replace(/\D/g, ""), 10);
}

function getProgramHash(id) {
  return `program-${encodeURIComponent(id)}`;
}

function renderStateCard(title, text) {
  return `
    <div class="state-card">
      <strong>${escapeHTML(title)}</strong>
      <span>${escapeHTML(text)}</span>
    </div>
  `;
}

function getFilterUrl(options = {}) {
  const url = new URL(window.location.href);

  Object.entries(filterParamMap).forEach(([key, param]) => {
    const value = currentFilters[key];
    if (!value || value === "all" || (key === "sort" && value === "match")) {
      url.searchParams.delete(param);
      return;
    }
    url.searchParams.set(param, value);
  });

  if (!options.preserveHash) {
    url.hash = "";
  }

  return url;
}

function updateFilterUrl() {
  const url = getFilterUrl({ preserveHash: true });
  window.history.replaceState(null, "", `${url.pathname}${url.search}${window.location.hash}`);
}

function hydrateFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);

  Object.entries(filterParamMap).forEach(([key, param]) => {
    const value = params.get(param);
    if (value === null) return;
    currentFilters[key] = value || currentFilters[key];
  });

  if (form) {
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (!form.elements[key]) return;
      form.elements[key].value = value;
    });
  }

  searchInput.value = currentFilters.search;
  sortSelect.value = currentFilters.sort;
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  if (!digits) return "";
  const local = digits.startsWith("90") ? digits.slice(2) : digits;
  const normalized = local.startsWith("0") ? local : `0${local}`;
  const clean = normalized.slice(0, 11);

  if (clean.length <= 1) return clean;
  if (clean.length <= 4) return `${clean.slice(0, 1)} (${clean.slice(1)}`;
  if (clean.length <= 7) return `${clean.slice(0, 1)} (${clean.slice(1, 4)}) ${clean.slice(4)}`;
  if (clean.length <= 9) return `${clean.slice(0, 1)} (${clean.slice(1, 4)}) ${clean.slice(4, 7)} ${clean.slice(7)}`;
  return `${clean.slice(0, 1)} (${clean.slice(1, 4)}) ${clean.slice(4, 7)} ${clean.slice(7, 9)} ${clean.slice(9, 11)}`;
}

function setLeadLoading(isLoading) {
  leadForm.setAttribute("aria-busy", String(isLoading));
  if (!leadSubmitBtn) return;
  leadSubmitBtn.disabled = isLoading;
  leadSubmitBtn.textContent = isLoading ? "Kaydediliyor..." : "Formu Kaydet";
}

async function fetchApi(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.ok === false) {
    const error = new Error(payload.message || "API isteği başarısız.");
    error.status = response.status;
    error.details = payload.details;
    throw error;
  }

  return payload;
}

function updateMeta(selector, value) {
  const element = document.querySelector(selector);
  if (!element || !value) return;
  element.setAttribute("content", value);
}

function getTelHref(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? `tel:${digits}` : "#contact";
}

function renderPlainTextBody(value) {
  const paragraphs = String(value || "")
    .split(/\r?\n+/)
    .map(item => item.trim())
    .filter(Boolean);

  return paragraphs.length
    ? paragraphs.map(paragraph => `<p>${escapeHTML(paragraph)}</p>`).join("")
    : "";
}

function applySiteSettings(settings) {
  siteSettings = settings || {};

  document.querySelectorAll("[data-setting]").forEach(element => {
    const key = element.dataset.setting;
    if (siteSettings[key] === undefined) return;
    element.textContent = siteSettings[key];
  });

  if (siteSettings.siteTitle) {
    document.title = siteSettings.siteTitle;
    updateMeta('meta[property="og:title"]', siteSettings.siteTitle);
  }

  if (siteSettings.siteDescription) {
    updateMeta('meta[name="description"]', siteSettings.siteDescription);
    updateMeta('meta[property="og:description"]', siteSettings.siteDescription);
  }

  if (kvkkBody && siteSettings.kvkkText) {
    kvkkBody.innerHTML = renderPlainTextBody(siteSettings.kvkkText);
  }

  if (footerEmail) {
    footerEmail.hidden = !siteSettings.contactEmail;
    footerEmail.href = siteSettings.contactEmail ? `mailto:${siteSettings.contactEmail}` : "#contact";
  }

  if (footerPhone) {
    footerPhone.hidden = !siteSettings.contactPhone;
    footerPhone.href = getTelHref(siteSettings.contactPhone);
  }
}

function applyUniversityInfo() {
  if (!universityInfo.name) return;

  if (universityName) universityName.textContent = universityInfo.name;

  if (universityDescription) {
    universityDescription.textContent = [
      universityInfo.type,
      universityInfo.foundation
    ].filter(Boolean).join(" · ");
  }

  if (universityCampuses) {
    universityCampuses.textContent = Array.isArray(universityInfo.campuses)
      ? universityInfo.campuses.join(", ")
      : "";
  }

  if (universityContact) {
    universityContact.textContent = [universityInfo.phone, universityInfo.email].filter(Boolean).join(" · ");
  }

  if (universitySource && universityInfo.sourceUrl) {
    universitySource.href = universityInfo.sourceUrl;
  }
}

async function loadSiteSettings() {
  try {
    const payload = await fetchApi("/settings");
    applySiteSettings(payload.settings || {});
  } catch (error) {
    siteSettings = {};
  }
}

async function loadProgramsFromApi() {
  try {
    const payload = await fetchApi("/programs");
    programs = (payload.programs || []).map(normalizeProgram);
    programDataVersion = payload.version || "api";
    isApiConnected = true;
  } catch (error) {
    isApiConnected = false;
  } finally {
    renderPrograms();
    renderChoiceList();
    syncProgramFromHash();
  }
}

async function submitLeadToBackend(payload) {
  if (!API_BASE) {
    throw new Error("API bağlantısı yok.");
  }

  return fetchApi("/leads", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

function renderFilterChips() {
  const chips = Object.entries(currentFilters)
    .filter(([key, value]) => !["search", "sort"].includes(key) && value !== "all")
    .map(([key, value]) => `<span>${escapeHTML(filterLabels[key])}: ${escapeHTML(filterValueLabels[value] || value)}</span>`);

  if (currentFilters.search.trim()) {
    chips.push(`<span>Arama: ${escapeHTML(currentFilters.search.trim())}</span>`);
  }

  filterChips.innerHTML = chips.length
    ? chips.join("")
    : `<span>Tüm programlar</span>`;
}

function renderPrograms() {
  const filtered = getFilteredPrograms();
  renderFilterChips();

  if (!programs.length) {
    resultInfo.textContent = "Program verisi yüklenemedi.";
    programGrid.innerHTML = renderStateCard(
      "Program verisi bekleniyor",
      "Backend veya veri dosyası bağlandığında kartlar burada listelenecek."
    );
    renderComparison();
    return;
  }

  const dataSourceLabel = isApiConnected ? "Backend API" : "lokal resmi veri";
  resultInfo.textContent = filtered.length
    ? `${filtered.length} program listeleniyor. Kaynak: ${dataSourceLabel} · ${programDataVersion}.`
    : "Seçimlerine uygun program bulunamadı. Filtreleri genişletmeyi deneyebilirsin.";

  if (!filtered.length) {
    programGrid.innerHTML = renderStateCard(
      "Sonuç bulunamadı",
      "Arama kelimesini veya filtreleri genişletmeyi deneyebilirsin."
    );
    renderComparison();
    return;
  }

  programGrid.innerHTML = filtered.map(program => {
    const safe = getSafeProgram(program);
    const isAdded = selectedPrograms.includes(program.id);
    const reasons = getMatchReasons(program).slice(0, 2).map(escapeHTML).join(" · ");
    return `
      <article class="program-card">
        <div class="program-top">
          <span class="category-lockup">
            <span class="category-mark">${escapeHTML(getCategoryCode(program.category))}</span>
            <span class="badge">${safe.category}</span>
          </span>
          <span class="score">%${program.match}</span>
        </div>
        <h3>${safe.name}</h3>
        <strong class="program-university">${safe.university}</strong>
        <ul class="meta" aria-label="Program bilgileri">
          <li>${safe.scoreType}</li>
          <li>${safe.educationType}</li>
          <li>${safe.language}</li>
          <li>${safe.duration}</li>
          <li>${safe.campus}</li>
        </ul>
        <p>${safe.summary}</p>
        <div class="reason">${reasons}</div>
        <div class="data-strip">
          <span>Taban puan: <strong>${safe.baseScore}</strong></span>
          <span>Sıra: <strong>${safe.rank}</strong></span>
          <span>${safe.sourceYear}</span>
        </div>
        <ul class="program-facts" aria-label="Ek program bilgileri">
          <li><strong>${safe.quota}</strong><span>kontenjan</span></li>
          <li><strong>${program.scholarshipOptions.length}</strong><span>burs seçeneği</span></li>
        </ul>
        <div class="card-actions">
          <button class="btn btn-primary ${isAdded ? "added" : ""}" type="button" data-add="${safe.id}">
            ${isAdded ? "Listeye Eklendi" : "Tercih Listeme Ekle"}
          </button>
          <button class="btn link-btn" type="button" data-detail="${safe.id}">Detay</button>
        </div>
      </article>
    `;
  }).join("");
  renderComparison();
}

function renderChoiceList() {
  const selected = getSelectedPrograms();

  choiceCount.textContent = `${selected.length} program`;

  if (!selected.length) {
    choiceList.innerHTML = `<li class="empty">Henüz program eklenmedi.</li>`;
    renderComparison();
    return;
  }

  choiceList.innerHTML = selected.map((program, index) => {
    const safe = getSafeProgram(program);
    return `
      <li>
        <span>
          <strong>${safe.name}</strong><br>
          <small>${safe.scoreType} · ${safe.educationType} · ${safe.language} · ${safe.duration}</small>
          <small>${safe.university}</small>
        </span>
        <span class="choice-actions">
          <button class="order-btn" type="button" data-move="${safe.id}" data-direction="up" ${index === 0 ? "disabled" : ""}>Yukarı</button>
          <button class="order-btn" type="button" data-move="${safe.id}" data-direction="down" ${index === selected.length - 1 ? "disabled" : ""}>Aşağı</button>
          <button class="remove-btn" type="button" data-remove="${safe.id}">Kaldır</button>
        </span>
      </li>
    `;
  }).join("");
  renderComparison();
}

function renderComparison() {
  const selected = getSelectedPrograms();
  if (!compareBody || !compareCount) return;

  compareCount.textContent = `${selected.length} program seçildi`;

  if (!selected.length) {
    compareBody.innerHTML = `
      <tr>
        <td class="empty-cell" colspan="7">Karşılaştırma için tercih listene program ekle.</td>
      </tr>
    `;
    if (compareCards) {
      compareCards.innerHTML = renderStateCard("Karşılaştırma boş", "Tercih listene program eklediğinde mobil karşılaştırma kartları burada görünür.");
    }
    return;
  }

  const maxMatch = Math.max(...selected.map(program => calculateMatch(program)));
  const maxQuota = Math.max(...selected.map(program => program.quota));
  const minDuration = Math.min(...selected.map(getDurationValue));
  const minRank = Math.min(...selected.map(getRankValue));

  compareBody.innerHTML = selected.map(program => {
    const safe = getSafeProgram(program);
    const match = calculateMatch(program);
    return `
      <tr>
        <td><strong>${safe.name}</strong><small>${safe.university} · ${safe.faculty}</small></td>
        <td>${safe.scoreType}</td>
        <td>${safe.educationType}</td>
        <td class="${getDurationValue(program) === minDuration ? "best-cell" : ""}">${safe.language}<small>${safe.duration}</small></td>
        <td>${safe.scholarshipOptions.join(", ")}</td>
        <td class="${program.quota === maxQuota ? "best-cell" : ""}">${safe.quota}<small>Sıra: ${safe.rank}</small></td>
        <td>
          <span class="table-score ${match === maxMatch ? "best-score" : ""}">%${match}</span>
          ${getRankValue(program) === minRank ? "<small>en iyi sıralama</small>" : ""}
        </td>
      </tr>
    `;
  }).join("");

  if (compareCards) {
    compareCards.innerHTML = selected.map(program => {
      const safe = getSafeProgram(program);
      const match = calculateMatch(program);
      return `
        <article class="comparison-card">
          <div>
            <strong>${safe.name}</strong>
            <span>${safe.university} · ${safe.faculty}</span>
          </div>
          <dl>
            <div><dt>Puan</dt><dd>${safe.scoreType}</dd></div>
            <div><dt>Eğitim</dt><dd>${safe.educationType}</dd></div>
            <div><dt>Dil / Süre</dt><dd>${safe.language} · ${safe.duration}</dd></div>
            <div><dt>Burs</dt><dd>${safe.scholarshipOptions.join(", ")}</dd></div>
            <div><dt>Kontenjan</dt><dd>${safe.quota}</dd></div>
            <div><dt>Uyum</dt><dd>%${match}</dd></div>
          </dl>
        </article>
      `;
    }).join("");
  }
}

function saveSelectedPrograms() {
  try {
    localStorage.setItem("selectedPrograms", JSON.stringify(selectedPrograms));
  } catch (error) {
    if (copyStatus) {
      copyStatus.textContent = "Tarayıcı listeyi saklamaya izin vermedi.";
    }
  }
}

function hydrateLeadForm() {
  let savedLead = null;
  try {
    savedLead = JSON.parse(localStorage.getItem("leadForm") || "null");
  } catch (error) {
    savedLead = null;
  }
  if (!savedLead) return;

  leadForm.elements.fullName.value = savedLead.fullName || "";
  leadForm.elements.phone.value = savedLead.phone ? formatPhone(savedLead.phone) : "";
  leadForm.elements.email.value = savedLead.email || "";
  leadForm.elements.note.value = savedLead.note || "";
  leadForm.elements.kvkkConsent.checked = true;
}

function getProgramListText() {
  const selected = selectedPrograms
    .map(id => programs.find(program => program.id === id))
    .filter(Boolean);

  if (!selected.length) return "";

  return selected
    .map((program, index) => `${index + 1}. ${program.name} - ${program.university} (${program.scoreType}, ${program.educationType}, ${program.language}, ${program.duration}, kontenjan: ${program.quota})`)
    .join("\n");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 13;
}

function setLeadStatus(message, state = "neutral") {
  leadStatus.textContent = message;
  leadStatus.dataset.state = state;
}

function setFieldInvalid(fieldName, isInvalid) {
  const field = leadForm.elements[fieldName];
  if (!field) return;
  field.classList.toggle("is-invalid", isInvalid);
}

function clearLeadErrors() {
  ["fullName", "phone", "email", "note"].forEach(fieldName => setFieldInvalid(fieldName, false));
  leadForm.classList.remove("is-success");
}

function moveSelectedProgram(id, direction) {
  const currentIndex = selectedPrograms.indexOf(id);
  if (currentIndex < 0) return;

  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (nextIndex < 0 || nextIndex >= selectedPrograms.length) return;

  [selectedPrograms[currentIndex], selectedPrograms[nextIndex]] = [selectedPrograms[nextIndex], selectedPrograms[currentIndex]];
  saveSelectedPrograms();
  renderPrograms();
  renderChoiceList();
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function showProgramDetail(program) {
  const safe = getSafeProgram(program);
  const priorities = program.priorities
    .map(priority => filterValueLabels[priority] || priority)
    .map(escapeHTML)
    .join(", ");
  const careers = safe.careers.join(", ");
  const scholarships = safe.scholarshipOptions.join(", ");
  const match = calculateMatch(program);
  activeProgramHash = getProgramHash(program.id);

  modalContent.innerHTML = `
    <span class="category-lockup">
      <span class="category-mark">${escapeHTML(getCategoryCode(program.category))}</span>
      <span class="badge">${safe.category}</span>
    </span>
    <h2 id="modalTitle">${safe.name}</h2>
    <p>${safe.summary}</p>
    <dl class="detail-list">
      <div><dt>Üniversite</dt><dd>${safe.university}</dd></div>
      <div><dt>Fakülte</dt><dd>${safe.faculty}</dd></div>
      <div><dt>Şehir</dt><dd>${safe.city}</dd></div>
      <div><dt>Puan Türü</dt><dd>${safe.scoreType}</dd></div>
      <div><dt>Taban Puan</dt><dd>${safe.baseScore}<small>${safe.baseScoreYear}</small></dd></div>
      <div><dt>Başarı Sırası</dt><dd>${safe.rank}<small>${safe.rankYear}</small></dd></div>
      <div><dt>Eğitim</dt><dd>${safe.educationType}</dd></div>
      <div><dt>Eğitim Dili</dt><dd>${safe.language}</dd></div>
      <div><dt>Süre</dt><dd>${safe.duration}</dd></div>
      <div><dt>Burs Seçenekleri</dt><dd>${scholarships}</dd></div>
      <div><dt>Kontenjan</dt><dd>${safe.quota}<small>${safe.quotaYear}</small></dd></div>
      <div><dt>Kampüs</dt><dd>${safe.campus}</dd></div>
      <div><dt>Öne çıkan kriterler</dt><dd>${priorities}</dd></div>
      <div><dt>Kariyer alanları</dt><dd>${careers}</dd></div>
      <div><dt>Veri Kaynağı</dt><dd>${safe.sourceYear} · ${safe.sourceStatus}</dd></div>
    </dl>
    <div class="modal-score">
      <span>Mevcut filtrelere göre uyum</span>
      <strong>%${match}</strong>
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" type="button" data-add="${safe.id}">
        ${selectedPrograms.includes(program.id) ? "Listeden Kaldır" : "Tercih Listeme Ekle"}
      </button>
      <button class="btn btn-light" type="button" data-share="${safe.id}">
        Detay Linkini Kopyala
      </button>
    </div>
  `;
  if (!programModal.open) {
    programModal.showModal();
  }
}

function openProgramDetail(id, options = {}) {
  const program = programs.find(item => item.id === id);
  if (!program) return;
  lastFocusedElement = document.activeElement;
  showProgramDetail(program);
  if (options.updateHash !== false) {
    window.history.replaceState(null, "", `#${getProgramHash(program.id)}`);
  }
}

function syncProgramFromHash() {
  if (!window.location.hash.startsWith("#program-")) return;
  const id = decodeURIComponent(window.location.hash.replace("#program-", ""));
  if (!id) return;
  openProgramDetail(id, { updateHash: false });
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(form);
  currentFilters.scoreType = data.get("scoreType");
  currentFilters.interest = data.get("interest");
  currentFilters.educationType = data.get("educationType");
  currentFilters.priority = data.get("priority");
  currentFilters.language = data.get("language");
  currentFilters.duration = data.get("duration");
  currentFilters.scholarship = data.get("scholarship");
  updateFilterUrl();
  renderPrograms();
  document.querySelector("#programs").scrollIntoView({ behavior: "smooth" });
});

resetBtn.addEventListener("click", () => {
  form.reset();
  searchInput.value = "";
  currentFilters = {
    scoreType: "all",
    interest: "all",
    educationType: "all",
    priority: "all",
    language: "all",
    duration: "all",
    scholarship: "all",
    sort: "match",
    search: ""
  };
  sortSelect.value = "match";
  updateFilterUrl();
  renderPrograms();
});

searchInput.addEventListener("input", event => {
  currentFilters.search = event.target.value;
  updateFilterUrl();
  renderPrograms();
});

sortSelect.addEventListener("change", event => {
  currentFilters.sort = event.target.value;
  updateFilterUrl();
  renderPrograms();
});

if (shareFiltersBtn) {
  shareFiltersBtn.addEventListener("click", async () => {
    updateFilterUrl();
    try {
      await copyText(getFilterUrl().href);
      resultInfo.textContent = "Filtre linki kopyalandı.";
    } catch (error) {
      resultInfo.textContent = "Tarayıcı link kopyalamaya izin vermedi.";
    }
  });
}

programGrid.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  const detailButton = event.target.closest("[data-detail]");

  if (addButton) {
    const id = addButton.dataset.add;
    if (selectedPrograms.includes(id)) {
      selectedPrograms = selectedPrograms.filter(programId => programId !== id);
    } else {
      selectedPrograms.push(id);
    }
    saveSelectedPrograms();
    renderPrograms();
    renderChoiceList();
  }

  if (detailButton) {
    openProgramDetail(detailButton.dataset.detail);
  }
});

choiceList.addEventListener("click", event => {
  const moveButton = event.target.closest("[data-move]");
  const removeButton = event.target.closest("[data-remove]");

  if (moveButton) {
    moveSelectedProgram(moveButton.dataset.move, moveButton.dataset.direction);
    return;
  }

  if (!removeButton) return;
  selectedPrograms = selectedPrograms.filter(id => id !== removeButton.dataset.remove);
  saveSelectedPrograms();
  renderPrograms();
  renderChoiceList();
});

clearListBtn.addEventListener("click", () => {
  selectedPrograms = [];
  saveSelectedPrograms();
  renderPrograms();
  renderChoiceList();
});

printListBtn.addEventListener("click", () => {
  window.print();
});

copyListBtn.addEventListener("click", async () => {
  const listText = getProgramListText();
  if (!listText) {
    copyStatus.textContent = "Kopyalanacak program yok.";
    return;
  }

  try {
    await copyText(listText);
    copyStatus.textContent = "Liste kopyalandı.";
  } catch (error) {
    copyStatus.textContent = "Tarayıcı kopyalamaya izin vermedi.";
  }
});

leadForm.addEventListener("submit", async event => {
  event.preventDefault();
  clearLeadErrors();
  const data = new FormData(leadForm);
  const fullName = data.get("fullName").trim();
  const phone = data.get("phone").trim();
  const email = data.get("email").trim();
  const hasContact = fullName || phone || email;

  if (!hasContact) {
    setFieldInvalid("fullName", true);
    setFieldInvalid("phone", true);
    setFieldInvalid("email", true);
    setLeadStatus("En az bir iletişim bilgisi gir.", "error");
    return;
  }

  if (email && !isValidEmail(email)) {
    setFieldInvalid("email", true);
    setLeadStatus("E-posta formatını kontrol et.", "error");
    return;
  }

  if (phone && !isValidPhone(phone)) {
    setFieldInvalid("phone", true);
    setLeadStatus("Telefon formatını kontrol et.", "error");
    return;
  }

  if (!selectedPrograms.length) {
    setLeadStatus("Önce tercih listene program ekle.", "error");
    return;
  }

  if (!data.get("kvkkConsent")) {
    setLeadStatus("KVKK onayı gerekli.", "error");
    return;
  }

  setLeadLoading(true);
  setLeadStatus("Kayıt hazırlanıyor...", "neutral");

  const payload = {
    fullName,
    phone,
    email,
    note: data.get("note").trim(),
    selectedPrograms,
    kvkkConsent: true,
    createdAt: new Date().toISOString()
  };

  try {
    const response = await submitLeadToBackend(payload);
    localStorage.setItem("leadForm", JSON.stringify(payload));
    leadForm.classList.add("is-success");
    setLeadStatus(`Backend kaydı alındı: ${response.lead.id}`, "success");
  } catch (error) {
    try {
      localStorage.setItem("leadForm", JSON.stringify(payload));
      leadForm.classList.add("is-success");
      setLeadStatus("Backend kapalı görünüyor; kayıt tarayıcıda saklandı.", "success");
    } catch (storageError) {
      setLeadStatus("Kayıt sırasında bir sorun oluştu. Tekrar dene.", "error");
    }
  } finally {
    setLeadLoading(false);
  }
});

leadForm.addEventListener("input", event => {
  if (event.target.matches("input, textarea")) {
    event.target.classList.remove("is-invalid");
    leadStatus.textContent = "";
    leadStatus.dataset.state = "neutral";
  }
});

leadForm.elements.phone.addEventListener("input", event => {
  event.target.value = formatPhone(event.target.value);
});

modalClose.addEventListener("click", () => {
  programModal.close();
});

programModal.addEventListener("click", event => {
  if (event.target === programModal) {
    programModal.close();
  }
});

programModal.addEventListener("click", async event => {
  const addButton = event.target.closest("[data-add]");
  const shareButton = event.target.closest("[data-share]");

  if (addButton) {
    const id = addButton.dataset.add;
    if (selectedPrograms.includes(id)) {
      selectedPrograms = selectedPrograms.filter(programId => programId !== id);
    } else {
      selectedPrograms.push(id);
    }
    saveSelectedPrograms();
    renderPrograms();
    renderChoiceList();
    openProgramDetail(id, { updateHash: false });
  }

  if (shareButton) {
    const shareUrl = new URL(`#${getProgramHash(shareButton.dataset.share)}`, window.location.href).href;
    try {
      await copyText(shareUrl);
      shareButton.textContent = "Link Kopyalandı";
    } catch (error) {
      shareButton.textContent = "Link Kopyalanamadı";
    }
  }
});

programModal.addEventListener("close", () => {
  if (window.location.hash === `#${activeProgramHash}`) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }
  activeProgramHash = "";
  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
});

window.addEventListener("hashchange", syncProgramFromHash);

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });
}

if (navLinks) {
  navLinks.addEventListener("click", event => {
    if (event.target.closest("a")) {
      setMenuOpen(false);
    }
  });
}

if (kvkkOpen && kvkkModal) {
  kvkkOpen.addEventListener("click", () => {
    kvkkModal.showModal();
  });
}

if (kvkkClose && kvkkModal) {
  kvkkClose.addEventListener("click", () => {
    kvkkModal.close();
  });
}

if (kvkkModal) {
  kvkkModal.addEventListener("click", event => {
    if (event.target === kvkkModal) {
      kvkkModal.close();
    }
  });
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    setMenuOpen(false);
  }
});

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });
}

initTheme();
applyUniversityInfo();
loadSiteSettings();
hydrateFiltersFromUrl();
renderPrograms();
renderChoiceList();
hydrateLeadForm();
syncProgramFromHash();
loadProgramsFromApi();
