/**
 * ETRANOM Necromancer Common Companions — authored data pack V1982.
 * Uses the canonical eight shared player/monster attributes only.
 * This module is a content and decision layer; it does not replace the legacy
 * necromancer Legion runtime or activate Underworld Gate by itself.
 */
export const NECROMANCER_COMPANION_ATTRIBUTE_KEYS = Object.freeze([
  'power','speed','endurance','vitality','intellect','perception','luck','faith'
]);
export const NECROMANCER_COMMON_COMPANIONS = Object.freeze([
  {
    "id": "little_skeleton",
    "name": "اسکلت کوچولو",
    "nameEn": "Little Skeleton",
    "rank": "common",
    "levelMin": 1,
    "levelMax": 100,
    "role": "چابک / ضربه‌زن",
    "lore": "بازآفرینی فانتزی از اسکلت‌های متحرک در روایت‌های اروپایی؛ موجودی کوچک که از استخوان‌های پراکنده دوباره سرهم شده است.",
    "portrait": "assets/necromancer/companions/little_skeleton.webp",
    "stats": {
      "power": 8,
      "speed": 15,
      "endurance": 7,
      "vitality": 8,
      "intellect": 4,
      "perception": 13,
      "luck": 12,
      "faith": 5
    },
    "growthPerLevel": {
      "power": 0.18,
      "speed": 0.34,
      "endurance": 0.16,
      "vitality": 0.2,
      "intellect": 0.08,
      "perception": 0.3,
      "luck": 0.18,
      "faith": 0.08
    },
    "skills": [
      {
        "id": "bone_tap",
        "name": "تلنگر استخوانی",
        "type": "physical",
        "target": "single",
        "powerPct": 105,
        "cooldownTurns": 0,
        "durationTurns": 0,
        "description": "ضربه سریع و کم‌هزینه."
      },
      {
        "id": "skitter_step",
        "name": "لغزش ریز",
        "type": "defense",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 1,
        "description": "برای یک نوبت ۱۸٪ شانس جاخالی بیشتر."
      },
      {
        "id": "rib_dart",
        "name": "پرتاب دنده",
        "type": "physical",
        "target": "single",
        "powerPct": 145,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "اگر هدف زیر ۳۵٪ HP باشد ۲۰٪ آسیب بیشتر."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "اندام کوچک: نخستین ضربه دریافتی در هر نبرد ۸٪ کاهش می‌یابد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "execute_low_hp",
        "avoid_heavy_skill",
        "prefer_fast_target"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "uncommon",
      "itemId": "companion_evolution_common_to_uncommon",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "wandering_spirit",
    "name": "روح سرگردان",
    "nameEn": "Wandering Spirit",
    "rank": "common",
    "levelMin": 1,
    "levelMax": 100,
    "role": "جادویی / تضعیف",
    "lore": "الهام از باورهای اروپایی درباره ارواحی که پس از مرگ آرام نگرفته‌اند.",
    "portrait": "assets/necromancer/companions/wandering_spirit.webp",
    "stats": {
      "power": 4,
      "speed": 12,
      "endurance": 8,
      "vitality": 9,
      "intellect": 14,
      "perception": 10,
      "luck": 11,
      "faith": 13
    },
    "growthPerLevel": {
      "power": 0.06,
      "speed": 0.22,
      "endurance": 0.18,
      "vitality": 0.2,
      "intellect": 0.34,
      "perception": 0.18,
      "luck": 0.22,
      "faith": 0.28
    },
    "skills": [
      {
        "id": "spectral_touch",
        "name": "لمس طیفی",
        "type": "magic",
        "target": "single",
        "powerPct": 120,
        "cooldownTurns": 0,
        "durationTurns": 0,
        "description": "آسیب روحی تک‌هدف."
      },
      {
        "id": "lament",
        "name": "ناله سرگردانی",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "قدرت حمله هدف را ۱۲٪ برای دو نوبت کم می‌کند."
      },
      {
        "id": "phase_shift",
        "name": "لغزش میان‌جهان",
        "type": "defense",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 1,
        "description": "۲۵٪ کاهش آسیب دریافتی برای یک نوبت."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "بدن اثیری: نخستین مهارت جادویی دریافتی در هر سه نوبت ۸٪ تضعیف می‌شود."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "debuff_dangerous_enemy",
        "self_preserve_low_hp",
        "prefer_magic_target"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "uncommon",
      "itemId": "companion_evolution_common_to_uncommon",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "jiangshi",
    "name": "جیانگ‌شی",
    "nameEn": "Jiangshi",
    "rank": "common",
    "levelMin": 1,
    "levelMax": 100,
    "role": "تانک / ضربه‌زن نزدیک",
    "lore": "موجود برگرفته از فولکلور چینی؛ جسد متحرکی که در روایت‌های عامیانه با جهش‌های خشک حرکت می‌کند.",
    "portrait": "assets/necromancer/companions/jiangshi.webp",
    "stats": {
      "power": 15,
      "speed": 6,
      "endurance": 16,
      "vitality": 15,
      "intellect": 5,
      "perception": 8,
      "luck": 14,
      "faith": 6
    },
    "growthPerLevel": {
      "power": 0.32,
      "speed": 0.08,
      "endurance": 0.34,
      "vitality": 0.34,
      "intellect": 0.08,
      "perception": 0.12,
      "luck": 0.28,
      "faith": 0.08
    },
    "skills": [
      {
        "id": "grave_hop",
        "name": "جهش گورستانی",
        "type": "physical",
        "target": "single",
        "powerPct": 135,
        "cooldownTurns": 0,
        "durationTurns": 0,
        "description": "ضربه سنگین نزدیک."
      },
      {
        "id": "cold_grip",
        "name": "چنگ سرد",
        "type": "physical_debuff",
        "target": "single",
        "powerPct": 100,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "آسیب و کاهش سرعت هدف به میزان ۱۲٪."
      },
      {
        "id": "stiffened_corpse",
        "name": "جسد خشکیده",
        "type": "defense",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "کاهش ۲۲٪ آسیب دریافتی برای دو نوبت."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "بدن خشک: در برابر آسیب فیزیکی ۶٪ مقاوم‌تر است."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "protect_low_hp_ally",
        "use_defense_when_focused",
        "attack_nearest"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "uncommon",
      "itemId": "companion_evolution_common_to_uncommon",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "gaki",
    "name": "گاکی",
    "nameEn": "Gaki",
    "rank": "common",
    "levelMin": 1,
    "levelMax": 100,
    "role": "مکنده حیات / پشتیبان",
    "lore": "برگرفته از گاکی، ارواح گرسنه در سنت بودایی ژاپن.",
    "portrait": "assets/necromancer/companions/gaki.webp",
    "stats": {
      "power": 7,
      "speed": 10,
      "endurance": 9,
      "vitality": 12,
      "intellect": 13,
      "perception": 9,
      "luck": 10,
      "faith": 14
    },
    "growthPerLevel": {
      "power": 0.12,
      "speed": 0.16,
      "endurance": 0.18,
      "vitality": 0.22,
      "intellect": 0.28,
      "perception": 0.14,
      "luck": 0.18,
      "faith": 0.3
    },
    "skills": [
      {
        "id": "hungry_bite",
        "name": "گاز گرسنگی",
        "type": "physical_leech",
        "target": "single",
        "powerPct": 95,
        "cooldownTurns": 0,
        "durationTurns": 0,
        "description": "۱۵٪ آسیب واردشده را به HP خود تبدیل می‌کند."
      },
      {
        "id": "starvation_mark",
        "name": "نشان گرسنگی",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "درمان دریافتی هدف را ۲۰٪ برای دو نوبت کم می‌کند."
      },
      {
        "id": "essence_sip",
        "name": "مکیدن جوهر",
        "type": "magic_leech",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "آسیب جادویی؛ اگر خود یا همراهی زیر ۵۰٪ HP باشد ۱۰٪ آسیب به‌صورت درمان تقسیم می‌شود."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "اشتهای مردگان: وقتی HP خودش زیر ۴۰٪ است، جذب حیات ۵٪ بیشتر می‌شود."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "heal_self_or_ally_low",
        "mark_healer",
        "attack_wounded"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "uncommon",
      "itemId": "companion_evolution_common_to_uncommon",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "bog_wraith",
    "name": "روح مرداب",
    "nameEn": "Bog Wraith",
    "rank": "common",
    "levelMin": 1,
    "levelMax": 100,
    "role": "کنترل گروهی / جادویی",
    "lore": "بازآفرینی فانتزی با الهام از افسانه‌ها و باورهای محلی درباره مرداب‌های تسخیرشده.",
    "portrait": "assets/necromancer/companions/bog_wraith.webp",
    "stats": {
      "power": 6,
      "speed": 8,
      "endurance": 12,
      "vitality": 11,
      "intellect": 13,
      "perception": 9,
      "luck": 12,
      "faith": 11
    },
    "growthPerLevel": {
      "power": 0.1,
      "speed": 0.12,
      "endurance": 0.24,
      "vitality": 0.2,
      "intellect": 0.28,
      "perception": 0.14,
      "luck": 0.22,
      "faith": 0.18
    },
    "skills": [
      {
        "id": "peat_bolt",
        "name": "گلوله باتلاق",
        "type": "magic",
        "target": "single",
        "powerPct": 115,
        "cooldownTurns": 0,
        "durationTurns": 0,
        "description": "آسیب جادویی."
      },
      {
        "id": "sinking_mist",
        "name": "مه فرورونده",
        "type": "aoe_debuff",
        "target": "all_enemies",
        "powerPct": 65,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "آسیب کم به همه دشمنان و کاهش سرعت ۱۰٪ برای دو نوبت."
      },
      {
        "id": "root_snare",
        "name": "ریشه‌گیری",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 1,
        "description": "سرعت هدف را ۲۵٪ برای یک نوبت کاهش می‌دهد؛ روی باس فقط ۸٪ کاهش سرعت."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "پوست خزه‌ای: اثر کاهش سرعت روی این موجود ۲۰٪ ضعیف‌تر است."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "control_fast_enemy",
        "aoe_when_three_enemies",
        "keep_distance_role"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "uncommon",
      "itemId": "companion_evolution_common_to_uncommon",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "draugr",
    "name": "دراوگر",
    "nameEn": "Draugr",
    "rank": "common",
    "levelMin": 1,
    "levelMax": 100,
    "role": "تانک سنگین",
    "lore": "برگرفته از دراوگر در حماسه‌ها و فولکلور نورس؛ مرده‌ای نیرومند که گور خود را ترک می‌کند.",
    "portrait": "assets/necromancer/companions/draugr.webp",
    "stats": {
      "power": 16,
      "speed": 5,
      "endurance": 17,
      "vitality": 16,
      "intellect": 5,
      "perception": 7,
      "luck": 16,
      "faith": 6
    },
    "growthPerLevel": {
      "power": 0.34,
      "speed": 0.06,
      "endurance": 0.36,
      "vitality": 0.34,
      "intellect": 0.08,
      "perception": 0.1,
      "luck": 0.32,
      "faith": 0.08
    },
    "skills": [
      {
        "id": "barrow_fist",
        "name": "مشت گور",
        "type": "physical",
        "target": "single",
        "powerPct": 140,
        "cooldownTurns": 0,
        "durationTurns": 0,
        "description": "ضربه فیزیکی سنگین."
      },
      {
        "id": "grave_hide",
        "name": "پوست گور",
        "type": "defense",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "۲۸٪ کاهش آسیب دریافتی برای دو نوبت."
      },
      {
        "id": "buried_rage",
        "name": "خشم مدفون",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "اگر HP زیر ۴۰٪ باشد، قدرت حمله ۲۰٪ برای دو نوبت افزایش می‌یابد."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "پایداری گور: وقتی HP بالای ۷۰٪ است ۸٪ کاهش آسیب دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "taunt_if_ally_threatened",
        "defend_when_focused",
        "rage_below_40"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "uncommon",
      "itemId": "companion_evolution_common_to_uncommon",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "graveyard_div",
    "name": "دیو گورستان",
    "nameEn": "Graveyard Div",
    "rank": "common",
    "levelMin": 1,
    "levelMax": 100,
    "role": "مهاجم / شکننده دفاع",
    "lore": "بازآفرینی اختصاصی ETRANOM با الهام از دیوان اساطیر ایرانی؛ نام گونه، نام تاریخی ثبت‌شده در متون کهن نیست.",
    "portrait": "assets/necromancer/companions/graveyard_div.webp",
    "stats": {
      "power": 14,
      "speed": 11,
      "endurance": 11,
      "vitality": 11,
      "intellect": 8,
      "perception": 12,
      "luck": 13,
      "faith": 8
    },
    "growthPerLevel": {
      "power": 0.3,
      "speed": 0.22,
      "endurance": 0.22,
      "vitality": 0.22,
      "intellect": 0.14,
      "perception": 0.22,
      "luck": 0.24,
      "faith": 0.12
    },
    "skills": [
      {
        "id": "horn_rush",
        "name": "یورش شاخ",
        "type": "physical",
        "target": "single",
        "powerPct": 130,
        "cooldownTurns": 0,
        "durationTurns": 0,
        "description": "ضربه فیزیکی."
      },
      {
        "id": "grave_scratch",
        "name": "خراش گور",
        "type": "physical_debuff",
        "target": "single",
        "powerPct": 95,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "کاهش دفاع هدف ۱۲٪ برای دو نوبت."
      },
      {
        "id": "dread_roar",
        "name": "غرش هراس",
        "type": "aoe_debuff",
        "target": "all_enemies",
        "powerPct": 45,
        "cooldownTurns": 5,
        "durationTurns": 1,
        "description": "کاهش قدرت حمله همه دشمنان ۸٪ برای یک نوبت."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "خوی دیوانه: اگر دشمنی سپر فعال داشته باشد، ضربه شاخ ۱۰٪ مؤثرتر است."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "break_shielded_target",
        "debuff_many_enemies",
        "attack_low_defense"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "uncommon",
      "itemId": "companion_evolution_common_to_uncommon",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "ghoul",
    "name": "غول‌مرده",
    "nameEn": "Ghoul",
    "rank": "common",
    "levelMin": 1,
    "levelMax": 100,
    "role": "مهاجم / بازیابی",
    "lore": "برگرفته از غول در روایت‌های عامیانه عربی و خاورمیانه؛ شکارچی گورستان‌ها و ویرانه‌ها.",
    "portrait": "assets/necromancer/companions/ghoul.webp",
    "stats": {
      "power": 13,
      "speed": 12,
      "endurance": 11,
      "vitality": 12,
      "intellect": 7,
      "perception": 13,
      "luck": 9,
      "faith": 8
    },
    "growthPerLevel": {
      "power": 0.28,
      "speed": 0.22,
      "endurance": 0.22,
      "vitality": 0.24,
      "intellect": 0.12,
      "perception": 0.24,
      "luck": 0.16,
      "faith": 0.12
    },
    "skills": [
      {
        "id": "grave_claw",
        "name": "چنگال گور",
        "type": "physical",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 0,
        "durationTurns": 0,
        "description": "ضربه فیزیکی."
      },
      {
        "id": "corpse_feast",
        "name": "ضیافت جسد",
        "type": "physical_leech",
        "target": "single",
        "powerPct": 105,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "۲۰٪ آسیب واردشده را به HP خود تبدیل می‌کند."
      },
      {
        "id": "predator_frenzy",
        "name": "جنون شکارچی",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "قدرت حمله ۱۵٪ برای دو نوبت افزایش می‌یابد."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "لاشه‌خوار: پس از کشتن دشمن ۶٪ HP خود را بازیابی می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "execute_low_hp",
        "self_heal_low_hp",
        "focus_weakest_enemy"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "uncommon",
      "itemId": "companion_evolution_common_to_uncommon",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "shadow_wight",
    "name": "سایه‌مرده",
    "nameEn": "Shadow Wight",
    "rank": "common",
    "levelMin": 1,
    "levelMax": 100,
    "role": "قاتل / تک‌هدف",
    "lore": "بازآفرینی فانتزی با الهام از مردگان بازگشته و موجودات سایه‌وار در داستان‌های اروپایی.",
    "portrait": "assets/necromancer/companions/shadow_wight.webp",
    "stats": {
      "power": 9,
      "speed": 16,
      "endurance": 8,
      "vitality": 9,
      "intellect": 11,
      "perception": 16,
      "luck": 9,
      "faith": 10
    },
    "growthPerLevel": {
      "power": 0.16,
      "speed": 0.34,
      "endurance": 0.16,
      "vitality": 0.18,
      "intellect": 0.22,
      "perception": 0.34,
      "luck": 0.16,
      "faith": 0.16
    },
    "skills": [
      {
        "id": "shade_cut",
        "name": "برش سایه",
        "type": "physical",
        "target": "single",
        "powerPct": 130,
        "cooldownTurns": 0,
        "durationTurns": 0,
        "description": "ضربه دقیق."
      },
      {
        "id": "fade",
        "name": "محو شدن",
        "type": "defense",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 1,
        "description": "افزایش جاخالی به میزان ۲۵٪ برای یک نوبت."
      },
      {
        "id": "backstab",
        "name": "ضربه از پس",
        "type": "physical",
        "target": "single",
        "powerPct": 175,
        "cooldownTurns": 5,
        "durationTurns": 0,
        "description": "اگر در نوبت قبل هدف به این موجود حمله نکرده باشد، ۲۰٪ آسیب بیشتر."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "شکارچی تاریکی: ضربه بحرانی ۱۰٪ آسیب اضافه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "avoid_recent_attacker",
        "execute_low_hp",
        "prioritize_backline"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "uncommon",
      "itemId": "companion_evolution_common_to_uncommon",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "lesser_banshee",
    "name": "بانشی ضعیف",
    "nameEn": "Lesser Banshee",
    "rank": "common",
    "levelMin": 1,
    "levelMax": 100,
    "role": "کنترل / جادوی گروهی",
    "lore": "بانشی از فولکلور ایرلند؛ این نسخه ضعیف، بازآفرینی بازی از روحی با فریاد هشداردهنده است.",
    "portrait": "assets/necromancer/companions/lesser_banshee.webp",
    "stats": {
      "power": 3,
      "speed": 12,
      "endurance": 7,
      "vitality": 8,
      "intellect": 15,
      "perception": 11,
      "luck": 13,
      "faith": 14
    },
    "growthPerLevel": {
      "power": 0.04,
      "speed": 0.22,
      "endurance": 0.14,
      "vitality": 0.18,
      "intellect": 0.34,
      "perception": 0.18,
      "luck": 0.26,
      "faith": 0.28
    },
    "skills": [
      {
        "id": "keening_scream",
        "name": "فریاد سوگ",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 90,
        "cooldownTurns": 0,
        "durationTurns": 0,
        "description": "آسیب جادویی سبک به همه دشمنان."
      },
      {
        "id": "terror_wail",
        "name": "ناله وحشت",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 1,
        "description": "احتمال ۳۰٪ کاهش دقت هدف برای یک نوبت؛ باس‌ها فقط ۱۰٪ کاهش دقت می‌گیرند."
      },
      {
        "id": "echo_of_grief",
        "name": "پژواک اندوه",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "قدرت مهارت هدف ۱۲٪ برای دو نوبت کاهش می‌یابد."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "آوای مرگ: نخستین مهارت کنترل در هر نبرد ۱۰٪ شانس اثر بیشتر دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "silence_skill_user",
        "aoe_when_multiple",
        "control_high_damage_enemy"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "uncommon",
      "itemId": "companion_evolution_common_to_uncommon",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "nuckelavee_spawn",
    "name": "نوکل‌اوی جوان",
    "nameEn": "Nuckelavee Spawn",
    "rank": "common",
    "levelMin": 1,
    "levelMax": 100,
    "role": "مهاجم / آلودگی",
    "lore": "گونه جوان بازآفرینی‌شده از نوکل‌اوی فولکلور اورکنی؛ موجود اصلی در افسانه‌ها اهریمنی و اسب‌مانند است.",
    "portrait": "assets/necromancer/companions/nuckelavee_spawn.webp",
    "stats": {
      "power": 15,
      "speed": 9,
      "endurance": 14,
      "vitality": 14,
      "intellect": 7,
      "perception": 10,
      "luck": 13,
      "faith": 7
    },
    "growthPerLevel": {
      "power": 0.32,
      "speed": 0.16,
      "endurance": 0.3,
      "vitality": 0.28,
      "intellect": 0.12,
      "perception": 0.18,
      "luck": 0.24,
      "faith": 0.1
    },
    "skills": [
      {
        "id": "dread_kick",
        "name": "لگد هراس",
        "type": "physical",
        "target": "single",
        "powerPct": 135,
        "cooldownTurns": 0,
        "durationTurns": 0,
        "description": "ضربه سنگین."
      },
      {
        "id": "blight_breath",
        "name": "نفس تباه",
        "type": "dot_aoe",
        "target": "all_enemies",
        "powerPct": 55,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "آسیب آغازین و اثر تباهی ۲ نوبتی."
      },
      {
        "id": "tainted_hide",
        "name": "پوست آلوده",
        "type": "defense",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش ۱۸٪ آسیب دریافتی برای دو نوبت."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "آلودگی: دشمنی که این موجود به آن ضربه می‌زند، ۵٪ درمان کمتری دریافت می‌کند برای یک نوبت."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "aoe_when_multiple",
        "defend_when_low_hp",
        "target_unhealed_enemy"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "uncommon",
      "itemId": "companion_evolution_common_to_uncommon",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "grave_spirit",
    "name": "روح گور",
    "nameEn": "Grave Spirit",
    "rank": "common",
    "levelMin": 1,
    "levelMax": 100,
    "role": "پشتیبان / محافظ",
    "lore": "بازآفرینی فانتزی با الهام از باورهای محلی درباره ارواح نگهبان آرامگاه‌ها.",
    "portrait": "assets/necromancer/companions/grave_spirit.webp",
    "stats": {
      "power": 5,
      "speed": 9,
      "endurance": 12,
      "vitality": 13,
      "intellect": 13,
      "perception": 10,
      "luck": 15,
      "faith": 15
    },
    "growthPerLevel": {
      "power": 0.08,
      "speed": 0.14,
      "endurance": 0.24,
      "vitality": 0.26,
      "intellect": 0.26,
      "perception": 0.16,
      "luck": 0.3,
      "faith": 0.3
    },
    "skills": [
      {
        "id": "chain_tug",
        "name": "کشیدن زنجیر",
        "type": "magic",
        "target": "single",
        "powerPct": 95,
        "cooldownTurns": 0,
        "durationTurns": 0,
        "description": "آسیب روحی."
      },
      {
        "id": "warden_shroud",
        "name": "پرده نگهبان",
        "type": "shield",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "به کم‌سلامت‌ترین همراه سپری برابر ۱۴٪ HP بیشینه خود می‌دهد."
      },
      {
        "id": "grave_blessing",
        "name": "دعای آرامگاه",
        "type": "heal",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 0,
        "description": "درمان کم‌مقدار بر پایه ایمان؛ اولویت با همراه زیر ۵۰٪ HP."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "نگهبان آرامگاه: سپرهای ایجادشده توسط این موجود ۱۰٪ قوی‌ترند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "shield_lowest_ally",
        "heal_ally_below_50",
        "attack_only_if_no_support_need"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "uncommon",
      "itemId": "companion_evolution_common_to_uncommon",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "skeleton_archer",
    "name": "کماندار استخوانی",
    "nameEn": "Skeleton Archer",
    "rank": "common",
    "levelMin": 1,
    "levelMax": 100,
    "role": "دوربرد / تک‌هدف",
    "lore": "بازآفرینی فانتزی از تیراندازان اسکلت در داستان‌های گوتیک اروپایی.",
    "portrait": "assets/necromancer/companions/skeleton_archer.webp",
    "stats": {
      "power": 8,
      "speed": 13,
      "endurance": 9,
      "vitality": 10,
      "intellect": 6,
      "perception": 17,
      "luck": 10,
      "faith": 8
    },
    "growthPerLevel": {
      "power": 0.14,
      "speed": 0.26,
      "endurance": 0.18,
      "vitality": 0.2,
      "intellect": 0.1,
      "perception": 0.36,
      "luck": 0.18,
      "faith": 0.12
    },
    "skills": [
      {
        "id": "bone_arrow",
        "name": "تیر استخوانی",
        "type": "physical",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 0,
        "durationTurns": 0,
        "description": "تیر دقیق تک‌هدف."
      },
      {
        "id": "piercing_shot",
        "name": "تیر شکافنده",
        "type": "physical_multi",
        "target": "two_enemies",
        "powerPct": 85,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "به دو دشمن آسیب می‌زند."
      },
      {
        "id": "steady_aim",
        "name": "نشانه‌گیری آرام",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 1,
        "description": "دقت و شانس بحرانی ضربه بعدی افزایش می‌یابد؛ ۱۸٪ دقت و ۸٪ بحرانی."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "تیرانداز ثابت‌قدم: اگر در نوبت قبل آسیب ندیده باشد، اولین تیر ۸٪ آسیب بیشتر دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "target_low_hp",
        "pierce_two_if_both_dangerous",
        "avoid_attacking_tank_if_backline"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "uncommon",
      "itemId": "companion_evolution_common_to_uncommon",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "death_watcher",
    "name": "نگهبان مرگ",
    "nameEn": "Death Watcher",
    "rank": "common",
    "levelMin": 1,
    "levelMax": 100,
    "role": "تانک / محافظ",
    "lore": "بازآفرینی فانتزی از نگهبانان مردگان در قصه‌های اروپایی؛ نه یک نام واحد در اساطیر تاریخی.",
    "portrait": "assets/necromancer/companions/death_watcher.webp",
    "stats": {
      "power": 12,
      "speed": 6,
      "endurance": 16,
      "vitality": 15,
      "intellect": 9,
      "perception": 9,
      "luck": 16,
      "faith": 11
    },
    "growthPerLevel": {
      "power": 0.24,
      "speed": 0.08,
      "endurance": 0.34,
      "vitality": 0.3,
      "intellect": 0.16,
      "perception": 0.14,
      "luck": 0.32,
      "faith": 0.2
    },
    "skills": [
      {
        "id": "watcher_strike",
        "name": "ضربه نگهبان",
        "type": "physical",
        "target": "single",
        "powerPct": 115,
        "cooldownTurns": 0,
        "durationTurns": 0,
        "description": "ضربه فیزیکی."
      },
      {
        "id": "interpose",
        "name": "میان‌گذاری",
        "type": "guard",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 1,
        "description": "بخشی از ضربه بعدی وارد بر کم‌سلامت‌ترین همراه را به خود منتقل می‌کند."
      },
      {
        "id": "blackward",
        "name": "پناه سیاه",
        "type": "shield",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "سپر برابر ۱۸٪ HP بیشینه خود برای دو نوبت."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "سوگند نگهبان: وقتی همراهی زیر ۳۵٪ HP باشد، دفاع این موجود ۱۲٪ افزایش می‌یابد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "guard_lowest_ally",
        "shield_when_focused",
        "attack_after_protecting"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "uncommon",
      "itemId": "companion_evolution_common_to_uncommon",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "will_o_wisp",
    "name": "شعله سرگردان",
    "nameEn": "Will-o’-the-Wisp",
    "rank": "common",
    "levelMin": 1,
    "levelMax": 100,
    "role": "جادویی / فریب",
    "lore": "برگرفته از شعله‌های سرگردان در فولکلور اروپایی که مسافران را گمراه می‌کنند.",
    "portrait": "assets/necromancer/companions/will_o_wisp.webp",
    "stats": {
      "power": 3,
      "speed": 17,
      "endurance": 7,
      "vitality": 9,
      "intellect": 15,
      "perception": 14,
      "luck": 11,
      "faith": 13
    },
    "growthPerLevel": {
      "power": 0.04,
      "speed": 0.36,
      "endurance": 0.14,
      "vitality": 0.18,
      "intellect": 0.34,
      "perception": 0.26,
      "luck": 0.18,
      "faith": 0.24
    },
    "skills": [
      {
        "id": "blueflame",
        "name": "شعله آبی",
        "type": "magic",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 0,
        "durationTurns": 0,
        "description": "آسیب جادویی."
      },
      {
        "id": "misleading_glow",
        "name": "نور گمراه‌کننده",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "دقت هدف ۱۵٪ برای دو نوبت کاهش می‌یابد."
      },
      {
        "id": "soulflare",
        "name": "فروغ روح",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 105,
        "cooldownTurns": 5,
        "durationTurns": 0,
        "description": "انفجار جادویی به همه دشمنان؛ اگر سه دشمن زنده باشند ۱۰٪ آسیب کمتر."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "جرقه لغزان: اولین حمله دشمن در هر نبرد ۱۰٪ احتمال خطا بیشتر دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "debuff_accurate_enemy",
        "aoe_when_three_enemies",
        "avoid_low_hp_exposure"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "uncommon",
      "itemId": "companion_evolution_common_to_uncommon",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "faceless_wraith",
    "name": "روح بی‌چهره",
    "nameEn": "Faceless Wraith",
    "rank": "common",
    "levelMin": 1,
    "levelMax": 100,
    "role": "اختلال‌گر / ضدجادو",
    "lore": "بازآفرینی فانتزی با الهام از ارواح بی‌چهره در ادبیات ترسناک؛ موجودی بی‌هویت و خاموش.",
    "portrait": "assets/necromancer/companions/faceless_wraith.webp",
    "stats": {
      "power": 5,
      "speed": 12,
      "endurance": 10,
      "vitality": 11,
      "intellect": 14,
      "perception": 13,
      "luck": 14,
      "faith": 12
    },
    "growthPerLevel": {
      "power": 0.08,
      "speed": 0.22,
      "endurance": 0.2,
      "vitality": 0.22,
      "intellect": 0.3,
      "perception": 0.24,
      "luck": 0.28,
      "faith": 0.22
    },
    "skills": [
      {
        "id": "nameless_touch",
        "name": "لمس بی‌نام",
        "type": "magic",
        "target": "single",
        "powerPct": 110,
        "cooldownTurns": 0,
        "durationTurns": 0,
        "description": "آسیب جادویی."
      },
      {
        "id": "hush",
        "name": "خاموشی",
        "type": "silence",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 1,
        "description": "مهارت بعدی هدف را برای یک نوبت قفل می‌کند؛ روی باس فقط ۲۰٪ کاهش قدرت مهارت."
      },
      {
        "id": "identity_drain",
        "name": "محو هویت",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "قدرت حمله هدف ۱۰٪ و دقت ۱۰٪ برای دو نوبت کاهش می‌یابد."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "بی‌هویتی: در برابر اثرات ترس و سکوت ۱۵٪ مقاومت دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "silence_skill_user",
        "debuff_boss_instead_of_lock",
        "target_highest_intellect"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "uncommon",
      "itemId": "companion_evolution_common_to_uncommon",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "lesser_mummy",
    "name": "مومیایی کوچک",
    "nameEn": "Lesser Mummy",
    "rank": "common",
    "levelMin": 1,
    "levelMax": 100,
    "role": "تانک / نفرین",
    "lore": "الهام از تدفین مصر باستان و روایت‌های متأخر درباره مومیایی‌های زنده؛ این گونه بازی تخیلی است.",
    "portrait": "assets/necromancer/companions/lesser_mummy.webp",
    "stats": {
      "power": 10,
      "speed": 5,
      "endurance": 16,
      "vitality": 15,
      "intellect": 9,
      "perception": 8,
      "luck": 15,
      "faith": 12
    },
    "growthPerLevel": {
      "power": 0.2,
      "speed": 0.06,
      "endurance": 0.34,
      "vitality": 0.32,
      "intellect": 0.16,
      "perception": 0.12,
      "luck": 0.3,
      "faith": 0.22
    },
    "skills": [
      {
        "id": "wrapped_claw",
        "name": "چنگال مومیایی",
        "type": "physical",
        "target": "single",
        "powerPct": 115,
        "cooldownTurns": 0,
        "durationTurns": 0,
        "description": "ضربه فیزیکی."
      },
      {
        "id": "binding_linen",
        "name": "پارچه بندآور",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 1,
        "description": "سرعت هدف ۲۰٪ کاهش می‌یابد؛ روی باس ۷٪."
      },
      {
        "id": "ancient_hex",
        "name": "نفرین باستانی",
        "type": "magic_debuff",
        "target": "single",
        "powerPct": 100,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "آسیب جادویی و کاهش دفاع ۱۰٪ برای دو نوبت."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "پارچه محافظ: نخستین اثر آسیب‌دور در هر نبرد ۱۰٪ کمتر اثر می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "control_fast_enemy",
        "hex_high_defense_enemy",
        "defend_when_low_hp"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "uncommon",
      "itemId": "companion_evolution_common_to_uncommon",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "kage_onryo",
    "name": "کاگه اونریو",
    "nameEn": "Kage Onryō",
    "rank": "common",
    "levelMin": 1,
    "levelMax": 100,
    "role": "قاتل جادویی / انتقام",
    "lore": "اونریو در فولکلور ژاپن روح انتقام‌جو است؛ «کاگه» و ترکیب گونه‌ای آن بازآفرینی اختصاصی ETRANOM است.",
    "portrait": "assets/necromancer/companions/kage_onryo.webp",
    "stats": {
      "power": 6,
      "speed": 16,
      "endurance": 8,
      "vitality": 10,
      "intellect": 15,
      "perception": 15,
      "luck": 13,
      "faith": 14
    },
    "growthPerLevel": {
      "power": 0.1,
      "speed": 0.34,
      "endurance": 0.16,
      "vitality": 0.2,
      "intellect": 0.32,
      "perception": 0.3,
      "luck": 0.24,
      "faith": 0.26
    },
    "skills": [
      {
        "id": "vengeful_claw",
        "name": "چنگال انتقام",
        "type": "hybrid",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 0,
        "durationTurns": 0,
        "description": "آسیب ترکیبی."
      },
      {
        "id": "grudge_mark",
        "name": "نشان کینه",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "هدف ۱۵٪ آسیب بیشتر از این موجود دریافت می‌کند برای دو نوبت."
      },
      {
        "id": "shadow_drift",
        "name": "لغزش سایه",
        "type": "defense",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 1,
        "description": "۳۰٪ احتمال جاخالی بیشتر برای یک نوبت."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "کینه بازتابی: اگر دشمنی به این موجود ضربه بزند، حمله بعدی این موجود به همان هدف ۸٪ قوی‌تر است."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "retaliate_recent_attacker",
        "mark_priority_target",
        "evade_when_targeted"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "uncommon",
      "itemId": "companion_evolution_common_to_uncommon",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "cursed_revenant",
    "name": "بازگشته نفرین‌شده",
    "nameEn": "Cursed Revenant",
    "rank": "common",
    "levelMin": 1,
    "levelMax": 100,
    "role": "مبارز متعادل",
    "lore": "الهام از revenant در روایت‌های اروپایی؛ مرده‌ای که برای اجرای انتقام بازمی‌گردد.",
    "portrait": "assets/necromancer/companions/cursed_revenant.webp",
    "stats": {
      "power": 14,
      "speed": 8,
      "endurance": 14,
      "vitality": 14,
      "intellect": 10,
      "perception": 11,
      "luck": 15,
      "faith": 10
    },
    "growthPerLevel": {
      "power": 0.28,
      "speed": 0.14,
      "endurance": 0.28,
      "vitality": 0.28,
      "intellect": 0.18,
      "perception": 0.18,
      "luck": 0.28,
      "faith": 0.16
    },
    "skills": [
      {
        "id": "cursed_blade",
        "name": "تیغه نفرین‌شده",
        "type": "physical",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 0,
        "durationTurns": 0,
        "description": "ضربه فیزیکی."
      },
      {
        "id": "unyielding_stance",
        "name": "ایستادگی بازگشته",
        "type": "defense",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "کاهش ۲۰٪ آسیب دریافتی برای دو نوبت."
      },
      {
        "id": "revenge_brand",
        "name": "داغ انتقام",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "هدف ۱۲٪ آسیب بیشتر از همه منابع دریافت می‌کند برای دو نوبت."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "بازگشت‌ناپذیر: زیر ۳۰٪ HP، استقامت مؤثر ۱۰٪ افزایش می‌یابد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "brand_highest_threat",
        "defend_below_45",
        "attack_marked_target"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "uncommon",
      "itemId": "companion_evolution_common_to_uncommon",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "forest_hungry_spirit",
    "name": "روح گرسنه جنگل",
    "nameEn": "Forest Hungry Spirit",
    "rank": "common",
    "levelMin": 1,
    "levelMax": 100,
    "role": "کنترل / جذب حیات",
    "lore": "بازآفرینی فانتزی با الهام از ارواح طبیعت و موجودات گرسنه در فولکلورهای جنگلی جهان.",
    "portrait": "assets/necromancer/companions/forest_hungry_spirit.webp",
    "stats": {
      "power": 8,
      "speed": 9,
      "endurance": 12,
      "vitality": 13,
      "intellect": 13,
      "perception": 10,
      "luck": 12,
      "faith": 14
    },
    "growthPerLevel": {
      "power": 0.14,
      "speed": 0.16,
      "endurance": 0.24,
      "vitality": 0.26,
      "intellect": 0.26,
      "perception": 0.18,
      "luck": 0.22,
      "faith": 0.28
    },
    "skills": [
      {
        "id": "thorn_root",
        "name": "ریشه خاردار",
        "type": "physical_debuff",
        "target": "single",
        "powerPct": 105,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "آسیب و زخم ریشه‌ای سبک برای دو نوبت."
      },
      {
        "id": "wild_grasp",
        "name": "چنگال وحشی",
        "type": "physical_multi",
        "target": "two_enemies",
        "powerPct": 90,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "به دو دشمن آسیب می‌زند."
      },
      {
        "id": "life_bloom",
        "name": "شکوفه حیات",
        "type": "heal",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 0,
        "description": "درمان کم‌مقدار همراه با کمترین HP؛ قدرت درمان با ایمان مقیاس می‌شود."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "ریشه‌خواری: با هر اثر آسیب دوره‌ای که اعمال می‌کند، ۳٪ HP خود را بازیابی می‌کند؛ حداکثر یک‌بار در هر نوبت."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "root_fast_enemy",
        "heal_lowest_ally",
        "multi_target_if_two_threats"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "uncommon",
      "itemId": "companion_evolution_common_to_uncommon",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  }
]);

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Number(n) || 0));
const clone = value => JSON.parse(JSON.stringify(value));

/** Materialize authored attributes at a companion level without changing rank. */
export function resolveNecromancerCompanionLevel(companionOrId, level = 1) {
  const source = typeof companionOrId === 'string'
    ? NECROMANCER_COMMON_COMPANIONS.find(x => x.id === companionOrId)
    : companionOrId;
  if (!source) return null;
  const lv = Math.floor(clamp(level, 1, 100));
  const stats = {};
  for (const key of NECROMANCER_COMPANION_ATTRIBUTE_KEYS) {
    const base = Number(source.stats?.[key]) || 0;
    const growth = Number(source.growthPerLevel?.[key]) || 0;
    stats[key] = Math.max(0, Math.floor(base + growth * (lv - 1)));
  }
  return { ...clone(source), level: lv, stats, rank: source.rank,
    progression: { currentLevel: lv, maxLevel: 100, nextRank: source.evolution.nextRank,
      rankChangesOnlyByEvolutionItem: true } };
}

/**
 * Select an AI intent from authored skills and current turn context.
 * The battle engine remains responsible for validating costs, applying effects,
 * resolving boss immunities, damage and cooldown bookkeeping.
 */
export function chooseNecromancerCompanionIntent(companionOrId, context = {}) {
  const source = typeof companionOrId === 'string'
    ? NECROMANCER_COMMON_COMPANIONS.find(x => x.id === companionOrId)
    : companionOrId;
  if (!source) return null;
  const skills = source.skills || [];
  const hpPct = clamp(context.selfHpPct ?? 100, 0, 100);
  const enemies = (context.enemies || []).filter(x => Number(x.hp ?? 1) > 0);
  const allies = (context.allies || []).filter(x => Number(x.hp ?? 1) > 0);
  const lowestAlly = [...allies].sort((a,b) => (Number(a.hp)/Math.max(1,Number(a.maxHp)||1))-(Number(b.hp)/Math.max(1,Number(b.maxHp)||1)))[0];
  const markedTarget = enemies.find(x => x.marked || x.wounded);
  const target = markedTarget || [...enemies].sort((a,b) => (Number(a.hp)/Math.max(1,Number(a.maxHp)||1))-(Number(b.hp)/Math.max(1,Number(b.maxHp)||1)))[0];
  const ready = skills.filter(s => Number(context.cooldowns?.[s.id] || 0) <= 0 &&
    (context.canUseSkill ? context.canUseSkill(s) !== false : true));
  const has = type => ready.find(s => s.type === type);
  let selected = null;
  // Explicit tactical states are evaluated before ordinary damage.
  if (lowestAlly && Number(lowestAlly.hp)/Math.max(1,Number(lowestAlly.maxHp)||1) <= .45) {
    selected = ready.find(s => ['heal','shield','guard'].includes(s.type) || s.target === 'lowest_hp_ally');
  }
  if (!selected && hpPct <= 35) selected = ready.find(s => ['defense','physical_leech','magic_leech'].includes(s.type));
  if (!selected && enemies.length >= 2) selected = ready.find(s => ['magic_aoe','aoe_debuff','dot_aoe','physical_multi'].includes(s.type));
  if (!selected && target) selected = ready.find(s => ['control','silence','debuff','physical_debuff','magic_debuff'].includes(s.type));
  if (!selected && target) selected = ready.find(s => ['physical','magic','hybrid','physical_leech','magic_leech'].includes(s.type));
  if (!selected) selected = ready.find(s => ['buff','defense','shield'].includes(s.type));
  if (!selected) return { action: 'basic_attack', skillId: null, targetId: target?.id ?? null, reason: 'no_authored_skill_ready' };
  const targetId = selected.target === 'self' ? (context.selfId ?? null)
    : selected.target === 'lowest_hp_ally' ? (lowestAlly?.id ?? context.selfId ?? null)
    : ['all_enemies','two_enemies'].includes(selected.target) ? null : (target?.id ?? null);
  return { action: 'use_skill', skillId: selected.id, targetId,
    targetMode: selected.target, reason: 'authored_ai_priority', skill: clone(selected) };
}

export function getNecromancerCommonCompanion(id) {
  const item = NECROMANCER_COMMON_COMPANIONS.find(x => x.id === String(id));
  return item ? clone(item) : null;
}
