// =============================================================================
//  SAHNA OVOZI — o'rnatiladigan dastur (Windows / macOS / Linux)
//  Azimxodjayev Music
//  Tuzilish AZ MUS kabi: splash ekran -> Bosh sahifa -> pult;
//  baza: Hujjatlar / Sahna Ovozi; .sahna fayllar dasturga bog'langan.
// =============================================================================
const { app, BrowserWindow, Menu, ipcMain, dialog, shell, session, systemPreferences } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;

const APP_NAME = 'Sahna Ovozi';
const VERSION = app.getVersion();
const ROOT = path.join(__dirname, '..');
const ICON = path.join(ROOT, 'Resources', process.platform === 'win32' ? 'icon.ico' : 'icon.png');

app.setName(APP_NAME);
if (process.platform === 'win32') app.setAppUserModelId('com.azimxodjayevmusic.sahnaovozi');
// Ovoz bosishsiz ham ishga tushsin (teatr pulti uchun muhim)
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// --- til (UZ / RU / EN) ---
const TR = {
  'Sahna Ovozi haqida': ['О Sahna Ovozi', 'About Sahna Ovozi'],
  'Chiqish': ['Выход', 'Quit'],
  'Fayl': ['Файл', 'File'],
  'Bosh sahifa': ['Главная', 'Home'],
  'Yangi loyiha…': ['Новый проект…', 'New project…'],
  'Ochish…': ['Открыть…', 'Open…'],
  'Loyihalar': ['Проекты', 'Projects'],
  'Saqlash': ['Сохранить', 'Save'],
  'Boshqacha saqlash…': ['Сохранить как…', 'Save as…'],
  'Hujjatlar / Sahna Ovozi papkasini ochish': ['Открыть папку Документы / Sahna Ovozi', 'Open Documents / Sahna Ovozi folder'],
  'Savat': ['Корзина', 'Trash'],
  'Tahrir': ['Правка', 'Edit'],
  'Bekor qilish': ['Отменить', 'Undo'],
  'Qaytarish': ['Повторить', 'Redo'],
  'Kesish': ['Вырезать', 'Cut'],
  'Nusxa': ['Копировать', 'Copy'],
  'Qo\'yish': ['Вставить', 'Paste'],
  'Hammasini belgilash': ['Выделить всё', 'Select all'],
  'Tahrirlash rejimi': ['Режим редактирования', 'Edit mode'],
  'Ovozlar kutubxonasi': ['Библиотека звуков', 'Sound library'],
  'Profil': ['Профиль', 'Profile'],
  'Ijro': ['Воспроизведение', 'Playback'],
  'GO — keyingi cue (Probel)': ['GO — следующий cue (Пробел)', 'GO — next cue (Space)'],
  'Hammasini to\'xtatish (Esc)': ['Остановить всё (Esc)', 'Stop all (Esc)'],
  'Musiqani so\'ndirish (End)': ['Убрать музыку (End)', 'Fade music (End)'],
  'Atmosferani so\'ndirish (Num *)': ['Убрать атмосферу (Num *)', 'Fade atmosphere (Num *)'],
  'Sahnani so\'ndirish (Num 0)': ['Погасить сцену (Num 0)', 'Fade scene (Num 0)'],
  'Ko\'rinish': ['Вид', 'View'],
  'To\'liq ekran': ['Полный экран', 'Full screen'],
  'Kattalashtirish': ['Увеличить', 'Zoom in'],
  'Kichraytirish': ['Уменьшить', 'Zoom out'],
  'Ekranga moslash': ['Подогнать под экран', 'Fit to screen'],
  'Yordam': ['Справка', 'Help'],
  'Ovoz tekshiruvi': ['Проверка звука', 'Sound check'],
  'Baza va jurnal': ['База и журнал', 'Database and log'],
  'Til': ['Язык', 'Language'],
  'Loyihani saqlash': ['Сохранить проект', 'Save project'],
  'Loyihani ochish': ['Открыть проект', 'Open project'],
  'Sahna Ovozi loyihasi': ['Проект Sahna Ovozi', 'Sahna Ovozi project']
};
let LANG = 'uz';
const langFile = () => path.join(app.getPath('userData'), 'lang.json');
try { const l = JSON.parse(fs.readFileSync(langFile(), 'utf8')).lang; if (['uz', 'ru', 'en'].includes(l)) LANG = l; } catch (e) {}
const tl = s => (LANG === 'uz' || !TR[s]) ? s : TR[s][LANG === 'ru' ? 0 : 1];
ipcMain.on('set-lang', (_e, l) => {
  if (!['uz', 'ru', 'en'].includes(l) || l === LANG) return;
  LANG = l; try { fs.writeFileSync(langFile(), JSON.stringify({ lang: l })); } catch (e) {}
  buildMenu();
});

// --- Hujjatlar / Sahna Ovozi --------------------------------------------------
let BASE = null;
function base() {
  if (!BASE) {
    BASE = path.join(app.getPath('documents'), APP_NAME);
    for (const d of ['', 'ovozlar', 'loyihalar', 'zaxira', 'savat']) fs.mkdirSync(path.join(BASE, d), { recursive: true });
  }
  return BASE;
}
const PROJECT_EXT = /\.sahna(\.zip)?$/i;
function resolveId(id) {
  if (!id || typeof id !== 'object') throw new Error('Noto\'g\'ri yo\'l');
  if (id.abs) {
    const p = path.resolve(String(id.abs));
    if (!PROJECT_EXT.test(p)) throw new Error('Faqat .sahna loyiha fayllari');
    return p;
  }
  const p = path.resolve(base(), String(id.rel || ''));
  const b = path.resolve(base());
  if (p !== b && !p.startsWith(b + path.sep)) throw new Error('Baza papkasidan tashqariga chiqib bo\'lmaydi');
  return p;
}
async function writeAtomic(p, buf) {
  await fsp.mkdir(path.dirname(p), { recursive: true });
  const tmp = p + '.tmp-' + process.pid + '-' + Date.now();
  await fsp.writeFile(tmp, buf);
  await fsp.rename(tmp, p);
}
const toBuf = d => Buffer.from(d instanceof ArrayBuffer ? new Uint8Array(d) : d);

ipcMain.handle('fs', async (_e, op, a, b) => {
  switch (op) {
    case 'mkdir': await fsp.mkdir(resolveId({ rel: a }), { recursive: true }); return true;
    case 'exists': try { await fsp.access(resolveId(a)); return true; } catch { return false; }
    case 'stat': try { const s = await fsp.stat(resolveId(a)); return { size: s.size, mtime: Math.round(s.mtimeMs) }; } catch { return null; }
    case 'list': {
      const dir = resolveId({ rel: a });
      const out = [];
      for (const e of await fsp.readdir(dir, { withFileTypes: true })) {
        if (e.name.includes('.tmp-')) continue;
        out.push({ name: e.name, isDir: e.isDirectory() });
      }
      return out;
    }
    case 'read': return await fsp.readFile(resolveId(a));
    case 'write': await writeAtomic(resolveId(a), toBuf(b)); return true;
    case 'append': { const p = resolveId(a); await fsp.mkdir(path.dirname(p), { recursive: true }); await fsp.appendFile(p, toBuf(b)); return true; }
    case 'remove': await fsp.rm(resolveId(a), { recursive: true, force: true }); return true;
  }
  throw new Error('Noma\'lum amal: ' + op);
});

ipcMain.handle('dlg-save', async (e, name) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  const safe = String(name || 'Loyiha.sahna').replace(/[\\/:*?"<>|]/g, '-');
  const r = await dialog.showSaveDialog(win, {
    title: tl('Loyihani saqlash'),
    defaultPath: path.join(base(), 'loyihalar', PROJECT_EXT.test(safe) ? safe : safe + '.sahna'),
    filters: [{ name: tl('Sahna Ovozi loyihasi'), extensions: ['sahna'] }]
  });
  if (r.canceled || !r.filePath) return null;
  return PROJECT_EXT.test(r.filePath) ? r.filePath : r.filePath + '.sahna';
});
ipcMain.handle('dlg-open', async e => {
  const win = BrowserWindow.fromWebContents(e.sender);
  const r = await dialog.showOpenDialog(win, {
    title: tl('Loyihani ochish'), defaultPath: path.join(base(), 'loyihalar'), properties: ['openFile'],
    filters: [{ name: tl('Sahna Ovozi loyihasi'), extensions: ['sahna', 'zip'] }]
  });
  return r.canceled || !r.filePaths[0] ? null : r.filePaths[0];
});
ipcMain.handle('reveal', (_e, id) => { shell.showItemInFolder(resolveId(id)); return true; });
ipcMain.handle('open-docs', () => shell.openPath(base()));
ipcMain.on('version', e => { e.returnValue = VERSION; });
ipcMain.handle('info', () => ({ version: VERSION, docs: base(), platform: process.platform }));

// --- .sahna fayl bilan ochish ------------------------------------------------
let launchFile = findProjectArg(process.argv);
function findProjectArg(argv) { return (argv || []).slice(1).find(a => PROJECT_EXT.test(a) && fs.existsSync(a)) || null; }
ipcMain.handle('launch-file', () => { const f = launchFile; launchFile = null; return f; });

// --- oynalar ------------------------------------------------------------------
let splash = null, win = null, allowClose = false;

function createSplash() {
  splash = new BrowserWindow({
    width: 900, height: 520, frame: false, transparent: true, resizable: false, movable: true,
    alwaysOnTop: true, skipTaskbar: false, show: false, icon: ICON, backgroundColor: '#00000000',
    webPreferences: { preload: path.join(__dirname, 'splash-preload.js'), contextIsolation: true, sandbox: true }
  });
  splash.loadFile(path.join(__dirname, 'splash.html'), { query: { v: VERSION, lang: LANG } });
  splash.once('ready-to-show', () => splash.show());
  splash.on('closed', () => { splash = null; });
}

function createMain() {
  win = new BrowserWindow({
    width: 1440, height: 920, minWidth: 1024, minHeight: 680, show: false, icon: ICON,
    backgroundColor: '#0E0F12', title: APP_NAME,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true,
      nodeIntegration: false, autoplayPolicy: 'no-user-gesture-required', spellcheck: false
    }
  });
  win.loadFile(path.join(ROOT, 'app', 'index.html'));
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) { e.preventDefault(); shell.openExternal(url); } });
  win.on('close', e => { if (allowClose) return; e.preventDefault(); win.webContents.send('close-request'); });
  win.on('closed', () => { win = null; });
  // Agar sahifa javob bermasa ham 25 soniyadan keyin oynani ko'rsatamiz
  setTimeout(showMain, 25000);
}
function showMain() {
  if (!win || win.isVisible()) return;
  win.maximize(); win.show(); win.focus();
  if (splash) { splash.close(); }
}
ipcMain.on('splash', (_e, s) => { if (splash) splash.webContents.send('progress', s); });
ipcMain.on('ready', () => setTimeout(showMain, 350));
ipcMain.on('close-now', () => { allowClose = true; if (win) win.close(); });

// --- menyu (AZ MUS kabi o'zbekcha) ----------------------------------------------
function send(cmd) { if (win) win.webContents.send('menu', cmd); }
function buildMenu() {
  const t = [
    ...(process.platform === 'darwin' ? [{ label: APP_NAME, submenu: [{ label: tl('Sahna Ovozi haqida'), click: () => send('about') }, { type: 'separator' }, { role: 'quit', label: tl('Chiqish') }] }] : []),
    { label: tl('Fayl'), submenu: [
      { label: tl('Bosh sahifa'), accelerator: 'CmdOrCtrl+Shift+W', click: () => send('home') },
      { type: 'separator' },
      { label: tl('Yangi loyiha…'), accelerator: 'CmdOrCtrl+N', click: () => send('new') },
      { label: tl('Ochish…'), accelerator: 'CmdOrCtrl+O', click: () => send('open') },
      { label: tl('Loyihalar'), click: () => send('projects') },
      { type: 'separator' },
      { label: tl('Saqlash'), accelerator: 'CmdOrCtrl+S', click: () => send('save') },
      { label: tl('Boshqacha saqlash…'), accelerator: 'CmdOrCtrl+Shift+S', click: () => send('saveas') },
      { type: 'separator' },
      { label: tl('Hujjatlar / Sahna Ovozi papkasini ochish'), click: () => shell.openPath(base()) },
      { label: tl('Savat'), click: () => send('trash') },
      { type: 'separator' },
      { label: tl('Chiqish'), accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4', click: () => { if (win) win.close(); else app.quit(); } }
    ]},
    { label: tl('Tahrir'), submenu: [
      { role: 'undo', label: tl('Bekor qilish') }, { role: 'redo', label: tl('Qaytarish') }, { type: 'separator' },
      { role: 'cut', label: tl('Kesish') }, { role: 'copy', label: tl('Nusxa') }, { role: 'paste', label: tl('Qo\'yish') }, { role: 'selectAll', label: tl('Hammasini belgilash') },
      { type: 'separator' },
      { label: tl('Tahrirlash rejimi'), accelerator: 'CmdOrCtrl+E', click: () => send('edit') },
      { label: tl('Ovozlar kutubxonasi'), accelerator: 'CmdOrCtrl+L', click: () => send('lib') },
      { label: tl('Profil'), click: () => send('profile') }
    ]},
    { label: tl('Ijro'), submenu: [
      { label: tl('GO — keyingi cue (Probel)'), click: () => send('go') },
      { label: tl('Hammasini to\'xtatish (Esc)'), click: () => send('panic') },
      { type: 'separator' },
      { label: tl('Musiqani so\'ndirish (End)'), click: () => send('musoff') },
      { label: tl('Atmosferani so\'ndirish (Num *)'), click: () => send('atmoff') },
      { label: tl('Sahnani so\'ndirish (Num 0)'), click: () => send('alloff') }
    ]},
    { label: tl('Ko\'rinish'), submenu: [
      { role: 'togglefullscreen', label: tl('To\'liq ekran') },
      { type: 'separator' },
      { label: tl('Kattalashtirish'), accelerator: 'CmdOrCtrl+=', click: () => send('zoomin') },
      { label: tl('Kichraytirish'), accelerator: 'CmdOrCtrl+-', click: () => send('zoomout') },
      { label: '100%', accelerator: 'CmdOrCtrl+0', click: () => send('zoomreset') },
      { label: tl('Ekranga moslash'), click: () => send('zoomfit') },
      { type: 'separator' },
      { label: tl('Til'), submenu: [['uz', 'O\'zbekcha'], ['ru', 'Русский'], ['en', 'English']].map(([k, n]) => ({ label: n, type: 'radio', checked: LANG === k, click: () => { if (win) win.webContents.send('menu', 'lang:' + k); } })) }
    ]},
    { label: tl('Yordam'), submenu: [
      { label: tl('Ovoz tekshiruvi'), click: () => send('diag') },
      { label: tl('Baza va jurnal'), click: () => send('db') },
      { type: 'separator' },
      { label: tl('Sahna Ovozi haqida'), click: () => send('about') }
    ]}
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(t));
}

// --- yagona nusxa: ikkinchi marta ochilsa (yoki .sahna bosilsa) shu oynaga -----
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', (_e, argv) => {
    const f = findProjectArg(argv);
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); if (f) win.webContents.send('open-file', f); }
  });
  app.on('open-file', (e, p) => { e.preventDefault(); if (win && win.isVisible()) win.webContents.send('open-file', p); else launchFile = p; }); // macOS
  app.whenReady().then(() => {
    // Jonli dublaj uchun mikrofon: faqat o'z sahifamizga ruxsat
    session.defaultSession.setPermissionRequestHandler((wc, perm, cb, details) => cb(perm === 'media' && (!details.mediaTypes || details.mediaTypes.every(t => t === 'audio'))));
    session.defaultSession.setPermissionCheckHandler((wc, perm) => perm === 'media');
    if (process.platform === 'darwin') systemPreferences.askForMediaAccess('microphone').catch(() => {});
    base(); buildMenu(); createSplash(); createMain();
    app.on('activate', () => { if (!win) createMain(); });
  });
  app.on('window-all-closed', () => app.quit());
}
