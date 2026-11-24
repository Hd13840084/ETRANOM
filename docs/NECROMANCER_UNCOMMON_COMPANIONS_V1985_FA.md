# ETRANOM V1985 — موجودات رده غیرمعمول نکرومنسر

این بسته ۲۰ گونه مستقل Uncommon را به Bestiary اضافه می‌کند. هر گونه دارای پیشینه، نقش، هشت آمار رسمی، رشد سطح ۱ تا ۱۰۰، سه مهارت، ویژگی ذاتی، قواعد هوش مبارزه و مسیر تکامل به Rare است.

## هشت آمار رسمی
قدرت، سرعت، استقامت، سرزندگی، هوش، ادراک، شانس، ایمان. هیچ آمار جایگزینی تعریف نشده است.

## فهرست موجودات

### شوالیه گور — Grave Knight
- نقش: تانک / ضدحمله
- پیشینه: نگهبان زره‌پوش آرامگاه‌های فراموش‌شده در افسانه‌پردازی گوتیک اروپایی.
- آمار سطح ۱: power 16، speed 7، endurance 17، vitality 16، intellect 7، perception 10، luck 7، faith 13
- رشد هر سطح: power +0.29، speed +0.13، endurance +0.37، vitality +0.35، intellect +0.13، perception +0.18، luck +0.13، faith +0.23
- مهارت دفاع سپرگور (guard): دفاع سپرگور؛ کاهش ۲۸٪ آسیب برای ۲ نوبت.؛ هدف self؛ قدرت 0٪؛ بازگشت 0 نوبت.
- مهارت پاسخ فولادی (physical): پاسخ فولادی؛ ضربه مستقیم با ۱۲۵٪ قدرت به مهاجم منتخب.؛ هدف single؛ قدرت 125٪؛ بازگشت 3 نوبت.
- مهارت فریاد مقبره (debuff): فریاد مقبره؛ کاهش ۱۲٪ قدرت حمله دشمن برای ۲ نوبت.؛ هدف single؛ قدرت 0٪؛ بازگشت 4 نوبت.
- ویژگی ذاتی: استعداد رده غیرمعمول: تانک / ضدحمله؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند.
- هوش مبارزه: protect_low_hp_ally, self_preserve_low_hp, use_ready_role_skill, avoid_overkill
- تکامل: Rare با آیتم `companion_evolution_uncommon_to_rare`؛ سطح حفظ می‌شود.

### نگهبان خاکستر — Ashen Warden
- نقش: تانک / پشتیبان
- پیشینه: نگهبان آتشکده‌ای سوخته؛ بازآفرینی فانتزی با الهام از ارواح نگهبان آتش.
- آمار سطح ۱: power 12، speed 8، endurance 16، vitality 17، intellect 9، perception 10، luck 8، faith 15
- رشد هر سطح: power +0.22، speed +0.14، endurance +0.35، vitality +0.37، intellect +0.16، perception +0.18، luck +0.14، faith +0.27
- مهارت پرده خاکستر (shield): پرده خاکستر؛ سپر برابر ۱۸٪ HP بیشینه برای خود و ضعیف‌ترین همراه.؛ هدف lowest_hp_ally؛ قدرت 0٪؛ بازگشت 0 نوبت.
- مهارت خاکستر خفه‌کن (debuff): خاکستر خفه‌کن؛ کاهش ۱۲٪ قدرت حمله همه دشمنان برای ۲ نوبت.؛ هدف single؛ قدرت 0٪؛ بازگشت 3 نوبت.
- مهارت جرقه بازمانده (heal): جرقه بازمانده؛ درمان ۱۴٪ HP بیشینه یک همراه.؛ هدف lowest_hp_ally؛ قدرت 0٪؛ بازگشت 4 نوبت.
- ویژگی ذاتی: استعداد رده غیرمعمول: تانک / پشتیبان؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند.
- هوش مبارزه: shield_team, self_preserve_low_hp, use_ready_role_skill, avoid_overkill
- تکامل: Rare با آیتم `companion_evolution_uncommon_to_rare`؛ سطح حفظ می‌شود.

### روح فانوس — Lantern Wraith
- نقش: جادویی / کنترل
- پیشینه: روح راهنمای گمراه‌کننده با الهام از چراغ‌های سرگردان فولکلور شرق آسیا و اروپا.
- آمار سطح ۱: power 5، speed 14، endurance 9، vitality 11، intellect 17، perception 14، luck 12، faith 13
- رشد هر سطح: power +0.09، speed +0.25، endurance +0.16، vitality +0.2، intellect +0.31، perception +0.25، luck +0.22، faith +0.23
- مهارت نور سرد (magic): نور سرد؛ آسیب جادویی ۱۲۵٪ به یک هدف.؛ هدف single؛ قدرت 125٪؛ بازگشت 0 نوبت.
- مهارت فانوس گمراهی (control): فانوس گمراهی؛ کاهش ۲۵٪ سرعت و دقت هدف برای ۲ نوبت.؛ هدف single؛ قدرت 0٪؛ بازگشت 3 نوبت.
- مهارت شعله راهنما (magic_aoe): شعله راهنما؛ آسیب ۸۵٪ به همه دشمنان.؛ هدف all_enemies؛ قدرت 90٪؛ بازگشت 4 نوبت.
- ویژگی ذاتی: استعداد رده غیرمعمول: جادویی / کنترل؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند.
- هوش مبارزه: disable_fast_enemy, self_preserve_low_hp, use_ready_role_skill, avoid_overkill
- تکامل: Rare با آیتم `companion_evolution_uncommon_to_rare`؛ سطح حفظ می‌شود.

### غیب‌گوی استخوان — Bone Oracle
- نقش: جادویی / تضعیف
- پیشینه: پیشگوی مردگان در بازآفرینی فانتزی با الهام از فال‌گیری استخوانی در فرهنگ‌های گوناگون.
- آمار سطح ۱: power 6، speed 9، endurance 10، vitality 12، intellect 18، perception 17، luck 11، faith 16
- رشد هر سطح: power +0.11، speed +0.16، endurance +0.18، vitality +0.22، intellect +0.32، perception +0.31، luck +0.2، faith +0.29
- مهارت خوانش سرنوشت (debuff): خوانش سرنوشت؛ کاهش ۱۵٪ دفاع یک دشمن برای ۲ نوبت.؛ هدف single؛ قدرت 0٪؛ بازگشت 0 نوبت.
- مهارت نیزه استخوان (magic): نیزه استخوان؛ آسیب جادویی ۱۳۵٪.؛ هدف single؛ قدرت 125٪؛ بازگشت 3 نوبت.
- مهارت پیش‌آگاهی (buff): پیش‌آگاهی؛ افزایش ۱۲٪ دقت و شانس بحرانی همراهان برای ۲ نوبت.؛ هدف self؛ قدرت 0٪؛ بازگشت 4 نوبت.
- ویژگی ذاتی: استعداد رده غیرمعمول: جادویی / تضعیف؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند.
- هوش مبارزه: debuff_elite, self_preserve_low_hp, use_ready_role_skill, avoid_overkill
- تکامل: Rare با آیتم `companion_evolution_uncommon_to_rare`؛ سطح حفظ می‌شود.

### اونی بازگشته — Oni Revenant
- نقش: مهاجم / شکننده دفاع
- پیشینه: بازگشته‌ای اهریمنی با الهام از اونی در فولکلور ژاپن؛ این گونه طراحی اختصاصی بازی است.
- آمار سطح ۱: power 18، speed 10، endurance 15، vitality 14، intellect 8، perception 11، luck 9، faith 12
- رشد هر سطح: power +0.32، speed +0.18، endurance +0.33، vitality +0.25، intellect +0.14، perception +0.2، luck +0.16، faith +0.22
- مهارت کوبش کانابو (physical): کوبش کانابو؛ آسیب ۱۵۰٪ به یک هدف.؛ هدف single؛ قدرت 125٪؛ بازگشت 0 نوبت.
- مهارت شکستن زره (physical_debuff): شکستن زره؛ آسیب ۱۰۰٪ و کاهش ۱۸٪ دفاع هدف برای ۲ نوبت.؛ هدف single؛ قدرت 90٪؛ بازگشت 3 نوبت.
- مهارت خشم اونی (buff): خشم اونی؛ افزایش ۲۰٪ قدرت برای ۲ نوبت.؛ هدف self؛ قدرت 0٪؛ بازگشت 4 نوبت.
- ویژگی ذاتی: استعداد رده غیرمعمول: مهاجم / شکننده دفاع؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند.
- هوش مبارزه: break_high_defense, self_preserve_low_hp, use_ready_role_skill, avoid_overkill
- تکامل: Rare با آیتم `companion_evolution_uncommon_to_rare`؛ سطح حفظ می‌شود.

### نگهبان جیانگ‌شی — Jiangshi Sentinel
- نقش: تانک / ضدجادو
- پیشینه: گونه نگهبان جیانگ‌شی با طلسم‌های کاغذی؛ گسترش خیالی از فولکلور چینی.
- آمار سطح ۱: power 14، speed 7، endurance 18، vitality 17، intellect 8، perception 9، luck 10، faith 14
- رشد هر سطح: power +0.25، speed +0.13، endurance +0.38، vitality +0.37، intellect +0.14، perception +0.16، luck +0.18، faith +0.25
- مهارت مهر کاغذی (guard): مهر کاغذی؛ کاهش ۳۰٪ آسیب دریافتی برای ۲ نوبت.؛ هدف self؛ قدرت 0٪؛ بازگشت 0 نوبت.
- مهارت جهش مدفون (physical): جهش مدفون؛ آسیب ۱۳۵٪.؛ هدف single؛ قدرت 125٪؛ بازگشت 3 نوبت.
- مهارت نفس سرد (debuff): نفس سرد؛ کاهش ۱۵٪ هوش/قدرت جادویی هدف برای ۲ نوبت.؛ هدف single؛ قدرت 0٪؛ بازگشت 4 نوبت.
- ویژگی ذاتی: استعداد رده غیرمعمول: تانک / ضدجادو؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند.
- هوش مبارزه: resist_magic_and_guard, self_preserve_low_hp, use_ready_role_skill, avoid_overkill
- تکامل: Rare با آیتم `companion_evolution_uncommon_to_rare`؛ سطح حفظ می‌شود.

### درنده لاشه‌خوار — Carrion Brute
- نقش: مهاجم / بازیابی
- پیشینه: موجودی لاشه‌خوار در بازآفرینی هیولایی با الهام از غول‌ها و مردارخواران فولکلور.
- آمار سطح ۱: power 17، speed 8، endurance 16، vitality 15، intellect 6، perception 10، luck 8، faith 8
- رشد هر سطح: power +0.31، speed +0.14، endurance +0.35، vitality +0.33، intellect +0.11، perception +0.18، luck +0.14، faith +0.14
- مهارت گاز لاشه (physical_leech): گاز لاشه؛ آسیب ۱۳۰٪ و بازیابی ۱۵٪ آسیب واردشده.؛ هدف single؛ قدرت 110٪؛ بازگشت 0 نوبت.
- مهارت چنگال شکافنده (physical): چنگال شکافنده؛ آسیب ۱۴۵٪.؛ هدف single؛ قدرت 125٪؛ بازگشت 3 نوبت.
- مهارت جنون تغذیه (buff): جنون تغذیه؛ افزایش ۱۵٪ قدرت برای ۲ نوبت پس از کشتن دشمن.؛ هدف self؛ قدرت 0٪؛ بازگشت 4 نوبت.
- ویژگی ذاتی: استعداد رده غیرمعمول: مهاجم / بازیابی؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند.
- هوش مبارزه: finish_wounded_target, self_preserve_low_hp, use_ready_role_skill, avoid_overkill
- تکامل: Rare با آیتم `companion_evolution_uncommon_to_rare`؛ سطح حفظ می‌شود.

### عروس سوگوار — Mourning Bride
- نقش: جادویی / پشتیبان
- پیشینه: روح عروس داغدار؛ بازآفرینی فانتزی با الهام از افسانه‌های ارواح سوگوار اروپای شرقی.
- آمار سطح ۱: power 6، speed 12، endurance 10، vitality 13، intellect 16، perception 12، luck 10، faith 17
- رشد هر سطح: power +0.11، speed +0.22، endurance +0.18، vitality +0.23، intellect +0.29، perception +0.22، luck +0.18، faith +0.31
- مهارت مرثیه تسکین (heal): مرثیه تسکین؛ درمان ۲۰٪ HP بیشینه ضعیف‌ترین همراه.؛ هدف lowest_hp_ally؛ قدرت 0٪؛ بازگشت 0 نوبت.
- مهارت اشک سیاه (debuff): اشک سیاه؛ کاهش ۱۵٪ قدرت حمله دشمن برای ۲ نوبت.؛ هدف single؛ قدرت 0٪؛ بازگشت 3 نوبت.
- مهارت حلقه شکسته (magic): حلقه شکسته؛ آسیب جادویی ۱۱۵٪.؛ هدف single؛ قدرت 125٪؛ بازگشت 4 نوبت.
- ویژگی ذاتی: استعداد رده غیرمعمول: جادویی / پشتیبان؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند.
- هوش مبارزه: heal_critical_ally, self_preserve_low_hp, use_ready_role_skill, avoid_overkill
- تکامل: Rare با آیتم `companion_evolution_uncommon_to_rare`؛ سطح حفظ می‌شود.

### بانشی سرخ — Crimson Banshee
- نقش: جادویی / چندهدف
- پیشینه: گونه‌ای جنگاور از بانشی ایرلندی؛ رنگ سرخ و مهارت‌های رزمی ساخته بازی هستند.
- آمار سطح ۱: power 7، speed 13، endurance 9، vitality 11، intellect 18، perception 13، luck 12، faith 16
- رشد هر سطح: power +0.13، speed +0.23، endurance +0.16، vitality +0.2، intellect +0.32، perception +0.23، luck +0.22، faith +0.29
- مهارت جیغ سرخ (magic_aoe): جیغ سرخ؛ آسیب جادویی ۹۵٪ به همه دشمنان.؛ هدف all_enemies؛ قدرت 90٪؛ بازگشت 0 نوبت.
- مهارت ناله خونین (debuff): ناله خونین؛ کاهش ۱۲٪ دقت همه دشمنان برای ۲ نوبت.؛ هدف single؛ قدرت 0٪؛ بازگشت 3 نوبت.
- مهارت پرتاب پژواک (magic): پرتاب پژواک؛ آسیب جادویی ۱۴۰٪ به یک هدف.؛ هدف single؛ قدرت 125٪؛ بازگشت 4 نوبت.
- ویژگی ذاتی: استعداد رده غیرمعمول: جادویی / چندهدف؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند.
- هوش مبارزه: aoe_when_many_enemies, self_preserve_low_hp, use_ready_role_skill, avoid_overkill
- تکامل: Rare با آیتم `companion_evolution_uncommon_to_rare`؛ سطح حفظ می‌شود.

### سگ شکاری اخگر — Ember Hound
- نقش: مهاجم سریع / آتشین
- پیشینه: سگ نگهبان آتشین؛ بازآفرینی فانتزی با الهام از سگ‌های ماورایی نگهبان جهان زیرین.
- آمار سطح ۱: power 13، speed 17، endurance 10، vitality 12، intellect 11، perception 16، luck 13، faith 8
- رشد هر سطح: power +0.23، speed +0.31، endurance +0.18، vitality +0.22، intellect +0.2، perception +0.29، luck +0.23، faith +0.14
- مهارت گاز اخگری (physical): گاز اخگری؛ آسیب ۱۲۵٪ و اثر سوختگی سبک.؛ هدف single؛ قدرت 125٪؛ بازگشت 0 نوبت.
- مهارت یورش شعله‌ور (physical_multi): یورش شعله‌ور؛ آسیب ۹۰٪ به دو دشمن.؛ هدف two_enemies؛ قدرت 90٪؛ بازگشت 3 نوبت.
- مهارت رد اخگر (buff): رد اخگر؛ افزایش ۱۸٪ سرعت برای ۲ نوبت.؛ هدف self؛ قدرت 0٪؛ بازگشت 4 نوبت.
- ویژگی ذاتی: استعداد رده غیرمعمول: مهاجم سریع / آتشین؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند.
- هوش مبارزه: attack_lowest_hp, self_preserve_low_hp, use_ready_role_skill, avoid_overkill
- تکامل: Rare با آیتم `companion_evolution_uncommon_to_rare`؛ سطح حفظ می‌شود.

### غارتگر مقبره — Tomb Reaver
- نقش: قاتل / نفوذگر
- پیشینه: مرده‌ای غارتگر با الهام از نگهبانان نفرین‌شده گورها در افسانه‌پردازی مصر و خاورمیانه.
- آمار سطح ۱: power 14، speed 16، endurance 11، vitality 11، intellect 8، perception 17، luck 12، faith 9
- رشد هر سطح: power +0.25، speed +0.29، endurance +0.2، vitality +0.2، intellect +0.14، perception +0.31، luck +0.22، faith +0.16
- مهارت خنجر تدفین (physical): خنجر تدفین؛ آسیب ۱۳۵٪.؛ هدف single؛ قدرت 125٪؛ بازگشت 0 نوبت.
- مهارت زخم عمیق (physical_debuff): زخم عمیق؛ آسیب ۹۰٪ و کاهش ۱۲٪ دفاع برای ۲ نوبت.؛ هدف single؛ قدرت 90٪؛ بازگشت 3 نوبت.
- مهارت گام بی‌صدا (buff): گام بی‌صدا؛ افزایش ۲۰٪ جاخالی برای یک نوبت.؛ هدف self؛ قدرت 0٪؛ بازگشت 4 نوبت.
- ویژگی ذاتی: استعداد رده غیرمعمول: قاتل / نفوذگر؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند.
- هوش مبارزه: target_backline, self_preserve_low_hp, use_ready_role_skill, avoid_overkill
- تکامل: Rare با آیتم `companion_evolution_uncommon_to_rare`؛ سطح حفظ می‌شود.

### نکرومنسر یخی — Frost Necromancer
- نقش: جادویی / کنترل گروهی
- پیشینه: جادوگر مرده‌ای از سرزمین‌های سرد؛ بازآفرینی فانتزی با الهام از جادوگران زمستانی شمال اروپا.
- آمار سطح ۱: power 5، speed 10، endurance 11، vitality 12، intellect 19، perception 14، luck 9، faith 16
- رشد هر سطح: power +0.09، speed +0.18، endurance +0.2، vitality +0.22، intellect +0.34، perception +0.25، luck +0.16، faith +0.29
- مهارت تگرگ استخوان (magic_aoe): تگرگ استخوان؛ آسیب ۸۵٪ به همه دشمنان.؛ هدف all_enemies؛ قدرت 90٪؛ بازگشت 0 نوبت.
- مهارت یخ‌زدگی روح (control): یخ‌زدگی روح؛ کاهش ۳۰٪ سرعت یک هدف برای ۲ نوبت.؛ هدف single؛ قدرت 0٪؛ بازگشت 3 نوبت.
- مهارت نیزه یخ‌گور (magic): نیزه یخ‌گور؛ آسیب جادویی ۱۴۵٪.؛ هدف single؛ قدرت 125٪؛ بازگشت 4 نوبت.
- ویژگی ذاتی: استعداد رده غیرمعمول: جادویی / کنترل گروهی؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند.
- هوش مبارزه: control_dangerous_enemy, self_preserve_low_hp, use_ready_role_skill, avoid_overkill
- تکامل: Rare با آیتم `companion_evolution_uncommon_to_rare`؛ سطح حفظ می‌شود.

### سگ استخوانی — Bone Hound
- نقش: شکارچی / تعقیب‌کننده
- پیشینه: سگ شکاری ساخته‌شده از استخوان‌های جانوران؛ موجودی اختصاصی در جهان ETRANOM.
- آمار سطح ۱: power 13، speed 18، endurance 12، vitality 13، intellect 5، perception 17، luck 14، faith 7
- رشد هر سطح: power +0.23، speed +0.32، endurance +0.22، vitality +0.23، intellect +0.09، perception +0.31، luck +0.25، faith +0.13
- مهارت گاز استخوانی (physical): گاز استخوانی؛ آسیب ۱۲۵٪.؛ هدف single؛ قدرت 125٪؛ بازگشت 0 نوبت.
- مهارت تعقیب گله‌ای (physical_multi): تعقیب گله‌ای؛ آسیب ۸۵٪ به دو هدف.؛ هدف two_enemies؛ قدرت 90٪؛ بازگشت 3 نوبت.
- مهارت بوی مرگ (buff): بوی مرگ؛ افزایش ۱۵٪ دقت و سرعت برای ۲ نوبت.؛ هدف self؛ قدرت 0٪؛ بازگشت 4 نوبت.
- ویژگی ذاتی: استعداد رده غیرمعمول: شکارچی / تعقیب‌کننده؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند.
- هوش مبارزه: hunt_low_hp, self_preserve_low_hp, use_ready_role_skill, avoid_overkill
- تکامل: Rare با آیتم `companion_evolution_uncommon_to_rare`؛ سطح حفظ می‌شود.

### پیرو داس‌دار — Reaper Acolyte
- نقش: مهاجم / تضعیف
- پیشینه: خدمتگزار فرقه مرگ در بازآفرینی گوتیک؛ نه برگرفته از یک موجود تاریخی واحد.
- آمار سطح ۱: power 15، speed 12، endurance 12، vitality 13، intellect 13، perception 13، luck 9، faith 17
- رشد هر سطح: power +0.27، speed +0.22، endurance +0.22، vitality +0.23، intellect +0.23، perception +0.23، luck +0.16، faith +0.31
- مهارت داس کوچک (physical): داس کوچک؛ آسیب ۱۳۵٪.؛ هدف single؛ قدرت 125٪؛ بازگشت 0 نوبت.
- مهارت نشان پایان (debuff): نشان پایان؛ هدف تا ۲ نوبت ۱۲٪ آسیب بیشتری دریافت می‌کند.؛ هدف single؛ قدرت 0٪؛ بازگشت 3 نوبت.
- مهارت برش روح (magic): برش روح؛ آسیب ترکیبی ۱۲۵٪.؛ هدف single؛ قدرت 125٪؛ بازگشت 4 نوبت.
- ویژگی ذاتی: استعداد رده غیرمعمول: مهاجم / تضعیف؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند.
- هوش مبارزه: mark_high_threat, self_preserve_low_hp, use_ready_role_skill, avoid_overkill
- تکامل: Rare با آیتم `companion_evolution_uncommon_to_rare`؛ سطح حفظ می‌شود.

### بانشی رنگ‌پریده — Pale Banshee
- نقش: جادویی / پشتیبانی
- پیشینه: گونه‌ای آرام‌تر از بانشی ایرلندی در بازآفرینی اختصاصی بازی.
- آمار سطح ۱: power 5، speed 14، endurance 10، vitality 13، intellect 17، perception 13، luck 11، faith 18
- رشد هر سطح: power +0.09، speed +0.25، endurance +0.18، vitality +0.23، intellect +0.31، perception +0.23، luck +0.2، faith +0.32
- مهارت آوای آرامش (heal): آوای آرامش؛ درمان ۱۸٪ HP بیشینه ضعیف‌ترین همراه.؛ هدف lowest_hp_ally؛ قدرت 0٪؛ بازگشت 0 نوبت.
- مهارت فریاد سپید (magic_aoe): فریاد سپید؛ آسیب جادویی ۸۰٪ به همه دشمنان.؛ هدف all_enemies؛ قدرت 90٪؛ بازگشت 3 نوبت.
- مهارت پرده ناله (shield): پرده ناله؛ سپر ۱۵٪ HP بیشینه برای یک همراه.؛ هدف lowest_hp_ally؛ قدرت 0٪؛ بازگشت 4 نوبت.
- ویژگی ذاتی: استعداد رده غیرمعمول: جادویی / پشتیبانی؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند.
- هوش مبارزه: support_team_low_hp, self_preserve_low_hp, use_ready_role_skill, avoid_overkill
- تکامل: Rare با آیتم `companion_evolution_uncommon_to_rare`؛ سطح حفظ می‌شود.

### نگهبان فرعون — Pharaoh Guardian
- نقش: تانک / ضدحمله
- پیشینه: نگهبان مقبره با الهام از شمایل‌های تدفینی مصر باستان؛ موجود زنده اسطوره‌ای مشخصی نیست.
- آمار سطح ۱: power 16، speed 7، endurance 19، vitality 18، intellect 10، perception 11، luck 8، faith 16
- رشد هر سطح: power +0.29، speed +0.13، endurance +0.38، vitality +0.38، intellect +0.18، perception +0.2، luck +0.14، faith +0.29
- مهارت سپر سلطنتی (guard): سپر سلطنتی؛ کاهش ۳۲٪ آسیب برای ۲ نوبت.؛ هدف self؛ قدرت 0٪؛ بازگشت 0 نوبت.
- مهارت عقوبت فرعون (physical): عقوبت فرعون؛ ضربه سنگین با ۱۳۵٪ قدرت.؛ هدف single؛ قدرت 125٪؛ بازگشت 3 نوبت.
- مهارت فرمان سکوت (debuff): فرمان سکوت؛ کاهش ۱۵٪ قدرت حمله دشمن برای ۲ نوبت.؛ هدف single؛ قدرت 0٪؛ بازگشت 4 نوبت.
- ویژگی ذاتی: استعداد رده غیرمعمول: تانک / ضدحمله؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند.
- هوش مبارزه: guard_and_counter, self_preserve_low_hp, use_ready_role_skill, avoid_overkill
- تکامل: Rare با آیتم `companion_evolution_uncommon_to_rare`؛ سطح حفظ می‌شود.

### مومیایی کمین‌گر — Mummy Stalker
- نقش: قاتل / کنترل
- پیشینه: مومیایی شکارچی در بازآفرینی فانتزی با الهام از تدفین مصر باستان.
- آمار سطح ۱: power 12، speed 15، endurance 14، vitality 15، intellect 9، perception 16، luck 10، faith 13
- رشد هر سطح: power +0.22، speed +0.27، endurance +0.25، vitality +0.33، intellect +0.16، perception +0.29، luck +0.18، faith +0.23
- مهارت چنگال مومیایی (physical): چنگال مومیایی؛ آسیب ۱۲۵٪.؛ هدف single؛ قدرت 125٪؛ بازگشت 0 نوبت.
- مهارت بندهای زنده (control): بندهای زنده؛ کاهش ۲۰٪ سرعت هدف و محدودسازی حرکت برای یک نوبت.؛ هدف single؛ قدرت 0٪؛ بازگشت 3 نوبت.
- مهارت نیش نمک‌زده (physical_leech): نیش نمک‌زده؛ آسیب ۱۱۰٪ و بازیابی ۱۲٪ آسیب.؛ هدف single؛ قدرت 110٪؛ بازگشت 4 نوبت.
- ویژگی ذاتی: استعداد رده غیرمعمول: قاتل / کنترل؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند.
- هوش مبارزه: ambush_then_bind, self_preserve_low_hp, use_ready_role_skill, avoid_overkill
- تکامل: Rare با آیتم `companion_evolution_uncommon_to_rare`؛ سطح حفظ می‌شود.

### دریاد خارپوش بازگشته — Thorn Dryad Revenant
- نقش: کنترل / پشتیبان
- پیشینه: روح درختی انتقام‌جو با الهام از دریادهای اساطیر یونان؛ طراحی بازی بازآفرینی است.
- آمار سطح ۱: power 9، speed 11، endurance 15، vitality 16، intellect 14، perception 12، luck 10، faith 18
- رشد هر سطح: power +0.16، speed +0.2، endurance +0.33، vitality +0.35، intellect +0.25، perception +0.22، luck +0.18، faith +0.32
- مهارت ریشه‌های خاردار (control): ریشه‌های خاردار؛ آسیب ۸۰٪ و کاهش ۲۵٪ سرعت دو دشمن.؛ هدف single؛ قدرت 0٪؛ بازگشت 0 نوبت.
- مهارت شیره کهن (heal): شیره کهن؛ درمان ۱۶٪ HP بیشینه یک همراه.؛ هدف lowest_hp_ally؛ قدرت 0٪؛ بازگشت 3 نوبت.
- مهارت تازیانه شاخه (physical): تازیانه شاخه؛ آسیب ۱۲۵٪.؛ هدف single؛ قدرت 125٪؛ بازگشت 4 نوبت.
- ویژگی ذاتی: استعداد رده غیرمعمول: کنترل / پشتیبان؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند.
- هوش مبارزه: protect_and_root, self_preserve_low_hp, use_ready_role_skill, avoid_overkill
- تکامل: Rare با آیتم `companion_evolution_uncommon_to_rare`؛ سطح حفظ می‌شود.

### رقصنده ارواح — Spirit Dancer
- نقش: پشتیبان / تقویت گروه
- پیشینه: رقصنده آیینی میان جهان‌ها؛ طراحی فانتزی با الهام کلی از سنت‌های آیینی، نه اقتباس از فرهنگ مشخص.
- آمار سطح ۱: power 8، speed 17، endurance 10، vitality 12، intellect 15، perception 16، luck 14، faith 17
- رشد هر سطح: power +0.14، speed +0.31، endurance +0.18، vitality +0.22، intellect +0.27، perception +0.29، luck +0.25، faith +0.31
- مهارت گام هم‌نوا (buff): گام هم‌نوا؛ افزایش ۱۲٪ سرعت و دقت همه همراهان برای ۲ نوبت.؛ هدف self؛ قدرت 0٪؛ بازگشت 0 نوبت.
- مهارت پرتو ارواح (magic): پرتو ارواح؛ آسیب جادویی ۱۱۵٪.؛ هدف single؛ قدرت 125٪؛ بازگشت 3 نوبت.
- مهارت حلقه محافظ (shield): حلقه محافظ؛ سپر ۱۴٪ HP بیشینه برای ضعیف‌ترین همراه.؛ هدف lowest_hp_ally؛ قدرت 0٪؛ بازگشت 4 نوبت.
- ویژگی ذاتی: استعداد رده غیرمعمول: پشتیبان / تقویت گروه؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند.
- هوش مبارزه: buff_team_then_attack, self_preserve_low_hp, use_ready_role_skill, avoid_overkill
- تکامل: Rare با آیتم `companion_evolution_uncommon_to_rare`؛ سطح حفظ می‌شود.

### درخت‌زاد توخالی — Hollow Treant
- نقش: تانک / کنترل چندهدف
- پیشینه: نگهبان درختی پوسیده با الهام از موجودات درختی فولکلور اروپا؛ گونه بازی اختصاصی است.
- آمار سطح ۱: power 17، speed 5، endurance 20، vitality 19، intellect 8، perception 9، luck 7، faith 15
- رشد هر سطح: power +0.31، speed +0.09، endurance +0.38، vitality +0.38، intellect +0.14، perception +0.16، luck +0.13، faith +0.27
- مهارت مشت تنه (physical_multi): مشت تنه؛ آسیب ۱۲۰٪ به دو دشمن.؛ هدف two_enemies؛ قدرت 90٪؛ بازگشت 0 نوبت.
- مهارت پوست کهن (guard): پوست کهن؛ کاهش ۳۵٪ آسیب دریافتی برای ۲ نوبت.؛ هدف self؛ قدرت 0٪؛ بازگشت 3 نوبت.
- مهارت ریشه‌دوانی (control): ریشه‌دوانی؛ کاهش ۲۰٪ سرعت همه دشمنان برای یک نوبت.؛ هدف single؛ قدرت 0٪؛ بازگشت 4 نوبت.
- ویژگی ذاتی: استعداد رده غیرمعمول: تانک / کنترل چندهدف؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند.
- هوش مبارزه: frontline_guard, self_preserve_low_hp, use_ready_role_skill, avoid_overkill
- تکامل: Rare با آیتم `companion_evolution_uncommon_to_rare`؛ سطح حفظ می‌شود.

## تصاویر
۲۰ پرتره WebP مستقل در `assets/necromancer/companions/uncommon/` ذخیره شده‌اند.

## اتصال
`index.html` اکنون ماژول Bestiary ترکیبی را بارگذاری می‌کند؛ بنابراین سیستم مهرهای احضار V1984 هر دو رده Common و Uncommon را در استخر گونه‌ها می‌بیند. رده‌های هنوز طراحی‌نشده، مطابق رفتار قبلی، مهر مصرف نمی‌کنند.
