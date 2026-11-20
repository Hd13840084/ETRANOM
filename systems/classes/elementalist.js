/* ETRANOM Elementalist specialization. Turn-based text combat; no spatial range or movement. */
export const ELEMENTALIST = {
  "id": "wizard_elementalist",
  "classId": "wizard",
  "className": "جادوگر",
  "specialization": "المنتالیست",
  "specializationEn": "Elementalist",
  "version": 1,
  "identity": {
    "role": "جادوگر هشت عنصر؛ آسیب چندعنصری، دفاع، بازیابی و کنترل نوبتی",
    "resource": "مانا",
    "secondaryResource": "تسلط عنصری",
    "elements": [
      "آتش",
      "یخ",
      "برق",
      "باد",
      "زمین",
      "آب",
      "نور",
      "تاریکی"
    ],
    "strengths": [
      "پوشش هشت عنصر",
      "ترکیب دو عنصر",
      "آسیب گروهی",
      "دفاع و بازیابی",
      "تضعیف و کنترل نوبتی"
    ],
    "weaknesses": [
      "هزینه مانای بالا در مهارت‌های نهایی",
      "نیاز به مدیریت تسلط عناصر",
      "قدرت پایه متعادل‌تر از تخصص‌های تک‌عنصری"
    ],
    "attributes": {
      "primary": "intellect",
      "secondary": [
        "perception",
        "vitality",
        "endurance"
      ],
      "description": "هوش قدرت جادویی و مانا را تقویت می‌کند؛ ادراک دقت و ضربه بحرانی را بالا می‌برد؛ سرزندگی و استقامت بقا را افزایش می‌دهند."
    }
  },
  "combatRules": {
    "mode": "turn_based_text",
    "distance": false,
    "targeting": "یک دشمن، چند دشمن انتخابی، تمام دشمنان زنده یا خود بازیکن",
    "turnDuration": "تمام مدت‌ها برحسب نوبت بازیکن یا دشمن مشخص می‌شوند.",
    "cooldownUnit": "نوبت بازیکن",
    "manaCostBasis": "درصدی از حداکثر مانای مؤثر شخصیت؛ نه مانای باقی‌مانده. هزینه پایه پیش از تخفیف‌ها محاسبه و رو به بالا گرد می‌شود.",
    "control": "باس‌ها در برابر stun/freeze/کنترل کامل مصون‌اند؛ اثرها به کاهش آسیب، حمله یا مقاومت تبدیل می‌شوند."
  },
  "skills": [
    {
      "id": "ember_bolt",
      "name": "گلوله شعله",
      "en": "Flame Bolt",
      "unlockLevel": 1,
      "type": "single_damage",
      "element": "آتش",
      "target": "یک دشمن انتخابی",
      "manaPct": 4,
      "cooldownTurns": 0,
      "damagePct": 150,
      "description": "آسیب مستقیم و سوختگی برای 2 نوبت.",
      "upgrades": [
        {
          "damagePct": 170,
          "description": "آسیب ۱۷۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "damagePct": 190,
          "description": "آسیب ۱۹۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "burnDurationTurns": 3,
          "description": "سوختگی ۳ نوبت؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "defensePenetrationPct": 10,
          "description": "۱۰٪ نفوذ دفاع؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "critChanceBonusPct": 15,
          "description": "۱۵٪ شانس بحرانی اضافه؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "damagePct": 240,
          "burnDurationTurns": 4,
          "description": "آسیب ۲۴۰٪ و سوختگی تقویت‌شده؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        }
      ]
    },
    {
      "id": "frozen_armor",
      "name": "زره یخی",
      "en": "Frozen Armor",
      "unlockLevel": 2,
      "type": "shield",
      "element": "یخ",
      "target": "خود بازیکن",
      "manaPct": 7,
      "cooldownTurns": 3,
      "damagePct": 180,
      "description": "سپر برابر ۱۸۰٪ قدرت جادویی برای ۲ نوبت؛ کاهش ۱۰٪ آسیب دریافتی.",
      "upgrades": [
        {
          "shieldPct": 210,
          "description": "جذب ۲۱۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "shieldDurationTurns": 3,
          "description": "مدت ۳ نوبت؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "damageReductionPct": 15,
          "description": "کاهش آسیب ۱۵٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "shieldPct": 250,
          "description": "جذب ۲۵۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "freezeChancePct": 20,
          "description": "۲۰٪ احتمال یخ‌زدگی مهاجم عادی برای یک نوبت؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "shieldPct": 330,
          "cleanseCount": 1,
          "description": "جذب ۳۳۰٪ و پاک‌سازی یک اثر منفی؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        }
      ]
    },
    {
      "id": "chain_lightning",
      "name": "صاعقه زنجیره‌ای",
      "en": "Chain Lightning",
      "unlockLevel": 3,
      "type": "multi_target_damage",
      "element": "برق",
      "target": "تا 3 دشمن زنده",
      "manaPct": 9,
      "cooldownTurns": 2,
      "damagePct": 145,
      "description": "به هدف اول ۱۴۵٪ و به دو هدف بعدی ۸۰٪ آسیب می‌زند؛ شوک، قدرت حمله هدف را یک نوبت کاهش می‌دهد.",
      "upgrades": [
        {
          "damagePct": 160,
          "description": "آسیب هدف اول ۱۶۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "extraTargets": 1,
          "description": "هدف چهارم با ۶۰٪ آسیب اضافه می‌شود؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "chainTransferPct": 95,
          "description": "آسیب انتقال‌ها ۹۵٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "attackReductionPct": 10,
          "description": "۱۰٪ کاهش قدرت حمله اهداف؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "shockChancePct": 5,
          "description": "۵٪ شانس شوک اضافه؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "damagePct": 210,
          "maxTargets": 5,
          "description": "هدف اول ۲۱۰٪ و تا ۵ هدف؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        }
      ]
    },
    {
      "id": "tempest",
      "name": "گردباد سهمگین",
      "en": "Tempest",
      "unlockLevel": 4,
      "type": "all_damage_control",
      "element": "باد",
      "target": "تمام دشمنان زنده",
      "manaPct": 11,
      "cooldownTurns": 3,
      "damagePct": 95,
      "description": "به همه دشمنان ۹۵٪ آسیب و برای ۲ نوبت ۱۲٪ کاهش دقت و حمله.",
      "upgrades": [
        {
          "damagePct": 110,
          "description": "آسیب ۱۱۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "debuffDurationTurns": 3,
          "description": "مدت تضعیف ۳ نوبت؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "attackReductionPct": 15,
          "description": "کاهش حمله ۱۵٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "damagePct": 125,
          "description": "آسیب ۱۲۵٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "accuracyReductionPct": 20,
          "description": "کاهش دقت ۲۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "damagePct": 155,
          "attackReductionPct": 20,
          "description": "آسیب ۱۵۵٪ و کاهش حمله ۲۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        }
      ]
    },
    {
      "id": "earth_rupture",
      "name": "شکاف زمین",
      "en": "Earth Rupture",
      "unlockLevel": 5,
      "type": "all_damage_debuff",
      "element": "زمین",
      "target": "تمام دشمنان زنده",
      "manaPct": 12,
      "cooldownTurns": 3,
      "damagePct": 130,
      "description": "به همه دشمنان ۱۳۰٪ آسیب و ۱۰٪ کاهش دفاع برای ۲ نوبت.",
      "upgrades": [
        {
          "damagePct": 150,
          "description": "آسیب ۱۵۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "defenseReductionPct": 15,
          "description": "کاهش دفاع ۱۵٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "debuffDurationTurns": 3,
          "description": "مدت کاهش دفاع ۳ نوبت؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "damagePct": 170,
          "description": "آسیب ۱۷۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "defensePenetrationPct": 20,
          "description": "۲۰٪ نفوذ دفاع؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "damagePct": 210,
          "defenseReductionPct": 20,
          "description": "آسیب ۲۱۰٪ و کاهش دفاع ۲۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        }
      ]
    },
    {
      "id": "tidal_renewal",
      "name": "موج احیاگر",
      "en": "Tidal Renewal",
      "unlockLevel": 6,
      "type": "self_heal_cleanse",
      "element": "آب",
      "target": "خود بازیکن",
      "manaPct": 10,
      "cooldownTurns": 4,
      "damagePct": 220,
      "description": "بازیابی HP برابر ۲۲۰٪ قدرت جادویی و پاک‌سازی یک اثر منفی قابل پاک‌سازی.",
      "upgrades": [
        {
          "healPct": 250,
          "description": "بازیابی ۲۵۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "cleanseCount": 2,
          "description": "پاک‌سازی دو اثر منفی؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "resistanceBonusPct": 10,
          "description": "افزایش ۱۰٪ مقاومت تا ۲ نوبت؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "healPct": 300,
          "description": "بازیابی ۳۰۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "manaRestorePct": 5,
          "description": "۵٪ حداکثر مانا نیز بازیابی می‌شود؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "healPct": 380,
          "cleanseCount": 2,
          "description": "بازیابی ۳۸۰٪ و پاک‌سازی دو اثر؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        }
      ]
    },
    {
      "id": "radiant_judgment",
      "name": "پرتو تطهیر",
      "en": "Radiant Judgment",
      "unlockLevel": 7,
      "type": "single_damage_cleanse",
      "element": "نور",
      "target": "یک دشمن انتخابی؛ پاک‌سازی از خود",
      "manaPct": 10,
      "cooldownTurns": 3,
      "damagePct": 230,
      "description": "به دشمن ۲۳۰٪ آسیب نور می‌زند و یک اثر منفی قابل پاک‌سازی را از خود حذف می‌کند؛ علیه دشمنان تاریک ۲۰٪ آسیب بیشتر.",
      "upgrades": [
        {
          "damagePct": 260,
          "description": "آسیب ۲۶۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "cleanseCount": 2,
          "description": "پاک‌سازی دو اثر؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "bonusVsDarkPct": 25,
          "description": "۲۵٪ آسیب بیشتر علیه تاریکی؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "damagePct": 300,
          "description": "آسیب ۳۰۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "darkResistanceReductionPct": 15,
          "description": "۱۵٪ کاهش مقاومت تاریکی هدف؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "damagePct": 390,
          "cleanseCount": 3,
          "description": "آسیب ۳۹۰٪ و پاک‌سازی سه اثر؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        }
      ]
    },
    {
      "id": "darkness_chains",
      "name": "زنجیرهای تاریکی",
      "en": "Chains of Darkness",
      "unlockLevel": 8,
      "type": "single_damage_drain",
      "element": "تاریکی",
      "target": "یک دشمن انتخابی",
      "manaPct": 11,
      "cooldownTurns": 4,
      "damagePct": 175,
      "description": "به هدف ۱۷۵٪ آسیب می‌زند؛ قدرت حمله را ۱۵٪ برای ۲ نوبت کاهش و ۵٪ حداکثر مانای مؤثر هدف را تخلیه می‌کند (در صورت وجود مانای دشمن).",
      "upgrades": [
        {
          "damagePct": 195,
          "description": "آسیب ۱۹۵٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "attackReductionPct": 20,
          "description": "کاهش حمله ۲۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "debuffDurationTurns": 3,
          "description": "مدت ۳ نوبت؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "manaDrainPct": 7,
          "description": "تخلیه ۷٪ حداکثر مانا؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "damagePct": 220,
          "description": "آسیب ۲۲۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "damagePct": 280,
          "darkResistanceReductionPct": 15,
          "description": "آسیب ۲۸۰٪ و کاهش مقاومت تاریکی ۱۵٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        }
      ]
    },
    {
      "id": "elemental_fusion",
      "name": "هم‌جوشی عناصر",
      "en": "Elemental Fusion",
      "unlockLevel": 9,
      "type": "dual_element_combo",
      "element": "ترکیبی",
      "target": "یک دشمن یا تمام دشمنان؛ وابسته به ترکیب",
      "manaPct": 16,
      "cooldownTurns": 5,
      "damagePct": 200,
      "description": "دو عنصر انتخاب کن؛ ضربه ترکیبی به هدف یا اهداف انتخاب‌شده وارد می‌شود. هر ترکیب اثر مشخص دارد و یک عنصر را نمی‌توان دوبار انتخاب کرد.",
      "upgrades": [
        {
          "damagePct": 220,
          "description": "ضریب پایه ۲۲۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "comboEffectBonusPct": 10,
          "description": "۱۰٪ افزایش شدت اثر ترکیبی؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "comboDurationTurns": 3,
          "description": "اثر ترکیبی تا ۳ نوبت؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "damagePct": 250,
          "description": "ضریب پایه ۲۵۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "resistancePenetrationPct": 15,
          "description": "۱۵٪ نفوذ مقاومت عنصری؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "damagePct": 300,
          "description": "ضریب پایه ۳۰۰٪ و اثر ترکیبی تقویت‌شده؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        }
      ]
    },
    {
      "id": "primordial_cataclysm",
      "name": "فاجعه بنیادین",
      "en": "Primordial Cataclysm",
      "unlockLevel": 10,
      "type": "ultimate_all_damage",
      "element": "هر هشت عنصر",
      "target": "تمام دشمنان زنده",
      "manaPct": 30,
      "cooldownTurns": 8,
      "damagePct": 480,
      "description": "هشت موج عنصری به همه دشمنان؛ مجموع آسیب پایه ۴۸۰٪ قدرت جادویی. هر تسلط عنصری فعال، ۲٪ آسیب نهایی اضافه می‌کند؛ باس‌ها از کنترل کامل مصون‌اند.",
      "upgrades": [
        {
          "damagePct": 520,
          "description": "مجموع آسیب ۵۲۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "masteryBonusCapPct": 10,
          "description": "سقف پاداش تسلط ۱۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "secondaryEffectDurationTurns": 3,
          "description": "اثرهای فرعی تا ۳ نوبت؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "damagePct": 600,
          "description": "مجموع آسیب ۶۰۰٪؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "resistancePenetrationPct": 15,
          "description": "۱۵٪ نفوذ مقاومت عنصری؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        },
        {
          "damagePct": 720,
          "description": "مجموع آسیب ۷۲۰٪ و موج پایانی تقویت‌شده؛ این ارتقا به رتبه مهارت اضافه می‌شود."
        }
      ]
    }
  ],
  "talentBranches": [
    {
      "id": "pyro_terra",
      "name": "آتش و زمین",
      "en": "Pyro-Terra",
      "focus": "آسیب آتش/زمین و نفوذ دفاع",
      "talents": [
        {
          "id": "flame_affinity",
          "name": "هم‌نفس آتش",
          "description": "آسیب آتش ۵٪ بیشتر.",
          "effects": {
            "fireDamagePct": 5
          }
        },
        {
          "id": "magma_core",
          "name": "هسته گدازه",
          "description": "آسیب زمین ۵٪ بیشتر.",
          "effects": {
            "earthDamagePct": 5
          }
        },
        {
          "id": "scorching_will",
          "name": "اراده سوزان",
          "description": "مدت سوختگی یک نوبت بیشتر.",
          "effects": {
            "burnDurationTurns": 1
          }
        },
        {
          "id": "fracture",
          "name": "شکافنده",
          "description": "نفوذ دفاع مهارت‌های زمین ۵٪ بیشتر.",
          "effects": {
            "earthPenetrationPct": 5
          }
        },
        {
          "id": "living_ember",
          "name": "اخگر زنده",
          "description": "ضربه بحرانی آتش ۳٪ بیشتر.",
          "effects": {
            "fireCritPct": 3
          }
        },
        {
          "id": "molten_guard",
          "name": "نگهبان مذاب",
          "description": "قدرت سپرهای عنصری ۸٪ بیشتر.",
          "effects": {
            "elementalShieldPct": 8
          }
        },
        {
          "id": "volcanic_blood",
          "name": "خون آتشفشان",
          "description": "آسیب به باس‌ها با آتش/زمین ۷٪ بیشتر.",
          "effects": {
            "fireEarthBossDamagePct": 7
          }
        },
        {
          "id": "primordial_forge",
          "name": "کوره نخستین",
          "description": "آسیب آتش و زمین ۱۰٪ بیشتر.",
          "effects": {
            "fireDamagePct": 10,
            "earthDamagePct": 10
          },
          "requires": "volcanic_blood"
        }
      ]
    },
    {
      "id": "glacial_tide",
      "name": "یخ و آب",
      "en": "Glacial Tide",
      "focus": "بقا، بازیابی و کنترل یخ/آب",
      "talents": [
        {
          "id": "frost_touch",
          "name": "لمس یخ",
          "description": "آسیب یخ ۵٪ بیشتر.",
          "effects": {
            "iceDamagePct": 5
          }
        },
        {
          "id": "deep_current",
          "name": "جریان ژرف",
          "description": "بازیابی HP مهارت آب ۵٪ بیشتر.",
          "effects": {
            "waterHealingPct": 5
          }
        },
        {
          "id": "cold_blood",
          "name": "خون سرد",
          "description": "مقاومت در برابر کنترل ۵٪ بیشتر.",
          "effects": {
            "controlResistancePct": 5
          }
        },
        {
          "id": "crystal_skin",
          "name": "پوست بلورین",
          "description": "حداکثر HP، ۴٪ بیشتر.",
          "effects": {
            "hpPct": 4
          }
        },
        {
          "id": "rime",
          "name": "شبنم یخ‌زده",
          "description": "اثر کاهش حمله یخ یک نوبت بیشتر.",
          "effects": {
            "iceDebuffDuration": 1
          }
        },
        {
          "id": "tidal_mana",
          "name": "مانای جزرومد",
          "description": "بازیابی مانا در هر نوبت ۵٪ بیشتر.",
          "effects": {
            "mpRegenPct": 5
          }
        },
        {
          "id": "permafrost",
          "name": "یخبندان ابدی",
          "description": "قدرت اثرهای یخ ۸٪ بیشتر.",
          "effects": {
            "iceEffectPct": 8
          }
        },
        {
          "id": "oceanic_soul",
          "name": "روح اقیانوس",
          "description": "درمان آب ۱۰٪ و مقاومت یخ ۸٪ بیشتر.",
          "effects": {
            "waterHealingPct": 10,
            "iceResistancePct": 8
          },
          "requires": "permafrost"
        }
      ]
    },
    {
      "id": "stormcaller",
      "name": "برق و باد",
      "en": "Stormcaller",
      "focus": "زنجیره حمله، دقت و تضعیف",
      "talents": [
        {
          "id": "static_charge",
          "name": "بار ساکن",
          "description": "آسیب برق ۵٪ بیشتر.",
          "effects": {
            "lightningDamagePct": 5
          }
        },
        {
          "id": "gale_force",
          "name": "نیروی تندباد",
          "description": "آسیب باد ۵٪ بیشتر.",
          "effects": {
            "windDamagePct": 5
          }
        },
        {
          "id": "conductive",
          "name": "رسانا",
          "description": "شوک ۵٪ مؤثرتر می‌شود.",
          "effects": {
            "shockEffectPct": 5
          }
        },
        {
          "id": "crosswind",
          "name": "باد مخالف",
          "description": "دقت دشمنان تضعیف‌شده ۴٪ کمتر.",
          "effects": {
            "enemyAccuracyDownPct": 4
          }
        },
        {
          "id": "storm_focus",
          "name": "تمرکز توفان",
          "description": "شانس بحرانی برق ۳٪ بیشتر.",
          "effects": {
            "lightningCritPct": 3
          }
        },
        {
          "id": "chain_reaction",
          "name": "واکنش زنجیره‌ای",
          "description": "آسیب انتقال صاعقه ۸٪ بیشتر.",
          "effects": {
            "chainDamagePct": 8
          }
        },
        {
          "id": "eye_of_storm",
          "name": "چشم توفان",
          "description": "کاهش حمله دشمنان با باد ۵٪ بیشتر.",
          "effects": {
            "windAttackDownPct": 5
          }
        },
        {
          "id": "tempest_lord",
          "name": "ارباب توفان",
          "description": "آسیب برق و باد ۱۰٪ بیشتر.",
          "effects": {
            "lightningDamagePct": 10,
            "windDamagePct": 10
          },
          "requires": "eye_of_storm"
        }
      ]
    },
    {
      "id": "radiant_void",
      "name": "نور و تاریکی",
      "en": "Radiant Void",
      "focus": "پاک‌سازی، نفرین و تسلط دوگانه",
      "talents": [
        {
          "id": "radiant_soul",
          "name": "روح تابان",
          "description": "آسیب نور ۵٪ بیشتر.",
          "effects": {
            "lightDamagePct": 5
          }
        },
        {
          "id": "void_touch",
          "name": "لمس خلأ",
          "description": "آسیب تاریکی ۵٪ بیشتر.",
          "effects": {
            "darkDamagePct": 5
          }
        },
        {
          "id": "purifying_light",
          "name": "نور پالاینده",
          "description": "قدرت پاک‌سازی ۱ اثر بیشتر، یک بار در هر ۳ نوبت.",
          "effects": {
            "cleanseBonus": 1
          }
        },
        {
          "id": "umbra_drain",
          "name": "مکنده تاریکی",
          "description": "تخلیه مانای تاریکی ۲٪ بیشتر از حداکثر مانای هدف.",
          "effects": {
            "darkManaDrainPct": 2
          }
        },
        {
          "id": "dawn_barrier",
          "name": "سد سپیده",
          "description": "مقاومت جادویی ۵٪ بیشتر.",
          "effects": {
            "magicResistancePct": 5
          }
        },
        {
          "id": "eclipse",
          "name": "کسوف",
          "description": "آسیب ترکیب نور/تاریکی ۸٪ بیشتر.",
          "effects": {
            "lightDarkComboPct": 8
          }
        },
        {
          "id": "twilight_balance",
          "name": "تعادل گرگ‌ومیش",
          "description": "تسلط نور و تاریکی ۱۰٪ سریع‌تر افزایش می‌یابد.",
          "effects": {
            "lightDarkMasteryGainPct": 10
          }
        },
        {
          "id": "eclipse_sovereign",
          "name": "فرمانروای کسوف",
          "description": "آسیب نور و تاریکی ۱۰٪ و حداکثر مانا ۵٪ بیشتر.",
          "effects": {
            "lightDamagePct": 10,
            "darkDamagePct": 10,
            "mpPct": 5
          },
          "requires": "twilight_balance"
        }
      ]
    }
  ],
  "elementMastery": {
    "maxPerElement": 100,
    "gain": "هر بار اجرای موفق مهارت عنصری، تسلط همان عنصر را افزایش می‌دهد؛ تسلط خارج از نبرد حفظ می‌شود.",
    "bonuses": "به ازای هر ۱۰ تسلط، ۱٪ آسیب همان عنصر (حداکثر ۱۰٪)؛ در ۵۰ تسلط اثر ویژه مهارت باز می‌شود و در ۱۰۰ تسلط مهارت همان عنصر ۵٪ هزینه مانای کمتری دارد.",
    "combos": {
      "fire_wind": "طوفان آتش: آسیب آتش گروهی و سوختگی",
      "ice_water": "یخبندان عمیق: آسیب یخ و کاهش حمله",
      "lightning_earth": "گسل الکتریکی: آسیب برق و کاهش دفاع",
      "light_dark": "توازن دوگانه: آسیب نور/تاریکی و کاهش مقاومت",
      "fire_earth": "گدازه: آسیب سنگین و سوختگی",
      "water_wind": "باران تیغه‌ای: چندضربه و کاهش دقت",
      "lightning_wind": "توفان صاعقه: زنجیره برق با هدف‌های بیشتر",
      "water_dark": "مه فرساینده: آسیب و کاهش بازیابی دشمن",
      "ice_light": "سپیده یخی: آسیب یخ و سپر برای خود",
      "earth_dark": "قبر سنگی: آسیب و تضعیف حمله"
    }
  },
  "domain": {
    "id": "primal_elemental_crown",
    "name": "تاج عناصر نخستین",
    "en": "Crown of Primal Elements",
    "unlockLevel": 25,
    "use": {
      "manaPct": 22,
      "oncePerBattle": true,
      "cooldownBattles": 1,
      "durationPlayerTurns": 5,
      "target": "تمام میدان نبرد و خود بازیکن",
      "distance": false
    },
    "stages": [
      {
        "id": "awakening",
        "name": "بیداری تاج",
        "level": 25,
        "durationPlayerTurns": 5,
        "magicPowerPct": 15,
        "elementalDamagePct": 10,
        "elementalResistancePct": 10,
        "feature": "هر نوبت یک عنصر چرخشی تقویت می‌شود؛ بازیکن در آغاز قلمرو یک تسلط عنصری را ۱۰ واحد افزایش می‌دهد.",
        "visual": "هشت نشان عنصری به شکل حلقه‌ای پیرامون تاج نورانی شناورند."
      },
      {
        "id": "mastery",
        "name": "تسلط هشت‌گانه",
        "level": 40,
        "durationPlayerTurns": 6,
        "magicPowerPct": 25,
        "elementalDamagePct": 15,
        "elementalResistancePct": 15,
        "feature": "هر دو نوبت یک موج از عنصر غالب به تمام دشمنان آسیب می‌زند؛ هر موج عنصر متفاوتی دارد.",
        "visual": "هشت ستون آتش، یخ، برق، باد، زمین، آب، نور و تاریکی پشت سر جادوگر پدیدار می‌شوند."
      },
      {
        "id": "ascension",
        "name": "تاج تعالی‌یافته",
        "level": 50,
        "durationPlayerTurns": 7,
        "magicPowerPct": 35,
        "elementalDamagePct": 20,
        "elementalResistancePct": 20,
        "feature": "دو عنصر منتخب در هر نوبت هم‌افزایی می‌کنند؛ هر نوبت به همه دشمنان ۴۰٪ قدرت جادویی آسیب ترکیبی وارد می‌شود.",
        "visual": "هشت حلقه در هم ادغام شده و تاجی هشت‌پر تشکیل می‌دهند."
      },
      {
        "id": "absolute",
        "name": "تاج مطلق نخستین",
        "level": 50,
        "requiresQuest": true,
        "durationPlayerTurns": 8,
        "magicPowerPct": 45,
        "elementalDamagePct": 30,
        "elementalResistancePct": 25,
        "feature": "هر نوبت دو موج عنصری به همه دشمنان می‌رسد؛ در پایان قلمرو انفجار ۲۵۰٪ قدرت جادویی رخ می‌دهد. یک مهارت تعالی‌یافته در این مرحله قابل اجراست.",
        "visual": "قلمرو به آفرینشگاهی کیهانی با هشت خورشید عنصری تبدیل می‌شود."
      }
    ],
    "quest": {
      "id": "trial_of_primal_core",
      "name": "آزمون هسته نخستین",
      "description": "هشت نگهبان عنصر را در آزمون‌های جداگانه شکست بده و هسته نخستین را با مهار تعادل نور و تاریکی پایدار کن.",
      "requirements": [
        "رسیدن به سطح ۵۰",
        "بازکردن سه مرحله نخست قلمرو",
        "شکست هشت نگهبان عنصری در نبردهای آزمون",
        "تکمیل نبرد نهایی با هسته نخستین"
      ],
      "rewards": [
        "قلمرو مطلق نخستین",
        "عنوان فرمانروای هشت عنصر",
        "ارتقای نهایی مهارت تعالی‌یافته"
      ]
    }
  },
  "ascendedSkills": [
    {
      "id": "asc_ember_bolt",
      "skillId": "ember_bolt",
      "name": "خورشیدِ ویرانگر",
      "target": "یک دشمن انتخابی",
      "manaPct": 10,
      "cooldownTurns": 4,
      "damagePct": 330,
      "stages": {
        "mastery": {
          "damageBonusPct": 10
        },
        "ascension": {
          "damageBonusPct": 20
        },
        "absolute": {
          "damageBonusPct": 35
        }
      },
      "description": "نسخه تعالی‌یافته این مهارت؛ با فعال‌سازی قلمرو، این نسخه در کنار ۹ نسخه تعالی‌یافته دیگر در دسترس قرار می‌گیرد؛ بازیکن دقیقاً یکی از ده نسخه را انتخاب و فقط یک بار در همان فعال‌سازی اجرا می‌کند."
    },
    {
      "id": "asc_frozen_armor",
      "skillId": "frozen_armor",
      "name": "زره ابدی بلورین",
      "target": "خود بازیکن",
      "manaPct": 13,
      "cooldownTurns": 5,
      "damagePct": 396,
      "stages": {
        "mastery": {
          "damageBonusPct": 10
        },
        "ascension": {
          "damageBonusPct": 20
        },
        "absolute": {
          "damageBonusPct": 35
        }
      },
      "description": "نسخه تعالی‌یافته این مهارت؛ با فعال‌سازی قلمرو، این نسخه در کنار ۹ نسخه تعالی‌یافته دیگر در دسترس قرار می‌گیرد؛ بازیکن دقیقاً یکی از ده نسخه را انتخاب و فقط یک بار در همان فعال‌سازی اجرا می‌کند."
    },
    {
      "id": "asc_chain_lightning",
      "skillId": "chain_lightning",
      "name": "داوری آسمانی",
      "target": "تا 3 دشمن زنده",
      "manaPct": 15,
      "cooldownTurns": 4,
      "damagePct": 319,
      "stages": {
        "mastery": {
          "damageBonusPct": 10
        },
        "ascension": {
          "damageBonusPct": 20
        },
        "absolute": {
          "damageBonusPct": 35
        }
      },
      "description": "نسخه تعالی‌یافته این مهارت؛ با فعال‌سازی قلمرو، این نسخه در کنار ۹ نسخه تعالی‌یافته دیگر در دسترس قرار می‌گیرد؛ بازیکن دقیقاً یکی از ده نسخه را انتخاب و فقط یک بار در همان فعال‌سازی اجرا می‌کند."
    },
    {
      "id": "asc_tempest",
      "skillId": "tempest",
      "name": "توفان پایان جهان",
      "target": "تمام دشمنان زنده",
      "manaPct": 17,
      "cooldownTurns": 5,
      "damagePct": 209,
      "stages": {
        "mastery": {
          "damageBonusPct": 10
        },
        "ascension": {
          "damageBonusPct": 20
        },
        "absolute": {
          "damageBonusPct": 35
        }
      },
      "description": "نسخه تعالی‌یافته این مهارت؛ با فعال‌سازی قلمرو، این نسخه در کنار ۹ نسخه تعالی‌یافته دیگر در دسترس قرار می‌گیرد؛ بازیکن دقیقاً یکی از ده نسخه را انتخاب و فقط یک بار در همان فعال‌سازی اجرا می‌کند."
    },
    {
      "id": "asc_earth_rupture",
      "skillId": "earth_rupture",
      "name": "خشم هسته زمین",
      "target": "تمام دشمنان زنده",
      "manaPct": 18,
      "cooldownTurns": 5,
      "damagePct": 286,
      "stages": {
        "mastery": {
          "damageBonusPct": 10
        },
        "ascension": {
          "damageBonusPct": 20
        },
        "absolute": {
          "damageBonusPct": 35
        }
      },
      "description": "نسخه تعالی‌یافته این مهارت؛ با فعال‌سازی قلمرو، این نسخه در کنار ۹ نسخه تعالی‌یافته دیگر در دسترس قرار می‌گیرد؛ بازیکن دقیقاً یکی از ده نسخه را انتخاب و فقط یک بار در همان فعال‌سازی اجرا می‌کند."
    },
    {
      "id": "asc_tidal_renewal",
      "skillId": "tidal_renewal",
      "name": "چشمه حیات نخستین",
      "target": "خود بازیکن",
      "manaPct": 16,
      "cooldownTurns": 6,
      "damagePct": 484,
      "stages": {
        "mastery": {
          "damageBonusPct": 10
        },
        "ascension": {
          "damageBonusPct": 20
        },
        "absolute": {
          "damageBonusPct": 35
        }
      },
      "description": "نسخه تعالی‌یافته این مهارت؛ با فعال‌سازی قلمرو، این نسخه در کنار ۹ نسخه تعالی‌یافته دیگر در دسترس قرار می‌گیرد؛ بازیکن دقیقاً یکی از ده نسخه را انتخاب و فقط یک بار در همان فعال‌سازی اجرا می‌کند."
    },
    {
      "id": "asc_radiant_judgment",
      "skillId": "radiant_judgment",
      "name": "تجلی نور مطلق",
      "target": "یک دشمن انتخابی؛ پاک‌سازی از خود",
      "manaPct": 16,
      "cooldownTurns": 5,
      "damagePct": 506,
      "stages": {
        "mastery": {
          "damageBonusPct": 10
        },
        "ascension": {
          "damageBonusPct": 20
        },
        "absolute": {
          "damageBonusPct": 35
        }
      },
      "description": "نسخه تعالی‌یافته این مهارت؛ با فعال‌سازی قلمرو، این نسخه در کنار ۹ نسخه تعالی‌یافته دیگر در دسترس قرار می‌گیرد؛ بازیکن دقیقاً یکی از ده نسخه را انتخاب و فقط یک بار در همان فعال‌سازی اجرا می‌کند."
    },
    {
      "id": "asc_darkness_chains",
      "skillId": "darkness_chains",
      "name": "بندهای خلأ ابدی",
      "target": "یک دشمن انتخابی",
      "manaPct": 17,
      "cooldownTurns": 6,
      "damagePct": 385,
      "stages": {
        "mastery": {
          "damageBonusPct": 10
        },
        "ascension": {
          "damageBonusPct": 20
        },
        "absolute": {
          "damageBonusPct": 35
        }
      },
      "description": "نسخه تعالی‌یافته این مهارت؛ با فعال‌سازی قلمرو، این نسخه در کنار ۹ نسخه تعالی‌یافته دیگر در دسترس قرار می‌گیرد؛ بازیکن دقیقاً یکی از ده نسخه را انتخاب و فقط یک بار در همان فعال‌سازی اجرا می‌کند."
    },
    {
      "id": "asc_elemental_fusion",
      "skillId": "elemental_fusion",
      "name": "اتحاد هشت بنیاد",
      "target": "یک دشمن یا تمام دشمنان؛ وابسته به ترکیب",
      "manaPct": 22,
      "cooldownTurns": 7,
      "damagePct": 440,
      "stages": {
        "mastery": {
          "damageBonusPct": 10
        },
        "ascension": {
          "damageBonusPct": 20
        },
        "absolute": {
          "damageBonusPct": 35
        }
      },
      "description": "نسخه تعالی‌یافته این مهارت؛ با فعال‌سازی قلمرو، این نسخه در کنار ۹ نسخه تعالی‌یافته دیگر در دسترس قرار می‌گیرد؛ بازیکن دقیقاً یکی از ده نسخه را انتخاب و فقط یک بار در همان فعال‌سازی اجرا می‌کند."
    },
    {
      "id": "asc_primordial_cataclysm",
      "skillId": "primordial_cataclysm",
      "name": "رستاخیز عناصر نخستین",
      "target": "تمام دشمنان زنده",
      "manaPct": 36,
      "cooldownTurns": 10,
      "damagePct": 1056,
      "stages": {
        "mastery": {
          "damageBonusPct": 10
        },
        "ascension": {
          "damageBonusPct": 20
        },
        "absolute": {
          "damageBonusPct": 35
        }
      },
      "description": "نسخه تعالی‌یافته این مهارت؛ با فعال‌سازی قلمرو، این نسخه در کنار ۹ نسخه تعالی‌یافته دیگر در دسترس قرار می‌گیرد؛ بازیکن دقیقاً یکی از ده نسخه را انتخاب و فقط یک بار در همان فعال‌سازی اجرا می‌کند."
    }
  ],
  "progression": {
    "skillUnlocksEveryLevel": true,
    "firstSkillLevel": 1,
    "lastSkillLevel": 10,
    "skillUpgradeCount": 6,
    "skillUpgradeCost": 1,
    "talentCount": 32,
    "talentUnlockCost": 1,
    "levelUpRewards": {
      "attributePoints": 5,
      "skillPoints": 2
    },
    "unspentPointsPersist": true,
    "domainUnlockLevel": 25,
    "domainMasteryLevel": 40,
    "domainAscensionLevel": 50,
    "absoluteDomainLevel": 50,
    "absoluteDomainRequiresQuest": true,
    "ascendedSkillChoiceCount": 0,
    "ascendedSkillAvailableOnlyInDomain": true,
    "ascendedSkillAvailability": "all_10_during_domain",
    "ascendedSkillSelectionTiming": "after_domain_activation",
    "ascendedSkillSelectionLimitPerDomain": 1,
    "ascendedSkillUsesPerDomain": 1
  }
};

export function createElementalistProgress(){
 return {elementMastery:{fire:0,ice:0,lightning:0,wind:0,earth:0,water:0,light:0,darkness:0},skillRanks:{},unlockedTalents:[],domainStage:'locked',domainQuest:{started:false,guardiansDefeated:[],coreTrialComplete:false,complete:false},ascendedSkillId:null,domainActive:false,domainUsesThisBattle:0,ascendedUsesThisDomain:0,ascendedSkillUsedThisDomain:false,skillCooldowns:{},buffs:{},statuses:{}};
}
export function normalizeElementalistProgress(progress){
 const p={...createElementalistProgress(),...(progress||{})}; p.elementMastery={...createElementalistProgress().elementMastery,...(p.elementMastery||{})}; for(const k of Object.keys(p.elementMastery))p.elementMastery[k]=Math.max(0,Math.min(100,Number(p.elementMastery[k])||0)); p.skillRanks={...(p.skillRanks||{})}; p.unlockedTalents=Array.isArray(p.unlockedTalents)?[...new Set(p.unlockedTalents)]:[]; p.skillCooldowns={...(p.skillCooldowns||{})}; p.buffs={...(p.buffs||{})}; p.statuses={...(p.statuses||{})}; p.domainQuest={...createElementalistProgress().domainQuest,...(p.domainQuest||{})}; for(const s of ELEMENTALIST.skills)p.skillRanks[s.id]=Math.max(0,Math.min(7,Number(p.skillRanks[s.id])||0)); return p;
}


// Domain rule: activation exposes all ten renamed ascended skills; exactly one may be cast per activation.
export function activateElementalistDomain(progress, playerLevel){
 const p=normalizeElementalistProgress(progress);
 if(Number(playerLevel)<ELEMENTALIST.domain.unlockLevel) return {ok:false,reason:'level_locked',progress:p};
 if(p.domainUsesThisBattle>=1) return {ok:false,reason:'already_used_this_battle',progress:p};
 p.domainActive=true; p.domainUsesThisBattle+=1; p.ascendedUsesThisDomain=0; p.ascendedSkillUsedThisDomain=false; p.ascendedSkillId=null;
 return {ok:true,progress:p,availableSkills:ELEMENTALIST.ascendedSkills};
}
export function getAvailableElementalistAscendedSkills(progress){
 const p=normalizeElementalistProgress(progress);
 return p.domainActive&&!p.ascendedSkillUsedThisDomain?ELEMENTALIST.ascendedSkills:[];
}
export function consumeElementalistAscendedSkill(progress, ascendedSkillId){
 const p=normalizeElementalistProgress(progress);
 if(!p.domainActive) return {ok:false,reason:'domain_not_active',progress:p};
 if(p.ascendedSkillUsedThisDomain||p.ascendedUsesThisDomain>=1) return {ok:false,reason:'ascended_skill_already_used',progress:p};
 const skill=ELEMENTALIST.ascendedSkills.find(x=>x.id===ascendedSkillId);
 if(!skill) return {ok:false,reason:'invalid_ascended_skill',progress:p};
 p.ascendedSkillUsedThisDomain=true; p.ascendedUsesThisDomain=1; p.ascendedSkillId=skill.id;
 return {ok:true,progress:p,skill};
}
export function endElementalistDomain(progress){ const p=normalizeElementalistProgress(progress); p.domainActive=false; p.ascendedSkillId=null; return p; }
