# گزارش آزمون V1962

- آزمون‌های جدید پلتفرم منطقه امن: ۶ از ۶ موفق.
- کل آزمون‌های پروژه با Node test runner: ۷۵۰ موفق از ۷۵۹؛ ۹ شکست.
- خط مبنای ZIP ورودی V1961 با همان runner: ۷۴۴ موفق از ۷۵۳؛ همان ۹ شکست.
- بنابراین V1962 شش آزمون جدید موفق اضافه کرده و هیچ شکست تازه‌ای نسبت به خط مبنای ورودی ایجاد نکرده است.
- `node --check` برای تمام فایل‌های JavaScript: موفق، بدون خطا.
- اعتبارسنجی JSON برای ۱۱۸ فایل: بدون خطا.
- محتوای فعال Safe Zone در Manifest جدید: صفر entry.
- تأیید کلاس‌ها: ۰ از ۱۰.
- تأیید مناطق خطر: ۰ از ۱۰.
- محتوای جدید شهر: صفر؛ دروازه محتوا بسته است.

## ۹ شکست باقی‌مانده از خط مبنا
1. v106 applies 25% enemy stat reduction at shared combat creation
2. v106 makes blacksmith crafting resilient to saved recipe formats
3. runtime does not pre-apply an extra region-one-only attack nerf
4. game save pipeline has serialized cloud writes, local backup and periodic recovery attempts
5. crafted recipe equipment maps localized slot labels to canonical equipment slots
6. shared modules retain their identities and game entry uses the current cache-buster
7. deployed entry point requests the new cache-busted game module
8. entry point cache-busts the interaction repair
9. V1852 logs the actual target and applied damage

این موارد در V1961 هم با همان runner ناموفق بودند و به پلتفرم جدید Safe Zone مربوط نیستند.

تست مرورگر زنده، Supabase، GitHub و هاست اجرا نشده‌اند. هیچ SQL یا تغییر بیرونی اعمال نشده است.
