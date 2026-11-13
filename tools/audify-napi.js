// Electron 33 (Node 20) N-API 9 gacha qo'llaydi; audify uchun N-API 8 tayyor ikkiligini o'rnatadi.
// (napi-v10 ikkiligi Electron ichida yuklanishda yiqiladi.)
const { execSync } = require('child_process');
const path = require('path'), fs = require('fs');
const dir = path.join(__dirname, '..', 'node_modules', 'audify');
if (!fs.existsSync(dir)) { console.log('audify yo\'q — o\'tkazib yuborildi'); process.exit(0); }
const bin = path.join(__dirname, '..', 'node_modules', 'prebuild-install', 'bin.js');
execSync('node "' + bin + '" -r napi -t 8 --force --verbose', { cwd: dir, stdio: 'inherit' });
console.log('audify: N-API 8 ikkiligi o\'rnatildi');
