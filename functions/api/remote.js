// 📡 MASOFAVIY PULT — teatr kompyuteri (master), masofadagi operator (remote) va sahnadagi telefon-kamera (camera)
// bitta 6 belgili xona kodi orqali bog'lanadi. ● Sahna yozuvi telefonlari (rec1…rec8) ham shu xona orqali pult bilan tanishadi.
//   POST /api/remote                      {room, from, to, msg}   — rolga xabar (buyruq yoki WebRTC signal)
//   POST /api/remote                      {room, from:"master", state} — pult holati (cue'lar, faderlar…)
//   GET  /api/remote?room=..&role=..&after=ID[&since=TS]  — long-poll (6 s gacha kutadi); after=-1 — boshlash
// Jadvallar so_rm* — boshqa jadvallarga tegmaydi. Eski xabarlar 10 daqiqadan keyin o'chiriladi.
import { jsonPublic as out, optionsPublic } from "./_db.js";

const ROOM_RE = /^[A-Z0-9]{6}$/;
const ROLES = ["master", "remote", "camera", "rec1", "rec2", "rec3", "rec4", "rec5", "rec6", "rec7", "rec8"]; // rec1…rec8 — ● Sahna yozuvi telefonlari (/yozuv)
const WAIT_MS = 6000, STEP_MS = 300, FRESH_MS = 20000; // ≤ ~44 ta D1 so‘rovi bitta chaqiriqda (bepul tarif chegarasi 50)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ready = false;
async function schema(db) {
  if (ready) return;
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS so_rm (id INTEGER PRIMARY KEY AUTOINCREMENT, room TEXT NOT NULL, dest TEXT NOT NULL, msg TEXT NOT NULL, ts INTEGER)"),
    db.prepare("CREATE INDEX IF NOT EXISTS so_rm_room ON so_rm(room, dest, id)"),
    db.prepare("CREATE TABLE IF NOT EXISTS so_rm_state (room TEXT PRIMARY KEY, state TEXT, ts INTEGER)"),
    db.prepare("CREATE TABLE IF NOT EXISTS so_rm_seen (room TEXT NOT NULL, role TEXT NOT NULL, ts INTEGER, PRIMARY KEY (room, role))"),
  ]);
  ready = true;
}
const seenStmt = (db, room, role, now) =>
  db.prepare("INSERT INTO so_rm_seen (room, role, ts) VALUES (?, ?, ?) ON CONFLICT(room, role) DO UPDATE SET ts = excluded.ts").bind(room, role, now);
async function ages(db, room, now) {
  const r = (await db.prepare("SELECT role, ts FROM so_rm_seen WHERE room = ?").bind(room).all()).results || [];
  const o = {};
  for (const x of r) o[x.role] = now - x.ts;
  return o;
}

export const onRequestOptions = () => optionsPublic();

export const onRequestPost = async ({ request, env }) => {
  try {
    if (!env.DB) return out({ error: "nodb" }, 503);
    await schema(env.DB);
    const t = await request.text();
    if (t.length > 60000) return out({ error: "big" }, 413);
    let b; try { b = JSON.parse(t || "{}"); } catch { return out({ error: "bad" }, 400); }
    const room = String(b.room || "").toUpperCase(), from = String(b.from || "");
    if (!ROOM_RE.test(room) || !ROLES.includes(from)) return out({ error: "room" }, 400);
    const now = Date.now(), db = env.DB, ops = [seenStmt(db, room, from, now)];
    if (b.state && from === "master") {
      const s = JSON.stringify(b.state);
      if (s.length > 50000) return out({ error: "big" }, 413);
      ops.push(db.prepare("INSERT INTO so_rm_state (room, state, ts) VALUES (?, ?, ?) ON CONFLICT(room) DO UPDATE SET state = excluded.state, ts = excluded.ts").bind(room, s, now));
    }
    if (b.msg && typeof b.msg === "object") {
      const to = String(b.to || "");
      if (!ROLES.includes(to) || to === from) return out({ error: "to" }, 400);
      const m = JSON.stringify({ ...b.msg, from, ts: now });
      if (m.length > 20000) return out({ error: "big" }, 413);
      ops.push(db.prepare("INSERT INTO so_rm (room, dest, msg, ts) VALUES (?, ?, ?, ?)").bind(room, to, m, now));
    }
    await db.batch(ops);
    if (Math.random() < 0.03) await db.prepare("DELETE FROM so_rm WHERE ts < ?").bind(now - 600000).run();
    return out({ ok: true, ages: await ages(db, room, now) });
  } catch (e) {
    return out({ error: "server", msg: String((e && e.message) || e).slice(0, 200) }, 500);
  }
};

export const onRequestGet = async ({ request, env }) => {
  try {
    if (!env.DB) return out({ error: "nodb" }, 503);
    await schema(env.DB);
    const u = new URL(request.url), db = env.DB;
    const room = String(u.searchParams.get("room") || "").toUpperCase(), role = String(u.searchParams.get("role") || "");
    if (!ROOM_RE.test(room) || !ROLES.includes(role)) return out({ error: "room" }, 400);
    let now = Date.now();
    await seenStmt(db, room, role, now).run();
    const after = parseInt(u.searchParams.get("after") ?? "-1", 10);
    const since = parseInt(u.searchParams.get("since") || "0", 10) || 0;
    const wantState = role !== "master";
    const stQ = db.prepare("SELECT state, ts FROM so_rm_state WHERE room = ?").bind(room);
    if (!(after >= 0)) {
      const r = await db.prepare("SELECT MAX(id) AS last FROM so_rm").first();
      const st = wantState ? await stQ.first() : null;
      return out({ last: (r && r.last) || 0, msgs: [], state: st ? JSON.parse(st.state) : null, stateTs: st ? st.ts : 0, ages: await ages(db, room, now) });
    }
    const q = db.prepare("SELECT id, msg, ts FROM so_rm WHERE room = ? AND dest = ? AND id > ? ORDER BY id LIMIT 30");
    const end = now + WAIT_MS;
    let rows = [], st = null;
    while (true) {
      rows = (await q.bind(room, role, after).all()).results || [];
      if (wantState) { const s = await stQ.first(); if (s && s.ts > since) st = s; }
      now = Date.now();
      if (rows.length || st || now >= end) break;
      await sleep(STEP_MS);
    }
    const last = rows.length ? rows[rows.length - 1].id : after;
    const msgs = rows.filter((r) => now - r.ts < FRESH_MS).map((r) => r.msg);
    return out({ last, msgs, state: st ? JSON.parse(st.state) : null, stateTs: st ? st.ts : since, ages: await ages(db, room, now) });
  } catch (e) {
    return out({ error: "server", msg: String((e && e.message) || e).slice(0, 200) }, 500);
  }
};
