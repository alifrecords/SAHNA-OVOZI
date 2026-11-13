// ASIO moduli (audify 1.10.1) ni Electron uchun npm'siz tayyorlash:
//  1) audify, bindings, file-uri-to-path paketlarini npm registry'dan (npm pack) olib node_modules ga ochadi;
//  2) N-API 8 tayyor ikkiligini (ASIO/WASAPI/DirectSound bilan) GitHub release'dan yuklaydi.
// Electron 33 (Node 20) N-API 9 gacha qo'llaydi; napi-v10 ikkiligi Electron ichida yiqiladi.
'use strict';
const { execFileSync } = require('child_process');
const path = require('path'), fs = require('fs'), os = require('os'), https = require('https');
const ROOT = path.join(__dirname, '..'), NM = path.join(ROOT, 'node_modules');
const VER = '1.10.1';
const PKGS = [['audify', VER], ['bindings', '1.5.0'], ['file-uri-to-path', '1.0.0']];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'audify-'));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
function sh(cmd, args, cwd) { console.log('> ' + cmd + ' ' + args.join(' ')); execFileSync(cmd, args, { cwd: cwd || ROOT, stdio: 'inherit', shell: process.platform === 'win32' }); }
function untar(tgz, dest, strip) { fs.mkdirSync(dest, { recursive: true }); sh('tar', ['-xzf', tgz, '-C', dest].concat(strip ? ['--strip-components=' + strip] : [])); }
function get(url, file, n) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { 'User-Agent': 'sahna-ovozi-build' } }, r => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location && (n || 0) < 8) { r.resume(); return res(get(r.headers.location, file, (n || 0) + 1)); }
      if (r.statusCode !== 200) { r.resume(); return rej(new Error(url + ' -> ' + r.statusCode)); }
      const w = fs.createWriteStream(file); r.pipe(w); w.on('finish', () => w.close(() => res(file))); w.on('error', rej);
    }).on('error', rej);
  });
}
(async () => {
  for (const [name, v] of PKGS) {
    const dest = path.join(NM, name);
    fs.rmSync(dest, { recursive: true, force: true });
    sh(npm, ['pack', name + '@' + v, '--pack-destination', tmp, '--silent']);
    const tgz = fs.readdirSync(tmp).find(f => f.startsWith(name + '-' + v) && f.endsWith('.tgz'));
    if (!tgz) throw new Error(name + ' tarball topilmadi');
    untar(path.join(tmp, tgz), dest, 1);
  }
  // audify faqat bindings ga tayanadi (qolganlari — yig'ish vositalari); packager prune uchun soddalashtiramiz
  const pj = path.join(NM, 'audify', 'package.json'), p = JSON.parse(fs.readFileSync(pj, 'utf8'));
  p.dependencies = { bindings: '^1.5.0' }; delete p.scripts; delete p.devDependencies;
  fs.writeFileSync(pj, JSON.stringify(p, null, 2));
  for (const d of ['vendor', 'src']) fs.rmSync(path.join(NM, 'audify', d), { recursive: true, force: true });
  const plat = process.platform, arch = process.arch;
  const url = `https://github.com/almoghamdani/audify/releases/download/v${VER}/audify-v${VER}-napi-v8-${plat}-${arch}.tar.gz`;
  const f = path.join(tmp, 'prebuilt.tgz');
  console.log('yuklanmoqda: ' + url); await get(url, f);
  untar(f, path.join(NM, 'audify'));
  const rel = path.join(NM, 'audify', 'build', 'Release'), files = fs.existsSync(rel) ? fs.readdirSync(rel) : [];
  console.log('audify build/Release: ' + files.join(', '));
  if (!files.includes('audify.node')) throw new Error('audify.node topilmadi');
  console.log('audify: N-API 8 ikkiligi tayyor');
})().catch(e => { console.error('XATO: ' + (e && e.message || e)); process.exit(1); });
