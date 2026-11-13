// Admin: qo'lda kod berish (qurilma kodi + tarif) yoki bekor qilish.
import { adminOnly, json, readJson, normDev } from "../_db.js";
import { issue } from "../_sahna.js";
export const onRequestPost = adminOnly(async ({ request, env }) => {
  const b = await readJson(request, 800);
  if (b.action === "create") {
    const r = await issue(env, normDev(b.dev), String(b.tariff || ""), { by: "admin (qo'lda)" });
    return json({ ok: true, token: r.token, expires: r.expires, plan: r.plan });
  }
  if (b.action === "revoke") {
    const r = await env.DB.prepare("UPDATE so_codes SET status = 'revoked' WHERE id = ?").bind(String(b.id || "")).run();
    return json({ ok: !!(r.meta && r.meta.changes) });
  }
  return json({ error: "bad" }, 400);
});
