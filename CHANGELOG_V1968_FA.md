# تغییرات V1968

- افزودن `CentralCombatTurnServiceV1968` برای هماهنگی چرخه نوبت.
- افزودن receipt idempotency برای جلوگیری از اجرای دوباره درخواست در صورت retry.
- الزام قفل/تراکنش سریال‌پذیر از سمت ذخیره‌ساز.
- اتصال اختیاری مهارت‌ها به trusted plan resolver و lifecycle مشترک V1956.
- هماهنگی tick وضعیت‌ها، cooldownها و نتیجه پایان نبرد.
- حفظ executorهای فعلی Solo/Party/PvP به‌عنوان authority تا زمان مهاجرت RPC.
- بدون تغییر SQL، Supabase، GitHub، محتوای دانجن یا برج.
