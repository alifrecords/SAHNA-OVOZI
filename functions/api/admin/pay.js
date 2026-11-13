import { adminOnly, json, readJson } from "../_db.js";
import { approvePayment, rejectPayment } from "../_sahna.js";
export const onRequestPost = adminOnly(async ({ request, env }) => {
  const b = await readJson(request, 500), id = String(b.id || "").slice(0, 40);
  const r = b.action === "approve" ? await approvePayment(env, id, "admin sahifa") : b.action === "reject" ? await rejectPayment(env, id) : { error: "bad" };
  return json(r, r.error ? 400 : 200);
});
