-- ETRANOM V1929 — authoritative Wizard Domain/Ascension form resolution.
-- Install only after the V1921 Wizard Party/PvP RPC layer exists.
-- Idempotent: upserts the 40 authored forms and patches RPCs only once.
begin;

create table if not exists public.wizard_domain_skill_forms_v1929 (
  specialization_key text not null check (specialization_key in ('wizard_arcane_mage','wizard_elementalist','wizard_warlock','wizard_necromancer')),
  base_skill_id text not null,
  ascension_id text not null,
  form_data jsonb not null check (jsonb_typeof(form_data)='object'),
  source_version text not null default 'V1929',
  primary key (specialization_key, base_skill_id),
  unique (specialization_key, ascension_id)
);

insert into public.wizard_domain_skill_forms_v1929(specialization_key,base_skill_id,ascension_id,form_data)
values
('wizard_arcane_mage','arcane_bolt','asc_arcane_bolt','{"id":"asc_arcane_bolt","skillId":"arcane_bolt","name":"گلوله آرکین مطلق","en":"Absolute Arcane Bolt","target":"یک دشمن انتخابی و دشمنان دیگر با انفجار ثانویه","manaPct":12,"chargeCost":2,"cooldownTurns":4,"damagePct":600,"splashPct":200,"defensePenetrationPct":30,"stages":{"mastery":{"damagePct":650},"ascension":{"damagePct":700},"absolute":{"damagePct":800,"echoPct":40}},"description":"پرتابه عظیم آرکین به هدف اصلی ۶۰۰٪ قدرت جادویی آسیب می‌زند و به دیگر دشمنان ۲۰۰٪ آسیب انفجاری وارد می‌کند؛ ۳۰٪ دفاع جادویی هدف اصلی نادیده گرفته می‌شود.","absoluteDescription":"در قلمرو مطلق، آسیب اصلی ۸۰۰٪ می‌شود و یک پرتابه پژواکی با ۴۰٪ قدرت به هدف اصلی برخورد می‌کند."}'::jsonb),
('wizard_arcane_mage','arcane_shield','asc_arcane_shield','{"id":"asc_arcane_shield","skillId":"arcane_shield","name":"سپر جهان آرکین","en":"Absolute Arcane Barrier","target":"خود بازیکن","manaPct":15,"cooldownTurns":5,"durationTurns":4,"shieldPct":900,"damageReductionPct":20,"cleanseCount":2,"stages":{"mastery":{"shieldPct":1000},"ascension":{"durationTurns":5},"absolute":{"shieldPct":1300,"retaliationPct":150}},"description":"سپر ۹۰۰٪ قدرت جادویی جذب می‌کند، چهار نوبت دشمن باقی می‌ماند، ۲۰٪ آسیب دریافتی را کاهش می‌دهد و دو اثر منفی قابل پاک‌سازی را حذف می‌کند.","absoluteDescription":"جذب به ۱۳۰۰٪ می‌رسد و هنگام پایان سپر، به همه دشمنان ۱۵۰٪ قدرت جادویی آسیب بازتابی وارد می‌شود."}'::jsonb),
('wizard_arcane_mage','arcane_explosion','asc_arcane_explosion','{"id":"asc_arcane_explosion","skillId":"arcane_explosion","name":"انفجار کیهانی","en":"Cosmic Cataclysm","target":"تمام دشمنان زنده","manaPct":20,"chargeCost":3,"cooldownTurns":5,"damagePct":750,"secondWavePct":250,"stunTurns":1,"bossSlowPct":15,"stages":{"mastery":{"damagePct":800},"ascension":{"secondWavePct":280},"absolute":{"damagePct":1000,"thirdWavePct":300}},"description":"به همه دشمنان ۷۵۰٪ آسیب می‌زند و موج دوم ۲۵۰٪ ایجاد می‌کند؛ دشمن عادی یک نوبت از اقدام بازمی‌ماند، باس فقط ۱۵٪ تضعیف می‌شود.","absoluteDescription":"موج اصلی ۱۰۰۰٪ و موج سوم ۳۰۰٪ قدرت جادویی آسیب وارد می‌کند."}'::jsonb),
('wizard_arcane_mage','arcane_blink','asc_arcane_blink','{"id":"asc_arcane_blink","skillId":"arcane_blink","name":"شکاف بی‌نهایت","en":"Infinite Rift","target":"خود بازیکن و همه دشمنان","manaPct":15,"cooldownTurns":5,"evadeTurns":2,"counterDamagePct":250,"shieldPct":300,"stages":{"mastery":{"evadeTurns":3},"ascension":{"counterDamagePct":300},"absolute":{"secondEvasion":true,"secondEvasionDamagePct":50}},"description":"دو حمله دشمن را خنثی می‌کند، به همه دشمنان ۲۵۰٪ قدرت جادویی آسیب بازگشتی می‌زند و سپر ۳۰۰٪ ایجاد می‌کند.","absoluteDescription":"در قلمرو مطلق، یک بار دیگر می‌توان اثر جاخالی را فعال کرد؛ موج دوم ۵۰٪ آسیب موج اول را دارد."}'::jsonb),
('wizard_arcane_mage','ancient_rune','asc_ancient_rune','{"id":"asc_ancient_rune","skillId":"ancient_rune","name":"حکم باستانی","en":"Ancient Judgment","target":"تمام دشمنان زنده","manaPct":20,"cooldownTurns":5,"initialDamagePct":300,"finalDamagePct":400,"enemyAttackReductionPct":20,"durationTurns":3,"bossSlowPct":10,"stages":{"mastery":{"finalDamagePct":500},"ascension":{"durationTurns":4},"absolute":{"finalDamagePct":700,"defenseDownPct":15,"defenseDownTurns":3}},"description":"به همه دشمنان ۳۰۰٪ آسیب اولیه و پس از سه نوبت ۴۰۰٪ آسیب پایانی می‌زند؛ قدرت حمله دشمنان ۲۰٪ کاهش می‌یابد و باس‌ها کنترل کامل نمی‌شوند.","absoluteDescription":"آسیب پایانی ۷۰۰٪ می‌شود و دفاع جادویی دشمنان برای سه نوبت ۱۵٪ کاهش می‌یابد."}'::jsonb),
('wizard_arcane_mage','prismatic_lance','asc_prismatic_lance','{"id":"asc_prismatic_lance","skillId":"prismatic_lance","name":"نیزه منشوری مطلق","en":"Absolute Prismatic Lance","target":"تا هشت دشمن زنده","manaPct":20,"chargeCost":3,"cooldownTurns":5,"damagePct":800,"falloffPct":85,"defenseDownPct":20,"stages":{"mastery":{"damagePct":850},"ascension":{"maxTargets":10},"absolute":{"damagePct":1100,"returnWavePct":250}},"description":"به حداکثر هشت دشمن آسیب می‌زند؛ هدف نخست ۸۰۰٪ و اهداف بعدی هرکدام ۸۵٪ از آسیب هدف قبلی را دریافت می‌کنند. دفاع جادویی اهداف ۲۰٪ کاهش می‌یابد.","absoluteDescription":"آسیب ۱۱۰۰٪ می‌شود و پس از هدف آخر، موج بازگشتی ۲۵۰٪ به همه دشمنان زنده آسیب می‌زند."}'::jsonb),
('wizard_arcane_mage','arcane_echo','asc_arcane_echo','{"id":"asc_arcane_echo","skillId":"arcane_echo","name":"پژواک ابدی","en":"Eternal Echo","target":"تکرار آخرین مهارت تهاجمی مجاز","manaPct":20,"cooldownTurns":6,"repeats":[50,40,30],"stages":{"mastery":{"repeats":[55,45,35]},"ascension":{"repeats":[60,50,40]},"absolute":{"repeats":[60,50,40,30]}},"description":"آخرین مهارت تهاجمی مجاز را سه بار با ۵۰٪، ۴۰٪ و ۳۰٪ قدرت تکرار می‌کند. مهارت تعالی‌یافته و قلمرو قابل تکرار نیستند.","absoluteDescription":"در قلمرو مطلق، پژواک چهارم با ۳۰٪ قدرت اضافه می‌شود."}'::jsonb),
('wizard_arcane_mage','gravity_well','asc_gravity_well','{"id":"asc_gravity_well","skillId":"gravity_well","name":"حفره گرانشی مطلق","en":"Absolute Gravity Well","target":"تمام دشمنان زنده","manaPct":25,"chargeCost":3,"cooldownTurns":6,"dotPct":100,"dotTurns":6,"enemyAttackReductionPct":25,"finalDamagePct":0,"stages":{"mastery":{"dotTurns":7},"ascension":{"dotPct":120},"absolute":{"finalDamagePct":500}},"description":"همه دشمنان برای شش نوبت، هر نوبت ۱۰۰٪ قدرت جادویی آسیب می‌گیرند و قدرت حمله‌شان ۲۵٪ کاهش می‌یابد؛ باس‌ها فقط تضعیف می‌شوند.","absoluteDescription":"در پایان، هسته منفجر می‌شود و ۵۰۰٪ قدرت جادویی آسیب نهایی وارد می‌کند."}'::jsonb),
('wizard_arcane_mage','arcane_overload','asc_arcane_overload','{"id":"asc_arcane_overload","skillId":"arcane_overload","name":"اضافه‌بار خدایان","en":"Divine Arcane Overload","target":"خود بازیکن و پایان اثر علیه تمام دشمنان","manaPct":25,"chargeCost":5,"cooldownTurns":7,"durationTurns":5,"magicPowerPct":70,"castEfficiencyPct":30,"manaCostReductionPct":25,"stages":{"mastery":{"magicPowerPct":80},"ascension":{"durationTurns":6},"absolute":{"magicPowerPct":100,"finalDamagePct":500}},"description":"برای پنج نوبت قدرت جادویی ۷۰٪، کارایی اجرای جادو ۳۰٪ و کاهش هزینه مانا ۲۵٪ افزایش می‌یابد.","absoluteDescription":"قدرت جادویی ۱۰۰٪ می‌شود و هنگام پایان، به همه دشمنان ۵۰۰٪ قدرت جادویی آسیب می‌زند."}'::jsonb),
('wizard_arcane_mage','arcane_singularity','asc_arcane_singularity','{"id":"asc_arcane_singularity","skillId":"arcane_singularity","name":"تکینگی مطلق","en":"Absolute Singularity","target":"تمام دشمنان زنده","manaPct":35,"chargeCost":"all","cooldownTurns":99,"prepTurns":1,"channelTurns":3,"damagePerChannelPct":150,"finalDamagePct":800,"chargeBonusPct":5,"stages":{"mastery":{"finalDamagePct":1100},"ascension":{"finalDamagePct":1250},"absolute":{"finalDamagePct":1500,"secondaryWavePct":300}},"description":"یک نوبت برای شکل‌گیری هسته و سه نوبت برای فشرده‌سازی لازم دارد؛ در هر نوبت ۱۵۰٪ آسیب و در پایان ۸۰۰٪ آسیب نهایی وارد می‌کند. هر شارژ مصرفی ۵٪ آسیب نهایی می‌افزاید.","absoluteDescription":"در قلمرو مطلق، انفجار نهایی ۱۵۰۰٪ می‌شود و موج ثانویه ۳۰۰٪ نیز ایجاد می‌کند."}'::jsonb),
('wizard_elementalist','ember_bolt','asc_ember_bolt','{"id":"asc_ember_bolt","skillId":"ember_bolt","name":"خورشیدِ ویرانگر","target":"یک دشمن انتخابی","manaPct":10,"cooldownTurns":4,"damagePct":330,"stages":{"mastery":{"damageBonusPct":10},"ascension":{"damageBonusPct":20},"absolute":{"damageBonusPct":35}},"description":"نسخه تعالی‌یافته این مهارت؛ با فعال‌سازی قلمرو، این نسخه در کنار ۹ نسخه تعالی‌یافته دیگر در دسترس قرار می‌گیرد؛ بازیکن دقیقاً یکی از ده نسخه را انتخاب و فقط یک بار در همان فعال‌سازی اجرا می‌کند."}'::jsonb),
('wizard_elementalist','frozen_armor','asc_frozen_armor','{"id":"asc_frozen_armor","skillId":"frozen_armor","name":"زره ابدی بلورین","target":"خود بازیکن","manaPct":13,"cooldownTurns":5,"damagePct":396,"stages":{"mastery":{"damageBonusPct":10},"ascension":{"damageBonusPct":20},"absolute":{"damageBonusPct":35}},"description":"نسخه تعالی‌یافته این مهارت؛ با فعال‌سازی قلمرو، این نسخه در کنار ۹ نسخه تعالی‌یافته دیگر در دسترس قرار می‌گیرد؛ بازیکن دقیقاً یکی از ده نسخه را انتخاب و فقط یک بار در همان فعال‌سازی اجرا می‌کند."}'::jsonb),
('wizard_elementalist','chain_lightning','asc_chain_lightning','{"id":"asc_chain_lightning","skillId":"chain_lightning","name":"داوری آسمانی","target":"تا 3 دشمن زنده","manaPct":15,"cooldownTurns":4,"damagePct":319,"stages":{"mastery":{"damageBonusPct":10},"ascension":{"damageBonusPct":20},"absolute":{"damageBonusPct":35}},"description":"نسخه تعالی‌یافته این مهارت؛ با فعال‌سازی قلمرو، این نسخه در کنار ۹ نسخه تعالی‌یافته دیگر در دسترس قرار می‌گیرد؛ بازیکن دقیقاً یکی از ده نسخه را انتخاب و فقط یک بار در همان فعال‌سازی اجرا می‌کند."}'::jsonb),
('wizard_elementalist','tempest','asc_tempest','{"id":"asc_tempest","skillId":"tempest","name":"توفان پایان جهان","target":"تمام دشمنان زنده","manaPct":17,"cooldownTurns":5,"damagePct":209,"stages":{"mastery":{"damageBonusPct":10},"ascension":{"damageBonusPct":20},"absolute":{"damageBonusPct":35}},"description":"نسخه تعالی‌یافته این مهارت؛ با فعال‌سازی قلمرو، این نسخه در کنار ۹ نسخه تعالی‌یافته دیگر در دسترس قرار می‌گیرد؛ بازیکن دقیقاً یکی از ده نسخه را انتخاب و فقط یک بار در همان فعال‌سازی اجرا می‌کند."}'::jsonb),
('wizard_elementalist','earth_rupture','asc_earth_rupture','{"id":"asc_earth_rupture","skillId":"earth_rupture","name":"خشم هسته زمین","target":"تمام دشمنان زنده","manaPct":18,"cooldownTurns":5,"damagePct":286,"stages":{"mastery":{"damageBonusPct":10},"ascension":{"damageBonusPct":20},"absolute":{"damageBonusPct":35}},"description":"نسخه تعالی‌یافته این مهارت؛ با فعال‌سازی قلمرو، این نسخه در کنار ۹ نسخه تعالی‌یافته دیگر در دسترس قرار می‌گیرد؛ بازیکن دقیقاً یکی از ده نسخه را انتخاب و فقط یک بار در همان فعال‌سازی اجرا می‌کند."}'::jsonb),
('wizard_elementalist','tidal_renewal','asc_tidal_renewal','{"id":"asc_tidal_renewal","skillId":"tidal_renewal","name":"چشمه حیات نخستین","target":"خود بازیکن","manaPct":16,"cooldownTurns":6,"damagePct":484,"stages":{"mastery":{"damageBonusPct":10},"ascension":{"damageBonusPct":20},"absolute":{"damageBonusPct":35}},"description":"نسخه تعالی‌یافته این مهارت؛ با فعال‌سازی قلمرو، این نسخه در کنار ۹ نسخه تعالی‌یافته دیگر در دسترس قرار می‌گیرد؛ بازیکن دقیقاً یکی از ده نسخه را انتخاب و فقط یک بار در همان فعال‌سازی اجرا می‌کند."}'::jsonb),
('wizard_elementalist','radiant_judgment','asc_radiant_judgment','{"id":"asc_radiant_judgment","skillId":"radiant_judgment","name":"تجلی نور مطلق","target":"یک دشمن انتخابی؛ پاک‌سازی از خود","manaPct":16,"cooldownTurns":5,"damagePct":506,"stages":{"mastery":{"damageBonusPct":10},"ascension":{"damageBonusPct":20},"absolute":{"damageBonusPct":35}},"description":"نسخه تعالی‌یافته این مهارت؛ با فعال‌سازی قلمرو، این نسخه در کنار ۹ نسخه تعالی‌یافته دیگر در دسترس قرار می‌گیرد؛ بازیکن دقیقاً یکی از ده نسخه را انتخاب و فقط یک بار در همان فعال‌سازی اجرا می‌کند."}'::jsonb),
('wizard_elementalist','darkness_chains','asc_darkness_chains','{"id":"asc_darkness_chains","skillId":"darkness_chains","name":"بندهای خلأ ابدی","target":"یک دشمن انتخابی","manaPct":17,"cooldownTurns":6,"damagePct":385,"stages":{"mastery":{"damageBonusPct":10},"ascension":{"damageBonusPct":20},"absolute":{"damageBonusPct":35}},"description":"نسخه تعالی‌یافته این مهارت؛ با فعال‌سازی قلمرو، این نسخه در کنار ۹ نسخه تعالی‌یافته دیگر در دسترس قرار می‌گیرد؛ بازیکن دقیقاً یکی از ده نسخه را انتخاب و فقط یک بار در همان فعال‌سازی اجرا می‌کند."}'::jsonb),
('wizard_elementalist','elemental_fusion','asc_elemental_fusion','{"id":"asc_elemental_fusion","skillId":"elemental_fusion","name":"اتحاد هشت بنیاد","target":"یک دشمن یا تمام دشمنان؛ وابسته به ترکیب","manaPct":22,"cooldownTurns":7,"damagePct":440,"stages":{"mastery":{"damageBonusPct":10},"ascension":{"damageBonusPct":20},"absolute":{"damageBonusPct":35}},"description":"نسخه تعالی‌یافته این مهارت؛ با فعال‌سازی قلمرو، این نسخه در کنار ۹ نسخه تعالی‌یافته دیگر در دسترس قرار می‌گیرد؛ بازیکن دقیقاً یکی از ده نسخه را انتخاب و فقط یک بار در همان فعال‌سازی اجرا می‌کند."}'::jsonb),
('wizard_elementalist','primordial_cataclysm','asc_primordial_cataclysm','{"id":"asc_primordial_cataclysm","skillId":"primordial_cataclysm","name":"رستاخیز عناصر نخستین","target":"تمام دشمنان زنده","manaPct":36,"cooldownTurns":10,"damagePct":1056,"stages":{"mastery":{"damageBonusPct":10},"ascension":{"damageBonusPct":20},"absolute":{"damageBonusPct":35}},"description":"نسخه تعالی‌یافته این مهارت؛ با فعال‌سازی قلمرو، این نسخه در کنار ۹ نسخه تعالی‌یافته دیگر در دسترس قرار می‌گیرد؛ بازیکن دقیقاً یکی از ده نسخه را انتخاب و فقط یک بار در همان فعال‌سازی اجرا می‌کند."}'::jsonb),
('wizard_warlock','forbidden_signature','edict_of_the_true_name','{"id":"edict_of_the_true_name","baseSkillId":"forbidden_signature","name":"فرمان نام نخستین","baseSkillName":"امضای ممنوع تعالی‌یافته","description":"هدف برای 3 نوبت در دفتر نخستین ثبت می‌شود؛ هر آسیب دریافتی‌اش 28٪ بازتاب دارد و هر مهارت ویژه‌اش 6٪ حداکثر مانا به وارلاک می‌دهد.","manaCostPercent":0,"cooldownTurns":0,"useLimitPerDomain":1,"target":"مطابق مهارت پایه"}'::jsonb),
('wizard_warlock','stolen_moment','theft_of_tomorrow','{"id":"theft_of_tomorrow","baseSkillId":"stolen_moment","name":"ربایش فردا","baseSkillName":"سرقت لحظه تعالی‌یافته","description":"مهارت ویژه هدف برای یک نوبت مهروموم می‌شود؛ وارلاک دو لحظه ذخیره می‌کند و مهارت بعدی‌اش 35٪ قوی‌تر و 25٪ ارزان‌تر است.","manaCostPercent":0,"cooldownTurns":0,"useLimitPerDomain":1,"target":"مطابق مهارت پایه"}'::jsonb),
('wizard_warlock','demons_testament','testament_of_the_eightfold','{"id":"testament_of_the_eightfold","baseSkillId":"demons_testament","name":"وصیت‌نامه هشت مُهر","baseSkillName":"وصیت‌نامه اهریمن تعالی‌یافته","description":"تا پایان قلمرو هر مهارت 2 بدهی می‌سازد؛ هر بدهی 5٪ آسیب می‌دهد، اما آستانه‌های هزینه فقط یک بار و با سقف 8 بدهی اعمال می‌شوند.","manaCostPercent":0,"cooldownTurns":0,"useLimitPerDomain":1,"target":"مطابق مهارت پایه"}'::jsonb),
('wizard_warlock','reversal_of_sacrifice','altar_of_the_unpayable','{"id":"altar_of_the_unpayable","baseSkillId":"reversal_of_sacrifice","name":"مذبح بهای ناپرداختنی","baseSkillName":"وارونگی قربانی تعالی‌یافته","description":"12٪ حداکثر HP را (بدون کشتن) قربانی می‌کند؛ مهارت بعدی 100٪ قوی‌تر است و 60٪ قربانی در صورت اصابت بازمی‌گردد.","manaCostPercent":0,"cooldownTurns":0,"useLimitPerDomain":1,"target":"مطابق مهارت پایه"}'::jsonb),
('wizard_warlock','court_of_nameless','court_of_final_verdicts','{"id":"court_of_final_verdicts","baseSkillId":"court_of_nameless","name":"محکمه احکام واپسین","baseSkillName":"دادگاه بی‌نامان تعالی‌یافته","description":"هر سه حکم هم‌زمان برای 3 نوبت اجرا می‌شوند؛ شدت علیه باس 60٪ است.","manaCostPercent":0,"cooldownTurns":0,"useLimitPerDomain":1,"target":"مطابق مهارت پایه"}'::jsonb),
('wizard_warlock','hostage_heart','heart_of_the_bound_king','{"id":"heart_of_the_bound_king","baseSkillId":"hostage_heart","name":"قلب شاه دربند","baseSkillName":"قلب گروگان تعالی‌یافته","description":"پیوند 3 نوبت برقرار می‌شود؛ 35٪ آسیب وارلاک منتقل و 25٪ آسیب او بازیابی می‌شود؛ شکستن پیوند ضربه‌ای برابر 120٪ آسیب منتقل‌شده می‌زند.","manaCostPercent":0,"cooldownTurns":0,"useLimitPerDomain":1,"target":"مطابق مهارت پایه"}'::jsonb),
('wizard_warlock','erasure_from_reality','unmaking_of_the_named','{"id":"unmaking_of_the_named","baseSkillId":"erasure_from_reality","name":"نیستی نام‌داران","baseSkillName":"حذف از واقعیت تعالی‌یافته","description":"یک دشمن عادی یک نوبت از نبرد حذف و یک اثر مثبتش نابود می‌شود؛ باس یک اثر مثبت را از دست می‌دهد و مهارت بعدی‌اش 40٪ ضعیف می‌شود.","manaCostPercent":0,"cooldownTurns":0,"useLimitPerDomain":1,"target":"مطابق مهارت پایه"}'::jsonb),
('wizard_warlock','heir_of_hunger','the_hunger_beyond_gods','{"id":"the_hunger_beyond_gods","baseSkillId":"heir_of_hunger","name":"گرسنگی آن‌سوی خدایان","baseSkillName":"وارث گرسنگی تعالی‌یافته","description":"موجود 4 نوبت می‌ماند؛ تا 18٪ مانای دشمنان را ذخیره می‌کند و وارلاک می‌تواند هر نوبت آن را میان HP، MP و ضربه نهایی تقسیم کند.","manaCostPercent":0,"cooldownTurns":0,"useLimitPerDomain":1,"target":"مطابق مهارت پایه"}'::jsonb),
('wizard_warlock','true_name_shatter','shattering_of_first_speech','{"id":"shattering_of_first_speech","baseSkillId":"true_name_shatter","name":"شکستن گفتار نخستین","baseSkillName":"شکستن نام حقیقی تعالی‌یافته","description":"دو بند از چهار بند روی هدف انتخاب می‌شود و 3 نوبت می‌ماند؛ شدت علیه باس 65٪ است.","manaCostPercent":0,"cooldownTurns":0,"useLimitPerDomain":1,"target":"مطابق مهارت پایه"}'::jsonb),
('wizard_warlock','final_covenant','covenant_at_worlds_end','{"id":"covenant_at_worlds_end","baseSkillId":"final_covenant","name":"پیمان پایان جهان","baseSkillName":"آخرین قرارداد تعالی‌یافته","description":"سه تجلی با هم ترکیب می‌شوند: 420٪ قدرت جادویی به همه دشمنان، حذف یک اثر مثبت غیرذاتی، و بازیابی 15٪ HP ازدست‌رفته؛ هر 2 بدهی +10٪ آسیب تا سقف +50٪.","manaCostPercent":0,"cooldownTurns":0,"useLimitPerDomain":1,"target":"مطابق مهارت پایه"}'::jsonb),
('wizard_necromancer','death_claw','death_claw_ascended','{"id":"death_claw_ascended","baseSkillId":"death_claw","name":"چنگال داوری ابدی","en":"Claw of Eternal Judgment","description":"چنگال مرگ با آسیب و زخم تقویت‌شده؛ کشتن هدف زخمی روح بیشتری می‌دهد.","target":"یک دشمن"}'::jsonb),
('wizard_necromancer','legion','legion_ascended','{"id":"legion_ascended","baseSkillId":"legion","name":"ارتش برخاسته","en":"Army of the Risen","description":"تمام اعضای لژیون احضار می‌شوند و هرکدام فرم مرگ و توانایی اختصاصی خود را آزاد می‌کنند.","target":"تمام اعضای لژیون"}'::jsonb),
('wizard_necromancer','death_memory','death_memory_ascended','{"id":"death_memory_ascended","baseSkillId":"death_memory","name":"کتاب آخرین خاطرات","en":"Tome of Final Memories","description":"هر سه خاطره جنگ، بقا و جادو هم‌زمان بر هدف اعمال می‌شوند؛ باس‌ها شدت کمتر می‌گیرند.","target":"یک دشمن"}'::jsonb),
('wizard_necromancer','bone_blossom','bone_blossom_ascended','{"id":"bone_blossom_ascended","baseSkillId":"bone_blossom","name":"رستاخیز استخوان‌های سیاه","en":"Black Bone Rebirth","description":"تقویت دفاعی و زخم استخوانی اعضای لژیون با شدت بیشتر.","target":"تمام اعضای لژیون"}'::jsonb),
('wizard_necromancer','assembly_of_souls','assembly_of_souls_ascended','{"id":"assembly_of_souls_ascended","baseSkillId":"assembly_of_souls","name":"ضیافت هزار روح","en":"Feast of a Thousand Souls","description":"یکی از سه فرمان شکار، محافظت یا تغذیه با قدرت بسیار بیشتر اجرا می‌شود.","target":"وابسته به فرمان"}'::jsonb),
('wizard_necromancer','life_siphon','life_siphon_ascended','{"id":"life_siphon_ascended","baseSkillId":"life_siphon","name":"بلعنده جوهر زندگی","en":"Devourer of Life Essence","description":"سرقت حیات و انتقال انرژی به لژیون با ضریب بیشتر و سرقت محدود مانا.","target":"یک دشمن"}'::jsonb),
('wizard_necromancer','kingdom_of_bones','kingdom_of_bones_ascended','{"id":"kingdom_of_bones_ascended","baseSkillId":"kingdom_of_bones","name":"فرمان امپراتور مردگان","en":"Edict of the Dead Emperor","description":"تمام اعضای لژیون وارد فرمان جنگ ارتقایافته می‌شوند و حملاتشان دفاع را می‌شکند.","target":"تمام اعضای لژیون"}'::jsonb),
('wizard_necromancer','return_threshold','return_threshold_ascended','{"id":"return_threshold_ascended","baseSkillId":"return_threshold","name":"انکار مرگ","en":"Denial of Death","description":"نکرومنسر پس از ضربه مرگبار با سلامتی بیشتر بازمی‌گردد؛ همچنان یک بار در نبرد.","target":"خود"}'::jsonb),
('wizard_necromancer','soul_domination','soul_domination_ascended','{"id":"soul_domination_ascended","baseSkillId":"soul_domination","name":"سلطه مطلق بر اراده","en":"Absolute Will Dominion","description":"یک فرمان کنترل با شدت بالا؛ زنجیر می‌تواند چند دشمن را هدف بگیرد، باس فقط تضعیف می‌شود.","target":"یک یا چند دشمن"}'::jsonb),
('wizard_necromancer','eternal_sovereign','eternal_sovereign_ascended','{"id":"eternal_sovereign_ascended","baseSkillId":"eternal_sovereign","name":"تجسد خدای مرگ","en":"Avatar of the Death God","description":"فرم نهایی نکرومنسر و لژیون با تقویت جادوی تاریک، توانایی ویژه لژیون و بازیابی از آسیب آن‌ها.","target":"خود و لژیون"}'::jsonb)
on conflict (specialization_key,base_skill_id) do update set
  ascension_id=excluded.ascension_id, form_data=excluded.form_data, source_version='V1929';

revoke all on public.wizard_domain_skill_forms_v1929 from public, anon, authenticated;

create or replace function public.etranom_wizard_apply_domain_form_v1929(
  p_specialization_key text, p_base_skill_id text, p_progress jsonb, p_base_skill jsonb
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_progress jsonb := coalesce(p_progress,'{}'::jsonb);
  v_domain jsonb;
  v_active boolean := false;
  v_used boolean := false;
  v_selected text;
  v_form public.wizard_domain_skill_forms_v1929%rowtype;
  v_result jsonb;
begin
  if p_specialization_key not in ('wizard_arcane_mage','wizard_elementalist','wizard_warlock','wizard_necromancer') then
    return p_base_skill;
  end if;
  if p_base_skill is null or jsonb_typeof(p_base_skill)<>'object' then raise exception 'wizard_base_skill_missing'; end if;
  if coalesce(p_base_skill->>'id','')<>coalesce(p_base_skill_id,'') then raise exception 'wizard_base_skill_identity_mismatch'; end if;
  v_domain:=coalesce(v_progress->'domain','{}'::jsonb);
  v_active:=coalesce((v_progress->>'domainActive')::boolean,false) or coalesce((v_domain->>'active')::boolean,false);
  if not v_active then return p_base_skill; end if;
  v_selected:=coalesce(nullif(v_progress->>'ascendedSkillId',''),nullif(v_domain->>'ascensionId',''),nullif(v_domain->>'ascendedSkillId',''));
  if v_selected is null then return p_base_skill; end if;
  select * into v_form from public.wizard_domain_skill_forms_v1929
   where specialization_key=p_specialization_key and ascension_id=v_selected;
  if not found then raise exception 'wizard_domain_form_invalid_selection'; end if;
  v_used:=coalesce((v_progress->>'ascendedSkillUsedThisDomain')::boolean,false)
       or coalesce((v_domain->>'ascensionUsed')::boolean,false)
       or coalesce((v_domain->>'ascendedUsed')::boolean,false);
  if not v_used then raise exception 'wizard_domain_form_selection_not_committed'; end if;
  if v_form.base_skill_id<>p_base_skill_id then return p_base_skill; end if;

  -- Ascension data overrides authored numeric/effect properties, but base skill
  -- identity and type remain canonical for existing server-side handlers.
  v_result:=p_base_skill || v_form.form_data;
  v_result:=jsonb_set(v_result,'{id}',to_jsonb(p_base_skill_id),true);
  if p_base_skill ? 'type' then v_result:=jsonb_set(v_result,'{type}',p_base_skill->'type',true); end if;
  v_result:=jsonb_set(v_result,'{domainFormId}',to_jsonb(v_form.ascension_id),true);
  v_result:=jsonb_set(v_result,'{domainFormBaseSkillId}',to_jsonb(v_form.base_skill_id),true);
  if nullif(v_form.form_data->>'name','') is not null then
    v_result:=jsonb_set(v_result,'{name_fa}',v_form.form_data->'name',true);
    v_result:=jsonb_set(v_result,'{name}',v_form.form_data->'name',true);
  end if;
  return v_result;
end;
$$;
revoke all on function public.etranom_wizard_apply_domain_form_v1929(text,text,jsonb,jsonb) from public,anon,authenticated;

-- Patch Party RPC after it has loaded the locked server-side specialization progress.
do $$
declare v_oid oid; v_def text; v_anchor text; v_patch text; v_count integer;
begin
  v_oid:=to_regprocedure('public.etranom_party_battle_act(uuid,text,integer)');
  if v_oid is null then raise exception 'v1929_party_rpc_missing_install_v1921_first'; end if;
  v_def:=pg_get_functiondef(v_oid);
  if position('etranom_wizard_apply_domain_form_v1929' in v_def)>0 then
    null;
  else
    v_anchor:=$a$v_wizard_progress:=coalesce(v_save_data#>array['classProgress',v_spec_key],'{}'::jsonb);
      if jsonb_typeof(v_wizard_progress)<>'object' then v_wizard_progress:='{}'::jsonb; end if;$a$;
    v_count:=(length(v_def)-length(replace(v_def,v_anchor,'')))/greatest(1,length(v_anchor));
    if v_count<>1 then raise exception 'v1929_party_progress_anchor_mismatch_count_%',v_count; end if;
    v_patch:=v_anchor||E'
      if v_spec_key like ''wizard_%'' and v_skill_id is not null then
        v_skill:=public.etranom_wizard_apply_domain_form_v1929(v_spec_key,v_skill_id,v_wizard_progress,v_skill);
      end if;';
    v_def:=replace(v_def,v_anchor,v_patch);
    execute v_def;
  end if;
end $$;

-- Patch PvP Wizard skill RPC. Progress and selected form come only from the
-- locked server-side match snapshot; no client-supplied form payload is read.
do $$
declare v_oid oid; v_def text; v_anchor text; v_patch text; v_count integer;
begin
  v_oid:=to_regprocedure('public.etranom_pvp_skill_action(uuid,text,uuid,text)');
  if v_oid is null then raise exception 'v1929_pvp_skill_rpc_missing_install_v1921_first'; end if;
  v_def:=pg_get_functiondef(v_oid);
  if position('etranom_wizard_apply_domain_form_v1929' in v_def)>0 then
    null;
  else
    v_anchor:=$b$progress:=coalesce(actor->'battle'->'class_progress'->progress_key,actor->'save_snapshot'->'classProgress'->progress_key,actor->'save_snapshot'->'classProgress'->spec_key,'{}'::jsonb);
 if jsonb_typeof(progress)<>'object' then progress:='{}'::jsonb; end if;$b$;
    v_count:=(length(v_def)-length(replace(v_def,v_anchor,'')))/greatest(1,length(v_anchor));
    if v_count<>1 then raise exception 'v1929_pvp_progress_anchor_mismatch_count_%',v_count; end if;
    v_patch:=v_anchor||E'
 if spec_key like ''wizard_%'' then sd:=public.etranom_wizard_apply_domain_form_v1929(spec_key,p_skill_id,progress,sd); end if;';
    v_def:=replace(v_def,v_anchor,v_patch);
    execute v_def;
  end if;
end $$;

-- Verify installed catalog and patched RPC surfaces before commit.
do $$
declare n integer; s integer;
begin
 select count(*) into n from public.wizard_domain_skill_forms_v1929;
 if n<>40 then raise exception 'v1929_expected_40_domain_forms_found_%',n; end if;
 select count(*) into s from (select specialization_key from public.wizard_domain_skill_forms_v1929 group by specialization_key having count(*)<>10) q;
 if s<>0 then raise exception 'v1929_each_wizard_spec_must_have_10_domain_forms'; end if;
 if position('etranom_wizard_apply_domain_form_v1929' in pg_get_functiondef(to_regprocedure('public.etranom_party_battle_act(uuid,text,integer)')))=0 then raise exception 'v1929_party_rpc_patch_not_applied'; end if;
 if position('etranom_wizard_apply_domain_form_v1929' in pg_get_functiondef(to_regprocedure('public.etranom_pvp_skill_action(uuid,text,uuid,text)')))=0 then raise exception 'v1929_pvp_rpc_patch_not_applied'; end if;
end $$;

commit;
