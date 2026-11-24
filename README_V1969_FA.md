# ETRANOM V1969

نسخه کامل پروژه با درگاه idempotency برای درخواست‌های نبرد Party و PvP.

**مهم:** قبل از اجرای نسخه جدید روی سایت، فایل `database/ETRANOM_V1969_COMBAT_RPC_IDEMPOTENCY_GATEWAY.sql` باید در Supabase اجرا شود. تا قبل از اجرای SQL، کلاینت جدید RPCهای V1969 را پیدا نمی‌کند و نبرد آنلاین اجرا نخواهد شد.

فایل بازگشت در صورت نیاز: `database/ETRANOM_V1969_ROLLBACK.sql`.

جزئیات، محدودیت‌ها و مراحل تست در `docs/COMBAT_RPC_IDEMPOTENCY_GATEWAY_V1969_FA.md` آمده است.
