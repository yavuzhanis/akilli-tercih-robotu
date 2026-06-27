const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const vm = require("node:vm");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_DIR = path.join(__dirname, "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");
const PROGRAM_DATA_FILE = path.join(ROOT_DIR, "assets", "js", "program-data.js");

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

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(payload));
}

function sendError(res, statusCode, message, details = undefined) {
  sendJson(res, statusCode, { ok: false, message, details });
}

async function readJsonFile(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJsonFile(filePath, payload) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`);
}

async function loadPrograms() {
  const source = await fs.readFile(PROGRAM_DATA_FILE, "utf8");
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: PROGRAM_DATA_FILE });

  const programs = Array.isArray(context.window.PROGRAM_DATA)
    ? context.window.PROGRAM_DATA
    : [];

  return {
    version: context.window.PROGRAM_DATA_VERSION || "local",
    programs
  };
}

async function readRequestBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > 100_000) {
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

function validateLead(payload, programs) {
  const errors = {};
  const fullName = String(payload.fullName || "").trim();
  const phone = String(payload.phone || "").trim();
  const email = String(payload.email || "").trim();
  const note = String(payload.note || "").trim();
  const selectedPrograms = Array.isArray(payload.selectedPrograms)
    ? payload.selectedPrograms.map(String)
    : [];
  const knownProgramIds = new Set(programs.map(program => program.id));

  if (!fullName && !phone && !email) {
    errors.contact = "En az bir iletişim bilgisi gerekli.";
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "E-posta formatı geçersiz.";
  }

  const phoneDigits = phone.replace(/\D/g, "");
  if (phone && (phoneDigits.length < 10 || phoneDigits.length > 13)) {
    errors.phone = "Telefon formatı geçersiz.";
  }

  if (!selectedPrograms.length) {
    errors.selectedPrograms = "En az bir program seçilmeli.";
  }

  const unknownPrograms = selectedPrograms.filter(id => !knownProgramIds.has(id));
  if (unknownPrograms.length) {
    errors.selectedPrograms = "Bilinmeyen program seçimi var.";
  }

  if (payload.kvkkConsent !== true) {
    errors.kvkkConsent = "KVKK onayı gerekli.";
  }

  return {
    errors,
    value: {
      fullName,
      phone,
      email,
      note,
      selectedPrograms
    }
  };
}

async function handleApi(req, res, url) {
  if (req.method === "OPTIONS") {
    return sendJson(res, 204, {});
  }

  if (req.method === "GET" && url.pathname === "/api/health") {
    return sendJson(res, 200, {
      ok: true,
      service: "akilli-tercih-api",
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === "GET" && url.pathname === "/api/programs") {
    const { version, programs } = await loadPrograms();
    return sendJson(res, 200, { ok: true, version, programs });
  }

  if (req.method === "GET" && url.pathname.startsWith("/api/programs/")) {
    const id = decodeURIComponent(url.pathname.replace("/api/programs/", ""));
    const { version, programs } = await loadPrograms();
    const program = programs.find(item => item.id === id);

    if (!program) {
      return sendError(res, 404, "Program bulunamadı.");
    }

    return sendJson(res, 200, { ok: true, version, program });
  }

  if (req.method === "GET" && url.pathname === "/api/leads") {
    const leads = await readJsonFile(LEADS_FILE, []);
    return sendJson(res, 200, { ok: true, leads });
  }

  if (req.method === "POST" && url.pathname === "/api/leads") {
    const payload = await readRequestBody(req);
    const { programs } = await loadPrograms();
    const { errors, value } = validateLead(payload, programs);

    if (Object.keys(errors).length) {
      return sendError(res, 422, "Form verisi doğrulanamadı.", errors);
    }

    const programMap = new Map(programs.map(program => [program.id, program]));
    const leads = await readJsonFile(LEADS_FILE, []);
    const lead = {
      id: `lead_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      ...value,
      selectedProgramDetails: value.selectedPrograms.map(id => {
        const program = programMap.get(id);
        return {
          id,
          name: program.name,
          scoreType: program.scoreType,
          educationType: program.educationType,
          language: program.language,
          duration: program.duration
        };
      }),
      source: "website",
      status: "new",
      createdAt: new Date().toISOString()
    };

    leads.unshift(lead);
    await writeJsonFile(LEADS_FILE, leads);

    return sendJson(res, 201, {
      ok: true,
      message: "Aday kaydı alındı.",
      lead
    });
  }

  return sendError(res, 404, "API endpoint bulunamadı.");
}

async function serveStatic(req, res, url) {
  const requestedPath = url.pathname === "/"
    ? "index.html"
    : decodeURIComponent(url.pathname.slice(1));
  const filePath = path.resolve(ROOT_DIR, requestedPath);

  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  try {
    const stat = await fs.stat(filePath);
    const finalPath = stat.isDirectory()
      ? path.join(filePath, "index.html")
      : filePath;
    const body = await fs.readFile(finalPath);
    const contentType = mimeTypes[path.extname(finalPath)] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store"
    });
    res.end(body);
  } catch (error) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(await fs.readFile(path.join(ROOT_DIR, "index.html"), "utf8"));
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }

    await serveStatic(req, res, url);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendError(res, statusCode, statusCode === 500 ? "Sunucu hatası." : error.message);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Akilli Tercih backend: http://${HOST}:${PORT}`);
});
