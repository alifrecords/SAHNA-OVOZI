// Telegram webhook. Xaridor: /start <qurilma kodi> → tarif → karta → chek → admin tasdiqlaydi → Sahna Ovozi o'zi faollashadi.
import { guard, json, kvGet, kvSet, getSettings, saveSettings, normDev, DEV_RE } from "../_db.js";
import { tg, send, esc, fmtSum, fmtDev, createPayment, approvePayment, rejectPayment, issue, adminChat } from "../_sahna.js";

const session = async (db, uid) => (await db.prepare("SELECT * FROM so_sessions WHERE uid = ?").bind(uid).first()) || { uid, dev: null, tariff: null, step: null };
const saveSession = (db, s) => db.prepare("INSERT INTO so_sessions (uid, dev, tariff, step, ts) VALUES (?, ?, ?, ?, ?) ON CONFLICT(uid) DO UPDATE SET dev = excluded.dev, tariff = excluded.tariff, step = excluded.step, ts = excluded.ts").bind(s.uid, s.dev || null, s.tariff || null, s.step || null, Date.now()).run();
async function tariffKb(db) { const s = await getSettings(db); return { inline_keyboard: s.tariffs.filter((t) => t.active).map((t) => [{ text: `${t.name} — ${fmtSum(t.price)} / ${t.days} kun`, callback_data: "plan:" + t.id }]) }; }
const decisionKb = (id) => ({ inline_keyboard: [[{ text: "Tasdiqlash", callback_data: "ok:" + id }, { text: "Rad etish", callback_data: "no:" + id }]] });
const findDev = (t) => { const m = String(t || "").toUpperCase().replace(/[\s-]/g, "").match(/(?:SO)?([A-HJ-KM-NP-Z2-9]{12})/); return m && DEV_RE.test(m[1]) ? m[1] : ""; };

async function onStart(env, msg, payload) {
  const db = env.DB, s = await session(db, msg.from.id), dev = findDev(payload);
  if (dev) s.dev = dev;
  s.step = "plan"; await saveSession(db, s);
  let text = `Assalomu alaykum! <b>Sahna Ovozi</b> tarifini tanlang:`;
  text += s.dev ? `\n\nQurilma kodingiz: <code>${fmtDev(s.dev)}</code>` : `\n\nSahna Ovozi'dagi qurilma kodingizni (💎 Tarif oynasi, <code>SO-XXXX-XXXX-XXXX</code>) shu yerga yozing.`;
  await send(env, msg.chat.id, text, { reply_markup: await tariffKb(db) });
}
async function onPlan(env, cb, id) {
  const db = env.DB, chatId = cb.message.chat.id;
  await tg(env, "answerCallbackQuery", { callback_query_id: cb.id });
  const st = await getSettings(db), plan = st.tariffs.find((t) => t.id === id && t.active);
  if (!plan) return send(env, chatId, "Bu tarif hozir mavjud emas.");
  if (!st.card.number) return send(env, chatId, "To'lov kartasi hali sozlanmagan. Keyinroq urinib ko'ring.");
  const s = await session(db, cb.from.id); s.tariff = plan.id; s.step = "photo"; await saveSession(db, s);
  await send(env, chatId, [`Tarif: <b>${esc(plan.name)}</b> — <b>${fmtSum(plan.price)}</b> (${plan.days} kun)`, ``, `Karta: <code>${esc(st.card.number)}</code> (${esc(st.card.system)})`, `Egasi: ${esc(st.card.holder)}`, ``,
    s.dev ? `Qurilma kodingiz: <code>${fmtDev(s.dev)}</code>` : `⚠ Qurilma kodingiz hali yo'q. Sahna Ovozi'dagi <code>SO-XXXX-XXXX-XXXX</code> ni yozib yuboring.`, ``, `To'lovdan so'ng <b>chek rasmini</b> (skrinshot) shu yerga yuboring.`].join("\n"));
}
async function onPhoto(env, msg) {
  const db = env.DB, s = await session(db, msg.from.id);
  if (!s.tariff) return send(env, msg.chat.id, "Avval tarifni tanlang:", { reply_markup: await tariffKb(db) });
  if (!s.dev) return send(env, msg.chat.id, "Avval Sahna Ovozi'dagi qurilma kodingizni yozing: <code>SO-XXXX-XXXX-XXXX</code> (💎 Tarif oynasida turibdi).");
  const isPhoto = !!msg.photo, fileId = isPhoto ? msg.photo[msg.photo.length - 1].file_id : msg.document.file_id;
  const p = await createPayment(db, { dev: s.dev, tariff: s.tariff, tgUser: msg.from.id, tgUsername: msg.from.username ? "@" + msg.from.username : "", tgName: [msg.from.first_name, msg.from.last_name].filter(Boolean).join(" "), photo: fileId, photoKind: isPhoto ? "photo" : "document" });
  s.step = "wait"; await saveSession(db, s);
  await send(env, msg.chat.id, "Chekingiz adminga yuborildi. Tasdiqlangach Sahna Ovozi o‘zi faollashadi, kod bu yerga ham keladi.");
  const st = await getSettings(db);
  if (st.bot.autoSend) { await approvePayment(env, p.id, "avto"); return; }
  const chat = await adminChat(db);
  if (chat && st.bot.notify) {
    const caption = [`<b>Yangi to'lov</b> · ${esc(p.id)}`, `Xaridor: ${esc(p.tg_name)} ${esc(p.tg_username)}`, `Qurilma: <code>${fmtDev(p.dev)}</code>`, `Tarif: <b>${esc(p.plan_name)}</b> · <b>${fmtSum(p.amount)}</b>`, `Kartangizga tushganini tekshiring.`].join("\n");
    const sent = await tg(env, isPhoto ? "sendPhoto" : "sendDocument", { chat_id: chat, [isPhoto ? "photo" : "document"]: fileId, caption, parse_mode: "HTML", reply_markup: decisionKb(p.id) });
    await db.prepare("UPDATE so_payments SET admin_chat = ?, admin_msg = ?, admin_caption = ? WHERE id = ?").bind(String(sent.chat.id), sent.message_id, caption, p.id).run();
  }
}
async function onDecision(env, cb, action, id) {
  const chat = await adminChat(env.DB);
  if (!chat || String(cb.message.chat.id) !== chat) return tg(env, "answerCallbackQuery", { callback_query_id: cb.id, text: "Faqat admin uchun" });
  const r = action === "ok" ? await approvePayment(env, id, "telegram") : await rejectPayment(env, id);
  await tg(env, "answerCallbackQuery", { callback_query_id: cb.id, text: r.error || (action === "ok" ? "Tasdiqlandi, faollashtirildi" : "Rad etildi") });
}
async function onAdminCommand(env, msg, cmd, arg) {
  const db = env.DB;
  if (cmd === "/kutilayotgan") {
    const list = (await db.prepare("SELECT * FROM so_payments WHERE status = 'pending' ORDER BY created DESC LIMIT 10").all()).results || [];
    if (!list.length) return send(env, msg.chat.id, "Kutilayotgan to'lov yo'q.");
    for (const p of list) await send(env, msg.chat.id, `${esc(p.id)} · ${esc(p.tg_username || p.tg_name)} · ${esc(p.plan_name)} · ${fmtSum(p.amount)}`, { reply_markup: decisionKb(p.id) });
    return;
  }
  if (cmd === "/kod") { // /kod STD SO-XXXX-XXXX-XXXX
    const st = await getSettings(db), [tid, ...r] = String(arg || "").trim().split(/\s+/), dev = findDev(r.join(" "));
    if (!st.tariffs.some((t) => t.id === String(tid).toUpperCase()) || !dev) return send(env, msg.chat.id, "Foydalanish: /kod " + st.tariffs.map((t) => t.id).join("|") + " SO-XXXX-XXXX-XXXX");
    const c = await issue(env, dev, String(tid).toUpperCase(), { by: "telegram" });
    return send(env, msg.chat.id, `Kod (${esc(c.tariff.name)}, ${new Date(c.expires).toLocaleDateString("ru-RU")} gacha):\n<code>${c.token}</code>`);
  }
  if (cmd === "/karta") {
    const m = String(arg || "").match(/^([\d\s]{16,23})\s+(.+)$/);
    if (!m) return send(env, msg.chat.id, "Foydalanish: /karta 8600123412341234 Ism Familiya");
    const d = m[1].replace(/\D/g, ""); if (d.length < 16 || d.length > 19) return send(env, msg.chat.id, "Karta raqami 16 xonali bo'lishi kerak.");
    const st = await getSettings(db);
    st.card = { number: d.replace(/(.{4})/g, "$1 ").trim(), holder: m[2].trim().slice(0, 60), system: d.startsWith("9860") ? "HUMO" : d.startsWith("4") ? "VISA" : d.startsWith("5") && !d.startsWith("5614") ? "MASTERCARD" : "UZCARD" };
    await saveSettings(db, st);
    return send(env, msg.chat.id, `Karta saqlandi: <code>${st.card.number}</code> · ${esc(st.card.holder)}`);
  }
  return send(env, msg.chat.id, "Admin buyruqlari:\n/kutilayotgan — tasdiqlanmagan to'lovlar\n/kod STD SO-XXXX-XXXX-XXXX — qo'lda kod\n/karta 8600… Ism — kartani almashtirish");
}
async function handle(env, u) {
  const db = env.DB;
  if (u.callback_query) { const cb = u.callback_query, [a, v] = String(cb.data || "").split(":"); if (a === "plan") return onPlan(env, cb, v); if (a === "ok" || a === "no") return onDecision(env, cb, a, v); return; }
  const msg = u.message; if (!msg || !msg.chat || msg.chat.type !== "private" || !msg.from) return;
  const text = (msg.text || "").trim();
  if (text) {
    const [raw, ...rest] = text.split(/\s+/), cmd = raw.split("@")[0].toLowerCase(), arg = rest.join(" ");
    if (cmd === "/id") return send(env, msg.chat.id, `Sizning chat ID: <code>${msg.chat.id}</code>`);
    const linkArg = cmd === "/admin" ? arg.trim() : cmd === "/start" && /^admin_\d{6}$/.test(arg.trim()) ? arg.trim().slice(6) : null;
    if (linkArg !== null) {
      const [code, exp] = ((await kvGet(db, "admin_link_code")) || "").split(":");
      if (code && linkArg === code && +exp > Date.now()) {
        const name = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(" ") || (msg.from.username ? "@" + msg.from.username : String(msg.chat.id));
        await kvSet(db, "admin_chat", String(msg.chat.id)); await kvSet(db, "admin_chat_name", name); await kvSet(db, "admin_link_code", "");
        return send(env, msg.chat.id, "Bog'landi! To'lov cheklari endi shu yerga Tasdiqlash / Rad etish tugmalari bilan keladi.\n\nBuyruqlar: /kutilayotgan, /kod, /karta");
      }
      return send(env, msg.chat.id, "Kod noto'g'ri yoki muddati o'tgan. Admin sahifada yangi kod oling.");
    }
    if (cmd === "/start") return onStart(env, msg, arg);
    if (cmd.startsWith("/") && String(msg.chat.id) === (await adminChat(db))) return onAdminCommand(env, msg, cmd, arg);
    const dev = findDev(text);
    if (dev) { const s = await session(db, msg.from.id); s.dev = dev; await saveSession(db, s); return send(env, msg.chat.id, `Qurilma kodi qabul qilindi: <code>${fmtDev(dev)}</code>`, s.tariff ? {} : { reply_markup: await tariffKb(db) }); }
    return send(env, msg.chat.id, "Boshlash uchun /start bosing, yoki Sahna Ovozi'dagi qurilma kodingizni yozing.");
  }
  if (msg.photo || (msg.document && /^image\//.test(msg.document.mime_type || ""))) return onPhoto(env, msg);
}
export const onRequestPost = guard(async ({ request, env }) => {
  const secret = await kvGet(env.DB, "bot_secret");
  if (!secret || request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== secret) return json({ error: "forbidden" }, 403);
  const u = await request.json().catch(() => null);
  if (u) { try { await handle(env, u); } catch (e) { console.log("bot xatosi:", e && e.message); } }
  return json({ ok: true });
});
