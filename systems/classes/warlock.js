/* ETRANOM Warlock specialization data. Turn-based text combat; no spatial mechanics. */
export const WARLOCK = {
  "id": "wizard_warlock",
  "classId": "wizard",
  "className": "جادوگر",
  "specialization": "وارلاک",
  "specializationEn": "Warlock",
  "version": 1,
  "identity": {
    "role": "وارث پیمان‌های ممنوع؛ مدیریت بدهی، دست‌کاری قوانین نبرد، قربانی و قرارداد با موجودات کهن",
    "theme": "دارک فانتزی",
    "resource": "مانا",
    "secondaryResource": "اعتبار پیمان و بدهی پیمان",
    "strengths": [
      "تصمیم‌سازی و کنترل تاکتیکی",
      "تبدیل رفتار دشمن به منبع قدرت",
      "ریسک/پاداش مبتنی بر HP و بدهی",
      "چند انتخاب متفاوت برای مهارت‌های مهم"
    ],
    "weaknesses": [
      "نیازمند مدیریت بدهی و زمان‌بندی",
      "هزینه‌های بالا",
      "فرسودگی پس از تجلی نهایی"
    ],
    "attributes": {
      "primary": "intellect",
      "secondary": [
        "vitality",
        "perception",
        "endurance"
      ]
    }
  },
  "combatRules": {
    "mode": "turn_based_text",
    "distance": false,
    "targeting": "یک دشمن، تمام دشمنان زنده، یا خود بازیکن؛ پیوند می‌تواند یک دشمن و خود بازیکن را هم‌زمان هدف بگیرد.",
    "turnDuration": "تمام مدت‌ها برحسب نوبت مشخص شده‌اند.",
    "cooldownUnit": "نوبت بازیکن",
    "manaCostBasis": "درصد هزینه از حداکثر مانای مؤثر محاسبه می‌شود؛ نه مانای فعلی. هزینه پایه پیش از تخفیف‌ها محاسبه و رو به بالا گرد می‌شود.",
    "bossControl": "باس‌ها از حذف نوبت، حذف کامل از واقعیت و کنترل مطلق مصون‌اند؛ نسخه‌های باس‌محور اثر تضعیف‌شده دارند.",
    "spatialMechanics": false
  },
  "pactSystem": {
    "resource": "pactDebt",
    "maxDebt": 8,
    "credit": "pactCredit",
    "maxCredit": 8,
    "rules": [
      "هر مهارت دارای برچسب pact_debt طبق شرح خود بدهی ایجاد می‌کند.",
      "هر 2 بدهی مصرف‌شده در آخرین قرارداد 8٪ قدرت تجلی می‌دهد؛ سقف پایه +40٪.",
      "اعتبار پیمان منبع جدا از مانا است و فقط در مهارت‌هایی که صریحاً ذکر شده‌اند مصرف/تولید می‌شود.",
      "بدهی و اعتبار در پایان نبرد پاک می‌شوند.",
      "هیچ بدهی‌ای نباید باعث مرگ خودکار بازیکن شود."
    ]
  },
  "skills": [
    {
      "id": "forbidden_signature",
      "name": "امضای ممنوع",
      "en": "Forbidden Signature",
      "unlockLevel": 1,
      "type": "single_damage",
      "target": "یک دشمن",
      "damagePct": 170,
      "element": "تاریکی",
      "manaCostPercent": 7,
      "cooldownTurns": 0,
      "durationTurns": 2,
      "description": "با امضای ممنوع، مُهر تاریک را مستقیماً بر پیکر یک دشمن می‌کوبی و برابر ۱۷۰٪ قدرت جادویی آسیب وارد می‌کنی؛ سپس قدرت حمله هدف برای ۲ نوبت ۸٪ کاهش می‌یابد.",
      "bossRules": "به باس نیز آسیب مستقیم وارد می‌شود؛ کاهش حمله باس همچنان ۸٪ است.",
      "upgradeRanks": 6,
      "upgrades": [
        {
          "rank": 2,
          "pointsRequired": 1,
          "effect": "رتبه 2: ضریب اثر اصلی 108٪ مقدار پایه؛ هزینه مانا 7٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش پایداری اثر و کاهش ۱ نوبت از زمان بازیابی در صورت وجود."
        },
        {
          "rank": 3,
          "pointsRequired": 2,
          "effect": "رتبه 3: ضریب اثر اصلی 116٪ مقدار پایه؛ هزینه مانا 7٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت اثر اصلی."
        },
        {
          "rank": 4,
          "pointsRequired": 3,
          "effect": "رتبه 4: ضریب اثر اصلی 124٪ مقدار پایه؛ هزینه مانا 7٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت و بهبود تعامل با اعتبار پیمان."
        },
        {
          "rank": 5,
          "pointsRequired": 4,
          "effect": "رتبه 5: ضریب اثر اصلی 132٪ مقدار پایه؛ هزینه مانا 6٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت؛ محدودیت باس همچنان برقرار است."
        },
        {
          "rank": 6,
          "pointsRequired": 5,
          "effect": "رتبه 6: ضریب اثر اصلی 140٪ مقدار پایه؛ هزینه مانا 6٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت و کاهش ۱٪ هزینه مانای پایه."
        },
        {
          "rank": 7,
          "pointsRequired": 6,
          "effect": "رتبه 7: ضریب اثر اصلی 148٪ مقدار پایه؛ هزینه مانا 6٪ حداکثر مانای مؤثر.",
          "bonus": "استادکاری: افزایش ۱۰٪ شدت نهایی؛ بدون تغییر محدودیت استفاده در نبرد."
        }
      ],
      "tags": [
        "پیمان‌نویسی",
        "pact_debt"
      ]
    },
    {
      "id": "stolen_moment",
      "name": "سرقت لحظه",
      "en": "Stolen Moment",
      "unlockLevel": 2,
      "type": "control",
      "target": "یک دشمن",
      "manaCostPercent": 9,
      "cooldownTurns": 1,
      "durationTurns": 2,
      "description": "یک نوبت آینده هدف را می‌رباید: هدف در نوبت بعدی نمی‌تواند مهارت ویژه اجرا کند و وارلاک یک «لحظه دزدیده‌شده» می‌گیرد؛ مهارت بعدی وارلاک 20٪ ارزان‌تر و 15٪ قوی‌تر است. اگر هدف باس باشد، مهارت بعدی‌اش 20٪ ضعیف‌تر و هزینه‌اش 15٪ بیشتر می‌شود؛ نوبتش حذف نمی‌شود.",
      "bossRules": "لحظه دزدیده‌شده تا پایان نوبت بعدی وارلاک باقی می‌ماند.",
      "upgradeRanks": 6,
      "upgrades": [
        {
          "rank": 2,
          "pointsRequired": 1,
          "effect": "رتبه 2: ضریب اثر اصلی 108٪ مقدار پایه؛ هزینه مانا 9٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش پایداری اثر و کاهش ۱ نوبت از زمان بازیابی در صورت وجود."
        },
        {
          "rank": 3,
          "pointsRequired": 2,
          "effect": "رتبه 3: ضریب اثر اصلی 116٪ مقدار پایه؛ هزینه مانا 9٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت اثر اصلی."
        },
        {
          "rank": 4,
          "pointsRequired": 3,
          "effect": "رتبه 4: ضریب اثر اصلی 124٪ مقدار پایه؛ هزینه مانا 9٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت و بهبود تعامل با اعتبار پیمان."
        },
        {
          "rank": 5,
          "pointsRequired": 4,
          "effect": "رتبه 5: ضریب اثر اصلی 132٪ مقدار پایه؛ هزینه مانا 8٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت؛ محدودیت باس همچنان برقرار است."
        },
        {
          "rank": 6,
          "pointsRequired": 5,
          "effect": "رتبه 6: ضریب اثر اصلی 140٪ مقدار پایه؛ هزینه مانا 8٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت و کاهش ۱٪ هزینه مانای پایه."
        },
        {
          "rank": 7,
          "pointsRequired": 6,
          "effect": "رتبه 7: ضریب اثر اصلی 148٪ مقدار پایه؛ هزینه مانا 8٪ حداکثر مانای مؤثر.",
          "bonus": "استادکاری: افزایش ۱۰٪ شدت نهایی؛ بدون تغییر محدودیت استفاده در نبرد."
        }
      ],
      "tags": [
        "دست‌کاری نوبت",
        "pact_debt"
      ]
    },
    {
      "id": "demons_testament",
      "name": "وصیت‌نامه اهریمن",
      "en": "Demon’s Testament",
      "unlockLevel": 3,
      "type": "stance",
      "target": "خود",
      "manaCostPercent": 10,
      "cooldownTurns": 0,
      "durationTurns": 0,
      "description": "تا پایان نبرد پیمان وصیت فعال می‌شود: هر مهارت وارلاک 1 بدهی ایجاد می‌کند و به‌ازای هر بدهی، آسیب جادویی 3٪ افزایش می‌یابد (حداکثر 8 پشته). در 4 و 8 بدهی، وارلاک به‌ترتیب 3٪ حداکثر HP و 5٪ حداکثر MP را از دست می‌دهد. با اجرای دوباره، قرارداد فسخ و هر 2 بدهی به 1 اعتبار پیمان تبدیل می‌شود.",
      "bossRules": "فسخ، بدهی‌های باقی‌مانده را پاک می‌کند؛ در صورت رسیدن HP به 1، جریمه HP متوقف می‌شود.",
      "upgradeRanks": 6,
      "upgrades": [
        {
          "rank": 2,
          "pointsRequired": 1,
          "effect": "رتبه 2: ضریب اثر اصلی 108٪ مقدار پایه؛ هزینه مانا 10٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش پایداری اثر و کاهش ۱ نوبت از زمان بازیابی در صورت وجود."
        },
        {
          "rank": 3,
          "pointsRequired": 2,
          "effect": "رتبه 3: ضریب اثر اصلی 116٪ مقدار پایه؛ هزینه مانا 10٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت اثر اصلی."
        },
        {
          "rank": 4,
          "pointsRequired": 3,
          "effect": "رتبه 4: ضریب اثر اصلی 124٪ مقدار پایه؛ هزینه مانا 10٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت و بهبود تعامل با اعتبار پیمان."
        },
        {
          "rank": 5,
          "pointsRequired": 4,
          "effect": "رتبه 5: ضریب اثر اصلی 132٪ مقدار پایه؛ هزینه مانا 9٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت؛ محدودیت باس همچنان برقرار است."
        },
        {
          "rank": 6,
          "pointsRequired": 5,
          "effect": "رتبه 6: ضریب اثر اصلی 140٪ مقدار پایه؛ هزینه مانا 9٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت و کاهش ۱٪ هزینه مانای پایه."
        },
        {
          "rank": 7,
          "pointsRequired": 6,
          "effect": "رتبه 7: ضریب اثر اصلی 148٪ مقدار پایه؛ هزینه مانا 9٪ حداکثر مانای مؤثر.",
          "bonus": "استادکاری: افزایش ۱۰٪ شدت نهایی؛ بدون تغییر محدودیت استفاده در نبرد."
        }
      ],
      "tags": [
        "مدیریت بدهی",
        "pact_debt"
      ]
    },
    {
      "id": "reversal_of_sacrifice",
      "name": "وارونگی قربانی",
      "en": "Reversal of Sacrifice",
      "unlockLevel": 4,
      "type": "empower",
      "target": "خود",
      "manaCostPercent": 12,
      "cooldownTurns": 0,
      "durationTurns": 0,
      "description": "تا نوبت بعدی، مهارت بعدی وارلاک به‌جای مانا 7٪ حداکثر HP را قربانی می‌کند و قدرت پایه آن 55٪ افزایش می‌یابد. اگر آن مهارت به هدف آسیب بزند، 35٪ هزینه قربانی‌شده بازمی‌گردد. این هزینه نمی‌تواند وارلاک را بکشد و حداقل 1 HP باقی می‌گذارد.",
      "bossRules": "اگر وصیت‌نامه اهریمن فعال باشد، 1 بدهی اضافی تولید می‌کند.",
      "upgradeRanks": 6,
      "upgrades": [
        {
          "rank": 2,
          "pointsRequired": 1,
          "effect": "رتبه 2: ضریب اثر اصلی 108٪ مقدار پایه؛ هزینه مانا 12٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش پایداری اثر و کاهش ۱ نوبت از زمان بازیابی در صورت وجود."
        },
        {
          "rank": 3,
          "pointsRequired": 2,
          "effect": "رتبه 3: ضریب اثر اصلی 116٪ مقدار پایه؛ هزینه مانا 12٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت اثر اصلی."
        },
        {
          "rank": 4,
          "pointsRequired": 3,
          "effect": "رتبه 4: ضریب اثر اصلی 124٪ مقدار پایه؛ هزینه مانا 12٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت و بهبود تعامل با اعتبار پیمان."
        },
        {
          "rank": 5,
          "pointsRequired": 4,
          "effect": "رتبه 5: ضریب اثر اصلی 132٪ مقدار پایه؛ هزینه مانا 11٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت؛ محدودیت باس همچنان برقرار است."
        },
        {
          "rank": 6,
          "pointsRequired": 5,
          "effect": "رتبه 6: ضریب اثر اصلی 140٪ مقدار پایه؛ هزینه مانا 11٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت و کاهش ۱٪ هزینه مانای پایه."
        },
        {
          "rank": 7,
          "pointsRequired": 6,
          "effect": "رتبه 7: ضریب اثر اصلی 148٪ مقدار پایه؛ هزینه مانا 11٪ حداکثر مانای مؤثر.",
          "bonus": "استادکاری: افزایش ۱۰٪ شدت نهایی؛ بدون تغییر محدودیت استفاده در نبرد."
        }
      ],
      "tags": [
        "قربانی",
        "pact_debt"
      ]
    },
    {
      "id": "court_of_nameless",
      "name": "دادگاه بی‌نامان",
      "en": "Court of the Nameless",
      "unlockLevel": 5,
      "type": "choice_control",
      "target": "تمام دشمنان زنده",
      "manaCostPercent": 14,
      "cooldownTurns": 2,
      "durationTurns": 4,
      "description": "انتخاب یک حکم برای 2 نوبت: سکوتِ حکم (مهارت‌های ویژه دشمنان 25٪ ضعیف‌تر)، بازپرداخت (15٪ آسیب واردشده به وارلاک به مهاجم بازمی‌گردد)، یا مصادره (هر دشمن در آغاز نوبتش 3٪ حداکثر مانای مؤثر خود را از دست می‌دهد و وارلاک 1 اعتبار پیمان می‌گیرد).",
      "bossRules": "روی باس‌ها اثر حکم 50٪ است و مصادره مانا حداکثر 1 بار در هر نوبت باس رخ می‌دهد.",
      "upgradeRanks": 6,
      "upgrades": [
        {
          "rank": 2,
          "pointsRequired": 1,
          "effect": "رتبه 2: ضریب اثر اصلی 108٪ مقدار پایه؛ هزینه مانا 14٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش پایداری اثر و کاهش ۱ نوبت از زمان بازیابی در صورت وجود."
        },
        {
          "rank": 3,
          "pointsRequired": 2,
          "effect": "رتبه 3: ضریب اثر اصلی 116٪ مقدار پایه؛ هزینه مانا 14٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت اثر اصلی."
        },
        {
          "rank": 4,
          "pointsRequired": 3,
          "effect": "رتبه 4: ضریب اثر اصلی 124٪ مقدار پایه؛ هزینه مانا 14٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت و بهبود تعامل با اعتبار پیمان."
        },
        {
          "rank": 5,
          "pointsRequired": 4,
          "effect": "رتبه 5: ضریب اثر اصلی 132٪ مقدار پایه؛ هزینه مانا 13٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت؛ محدودیت باس همچنان برقرار است."
        },
        {
          "rank": 6,
          "pointsRequired": 5,
          "effect": "رتبه 6: ضریب اثر اصلی 140٪ مقدار پایه؛ هزینه مانا 13٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت و کاهش ۱٪ هزینه مانای پایه."
        },
        {
          "rank": 7,
          "pointsRequired": 6,
          "effect": "رتبه 7: ضریب اثر اصلی 148٪ مقدار پایه؛ هزینه مانا 13٪ حداکثر مانای مؤثر.",
          "bonus": "استادکاری: افزایش ۱۰٪ شدت نهایی؛ بدون تغییر محدودیت استفاده در نبرد."
        }
      ],
      "tags": [
        "حکم",
        "pact_debt"
      ]
    },
    {
      "id": "hostage_heart",
      "name": "قلب گروگان",
      "en": "Hostage Heart",
      "unlockLevel": 6,
      "type": "link",
      "target": "یک دشمن + خود",
      "manaCostPercent": 13,
      "cooldownTurns": 2,
      "durationTurns": 3,
      "description": "قلب قراردادی میان وارلاک و یک دشمن ایجاد می‌کند. تا 3 نوبت، 22٪ آسیب مستقیم واردشده به وارلاک به هدف منتقل می‌شود؛ 18٪ آسیب مستقیم وارلاک به هدف به HP او بازمی‌گردد. با شکستن زودهنگام، 70٪ مجموع آسیب منتقل‌شده به‌صورت ضربه تاریک به هدف وارد می‌شود.",
      "bossRules": "انتقال آسیب نمی‌تواند از HP باقی‌مانده هدف بیشتر شود؛ روی باس انتقال نصف است.",
      "upgradeRanks": 6,
      "upgrades": [
        {
          "rank": 2,
          "pointsRequired": 1,
          "effect": "رتبه 2: ضریب اثر اصلی 108٪ مقدار پایه؛ هزینه مانا 13٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش پایداری اثر و کاهش ۱ نوبت از زمان بازیابی در صورت وجود."
        },
        {
          "rank": 3,
          "pointsRequired": 2,
          "effect": "رتبه 3: ضریب اثر اصلی 116٪ مقدار پایه؛ هزینه مانا 13٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت اثر اصلی."
        },
        {
          "rank": 4,
          "pointsRequired": 3,
          "effect": "رتبه 4: ضریب اثر اصلی 124٪ مقدار پایه؛ هزینه مانا 13٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت و بهبود تعامل با اعتبار پیمان."
        },
        {
          "rank": 5,
          "pointsRequired": 4,
          "effect": "رتبه 5: ضریب اثر اصلی 132٪ مقدار پایه؛ هزینه مانا 12٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت؛ محدودیت باس همچنان برقرار است."
        },
        {
          "rank": 6,
          "pointsRequired": 5,
          "effect": "رتبه 6: ضریب اثر اصلی 140٪ مقدار پایه؛ هزینه مانا 12٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت و کاهش ۱٪ هزینه مانای پایه."
        },
        {
          "rank": 7,
          "pointsRequired": 6,
          "effect": "رتبه 7: ضریب اثر اصلی 148٪ مقدار پایه؛ هزینه مانا 12٪ حداکثر مانای مؤثر.",
          "bonus": "استادکاری: افزایش ۱۰٪ شدت نهایی؛ بدون تغییر محدودیت استفاده در نبرد."
        }
      ],
      "tags": [
        "پیوند",
        "pact_debt"
      ]
    },
    {
      "id": "erasure_from_reality",
      "name": "حذف از واقعیت",
      "en": "Erasure from Reality",
      "unlockLevel": 7,
      "type": "purge",
      "target": "یک دشمن",
      "manaCostPercent": 16,
      "cooldownTurns": 3,
      "durationTurns": 4,
      "description": "هدف برای یک نوبت از تبادل اثرها حذف می‌شود: اثرهای مثبتش تعلیق و اثرهای منفی‌اش متوقف می‌شوند؛ در بازگشت، یک اثر مثبت غیرذاتی حذف می‌شود. هدف حذف‌شده آسیب نمی‌گیرد و آسیب وارد نمی‌کند. علیه باس: یک اثر مثبت غیرذاتی حذف و مهارت بعدی 25٪ ضعیف می‌شود.",
      "bossRules": "مصونیت‌های ذاتی و فازهای داستانی حذف نمی‌شوند.",
      "upgradeRanks": 6,
      "upgrades": [
        {
          "rank": 2,
          "pointsRequired": 1,
          "effect": "رتبه 2: ضریب اثر اصلی 108٪ مقدار پایه؛ هزینه مانا 16٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش پایداری اثر و کاهش ۱ نوبت از زمان بازیابی در صورت وجود."
        },
        {
          "rank": 3,
          "pointsRequired": 2,
          "effect": "رتبه 3: ضریب اثر اصلی 116٪ مقدار پایه؛ هزینه مانا 16٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت اثر اصلی."
        },
        {
          "rank": 4,
          "pointsRequired": 3,
          "effect": "رتبه 4: ضریب اثر اصلی 124٪ مقدار پایه؛ هزینه مانا 16٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت و بهبود تعامل با اعتبار پیمان."
        },
        {
          "rank": 5,
          "pointsRequired": 4,
          "effect": "رتبه 5: ضریب اثر اصلی 132٪ مقدار پایه؛ هزینه مانا 15٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت؛ محدودیت باس همچنان برقرار است."
        },
        {
          "rank": 6,
          "pointsRequired": 5,
          "effect": "رتبه 6: ضریب اثر اصلی 140٪ مقدار پایه؛ هزینه مانا 15٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت و کاهش ۱٪ هزینه مانای پایه."
        },
        {
          "rank": 7,
          "pointsRequired": 6,
          "effect": "رتبه 7: ضریب اثر اصلی 148٪ مقدار پایه؛ هزینه مانا 15٪ حداکثر مانای مؤثر.",
          "bonus": "استادکاری: افزایش ۱۰٪ شدت نهایی؛ بدون تغییر محدودیت استفاده در نبرد."
        }
      ],
      "tags": [
        "خلأ",
        "pact_debt"
      ]
    },
    {
      "id": "heir_of_hunger",
      "name": "وارث گرسنگی",
      "en": "Heir of Hunger",
      "unlockLevel": 8,
      "type": "summon_resource",
      "target": "تمام دشمنان زنده",
      "manaCostPercent": 18,
      "cooldownTurns": 3,
      "durationTurns": 5,
      "description": "موجود گرسنگی برای 3 نوبت احضار می‌شود. هر بار دشمن مهارت اجرا کند، 2٪ حداکثر مانای مؤثرش را می‌بلعد و در مخزن گرسنگی ذخیره می‌کند (حداکثر 12٪). وارلاک در هر نوبت می‌تواند مخزن را به HP، MP یا قدرت ضربه بعدی تبدیل کند.",
      "bossRules": "اگر دشمن مانا نداشته باشد، از انرژی ویژه‌اش تغذیه نمی‌کند؛ علیه باس سقف مخزن 6٪ است.",
      "upgradeRanks": 6,
      "upgrades": [
        {
          "rank": 2,
          "pointsRequired": 1,
          "effect": "رتبه 2: ضریب اثر اصلی 108٪ مقدار پایه؛ هزینه مانا 18٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش پایداری اثر و کاهش ۱ نوبت از زمان بازیابی در صورت وجود."
        },
        {
          "rank": 3,
          "pointsRequired": 2,
          "effect": "رتبه 3: ضریب اثر اصلی 116٪ مقدار پایه؛ هزینه مانا 18٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت اثر اصلی."
        },
        {
          "rank": 4,
          "pointsRequired": 3,
          "effect": "رتبه 4: ضریب اثر اصلی 124٪ مقدار پایه؛ هزینه مانا 18٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت و بهبود تعامل با اعتبار پیمان."
        },
        {
          "rank": 5,
          "pointsRequired": 4,
          "effect": "رتبه 5: ضریب اثر اصلی 132٪ مقدار پایه؛ هزینه مانا 17٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت؛ محدودیت باس همچنان برقرار است."
        },
        {
          "rank": 6,
          "pointsRequired": 5,
          "effect": "رتبه 6: ضریب اثر اصلی 140٪ مقدار پایه؛ هزینه مانا 17٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت و کاهش ۱٪ هزینه مانای پایه."
        },
        {
          "rank": 7,
          "pointsRequired": 6,
          "effect": "رتبه 7: ضریب اثر اصلی 148٪ مقدار پایه؛ هزینه مانا 17٪ حداکثر مانای مؤثر.",
          "bonus": "استادکاری: افزایش ۱۰٪ شدت نهایی؛ بدون تغییر محدودیت استفاده در نبرد."
        }
      ],
      "tags": [
        "تغذیه",
        "pact_debt"
      ]
    },
    {
      "id": "true_name_shatter",
      "name": "شکستن نام حقیقی",
      "en": "True Name Shatter",
      "unlockLevel": 9,
      "type": "true_name_debuff",
      "target": "یک دشمن",
      "manaCostPercent": 20,
      "cooldownTurns": 3,
      "durationTurns": 5,
      "description": "یکی از چهار بند را می‌شکند: جسم (دفاع 22٪ کمتر)، اراده (حمله 20٪ کمتر)، جادو (قدرت مهارت 25٪ کمتر و هزینه مانا 15٪ بیشتر)، یا پیوند (حذف یک اثر مثبت غیرذاتی). اثر 3 نوبت؛ فقط یک بند هم‌زمان از این مهارت روی هر هدف فعال است.",
      "bossRules": "روی باس‌ها شدت 50٪ است؛ حذف اثر مثبت باس فقط یک بار در هر نبرد مجاز است.",
      "upgradeRanks": 6,
      "upgrades": [
        {
          "rank": 2,
          "pointsRequired": 1,
          "effect": "رتبه 2: ضریب اثر اصلی 108٪ مقدار پایه؛ هزینه مانا 20٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش پایداری اثر و کاهش ۱ نوبت از زمان بازیابی در صورت وجود."
        },
        {
          "rank": 3,
          "pointsRequired": 2,
          "effect": "رتبه 3: ضریب اثر اصلی 116٪ مقدار پایه؛ هزینه مانا 20٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت اثر اصلی."
        },
        {
          "rank": 4,
          "pointsRequired": 3,
          "effect": "رتبه 4: ضریب اثر اصلی 124٪ مقدار پایه؛ هزینه مانا 20٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت و بهبود تعامل با اعتبار پیمان."
        },
        {
          "rank": 5,
          "pointsRequired": 4,
          "effect": "رتبه 5: ضریب اثر اصلی 132٪ مقدار پایه؛ هزینه مانا 19٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت؛ محدودیت باس همچنان برقرار است."
        },
        {
          "rank": 6,
          "pointsRequired": 5,
          "effect": "رتبه 6: ضریب اثر اصلی 140٪ مقدار پایه؛ هزینه مانا 19٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت و کاهش ۱٪ هزینه مانای پایه."
        },
        {
          "rank": 7,
          "pointsRequired": 6,
          "effect": "رتبه 7: ضریب اثر اصلی 148٪ مقدار پایه؛ هزینه مانا 19٪ حداکثر مانای مؤثر.",
          "bonus": "استادکاری: افزایش ۱۰٪ شدت نهایی؛ بدون تغییر محدودیت استفاده در نبرد."
        }
      ],
      "tags": [
        "نام‌شکنی",
        "pact_debt"
      ]
    },
    {
      "id": "final_covenant",
      "name": "آخرین قرارداد",
      "en": "The Final Covenant",
      "unlockLevel": 10,
      "type": "ultimate_choice",
      "target": "تمام دشمنان زنده / انتخابی",
      "manaCostPercent": 28,
      "cooldownTurns": 5,
      "durationTurns": 8,
      "description": "تمام پشته‌های وصیت‌نامه و اعتبارهای پیمان مصرف می‌شوند. یکی از سه تجلی انتخاب می‌شود: نابودی، 360٪ قدرت جادویی به همه دشمنان؛ سلطه، 18٪ از HP ازدست‌رفته دشمنان به وارلاک بازمی‌گردد و حمله دشمنان 18٪ برای 2 نوبت کم می‌شود؛ خلأ، تمام اثرهای مثبت غیرذاتی دشمنان پاک و 160٪ قدرت جادویی آسیب وارد می‌شود. هر 2 بدهی مصرف‌شده 8٪ قدرت نهایی می‌افزاید (حداکثر +40٪).",
      "bossRules": "پس از اجرا فرسودگی پیمان برای 2 نوبت: آسیب وارلاک 20٪ کمتر و مهارت‌های بدهی‌ساز قفل می‌شوند. باس از حذف فاز/مصونیت ذاتی محافظت می‌شود.",
      "upgradeRanks": 6,
      "upgrades": [
        {
          "rank": 2,
          "pointsRequired": 1,
          "effect": "رتبه 2: ضریب اثر اصلی 108٪ مقدار پایه؛ هزینه مانا 28٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش پایداری اثر و کاهش ۱ نوبت از زمان بازیابی در صورت وجود."
        },
        {
          "rank": 3,
          "pointsRequired": 2,
          "effect": "رتبه 3: ضریب اثر اصلی 116٪ مقدار پایه؛ هزینه مانا 28٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت اثر اصلی."
        },
        {
          "rank": 4,
          "pointsRequired": 3,
          "effect": "رتبه 4: ضریب اثر اصلی 124٪ مقدار پایه؛ هزینه مانا 28٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت و بهبود تعامل با اعتبار پیمان."
        },
        {
          "rank": 5,
          "pointsRequired": 4,
          "effect": "رتبه 5: ضریب اثر اصلی 132٪ مقدار پایه؛ هزینه مانا 27٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت؛ محدودیت باس همچنان برقرار است."
        },
        {
          "rank": 6,
          "pointsRequired": 5,
          "effect": "رتبه 6: ضریب اثر اصلی 140٪ مقدار پایه؛ هزینه مانا 27٪ حداکثر مانای مؤثر.",
          "bonus": "افزایش ۵٪ شدت و کاهش ۱٪ هزینه مانای پایه."
        },
        {
          "rank": 7,
          "pointsRequired": 6,
          "effect": "رتبه 7: ضریب اثر اصلی 148٪ مقدار پایه؛ هزینه مانا 27٪ حداکثر مانای مؤثر.",
          "bonus": "استادکاری: افزایش ۱۰٪ شدت نهایی؛ بدون تغییر محدودیت استفاده در نبرد."
        }
      ],
      "tags": [
        "تجلی نهایی",
        "pact_debt"
      ]
    }
  ],
  "talentBranches": [
    {
      "id": "contract_law",
      "name": "قانون قرارداد",
      "talents": [
        "scribe_of_oaths",
        "fine_print",
        "interest_bearing",
        "binding_clause",
        "early_termination",
        "shared_liability",
        "sovereign_signature",
        "living_contract"
      ]
    },
    {
      "id": "void_jurisprudence",
      "name": "فقه خلأ",
      "talents": [
        "thin_reality",
        "suspended_benefit",
        "nameless_verdict",
        "null_signature",
        "void_residue",
        "broken_axiom",
        "unwritten_law",
        "absolute_absence"
      ]
    },
    {
      "id": "blood_economy",
      "name": "اقتصاد خون",
      "talents": [
        "measured_sacrifice",
        "red_accounting",
        "hostage_interest",
        "crimson_margin",
        "last_drop",
        "blood_transfusion",
        "predatory_vitality",
        "red_covenant"
      ]
    },
    {
      "id": "ancient_entities",
      "name": "موجودات کهن",
      "talents": [
        "hunger_whisper",
        "patient_devourer",
        "borrowed_instinct",
        "demonic_heritage",
        "throne_of_ashes",
        "ancient_tribute",
        "untrusted_alliance",
        "heir_apotheosis"
      ]
    }
  ],
  "talents": [
    {
      "id": "scribe_of_oaths",
      "name": "کاتب سوگند",
      "branchId": "contract_law",
      "branchName": "قانون قرارداد",
      "tier": 1,
      "maxRank": 1,
      "effect": "اعتبار پیمان حاصل از امضای ممنوع 1 واحد بیشتر می‌شود؛ حداکثر یک بار برای هر هدف.",
      "pointsRequired": 1,
      "prerequisite": null
    },
    {
      "id": "fine_print",
      "name": "بندهای پنهان",
      "branchId": "contract_law",
      "branchName": "قانون قرارداد",
      "tier": 2,
      "maxRank": 1,
      "effect": "مدت امضای ممنوع 1 نوبت افزایش می‌یابد.",
      "pointsRequired": 2,
      "prerequisite": null
    },
    {
      "id": "interest_bearing",
      "name": "بهره مرکب",
      "branchId": "contract_law",
      "branchName": "قانون قرارداد",
      "tier": 3,
      "maxRank": 1,
      "effect": "هر 2 اعتبار پیمان، آسیب مهارت بعدی را 3٪ افزایش می‌دهد؛ حداکثر 15٪.",
      "pointsRequired": 3,
      "prerequisite": null
    },
    {
      "id": "binding_clause",
      "name": "بند الزام‌آور",
      "branchId": "contract_law",
      "branchName": "قانون قرارداد",
      "tier": 4,
      "maxRank": 1,
      "effect": "بازتاب امضای ممنوع 4 واحد درصد بیشتر می‌شود.",
      "pointsRequired": 4,
      "prerequisite": "interest_bearing"
    },
    {
      "id": "early_termination",
      "name": "فسخ زودهنگام",
      "branchId": "contract_law",
      "branchName": "قانون قرارداد",
      "tier": 5,
      "maxRank": 1,
      "effect": "فسخ وصیت‌نامه، 1 اعتبار پیمان اضافه می‌دهد.",
      "pointsRequired": 5,
      "prerequisite": null
    },
    {
      "id": "shared_liability",
      "name": "مسئولیت مشترک",
      "branchId": "contract_law",
      "branchName": "قانون قرارداد",
      "tier": 6,
      "maxRank": 1,
      "effect": "در حضور قلب گروگان، 5٪ از آسیب منتقل‌شده به وارلاک بازتاب می‌یابد.",
      "pointsRequired": 6,
      "prerequisite": null
    },
    {
      "id": "sovereign_signature",
      "name": "امضای حاکم",
      "branchId": "contract_law",
      "branchName": "قانون قرارداد",
      "tier": 7,
      "maxRank": 1,
      "effect": "مهارت‌های قراردادمحور 6٪ قوی‌تر می‌شوند.",
      "pointsRequired": 7,
      "prerequisite": null
    },
    {
      "id": "living_contract",
      "name": "قرارداد زنده",
      "branchId": "contract_law",
      "branchName": "قانون قرارداد",
      "tier": 8,
      "maxRank": 1,
      "effect": "در آغاز نبرد 1 اعتبار پیمان؛ فقط یک بار در هر نبرد.",
      "pointsRequired": 8,
      "prerequisite": "sovereign_signature"
    },
    {
      "id": "thin_reality",
      "name": "واقعیت نازک",
      "branchId": "void_jurisprudence",
      "branchName": "فقه خلأ",
      "tier": 1,
      "maxRank": 1,
      "effect": "هزینه حذف از واقعیت 1٪ حداکثر مانای مؤثر کمتر.",
      "pointsRequired": 1,
      "prerequisite": null
    },
    {
      "id": "suspended_benefit",
      "name": "نعمت معلق",
      "branchId": "void_jurisprudence",
      "branchName": "فقه خلأ",
      "tier": 2,
      "maxRank": 1,
      "effect": "اثر مثبت تعلیق‌شده پس از بازگشت 10٪ ضعیف‌تر می‌شود.",
      "pointsRequired": 2,
      "prerequisite": null
    },
    {
      "id": "nameless_verdict",
      "name": "حکم بی‌نام",
      "branchId": "void_jurisprudence",
      "branchName": "فقه خلأ",
      "tier": 3,
      "maxRank": 1,
      "effect": "احکام دادگاه 8٪ قوی‌تر می‌شوند.",
      "pointsRequired": 3,
      "prerequisite": null
    },
    {
      "id": "null_signature",
      "name": "امضای صفر",
      "branchId": "void_jurisprudence",
      "branchName": "فقه خلأ",
      "tier": 4,
      "maxRank": 1,
      "effect": "شکستن نام حقیقی، دفاع جادویی هدف را 5٪ دیگر کاهش می‌دهد.",
      "pointsRequired": 4,
      "prerequisite": "nameless_verdict"
    },
    {
      "id": "void_residue",
      "name": "باقی‌مانده خلأ",
      "branchId": "void_jurisprudence",
      "branchName": "فقه خلأ",
      "tier": 5,
      "maxRank": 1,
      "effect": "پس از حذف هدف، وارلاک 3٪ حداکثر مانای مؤثر بازیابی می‌کند.",
      "pointsRequired": 5,
      "prerequisite": null
    },
    {
      "id": "broken_axiom",
      "name": "اصل شکسته",
      "branchId": "void_jurisprudence",
      "branchName": "فقه خلأ",
      "tier": 6,
      "maxRank": 1,
      "effect": "مدت تضعیف ناشی از نام‌شکنی 1 نوبت بیشتر؛ روی باس نیم نوبت/بدون افزایش.",
      "pointsRequired": 6,
      "prerequisite": null
    },
    {
      "id": "unwritten_law",
      "name": "قانون نانوشته",
      "branchId": "void_jurisprudence",
      "branchName": "فقه خلأ",
      "tier": 7,
      "maxRank": 1,
      "effect": "مهارت بعدی پس از سرقت لحظه 8٪ آسیب بیشتر دارد.",
      "pointsRequired": 7,
      "prerequisite": null
    },
    {
      "id": "absolute_absence",
      "name": "غیاب مطلق",
      "branchId": "void_jurisprudence",
      "branchName": "فقه خلأ",
      "tier": 8,
      "maxRank": 1,
      "effect": "یک بار در هر نبرد، اولین اثر مثبت غیرذاتی هدف با مهارت خلأ 1 نوبت زودتر فرو می‌ریزد.",
      "pointsRequired": 8,
      "prerequisite": "unwritten_law"
    },
    {
      "id": "measured_sacrifice",
      "name": "قربانی سنجیده",
      "branchId": "blood_economy",
      "branchName": "اقتصاد خون",
      "tier": 1,
      "maxRank": 1,
      "effect": "هزینه HP وارونگی قربانی 1٪ حداکثر HP کمتر.",
      "pointsRequired": 1,
      "prerequisite": null
    },
    {
      "id": "red_accounting",
      "name": "حسابداری سرخ",
      "branchId": "blood_economy",
      "branchName": "اقتصاد خون",
      "tier": 2,
      "maxRank": 1,
      "effect": "35٪ از HP قربانی‌شده در صورت اصابت مهارت بازمی‌گردد (به‌جای 35٪ پایه، مجموع 70٪).",
      "pointsRequired": 2,
      "prerequisite": null
    },
    {
      "id": "hostage_interest",
      "name": "بهره گروگان",
      "branchId": "blood_economy",
      "branchName": "اقتصاد خون",
      "tier": 3,
      "maxRank": 1,
      "effect": "بازیابی قلب گروگان 5 واحد درصد بیشتر.",
      "pointsRequired": 3,
      "prerequisite": null
    },
    {
      "id": "crimson_margin",
      "name": "حاشیه سرخ",
      "branchId": "blood_economy",
      "branchName": "اقتصاد خون",
      "tier": 4,
      "maxRank": 1,
      "effect": "وقتی HP زیر 40٪ است، آسیب جادویی 8٪ بیشتر.",
      "pointsRequired": 4,
      "prerequisite": "hostage_interest"
    },
    {
      "id": "last_drop",
      "name": "آخرین قطره",
      "branchId": "blood_economy",
      "branchName": "اقتصاد خون",
      "tier": 5,
      "maxRank": 1,
      "effect": "یک بار در هر نبرد، قربانی وارونگی نمی‌تواند HP را زیر 5٪ ببرد.",
      "pointsRequired": 5,
      "prerequisite": null
    },
    {
      "id": "blood_transfusion",
      "name": "انتقال خون",
      "branchId": "blood_economy",
      "branchName": "اقتصاد خون",
      "tier": 6,
      "maxRank": 1,
      "effect": "بازیابی HP از وارث گرسنگی 10٪ بیشتر.",
      "pointsRequired": 6,
      "prerequisite": null
    },
    {
      "id": "predatory_vitality",
      "name": "حیات شکارگر",
      "branchId": "blood_economy",
      "branchName": "اقتصاد خون",
      "tier": 7,
      "maxRank": 1,
      "effect": "آسیب به هدف دارای امضا، 3٪ به HP تبدیل می‌شود.",
      "pointsRequired": 7,
      "prerequisite": null
    },
    {
      "id": "red_covenant",
      "name": "پیمان سرخ",
      "branchId": "blood_economy",
      "branchName": "اقتصاد خون",
      "tier": 8,
      "maxRank": 1,
      "effect": "مهارت‌های مصرف‌کننده HP، 8٪ قوی‌تر می‌شوند.",
      "pointsRequired": 8,
      "prerequisite": "predatory_vitality"
    },
    {
      "id": "hunger_whisper",
      "name": "نجوای گرسنگی",
      "branchId": "ancient_entities",
      "branchName": "موجودات کهن",
      "tier": 1,
      "maxRank": 1,
      "effect": "مخزن وارث گرسنگی تا 15٪ افزایش می‌یابد.",
      "pointsRequired": 1,
      "prerequisite": null
    },
    {
      "id": "patient_devourer",
      "name": "بلعنده شکیبا",
      "branchId": "ancient_entities",
      "branchName": "موجودات کهن",
      "tier": 2,
      "maxRank": 1,
      "effect": "مدت احضار وارث گرسنگی 1 نوبت بیشتر.",
      "pointsRequired": 2,
      "prerequisite": null
    },
    {
      "id": "borrowed_instinct",
      "name": "غریزه عاریه‌ای",
      "branchId": "ancient_entities",
      "branchName": "موجودات کهن",
      "tier": 3,
      "maxRank": 1,
      "effect": "در نخستین نوبت احضار، وارلاک 5٪ دقت و 5٪ دفاع می‌گیرد.",
      "pointsRequired": 3,
      "prerequisite": null
    },
    {
      "id": "demonic_heritage",
      "name": "میراث اهریمن",
      "branchId": "ancient_entities",
      "branchName": "موجودات کهن",
      "tier": 4,
      "maxRank": 1,
      "effect": "آسیب تجلی نابودی 8٪ بیشتر.",
      "pointsRequired": 4,
      "prerequisite": "borrowed_instinct"
    },
    {
      "id": "throne_of_ashes",
      "name": "تختستر خاکستر",
      "branchId": "ancient_entities",
      "branchName": "موجودات کهن",
      "tier": 5,
      "maxRank": 1,
      "effect": "پس از آخرین قرارداد، فرسودگی 1 نوبت کوتاه‌تر؛ حداقل 1.",
      "pointsRequired": 5,
      "prerequisite": null
    },
    {
      "id": "ancient_tribute",
      "name": "خراج کهن",
      "branchId": "ancient_entities",
      "branchName": "موجودات کهن",
      "tier": 6,
      "maxRank": 1,
      "effect": "هر 3 اعتبار پیمان، 1٪ قدرت جادویی دائمی در همان نبرد؛ سقف 5٪.",
      "pointsRequired": 6,
      "prerequisite": null
    },
    {
      "id": "untrusted_alliance",
      "name": "اتحاد بی‌اعتماد",
      "branchId": "ancient_entities",
      "branchName": "موجودات کهن",
      "tier": 7,
      "maxRank": 1,
      "effect": "مهارت‌های احضار/موجودات 10٪ قوی‌تر، اما هزینه مانای آن‌ها 2٪ بیشتر.",
      "pointsRequired": 7,
      "prerequisite": null
    },
    {
      "id": "heir_apotheosis",
      "name": "تعالی وارث",
      "branchId": "ancient_entities",
      "branchName": "موجودات کهن",
      "tier": 8,
      "maxRank": 1,
      "effect": "وقتی مخزن گرسنگی پر شود، مهارت بعدی 12٪ قوی‌تر می‌شود؛ یک بار در هر احضار.",
      "pointsRequired": 8,
      "prerequisite": "untrusted_alliance"
    }
  ],
  "domain": {
    "name": "محکمه آن‌سوی آفرینش",
    "en": "Court Beyond Creation",
    "unlockLevel": 25,
    "activationLimitPerBattle": 1,
    "stages": [
      {
        "stage": 1,
        "name": "گشایش دفتر بی‌نام",
        "unlockLevel": 25,
        "durationTurns": 4,
        "effect": "اعتبار پیمان آغازین 2؛ تمام مهارت‌ها 10٪ قوی‌تر؛ هر 10 مهارت تعالی‌یافته در دسترس می‌شوند."
      },
      {
        "stage": 2,
        "name": "تخت هفت مُهر",
        "unlockLevel": 40,
        "durationTurns": 5,
        "effect": "هر بار دشمن مهارت اجرا کند، یک مُهر تا سقف 5 ایجاد می‌شود؛ هر مُهر 3٪ آسیب وارلاک را افزایش می‌دهد. حکم دادگاه 10٪ قوی‌تر می‌شود."
      },
      {
        "stage": 3,
        "name": "قلب قرارداد نخستین",
        "unlockLevel": 50,
        "durationTurns": 6,
        "effect": "هر 2 بدهی ایجادشده یک اعتبار پیمان می‌سازد؛ هزینه HP مهارت‌های قربانی 15٪ کمتر و سقف اعتبار 10 می‌شود."
      },
      {
        "stage": 4,
        "name": "محکمه پایان نام‌ها",
        "unlockLevel": 50,
        "requiresTrial": true,
        "durationTurns": 7,
        "effect": "تمام بدهی‌ها و اعتبارهای ذخیره‌شده به نیروی داوری تبدیل می‌شوند؛ تمام مهارت‌های تعالی‌یافته در دسترس‌اند؛ پس از انتخاب یکی، فقط همان یک بار قابل اجراست."
      }
    ],
    "trial": {
      "name": "محاکمه چهار پیمان",
      "unlockLevel": 50,
      "requirements": [
        "تکمیل سه مرحله پیشین قلمرو",
        "شکست چهار فرستاده پیمان در چهار نبرد متوالی",
        "شکست داور بی‌نام در نبرد پایانی"
      ],
      "rewards": [
        "بازشدن مرحله چهارم قلمرو",
        "عنوان وارث پیمان‌های نخستین",
        "افزایش سقف اعتبار پیمان به 10 در قلمرو"
      ],
      "failure": "شکست آزمون پیشرفت سه مرحله قبلی را حذف نمی‌کند؛ آزمون قابل تکرار است."
    }
  },
  "ascendedSkills": [
    {
      "id": "edict_of_the_true_name",
      "baseSkillId": "forbidden_signature",
      "name": "فرمان نام نخستین",
      "baseSkillName": "امضای ممنوع تعالی‌یافته",
      "description": "هدف برای 3 نوبت در دفتر نخستین ثبت می‌شود؛ هر آسیب دریافتی‌اش 28٪ بازتاب دارد و هر مهارت ویژه‌اش 6٪ حداکثر مانا به وارلاک می‌دهد.",
      "manaCostPercent": 0,
      "cooldownTurns": 0,
      "useLimitPerDomain": 1,
      "target": "مطابق مهارت پایه"
    },
    {
      "id": "theft_of_tomorrow",
      "baseSkillId": "stolen_moment",
      "name": "ربایش فردا",
      "baseSkillName": "سرقت لحظه تعالی‌یافته",
      "description": "مهارت ویژه هدف برای یک نوبت مهروموم می‌شود؛ وارلاک دو لحظه ذخیره می‌کند و مهارت بعدی‌اش 35٪ قوی‌تر و 25٪ ارزان‌تر است.",
      "manaCostPercent": 0,
      "cooldownTurns": 0,
      "useLimitPerDomain": 1,
      "target": "مطابق مهارت پایه"
    },
    {
      "id": "testament_of_the_eightfold",
      "baseSkillId": "demons_testament",
      "name": "وصیت‌نامه هشت مُهر",
      "baseSkillName": "وصیت‌نامه اهریمن تعالی‌یافته",
      "description": "تا پایان قلمرو هر مهارت 2 بدهی می‌سازد؛ هر بدهی 5٪ آسیب می‌دهد، اما آستانه‌های هزینه فقط یک بار و با سقف 8 بدهی اعمال می‌شوند.",
      "manaCostPercent": 0,
      "cooldownTurns": 0,
      "useLimitPerDomain": 1,
      "target": "مطابق مهارت پایه"
    },
    {
      "id": "altar_of_the_unpayable",
      "baseSkillId": "reversal_of_sacrifice",
      "name": "مذبح بهای ناپرداختنی",
      "baseSkillName": "وارونگی قربانی تعالی‌یافته",
      "description": "12٪ حداکثر HP را (بدون کشتن) قربانی می‌کند؛ مهارت بعدی 100٪ قوی‌تر است و 60٪ قربانی در صورت اصابت بازمی‌گردد.",
      "manaCostPercent": 0,
      "cooldownTurns": 0,
      "useLimitPerDomain": 1,
      "target": "مطابق مهارت پایه"
    },
    {
      "id": "court_of_final_verdicts",
      "baseSkillId": "court_of_nameless",
      "name": "محکمه احکام واپسین",
      "baseSkillName": "دادگاه بی‌نامان تعالی‌یافته",
      "description": "هر سه حکم هم‌زمان برای 3 نوبت اجرا می‌شوند؛ شدت علیه باس 60٪ است.",
      "manaCostPercent": 0,
      "cooldownTurns": 0,
      "useLimitPerDomain": 1,
      "target": "مطابق مهارت پایه"
    },
    {
      "id": "heart_of_the_bound_king",
      "baseSkillId": "hostage_heart",
      "name": "قلب شاه دربند",
      "baseSkillName": "قلب گروگان تعالی‌یافته",
      "description": "پیوند 3 نوبت برقرار می‌شود؛ 35٪ آسیب وارلاک منتقل و 25٪ آسیب او بازیابی می‌شود؛ شکستن پیوند ضربه‌ای برابر 120٪ آسیب منتقل‌شده می‌زند.",
      "manaCostPercent": 0,
      "cooldownTurns": 0,
      "useLimitPerDomain": 1,
      "target": "مطابق مهارت پایه"
    },
    {
      "id": "unmaking_of_the_named",
      "baseSkillId": "erasure_from_reality",
      "name": "نیستی نام‌داران",
      "baseSkillName": "حذف از واقعیت تعالی‌یافته",
      "description": "یک دشمن عادی یک نوبت از نبرد حذف و یک اثر مثبتش نابود می‌شود؛ باس یک اثر مثبت را از دست می‌دهد و مهارت بعدی‌اش 40٪ ضعیف می‌شود.",
      "manaCostPercent": 0,
      "cooldownTurns": 0,
      "useLimitPerDomain": 1,
      "target": "مطابق مهارت پایه"
    },
    {
      "id": "the_hunger_beyond_gods",
      "baseSkillId": "heir_of_hunger",
      "name": "گرسنگی آن‌سوی خدایان",
      "baseSkillName": "وارث گرسنگی تعالی‌یافته",
      "description": "موجود 4 نوبت می‌ماند؛ تا 18٪ مانای دشمنان را ذخیره می‌کند و وارلاک می‌تواند هر نوبت آن را میان HP، MP و ضربه نهایی تقسیم کند.",
      "manaCostPercent": 0,
      "cooldownTurns": 0,
      "useLimitPerDomain": 1,
      "target": "مطابق مهارت پایه"
    },
    {
      "id": "shattering_of_first_speech",
      "baseSkillId": "true_name_shatter",
      "name": "شکستن گفتار نخستین",
      "baseSkillName": "شکستن نام حقیقی تعالی‌یافته",
      "description": "دو بند از چهار بند روی هدف انتخاب می‌شود و 3 نوبت می‌ماند؛ شدت علیه باس 65٪ است.",
      "manaCostPercent": 0,
      "cooldownTurns": 0,
      "useLimitPerDomain": 1,
      "target": "مطابق مهارت پایه"
    },
    {
      "id": "covenant_at_worlds_end",
      "baseSkillId": "final_covenant",
      "name": "پیمان پایان جهان",
      "baseSkillName": "آخرین قرارداد تعالی‌یافته",
      "description": "سه تجلی با هم ترکیب می‌شوند: 420٪ قدرت جادویی به همه دشمنان، حذف یک اثر مثبت غیرذاتی، و بازیابی 15٪ HP ازدست‌رفته؛ هر 2 بدهی +10٪ آسیب تا سقف +50٪.",
      "manaCostPercent": 0,
      "cooldownTurns": 0,
      "useLimitPerDomain": 1,
      "target": "مطابق مهارت پایه"
    }
  ],
  "ascendedSkillRule": {
    "availableFromLevel": 25,
    "allTenAvailableOnActivation": true,
    "selectionTiming": "پس از فعال‌سازی قلمرو",
    "selectionLimitPerDomain": 1,
    "usesPerDomain": 1,
    "otherNineDisabledAfterUse": true,
    "namesReplaceBaseNamesOnlyDuringDomain": true,
    "restoreBaseNamesWhenDomainEnds": true
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
    "attributePointsPerLevel": 5,
    "skillPointsPerLevel": 2,
    "levelCap": 100,
    "ascendedSkillChoiceCount": 1,
    "ascendedSkillAvailableOnlyInDomain": true,
    "ascendedSkillAvailability": "all_10_during_domain",
    "ascendedSkillSelectionTiming": "after_domain_activation",
    "ascendedSkillSelectionLimitPerDomain": 1,
    "ascendedSkillUsesPerDomain": 1
  }
};

export function createWarlockProgress(){return {pactDebt:0,pactCredit:0,skillRanks:{},unlockedTalents:[],domainStage:'locked',domainQuest:{started:false,envoysDefeated:[],judgeDefeated:false,complete:false},domainActive:false,domainUsesThisBattle:0,ascendedSkillId:null,ascendedSkillUsedThisDomain:false,skillCooldowns:{},buffs:{},statuses:{},hungerReservoir:0};}
export function normalizeWarlockProgress(progress){const p={...createWarlockProgress(),...(progress||{})};p.pactDebt=Math.max(0,Math.min(WARLOCK.pactSystem.maxDebt,Number(p.pactDebt)||0));p.pactCredit=Math.max(0,Math.min(WARLOCK.pactSystem.maxCredit,Number(p.pactCredit)||0));p.hungerReservoir=Math.max(0,Number(p.hungerReservoir)||0);p.skillRanks={...(p.skillRanks||{})};for(const s of WARLOCK.skills)p.skillRanks[s.id]=Math.max(0,Math.min(7,Number(p.skillRanks[s.id])||0));p.unlockedTalents=[...new Set(Array.isArray(p.unlockedTalents)?p.unlockedTalents:[])];p.skillCooldowns={...(p.skillCooldowns||{})};p.buffs={...(p.buffs||{})};p.statuses={...(p.statuses||{})};p.domainQuest={...createWarlockProgress().domainQuest,...(p.domainQuest||{})};return p;}
export function activateWarlockDomain(progress,playerLevel){const p=normalizeWarlockProgress(progress);if(Number(playerLevel)<WARLOCK.domain.unlockLevel)return {ok:false,reason:'level_locked',progress:p};if(p.domainUsesThisBattle>=1)return {ok:false,reason:'already_used_this_battle',progress:p};p.domainActive=true;p.domainUsesThisBattle++;p.ascendedSkillId=null;p.ascendedSkillUsedThisDomain=false;return {ok:true,progress:p,availableSkills:WARLOCK.ascendedSkills};}
export function getAvailableWarlockAscendedSkills(progress){const p=normalizeWarlockProgress(progress);return p.domainActive&&!p.ascendedSkillUsedThisDomain?WARLOCK.ascendedSkills:[];}
export function consumeWarlockAscendedSkill(progress,skillId){const p=normalizeWarlockProgress(progress);if(!p.domainActive)return {ok:false,reason:'domain_not_active',progress:p};if(p.ascendedSkillUsedThisDomain)return {ok:false,reason:'ascended_skill_already_used',progress:p};const skill=WARLOCK.ascendedSkills.find(s=>s.id===skillId);if(!skill)return {ok:false,reason:'invalid_ascended_skill',progress:p};p.ascendedSkillId=skill.id;p.ascendedSkillUsedThisDomain=true;return {ok:true,progress:p,skill};}
export function endWarlockDomain(progress){const p=normalizeWarlockProgress(progress);p.domainActive=false;p.ascendedSkillId=null;p.ascendedSkillUsedThisDomain=false;return p;}
export function addWarlockPactDebt(progress,amount=1){const p=normalizeWarlockProgress(progress);p.pactDebt=Math.min(WARLOCK.pactSystem.maxDebt,p.pactDebt+Math.max(0,Number(amount)||0));return p;}
export function spendWarlockPactCredit(progress,amount=1){const p=normalizeWarlockProgress(progress);const n=Math.max(0,Number(amount)||0);if(p.pactCredit<n)return {ok:false,progress:p};p.pactCredit-=n;return {ok:true,progress:p};}
