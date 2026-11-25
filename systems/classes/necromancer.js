/* ETRANOM Necromancer specialization data. Turn-based; no spatial mechanics. */
export const NECROMANCER = {
    "id": "wizard_necromancer",
    "classId": "wizard",
    "className": "جادوگر",
    "specialization": "نکرومنسر",
    "specializationEn": "Necromancer",
    "version": 1996,
    "identity": {
        "role": "فرمانروای مرگ و ارواح؛ گردآورنده موجودات مستقل با سه احضار هم‌زمان",
        "theme": "دارک فانتزی",
        "resource": "مانا",
        "secondaryResource": "ارواح ذخیره‌شده",
        "strengths": [
            "کلکسیون نامحدود موجودات مستقل",
            "کنترل و تضعیف دشمن",
            "بازیابی و بقا",
            "تحول فرم مرگ در قلمرو"
        ],
        "weaknesses": [
            "نیازمند مدیریت ارواح",
            "احضار وابسته به مهرهای کمیاب",
            "ظرفیت کلکسیون نامحدود؛ حداکثر سه موجود هم‌زمان در نبرد",
            "فرسودگی پس از قدرت نهایی"
        ]
    },
    "combatRules": {
        "mode": "turn_based_text",
        "distance": false,
        "targeting": "یک دشمن، تمام دشمنان زنده، خود بازیکن یا اعضای زنده لژیون؛ هیچ اثر مکانی وجود ندارد.",
        "turnDuration": "تمام مدت‌ها برحسب نوبت بازیکن است.",
        "cooldownUnit": "نوبت بازیکن",
        "manaCostBasis": "درصد هزینه از حداکثر مانای مؤثر محاسبه می‌شود؛ هزینه پایه پیش از تخفیف‌ها و رو به بالا گرد می‌شود.",
        "spatialMechanics": false,
        "legionCapacity": null,
        "activeLegionCapacity": 3,
        "legionCapacityImmutable": true
    },
    "soulSystem": {
        "resource": "storedSouls",
        "baseCapacity": 10,
        "rules": [
            "ارواح از کشتن دشمنان و برخی اثرهای مهارتی به دست می‌آیند.",
            "هزینه‌های روحی فقط از storedSouls پرداخت می‌شوند و مانا را جایگزین نمی‌کنند.",
            "تغذیه مجلس ارواح ارواح مصرف می‌کند.",
            "ظرفیت پایه ۱۰ است؛ استعداد مخزن ارواح می‌تواند آن را در رتبه‌های مشخص افزایش دهد.",
            "ارواح و اثرهای موقت در پایان نبرد پاک می‌شوند؛ اعضای دائمی لژیون پاک نمی‌شوند."
        ]
    },
    "legionSystem": {
        "maxMembers": null,
        "activeMembers": 3,
        "capacityCanIncrease": false,
        "recruitmentMode": "underworld_gate_and_summon_seals",
        "permanentRecruitment": true,
        "failedRecruitmentConsumesCorpse": false,
        "membersKeepSpeciesIdentity": true,
        "deathFormOnlyInDomain": true,
        "rules": [
            "هر عضو، گونه، آمار، توانایی ویژه و فرم مرگ اختصاصی خود را دارد.",
            "احضار موفق، موجودی مستقل را بدون محدودیت ظرفیت به کلکسیون اضافه می‌کند.",
            "از کلکسیون نامحدود، حداکثر سه موجود را می‌توان هم‌زمان در نبرد احضار کرد.",
            "مدیریت موجودات از بخش اختصاصی نکرومنسر در وضعیت بازیکن انجام می‌شود.",
            "ظرفیت کلکسیون نامحدود است؛ سقف سه موجود هم‌زمان احضارشده ثابت است.",
            "قانون حذف دائمی عضو در صورت شکست نبرد در این ماژول تعیین نشده و باید از قانون اصلی سامانه لژیون پیروی کند."
        ]
    },
    "companionSynergy": {
        "collectionCapacity": null,
        "deployedCapacity": 3,
        "deployedOnlyEffects": true,
        "incapacitatedMembersPersist": true,
        "battleStartAutoHeal": false,
        "rules": {
            "death_claw": "نشان زخم مرگ روی هدف می‌گذارد؛ همراهان احضارشده همان هدف را در اولویت قرار می‌دهند و ۲۰٪ آسیب بیشتر می‌زنند؛ اثر روی باس نصف است.",
            "death_memory": "در صورت مرگ هدف نشان‌دار، همراهان احضارشده در نوبت بعدی ۱۰٪ آسیب بیشتر می‌زنند.",
            "bone_blossom": "دفاع، مقاومت و زخم استخوانی فقط برای همراهان احضارشده و زنده اعمال می‌شود.",
            "assembly_of_souls": "فرمان شکار به دشمنان زنده آسیب می‌زند؛ محافظت از بازیکن و همراهان احضارشده محافظت می‌کند؛ تغذیه سلامتی بازیکن و همراهان احضارشده را بازیابی می‌کند.",
            "life_siphon": "۲۰٪ درمان حاصل از مکیدن حیات فقط میان همراهان احضارشده و زنده تقسیم می‌شود.",
            "kingdom_of_bones": "تقویت حمله، ضربه بحرانی، شکستن دفاع و تولید روح فقط از عملکرد همراهان احضارشده ناشی می‌شود.",
            "return_threshold": "بازگشت از مرگ فقط برای نکرومنسر است؛ همراهان حذف نمی‌شوند و HP آن‌ها پس از نبرد خودکار پر نمی‌شود.",
            "soul_domination": "کنترل و تضعیف دشمن به همراهان اجازه می‌دهد هدف امن‌تر یا نشان‌دار را انتخاب کنند.",
            "eternal_sovereign": "تقویت و بازیابی حاصل از آسیب فقط به همراهان احضارشده مربوط است؛ فرسودگی پس از پایان نیز فقط روی همان همراهان اعمال می‌شود.",
            "underworld_gate": "دروازه فقط کلکسیون را مدیریت می‌کند؛ انتخاب سه همراه برای نبرد از همان کلکسیون انجام می‌شود و مهرها عضو مستقل می‌سازند."
        }
    },
    "skills": [
        {
            "id": "death_claw",
            "name": "چنگال مرگ",
            "en": "Death Claw",
            "unlockLevel": 1,
            "type": "damage",
            "target": "یک دشمن",
            "damagePct": 220,
            "manaCostPercent": 7,
            "cooldownTurns": 0,
            "durationTurns": 3,
            "description": "آسیب تاریک سنگین وارد می‌کند و زخم مرگ ۳ نوبتی می‌گذارد؛ زخم در پایان هر نوبت آسیب می‌زند. علیه هدف دارای نشان روحی آسیب بیشتر است. اگر هدف هنگام زخم مرگ کشته شود، ۱ روح ذخیره می‌شود.",
            "bossRules": "باس: آسیب مستقیم کامل؛ آسیب زخم ۵۰٪.",
            "upgradeRanks": 6,
            "upgrades": [
                {
                    "rank": 2,
                    "pointsRequired": 1,
                    "effect": "رتبه ۲: شدت اثر اصلی 108٪ مقدار پایه؛ آسیب تاریک سنگین وارد می‌کند و زخم مرگ ۳ نوبتی می‌گذارد؛ زخم در پایان هر نوبت آسیب می‌زند. علیه هدف دارای نشان روحی آسیب بیشتر است. اگر هدف هنگام زخم مرگ کشته شود، ۱ روح ذخیره می‌شود.",
                    "bonus": "ارتقای اختصاصی چنگال مرگ: افزایش کنترل‌شده اثر اصلی."
                },
                {
                    "rank": 3,
                    "pointsRequired": 2,
                    "effect": "رتبه ۳: شدت اثر اصلی ۱۱۶٪ مقدار پایه؛ هزینه مانا بدون تغییر.",
                    "bonus": "ارتقای اختصاصی چنگال مرگ: افزایش کنترل‌شده اثر پایدار."
                },
                {
                    "rank": 4,
                    "pointsRequired": 3,
                    "effect": "رتبه ۴: شدت اثر اصلی ۱۲۴٪ مقدار پایه؛ یک بهبود اختصاصی در تعامل مهارت.",
                    "bonus": "ارتقای اختصاصی چنگال مرگ: افزایش کنترل‌شده اثر ثانویه."
                },
                {
                    "rank": 5,
                    "pointsRequired": 4,
                    "effect": "رتبه ۵: شدت اثر اصلی ۱۳۲٪ مقدار پایه؛ هزینه مانا ۱ واحد درصد کمتر.",
                    "bonus": "ارتقای اختصاصی چنگال مرگ: افزایش کنترل‌شده اثر تخصصی."
                },
                {
                    "rank": 6,
                    "pointsRequired": 5,
                    "effect": "رتبه ۶: شدت اثر اصلی ۱۴۰٪ مقدار پایه؛ مدت اثر +۱ نوبت، اگر مهارت مدت‌دار باشد.",
                    "bonus": "ارتقای اختصاصی چنگال مرگ: افزایش کنترل‌شده اثر پیشرفته."
                },
                {
                    "rank": 7,
                    "pointsRequired": 6,
                    "effect": "رتبه ۷: شدت اثر اصلی ۱۵۰٪ مقدار پایه؛ بازده ثانویه مهارت +۱۵٪. محدودیت‌های هدف و ظرفیت همچنان پابرجاست.",
                    "bonus": "ارتقای اختصاصی چنگال مرگ: افزایش کنترل‌شده اثر نهایی."
                }
            ]
        },
        {
            "id": "underworld_gate",
            "name": "دروازه دنیای مردگان",
            "en": "Underworld Gate",
            "unlockLevel": 1,
            "type": "unlockable_utility",
            "target": "self",
            "manaCostPercent": 0,
            "cooldownTurns": 0,
            "durationTurns": 0,
            "upgradeRanks": 0,
            "upgrades": [],
            "description": "مهارت دائمی و بدون سطح. برای آزادسازی فقط یک مهر دروازه مردگان لازم است؛ پس از آزادسازی، پنج نوع مهر احضار برای افزودن موجودات مستقل به کلکسیون استفاده می‌شوند.",
            "requirements": ["summon_seal_1_item_only"]
        },
        {
            "id": "death_memory",
            "name": "خاطره مرگ",
            "en": "Death Memory",
            "unlockLevel": 3,
            "type": "debuff_choice",
            "target": "یک دشمن",
            "manaCostPercent": 8,
            "cooldownTurns": 2,
            "durationTurns": 3,
            "description": "یکی از سه خاطره را انتخاب کن: جنگ (کاهش حمله)، بقا (کاهش دفاع)، جادو (کاهش قدرت مهارت‌های جادویی). اگر هدف در مدت اثر کشته شود، اعضای لژیون در نوبت بعدی ۱۰٪ آسیب بیشتر وارد می‌کنند.",
            "bossRules": "روی باس‌ها شدت تضعیف ۵۰٪ است.",
            "upgradeRanks": 6,
            "upgrades": [
                {
                    "rank": 2,
                    "pointsRequired": 1,
                    "effect": "رتبه ۲: شدت اثر اصلی 108٪ مقدار پایه؛ یکی از سه خاطره را انتخاب کن: جنگ (کاهش حمله)، بقا (کاهش دفاع)، جادو (کاهش قدرت مهارت‌های جادویی). اگر هدف در مدت اثر کشته شود، اعضای لژیون در نوبت بعدی ۱۰٪ آسیب بیشتر وارد می‌کنند.",
                    "bonus": "ارتقای اختصاصی خاطره مرگ: افزایش کنترل‌شده اثر اصلی."
                },
                {
                    "rank": 3,
                    "pointsRequired": 2,
                    "effect": "رتبه ۳: شدت اثر اصلی ۱۱۶٪ مقدار پایه؛ هزینه مانا بدون تغییر.",
                    "bonus": "ارتقای اختصاصی خاطره مرگ: افزایش کنترل‌شده اثر پایدار."
                },
                {
                    "rank": 4,
                    "pointsRequired": 3,
                    "effect": "رتبه ۴: شدت اثر اصلی ۱۲۴٪ مقدار پایه؛ یک بهبود اختصاصی در تعامل مهارت.",
                    "bonus": "ارتقای اختصاصی خاطره مرگ: افزایش کنترل‌شده اثر ثانویه."
                },
                {
                    "rank": 5,
                    "pointsRequired": 4,
                    "effect": "رتبه ۵: شدت اثر اصلی ۱۳۲٪ مقدار پایه؛ هزینه مانا ۱ واحد درصد کمتر.",
                    "bonus": "ارتقای اختصاصی خاطره مرگ: افزایش کنترل‌شده اثر تخصصی."
                },
                {
                    "rank": 6,
                    "pointsRequired": 5,
                    "effect": "رتبه ۶: شدت اثر اصلی ۱۴۰٪ مقدار پایه؛ مدت اثر +۱ نوبت، اگر مهارت مدت‌دار باشد.",
                    "bonus": "ارتقای اختصاصی خاطره مرگ: افزایش کنترل‌شده اثر پیشرفته."
                },
                {
                    "rank": 7,
                    "pointsRequired": 6,
                    "effect": "رتبه ۷: شدت اثر اصلی ۱۵۰٪ مقدار پایه؛ بازده ثانویه مهارت +۱۵٪. محدودیت‌های هدف و ظرفیت همچنان پابرجاست.",
                    "bonus": "ارتقای اختصاصی خاطره مرگ: افزایش کنترل‌شده اثر نهایی."
                }
            ]
        },
        {
            "id": "bone_blossom",
            "name": "شکوفایی استخوان",
            "en": "Bone Blossom",
            "unlockLevel": 4,
            "type": "legion_defense_buff",
            "target": "تمام همراهان احضارشده و زنده (حداکثر ۳)",
            "manaCostPercent": 9,
            "cooldownTurns": 4,
            "durationTurns": 3,
            "description": "استخوان نفرین‌شده در ساختار اعضای لژیون می‌روید؛ دفاع و مقاومتشان افزایش می‌یابد و حملاتشان احتمال ایجاد زخم استخوانی دارد. زخم استخوانی آسیب فیزیکی کم در ۲ نوبت وارد می‌کند.",
            "bossRules": "فقط همراهان احضارشده و زنده را تقویت می‌کند؛ اثر روی ذخیره کلکسیون اعمال نمی‌شود.",
            "upgradeRanks": 6,
            "upgrades": [
                {
                    "rank": 2,
                    "pointsRequired": 1,
                    "effect": "رتبه ۲: شدت اثر اصلی 108٪ مقدار پایه؛ استخوان نفرین‌شده در ساختار اعضای لژیون می‌روید؛ دفاع و مقاومتشان افزایش می‌یابد و حملاتشان احتمال ایجاد زخم استخوانی دارد. زخم استخوانی آسیب فیزیکی کم در ۲ نوبت وارد می‌کند.",
                    "bonus": "ارتقای اختصاصی شکوفایی استخوان: افزایش کنترل‌شده اثر اصلی."
                },
                {
                    "rank": 3,
                    "pointsRequired": 2,
                    "effect": "رتبه ۳: شدت اثر اصلی ۱۱۶٪ مقدار پایه؛ هزینه مانا بدون تغییر.",
                    "bonus": "ارتقای اختصاصی شکوفایی استخوان: افزایش کنترل‌شده اثر پایدار."
                },
                {
                    "rank": 4,
                    "pointsRequired": 3,
                    "effect": "رتبه ۴: شدت اثر اصلی ۱۲۴٪ مقدار پایه؛ یک بهبود اختصاصی در تعامل مهارت.",
                    "bonus": "ارتقای اختصاصی شکوفایی استخوان: افزایش کنترل‌شده اثر ثانویه."
                },
                {
                    "rank": 5,
                    "pointsRequired": 4,
                    "effect": "رتبه ۵: شدت اثر اصلی ۱۳۲٪ مقدار پایه؛ هزینه مانا ۱ واحد درصد کمتر.",
                    "bonus": "ارتقای اختصاصی شکوفایی استخوان: افزایش کنترل‌شده اثر تخصصی."
                },
                {
                    "rank": 6,
                    "pointsRequired": 5,
                    "effect": "رتبه ۶: شدت اثر اصلی ۱۴۰٪ مقدار پایه؛ مدت اثر +۱ نوبت، اگر مهارت مدت‌دار باشد.",
                    "bonus": "ارتقای اختصاصی شکوفایی استخوان: افزایش کنترل‌شده اثر پیشرفته."
                },
                {
                    "rank": 7,
                    "pointsRequired": 6,
                    "effect": "رتبه ۷: شدت اثر اصلی ۱۵۰٪ مقدار پایه؛ بازده ثانویه مهارت +۱۵٪. محدودیت‌های هدف و ظرفیت همچنان پابرجاست.",
                    "bonus": "ارتقای اختصاصی شکوفایی استخوان: افزایش کنترل‌شده اثر نهایی."
                }
            ]
        },
        {
            "id": "assembly_of_souls",
            "name": "مجلس ارواح",
            "en": "Assembly of Souls",
            "unlockLevel": 5,
            "type": "soul_command",
            "target": "خود، همراهان احضارشده یا تمام دشمنان؛ بسته به فرمان",
            "manaCostPercent": 10,
            "cooldownTurns": 3,
            "durationTurns": 0,
            "description": "یکی از سه فرمان را انتخاب کن: شکار (آسیب روحی به همه دشمنان زنده)، محافظت (جذب بخشی از آسیب بعدی وارده به نکرومنسر و لژیون)، تغذیه (مصرف ارواح برای بازیابی سلامتی و مانا). قدرت با ارواح ذخیره‌شده مقیاس می‌شود.",
            "bossRules": "فرمان محافظت سقف جذب دارد؛ تغذیه نمی‌تواند از حداکثر منابع عبور کند.",
            "upgradeRanks": 6,
            "upgrades": [
                {
                    "rank": 2,
                    "pointsRequired": 1,
                    "effect": "رتبه ۲: شدت اثر اصلی 108٪ مقدار پایه؛ یکی از سه فرمان را انتخاب کن: شکار (آسیب روحی به همه دشمنان زنده)، محافظت (جذب بخشی از آسیب بعدی وارده به نکرومنسر و لژیون)، تغذیه (مصرف ارواح برای بازیابی سلامتی و مانا). قدرت با ارواح ذخیره‌شده مقیاس می‌شود.",
                    "bonus": "ارتقای اختصاصی مجلس ارواح: افزایش کنترل‌شده اثر اصلی."
                },
                {
                    "rank": 3,
                    "pointsRequired": 2,
                    "effect": "رتبه ۳: شدت اثر اصلی ۱۱۶٪ مقدار پایه؛ هزینه مانا بدون تغییر.",
                    "bonus": "ارتقای اختصاصی مجلس ارواح: افزایش کنترل‌شده اثر پایدار."
                },
                {
                    "rank": 4,
                    "pointsRequired": 3,
                    "effect": "رتبه ۴: شدت اثر اصلی ۱۲۴٪ مقدار پایه؛ یک بهبود اختصاصی در تعامل مهارت.",
                    "bonus": "ارتقای اختصاصی مجلس ارواح: افزایش کنترل‌شده اثر ثانویه."
                },
                {
                    "rank": 5,
                    "pointsRequired": 4,
                    "effect": "رتبه ۵: شدت اثر اصلی ۱۳۲٪ مقدار پایه؛ هزینه مانا ۱ واحد درصد کمتر.",
                    "bonus": "ارتقای اختصاصی مجلس ارواح: افزایش کنترل‌شده اثر تخصصی."
                },
                {
                    "rank": 6,
                    "pointsRequired": 5,
                    "effect": "رتبه ۶: شدت اثر اصلی ۱۴۰٪ مقدار پایه؛ مدت اثر +۱ نوبت، اگر مهارت مدت‌دار باشد.",
                    "bonus": "ارتقای اختصاصی مجلس ارواح: افزایش کنترل‌شده اثر پیشرفته."
                },
                {
                    "rank": 7,
                    "pointsRequired": 6,
                    "effect": "رتبه ۷: شدت اثر اصلی ۱۵۰٪ مقدار پایه؛ بازده ثانویه مهارت +۱۵٪. محدودیت‌های هدف و ظرفیت همچنان پابرجاست.",
                    "bonus": "ارتقای اختصاصی مجلس ارواح: افزایش کنترل‌شده اثر نهایی."
                }
            ]
        },
        {
            "id": "life_siphon",
            "name": "مکیدن حیات",
            "en": "Life Siphon",
            "unlockLevel": 6,
            "type": "life_steal",
            "target": "یک دشمن؛ درمان جانبی فقط برای همراهان احضارشده",
            "manaCostPercent": 9,
            "cooldownTurns": 3,
            "durationTurns": 3,
            "description": "برای ۳ نوبت از یک دشمن حیات می‌مکد؛ در هر نوبت آسیب تاریک وارد و ۳۰٪ آن به سلامتی نکرومنسر تبدیل می‌شود. ۲۰٪ از مقدار بازیابی‌شده میان اعضای زنده لژیون تقسیم می‌شود. هدف نشان‌دار ۲۰٪ بیشتر آسیب می‌بیند.",
            "bossRules": "باس: بازیابی و آسیب سرقت ۵۰٪ کارایی دارد.",
            "upgradeRanks": 6,
            "upgrades": [
                {
                    "rank": 2,
                    "pointsRequired": 1,
                    "effect": "رتبه ۲: شدت اثر اصلی 108٪ مقدار پایه؛ برای ۳ نوبت از یک دشمن حیات می‌مکد؛ در هر نوبت آسیب تاریک وارد و ۳۰٪ آن به سلامتی نکرومنسر تبدیل می‌شود. ۲۰٪ از مقدار بازیابی‌شده میان اعضای زنده لژیون تقسیم می‌شود. هدف نشان‌دار ۲۰٪ بیشتر آسیب می‌بیند.",
                    "bonus": "ارتقای اختصاصی مکیدن حیات: افزایش کنترل‌شده اثر اصلی."
                },
                {
                    "rank": 3,
                    "pointsRequired": 2,
                    "effect": "رتبه ۳: شدت اثر اصلی ۱۱۶٪ مقدار پایه؛ هزینه مانا بدون تغییر.",
                    "bonus": "ارتقای اختصاصی مکیدن حیات: افزایش کنترل‌شده اثر پایدار."
                },
                {
                    "rank": 4,
                    "pointsRequired": 3,
                    "effect": "رتبه ۴: شدت اثر اصلی ۱۲۴٪ مقدار پایه؛ یک بهبود اختصاصی در تعامل مهارت.",
                    "bonus": "ارتقای اختصاصی مکیدن حیات: افزایش کنترل‌شده اثر ثانویه."
                },
                {
                    "rank": 5,
                    "pointsRequired": 4,
                    "effect": "رتبه ۵: شدت اثر اصلی ۱۳۲٪ مقدار پایه؛ هزینه مانا ۱ واحد درصد کمتر.",
                    "bonus": "ارتقای اختصاصی مکیدن حیات: افزایش کنترل‌شده اثر تخصصی."
                },
                {
                    "rank": 6,
                    "pointsRequired": 5,
                    "effect": "رتبه ۶: شدت اثر اصلی ۱۴۰٪ مقدار پایه؛ مدت اثر +۱ نوبت، اگر مهارت مدت‌دار باشد.",
                    "bonus": "ارتقای اختصاصی مکیدن حیات: افزایش کنترل‌شده اثر پیشرفته."
                },
                {
                    "rank": 7,
                    "pointsRequired": 6,
                    "effect": "رتبه ۷: شدت اثر اصلی ۱۵۰٪ مقدار پایه؛ بازده ثانویه مهارت +۱۵٪. محدودیت‌های هدف و ظرفیت همچنان پابرجاست.",
                    "bonus": "ارتقای اختصاصی مکیدن حیات: افزایش کنترل‌شده اثر نهایی."
                }
            ]
        },
        {
            "id": "kingdom_of_bones",
            "name": "پادشاهی استخوان‌ها",
            "en": "Kingdom of Bones",
            "unlockLevel": 7,
            "type": "legion_offense_buff",
            "target": "تمام همراهان احضارشده و زنده (حداکثر ۳)",
            "manaCostPercent": 11,
            "cooldownTurns": 5,
            "durationTurns": 3,
            "description": "فرمان جنگ صادر می‌شود؛ برای ۳ نوبت حمله اعضای لژیون، احتمال ضربه بحرانی و توان شکستن دفاع افزایش می‌یابد. کشتن دشمن توسط عضو لژیون ۱ روح تولید می‌کند؛ حداکثر ۲ روح در هر بار اجرا.",
            "bossRules": "اثر فقط بر اعضای زنده لژیون است و با شکوفایی استخوان از نظر نقش متفاوت است.",
            "upgradeRanks": 6,
            "upgrades": [
                {
                    "rank": 2,
                    "pointsRequired": 1,
                    "effect": "رتبه ۲: شدت اثر اصلی 108٪ مقدار پایه؛ فرمان جنگ صادر می‌شود؛ برای ۳ نوبت حمله اعضای لژیون، احتمال ضربه بحرانی و توان شکستن دفاع افزایش می‌یابد. کشتن دشمن توسط عضو لژیون ۱ روح تولید می‌کند؛ حداکثر ۲ روح در هر بار اجرا.",
                    "bonus": "ارتقای اختصاصی پادشاهی استخوان‌ها: افزایش کنترل‌شده اثر اصلی."
                },
                {
                    "rank": 3,
                    "pointsRequired": 2,
                    "effect": "رتبه ۳: شدت اثر اصلی ۱۱۶٪ مقدار پایه؛ هزینه مانا بدون تغییر.",
                    "bonus": "ارتقای اختصاصی پادشاهی استخوان‌ها: افزایش کنترل‌شده اثر پایدار."
                },
                {
                    "rank": 4,
                    "pointsRequired": 3,
                    "effect": "رتبه ۴: شدت اثر اصلی ۱۲۴٪ مقدار پایه؛ یک بهبود اختصاصی در تعامل مهارت.",
                    "bonus": "ارتقای اختصاصی پادشاهی استخوان‌ها: افزایش کنترل‌شده اثر ثانویه."
                },
                {
                    "rank": 5,
                    "pointsRequired": 4,
                    "effect": "رتبه ۵: شدت اثر اصلی ۱۳۲٪ مقدار پایه؛ هزینه مانا ۱ واحد درصد کمتر.",
                    "bonus": "ارتقای اختصاصی پادشاهی استخوان‌ها: افزایش کنترل‌شده اثر تخصصی."
                },
                {
                    "rank": 6,
                    "pointsRequired": 5,
                    "effect": "رتبه ۶: شدت اثر اصلی ۱۴۰٪ مقدار پایه؛ مدت اثر +۱ نوبت، اگر مهارت مدت‌دار باشد.",
                    "bonus": "ارتقای اختصاصی پادشاهی استخوان‌ها: افزایش کنترل‌شده اثر پیشرفته."
                },
                {
                    "rank": 7,
                    "pointsRequired": 6,
                    "effect": "رتبه ۷: شدت اثر اصلی ۱۵۰٪ مقدار پایه؛ بازده ثانویه مهارت +۱۵٪. محدودیت‌های هدف و ظرفیت همچنان پابرجاست.",
                    "bonus": "ارتقای اختصاصی پادشاهی استخوان‌ها: افزایش کنترل‌شده اثر نهایی."
                }
            ]
        },
        {
            "id": "return_threshold",
            "name": "بازگشت از آستانه",
            "en": "Return from the Threshold",
            "unlockLevel": 8,
            "type": "self_revive",
            "target": "خود",
            "manaCostPercent": 15,
            "cooldownTurns": 0,
            "durationTurns": 0,
            "description": "پیش از ضربه مرگبار فعال می‌شود. تا پایان ۳ نوبت، اگر سلامتی به صفر برسد، نکرومنسر با ۲۵٪ حداکثر سلامتی بازمی‌گردد. هزینه پایه ۳ روح ذخیره‌شده است. هر نبرد فقط یک بار.",
            "bossRules": "با مرگ فعال نمی‌شود مگر از قبل اجرا شده باشد؛ احیای دیگر هم‌زمان را جایگزین نمی‌کند.",
            "upgradeRanks": 6,
            "upgrades": [
                {
                    "rank": 2,
                    "pointsRequired": 1,
                    "effect": "رتبه ۲: شدت اثر اصلی 108٪ مقدار پایه؛ پیش از ضربه مرگبار فعال می‌شود. تا پایان ۳ نوبت، اگر سلامتی به صفر برسد، نکرومنسر با ۲۵٪ حداکثر سلامتی بازمی‌گردد. هزینه پایه ۳ روح ذخیره‌شده است. هر نبرد فقط یک بار.",
                    "bonus": "ارتقای اختصاصی بازگشت از آستانه: افزایش کنترل‌شده اثر اصلی."
                },
                {
                    "rank": 3,
                    "pointsRequired": 2,
                    "effect": "رتبه ۳: شدت اثر اصلی ۱۱۶٪ مقدار پایه؛ هزینه مانا بدون تغییر.",
                    "bonus": "ارتقای اختصاصی بازگشت از آستانه: افزایش کنترل‌شده اثر پایدار."
                },
                {
                    "rank": 4,
                    "pointsRequired": 3,
                    "effect": "رتبه ۴: شدت اثر اصلی ۱۲۴٪ مقدار پایه؛ یک بهبود اختصاصی در تعامل مهارت.",
                    "bonus": "ارتقای اختصاصی بازگشت از آستانه: افزایش کنترل‌شده اثر ثانویه."
                },
                {
                    "rank": 5,
                    "pointsRequired": 4,
                    "effect": "رتبه ۵: شدت اثر اصلی ۱۳۲٪ مقدار پایه؛ هزینه مانا ۱ واحد درصد کمتر.",
                    "bonus": "ارتقای اختصاصی بازگشت از آستانه: افزایش کنترل‌شده اثر تخصصی."
                },
                {
                    "rank": 6,
                    "pointsRequired": 5,
                    "effect": "رتبه ۶: شدت اثر اصلی ۱۴۰٪ مقدار پایه؛ مدت اثر +۱ نوبت، اگر مهارت مدت‌دار باشد.",
                    "bonus": "ارتقای اختصاصی بازگشت از آستانه: افزایش کنترل‌شده اثر پیشرفته."
                },
                {
                    "rank": 7,
                    "pointsRequired": 6,
                    "effect": "رتبه ۷: شدت اثر اصلی ۱۵۰٪ مقدار پایه؛ بازده ثانویه مهارت +۱۵٪. محدودیت‌های هدف و ظرفیت همچنان پابرجاست.",
                    "bonus": "ارتقای اختصاصی بازگشت از آستانه: افزایش کنترل‌شده اثر نهایی."
                }
            ]
        },
        {
            "id": "soul_domination",
            "name": "سلطه بر ارواح",
            "en": "Soul Domination",
            "unlockLevel": 9,
            "type": "control_choice",
            "target": "یک دشمن یا تمام دشمنان برای زنجیر",
            "manaCostPercent": 12,
            "cooldownTurns": 4,
            "durationTurns": 0,
            "description": "یکی از سه فرمان: تسخیر اراده (دشمن معمولی ۲ نوبت به متحد تبدیل می‌شود)، زنجیر ارواح (کاهش حمله و قدرت مهارت هدف برای ۳ نوبت)، خاموشی روح (مهارت ویژه هدف برای ۱ نوبت قفل می‌شود). ویژگی اعضای لژیون می‌تواند اثر فرمان را تقویت کند.",
            "bossRules": "باس: تسخیر ممنوع؛ زنجیر و خاموشی با شدت ۳۵٪ اعمال می‌شوند. مینی‌باس: تسخیر به تضعیف اراده تبدیل می‌شود.",
            "upgradeRanks": 6,
            "upgrades": [
                {
                    "rank": 2,
                    "pointsRequired": 1,
                    "effect": "رتبه ۲: شدت اثر اصلی 108٪ مقدار پایه؛ یکی از سه فرمان: تسخیر اراده (دشمن معمولی ۲ نوبت به متحد تبدیل می‌شود)، زنجیر ارواح (کاهش حمله و قدرت مهارت هدف برای ۳ نوبت)، خاموشی روح (مهارت ویژه هدف برای ۱ نوبت قفل می‌شود). ویژگی اعضای لژیون می‌تواند اثر فرمان را تقویت کند.",
                    "bonus": "ارتقای اختصاصی سلطه بر ارواح: افزایش کنترل‌شده اثر اصلی."
                },
                {
                    "rank": 3,
                    "pointsRequired": 2,
                    "effect": "رتبه ۳: شدت اثر اصلی ۱۱۶٪ مقدار پایه؛ هزینه مانا بدون تغییر.",
                    "bonus": "ارتقای اختصاصی سلطه بر ارواح: افزایش کنترل‌شده اثر پایدار."
                },
                {
                    "rank": 4,
                    "pointsRequired": 3,
                    "effect": "رتبه ۴: شدت اثر اصلی ۱۲۴٪ مقدار پایه؛ یک بهبود اختصاصی در تعامل مهارت.",
                    "bonus": "ارتقای اختصاصی سلطه بر ارواح: افزایش کنترل‌شده اثر ثانویه."
                },
                {
                    "rank": 5,
                    "pointsRequired": 4,
                    "effect": "رتبه ۵: شدت اثر اصلی ۱۳۲٪ مقدار پایه؛ هزینه مانا ۱ واحد درصد کمتر.",
                    "bonus": "ارتقای اختصاصی سلطه بر ارواح: افزایش کنترل‌شده اثر تخصصی."
                },
                {
                    "rank": 6,
                    "pointsRequired": 5,
                    "effect": "رتبه ۶: شدت اثر اصلی ۱۴۰٪ مقدار پایه؛ مدت اثر +۱ نوبت، اگر مهارت مدت‌دار باشد.",
                    "bonus": "ارتقای اختصاصی سلطه بر ارواح: افزایش کنترل‌شده اثر پیشرفته."
                },
                {
                    "rank": 7,
                    "pointsRequired": 6,
                    "effect": "رتبه ۷: شدت اثر اصلی ۱۵۰٪ مقدار پایه؛ بازده ثانویه مهارت +۱۵٪. محدودیت‌های هدف و ظرفیت همچنان پابرجاست.",
                    "bonus": "ارتقای اختصاصی سلطه بر ارواح: افزایش کنترل‌شده اثر نهایی."
                }
            ]
        },
        {
            "id": "eternal_sovereign",
            "name": "فرمانروای ابدی",
            "en": "Eternal Sovereign",
            "unlockLevel": 10,
            "type": "ultimate_form",
            "target": "خود و تمام اعضای زنده لژیون",
            "manaCostPercent": 18,
            "cooldownTurns": 8,
            "durationTurns": 3,
            "description": "برای ۳ نوبت فرم فرمانروای ابدی فعال می‌شود: آسیب تاریک نکرومنسر +۲۰٪، توانایی اختصاصی لژیون +۲۰٪ و ۱۵٪ آسیب واردشده توسط لژیون به سلامتی نکرومنسر تبدیل می‌شود. پس از پایان، اعضای لژیون ۲ نوبت فرسوده می‌شوند.",
            "bossRules": "در هر نبرد یک بار؛ ضرایب در رتبه‌های بالاتر افزایش می‌یابد اما مدت پایه ثابت می‌ماند.",
            "upgradeRanks": 6,
            "upgrades": [
                {
                    "rank": 2,
                    "pointsRequired": 1,
                    "effect": "رتبه ۲: شدت اثر اصلی 108٪ مقدار پایه؛ برای ۳ نوبت فرم فرمانروای ابدی فعال می‌شود: آسیب تاریک نکرومنسر +۲۰٪، توانایی اختصاصی لژیون +۲۰٪ و ۱۵٪ آسیب واردشده توسط لژیون به سلامتی نکرومنسر تبدیل می‌شود. پس از پایان، اعضای لژیون ۲ نوبت فرسوده می‌شوند.",
                    "bonus": "ارتقای اختصاصی فرمانروای ابدی: افزایش کنترل‌شده اثر اصلی."
                },
                {
                    "rank": 3,
                    "pointsRequired": 2,
                    "effect": "رتبه ۳: شدت اثر اصلی ۱۱۶٪ مقدار پایه؛ هزینه مانا بدون تغییر.",
                    "bonus": "ارتقای اختصاصی فرمانروای ابدی: افزایش کنترل‌شده اثر پایدار."
                },
                {
                    "rank": 4,
                    "pointsRequired": 3,
                    "effect": "رتبه ۴: شدت اثر اصلی ۱۲۴٪ مقدار پایه؛ یک بهبود اختصاصی در تعامل مهارت.",
                    "bonus": "ارتقای اختصاصی فرمانروای ابدی: افزایش کنترل‌شده اثر ثانویه."
                },
                {
                    "rank": 5,
                    "pointsRequired": 4,
                    "effect": "رتبه ۵: شدت اثر اصلی ۱۳۲٪ مقدار پایه؛ هزینه مانا ۱ واحد درصد کمتر.",
                    "bonus": "ارتقای اختصاصی فرمانروای ابدی: افزایش کنترل‌شده اثر تخصصی."
                },
                {
                    "rank": 6,
                    "pointsRequired": 5,
                    "effect": "رتبه ۶: شدت اثر اصلی ۱۴۰٪ مقدار پایه؛ مدت اثر +۱ نوبت، اگر مهارت مدت‌دار باشد.",
                    "bonus": "ارتقای اختصاصی فرمانروای ابدی: افزایش کنترل‌شده اثر پیشرفته."
                },
                {
                    "rank": 7,
                    "pointsRequired": 6,
                    "effect": "رتبه ۷: شدت اثر اصلی ۱۵۰٪ مقدار پایه؛ بازده ثانویه مهارت +۱۵٪. محدودیت‌های هدف و ظرفیت همچنان پابرجاست.",
                    "bonus": "ارتقای اختصاصی فرمانروای ابدی: افزایش کنترل‌شده اثر نهایی."
                }
            ]
        }
    ],
    "talentBranches": [
        {
            "id": "death_sovereignty",
            "name": "فرمانروایی مرگ",
            "description": "قدرت شخصی، نشان‌گذاری، زخم و نفرین",
            "talentIds": [
                "death_sovereignty_01",
                "death_sovereignty_02",
                "death_sovereignty_03",
                "death_sovereignty_04",
                "death_sovereignty_05",
                "death_sovereignty_06",
                "death_sovereignty_07",
                "death_sovereignty_08"
            ],
            "unlockLevel": 1,
            "pointsPerTalent": 5
        },
        {
            "id": "undead_legion",
            "name": "لژیون جاودان",
            "description": "احضار، دوام، فرمان‌پذیری و تخصص سه همراه",
            "talentIds": [
                "undead_legion_01",
                "undead_legion_02",
                "undead_legion_03",
                "undead_legion_04",
                "undead_legion_05",
                "undead_legion_06",
                "undead_legion_07",
                "undead_legion_08"
            ],
            "unlockLevel": 1,
            "pointsPerTalent": 5
        },
        {
            "id": "spirit_magic",
            "name": "جادوی ارواح",
            "description": "ذخیره روح، بازیابی منابع، کنترل و هم‌افزایی مهارت‌ها",
            "talentIds": [
                "spirit_magic_01",
                "spirit_magic_02",
                "spirit_magic_03",
                "spirit_magic_04",
                "spirit_magic_05",
                "spirit_magic_06",
                "spirit_magic_07",
                "spirit_magic_08"
            ],
            "unlockLevel": 1,
            "pointsPerTalent": 5
        },
        {
            "id": "reign_resurrection",
            "name": "سلطنت رستاخیز",
            "description": "قلمرو، فرم مرگ، تعالی و بقا",
            "talentIds": [
                "reign_resurrection_01",
                "reign_resurrection_02",
                "reign_resurrection_03",
                "reign_resurrection_04",
                "reign_resurrection_05",
                "reign_resurrection_06",
                "reign_resurrection_07",
                "reign_resurrection_08"
            ],
            "unlockLevel": 1,
            "pointsPerTalent": 5
        }
    ],
    "talents": [
        {
            "id": "death_sovereignty_01",
            "name": "چنگال داوری",
            "branchId": "death_sovereignty",
            "maxRank": 5,
            "tier": 1,
            "requiresTalent": null,
            "effectKey": "death_claw_damage_pct",
            "effectPerRank": 3,
            "description": "درصد آسیب چنگال مرگ؛ رتبه ۱ تا ۵، هر رتبه 3 واحد.",
            "exclusiveRules": [],
            "effects": {
                "deathClawDamagePct": 3
            }
        },
        {
            "id": "death_sovereignty_02",
            "name": "زخم بی‌پایان",
            "branchId": "death_sovereignty",
            "maxRank": 5,
            "tier": 1,
            "requiresTalent": null,
            "effectKey": "death_wound_pct",
            "effectPerRank": 4,
            "description": "درصد آسیب زخم مرگ؛ رتبه ۱ تا ۵، هر رتبه 4 واحد.",
            "exclusiveRules": [],
            "effects": {
                "deathWoundDamagePct": 4
            }
        },
        {
            "id": "death_sovereignty_03",
            "name": "مهر محکومیت",
            "branchId": "death_sovereignty",
            "maxRank": 5,
            "tier": 2,
            "requiresTalent": "death_sovereignty_01",
            "effectKey": "marked_damage_pct",
            "effectPerRank": 2,
            "description": "درصد آسیب اضافه به هدف نشان‌دار؛ رتبه ۱ تا ۵، هر رتبه 2 واحد.",
            "exclusiveRules": [],
            "effects": {
                "markedEnemyDamagePct": 2
            }
        },
        {
            "id": "death_sovereignty_04",
            "name": "جوهر تاریک",
            "branchId": "death_sovereignty",
            "maxRank": 5,
            "tier": 2,
            "requiresTalent": "death_sovereignty_02",
            "effectKey": "dark_skill_damage_pct",
            "effectPerRank": 2,
            "description": "درصد قدرت مهارت تاریک؛ رتبه ۱ تا ۵، هر رتبه 2 واحد.",
            "exclusiveRules": [],
            "effects": {
                "darkSkillDamagePct": 2
            }
        },
        {
            "id": "death_sovereignty_05",
            "name": "شکارچی ارواح",
            "branchId": "death_sovereignty",
            "maxRank": 5,
            "tier": 3,
            "requiresTalent": "death_sovereignty_03",
            "effectKey": "soul_on_marked_kill_pct",
            "effectPerRank": 3,
            "description": "درصد احتمال روح اضافه از کشتن هدف نشان‌دار؛ رتبه ۱ تا ۵، هر رتبه 3 واحد.",
            "exclusiveRules": [],
            "effects": {
                "woundedKillSoulChancePct": 3
            }
        },
        {
            "id": "death_sovereignty_06",
            "name": "نفرین شکننده",
            "branchId": "death_sovereignty",
            "maxRank": 5,
            "tier": 3,
            "requiresTalent": "death_sovereignty_04",
            "effectKey": "debuff_strength_pct",
            "effectPerRank": 2,
            "description": "درصد شدت تضعیف؛ رتبه ۱ تا ۵، هر رتبه 2 واحد.",
            "exclusiveRules": [],
            "effects": {
                "necromancerDebuffStrengthPct": 2
            }
        },
        {
            "id": "death_sovereignty_07",
            "name": "پوست گورستان",
            "branchId": "death_sovereignty",
            "maxRank": 5,
            "tier": 4,
            "requiresTalent": "death_sovereignty_05",
            "effectKey": "dark_resistance_pct",
            "effectPerRank": 2,
            "description": "درصد مقاومت تاریک؛ رتبه ۱ تا ۵، هر رتبه 2 واحد.",
            "exclusiveRules": [],
            "effects": {
                "darkResistancePct": 2
            }
        },
        {
            "id": "death_sovereignty_08",
            "name": "اقتدار مرگ",
            "branchId": "death_sovereignty",
            "maxRank": 5,
            "tier": 4,
            "requiresTalent": "death_sovereignty_06",
            "effectKey": "domain_power_pct",
            "effectPerRank": 2,
            "description": "درصد قدرت کلی در قلمرو؛ رتبه ۱ تا ۵، هر رتبه 2 واحد.",
            "exclusiveRules": [],
            "effects": {
                "domainDamagePct": 2
            }
        },
        {
            "id": "undead_legion_01",
            "name": "ندای برخاستگان",
            "branchId": "undead_legion",
            "maxRank": 5,
            "tier": 1,
            "requiresTalent": null,
            "effectKey": "legion_recruit_chance_pct",
            "effectPerRank": 2,
            "description": "درصد شانس جذب موجود؛ رتبه ۱ تا ۵، هر رتبه 2 واحد.",
            "exclusiveRules": [
                "سقف احضار هم‌زمان ۳ همراه ثابت است."
            ],
            "effects": {
                "legionRecruitChancePct": 2
            }
        },
        {
            "id": "undead_legion_02",
            "name": "استخوان‌پوش",
            "branchId": "undead_legion",
            "maxRank": 5,
            "tier": 1,
            "requiresTalent": null,
            "effectKey": "companion_defense_pct",
            "effectPerRank": 3,
            "description": "درصد دفاع همراهان احضارشده؛ رتبه ۱ تا ۵، هر رتبه 3 واحد.",
            "exclusiveRules": [
                "سقف احضار هم‌زمان ۳ همراه ثابت است."
            ],
            "effects": {
                "legionDefensePct": 3
            }
        },
        {
            "id": "undead_legion_03",
            "name": "جوهر بازمانده",
            "branchId": "undead_legion",
            "maxRank": 5,
            "tier": 2,
            "requiresTalent": "undead_legion_01",
            "effectKey": "companion_max_hp_pct",
            "effectPerRank": 2,
            "description": "درصد حداکثر سلامتی همراهان؛ رتبه ۱ تا ۵، هر رتبه 2 واحد.",
            "exclusiveRules": [
                "سقف احضار هم‌زمان ۳ همراه ثابت است."
            ],
            "effects": {
                "legionMaxHpPct": 2
            }
        },
        {
            "id": "undead_legion_04",
            "name": "فرمان شکار",
            "branchId": "undead_legion",
            "maxRank": 5,
            "tier": 2,
            "requiresTalent": "undead_legion_02",
            "effectKey": "companion_damage_pct",
            "effectPerRank": 2,
            "description": "درصد آسیب همراهان؛ رتبه ۱ تا ۵، هر رتبه 2 واحد.",
            "exclusiveRules": [
                "سقف احضار هم‌زمان ۳ همراه ثابت است."
            ],
            "effects": {
                "legionDamagePct": 2
            }
        },
        {
            "id": "undead_legion_05",
            "name": "پیوند فرمانده",
            "branchId": "undead_legion",
            "maxRank": 5,
            "tier": 3,
            "requiresTalent": "undead_legion_03",
            "effectKey": "companion_crit_pct",
            "effectPerRank": 1,
            "description": "درصد احتمال ضربه بحرانی همراهان؛ رتبه ۱ تا ۵، هر رتبه 1 واحد.",
            "exclusiveRules": [
                "سقف احضار هم‌زمان ۳ همراه ثابت است."
            ],
            "effects": {
                "legionCritChancePct": 1
            }
        },
        {
            "id": "undead_legion_06",
            "name": "نگهبانان تخت",
            "branchId": "undead_legion",
            "maxRank": 5,
            "tier": 3,
            "requiresTalent": "undead_legion_04",
            "effectKey": "companion_guard_pct",
            "effectPerRank": 2,
            "description": "درصد کاهش آسیب دریافتی همراهان؛ رتبه ۱ تا ۵، هر رتبه 2 واحد.",
            "exclusiveRules": [
                "سقف احضار هم‌زمان ۳ همراه ثابت است."
            ],
            "effects": {
                "legionControlResistancePct": 2
            }
        },
        {
            "id": "undead_legion_07",
            "name": "هماهنگی سه‌گانه",
            "branchId": "undead_legion",
            "maxRank": 5,
            "tier": 4,
            "requiresTalent": "undead_legion_05",
            "effectKey": "three_companion_synergy_pct",
            "effectPerRank": 2,
            "description": "درصد تقویت هنگام حضور سه همراه زنده؛ رتبه ۱ تا ۵، هر رتبه 2 واحد.",
            "exclusiveRules": [
                "سقف احضار هم‌زمان ۳ همراه ثابت است."
            ],
            "effects": {
                "legionAbilityStrengthPct": 2
            }
        },
        {
            "id": "undead_legion_08",
            "name": "بازگشت از خاک",
            "branchId": "undead_legion",
            "maxRank": 5,
            "tier": 4,
            "requiresTalent": "undead_legion_06",
            "effectKey": "companion_recovery_pct",
            "effectPerRank": 2,
            "description": "درصد افزایش درمان دریافتی همراهان؛ رتبه ۱ تا ۵، هر رتبه 2 واحد.",
            "exclusiveRules": [
                "سقف احضار هم‌زمان ۳ همراه ثابت است."
            ],
            "effects": {
                "legionPostBattleRecoveryPct": 2
            }
        },
        {
            "id": "spirit_magic_01",
            "name": "مخزن ارواح",
            "branchId": "spirit_magic",
            "maxRank": 5,
            "tier": 1,
            "requiresTalent": null,
            "effectKey": "soul_capacity",
            "effectPerRank": 1,
            "description": "واحد ظرفیت ذخیره ارواح؛ رتبه ۱ تا ۵، هر رتبه 1 واحد.",
            "exclusiveRules": [],
            "effects": {
                "soulCapacityAtRank3": 1,
                "soulCapacityAtRank5": 1
            }
        },
        {
            "id": "spirit_magic_02",
            "name": "چشم‌انداز روح",
            "branchId": "spirit_magic",
            "maxRank": 5,
            "tier": 1,
            "requiresTalent": null,
            "effectKey": "soul_generation_pct",
            "effectPerRank": 3,
            "description": "درصد افزایش تولید روح؛ رتبه ۱ تا ۵، هر رتبه 3 واحد.",
            "exclusiveRules": [],
            "effects": {
                "soulGenerationPct": 3
            }
        },
        {
            "id": "spirit_magic_03",
            "name": "مکنده مانا",
            "branchId": "spirit_magic",
            "maxRank": 5,
            "tier": 2,
            "requiresTalent": "spirit_magic_01",
            "effectKey": "mana_siphon_pct",
            "effectPerRank": 1,
            "description": "درصد مانای بازیابی‌شده از مکیدن حیات؛ رتبه ۱ تا ۵، هر رتبه 1 واحد.",
            "exclusiveRules": [],
            "effects": {
                "lifeStealPct": 1
            }
        },
        {
            "id": "spirit_magic_04",
            "name": "طناب نامرئی",
            "branchId": "spirit_magic",
            "maxRank": 5,
            "tier": 2,
            "requiresTalent": "spirit_magic_02",
            "effectKey": "control_duration_turns",
            "effectPerRank": 0.2,
            "description": "نوبت اضافه کنترل؛ هر ۵ رتبه یک نوبت؛ رتبه ۱ تا ۵، هر رتبه 0.2 واحد.",
            "exclusiveRules": [],
            "effects": {
                "soulChainStrengthPct": 0.2
            }
        },
        {
            "id": "spirit_magic_05",
            "name": "زمزمه مردگان",
            "branchId": "spirit_magic",
            "maxRank": 5,
            "tier": 3,
            "requiresTalent": "spirit_magic_03",
            "effectKey": "skill_cooldown_reduction",
            "effectPerRank": 0.2,
            "description": "کاهش نوبت انتظار مهارت؛ هر ۵ رتبه یک نوبت؛ رتبه ۱ تا ۵، هر رتبه 0.2 واحد.",
            "exclusiveRules": [],
            "effects": {
                "cooldownReductionTurns": 0.2
            }
        },
        {
            "id": "spirit_magic_06",
            "name": "قربانی روح",
            "branchId": "spirit_magic",
            "maxRank": 5,
            "tier": 3,
            "requiresTalent": "spirit_magic_04",
            "effectKey": "soul_skill_power_pct",
            "effectPerRank": 3,
            "description": "درصد قدرت مهارت‌های مصرف‌کننده روح؛ رتبه ۱ تا ۵، هر رتبه 3 واحد.",
            "exclusiveRules": [],
            "effects": {
                "soulFeedingRecoveryPct": 3
            }
        },
        {
            "id": "spirit_magic_07",
            "name": "قفس نفرین",
            "branchId": "spirit_magic",
            "maxRank": 5,
            "tier": 4,
            "requiresTalent": "spirit_magic_05",
            "effectKey": "boss_debuff_pct",
            "effectPerRank": 2,
            "description": "درصد شدت تضعیف روی باس؛ رتبه ۱ تا ۵، هر رتبه 2 واحد.",
            "exclusiveRules": [],
            "effects": {
                "soulSilenceStrengthPct": 2
            }
        },
        {
            "id": "spirit_magic_08",
            "name": "تعادل جهان زیرین",
            "branchId": "spirit_magic",
            "maxRank": 5,
            "tier": 4,
            "requiresTalent": "spirit_magic_06",
            "effectKey": "mana_efficiency_pct",
            "effectPerRank": 1,
            "description": "درصد کاهش هزینه مانا؛ رتبه ۱ تا ۵، هر رتبه 1 واحد.",
            "exclusiveRules": [],
            "effects": {
                "manaCostReductionPct": 1
            }
        },
        {
            "id": "reign_resurrection_01",
            "name": "تاج گور",
            "branchId": "reign_resurrection",
            "maxRank": 5,
            "tier": 1,
            "requiresTalent": null,
            "effectKey": "domain_duration_turns",
            "effectPerRank": 0.2,
            "description": "نوبت اضافه قلمرو؛ هر ۵ رتبه یک نوبت؛ رتبه ۱ تا ۵، هر رتبه 0.2 واحد.",
            "exclusiveRules": [],
            "effects": {
                "domainDurationTurns": 0.2
            }
        },
        {
            "id": "reign_resurrection_02",
            "name": "تخت سیاه",
            "branchId": "reign_resurrection",
            "maxRank": 5,
            "tier": 1,
            "requiresTalent": null,
            "effectKey": "domain_damage_pct",
            "effectPerRank": 3,
            "description": "درصد آسیب بیشتر در قلمرو؛ رتبه ۱ تا ۵، هر رتبه 3 واحد.",
            "exclusiveRules": [],
            "effects": {
                "domainDamagePct": 3
            }
        },
        {
            "id": "reign_resurrection_03",
            "name": "تجلی فرم مرگ",
            "branchId": "reign_resurrection",
            "maxRank": 5,
            "tier": 2,
            "requiresTalent": "reign_resurrection_01",
            "effectKey": "death_form_power_pct",
            "effectPerRank": 3,
            "description": "درصد قدرت فرم مرگ همراهان؛ رتبه ۱ تا ۵، هر رتبه 3 واحد.",
            "exclusiveRules": [],
            "effects": {
                "legionRoyalAbilityPct": 3
            }
        },
        {
            "id": "reign_resurrection_04",
            "name": "انتخاب سرنوشت",
            "branchId": "reign_resurrection",
            "maxRank": 5,
            "tier": 2,
            "requiresTalent": "reign_resurrection_02",
            "effectKey": "ascended_skill_power_pct",
            "effectPerRank": 3,
            "description": "درصد قدرت مهارت تعالی‌یافته؛ رتبه ۱ تا ۵، هر رتبه 3 واحد.",
            "exclusiveRules": [],
            "effects": {
                "ascendedSkillPowerPct": 3
            }
        },
        {
            "id": "reign_resurrection_05",
            "name": "بازگشت پادشاه",
            "branchId": "reign_resurrection",
            "maxRank": 5,
            "tier": 3,
            "requiresTalent": "reign_resurrection_03",
            "effectKey": "revive_health_pct",
            "effectPerRank": 2,
            "description": "درصد سلامتی بیشتر هنگام بازگشت؛ رتبه ۱ تا ۵، هر رتبه 2 واحد.",
            "exclusiveRules": [],
            "effects": {
                "reviveHealthPct": 2
            }
        },
        {
            "id": "reign_resurrection_06",
            "name": "پرده ابدیت",
            "branchId": "reign_resurrection",
            "maxRank": 5,
            "tier": 3,
            "requiresTalent": "reign_resurrection_04",
            "effectKey": "domain_damage_reduction_pct",
            "effectPerRank": 2,
            "description": "درصد کاهش آسیب دریافتی در قلمرو؛ رتبه ۱ تا ۵، هر رتبه 2 واحد.",
            "exclusiveRules": [],
            "effects": {
                "domainDamageReductionPct": 2
            }
        },
        {
            "id": "reign_resurrection_07",
            "name": "فرمان نهایی",
            "branchId": "reign_resurrection",
            "maxRank": 5,
            "tier": 4,
            "requiresTalent": "reign_resurrection_05",
            "effectKey": "ultimate_skill_power_pct",
            "effectPerRank": 3,
            "description": "درصد قدرت فرمانروای ابدی؛ رتبه ۱ تا ۵، هر رتبه 3 واحد.",
            "exclusiveRules": [],
            "effects": {
                "eternalSovereignFinisherPct": 3
            }
        },
        {
            "id": "reign_resurrection_08",
            "name": "وارث تخت",
            "branchId": "reign_resurrection",
            "maxRank": 5,
            "tier": 4,
            "requiresTalent": "reign_resurrection_06",
            "effectKey": "domain_soul_generation_pct",
            "effectPerRank": 2,
            "description": "درصد تولید روح در قلمرو؛ رتبه ۱ تا ۵، هر رتبه 2 واحد.",
            "exclusiveRules": [],
            "effects": {
                "soulGenerationPct": 2
            }
        }
    ],
    "domain": {
        "id": "throne_of_the_last_judgment",
        "name": "تخت داوری واپسین",
        "unlockLevel": 25,
        "oncePerBattle": true,
        "durationTurns": 4,
        "oneAscendedSkillPerActivation": true,
        "stages": [
            {
                "stage": 1,
                "name": "آستانه خاموشان",
                "unlockLevel": 25,
                "durationTurns": 2,
                "effects": [
                    "تبدیل میدان به آستانه جهان مردگان؛ دشمنان نشان‌دار ۸٪ آسیب بیشتر از نکرومنسر و همراهان دریافت می‌کنند.",
                    "حداکثر سه همراه احضارشده فرم مرگ پایه می‌گیرند.",
                    "نکرومنسر ۱۰٪ مقاومت در برابر کنترل دریافت می‌کند."
                ]
            },
            {
                "stage": 2,
                "name": "تالار داوری",
                "unlockLevel": 40,
                "durationTurns": 3,
                "effects": [
                    "اثر نشان مرگ روی دشمنان عادی ۱ نوبت طولانی‌تر می‌شود.",
                    "فرم مرگ همراهان یک ویژگی تاکتیکی ثانویه آزاد می‌کند.",
                    "اولین همراهی که در هر نوبت آسیب می‌زند ۵٪ سپر موقت برای گروه می‌سازد."
                ]
            },
            {
                "stage": 3,
                "name": "تخت پادشاه مردگان",
                "unlockLevel": 60,
                "durationTurns": 4,
                "effects": [
                    "همراهان احضارشده ۱۲٪ آسیب و ۱۰٪ دفاع بیشتر می‌گیرند.",
                    "اولین مهارت تاریک در قلمرو ۱۵٪ مانای کمتری مصرف می‌کند.",
                    "کشتن دشمن نشان‌دار ۱ روح اضافه می‌دهد؛ در هر نوبت حداکثر یک‌بار."
                ]
            },
            {
                "stage": 4,
                "name": "داوری واپسین",
                "unlockLevel": 80,
                "requiresQuest": true,
                "durationTurns": 4,
                "unlock": "پس از تکمیل آزمون تخت خالی",
                "effects": [
                    "فرم مرگ کامل همراهان احضارشده فعال می‌شود.",
                    "یک مهارت تعالی‌یافته از میان گزینه‌های بازشده انتخاب می‌شود.",
                    "در پایان قلمرو، موج داوری به همه دشمنان زنده آسیب می‌زند؛ باس‌ها ۵۰٪ آسیب می‌گیرند."
                ]
            }
        ],
        "legionDeathForm": {
            "trigger": "فقط هنگام احضار همراهان فعال در قلمرو",
            "name": "تجسد مرگ",
            "revertsWhenDomainEnds": true,
            "preservesSpeciesIdentity": true,
            "rules": [
                "هر موجود ظاهر و ویژگی فرم مرگ اختصاصی متناسب با هویت اساطیری و نقش خودش می‌گیرد.",
                "فرم مرگ آمار پایه، سطح، رده یا هویت گونه را بازنویسی نمی‌کند؛ فقط تقویت موقت می‌دهد.",
                "فرم مرگ حداکثر برای سه همراه احضارشده اعمال می‌شود.",
                "فرم مرگ توانایی ویژه را تقویت می‌کند، اما مهارت جدید دائمی یا موجود جدید نمی‌سازد.",
                "پایان قلمرو تمام تغییرات موقت را پاک می‌کند؛ HP ازدست‌رفته همراهان حفظ می‌شود."
            ]
        },
        "activationCost": {
            "manaPercent": 18,
            "souls": 3,
            "cooldownBattles": 0
        },
        "rules": [
            "یک‌بار در هر نبرد فعال می‌شود.",
            "مدت و قدرت بر اساس مرحله دائمی قلمرو تعیین می‌شود.",
            "در قلمرو فقط یک مهارت تعالی‌یافته قابل اجراست.",
            "پایان زودهنگام نبرد یا پایان مدت، فرم مرگ را برمی‌گرداند.",
            "قلمرو به‌تنهایی عضو جدید احضار یا HP همراهان را پر نمی‌کند."
        ]
    },
    "ascendedSkills": [
        {
            "id": "death_claw_ascended",
            "baseSkillId": "death_claw",
            "name": "حکم چنگال واپسین",
            "en": "Final Claw Verdict",
            "description": "ضربه تک‌هدفه بسیار سنگین؛ زخم داوری ۳ نوبت باقی می‌ماند و همراهان روی هدف تمرکز می‌کنند.",
            "target": "یک دشمن",
            "mechanicId": "single_burst_mark",
            "requiredDomainStage": 1,
            "cooldownTurns": 0,
            "usesPerDomain": 1
        },
        {
            "id": "legion_ascended",
            "baseSkillId": "legion",
            "name": "فراخوان سه داور",
            "en": "Call of the Three Judges",
            "description": "فقط همراهان انتخاب‌شده را وارد فرم مرگ می‌کند؛ به‌جای احضار کل کلکسیون، آن‌ها را تقویت و به حمله هماهنگ وادار می‌کند.",
            "target": "حداکثر سه همراه احضارشده",
            "mechanicId": "triple_companion_assault",
            "requiredDomainStage": 2,
            "cooldownTurns": 0,
            "usesPerDomain": 1
        },
        {
            "id": "death_memory_ascended",
            "baseSkillId": "death_memory",
            "name": "دفتر حکم مردگان",
            "en": "Ledger of the Departed",
            "description": "سه نشان جنگ، بقا و جادو را روی هدف می‌گذارد؛ با مرگ هدف بخشی از اثر به دشمنان باقی‌مانده منتقل می‌شود.",
            "target": "یک دشمن",
            "mechanicId": "stacked_marks",
            "requiredDomainStage": 1,
            "cooldownTurns": 0,
            "usesPerDomain": 1
        },
        {
            "id": "bone_blossom_ascended",
            "baseSkillId": "bone_blossom",
            "name": "باغ استخوان‌های داوری",
            "en": "Judgment Bone Garden",
            "description": "برای همراهان احضارشده سپر و دفاع می‌سازد؛ مهاجمی که سپر را بشکند زخم استخوانی می‌گیرد.",
            "target": "همراهان احضارشده",
            "mechanicId": "team_ward",
            "requiredDomainStage": 2,
            "cooldownTurns": 0,
            "usesPerDomain": 1
        },
        {
            "id": "assembly_of_souls_ascended",
            "baseSkillId": "assembly_of_souls",
            "name": "مجلس سه فرمان",
            "en": "Council of Three Commands",
            "description": "یکی از سه فرمان را انتخاب می‌کند: شکار برای آسیب گروهی، محافظت برای سپر، تغذیه برای درمان همراهان و بازیکن.",
            "target": "انتخابی: دشمنان یا گروه",
            "mechanicId": "command_choice",
            "requiredDomainStage": 1,
            "cooldownTurns": 0,
            "usesPerDomain": 1
        },
        {
            "id": "life_siphon_ascended",
            "baseSkillId": "life_siphon",
            "name": "مکیدن جوهر واپسین",
            "en": "Final Essence Siphon",
            "description": "از دشمن حیات و مانا می‌گیرد؛ درمان فقط میان نکرومنسر و سه همراه احضارشده تقسیم می‌شود.",
            "target": "یک دشمن و گروه احضارشده",
            "mechanicId": "life_transfer",
            "requiredDomainStage": 1,
            "cooldownTurns": 0,
            "usesPerDomain": 1
        },
        {
            "id": "kingdom_of_bones_ascended",
            "baseSkillId": "kingdom_of_bones",
            "name": "فرمان سه‌گانه استخوان",
            "en": "Triune Bone Edict",
            "description": "سه همراه احضارشده یک یورش هماهنگ انجام می‌دهند؛ هر نقش اثر متفاوت دارد: تانک دفاع می‌شکند، مهاجم آسیب می‌زند، پشتیبان گروه را تقویت می‌کند.",
            "target": "حداکثر سه همراه احضارشده",
            "mechanicId": "role_combo",
            "requiredDomainStage": 2,
            "cooldownTurns": 0,
            "usesPerDomain": 1
        },
        {
            "id": "return_threshold_ascended",
            "baseSkillId": "return_threshold",
            "name": "ردّ حکم مرگ",
            "en": "Refusal of the Last Judgment",
            "description": "یک‌بار در نبرد، ضربه مرگبار را خنثی می‌کند و نکرومنسر با ۳۵٪ سلامتی بازمی‌گردد؛ همراهان را زنده یا درمان نمی‌کند.",
            "target": "خود",
            "mechanicId": "self_revive",
            "requiredDomainStage": 1,
            "cooldownTurns": 0,
            "usesPerDomain": 1
        },
        {
            "id": "soul_domination_ascended",
            "baseSkillId": "soul_domination",
            "name": "زنجیر اراده داور",
            "en": "Judge’s Will Chains",
            "description": "یک دشمن عادی را برای یک نوبت مهار می‌کند؛ باس فقط ۲۰٪ حمله و سرعت از دست می‌دهد.",
            "target": "یک دشمن؛ باس فقط تضعیف",
            "mechanicId": "control_or_boss_debuff",
            "requiredDomainStage": 1,
            "cooldownTurns": 0,
            "usesPerDomain": 1
        },
        {
            "id": "eternal_sovereign_ascended",
            "baseSkillId": "eternal_sovereign",
            "name": "تجسد فرمانروای واپسین",
            "en": "Avatar of the Final Sovereign",
            "description": "نکرومنسر و سه همراه وارد حالت سلطنتی می‌شوند؛ همراهان آسیب و مقاومت می‌گیرند و بخشی از آسیب واقعی آن‌ها به گروه بازمی‌گردد.",
            "target": "خود و همراهان احضارشده",
            "mechanicId": "final_team_stance",
            "requiredDomainStage": 3,
            "cooldownTurns": 0,
            "usesPerDomain": 1
        }
    ],
    "domainTrial": {
        "name": "تخت خالی پادشاه مردگان",
        "requiredForStage": 4,
        "stages": [
            {
                "id": "silent_tomb",
                "name": "آرامگاه خاموش",
                "objective": "شکست نگهبانان مرده."
            },
            {
                "id": "hall_of_souls",
                "name": "تالار ارواح",
                "objective": "مدیریت ارواح و شکست موج‌های روحی."
            },
            {
                "id": "legion_trial",
                "name": "محاکمه لژیون",
                "objective": "پیروزی با حفظ اعضای لژیون در برابر دشمنان ضدلژیون."
            },
            {
                "id": "nameless_king",
                "name": "پادشاه بی‌نام",
                "objective": "شکست فرمانروای نخستین مردگان."
            }
        ],
        "rewards": [
            "بازشدن مرحله چهارم قلمرو",
            "تکامل نهایی فرم مرگ لژیون",
            "عنوان وارث تخت مردگان"
        ]
    },
    "progression": {
        "skillUnlockLevels": [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10
        ],
        "upgradesPerSkill": 6,
        "skillUpgradeCost": 1,
        "talentCount": 32,
        "talentBranches": 4,
        "talentsPerBranch": 8,
        "talentMaxRank": 5,
        "talentPointRule": "هر سطح ۱ امتیاز استعداد؛ گره‌های رده ۲ تا ۴ به پیش‌نیاز همان شاخه نیاز دارند.",
        "attributePointsPerLevel": 5,
        "skillPointsPerLevel": 2,
        "talentPointsPerLevel": 1,
        "levelCap": 100,
        "domainLevels": [
            25,
            40,
            60,
            80
        ],
        "domainTrialRequiredForStage": 4,
        "ascendedSkillChoiceCount": 1,
        "ascendedSkillAvailableOnlyInDomain": true,
        "ascendedSkillAvailability": "domain_stage_gated",
        "ascendedSkillSelectionTiming": "after_domain_activation",
        "ascendedSkillSelectionLimitPerDomain": 1,
        "ascendedSkillUsesPerDomain": 1
    },
    "integrationStatus": "v1996_redesigned_talents_domain_ascension_runtime_connected"
};
const NECROMANCER_LEGION_ABILITY_ARCHETYPES = [
    { id: "grave_cleave", name: "شکاف گور", description: "ضربه تقویت‌شده و شکستن ۱۵٪ دفاع هدف برای ۲ نوبت.", damagePct: 35, defenseBreakPct: 15, turns: 2 },
    { id: "soul_drinker", name: "مکنده روح", description: "ضربه تقویت‌شده و بازیابی ۳٪ حداکثر سلامتی نکرومنسر.", damagePct: 25, healPct: 3 },
    { id: "bone_ward", name: "نفرین استخوانی", description: "ضربه تقویت‌شده و کاهش ۱۲٪ حمله هدف برای ۱ نوبت.", damagePct: 20, attackReductionPct: 12, turns: 1 },
    { id: "wraith_rush", name: "یورش شبح", description: "یورش سریع با ۵۰٪ آسیب بیشتر.", damagePct: 50 },
    { id: "plague_brand", name: "نشان طاعون", description: "ضربه تقویت‌شده و زخم ۲ نوبتی بر پایه قدرت عضو.", damagePct: 25, woundPct: 10, turns: 2 }
];
function necromancerStableHash(value) { let hash = 2166136261; for (const ch of String(value || "undead")) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
} return hash >>> 0; }
export function getNecromancerLegionAbilities(member = {}) {
    var _a, _b, _c;
    const species = String(member.speciesId || member.encounterId || member.legacyId || member.name || member.id || "undead").toLowerCase();
    const originalAbility = String(member.specialAbilityId || member.abilityType || ((_b = (_a = member.abilities) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id) || ((_c = member.abilities) === null || _c === void 0 ? void 0 : _c[0]) || member.specialAbility || species).toLowerCase();
    const index = /heal|life|soul|درمان|شفا|روح|حیات/.test(originalAbility) ? 1
        : /guard|defen[cs]e|armor|shield|دفاع|زره|سپر/.test(originalAbility) ? 2
            : /poison|plague|bleed|venom|سم|زهر|خونریزی|طاعون/.test(originalAbility) ? 4
                : /speed|dash|charge|swift|سرعت|یورش|جهش|چابک/.test(originalAbility) ? 3
                    : /attack|strike|claw|slash|ضربه|حمله|چنگال|برش/.test(originalAbility) ? 0
                        : necromancerStableHash(species) % NECROMANCER_LEGION_ABILITY_ARCHETYPES.length;
    const base = NECROMANCER_LEGION_ABILITY_ARCHETYPES[index];
    const death = NECROMANCER_LEGION_ABILITY_ARCHETYPES[(index + 2) % NECROMANCER_LEGION_ABILITY_ARCHETYPES.length];
    return {
        legionAbility: { ...base, id: `${species}:legion:${base.id}`, basedOn: originalAbility },
        deathFormAbility: { ...death, id: `${species}:death:${death.id}`, basedOn: originalAbility, name: `فرم مرگ: ${death.name}`, description: `توانایی تازه در فرم مرگ؛ ${death.description}`, damagePct: Math.floor(death.damagePct * 1.25), defenseBreakPct: death.defenseBreakPct ? Math.floor(death.defenseBreakPct * 1.25) : 0, healPct: death.healPct ? Math.ceil(death.healPct * 1.25) : 0, attackReductionPct: death.attackReductionPct ? Math.floor(death.attackReductionPct * 1.25) : 0, woundPct: death.woundPct ? Math.floor(death.woundPct * 1.25) : 0 }
    };
}
export function applyNecromancerLegionIdentity(member = {}) {
    var _a;
    const abilities = getNecromancerLegionAbilities(member);
    return { ...member, ...abilities, deathForm: ((_a = member.deathForm) === null || _a === void 0 ? void 0 : _a.active) ? { ...member.deathForm, abilityId: abilities.deathFormAbility.id } : (member.deathForm || null) };
}
export function createNecromancerProgress() { return { storedSouls: 0, skillRanks: {}, unlockedTalents: [], talentRanks: {}, talentPoints: 0, domainStage: 0, domainQuest: { started: false, completedStages: [], complete: false }, domainActive: false, domainTurnsRemaining: 0, domainUsesThisBattle: 0, ascendedSkillId: null, ascendedSkillUsedThisDomain: false, underworldGateUnlocked: false, companions: [], legion: [], activeLegionIds: [], skillCooldowns: {}, buffs: {}, statuses: {}, reviveUsedThisBattle: false }; }
let legionIdentityCounter = 0;
function makeLegionMemberId() { legionIdentityCounter += 1; return `legion_${Date.now().toString(36)}_${legionIdentityCounter.toString(36)}_${Math.random().toString(36).slice(2, 8)}`; }
export function normalizeNecromancerProgress(progress) {
    const p = { ...createNecromancerProgress(), ...(progress || {}) };
    p.storedSouls = Math.max(0, Math.min(NECROMANCER.soulSystem.baseCapacity + 2, Number(p.storedSouls) || 0));
    const oldActive = Array.isArray(p.activeLegionIds) ? p.activeLegionIds.map(String) : [];
    const seen = new Set();
    p.legion = Array.isArray(p.companions) ? p.companions : (Array.isArray(p.legion) ? p.legion : []);
    p.legion = p.legion.map((m, index) => {
        var _a, _b, _c, _d;
        const maxHp = Math.max(1, Number(m.maxHp) || Number(m.baseMaxHp) || Number(m.hp) || 1);
        const baseMaxHp = Math.max(1, Number(m.baseMaxHp) || maxHp);
        const baseAttack = Math.max(1, Number(m.baseAttack) || Number(m.attack) || 1);
        const baseDefense = Math.max(0, Number((_a = m.baseDefense) !== null && _a !== void 0 ? _a : m.defense) || 0);
        let id = String(m.id || '');
        if (!id || seen.has(id))
            id = makeLegionMemberId();
        seen.add(id);
        return applyNecromancerLegionIdentity({ ...m, id, instanceId: id, maxHp: Math.max(maxHp, baseMaxHp), baseMaxHp, baseAttack, baseDefense, hp: Math.min(Math.max(maxHp, baseMaxHp), Math.max(0, Number((_b = m.hp) !== null && _b !== void 0 ? _b : maxHp))), attack: Math.max(1, Number(m.attack) || baseAttack), defense: Math.max(0, Number((_c = m.defense) !== null && _c !== void 0 ? _c : baseDefense) || 0), incapacitated: Number((_d = m.hp) !== null && _d !== void 0 ? _d : maxHp) <= 0 });
    });
    // Migrate legacy selections by matching the first exact legacy identity only.
    const migrated = [];
    for (const oldId of oldActive) {
        const match = p.legion.find(m => !migrated.includes(m.id) && (String(m.legacyId || '') === oldId || String(m.speciesId || m.name || '') === oldId || String(m.id) === oldId));
        if (match && Number(match.hp) > 0)
            migrated.push(match.id);
    }
    p.activeLegionIds = [...new Set(migrated.length ? migrated : p.legion.slice(0, 3).map(m => m.id))].filter(id => p.legion.some(m => m.id === id && Number(m.hp) > 0)).slice(0, 3);
    p.companions = p.legion;
    p.skillRanks = { ...(p.skillRanks || {}) };
    for (const skill of NECROMANCER.skills)
        if (skill.id === 'underworld_gate') {
            delete p.skillRanks[skill.id];
        }
        else
            p.skillRanks[skill.id] = Math.max(0, Math.min(7, Number(p.skillRanks[skill.id]) || 0));
    p.unlockedTalents = [...new Set(Array.isArray(p.unlockedTalents) ? p.unlockedTalents : [])];
    p.talentRanks = { ...(p.talentRanks || {}) };
    p.talentPoints = Math.max(0, Number(p.talentPoints) || 0);
    p.domainStage = Math.max(0, Math.min(4, Number(p.domainStage) || 0));
    p.domainTurnsRemaining = Math.max(0, Number(p.domainTurnsRemaining) || 0);
    p.skillCooldowns = { ...(p.skillCooldowns || {}) };
    p.buffs = { ...(p.buffs || {}) };
    p.statuses = { ...(p.statuses || {}) };
    p.domainQuest = { ...createNecromancerProgress().domainQuest, ...(p.domainQuest || {}) };
    return p;
}
export function recruitNecromancerLegion(progress, corpse, rollPercent, talentEffects = {}) { var _a; const p = normalizeNecromancerProgress(progress); if (!corpse || corpse.recruitable === false)
    return { ok: false, reason: "invalid_corpse", progress: p, corpseConsumed: false }; const kind = String(corpse.encounterKind || corpse.kind || "").toLowerCase(); const baseChance = (corpse.boss === true || ["boss", "area_boss"].includes(kind)) ? 7 : (kind === "miniboss" || kind === "mini_boss") ? 12 : 35; const chance = Math.min(75, baseChance + Math.max(0, p.skillRanks.legion - 1) * 3 + Math.max(0, Number(talentEffects.legionRecruitChancePct) || 0)); if (Number(rollPercent) >= chance)
    return { ok: false, reason: "recruit_failed", progress: p, corpseConsumed: true, chance, baseChance }; const baseMaxHp = Math.max(1, Number(corpse.baseMaxHp) || Number(corpse.maxHp) || Number(corpse.hp) || 1), baseAttack = Math.max(1, Number(corpse.baseAttack) || Number(corpse.attack) || 1), baseDefense = Math.max(0, Number((_a = corpse.baseDefense) !== null && _a !== void 0 ? _a : corpse.defense) || 0), id = makeLegionMemberId(); const member = applyNecromancerLegionIdentity({ ...corpse, id, instanceId: id, permanent: true, deathForm: null, baseMaxHp, baseAttack, baseDefense, maxHp: baseMaxHp, hp: baseMaxHp, attack: baseAttack, defense: baseDefense }); delete member.boss; delete member.recruitable; p.legion.push(member); if (p.activeLegionIds.length < 3)
    p.activeLegionIds.push(id); return { ok: true, progress: p, member, chance, baseChance, corpseConsumed: true }; }
export function getNecromancerTalentEffects(progress = {}) {
    const p = normalizeNecromancerProgress(progress), out = {};
    for (const t of NECROMANCER.talents) {
        const rank = Math.max(0, Math.min(t.maxRank, Number(p.talentRanks[t.id]) || 0));
        if (!rank)
            continue;
        out[t.effectKey] = (Number(out[t.effectKey]) || 0) + Number(t.effectPerRank || 0) * rank;
    }
    return out;
}
export function unlockNecromancerTalent(progress, talentId) {
    const p = normalizeNecromancerProgress(progress), t = NECROMANCER.talents.find(x => x.id === talentId);
    if (!t)
        return { ok: false, reason: 'invalid_talent', progress: p };
    const rank = Number(p.talentRanks[t.id]) || 0;
    if (rank >= t.maxRank)
        return { ok: false, reason: 'max_rank', progress: p };
    if (t.requiresTalent && (Number(p.talentRanks[t.requiresTalent]) || 0) < 1)
        return { ok: false, reason: 'prerequisite', progress: p };
    if (p.talentPoints < 1)
        return { ok: false, reason: 'no_talent_points', progress: p };
    p.talentPoints--;
    p.talentRanks[t.id] = rank + 1;
    if (!p.unlockedTalents.includes(t.id))
        p.unlockedTalents.push(t.id);
    return { ok: true, progress: p, effects: getNecromancerTalentEffects(p) };
}
export function advanceNecromancerDomain(progress, playerLevel, trialComplete = false) {
    const p = normalizeNecromancerProgress(progress), next = p.domainStage + 1, stage = NECROMANCER.domain.stages.find(x => x.stage === next);
    if (!stage)
        return { ok: false, reason: 'max_stage', progress: p };
    if (Number(playerLevel) < stage.unlockLevel)
        return { ok: false, reason: 'level_locked', progress: p, requiredLevel: stage.unlockLevel };
    if (stage.requiresQuest && !trialComplete && !p.domainQuest.complete)
        return { ok: false, reason: 'trial_required', progress: p };
    p.domainStage = next;
    if (stage.requiresQuest)
        p.domainQuest.complete = true;
    return { ok: true, progress: p, stage };
}
export function activateNecromancerDomain(progress, playerLevel) {
    const p = normalizeNecromancerProgress(progress), stage = NECROMANCER.domain.stages[Math.max(0, p.domainStage - 1)];
    if (Number(playerLevel) < NECROMANCER.domain.unlockLevel)
        return { ok: false, reason: 'level_locked', progress: p };
    if (p.domainStage < 1)
        return { ok: false, reason: 'domain_stage_locked', progress: p };
    if (p.domainUsesThisBattle >= 1)
        return { ok: false, reason: 'already_used_this_battle', progress: p };
    const souls = Number(NECROMANCER.domain.activationCost.souls) || 0, manaPct = Number(NECROMANCER.domain.activationCost.manaPercent) || 0;
    if (p.storedSouls < souls)
        return { ok: false, reason: 'insufficient_souls', progress: p, requiredSouls: souls };
    p.storedSouls -= souls;
    p.domainActive = true;
    p.domainTurnsRemaining = stage.durationTurns;
    p.domainUsesThisBattle++;
    p.ascendedSkillId = null;
    p.ascendedSkillUsedThisDomain = false;
    const active = new Set(p.activeLegionIds.map(String));
    p.legion = p.legion.map(m => { const member = applyNecromancerLegionIdentity(m); if (!active.has(String(member.id)) || Number(member.hp) <= 0)
        return { ...member, deathForm: null }; return { ...member, deathForm: { active: true, formId: `${m.speciesId || m.id || 'undead'}_death_form_stage_${p.domainStage}`, abilityId: member.deathFormAbility.id, domainStage: p.domainStage } }; });
    p.companions = p.legion;
    return { ok: true, progress: p, stage, activationCost: { souls, manaPercent: manaPct }, availableSkills: getAvailableNecromancerAscendedSkills(p) };
}
export function getAvailableNecromancerAscendedSkills(progress) { const p = normalizeNecromancerProgress(progress); if (!p.domainActive || p.ascendedSkillUsedThisDomain)
    return []; return NECROMANCER.ascendedSkills.filter(x => Number(x.requiredDomainStage || 1) <= p.domainStage); }
export function consumeNecromancerAscendedSkill(progress, skillId) { const p = normalizeNecromancerProgress(progress); if (!p.domainActive)
    return { ok: false, reason: 'domain_not_active', progress: p }; if (p.ascendedSkillUsedThisDomain)
    return { ok: false, reason: 'ascended_skill_already_used', progress: p }; const skill = getAvailableNecromancerAscendedSkills(p).find(x => x.id === skillId); if (!skill)
    return { ok: false, reason: 'skill_locked_or_invalid', progress: p }; p.ascendedSkillId = skill.id; p.ascendedSkillUsedThisDomain = true; return { ok: true, progress: p, skill }; }
export function tickNecromancerDomain(progress) { const p = normalizeNecromancerProgress(progress); if (!p.domainActive)
    return p; p.domainTurnsRemaining = Math.max(0, p.domainTurnsRemaining - 1); if (p.domainTurnsRemaining === 0)
    return endNecromancerDomain(p); return p; }
export function endNecromancerDomain(progress) { const p = normalizeNecromancerProgress(progress); p.domainActive = false; p.domainTurnsRemaining = 0; p.ascendedSkillId = null; p.ascendedSkillUsedThisDomain = false; p.legion = p.legion.map(m => ({ ...m, deathForm: null })); p.companions = p.legion; return p; }
export function resetNecromancerBattle(progress) { const p = normalizeNecromancerProgress(progress); p.domainUsesThisBattle = 0; p.reviveUsedThisBattle = false; p.skillCooldowns = {}; p.buffs = {}; p.statuses = {}; return p; }
/** V1997: recover only living companions after victory; incapacitated members remain down. */
export function recoverNecromancerCompanions(progress = {}, recoveryPct = 0) {
    const p = normalizeNecromancerProgress(progress), pct = Math.max(0, Math.min(100, Number(recoveryPct) || 0));
    p.legion = p.legion.map(member => { const max = Math.max(1, Number(member.maxHp) || Number(member.baseMaxHp) || 1), hp = Math.max(0, Number(member.hp) || 0); if (hp <= 0 || pct <= 0)
        return { ...member, deathForm: null, incapacitated: hp <= 0 }; const healed = Math.min(max - hp, Math.floor(max * pct / 100)); return { ...member, hp: hp + healed, deathForm: null, incapacitated: false }; });
    p.companions = p.legion;
    return p;
}
/** V1995 canonical active roster helper: the collection is unlimited, the deployed party is capped at three. */
export function getNecromancerBattleCompanions(progress = {}, combat = null) {
    const roster = Array.isArray(progress.companions) ? progress.companions : (Array.isArray(progress.legion) ? progress.legion : []);
    const deployed = Array.isArray(combat === null || combat === void 0 ? void 0 : combat.summonedLegionIds) && combat.summonedLegionIds.length ? combat.summonedLegionIds : (progress.activeLegionIds || []);
    const ids = new Set(deployed.map(String));
    return roster.filter(member => ids.has(String(member.id || member.speciesId || member.name)) && Number(member.hp) > 0);
}
