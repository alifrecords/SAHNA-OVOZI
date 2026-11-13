// Sahna Ovozi — ASIO xost jarayoni (Electron utilityProcess): RtAudio (audify) shu yerda ishlaydi,
// drayver qulasa ham asosiy dastur yopilmaydi.
// Pult Web Audio'da miks qiladi; Master signal AudioWorklet -> MessagePort -> shu jarayon -> RtAudio (ASIO) ga yoziladi.
// ASIO kirishi (mikrofon) teskari yo'l bilan pultga qaytadi.
'use strict';

let A = null, loadErr = '';
function lib() {
  if (A || loadErr) return A;
  try { A = require('audify'); } catch (e) { loadErr = String(e && e.message || e); A = null; }
  return A;
}
const API_NAMES = { 1: 'CoreAudio', 2: 'ALSA', 3: 'JACK', 4: 'PulseAudio', 5: 'OSS', 6: 'ASIO', 7: 'WASAPI', 8: 'DirectSound' };
function apiFor(name) {
  const L = lib(); if (!L) return 0;
  const m = { asio: L.RtAudioApi.WINDOWS_ASIO, wasapi: L.RtAudioApi.WINDOWS_WASAPI, ds: L.RtAudioApi.WINDOWS_DS, core: L.RtAudioApi.MACOSX_CORE, alsa: L.RtAudioApi.LINUX_ALSA, pulse: L.RtAudioApi.LINUX_PULSE, jack: L.RtAudioApi.UNIX_JACK };
  return m[name] != null ? m[name] : L.RtAudioApi.UNSPECIFIED;
}
function defaultApi() { return process.platform === 'win32' ? 'asio' : process.platform === 'darwin' ? 'core' : 'pulse'; }

let rt = null, port = null, st = null;
// ASIO bir vaqtda faqat bitta drayverni yuklaydi — shuning uchun bitta RtAudio nusxasi ham ro'yxat, ham oqim uchun ishlatiladi
let inst = null, instApi = null;
function getRt(api) {
  const L = lib(); if (!L) return null;
  if (inst && instApi === api) return inst;
  if (inst) { try { if (inst.isStreamRunning()) inst.stop(); } catch (e) {} try { if (inst.isStreamOpen()) inst.closeStream(); } catch (e) {} }
  inst = new L.RtAudio(apiFor(api)); instApi = api; return inst;
}
// st: { frame, chOut, chIn, sr, ring, rFill, queued, maxQ, written, played, drops, under, inChannels }
function stop() {
  if (rt) { try { if (rt.isStreamRunning()) rt.stop(); } catch (e) {} try { if (rt.isStreamOpen()) rt.closeStream(); } catch (e) {} try { rt.clearOutputQueue(); } catch (e) {} }
  rt = null; st = null;
}
function stopAll() { stop(); if (port) { try { port.close(); } catch (e) {} port = null; } }

function list(apiName) {
  const L = lib();
  if (!L) return { ok: false, reason: 'module', detail: loadErr };
  const api = apiName || defaultApi();
  try {
    const r = getRt(api);
    const devs = ((st && st.devs) ? st.devs : r.getDevices()).map(d => ({ id: d.id, name: d.name, out: d.outputChannels, inp: d.inputChannels, rates: d.sampleRates || [], pref: d.preferredSampleRate || 0, defOut: !!d.isDefaultOutput, defIn: !!d.isDefaultInput }));
    let apis = [];
    try { apis = (L.RtAudio.getCompiledApi ? L.RtAudio.getCompiledApi() : []).map(a => API_NAMES[a]).filter(Boolean); } catch (e) {}
    return { ok: true, api, apiLabel: API_NAMES[apiFor(api)] || api, devices: devs, apis, running: !!st, info: st ? info() : null };
  } catch (e) { return { ok: false, reason: 'api', detail: String(e && e.message || e) }; }
}
function info() { return st ? { frame: st.frame, sr: st.sr, chOut: st.chOut, chIn: st.chIn, latencyMs: Math.round(((st.maxQ + 1) * st.frame) / st.sr * 1000 * 10) / 10, drops: st.drops, under: st.under, name: st.name, rx, port: !!port } : null; }

function pump() {
  // ringdan butun kadrlarni RtAudio navbatiga yozish (navbat maxQ dan oshmasin — kechikish chegarasi)
  const s = st; if (!s || !rt) return;
  const need = s.frame * 2;
  while (s.rFill >= need && s.queued < s.maxQ) {
    const out = Buffer.allocUnsafe(s.frame * s.chOut * 4);
    const f = new Float32Array(out.buffer, out.byteOffset, s.frame * s.chOut);
    if (s.chOut === 2) f.set(s.ring.subarray(0, need));
    else for (let i = 0, j = 0; i < s.frame; i++, j += 2) { const L = s.ring[j], R = s.ring[j + 1]; if (s.chOut === 1) f[i] = (L + R) * 0.5; else { f[i * s.chOut] = L; f[i * s.chOut + 1] = R; for (let c = 2; c < s.chOut; c++) f[i * s.chOut + c] = 0; } }
    s.ring.copyWithin(0, need, s.rFill); s.rFill -= need;
    try { rt.write(out); s.queued++; s.written++; } catch (e) { break; }
  }
  // soat farqi: ring juda to'lib ketsa eskisini tashlash (kechikish o'smasin)
  const cap = s.frame * 2 * (s.maxQ + 6);
  if (s.rFill > cap) { const drop = s.rFill - s.frame * 2 * 2; s.ring.copyWithin(0, drop, s.rFill); s.rFill -= drop; s.drops++; }
}
let rx = 0;
function onPcm(data) {
  rx++;
  const s = st; if (!s) return;
  let f;
  if (ArrayBuffer.isView(data)) f = new Float32Array(data.buffer, data.byteOffset, data.byteLength >> 2);
  else if (data && typeof data.byteLength === 'number') f = new Float32Array(data);
  else return;
  if (s.rFill + f.length > s.ring.length) { s.rFill = 0; s.drops++; }
  s.ring.set(f, s.rFill); s.rFill += f.length;
  pump();
}

function start(cfg) {
  stop();
  const L = lib();
  if (!L) return { ok: false, reason: 'module', detail: loadErr };
  try {
    rt = getRt(cfg.api || defaultApi());
    const devs = rt.getDevices();
    const d = devs.find(x => x.name === cfg.name) || devs.find(x => x.id === cfg.id);
    if (!d) { stop(); return { ok: false, reason: 'nodev', detail: cfg.name }; }
    const chOut = Math.max(1, Math.min(2, d.outputChannels - (cfg.outFirst || 0)));
    const wantIn = cfg.inOn && d.inputChannels > 0;
    const chIn = wantIn ? Math.max(1, Math.min(2, d.inputChannels - (cfg.inFirst || 0))) : 0;
    const sr = cfg.sr || d.preferredSampleRate || 48000;
    st = { frame: 0, chOut, chIn, sr, ring: new Float32Array(48000 * 2), rFill: 0, queued: 0, maxQ: Math.max(1, cfg.maxQ || 2), written: 0, played: 0, drops: 0, under: 0, name: d.name, devs };
    const inCb = wantIn ? (buf => {
      if (!port || !st) return;
      const n = buf.byteLength >> 2, src = new Float32Array(buf.buffer, buf.byteOffset, n), frames = n / chIn;
      const o = new Float32Array(frames * 2);
      for (let i = 0; i < frames; i++) { const a = src[i * chIn], b = chIn > 1 ? src[i * chIn + 1] : a; o[i * 2] = a; o[i * 2 + 1] = b; }
      try { port.postMessage(o); } catch (e) {}
    }) : null;
    const frame = rt.openStream(
      { deviceId: d.id, nChannels: chOut, firstChannel: cfg.outFirst || 0 },
      wantIn ? { deviceId: d.id, nChannels: chIn, firstChannel: cfg.inFirst || 0 } : null,
      L.RtAudioFormat.RTAUDIO_FLOAT32, sr, cfg.frame || 0, 'Sahna Ovozi', inCb,
      () => { if (!st) return; st.played++; if (st.queued > 0) st.queued--; else st.under++; pump(); },
      L.RtAudioStreamFlags.RTAUDIO_MINIMIZE_LATENCY | L.RtAudioStreamFlags.RTAUDIO_SCHEDULE_REALTIME,
      (type, msg) => { if (st) st.err = msg; }
    );
    st.frame = frame || cfg.frame || 256;
    rt.start();
    return { ok: true, ...info() };
  } catch (e) { const detail = String(e && e.message || e); stop(); return { ok: false, reason: 'open', detail }; }
}


const pp = process.parentPort;
pp.on('message', e => {
  const m = e.data || {};
  if (m.op === 'port') {
    if (port) { try { port.close(); } catch (er) {} }
    port = e.ports && e.ports[0]; if (!port) return;
    port.on('message', x => onPcm(x.data)); port.start(); return;
  }
  let res;
  try {
    if (m.op === 'list') res = list(m.arg);
    else if (m.op === 'start') res = start(m.arg || {});
    else if (m.op === 'stop') { stop(); res = true; }
    else if (m.op === 'stopAll') { stopAll(); res = true; }
    else if (m.op === 'info') res = info();
  } catch (er) { res = { ok: false, reason: 'host', detail: String(er && er.message || er) }; }
  pp.postMessage({ id: m.id, res });
});
