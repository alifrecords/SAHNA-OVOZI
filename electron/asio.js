// Sahna Ovozi — ASIO ko'prigi (asosiy jarayon tomoni).
// RtAudio alohida utilityProcess'da (asio-host.js) ishlaydi: drayver xatosi butun dasturni yiqitmaydi.
'use strict';
const { ipcMain, utilityProcess } = require('electron');
const path = require('path');

let child = null, seq = 0, getWinRef = () => null;
const pending = new Map();
function host() {
  if (child) return child;
  child = utilityProcess.fork(path.join(__dirname.replace(/app\.asar(?![.\w])/, 'app.asar.unpacked'), 'asio-host.js'), [], { serviceName: 'Sahna Ovozi Audio', stdio: 'ignore' });
  child.on('message', m => { const p = pending.get(m && m.id); if (p) { pending.delete(m.id); p(m.res); } });
  child.on('exit', code => {
    const was = child; child = null;
    for (const [, p] of pending) p({ ok: false, reason: 'crash', detail: 'audio xost to\'xtadi (' + code + ')' });
    pending.clear();
    const w = getWinRef(); if (was && w && !w.isDestroyed()) w.webContents.send('asio-dead', code);
  });
  return child;
}
function call(op, arg, timeout) {
  return new Promise(res => {
    const c = host(), id = ++seq;
    const t = setTimeout(() => { if (pending.has(id)) { pending.delete(id); res({ ok: false, reason: 'timeout', detail: op }); } }, timeout || 8000);
    pending.set(id, r => { clearTimeout(t); res(r); });
    try { c.postMessage({ id, op, arg }); } catch (e) { pending.delete(id); clearTimeout(t); res({ ok: false, reason: 'host', detail: String(e) }); }
  });
}
function stop() { if (child) { try { child.postMessage({ op: 'stopAll' }); } catch (e) {} } }
function kill() { if (child) { try { child.kill(); } catch (e) {} child = null; } }
function register(getWin) {
  getWinRef = getWin;
  ipcMain.handle('asio-list', (_e, api) => call('list', api, 15000));
  ipcMain.handle('asio-start', (_e, cfg) => call('start', cfg || {}, 15000));
  ipcMain.handle('asio-stop', () => call('stop'));
  ipcMain.handle('asio-info', () => child ? call('info', null, 3000) : null);
  ipcMain.on('asio-port', e => { const p = e.ports[0]; if (!p) return; try { host().postMessage({ op: 'port' }, [p]); } catch (er) {} });
  const hook = () => { const w = getWin(); if (!w) return; w.webContents.on('did-start-loading', stop); w.webContents.on('render-process-gone', stop); w.on('closed', kill); };
  return { hook, stop };
}
module.exports = { register, stop: kill };
