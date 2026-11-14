// Ochiq: to'lovni pultning o'zidan yuborish (Telegram botsiz ham ishlaydi).
// POST /api/pay {dev, tariff, name, phone, img: "data:image/jpeg;base64,…"} → admin sahifada "To'lovlar"ga tushadi
//   (bot ulangan bo'lsa, adminga Telegram'da Tasdiqlash / Rad etish tugmalari bilan xabar ham boradi).
// GET  /api/pay?dev=… → shu qurilmaning oxirgi to'lovi holati (pending / approved / rejected).
import { guard, jsonPublic, optionsPublic, readJson, normDev, DEV_RE, getSettings } from "./_db.js";
import { createPayment, tg, adminChat, fmtDev } from "./_sahna.js";
export const onRequestOptions = optionsPublic;
const cut = (s, n) => String(s == null ? "" : s).replace(/[<>]/g, "").trim().slice(0, n);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const sum = (n) => String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";

export const onRequestGet = guard(async ({ request, env }) => {
  const dev = normDev(new URL(request.url).searchParams.get("dev"));
  if (!DEV_RE.test(dev)) return jsonPublic({ error: "dev xato" }, 400);
  const p = await env.DB.prepare("SELECT id, tariff, plan_name, amount, status, created, decided FROM so_payments WHERE dev = ? ORDER BY created DESC LIMIT 1").bind(dev).first();
  return jsonPublic({ payment: p || null });
});

export const onRequestPost = guard(async ({ request, env }) => {
  const db = env.DB, b = await readJson(request, 1200000), dev = normDev(b.dev);
  if (!DEV_RE.test(dev)) return jsonPublic({ error: "dev", msg: "Qurilma kodi xato" }, 400);
  const s = await getSettings(db), t = s.tariffs.find((x) => x.id === b.tariff && x.active);
  if (!t) return jsonPublic({ error: "tariff", msg: "Tarif topilmadi" }, 400);
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(b.img || ""));
  if (!m) return jsonPublic({ error: "img", msg: "Chek rasmini (skrinshot) tanlang" }, 400);
  if (m[2].length > 1100000) return jsonPublic({ error: "img", msg: "Rasm juda katta" }, 413);
  const pend = await db.prepare("SELECT COUNT(*) AS n FROM so_payments WHERE dev = ? AND status = 'pending'").bind(dev).first();
  if (pend && pend.n >= 3) return jsonPublic({ error: "many", msg: "Sizda 3 ta tekshirilmagan to'lov bor — admin ko'rib chiqishini kuting" }, 429);
  const name = cut(b.name, 60), phone = cut(b.phone, 30);
  const p = await createPayment(db, { dev, tariff: t.id, tgUser: null, tgUsername: "", tgName: [name, phone].filter(Boolean).join(" · ") || "pult orqali", photo: "web", photoKind: "web" });
  await db.prepare("INSERT INTO so_receipts (id, mime, data, created) VALUES (?, ?, ?, ?)").bind(p.id, m[1], m[2], Date.now()).run();
  // bot ulangan bo'lsa — adminga xabar (rasm admin sahifada)
  try {
    const chat = await adminChat(db);
    if (chat && s.bot && s.bot.notify !== false) {
      const caption = [`<b>Yangi to'lov (pult orqali)</b> · ${p.id}`, `Xaridor: ${esc(p.tg_name)}`, `Qurilma: <code>${fmtDev(dev)}</code>`, `Tarif: <b>${esc(t.name)}</b> · <b>${sum(t.price)}</b>`, ``, `Chek rasmi — admin sahifada: /admin`].join("\n");
      const r = await tg(env, "sendMessage", { chat_id: chat, text: caption, parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "Tasdiqlash", callback_data: "ok:" + p.id }, { text: "Rad etish", callback_data: "no:" + p.id }]] } });
      if (r && r.message_id) await db.prepare("UPDATE so_payments SET admin_chat = ?, admin_msg = ?, admin_caption = ? WHERE id = ?").bind(String(chat), r.message_id, caption, p.id).run();
    }
  } catch (_) {}
  return jsonPublic({ ok: true, id: p.id, tariff: t.name, amount: t.price });
});
