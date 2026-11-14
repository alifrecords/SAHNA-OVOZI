// SAHNA OVOZI: kodlar, to'lovlar, Telegram bot mantiqi.
import { kvGet, kvSet, getSettings, signLicense, DEV_RE } from "./_db.js";

export const DAY = 86400000;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function block(n) { const b = crypto.getRandomValues(new Uint8Array(n)); let s = ""; for (let i = 0; i < n; i++) s += ALPHABET[b[i] % ALPHABET.length]; return s; }
export const fmtDev = (d) => "SO-" + d.match(/.{4}/g).join("-");

export function codeState(c) {
  if (c.status === "revoked") return "revoked";
  if (c.expires && c.expires < Date.now()) return "expired";
  return "active";
}

/** Qurilma uchun faol litsenziya tokeni (eng uzoq muddatlisi). */
export async function licenseFor(env, dev) {
  const rows = (await env.DB.prepare("SELECT * FROM so_codes WHERE dev = ? AND status = 'active' ORDER BY expires DESC").bind(dev).all()).results || [];
  const c = rows.find((x) => codeState(x) === "active");
  if (!c) return null;
  return { token: c.token, plan: c.plan, expiresAt: c.expires };
}

/** Kod (token) berish: darhol qurilmaga bog'langan, muddati berilgan paytdan boshlanadi. */
export async function issue(env, dev, tariffId, meta = {}) {
  if (!DEV_RE.test(dev)) throw Object.assign(new Error("Qurilma kodi noto'g'ri (12 belgi: SO-XXXX-XXXX-XXXX)"), { status: 400 });
  const s = await getSettings(env.DB);
  const t = s.tariffs.find((x) => x.id === tariffId);
  if (!t) throw Object.assign(new Error("Tarif topilmadi: " + tariffId), { status: 400 });
  const now = Date.now(), exp = now + Math.max(1, t.days) * DAY;
  // mavjud faol litsenziya bo'lsa, yangi muddat uning ustiga qo'shiladi
  const cur = await licenseFor(env, dev);
  const base = cur && cur.expiresAt > now ? cur.expiresAt : now;
  const x = base + Math.max(1, t.days) * DAY;
  const token = await signLicense(env, { d: dev, x, p: t.plan === "std" ? "std" : "pro", n: now });
  const id = "C" + now.toString(36).toUpperCase() + block(3);
  await env.DB.prepare("INSERT INTO so_codes (id, dev, tariff, plan, days, status, created, expires, created_by, payment_id, token) VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?)")
    .bind(id, dev, t.id, t.plan === "std" ? "std" : "pro", t.days, now, x, meta.by || "admin", meta.paymentId || null, token).run();
  return { id, token, expires: x, plan: t.plan, tariff: t };
}

export async function publicConfig(db) {
  const s = await getSettings(db);
  return { card: s.card, tariffs: s.tariffs.filter((t) => t.active).map(({ id, name, plan, days, price }) => ({ id, name, plan, days, price })), botUsername: (await kvGet(db, "bot_username")) || "", trialDays: s.trialDays };
}

/* ================= Telegram ================= */
export async function botToken(env) { return env.BOT_TOKEN || (await kvGet(env.DB, "bot_token")) || ""; }
export async function tg(env, method, body) {
  const token = await botToken(env);
  if (!token) throw new Error("Bot tokeni kiritilmagan");
  const r = await fetch((env.TG_API || "https://api.telegram.org") + "/bot" + token + "/" + method, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
  const j = await r.json();
  if (!j.ok) throw new Error(j.description || "Telegram xatosi");
  return j.result;
}
export const send = (env, chatId, text, extra = {}) => tg(env, "sendMessage", { chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true, ...extra });
export const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const fmtSum = (n) => Number(n || 0).toLocaleString("ru-RU").replace(/[,\s\u00a0\u202f]/g, " ") + " so\'m";
export async function adminChat(db) { return (await kvGet(db, "admin_chat")) || ""; }

/* ================= To'lovlar ================= */
export async function createPayment(db, d) {
  const s = await getSettings(db);
  const plan = s.tariffs.find((t) => t.id === d.tariff);
  const id = "P" + Date.now().toString(36).toUpperCase() + block(3);
  await db.prepare("INSERT INTO so_payments (id, dev, tariff, plan_name, amount, tg_user, tg_username, tg_name, photo, photo_kind, status, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)")
    .bind(id, d.dev || null, d.tariff, plan ? plan.name : d.tariff, plan ? plan.price : 0, d.tgUser, d.tgUsername || "", d.tgName || "", d.photo || null, d.photoKind || "photo", Date.now()).run();
  return db.prepare("SELECT * FROM so_payments WHERE id = ?").bind(id).first();
}

export async function approvePayment(env, id, by) {
  const db = env.DB;
  const lock = await db.prepare("UPDATE so_payments SET status = 'approving' WHERE id = ? AND status = 'pending'").bind(id).run();
  if (!lock.meta || !lock.meta.changes) return { error: "Bu to'lov allaqachon ko'rib chiqilgan yoki topilmadi" };
  const p = await db.prepare("SELECT * FROM so_payments WHERE id = ?").bind(id).first();
  if (!p.dev || !DEV_RE.test(p.dev)) {
    await db.prepare("UPDATE so_payments SET status = 'pending' WHERE id = ?").bind(id).run();
    return { error: "Xaridor qurilma kodini (SO-XXXX-XXXX-XXXX) ko'rsatmagan. Botdan so'rang." };
  }
  let lic;
  try { lic = await issue(env, p.dev, p.tariff, { by, paymentId: p.id }); } catch (e) { await db.prepare("UPDATE so_payments SET status = 'pending' WHERE id = ?").bind(id).run(); throw e; }
  await db.prepare("UPDATE so_payments SET status = 'approved', decided = ? WHERE id = ?").bind(Date.now(), id).run();
  const until = new Date(lic.expires).toLocaleDateString("ru-RU");
  const warn = [];
  if (p.tg_user) try {
    await send(env, p.tg_user, [`<b>To'lov tasdiqlandi</b> ✅`, `Tarif: ${esc(lic.tariff.name)} · ${until} gacha`, ``,
      `Sahna Ovozi ochiq bo'lsa, faollashish o'zi bo'ladi (1–2 daqiqa). Bo'lmasa, quyidagi kodni 💎 Tarif oynasidagi «Faollashtirish kodi» maydoniga joylang:`, `<code>${lic.token}</code>`].join("\n"));
  } catch (e) { warn.push("Xaridorga yuborilmadi: " + e.message); }
  try { if (p.admin_msg) await tg(env, p.photo_kind === "web" ? "editMessageText" : "editMessageCaption", { chat_id: p.admin_chat, message_id: p.admin_msg, parse_mode: "HTML", [p.photo_kind === "web" ? "text" : "caption"]: p.admin_caption + `\n\n<b>Tasdiqlandi.</b>` }); } catch (_) {}
  return { ok: true, until: lic.expires, warn };
}

export async function rejectPayment(env, id) {
  const db = env.DB;
  const r = await db.prepare("UPDATE so_payments SET status = 'rejected', decided = ? WHERE id = ? AND status = 'pending'").bind(Date.now(), id).run();
  if (!r.meta || !r.meta.changes) return { error: "Bu to'lov allaqachon ko'rib chiqilgan yoki topilmadi" };
  const p = await db.prepare("SELECT * FROM so_payments WHERE id = ?").bind(id).first();
  if (p.tg_user) try { await send(env, p.tg_user, "Afsuski, to'lovingiz tasdiqlanmadi. Chekni tekshirib qayta yuboring yoki admin bilan bog'laning."); } catch (_) {}
  try { if (p.admin_msg) await tg(env, p.photo_kind === "web" ? "editMessageText" : "editMessageCaption", { chat_id: p.admin_chat, message_id: p.admin_msg, parse_mode: "HTML", [p.photo_kind === "web" ? "text" : "caption"]: p.admin_caption + `\n\n<b>Rad etildi.</b>` }); } catch (_) {}
  return { ok: true };
}
export { kvGet, kvSet, getSettings };
