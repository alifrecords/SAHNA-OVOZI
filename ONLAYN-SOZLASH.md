# Sahna Ovozi — onlayn tizim: sinov, tariflar, to'lov va admin

Tuzilish **Daftar Azimxodjayev** bilan bir xil: sayt va server — **Cloudflare Pages** (bepul), baza — **D1**, to'lov cheklari — **Telegram bot**, admin sahifaga **GitHub tokeni** bilan kiriladi.

| Qism | Fayl / joy | Vazifasi |
| --- | --- | --- |
| Sayt (PWA) | `web/` | Pult — brauzerda ishlaydi, PC va telefonga "O'rnatish" mumkin |
| Admin | `web/admin.html` → `/admin` | Foydalanuvchilar, to'lovlar, kodlar, karta, tariflar, sinov muddati, bot |
| Server | `functions/api/` | `config`, `license`, `hello` (ochiq) · `admin/*`, `tg/hook` (himoyalangan) |
| O'rnatiladigan dastur | Windows / macOS release | Xuddi shu serverga ulanadi (`https://sahna-ovozi.pages.dev`) |

## Qanday ishlaydi

| Qadam | Kim | Nima bo'ladi |
| --- | --- | --- |
| 1 | Foydalanuvchi | Pultni ochadi — **1 kunlik sinov** boshlanadi (hamma imkoniyat ochiq) |
| 2 | Pult | Qurilma kodi `SO-XXXX-XXXX-XXXX` yaratiladi, serverga holat yuboriladi (admin "Foydalanuvchilar"da ko'radi) |
| 3 | Sinov tugaydi | Pult yopiladi (loyihalar joyida, Bosh sahifadan ochiladi), tarif oynasi chiqadi |
| 4 | Foydalanuvchi | **Telegram orqali to'lash** → bot tarif, karta raqami va summani beradi → pul o'tkazib chek rasmini yuboradi |
| 5 | Bot → Siz | Chek **Tasdiqlash / Rad etish** tugmalari bilan Telegramingizga keladi |
| 6 | Siz | Kartaga tushganini tekshirib **Tasdiqlash** |
| 7 | Server → Pult | Shu qurilmaga imzolangan litsenziya — pult **o'zi faollashadi** (1–2 daqiqa), kod botda ham keladi |

Tariflar (admin sahifada o'zgartiriladi): **Standart** 25 000 so'm / 30 kun — to'liq pult; **Pro** 49 000 so'm / 30 kun — + ASIO / tashqi karta, Audioni sozlash (Maximizer, Normalize, Envelope, Avto balans), quloqchin (monitor) chiqishi.

## 1. Cloudflare Pages loyihasi (bir marta)
1. dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → `SAHNA-OVOZI`.
2. Project name: **`sahna-ovozi`** (manzil `https://sahna-ovozi.pages.dev` bo'ladi — o'rnatilgan dastur shu manzilga ulanadi).
3. Framework: **None** · Build command: **bo'sh** · Build output directory: **`web`** → **Save and Deploy**.

> Nom band bo'lsa boshqa nom bering; keyin pultda 💎 → **Server** tugmasi orqali yangi manzilni kiriting (yoki menga ayting — standart manzilni almashtirib beraman).

## 2. D1 bazasi
Settings → **Bindings** → **Add** → **D1 database** → Variable name: **`DB`** → Daftar ishlatayotgan bazani tanlang (yoki yangisini yarating). Jadvallar `so_` bilan boshlanadi — Daftar jadvallariga (`df_`) tegmaydi. Jadvallar o'zi yaratiladi.

## 3. Imzo kaliti (muhim)
Settings → **Variables and Secrets** → **Add** → nomi **`SAHNA_PRIV`**, turi **Secret**, qiymati: **SAHNA-ADMIN-KALIT.txt** ichidagi matn (to'liq, `{"kty":"EC",…}`).
Kalitni hech qachon GitHub'ga yuklamang. Keyin: **Deployments → Retry deployment**.

## 4. Admin tokeni
github.com/settings/personal-access-tokens → `az-admin` tokeni → **Edit** → *Only select repositories* ga **SAHNA-OVOZI** ni qo'shing → **Contents: Read and write**. Daftar, AZ-ARENA va boshqa admin sahifalardagi bitta token.

## 5. Admin sahifa — `https://sahna-ovozi.pages.dev/admin`
1. Tokenni kiriting.
2. **To'lov kartasi** — raqam, egasi, tizim (UZCARD / HUMO / VISA) → saqlash.
3. **Telegram bot** — @BotFather → `/newbot` (Sahna Ovozi uchun **alohida** bot; Daftar boti boshqa saytga ulangan) → token → **Botni ulash** → **Bog'lash** (havolani telefonda oching, START).
4. **Tariflar** va **Sinov muddati (kun)** — kerak bo'lsa o'zgartiring.

## Admin imkoniyatlari
| Bo'lim | Nima qiladi |
| --- | --- |
| Statistika | Kutilayotgan to'lov, to'lagan, sinovda, bugun kirgan, jami qurilma, oylik va jami tushum |
| Foydalanuvchilar | Har bir qurilma: holat (sinov / faol / tugagan / onlayn), tarif va muddat, birinchi va oxirgi kirish, versiya, platforma, til; **Kod berish** |
| To'lovlar | Chek rasmi, **Tasdiqlash / Rad** |
| Qo'lda kod | Qurilma kodi + tarif → kod (muddat mavjud muddat ustiga qo'shiladi) |
| Berilgan kodlar | Ro'yxat, **Bekor** qilish |
| Telegram buyruqlari | `/kutilayotgan`, `/kod PRO SO-XXXX-XXXX-XXXX`, `/karta 8600… Ism` |

Pultning o'zida 💎 → **Admin** → GitHub tokeni: shu qurilmada hamma imkoniyat ochiladi (token saqlanmaydi).

## Eslatma
- Litsenziya imzolangan va qurilmada **internetsiz** tekshiriladi; internet bo'lmasa ham pult muddati tugaguncha ishlaydi.
- Foydalanuvchi ma'lumotlari (loyihalar, ovozlar) serverga **yuborilmaydi** — faqat qurilma kodi, versiya, platforma, til va litsenziya holati.
- Claude ichidagi (artifakt) nusxa — egasining ko'rib chiqish nusxasi, unda to'lov so'ralmaydi.
- Muammo: "D1 ulanmagan" → 2-bo'lim; "SAHNA_PRIV o'rnatilmagan" → 3-bo'lim, keyin Retry deployment.
