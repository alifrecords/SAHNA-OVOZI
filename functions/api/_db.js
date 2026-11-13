// SAHNA OVOZI — server yordamchilari (Cloudflare Pages Functions + D1). Daftar Azimxodjayev bilan bir xil tuzilish.
// AZ-ARENA bilan bir xil tuzilish: D1 "DB", GitHub-token admin, Telegram bot orqali to'lov.
// Litsenziya ECDSA P-256 imzosi bilan beriladi (maxfiy kalit — Cloudflare Secret SAHNA_PRIV); pult uni internetsiz tekshiradi.

export const DEFAULT_SETTINGS = {
  card: { number: "", holder: "", system: "UZCARD" },
  tariffs: [
    { id: "STD", name: "Standart", plan: "std", days: 30, price: 25000, active: true },
    { id: "PRO", name: "Pro", plan: "pro", days: 30, price: 49000, active: true },
  ],
  bot: { notify: true, autoSend: false },
  trialDays: 1,
};

let ready = false;
export async function ensureSchema(db) {
  if (ready) return;
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS so_kv (k TEXT PRIMARY KEY, v TEXT)"),
    db.prepare("CREATE TABLE IF NOT EXISTS so_codes (id TEXT PRIMARY KEY, dev TEXT, tariff TEXT, plan TEXT, days INTEGER, status TEXT NOT NULL, created INTEGER, expires INTEGER, created_by TEXT, payment_id TEXT, token TEXT)"),
    db.prepare("CREATE INDEX IF NOT EXISTS so_codes_dev ON so_codes(dev)"),
    db.prepare("CREATE TABLE IF NOT EXISTS so_payments (id TEXT PRIMARY KEY, dev TEXT, tariff TEXT, plan_name TEXT, amount INTEGER, tg_user INTEGER, tg_username TEXT, tg_name TEXT, photo TEXT, photo_kind TEXT, status TEXT NOT NULL, created INTEGER, decided INTEGER, admin_chat TEXT, admin_msg INTEGER, admin_caption TEXT)"),
    db.prepare("CREATE INDEX IF NOT EXISTS so_payments_status ON so_payments(status, created)"),
    db.prepare("CREATE TABLE IF NOT EXISTS so_sessions (uid INTEGER PRIMARY KEY, dev TEXT, tariff TEXT, step TEXT, ts INTEGER)"),
    db.prepare("CREATE TABLE IF NOT EXISTS so_fail (ip TEXT, ts INTEGER)"),
    db.prepare("CREATE TABLE IF NOT EXISTS so_devices (dev TEXT PRIMARY KEY, first INTEGER, last INTEGER, trial INTEGER, st TEXT, plan TEXT, until INTEGER, ver TEXT, platform TEXT, lang TEXT, ip TEXT, hits INTEGER DEFAULT 1, note TEXT)"),
    db.prepare("CREATE INDEX IF NOT EXISTS so_devices_last ON so_devices(last)"),
  ]);
  ready = true;
}

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
export const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra } });
export const jsonPublic = (data, status = 200) => json(data, status, CORS);
export const optionsPublic = () => new Response(null, { status: 204, headers: CORS });

export async function readJson(request, max = 8000) {
  const t = await request.text();
  if (t.length > max) throw Object.assign(new Error("big"), { status: 413 });
  try { return JSON.parse(t || "{}"); } catch { throw Object.assign(new Error("bad"), { status: 400 }); }
}

export function guard(fn) {
  return async (ctx) => {
    try {
      if (!ctx.env.DB) return json({ error: "nodb", msg: "D1 bazasi ulanmagan: Cloudflare → Settings → Bindings → D1 → nomi DB" }, 503);
      await ensureSchema(ctx.env.DB);
      return await fn(ctx);
    } catch (e) {
      return json({ error: e.status ? "bad" : "server", msg: String((e && e.message) || e).slice(0, 200) }, e.status || 500);
    }
  };
}

export async function kvGet(db, k) { const r = await db.prepare("SELECT v FROM so_kv WHERE k = ?").bind(k).first(); return r ? r.v : null; }
export async function kvSet(db, k, v) { await db.prepare("INSERT INTO so_kv (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").bind(k, v == null ? null : String(v)).run(); }

export async function getSettings(db) {
  const raw = await kvGet(db, "settings");
  let s = {};
  try { s = raw ? JSON.parse(raw) : {}; } catch { s = {}; }
  return { ...DEFAULT_SETTINGS, ...s, card: { ...DEFAULT_SETTINGS.card, ...(s.card || {}) }, bot: { ...DEFAULT_SETTINGS.bot, ...(s.bot || {}) }, tariffs: Array.isArray(s.tariffs) && s.tariffs.length ? s.tariffs : DEFAULT_SETTINGS.tariffs, trialDays: Number.isFinite(+s.trialDays) ? Math.max(0, Math.min(30, Math.round(+s.trialDays))) : 1 };
}
export async function saveSettings(db, s) { await kvSet(db, "settings", JSON.stringify(s)); }

/* ---- admin: GitHub token bilan kirish (AZ-Playlist / AZ-ARENA bilan bir xil) ---- */
async function sha256(s) { const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join(""); }
const okTokens = new Map();
export const adminRepo = (env) => env.ADMIN_REPO || "alifrecords/SAHNA-OVOZI";
export async function isAdmin(request, env) {
  const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token || token.length > 300) return false;
  const key = await sha256(token), exp = okTokens.get(key);
  if (exp && exp > Date.now()) return true;
  const r = await fetch((env.GH_API || "https://api.github.com") + "/repos/" + adminRepo(env), { headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "User-Agent": "sahna-ovozi" } });
  if (!r.ok) return false;
  const j = await r.json();
  if (!j.permissions || !j.permissions.push) return false;
  okTokens.set(key, Date.now() + 10 * 60 * 1000);
  return true;
}
export function adminOnly(fn) {
  return guard(async (ctx) => {
    if (!(await isAdmin(ctx.request, ctx.env))) return json({ error: "auth", msg: "Token noto'g'ri yoki " + adminRepo(ctx.env) + " repoga yozish huquqi yo'q" }, 401);
    return fn(ctx);
  });
}

/* ---- base64url ---- */
export const b64u = (buf) => { const bytes = new Uint8Array(buf); let s = ""; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };

/* ---- Litsenziya: Sahna Ovozi mijozi tekshiradigan ECDSA P-256 token ---- */
let keyCache = null;
async function signKey(env) {
  if (keyCache) return keyCache;
  if (!env.SAHNA_PRIV) throw Object.assign(new Error("SAHNA_PRIV o'rnatilmagan: Cloudflare → Settings → Variables → SAHNA-ADMIN-KALIT.txt ichidagi matnni (Secret sifatida) joylang"), { status: 503 });
  let jwk; try { jwk = JSON.parse(env.SAHNA_PRIV); } catch { throw Object.assign(new Error("SAHNA_PRIV JSON emas — SAHNA-ADMIN-KALIT.txt matnini to'liq nusxalang"), { status: 503 }); }
  keyCache = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  return keyCache;
}
// payload: {d: qurilma(12 belgi), x: tugash vaqti ms, p: 'std'|'pro', n: yaratilgan vaqt}
export async function signLicense(env, payload) {
  const key = await signKey(env);
  const pb = new TextEncoder().encode(JSON.stringify(payload));
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, pb);
  return b64u(pb) + "." + b64u(sig);
}

export const clientIp = (request) => request.headers.get("CF-Connecting-IP") || "0.0.0.0";
// Sahna Ovozi qurilma kodi (SO-XXXX-XXXX-XXXX): 12 ta belgi (A-Z 2-9, I/L/O/0/1 yo'q)
export const DEV_RE = /^[A-HJ-KM-NP-Z2-9]{12}$/;
export const normDev = (s) => String(s || "").toUpperCase().replace(/^SO/, "").replace(/[^A-Z2-9]/g, "");
