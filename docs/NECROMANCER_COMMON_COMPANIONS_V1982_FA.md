# بسته محتوایی موجودات Common نکرومنسر — V1982

این بسته برای ۲۰ گونه رده معمولی، هویت، منشأ الهام، هشت آمار رسمی، رشد سطحی، سه مهارت فعال، ویژگی ذاتی، رفتار هوش مصنوعی و مسیر تکامل را تعریف می‌کند.

## قرارداد آمار
`power`, `speed`, `endurance`, `vitality`, `intellect`, `perception`, `luck`, `faith` تنها آمارهای پایه‌اند؛ دقیقاً همان هشت ویژگی مشترک بازیکن و موجودات. هیچ آمار جایگزینی تعریف نشده است.

## رشد سطح
سطح از ۱ تا ۱۰۰ است. مقدار هر ویژگی در سطح L از فرمول `floor(base + growthPerLevel × (L - 1))` به دست می‌آید. سطح و رده مستقل‌اند؛ این بسته فقط رده Common را ثبت می‌کند و تکامل به Uncommon فقط با آیتم اختصاصی انجام می‌شود.

## مهارت و هوش مبارزه
هر موجود سه مهارت فعال و یک ویژگی ذاتی دارد. AI اولویت‌های تاکتیکی authored را بر اساس خطر، HP خود و همراهان، تعداد دشمنان، و آماده‌بودن مهارت انتخاب می‌کند. موتور نبرد مسئول اجرای واقعی اثر، مانا/هزینه، مقاومت باس، آسیب، درمان و cooldown باقی می‌ماند.

## محدودیت ادغام
این ماژول داده و انتخاب نیت AI را فراهم می‌کند. عمداً به موتور قدیمی لژیون ده‌عضوی متصل نشده و Underworld Gate یا کلکسیون نامحدود را فعال نمی‌کند؛ اتصال آن باید در فاز مستقل و پس از جایگزینی مکانیک Legacy انجام شود.

## اسکلت کوچولو — Little Skeleton
- نقش: چابک / ضربه‌زن
- منشأ: بازآفرینی فانتزی از اسکلت‌های متحرک در روایت‌های اروپایی؛ موجودی کوچک که از استخوان‌های پراکنده دوباره سرهم شده است.
- پرتره: `assets/necromancer/companions/little_skeleton.webp`
- آمار پایه سطح ۱: power=8, speed=15, endurance=7, vitality=8, intellect=4, perception=13, luck=12, faith=5
- رشد هر سطح: power=0.18, speed=0.34, endurance=0.16, vitality=0.2, intellect=0.08, perception=0.3, luck=0.18, faith=0.08
- ویژگی ذاتی: اندام کوچک: نخستین ضربه دریافتی در هر نبرد ۸٪ کاهش می‌یابد.
- هوش مبارزه: execute_low_hp, avoid_heavy_skill, prefer_fast_target
- مهارت‌ها:
  - **تلنگر استخوانی** (`bone_tap`): نوع `physical`، هدف `single`، ضریب `105%`، بازیابی 0 نوبت، مدت 0 نوبت؛ ضربه سریع و کم‌هزینه.
  - **لغزش ریز** (`skitter_step`): نوع `defense`، هدف `self`، ضریب `0%`، بازیابی 3 نوبت، مدت 1 نوبت؛ برای یک نوبت ۱۸٪ شانس جاخالی بیشتر.
  - **پرتاب دنده** (`rib_dart`): نوع `physical`، هدف `single`، ضریب `145%`، بازیابی 3 نوبت، مدت 0 نوبت؛ اگر هدف زیر ۳۵٪ HP باشد ۲۰٪ آسیب بیشتر.
- تکامل: فقط با آیتم `companion_evolution_common_to_uncommon` به Uncommon؛ سطح حفظ می‌شود.

## روح سرگردان — Wandering Spirit
- نقش: جادویی / تضعیف
- منشأ: الهام از باورهای اروپایی درباره ارواحی که پس از مرگ آرام نگرفته‌اند.
- پرتره: `assets/necromancer/companions/wandering_spirit.webp`
- آمار پایه سطح ۱: power=4, speed=12, endurance=8, vitality=9, intellect=14, perception=10, luck=11, faith=13
- رشد هر سطح: power=0.06, speed=0.22, endurance=0.18, vitality=0.2, intellect=0.34, perception=0.18, luck=0.22, faith=0.28
- ویژگی ذاتی: بدن اثیری: نخستین مهارت جادویی دریافتی در هر سه نوبت ۸٪ تضعیف می‌شود.
- هوش مبارزه: debuff_dangerous_enemy, self_preserve_low_hp, prefer_magic_target
- مهارت‌ها:
  - **لمس طیفی** (`spectral_touch`): نوع `magic`، هدف `single`، ضریب `120%`، بازیابی 0 نوبت، مدت 0 نوبت؛ آسیب روحی تک‌هدف.
  - **ناله سرگردانی** (`lament`): نوع `debuff`، هدف `single`، ضریب `0%`، بازیابی 3 نوبت، مدت 2 نوبت؛ قدرت حمله هدف را ۱۲٪ برای دو نوبت کم می‌کند.
  - **لغزش میان‌جهان** (`phase_shift`): نوع `defense`، هدف `self`، ضریب `0%`، بازیابی 4 نوبت، مدت 1 نوبت؛ ۲۵٪ کاهش آسیب دریافتی برای یک نوبت.
- تکامل: فقط با آیتم `companion_evolution_common_to_uncommon` به Uncommon؛ سطح حفظ می‌شود.

## جیانگ‌شی — Jiangshi
- نقش: تانک / ضربه‌زن نزدیک
- منشأ: موجود برگرفته از فولکلور چینی؛ جسد متحرکی که در روایت‌های عامیانه با جهش‌های خشک حرکت می‌کند.
- پرتره: `assets/necromancer/companions/jiangshi.webp`
- آمار پایه سطح ۱: power=15, speed=6, endurance=16, vitality=15, intellect=5, perception=8, luck=14, faith=6
- رشد هر سطح: power=0.32, speed=0.08, endurance=0.34, vitality=0.34, intellect=0.08, perception=0.12, luck=0.28, faith=0.08
- ویژگی ذاتی: بدن خشک: در برابر آسیب فیزیکی ۶٪ مقاوم‌تر است.
- هوش مبارزه: protect_low_hp_ally, use_defense_when_focused, attack_nearest
- مهارت‌ها:
  - **جهش گورستانی** (`grave_hop`): نوع `physical`، هدف `single`، ضریب `135%`، بازیابی 0 نوبت، مدت 0 نوبت؛ ضربه سنگین نزدیک.
  - **چنگ سرد** (`cold_grip`): نوع `physical_debuff`، هدف `single`، ضریب `100%`، بازیابی 3 نوبت، مدت 2 نوبت؛ آسیب و کاهش سرعت هدف به میزان ۱۲٪.
  - **جسد خشکیده** (`stiffened_corpse`): نوع `defense`، هدف `self`، ضریب `0%`، بازیابی 4 نوبت، مدت 2 نوبت؛ کاهش ۲۲٪ آسیب دریافتی برای دو نوبت.
- تکامل: فقط با آیتم `companion_evolution_common_to_uncommon` به Uncommon؛ سطح حفظ می‌شود.

## گاکی — Gaki
- نقش: مکنده حیات / پشتیبان
- منشأ: برگرفته از گاکی، ارواح گرسنه در سنت بودایی ژاپن.
- پرتره: `assets/necromancer/companions/gaki.webp`
- آمار پایه سطح ۱: power=7, speed=10, endurance=9, vitality=12, intellect=13, perception=9, luck=10, faith=14
- رشد هر سطح: power=0.12, speed=0.16, endurance=0.18, vitality=0.22, intellect=0.28, perception=0.14, luck=0.18, faith=0.3
- ویژگی ذاتی: اشتهای مردگان: وقتی HP خودش زیر ۴۰٪ است، جذب حیات ۵٪ بیشتر می‌شود.
- هوش مبارزه: heal_self_or_ally_low, mark_healer, attack_wounded
- مهارت‌ها:
  - **گاز گرسنگی** (`hungry_bite`): نوع `physical_leech`، هدف `single`، ضریب `95%`، بازیابی 0 نوبت، مدت 0 نوبت؛ ۱۵٪ آسیب واردشده را به HP خود تبدیل می‌کند.
  - **نشان گرسنگی** (`starvation_mark`): نوع `debuff`، هدف `single`، ضریب `0%`، بازیابی 3 نوبت، مدت 2 نوبت؛ درمان دریافتی هدف را ۲۰٪ برای دو نوبت کم می‌کند.
  - **مکیدن جوهر** (`essence_sip`): نوع `magic_leech`، هدف `single`، ضریب `125%`، بازیابی 4 نوبت، مدت 0 نوبت؛ آسیب جادویی؛ اگر خود یا همراهی زیر ۵۰٪ HP باشد ۱۰٪ آسیب به‌صورت درمان تقسیم می‌شود.
- تکامل: فقط با آیتم `companion_evolution_common_to_uncommon` به Uncommon؛ سطح حفظ می‌شود.

## روح مرداب — Bog Wraith
- نقش: کنترل گروهی / جادویی
- منشأ: بازآفرینی فانتزی با الهام از افسانه‌ها و باورهای محلی درباره مرداب‌های تسخیرشده.
- پرتره: `assets/necromancer/companions/bog_wraith.webp`
- آمار پایه سطح ۱: power=6, speed=8, endurance=12, vitality=11, intellect=13, perception=9, luck=12, faith=11
- رشد هر سطح: power=0.1, speed=0.12, endurance=0.24, vitality=0.2, intellect=0.28, perception=0.14, luck=0.22, faith=0.18
- ویژگی ذاتی: پوست خزه‌ای: اثر کاهش سرعت روی این موجود ۲۰٪ ضعیف‌تر است.
- هوش مبارزه: control_fast_enemy, aoe_when_three_enemies, keep_distance_role
- مهارت‌ها:
  - **گلوله باتلاق** (`peat_bolt`): نوع `magic`، هدف `single`، ضریب `115%`، بازیابی 0 نوبت، مدت 0 نوبت؛ آسیب جادویی.
  - **مه فرورونده** (`sinking_mist`): نوع `aoe_debuff`، هدف `all_enemies`، ضریب `65%`، بازیابی 4 نوبت، مدت 2 نوبت؛ آسیب کم به همه دشمنان و کاهش سرعت ۱۰٪ برای دو نوبت.
  - **ریشه‌گیری** (`root_snare`): نوع `control`، هدف `single`، ضریب `0%`، بازیابی 4 نوبت، مدت 1 نوبت؛ سرعت هدف را ۲۵٪ برای یک نوبت کاهش می‌دهد؛ روی باس فقط ۸٪ کاهش سرعت.
- تکامل: فقط با آیتم `companion_evolution_common_to_uncommon` به Uncommon؛ سطح حفظ می‌شود.

## دراوگر — Draugr
- نقش: تانک سنگین
- منشأ: برگرفته از دراوگر در حماسه‌ها و فولکلور نورس؛ مرده‌ای نیرومند که گور خود را ترک می‌کند.
- پرتره: `assets/necromancer/companions/draugr.webp`
- آمار پایه سطح ۱: power=16, speed=5, endurance=17, vitality=16, intellect=5, perception=7, luck=16, faith=6
- رشد هر سطح: power=0.34, speed=0.06, endurance=0.36, vitality=0.34, intellect=0.08, perception=0.1, luck=0.32, faith=0.08
- ویژگی ذاتی: پایداری گور: وقتی HP بالای ۷۰٪ است ۸٪ کاهش آسیب دارد.
- هوش مبارزه: taunt_if_ally_threatened, defend_when_focused, rage_below_40
- مهارت‌ها:
  - **مشت گور** (`barrow_fist`): نوع `physical`، هدف `single`، ضریب `140%`، بازیابی 0 نوبت، مدت 0 نوبت؛ ضربه فیزیکی سنگین.
  - **پوست گور** (`grave_hide`): نوع `defense`، هدف `self`، ضریب `0%`، بازیابی 4 نوبت، مدت 2 نوبت؛ ۲۸٪ کاهش آسیب دریافتی برای دو نوبت.
  - **خشم مدفون** (`buried_rage`): نوع `buff`، هدف `self`، ضریب `0%`، بازیابی 5 نوبت، مدت 2 نوبت؛ اگر HP زیر ۴۰٪ باشد، قدرت حمله ۲۰٪ برای دو نوبت افزایش می‌یابد.
- تکامل: فقط با آیتم `companion_evolution_common_to_uncommon` به Uncommon؛ سطح حفظ می‌شود.

## دیو گورستان — Graveyard Div
- نقش: مهاجم / شکننده دفاع
- منشأ: بازآفرینی اختصاصی ETRANOM با الهام از دیوان اساطیر ایرانی؛ نام گونه، نام تاریخی ثبت‌شده در متون کهن نیست.
- پرتره: `assets/necromancer/companions/graveyard_div.webp`
- آمار پایه سطح ۱: power=14, speed=11, endurance=11, vitality=11, intellect=8, perception=12, luck=13, faith=8
- رشد هر سطح: power=0.3, speed=0.22, endurance=0.22, vitality=0.22, intellect=0.14, perception=0.22, luck=0.24, faith=0.12
- ویژگی ذاتی: خوی دیوانه: اگر دشمنی سپر فعال داشته باشد، ضربه شاخ ۱۰٪ مؤثرتر است.
- هوش مبارزه: break_shielded_target, debuff_many_enemies, attack_low_defense
- مهارت‌ها:
  - **یورش شاخ** (`horn_rush`): نوع `physical`، هدف `single`، ضریب `130%`، بازیابی 0 نوبت، مدت 0 نوبت؛ ضربه فیزیکی.
  - **خراش گور** (`grave_scratch`): نوع `physical_debuff`، هدف `single`، ضریب `95%`، بازیابی 3 نوبت، مدت 2 نوبت؛ کاهش دفاع هدف ۱۲٪ برای دو نوبت.
  - **غرش هراس** (`dread_roar`): نوع `aoe_debuff`، هدف `all_enemies`، ضریب `45%`، بازیابی 5 نوبت، مدت 1 نوبت؛ کاهش قدرت حمله همه دشمنان ۸٪ برای یک نوبت.
- تکامل: فقط با آیتم `companion_evolution_common_to_uncommon` به Uncommon؛ سطح حفظ می‌شود.

## غول‌مرده — Ghoul
- نقش: مهاجم / بازیابی
- منشأ: برگرفته از غول در روایت‌های عامیانه عربی و خاورمیانه؛ شکارچی گورستان‌ها و ویرانه‌ها.
- پرتره: `assets/necromancer/companions/ghoul.webp`
- آمار پایه سطح ۱: power=13, speed=12, endurance=11, vitality=12, intellect=7, perception=13, luck=9, faith=8
- رشد هر سطح: power=0.28, speed=0.22, endurance=0.22, vitality=0.24, intellect=0.12, perception=0.24, luck=0.16, faith=0.12
- ویژگی ذاتی: لاشه‌خوار: پس از کشتن دشمن ۶٪ HP خود را بازیابی می‌کند.
- هوش مبارزه: execute_low_hp, self_heal_low_hp, focus_weakest_enemy
- مهارت‌ها:
  - **چنگال گور** (`grave_claw`): نوع `physical`، هدف `single`، ضریب `125%`، بازیابی 0 نوبت، مدت 0 نوبت؛ ضربه فیزیکی.
  - **ضیافت جسد** (`corpse_feast`): نوع `physical_leech`، هدف `single`، ضریب `105%`، بازیابی 4 نوبت، مدت 0 نوبت؛ ۲۰٪ آسیب واردشده را به HP خود تبدیل می‌کند.
  - **جنون شکارچی** (`predator_frenzy`): نوع `buff`، هدف `self`، ضریب `0%`، بازیابی 5 نوبت، مدت 2 نوبت؛ قدرت حمله ۱۵٪ برای دو نوبت افزایش می‌یابد.
- تکامل: فقط با آیتم `companion_evolution_common_to_uncommon` به Uncommon؛ سطح حفظ می‌شود.

## سایه‌مرده — Shadow Wight
- نقش: قاتل / تک‌هدف
- منشأ: بازآفرینی فانتزی با الهام از مردگان بازگشته و موجودات سایه‌وار در داستان‌های اروپایی.
- پرتره: `assets/necromancer/companions/shadow_wight.webp`
- آمار پایه سطح ۱: power=9, speed=16, endurance=8, vitality=9, intellect=11, perception=16, luck=9, faith=10
- رشد هر سطح: power=0.16, speed=0.34, endurance=0.16, vitality=0.18, intellect=0.22, perception=0.34, luck=0.16, faith=0.16
- ویژگی ذاتی: شکارچی تاریکی: ضربه بحرانی ۱۰٪ آسیب اضافه دارد.
- هوش مبارزه: avoid_recent_attacker, execute_low_hp, prioritize_backline
- مهارت‌ها:
  - **برش سایه** (`shade_cut`): نوع `physical`، هدف `single`، ضریب `130%`، بازیابی 0 نوبت، مدت 0 نوبت؛ ضربه دقیق.
  - **محو شدن** (`fade`): نوع `defense`، هدف `self`، ضریب `0%`، بازیابی 4 نوبت، مدت 1 نوبت؛ افزایش جاخالی به میزان ۲۵٪ برای یک نوبت.
  - **ضربه از پس** (`backstab`): نوع `physical`، هدف `single`، ضریب `175%`، بازیابی 5 نوبت، مدت 0 نوبت؛ اگر در نوبت قبل هدف به این موجود حمله نکرده باشد، ۲۰٪ آسیب بیشتر.
- تکامل: فقط با آیتم `companion_evolution_common_to_uncommon` به Uncommon؛ سطح حفظ می‌شود.

## بانشی ضعیف — Lesser Banshee
- نقش: کنترل / جادوی گروهی
- منشأ: بانشی از فولکلور ایرلند؛ این نسخه ضعیف، بازآفرینی بازی از روحی با فریاد هشداردهنده است.
- پرتره: `assets/necromancer/companions/lesser_banshee.webp`
- آمار پایه سطح ۱: power=3, speed=12, endurance=7, vitality=8, intellect=15, perception=11, luck=13, faith=14
- رشد هر سطح: power=0.04, speed=0.22, endurance=0.14, vitality=0.18, intellect=0.34, perception=0.18, luck=0.26, faith=0.28
- ویژگی ذاتی: آوای مرگ: نخستین مهارت کنترل در هر نبرد ۱۰٪ شانس اثر بیشتر دارد.
- هوش مبارزه: silence_skill_user, aoe_when_multiple, control_high_damage_enemy
- مهارت‌ها:
  - **فریاد سوگ** (`keening_scream`): نوع `magic_aoe`، هدف `all_enemies`، ضریب `90%`، بازیابی 0 نوبت، مدت 0 نوبت؛ آسیب جادویی سبک به همه دشمنان.
  - **ناله وحشت** (`terror_wail`): نوع `control`، هدف `single`، ضریب `0%`، بازیابی 4 نوبت، مدت 1 نوبت؛ احتمال ۳۰٪ کاهش دقت هدف برای یک نوبت؛ باس‌ها فقط ۱۰٪ کاهش دقت می‌گیرند.
  - **پژواک اندوه** (`echo_of_grief`): نوع `debuff`، هدف `single`، ضریب `0%`، بازیابی 4 نوبت، مدت 2 نوبت؛ قدرت مهارت هدف ۱۲٪ برای دو نوبت کاهش می‌یابد.
- تکامل: فقط با آیتم `companion_evolution_common_to_uncommon` به Uncommon؛ سطح حفظ می‌شود.

## نوکل‌اوی جوان — Nuckelavee Spawn
- نقش: مهاجم / آلودگی
- منشأ: گونه جوان بازآفرینی‌شده از نوکل‌اوی فولکلور اورکنی؛ موجود اصلی در افسانه‌ها اهریمنی و اسب‌مانند است.
- پرتره: `assets/necromancer/companions/nuckelavee_spawn.webp`
- آمار پایه سطح ۱: power=15, speed=9, endurance=14, vitality=14, intellect=7, perception=10, luck=13, faith=7
- رشد هر سطح: power=0.32, speed=0.16, endurance=0.3, vitality=0.28, intellect=0.12, perception=0.18, luck=0.24, faith=0.1
- ویژگی ذاتی: آلودگی: دشمنی که این موجود به آن ضربه می‌زند، ۵٪ درمان کمتری دریافت می‌کند برای یک نوبت.
- هوش مبارزه: aoe_when_multiple, defend_when_low_hp, target_unhealed_enemy
- مهارت‌ها:
  - **لگد هراس** (`dread_kick`): نوع `physical`، هدف `single`، ضریب `135%`، بازیابی 0 نوبت، مدت 0 نوبت؛ ضربه سنگین.
  - **نفس تباه** (`blight_breath`): نوع `dot_aoe`، هدف `all_enemies`، ضریب `55%`، بازیابی 4 نوبت، مدت 2 نوبت؛ آسیب آغازین و اثر تباهی ۲ نوبتی.
  - **پوست آلوده** (`tainted_hide`): نوع `defense`، هدف `self`، ضریب `0%`، بازیابی 5 نوبت، مدت 2 نوبت؛ کاهش ۱۸٪ آسیب دریافتی برای دو نوبت.
- تکامل: فقط با آیتم `companion_evolution_common_to_uncommon` به Uncommon؛ سطح حفظ می‌شود.

## روح گور — Grave Spirit
- نقش: پشتیبان / محافظ
- منشأ: بازآفرینی فانتزی با الهام از باورهای محلی درباره ارواح نگهبان آرامگاه‌ها.
- پرتره: `assets/necromancer/companions/grave_spirit.webp`
- آمار پایه سطح ۱: power=5, speed=9, endurance=12, vitality=13, intellect=13, perception=10, luck=15, faith=15
- رشد هر سطح: power=0.08, speed=0.14, endurance=0.24, vitality=0.26, intellect=0.26, perception=0.16, luck=0.3, faith=0.3
- ویژگی ذاتی: نگهبان آرامگاه: سپرهای ایجادشده توسط این موجود ۱۰٪ قوی‌ترند.
- هوش مبارزه: shield_lowest_ally, heal_ally_below_50, attack_only_if_no_support_need
- مهارت‌ها:
  - **کشیدن زنجیر** (`chain_tug`): نوع `magic`، هدف `single`، ضریب `95%`، بازیابی 0 نوبت، مدت 0 نوبت؛ آسیب روحی.
  - **پرده نگهبان** (`warden_shroud`): نوع `shield`، هدف `lowest_hp_ally`، ضریب `0%`، بازیابی 4 نوبت، مدت 2 نوبت؛ به کم‌سلامت‌ترین همراه سپری برابر ۱۴٪ HP بیشینه خود می‌دهد.
  - **دعای آرامگاه** (`grave_blessing`): نوع `heal`، هدف `lowest_hp_ally`، ضریب `0%`، بازیابی 5 نوبت، مدت 0 نوبت؛ درمان کم‌مقدار بر پایه ایمان؛ اولویت با همراه زیر ۵۰٪ HP.
- تکامل: فقط با آیتم `companion_evolution_common_to_uncommon` به Uncommon؛ سطح حفظ می‌شود.

## کماندار استخوانی — Skeleton Archer
- نقش: دوربرد / تک‌هدف
- منشأ: بازآفرینی فانتزی از تیراندازان اسکلت در داستان‌های گوتیک اروپایی.
- پرتره: `assets/necromancer/companions/skeleton_archer.webp`
- آمار پایه سطح ۱: power=8, speed=13, endurance=9, vitality=10, intellect=6, perception=17, luck=10, faith=8
- رشد هر سطح: power=0.14, speed=0.26, endurance=0.18, vitality=0.2, intellect=0.1, perception=0.36, luck=0.18, faith=0.12
- ویژگی ذاتی: تیرانداز ثابت‌قدم: اگر در نوبت قبل آسیب ندیده باشد، اولین تیر ۸٪ آسیب بیشتر دارد.
- هوش مبارزه: target_low_hp, pierce_two_if_both_dangerous, avoid_attacking_tank_if_backline
- مهارت‌ها:
  - **تیر استخوانی** (`bone_arrow`): نوع `physical`، هدف `single`، ضریب `125%`، بازیابی 0 نوبت، مدت 0 نوبت؛ تیر دقیق تک‌هدف.
  - **تیر شکافنده** (`piercing_shot`): نوع `physical_multi`، هدف `two_enemies`، ضریب `85%`، بازیابی 4 نوبت، مدت 0 نوبت؛ به دو دشمن آسیب می‌زند.
  - **نشانه‌گیری آرام** (`steady_aim`): نوع `buff`، هدف `self`، ضریب `0%`، بازیابی 3 نوبت، مدت 1 نوبت؛ دقت و شانس بحرانی ضربه بعدی افزایش می‌یابد؛ ۱۸٪ دقت و ۸٪ بحرانی.
- تکامل: فقط با آیتم `companion_evolution_common_to_uncommon` به Uncommon؛ سطح حفظ می‌شود.

## نگهبان مرگ — Death Watcher
- نقش: تانک / محافظ
- منشأ: بازآفرینی فانتزی از نگهبانان مردگان در قصه‌های اروپایی؛ نه یک نام واحد در اساطیر تاریخی.
- پرتره: `assets/necromancer/companions/death_watcher.webp`
- آمار پایه سطح ۱: power=12, speed=6, endurance=16, vitality=15, intellect=9, perception=9, luck=16, faith=11
- رشد هر سطح: power=0.24, speed=0.08, endurance=0.34, vitality=0.3, intellect=0.16, perception=0.14, luck=0.32, faith=0.2
- ویژگی ذاتی: سوگند نگهبان: وقتی همراهی زیر ۳۵٪ HP باشد، دفاع این موجود ۱۲٪ افزایش می‌یابد.
- هوش مبارزه: guard_lowest_ally, shield_when_focused, attack_after_protecting
- مهارت‌ها:
  - **ضربه نگهبان** (`watcher_strike`): نوع `physical`، هدف `single`، ضریب `115%`، بازیابی 0 نوبت، مدت 0 نوبت؛ ضربه فیزیکی.
  - **میان‌گذاری** (`interpose`): نوع `guard`، هدف `lowest_hp_ally`، ضریب `0%`، بازیابی 4 نوبت، مدت 1 نوبت؛ بخشی از ضربه بعدی وارد بر کم‌سلامت‌ترین همراه را به خود منتقل می‌کند.
  - **پناه سیاه** (`blackward`): نوع `shield`، هدف `self`، ضریب `0%`، بازیابی 5 نوبت، مدت 2 نوبت؛ سپر برابر ۱۸٪ HP بیشینه خود برای دو نوبت.
- تکامل: فقط با آیتم `companion_evolution_common_to_uncommon` به Uncommon؛ سطح حفظ می‌شود.

## شعله سرگردان — Will-o’-the-Wisp
- نقش: جادویی / فریب
- منشأ: برگرفته از شعله‌های سرگردان در فولکلور اروپایی که مسافران را گمراه می‌کنند.
- پرتره: `assets/necromancer/companions/will_o_wisp.webp`
- آمار پایه سطح ۱: power=3, speed=17, endurance=7, vitality=9, intellect=15, perception=14, luck=11, faith=13
- رشد هر سطح: power=0.04, speed=0.36, endurance=0.14, vitality=0.18, intellect=0.34, perception=0.26, luck=0.18, faith=0.24
- ویژگی ذاتی: جرقه لغزان: اولین حمله دشمن در هر نبرد ۱۰٪ احتمال خطا بیشتر دارد.
- هوش مبارزه: debuff_accurate_enemy, aoe_when_three_enemies, avoid_low_hp_exposure
- مهارت‌ها:
  - **شعله آبی** (`blueflame`): نوع `magic`، هدف `single`، ضریب `125%`، بازیابی 0 نوبت، مدت 0 نوبت؛ آسیب جادویی.
  - **نور گمراه‌کننده** (`misleading_glow`): نوع `debuff`، هدف `single`، ضریب `0%`، بازیابی 3 نوبت، مدت 2 نوبت؛ دقت هدف ۱۵٪ برای دو نوبت کاهش می‌یابد.
  - **فروغ روح** (`soulflare`): نوع `magic_aoe`، هدف `all_enemies`، ضریب `105%`، بازیابی 5 نوبت، مدت 0 نوبت؛ انفجار جادویی به همه دشمنان؛ اگر سه دشمن زنده باشند ۱۰٪ آسیب کمتر.
- تکامل: فقط با آیتم `companion_evolution_common_to_uncommon` به Uncommon؛ سطح حفظ می‌شود.

## روح بی‌چهره — Faceless Wraith
- نقش: اختلال‌گر / ضدجادو
- منشأ: بازآفرینی فانتزی با الهام از ارواح بی‌چهره در ادبیات ترسناک؛ موجودی بی‌هویت و خاموش.
- پرتره: `assets/necromancer/companions/faceless_wraith.webp`
- آمار پایه سطح ۱: power=5, speed=12, endurance=10, vitality=11, intellect=14, perception=13, luck=14, faith=12
- رشد هر سطح: power=0.08, speed=0.22, endurance=0.2, vitality=0.22, intellect=0.3, perception=0.24, luck=0.28, faith=0.22
- ویژگی ذاتی: بی‌هویتی: در برابر اثرات ترس و سکوت ۱۵٪ مقاومت دارد.
- هوش مبارزه: silence_skill_user, debuff_boss_instead_of_lock, target_highest_intellect
- مهارت‌ها:
  - **لمس بی‌نام** (`nameless_touch`): نوع `magic`، هدف `single`، ضریب `110%`، بازیابی 0 نوبت، مدت 0 نوبت؛ آسیب جادویی.
  - **خاموشی** (`hush`): نوع `silence`، هدف `single`، ضریب `0%`، بازیابی 5 نوبت، مدت 1 نوبت؛ مهارت بعدی هدف را برای یک نوبت قفل می‌کند؛ روی باس فقط ۲۰٪ کاهش قدرت مهارت.
  - **محو هویت** (`identity_drain`): نوع `debuff`، هدف `single`، ضریب `0%`، بازیابی 4 نوبت، مدت 2 نوبت؛ قدرت حمله هدف ۱۰٪ و دقت ۱۰٪ برای دو نوبت کاهش می‌یابد.
- تکامل: فقط با آیتم `companion_evolution_common_to_uncommon` به Uncommon؛ سطح حفظ می‌شود.

## مومیایی کوچک — Lesser Mummy
- نقش: تانک / نفرین
- منشأ: الهام از تدفین مصر باستان و روایت‌های متأخر درباره مومیایی‌های زنده؛ این گونه بازی تخیلی است.
- پرتره: `assets/necromancer/companions/lesser_mummy.webp`
- آمار پایه سطح ۱: power=10, speed=5, endurance=16, vitality=15, intellect=9, perception=8, luck=15, faith=12
- رشد هر سطح: power=0.2, speed=0.06, endurance=0.34, vitality=0.32, intellect=0.16, perception=0.12, luck=0.3, faith=0.22
- ویژگی ذاتی: پارچه محافظ: نخستین اثر آسیب‌دور در هر نبرد ۱۰٪ کمتر اثر می‌کند.
- هوش مبارزه: control_fast_enemy, hex_high_defense_enemy, defend_when_low_hp
- مهارت‌ها:
  - **چنگال مومیایی** (`wrapped_claw`): نوع `physical`، هدف `single`، ضریب `115%`، بازیابی 0 نوبت، مدت 0 نوبت؛ ضربه فیزیکی.
  - **پارچه بندآور** (`binding_linen`): نوع `control`، هدف `single`، ضریب `0%`، بازیابی 4 نوبت، مدت 1 نوبت؛ سرعت هدف ۲۰٪ کاهش می‌یابد؛ روی باس ۷٪.
  - **نفرین باستانی** (`ancient_hex`): نوع `magic_debuff`، هدف `single`، ضریب `100%`، بازیابی 5 نوبت، مدت 2 نوبت؛ آسیب جادویی و کاهش دفاع ۱۰٪ برای دو نوبت.
- تکامل: فقط با آیتم `companion_evolution_common_to_uncommon` به Uncommon؛ سطح حفظ می‌شود.

## کاگه اونریو — Kage Onryō
- نقش: قاتل جادویی / انتقام
- منشأ: اونریو در فولکلور ژاپن روح انتقام‌جو است؛ «کاگه» و ترکیب گونه‌ای آن بازآفرینی اختصاصی ETRANOM است.
- پرتره: `assets/necromancer/companions/kage_onryo.webp`
- آمار پایه سطح ۱: power=6, speed=16, endurance=8, vitality=10, intellect=15, perception=15, luck=13, faith=14
- رشد هر سطح: power=0.1, speed=0.34, endurance=0.16, vitality=0.2, intellect=0.32, perception=0.3, luck=0.24, faith=0.26
- ویژگی ذاتی: کینه بازتابی: اگر دشمنی به این موجود ضربه بزند، حمله بعدی این موجود به همان هدف ۸٪ قوی‌تر است.
- هوش مبارزه: retaliate_recent_attacker, mark_priority_target, evade_when_targeted
- مهارت‌ها:
  - **چنگال انتقام** (`vengeful_claw`): نوع `hybrid`، هدف `single`، ضریب `125%`، بازیابی 0 نوبت، مدت 0 نوبت؛ آسیب ترکیبی.
  - **نشان کینه** (`grudge_mark`): نوع `debuff`، هدف `single`، ضریب `0%`، بازیابی 3 نوبت، مدت 2 نوبت؛ هدف ۱۵٪ آسیب بیشتر از این موجود دریافت می‌کند برای دو نوبت.
  - **لغزش سایه** (`shadow_drift`): نوع `defense`، هدف `self`، ضریب `0%`، بازیابی 4 نوبت، مدت 1 نوبت؛ ۳۰٪ احتمال جاخالی بیشتر برای یک نوبت.
- تکامل: فقط با آیتم `companion_evolution_common_to_uncommon` به Uncommon؛ سطح حفظ می‌شود.

## بازگشته نفرین‌شده — Cursed Revenant
- نقش: مبارز متعادل
- منشأ: الهام از revenant در روایت‌های اروپایی؛ مرده‌ای که برای اجرای انتقام بازمی‌گردد.
- پرتره: `assets/necromancer/companions/cursed_revenant.webp`
- آمار پایه سطح ۱: power=14, speed=8, endurance=14, vitality=14, intellect=10, perception=11, luck=15, faith=10
- رشد هر سطح: power=0.28, speed=0.14, endurance=0.28, vitality=0.28, intellect=0.18, perception=0.18, luck=0.28, faith=0.16
- ویژگی ذاتی: بازگشت‌ناپذیر: زیر ۳۰٪ HP، استقامت مؤثر ۱۰٪ افزایش می‌یابد.
- هوش مبارزه: brand_highest_threat, defend_below_45, attack_marked_target
- مهارت‌ها:
  - **تیغه نفرین‌شده** (`cursed_blade`): نوع `physical`، هدف `single`، ضریب `125%`، بازیابی 0 نوبت، مدت 0 نوبت؛ ضربه فیزیکی.
  - **ایستادگی بازگشته** (`unyielding_stance`): نوع `defense`، هدف `self`، ضریب `0%`، بازیابی 4 نوبت، مدت 2 نوبت؛ کاهش ۲۰٪ آسیب دریافتی برای دو نوبت.
  - **داغ انتقام** (`revenge_brand`): نوع `debuff`، هدف `single`، ضریب `0%`، بازیابی 5 نوبت، مدت 2 نوبت؛ هدف ۱۲٪ آسیب بیشتر از همه منابع دریافت می‌کند برای دو نوبت.
- تکامل: فقط با آیتم `companion_evolution_common_to_uncommon` به Uncommon؛ سطح حفظ می‌شود.

## روح گرسنه جنگل — Forest Hungry Spirit
- نقش: کنترل / جذب حیات
- منشأ: بازآفرینی فانتزی با الهام از ارواح طبیعت و موجودات گرسنه در فولکلورهای جنگلی جهان.
- پرتره: `assets/necromancer/companions/forest_hungry_spirit.webp`
- آمار پایه سطح ۱: power=8, speed=9, endurance=12, vitality=13, intellect=13, perception=10, luck=12, faith=14
- رشد هر سطح: power=0.14, speed=0.16, endurance=0.24, vitality=0.26, intellect=0.26, perception=0.18, luck=0.22, faith=0.28
- ویژگی ذاتی: ریشه‌خواری: با هر اثر آسیب دوره‌ای که اعمال می‌کند، ۳٪ HP خود را بازیابی می‌کند؛ حداکثر یک‌بار در هر نوبت.
- هوش مبارزه: root_fast_enemy, heal_lowest_ally, multi_target_if_two_threats
- مهارت‌ها:
  - **ریشه خاردار** (`thorn_root`): نوع `physical_debuff`، هدف `single`، ضریب `105%`، بازیابی 0 نوبت، مدت 2 نوبت؛ آسیب و زخم ریشه‌ای سبک برای دو نوبت.
  - **چنگال وحشی** (`wild_grasp`): نوع `physical_multi`، هدف `two_enemies`، ضریب `90%`، بازیابی 4 نوبت، مدت 0 نوبت؛ به دو دشمن آسیب می‌زند.
  - **شکوفه حیات** (`life_bloom`): نوع `heal`، هدف `lowest_hp_ally`، ضریب `0%`، بازیابی 5 نوبت، مدت 0 نوبت؛ درمان کم‌مقدار همراه با کمترین HP؛ قدرت درمان با ایمان مقیاس می‌شود.
- تکامل: فقط با آیتم `companion_evolution_common_to_uncommon` به Uncommon؛ سطح حفظ می‌شود.
