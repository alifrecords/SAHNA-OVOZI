# SAHNA OVOZI: teatr va dublaj uchun jonli ovoz pulti
**Azimxodjayev Music** · Windows · macOS · Linux

Spektakl paytida cue'lar (GO), SFX banklar, qatlamli atmosferalar, mikser va obraz ovozi effektlari bilan ishlash uchun dastur. Tuzilishi AZ MUS kabi: o'rnatuvchi `.exe`, ochilish oynasi (splash), Bosh sahifa va Hujjatlar ichidagi baza.

## 1.2.0: masshtab (zoom) · klaviaturadan daraja · cue'larni sudrash

| Bo'lim | Nima qilindi |
|---|---|
| Masshtab | Sarlavhada `− 100% +`: butun oyna 50–200%; foizni bosish — tayyor o'lchamlar va "Ekranga moslash"; Ctrl + g'ildirak — ravon; Ctrl + = / Ctrl + − / Ctrl + 0. Tanlov saqlanadi |
| Ixcham sarlavha | Tugmalar kichraytirildi, 1366 px ekranda bitta qatorga sig'adi; kutubxona — belgi tugma; "O'rnatish" Loyiha menyusiga o'tdi |
| Cue darajasi | ↑ ↓ bilan tanlangan cue: **Num +** / **Num −** — ±1 dB (−30…+12). Cue chalinayotgan bo'lsa ovoz shu zahoti o'zgaradi; qatorda sariq "−4 dB" belgisi; cue muharririda ham slayder |
| Master | **Ctrl + Num +** / **Ctrl + Num −** — Master fader ±1.5 dB |
| Cue tartibi | Cue qatorini sichqoncha bilan ushlab sudrab joyini almashtirish (sariq chiziq — tushadigan joy); JONLI / KEYINGI belgilari o'z cue'si bilan qoladi |

## 1.1.0: audio kesish (AZ-Playlist mexanizmi)

| Bo'lim | Nima qilindi |
|---|---|
| Qayerda | Cue muharriri (✎) va SFX tugmasi muharriri: "Ovoz" tanlangach to'lqin chiqadi |
| Tanlash | To'lqin ustida sariq oyna: chap/o'ng chetini sudrash — boshi/oxiri, o'rtasini sudrash — parchani surish, to'lqinga bosish — o'sha joyga ko'chirish |
| Eshittirish | Chetini sudraganda o'sha joy eshittiriladi (oxiridan 3 s oldin / boshidan 3 s); "▶ Parchani tinglash", "Butun fayl", oq ijro chizig'i |
| Aniqlik | Boshi va oxiri uchun −1s / −0.1 / +0.1 / +1s |
| Fade | Fade-in 0–5 s, Fade-out 0–8 s (oynada uchburchak bilan ko'rinadi), sichqoncha g'ildiragi bilan ham |
| Asl fayl | O'zgarmaydi: kesish cue/tugma sozlamasi sifatida saqlanadi (loyiha faylida ham), loop tugmalar kesilgan oraliqni takrorlaydi |
| Yangi ovoz | "Yangi ovoz qilib saqlash" — kesilgan parcha fade'lar bilan WAV qilib kutubxonaga qo'shiladi va tanlanadi |
| Belgi | Cue qatorida "✂ 0:07.8–0:19.3", tugmada "✂" |

## 1.0.0: birinchi o'rnatiladigan versiya

| Bo'lim | Nima bor |
|---|---|
| O'rnatish | `Sahna-Ovozi-1.0.0-Setup.exe`: Program Files\Azimxodjayev Music\Sahna Ovozi, Pusk menyusi va ish stoli yorlig'i, `.sahna` fayllar dasturga bog'lanadi (ikki marta bosish — dasturda ochiladi) |
| Ochilish oynasi | AZ MUS uslubidagi splash: AUDIO TIZIM → OVOZ KUTUBXONASI → MA'LUMOTLAR BAZASI → LOYIHALAR VA PROFIL → SAHNA OYNASI |
| Bosh sahifa | Profil (rasm, ism, kasb, teatr), "Joriy ish" kartasi, 6 ta shablon, loyiha kartalari (cue turlari rangli chiziqlarda, spektakl, hajm, sana), qidirish va saralash, Savat (tiklash / butunlay o'chirish) |
| Yangi loyiha | Nom, spektakl, parda va shablon: Bo'sh, Namuna spektakl, Dramatik spektakl, Bolalar ertagi, Konsert / tadbir, Dublaj seansi |
| Baza | Hujjatlar / Sahna Ovozi — ruxsat so'ralmaydi: `baza.json` (joriy holat), `ovozlar/`, `loyihalar/`, `zaxira/` (har 10 daqiqada, oxirgi 30 ta), `savat/`, `jurnal.txt` (GO, SFX, tahrirlar, saqlashlar), `profil.json` |
| Loyiha fayli | `.sahna` — ZIP arxiv: cue'lar, banklar, atmosferalar, mikser, dublaj sozlamalari va barcha o'z ovoz fayllari |
| Menyu | Fayl (Bosh sahifa Ctrl+Shift+W, Yangi Ctrl+N, Ochish Ctrl+O, Saqlash Ctrl+S, Boshqacha saqlash Ctrl+Shift+S, Hujjatlar papkasi, Savat) · Tahrir (Tahrirlash rejimi Ctrl+E, Kutubxona Ctrl+L, Profil) · Ijro · Ko'rinish · Yordam |
| Jonli dublaj | 🎙 Jonli mikrofon: aktyor ovozi obraz effektlari (Saroy zali, Dev, Ruh, Telefon, Afsun) orqali real vaqtda Dublaj kanaliga chiqadi |
| Xavfsiz yopish | Saqlanmagan o'zgarish bo'lsa yopishdan oldin so'raydi; ikkinchi marta ochilsa yoki `.sahna` bosilsa — mavjud oynada ochiladi |
| Oflayn | Internet kerak emas: shriftlar va ovoz kutubxonasi dastur ichida |

## Klaviatura
Probel — GO · Esc — hammasini to'xtatish · 1–8, Q W E R, A S D F — SFX · [ ] — bank · ↑ ↓ — keyingi cue · sichqoncha g'ildiragi — fader (Shift — aniq, 2× bosish — 0 dB)

## Yig'ish (GitHub Actions)
`main` ga har push qilinganda `.github/workflows/build.yml`:
1. **Windows**: `npm install` → `npm run pack:win` (Electron) → Inno Setup (`installer/windows/SahnaOvozi.iss`) → `Sahna-Ovozi-<versiya>-Setup.exe`
2. **macOS**: Universal (Intel + Apple Silicon) `Sahna Ovozi.app` → `Sahna-Ovozi-macOS.zip`
3. **Release**: `v<versiya>` tegi bilan GitHub Releases'ga ikkala fayl

Yangi versiya chiqarish: `package.json` dagi `version` va `build.yml` dagi `APP_VERSION` ni bir xil oshiring.

## Pult sahifasini o'zgartirish
Pult kodi `src/template.html` da, ovoz kutubxonasi `src/sounds/` da. O'zgartirgandan keyin:
```
python3 tools/build.py     # app/index.html ni qayta yig'adi
npm start                  # kompyuterda sinash
```
`tools/synth.py` — kutubxonadagi namunaviy ovozlar shu skript bilan sintez qilingan (haqiqiy yozuvlar emas). O'z sample'laringizni dasturda ↑ tugmasi yoki kutubxona orqali qo'ying.

## Tuzilish
```
electron/main.js       oynalar, menyu, Hujjatlar bazasi, .sahna ochish, mikrofon ruxsati
electron/preload.js    pult uchun xavfsiz ko'prik (faqat Hujjatlar/Sahna Ovozi va .sahna fayllar)
electron/splash.html   ochilish oynasi
app/index.html         pult (yig'ilgan), app/fonts — Inter (SIL OFL)
installer/             Windows (Inno Setup) va macOS
src/, tools/           pult manbasi va yig'ish skriptlari
```
