# گزارش تحویل V1956 — موتور مرکزی چرخه نبرد

## خروجی

- نسخه: `1956.0.0`
- ماژول: `systems/combat/engines/central-combat-lifecycle-v1956.js`
- تست اختصاصی: `tests/central-combat-lifecycle-v1956.test.mjs`
- مستندات: `docs/CENTRAL_COMBAT_LIFECYCLE_V1956_FA.md`

## آزمون

- موتور پایه V1955 + موتور V1956: ۱۹ آزمون موفق، صفر ناموفق.
- تست کامل مخزن: ۵۶۶ آزمون؛ ۵۵۷ موفق و ۹ ناموفق.
- ۹ شکست کامل مخزن همان assertionهای قدیمی موجود در بسته قبلی‌اند: سه تست v106، تست save safety، تست equipment، سه تست cache-buster/entry-point و تست feedback v1852. شکست جدیدی در آزمون‌های موتور مرکزی ثبت نشد.
- بررسی syntax جاوااسکریپت: ۵۹ از ۵۹ فایل موفق.
- ZIP نهایی با `unzip -t` بررسی شده است.

## محدودیت‌های صریح

این نسخه موتور مرجع shadow-safe است و اجرای زنده نبرد را جایگزین نمی‌کند. برای ۸۰ مهارت موجود هنوز باید effect compilerهای معتبر و اختصاصی ساخته و از نظر اعداد و رفتار در Solo، Party و PvP تطبیق داده شوند. هیچ SQL یا migration اجرا نشده و هیچ تغییری در Supabase، GitHub یا هاست انجام نشده است.
