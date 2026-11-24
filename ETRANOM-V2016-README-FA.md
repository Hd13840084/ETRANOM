# ETRANOM V2016 — Secure Account Operations & Server Ban Gates

## این نسخه چه چیزی را تکمیل می‌کند؟
- عملیات بن/رفع بن از پنل دیگر فقط یک ردیف دیتابیس را تغییر نمی‌دهد؛ از Edge Function امن با Service Role انجام می‌شود.
- Edge Function ابتدا JWT را اعتبارسنجی و نقش مدیر را بررسی می‌کند؛ شناسه Owner اصلی از هدف بن مستثنا است.
- بن Auth، خروج سراسری نشست‌ها و ثبت رکورد/گزارش مدیریتی انجام می‌شود. اگر مرحله ثبت دیتابیس شکست بخورد، تلاش جبرانی برای بازگردانی وضعیت Auth انجام می‌شود.
- مدت بن قابل انتخاب است: عدد ساعت ۱ تا ۸۷۶۰۰، یا خالی برای بن دائمی.
- تابع `etranom_assert_player_access_v11` در هشت RPC حساس Guild، Market، Party و PvP فراخوانی می‌شود تا توکن قدیمی به‌تنهایی برای ادامه عملیات کافی نباشد.
- Trigger دیتابیسی از تنزل رتبه، حذف یا جابه‌جایی رکورد Owner جلوگیری می‌کند.

## فایل‌های جدید
- `supabase/functions/etranom-admin-user-access/index.ts`
- `database/admin/etranom_owner_control_v11_auth_ban_and_owner_guard.sql`

## راه‌اندازی Edge Function
در پروژه Supabase، متغیرهای استاندارد `SUPABASE_URL`، `SUPABASE_ANON_KEY` و `SUPABASE_SERVICE_ROLE_KEY` باید در محیط Functions تنظیم باشند. Service Role هرگز نباید در `index.html` یا JavaScript کلاینت قرار بگیرد.

Deploy function با نام `etranom-admin-user-access` و سپس V11 را در محیط staging اجرا کن. V11 پس از V1 تا V10 و پس از migrationهای Party، PvP، بازار و Guild لازم است.

## تست‌های دستی staging
1. Owner وارد پنل شود و یک حساب آزمایشی را با مدت ۱ ساعت بن کند.
2. بررسی کن رکورد `etranom_player_bans` فعال شده، حساب Auth محدود شده و نشست‌های Refresh باطل شده‌اند.
3. با توکن قدیمی همان بازیکن تلاش کن `etranom_market_list`, `etranom_market_buy`, `create_party`, `invite_party_member`, `etranom_pvp_challenge` و `etranom_guild_create` را صدا بزنی؛ باید `PLAYER_BANNED` بگیری.
4. رفع بن کن و ورود مجدد را آزمایش کن.
5. تلاش برای بن کردن Owner و تنزل نقش Owner باید رد شود.
6. نقش مدیر فاقد `players` باید پاسخ 403 بگیرد.

## محدودیت‌های صریح
- در این محیط به Supabase متصل نشده‌ایم؛ SQL و Edge Function روی پروژه زنده اجرا یا deploy نشده‌اند.
- JWT دسترسی‌ای که قبلاً صادر شده ممکن است تا انقضای کوتاه‌مدت خود از نظر بعضی endpointهای خارج از هشت RPC محافظت‌شده قابل اعتبارسنجی باشد؛ global sign-out و ban مانع refresh/sign-in می‌شوند، اما برای همه RPCهای دیگر بازی باید همین guard اضافه شود.
- عملیات ban نیازمند deploy واقعی Edge Function و تنظیم secrets در Supabase است.
- این مرحله تکمیل نهایی همه ابزارهای مدیریت محتوا/آمار و تمام runtimeها نیست؛ فقط لایه امنیت حساب و guardهای مشخص‌شده را تکمیل می‌کند.
