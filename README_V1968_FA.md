# ETRANOM V1968

این نسخه هماهنگ‌کننده مشترک چرخه نوبت/مهارت/وضعیت/منابع/پایان نبرد را اضافه می‌کند.

- ماژول: `systems/combat/central-combat-turn-service-v1968.js`
- تست: `tests/v1968/central-combat-turn-service-v1968.test.mjs`
- مستندات: `docs/CENTRAL_COMBAT_TURN_SERVICE_V1968_FA.md`

**توجه:** این یک مرز یکپارچه‌سازی backend است. RPCهای زنده Solo/Party/PvP هنوز به آن مهاجرت نکرده‌اند؛ هیچ ادعایی درباره فعال‌شدن موتور مرکزی در سرور زنده وجود ندارد. برای فعال‌سازی باید adapter تراکنشی واقعی Postgres/Supabase و resolverهای معتبر سمت سرور پیاده و جداگانه تست شوند.

محتوای دانجن و برج تغییر نکرده است.
