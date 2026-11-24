# موتور مرکزی Effect Resolver و چرخه نبرد — V1956

## هدف

تکمیل لایه اجرایی مشترک برای مهارت‌های ۱۰ کلاس و ۴۰ تخصص، بدون جایگزینی زودهنگام مسیرهای زنده Solo، Party و PvP.

## اجزای افزوده‌شده

- `systems/combat/engines/central-combat-lifecycle-v1956.js`
- `tests/central-combat-lifecycle-v1956.test.mjs`
- export موتور از `systems/combat/engines/index.js`
- بارگذاری تشخیصی ماژول در `index.html` با `window.ETRANOM_CENTRAL_COMBAT_LIFECYCLE`.

## قابلیت‌های موتور مرجع

- دریافت ضربه ورودی با واکنش‌های absorb، reflect، counter و retaliate و جلوگیری از اجرای دوباره آن با requestId.
- اجرای ترتیبی و اتمیک عملیات: damage، heal، shield، apply/remove status، resource gain/drain، modifier، summon، multi-hit، reaction، taunt و revive.
- انتخاب هدف بر اساس scopeهای self، selected target، ordered targets، all live targets، all allies، selected ally و corpses.
- پرداخت هزینه منبع قبل از اجرای effectها؛ سپس اعمال تغییرات منابع طبق ترتیب عملیات.
- ثبت cooldown در پایان موفقیت‌آمیز مهارت.
- جلوگیری از اجرای دوباره درخواست با requestId در state همان نبرد.
- rollback کامل state در صورت شکست هر operation؛ هیچ state نیمه‌اعمال‌شده‌ای برگردانده نمی‌شود.
- چرخه نوبت idempotent با turnId؛ اجرای DoT، کاهش مدت status/modifier/reaction/summon و کاهش cooldown.
- محدودیت ۶۴ operation در هر effect plan و ۱۲ ضربه در هر multi-hit.
- کپی state ورودی؛ تابع‌ها state اصلی فراخواننده را mutate نمی‌کنند.

## مرز اعتماد و اتصال

این نسخه یک موتور مرجع shadow-safe است. `effectCompiler` باید فقط در محیط مورد اعتماد و بر اساس تعریف مهارت سمت سرور ساخته شود. مقدار آسیب، درمان، وضعیت، منابع و سایر پارامترهای effect نباید از payload کلاینت پذیرفته شوند.

در V1956 هنوز برای تمام ۸۰ مهارت effect compiler اختصاصی و تأییدشده ساخته نشده است. این نسخه primitiveهای اجرایی و قرارداد اجرای اتمیک را فراهم می‌کند؛ خودش به‌تنهایی معنای نهایی هر مهارت را تعیین نمی‌کند.

هیچ مسیر زنده نبرد Solo/Party/PvP به این موتور منتقل نشده است. هیچ SQL، migration، تغییر Supabase، GitHub یا هاست در این مرحله اجرا نشده است. برای cutover باید ابتدا effect mapping تمام ۸۰ مهارت، تطبیق عددی هر ۸ تخصص در هر سه حالت و سپس تراکنش واقعی سمت سرور بررسی شود.

## آزمون‌های این مرحله

۱۲ آزمون اختصاصی برای version، اجرای damage، پرداخت هزینه و ترتیب resource gain، shield absorption، heal/status/cleanse/modifier، multi-hit/reaction/taunt/summon، rollback، actor/resource validation، turn tick و idempotency و عدم mutation ورودی.
