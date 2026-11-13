// Ochiq: GET /api/license?dev=XXXXXXXXXXXX — to'lov tasdiqlangan bo'lsa, Sahna Ovozi o'zi faollashadi.
// Token faqat shu qurilma kodi uchun imzolangan, boshqa qurilmada ishlamaydi. Qurilma kodi 31^12 variantli, taxmin qilib bo'lmaydi; yozuv (write) qilinmaydi — D1 limitiga tejamkor.
import { guard, jsonPublic, optionsPublic, normDev, DEV_RE } from "./_db.js";
import { licenseFor } from "./_sahna.js";
export const onRequestOptions = optionsPublic;
export const onRequestGet = guard(async ({ request, env }) => {
  const dev = normDev(new URL(request.url).searchParams.get("dev"));
  if (!DEV_RE.test(dev)) return jsonPublic({ error: "dev xato" }, 400);
  return jsonPublic({ license: await licenseFor(env, dev) });
});
