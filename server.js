const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 8787);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.json");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SUBMISSIONS_FILE)) fs.writeFileSync(SUBMISSIONS_FILE, "[]", "utf8");
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function saveSubmission(input) {
  ensureStorage();
  const current = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, "utf8"));
  current.push({
    id: Date.now(),
    name: input.name,
    phone: input.phone,
    subject: input.subject,
    message: input.message,
    createdAt: new Date().toISOString()
  });
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(current, null, 2), "utf8");
}

function isSafePath(filePath) {
  return filePath.startsWith(ROOT);
}

function serveStatic(req, res, pathname) {
  let relativePath = pathname === "/" ? "/index.html" : pathname;
  relativePath = decodeURIComponent(relativePath);
  const fullPath = path.join(ROOT, relativePath);

  if (!isSafePath(fullPath)) {
    sendJson(res, 403, { ok: false, message: "Forbidden" });
    return;
  }

  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    sendJson(res, 404, { ok: false, message: "Not found" });
    return;
  }

  const ext = path.extname(fullPath).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(fullPath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;

  if (req.method === "POST" && pathname === "/api/contact") {
    try {
      const raw = await readBody(req);
      const body = JSON.parse(raw || "{}");

      const name = String(body.name || "").trim();
      const phone = String(body.phone || "").trim();
      const subject = String(body.subject || "").trim();
      const message = String(body.message || "").trim();

      if (!name || !phone || !subject || !message) {
        sendJson(res, 400, { ok: false, message: "All fields are required." });
        return;
      }

      saveSubmission({ name, phone, subject, message });
      sendJson(res, 200, { ok: true, message: "Message sent successfully." });
      return;
    } catch (error) {
      sendJson(res, 500, { ok: false, message: "Server error while saving message." });
      return;
    }
  }

  if (req.method === "GET" && pathname === "/api/contact") {
    sendJson(res, 200, { ok: true, message: "Contact endpoint is running." });
    return;
  }

  if (req.method === "GET") {
    serveStatic(req, res, pathname);
    return;
  }

  sendJson(res, 405, { ok: false, message: "Method not allowed." });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
