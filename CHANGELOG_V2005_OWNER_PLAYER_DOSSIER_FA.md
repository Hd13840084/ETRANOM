# ETRANOM V2005 — پرونده بازیکن در پنل Owner

## تغییرات
- افزودن RPC فقط‌خواندنی `etranom_admin_get_player_v1(uuid)` برای دریافت پروفایل، `game_saves.save_data` و وضعیت بن.
- دسترسی فقط برای مدیر دارای مجوز `players`؛ بررسی سمت سرور و ثبت مشاهده در audit log.
- افزودن دکمه «مشاهده پرونده» به فهرست بازیکنان.
- حذف import قدیمی و زودهنگام V2003 از زمان ساخت Supabase client؛ ماژول فقط پس از اجرای موفق بازی بارگذاری می‌شود.
- نسخه cache ماژول به V2005 تغییر کرد.

## مبنای ساخت
ساختار ستون‌ها از خروجی schema موجود بررسی شد: `player_profiles(user_id, username, display_name, player_level, player_class, ...)` و `game_saves(user_id, save_data, updated_at)`.

## محدودیت
این مرحله فقط مشاهده پرونده است. هیچ امکان ویرایش XP، سطح، کلاس، تخصص، ارز، تجهیزات یا موجودی اضافه نشده است. اجرای migration در Supabase و تست زنده انجام نشده؛ ابتدا بکاپ بگیرید و migration جداگانه V2 را اجرا کنید.
