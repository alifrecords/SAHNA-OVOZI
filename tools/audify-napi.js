// ASIO moduli (audify) ni Electron uchun tayyorlash.
// Electron 33 (Node 20) N-API 9 gacha qo'llaydi; napi-v10 ikkiligi Electron ichida yiqiladi — shuning uchun N-API 8 ikkiligi o'rnatiladi.
// optionalDependency o'rnatilmay qolsa (prebuild/cmake xatosi) — skriptlarsiz qayta o'rnatib, ikkilikni o'zimiz yuklaymiz.
const { execSync } = require('child_process');
const path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..');
const dir = path.join(ROOT, 'node_modules', 'audify');
const run = (cmd, cwd) => { console.log('> ' + cmd); execSync(cmd, { cwd: cwd || ROOT, stdio: 'inherit' }); };
if (!fs.existsSync(path.join(dir, 'package.json'))) {
  console.log('audify o\'rnatilmagan — skriptlarsiz o\'rnatilmoqda');
  run('npm install audify@1.10.1 --no-save --ignore-scripts --no-audit --no-fund');
}
const bin = path.join(ROOT, 'node_modules', 'prebuild-install', 'bin.js');
run('node "' + bin + '" -r napi -t 8 --force --verbose', dir);
const rel = path.join(dir, 'build', 'Release');
const files = fs.existsSync(rel) ? fs.readdirSync(rel) : [];
console.log('audify build/Release: ' + files.join(', '));
if (!files.includes('audify.node')) { console.error('audify.node topilmadi'); process.exit(1); }
console.log('audify: N-API 8 ikkiligi tayyor');
