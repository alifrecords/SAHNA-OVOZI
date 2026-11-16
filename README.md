# SAHNA OVOZI: teatr va dublaj uchun jonli ovoz pulti
**Azimxodjayev Music** · Windows · macOS · Linux

Spektakl paytida cue'lar (GO), SFX banklar, qatlamli atmosferalar, mikser va obraz ovozi effektlari bilan ishlash uchun dastur. Tuzilishi AZ MUS kabi: o'rnatuvchi `.exe`, ochilish oynasi (splash), Bosh sahifa va Hujjatlar ichidagi baza.

## 1.18.0: 🎛 Dublaj plaginlari

Dublaj paneliga **🎛 Plaginlar** tugmasi qo'shildi (obraz presetlari o'zgarmadi). Zanjir: mikrofon / dublaj fayli → obraz preseti → **plaginlar** → AZ VERB → Dublaj fader.

| Plagin | Parametrlar |
|---|---|
| 🔇 Shovqin darvozasi | ostona, qo'yib yuborish |
| 🎤 Ton (pitch) | ±12 yarim ton, aralash |
| 🎛 Filtr | HP 20–1500 Hz, LP 1–20 kHz, 12/24/36/48 dB/okt |
| 📊 Ekvalayzer | bas 120 Hz, loyqalik 400 Hz, aniqlik 3 kHz, havo 10 kHz (±12 dB) |
| 🐍 De-esser | chastota 3–10 kHz, ostona (Linkwitz–Riley ajratish) |
| 🗜 Kompressor | ostona, nisbat, hujum, qo'yib yuborish, kuchaytirish |
| 🔥 Saturatsiya | drive, lampa / lenta / qattiq, aralash |
| 📞 Telefon / Radio | eski telefon, mobil (GSM), racija, radio AM, megafon, domofon · polosa, buzilish, kodek, liniya shovqini |
| 🤖 Robot / Ring | chastota, aralash |
| 🔁 Aks-sado | vaqt, qaytish, ton, aralash |

Tayyor presetlar: Toza, Eski telefon, Mobil, Racija, Radio AM, Megafon, Domofon, Robot, Diktor (studiya), Uzoqdan, Ichki ovoz + o'z presetlaringizni saqlash. Kirish / chiqish o'lchagichi, GR, A/B chetlab o'tish. Sozlamalar spektakl bilan (.sahna) saqlanadi.

## 1.17.2: Videolar papkasi va yozuvni video bilan eshitish

| Bo'lim | Nima qilindi |
|---|---|
| 📁 Papka | Papkani ochish (yoki sudrab tashlash) — ichidagi barcha videolar ro'yxat bo'ladi; 📂 bilan bir nechta video tanlansa ham ro'yxat |
| ⏮ ⏭ | Ro'yxatda — oldingi / keyingi video (⏮ video boshida bosilsa — oldingisi); ro'yxatdan tanlash ham mumkin |
| Belgilar | Har bir videoning belgilari o'ziga saqlanadi; take'lar ro'yxatida shu videoniki ko'rinadi |
| 🎧 Video bilan eshitish | Video ▶ bosilganda tanlangan take ham o'sha joydan sinxron chaladi; pauza, o'tkazish, loop, tezlikka ergashadi; chiqish kechikishi qoplanadi; yozuvga tushmaydi (ustidan yangi take yozish mumkin) |

## 1.17.1: Video loop tuzatildi

| Bo'lim | Nima qilindi |
|---|---|
| ⟲ Loop | I / O belgilanmagan bo'lsa — butun video takrorlanadi; I va O bo'lsa — o'sha oraliq; faqat I — I dan oxirigacha, faqat O — boshidan O gacha |
| Video | Brauzerning video ustidagi «kichik oyna / translyatsiya» belgilari o'chirildi |

## 1.17.0: 🎬 Video ovozlashtirish (pultga qo'shimcha)

Pultning ko'rinishi o'zgarmadi — sarlavhaga faqat **🎬 Video** tugmasi qo'shildi.

| Bo'lim | Nima qiladi |
|---|---|
| Oyna | Alohida oyna — boshqa monitor / proyektorga sudrab olib boriladi (⇲ bilan pult ichiga suriladigan panel bo'lib qaytadi). Desktop dasturda ham alohida oyna |
| Video | 📂 yoki istalgan joydan sudrab tashlash: MP4, MOV, MKV, WEBM, AVI, M4V, MPEG, 3GP… (brauzer kodeki qo'llamasa — sababi bilan xabar). Vaqt kodi (fps tanlanadi), subtitr .srt / .vtt |
| Transport | Play (Probel / K), ±5 s (J / L), kadr (, .), loop I → O, tezlik 0.5× / 1× / 1.5× (ton o'zgarmaydi), video ovozi, DUCK, to'liq ekran |
| Belgilar | M — belgi; video ijrosida bosilgan SFX / GO o'zi belgiga aylanadi; ⇢ Cue ro'yxatiga |
| ● REC | Pult chiqishi (limiterdan keyin) o'z ichiga yoziladi: **Master** yoki **Master + stemlar** (Atmosfera, SFX, Musiqa, Dublaj, Mikrofon). Video bilan sinxron, count-in 3·2·1, punch I → O, kechikish kompensatsiyasi (avto) |
| Take'lar | Har yozuv saqlanadi, ⭐ eng yaxshisi, ▶ video bilan tinglash |
| Vaqt chizig'i | Video kadrlari, belgilar, I/O, video ovozi, yozilgan master va stemlar; bosib / sudrab o'tish |
| Eksport | WAV 48k/24-bit (video 00:00 dan — DAW'da 0 ga qo'ysa sinxron), Stemlar ZIP + belgilar.csv, 🎞 Videoga birlashtirish (MP4 / WEBM, real vaqtda) |
| Pult tugmalari | Video oynasida bosilgan SFX / Num / End tugmalari pultga o'tadi |
| Saqlash | Documents bazasi ulangan bo'lsa — `yozuvlar/` papkasiga |

## 1.16.0: Administrator bilan yozishma, fikr va takliflar

| Bo'lim | Nima qilindi |
|---|---|
| Pult | Sarlavhada **✏ Administrator** tugmasi → kichik chat oynasi: savol, fikr, taklif yozish va admin javoblarini o'qish. Yangi javob kelsa tugma **miltillaydi** va soni ko'rinadi |
| 💎 oynasi | **💡 Fikr va takliflar** maydoni (to'lovdan oldin ham) + yozishmani ochish |
| Admin sahifa | **💬 Xabarlar** bo'limi: suhbatlar ro'yxati (ism, qurilma, tarif, o'qilmaganlar), suhbat va javob yozish (Ctrl+Enter), ✓✓ o'qildi belgisi; har 20 soniyada yangilanadi |
| Telegram | Bot ulangan bo'lsa yangi xabar shaxsiy Telegram'ingizga keladi; xabarga **Reply** qilib yozsangiz — javob o'sha pultga boradi |
| Xavfsizlik | Har bir qurilmaning yozishma kaliti bor — qurilma kodini bilgan boshqa odam yozishmani o'qiy olmaydi; soatiga 30 ta xabar chegarasi |

## 1.15.0: Qurilma kodini adminga to'g'ridan-to'g'ri yuborish

| Bo'lim | Nima qilindi |
|---|---|
| Pult (💎 oynasi) | **📨 Qurilma kodini adminga to'g'ridan-to'g'ri yuborish**: qurilma kodi, to'lov kartasi, tarif, ism, telefon, izoh → **Adminga yuborish**. Chek rasmi shart emas |
| Server | `/api/pay` chek rasmisiz «so'rov» qabul qiladi (bir qurilmadan 3 tagacha kutilayotgan) |
| Admin sahifa | So'rov «To'lovlar»ga **📨 so'rov** belgisi bilan tushadi (ism · telefon · izoh) → **Tasdiqlash** → shu qurilmaga kod, pult o'zi faollashadi |
| Telegram | Bot ulangan va admin chati bog'langan bo'lsa — shaxsiy Telegram'ingizga «📨 Qurilma kodi so'rovi» **Tasdiqlash / Rad etish** tugmalari bilan keladi |

## 1.14.0: Barcha qurilmalarga o'rnatish va qurilmadagi baza

| Qurilma | O'rnatish (sarlavhadagi ⬇ tugma) | Ma'lumotlar bazasi |
|---|---|---|
| Kompyuter (Chrome / Edge) | «⬇ Hozir o'rnatish» yoki manzil satridagi ⊕; yoki **Windows Setup.exe / macOS** dasturi (Release'dan) | Birinchi ochilishda **Documents/Sahna Ovozi** papkasi yaratiladi: baza.json, ovozlar/, loyihalar/, zaxira/, jurnal.txt |
| Windows / macOS dasturi | Setup.exe | Documents/Sahna Ovozi o'zi (avvalgidek) |
| iPad / iPhone (Safari) | Ulashish □↑ → «Bosh ekranga qo'shish» | Ilovaning doimiy xotirasi (Apple Documents'ga yozishga ruxsat bermaydi); zaxira — 💾 Saqlash → Fayllar → Yuklanmalar |
| Android (Chrome) | «⬇ Hozir o'rnatish» yoki ⋮ → «Ilovani o'rnatish» | Ilovaning doimiy xotirasi; zaxira — 💾 Saqlash → Yuklanmalar (Download) |

O'rnatilgan ilova ochilganda tugma yashirinadi; doimiy saqlash (persistent storage) so'raladi.

## 1.13.1: Cue ustiga 2 marta bosib ovozni almashtirish

| Bo'lim | Nima qilindi |
|---|---|
| Sahnalar ketma-ketligi | Planshet / telefon rejimida cue ustiga **2 marta** bosish: musiqa, SFX va dublaj cue'larida — **📱 Qurilmadan musiqa / sample tanlash** yoki kutubxonadan (▶ bilan tinglab) tanlash; atmosfera cue'larida — qatlamlar muharriri (+ Fayldan qatlam, har qatlamni almashtirish) |
| Loyiha paneli | Planshet / keng ekranda sarlavhaga, spektakl nomi yoniga ixcham tugmalar (🎵 💾 📤 📂) bo'lib joylashdi — pult tartibini buzmaydi; telefonda alohida ixcham qator |

## 1.13.0: Telefon va planshetda loyiha va fayllar

| Tugma | Nima qiladi |
|---|---|
| 🎵 Ovoz qo'shish | Telefon xotirasidan bir yo'la bir nechta musiqa / ovoz (MP3, WAV, M4A, AAC, OGG, FLAC). «Telefondan» guruhiga tushadi; tanlangan SFX tugma bo'sh bo'lsa, birinchisi o'shanga qo'yiladi |
| 💾 Saqlash | Butun pult (cue'lar, SFX, atmosferalar, mikser, barcha ovoz fayllari) bitta `.sahna` faylga — telefonning «Yuklanmalar» papkasiga |
| 📤 Yuborish | Telefonning «Ulashish» oynasi orqali Telegram, WhatsApp, e-pochta va h.k.ga. Android `.zip` ni qabul qilmasa — `.sahna.txt` nomi bilan (ichi o'sha loyiha) |
| 📂 Ochish | `.sahna`, `.sahna.zip` yoki `.sahna.txt` faylni ochib, ishni davom ettirish (o'z telefonida ham, boshqa telefon / kompyuterda ham) |
| Avto | Ish telefon xotirasida o'zi saqlanadi; telefondan qo'shilgan ovozlar tugmaga qo'yilmagan bo'lsa ham loyiha fayliga kiradi |

## 1.12.2: Android va iPhone telefonlar

| Bo'lim | Nima qilindi |
|---|---|
| Yoqilishi | Sensorli telefonda ham planshet rejimi o'zi yoqiladi (📱 bilan o'chirsa bo'ladi) |
| Pastki panel | Ixcham: **‹** · **GO** · **Musiqa / Sahna so'ndirish** · **■ STOP** |
| Sarlavha | Bitta qatorga yig'ildi va barmoq bilan yonga suriladi |
| Vertikal | Cue ro'yxati ekranning ~46% ida o'z ichida suriladi, SFX tugmalari 2 ustunda |
| Yotqizilgan | Cue ro'yxati chapda, ixcham panel pastda |

## 1.12.1: Planshet rejimi — keng ekran va masshtab

| Bo'lim | Nima qilindi |
|---|---|
| Cue ustuni | Keng ekranda kengroq (300–340 px), nomlar uch qatorga bo'linmaydi |
| Scrollbar | Oq o'rniga ingichka to'q rangli |
| Masshtab | Oyna kichraytirilganda (masalan 75%) cue ustuni ekran balandligigacha to'g'ri cho'ziladi |

## 1.12.0: iPad va planshet rejimi

| Bo'lim | Nima qilindi |
|---|---|
| Yoqilishi | Sensorli planshetda (iPad, Android) o'zi yoqiladi; sarlavhadagi **📱** tugma bilan qo'lda yoqish / o'chirish (eslab qoladi) |
| Pastki panel | Doimiy: **‹** orqaga, katta **GO** (keyingi cue nomi bilan), **Atmosfera / Musiqa / Sahna so'ndirish**, **■ STOP** — sahifa qayerga surilsa ham ko'rinib turadi |
| Ekran | **☀ Ekran yoniq** — spektakl paytida ekran o'chmaydi (Wake Lock; iOS 16.4+ va Android Chrome) |
| Gorizontal | Cue ro'yxati chapda yopishgan va o'z ichida suriladi; iPad Pro (≥1300 px) da mikser ham yonida |
| Vertikal | Bir ustun, cue ro'yxati ekranning 40% balandligida o'z ichida suriladi |
| Barmoq uchun | Cue qatorlari, o'tish vaqti, Nota, SFX tugmalari va boshqaruvlar kattalashtirildi; ikki marta bosishda sahifa kattalashmaydi |

## 1.11.3: Tanlangan cue ortidan oyna suriladi

| Bo'lim | Nima qilindi |
|---|---|
| Sahnalar ketma-ketligi | ↑ ↓ strelkalar (yoki GO) bilan tanlov qayerga borsa, pult oynasi ham o'sha tomonga silliq suriladi — tanlangan cue doim ko'rinib turadi |

## 1.11.2: So'ndirish tugmalari cue o'tish vaqtiga bog'landi

| Bo'lim | Nima qilindi |
|---|---|
| So'ndirish | «Atmosferani / Musiqani / Sahnani so'ndirish» tugmalari va End, Num /, Num *, Num 0 endi **Sahnalar ketma-ketligi**dagi o'tish vaqti bilan ishlaydi |
| Umumiy vaqt | Markazdagi o'tish vaqti faqat SFX tugmalari (loop kirishi, qayta bosib to'xtatish) uchun qoldi |

## 1.11.1: Cue'lar uchun alohida o'tish (fade) vaqti

| Bo'lim | Nima qilindi |
|---|---|
| Sahnalar ketma-ketligi | Sarlavhada alohida **O'tish (fade) vaqti**: Darhol / 1 / 3 / 5 / 8 s. GO bilan musiqa almashishi va atmosfera kirishi shu vaqt bilan bo'ladi |
| Umumiy vaqt | Markazdagi o'tish vaqti SFX, «so'ndirish» tugmalari va End / Num tugmalari uchun qoladi |
| Saqlash | Spektakl ichida (`.sahna` faylda ham) saqlanadi |

## 1.11.0: Nota moslagich (tonallikka moslash)

| Bo'lim | Nima qilindi |
|---|---|
| Sahnalar ketma-ketligi | Ro'yxat tepasida alohida **🎵 Nota** paneli: tanlangan (keyingi) cue'ning tonalligi, −/+ yarim ton, natija tonallik; cue qatorida `♪+2` belgisi |
| Tezkor effektlar (SFX) | Bo'lim tepasida alohida **🎵 Nota** paneli tanlangan tugma uchun; tugmada `♪+2` belgisi; SFX qulflanganda o'zgarmaydi |
| Aniqlash | Tonallik avtomatik aniqlanadi (xromagramma + Krumhansl profillari), kesilgan parcha bo'yicha; zarba/shovqin ovozlar «?» deb ko'rsatiladi |
| Siljitish | ±12 yarim ton va ±50 sent, **temp o'zgarmaydi** (WSOLA + sifatli resempl). Oldindan tayyorlanadi, GO darhol chaladi |
| Moslash | «Akkompanement tonalligi»ni tanlab — **Moslash** (tanlangan ovoz) yoki **Hammasini moslash** (bo'limdagi barcha tonal ovozlar), eng yaqin yo'l −6…+5, major/minor parallel tonallik hisobga olinadi |
| Saqlash | Siljish cue/tugma ichida saqlanadi — `.sahna` faylga ham tushadi |

## 1.10.2: Oson yo'l — qurilma kodini adminga yuborish

| Bo'lim | Nima qilindi |
|---|---|
| Pult | 💎 oynasida «✉ Chek yuborish qiyinmi? Oson yo'l»: qurilma kodi (va tanlangan tarif) bir tugmada nusxalanadi, **Telegram: @admin** tugmasi xabarni tayyor matn bilan ochadi, telefon raqami |
| Admin | «To'lov kartasi» bo'limida **Aloqa** (Telegram @username, telefon). Kelgan kod bo'yicha «Qo'lda kod berish» → pult ochiq bo'lsa o'zi faollashadi |

## 1.10.1: Tarif tanlash va chekni pultdan yuborish

| Bo'lim | Nima qilindi |
|---|---|
| Tarif tanlash | 💎 oynasida har bir tarifda **Tanlash** (faol bo'lsa — **Shu tarif bilan uzaytirish**: muddat ustiga qo'shiladi) |
| Chek yuborish | Tanlangan tarif summasi va karta raqami, chek rasmi (skrinshot), ism, telefon → **Chekni yuborish** — Telegram botsiz ham ishlaydi |
| Admin | Chek "To'lovlar"ga rasmi bilan tushadi → **Tasdiqlash** → pult o'zi faollashadi; bot ulangan bo'lsa, Telegram'ga ham Tasdiqlash / Rad etish tugmalari bilan keladi |
| Holat | Pultda oxirgi to'lov holati: tekshirilmoqda / rad etildi |
| Server | `SAHNA_PRIV` matni buzilib joylansa ham (aqlli qo'shtirnoq, ko'rinmas belgilar) o'qiladi; noto'g'ri kalit bo'lsa admin sahifada aniq sabab |

## 1.10.0: Onlayn tizim — 1 kunlik sinov, tariflar, to'lov, admin (Daftar tuzilishida)

| Bo'lim | Nima qilindi |
|---|---|
| Sinov | Yangi foydalanuvchi 1 kun hamma imkoniyat bilan ishlaydi (muddatni admin o'zgartiradi) |
| Tariflar | **Standart** 25 000 so'm / 30 kun — to'liq pult; **Pro** 49 000 so'm / 30 kun — + ASIO, Audioni sozlash, quloqchin chiqishi |
| To'lov | 💎 tugmasi → Telegram bot → kartaga o'tkazish → chek → admin tasdig'i → pult **o'zi faollashadi** |
| Admin | `/admin`: foydalanuvchilar, to'lovlar, kodlar, karta, tariflar, sinov muddati, bot |
| Server | Cloudflare Pages (`web/`) + Functions (`functions/api`) + D1 — sozlash: [ONLAYN-SOZLASH.md](ONLAYN-SOZLASH.md) |

## 1.9.0: Takrorlash (loop) tugmalari · SFX qulfi · bir xil ijro

| Bo'lim | Nima qilindi |
|---|---|
| Takrorlash — SFX | Har bir SFX tugmada ↻ tugmasi (pauza va stop yonida): yoqilsa ovoz to'xtatilguncha takrorlanadi, qayta bosish — to'xtaydi. O'ynab turgan ovozda ham ishlaydi: yoqilsa uzilmay takrorga o'tadi, o'chirilsa joriy aylanishni tugatib to'xtaydi |
| Takrorlash — cue | Cue ro'yxatidagi har bir qatorda ↻ belgisi va "Hozir sahnada" nomi yonida katta ↻ tugmasi; klaviatura: **L** — joriy cue takrori |
| SFX qulfi | SFX sarlavhasida **Qulflash** tugmasi: qulflanganda sample almashtirish (◀ ▶, ← →, guruh, papka), sudrab tashlash, fayl yuklash, kesish, daraja (Shift+Num ±), AZ VERB va tahrirlash yopiladi — faqat ijro. Holat loyiha bilan saqlanadi |
| Bir xil ijro | Sichqoncha (tugma, to'lqin, ▶ Tinglash) yoki klaviatura — har qanday holatda ovoz bir xil chiqadi: belgilangan parcha, daraja, fade, AZ VERB va Audioni sozlash |

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
