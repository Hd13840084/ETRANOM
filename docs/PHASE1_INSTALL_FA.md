# راهنمای فارسی نصب و بررسی مرحله اول ETRANOM

این راهنما مربوط به لایه اجتماعی مرحله اول ETRANOM است. پیش از تغییر مخزن یا پایگاه داده، از نسخه فعلی GitHub و Supabase نسخه پشتیبان تهیه کنید.

## ۱. وضعیت فعلی

اسکریپت SQL اجتماعی مرحله اول در Supabase اجرا شده است. پیام موفقیت مشاهده شده و وجود سه جدول و پنج تابع با پرس‌وجوهای جداگانه تأیید شده است.

این موفقیت به معنی تکمیل آزمون دو حساب یا فعال‌شدن Realtime نیست.

## ۲. فایل SQL

نام فایل:

`phase1_social_security.sql`

این فایل باید در SQL Editor همان پروژه Supabase اجرا شود. نسخه‌ای که اجرا شده، شامل ساخت/تکمیل جدول‌های پروفایل و دوستی، trigger ساخت پروفایل، سیاست‌های RLS و توابع RPC اجتماعی است.

**نکته مهم درباره Realtime:** دستور تغییر جدول داخلی `realtime.messages` در نسخه اصلاح‌شده حذف شده است؛ زیرا حساب SQL Editor مجوز مالکیت لازم برای آن عملیات را نداشت. در نتیجه این اسکریپت به‌تنهایی سیاست کانال خصوصی حضور را پیکربندی نمی‌کند. تنظیم Realtime باید جداگانه و مطابق روش پشتیبانی‌شده Supabase انجام و سپس آزمایش شود.

## ۳. بررسی نتیجه SQL

برای بررسی جدول‌ها این پرس‌وجو را اجرا کنید:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'player_profiles',
    'friend_requests',
    'friendships'
  )
ORDER BY table_name;
```

باید سه ردیف برگردد.

برای بررسی توابع:

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'sync_player_profile',
    'send_friend_request',
    'respond_friend_request',
    'cancel_friend_request',
    'remove_friend'
  )
ORDER BY routine_name;
```

باید پنج ردیف برگردد.

برای مشاهده پروفایل‌های موجود:

```sql
SELECT
    user_id,
    username,
    display_name,
    player_level,
    player_class
FROM public.player_profiles
ORDER BY created_at DESC;
```

## ۴. فایل‌های Markdown

این سه سند را در مخزن GitHub قرار دهید:

- `README.md` — در ریشه مخزن.
- `PHASE1_QA.md` — داخل پوشه `docs`.
- `PHASE1_INSTALL_FA.md` — داخل پوشه `docs`.

ساختار پیشنهادی:

```text
ETRANOM/
├── README.md
├── index.html
├── game.js
└── docs/
    ├── PHASE1_QA.md
    └── PHASE1_INSTALL_FA.md
```

اگر در مخزن `README.md` موجود است، پیش از جایگزینی آن نسخه قبلی را نگه دارید یا تغییرات را با آن ادغام کنید.

## ۵. انتشار فایل‌های اجرایی

این بسته مستندات، جایگزین `index.html` یا `game.js` نیست.

طبق روند یکپارچه‌سازی پروژه، فایل‌های اجرایی را جداگانه و صرفاً بر اساس ZIP نهایی بررسی‌شده جایگزین کنید. در این مرحله فقط اسناد Markdown را می‌توانید در مخزن اضافه یا به‌روزرسانی کنید.

پس از commit در شاخه متصل به Cloudflare Pages، وضعیت deployment را بررسی کنید.

## ۶. نکات امنیتی

- فقط کلید عمومی Supabase (publishable/anon) مجاز است در کد مرورگر قرار بگیرد.
- کلید `service_role` و کلیدهای secret را هرگز در GitHub یا فایل‌های فرانت‌اند قرار ندهید.
- سیاست‌های RLS را برای هر جدول بازبینی کنید.
- عملیات اجتماعی باید از مسیر RPCهای دارای کنترل مالکیت انجام شوند.
- برای نسخه آنلاین نهایی، سطح، کلاس، موجودی، ارز و نتایج مبارزه باید سمت سرور اعتبارسنجی شوند.

## ۷. آزمون پس از نصب

پس از آماده‌شدن نسخه اجرایی یکپارچه، چک‌لیست `docs/PHASE1_QA.md` را با دو حساب مستقل اجرا کنید. مرحله اول تنها زمانی عملیاتی تأیید می‌شود که جست‌وجو، درخواست دوستی، پذیرش/رد، لغو، حذف دوست، کنترل دسترسی و حضور Realtime در سایت زنده آزمایش شده باشند.
