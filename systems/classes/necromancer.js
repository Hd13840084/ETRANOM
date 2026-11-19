/* ETRANOM Necromancer specialization data. Turn-based; no spatial mechanics. */
export const NECROMANCER = {
  "id": "wizard_necromancer",
  "classId": "wizard",
  "className": "جادوگر",
  "specialization": "نکرومنسر",
  "specializationEn": "Necromancer",
  "version": 1,
  "identity": {
    "role": "فرمانروای مرگ، ارواح و لژیون ده‌عضوی با سه نیروی فعال",
    "theme": "دارک فانتزی",
    "resource": "مانا",
    "secondaryResource": "ارواح ذخیره‌شده",
    "strengths": [
      "لژیون دائمی با اعضای منحصربه‌فرد",
      "کنترل و تضعیف دشمن",
      "بازیابی و بقا",
      "تحول فرم مرگ در قلمرو"
    ],
    "weaknesses": [
      "نیازمند مدیریت ارواح",
      "تصاحب جسد وابسته به شانس",
      "ظرفیت ذخیره ده عضو؛ فقط سه عضو هم‌زمان فعال‌اند",
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
    "legionCapacity": 10,
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
    "maxMembers": 10,
    "activeMembers": 3,
    "capacityCanIncrease": false,
    "baseRecruitChancePercent": 35,
    "permanentRecruitment": true,
    "failedRecruitmentConsumesCorpse": true,
    "membersKeepSpeciesIdentity": true,
    "deathFormOnlyInDomain": true,
    "rules": [
      "هر عضو، گونه، آمار، توانایی ویژه و فرم مرگ اختصاصی خود را دارد.",
      "تصاحب موفق، عضو را به‌صورت دائمی در یکی از ده جایگاه ذخیره ثبت می‌کند.",
      "از ده عضو ذخیره، حداکثر سه عضو را می‌توان هم‌زمان فعال کرد؛ هفت عضو دیگر در ذخیره غیرفعال می‌مانند.",
      "فعال‌سازی و غیرفعال‌سازی اعضا از منوی مدیریت لژیون انجام می‌شود.",
      "ظرفیت ذخیره ده عضو و ظرفیت فعال سه عضو ثابت است و استعدادها آن را افزایش نمی‌دهند.",
      "قانون حذف دائمی عضو در صورت شکست نبرد در این ماژول تعیین نشده و باید از قانون اصلی سامانه لژیون پیروی کند."
    ]
  },
  "skills": [
    {
      "id": "death_claw",
      "name": "چنگال مرگ",
      "en": "Death Claw",
      "unlockLevel": 1,
      "type": "damage",
      "target": "یک دشمن",
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
      "id": "legion",
      "name": "لژیون",
      "en": "Legion",
      "unlockLevel": 2,
      "type": "permanent_recruit",
      "target": "جسد یک دشمن کشته‌شده",
      "manaCostPercent": 10,
      "cooldownTurns": 0,
      "durationTurns": 0,
      "description": "روی جسد دشمن کشته‌شده اجرا می‌شود؛ شانس پایه تصاحب ۳۵٪ است. موفقیت، هیولا را دائماً به یکی از حداکثر ۱۰ جایگاه ذخیره لژیون اضافه می‌کند؛ فقط سه عضو را می‌توان هم‌زمان فعال کرد. شکست، جسد را برای همیشه از تلاش مجدد خارج می‌کند. اگر هر ده جایگاه ذخیره پر باشد قابل اجرا نیست.",
      "bossRules": "باس و برخی موجودات ویژه قابل تصاحب نیستند؛ رتبه مهارت شانس تصاحب را بالا می‌برد اما ظرفیت هرگز بیشتر از ۳ نمی‌شود.",
      "upgradeRanks": 6,
      "upgrades": [
        {
          "rank": 2,
          "pointsRequired": 1,
          "effect": "رتبه ۲: شدت اثر اصلی 108٪ مقدار پایه؛ روی جسد دشمن کشته‌شده اجرا می‌شود؛ شانس پایه تصاحب ۳۵٪ است. موفقیت، هیولا را دائماً به یکی از حداکثر ۱۰ جایگاه ذخیره لژیون اضافه می‌کند؛ فقط سه عضو را می‌توان هم‌زمان فعال کرد. شکست، جسد را برای همیشه از تلاش مجدد خارج می‌کند. اگر هر ده جایگاه ذخیره پر باشد قابل اجرا نیست.",
          "bonus": "ارتقای اختصاصی لژیون: افزایش کنترل‌شده اثر اصلی."
        },
        {
          "rank": 3,
          "pointsRequired": 2,
          "effect": "رتبه ۳: شدت اثر اصلی ۱۱۶٪ مقدار پایه؛ هزینه مانا بدون تغییر.",
          "bonus": "ارتقای اختصاصی لژیون: افزایش کنترل‌شده اثر پایدار."
        },
        {
          "rank": 4,
          "pointsRequired": 3,
          "effect": "رتبه ۴: شدت اثر اصلی ۱۲۴٪ مقدار پایه؛ یک بهبود اختصاصی در تعامل مهارت.",
          "bonus": "ارتقای اختصاصی لژیون: افزایش کنترل‌شده اثر ثانویه."
        },
        {
          "rank": 5,
          "pointsRequired": 4,
          "effect": "رتبه ۵: شدت اثر اصلی ۱۳۲٪ مقدار پایه؛ هزینه مانا ۱ واحد درصد کمتر.",
          "bonus": "ارتقای اختصاصی لژیون: افزایش کنترل‌شده اثر تخصصی."
        },
        {
          "rank": 6,
          "pointsRequired": 5,
          "effect": "رتبه ۶: شدت اثر اصلی ۱۴۰٪ مقدار پایه؛ مدت اثر +۱ نوبت، اگر مهارت مدت‌دار باشد.",
          "bonus": "ارتقای اختصاصی لژیون: افزایش کنترل‌شده اثر پیشرفته."
        },
        {
          "rank": 7,
          "pointsRequired": 6,
          "effect": "رتبه ۷: شدت اثر اصلی ۱۵۰٪ مقدار پایه؛ بازده ثانویه مهارت +۱۵٪. محدودیت‌های هدف و ظرفیت همچنان پابرجاست.",
          "bonus": "ارتقای اختصاصی لژیون: افزایش کنترل‌شده اثر نهایی."
        }
      ]
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
      "target": "تمام اعضای زنده لژیون",
      "manaCostPercent": 9,
      "cooldownTurns": 4,
      "durationTurns": 3,
      "description": "استخوان نفرین‌شده در ساختار اعضای لژیون می‌روید؛ دفاع و مقاومتشان افزایش می‌یابد و حملاتشان احتمال ایجاد زخم استخوانی دارد. زخم استخوانی آسیب فیزیکی کم در ۲ نوبت وارد می‌کند.",
      "bossRules": "فقط اعضای لژیون زنده را تقویت می‌کند.",
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
      "target": "خود، لژیون یا تمام دشمنان؛ بسته به فرمان",
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
      "target": "یک دشمن",
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
      "target": "تمام اعضای زنده لژیون",
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
      "talentIds": [
        "death_sovereignty_01",
        "death_sovereignty_02",
        "death_sovereignty_03",
        "death_sovereignty_04",
        "death_sovereignty_05",
        "death_sovereignty_06",
        "death_sovereignty_07",
        "death_sovereignty_08"
      ]
    },
    {
      "id": "undead_legion",
      "name": "ارتش مردگان",
      "talentIds": [
        "undead_legion_01",
        "undead_legion_02",
        "undead_legion_03",
        "undead_legion_04",
        "undead_legion_05",
        "undead_legion_06",
        "undead_legion_07",
        "undead_legion_08"
      ]
    },
    {
      "id": "spirit_magic",
      "name": "جادوی ارواح",
      "talentIds": [
        "spirit_magic_01",
        "spirit_magic_02",
        "spirit_magic_03",
        "spirit_magic_04",
        "spirit_magic_05",
        "spirit_magic_06",
        "spirit_magic_07",
        "spirit_magic_08"
      ]
    },
    {
      "id": "reign_resurrection",
      "name": "سلطنت و رستاخیز",
      "talentIds": [
        "reign_resurrection_01",
        "reign_resurrection_02",
        "reign_resurrection_03",
        "reign_resurrection_04",
        "reign_resurrection_05",
        "reign_resurrection_06",
        "reign_resurrection_07",
        "reign_resurrection_08"
      ]
    }
  ],
  "talents": [
    {
      "id": "death_sovereignty_01",
      "name": "چنگال ویرانگر",
      "branchId": "death_sovereignty",
      "maxRank": 5,
      "description": "افزایش ۴٪ آسیب چنگال مرگ در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "death_sovereignty_02",
      "name": "زخم ابدی",
      "branchId": "death_sovereignty",
      "maxRank": 5,
      "description": "افزایش ۵٪ آسیب زخم مرگ در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "death_sovereignty_03",
      "name": "نشان فنا",
      "branchId": "death_sovereignty",
      "maxRank": 5,
      "description": "افزایش ۳٪ آسیب به دشمنان نشان‌دار در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "death_sovereignty_04",
      "name": "نیروی تاریکی",
      "branchId": "death_sovereignty",
      "maxRank": 5,
      "description": "افزایش ۲٪ قدرت مهارت‌های تاریک در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "death_sovereignty_05",
      "name": "شکار روح",
      "branchId": "death_sovereignty",
      "maxRank": 5,
      "description": "افزایش ۵٪ احتمال تولید روح از کشتن هدف زخمی، در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "death_sovereignty_06",
      "name": "نفرین عمیق",
      "branchId": "death_sovereignty",
      "maxRank": 5,
      "description": "افزایش ۱٪ شدت تضعیف‌های نکرومنسر در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "death_sovereignty_07",
      "name": "قلب مردگان",
      "branchId": "death_sovereignty",
      "maxRank": 5,
      "description": "افزایش ۲٪ مقاومت تاریک نکرومنسر در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "death_sovereignty_08",
      "name": "تجلی مرگ",
      "branchId": "death_sovereignty",
      "maxRank": 5,
      "description": "افزایش ۲٪ شدت فرمانروای ابدی در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "undead_legion_01",
      "name": "تصاحب ماهرانه",
      "branchId": "undead_legion",
      "maxRank": 5,
      "description": "افزایش ۲٪ شانس تصاحب پایه در هر رتبه؛ سقف شانس ۶०٪.",
      "effectPerRank": true,
      "exclusiveRules": [
        "ظرفیت لژیون هرگز از ۳ بیشتر نمی‌شود."
      ]
    },
    {
      "id": "undead_legion_02",
      "name": "استخوان‌های مستحکم",
      "branchId": "undead_legion",
      "maxRank": 5,
      "description": "افزایش ۳٪ دفاع لژیون در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "undead_legion_03",
      "name": "گوشت مرده",
      "branchId": "undead_legion",
      "maxRank": 5,
      "description": "افزایش ۳٪ حداکثر سلامتی لژیون در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "undead_legion_04",
      "name": "قدرت برخاسته",
      "branchId": "undead_legion",
      "maxRank": 5,
      "description": "افزایش ۳٪ حمله لژیون در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "undead_legion_05",
      "name": "غریزه شکار",
      "branchId": "undead_legion",
      "maxRank": 5,
      "description": "افزایش ۱٪ احتمال ضربه بحرانی لژیون در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "undead_legion_06",
      "name": "جوهر مردگان",
      "branchId": "undead_legion",
      "maxRank": 5,
      "description": "افزایش ۳٪ توانایی اختصاصی اعضای لژیون در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "undead_legion_07",
      "name": "پیوند فرمانده",
      "branchId": "undead_legion",
      "maxRank": 5,
      "description": "افزایش ۳٪ مقاومت لژیون در برابر کنترل در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "undead_legion_08",
      "name": "ارتش جاودان",
      "branchId": "undead_legion",
      "maxRank": 5,
      "description": "بازیابی پس از نبرد اعضای لژیون ۳٪ مؤثرتر می‌شود؛ مرگ دائمی/بازیابی نهایی تابع قانون سامانه لژیون است.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "spirit_magic_01",
      "name": "مخزن ارواح",
      "branchId": "spirit_magic",
      "maxRank": 5,
      "description": "افزایش ظرفیت ذخیره ارواح +۱ در رتبه‌های ۳ و ۵.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "spirit_magic_02",
      "name": "تغذیه روحی",
      "branchId": "spirit_magic",
      "maxRank": 5,
      "description": "افزایش ۴٪ بازیابی فرمان تغذیه در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "spirit_magic_03",
      "name": "مکنده حیات",
      "branchId": "spirit_magic",
      "maxRank": 5,
      "description": "افزایش ۲٪ درصد سرقت حیات در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "spirit_magic_04",
      "name": "انتقال انرژی",
      "branchId": "spirit_magic",
      "maxRank": 5,
      "description": "افزایش ۳٪ سهم انتقال انرژی به لژیون در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "spirit_magic_05",
      "name": "خاطرات نفرین‌شده",
      "branchId": "spirit_magic",
      "maxRank": 5,
      "description": "افزایش ۳٪ شدت خاطره مرگ در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "spirit_magic_06",
      "name": "زنجیر ابدی",
      "branchId": "spirit_magic",
      "maxRank": 5,
      "description": "افزایش ۳٪ شدت زنجیر ارواح در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "spirit_magic_07",
      "name": "اراده شکسته",
      "branchId": "spirit_magic",
      "maxRank": 5,
      "description": "افزایش ۲٪ شانس پایه تسخیر اراده در هر رتبه؛ فقط دشمن معمولی.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "spirit_magic_08",
      "name": "سکوت مردگان",
      "branchId": "spirit_magic",
      "maxRank": 5,
      "description": "افزایش ۱٪ شدت خاموشی روح در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "reign_resurrection_01",
      "name": "بازگشت قدرتمند",
      "branchId": "reign_resurrection",
      "maxRank": 5,
      "description": "افزایش ۳٪ سلامتی احیا در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "reign_resurrection_02",
      "name": "قربانی وفادار",
      "branchId": "reign_resurrection",
      "maxRank": 5,
      "description": "کاهش هزینه احیا به میزان ۰٫۲ روح در هر رتبه؛ هزینه نهایی رو به بالا گرد می‌شود.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "reign_resurrection_03",
      "name": "شکوفایی استخوانی",
      "branchId": "reign_resurrection",
      "maxRank": 5,
      "description": "افزایش ۳٪ دفاع ناشی از شکوفایی استخوان در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "reign_resurrection_04",
      "name": "فرمان جنگ",
      "branchId": "reign_resurrection",
      "maxRank": 5,
      "description": "افزایش ۳٪ حمله ناشی از پادشاهی استخوان‌ها در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "reign_resurrection_05",
      "name": "مجلس بزرگ",
      "branchId": "reign_resurrection",
      "maxRank": 5,
      "description": "افزایش ۳٪ اثر فرمان‌های مجلس ارواح در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "reign_resurrection_06",
      "name": "تاج مردگان",
      "branchId": "reign_resurrection",
      "maxRank": 5,
      "description": "افزایش ۱ نوبت مدت فرمانروای ابدی فقط در رتبه ۵.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "reign_resurrection_07",
      "name": "اقتدار سلطنتی",
      "branchId": "reign_resurrection",
      "maxRank": 5,
      "description": "افزایش ۳٪ تقویت توانایی ویژه لژیون در حالت سلطنتی در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    },
    {
      "id": "reign_resurrection_08",
      "name": "آخرین فرمان",
      "branchId": "reign_resurrection",
      "maxRank": 5,
      "description": "افزایش ۳٪ قدرت پایان فرمانروای ابدی در هر رتبه.",
      "effectPerRank": true,
      "exclusiveRules": []
    }
  ],
  "domain": {
    "id": "resurrection_of_the_dead",
    "name": "قلمرو رستاخیز مردگان",
    "unlockLevel": 25,
    "oncePerBattle": true,
    "oneAscendedSkillPerActivation": true,
    "allTenAscendedSkillsAvailable": true,
    "stages": [
      {
        "stage": 1,
        "name": "دروازه مردگان",
        "unlockLevel": 25,
        "effects": [
          "فعال‌شدن قلمرو و دسترسی به هر ۱۰ مهارت تعالی‌یافته",
          "آزادسازی فرم مرگ پایه اعضای لژیون احضارشده"
        ]
      },
      {
        "stage": 2,
        "name": "تخت پادشاهی",
        "unlockLevel": 40,
        "effects": [
          "تکامل جلوه فرم مرگ",
          "افزایش کنترل نکرومنسر بر توانایی‌های فرم مرگ"
        ]
      },
      {
        "stage": 3,
        "name": "پادشاهی ابدی",
        "unlockLevel": 50,
        "effects": [
          "تکامل کامل مرحله سوم فرم مرگ",
          "افزایش شدت جلوه‌ها و آثار قلمرو"
        ]
      },
      {
        "stage": 4,
        "name": "تاج رستاخیز",
        "unlock": "پس از آزمون اختصاصی",
        "effects": [
          "تکامل نهایی فرم مرگ اعضا",
          "بازشدن آخرین ارتقای قلمرو"
        ]
      }
    ],
    "legionDeathForm": {
      "trigger": "هنگام احضار اعضای دائمی لژیون در قلمرو فعال",
      "name": "فرم مرگ",
      "revertsWhenDomainEnds": true,
      "preservesSpeciesIdentity": true,
      "rules": [
        "هر عضو فرم مرگ منحصربه‌فرد متناسب با گونه و توانایی اصلی خود می‌گیرد.",
        "فرم مرگ یک توانایی ویژه اختصاصی به عضو می‌دهد.",
        "فرم مرگ فقط در قلمرو رستاخیز مردگان فعال است.",
        "پایان قلمرو، ظاهر و آمار موقت را به فرم اصلی بازمی‌گرداند.",
        "قلمرو عضو جدیدی ایجاد نمی‌کند و ظرفیت لژیون را تغییر نمی‌دهد."
      ]
    }
  },
  "ascendedSkills": [
    {
      "id": "death_claw_ascended",
      "baseSkillId": "death_claw",
      "name": "چنگال داوری ابدی",
      "en": "Claw of Eternal Judgment",
      "description": "چنگال مرگ با آسیب و زخم تقویت‌شده؛ کشتن هدف زخمی روح بیشتری می‌دهد.",
      "target": "یک دشمن"
    },
    {
      "id": "legion_ascended",
      "baseSkillId": "legion",
      "name": "ارتش برخاسته",
      "en": "Army of the Risen",
      "description": "تمام اعضای لژیون احضار می‌شوند و هرکدام فرم مرگ و توانایی اختصاصی خود را آزاد می‌کنند.",
      "target": "تمام اعضای لژیون"
    },
    {
      "id": "death_memory_ascended",
      "baseSkillId": "death_memory",
      "name": "کتاب آخرین خاطرات",
      "en": "Tome of Final Memories",
      "description": "هر سه خاطره جنگ، بقا و جادو هم‌زمان بر هدف اعمال می‌شوند؛ باس‌ها شدت کمتر می‌گیرند.",
      "target": "یک دشمن"
    },
    {
      "id": "bone_blossom_ascended",
      "baseSkillId": "bone_blossom",
      "name": "رستاخیز استخوان‌های سیاه",
      "en": "Black Bone Rebirth",
      "description": "تقویت دفاعی و زخم استخوانی اعضای لژیون با شدت بیشتر.",
      "target": "تمام اعضای لژیون"
    },
    {
      "id": "assembly_of_souls_ascended",
      "baseSkillId": "assembly_of_souls",
      "name": "ضیافت هزار روح",
      "en": "Feast of a Thousand Souls",
      "description": "یکی از سه فرمان شکار، محافظت یا تغذیه با قدرت بسیار بیشتر اجرا می‌شود.",
      "target": "وابسته به فرمان"
    },
    {
      "id": "life_siphon_ascended",
      "baseSkillId": "life_siphon",
      "name": "بلعنده جوهر زندگی",
      "en": "Devourer of Life Essence",
      "description": "سرقت حیات و انتقال انرژی به لژیون با ضریب بیشتر و سرقت محدود مانا.",
      "target": "یک دشمن"
    },
    {
      "id": "kingdom_of_bones_ascended",
      "baseSkillId": "kingdom_of_bones",
      "name": "فرمان امپراتور مردگان",
      "en": "Edict of the Dead Emperor",
      "description": "تمام اعضای لژیون وارد فرمان جنگ ارتقایافته می‌شوند و حملاتشان دفاع را می‌شکند.",
      "target": "تمام اعضای لژیون"
    },
    {
      "id": "return_threshold_ascended",
      "baseSkillId": "return_threshold",
      "name": "انکار مرگ",
      "en": "Denial of Death",
      "description": "نکرومنسر پس از ضربه مرگبار با سلامتی بیشتر بازمی‌گردد؛ همچنان یک بار در نبرد.",
      "target": "خود"
    },
    {
      "id": "soul_domination_ascended",
      "baseSkillId": "soul_domination",
      "name": "سلطه مطلق بر اراده",
      "en": "Absolute Will Dominion",
      "description": "یک فرمان کنترل با شدت بالا؛ زنجیر می‌تواند چند دشمن را هدف بگیرد، باس فقط تضعیف می‌شود.",
      "target": "یک یا چند دشمن"
    },
    {
      "id": "eternal_sovereign_ascended",
      "baseSkillId": "eternal_sovereign",
      "name": "تجسد خدای مرگ",
      "en": "Avatar of the Death God",
      "description": "فرم نهایی نکرومنسر و لژیون با تقویت جادوی تاریک، توانایی ویژه لژیون و بازیابی از آسیب آن‌ها.",
      "target": "خود و لژیون"
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
    "talentCount": 32,
    "talentBranches": 4,
    "talentsPerBranch": 8,
    "talentMaxRank": 5,
    "attributePointsPerLevel": 5,
    "skillPointsPerLevel": 2,
    "levelCap": 50,
    "domainLevels": [
      25,
      40,
      50,
      "trial"
    ]
  },
  "integrationStatus": "data_module_created_runtime_integration_pending"
};

export function createNecromancerProgress(){return {storedSouls:0,skillRanks:{},unlockedTalents:[],domainStage:0,domainQuest:{started:false,completedStages:[],complete:false},domainActive:false,domainUsesThisBattle:0,ascendedSkillId:null,ascendedSkillUsedThisDomain:false,legion:[],skillCooldowns:{},buffs:{},statuses:{},reviveUsedThisBattle:false};}
export function normalizeNecromancerProgress(progress){const p={...createNecromancerProgress(),...(progress||{})};p.storedSouls=Math.max(0,Math.min(NECROMANCER.soulSystem.baseCapacity+2,Number(p.storedSouls)||0));p.legion=Array.isArray(p.legion)?p.legion.slice(0,10):[];p.activeLegionIds=Array.isArray(p.activeLegionIds)?p.activeLegionIds.map(String):p.legion.slice(0,3).map(m=>String(m.id||m.speciesId||m.name));p.activeLegionIds=[...new Set(p.activeLegionIds)].filter(id=>p.legion.some(m=>String(m.id||m.speciesId||m.name)===id&&Number(m.hp)>0)).slice(0,3);p.skillRanks={...(p.skillRanks||{})};for(const s of NECROMANCER.skills)p.skillRanks[s.id]=Math.max(0,Math.min(7,Number(p.skillRanks[s.id])||0));p.unlockedTalents=[...new Set(Array.isArray(p.unlockedTalents)?p.unlockedTalents:[])];p.skillCooldowns={...(p.skillCooldowns||{})};p.buffs={...(p.buffs||{})};p.statuses={...(p.statuses||{})};p.domainQuest={...createNecromancerProgress().domainQuest,...(p.domainQuest||{})};return p;}
export function recruitNecromancerLegion(progress,corpse,rollPercent,talentEffects={}){const p=normalizeNecromancerProgress(progress);if(p.legion.length>=10)return {ok:false,reason:"legion_full",progress:p,corpseConsumed:false};if(!corpse||corpse.boss||corpse.recruitable===false)return {ok:false,reason:"invalid_corpse",progress:p,corpseConsumed:false};const chance=Math.min(75,35+Math.max(0,p.skillRanks.legion-1)*3+Math.max(0,Number(talentEffects.legionRecruitChancePct)||0));if(Number(rollPercent)>=chance)return {ok:false,reason:"recruit_failed",progress:p,corpseConsumed:true,chance};const member={...corpse,permanent:true,deathForm:null};delete member.boss;delete member.recruitable;p.legion.push(member);if(p.activeLegionIds.length<3&&Number(member.hp)>0)p.activeLegionIds.push(String(member.id||member.speciesId||member.name));return {ok:true,progress:p,member,chance,corpseConsumed:true};}
export function activateNecromancerDomain(progress,playerLevel){const p=normalizeNecromancerProgress(progress);if(Number(playerLevel)<25)return {ok:false,reason:"level_locked",progress:p};if(p.domainUsesThisBattle>=1)return {ok:false,reason:"already_used_this_battle",progress:p};p.domainActive=true;p.domainUsesThisBattle++;p.ascendedSkillId=null;p.ascendedSkillUsedThisDomain=false;p.legion=p.legion.map(m=>({...m,deathForm:{active:true,formId:`${m.speciesId||m.id||"undead"}_death_form`,abilityId:`${m.speciesId||m.id||"undead"}_death_ability`}}));return {ok:true,progress:p,availableSkills:NECROMANCER.ascendedSkills};}
export function getAvailableNecromancerAscendedSkills(progress){const p=normalizeNecromancerProgress(progress);return p.domainActive&&!p.ascendedSkillUsedThisDomain?NECROMANCER.ascendedSkills:[];}
export function consumeNecromancerAscendedSkill(progress,skillId){const p=normalizeNecromancerProgress(progress);if(!p.domainActive)return {ok:false,reason:"domain_not_active",progress:p};if(p.ascendedSkillUsedThisDomain)return {ok:false,reason:"ascended_skill_already_used",progress:p};const skill=NECROMANCER.ascendedSkills.find(s=>s.id===skillId);if(!skill)return {ok:false,reason:"invalid_ascended_skill",progress:p};p.ascendedSkillId=skill.id;p.ascendedSkillUsedThisDomain=true;return {ok:true,progress:p,skill};}
export function endNecromancerDomain(progress){const p=normalizeNecromancerProgress(progress);p.domainActive=false;p.ascendedSkillId=null;p.ascendedSkillUsedThisDomain=false;p.legion=p.legion.map(m=>({...m,deathForm:null}));return p;}
export function resetNecromancerBattle(progress){const p=normalizeNecromancerProgress(progress);p.domainUsesThisBattle=0;p.reviveUsedThisBattle=false;p.skillCooldowns={};p.buffs={};p.statuses={};return p;}
