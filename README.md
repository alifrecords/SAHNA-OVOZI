# SAHNA OVOZI: teatr va dublaj uchun jonli ovoz pulti
**Azimxodjayev Music** · Windows · macOS · Linux

Spektakl paytida cue'lar (GO), SFX banklar, qatlamli atmosferalar, mikser va obraz ovozi effektlari bilan ishlash uchun dastur. Tuzilishi AZ MUS kabi: o'rnatuvchi `.exe`, ochilish oynasi (splash), Bosh sahifa va Hujjatlar ichidagi baza.

## 1.8.1: ASIO moduli Windows o'rnatuvchisiga to'g'ri kiritildi

| Bo'lim | Nima qilindi |
|---|---|
| Yig'ish | ASIO moduli (audify, N-API 8) har doim o'rnatiladi va paketda borligi tekshiriladi — 1.8.0 Windows o'rnatuvchisida ASIO ro'yxati bo'sh chiqishi mumkin edi |

## 1.8.0: ASIO (ASIO4ALL v2, M-Audio va boshqalar) · Audioni sozlash

| Bo'lim | Nima qilindi |
|---|---|
| **ASIO** | Yordam → Audio qurilma → **Dvigatel: ASIO drayver**. Kompyuterdagi barcha ASIO drayverlar ro'yxatda: **ASIO4ALL v2**, M-Audio, Focusrite, Steinberg, UAD, RME… |
| ASIO sozlamalari | Chiqish kanallari (1–2, 3–4, …), mikrofon kirishi (dublaj uchun ASIO kirishi), chastota, bufer (drayver bo'yicha / 64…1024), xavfsizlik zaxirasi; holat: kechikish ≈ ms va uzilishlar soni |
| Qanday ishlaydi | Pult Web Audio'da miks qiladi, Master signal AudioWorklet orqali alohida audio jarayonga (RtAudio) uzatiladi va ASIO drayverga yoziladi. Drayver xato bersa — dastur yopilmaydi, ovoz tizim chiqishiga o'tadi |
| **Normalize** | Tanlangan parcha cho'qqisini −0.1 … −12 dBFS ga keltiradi (kerakli kuchaytirish ko'rsatiladi) |
| **Avto balans** | Chap / o'ng kanal farqini (RMS) hisoblab tenglaydi; L−R farqi ko'rsatiladi |
| **Maximizer** | Kuchaytirish 0–18 dB + ship (−0.1 … −3 dB): kompressor-limiter va yumshoq cheklash |
| **Envelope** | To'lqin ostidagi chiziqda nuqtalar: bosish — qo'shish, sudrash — surish, 2× — o'chirish (+6 … −30 dB) |
| Asl fayl | O'zgarmaydi — sozlamalar SFX tugma / cue bilan loyihada saqlanadi; "Yangi ovoz qilib saqlash" ishlov berilgan WAV yaratadi |

## 1.7.0: Audio qurilma (tashqi ovoz kartalari)

| Bo'lim | Nima qilindi |
|---|---|
| Qayerda | **Yordam → Audio qurilma** (Ctrl+Shift+D) yoki OVOZ belgisi → "Audio qurilma…" |
| Asosiy chiqish | Zal karnaylari (Master) uchun qurilma: M-Audio, Focusrite, Behringer, Steinberg UR, UAD, RME va boshqa kartalar — o'ynab turganda ham darhol almashadi |
| Quloqchin (monitor) | ▶ tinglash ovozlari alohida chiqishga (masalan kartaning 3-4 yoki quloqchin chiqishi) — zalga chiqmaydi; "Quloqchinda sinov" |
| Mikrofon kirishi | Kirish qurilmasi va kanal: 1-kirish, 2-kirish yoki stereo (masalan XLR mikrofon 2-kirishda) |
| Kechikish | Past (tavsiya) · Juda past ≈5 ms · 10 / 20 ms · O'rtacha · Yuqori |
| Chastota | Qurilma bo'yicha · 44.1 / 48 / 88.2 / 96 kHz |
| Uzilish | Karta uzilsa — standart chiqishga o'tadi va xabar beradi; qayta ulansa — o'zi qaytadi; tanlov saqlanadi |
| ASIO | Dastur Windows audio tizimi (WASAPI) orqali ishlaydi va ASIO drayverini to'g'ridan-to'g'ri ochmaydi; karta ro'yxatdan tanlanadi. Cubase bilan birga ishlatish uchun Windows'da "Exclusive mode" o'chiriladi |

## 1.6.1: Avto saqlash tugmasi · End va Home

| Bo'lim | Nima qilindi |
|---|---|
| Avto saqlash | Sarlavhada alohida tugma: bir bosishda yoqiladi / o'chiriladi (**Ctrl+Shift+A**). Yashil — ishlayapti, sariq — yoqiq, lekin loyiha hali Ctrl+S bilan faylga saqlanmagan, kulrang — o'chiq. Loyiha menyusidagi belgi bilan bir xil ishlaydi, tanlov saqlanadi |
| **End** | Musiqani so'ndirish (avval Num / edi — u ham ishlayveradi) |
| **Home** | Tanlangan SFX tugmasida pauza; yana bosilsa — shu joydan davom |
| Sarlavha | 1500 px dan tor ekranda ixchamlashadi: masshtab foizi qoladi (bosilsa — o'lchamlar menyusi, Ctrl + g'ildirak), baza va avto saqlash yorliqlari faqat belgi bilan |

## 1.6.0: uch tilli interfeys (UZ · RU · EN) · Numpad bilan so'ndirish

| Bo'lim | Nima qilindi |
|---|---|
| Til tanlash | Sarlavhada, ochilish kartasida va Bosh sahifada **UZ · RU · EN** tugmalari; tanlov saqlanadi, darhol (qayta yuklamasdan) almashadi |
| Nima tarjima qilinadi | Butun pult: tugmalar, oynalar, maslahatlar (title / aria), xabarlar (toast), Bosh sahifa, shablonlar, kutubxona, AZ VERB, ovoz tekshiruvi, tayyor ovoz va cue nomlari; sanalar tanlangan til formatida |
| O'rnatilgan dastur | Menyu (Fayl, Tahrir, Ijro, Ko'rinish, Yordam), saqlash/ochish oynalari va ochilish oynasi (splash) ham tanlangan tilda; **Ko'rinish → Til** menyusi |
| Lug'at | `src/i18n_dict.tsv` — har qatorda `o'zbekcha ⇥ ruscha ⇥ inglizcha`; yangi matn qo'shish uchun shu faylga qator yoziladi |
| **Num /** | Musiqani so'ndirish (fade vaqti bilan; 1.6.1 dan **End** ham) |
| **Num \*** | Atmosferani so'ndirish |
| **Num 0** | Sahnani so'ndirish — atmosfera, musiqa, SFX va dublaj |
| Ko'rinishi | Uchala tugmada `Num /`, `Num *`, `Num 0` belgisi; klaviaturadan bosilganda tugma yonadi; **Ijro** menyusida ham bor |

## 1.5.0: sudrab joylash

| Bo'lim | Nima qilindi |
|---|---|
| Kutubxona → SFX tugma | Ovozlar kutubxonasidagi sample'ni sichqoncha bilan ushlab (⠿) tugma ustiga tashlash — yuklanadi, tanlanadi va eshittiriladi; sudrash paytida kutubxona chetga suriladi |
| Bank orqali | Sudrab borib bank yorlig'i ustida biroz to'xtatilsa — o'sha bank ochiladi, keyin tugmaga tashlanadi |
| Kutubxona → Cue | Sample'ni SFX / Musiqa / Dublaj cue ustiga tashlash — cue ovozi almashadi |
| Tugma ↔ tugma | SFX tugmani boshqa tugma ustiga sudrash — o'rinlari almashadi |
| Kompyuterdan | Fayl tugmaga sudrab tashlansa — avvalgidek yuklanadi |

## 1.4.0: AZ VERB · har bir tugmada pauza/stop · to'lqinda belgilash · jonli gain

| Bo'lim | Nima qilindi |
|---|---|
| **AZ VERB** | D-Verb asosidagi AZ VERB plaginining veb dvigateli: 7 algoritm (Hall, Church, Plate, Room I, Room II, Ambient, NonLin), 16 zavod preseti + 4 teatr preseti, Mix · Decay · Size · Pre-Delay · Diffusion · Damp HF · Low/High Cut · Width · Crystal, so'nish egri chizig'i |
| Har bir ovozga alohida | Nishon: **Dublaj** kanali (mikrofon va dublaj fayllari) · tanlangan **SFX tugma** · tanlangan **Cue** — har birining o'z reverbi, loyihada saqlanadi; yangrab turgan ovozda ham shu zahoti o'zgaradi; tugma/cue'da "R" belgisi |
| O'lchovlar | RT60 aniqligi ±4% (0.6–8 s), algoritmlar orasida balandlik farqi 0 dB, stereo korrelyatsiya ≈0 |
| Pauza / stop | Har bir SFX tugmasida ⏸ (pauza → ▶ shu joydan davom) va ■ (to'xtatish) |
| To'lqinda belgilash | Sample brauzerida to'lqin ustida sudrash — kerakli joyni belgilash (S/E), bosish — shu joydan tinglash, 2× — butun fayl |
| Jonli gain | Gain slayderi yangrab turgan ovozga ham shu zahoti ta'sir qiladi; tugmada dB belgisi; **Shift + Num ±** — tanlangan tugma |

## 1.3.0: AZ BEAT uslubidagi sample brauzer · avtosaqlash · ish joyi saqlanadi

| Bo'lim | Nima qilindi |
|---|---|
| Sample brauzer | SFX tugmalari ostida: tanlangan tugma (bosilgani), **◀ ▶** — guruhdagi oldingi/keyingi sample (yuklanadi va darhol eshittiriladi), "3 / 16 · guruh", guruh tanlash, ▶ Tinglash, ✂ Kesish, Gain; klaviaturada **← →** |
| To'lqin | Tanlangan sample to'lqini, S (boshi) / E (oxiri) belgilari va oq ijro chizig'i — AZ MUS · AZ BEAT kabi |
| Papkadan sample'lar | Kompyuterdagi butun papkani tanlash — barcha audio (300 tagacha) papka nomidagi guruhga qo'shiladi; ◀ ▶ bilan ketma-ket tinglab tanlanadi |
| Avtosaqlash | Cubase kabi: loyiha fayli har 1 / 2 / 5 / 10 daqiqada avtomatik saqlanadi (Loyiha menyusida yoqish va oraliq); nusxalar `zaxira/loyihalar` da (oxirgi 10 ta); bir martalik ovoz yangrayotganda kutadi |
| Ish joyi | Qaysi cue JONLI / KEYINGI, qaysi bank ochiq — bazada va loyiha faylida saqlanadi; boshqa kompyuterda ochilganda shu joydan davom etadi |
| Boshqa kompyuter | Loyiha fayliga tugmalarda ishlatilgan guruhlarning barcha sample'lari ham kiradi — u yerda ham ◀ ▶ ishlaydi |

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
