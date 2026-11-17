// Har soatda GitHub Actions chaqiradi (.github/workflows/remind.yml): tarif muddati 3 kun ichida tugaydigan
// qurilmalarga eslatma — Telegram bot orqali (to'lov bot orqali bo'lgan bo'lsa) va pultning o'zidagi yozishmaga.
// Sahna Nuri bilan bir xil. Har bir litsenziya uchun bitta eslatma (reminded = 1).
import { guard, json, getSettings } from "./_db.js";
import { send, fmtDev, DAY } from "./_sahna.js";
export const onRequestPost = guard(async ({ env }) => {
  const db = env.DB, now = Date.now();
  const st = await getSettings(db);
  if (st.bot.remind === false) return json({ ok: true, sent: 0 });
  // har qurilmaning eng uzoq muddatli faol kodi; u 3 kun ichida tugasa (uzaytirilgan bo'lsa — eslatilmaydi)
  const rows = (await db.prepare(`SELECT c.id, c.dev, c.expires, p.tg_user FROM so_codes c
      JOIN (SELECT dev, MAX(expires) AS mx FROM so_codes WHERE status = 'active' GROUP BY dev) m ON m.dev = c.dev AND m.mx = c.expires
      LEFT JOIN so_payments p ON p.id = c.payment_id
      WHERE c.status = 'active' AND c.reminded = 0 AND c.expires > ? AND c.expires < ? LIMIT 50`).bind(now, now + 3 * DAY).all()).results || [];
  let sent = 0;
  for (const c of rows) {
    const until = new Date(c.expires).toLocaleDateString("ru-RU"), left = Math.max(1, Math.ceil((c.expires - now) / DAY));
    const text = `⏰ Sahna Ovozi tarifingiz muddati ${until} da tugaydi (${left} kun qoldi). Uzaytirish: pultdagi 💎 tugmasi → tarif → «Shu tarif bilan uzaytirish». Yangi muddat joriy muddat ustiga qo'shiladi.`;
    await db.prepare("INSERT INTO so_msgs (dev, who, name, text, kind, created, seen_admin) VALUES (?, 'a', 'Admin', ?, 'chat', ?, 1)").bind(c.dev, text, now).run();
    if (c.tg_user) { try { await send(env, c.tg_user, text + `\n\nQurilma: <code>${fmtDev(c.dev)}</code> · uzaytirish uchun /start`); } catch (_) {} }
    await db.prepare("UPDATE so_codes SET reminded = 1 WHERE id = ?").bind(c.id).run();
    sent++;
  }
  return json({ ok: true, sent });
});
