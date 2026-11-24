# ETRANOM V1972

نسخه کامل پروژه با درگاه مرکزی یکپارچه اقدام‌های نبرد برای Solo، Party و PvP.

## فایل اصلی
- `systems/combat/central-combat-runtime-v1972.js`

## مسیرها
- Solo: `game.js` → `dispatchSoloCombatActionV1972` → اجرای فعلی نبرد محلی.
- Party: `PartyCombat` → `dispatchRemoteCombatActionV1972` → RPC نسخه V1969.
- PvP: API اصلی در `index.html` → `dispatchRemoteCombatActionV1972` → RPCهای نسخه V1969.

## مرجع اختیار
- Solo: ذخیره و اجرای فعلی بازی در مرورگر.
- Party: RPC معتبر Supabase؛ رسید idempotency نسخه V1969.
- PvP: RPC معتبر Supabase؛ رسید idempotency نسخه V1969 و مهارت‌های اعتبارسنجی‌شده در سرور.

## اجرای آزمون‌های نسخه
با Node.js و حالت ESM:

`node --experimental-default-type=module --test tests/v1972/central-combat-runtime-integration-v1972.test.mjs`

## نکته مهم
V1972 درگاه اقدام‌ها را یکپارچه می‌کند، اما اتصال سرویس تراکنشی V1968 به PostgreSQL/Supabase و انتقال مرجع Solo به سرور هنوز انجام نشده است. برای این نسخه SQL جدیدی لازم نیست.
