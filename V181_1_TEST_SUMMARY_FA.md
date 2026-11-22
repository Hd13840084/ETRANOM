# خلاصه تست ETRANOM v181.1

- تست‌های متمرکز Wizard / Party / shared catalog: **۲۱ موفق از ۲۱**.
- کل تست‌های خودکار پروژه: **۲۹۲ موفق از ۳۰۹**؛ ۱۷ مورد شکست خورده.
- ۱۷ شکست با خطاهای شناخته‌شده نسخه مبنا یکسان‌اند و در تغییرات v181.1 ایجاد نشده‌اند:
  - `v106 applies 25% enemy stat reduction at shared combat creation`
  - `v106 makes blacksmith crafting resilient to saved recipe formats`
  - `runtime does not pre-apply an extra region-one-only attack nerf`
  - `Legion recruitment still requires a selected eligible corpse and respects capacity`
  - `summoned legion attacks each player turn and enemy damage is routed to summoned guard first`
  - `crafted recipe equipment maps localized slot labels to canonical equipment slots`
  - `tools/tests/ash-forest-camp-map-v90.test.mjs`
  - `tools/tests/battle-manual-finish-v73.test.mjs`
  - `tools/tests/battle-report-regression.test.mjs`
  - `tools/tests/dark-fantasy-city-and-burnt-forest-v116.test.mjs`
  - `tools/tests/dark-fantasy-world-map-v115.test.mjs`
  - `tools/tests/login-warlock-asset-recovery-v125.test.mjs`
  - `tools/tests/material-drop-rate-v51.test.mjs`
  - `tools/tests/monster-xp-by-hp-v1646.test.mjs`
  - `tools/tests/party-battle-scaling-v54.test.mjs`
  - `tools/tests/recipe-distribution-v48.test.mjs`
  - `tools/tests/ui-quests-warlock-v93.test.mjs`
- JavaScript: **۲۹ فایل بررسی شد، صفر خطای نحوی**.
- SQL مهاجرت Party: تمام ۱۰ فایل part-based زیر ۳۰KB.
- ZIP: آزمون سلامت آرشیو بدون خطا.

تست‌ها خودکار و محلی هستند؛ اجرای مهاجرت روی Supabase و نبرد واقعی چندحسابی انجام نشده است.
