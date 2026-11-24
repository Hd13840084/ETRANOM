/** ETRANOM V1985 — 20 Uncommon Necromancer companions. */
import { NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel, chooseNecromancerCompanionIntent } from './necromancer-common-companions-v1995.js';
export { NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel, chooseNecromancerCompanionIntent };
export const NECROMANCER_UNCOMMON_COMPANIONS = Object.freeze([
  {
    "id": "grave_knight",
    "name": "شوالیه گور",
    "nameEn": "Grave Knight",
    "rank": "uncommon",
    "levelMin": 1,
    "levelMax": 100,
    "role": "تانک / ضدحمله",
    "lore": "نگهبان زره‌پوش آرامگاه‌های فراموش‌شده در افسانه‌پردازی گوتیک اروپایی.",
    "portrait": "assets/necromancer/companions/uncommon/grave_knight.webp",
    "stats": {
      "power": 16,
      "speed": 7,
      "endurance": 17,
      "vitality": 16,
      "intellect": 7,
      "perception": 10,
      "luck": 7,
      "faith": 13
    },
    "growthPerLevel": {
      "power": 0.29,
      "speed": 0.13,
      "endurance": 0.37,
      "vitality": 0.35,
      "intellect": 0.13,
      "perception": 0.18,
      "luck": 0.13,
      "faith": 0.23
    },
    "skills": [
      {
        "id": "grave_knight_1",
        "name": "دفاع سپرگور",
        "type": "guard",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "دفاع سپرگور؛ کاهش ۲۸٪ آسیب برای ۲ نوبت."
      },
      {
        "id": "grave_knight_2",
        "name": "پاسخ فولادی",
        "type": "physical",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "پاسخ فولادی؛ ضربه مستقیم با ۱۲۵٪ قدرت به مهاجم منتخب."
      },
      {
        "id": "grave_knight_3",
        "name": "فریاد مقبره",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "فریاد مقبره؛ کاهش ۱۲٪ قدرت حمله دشمن برای ۲ نوبت."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "استعداد رده غیرمعمول: تانک / ضدحمله؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "protect_low_hp_ally",
        "self_preserve_low_hp",
        "use_ready_role_skill",
        "avoid_overkill"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "rare",
      "itemId": "companion_evolution_uncommon_to_rare",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "ashen_warden",
    "name": "نگهبان خاکستر",
    "nameEn": "Ashen Warden",
    "rank": "uncommon",
    "levelMin": 1,
    "levelMax": 100,
    "role": "تانک / پشتیبان",
    "lore": "نگهبان آتشکده‌ای سوخته؛ بازآفرینی فانتزی با الهام از ارواح نگهبان آتش.",
    "portrait": "assets/necromancer/companions/uncommon/ashen_warden.webp",
    "stats": {
      "power": 12,
      "speed": 8,
      "endurance": 16,
      "vitality": 17,
      "intellect": 9,
      "perception": 10,
      "luck": 8,
      "faith": 15
    },
    "growthPerLevel": {
      "power": 0.22,
      "speed": 0.14,
      "endurance": 0.35,
      "vitality": 0.37,
      "intellect": 0.16,
      "perception": 0.18,
      "luck": 0.14,
      "faith": 0.27
    },
    "skills": [
      {
        "id": "ashen_warden_1",
        "name": "پرده خاکستر",
        "type": "shield",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "پرده خاکستر؛ سپر برابر ۱۸٪ HP بیشینه برای خود و ضعیف‌ترین همراه."
      },
      {
        "id": "ashen_warden_2",
        "name": "خاکستر خفه‌کن",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "خاکستر خفه‌کن؛ کاهش ۱۲٪ قدرت حمله همه دشمنان برای ۲ نوبت."
      },
      {
        "id": "ashen_warden_3",
        "name": "جرقه بازمانده",
        "type": "heal",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "جرقه بازمانده؛ درمان ۱۴٪ HP بیشینه یک همراه."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "استعداد رده غیرمعمول: تانک / پشتیبان؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "shield_team",
        "self_preserve_low_hp",
        "use_ready_role_skill",
        "avoid_overkill"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "rare",
      "itemId": "companion_evolution_uncommon_to_rare",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "lantern_wraith",
    "name": "روح فانوس",
    "nameEn": "Lantern Wraith",
    "rank": "uncommon",
    "levelMin": 1,
    "levelMax": 100,
    "role": "جادویی / کنترل",
    "lore": "روح راهنمای گمراه‌کننده با الهام از چراغ‌های سرگردان فولکلور شرق آسیا و اروپا.",
    "portrait": "assets/necromancer/companions/uncommon/lantern_wraith.webp",
    "stats": {
      "power": 5,
      "speed": 14,
      "endurance": 9,
      "vitality": 11,
      "intellect": 17,
      "perception": 14,
      "luck": 12,
      "faith": 13
    },
    "growthPerLevel": {
      "power": 0.09,
      "speed": 0.25,
      "endurance": 0.16,
      "vitality": 0.2,
      "intellect": 0.31,
      "perception": 0.25,
      "luck": 0.22,
      "faith": 0.23
    },
    "skills": [
      {
        "id": "lantern_wraith_1",
        "name": "نور سرد",
        "type": "magic",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "نور سرد؛ آسیب جادویی ۱۲۵٪ به یک هدف."
      },
      {
        "id": "lantern_wraith_2",
        "name": "فانوس گمراهی",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "فانوس گمراهی؛ کاهش ۲۵٪ سرعت و دقت هدف برای ۲ نوبت."
      },
      {
        "id": "lantern_wraith_3",
        "name": "شعله راهنما",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 90,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "شعله راهنما؛ آسیب ۸۵٪ به همه دشمنان."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "استعداد رده غیرمعمول: جادویی / کنترل؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "disable_fast_enemy",
        "self_preserve_low_hp",
        "use_ready_role_skill",
        "avoid_overkill"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "rare",
      "itemId": "companion_evolution_uncommon_to_rare",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "bone_oracle",
    "name": "غیب‌گوی استخوان",
    "nameEn": "Bone Oracle",
    "rank": "uncommon",
    "levelMin": 1,
    "levelMax": 100,
    "role": "جادویی / تضعیف",
    "lore": "پیشگوی مردگان در بازآفرینی فانتزی با الهام از فال‌گیری استخوانی در فرهنگ‌های گوناگون.",
    "portrait": "assets/necromancer/companions/uncommon/bone_oracle.webp",
    "stats": {
      "power": 6,
      "speed": 9,
      "endurance": 10,
      "vitality": 12,
      "intellect": 18,
      "perception": 17,
      "luck": 11,
      "faith": 16
    },
    "growthPerLevel": {
      "power": 0.11,
      "speed": 0.16,
      "endurance": 0.18,
      "vitality": 0.22,
      "intellect": 0.32,
      "perception": 0.31,
      "luck": 0.2,
      "faith": 0.29
    },
    "skills": [
      {
        "id": "bone_oracle_1",
        "name": "خوانش سرنوشت",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "خوانش سرنوشت؛ کاهش ۱۵٪ دفاع یک دشمن برای ۲ نوبت."
      },
      {
        "id": "bone_oracle_2",
        "name": "نیزه استخوان",
        "type": "magic",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "نیزه استخوان؛ آسیب جادویی ۱۳۵٪."
      },
      {
        "id": "bone_oracle_3",
        "name": "پیش‌آگاهی",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "پیش‌آگاهی؛ افزایش ۱۲٪ دقت و شانس بحرانی همراهان برای ۲ نوبت."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "استعداد رده غیرمعمول: جادویی / تضعیف؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "debuff_elite",
        "self_preserve_low_hp",
        "use_ready_role_skill",
        "avoid_overkill"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "rare",
      "itemId": "companion_evolution_uncommon_to_rare",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "oni_revenant",
    "name": "اونی بازگشته",
    "nameEn": "Oni Revenant",
    "rank": "uncommon",
    "levelMin": 1,
    "levelMax": 100,
    "role": "مهاجم / شکننده دفاع",
    "lore": "بازگشته‌ای اهریمنی با الهام از اونی در فولکلور ژاپن؛ این گونه طراحی اختصاصی بازی است.",
    "portrait": "assets/necromancer/companions/uncommon/oni_revenant.webp",
    "stats": {
      "power": 18,
      "speed": 10,
      "endurance": 15,
      "vitality": 14,
      "intellect": 8,
      "perception": 11,
      "luck": 9,
      "faith": 12
    },
    "growthPerLevel": {
      "power": 0.32,
      "speed": 0.18,
      "endurance": 0.33,
      "vitality": 0.25,
      "intellect": 0.14,
      "perception": 0.2,
      "luck": 0.16,
      "faith": 0.22
    },
    "skills": [
      {
        "id": "oni_revenant_1",
        "name": "کوبش کانابو",
        "type": "physical",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "کوبش کانابو؛ آسیب ۱۵۰٪ به یک هدف."
      },
      {
        "id": "oni_revenant_2",
        "name": "شکستن زره",
        "type": "physical_debuff",
        "target": "single",
        "powerPct": 90,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "شکستن زره؛ آسیب ۱۰۰٪ و کاهش ۱۸٪ دفاع هدف برای ۲ نوبت."
      },
      {
        "id": "oni_revenant_3",
        "name": "خشم اونی",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "خشم اونی؛ افزایش ۲۰٪ قدرت برای ۲ نوبت."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "استعداد رده غیرمعمول: مهاجم / شکننده دفاع؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "break_high_defense",
        "self_preserve_low_hp",
        "use_ready_role_skill",
        "avoid_overkill"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "rare",
      "itemId": "companion_evolution_uncommon_to_rare",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "jiangshi_sentinel",
    "name": "نگهبان جیانگ‌شی",
    "nameEn": "Jiangshi Sentinel",
    "rank": "uncommon",
    "levelMin": 1,
    "levelMax": 100,
    "role": "تانک / ضدجادو",
    "lore": "گونه نگهبان جیانگ‌شی با طلسم‌های کاغذی؛ گسترش خیالی از فولکلور چینی.",
    "portrait": "assets/necromancer/companions/uncommon/jiangshi_sentinel.webp",
    "stats": {
      "power": 14,
      "speed": 7,
      "endurance": 18,
      "vitality": 17,
      "intellect": 8,
      "perception": 9,
      "luck": 10,
      "faith": 14
    },
    "growthPerLevel": {
      "power": 0.25,
      "speed": 0.13,
      "endurance": 0.38,
      "vitality": 0.37,
      "intellect": 0.14,
      "perception": 0.16,
      "luck": 0.18,
      "faith": 0.25
    },
    "skills": [
      {
        "id": "jiangshi_sentinel_1",
        "name": "مهر کاغذی",
        "type": "guard",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "مهر کاغذی؛ کاهش ۳۰٪ آسیب دریافتی برای ۲ نوبت."
      },
      {
        "id": "jiangshi_sentinel_2",
        "name": "جهش مدفون",
        "type": "physical",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "جهش مدفون؛ آسیب ۱۳۵٪."
      },
      {
        "id": "jiangshi_sentinel_3",
        "name": "نفس سرد",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "نفس سرد؛ کاهش ۱۵٪ هوش/قدرت جادویی هدف برای ۲ نوبت."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "استعداد رده غیرمعمول: تانک / ضدجادو؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "resist_magic_and_guard",
        "self_preserve_low_hp",
        "use_ready_role_skill",
        "avoid_overkill"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "rare",
      "itemId": "companion_evolution_uncommon_to_rare",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "carrion_brute",
    "name": "درنده لاشه‌خوار",
    "nameEn": "Carrion Brute",
    "rank": "uncommon",
    "levelMin": 1,
    "levelMax": 100,
    "role": "مهاجم / بازیابی",
    "lore": "موجودی لاشه‌خوار در بازآفرینی هیولایی با الهام از غول‌ها و مردارخواران فولکلور.",
    "portrait": "assets/necromancer/companions/uncommon/carrion_brute.webp",
    "stats": {
      "power": 17,
      "speed": 8,
      "endurance": 16,
      "vitality": 15,
      "intellect": 6,
      "perception": 10,
      "luck": 8,
      "faith": 8
    },
    "growthPerLevel": {
      "power": 0.31,
      "speed": 0.14,
      "endurance": 0.35,
      "vitality": 0.33,
      "intellect": 0.11,
      "perception": 0.18,
      "luck": 0.14,
      "faith": 0.14
    },
    "skills": [
      {
        "id": "carrion_brute_1",
        "name": "گاز لاشه",
        "type": "physical_leech",
        "target": "single",
        "powerPct": 110,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "گاز لاشه؛ آسیب ۱۳۰٪ و بازیابی ۱۵٪ آسیب واردشده."
      },
      {
        "id": "carrion_brute_2",
        "name": "چنگال شکافنده",
        "type": "physical",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "چنگال شکافنده؛ آسیب ۱۴۵٪."
      },
      {
        "id": "carrion_brute_3",
        "name": "جنون تغذیه",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "جنون تغذیه؛ افزایش ۱۵٪ قدرت برای ۲ نوبت پس از کشتن دشمن."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "استعداد رده غیرمعمول: مهاجم / بازیابی؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "finish_wounded_target",
        "self_preserve_low_hp",
        "use_ready_role_skill",
        "avoid_overkill"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "rare",
      "itemId": "companion_evolution_uncommon_to_rare",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "mourning_bride",
    "name": "عروس سوگوار",
    "nameEn": "Mourning Bride",
    "rank": "uncommon",
    "levelMin": 1,
    "levelMax": 100,
    "role": "جادویی / پشتیبان",
    "lore": "روح عروس داغدار؛ بازآفرینی فانتزی با الهام از افسانه‌های ارواح سوگوار اروپای شرقی.",
    "portrait": "assets/necromancer/companions/uncommon/mourning_bride.webp",
    "stats": {
      "power": 6,
      "speed": 12,
      "endurance": 10,
      "vitality": 13,
      "intellect": 16,
      "perception": 12,
      "luck": 10,
      "faith": 17
    },
    "growthPerLevel": {
      "power": 0.11,
      "speed": 0.22,
      "endurance": 0.18,
      "vitality": 0.23,
      "intellect": 0.29,
      "perception": 0.22,
      "luck": 0.18,
      "faith": 0.31
    },
    "skills": [
      {
        "id": "mourning_bride_1",
        "name": "مرثیه تسکین",
        "type": "heal",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "مرثیه تسکین؛ درمان ۲۰٪ HP بیشینه ضعیف‌ترین همراه."
      },
      {
        "id": "mourning_bride_2",
        "name": "اشک سیاه",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "اشک سیاه؛ کاهش ۱۵٪ قدرت حمله دشمن برای ۲ نوبت."
      },
      {
        "id": "mourning_bride_3",
        "name": "حلقه شکسته",
        "type": "magic",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "حلقه شکسته؛ آسیب جادویی ۱۱۵٪."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "استعداد رده غیرمعمول: جادویی / پشتیبان؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "heal_critical_ally",
        "self_preserve_low_hp",
        "use_ready_role_skill",
        "avoid_overkill"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "rare",
      "itemId": "companion_evolution_uncommon_to_rare",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "crimson_banshee",
    "name": "بانشی سرخ",
    "nameEn": "Crimson Banshee",
    "rank": "uncommon",
    "levelMin": 1,
    "levelMax": 100,
    "role": "جادویی / چندهدف",
    "lore": "گونه‌ای جنگاور از بانشی ایرلندی؛ رنگ سرخ و مهارت‌های رزمی ساخته بازی هستند.",
    "portrait": "assets/necromancer/companions/uncommon/crimson_banshee.webp",
    "stats": {
      "power": 7,
      "speed": 13,
      "endurance": 9,
      "vitality": 11,
      "intellect": 18,
      "perception": 13,
      "luck": 12,
      "faith": 16
    },
    "growthPerLevel": {
      "power": 0.13,
      "speed": 0.23,
      "endurance": 0.16,
      "vitality": 0.2,
      "intellect": 0.32,
      "perception": 0.23,
      "luck": 0.22,
      "faith": 0.29
    },
    "skills": [
      {
        "id": "crimson_banshee_1",
        "name": "جیغ سرخ",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 90,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "جیغ سرخ؛ آسیب جادویی ۹۵٪ به همه دشمنان."
      },
      {
        "id": "crimson_banshee_2",
        "name": "ناله خونین",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "ناله خونین؛ کاهش ۱۲٪ دقت همه دشمنان برای ۲ نوبت."
      },
      {
        "id": "crimson_banshee_3",
        "name": "پرتاب پژواک",
        "type": "magic",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "پرتاب پژواک؛ آسیب جادویی ۱۴۰٪ به یک هدف."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "استعداد رده غیرمعمول: جادویی / چندهدف؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "aoe_when_many_enemies",
        "self_preserve_low_hp",
        "use_ready_role_skill",
        "avoid_overkill"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "rare",
      "itemId": "companion_evolution_uncommon_to_rare",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "ember_hound",
    "name": "سگ شکاری اخگر",
    "nameEn": "Ember Hound",
    "rank": "uncommon",
    "levelMin": 1,
    "levelMax": 100,
    "role": "مهاجم سریع / آتشین",
    "lore": "سگ نگهبان آتشین؛ بازآفرینی فانتزی با الهام از سگ‌های ماورایی نگهبان جهان زیرین.",
    "portrait": "assets/necromancer/companions/uncommon/ember_hound.webp",
    "stats": {
      "power": 13,
      "speed": 17,
      "endurance": 10,
      "vitality": 12,
      "intellect": 11,
      "perception": 16,
      "luck": 13,
      "faith": 8
    },
    "growthPerLevel": {
      "power": 0.23,
      "speed": 0.31,
      "endurance": 0.18,
      "vitality": 0.22,
      "intellect": 0.2,
      "perception": 0.29,
      "luck": 0.23,
      "faith": 0.14
    },
    "skills": [
      {
        "id": "ember_hound_1",
        "name": "گاز اخگری",
        "type": "physical",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "گاز اخگری؛ آسیب ۱۲۵٪ و اثر سوختگی سبک."
      },
      {
        "id": "ember_hound_2",
        "name": "یورش شعله‌ور",
        "type": "physical_multi",
        "target": "two_enemies",
        "powerPct": 90,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "یورش شعله‌ور؛ آسیب ۹۰٪ به دو دشمن."
      },
      {
        "id": "ember_hound_3",
        "name": "رد اخگر",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "رد اخگر؛ افزایش ۱۸٪ سرعت برای ۲ نوبت."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "استعداد رده غیرمعمول: مهاجم سریع / آتشین؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "attack_lowest_hp",
        "self_preserve_low_hp",
        "use_ready_role_skill",
        "avoid_overkill"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "rare",
      "itemId": "companion_evolution_uncommon_to_rare",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "tomb_reaver",
    "name": "غارتگر مقبره",
    "nameEn": "Tomb Reaver",
    "rank": "uncommon",
    "levelMin": 1,
    "levelMax": 100,
    "role": "قاتل / نفوذگر",
    "lore": "مرده‌ای غارتگر با الهام از نگهبانان نفرین‌شده گورها در افسانه‌پردازی مصر و خاورمیانه.",
    "portrait": "assets/necromancer/companions/uncommon/tomb_reaver.webp",
    "stats": {
      "power": 14,
      "speed": 16,
      "endurance": 11,
      "vitality": 11,
      "intellect": 8,
      "perception": 17,
      "luck": 12,
      "faith": 9
    },
    "growthPerLevel": {
      "power": 0.25,
      "speed": 0.29,
      "endurance": 0.2,
      "vitality": 0.2,
      "intellect": 0.14,
      "perception": 0.31,
      "luck": 0.22,
      "faith": 0.16
    },
    "skills": [
      {
        "id": "tomb_reaver_1",
        "name": "خنجر تدفین",
        "type": "physical",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "خنجر تدفین؛ آسیب ۱۳۵٪."
      },
      {
        "id": "tomb_reaver_2",
        "name": "زخم عمیق",
        "type": "physical_debuff",
        "target": "single",
        "powerPct": 90,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "زخم عمیق؛ آسیب ۹۰٪ و کاهش ۱۲٪ دفاع برای ۲ نوبت."
      },
      {
        "id": "tomb_reaver_3",
        "name": "گام بی‌صدا",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "گام بی‌صدا؛ افزایش ۲۰٪ جاخالی برای یک نوبت."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "استعداد رده غیرمعمول: قاتل / نفوذگر؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "target_backline",
        "self_preserve_low_hp",
        "use_ready_role_skill",
        "avoid_overkill"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "rare",
      "itemId": "companion_evolution_uncommon_to_rare",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "frost_necromancer",
    "name": "نکرومنسر یخی",
    "nameEn": "Frost Necromancer",
    "rank": "uncommon",
    "levelMin": 1,
    "levelMax": 100,
    "role": "جادویی / کنترل گروهی",
    "lore": "جادوگر مرده‌ای از سرزمین‌های سرد؛ بازآفرینی فانتزی با الهام از جادوگران زمستانی شمال اروپا.",
    "portrait": "assets/necromancer/companions/uncommon/frost_necromancer.webp",
    "stats": {
      "power": 5,
      "speed": 10,
      "endurance": 11,
      "vitality": 12,
      "intellect": 19,
      "perception": 14,
      "luck": 9,
      "faith": 16
    },
    "growthPerLevel": {
      "power": 0.09,
      "speed": 0.18,
      "endurance": 0.2,
      "vitality": 0.22,
      "intellect": 0.34,
      "perception": 0.25,
      "luck": 0.16,
      "faith": 0.29
    },
    "skills": [
      {
        "id": "frost_necromancer_1",
        "name": "تگرگ استخوان",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 90,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "تگرگ استخوان؛ آسیب ۸۵٪ به همه دشمنان."
      },
      {
        "id": "frost_necromancer_2",
        "name": "یخ‌زدگی روح",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "یخ‌زدگی روح؛ کاهش ۳۰٪ سرعت یک هدف برای ۲ نوبت."
      },
      {
        "id": "frost_necromancer_3",
        "name": "نیزه یخ‌گور",
        "type": "magic",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "نیزه یخ‌گور؛ آسیب جادویی ۱۴۵٪."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "استعداد رده غیرمعمول: جادویی / کنترل گروهی؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "control_dangerous_enemy",
        "self_preserve_low_hp",
        "use_ready_role_skill",
        "avoid_overkill"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "rare",
      "itemId": "companion_evolution_uncommon_to_rare",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "bone_hound",
    "name": "سگ استخوانی",
    "nameEn": "Bone Hound",
    "rank": "uncommon",
    "levelMin": 1,
    "levelMax": 100,
    "role": "شکارچی / تعقیب‌کننده",
    "lore": "سگ شکاری ساخته‌شده از استخوان‌های جانوران؛ موجودی اختصاصی در جهان ETRANOM.",
    "portrait": "assets/necromancer/companions/uncommon/bone_hound.webp",
    "stats": {
      "power": 13,
      "speed": 18,
      "endurance": 12,
      "vitality": 13,
      "intellect": 5,
      "perception": 17,
      "luck": 14,
      "faith": 7
    },
    "growthPerLevel": {
      "power": 0.23,
      "speed": 0.32,
      "endurance": 0.22,
      "vitality": 0.23,
      "intellect": 0.09,
      "perception": 0.31,
      "luck": 0.25,
      "faith": 0.13
    },
    "skills": [
      {
        "id": "bone_hound_1",
        "name": "گاز استخوانی",
        "type": "physical",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "گاز استخوانی؛ آسیب ۱۲۵٪."
      },
      {
        "id": "bone_hound_2",
        "name": "تعقیب گله‌ای",
        "type": "physical_multi",
        "target": "two_enemies",
        "powerPct": 90,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "تعقیب گله‌ای؛ آسیب ۸۵٪ به دو هدف."
      },
      {
        "id": "bone_hound_3",
        "name": "بوی مرگ",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "بوی مرگ؛ افزایش ۱۵٪ دقت و سرعت برای ۲ نوبت."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "استعداد رده غیرمعمول: شکارچی / تعقیب‌کننده؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "hunt_low_hp",
        "self_preserve_low_hp",
        "use_ready_role_skill",
        "avoid_overkill"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "rare",
      "itemId": "companion_evolution_uncommon_to_rare",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "reaper_acolyte",
    "name": "پیرو داس‌دار",
    "nameEn": "Reaper Acolyte",
    "rank": "uncommon",
    "levelMin": 1,
    "levelMax": 100,
    "role": "مهاجم / تضعیف",
    "lore": "خدمتگزار فرقه مرگ در بازآفرینی گوتیک؛ نه برگرفته از یک موجود تاریخی واحد.",
    "portrait": "assets/necromancer/companions/uncommon/reaper_acolyte.webp",
    "stats": {
      "power": 15,
      "speed": 12,
      "endurance": 12,
      "vitality": 13,
      "intellect": 13,
      "perception": 13,
      "luck": 9,
      "faith": 17
    },
    "growthPerLevel": {
      "power": 0.27,
      "speed": 0.22,
      "endurance": 0.22,
      "vitality": 0.23,
      "intellect": 0.23,
      "perception": 0.23,
      "luck": 0.16,
      "faith": 0.31
    },
    "skills": [
      {
        "id": "reaper_acolyte_1",
        "name": "داس کوچک",
        "type": "physical",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "داس کوچک؛ آسیب ۱۳۵٪."
      },
      {
        "id": "reaper_acolyte_2",
        "name": "نشان پایان",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "نشان پایان؛ هدف تا ۲ نوبت ۱۲٪ آسیب بیشتری دریافت می‌کند."
      },
      {
        "id": "reaper_acolyte_3",
        "name": "برش روح",
        "type": "magic",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "برش روح؛ آسیب ترکیبی ۱۲۵٪."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "استعداد رده غیرمعمول: مهاجم / تضعیف؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "mark_high_threat",
        "self_preserve_low_hp",
        "use_ready_role_skill",
        "avoid_overkill"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "rare",
      "itemId": "companion_evolution_uncommon_to_rare",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "pale_banshee",
    "name": "بانشی رنگ‌پریده",
    "nameEn": "Pale Banshee",
    "rank": "uncommon",
    "levelMin": 1,
    "levelMax": 100,
    "role": "جادویی / پشتیبانی",
    "lore": "گونه‌ای آرام‌تر از بانشی ایرلندی در بازآفرینی اختصاصی بازی.",
    "portrait": "assets/necromancer/companions/uncommon/pale_banshee.webp",
    "stats": {
      "power": 5,
      "speed": 14,
      "endurance": 10,
      "vitality": 13,
      "intellect": 17,
      "perception": 13,
      "luck": 11,
      "faith": 18
    },
    "growthPerLevel": {
      "power": 0.09,
      "speed": 0.25,
      "endurance": 0.18,
      "vitality": 0.23,
      "intellect": 0.31,
      "perception": 0.23,
      "luck": 0.2,
      "faith": 0.32
    },
    "skills": [
      {
        "id": "pale_banshee_1",
        "name": "آوای آرامش",
        "type": "heal",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "آوای آرامش؛ درمان ۱۸٪ HP بیشینه ضعیف‌ترین همراه."
      },
      {
        "id": "pale_banshee_2",
        "name": "فریاد سپید",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 90,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "فریاد سپید؛ آسیب جادویی ۸۰٪ به همه دشمنان."
      },
      {
        "id": "pale_banshee_3",
        "name": "پرده ناله",
        "type": "shield",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "پرده ناله؛ سپر ۱۵٪ HP بیشینه برای یک همراه."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "استعداد رده غیرمعمول: جادویی / پشتیبانی؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "support_team_low_hp",
        "self_preserve_low_hp",
        "use_ready_role_skill",
        "avoid_overkill"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "rare",
      "itemId": "companion_evolution_uncommon_to_rare",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "pharaoh_guardian",
    "name": "نگهبان فرعون",
    "nameEn": "Pharaoh Guardian",
    "rank": "uncommon",
    "levelMin": 1,
    "levelMax": 100,
    "role": "تانک / ضدحمله",
    "lore": "نگهبان مقبره با الهام از شمایل‌های تدفینی مصر باستان؛ موجود زنده اسطوره‌ای مشخصی نیست.",
    "portrait": "assets/necromancer/companions/uncommon/pharaoh_guardian.webp",
    "stats": {
      "power": 16,
      "speed": 7,
      "endurance": 19,
      "vitality": 18,
      "intellect": 10,
      "perception": 11,
      "luck": 8,
      "faith": 16
    },
    "growthPerLevel": {
      "power": 0.29,
      "speed": 0.13,
      "endurance": 0.38,
      "vitality": 0.38,
      "intellect": 0.18,
      "perception": 0.2,
      "luck": 0.14,
      "faith": 0.29
    },
    "skills": [
      {
        "id": "pharaoh_guardian_1",
        "name": "سپر سلطنتی",
        "type": "guard",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "سپر سلطنتی؛ کاهش ۳۲٪ آسیب برای ۲ نوبت."
      },
      {
        "id": "pharaoh_guardian_2",
        "name": "عقوبت فرعون",
        "type": "physical",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "عقوبت فرعون؛ ضربه سنگین با ۱۳۵٪ قدرت."
      },
      {
        "id": "pharaoh_guardian_3",
        "name": "فرمان سکوت",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "فرمان سکوت؛ کاهش ۱۵٪ قدرت حمله دشمن برای ۲ نوبت."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "استعداد رده غیرمعمول: تانک / ضدحمله؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "guard_and_counter",
        "self_preserve_low_hp",
        "use_ready_role_skill",
        "avoid_overkill"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "rare",
      "itemId": "companion_evolution_uncommon_to_rare",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "mummy_stalker",
    "name": "مومیایی کمین‌گر",
    "nameEn": "Mummy Stalker",
    "rank": "uncommon",
    "levelMin": 1,
    "levelMax": 100,
    "role": "قاتل / کنترل",
    "lore": "مومیایی شکارچی در بازآفرینی فانتزی با الهام از تدفین مصر باستان.",
    "portrait": "assets/necromancer/companions/uncommon/mummy_stalker.webp",
    "stats": {
      "power": 12,
      "speed": 15,
      "endurance": 14,
      "vitality": 15,
      "intellect": 9,
      "perception": 16,
      "luck": 10,
      "faith": 13
    },
    "growthPerLevel": {
      "power": 0.22,
      "speed": 0.27,
      "endurance": 0.25,
      "vitality": 0.33,
      "intellect": 0.16,
      "perception": 0.29,
      "luck": 0.18,
      "faith": 0.23
    },
    "skills": [
      {
        "id": "mummy_stalker_1",
        "name": "چنگال مومیایی",
        "type": "physical",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "چنگال مومیایی؛ آسیب ۱۲۵٪."
      },
      {
        "id": "mummy_stalker_2",
        "name": "بندهای زنده",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "بندهای زنده؛ کاهش ۲۰٪ سرعت هدف و محدودسازی حرکت برای یک نوبت."
      },
      {
        "id": "mummy_stalker_3",
        "name": "نیش نمک‌زده",
        "type": "physical_leech",
        "target": "single",
        "powerPct": 110,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "نیش نمک‌زده؛ آسیب ۱۱۰٪ و بازیابی ۱۲٪ آسیب."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "استعداد رده غیرمعمول: قاتل / کنترل؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "ambush_then_bind",
        "self_preserve_low_hp",
        "use_ready_role_skill",
        "avoid_overkill"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "rare",
      "itemId": "companion_evolution_uncommon_to_rare",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "thorn_dryad_revenant",
    "name": "دریاد خارپوش بازگشته",
    "nameEn": "Thorn Dryad Revenant",
    "rank": "uncommon",
    "levelMin": 1,
    "levelMax": 100,
    "role": "کنترل / پشتیبان",
    "lore": "روح درختی انتقام‌جو با الهام از دریادهای اساطیر یونان؛ طراحی بازی بازآفرینی است.",
    "portrait": "assets/necromancer/companions/uncommon/thorn_dryad_revenant.webp",
    "stats": {
      "power": 9,
      "speed": 11,
      "endurance": 15,
      "vitality": 16,
      "intellect": 14,
      "perception": 12,
      "luck": 10,
      "faith": 18
    },
    "growthPerLevel": {
      "power": 0.16,
      "speed": 0.2,
      "endurance": 0.33,
      "vitality": 0.35,
      "intellect": 0.25,
      "perception": 0.22,
      "luck": 0.18,
      "faith": 0.32
    },
    "skills": [
      {
        "id": "thorn_dryad_revenant_1",
        "name": "ریشه‌های خاردار",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "ریشه‌های خاردار؛ آسیب ۸۰٪ و کاهش ۲۵٪ سرعت دو دشمن."
      },
      {
        "id": "thorn_dryad_revenant_2",
        "name": "شیره کهن",
        "type": "heal",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "شیره کهن؛ درمان ۱۶٪ HP بیشینه یک همراه."
      },
      {
        "id": "thorn_dryad_revenant_3",
        "name": "تازیانه شاخه",
        "type": "physical",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "تازیانه شاخه؛ آسیب ۱۲۵٪."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "استعداد رده غیرمعمول: کنترل / پشتیبان؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "protect_and_root",
        "self_preserve_low_hp",
        "use_ready_role_skill",
        "avoid_overkill"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "rare",
      "itemId": "companion_evolution_uncommon_to_rare",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "spirit_dancer",
    "name": "رقصنده ارواح",
    "nameEn": "Spirit Dancer",
    "rank": "uncommon",
    "levelMin": 1,
    "levelMax": 100,
    "role": "پشتیبان / تقویت گروه",
    "lore": "رقصنده آیینی میان جهان‌ها؛ طراحی فانتزی با الهام کلی از سنت‌های آیینی، نه اقتباس از فرهنگ مشخص.",
    "portrait": "assets/necromancer/companions/uncommon/spirit_dancer.webp",
    "stats": {
      "power": 8,
      "speed": 17,
      "endurance": 10,
      "vitality": 12,
      "intellect": 15,
      "perception": 16,
      "luck": 14,
      "faith": 17
    },
    "growthPerLevel": {
      "power": 0.14,
      "speed": 0.31,
      "endurance": 0.18,
      "vitality": 0.22,
      "intellect": 0.27,
      "perception": 0.29,
      "luck": 0.25,
      "faith": 0.31
    },
    "skills": [
      {
        "id": "spirit_dancer_1",
        "name": "گام هم‌نوا",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "گام هم‌نوا؛ افزایش ۱۲٪ سرعت و دقت همه همراهان برای ۲ نوبت."
      },
      {
        "id": "spirit_dancer_2",
        "name": "پرتو ارواح",
        "type": "magic",
        "target": "single",
        "powerPct": 125,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "پرتو ارواح؛ آسیب جادویی ۱۱۵٪."
      },
      {
        "id": "spirit_dancer_3",
        "name": "حلقه محافظ",
        "type": "shield",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "حلقه محافظ؛ سپر ۱۴٪ HP بیشینه برای ضعیف‌ترین همراه."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "استعداد رده غیرمعمول: پشتیبان / تقویت گروه؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "buff_team_then_attack",
        "self_preserve_low_hp",
        "use_ready_role_skill",
        "avoid_overkill"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "rare",
      "itemId": "companion_evolution_uncommon_to_rare",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "hollow_treant",
    "name": "درخت‌زاد توخالی",
    "nameEn": "Hollow Treant",
    "rank": "uncommon",
    "levelMin": 1,
    "levelMax": 100,
    "role": "تانک / کنترل چندهدف",
    "lore": "نگهبان درختی پوسیده با الهام از موجودات درختی فولکلور اروپا؛ گونه بازی اختصاصی است.",
    "portrait": "assets/necromancer/companions/uncommon/hollow_treant.webp",
    "stats": {
      "power": 17,
      "speed": 5,
      "endurance": 20,
      "vitality": 19,
      "intellect": 8,
      "perception": 9,
      "luck": 7,
      "faith": 15
    },
    "growthPerLevel": {
      "power": 0.31,
      "speed": 0.09,
      "endurance": 0.38,
      "vitality": 0.38,
      "intellect": 0.14,
      "perception": 0.16,
      "luck": 0.13,
      "faith": 0.27
    },
    "skills": [
      {
        "id": "hollow_treant_1",
        "name": "مشت تنه",
        "type": "physical_multi",
        "target": "two_enemies",
        "powerPct": 90,
        "cooldownTurns": 0,
        "durationTurns": 2,
        "description": "مشت تنه؛ آسیب ۱۲۰٪ به دو دشمن."
      },
      {
        "id": "hollow_treant_2",
        "name": "پوست کهن",
        "type": "guard",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "پوست کهن؛ کاهش ۳۵٪ آسیب دریافتی برای ۲ نوبت."
      },
      {
        "id": "hollow_treant_3",
        "name": "ریشه‌دوانی",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "ریشه‌دوانی؛ کاهش ۲۰٪ سرعت همه دشمنان برای یک نوبت."
      }
    ],
    "passive": {
      "name": "ویژگی ذاتی",
      "description": "استعداد رده غیرمعمول: تانک / کنترل چندهدف؛ در این نقش، عملکرد اختصاصی خود را در نبرد حفظ می‌کند."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "frontline_guard",
        "self_preserve_low_hp",
        "use_ready_role_skill",
        "avoid_overkill"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "rare",
      "itemId": "companion_evolution_uncommon_to_rare",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  }
]);
