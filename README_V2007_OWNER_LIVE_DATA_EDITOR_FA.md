# ETRANOM V2007 — ویرایشگر داده‌های زنده Owner

این نسخه یک ویرایشگر واقعی برای ردیف‌های موجود در allowlist جدول‌های Supabase اضافه می‌کند.

## قابلیت‌ها
- مرور ساختار ستون‌های هر جدول و نمایش ستون‌های محافظت‌شده.
- مرور صفحه‌بندی‌شده داده‌های واقعی.
- ویرایش JSON ردیف و ذخیره مستقیم از طریق RPC امن.
- اعتبارسنجی ستون‌ها و نوع داده توسط PostgreSQL.
- ثبت مقدار قبل/بعد و ستون‌های تغییرکرده در audit log.
- دسترسی بر اساس permission مربوط به گروه جدول.

## جدول‌های قابل ویرایش
- بازیکنان: `player_profiles`, `game_saves`, `pvp_player_stats`
- جهان: `etranom_content_regions`, `etranom_content_monsters`, `etranom_content_materials`, `etranom_content_recipes`, `etranom_recipe_drop_catalog`, `etranom_exploration_rewards`
- نبرد/مهارت: `etranom_shared_skill_catalog`, `party_battle_skill_catalog`, `wizard_domain_skill_forms_v1929`
- اقتصاد: `guilds`, `market_listings`

## محافظت‌ها و محدودیت‌ها
- کلید اصلی، شناسه مالک، ستون‌های زمان و ستون‌های انتسابی محافظت می‌شوند.
- حذف و ایجاد ردیف در این نسخه فعال نیست؛ عملیات حساس مالی/تاریخی/پیام‌ها عمداً فقط‌خواندنی باقی مانده‌اند.
- برخی آمار و ویژگی‌های شخصیت در `game_saves.save_data` ذخیره می‌شوند؛ تغییر آن JSON باید با شناخت ساختار ذخیره انجام شود.
- SQL را فقط پس از بکاپ و بعد از V1، V2 و V3 اجرا کنید.
- هنوز روی Supabase زنده اجرا یا آزمایش نشده است. ابتدا روی پروژه آزمایشی اجرا و سناریوها را بررسی کنید.
