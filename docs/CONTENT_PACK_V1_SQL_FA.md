# بسته محتوایی ETRANOM و SQL

## فایل SQL
`database/etranom_content_pack_v1.sql` یک مهاجرت افزایشی برای PostgreSQL / Supabase است. این اسکریپت جدول‌های کاتالوگ محتوای منطقه، مواد، هیولاها، دستورهای ساخت و پاداش اکتشاف را می‌سازد و ۶ محدوده، ۴۲ ماده، ۳۶ دشمن و ۲۶۰ دستور ساخت را ثبت می‌کند.

## روش اجرا
1. از پایگاه داده فعلی Supabase نسخه پشتیبان بگیر.
2. وارد Supabase Dashboard و سپس SQL Editor شو.
3. کل فایل `etranom_content_pack_v1.sql` را اجرا کن.
4. در پایان، تعداد رکوردها را بررسی کن:

```sql
select 'regions' as content, count(*) from public.etranom_content_regions
union all select 'materials', count(*) from public.etranom_content_materials
union all select 'monsters', count(*) from public.etranom_content_monsters
union all select 'recipes', count(*) from public.etranom_content_recipes;
```

انتظار: ۶ محدوده، ۴۲ ماده، ۳۶ دشمن و ۲۶۰ دستور ساخت.

## نکته مهم
این SQL فقط کاتالوگ محتوای مشترک را ایجاد می‌کند و جدول ذخیره شخصیت‌ها یا اقتصاد موجود را تغییر نمی‌دهد. نسخه فعلی بازی هنوز از داده‌های محلی `game.js` برای اجرای مستقیم نبرد و ذخیره بازیکن استفاده می‌کند؛ جدول‌های SQL آینه مشترک محتوا هستند و اتصال خواندن زنده از Supabase در این نسخه فعال نشده است. اجرای SQL برای اجرای آفلاین بازی لازم نیست.
