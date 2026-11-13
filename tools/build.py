# Sahna Ovozi — pult sahifasini yig'ish: src/template.html + src/sounds -> app/index.html
# Ishga tushirish: python3 tools/build.py   (npm run build:web)
import json, base64, os, re
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
t = open(os.path.join(R, 'src', 'template.html'), encoding='utf-8').read()
meta = json.load(open(os.path.join(R, 'src', 'sounds', 'meta.json'), encoding='utf-8'))
meta['atm_hall_tone']['gain'] = 3.0; meta['atm_dawn_breeze']['gain'] = 3.0
assets = {k: base64.b64encode(open(os.path.join(R, 'src', 'sounds', k + '.mp3'), 'rb').read()).decode() for k in meta}
# UZ / RU / EN tarjima lug'ati: src/i18n_dict.tsv (uz \t ru \t en) -> src/i18n.js
d = {}
for l in open(os.path.join(R, 'src', 'i18n_dict.tsv'), encoding='utf-8'):
    p = l.rstrip('\n').split('\t')
    if len(p) != 3 or not p[0].strip(): continue
    k = p[0].strip(); ru, en = p[1].strip(), p[2].strip()
    if ru == '—' and k != '—': ru = ''
    if en == '—' and k != '—': en = ''
    d[k] = [ru, en]
t = t.replace('/*__I18N_JS__*/', open(os.path.join(R, 'src', 'i18n.js'), encoding='utf-8').read().replace('/*__I18N__*/', json.dumps(d, ensure_ascii=False)))
page = t.replace('/*__ASSETS__*/', json.dumps(assets)).replace('/*__META__*/', json.dumps(meta, ensure_ascii=False))
# --- onlayn sayt (Cloudflare Pages, chiqish papkasi: web/) — PWA, server: functions/api ---
import shutil
PWA = '''<meta name="theme-color" content="#0E0F12">
<meta name="description" content="Sahna Ovozi — teatr va dublaj uchun jonli ovoz pulti. Azimxodjayev Music">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Sahna Ovozi">
<title>'''
W = os.path.join(R, 'web')
shutil.rmtree(W, ignore_errors=True)
shutil.copytree(os.path.join(R, 'web-src'), W)
open(os.path.join(W, 'index.html'), 'w', encoding='utf-8').write(page.replace('<title>', PWA, 1))
print('web/index.html:', round(len(page) / 1e6, 2), 'MB')
FONTS = '''<meta http-equiv="Content-Security-Policy" content="default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' data: blob: https://*.pages.dev https://api.github.com">
<style>
@font-face{font-family:Inter;src:url(fonts/InterRegular.otf);font-weight:400}
@font-face{font-family:Inter;src:url(fonts/InterMedium.otf);font-weight:500}
@font-face{font-family:Inter;src:url(fonts/InterSemiBold.otf);font-weight:600}
@font-face{font-family:Inter;src:url(fonts/InterBold.otf);font-weight:700}
@font-face{font-family:'Space Grotesk';src:url(fonts/InterBold.otf);font-weight:500 700}
@font-face{font-family:'JetBrains Mono';src:url(fonts/InterSemiBold.otf);font-weight:500 700}
</style>'''
page = re.sub(r'<link rel="preconnect" href="https://fonts.googleapis.com">\s*<link href="https://fonts.googleapis.com/css2[^"]*" rel="stylesheet">', lambda m: FONTS, page, count=1)
assert 'fonts.googleapis' not in page
open(os.path.join(R, 'app', 'index.html'), 'w', encoding='utf-8').write(page)
print('app/index.html:', round(len(page) / 1e6, 2), 'MB')
