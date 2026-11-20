// 💡 CUE-LINK (lokal) — Sahna Ovozi → Sahna Nuri, shu kompyuterning o'zida, internetsiz.
// Sahna Ovozi http://127.0.0.1:47810/events manzilida signal tarqatadi (Server-Sent Events);
// Sahna Nuri sahifasi (Chrome/Edge) unga o'zi ulanadi va cue GO bo'lganda chiroq cue'sini yoqadi.
const http = require('http');
const { ipcMain } = require('electron');

const PORT = 47810;
const clients = new Set();
let srv = null, getWin = () => null;
const H = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Private-Network': 'true',
  'Access-Control-Allow-Headers': '*',
  'Cache-Control': 'no-cache'
};
function notify() { const w = getWin(); if (w && !w.isDestroyed()) w.webContents.send('link-clients', clients.size); }
function send(msg) {
  const s = 'data: ' + JSON.stringify(msg) + '\n\n';
  for (const r of clients) { try { r.write(s); } catch (e) {} }
  return clients.size;
}
function start() {
  if (srv) return;
  srv = http.createServer((req, res) => {
    if (req.method === 'OPTIONS') { res.writeHead(204, H); res.end(); return; }
    if (req.url.startsWith('/events')) {
      res.writeHead(200, { ...H, 'Content-Type': 'text/event-stream', Connection: 'keep-alive' });
      res.write('retry: 1000\n\n');
      res.write('data: ' + JSON.stringify({ t: 'hello', app: 'Sahna Ovozi' }) + '\n\n');
      clients.add(res); notify();
      req.on('close', () => { clients.delete(res); notify(); });
      return;
    }
    res.writeHead(200, { ...H, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ app: 'Sahna Ovozi', link: 1, clients: clients.size }));
  });
  srv.on('error', () => { srv = null; }); // port band bo'lsa — lokal yo'l o'chadi, online kod ishlayveradi
  srv.listen(PORT, '127.0.0.1');
  setInterval(() => { for (const r of clients) { try { r.write(': ping\n\n'); } catch (e) {} } }, 15000).unref();
}
function register(win) {
  getWin = win;
  ipcMain.handle('link-send', (_e, msg) => send(msg));
  ipcMain.handle('link-info', () => ({ ok: !!srv, port: PORT, clients: clients.size }));
  start();
}
function stop() { for (const r of clients) { try { r.end(); } catch (e) {} } clients.clear(); if (srv) { try { srv.close(); } catch (e) {} srv = null; } }
module.exports = { register, stop, send };
