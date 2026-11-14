import { adminOnly, json, readJson, getSettings, saveSettings } from "../_db.js";
export const onRequestPut = adminOnly(async ({ request, env }) => {
  const db = env.DB, b = await readJson(request, 10000), s = await getSettings(db);
  if (b.contact) s.contact = { tg: String(b.contact.tg || "").replace(/^@|https?:\/\/t\.me\//g, "").replace(/[^A-Za-z0-9_]/g, "").slice(0, 40), phone: String(b.contact.phone || "").replace(/[^\d+ ()-]/g, "").slice(0, 24) };
  if (b.card) {
    const digits = String(b.card.number || "").replace(/\D/g, "");
    if (digits && (digits.length < 16 || digits.length > 19)) return json({ error: "Karta raqami 16 xonali bo'lishi kerak" }, 400);
    s.card = { number: digits.replace(/(.{4})/g, "$1 ").trim(), holder: String(b.card.holder || "").slice(0, 60), system: ["UZCARD", "HUMO", "VISA", "MASTERCARD"].includes(b.card.system) ? b.card.system : "UZCARD" };
  }
  if (Array.isArray(b.tariffs)) {
    const ids = new Set(), list = [];
    for (const t of b.tariffs.slice(0, 8)) {
      const id = String(t.id || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
      if (!id || ids.has(id)) return json({ error: "Tarif kodi bo'sh yoki takrorlangan: " + (t.id || "") }, 400);
      ids.add(id);
      list.push({ id, name: String(t.name || id).slice(0, 30), plan: t.plan === "std" ? "std" : "pro", days: Math.max(1, Math.round(Number(t.days) || 30)), price: Math.max(0, Math.round(Number(t.price) || 0)), active: !!t.active });
    }
    s.tariffs = list;
  }
  if (b.trialDays !== undefined) s.trialDays = Math.max(0, Math.min(30, Math.round(Number(b.trialDays) || 0)));
  if (b.bot) for (const k of ["notify", "autoSend"]) if (b.bot[k] !== undefined) s.bot[k] = !!b.bot[k];
  await saveSettings(db, s);
  return json({ ok: true, settings: s });
});
