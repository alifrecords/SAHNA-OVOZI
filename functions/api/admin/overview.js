import { adminOnly, json, getSettings, kvGet, adminRepo, parsePriv, PRIV_MSG } from "../_db.js";
import { codeState, fmtDev } from "../_sahna.js";
export const onRequestGet = adminOnly(async ({ env }) => {
  const db = env.DB, now = Date.now();
  const s = await getSettings(db);
  const ms = new Date(); ms.setUTCDate(1); ms.setUTCHours(0, 0, 0, 0);
  const payments = (await db.prepare("SELECT id, dev, tariff, plan_name, amount, tg_user, tg_username, tg_name, photo, status, created, decided FROM so_payments ORDER BY created DESC LIMIT 200").all()).results || [];
  const codes = ((await db.prepare("SELECT id, dev, tariff, plan, days, status, created, expires, created_by, token FROM so_codes ORDER BY created DESC LIMIT 300").all()).results || []).map((c) => ({ ...c, state: codeState(c), devFmt: fmtDev(c.dev) }));
  const devices = ((await db.prepare("SELECT * FROM so_devices ORDER BY last DESC LIMIT 400").all()).results || []).map((d) => ({ ...d, devFmt: fmtDev(d.dev), ip: undefined }));
  const one = async (sql, ...a) => (await db.prepare(sql).bind(...a).first()) || {};
  const stats = {
    pending: (await one("SELECT COUNT(*) AS n FROM so_payments WHERE status = 'pending'")).n || 0,
    active: (await one("SELECT COUNT(DISTINCT dev) AS n FROM so_codes WHERE status = 'active' AND expires > ?", now)).n || 0,
    month: (await one("SELECT COALESCE(SUM(amount), 0) AS n FROM so_payments WHERE status = 'approved' AND decided >= ?", ms.getTime())).n || 0,
    all: (await one("SELECT COALESCE(SUM(amount), 0) AS n FROM so_payments WHERE status = 'approved'")).n || 0,
    users: (await one("SELECT COUNT(*) AS n FROM so_devices")).n || 0,
    today: (await one("SELECT COUNT(*) AS n FROM so_devices WHERE last > ?", now - 86400000)).n || 0,
    trial: (await one("SELECT COUNT(*) AS n FROM so_devices WHERE st = 'trial' AND last > ?", now - 2 * 86400000)).n || 0,
  };
  return json({
    stats, devices, payments: payments.map((p) => ({ ...p, hasPhoto: !!p.photo, photo: undefined, devFmt: p.dev ? fmtDev(p.dev) : "" })), codes, settings: s,
    keyReady: parsePriv(env.SAHNA_PRIV).ok,
    keyWhy: (() => { const p = parsePriv(env.SAHNA_PRIV); return p.ok ? "" : PRIV_MSG[p.why]; })(),
    bot: { connected: !!(await kvGet(db, "bot_username")), username: (await kvGet(db, "bot_username")) || "", adminChat: !!(await kvGet(db, "admin_chat")), adminChatName: (await kvGet(db, "admin_chat_name")) || "" },
    adminRepo: adminRepo(env),
  });
});
