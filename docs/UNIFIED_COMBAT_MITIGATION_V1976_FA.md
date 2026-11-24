# ETRANOM V1976 — موتور ویژگی‌ها، مقاومت‌ها و اثرات مبارزه

## هدف
این نسخه یک لایه مستقل و قابل توسعه برای نرمال‌سازی ۸ ویژگی، مقاومت انواع آسیب، مقاومت کنترل، اثرات مثبت/منفی، آسیب و درمان تدریجی و پاک‌سازی اثرات اضافه می‌کند.

## ۸ ویژگی canonical
`power`, `speed`, `endurance`, `vitality`, `intellect`, `perception`, `luck`, `faith`.
موتور فقط snapshot نرمال‌شده می‌سازد و مقادیر authored هیولا یا ذخیره شخصیت را بازنویسی نمی‌کند.

## انواع آسیب
`physical`, `magical`, `fire`, `frost`, `lightning`, `poison`, `holy`, `shadow`, `true`.
مقاومت‌ها از ۰ تا ۹۰ درصد clamp می‌شوند. آسیب `true` مقاومت را نادیده می‌گیرد. اگر مقاومت تعریف نشده باشد مقدار آن صفر است؛ بنابراین خروجی آسیب قبلی بدون تغییر باقی می‌ماند.

## کنترل و باس‌ها
کنترل‌های پشتیبانی‌شده: `stun`, `root`, `freeze`, `silence`, `fear`, `taunt`, `slow`, `disarm`.
هر هدف می‌تواند مقاومت یا immunity مستقل داشته باشد. پارامتر `bossControlResistanceFactor` برای تعدیل کنترل باس‌ها و `bossResistanceFactor` برای تعدیل مقاومت آسیب در اختیار adapter معتبر قرار دارد؛ مقدار پیش‌فرض هر دو ۱ است.

## وضعیت‌ها و چرخه نوبت
- وضعیت‌ها دارای شناسه، منبع، مدت، نوع آسیب، DoT/HoT، modifier و سیاست stacking هستند.
- سیاست‌ها: `refresh`, `stack`, `replace`, `strongest`.
- DoT و HoT می‌توانند مقدار ثابت یا درصدی از Max HP باشند.
- `turnToken` اجباری و تکرارپذیری tick در یک نوبت idempotent است.
- پاک‌سازی بر اساس نوع وضعیت قابل محدودکردن است.

## API اصلی
- `normalizeAttributesV1976`
- `normalizeResistanceProfileV1976`
- `mitigateDamageV1976`
- `resolveControlApplicationV1976`
- `applyStatusEffectV1976`
- `tickCombatStatusesV1976`
- `cleanseStatusesV1976`
- `createUnifiedCombatantProfileV1976`

## مرز یکپارچه‌سازی
این نسخه موتور و قرارداد adapter را فراهم می‌کند. این لایه به‌صورت خودکار RPCهای زنده Supabase یا مسیرهای موجود Solo/Party/PvP را جایگزین نمی‌کند. اتصال باید در adapter سمت سرور و با تست برابری خروجی هر mode انجام شود. هیچ SQL در این نسخه اضافه یا اجرا نشده است.
