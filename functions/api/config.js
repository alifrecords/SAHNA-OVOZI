// Ochiq: karta, tariflar, bot nomi (Sahna Ovozi "To'lov" oynasi shuni o'qiydi).
import { guard, jsonPublic, optionsPublic } from "./_db.js";
import { publicConfig } from "./_sahna.js";
export const onRequestOptions = optionsPublic;
export const onRequestGet = guard(async ({ env }) => jsonPublic(await publicConfig(env.DB)));
