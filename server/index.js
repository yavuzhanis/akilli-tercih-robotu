const http = require("node:http");
const crypto = require("node:crypto");
const fsSync = require("node:fs");
const fs = require("node:fs/promises");
const net = require("node:net");
const path = require("node:path");
const tls = require("node:tls");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");

const ROOT_DIR = path.resolve(__dirname, "..");
loadEnvFile(path.join(ROOT_DIR, ".env"));
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
const ADMIN_NAME = process.env.ADMIN_NAME || "Sistem Admin";
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "local-admin-secret-change-me";
const ADMIN_TOKEN_TTL_MS = Number(process.env.ADMIN_TOKEN_TTL_MS || 8 * 60 * 60 * 1000);
const ALLOWED_ORIGINS = String(process.env.ALLOWED_ORIGINS || process.env.PUBLIC_ORIGIN || "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);
const AUDIT_LOG_RETENTION_DAYS = Number(process.env.AUDIT_LOG_RETENTION_DAYS || 180);
const RATE_LIMITS = {
  adminLogin: {
    windowMs: Number(process.env.ADMIN_LOGIN_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.ADMIN_LOGIN_RATE_LIMIT_MAX || 8)
  },
  publicLead: {
    windowMs: Number(process.env.PUBLIC_LEAD_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000),
    max: Number(process.env.PUBLIC_LEAD_RATE_LIMIT_MAX || 20)
  }
};
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || "",
  port: Number(process.env.SMTP_PORT || (process.env.SMTP_SECURE === "true" ? 465 : 587)),
  secure: process.env.SMTP_SECURE === "true",
  user: process.env.SMTP_USER || "",
  pass: process.env.SMTP_PASS || "",
  from: process.env.SMTP_FROM || process.env.SMTP_USER || ADMIN_EMAIL,
  fromName: process.env.SMTP_FROM_NAME || "Akıllı Tercih Sistemi",
  timeoutMs: Number(process.env.SMTP_TIMEOUT_MS || 15000),
  testMode: process.env.SMTP_TEST_MODE === "true",
  testRecipient: process.env.SMTP_TEST_RECIPIENT || "akilli-tercih-test@example.com"
};
const SMS_CONFIG = {
  provider: process.env.SMS_PROVIDER || "textbelt",
  apiKey: process.env.SMS_API_KEY || "textbelt_test",
  textbeltUrl: process.env.SMS_TEXTBELT_URL || "https://textbelt.com/text",
  timeoutMs: Number(process.env.SMS_TIMEOUT_MS || 15000),
  testMode: process.env.SMS_TEST_MODE === "true",
  testPhone: process.env.SMS_TEST_PHONE || "+15555555555"
};
const adminRoleValues = ["admin", "advisor", "editor"];
const auditActionValues = ["login", "create", "update", "delete", "import"];
const auditEntityValues = [
  "session",
  "lead",
  "lead_activity",
  "program",
  "program_import",
  "admin_user",
  "site_settings",
  "notification",
  "crm_integration",
  "crm_delivery",
  "message_template",
  "message_delivery"
];
const crmEventValues = ["lead.created", "lead.updated", "test.ping"];
const crmDeliveryStatusValues = ["success", "failed", "skipped"];
const messageChannelValues = ["email", "sms"];
const messageDeliveryStatusValues = ["sent", "failed", "skipped"];

const adminStatusValues = [
  "new",
  "contacted",
  "appointment",
  "applied",
  "enrolled",
  "lost",
  "qualified",
  "archived"
];

const adminStatusLabels = {
  new: "Yeni",
  contacted: "Görüşüldü",
  appointment: "Randevu",
  applied: "Başvurdu",
  enrolled: "Kayıt oldu",
  lost: "Vazgeçti",
  qualified: "Takipte",
  archived: "Arşiv"
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

function loadEnvFile(filePath) {
  if (!fsSync.existsSync(filePath)) return;

  const lines = fsSync.readFileSync(filePath, "utf8").split(/\r?\n/);

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;

    const separatorIndex = trimmed.indexOf("=");
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (!key || process.env[key] !== undefined) return;

    if (
      (value.startsWith("\"") && value.endsWith("\""))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  });
}

const leadSchema = z.object({
  fullName: z.string().trim().max(120).optional().default(""),
  phone: z.string().trim().max(32).optional().default(""),
  email: z.union([z.string().trim().email(), z.literal("")]).optional().default(""),
  note: z.string().trim().max(1000).optional().default(""),
  selectedPrograms: z.array(z.string().trim()).min(1),
  kvkkConsent: z.literal(true)
}).refine(data => data.fullName || data.phone || data.email, {
  path: ["contact"],
  message: "En az bir iletişim bilgisi gerekli."
});

const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

const adminUserCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  role: z.enum(adminRoleValues),
  password: z.string().min(6).max(120),
  isActive: z.boolean().optional().default(true)
});

const adminUserUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().optional(),
  role: z.enum(adminRoleValues).optional(),
  password: z.union([z.string().min(6).max(120), z.literal("")]).optional(),
  isActive: z.boolean().optional()
}).refine(data => Object.values(data).some(value => value !== undefined && value !== ""), {
  path: ["form"],
  message: "Güncellenecek alan bulunamadı."
});

const adminLeadUpdateSchema = z.object({
  status: z.enum(adminStatusValues).optional(),
  note: z.string().trim().max(1000).optional(),
  assignedUserId: z.string().trim().max(120).optional().or(z.literal("")),
  appointmentAt: z.string().trim().max(40).optional().or(z.literal("")),
  appointmentNote: z.string().trim().max(500).optional(),
  followUpAt: z.string().trim().max(40).optional().or(z.literal("")),
  followUpNote: z.string().trim().max(500).optional()
}).refine(data => (
  data.status !== undefined
  || data.note !== undefined
  || data.assignedUserId !== undefined
  || data.appointmentAt !== undefined
  || data.appointmentNote !== undefined
  || data.followUpAt !== undefined
  || data.followUpNote !== undefined
), {
  path: ["form"],
  message: "Güncellenecek alan bulunamadı."
});

const leadActivitySchema = z.object({
  type: z.enum(["note", "call", "meeting", "email", "appointment", "system"]).optional().default("note"),
  title: z.string().trim().min(2).max(140),
  body: z.string().trim().max(1200).optional().or(z.literal(""))
});

const programPayloadSchema = z.object({
  id: z.string().trim().min(2).max(80).optional().or(z.literal("")),
  university: z.string().trim().min(2).max(160).optional().default("Kapadokya Üniversitesi"),
  name: z.string().trim().min(2).max(160),
  faculty: z.string().trim().min(2).max(180),
  scoreType: z.string().trim().min(2).max(16),
  educationType: z.string().trim().min(2).max(32),
  campus: z.string().trim().min(2).max(140),
  city: z.string().trim().min(2).max(80).optional().default("Nevsehir"),
  duration: z.string().trim().min(2).max(24),
  language: z.string().trim().min(2).max(32),
  scholarshipOptions: z.array(z.string().trim().min(1)).min(1),
  quota: z.coerce.number().int().min(0),
  careers: z.array(z.string().trim().min(1)).min(1),
  baseScore: z.coerce.number().min(0),
  rank: z.string().trim().min(1).max(40),
  sourceYear: z.string().trim().min(2).max(40),
  sourceStatus: z.string().trim().min(2).max(80),
  category: z.string().trim().min(2).max(40),
  priorities: z.array(z.string().trim().min(1)).min(1),
  summary: z.string().trim().min(12).max(900),
  feeStatus: z.string().trim().max(120).optional().or(z.literal("")),
  baseScoreYear: z.string().trim().max(40).optional().or(z.literal("")),
  rankYear: z.string().trim().max(40).optional().or(z.literal("")),
  quotaYear: z.string().trim().max(40).optional().or(z.literal("")),
  isActive: z.boolean().optional()
});

const programImportSchema = z.object({
  csv: z.string().min(1).max(1_000_000),
  mode: z.enum(["upsert", "create"]).optional().default("upsert")
});

const listPageSchema = {
  q: z.string().trim().max(120).optional().default(""),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(5).max(100).optional().default(12)
};

const adminLeadListQuerySchema = z.object({
  ...listPageSchema,
  status: z.enum(["all", ...adminStatusValues]).optional().default("all")
});

const adminNotificationListQuerySchema = z.object({
  ...listPageSchema,
  status: z.enum(["all", "unread", "read"]).optional().default("unread"),
  type: z.enum(["all", "new_lead", "follow_up", "appointment", "system"]).optional().default("all")
});

const adminNotificationUpdateSchema = z.object({
  isRead: z.boolean()
});

const adminAuditLogListQuerySchema = z.object({
  ...listPageSchema,
  action: z.enum(["all", ...auditActionValues]).optional().default("all"),
  entityType: z.enum(["all", ...auditEntityValues]).optional().default("all")
});

const crmIntegrationUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  webhookUrl: z.union([z.string().trim().url(), z.literal("")]).optional(),
  secret: z.string().trim().max(200).optional().or(z.literal("")),
  isEnabled: z.boolean().optional(),
  events: z.array(z.enum(["lead.created", "lead.updated"])).min(1).optional()
}).refine(data => (
  data.name !== undefined
  || data.webhookUrl !== undefined
  || data.secret !== undefined
  || data.isEnabled !== undefined
  || data.events !== undefined
), {
  path: ["form"],
  message: "Güncellenecek alan bulunamadı."
}).refine(data => !(data.isEnabled === true && data.webhookUrl === ""), {
  path: ["webhookUrl"],
  message: "Entegrasyon aktifken webhook URL gerekli."
});

const crmDeliveryListQuerySchema = z.object({
  ...listPageSchema,
  status: z.enum(["all", ...crmDeliveryStatusValues]).optional().default("all"),
  event: z.enum(["all", ...crmEventValues]).optional().default("all")
});

const adminReportQuerySchema = z.object({
  startDate: z.string().trim().max(20).optional().default(""),
  endDate: z.string().trim().max(20).optional().default("")
});

const messageTemplateUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  subject: z.string().trim().max(180).optional().or(z.literal("")),
  body: z.string().trim().min(2).max(2000).optional(),
  isActive: z.boolean().optional()
}).refine(data => Object.values(data).some(value => value !== undefined), {
  path: ["form"],
  message: "Güncellenecek alan bulunamadı."
});

const adminMessageDeliveryListQuerySchema = z.object({
  ...listPageSchema,
  channel: z.enum(["all", ...messageChannelValues]).optional().default("all"),
  status: z.enum(["all", ...messageDeliveryStatusValues]).optional().default("all")
});

const leadMessageSchema = z.object({
  channel: z.enum(messageChannelValues),
  templateId: z.string().trim().max(120).optional().or(z.literal("")),
  subject: z.string().trim().max(180).optional().or(z.literal("")),
  body: z.string().trim().min(2).max(2000)
});

const siteSettingsDefaults = {
  brandMark: "AT",
  brandName: "Akıllı Tercih",
  brandSubtitle: "Premium Sistem",
  siteTitle: "Akıllı Tercih Sistemi",
  siteDescription: "Aday öğrenciler için premium bölüm keşif, karşılaştırma ve tercih listesi sistemi.",
  heroEyebrow: "Aday Öğrenciler İçin Premium Sistem",
  heroTitle: "Tercih kararını filtrele, karşılaştır ve danışman kaydına dönüştür.",
  heroDescription: "Kısa testi tamamla, uyum skorlarını incele, seçtiğin programları yan yana karşılaştır ve çıktıya hazır tercih listeni oluştur.",
  contactEmail: "danisma@example.com",
  contactPhone: "0 (555) 000 00 00",
  contactAddress: "Kampüs danışma ofisi",
  footerTitle: "Akıllı Tercih Rehberi",
  footerText: "Aday öğrenciler için bölüm keşif prototipi.",
  kvkkTitle: "KVKK Bilgilendirmesi",
  kvkkText: "Bu prototipte aday bilgileri tercih danışmanlığı sürecini yürütmek amacıyla alınır. Gerçek kullanımda açık rıza, aydınlatma metni, veri saklama süresi ve başvuru hakları kurum politikasına göre ayrıca yayımlanmalıdır."
};

const defaultMessageTemplates = [
  {
    id: "lead-welcome-email",
    channel: "email",
    name: "İlk Bilgilendirme E-postası",
    subject: "Tercih danışmanlığı bilgilendirme",
    body: "Merhaba {{adSoyad}},\n\nTercih listenle ilgili ön değerlendirme kaydını aldık. Seçtiğin programlar: {{programlar}}.\n\nDanışman ekibimiz kısa süre içinde seninle iletişime geçecek.\n\nAkıllı Tercih Ekibi"
  },
  {
    id: "lead-follow-up-sms",
    channel: "sms",
    name: "Takip SMS'i",
    subject: "",
    body: "Merhaba {{adSoyad}}, tercih listen için danışmanlık kaydın alındı. Seçtiğin programlar: {{programlar}}. Detaylar için seni arayacağız."
  }
];

const siteSettingsSchema = z.object({
  brandMark: z.string().trim().min(1).max(4),
  brandName: z.string().trim().min(2).max(80),
  brandSubtitle: z.string().trim().min(2).max(80),
  siteTitle: z.string().trim().min(2).max(120),
  siteDescription: z.string().trim().min(12).max(220),
  heroEyebrow: z.string().trim().min(2).max(120),
  heroTitle: z.string().trim().min(12).max(180),
  heroDescription: z.string().trim().min(12).max(320),
  contactEmail: z.union([z.string().trim().email(), z.literal("")]),
  contactPhone: z.string().trim().max(40),
  contactAddress: z.string().trim().max(180),
  footerTitle: z.string().trim().min(2).max(120),
  footerText: z.string().trim().min(2).max(220),
  kvkkTitle: z.string().trim().min(2).max(120),
  kvkkText: z.string().trim().min(40).max(4000)
});

const adminProgramListQuerySchema = z.object({
  ...listPageSchema,
  status: z.enum(["all", "active", "inactive"]).optional().default("all")
});

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

const requiredProgramImportColumns = [
  "name",
  "faculty",
  "scoreType",
  "educationType",
  "campus",
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
  "summary"
];

const programImportHeaderAliases = {
  id: "id",
  slug: "id",
  programslug: "id",
  university: "university",
  universite: "university",
  universityname: "university",
  universiteadi: "university",
  name: "name",
  program: "name",
  programadi: "name",
  bolumadi: "name",
  bolum: "name",
  faculty: "faculty",
  fakulte: "faculty",
  fakulteadi: "faculty",
  scoretype: "scoreType",
  puanturu: "scoreType",
  puan: "scoreType",
  educationtype: "educationType",
  egitimturu: "educationType",
  egitim: "educationType",
  campus: "campus",
  kampus: "campus",
  city: "city",
  sehir: "city",
  duration: "duration",
  sure: "duration",
  language: "language",
  dil: "language",
  scholarshipoptions: "scholarshipOptions",
  burssecenekleri: "scholarshipOptions",
  burs: "scholarshipOptions",
  quota: "quota",
  kontenjan: "quota",
  careers: "careers",
  kariyer: "careers",
  kariyeralanlari: "careers",
  basescore: "baseScore",
  tabanpuan: "baseScore",
  rank: "rank",
  basarisirasi: "rank",
  sourceyear: "sourceYear",
  veriyili: "sourceYear",
  sourcestatus: "sourceStatus",
  veridurumu: "sourceStatus",
  category: "category",
  kategori: "category",
  priorities: "priorities",
  oncelikler: "priorities",
  summary: "summary",
  ozet: "summary",
  aciklama: "summary",
  feestatus: "feeStatus",
  ucretdurumu: "feeStatus",
  basescoreyear: "baseScoreYear",
  tabanpuanyili: "baseScoreYear",
  rankyear: "rankYear",
  basarisirasiyili: "rankYear",
  quotayear: "quotaYear",
  kontenjanyili: "quotaYear",
  isactive: "isActive",
  yayindurumu: "isActive",
  aktif: "isActive"
};

function getSecurityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'"
    ].join("; "),
    ...(IS_PRODUCTION ? { "Strict-Transport-Security": "max-age=15552000; includeSubDomains" } : {})
  };
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (!IS_PRODUCTION) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

function getCorsHeaders(req) {
  const origin = req?.headers?.origin || "";

  if (!origin || !isAllowedOrigin(origin)) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}

function getResponseHeaders(req, headers = {}) {
  return {
    ...getSecurityHeaders(),
    ...getCorsHeaders(req),
    ...headers
  };
}

function sendJson(res, statusCode, payload, req = null) {
  const request = req || res.__request || null;
  res.writeHead(statusCode, {
    ...getResponseHeaders(request),
    "Content-Type": "application/json; charset=utf-8",
  });

  if (statusCode === 204) {
    res.end();
    return;
  }

  res.end(JSON.stringify(payload));
}

function getSafeErrorMessage(statusCode, message) {
  if (IS_PRODUCTION && statusCode >= 500) return "Sunucu hatası.";
  return message;
}

function sendError(res, statusCode, message, details = undefined, req = null) {
  const safeMessage = getSafeErrorMessage(statusCode, message);
  sendJson(res, statusCode, {
    ok: false,
    message: safeMessage,
    details: IS_PRODUCTION && statusCode >= 500 ? undefined : details
  }, req);
}

function parseJsonArray(value) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function parseJsonObject(value) {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function serializeProgram(program) {
  return {
    id: program.id,
    university: program.university || "Kapadokya Üniversitesi",
    name: program.name,
    faculty: program.faculty,
    scoreType: program.scoreType,
    educationType: program.educationType,
    campus: program.campus,
    city: program.city,
    duration: program.duration,
    language: program.language,
    scholarshipOptions: parseJsonArray(program.scholarshipOptions),
    quota: program.quota,
    careers: parseJsonArray(program.careers),
    baseScore: program.baseScore,
    rank: program.rank,
    sourceYear: program.sourceYear,
    sourceStatus: program.sourceStatus,
    category: program.category,
    priorities: parseJsonArray(program.priorities),
    summary: program.summary,
    feeStatus: program.feeStatus,
    baseScoreYear: program.baseScoreYear,
    rankYear: program.rankYear,
    quotaYear: program.quotaYear,
    isActive: program.isActive
  };
}

function serializeLead(lead) {
  const choices = [...lead.choices].sort((a, b) => a.order - b.order);

  return {
    id: lead.id,
    fullName: lead.fullName || "",
    phone: lead.phone || "",
    email: lead.email || "",
    note: lead.note || "",
    selectedPrograms: choices.map(choice => choice.programId),
    selectedProgramDetails: choices.map(choice => ({
      id: choice.program.id,
      name: choice.program.name,
      scoreType: choice.program.scoreType,
      educationType: choice.program.educationType,
      language: choice.program.language,
      duration: choice.program.duration
    })),
    source: lead.source,
    status: lead.status,
    assignedUserId: lead.assignedUserId || "",
    assignedUser: lead.assignedUser ? serializeAdminUser(lead.assignedUser) : null,
    appointmentAt: lead.appointmentAt ? lead.appointmentAt.toISOString() : "",
    appointmentNote: lead.appointmentNote || "",
    followUpAt: lead.followUpAt ? lead.followUpAt.toISOString() : "",
    followUpNote: lead.followUpNote || "",
    createdAt: lead.createdAt.toISOString()
  };
}

function serializeActivity(activity) {
  return {
    id: activity.id,
    leadId: activity.leadId,
    type: activity.type,
    title: activity.title,
    body: activity.body || "",
    createdAt: activity.createdAt.toISOString()
  };
}

function serializeNotification(notification) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body || "",
    leadId: notification.leadId || "",
    leadName: notification.lead?.fullName || "",
    dueAt: notification.dueAt ? notification.dueAt.toISOString() : "",
    isRead: notification.isRead,
    readAt: notification.readAt ? notification.readAt.toISOString() : "",
    createdAt: notification.createdAt.toISOString()
  };
}

function serializeAdminUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

function serializeAuditLog(log) {
  return {
    id: log.id,
    userId: log.userId || "",
    userName: log.userName || log.user?.name || "Sistem",
    userEmail: log.userEmail || log.user?.email || "",
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId || "",
    title: log.title,
    detail: log.detail || "",
    metadata: parseJsonObject(log.metadata),
    createdAt: log.createdAt.toISOString()
  };
}

function serializeCrmIntegration(integration) {
  return {
    id: integration.id,
    name: integration.name,
    webhookUrl: integration.webhookUrl || "",
    isEnabled: integration.isEnabled,
    events: parseJsonArray(integration.events),
    hasSecret: Boolean(integration.secret),
    createdAt: integration.createdAt ? integration.createdAt.toISOString() : "",
    updatedAt: integration.updatedAt ? integration.updatedAt.toISOString() : ""
  };
}

function serializeCrmDeliveryLog(delivery) {
  return {
    id: delivery.id,
    event: delivery.event,
    targetUrl: delivery.targetUrl || "",
    status: delivery.status,
    statusCode: delivery.statusCode || null,
    requestBody: parseJsonObject(delivery.requestBody),
    responseBody: delivery.responseBody || "",
    error: delivery.error || "",
    leadId: delivery.leadId || "",
    leadName: delivery.lead?.fullName || "",
    createdAt: delivery.createdAt.toISOString()
  };
}

function serializeMessageTemplate(template) {
  return {
    id: template.id,
    channel: template.channel,
    name: template.name,
    subject: template.subject || "",
    body: template.body,
    isActive: template.isActive,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString()
  };
}

function serializeMessageDeliveryLog(delivery) {
  return {
    id: delivery.id,
    templateId: delivery.templateId || "",
    templateName: delivery.template?.name || "",
    leadId: delivery.leadId || "",
    leadName: delivery.lead?.fullName || "",
    channel: delivery.channel,
    recipient: delivery.recipient,
    subject: delivery.subject || "",
    body: delivery.body,
    status: delivery.status,
    provider: delivery.provider,
    error: delivery.error || "",
    sentAt: delivery.sentAt ? delivery.sentAt.toISOString() : "",
    createdAt: delivery.createdAt.toISOString()
  };
}

function serializeLeadDetail(lead) {
  return {
    ...serializeLead(lead),
    activities: [...(lead.activities || [])]
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(serializeActivity)
  };
}

function zodIssuesToDetails(issues) {
  return issues.reduce((details, issue) => {
    const key = issue.path.join(".") || "form";
    details[key] = issue.message;
    return details;
  }, {});
}

function parseQueryParams(url, schema) {
  return schema.safeParse(Object.fromEntries(url.searchParams.entries()));
}

const rateLimitBuckets = new Map();

function getClientIp(req) {
  const forwardedFor = String(req.headers["x-forwarded-for"] || "")
    .split(",")[0]
    .trim();
  return forwardedFor || req.socket.remoteAddress || "unknown";
}

function pruneRateLimitBuckets(now = Date.now()) {
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (bucket.resetAt <= now) rateLimitBuckets.delete(key);
  }
}

function checkRateLimit(scope, key, options) {
  const now = Date.now();
  pruneRateLimitBuckets(now);
  const bucketKey = `${scope}:${key}`;
  const existing = rateLimitBuckets.get(bucketKey);

  if (!existing || existing.resetAt <= now) {
    rateLimitBuckets.set(bucketKey, {
      count: 1,
      resetAt: now + options.windowMs
    });
    return { ok: true, remaining: Math.max(options.max - 1, 0), resetAt: now + options.windowMs };
  }

  existing.count += 1;

  return {
    ok: existing.count <= options.max,
    remaining: Math.max(options.max - existing.count, 0),
    resetAt: existing.resetAt
  };
}

function enforceRateLimit(req, res, scope, key, options) {
  const result = checkRateLimit(scope, `${getClientIp(req)}:${key}`, options);
  if (result.ok) return true;

  const retryAfterSeconds = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
  res.writeHead(429, {
    ...getResponseHeaders(req),
    "Content-Type": "application/json; charset=utf-8",
    "Retry-After": String(retryAfterSeconds)
  });
  res.end(JSON.stringify({
    ok: false,
    message: "Çok fazla istek yapıldı. Lütfen biraz sonra tekrar dene."
  }));
  return false;
}

function getPagination(total, requestedPage, pageSize) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages
  };
}

function isEmptyWhere(where) {
  return !where || Object.keys(where).length === 0;
}

function mergeWhere(...wheres) {
  const activeWheres = wheres.filter(where => !isEmptyWhere(where));
  if (!activeWheres.length) return {};
  if (activeWheres.length === 1) return activeWheres[0];
  return { AND: activeWheres };
}

function getLeadScopeWhere(user) {
  if (!user || user.role === "admin") return {};

  if (user.role === "advisor") {
    return {
      OR: [
        { assignedUserId: user.id },
        { assignedUserId: null }
      ]
    };
  }

  return { id: "__no_lead_access__" };
}

function getNotificationScopeWhere(user) {
  if (!user || user.role === "admin") return {};

  if (user.role === "advisor") {
    return {
      OR: [
        { leadId: null },
        { lead: { is: getLeadScopeWhere(user) } }
      ]
    };
  }

  return { id: -1 };
}

function getMessageDeliveryScopeWhere(user) {
  if (!user || user.role === "admin") return {};

  if (user.role === "advisor") {
    return {
      lead: {
        is: getLeadScopeWhere(user)
      }
    };
  }

  return { id: -1 };
}

function normalizeImportHeader(value) {
  return slugify(value).replace(/-/g, "");
}

function slugify(value) {
  const replacements = {
    ç: "c",
    ğ: "g",
    ı: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    Ç: "c",
    Ğ: "g",
    İ: "i",
    Ö: "o",
    Ş: "s",
    Ü: "u"
  };

  return String(value)
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, character => replacements[character] || character)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `program-${Date.now()}`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  const source = String(text || "").replace(/^\uFEFF/, "");

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];

    if (inQuotes) {
      if (character === "\"" && nextCharacter === "\"") {
        field += "\"";
        index += 1;
      } else if (character === "\"") {
        inQuotes = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === "\"") {
      inQuotes = true;
      continue;
    }

    if (character === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (character === "\n") {
      row.push(field);
      if (row.some(cell => String(cell).trim())) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    if (character !== "\r") {
      field += character;
    }
  }

  if (inQuotes) {
    const error = new Error("CSV içinde kapatılmamış tırnak var.");
    error.statusCode = 422;
    throw error;
  }

  row.push(field);
  if (row.some(cell => String(cell).trim())) rows.push(row);
  return rows;
}

function parseCsvList(value) {
  return String(value || "")
    .split(/[|;,]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function parseCsvBoolean(value) {
  const normalized = normalizeImportHeader(value);
  if (!normalized) return undefined;
  if (["true", "1", "evet", "yayinda", "aktif", "active", "yes"].includes(normalized)) return true;
  if (["false", "0", "hayir", "pasif", "inactive", "no"].includes(normalized)) return false;
  return undefined;
}

function parseOptionalDate(value) {
  const normalizedValue = String(value || "").trim();
  if (!normalizedValue) return { ok: true, value: null };

  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, message: "Geçerli bir tarih/saat girilmeli." };
  }

  return { ok: true, value: date };
}

function addUtcDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function parseReportDate(value, fallbackDate) {
  const normalizedValue = String(value || "").trim();
  if (!normalizedValue) return { ok: true, value: fallbackDate };

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    return { ok: false, message: "Tarih YYYY-MM-DD formatında olmalı." };
  }

  const date = new Date(`${normalizedValue}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || toIsoDate(date) !== normalizedValue) {
    return { ok: false, message: "Geçerli bir tarih girilmeli." };
  }

  return { ok: true, value: date };
}

function getReportDateRange(query) {
  const now = new Date();
  const defaultEndDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const defaultStartDate = addUtcDays(defaultEndDate, -29);
  const startResult = parseReportDate(query.startDate, defaultStartDate);
  const endResult = parseReportDate(query.endDate, defaultEndDate);

  if (!startResult.ok) {
    return { ok: false, statusCode: 422, details: { startDate: startResult.message } };
  }

  if (!endResult.ok) {
    return { ok: false, statusCode: 422, details: { endDate: endResult.message } };
  }

  const startDate = startResult.value;
  const endDate = endResult.value;
  const days = Math.floor((endDate - startDate) / 86_400_000) + 1;

  if (days < 1) {
    return {
      ok: false,
      statusCode: 422,
      details: { endDate: "Bitiş tarihi başlangıçtan önce olamaz." }
    };
  }

  if (days > 366) {
    return {
      ok: false,
      statusCode: 422,
      details: { range: "Rapor aralığı en fazla 366 gün olabilir." }
    };
  }

  return {
    ok: true,
    startDate,
    endDate,
    endExclusive: addUtcDays(endDate, 1),
    days
  };
}

function getPercent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 1000) / 10;
}

function toProgramRecord(program, id) {
  return {
    id,
    university: program.university || "Kapadokya Üniversitesi",
    name: program.name,
    faculty: program.faculty,
    scoreType: program.scoreType,
    educationType: program.educationType,
    campus: program.campus,
    city: program.city || "Nevsehir",
    duration: program.duration,
    language: program.language,
    scholarshipOptions: JSON.stringify(program.scholarshipOptions),
    quota: program.quota,
    careers: JSON.stringify(program.careers),
    baseScore: program.baseScore,
    rank: program.rank,
    sourceYear: program.sourceYear,
    sourceStatus: program.sourceStatus,
    category: program.category,
    priorities: JSON.stringify(program.priorities),
    summary: program.summary,
    feeStatus: program.feeStatus || null,
    baseScoreYear: program.baseScoreYear || null,
    rankYear: program.rankYear || null,
    quotaYear: program.quotaYear || null,
    isActive: program.isActive
  };
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [scheme, salt, expectedHash] = String(storedHash || "").split(":");
  if (scheme !== "scrypt" || !salt || !expectedHash) return false;

  const actualHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return isSafeEqual(actualHash, expectedHash);
}

async function ensureDefaultAdminUser() {
  const userCount = await prisma.adminUser.count();
  if (userCount > 0) return;

  await prisma.adminUser.create({
    data: {
      id: createId("admin"),
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      role: "admin",
      passwordHash: hashPassword(ADMIN_PASSWORD),
      isActive: true
    }
  });
}

function signAdminToken(body) {
  return crypto
    .createHmac("sha256", ADMIN_SESSION_SECRET)
    .update(body)
    .digest("base64url");
}

function createAdminToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + ADMIN_TOKEN_TTL_MS
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${signAdminToken(body)}`;
}

function isSafeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length
    && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyAdminToken(token) {
  if (!token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  const expectedSignature = signAdminToken(body);

  if (!isSafeEqual(signature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return payload.userId && adminRoleValues.includes(payload.role) && Number(payload.exp) > Date.now()
      ? payload
      : null;
  } catch (_error) {
    return null;
  }
}

function validateProductionConfig() {
  if (!IS_PRODUCTION) return;

  const errors = [];

  if (!process.env.ADMIN_EMAIL || ADMIN_EMAIL === "admin@example.com") {
    errors.push("ADMIN_EMAIL canlı ortamda kurum e-postası olarak tanımlanmalı.");
  }

  if (!process.env.ADMIN_PASSWORD || ADMIN_PASSWORD === "admin123" || ADMIN_PASSWORD.length < 12) {
    errors.push("ADMIN_PASSWORD canlı ortamda en az 12 karakterli güçlü bir değer olmalı.");
  }

  if (
    !process.env.ADMIN_SESSION_SECRET
    || ADMIN_SESSION_SECRET === "local-admin-secret-change-me"
    || ADMIN_SESSION_SECRET.length < 32
  ) {
    errors.push("ADMIN_SESSION_SECRET canlı ortamda en az 32 karakterli rastgele bir değer olmalı.");
  }

  if (!ALLOWED_ORIGINS.length) {
    errors.push("ALLOWED_ORIGINS veya PUBLIC_ORIGIN canlı domain ile tanımlanmalı.");
  }

  if (SMTP_CONFIG.testMode) {
    errors.push("SMTP_TEST_MODE canlı ortamda kapalı olmalı.");
  }

  if (SMS_CONFIG.testMode || SMS_CONFIG.apiKey.endsWith("_test")) {
    errors.push("SMS_TEST_MODE kapalı olmalı ve canlı SMS anahtarı test key olmamalı.");
  }

  if (errors.length) {
    throw new Error(`Canlı ortam güvenlik kontrolü başarısız:\n- ${errors.join("\n- ")}`);
  }
}

function getBearerToken(req) {
  const authorization = req.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) return "";
  return authorization.slice("Bearer ".length).trim();
}

function requireAdmin(req, res, allowedRoles = adminRoleValues) {
  const session = verifyAdminToken(getBearerToken(req));

  if (!session) {
    sendError(res, 401, "Admin girişi gerekli.");
    return null;
  }

  if (!allowedRoles.includes(session.role)) {
    sendError(res, 403, "Bu işlem için yetkin yok.");
    return null;
  }

  return session;
}

async function requireActiveAdmin(req, res, allowedRoles = adminRoleValues) {
  const session = requireAdmin(req, res, allowedRoles);
  if (!session) return null;

  const user = await prisma.adminUser.findUnique({ where: { id: session.userId } });

  if (!user?.isActive) {
    sendError(res, 401, "Admin oturumu geçersiz.");
    return null;
  }

  return user;
}

function authorizeUserRole(user, res, allowedRoles) {
  if (allowedRoles.includes(user.role)) return true;
  sendError(res, 403, "Bu işlem için yetkin yok.");
  return false;
}

async function readRequestBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1_000_000) {
      const error = new Error("Request body too large");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  if (!chunks.length) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (error) {
    error.statusCode = 400;
    throw error;
  }
}

async function getProgramList(options = {}) {
  const programs = await prisma.program.findMany({
    where: options.includeInactive ? undefined : { isActive: true },
    orderBy: { name: "asc" }
  });

  return programs.map(serializeProgram);
}

async function getSiteSettings() {
  const rows = await prisma.siteSetting.findMany();
  const savedSettings = rows.reduce((settings, row) => {
    settings[row.key] = row.value;
    return settings;
  }, {});

  return {
    ...siteSettingsDefaults,
    ...savedSettings
  };
}

async function updateSiteSettings(payload) {
  const currentSettings = await getSiteSettings();
  const parsed = siteSettingsSchema.safeParse({
    ...currentSettings,
    ...payload
  });

  if (!parsed.success) {
    return {
      ok: false,
      statusCode: 422,
      details: zodIssuesToDetails(parsed.error.issues)
    };
  }

  const entries = Object.entries(parsed.data);

  await prisma.$transaction(
    entries.map(([key, value]) => prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value }
    }))
  );

  return { ok: true, settings: parsed.data };
}

function getProgramWhere(query) {
  const where = {};
  const q = query.q.trim();

  if (query.status === "active") where.isActive = true;
  if (query.status === "inactive") where.isActive = false;

  if (q) {
    where.OR = [
      { id: { contains: q } },
      { university: { contains: q } },
      { name: { contains: q } },
      { faculty: { contains: q } },
      { scoreType: { contains: q } },
      { educationType: { contains: q } },
      { campus: { contains: q } },
      { city: { contains: q } },
      { language: { contains: q } },
      { category: { contains: q } },
      { scholarshipOptions: { contains: q } },
      { careers: { contains: q } },
      { priorities: { contains: q } },
      { summary: { contains: q } }
    ];
  }

  return where;
}

async function getProgramPage(query) {
  const where = getProgramWhere(query);
  const total = await prisma.program.count({ where });
  const pagination = getPagination(total, query.page, query.pageSize);
  const [programs, activeTotal, inactiveTotal] = await Promise.all([
    prisma.program.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize
    }),
    prisma.program.count({ where: { ...where, isActive: true } }),
    prisma.program.count({ where: { ...where, isActive: false } })
  ]);

  return {
    programs: programs.map(serializeProgram),
    pagination,
    summary: {
      total,
      activeTotal,
      inactiveTotal
    }
  };
}

async function getLeadList(user) {
  const leads = await prisma.lead.findMany({
    where: getLeadScopeWhere(user),
    include: {
      assignedUser: true,
      choices: {
        include: { program: true },
        orderBy: { order: "asc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return leads.map(serializeLead);
}

function getLeadWhere(query, user) {
  const where = {};
  const q = query.q.trim();

  if (query.status !== "all") where.status = query.status;

  if (q) {
    where.OR = [
      { fullName: { contains: q } },
      { phone: { contains: q } },
      { email: { contains: q } },
      { note: { contains: q } },
      { appointmentNote: { contains: q } },
      { status: { contains: q } },
      {
        assignedUser: {
          is: {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } }
            ]
          }
        }
      },
      {
        choices: {
          some: {
            program: {
              OR: [
                { name: { contains: q } },
                { faculty: { contains: q } },
                { scoreType: { contains: q } }
              ]
            }
          }
        }
      }
    ];
  }

  return mergeWhere(where, getLeadScopeWhere(user));
}

async function getLeadPage(query, user) {
  const where = getLeadWhere(query, user);
  const total = await prisma.lead.count({ where });
  const pagination = getPagination(total, query.page, query.pageSize);
  const leads = await prisma.lead.findMany({
    where,
    include: {
      assignedUser: true,
      choices: {
        include: { program: true },
        orderBy: { order: "asc" }
      }
    },
    orderBy: { createdAt: "desc" },
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize
  });

  return {
    leads: leads.map(serializeLead),
    pagination
  };
}

function getNotificationWhere(query) {
  const where = {};

  if (query.status === "unread") where.isRead = false;
  if (query.status === "read") where.isRead = true;
  if (query.type !== "all") where.type = query.type;

  return where;
}

async function getNotificationPage(query, user) {
  const scopeWhere = getNotificationScopeWhere(user);
  const where = mergeWhere(getNotificationWhere(query), scopeWhere);
  const total = await prisma.adminNotification.count({ where });
  const pagination = getPagination(total, query.page, query.pageSize);
  const [notifications, unreadTotal, dueTotal] = await Promise.all([
    prisma.adminNotification.findMany({
      where,
      include: { lead: true },
      orderBy: [
        { isRead: "asc" },
        { dueAt: "asc" },
        { createdAt: "desc" }
      ],
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize
    }),
    prisma.adminNotification.count({ where: mergeWhere(scopeWhere, { isRead: false }) }),
    prisma.adminNotification.count({
      where: mergeWhere(scopeWhere, {
        isRead: false,
        dueAt: { lte: new Date() }
      })
    })
  ]);

  return {
    notifications: notifications.map(serializeNotification),
    pagination,
    summary: {
      unreadTotal,
      dueTotal
    }
  };
}

function getAuditLogWhere(query) {
  const where = {};
  const q = query.q.trim();

  if (query.action !== "all") where.action = query.action;
  if (query.entityType !== "all") where.entityType = query.entityType;

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { detail: { contains: q } },
      { entityId: { contains: q } },
      { userName: { contains: q } },
      { userEmail: { contains: q } },
      { metadata: { contains: q } }
    ];
  }

  return where;
}

async function getAuditLogPage(query) {
  const where = getAuditLogWhere(query);
  const total = await prisma.adminAuditLog.count({ where });
  const pagination = getPagination(total, query.page, query.pageSize);
  const logs = await prisma.adminAuditLog.findMany({
    where,
    include: { user: true },
    orderBy: { createdAt: "desc" },
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize
  });

  return {
    logs: logs.map(serializeAuditLog),
    pagination
  };
}

async function getCrmIntegration() {
  const existing = await prisma.crmIntegration.findUnique({ where: { id: "default" } });
  if (existing) return existing;

  return prisma.crmIntegration.create({
    data: {
      id: "default",
      name: "CRM Webhook",
      webhookUrl: null,
      secret: null,
      isEnabled: false,
      events: JSON.stringify(["lead.created", "lead.updated"])
    }
  });
}

async function updateCrmIntegration(payload) {
  const current = await getCrmIntegration();
  const currentEvents = parseJsonArray(current.events).filter(event => ["lead.created", "lead.updated"].includes(event));
  const nextPayload = {
    name: payload.name ?? current.name,
    webhookUrl: payload.webhookUrl ?? current.webhookUrl ?? "",
    secret: payload.secret ? payload.secret : current.secret || "",
    isEnabled: payload.isEnabled ?? current.isEnabled,
    events: payload.events ?? (currentEvents.length ? currentEvents : ["lead.created", "lead.updated"])
  };
  const parsed = crmIntegrationUpdateSchema.safeParse(nextPayload);

  if (!parsed.success) {
    return {
      ok: false,
      statusCode: 422,
      details: zodIssuesToDetails(parsed.error.issues)
    };
  }

  const integration = await prisma.crmIntegration.update({
    where: { id: "default" },
    data: {
      name: parsed.data.name,
      webhookUrl: parsed.data.webhookUrl || null,
      secret: parsed.data.secret || null,
      isEnabled: parsed.data.isEnabled,
      events: JSON.stringify(parsed.data.events)
    }
  });

  return { ok: true, integration: serializeCrmIntegration(integration) };
}

function getCrmDeliveryWhere(query) {
  const where = {};
  const q = query.q.trim();

  if (query.status !== "all") where.status = query.status;
  if (query.event !== "all") where.event = query.event;

  if (q) {
    where.OR = [
      { event: { contains: q } },
      { status: { contains: q } },
      { targetUrl: { contains: q } },
      { error: { contains: q } },
      { leadId: { contains: q } },
      {
        lead: {
          is: {
            OR: [
              { fullName: { contains: q } },
              { phone: { contains: q } },
              { email: { contains: q } }
            ]
          }
        }
      }
    ];
  }

  return where;
}

async function getCrmDeliveryPage(query) {
  const where = getCrmDeliveryWhere(query);
  const total = await prisma.crmDeliveryLog.count({ where });
  const pagination = getPagination(total, query.page, query.pageSize);
  const deliveries = await prisma.crmDeliveryLog.findMany({
    where,
    include: { lead: true },
    orderBy: { createdAt: "desc" },
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize
  });

  return {
    deliveries: deliveries.map(serializeCrmDeliveryLog),
    pagination
  };
}

async function ensureDefaultMessageTemplates() {
  for (const template of defaultMessageTemplates) {
    const existing = await prisma.messageTemplate.findUnique({ where: { id: template.id } });
    if (existing) continue;

    await prisma.messageTemplate.create({
      data: template
    });
  }
}

async function getMessageTemplates() {
  await ensureDefaultMessageTemplates();
  const templates = await prisma.messageTemplate.findMany({
    orderBy: [
      { channel: "asc" },
      { name: "asc" }
    ]
  });

  return templates.map(serializeMessageTemplate);
}

async function updateMessageTemplate(id, payload) {
  const parsed = messageTemplateUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      statusCode: 422,
      details: zodIssuesToDetails(parsed.error.issues)
    };
  }

  try {
    const template = await prisma.messageTemplate.update({
      where: { id },
      data: {
        name: parsed.data.name,
        subject: parsed.data.subject === "" ? null : parsed.data.subject,
        body: parsed.data.body,
        isActive: parsed.data.isActive
      }
    });

    return { ok: true, template: serializeMessageTemplate(template) };
  } catch (error) {
    if (error.code === "P2025") {
      return {
        ok: false,
        statusCode: 404,
        details: { template: "Mesaj şablonu bulunamadı." }
      };
    }
    throw error;
  }
}

function getMessageDeliveryWhere(query, user) {
  const where = {};
  const q = query.q.trim();

  if (query.channel !== "all") where.channel = query.channel;
  if (query.status !== "all") where.status = query.status;

  if (q) {
    where.OR = [
      { recipient: { contains: q } },
      { subject: { contains: q } },
      { body: { contains: q } },
      { status: { contains: q } },
      { provider: { contains: q } },
      { error: { contains: q } },
      {
        lead: {
          is: {
            OR: [
              { fullName: { contains: q } },
              { phone: { contains: q } },
              { email: { contains: q } }
            ]
          }
        }
      },
      {
        template: {
          is: {
            name: { contains: q }
          }
        }
      }
    ];
  }

  return mergeWhere(where, getMessageDeliveryScopeWhere(user));
}

async function getMessageDeliveryPage(query, user) {
  const where = getMessageDeliveryWhere(query, user);
  const scopeWhere = getMessageDeliveryScopeWhere(user);
  const total = await prisma.messageDeliveryLog.count({ where });
  const pagination = getPagination(total, query.page, query.pageSize);
  const [deliveries, sentTotal, failedTotal] = await Promise.all([
    prisma.messageDeliveryLog.findMany({
      where,
      include: {
        lead: true,
        template: true
      },
      orderBy: { createdAt: "desc" },
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize
    }),
    prisma.messageDeliveryLog.count({ where: mergeWhere(scopeWhere, { status: "sent" }) }),
    prisma.messageDeliveryLog.count({ where: mergeWhere(scopeWhere, { status: "failed" }) })
  ]);

  return {
    deliveries: deliveries.map(serializeMessageDeliveryLog),
    pagination,
    summary: {
      sentTotal,
      failedTotal
    }
  };
}

function truncateText(value, maxLength = 2000) {
  const text = String(value || "");
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function getWebhookHeaders(secret, body) {
  const headers = {
    "Content-Type": "application/json",
    "User-Agent": "akilli-tercih-webhook/1.0"
  };

  if (secret) {
    headers["X-Akilli-Tercih-Signature"] = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
  }

  return headers;
}

async function sendCrmWebhook(event, lead, options = {}) {
  const integration = await getCrmIntegration();
  const events = parseJsonArray(integration.events);
  const deliveryLeadId = event.startsWith("lead.") ? lead?.id || null : null;
  const body = JSON.stringify({
    event,
    occurredAt: new Date().toISOString(),
    source: "akilli-tercih",
    lead
  });
  const shouldSend = Boolean(
    integration.webhookUrl
    && (options.force || (integration.isEnabled && events.includes(event)))
  );

  if (!shouldSend) {
    return prisma.crmDeliveryLog.create({
      data: {
        event,
        targetUrl: integration.webhookUrl || null,
        status: "skipped",
        requestBody: body,
        leadId: deliveryLeadId,
        error: integration.webhookUrl ? "Entegrasyon pasif veya olay seçili değil." : "Webhook URL tanımlı değil."
      }
    });
  }

  try {
    const response = await fetch(integration.webhookUrl, {
      method: "POST",
      headers: getWebhookHeaders(integration.secret, body),
      body,
      signal: AbortSignal.timeout(8000)
    });
    const responseText = await response.text().catch(() => "");

    return prisma.crmDeliveryLog.create({
      data: {
        event,
        targetUrl: integration.webhookUrl,
        status: response.ok ? "success" : "failed",
        statusCode: response.status,
        requestBody: body,
        responseBody: truncateText(responseText),
        leadId: deliveryLeadId,
        error: response.ok ? null : `Webhook ${response.status} döndü.`
      }
    });
  } catch (error) {
    return prisma.crmDeliveryLog.create({
      data: {
        event,
        targetUrl: integration.webhookUrl,
        status: "failed",
        requestBody: body,
        leadId: deliveryLeadId,
        error: error.message
      }
    });
  }
}

async function getLeadDetail(id, user) {
  const lead = await prisma.lead.findFirst({
    where: mergeWhere({ id }, getLeadScopeWhere(user)),
    include: {
      assignedUser: true,
      choices: {
        include: { program: true },
        orderBy: { order: "asc" }
      },
      activities: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  return lead ? serializeLeadDetail(lead) : null;
}

function renderMessageText(text, lead) {
  const programNames = lead.choices
    .sort((a, b) => a.order - b.order)
    .map(choice => choice.program?.name || choice.programId)
    .join(", ");
  const values = {
    adSoyad: lead.fullName || "Aday",
    telefon: lead.phone || "",
    email: lead.email || "",
    programlar: programNames || "Program seçimi yok",
    danisman: lead.assignedUser?.name || "Danışman ekibi",
    durum: adminStatusLabels[lead.status] || lead.status,
    randevu: lead.appointmentAt ? lead.appointmentAt.toISOString() : "",
    takip: lead.followUpAt ? lead.followUpAt.toISOString() : ""
  };

  return String(text || "").replace(/\{\{([a-zA-ZğüşöçıİĞÜŞÖÇ]+)\}\}/g, (_match, key) => (
    values[key] ?? ""
  ));
}

function encodeMimeHeader(value) {
  const text = String(value || "");
  return /^[\x00-\x7F]*$/.test(text)
    ? text
    : `=?UTF-8?B?${Buffer.from(text, "utf8").toString("base64")}?=`;
}

function formatEmailAddress(email, name = "") {
  const safeEmail = String(email || "").trim();
  const safeName = String(name || "").replace(/["\r\n]/g, "").trim();
  return safeName ? `"${encodeMimeHeader(safeName)}" <${safeEmail}>` : safeEmail;
}

function dotStuffBody(value) {
  return String(value || "")
    .replace(/\r?\n/g, "\r\n")
    .replace(/^\./gm, "..");
}

function createEmailMessage({ to, subject, body }) {
  const from = formatEmailAddress(SMTP_CONFIG.from, SMTP_CONFIG.fromName);
  const encodedSubject = encodeMimeHeader(subject || "Tercih danışmanlığı bilgilendirme");
  const messageId = `<${crypto.randomUUID()}@akilli-tercih.local>`;

  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    `Message-ID: ${messageId}`,
    `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    dotStuffBody(body)
  ].join("\r\n");
}

function openSmtpSocket() {
  return new Promise((resolve, reject) => {
    const socket = SMTP_CONFIG.secure
      ? tls.connect({
        host: SMTP_CONFIG.host,
        port: SMTP_CONFIG.port,
        servername: SMTP_CONFIG.host
      })
      : net.createConnection({
        host: SMTP_CONFIG.host,
        port: SMTP_CONFIG.port
      });

    const onConnect = () => {
      cleanup();
      socket.setEncoding("utf8");
      socket.setTimeout(SMTP_CONFIG.timeoutMs);
      resolve(socket);
    };
    const onError = error => {
      cleanup();
      reject(error);
    };
    const onTimeout = () => {
      cleanup();
      socket.destroy();
      reject(new Error("SMTP bağlantısı zaman aşımına uğradı."));
    };
    const cleanup = () => {
      socket.off("secureConnect", onConnect);
      socket.off("connect", onConnect);
      socket.off("error", onError);
      socket.off("timeout", onTimeout);
    };

    socket.once(SMTP_CONFIG.secure ? "secureConnect" : "connect", onConnect);
    socket.once("error", onError);
    socket.once("timeout", onTimeout);
  });
}

function readSmtpResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("SMTP yanıtı zaman aşımına uğradı."));
    }, SMTP_CONFIG.timeoutMs);
    const cleanup = () => {
      clearTimeout(timer);
      socket.off("data", onData);
      socket.off("error", onError);
    };
    const onError = error => {
      cleanup();
      reject(error);
    };
    const onData = chunk => {
      buffer += chunk;
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const lastLine = lines[lines.length - 1] || "";

      if (/^\d{3}\s/.test(lastLine)) {
        cleanup();
        const code = Number(lastLine.slice(0, 3));
        resolve({ code, text: lines.join("\n") });
      }
    };

    socket.on("data", onData);
    socket.once("error", onError);
  });
}

async function sendSmtpCommand(socket, command, expectedCodes) {
  const responsePromise = readSmtpResponse(socket);
  if (command) socket.write(`${command}\r\n`);
  const response = await responsePromise;

  if (!expectedCodes.includes(response.code)) {
    throw new Error(`SMTP komutu başarısız: ${response.text}`);
  }

  return response;
}

function upgradeSmtpSocket(socket) {
  return new Promise((resolve, reject) => {
    const secureSocket = tls.connect({
      socket,
      servername: SMTP_CONFIG.host
    }, () => {
      secureSocket.setEncoding("utf8");
      secureSocket.setTimeout(SMTP_CONFIG.timeoutMs);
      resolve(secureSocket);
    });

    secureSocket.once("error", reject);
  });
}

async function sendEmailViaSmtp({ to, subject, body }) {
  if (SMTP_CONFIG.testMode) {
    return {
      status: "sent",
      provider: "smtp-test",
      error: ""
    };
  }

  if (!SMTP_CONFIG.host) {
    return {
      status: "skipped",
      provider: "smtp",
      error: "SMTP_HOST tanımlı değil. Mail göndermek için .env içine SMTP ayarlarını ekleyin."
    };
  }

  let socket;

  try {
    socket = await openSmtpSocket();
    await sendSmtpCommand(socket, null, [220]);
    let ehlo = await sendSmtpCommand(socket, "EHLO akilli-tercih.local", [250]);

    if (!SMTP_CONFIG.secure && process.env.SMTP_STARTTLS !== "false" && /STARTTLS/i.test(ehlo.text)) {
      await sendSmtpCommand(socket, "STARTTLS", [220]);
      socket = await upgradeSmtpSocket(socket);
      ehlo = await sendSmtpCommand(socket, "EHLO akilli-tercih.local", [250]);
    }

    if (SMTP_CONFIG.user && SMTP_CONFIG.pass) {
      const authPayload = Buffer.from(`\u0000${SMTP_CONFIG.user}\u0000${SMTP_CONFIG.pass}`, "utf8").toString("base64");
      await sendSmtpCommand(socket, `AUTH PLAIN ${authPayload}`, [235]);
    }

    await sendSmtpCommand(socket, `MAIL FROM:<${SMTP_CONFIG.from}>`, [250]);
    await sendSmtpCommand(socket, `RCPT TO:<${to}>`, [250, 251]);
    await sendSmtpCommand(socket, "DATA", [354]);

    const dataResponse = readSmtpResponse(socket);
    socket.write(`${createEmailMessage({ to, subject, body })}\r\n.\r\n`);
    const response = await dataResponse;
    if (response.code !== 250) {
      throw new Error(`SMTP DATA başarısız: ${response.text}`);
    }

    await sendSmtpCommand(socket, "QUIT", [221]).catch(() => null);

    return { status: "sent", provider: "smtp", error: "" };
  } catch (error) {
    return {
      status: "failed",
      provider: "smtp",
      error: error.message || "SMTP gönderimi başarısız."
    };
  } finally {
    if (socket && !socket.destroyed) socket.end();
  }
}

function normalizeSmsPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("90")) return `+${digits}`;
  if (digits.startsWith("0")) return `+90${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith("5")) return `+90${digits}`;
  return `+${digits}`;
}

async function sendSmsViaTextbelt({ to, body }) {
  const phone = normalizeSmsPhone(SMS_CONFIG.testMode ? SMS_CONFIG.testPhone : to);

  if (!phone) {
    return {
      status: "failed",
      provider: "textbelt",
      error: "SMS için geçerli telefon numarası bulunamadı."
    };
  }

  if (SMS_CONFIG.testMode) {
    return {
      status: "sent",
      provider: "textbelt-test",
      error: ""
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SMS_CONFIG.timeoutMs);

  try {
    const response = await fetch(SMS_CONFIG.textbeltUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        phone,
        message: body,
        key: SMS_CONFIG.apiKey
      }),
      signal: controller.signal
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || payload.success === false) {
      return {
        status: "failed",
        provider: "textbelt",
        error: payload.error || `Textbelt HTTP ${response.status}`
      };
    }

    return {
      status: "sent",
      provider: "textbelt",
      error: ""
    };
  } catch (error) {
    return {
      status: "failed",
      provider: "textbelt",
      error: error.name === "AbortError" ? "Textbelt isteği zaman aşımına uğradı." : error.message
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function dispatchOutboundMessage({ channel, recipient, subject, body }) {
  if (channel === "email") {
    return sendEmailViaSmtp({ to: recipient, subject, body });
  }

  if (channel === "sms" && SMS_CONFIG.provider === "textbelt") {
    return sendSmsViaTextbelt({ to: recipient, body });
  }

  return {
    status: "skipped",
    provider: SMS_CONFIG.provider || "sms",
    error: "SMS sağlayıcısı desteklenmiyor."
  };
}

async function sendLeadMessage(id, payload, user) {
  const parsed = leadMessageSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      statusCode: 422,
      details: zodIssuesToDetails(parsed.error.issues)
    };
  }

  const lead = await prisma.lead.findFirst({
    where: mergeWhere({ id }, getLeadScopeWhere(user)),
    include: {
      assignedUser: true,
      choices: {
        include: { program: true },
        orderBy: { order: "asc" }
      }
    }
  });

  if (!lead) {
    return {
      ok: false,
      statusCode: 404,
      details: { lead: "Aday kaydı bulunamadı." }
    };
  }

  const recipient = parsed.data.channel === "email" ? lead.email : lead.phone;

  if (!recipient) {
    return {
      ok: false,
      statusCode: 422,
      details: {
        recipient: parsed.data.channel === "email"
          ? "Adayın e-posta bilgisi yok."
          : "Adayın telefon bilgisi yok."
      }
    };
  }

  let template = null;

  if (parsed.data.templateId) {
    template = await prisma.messageTemplate.findUnique({
      where: { id: parsed.data.templateId }
    });

    if (!template || !template.isActive || template.channel !== parsed.data.channel) {
      return {
        ok: false,
        statusCode: 422,
        details: { templateId: "Aktif ve kanal ile uyumlu bir şablon seçilmeli." }
      };
    }
  }

  const subjectSource = parsed.data.channel === "email"
    ? parsed.data.subject || template?.subject || "Tercih danışmanlığı bilgilendirme"
    : "";
  const subject = parsed.data.channel === "email" ? renderMessageText(subjectSource, lead) : null;
  const body = renderMessageText(parsed.data.body || template?.body || "", lead).trim();

  if (!body) {
    return {
      ok: false,
      statusCode: 422,
      details: { body: "Mesaj metni boş olamaz." }
    };
  }

  const dispatch = await dispatchOutboundMessage({
    channel: parsed.data.channel,
    recipient,
    subject,
    body
  });
  const wasSent = dispatch.status === "sent";
  const sentAt = wasSent ? new Date() : null;
  const title = parsed.data.channel === "email"
    ? (wasSent ? "E-posta gönderildi." : "E-posta gönderilemedi.")
    : (wasSent ? "SMS gönderildi." : "SMS gönderilemedi.");

  const [delivery, activity] = await prisma.$transaction([
    prisma.messageDeliveryLog.create({
      data: {
        templateId: template?.id || null,
        leadId: lead.id,
        channel: parsed.data.channel,
        recipient,
        subject,
        body,
        status: dispatch.status,
        provider: dispatch.provider,
        error: dispatch.error || null,
        sentAt
      },
      include: {
        lead: true,
        template: true
      }
    }),
    prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: parsed.data.channel === "email" ? "email" : "note",
        title,
        body: wasSent
          ? `${recipient} alıcısına ${dispatch.provider} üzerinden gönderildi.`
          : `${recipient} alıcısına gönderilemedi: ${dispatch.error}`
      }
    })
  ]);

  if (!wasSent) {
    return {
      ok: false,
      statusCode: 424,
      details: {
        delivery: dispatch.status,
        provider: dispatch.provider,
        message: dispatch.error
      },
      delivery: serializeMessageDeliveryLog(delivery),
      activity: serializeActivity(activity)
    };
  }

  return {
    ok: true,
    delivery: serializeMessageDeliveryLog(delivery),
    activity: serializeActivity(activity)
  };
}

async function getAdminStats(user) {
  const leads = await getLeadList(user);
  const now = new Date();
  const leadScopeWhere = getLeadScopeWhere(user);
  const [activeProgramCount, inactiveProgramCount, unreadNotificationCount, dueNotificationCount, upcomingAppointmentCount, unassignedLeadCount] = await Promise.all([
    prisma.program.count({ where: { isActive: true } }),
    prisma.program.count({ where: { isActive: false } }),
    prisma.adminNotification.count({ where: mergeWhere(getNotificationScopeWhere(user), { isRead: false }) }),
    prisma.adminNotification.count({
      where: mergeWhere(getNotificationScopeWhere(user), {
        isRead: false,
        dueAt: { lte: new Date() }
      })
    }),
    prisma.lead.count({
      where: mergeWhere(leadScopeWhere, {
        appointmentAt: { gte: now },
        status: { notIn: ["lost", "archived"] }
      })
    }),
    prisma.lead.count({
      where: mergeWhere(leadScopeWhere, {
        assignedUserId: null,
        status: { notIn: ["lost", "archived"] }
      })
    })
  ]);
  const statusCounts = adminStatusValues.reduce((counts, status) => {
    counts[status] = leads.filter(lead => lead.status === status).length;
    return counts;
  }, {});
  const programMap = new Map();

  leads.forEach(lead => {
    lead.selectedProgramDetails.forEach(program => {
      const current = programMap.get(program.id) || {
        id: program.id,
        name: program.name,
        count: 0
      };
      current.count += 1;
      programMap.set(program.id, current);
    });
  });

  return {
    totalLeads: leads.length,
    activeProgramCount,
    inactiveProgramCount,
    unreadNotificationCount,
    dueNotificationCount,
    upcomingAppointmentCount,
    unassignedLeadCount,
    statusCounts,
    lastLeadAt: leads[0]?.createdAt || null,
    programInterest: [...programMap.values()]
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "tr"))
      .slice(0, 8)
  };
}

async function getLeadReport(query, user) {
  const range = getReportDateRange(query);

  if (!range.ok) return range;

  const {
    startDate,
    endDate,
    endExclusive,
    days
  } = range;
  const previousStartDate = addUtcDays(startDate, -days);
  const leadScopeWhere = getLeadScopeWhere(user);
  const dateWhere = mergeWhere(leadScopeWhere, {
    createdAt: {
      gte: startDate,
      lt: endExclusive
    }
  });

  const [leads, previousLeadCount, appointmentInRangeCount] = await Promise.all([
    prisma.lead.findMany({
      where: dateWhere,
      include: {
        assignedUser: true,
        choices: {
          include: { program: true },
          orderBy: { order: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.lead.count({
      where: mergeWhere(leadScopeWhere, {
        createdAt: {
          gte: previousStartDate,
          lt: startDate
        }
      })
    }),
    prisma.lead.count({
      where: mergeWhere(leadScopeWhere, {
        appointmentAt: {
          gte: startDate,
          lt: endExclusive
        },
        status: { notIn: ["lost", "archived"] }
      })
    })
  ]);

  const totalLeads = leads.length;
  const statusCounts = adminStatusValues.reduce((counts, status) => {
    counts[status] = 0;
    return counts;
  }, {});
  const dailyCounts = new Map();
  const programMap = new Map();
  const sourceMap = new Map();
  const advisorMap = new Map();
  let choiceTotal = 0;

  for (let dayIndex = 0; dayIndex < days; dayIndex += 1) {
    dailyCounts.set(toIsoDate(addUtcDays(startDate, dayIndex)), 0);
  }

  leads.forEach(lead => {
    const dateKey = toIsoDate(lead.createdAt);
    const sourceKey = lead.source || "unknown";
    const advisorKey = lead.assignedUserId || "unassigned";
    const advisorName = lead.assignedUser?.name || "Atanmamış";
    const hasAppointment = lead.status === "appointment"
      || (lead.appointmentAt && lead.appointmentAt >= startDate && lead.appointmentAt < endExclusive);

    statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    dailyCounts.set(dateKey, (dailyCounts.get(dateKey) || 0) + 1);

    const source = sourceMap.get(sourceKey) || {
      source: sourceKey,
      count: 0
    };
    source.count += 1;
    sourceMap.set(sourceKey, source);

    const advisor = advisorMap.get(advisorKey) || {
      id: lead.assignedUserId || "",
      name: advisorName,
      leadCount: 0,
      appointmentCount: 0,
      appliedCount: 0,
      enrolledCount: 0
    };
    advisor.leadCount += 1;
    if (hasAppointment) advisor.appointmentCount += 1;
    if (lead.status === "applied") advisor.appliedCount += 1;
    if (lead.status === "enrolled") advisor.enrolledCount += 1;
    advisorMap.set(advisorKey, advisor);

    lead.choices.forEach(choice => {
      const current = programMap.get(choice.programId) || {
        id: choice.programId,
        name: choice.program?.name || choice.programId,
        faculty: choice.program?.faculty || "",
        scoreType: choice.program?.scoreType || "",
        count: 0
      };
      current.count += 1;
      choiceTotal += 1;
      programMap.set(choice.programId, current);
    });
  });

  const appointmentLeadCount = leads.filter(lead => (
    lead.status === "appointment"
    || (lead.appointmentAt && lead.appointmentAt >= startDate && lead.appointmentAt < endExclusive)
  )).length;
  const enrolledCount = statusCounts.enrolled || 0;
  const appliedCount = statusCounts.applied || 0;
  const lostCount = statusCounts.lost || 0;
  const activeLeadCount = totalLeads - lostCount - (statusCounts.archived || 0);

  return {
    ok: true,
    report: {
      range: {
        startDate: toIsoDate(startDate),
        endDate: toIsoDate(endDate),
        days
      },
      summary: {
        totalLeads,
        previousLeadCount,
        trendDelta: totalLeads - previousLeadCount,
        trendPercent: previousLeadCount
          ? getPercent(totalLeads - previousLeadCount, previousLeadCount)
          : totalLeads > 0 ? 100 : 0,
        newLeadCount: statusCounts.new || 0,
        activeLeadCount,
        appointmentLeadCount,
        appointmentInRangeCount,
        appliedCount,
        enrolledCount,
        lostCount,
        conversionRate: getPercent(enrolledCount, totalLeads),
        applicationRate: getPercent(appliedCount + enrolledCount, totalLeads),
        appointmentRate: getPercent(appointmentLeadCount, totalLeads),
        choiceTotal,
        sourceCount: sourceMap.size
      },
      statusBreakdown: adminStatusValues.map(status => ({
        status,
        count: statusCounts[status] || 0,
        percent: getPercent(statusCounts[status] || 0, totalLeads)
      })),
      dailyLeads: [...dailyCounts.entries()].map(([date, count]) => ({
        date,
        count
      })),
      programInterest: [...programMap.values()]
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "tr"))
        .slice(0, 10)
        .map(program => ({
          ...program,
          percent: getPercent(program.count, choiceTotal)
        })),
      sourceBreakdown: [...sourceMap.values()]
        .sort((a, b) => b.count - a.count || a.source.localeCompare(b.source, "tr"))
        .map(source => ({
          ...source,
          percent: getPercent(source.count, totalLeads)
        })),
      advisorPerformance: [...advisorMap.values()]
        .sort((a, b) => b.leadCount - a.leadCount || a.name.localeCompare(b.name, "tr"))
        .map(advisor => ({
          ...advisor,
          conversionRate: getPercent(advisor.enrolledCount, advisor.leadCount),
          appointmentRate: getPercent(advisor.appointmentCount, advisor.leadCount)
        }))
    }
  };
}

async function createLead(payload) {
  const parsed = leadSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      statusCode: 422,
      details: zodIssuesToDetails(parsed.error.issues)
    };
  }

  const selectedPrograms = [...new Set(parsed.data.selectedPrograms)];
  const programs = await prisma.program.findMany({
    where: {
      id: { in: selectedPrograms },
      isActive: true
    }
  });

  if (programs.length !== selectedPrograms.length) {
    return {
      ok: false,
      statusCode: 422,
      details: { selectedPrograms: "Bilinmeyen program seçimi var." }
    };
  }

  const lead = await prisma.lead.create({
    data: {
      id: `lead_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      fullName: parsed.data.fullName || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      note: parsed.data.note || null,
      source: "website",
      status: "new",
      activities: {
        create: {
          type: "system",
          title: "Aday kaydı oluşturuldu.",
          body: "Bilgi formu üzerinden yeni aday kaydı alındı."
        }
      },
      notifications: {
        create: {
          type: "new_lead",
          title: "Yeni aday kaydı",
          body: `${parsed.data.fullName || "İsimsiz aday"} bilgi formu üzerinden kayıt bıraktı.`,
          dueAt: new Date()
        }
      },
      choices: {
        create: selectedPrograms.map((programId, index) => ({
          programId,
          order: index
        }))
      }
    },
    include: {
      choices: {
        include: { program: true },
        orderBy: { order: "asc" }
      }
    }
  });

  const serializedLead = serializeLead(lead);
  await sendCrmWebhook("lead.created", serializedLead);

  return { ok: true, lead: serializedLead };
}

async function getUniqueProgramId(name, requestedId = "") {
  const baseId = slugify(requestedId || name);
  let nextId = baseId;
  let counter = 2;

  while (await prisma.program.findUnique({ where: { id: nextId } })) {
    nextId = `${baseId}-${counter}`;
    counter += 1;
  }

  return nextId;
}

async function createProgram(payload) {
  const parsed = programPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      statusCode: 422,
      details: zodIssuesToDetails(parsed.error.issues)
    };
  }

  const id = await getUniqueProgramId(parsed.data.name, parsed.data.id);
  const program = await prisma.program.create({
    data: toProgramRecord({
      ...parsed.data,
      isActive: parsed.data.isActive ?? true
    }, id)
  });

  return { ok: true, program: serializeProgram(program) };
}

function getProgramImportPayloads(csv) {
  const rows = parseCsv(csv);

  if (rows.length < 2) {
    return {
      ok: false,
      statusCode: 422,
      details: {
        rows: [{ row: 1, message: "CSV başlık satırı ve en az bir program satırı içermeli." }]
      }
    };
  }

  if (rows.length > 301) {
    return {
      ok: false,
      statusCode: 422,
      details: {
        rows: [{ row: 1, message: "Tek importta en fazla 300 program yüklenebilir." }]
      }
    };
  }

  const headers = rows[0].map(header => {
    const normalizedHeader = normalizeImportHeader(header);
    return programImportHeaderAliases[normalizedHeader] || normalizedHeader;
  });
  const unknownHeaders = headers.filter(header => !programImportColumns.includes(header));
  const uniqueHeaders = new Set(headers);
  const missingHeaders = requiredProgramImportColumns.filter(column => !uniqueHeaders.has(column));

  if (unknownHeaders.length || missingHeaders.length) {
    return {
      ok: false,
      statusCode: 422,
      details: {
        rows: [{
          row: 1,
          message: [
            unknownHeaders.length ? `Bilinmeyen başlıklar: ${unknownHeaders.join(", ")}` : "",
            missingHeaders.length ? `Eksik zorunlu başlıklar: ${missingHeaders.join(", ")}` : ""
          ].filter(Boolean).join(" · ")
        }]
      }
    };
  }

  const errors = [];
  const importRows = [];
  const requestedIds = new Set();

  rows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;
    const rawPayload = headers.reduce((payload, header, cellIndex) => {
      if (!programImportColumns.includes(header)) return payload;
      payload[header] = String(row[cellIndex] || "").trim();
      return payload;
    }, {});
    const payload = {
      ...rawPayload,
      scholarshipOptions: parseCsvList(rawPayload.scholarshipOptions),
      quota: rawPayload.quota,
      careers: parseCsvList(rawPayload.careers),
      baseScore: rawPayload.baseScore,
      priorities: parseCsvList(rawPayload.priorities),
      isActive: parseCsvBoolean(rawPayload.isActive)
    };

    if (!payload.city) delete payload.city;
    if (!payload.university) delete payload.university;
    if (!payload.feeStatus) delete payload.feeStatus;
    if (!payload.baseScoreYear) delete payload.baseScoreYear;
    if (!payload.rankYear) delete payload.rankYear;
    if (!payload.quotaYear) delete payload.quotaYear;
    if (payload.isActive === undefined) delete payload.isActive;

    const parsed = programPayloadSchema.safeParse(payload);

    if (!parsed.success) {
      errors.push({
        row: rowNumber,
        message: Object.entries(zodIssuesToDetails(parsed.error.issues))
          .map(([key, value]) => `${key}: ${value}`)
          .join(" · ")
      });
      return;
    }

    const requestedId = slugify(parsed.data.id || parsed.data.name);

    if (requestedIds.has(requestedId)) {
      errors.push({
        row: rowNumber,
        message: `Aynı CSV içinde tekrar eden slug var: ${requestedId}`
      });
      return;
    }

    requestedIds.add(requestedId);
    importRows.push({
      row: rowNumber,
      id: requestedId,
      data: {
        ...parsed.data,
        id: requestedId,
        isActive: parsed.data.isActive ?? true
      }
    });
  });

  if (errors.length) {
    return {
      ok: false,
      statusCode: 422,
      details: { rows: errors }
    };
  }

  return { ok: true, rows: importRows };
}

async function importProgramsFromCsv(payload) {
  const parsed = programImportSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      statusCode: 422,
      details: zodIssuesToDetails(parsed.error.issues)
    };
  }

  let importPayloads;

  try {
    importPayloads = getProgramImportPayloads(parsed.data.csv);
  } catch (error) {
    return {
      ok: false,
      statusCode: error.statusCode || 422,
      details: { rows: [{ row: 1, message: error.message }] }
    };
  }

  if (!importPayloads.ok) return importPayloads;

  const ids = importPayloads.rows.map(row => row.id);
  const existingPrograms = await prisma.program.findMany({
    where: { id: { in: ids } },
    select: { id: true }
  });
  const existingIds = new Set(existingPrograms.map(program => program.id));

  if (parsed.data.mode === "create") {
    const duplicates = importPayloads.rows
      .filter(row => existingIds.has(row.id))
      .map(row => ({ row: row.row, message: `Bu slug zaten var: ${row.id}` }));

    if (duplicates.length) {
      return {
        ok: false,
        statusCode: 409,
        details: { rows: duplicates }
      };
    }
  }

  const savedPrograms = [];
  let created = 0;
  let updated = 0;

  await prisma.$transaction(async tx => {
    for (const row of importPayloads.rows) {
      const record = toProgramRecord(row.data, row.id);
      const { id: _id, ...updateData } = record;
      const alreadyExists = existingIds.has(row.id);
      const program = parsed.data.mode === "upsert"
        ? await tx.program.upsert({
          where: { id: row.id },
          create: record,
          update: updateData
        })
        : await tx.program.create({ data: record });

      savedPrograms.push(serializeProgram(program));
      if (alreadyExists) {
        updated += 1;
      } else {
        created += 1;
      }
    }
  });

  return {
    ok: true,
    programs: savedPrograms,
    summary: {
      total: savedPrograms.length,
      created,
      updated,
      mode: parsed.data.mode
    }
  };
}

async function updateProgram(id, payload) {
  const parsed = programPayloadSchema.omit({ id: true }).partial().safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      statusCode: 422,
      details: zodIssuesToDetails(parsed.error.issues)
    };
  }

  const data = {};

  Object.entries(parsed.data).forEach(([key, value]) => {
    if (value === undefined) return;
    if (["scholarshipOptions", "careers", "priorities"].includes(key)) {
      data[key] = JSON.stringify(value);
      return;
    }
    data[key] = value === "" ? null : value;
  });

  try {
    const program = await prisma.program.update({
      where: { id },
      data
    });

    return { ok: true, program: serializeProgram(program) };
  } catch (error) {
    if (error.code === "P2025") {
      return {
        ok: false,
        statusCode: 404,
        details: { program: "Program bulunamadı." }
      };
    }
    throw error;
  }
}

async function deactivateProgram(id) {
  return updateProgram(id, { isActive: false });
}

async function updateLead(id, payload, user) {
  const parsed = adminLeadUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      statusCode: 422,
      details: zodIssuesToDetails(parsed.error.issues)
    };
  }

  let parsedAssignedUserId = undefined;
  let parsedAppointmentAt = undefined;
  let parsedFollowUpAt = undefined;

  if (parsed.data.assignedUserId !== undefined) {
    parsedAssignedUserId = parsed.data.assignedUserId || null;

    if (user?.role === "advisor" && parsedAssignedUserId && parsedAssignedUserId !== user.id) {
      return {
        ok: false,
        statusCode: 403,
        details: { assignedUserId: "Danışman sadece kendi üzerine atama yapabilir." }
      };
    }

    if (parsedAssignedUserId) {
      const assignedUser = await prisma.adminUser.findUnique({
        where: { id: parsedAssignedUserId }
      });

      if (!assignedUser?.isActive || !["admin", "advisor"].includes(assignedUser.role)) {
        return {
          ok: false,
          statusCode: 422,
          details: { assignedUserId: "Aktif bir admin veya danışman seçilmeli." }
        };
      }
    }
  }

  if (parsed.data.appointmentAt !== undefined) {
    const dateResult = parseOptionalDate(parsed.data.appointmentAt);

    if (!dateResult.ok) {
      return {
        ok: false,
        statusCode: 422,
        details: { appointmentAt: dateResult.message }
      };
    }

    parsedAppointmentAt = dateResult.value;
  }

  if (parsed.data.followUpAt !== undefined) {
    const dateResult = parseOptionalDate(parsed.data.followUpAt);

    if (!dateResult.ok) {
      return {
        ok: false,
        statusCode: 422,
        details: { followUpAt: dateResult.message }
      };
    }

    parsedFollowUpAt = dateResult.value;
  }

  try {
    const existingLead = await prisma.lead.findFirst({
      where: mergeWhere({ id }, getLeadScopeWhere(user)),
      include: { assignedUser: true }
    });

    if (!existingLead) {
      return {
        ok: false,
        statusCode: 404,
        details: { lead: "Aday kaydı bulunamadı." }
      };
    }

    const activityCreates = [];
    const notificationCreates = [];

    if (parsed.data.status && parsed.data.status !== existingLead.status) {
      activityCreates.push({
        type: "system",
        title: `Durum güncellendi: ${parsed.data.status}`,
        body: `${existingLead.status} durumundan ${parsed.data.status} durumuna taşındı.`
      });
    }

    if (parsed.data.note !== undefined && parsed.data.note !== existingLead.note) {
      activityCreates.push({
        type: "note",
        title: "Danışman notu güncellendi.",
        body: parsed.data.note || "Not alanı temizlendi."
      });
    }

    if (parsed.data.assignedUserId !== undefined && parsedAssignedUserId !== existingLead.assignedUserId) {
      const nextUser = parsedAssignedUserId
        ? await prisma.adminUser.findUnique({ where: { id: parsedAssignedUserId } })
        : null;

      activityCreates.push({
        type: "system",
        title: nextUser ? "Danışman atandı." : "Danışman ataması kaldırıldı.",
        body: nextUser
          ? `${nextUser.name} aday sorumlusu olarak atandı.`
          : "Aday sorumlusu temizlendi."
      });
    }

    if (parsed.data.appointmentAt !== undefined) {
      const currentTime = existingLead.appointmentAt?.getTime() || null;
      const nextTime = parsedAppointmentAt?.getTime() || null;

      if (currentTime !== nextTime) {
        activityCreates.push({
          type: "appointment",
          title: parsedAppointmentAt ? "Randevu zamanı güncellendi." : "Randevu zamanı kaldırıldı.",
          body: parsedAppointmentAt
            ? `Randevu zamanı: ${parsedAppointmentAt.toISOString()}`
            : "Randevu zamanı temizlendi."
        });

        if (parsedAppointmentAt) {
          notificationCreates.push({
            type: "appointment",
            title: "Randevu hatırlatması",
            body: parsed.data.appointmentNote || existingLead.appointmentNote || "Aday için randevu zamanı geldi.",
            dueAt: parsedAppointmentAt
          });
        }
      }
    }

    if (parsed.data.appointmentNote !== undefined && parsed.data.appointmentNote !== existingLead.appointmentNote) {
      activityCreates.push({
        type: "appointment",
        title: "Randevu notu güncellendi.",
        body: parsed.data.appointmentNote || "Randevu notu temizlendi."
      });
    }

    if (parsed.data.followUpAt !== undefined) {
      const currentTime = existingLead.followUpAt?.getTime() || null;
      const nextTime = parsedFollowUpAt?.getTime() || null;

      if (currentTime !== nextTime) {
        activityCreates.push({
          type: "appointment",
          title: parsedFollowUpAt ? "Takip zamanı güncellendi." : "Takip zamanı kaldırıldı.",
          body: parsedFollowUpAt
            ? `Takip zamanı: ${parsedFollowUpAt.toISOString()}`
            : "Takip zamanı temizlendi."
        });

        if (parsedFollowUpAt) {
          notificationCreates.push({
            type: "follow_up",
            title: "Takip hatırlatması",
            body: parsed.data.followUpNote || existingLead.followUpNote || "Aday için takip zamanı geldi.",
            dueAt: parsedFollowUpAt
          });
        }
      }
    }

    if (parsed.data.followUpNote !== undefined && parsed.data.followUpNote !== existingLead.followUpNote) {
      activityCreates.push({
        type: "note",
        title: "Takip notu güncellendi.",
        body: parsed.data.followUpNote || "Takip notu temizlendi."
      });
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        status: parsed.data.status,
        note: parsed.data.note,
        assignedUserId: parsedAssignedUserId,
        appointmentAt: parsedAppointmentAt,
        appointmentNote: parsed.data.appointmentNote,
        followUpAt: parsedFollowUpAt,
        followUpNote: parsed.data.followUpNote,
        activities: activityCreates.length
          ? { create: activityCreates }
          : undefined,
        notifications: notificationCreates.length
          ? { create: notificationCreates }
          : undefined
      },
      include: {
        assignedUser: true,
        choices: {
          include: { program: true },
          orderBy: { order: "asc" }
        }
      }
    });

    const serializedLead = serializeLead(lead);
    await sendCrmWebhook("lead.updated", serializedLead);

    return { ok: true, lead: serializedLead };
  } catch (error) {
    if (error.code === "P2025") {
      return {
        ok: false,
        statusCode: 404,
        details: { lead: "Aday kaydı bulunamadı." }
      };
    }
    throw error;
  }
}

async function createLeadActivity(id, payload, user) {
  const parsed = leadActivitySchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      statusCode: 422,
      details: zodIssuesToDetails(parsed.error.issues)
    };
  }

  try {
    const lead = await prisma.lead.findFirst({
      where: mergeWhere({ id }, getLeadScopeWhere(user)),
      select: { id: true }
    });

    if (!lead) {
      return {
        ok: false,
        statusCode: 404,
        details: { lead: "Aday kaydı bulunamadı." }
      };
    }

    const activity = await prisma.leadActivity.create({
      data: {
        leadId: id,
        type: parsed.data.type,
        title: parsed.data.title,
        body: parsed.data.body || null
      }
    });

    return { ok: true, activity: serializeActivity(activity) };
  } catch (error) {
    if (error.code === "P2003") {
      return {
        ok: false,
        statusCode: 404,
        details: { lead: "Aday kaydı bulunamadı." }
      };
    }
    throw error;
  }
}

async function deleteLead(id) {
  try {
    await prisma.lead.delete({ where: { id } });
    return { ok: true };
  } catch (error) {
    if (error.code === "P2025") {
      return {
        ok: false,
        statusCode: 404,
        details: { lead: "Aday kaydı bulunamadı." }
      };
    }
    throw error;
  }
}

async function updateNotification(id, payload, user) {
  const parsed = adminNotificationUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      statusCode: 422,
      details: zodIssuesToDetails(parsed.error.issues)
    };
  }

  try {
    const existingNotification = await prisma.adminNotification.findFirst({
      where: mergeWhere({ id }, getNotificationScopeWhere(user)),
      select: { id: true }
    });

    if (!existingNotification) {
      return {
        ok: false,
        statusCode: 404,
        details: { notification: "Bildirim bulunamadı." }
      };
    }

    const notification = await prisma.adminNotification.update({
      where: { id },
      data: {
        isRead: parsed.data.isRead,
        readAt: parsed.data.isRead ? new Date() : null
      },
      include: { lead: true }
    });

    return { ok: true, notification: serializeNotification(notification) };
  } catch (error) {
    if (error.code === "P2025") {
      return {
        ok: false,
        statusCode: 404,
        details: { notification: "Bildirim bulunamadı." }
      };
    }
    throw error;
  }
}

async function markAllNotificationsRead(user) {
  await prisma.adminNotification.updateMany({
    where: mergeWhere(getNotificationScopeWhere(user), { isRead: false }),
    data: {
      isRead: true,
      readAt: new Date()
    }
  });
}

async function getAdminUsers() {
  const users = await prisma.adminUser.findMany({
    orderBy: [
      { isActive: "desc" },
      { name: "asc" }
    ]
  });

  return users.map(serializeAdminUser);
}

async function getAssignableUsers(user) {
  if (user?.role === "advisor") {
    return [serializeAdminUser(user)];
  }

  const users = await prisma.adminUser.findMany({
    where: {
      isActive: true,
      role: { in: ["admin", "advisor"] }
    },
    orderBy: [
      { role: "asc" },
      { name: "asc" }
    ]
  });

  return users.map(serializeAdminUser);
}

function getPayloadFields(payload, hiddenFields = []) {
  const hidden = new Set(hiddenFields);
  return Object.keys(payload || {})
    .filter(key => !hidden.has(key))
    .sort();
}

async function recordAuditLog(user, entry) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        userId: user?.id || null,
        userName: user?.name || "Sistem",
        userEmail: user?.email || "",
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId || null,
        title: entry.title,
        detail: entry.detail || null,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null
      }
    });
  } catch (error) {
    console.error("Audit log yazılamadı:", error.message);
  }
}

async function cleanupOldAuditLogs() {
  if (!Number.isFinite(AUDIT_LOG_RETENTION_DAYS) || AUDIT_LOG_RETENTION_DAYS <= 0) return;
  const cutoff = new Date(Date.now() - AUDIT_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const result = await prisma.adminAuditLog.deleteMany({
    where: {
      createdAt: { lt: cutoff }
    }
  });

  if (result.count > 0) {
    console.log(`${result.count} eski audit log kaydı temizlendi.`);
  }
}

async function createAdminUser(payload) {
  const parsed = adminUserCreateSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      statusCode: 422,
      details: zodIssuesToDetails(parsed.error.issues)
    };
  }

  try {
    const user = await prisma.adminUser.create({
      data: {
        id: createId("admin"),
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        role: parsed.data.role,
        passwordHash: hashPassword(parsed.data.password),
        isActive: parsed.data.isActive
      }
    });

    return { ok: true, user: serializeAdminUser(user) };
  } catch (error) {
    if (error.code === "P2002") {
      return {
        ok: false,
        statusCode: 409,
        details: { email: "Bu e-posta ile kullanıcı zaten var." }
      };
    }
    throw error;
  }
}

async function updateAdminUser(id, payload) {
  const parsed = adminUserUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      statusCode: 422,
      details: zodIssuesToDetails(parsed.error.issues)
    };
  }

  const data = {};

  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.email !== undefined) data.email = parsed.data.email.toLowerCase();
  if (parsed.data.role !== undefined) data.role = parsed.data.role;
  if (parsed.data.isActive !== undefined) data.isActive = parsed.data.isActive;
  if (parsed.data.password) data.passwordHash = hashPassword(parsed.data.password);

  try {
    const user = await prisma.adminUser.update({
      where: { id },
      data
    });

    return { ok: true, user: serializeAdminUser(user) };
  } catch (error) {
    if (error.code === "P2025") {
      return {
        ok: false,
        statusCode: 404,
        details: { user: "Admin kullanıcısı bulunamadı." }
      };
    }
    if (error.code === "P2002") {
      return {
        ok: false,
        statusCode: 409,
        details: { email: "Bu e-posta ile kullanıcı zaten var." }
      };
    }
    throw error;
  }
}

async function handleAdminApi(req, res, url) {
  if (req.method === "POST" && url.pathname === "/api/admin/login") {
    await ensureDefaultAdminUser();
    const payload = await readRequestBody(req);
    const parsed = adminLoginSchema.safeParse(payload);
    const rateKey = parsed.success ? parsed.data.email.toLowerCase() : "invalid-login-payload";

    if (!enforceRateLimit(req, res, "admin-login", rateKey, RATE_LIMITS.adminLogin)) return;

    if (!parsed.success) {
      return sendError(res, 401, "Admin şifresi geçersiz.");
    }

    const user = await prisma.adminUser.findUnique({
      where: { email: parsed.data.email.toLowerCase() }
    });

    if (!user?.isActive || !verifyPassword(parsed.data.password, user.passwordHash)) {
      return sendError(res, 401, "Admin bilgileri geçersiz.");
    }

    await recordAuditLog(user, {
      action: "login",
      entityType: "session",
      entityId: user.id,
      title: "Admin girişi yapıldı.",
      detail: `${user.name} panele giriş yaptı.`,
      metadata: { role: user.role }
    });

    const expiresAt = new Date(Date.now() + ADMIN_TOKEN_TTL_MS).toISOString();
    return sendJson(res, 200, {
      ok: true,
      token: createAdminToken(user),
      expiresAt,
      user: serializeAdminUser(user)
    });
  }

  const currentAdmin = await requireActiveAdmin(req, res);
  if (!currentAdmin) return;

  if (req.method === "GET" && url.pathname === "/api/admin/session") {
    return sendJson(res, 200, {
      ok: true,
      user: serializeAdminUser(currentAdmin)
    });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/advisors") {
    if (!authorizeUserRole(currentAdmin, res, ["admin", "advisor"])) return;
    const users = await getAssignableUsers(currentAdmin);
    return sendJson(res, 200, { ok: true, users });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/settings") {
    if (!authorizeUserRole(currentAdmin, res, ["admin"])) return;
    const settings = await getSiteSettings();
    return sendJson(res, 200, { ok: true, settings });
  }

  if (req.method === "PATCH" && url.pathname === "/api/admin/settings") {
    if (!authorizeUserRole(currentAdmin, res, ["admin"])) return;
    const payload = await readRequestBody(req);
    const result = await updateSiteSettings(payload);

    if (!result.ok) {
      return sendError(
        res,
        result.statusCode,
        "Site ayarları güncellenemedi.",
        result.details
      );
    }

    await recordAuditLog(currentAdmin, {
      action: "update",
      entityType: "site_settings",
      entityId: "global",
      title: "Site ayarları güncellendi.",
      detail: "Marka, iletişim veya KVKK ayarları güncellendi.",
      metadata: { fields: getPayloadFields(payload) }
    });

    return sendJson(res, 200, {
      ok: true,
      message: "Site ayarları güncellendi.",
      settings: result.settings
    });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/crm") {
    if (!authorizeUserRole(currentAdmin, res, ["admin"])) return;
    const integration = await getCrmIntegration();
    return sendJson(res, 200, {
      ok: true,
      integration: serializeCrmIntegration(integration)
    });
  }

  if (req.method === "PATCH" && url.pathname === "/api/admin/crm") {
    if (!authorizeUserRole(currentAdmin, res, ["admin"])) return;
    const payload = await readRequestBody(req);
    const result = await updateCrmIntegration(payload);

    if (!result.ok) {
      return sendError(
        res,
        result.statusCode,
        "CRM entegrasyonu güncellenemedi.",
        result.details
      );
    }

    await recordAuditLog(currentAdmin, {
      action: "update",
      entityType: "crm_integration",
      entityId: result.integration.id,
      title: "CRM entegrasyonu güncellendi.",
      detail: result.integration.isEnabled ? "Webhook entegrasyonu aktif." : "Webhook entegrasyonu pasif.",
      metadata: {
        events: result.integration.events,
        fields: getPayloadFields(payload, ["secret"])
      }
    });

    return sendJson(res, 200, {
      ok: true,
      message: "CRM entegrasyonu güncellendi.",
      integration: result.integration
    });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/crm/test") {
    if (!authorizeUserRole(currentAdmin, res, ["admin"])) return;
    const delivery = await sendCrmWebhook("test.ping", {
      id: "test",
      fullName: "Webhook Test",
      phone: "",
      email: currentAdmin.email,
      status: "test",
      selectedPrograms: [],
      selectedProgramDetails: []
    }, { force: true });

    await recordAuditLog(currentAdmin, {
      action: "create",
      entityType: "crm_delivery",
      entityId: String(delivery.id),
      title: "CRM test gönderimi yapıldı.",
      detail: delivery.status === "success" ? "Test webhook başarıyla gönderildi." : "Test webhook gönderimi başarısız veya atlandı.",
      metadata: { status: delivery.status, statusCode: delivery.statusCode }
    });

    return sendJson(res, 200, {
      ok: true,
      message: "CRM test gönderimi tamamlandı.",
      delivery: serializeCrmDeliveryLog(delivery)
    });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/crm/deliveries") {
    if (!authorizeUserRole(currentAdmin, res, ["admin"])) return;
    const query = parseQueryParams(url, crmDeliveryListQuerySchema);

    if (!query.success) {
      return sendError(res, 422, "CRM gönderim filtresi geçersiz.", zodIssuesToDetails(query.error.issues));
    }

    const result = await getCrmDeliveryPage(query.data);
    return sendJson(res, 200, { ok: true, ...result });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/messaging") {
    if (!authorizeUserRole(currentAdmin, res, ["admin", "advisor"])) return;
    const templates = await getMessageTemplates();
    const deliveryScopeWhere = getMessageDeliveryScopeWhere(currentAdmin);
    const [sentTotal, failedTotal] = await Promise.all([
      prisma.messageDeliveryLog.count({ where: mergeWhere(deliveryScopeWhere, { status: "sent" }) }),
      prisma.messageDeliveryLog.count({ where: mergeWhere(deliveryScopeWhere, { status: "failed" }) })
    ]);

    return sendJson(res, 200, {
      ok: true,
      templates,
      summary: {
        sentTotal,
        failedTotal
      }
    });
  }

  const messageTemplateMatch = url.pathname.match(/^\/api\/admin\/messaging\/templates\/([^/]+)$/);

  if (messageTemplateMatch && req.method === "PATCH") {
    if (!authorizeUserRole(currentAdmin, res, ["admin"])) return;
    const id = decodeURIComponent(messageTemplateMatch[1]);
    const payload = await readRequestBody(req);
    const result = await updateMessageTemplate(id, payload);

    if (!result.ok) {
      return sendError(
        res,
        result.statusCode,
        "Mesaj şablonu güncellenemedi.",
        result.details
      );
    }

    await recordAuditLog(currentAdmin, {
      action: "update",
      entityType: "message_template",
      entityId: result.template.id,
      title: "Mesaj şablonu güncellendi.",
      detail: result.template.name,
      metadata: {
        channel: result.template.channel,
        fields: getPayloadFields(payload)
      }
    });

    return sendJson(res, 200, {
      ok: true,
      message: "Mesaj şablonu güncellendi.",
      template: result.template
    });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/messaging/deliveries") {
    if (!authorizeUserRole(currentAdmin, res, ["admin", "advisor"])) return;
    const query = parseQueryParams(url, adminMessageDeliveryListQuerySchema);

    if (!query.success) {
      return sendError(res, 422, "Mesaj gönderim filtresi geçersiz.", zodIssuesToDetails(query.error.issues));
    }

    const result = await getMessageDeliveryPage(query.data, currentAdmin);
    return sendJson(res, 200, { ok: true, ...result });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/users") {
    if (!authorizeUserRole(currentAdmin, res, ["admin"])) return;
    const users = await getAdminUsers();
    return sendJson(res, 200, { ok: true, users });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/users") {
    if (!authorizeUserRole(currentAdmin, res, ["admin"])) return;
    const payload = await readRequestBody(req);
    const result = await createAdminUser(payload);

    if (!result.ok) {
      return sendError(
        res,
        result.statusCode,
        "Admin kullanıcısı oluşturulamadı.",
        result.details
      );
    }

    await recordAuditLog(currentAdmin, {
      action: "create",
      entityType: "admin_user",
      entityId: result.user.id,
      title: "Admin kullanıcısı oluşturuldu.",
      detail: `${result.user.name} kullanıcısı oluşturuldu.`,
      metadata: {
        role: result.user.role,
        fields: getPayloadFields(payload, ["password"])
      }
    });

    return sendJson(res, 201, {
      ok: true,
      message: "Admin kullanıcısı oluşturuldu.",
      user: result.user
    });
  }

  const userMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)$/);

  if (userMatch && req.method === "PATCH") {
    if (!authorizeUserRole(currentAdmin, res, ["admin"])) return;
    const id = decodeURIComponent(userMatch[1]);
    const payload = await readRequestBody(req);

    if (id === currentAdmin.id && (payload.isActive === false || (payload.role && payload.role !== "admin"))) {
      return sendError(res, 422, "Kendi admin yetkini veya aktif durumunu düşüremezsin.");
    }

    const result = await updateAdminUser(id, payload);

    if (!result.ok) {
      return sendError(
        res,
        result.statusCode,
        "Admin kullanıcısı güncellenemedi.",
        result.details
      );
    }

    await recordAuditLog(currentAdmin, {
      action: "update",
      entityType: "admin_user",
      entityId: result.user.id,
      title: "Admin kullanıcısı güncellendi.",
      detail: `${result.user.name} kullanıcısı güncellendi.`,
      metadata: {
        role: result.user.role,
        fields: getPayloadFields(payload, ["password"])
      }
    });

    return sendJson(res, 200, {
      ok: true,
      message: "Admin kullanıcısı güncellendi.",
      user: result.user
    });
  }

  if (userMatch && req.method === "DELETE") {
    if (!authorizeUserRole(currentAdmin, res, ["admin"])) return;
    const id = decodeURIComponent(userMatch[1]);

    if (id === currentAdmin.id) {
      return sendError(res, 422, "Kendi hesabını pasife alamazsın.");
    }

    const result = await updateAdminUser(id, { isActive: false });

    if (!result.ok) {
      return sendError(
        res,
        result.statusCode,
        "Admin kullanıcısı pasife alınamadı.",
        result.details
      );
    }

    await recordAuditLog(currentAdmin, {
      action: "delete",
      entityType: "admin_user",
      entityId: result.user.id,
      title: "Admin kullanıcısı pasife alındı.",
      detail: `${result.user.name} kullanıcısı pasife alındı.`,
      metadata: { role: result.user.role }
    });

    return sendJson(res, 200, {
      ok: true,
      message: "Admin kullanıcısı pasife alındı.",
      user: result.user
    });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/stats") {
    const stats = await getAdminStats(currentAdmin);
    return sendJson(res, 200, { ok: true, stats });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/reports/leads") {
    if (!authorizeUserRole(currentAdmin, res, ["admin", "advisor"])) return;
    const query = parseQueryParams(url, adminReportQuerySchema);

    if (!query.success) {
      return sendError(res, 422, "Rapor filtresi geçersiz.", zodIssuesToDetails(query.error.issues));
    }

    const result = await getLeadReport(query.data, currentAdmin);

    if (!result.ok) {
      return sendError(res, result.statusCode, "Aday raporu oluşturulamadı.", result.details);
    }

    return sendJson(res, 200, { ok: true, report: result.report });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/audit-logs") {
    if (!authorizeUserRole(currentAdmin, res, ["admin"])) return;
    const query = parseQueryParams(url, adminAuditLogListQuerySchema);

    if (!query.success) {
      return sendError(res, 422, "İşlem geçmişi filtresi geçersiz.", zodIssuesToDetails(query.error.issues));
    }

    const result = await getAuditLogPage(query.data);
    return sendJson(res, 200, { ok: true, ...result });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/notifications") {
    if (!authorizeUserRole(currentAdmin, res, ["admin", "advisor"])) return;
    const query = parseQueryParams(url, adminNotificationListQuerySchema);

    if (!query.success) {
      return sendError(res, 422, "Bildirim filtresi geçersiz.", zodIssuesToDetails(query.error.issues));
    }

    const result = await getNotificationPage(query.data, currentAdmin);
    return sendJson(res, 200, { ok: true, ...result });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/notifications/read-all") {
    if (!authorizeUserRole(currentAdmin, res, ["admin", "advisor"])) return;
    await markAllNotificationsRead(currentAdmin);
    await recordAuditLog(currentAdmin, {
      action: "update",
      entityType: "notification",
      title: "Bildirimler okundu yapıldı.",
      detail: "Tüm okunmamış bildirimler okundu olarak işaretlendi."
    });
    return sendJson(res, 200, {
      ok: true,
      message: "Tüm bildirimler okundu olarak işaretlendi."
    });
  }

  const notificationMatch = url.pathname.match(/^\/api\/admin\/notifications\/(\d+)$/);

  if (notificationMatch && req.method === "PATCH") {
    if (!authorizeUserRole(currentAdmin, res, ["admin", "advisor"])) return;
    const id = Number(notificationMatch[1]);
    const payload = await readRequestBody(req);
    const result = await updateNotification(id, payload, currentAdmin);

    if (!result.ok) {
      return sendError(
        res,
        result.statusCode,
        "Bildirim güncellenemedi.",
        result.details
      );
    }

    await recordAuditLog(currentAdmin, {
      action: "update",
      entityType: "notification",
      entityId: String(result.notification.id),
      title: "Bildirim güncellendi.",
      detail: result.notification.isRead ? "Bildirim okundu yapıldı." : "Bildirim okunmadı yapıldı.",
      metadata: { type: result.notification.type, leadId: result.notification.leadId }
    });

    return sendJson(res, 200, {
      ok: true,
      message: "Bildirim güncellendi.",
      notification: result.notification
    });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/leads") {
    if (!authorizeUserRole(currentAdmin, res, ["admin", "advisor"])) return;
    const query = parseQueryParams(url, adminLeadListQuerySchema);

    if (!query.success) {
      return sendError(res, 422, "Aday listeleme filtresi geçersiz.", zodIssuesToDetails(query.error.issues));
    }

    const result = await getLeadPage(query.data, currentAdmin);
    return sendJson(res, 200, { ok: true, ...result });
  }

  const activityMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)\/activities$/);

  if (activityMatch && req.method === "POST") {
    if (!authorizeUserRole(currentAdmin, res, ["admin", "advisor"])) return;
    const id = decodeURIComponent(activityMatch[1]);
    const payload = await readRequestBody(req);
    const result = await createLeadActivity(id, payload, currentAdmin);

    if (!result.ok) {
      return sendError(
        res,
        result.statusCode,
        "Aday geçmişi eklenemedi.",
        result.details
      );
    }

    await recordAuditLog(currentAdmin, {
      action: "create",
      entityType: "lead_activity",
      entityId: String(result.activity.id),
      title: "Aday geçmişi eklendi.",
      detail: result.activity.title,
      metadata: { leadId: id, type: result.activity.type }
    });

    return sendJson(res, 201, {
      ok: true,
      message: "Aday geçmişi eklendi.",
      activity: result.activity
    });
  }

  const messageMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)\/messages$/);

  if (messageMatch && req.method === "POST") {
    if (!authorizeUserRole(currentAdmin, res, ["admin", "advisor"])) return;
    const id = decodeURIComponent(messageMatch[1]);
    const payload = await readRequestBody(req);
    const result = await sendLeadMessage(id, payload, currentAdmin);

    if (!result.ok) {
      return sendError(
        res,
        result.statusCode,
        result.details?.message || "Mesaj gönderilemedi.",
        result.details
      );
    }

    await recordAuditLog(currentAdmin, {
      action: "create",
      entityType: "message_delivery",
      entityId: String(result.delivery.id),
      title: "Adaya mesaj gönderildi.",
      detail: `${result.delivery.recipient} alıcısına ${result.delivery.channel} mesajı gönderildi.`,
      metadata: {
        leadId: id,
        channel: result.delivery.channel,
        templateId: result.delivery.templateId
      }
    });

    return sendJson(res, 201, {
      ok: true,
      message: "Mesaj gönderildi.",
      delivery: result.delivery,
      activity: result.activity
    });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/programs") {
    const query = parseQueryParams(url, adminProgramListQuerySchema);

    if (!query.success) {
      return sendError(res, 422, "Program listeleme filtresi geçersiz.", zodIssuesToDetails(query.error.issues));
    }

    const result = await getProgramPage(query.data);
    return sendJson(res, 200, { ok: true, ...result });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/programs") {
    if (!authorizeUserRole(currentAdmin, res, ["admin", "editor"])) return;
    const payload = await readRequestBody(req);
    const result = await createProgram(payload);

    if (!result.ok) {
      return sendError(
        res,
        result.statusCode,
        "Program oluşturulamadı.",
        result.details
      );
    }

    await recordAuditLog(currentAdmin, {
      action: "create",
      entityType: "program",
      entityId: result.program.id,
      title: "Program oluşturuldu.",
      detail: result.program.name,
      metadata: { fields: getPayloadFields(payload) }
    });

    return sendJson(res, 201, {
      ok: true,
      message: "Program oluşturuldu.",
      program: result.program
    });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/programs/import") {
    if (!authorizeUserRole(currentAdmin, res, ["admin", "editor"])) return;
    const payload = await readRequestBody(req);
    const result = await importProgramsFromCsv(payload);

    if (!result.ok) {
      return sendError(
        res,
        result.statusCode,
        "Program import tamamlanamadı.",
        result.details
      );
    }

    await recordAuditLog(currentAdmin, {
      action: "import",
      entityType: "program_import",
      title: "Program import tamamlandı.",
      detail: `${result.summary.total} satır işlendi.`,
      metadata: result.summary
    });

    return sendJson(res, 200, {
      ok: true,
      message: "Program import tamamlandı.",
      summary: result.summary,
      programs: result.programs
    });
  }

  const programMatch = url.pathname.match(/^\/api\/admin\/programs\/([^/]+)$/);

  if (programMatch && req.method === "PATCH") {
    if (!authorizeUserRole(currentAdmin, res, ["admin", "editor"])) return;
    const id = decodeURIComponent(programMatch[1]);
    const payload = await readRequestBody(req);
    const result = await updateProgram(id, payload);

    if (!result.ok) {
      return sendError(
        res,
        result.statusCode,
        "Program güncellenemedi.",
        result.details
      );
    }

    await recordAuditLog(currentAdmin, {
      action: "update",
      entityType: "program",
      entityId: result.program.id,
      title: "Program güncellendi.",
      detail: result.program.name,
      metadata: { fields: getPayloadFields(payload) }
    });

    return sendJson(res, 200, {
      ok: true,
      message: "Program güncellendi.",
      program: result.program
    });
  }

  if (programMatch && req.method === "DELETE") {
    if (!authorizeUserRole(currentAdmin, res, ["admin", "editor"])) return;
    const id = decodeURIComponent(programMatch[1]);
    const result = await deactivateProgram(id);

    if (!result.ok) {
      return sendError(
        res,
        result.statusCode,
        "Program pasife alınamadı.",
        result.details
      );
    }

    await recordAuditLog(currentAdmin, {
      action: "delete",
      entityType: "program",
      entityId: result.program.id,
      title: "Program pasife alındı.",
      detail: result.program.name
    });

    return sendJson(res, 200, {
      ok: true,
      message: "Program pasife alındı.",
      program: result.program
    });
  }

  const leadMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)$/);

  if (leadMatch && req.method === "GET") {
    if (!authorizeUserRole(currentAdmin, res, ["admin", "advisor"])) return;
    const id = decodeURIComponent(leadMatch[1]);
    const lead = await getLeadDetail(id, currentAdmin);

    if (!lead) {
      return sendError(res, 404, "Aday kaydı bulunamadı.");
    }

    return sendJson(res, 200, { ok: true, lead });
  }

  if (leadMatch && req.method === "PATCH") {
    if (!authorizeUserRole(currentAdmin, res, ["admin", "advisor"])) return;
    const id = decodeURIComponent(leadMatch[1]);
    const payload = await readRequestBody(req);
    const result = await updateLead(id, payload, currentAdmin);

    if (!result.ok) {
      return sendError(
        res,
        result.statusCode,
        "Aday kaydı güncellenemedi.",
        result.details
      );
    }

    await recordAuditLog(currentAdmin, {
      action: "update",
      entityType: "lead",
      entityId: result.lead.id,
      title: "Aday kaydı güncellendi.",
      detail: result.lead.fullName || result.lead.phone || result.lead.email || "İsimsiz aday",
      metadata: {
        status: result.lead.status,
        fields: getPayloadFields(payload)
      }
    });

    return sendJson(res, 200, {
      ok: true,
      message: "Aday kaydı güncellendi.",
      lead: result.lead
    });
  }

  if (leadMatch && req.method === "DELETE") {
    if (!authorizeUserRole(currentAdmin, res, ["admin"])) return;
    const id = decodeURIComponent(leadMatch[1]);
    const lead = await getLeadDetail(id, currentAdmin);
    const result = await deleteLead(id);

    if (!result.ok) {
      return sendError(
        res,
        result.statusCode,
        "Aday kaydı silinemedi.",
        result.details
      );
    }

    await recordAuditLog(currentAdmin, {
      action: "delete",
      entityType: "lead",
      entityId: id,
      title: "Aday kaydı silindi.",
      detail: lead?.fullName || lead?.phone || lead?.email || id
    });

    return sendJson(res, 200, {
      ok: true,
      message: "Aday kaydı silindi."
    });
  }

  return sendError(res, 404, "Admin endpoint bulunamadı.");
}

async function handleApi(req, res, url) {
  if (req.method === "OPTIONS") {
    return sendJson(res, 204, {});
  }

  if (url.pathname.startsWith("/api/admin/")) {
    return handleAdminApi(req, res, url);
  }

  if (req.method === "GET" && url.pathname === "/api/health") {
    await prisma.$queryRaw`SELECT 1`;
    return sendJson(res, 200, {
      ok: true,
      service: "akilli-tercih-api",
      database: "sqlite",
      environment: IS_PRODUCTION ? "production" : "development",
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === "GET" && url.pathname === "/api/settings") {
    const settings = await getSiteSettings();
    return sendJson(res, 200, { ok: true, settings });
  }

  if (req.method === "GET" && url.pathname === "/api/programs") {
    const programs = await getProgramList();
    return sendJson(res, 200, { ok: true, version: "sqlite-prisma", programs });
  }

  if (req.method === "GET" && url.pathname.startsWith("/api/programs/")) {
    const id = decodeURIComponent(url.pathname.replace("/api/programs/", ""));
    const program = await prisma.program.findFirst({
      where: {
        id,
        isActive: true
      }
    });

    if (!program) {
      return sendError(res, 404, "Program bulunamadı.");
    }

    return sendJson(res, 200, {
      ok: true,
      version: "sqlite-prisma",
      program: serializeProgram(program)
    });
  }

  if (req.method === "GET" && url.pathname === "/api/leads") {
    return sendError(res, 401, "Aday kayıtlarını görüntülemek için admin girişi gerekli.");
  }

  if (req.method === "POST" && url.pathname === "/api/leads") {
    if (!enforceRateLimit(req, res, "public-lead", "form", RATE_LIMITS.publicLead)) return;
    const payload = await readRequestBody(req);
    const result = await createLead(payload);

    if (!result.ok) {
      return sendError(
        res,
        result.statusCode,
        "Form verisi doğrulanamadı.",
        result.details
      );
    }

    return sendJson(res, 201, {
      ok: true,
      message: "Aday kaydı alındı.",
      lead: result.lead
    });
  }

  return sendError(res, 404, "API endpoint bulunamadı.");
}

async function serveStatic(_req, res, url) {
  const requestedPath = url.pathname === "/"
    ? "index.html"
    : decodeURIComponent(url.pathname.slice(1));
  const filePath = path.resolve(ROOT_DIR, requestedPath);

  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, getResponseHeaders(res.__request, { "Content-Type": "text/plain; charset=utf-8" }));
    res.end("Forbidden");
    return;
  }

  try {
    const finalPath = await resolveStaticPath(filePath);
    const body = await fs.readFile(finalPath);
    const contentType = mimeTypes[path.extname(finalPath)] || "application/octet-stream";

    res.writeHead(200, getResponseHeaders(res.__request, {
      "Content-Type": contentType,
      "Cache-Control": "no-store"
    }));
    res.end(body);
  } catch (_error) {
    res.writeHead(404, getResponseHeaders(res.__request, { "Content-Type": "text/html; charset=utf-8" }));
    res.end(await fs.readFile(path.join(ROOT_DIR, "index.html"), "utf8"));
  }
}

async function resolveStaticPath(filePath) {
  const stat = await fs.stat(filePath).catch(() => null);

  if (stat?.isDirectory()) {
    return path.join(filePath, "index.html");
  }

  if (stat?.isFile()) {
    return filePath;
  }

  if (!path.extname(filePath)) {
    const htmlPath = `${filePath}.html`;
    const htmlStat = await fs.stat(htmlPath).catch(() => null);
    if (htmlStat?.isFile()) return htmlPath;

    const indexPath = path.join(filePath, "index.html");
    const indexStat = await fs.stat(indexPath).catch(() => null);
    if (indexStat?.isFile()) return indexPath;
  }

  throw Object.assign(new Error("Static file not found"), { statusCode: 404 });
}

const server = http.createServer(async (req, res) => {
  res.__request = req;
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  try {
    if (url.pathname.startsWith("/api/") && !isAllowedOrigin(req.headers.origin || "")) {
      return sendError(res, 403, "Bu origin için API erişimi kapalı.");
    }

    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }

    await serveStatic(req, res, url);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    console.error(error);
    sendError(res, statusCode, statusCode === 500 ? "Sunucu hatası." : error.message);
  }
});

function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

async function startServer() {
  validateProductionConfig();
  await cleanupOldAuditLogs();
  server.listen(PORT, HOST, () => {
    console.log(`Akilli Tercih backend: http://${HOST}:${PORT}`);
  });
}

startServer().catch(async error => {
  console.error(error.message);
  await prisma.$disconnect();
  process.exit(1);
});
