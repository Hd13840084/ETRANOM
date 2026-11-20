نصب مرحله پنجم بازار آنلاین ETRANOM

این سه فایل باید به ترتیب در SQL Editor اجرا شوند:
1) 01_marketplace_base.sql
2) 02_marketplace_transactions_and_secure_operations.sql
3) 03_marketplace_search_history_and_permissions.sql

هر فایل را جداگانه باز و کامل اجرا کن. تا وقتی اجرای یک بخش با موفقیت تمام نشده، بخش بعدی را اجرا نکن.
اگر قبلاً بخش ۱ و ۲ را با موفقیت اجرا کرده‌ای و فقط بخش ۳ خطا داده، فقط فایل ۰۳ اصلاح‌شده را اجرا کن؛ بخش‌های قبلی را دوباره اجرا نکن.

پیش‌نیاز: جدول‌های public.game_saves و public.player_profiles باید وجود داشته باشند.
قبل از اجرا از دیتابیس نسخه پشتیبان بگیر.
کلید service_role را هرگز در کد بازی یا مرورگر قرار نده.
