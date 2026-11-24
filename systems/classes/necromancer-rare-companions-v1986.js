/** ETRANOM V1986 — 20 unique Rare Necromancer companions. */
import { NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel, chooseNecromancerCompanionIntent as chooseBaseIntent } from './necromancer-common-companions-v1995.js';
export { NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel };
export const NECROMANCER_RARE_COMPANIONS = Object.freeze([
  {
    "id": "dusk_duelist",
    "name": "شمشیرزن گرگ‌ومیش",
    "nameEn": "Dusk Duelist",
    "rank": "rare",
    "levelMin": 1,
    "levelMax": 100,
    "role": "قاتل / ضدحمله",
    "lore": "شمشیرزنی بی‌چهره که در افسانه‌پردازی اختصاصی ETRANOM میان آخرین نور و تاریکی حرکت می‌کند.",
    "portrait": "assets/necromancer/companions/rare/dusk_duelist.webp",
    "stats": {
      "power": 16,
      "speed": 19,
      "endurance": 12,
      "vitality": 14,
      "intellect": 11,
      "perception": 19,
      "luck": 13,
      "faith": 12
    },
    "growthPerLevel": {
      "power": 0.3,
      "speed": 0.36,
      "endurance": 0.23,
      "vitality": 0.27,
      "intellect": 0.21,
      "perception": 0.36,
      "luck": 0.25,
      "faith": 0.23
    },
    "skills": [
      {
        "id": "dusk_duelist_1",
        "name": "رقص تیغه",
        "type": "physical",
        "target": "single",
        "powerPct": 155,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "رقص تیغه؛ ۱۵۵٪ آسیب فیزیکی به یک هدف."
      },
      {
        "id": "dusk_duelist_2",
        "name": "گام گرگ‌ومیش",
        "type": "buff",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "گام گرگ‌ومیش؛ افزایش ۲۵٪ سرعت و جاخالی برای ۲ نوبت.",
        "attackPct": 15,
        "speedPct": 15,
        "defensePct": 15
      },
      {
        "id": "dusk_duelist_3",
        "name": "نشان شکاف",
        "type": "physical_debuff",
        "target": "single",
        "powerPct": 120,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "نشان شکاف؛ ۱۲۰٪ آسیب و کاهش ۱۵٪ دفاع هدف برای ۲ نوبت.",
        "attackReductionPct": 15,
        "defenseReductionPct": 15,
        "speedReductionPct": 15
      }
    ],
    "passive": {
      "name": "موهبت رده نادر",
      "description": "استعداد ذاتی قاتل / ضدحمله: در شرایط مناسب نقش خود، کارایی مهارت‌هایش را حفظ می‌کند و اولویت رفتاری ویژه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "counter_fast_attacker",
        "use_ready_role_skill",
        "avoid_overkill",
        "preserve_companion_life"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "epic",
      "itemId": "companion_evolution_rare_to_epic",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "tide_lich",
    "name": "لیچ جزرومد",
    "nameEn": "Tide Lich",
    "rank": "rare",
    "levelMin": 1,
    "levelMax": 100,
    "role": "جادویی / کنترل میدان",
    "lore": "جادوگر مرده‌ای از معابد غرق‌شده؛ بازآفرینی فانتزی با الهام از افسانه‌های دریایی چندفرهنگی.",
    "portrait": "assets/necromancer/companions/rare/tide_lich.webp",
    "stats": {
      "power": 7,
      "speed": 11,
      "endurance": 15,
      "vitality": 17,
      "intellect": 20,
      "perception": 14,
      "luck": 10,
      "faith": 18
    },
    "growthPerLevel": {
      "power": 0.13,
      "speed": 0.21,
      "endurance": 0.28,
      "vitality": 0.37,
      "intellect": 0.38,
      "perception": 0.27,
      "luck": 0.19,
      "faith": 0.34
    },
    "skills": [
      {
        "id": "tide_lich_1",
        "name": "موج گورستان",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 100,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "موج گورستان؛ ۱۱۵٪ آسیب جادویی به همه دشمنان."
      },
      {
        "id": "tide_lich_2",
        "name": "گرداب خاموش",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "گرداب خاموش؛ کاهش ۳۰٪ سرعت یک هدف برای ۲ نوبت.",
        "attackReductionPct": 15,
        "defenseReductionPct": 15,
        "speedReductionPct": 15
      },
      {
        "id": "tide_lich_3",
        "name": "نمک‌زدایی روح",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "نمک‌زدایی روح؛ کاهش ۱۸٪ هوش و قدرت جادویی هدف برای ۲ نوبت.",
        "attackReductionPct": 15,
        "defenseReductionPct": 15,
        "speedReductionPct": 15
      }
    ],
    "passive": {
      "name": "موهبت رده نادر",
      "description": "استعداد ذاتی جادویی / کنترل میدان: در شرایط مناسب نقش خود، کارایی مهارت‌هایش را حفظ می‌کند و اولویت رفتاری ویژه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "control_many_enemies",
        "use_ready_role_skill",
        "avoid_overkill",
        "preserve_companion_life"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "epic",
      "itemId": "companion_evolution_rare_to_epic",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "three_crowned_hellhound",
    "name": "سگ دوزخی سه‌تاج",
    "nameEn": "Three-Crowned Hellhound",
    "rank": "rare",
    "levelMin": 1,
    "levelMax": 100,
    "role": "مهاجم / محافظ",
    "lore": "جانور نگهبان سه‌سر جهان زیرین؛ بازآفرینی اختصاصی با الهام از سگ‌های نگهبان جهان مردگان در اساطیر یونان.",
    "portrait": "assets/necromancer/companions/rare/three_crowned_hellhound.webp",
    "stats": {
      "power": 20,
      "speed": 16,
      "endurance": 18,
      "vitality": 18,
      "intellect": 8,
      "perception": 15,
      "luck": 12,
      "faith": 14
    },
    "growthPerLevel": {
      "power": 0.38,
      "speed": 0.3,
      "endurance": 0.39,
      "vitality": 0.39,
      "intellect": 0.15,
      "perception": 0.28,
      "luck": 0.23,
      "faith": 0.27
    },
    "skills": [
      {
        "id": "three_crowned_hellhound_1",
        "name": "سه آرواره",
        "type": "physical_multi",
        "target": "two_enemies",
        "powerPct": 100,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "سه آرواره؛ ۱۰۰٪ آسیب به حداکثر سه دشمن."
      },
      {
        "id": "three_crowned_hellhound_2",
        "name": "پیمان دروازه",
        "type": "guard",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "پیمان دروازه؛ کاهش ۲۸٪ آسیب دریافتی برای ۲ نوبت.",
        "guardPct": 30
      },
      {
        "id": "three_crowned_hellhound_3",
        "name": "گاز داوری",
        "type": "physical",
        "target": "single",
        "powerPct": 145,
        "cooldownTurns": 2,
        "durationTurns": 0,
        "description": "گاز داوری؛ ۱۶۵٪ آسیب به یک دشمن."
      }
    ],
    "passive": {
      "name": "موهبت رده نادر",
      "description": "استعداد ذاتی مهاجم / محافظ: در شرایط مناسب نقش خود، کارایی مهارت‌هایش را حفظ می‌کند و اولویت رفتاری ویژه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "guard_and_multi_attack",
        "use_ready_role_skill",
        "avoid_overkill",
        "preserve_companion_life"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "epic",
      "itemId": "companion_evolution_rare_to_epic",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "anubis_judicator",
    "name": "داور آنوبیسی",
    "nameEn": "Anubis Judicator",
    "rank": "rare",
    "levelMin": 1,
    "levelMax": 100,
    "role": "تانک / داوری روح",
    "lore": "نگهبان آیین داوری مردگان با الهام از آنوبیس مصر باستان؛ نسخه بازی شخصیت مستقل و خیالی است.",
    "portrait": "assets/necromancer/companions/rare/anubis_judicator.webp",
    "stats": {
      "power": 15,
      "speed": 12,
      "endurance": 19,
      "vitality": 19,
      "intellect": 15,
      "perception": 17,
      "luck": 11,
      "faith": 20
    },
    "growthPerLevel": {
      "power": 0.28,
      "speed": 0.23,
      "endurance": 0.41,
      "vitality": 0.41,
      "intellect": 0.28,
      "perception": 0.32,
      "luck": 0.21,
      "faith": 0.38
    },
    "skills": [
      {
        "id": "anubis_judicator_1",
        "name": "ترازوی قلب",
        "type": "shield",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "ترازوی قلب؛ سپر ۲۲٪ HP بیشینه برای خود و یک همراه.",
        "shieldPct": 22
      },
      {
        "id": "anubis_judicator_2",
        "name": "حکم سنگین",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "حکم سنگین؛ کاهش ۲۰٪ قدرت حمله هدف برای ۲ نوبت.",
        "attackReductionPct": 15,
        "defenseReductionPct": 15,
        "speedReductionPct": 15
      },
      {
        "id": "anubis_judicator_3",
        "name": "چوب‌دست داوری",
        "type": "magic",
        "target": "single",
        "powerPct": 150,
        "cooldownTurns": 2,
        "durationTurns": 0,
        "description": "چوب‌دست داوری؛ ۱۴۵٪ آسیب جادویی."
      }
    ],
    "passive": {
      "name": "موهبت رده نادر",
      "description": "استعداد ذاتی تانک / داوری روح: در شرایط مناسب نقش خود، کارایی مهارت‌هایش را حفظ می‌کند و اولویت رفتاری ویژه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "protect_and_judge",
        "use_ready_role_skill",
        "avoid_overkill",
        "preserve_companion_life"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "epic",
      "itemId": "companion_evolution_rare_to_epic",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "plague_vesper",
    "name": "طاعون‌خوان شامگاه",
    "nameEn": "Plague Vesper",
    "rank": "rare",
    "levelMin": 1,
    "levelMax": 100,
    "role": "تضعیف / آسیب تدریجی",
    "lore": "پیکره‌ای نقاب‌دار که ناقوس بیماری را حمل می‌کند؛ ساخته جهان ETRANOM و نه موجودی تاریخی.",
    "portrait": "assets/necromancer/companions/rare/plague_vesper.webp",
    "stats": {
      "power": 9,
      "speed": 13,
      "endurance": 14,
      "vitality": 15,
      "intellect": 18,
      "perception": 16,
      "luck": 12,
      "faith": 16
    },
    "growthPerLevel": {
      "power": 0.17,
      "speed": 0.25,
      "endurance": 0.27,
      "vitality": 0.28,
      "intellect": 0.34,
      "perception": 0.3,
      "luck": 0.23,
      "faith": 0.3
    },
    "skills": [
      {
        "id": "plague_vesper_1",
        "name": "ناقوس تباهی",
        "type": "dot_aoe",
        "target": "single",
        "powerPct": 75,
        "cooldownTurns": 3,
        "durationTurns": 3,
        "description": "ناقوس تباهی؛ آسیب ۷۵٪ و مسمومیت/زوال سبک برای ۳ نوبت.",
        "attackReductionPct": 15,
        "defenseReductionPct": 15,
        "speedReductionPct": 15
      },
      {
        "id": "plague_vesper_2",
        "name": "هوای آلوده",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "هوای آلوده؛ کاهش ۱۸٪ قدرت و دقت همه دشمنان برای ۲ نوبت.",
        "attackReductionPct": 15,
        "defenseReductionPct": 15,
        "speedReductionPct": 15
      },
      {
        "id": "plague_vesper_3",
        "name": "غبار وبا",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 100,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "غبار وبا؛ ۹۵٪ آسیب جادویی به همه دشمنان."
      }
    ],
    "passive": {
      "name": "موهبت رده نادر",
      "description": "استعداد ذاتی تضعیف / آسیب تدریجی: در شرایط مناسب نقش خود، کارایی مهارت‌هایش را حفظ می‌کند و اولویت رفتاری ویژه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "dot_group_then_weaken",
        "use_ready_role_skill",
        "avoid_overkill",
        "preserve_companion_life"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "epic",
      "itemId": "companion_evolution_rare_to_epic",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "spectral_stag",
    "name": "گوزن شبح‌تاج",
    "nameEn": "Spectral Stag",
    "rank": "rare",
    "levelMin": 1,
    "levelMax": 100,
    "role": "پشتیبان / یورش",
    "lore": "گوزن روحانی با شاخ‌های نورانی؛ الهام‌گرفته از گوزن‌های فراطبیعی در فولکلور سلتیک و اروپای شمالی.",
    "portrait": "assets/necromancer/companions/rare/spectral_stag.webp",
    "stats": {
      "power": 13,
      "speed": 20,
      "endurance": 15,
      "vitality": 17,
      "intellect": 13,
      "perception": 19,
      "luck": 15,
      "faith": 19
    },
    "growthPerLevel": {
      "power": 0.25,
      "speed": 0.38,
      "endurance": 0.28,
      "vitality": 0.37,
      "intellect": 0.25,
      "perception": 0.36,
      "luck": 0.28,
      "faith": 0.36
    },
    "skills": [
      {
        "id": "spectral_stag_1",
        "name": "ندای شاخ‌ها",
        "type": "buff",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "ندای شاخ‌ها؛ افزایش ۱۸٪ سرعت و ادراک همه همراهان برای ۲ نوبت.",
        "attackPct": 15,
        "speedPct": 15,
        "defensePct": 15
      },
      {
        "id": "spectral_stag_2",
        "name": "شبنم سپیده",
        "type": "heal",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "شبنم سپیده؛ درمان ۲۲٪ HP بیشینه ضعیف‌ترین همراه.",
        "healPct": 22
      },
      {
        "id": "spectral_stag_3",
        "name": "یورش شاخ‌ماه",
        "type": "physical_multi",
        "target": "two_enemies",
        "powerPct": 100,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "یورش شاخ‌ماه؛ ۱۱۰٪ آسیب به دو دشمن."
      }
    ],
    "passive": {
      "name": "موهبت رده نادر",
      "description": "استعداد ذاتی پشتیبان / یورش: در شرایط مناسب نقش خود، کارایی مهارت‌هایش را حفظ می‌کند و اولویت رفتاری ویژه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "support_then_charge",
        "use_ready_role_skill",
        "avoid_overkill",
        "preserve_companion_life"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "epic",
      "itemId": "companion_evolution_rare_to_epic",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "paper_umbrella_yokai",
    "name": "یوکای چترکاغذی",
    "nameEn": "Paper Umbrella Yōkai",
    "rank": "rare",
    "levelMin": 1,
    "levelMax": 100,
    "role": "کنترل / فریب",
    "lore": "یوکای چتر یک‌چشم در فولکلور ژاپن؛ در بازی به موجودی چابک و فریبکار تبدیل شده است.",
    "portrait": "assets/necromancer/companions/rare/paper_umbrella_yokai.webp",
    "stats": {
      "power": 8,
      "speed": 20,
      "endurance": 11,
      "vitality": 13,
      "intellect": 17,
      "perception": 20,
      "luck": 18,
      "faith": 13
    },
    "growthPerLevel": {
      "power": 0.15,
      "speed": 0.38,
      "endurance": 0.21,
      "vitality": 0.25,
      "intellect": 0.32,
      "perception": 0.38,
      "luck": 0.34,
      "faith": 0.25
    },
    "skills": [
      {
        "id": "paper_umbrella_yokai_1",
        "name": "چرخش چتر",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "چرخش چتر؛ کاهش ۳۵٪ دقت و سرعت یک دشمن برای ۲ نوبت.",
        "attackReductionPct": 15,
        "defenseReductionPct": 15,
        "speedReductionPct": 15
      },
      {
        "id": "paper_umbrella_yokai_2",
        "name": "چشم ناظر",
        "type": "magic",
        "target": "single",
        "powerPct": 150,
        "cooldownTurns": 2,
        "durationTurns": 0,
        "description": "چشم ناظر؛ ۱۴۵٪ آسیب جادویی."
      },
      {
        "id": "paper_umbrella_yokai_3",
        "name": "سایه چتر",
        "type": "buff",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "سایه چتر؛ افزایش ۲۵٪ جاخالی برای ۲ نوبت.",
        "attackPct": 15,
        "speedPct": 15,
        "defensePct": 15
      }
    ],
    "passive": {
      "name": "موهبت رده نادر",
      "description": "استعداد ذاتی کنترل / فریب: در شرایط مناسب نقش خود، کارایی مهارت‌هایش را حفظ می‌کند و اولویت رفتاری ویژه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "disable_high_accuracy_enemy",
        "use_ready_role_skill",
        "avoid_overkill",
        "preserve_companion_life"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "epic",
      "itemId": "companion_evolution_rare_to_epic",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "serpent_crypt_priest",
    "name": "کاهن مارگور",
    "nameEn": "Serpent Crypt Priest",
    "rank": "rare",
    "levelMin": 1,
    "levelMax": 100,
    "role": "جادویی / نفرین",
    "lore": "کاهن خزنده آرامگاه با الهام کلی از نمادهای مار در بین‌النهرین؛ گونه و روایت آن ساخته بازی است.",
    "portrait": "assets/necromancer/companions/rare/serpent_crypt_priest.webp",
    "stats": {
      "power": 10,
      "speed": 13,
      "endurance": 14,
      "vitality": 16,
      "intellect": 20,
      "perception": 16,
      "luck": 11,
      "faith": 18
    },
    "growthPerLevel": {
      "power": 0.19,
      "speed": 0.25,
      "endurance": 0.27,
      "vitality": 0.3,
      "intellect": 0.38,
      "perception": 0.3,
      "luck": 0.21,
      "faith": 0.34
    },
    "skills": [
      {
        "id": "serpent_crypt_priest_1",
        "name": "نیش مهرشده",
        "type": "magic",
        "target": "single",
        "powerPct": 150,
        "cooldownTurns": 2,
        "durationTurns": 0,
        "description": "نیش مهرشده؛ ۱۵۵٪ آسیب جادویی."
      },
      {
        "id": "serpent_crypt_priest_2",
        "name": "نفرین حلقوی",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "نفرین حلقوی؛ کاهش ۲۰٪ دفاع و ایمان هدف برای ۲ نوبت.",
        "attackReductionPct": 15,
        "defenseReductionPct": 15,
        "speedReductionPct": 15
      },
      {
        "id": "serpent_crypt_priest_3",
        "name": "مارهای دخمه",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 100,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "مارهای دخمه؛ ۹۰٪ آسیب جادویی به همه دشمنان."
      }
    ],
    "passive": {
      "name": "موهبت رده نادر",
      "description": "استعداد ذاتی جادویی / نفرین: در شرایط مناسب نقش خود، کارایی مهارت‌هایش را حفظ می‌کند و اولویت رفتاری ویژه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "curse_resistant_target",
        "use_ready_role_skill",
        "avoid_overkill",
        "preserve_companion_life"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "epic",
      "itemId": "companion_evolution_rare_to_epic",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "obsidian_bat_matriarch",
    "name": "مادرخفاش ابسیدین",
    "nameEn": "Obsidian Bat Matriarch",
    "rank": "rare",
    "levelMin": 1,
    "levelMax": 100,
    "role": "مهاجم گروهی / پرواز",
    "lore": "موجودی شب‌زیست با بال‌های سنگ آتشفشانی؛ هیولایی کاملاً اختصاصی ETRANOM.",
    "portrait": "assets/necromancer/companions/rare/obsidian_bat_matriarch.webp",
    "stats": {
      "power": 14,
      "speed": 20,
      "endurance": 13,
      "vitality": 15,
      "intellect": 14,
      "perception": 18,
      "luck": 17,
      "faith": 10
    },
    "growthPerLevel": {
      "power": 0.27,
      "speed": 0.38,
      "endurance": 0.25,
      "vitality": 0.28,
      "intellect": 0.27,
      "perception": 0.34,
      "luck": 0.32,
      "faith": 0.19
    },
    "skills": [
      {
        "id": "obsidian_bat_matriarch_1",
        "name": "باران خفاش",
        "type": "physical_multi",
        "target": "two_enemies",
        "powerPct": 100,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "باران خفاش؛ ۹۵٪ آسیب به دو دشمن."
      },
      {
        "id": "obsidian_bat_matriarch_2",
        "name": "نیش خون‌سیاه",
        "type": "physical_leech",
        "target": "single",
        "powerPct": 130,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "نیش خون‌سیاه؛ ۱۳۰٪ آسیب و بازیابی ۱۸٪ آسیب واردشده."
      },
      {
        "id": "obsidian_bat_matriarch_3",
        "name": "بال‌های شکسته‌نور",
        "type": "buff",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "بال‌های شکسته‌نور؛ افزایش ۲۰٪ سرعت برای ۲ نوبت.",
        "attackPct": 15,
        "speedPct": 15,
        "defensePct": 15
      }
    ],
    "passive": {
      "name": "موهبت رده نادر",
      "description": "استعداد ذاتی مهاجم گروهی / پرواز: در شرایط مناسب نقش خود، کارایی مهارت‌هایش را حفظ می‌کند و اولویت رفتاری ویژه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "harass_low_hp_targets",
        "use_ready_role_skill",
        "avoid_overkill",
        "preserve_companion_life"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "epic",
      "itemId": "companion_evolution_rare_to_epic",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "moss_colossus",
    "name": "غول خزه‌پوش",
    "nameEn": "Moss Colossus",
    "rank": "rare",
    "levelMin": 1,
    "levelMax": 100,
    "role": "تانک / مهار گروهی",
    "lore": "غول سنگی و گیاهی با الهام از نگهبانان طبیعت در افسانه‌های شمال اروپا؛ گونه بازی مستقل است.",
    "portrait": "assets/necromancer/companions/rare/moss_colossus.webp",
    "stats": {
      "power": 20,
      "speed": 6,
      "endurance": 21,
      "vitality": 21,
      "intellect": 10,
      "perception": 11,
      "luck": 8,
      "faith": 17
    },
    "growthPerLevel": {
      "power": 0.38,
      "speed": 0.11,
      "endurance": 0.42,
      "vitality": 0.42,
      "intellect": 0.19,
      "perception": 0.21,
      "luck": 0.15,
      "faith": 0.32
    },
    "skills": [
      {
        "id": "moss_colossus_1",
        "name": "پوست سنگ‌خزه",
        "type": "guard",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "پوست سنگ‌خزه؛ کاهش ۳۸٪ آسیب دریافتی برای ۲ نوبت.",
        "guardPct": 30
      },
      {
        "id": "moss_colossus_2",
        "name": "فرونشست زمین",
        "type": "control",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "فرونشست زمین؛ کاهش ۲۲٪ سرعت همه دشمنان برای ۱ نوبت.",
        "attackReductionPct": 15,
        "defenseReductionPct": 15,
        "speedReductionPct": 15
      },
      {
        "id": "moss_colossus_3",
        "name": "مشت صخره‌ای",
        "type": "physical_multi",
        "target": "two_enemies",
        "powerPct": 100,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "مشت صخره‌ای؛ ۱۲۵٪ آسیب به دو دشمن."
      }
    ],
    "passive": {
      "name": "موهبت رده نادر",
      "description": "استعداد ذاتی تانک / مهار گروهی: در شرایط مناسب نقش خود، کارایی مهارت‌هایش را حفظ می‌کند و اولویت رفتاری ویژه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "frontline_and_area_control",
        "use_ready_role_skill",
        "avoid_overkill",
        "preserve_companion_life"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "epic",
      "itemId": "companion_evolution_rare_to_epic",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "scarab_soul_knight",
    "name": "شوالیه سوسک‌روح",
    "nameEn": "Scarab Soul Knight",
    "rank": "rare",
    "levelMin": 1,
    "levelMax": 100,
    "role": "تانک / ضدجادو",
    "lore": "جنگجوی تدفینی با زره سوسکی؛ الهام بصری از نماد سوسک در مصر باستان، با شخصیت‌پردازی خیالی.",
    "portrait": "assets/necromancer/companions/rare/scarab_soul_knight.webp",
    "stats": {
      "power": 18,
      "speed": 12,
      "endurance": 20,
      "vitality": 19,
      "intellect": 12,
      "perception": 15,
      "luck": 10,
      "faith": 19
    },
    "growthPerLevel": {
      "power": 0.34,
      "speed": 0.23,
      "endurance": 0.42,
      "vitality": 0.41,
      "intellect": 0.23,
      "perception": 0.28,
      "luck": 0.19,
      "faith": 0.36
    },
    "skills": [
      {
        "id": "scarab_soul_knight_1",
        "name": "بال‌پوش سوسکی",
        "type": "shield",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "بال‌پوش سوسکی؛ سپر ۲۵٪ HP بیشینه برای خود.",
        "shieldPct": 22
      },
      {
        "id": "scarab_soul_knight_2",
        "name": "نیزه خورشید سیاه",
        "type": "physical",
        "target": "single",
        "powerPct": 145,
        "cooldownTurns": 2,
        "durationTurns": 0,
        "description": "نیزه خورشید سیاه؛ ۱۵۰٪ آسیب فیزیکی."
      },
      {
        "id": "scarab_soul_knight_3",
        "name": "مهر خراش",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "مهر خراش؛ کاهش ۲۰٪ قدرت مهارت‌های جادویی دشمن برای ۲ نوبت.",
        "attackReductionPct": 15,
        "defenseReductionPct": 15,
        "speedReductionPct": 15
      }
    ],
    "passive": {
      "name": "موهبت رده نادر",
      "description": "استعداد ذاتی تانک / ضدجادو: در شرایط مناسب نقش خود، کارایی مهارت‌هایش را حفظ می‌کند و اولویت رفتاری ویژه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "resist_magic_and_counter",
        "use_ready_role_skill",
        "avoid_overkill",
        "preserve_companion_life"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "epic",
      "itemId": "companion_evolution_rare_to_epic",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "ash_phoenix_wraith",
    "name": "ققنوس خاکسترزاد",
    "nameEn": "Ash Phoenix Wraith",
    "rank": "rare",
    "levelMin": 1,
    "levelMax": 100,
    "role": "جادویی / احیاگر",
    "lore": "روح پرنده‌ای که از خاکستر بازمی‌گردد؛ بازآفرینی تاریک از موتیف ققنوس در سنت‌های اسطوره‌ای گوناگون.",
    "portrait": "assets/necromancer/companions/rare/ash_phoenix_wraith.webp",
    "stats": {
      "power": 11,
      "speed": 18,
      "endurance": 14,
      "vitality": 18,
      "intellect": 20,
      "perception": 17,
      "luck": 16,
      "faith": 20
    },
    "growthPerLevel": {
      "power": 0.21,
      "speed": 0.34,
      "endurance": 0.27,
      "vitality": 0.39,
      "intellect": 0.38,
      "perception": 0.32,
      "luck": 0.3,
      "faith": 0.38
    },
    "skills": [
      {
        "id": "ash_phoenix_wraith_1",
        "name": "بازدم باززایی",
        "type": "heal",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "بازدم باززایی؛ درمان ۲۵٪ HP بیشینه یک همراه.",
        "healPct": 22
      },
      {
        "id": "ash_phoenix_wraith_2",
        "name": "خاکستر آتشین",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 100,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "خاکستر آتشین؛ ۱۰۰٪ آسیب جادویی به همه دشمنان."
      },
      {
        "id": "ash_phoenix_wraith_3",
        "name": "پرهای بازگشت",
        "type": "buff",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "پرهای بازگشت؛ افزایش ۱۵٪ سرزندگی و ایمان همراهان برای ۲ نوبت.",
        "attackPct": 15,
        "speedPct": 15,
        "defensePct": 15
      }
    ],
    "passive": {
      "name": "موهبت رده نادر",
      "description": "استعداد ذاتی جادویی / احیاگر: در شرایط مناسب نقش خود، کارایی مهارت‌هایش را حفظ می‌کند و اولویت رفتاری ویژه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "revive_support_priority",
        "use_ready_role_skill",
        "avoid_overkill",
        "preserve_companion_life"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "epic",
      "itemId": "companion_evolution_rare_to_epic",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "bone_cantor",
    "name": "سرودخوان مهره‌ها",
    "nameEn": "Bone Cantor",
    "rank": "rare",
    "levelMin": 1,
    "levelMax": 100,
    "role": "پشتیبان / تقویت مهارت",
    "lore": "سرودخوانی که استخوان‌ها را به ساز بدل می‌کند؛ موجودی نوآورانه و اختصاصی جهان بازی.",
    "portrait": "assets/necromancer/companions/rare/bone_cantor.webp",
    "stats": {
      "power": 8,
      "speed": 14,
      "endurance": 13,
      "vitality": 16,
      "intellect": 19,
      "perception": 16,
      "luck": 14,
      "faith": 20
    },
    "growthPerLevel": {
      "power": 0.15,
      "speed": 0.27,
      "endurance": 0.25,
      "vitality": 0.3,
      "intellect": 0.36,
      "perception": 0.3,
      "luck": 0.27,
      "faith": 0.38
    },
    "skills": [
      {
        "id": "bone_cantor_1",
        "name": "سرود هشت‌مهره",
        "type": "buff",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "سرود هشت‌مهره؛ افزایش ۱۸٪ هوش و ایمان همه همراهان برای ۲ نوبت.",
        "attackPct": 15,
        "speedPct": 15,
        "defensePct": 15
      },
      {
        "id": "bone_cantor_2",
        "name": "آواز گسست",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "آواز گسست؛ کاهش ۱۵٪ دقت و اراده دشمنان برای ۲ نوبت.",
        "attackReductionPct": 15,
        "defenseReductionPct": 15,
        "speedReductionPct": 15
      },
      {
        "id": "bone_cantor_3",
        "name": "نت آخر",
        "type": "magic",
        "target": "single",
        "powerPct": 150,
        "cooldownTurns": 2,
        "durationTurns": 0,
        "description": "نت آخر؛ ۱۳۵٪ آسیب جادویی به یک هدف."
      }
    ],
    "passive": {
      "name": "موهبت رده نادر",
      "description": "استعداد ذاتی پشتیبان / تقویت مهارت: در شرایط مناسب نقش خود، کارایی مهارت‌هایش را حفظ می‌کند و اولویت رفتاری ویژه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "buff_casters_and_supports",
        "use_ready_role_skill",
        "avoid_overkill",
        "preserve_companion_life"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "epic",
      "itemId": "companion_evolution_rare_to_epic",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "abyss_centipede",
    "name": "هزارپای مغاک",
    "nameEn": "Abyss Centipede",
    "rank": "rare",
    "levelMin": 1,
    "levelMax": 100,
    "role": "کنترل / چندضربه",
    "lore": "بندپایی عظیم از شکاف‌های زیرزمینی؛ طراحی اختصاصی با الهام از هیولاهای خزنده فولکلور شرق آسیا.",
    "portrait": "assets/necromancer/companions/rare/abyss_centipede.webp",
    "stats": {
      "power": 17,
      "speed": 18,
      "endurance": 17,
      "vitality": 16,
      "intellect": 12,
      "perception": 18,
      "luck": 13,
      "faith": 9
    },
    "growthPerLevel": {
      "power": 0.32,
      "speed": 0.34,
      "endurance": 0.37,
      "vitality": 0.3,
      "intellect": 0.23,
      "perception": 0.34,
      "luck": 0.25,
      "faith": 0.17
    },
    "skills": [
      {
        "id": "abyss_centipede_1",
        "name": "هجوم هزارپا",
        "type": "physical_multi",
        "target": "two_enemies",
        "powerPct": 100,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "هجوم هزارپا؛ سه ضربه ۵۵٪ به یک هدف."
      },
      {
        "id": "abyss_centipede_2",
        "name": "زهر ژرفا",
        "type": "dot_aoe",
        "target": "single",
        "powerPct": 75,
        "cooldownTurns": 3,
        "durationTurns": 3,
        "description": "زهر ژرفا؛ ۶۵٪ آسیب و زهر برای ۳ نوبت.",
        "attackReductionPct": 15,
        "defenseReductionPct": 15,
        "speedReductionPct": 15
      },
      {
        "id": "abyss_centipede_3",
        "name": "حلقه‌کردن",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "حلقه‌کردن؛ کاهش ۲۵٪ سرعت هدف برای ۲ نوبت.",
        "attackReductionPct": 15,
        "defenseReductionPct": 15,
        "speedReductionPct": 15
      }
    ],
    "passive": {
      "name": "موهبت رده نادر",
      "description": "استعداد ذاتی کنترل / چندضربه: در شرایط مناسب نقش خود، کارایی مهارت‌هایش را حفظ می‌کند و اولویت رفتاری ویژه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "poison_then_lock",
        "use_ready_role_skill",
        "avoid_overkill",
        "preserve_companion_life"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "epic",
      "itemId": "companion_evolution_rare_to_epic",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "hourglass_sand_djinn",
    "name": "جن ساعت‌شکن",
    "nameEn": "Hourglass Sand Djinn",
    "rank": "rare",
    "levelMin": 1,
    "levelMax": 100,
    "role": "جادویی / کنترل زمان",
    "lore": "جن بیابانیِ محبوس در ساعت شنی نفرین‌شده؛ بازآفرینی اختصاصی با الهام از روایت‌های جن در فولکلور عربی و ایرانی.",
    "portrait": "assets/necromancer/companions/rare/hourglass_sand_djinn.webp",
    "stats": {
      "power": 17,
      "speed": 14,
      "endurance": 18,
      "vitality": 18,
      "intellect": 12,
      "perception": 17,
      "luck": 12,
      "faith": 15
    },
    "growthPerLevel": {
      "power": 0.32,
      "speed": 0.27,
      "endurance": 0.39,
      "vitality": 0.39,
      "intellect": 0.23,
      "perception": 0.32,
      "luck": 0.23,
      "faith": 0.28
    },
    "skills": [
      {
        "id": "hourglass_sand_djinn_1",
        "name": "نیزه جزر",
        "type": "physical",
        "target": "single",
        "powerPct": 145,
        "cooldownTurns": 2,
        "durationTurns": 0,
        "description": "نیزه جزر؛ ۱۵۵٪ آسیب فیزیکی."
      },
      {
        "id": "hourglass_sand_djinn_2",
        "name": "زنجیر لنگر",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "زنجیر لنگر؛ کاهش ۲۵٪ سرعت و جلوگیری از عقب‌نشینی برای ۱ نوبت.",
        "attackReductionPct": 15,
        "defenseReductionPct": 15,
        "speedReductionPct": 15
      },
      {
        "id": "hourglass_sand_djinn_3",
        "name": "شکستن کپسول",
        "type": "physical_debuff",
        "target": "single",
        "powerPct": 120,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "شکستن کپسول؛ ۱۲۰٪ آسیب و کاهش ۱۸٪ دفاع.",
        "attackReductionPct": 15,
        "defenseReductionPct": 15,
        "speedReductionPct": 15
      }
    ],
    "passive": {
      "name": "موهبت رده نادر",
      "description": "استعداد ذاتی جادویی / کنترل زمان: در شرایط مناسب نقش خود، کارایی مهارت‌هایش را حفظ می‌کند و اولویت رفتاری ویژه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "target_support_unit",
        "use_ready_role_skill",
        "avoid_overkill",
        "preserve_companion_life"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "epic",
      "itemId": "companion_evolution_rare_to_epic",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "gargoyle_penitent",
    "name": "گَرگویل توبه‌کار",
    "nameEn": "Penitent Gargoyle",
    "rank": "rare",
    "levelMin": 1,
    "levelMax": 100,
    "role": "تانک / نگهبان",
    "lore": "پیکره سنگی زنده با الهام از گارگویل‌های معماری گوتیک؛ در بازی نگهبانی است که از پیمان خود پشیمان شده.",
    "portrait": "assets/necromancer/companions/rare/gargoyle_penitent.webp",
    "stats": {
      "power": 19,
      "speed": 8,
      "endurance": 21,
      "vitality": 20,
      "intellect": 11,
      "perception": 14,
      "luck": 9,
      "faith": 18
    },
    "growthPerLevel": {
      "power": 0.36,
      "speed": 0.15,
      "endurance": 0.42,
      "vitality": 0.42,
      "intellect": 0.21,
      "perception": 0.27,
      "luck": 0.17,
      "faith": 0.34
    },
    "skills": [
      {
        "id": "gargoyle_penitent_1",
        "name": "سنگ‌پوشی",
        "type": "guard",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "سنگ‌پوشی؛ کاهش ۴۰٪ آسیب دریافتی برای ۲ نوبت.",
        "guardPct": 30
      },
      {
        "id": "gargoyle_penitent_2",
        "name": "چنگال کلیسا",
        "type": "physical",
        "target": "single",
        "powerPct": 145,
        "cooldownTurns": 2,
        "durationTurns": 0,
        "description": "چنگال کلیسا؛ ۱۴۰٪ آسیب."
      },
      {
        "id": "gargoyle_penitent_3",
        "name": "پناهگاه سنگی",
        "type": "shield",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "پناهگاه سنگی؛ سپر ۱۸٪ HP بیشینه برای ضعیف‌ترین همراه.",
        "shieldPct": 22
      }
    ],
    "passive": {
      "name": "موهبت رده نادر",
      "description": "استعداد ذاتی تانک / نگهبان: در شرایط مناسب نقش خود، کارایی مهارت‌هایش را حفظ می‌کند و اولویت رفتاری ویژه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "guard_low_hp_allies",
        "use_ready_role_skill",
        "avoid_overkill",
        "preserve_companion_life"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "epic",
      "itemId": "companion_evolution_rare_to_epic",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "ninefold_foxshade",
    "name": "روباه نه‌سایه",
    "nameEn": "Ninefold Foxshade",
    "rank": "rare",
    "levelMin": 1,
    "levelMax": 100,
    "role": "جادویی / فریب و چندهدف",
    "lore": "روح روباه نه‌دم با الهام از کیتسونه ژاپنی و هولی‌جینگ چینی؛ این نسخه تلفیقی و ساخته ETRANOM است.",
    "portrait": "assets/necromancer/companions/rare/ninefold_foxshade.webp",
    "stats": {
      "power": 10,
      "speed": 19,
      "endurance": 12,
      "vitality": 15,
      "intellect": 20,
      "perception": 19,
      "luck": 18,
      "faith": 17
    },
    "growthPerLevel": {
      "power": 0.19,
      "speed": 0.36,
      "endurance": 0.23,
      "vitality": 0.28,
      "intellect": 0.38,
      "perception": 0.36,
      "luck": 0.34,
      "faith": 0.32
    },
    "skills": [
      {
        "id": "ninefold_foxshade_1",
        "name": "آتش روباهی",
        "type": "magic",
        "target": "single",
        "powerPct": 150,
        "cooldownTurns": 2,
        "durationTurns": 0,
        "description": "آتش روباهی؛ ۱۵۰٪ آسیب جادویی."
      },
      {
        "id": "ninefold_foxshade_2",
        "name": "توهم نه‌گانه",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "توهم نه‌گانه؛ کاهش ۲۰٪ دقت و ادراک هدف برای ۲ نوبت.",
        "attackReductionPct": 15,
        "defenseReductionPct": 15,
        "speedReductionPct": 15
      },
      {
        "id": "ninefold_foxshade_3",
        "name": "شعله‌های گمراه",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 100,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "شعله‌های گمراه؛ ۹۵٪ آسیب به همه دشمنان."
      }
    ],
    "passive": {
      "name": "موهبت رده نادر",
      "description": "استعداد ذاتی جادویی / فریب و چندهدف: در شرایط مناسب نقش خود، کارایی مهارت‌هایش را حفظ می‌کند و اولویت رفتاری ویژه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "illusion_and_aoe",
        "use_ready_role_skill",
        "avoid_overkill",
        "preserve_companion_life"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "epic",
      "itemId": "companion_evolution_rare_to_epic",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "deep_iron_diver",
    "name": "غواص آهن‌ژرف",
    "nameEn": "Deep-Iron Diver",
    "rank": "rare",
    "levelMin": 1,
    "levelMax": 100,
    "role": "تانک / ضدحمله",
    "lore": "نگهبان اعماق با زره فشارشکن و چراغ دریایی؛ طراحی کاملاً اختصاصی بازی.",
    "portrait": "assets/necromancer/companions/rare/deep_iron_diver.webp",
    "stats": {
      "power": 18,
      "speed": 9,
      "endurance": 21,
      "vitality": 20,
      "intellect": 13,
      "perception": 16,
      "luck": 10,
      "faith": 16
    },
    "growthPerLevel": {
      "power": 0.34,
      "speed": 0.17,
      "endurance": 0.42,
      "vitality": 0.42,
      "intellect": 0.25,
      "perception": 0.3,
      "luck": 0.19,
      "faith": 0.3
    },
    "skills": [
      {
        "id": "deep_iron_diver_1",
        "name": "پوسته فشار",
        "type": "guard",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "پوسته فشار؛ کاهش ۳۵٪ آسیب برای ۲ نوبت.",
        "guardPct": 30
      },
      {
        "id": "deep_iron_diver_2",
        "name": "چکش اعماق",
        "type": "physical",
        "target": "single",
        "powerPct": 145,
        "cooldownTurns": 2,
        "durationTurns": 0,
        "description": "چکش اعماق؛ ۱۶۰٪ آسیب به هدف."
      },
      {
        "id": "deep_iron_diver_3",
        "name": "فشار مغاک",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "فشار مغاک؛ کاهش ۱۸٪ قدرت حمله و سرعت دشمن برای ۲ نوبت.",
        "attackReductionPct": 15,
        "defenseReductionPct": 15,
        "speedReductionPct": 15
      }
    ],
    "passive": {
      "name": "موهبت رده نادر",
      "description": "استعداد ذاتی تانک / ضدحمله: در شرایط مناسب نقش خود، کارایی مهارت‌هایش را حفظ می‌کند و اولویت رفتاری ویژه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "counter_heavy_attacks",
        "use_ready_role_skill",
        "avoid_overkill",
        "preserve_companion_life"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "epic",
      "itemId": "companion_evolution_rare_to_epic",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "thorn_crown_matron",
    "name": "مادر تاج‌خار",
    "nameEn": "Thorn-Crown Matron",
    "rank": "rare",
    "levelMin": 1,
    "levelMax": 100,
    "role": "پشتیبان / کنترل طبیعت",
    "lore": "ملکه‌ای گیاهی با تاج خار و گل‌های تیره؛ الهام آزاد از ارواح گیاهی اساطیر اروپا، بدون تکرار دریاد قبلی.",
    "portrait": "assets/necromancer/companions/rare/thorn_crown_matron.webp",
    "stats": {
      "power": 12,
      "speed": 14,
      "endurance": 17,
      "vitality": 19,
      "intellect": 18,
      "perception": 16,
      "luck": 14,
      "faith": 20
    },
    "growthPerLevel": {
      "power": 0.23,
      "speed": 0.27,
      "endurance": 0.37,
      "vitality": 0.41,
      "intellect": 0.34,
      "perception": 0.3,
      "luck": 0.27,
      "faith": 0.38
    },
    "skills": [
      {
        "id": "thorn_crown_matron_1",
        "name": "شیره تاج",
        "type": "heal",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "شیره تاج؛ درمان ۲۰٪ HP بیشینه دو همراه.",
        "healPct": 22
      },
      {
        "id": "thorn_crown_matron_2",
        "name": "تاج ریشه",
        "type": "control",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "تاج ریشه؛ کاهش ۲۵٪ سرعت دو دشمن برای ۲ نوبت.",
        "attackReductionPct": 15,
        "defenseReductionPct": 15,
        "speedReductionPct": 15
      },
      {
        "id": "thorn_crown_matron_3",
        "name": "شکوفه شب‌تاب",
        "type": "buff",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "شکوفه شب‌تاب؛ افزایش ۱۵٪ دفاع و ایمان همراهان برای ۲ نوبت.",
        "attackPct": 15,
        "speedPct": 15,
        "defensePct": 15
      }
    ],
    "passive": {
      "name": "موهبت رده نادر",
      "description": "استعداد ذاتی پشتیبان / کنترل طبیعت: در شرایط مناسب نقش خود، کارایی مهارت‌هایش را حفظ می‌کند و اولویت رفتاری ویژه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "heal_and_root_team",
        "use_ready_role_skill",
        "avoid_overkill",
        "preserve_companion_life"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "epic",
      "itemId": "companion_evolution_rare_to_epic",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "raven_of_last_oath",
    "name": "کلاغ سوگند واپسین",
    "nameEn": "Raven of the Last Oath",
    "rank": "rare",
    "levelMin": 1,
    "levelMax": 100,
    "role": "شکارچی / دیده‌بان",
    "lore": "کلاغی عظیم که سوگندهای شکسته را جمع می‌کند؛ الهام از کلاغ‌های پیام‌آور در اساطیر نورس و سلتی.",
    "portrait": "assets/necromancer/companions/rare/raven_of_last_oath.webp",
    "stats": {
      "power": 14,
      "speed": 20,
      "endurance": 13,
      "vitality": 15,
      "intellect": 16,
      "perception": 21,
      "luck": 19,
      "faith": 17
    },
    "growthPerLevel": {
      "power": 0.27,
      "speed": 0.38,
      "endurance": 0.25,
      "vitality": 0.28,
      "intellect": 0.3,
      "perception": 0.4,
      "luck": 0.36,
      "faith": 0.32
    },
    "skills": [
      {
        "id": "raven_of_last_oath_1",
        "name": "منقار تقدیر",
        "type": "physical",
        "target": "single",
        "powerPct": 145,
        "cooldownTurns": 2,
        "durationTurns": 0,
        "description": "منقار تقدیر؛ ۱۴۵٪ آسیب به هدف."
      },
      {
        "id": "raven_of_last_oath_2",
        "name": "نشان پر سیاه",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "نشان پر سیاه؛ هدف برای ۲ نوبت ۱۸٪ آسیب بیشتری دریافت می‌کند.",
        "attackReductionPct": 15,
        "defenseReductionPct": 15,
        "speedReductionPct": 15
      },
      {
        "id": "raven_of_last_oath_3",
        "name": "چشم از فراز",
        "type": "buff",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "چشم از فراز؛ افزایش ۲۰٪ ادراک و شانس همراهان برای ۲ نوبت.",
        "attackPct": 15,
        "speedPct": 15,
        "defensePct": 15
      }
    ],
    "passive": {
      "name": "موهبت رده نادر",
      "description": "استعداد ذاتی شکارچی / دیده‌بان: در شرایط مناسب نقش خود، کارایی مهارت‌هایش را حفظ می‌کند و اولویت رفتاری ویژه دارد."
    },
    "combatAI": {
      "policy": "priority_rules",
      "rules": [
        "mark_and_finish_wounded",
        "use_ready_role_skill",
        "avoid_overkill",
        "preserve_companion_life"
      ],
      "tieBreak": "highest_expected_value_then_lowest_cooldown"
    },
    "evolution": {
      "nextRank": "epic",
      "itemId": "companion_evolution_rare_to_epic",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  }
]);
export function chooseRareCompanionIntent(companionOrId, context = {}) {
 const source = typeof companionOrId === 'string' ? NECROMANCER_RARE_COMPANIONS.find(x=>x.id===companionOrId) : companionOrId;
 if (!source) return null;
 const enemies=(context.enemies||[]).filter(x=>Number(x.hp??1)>0), allies=(context.allies||[]).filter(x=>Number(x.hp??1)>0);
 const lowest=[...allies].sort((a,b)=>Number(a.hp)/Math.max(1,Number(a.maxHp)||1)-Number(b.hp)/Math.max(1,Number(b.maxHp)||1))[0];
 const weakest=[...enemies].sort((a,b)=>Number(a.hp)/Math.max(1,Number(a.maxHp)||1)-Number(b.hp)/Math.max(1,Number(b.maxHp)||1))[0];
 const ready=source.skills.filter(s=>Number(context.cooldowns?.[s.id]||0)<=0 && (context.canUseSkill?context.canUseSkill(s)!==false:true));
 const rules=source.combatAI.rules.join('|'); let skill=null;
 if (lowest && Number(lowest.hp)/Math.max(1,Number(lowest.maxHp)||1)<.62) skill=ready.find(s=>['heal','shield','guard'].includes(s.type)||s.target==='lowest_hp_ally');
 if (!skill && enemies.length>=2 && /multi|area|aoe|group|control_many|illusion/.test(rules)) skill=ready.find(s=>['magic_aoe','physical_multi','control','debuff','dot'].includes(s.type));
 if (!skill && /guard|counter|protect|frontline/.test(rules) && Number(context.selfHpPct??100)<72) skill=ready.find(s=>['guard','shield'].includes(s.type));
 if (!skill && /buff|support|heal/.test(rules)) skill=ready.find(s=>['buff','heal','shield'].includes(s.type));
 if (!skill && weakest) skill=ready.find(s=>['physical','magic','counter','physical_debuff','physical_leech','magic_aoe','physical_multi','dot'].includes(s.type));
 if (!skill) return chooseBaseIntent(source,context);
 const targetId=skill.target==='self'?(context.selfId??null):skill.target==='lowest_hp_ally'?(lowest?.id??context.selfId??null):['all_enemies','two_enemies','all_allies'].includes(skill.target)?null:(weakest?.id??null);
 return {action:'use_skill',skillId:skill.id,targetId,targetMode:skill.target,reason:'rare_species_authored_priority',skill:JSON.parse(JSON.stringify(skill))};
}
