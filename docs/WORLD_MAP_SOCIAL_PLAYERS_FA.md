# بازیکنان آنلاین روی نقشه جهان

- آواتار بازیکنان آنلاین حاضر در همان شناسه منطقه و محدوده دید دوربین روی نقشه نمایش داده می‌شود.
- دورخط سبز برای دوست، طلایی برای هم‌انجمنی و سفید/خاکستری برای سایر بازیکنان است؛ اگر بازیکن هم دوست و هم‌انجمنی باشد، سبز اولویت دارد.
- راهنمای رنگ‌ها روی خود نقشه اضافه شده است.
- موقعیت و مشخصات نمایشی از Supabase Realtime Presence می‌آید؛ Presence صرفاً نمایشی است و برای مجوز، مالکیت، نبرد یا پاداش استفاده نمی‌شود.
- در خطای موقت دریافت روابط، فهرست رابطه‌ای قبلی پاک نمی‌شود؛ خطا ثبت و تازه‌سازی دوره‌ای ادامه می‌یابد.
- با لمس آواتار، کارت عمومی بازیکن باز می‌شود.

## آزمون‌ها
- `node --check game.js` — موفق
- `node --check systems/online/world-presence.js` — موفق
- `node --experimental-default-type=module tools/tests/world-presence-relations.test.mjs` — موفق
- `node --experimental-default-type=module tools/tests/online-presence.test.mjs` — موفق
- `node tools/validate-content.mjs` — موفق
- `node --experimental-default-type=module tools/phase5-marketplace-check.mjs` — موفق
- `node --experimental-default-type=module tools/tests/marketplace-phase5.test.mjs` — موفق
- آزمون رگرسیون قدیمی هنوز هشدار `Legacy skill references remain` را نشان می‌دهد.

تست چندحسابی روی Supabase زنده و مرورگر/گوشی در این محیط انجام نشده است؛ برای دیدن رنگ رابطه‌ها، بازیکنان باید وارد یک نسخه منتشرشده متصل به همان پروژه Supabase و در همان منطقه باشند.
