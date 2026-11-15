// Admin: foydalanuvchilar bilan yozishmalar (fikr, taklif, savol).
// GET  /api/admin/msgs              → suhbatlar ro'yxati (oxirgi xabar, o'qilmaganlar)
// GET  /api/admin/msgs?dev=…        → suhbat (o'qildi deb belgilanadi)
// POST /api/admin/msgs {dev, text}  → javob (pult o'zi oladi)
import { adminOnly, json, readJson, normDev, DEV_RE } from "../_db.js";
import { fmtDev } from "../_sahna.js";
export const onRequestGet = adminOnly(async ({ request, env }) => {
  const db = env.DB, dev = normDev(new URL(request.url).searchParams.get("dev"));
  if (dev) {
    if (!DEV_RE.test(dev)) return json({ error: "dev" }, 400);
    const rows = (await db.prepare("SELECT id, who, name, text, kind, created, seen_user FROM so_msgs WHERE dev = ? ORDER BY id DESC LIMIT 300").bind(dev).all()).results.reverse();
    await db.prepare("UPDATE so_msgs SET seen_admin = 1 WHERE dev = ? AND who = 'u'").bind(dev).run();
    const d = await db.prepare("SELECT st, plan, until, platform, last FROM so_devices WHERE dev = ?").bind(dev).first();
    const k = await db.prepare("SELECT name FROM so_msgkeys WHERE dev = ?").bind(dev).first();
    return json({ dev, devFmt: fmtDev(dev), name: (k && k.name) || "", device: d || null, msgs: rows });
  }
  const L = (await db.prepare(`SELECT t.dev, t.unread, t.n, m.text, m.who, m.kind, m.created, k.name, d.st, d.plan
     FROM (SELECT dev, MAX(id) AS mid, SUM(CASE WHEN who = 'u' AND seen_admin = 0 THEN 1 ELSE 0 END) AS unread, COUNT(*) AS n FROM so_msgs GROUP BY dev) t
     JOIN so_msgs m ON m.id = t.mid LEFT JOIN so_msgkeys k ON k.dev = t.dev LEFT JOIN so_devices d ON d.dev = t.dev
     ORDER BY m.created DESC LIMIT 200`).all()).results;
  return json({ threads: L.map((x) => ({ ...x, devFmt: fmtDev(x.dev) })), unread: L.reduce((a, x) => a + (x.unread || 0), 0) });
});
export const onRequestPost = adminOnly(async ({ request, env }) => {
  const db = env.DB, b = await readJson(request, 6000), dev = normDev(b.dev), text = String(b.text || "").trim().slice(0, 2000);
  if (!DEV_RE.test(dev)) return json({ error: "dev", msg: "Qurilma kodi xato" }, 400);
  if (!text) return json({ error: "text", msg: "Javob bo'sh" }, 400);
  await db.prepare("INSERT INTO so_msgs (dev, who, name, text, kind, created, seen_admin) VALUES (?, 'a', 'Admin', ?, 'chat', ?, 1)").bind(dev, text, Date.now()).run();
  await db.prepare("UPDATE so_msgs SET seen_admin = 1 WHERE dev = ? AND who = 'u'").bind(dev).run();
  return json({ ok: true });
});
