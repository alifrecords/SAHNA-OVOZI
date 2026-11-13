// Pult sahifasi uchun xavfsiz ko'prik: faqat Hujjatlar / Sahna Ovozi va tanlangan .sahna fayllar
const { contextBridge, ipcRenderer } = require('electron');
const fsop = (op, a, b) => ipcRenderer.invoke('fs', op, a, b);
const u8 = x => (x instanceof Uint8Array ? x : new Uint8Array(x));

contextBridge.exposeInMainWorld('azNative', {
  isNative: true,
  version: ipcRenderer.sendSync('version'),
  platform: process.platform,
  info: () => ipcRenderer.invoke('info'),
  mkdir: rel => fsop('mkdir', rel),
  exists: id => fsop('exists', id),
  stat: id => fsop('stat', id),
  list: rel => fsop('list', rel),
  read: async id => u8(await fsop('read', id)),
  write: (id, ab) => fsop('write', id, ab),
  append: (id, ab) => fsop('append', id, ab),
  remove: id => fsop('remove', id),
  saveDialog: name => ipcRenderer.invoke('dlg-save', name),
  openDialog: () => ipcRenderer.invoke('dlg-open'),
  reveal: id => ipcRenderer.invoke('reveal', id),
  openDocs: () => ipcRenderer.invoke('open-docs'),
  takeLaunchFile: () => ipcRenderer.invoke('launch-file'),
  splash: (step, text, prog) => ipcRenderer.send('splash', { step, text, prog }),
  ready: () => ipcRenderer.send('ready'),
  closeNow: () => ipcRenderer.send('close-now'),
  setLang: l => ipcRenderer.send('set-lang', l),
  onMenu: cb => ipcRenderer.on('menu', (_e, c) => cb(c)),
  onOpenFile: cb => ipcRenderer.on('open-file', (_e, p) => cb(p)),
  onCloseRequest: cb => ipcRenderer.on('close-request', () => cb())
});
