// Sahna Ovozi — oflayn ishlash uchun kesh (Azimxodjayev Music)
const CACHE = 'sahna-ovozi-v4';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// 📥 Android «Ulashish → Sahna Ovozi»: fayllarni IndexedDB ga qo'yamiz, pult ochilganda o'zi oladi
function shareDb() { return new Promise((res, rej) => { const r = indexedDB.open('sahnaOvozi-share', 1); r.onupgradeneeded = () => r.result.createObjectStore('inbox', { keyPath: 'id', autoIncrement: true }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
async function shareSave(files) {
  const db = await shareDb();
  await new Promise((res, rej) => { const tx = db.transaction('inbox', 'readwrite'), st = tx.objectStore('inbox'); for (const f of files) st.add({ file: f, name: f.name, type: f.type, time: Date.now() }); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
}
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method === 'POST' && new URL(req.url).pathname.endsWith('/share-target')) {
    e.respondWith((async () => {
      try { const fd = await req.formData(); const files = fd.getAll('files').filter(f => f && typeof f !== 'string' && f.size); await shareSave(files); return Response.redirect('./?share=' + files.length, 303); }
      catch (err) { return Response.redirect('./?share=err', 303); }
    })());
    return;
  }
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) return; // server va admin — har doim tarmoqdan
  const cacheable = url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!cacheable) return;
  // Sahifa: avval tarmoq (yangilanish uchun), bo'lmasa kesh. Qolganlari: avval kesh.
  if (req.mode === 'navigate') {
    const main = url.pathname === '/' || url.pathname.endsWith('/index.html'); // /kamera, /masofa — o'z nomi bilan
    e.respondWith(fetch(req).then(res => { const c = res.clone(); caches.open(CACHE).then(k => k.put(main ? './index.html' : req, c)); return res; })
      .catch(() => caches.match(main ? './index.html' : req).then(h => h || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok || res.type === 'opaque') { const c = res.clone(); caches.open(CACHE).then(k => k.put(req, c)); }
    return res;
  })));
});
