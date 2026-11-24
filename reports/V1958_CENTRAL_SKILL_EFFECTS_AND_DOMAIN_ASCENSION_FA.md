# تکمیل Effectهای پایه و تعالی قلمرو — V1958

## دامنه

این نسخه برای ۸ تخصص پیاده‌سازی‌شده، ۸۰ مهارت پایه و ۸۰ فرم تعالی‌یافته، پروفایل اثر قابل کامپایل ایجاد می‌کند. تمام مهارت‌ها به قرارداد Effect Plan موتور V1956 متصل شده‌اند و خروجی هر دو فرم از تعریف سمت‌سرور تولید می‌شود.

## اصل اعداد و منبع

- اعداد موجود در تعریف‌های تخصص‌ها و فرم‌های تعالی حفظ شده‌اند؛ نمونه‌های دارای ضرایب صریح در آرکین‌مِیج، المنتالیست و آیرن‌بَستیون از همان مقادیر استفاده می‌کنند.
- برای فرم‌هایی که فایل قبلی فقط نام و شرح کیفی داشته و عدد نداشته است، ضرایب تکمیلی V1958 در پروفایل اختصاصی ثبت شده‌اند. این موارد طراحی توازن جدید هستند، نه داده‌ای که قبلاً در فایل وجود داشته باشد.
- ضرایب مرحله قلمرو جداگانه اعمال می‌شوند؛ فرم پایه در قلمرو هم از پاداش مرحله بهره می‌برد و فرم تعالی علاوه بر آن، از تنظیمات اختصاصی فرم و مرحله استفاده می‌کند.
- فرم تعالی فقط وقتی کامپایل می‌شود که قلمرو فعال باشد و شناسه فرم متعلق به همان مهارت باشد.
- قاعده انتخاب فقط یک فرم تعالی در هر فعال‌سازی همچنان از DomainAscensionEngine V1923 می‌آید؛ کامپایلر این محدودیت را دور نمی‌زند.

## پوشش

- ۸ تخصص فعال
- ۸۰ مهارت پایه
- ۸۰ فرم تعالی‌یافته
- ۴ مرحله قلمرو برای هر تخصص (۳۲ پروفایل مرحله)
- تمام عملیات تولیدشده در فهرست عملیات پشتیبانی‌شده موتور V1956 هستند.

## پروفایل مرحله‌های قلمرو

### wizard_arcane_mage
- مرحله 1: بازشدن سطح 25، مدت 5 نوبت، ضریب اثر 115٪، آمار `{"magicPower":15,"manaRegen":20,"castEfficiency":10,"controlResist":30}`
- مرحله 2: بازشدن سطح 40، مدت 6 نوبت، ضریب اثر 125٪، آمار `{"magicPower":25,"manaRegen":30,"castEfficiency":15,"controlResist":40}`
- مرحله 3: بازشدن سطح 50، مدت 7 نوبت، ضریب اثر 135٪، آمار `{"magicPower":35,"manaRegen":40,"castEfficiency":20,"controlResist":50}`
- مرحله 4: بازشدن سطح 50، مدت 8 نوبت، ضریب اثر 145٪، آمار `{"magicPower":45,"manaRegen":50,"castEfficiency":25,"controlResist":60}`

### wizard_elementalist
- مرحله 1: بازشدن سطح 25، مدت 5 نوبت، ضریب اثر 115٪، آمار `{"magicPower":15,"elementalDamage":10,"elementalResistance":10}`
- مرحله 2: بازشدن سطح 40، مدت 6 نوبت، ضریب اثر 125٪، آمار `{"magicPower":25,"elementalDamage":15,"elementalResistance":15}`
- مرحله 3: بازشدن سطح 50، مدت 7 نوبت، ضریب اثر 135٪، آمار `{"magicPower":35,"elementalDamage":20,"elementalResistance":20}`
- مرحله 4: بازشدن سطح 50، مدت 8 نوبت، ضریب اثر 145٪، آمار `{"magicPower":45,"elementalDamage":25,"elementalResistance":25}`

### wizard_warlock
- مرحله 1: بازشدن سطح 25، مدت 4 نوبت، ضریب اثر 108٪، آمار `{"magicPower":10,"controlResist":10}`
- مرحله 2: بازشدن سطح 40، مدت 5 نوبت، ضریب اثر 114٪، آمار `{"magicPower":15,"controlResist":15}`
- مرحله 3: بازشدن سطح 50، مدت 6 نوبت، ضریب اثر 120٪، آمار `{"magicPower":20,"controlResist":20}`
- مرحله 4: بازشدن سطح 50، مدت 7 نوبت، ضریب اثر 128٪، آمار `{"magicPower":25,"controlResist":25}`

### wizard_necromancer
- مرحله 1: بازشدن سطح 25، مدت 5 نوبت، ضریب اثر 110٪، آمار `{"magicPower":10,"summonPower":10}`
- مرحله 2: بازشدن سطح 40، مدت 5 نوبت، ضریب اثر 115٪، آمار `{"magicPower":15,"summonPower":15}`
- مرحله 3: بازشدن سطح 50، مدت 5 نوبت، ضریب اثر 120٪، آمار `{"magicPower":20,"summonPower":20}`
- مرحله 4: بازشدن سطح 50، مدت 5 نوبت، ضریب اثر 125٪، آمار `{"magicPower":25,"summonPower":25}`

### warrior_sword_ascetic
- مرحله 1: بازشدن سطح 25، مدت 5 نوبت، ضریب اثر 115٪، آمار `{"attack":15,"accuracy":10}`
- مرحله 2: بازشدن سطح 40، مدت 6 نوبت، ضریب اثر 125٪، آمار `{"attack":25,"accuracy":15}`
- مرحله 3: بازشدن سطح 50، مدت 7 نوبت، ضریب اثر 135٪، آمار `{"attack":35,"accuracy":20}`
- مرحله 4: بازشدن سطح 50، مدت 8 نوبت، ضریب اثر 145٪، آمار `{"attack":45,"accuracy":25}`

### warrior_iron_bastion
- مرحله 1: بازشدن سطح 25، مدت 5 نوبت، ضریب اثر 110٪، آمار `{"defense":10,"controlResist":8}`
- مرحله 2: بازشدن سطح 40، مدت 6 نوبت، ضریب اثر 115٪، آمار `{"defense":15,"controlResist":12}`
- مرحله 3: بازشدن سطح 50، مدت 7 نوبت، ضریب اثر 118٪، آمار `{"defense":18,"attack":15}`
- مرحله 4: بازشدن سطح 50، مدت 8 نوبت، ضریب اثر 122٪، آمار `{"defense":22,"attack":20,"controlResist":15}`

### warrior_chaos
- مرحله 1: بازشدن سطح 25، مدت 4 نوبت، ضریب اثر 110٪، آمار `{"attack":10,"controlResist":10}`
- مرحله 2: بازشدن سطح 40، مدت 5 نوبت، ضریب اثر 115٪، آمار `{"attack":15,"controlPower":15}`
- مرحله 3: بازشدن سطح 50، مدت 6 نوبت، ضریب اثر 120٪، آمار `{"attack":20,"linkTransfer":20}`
- مرحله 4: بازشدن سطح 50، مدت 7 نوبت، ضریب اثر 125٪، آمار `{"attack":25,"controlPower":25}`

### warrior_apocalypse_harbinger
- مرحله 1: بازشدن سطح 25، مدت 5 نوبت، ضریب اثر 105٪، آمار `{"skillPower":5,"area":5}`
- مرحله 2: بازشدن سطح 40، مدت 6 نوبت، ضریب اثر 110٪، آمار `{"controlDuration":10}`
- مرحله 3: بازشدن سطح 50، مدت 7 نوبت، ضریب اثر 115٪، آمار `{"skillPower":15,"markPower":15}`
- مرحله 4: بازشدن سطح 50، مدت 8 نوبت، ضریب اثر 120٪، آمار `{"skillPower":20,"ascensionChoice":1}`

## مهارت‌ها و خروجی‌های پایه/تعالی

## wizard_arcane_mage

- **گلوله آرکین** (`arcane_bolt`) — پایه: damage(1300)، apply_status؛ تعالی قلمرو: **گلوله آرکین مطلق** — damage(11600)، apply_status، damage(2900)، apply_status، damage(4640)
- **سپر آرکین** (`arcane_shield`) — پایه: shield(1800)؛ تعالی قلمرو: **سپر جهان آرکین** — shield(18850)، modifier(20)، remove_status
- **انفجار آرکین** (`arcane_explosion`) — پایه: damage(1000)؛ تعالی قلمرو: **انفجار کیهانی** — damage(14500)، damage(3625)، damage(4350)، apply_status
- **لغزش آرکین** (`arcane_blink`) — پایه: reaction(0)، apply_status؛ تعالی قلمرو: **شکاف بی‌نهایت** — reaction(3625)، apply_status، apply_status
- **نشان باستانی** (`ancient_rune`) — پایه: damage(500)، modifier(-20)، apply_status؛ تعالی قلمرو: **حکم باستانی** — damage(4350)، modifier(-20)، apply_status، damage(10150)، modifier(-20)، modifier(-15)، apply_status
- **نیزه منشوری** (`prismatic_lance`) — پایه: damage(1900)؛ تعالی قلمرو: **نیزه منشوری مطلق** — damage(15950)، modifier(-20)، damage(3625)
- **پژواک جادویی** (`arcane_echo`) — پایه: apply_status؛ تعالی قلمرو: **پژواک ابدی** — apply_status
- **چاه گرانشی** (`gravity_well`) — پایه: apply_status، modifier(-15)؛ تعالی قلمرو: **حفره گرانشی مطلق** — apply_status، modifier(-25)، damage(7250)، modifier(-25)
- **اضافه‌بار آرکین** (`arcane_overload`) — پایه: modifier(20)، modifier(10)؛ تعالی قلمرو: **اضافه‌بار خدایان** — modifier(145)، modifier(15)، modifier(44)، modifier(36)، damage(7250)
- **تکینگی** (`arcane_singularity`) — پایه: damage(1500)، damage(3500)؛ تعالی قلمرو: **تکینگی مطلق** — damage(5075)، damage(5075)، damage(21750)، damage(2175)، damage(2175)

## wizard_elementalist

- **گلوله شعله** (`ember_bolt`) — پایه: damage(1500)؛ تعالی قلمرو: **خورشیدِ ویرانگر** — damage(6460)
- **زره یخی** (`frozen_armor`) — پایه: shield(1800)؛ تعالی قلمرو: **زره ابدی بلورین** — shield(7752)
- **صاعقه زنجیره‌ای** (`chain_lightning`) — پایه: damage(1450)؛ تعالی قلمرو: **داوری آسمانی** — damage(4626)
- **گردباد سهمگین** (`tempest`) — پایه: damage(950)، apply_status؛ تعالی قلمرو: **توفان پایان جهان** — damage(4091)، apply_status
- **شکاف زمین** (`earth_rupture`) — پایه: damage(1300)، modifier(-15)؛ تعالی قلمرو: **خشم هسته زمین** — damage(5598)، modifier(-15)
- **موج احیاگر** (`tidal_renewal`) — پایه: heal(2200)، remove_status؛ تعالی قلمرو: **چشمه حیات نخستین** — heal(9474)، remove_status
- **پرتو تطهیر** (`radiant_judgment`) — پایه: damage(2300)، remove_status؛ تعالی قلمرو: **تجلی نور مطلق** — damage(9905)، remove_status
- **زنجیرهای تاریکی** (`darkness_chains`) — پایه: damage(1750)، resource_gain(263)؛ تعالی قلمرو: **بندهای خلأ ابدی** — damage(7536)، resource_gain(1130)
- **هم‌جوشی عناصر** (`elemental_fusion`) — پایه: multi_hit(1200)؛ تعالی قلمرو: **اتحاد هشت بنیاد** — multi_hit(5168)
- **فاجعه بنیادین** (`primordial_cataclysm`) — پایه: damage(2160)، damage(4800)؛ تعالی قلمرو: **رستاخیز عناصر نخستین** — damage(15312)، damage(15312)

## wizard_warlock

- **امضای ممنوع** (`forbidden_signature`) — پایه: damage(1700)؛ تعالی قلمرو: **فرمان نام نخستین** — damage(2176)، modifier(-8)، reaction
- **سرقت لحظه** (`stolen_moment`) — پایه: apply_status؛ تعالی قلمرو: **ربایش فردا** — apply_status، apply_status
- **وصیت‌نامه اهریمن** (`demons_testament`) — پایه: modifier(3)، apply_status؛ تعالی قلمرو: **وصیت‌نامه هشت مُهر** — modifier(3)، apply_status، apply_status
- **وارونگی قربانی** (`reversal_of_sacrifice`) — پایه: apply_status؛ تعالی قلمرو: **مذبح بهای ناپرداختنی** — apply_status، apply_status
- **دادگاه بی‌نامان** (`court_of_nameless`) — پایه: apply_status؛ تعالی قلمرو: **محکمه احکام واپسین** — apply_status، apply_status
- **قلب گروگان** (`hostage_heart`) — پایه: apply_status؛ تعالی قلمرو: **قلب شاه دربند** — apply_status، heal(320)، apply_status
- **حذف از واقعیت** (`erasure_from_reality`) — پایه: remove_status، apply_status؛ تعالی قلمرو: **نیستی نام‌داران** — remove_status، apply_status، remove_status
- **وارث گرسنگی** (`heir_of_hunger`) — پایه: summon؛ تعالی قلمرو: **گرسنگی آن‌سوی خدایان** — summon، summon
- **شکستن نام حقیقی** (`true_name_shatter`) — پایه: apply_status؛ تعالی قلمرو: **شکستن گفتار نخستین** — apply_status
- **آخرین قرارداد** (`final_covenant`) — پایه: damage(3600)، remove_status، heal(150)؛ تعالی قلمرو: **پیمان پایان جهان** — damage(5376)، remove_status، heal(192)، remove_status، heal(192)

## wizard_necromancer

- **چنگال مرگ** (`death_claw`) — پایه: damage(2200)، apply_status؛ تعالی قلمرو: **چنگال داوری ابدی** — damage(2750)، apply_status، apply_status، apply_status
- **لژیون** (`legion`) — پایه: apply_status؛ تعالی قلمرو: **ارتش برخاسته** — apply_status، apply_status
- **خاطره مرگ** (`death_memory`) — پایه: apply_status؛ تعالی قلمرو: **کتاب آخرین خاطرات** — apply_status، modifier(-15)، modifier(-15)
- **شکوفایی استخوان** (`bone_blossom`) — پایه: modifier(18)، modifier(12)؛ تعالی قلمرو: **رستاخیز استخوان‌های سیاه** — modifier(23)، modifier(15)، modifier(18)
- **مجلس ارواح** (`assembly_of_souls`) — پایه: apply_status؛ تعالی قلمرو: **ضیافت هزار روح** — apply_status، heal(188)، damage(1250)
- **مکیدن حیات** (`life_siphon`) — پایه: apply_status؛ تعالی قلمرو: **بلعنده جوهر زندگی** — apply_status، apply_status
- **پادشاهی استخوان‌ها** (`kingdom_of_bones`) — پایه: modifier(20)، modifier(15)؛ تعالی قلمرو: **فرمان امپراتور مردگان** — modifier(25)، modifier(19)، apply_status، modifier(20)، apply_status
- **بازگشت از آستانه** (`return_threshold`) — پایه: apply_status؛ تعالی قلمرو: **انکار مرگ** — apply_status، apply_status
- **سلطه بر ارواح** (`soul_domination`) — پایه: apply_status؛ تعالی قلمرو: **سلطه مطلق بر اراده** — apply_status، apply_status
- **فرمانروای ابدی** (`eternal_sovereign`) — پایه: modifier(20)، modifier(20)، apply_status؛ تعالی قلمرو: **تجسد خدای مرگ** — modifier(25)، modifier(25)، apply_status

## warrior_sword_ascetic

- **برش هلال سیاه** (`black_crescent`) — پایه: damage(2800)؛ تعالی قلمرو: **هلال سیاه بی‌پایان** — damage(5684)
- **گام مه** (`mist_step`) — پایه: reaction(0)، apply_status؛ تعالی قلمرو: **گام در ورای زمان** — reaction(0)، apply_status، modifier(25)، reaction(3190)، apply_status
- **تیغه روح** (`soul_blade`) — پایه: damage(2100)؛ تعالی قلمرو: **تجلی روح شمشیر** — damage(4263)، apply_status
- **یگانگی بدن و شمشیر** (`body_sword_unity`) — پایه: apply_status؛ تعالی قلمرو: **یکی شدن روح و شمشیر** — modifier(51)، modifier(35)، modifier(25)
- **پژواک** (`echo`) — پایه: reaction؛ تعالی قلمرو: **پژواک هزار تیغه** — reaction، reaction
- **شکوفه خونین** (`crimson_blossom`) — پایه: multi_hit(750)؛ تعالی قلمرو: **شکوفه خونین ابدی** — multi_hit(1088)، apply_status
- **برش شکافنده کوه‌ها و رودخانه‌ها** (`mountain_river_cleave`) — پایه: damage(3300)؛ تعالی قلمرو: **شکافنده آسمان و زمین** — damage(6699)، apply_status، apply_status
- **غریزه مطلق** (`absolute_instinct`) — پایه: apply_status؛ تعالی قلمرو: **غریزه فراتر از مرگ** — modifier(51)، modifier(35)، reaction(2610)، apply_status
- **تیغه ذهن** (`mind_blade`) — پایه: damage(2900)؛ تعالی قلمرو: **تیغه ذهن بی‌کران** — damage(5887)، modifier(35)، modifier(-25)، apply_status
- **فرجام خاموش** (`silent_finale`) — پایه: damage(6500)، apply_status؛ تعالی قلمرو: **فرجام ابدی** — damage(13195)، apply_status

## warrior_iron_bastion

- **فرود خردکننده پولاد** (`ironcleave`) — پایه: damage(2850)، apply_status، modifier(-15)؛ تعالی قلمرو: **حکم اعدام تایتان** — damage(3660)، apply_status، modifier(-15)، apply_status
- **دیوار تسلیم‌ناپذیر** (`unyielding_wall`) — پایه: reaction؛ تعالی قلمرو: **حصار آخرین تایتان** — reaction، modifier(35)
- **زلزله آهن** (`quake_of_iron`) — پایه: damage(1250)، apply_status؛ تعالی قلمرو: **گسل هزارستون** — damage(2318)، apply_status، apply_status
- **حالت دژ** (`fortress_stance`) — پایه: modifier(24)، modifier(20)، modifier(-10)؛ تعالی قلمرو: **قلب دژ ابدی** — modifier(29)، modifier(24)، modifier(-12)، modifier(35)، modifier(30)
- **فرود درهم‌شکن** (`breaker_slam`) — پایه: damage(2350)، apply_status؛ تعالی قلمرو: **سقوط تبر آسمانی** — damage(4026)، apply_status، apply_status
- **پاسخ آهنین** (`iron_reprisal`) — پایه: reaction؛ تعالی قلمرو: **بازتاب داوری آهن** — reaction، reaction
- **پیشروی دژ** (`marching_bastion`) — پایه: modifier(14)؛ تعالی قلمرو: **لشکرگاه تسخیرناپذیر** — modifier(17)، modifier(10)
- **خردکننده گارد** (`shatterguard`) — پایه: damage(2050)، modifier(-18)؛ تعالی قلمرو: **فروپاشی تاج فولاد** — damage(3172)، modifier(-22)، modifier(-25)
- **خشم غول‌آسا** (`colossus_rage`) — پایه: modifier(22)، modifier(12)، modifier(-8)؛ تعالی قلمرو: **خشم تایتان سرخ** — modifier(27)، modifier(15)، modifier(-10)، modifier(35)، modifier(20)
- **آخرین سنگر** (`last_bastion`) — پایه: damage(3900)، shield(240)؛ تعالی قلمرو: **سقوط تختگاه** — damage(6344)، shield(293)

## warrior_chaos

- **شکافنده بی‌نظمی** (`chaos_rend`) — پایه: damage(1550)، modifier(-15)، apply_status؛ تعالی قلمرو: **شکافِ بلعنده** — damage(2519)، modifier(-19)، apply_status، damage(563)
- **خشم نخستین** (`primordial_rage`) — پایه: modifier(18)، resource_gain(20)؛ تعالی قلمرو: **خشمِ آن‌سوی مرز** — modifier(23)، resource_gain(20)، modifier(30)
- **شکاف احتمال** (`fractured_chance`) — پایه: apply_status، modifier(8)؛ تعالی قلمرو: **انتخابِ ناممکن** — apply_status، modifier(8)، modifier(12)، apply_status
- **گره تناقض** (`paradox_knot`) — پایه: apply_status؛ تعالی قلمرو: **پیوندِ دو سرنوشت** — apply_status، apply_status
- **زخم بی‌پایان** (`endless_wound`) — پایه: apply_status؛ تعالی قلمرو: **زخمِ زنده‌جهان** — apply_status، apply_status
- **زندان لحظه‌های شکسته** (`broken_moments_prison`) — پایه: damage(700)، apply_status؛ تعالی قلمرو: **دخمه زمانِ مرده** — damage(1138)، apply_status، damage(1125)، apply_status
- **دندان‌های آشوب** (`chaos_fangs`) — پایه: multi_hit(383)؛ تعالی قلمرو: **آرواره‌های پایان** — multi_hit(359)
- **لغزش لحظه** (`moment_slip`) — پایه: modifier(45)، apply_status؛ تعالی قلمرو: **سرقتِ یک لحظه** — modifier(56)، apply_status، modifier(60)، apply_status
- **کالبد ناسازگار** (`discordant_vessel`) — پایه: reaction؛ تعالی قلمرو: **وجودِ بیرون از قانون** — reaction، reaction
- **پایان تعریف‌ناپذیر** (`undefined_end`) — پایه: damage(2600)، apply_status؛ تعالی قلمرو: **آخرین تناقض** — damage(4225)، apply_status، damage(2000)، apply_status

## warrior_apocalypse_harbinger

- **ضربه آخرالزمان** (`apoc_strike`) — پایه: damage(1600)؛ تعالی قلمرو: **ضربه واپسین جهان** — damage(2592)، damage(660)
- **شکاف جهان** (`world_rift`) — پایه: damage(1900)، apply_status؛ تعالی قلمرو: **زخم بی‌پایان واقعیت** — damage(3078)، apply_status، apply_status، apply_status، damage(1077)
- **باران شهاب** (`meteor_rain`) — پایه: damage(2200)، apply_status؛ تعالی قلمرو: **سقوط ستارگان مرده** — damage(3564)، apply_status، damage(1200)
- **وارونگی هستی** (`existence_inversion`) — پایه: apply_status؛ تعالی قلمرو: **جهان وارونه** — apply_status، apply_status، damage(1200)
- **نشان پایان** (`end_mark`) — پایه: apply_status؛ تعالی قلمرو: **حکم نابودی** — apply_status، damage(600)، apply_status
- **تاج ویرانی** (`ruin_crown`) — پایه: apply_status؛ تعالی قلمرو: **تاج آخرین پادشاه** — modifier(36)، modifier(30)، modifier(30)، modifier(25)
- **فرمانروایی اسارت** (`captivity_dominion`) — پایه: apply_status؛ تعالی قلمرو: **حکم سکون ابدی** — apply_status، apply_status
- **لحظه‌ای خارج از زمان** (`outside_time`) — پایه: apply_status؛ تعالی قلمرو: **آخرین ثانیه جهان** — apply_status، damage(1440)، apply_status
- **فرود پادشاه پایان** (`kingfall`) — پایه: damage(3000)، apply_status؛ تعالی قلمرو: **سقوط تختگاه مرگ** — damage(4860)، apply_status، modifier(-20)، damage(1701)، damage(1701)
- **پایان جهان** (`worlds_end`) — پایه: damage(4200)، apply_status؛ تعالی قلمرو: **خاموشی آفرینش** — damage(6804)، apply_status، damage(2640)

## اتصال و محدودیت

V1958 از طریق `systems/combat/engines/index.js` صادر شده و در `index.html` فقط به‌صورت diagnostic/shadow بارگذاری می‌شود. اتصال compiler به V1956 در تست واحد انجام شده است. این نسخه هنوز به مسیر authoritative نبرد Solo/Party/PvP یا RPC سمت سرور Supabase منتقل نشده است. اجرای واقعی شبکه، تفاوت خروجی با resolverهای legacy، رفتار کامل Legion/Link/Choice/Repeat/Execute و محدودیت باس باید در مرحله differential و server-runtime جداگانه تأیید شود. هیچ SQL اجرا نشده و هیچ تغییری روی Supabase، GitHub یا هاست انجام نشده است.
