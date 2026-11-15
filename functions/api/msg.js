// Ochiq: foydalanuvchi ↔ admin yozishmasi (fikr, taklif, savol). Pultdagi «✉ Administrator» va 💎 oynasidagi «Fikr va takliflar».
// GET  /api/msg?dev=…&key=…          → {msgs:[…], unread}
// POST /api/msg {dev, key, text, name, kind:'chat'|'fb'}  → xabar (bot ulangan bo'lsa — adminga Telegram'da ham)
// POST /api/msg {dev, key, action:'read'}                → admin javoblari o'qildi
// key — shu qurilmaning yozishma kaliti (birinchi xabarda bog'lanadi): boshqa birov qurilma kodini bilsa ham yozishmani o'qiy olmaydi.
import { guard, jsonPublic, optionsPublic, readJson, normDev, DEV_RE } from "./_db.js";
import { tg, adminChat, fmtDev, esc } from "./_sahna.js";
export const onRequestOptions = optionsPublic;
const cut = (s, n) => String(s == null ? "" : s).replace(/\u0000/g, "").trim().slice(0, n);
const KEY_RE = /^[A-Za-z0-9_-]{16,64}$/;
async function auth(db, dev, key, create, name) {
  if (!KEY_RE.test(key || "")) return "bad";
  const r = await db.prepare("SELECT key FROM so_msgkeys WHERE dev = ?").bind(dev).first();
  if (!r) {
    if (!create) return "none";
    await db.prepare("INSERT INTO so_msgkeys (dev, key, name, created) VALUES (?, ?, ?, ?)").bind(dev, key, name || "", Date.now()).run();
    return "ok";
  }
  return r.key === key ? "ok" : "bad";
}
export const onRequestGet = guard(async ({ request, env }) => {
  const q = new URL(request.url).searchParams, dev = normDev(q.get("dev")), db = env.DB;
  if (!DEV_RE.test(dev)) return jsonPublic({ error: "dev" }, 400);
  const a = await auth(db, dev, q.get("key"), false);
  if (a === "none") return jsonPublic({ msgs: [], unread: 0 });
  if (a !== "ok") return jsonPublic({ error: "key", msg: "Bu qurilma yozishmasi boshqa brauzerga bog'langan" }, 403);
  const rows = (await db.prepare("SELECT id, who, text, kind, created, seen_user FROM so_msgs WHERE dev = ? ORDER BY id DESC LIMIT 200").bind(dev).all()).results.reverse();
  return jsonPublic({ msgs: rows, unread: rows.filter((m) => m.who === "a" && !m.seen_user).length });
});
export const onRequestPost = guard(async ({ request, env }) => {
  const db = env.DB, b = await readJson(request, 6000), dev = normDev(b.dev);
  if (!DEV_RE.test(dev)) return jsonPublic({ error: "dev", msg: "Qurilma kodi xato" }, 400);
  if (b.action === "read") {
    if ((await auth(db, dev, b.key, false)) !== "ok") return jsonPublic({ ok: true });
    await db.prepare("UPDATE so_msgs SET seen_user = 1 WHERE dev = ? AND who = 'a'").bind(dev).run();
    return jsonPublic({ ok: true });
  }
  const text = cut(b.text, 1000), name = cut(b.name, 60), kind = b.kind === "fb" ? "fb" : "chat";
  if (!text) return jsonPublic({ error: "text", msg: "Xabar bo'sh" }, 400);
  const a = await auth(db, dev, b.key, true, name);
  if (a !== "ok") return jsonPublic({ error: "key", msg: "Bu qurilma yozishmasi boshqa brauzerga bog'langan" }, 403);
  const n = await db.prepare("SELECT COUNT(*) AS n FROM so_msgs WHERE dev = ? AND who = 'u' AND created > ?").bind(dev, Date.now() - 3600000).first();
  if (n && n.n >= 30) return jsonPublic({ error: "many", msg: "Juda ko'p xabar — biroz kuting" }, 429);
  if (name) await db.prepare("UPDATE so_msgkeys SET name = ? WHERE dev = ?").bind(name, dev).run();
  const r = await db.prepare("INSERT INTO so_msgs (dev, who, name, text, kind, created) VALUES (?, 'u', ?, ?, ?, ?)").bind(dev, name, text, kind, Date.now()).run();
  try {
    const chat = await adminChat(db);
    if (chat) await tg(env, "sendMessage", { chat_id: chat, parse_mode: "HTML", disable_web_page_preview: true,
      text: [`💬 <b>${kind === "fb" ? "Fikr / taklif" : "Yangi xabar"}</b>${name ? " · " + esc(name) : ""}`, `Qurilma: <code>${fmtDev(dev)}</code>`, ``, esc(text), ``, `↩ Javob: shu xabarga «Reply» qilib yozing yoki admin sahifada (💬 Xabarlar).`].join("\n") });
  } catch (_) {}
  return jsonPublic({ ok: true, id: r.meta && r.meta.last_row_id });
});
