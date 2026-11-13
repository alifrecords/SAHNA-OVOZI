// Ochiq: POST /api/hello — pult ishga tushganda (6 soatda bir marta) qurilma holatini yuboradi.
// Admin sahifada "Foydalanuvchilar" ro'yxati shundan: kim sinovda, kim to'lagan, kimning muddati tugagan.
// Shaxsiy ma'lumot yuborilmaydi — faqat qurilma kodi, versiya, platforma, til va litsenziya holati.
import { guard, jsonPublic, readJson, normDev, DEV_RE, clientIp } from "./_db.js";
import { licenseFor } from "./_sahna.js";
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
export const onRequestOptions = () => new Response(null, { status: 204, headers: CORS });
const cut = (s, n) => String(s == null ? "" : s).slice(0, n);
export const onRequestPost = guard(async ({ request, env }) => {
  const b = await readJson(request, 2000), dev = normDev(b.dev);
  if (!DEV_RE.test(dev)) return jsonPublic({ error: "dev xato" }, 400);
  const now = Date.now(), trial = Math.min(now, Math.max(0, Number(b.trial) || now));
  await env.DB.prepare(`INSERT INTO so_devices (dev, first, last, trial, st, plan, until, ver, platform, lang, ip, hits) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(dev) DO UPDATE SET last = excluded.last, st = excluded.st, plan = excluded.plan, until = excluded.until, ver = excluded.ver, platform = excluded.platform, lang = excluded.lang, ip = excluded.ip, hits = so_devices.hits + 1, trial = MIN(so_devices.trial, excluded.trial)`)
    .bind(dev, now, now, trial, cut(b.st, 10), cut(b.plan, 6), Number(b.until) || 0, cut(b.ver, 12), cut(b.platform, 20), cut(b.lang, 4), clientIp(request)).run();
  const row = await env.DB.prepare("SELECT trial FROM so_devices WHERE dev = ?").bind(dev).first();
  return new Response(JSON.stringify({ license: await licenseFor(env, dev), trial: row ? row.trial : trial, now }), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...CORS } });
});
