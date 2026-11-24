# طراحی موتور یکپارچه ۴۰ تخصص ETRANOM — نسخه ۱

## ۱) تصمیم معماری قطعی

تمام ۴۰ تخصص (۱۰ کلاس × ۴ تخصص) باید از یک قرارداد داده، یک مجموعه موتور اجرایی مشترک و سه مسیر نبرد سازگار استفاده کنند: `solo`، `party` و `pvp`.

در فاز فعلی فقط ۸ تخصص موجود پیاده‌سازی و تکمیل می‌شوند:
- جادوگر: `wizard_arcane_mage`، `wizard_elementalist`، `wizard_warlock`، `wizard_necromancer`
- جنگجو: `warrior_sword_ascetic`، `warrior_iron_bastion`، `warrior_chaos`، `warrior_apocalypse_harbinger`

۳۲ تخصص آینده فعلاً محتوای اختصاصی نمی‌گیرند؛ اما قرارداد، اعتبارسنجی، رجیستری، ذخیره‌سازی و موتور باید از ابتدا ظرفیت هر ۴۰ شناسه را داشته باشند. افزودن تخصص آینده فقط افزودن داده و در صورت نیاز یک effect handler محدود و ثبت‌شده است؛ نه ساخت چرخه نبرد یا موتور مستقل.

## ۲) مبنای موجود در مخزن

این طراحی با فایل‌های موجود زیر هم‌راستا است:
- `content/classes/CLASS_SPECIALIZATION_CONTRACT_V1.json`
- `content/classes/SPECIALIZATION_NUMERIC_CONTRACT_V1.json`
- `content/classes/SPECIALIZATION_TEMPLATE_V1.json`
- `systems/combat/character-stat-core.js`
- `systems/combat/specialization-contract-runtime.js`
- `systems/combat/specialization-skill-bridge.js`
- `systems/combat/shared-skill-runtime.js`
- `systems/combat/combat-core.js`
- `systems/combat/combat-adapters.js`

قرارداد فعلی همین حالا ظرفیت ۸ کلاس آینده و ۳۲ جایگاه تخصص را اعلام می‌کند و ابعاد محتوایی هر تخصص را ۱۰ مهارت، ۶ ارتقا برای هر مهارت، ۴ شاخه استعداد با ۸ استعداد، ۴ مرحله قلمرو و ۱۰ تعالی تعریف کرده است. آزمون‌های فعلی نیز وجود ۸ تخصص و سه حالت نبرد را بررسی می‌کنند.

نکته مهم: در کد فعلی، `combat-adapters.js` هنوز برای بعضی Runtimeهای جنگجو شرط‌های اختصاصی دارد و چرخه‌های بعضی تخصص‌ها به توابع جداگانه ارجاع می‌دهند. بنابراین قرارداد داده مشترک موجود است، اما جداسازی کامل موتور مشترک از منطق تخصصی هنوز هدف طراحی است و نباید تکمیل‌شده فرض شود.

## ۳) لایه‌بندی هدف

### لایه A — قرارداد و داده (بدون منطق نبرد)
- `SpecializationManifest`: شناسه پایدار کلاس/تخصص، نام، archetype، منبع اصلی/فرعی، نسخه قرارداد.
- `SkillDefinition`: هدف، نوع قراردادی، هزینه، زمان‌بندی، cooldown، اثرها، rank و شش ارتقا.
- `TalentTreeDefinition`: چهار شاخه، پیش‌نیازها، محدودیت امتیاز و اثرهای استاندارد.
- `DomainDefinition`: چهار مرحله، سطح بازشدن، هزینه، مدت، cooldown و قوانین هر حالت نبرد.
- `AscensionDefinition`: ده گزینه؛ انتخاب حداکثر یک گزینه در هر فعال‌سازی قلمرو.
- `ResourceDefinition`: منبع اصلی/فرعی، زمان پرداخت، بازپرداخت و رفتار کمبود منبع.
- `MechanicExtensionDefinition`: معرفی handlerهای خاص تخصص با ورودی/خروجی قراردادی و نسخه مشخص.

### لایه B — موتورهای عمومی
1. `SpecializationRegistry`: بارگذاری و ثبت تخصص‌ها؛ رد شناسه تکراری و manifest ناقص.
2. `ContractValidator`: اعتبارسنجی schema، شمارنده‌ها، ارجاعات، پیش‌نیازها، منابع و سازگاری حالت‌ها.
3. `StatEngine`: فقط از `character-stat-core.js` و archetype مجاز استفاده کند.
4. `SkillEngine`: اعتبارسنجی هدف/سطح/مالکیت/رتبه/منبع/cooldown و ساخت intent استاندارد.
5. `SkillUpgradeEngine`: محاسبه rank و modifier بدون تغییر مستقیم داده پایه.
6. `TalentEngine`: ارزیابی پیش‌نیازها و جمع‌کردن modifierهای استعداد.
7. `DomainEngine`: بازکردن/فعال‌سازی/مصرف مدت/پایان قلمرو و انتخاب تعالی.
8. `AscensionEngine`: انتخاب انحصاری تعالی و اعمال آن فقط در محدوده فعال‌سازی معتبر.
9. `ResourceEngine`: رزرو، پرداخت، بازپرداخت و جلوگیری از کسر دوباره منبع.
10. `CooldownEngine`: شروع cooldown فقط پس از اجرای موفق؛ کاهش دقیقاً یک‌بار در نوبت بازیکن.
11. `StatusEngine`: اعمال، stack/refresh، tick، cleanse، انقضا و پاک‌سازی هنگام مرگ.
12. `ReactionEngine`: واکنش به رویدادهای قراردادی مانند `before_hit`، `after_hit`، `on_kill`، `on_damage_taken`.
13. `MultiHitEngine`: هر ضربه را مستقل resolve کند؛ هدف‌گیری و دفاع/جاخالی هر ضربه طبق policy تعریف‌شده.
14. `SummonEngine`: احضار، سقف تعداد، نوبت/هدف، آسیب، مرگ و پاک‌سازی احضارها.
15. `SpecialEffectEngine`: اجرای effectهای استاندارد و واگذاری effectهای خاص به handlerهای ثبت‌شده.
16. `CombatLifecycleEngine`: ترتیب واحد اعتبارسنجی، پرداخت، اجرا، رویدادها، پایان نوبت و tickها.
17. `CombatResultEngine`: نتیجه نهایی، مرگ/پیروزی، گزارش رویدادها و خروجی بدون وابستگی به UI.

### لایه C — افزونه‌های مکانیکی تخصص

مکانیک خاص حذف نمی‌شود؛ اما به شکل extension محدود اجرا می‌شود. نمونه‌ها:
- Necromancer: legion، souls، corpse recruitment.
- Warlock: pact، debt و هزینه/بازده پیمان.
- Elementalist: elemental state و ترکیب عناصر.
- Arcane Mage: مکانیک‌های arcane.
- Sword Ascetic / Iron Bastion / Chaos Warrior / Apocalypse Harbinger: مکانیک‌های خاص فعلی جنگجو.

هر extension باید فقط از API موتور استفاده کند، شناسه یکتا و نسخه داشته باشد، state خودش را در namespace تخصصی ذخیره کند و نتواند فرمول پایه آمار/آسیب، ترتیب چرخه نبرد یا مالکیت نوبت را بازنویسی کند. اثر خاص باید به eventها و effectهای استاندارد متصل شود.

### لایه D — آداپترهای سه حالت نبرد

`SoloAdapter`، `PartyAdapter` و `PvPAdapter` فقط مسئول تفاوت‌های مجاز همان محیط هستند:
- احراز هویت و مالکیت نوبت/کنش
- دریافت intent و اعتبارسنجی سمت سرور
- دسترسی به snapshot و state معتبر
- policyهای تعادل هر حالت
- ذخیره‌سازی، قفل/همزمانی و جلوگیری از تکرار درخواست
- ثبت نتیجه و پاداش

این آداپترها نباید برای هر تخصص فرمول آسیب یا اجرای مهارت جداگانه داشته باشند. منطق مشترک از موتور مرکزی فراخوانی می‌شود. در PvP هر اثر باید policy سرور داشته باشد؛ اثر ناشناخته یا تأییدنشده باید رد شود، نه اینکه بی‌صدا اجرا شود.

## ۴) چرخه قطعی اجرای مهارت

1. دریافت intent با `mode`، `actorId`، `specializationId`، `skillId`، هدف‌ها و `requestId`.
2. احراز هویت، مالکیت نوبت، مجازبودن کنش و جلوگیری از اجرای تکراری.
3. resolve کردن specialization و skill از Registry؛ عدم اعتماد به داده کلاینت.
4. اعتبارسنجی سطح، مالکیت مهارت، رتبه، پیش‌نیاز، هدف و محدودیت تعداد هدف.
5. ساخت snapshot آمار از StatEngine.
6. جمع modifierهای تجهیزات، استعداد، ارتقا، قلمرو و اثرهای فعال؛ هر modifier دارای source و stacking policy باشد.
7. بررسی منبع و cooldown؛ تا این مرحله هیچ هزینه‌ای کسر نشود.
8. commit هزینه منبع و cooldown طبق قرارداد اتمیک؛ اگر مرحله commit شکست خورد، هیچ اثر نبردی اعمال نشود.
9. اجرای SkillEngine و SpecialEffectEngine؛ آسیب از helper مرکزی `resolveCanonicalSkillDamage` عبور کند.
10. اجرای رویدادهای واکنشی، چندضربه‌ای، احضار و وضعیت‌ها با ترتیب ثابت و قابل ثبت.
11. ارزیابی مرگ/پیروزی پس از هر اثری که می‌تواند هدف را بکشد؛ قبل از نوبت دشمن نتیجه دوباره بررسی شود.
12. تولید CombatResult و ذخیره state توسط آداپتر authoritative همان حالت.

## ۵) ترتیب چرخه نوبت و زمان‌بندی

- cooldown و مدت اثرهای بازیکن با «نوبت بازیکن» سنجیده شوند، مگر اثر صریحاً واحد دیگری تعریف کند.
- tick وضعیت‌ها و cooldown نباید به تعداد هیولاها یا تعداد ضربه‌های یک نوبت وابسته شود.
- در Party، هر هیولای زنده در فاز دشمن حمله مستقل دارد؛ اما duration اثرهای بازیکن فقط یک بار در مرز نوبت مقرر کاهش می‌یابد.
- DoT، پایان اثر و بررسی پیروزی باید ترتیب واحد و تست‌شده داشته باشند.
- یک `turnId`/`lifecycleId` برای idempotency لازم است تا یک نوبت یا tick دوبار اعمال نشود.

## ۶) قرارداد اثر استاندارد

هر effect باید حداقل این فیلدها را داشته باشد:
`id`, `kind`, `source`, `targetSelector`, `base`, `percent`, `flat`, `chancePct`, `durationTurns`, `stackRule`, `refreshRule`, `tickPolicy`, `modePolicy`, `metadata`.

قواعد:
- درصدها واحد مشخص داشته باشند؛ درصد پایه با percentage-point اشتباه نشود.
- stack/refresh صریح باشد؛ پیش‌فرض اثر هم‌کلید refresh است مگر خودش stack را اعلام کند.
- chance بین ۰ تا ۱۰۰ محدود شود.
- duration و cooldown عدد صحیح نامنفی باشند.
- handler ناشناخته، داده ناقص یا mode policy نامعتبر fail-closed شود.
- effectهای چندمرحله‌ای و multi-hit باید هر مرحله را در combat log مستقل ثبت کنند.

## ۷) ذخیره‌سازی و سازگاری نسخه

ساختار پیشنهادی پیشرفت:
`classProgress[specializationId] = { schemaVersion, skillRanks, unlockedTalents, domain, ascensionSelections, resources, cooldowns, statuses, extensionState }`

- داده هر تخصص در namespace خودش قرار می‌گیرد؛ هیچ extension حق تغییر state تخصص دیگر را ندارد.
- مهاجرت از فیلدهای قدیمی در مرز `normalizer/migrator` انجام شود؛ موتور اصلی فقط مدل canonical ببیند.
- migration باید idempotent و دارای backup/rollback باشد.
- `specializationId` یک شناسه canonical و ثابت است؛ alias فقط در لایه مهاجرت/ورودی پذیرفته و بلافاصله canonical شود.
- اختلاف شناسه `warrior_chaos` و `warrior_chaos_warrior` باید پیش از یکپارچه‌سازی نهایی با یک canonical ID حل شود؛ رکورد تکراری ایجاد نشود.

## ۸) اصول عددی و بالانس

- تمام تخصص‌ها از StatEngine و `resolveCanonicalSkillDamage` استفاده می‌کنند.
- هیچ تخصصی ضرایب پایه آمار را override نمی‌کند؛ modifierهای اختصاصی شفاف، افزایشی و محدودشده هستند.
- ترتیب محاسبه از قرارداد عددی موجود پیروی می‌کند: مقدار پایه، rank multiplier، bonus درصدی افزایشی، flat bonus، دفاع/مقاومت هدف، tuning حالت نبرد و floor نهایی.
- تغییر بالانس محتوای یک مهارت باید در داده تخصص باشد؛ تغییر فرمول عمومی فقط با نسخه جدید قرارداد عددی و آزمون regression مجاز است.

## ۹) رابط‌های عمومی پیشنهادی

```js
registry.getSpecialization(specializationId)
registry.getSkill(specializationId, skillId)
validator.validateManifest(manifest)
statEngine.buildSnapshot(actor, manifest)
skillEngine.prepareCast(context)
resourceEngine.reserve(context)
cooldownEngine.validate(context)
effectEngine.resolve(effectContext)
combatLifecycle.execute(intent, authoritativeContext)
combatLifecycle.advanceTurn(turnContext)
resultEngine.finalize(combatState)
```

تمام APIها pure باشند مگر لایه adapter/persistence. هر تغییر state از طریق یک result مشخص برگردد؛ mutation پنهان ممنوع.

## ۱۰) نقشه پیاده‌سازی مرحله‌ای

### مرحله ۱ — تثبیت قرارداد ۴۰ تخصص
- توسعه schema از قرارداد فعلی، بدون شکستن V1.2.0.
- تعریف slot manifest برای ۱۰ کلاس و ۴۰ تخصص؛ ۳۲ مورد آینده با وضعیت `reserved` و بدون محتوای ساختگی.
- تعریف فهرست effectهای استاندارد، eventها، stacking، timing و mode policy.
- canonical ID و alias map.

### مرحله ۲ — ساخت هسته مشترک خالص
- Registry و Validator.
- Resource/Cooldown/Status/Effect engines.
- Skill/Upgrade/Talent/Domain/Ascension engines.
- MultiHit/Summon/Reaction engines.
- Lifecycle و Result engines.

### مرحله ۳ — آداپترها و اتصال بدون تغییر رفتار
- اتصال Solo، سپس Party، سپس PvP.
- ابتدا اجرای shadow/parity در کنار مسیر قدیمی؛ مقایسه خروجی‌ها و combat log.
- حذف شاخه‌های تخصصی از adapter فقط پس از parity و تست.

### مرحله ۴ — مهاجرت ۸ تخصص موجود
- جادوگر چهار تخصص.
- جنگجو چهار تخصص.
- هر مکانیک خاص به extension محدود منتقل شود.
- حفظ درصدها و بالانس فعلی مگر کاربر جداگانه درخواست تغییر دهد.

### مرحله ۵ — آزمون و پذیرش
- contract tests برای هر ۴۰ slot.
- content tests برای ۸ تخصص فعلی.
- parity tests برای هر ۸ تخصص در Solo/Party/PvP.
- lifecycle/idempotency tests.
- آزمون چند هیولا، multi-hit، DoT، summon، revive، shield، evasion، cleanse، death cleanup و rewards.
- امنیت PvP و server-authoritative validation.
- regression tests برای ذخیره/بارگذاری و مهاجرت.

## ۱۱) معیار پذیرش نهایی

- هر ۴۰ تخصص با یک manifest/schema قابل ثبت باشند.
- ۳۲ تخصص رزروشده قابل اعتبارسنجی باشند، بدون اینکه محتوای خیالی برایشان ساخته شود.
- هر ۸ تخصص فعلی از یک SkillEngine و یک lifecycle مشترک عبور کنند.
- Solo/Party/PvP از یک منطق اثر و آسیب استفاده کنند؛ تفاوت‌ها فقط policyهای سروری باشند.
- هیچ تخصصی فرمول پایه یا چرخه نوبت مستقل نداشته باشد.
- تمام effectها قابل audit و در combat log قابل ردیابی باشند.
- تست‌ها ثابت کنند هر lifecycle/tick فقط یک بار اجرا می‌شود.

## ۱۲) وضعیت این سند

این فایل «طراحی معماری» است، نه ادعای پیاده‌سازی. هنوز موتورهای پیشنهادی ساخته، به بازی متصل یا روی Supabase/هاست اجرا نشده‌اند. گام بعدی امن، تثبیت schema و فهرست event/effectها و سپس ساخت Registry/Validator به‌صورت افزایشی و همراه آزمون است؛ بدون حذف یا جایگزینی ناگهانی Runtimeهای فعلی.
