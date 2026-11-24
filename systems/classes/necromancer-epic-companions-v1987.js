/** ETRANOM V1987 — 20 distinct Epic Necromancer companions. */
import { NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel, chooseNecromancerCompanionIntent as chooseBaseIntent } from './necromancer-common-companions-v1995.js';
export { NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel };
export const NECROMANCER_EPIC_COMPANIONS = Object.freeze([
  {
    "id": "obsidian_bell_golem",
    "name": "غول ناقوس ابسیدین",
    "nameEn": "Obsidian Bell Golem",
    "rank": "epic",
    "levelMin": 1,
    "levelMax": 100,
    "role": "تانک / ضدحمله صوتی",
    "lore": "سازه‌ای سنگین از شیشه آتشفشانی و زنگ‌های مذاب؛ با ضربه‌پذیری صوتی دشمن را مختل می‌کند.",
    "portrait": "assets/necromancer/companions/epic/obsidian_bell_golem.webp",
    "stats": {
      "power": 20,
      "speed": 17,
      "endurance": 18,
      "vitality": 16,
      "intellect": 13,
      "perception": 20,
      "luck": 14,
      "faith": 18
    },
    "growthPerLevel": {
      "power": 0.42,
      "speed": 0.36,
      "endurance": 0.38,
      "vitality": 0.34,
      "intellect": 0.27,
      "perception": 0.42,
      "luck": 0.29,
      "faith": 0.38
    },
    "skills": [
      {
        "id": "obsidian_bell_golem_1",
        "name": "موج ناقوس سیاه",
        "type": "physical",
        "target": "single",
        "powerPct": 175,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "موج صوتی ۱۵۰٪ آسیب به دشمنان و کاهش ۱۵٪ دقت آن‌ها."
      },
      {
        "id": "obsidian_bell_golem_2",
        "name": "پوسته ابسیدین",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "کاهش ۴۰٪ آسیب دریافتی برای ۲ نوبت.",
        "attackReductionPct": 20,
        "defenseReductionPct": 20,
        "speedReductionPct": 20
      },
      {
        "id": "obsidian_bell_golem_3",
        "name": "طنین شکاف",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "۱۸۰٪ آسیب به هدف و شکستن بخشی از سپر او.",
        "attackPct": 18,
        "speedPct": 18,
        "defensePct": 18
      }
    ],
    "passive": {
      "name": "موهبت حماسی",
      "description": "استعداد ذاتی تانک / ضدحمله صوتی: در شرایط ویژه نبرد، نقش تاکتیکی خود را تقویت می‌کند و با موجودات دیگر هم‌پوشانی رفتاری ندارد."
    },
    "combatAI": {
      "policy": "epic_authored_priority",
      "rules": [
        "اگر هدفی زیر ۳۵٪ HP باشد، آن را اولویت می‌دهد؛ در غیر این صورت زنجیر حکم را روی تانک دشمن می‌اندازد.",
        "execute_low_hp_targets",
        "use_ready_role_skill",
        "avoid_overkill",
        "protect_companion_survival"
      ],
      "tieBreak": "species_priority_then_highest_expected_value"
    },
    "evolution": {
      "nextRank": "legendary",
      "itemId": "companion_evolution_epic_to_legendary",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "cathedral_bell_colossus",
    "name": "کلوسوس ناقوس‌خانه",
    "nameEn": "Cathedral Bell Colossus",
    "rank": "epic",
    "levelMin": 1,
    "levelMax": 100,
    "role": "تانک گروهی / پشتیبان",
    "lore": "برجی متحرک از ناقوس‌های شکسته که با ارتعاش، سپرهای متحدان را تقویت می‌کند؛ نه یک جنگجوی زره‌پوش.",
    "portrait": "assets/necromancer/companions/epic/cathedral_bell_colossus.webp",
    "stats": {
      "power": 8,
      "speed": 18,
      "endurance": 15,
      "vitality": 17,
      "intellect": 21,
      "perception": 19,
      "luck": 14,
      "faith": 20
    },
    "growthPerLevel": {
      "power": 0.17,
      "speed": 0.38,
      "endurance": 0.32,
      "vitality": 0.36,
      "intellect": 0.44,
      "perception": 0.4,
      "luck": 0.29,
      "faith": 0.42
    },
    "skills": [
      {
        "id": "cathedral_bell_colossus_1",
        "name": "ناقوس پناه",
        "type": "silence",
        "target": "all_enemies",
        "powerPct": 120,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "سپر گروهی معادل ۲۵٪ HP بیشینه همراهان.",
        "attackReductionPct": 20,
        "defenseReductionPct": 20,
        "speedReductionPct": 20
      },
      {
        "id": "cathedral_bell_colossus_2",
        "name": "طنین هم‌نوا",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "افزایش ۱۸٪ دفاع و ایمان همه همراهان برای ۲ نوبت.",
        "attackReductionPct": 20,
        "defenseReductionPct": 20,
        "speedReductionPct": 20
      },
      {
        "id": "cathedral_bell_colossus_3",
        "name": "فرود برج",
        "type": "magic",
        "target": "single",
        "powerPct": 170,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "۱۲۰٪ آسیب به همه دشمنان و کاهش سرعت آن‌ها."
      }
    ],
    "passive": {
      "name": "موهبت حماسی",
      "description": "استعداد ذاتی تانک گروهی / پشتیبان: در شرایط ویژه نبرد، نقش تاکتیکی خود را تقویت می‌کند و با موجودات دیگر هم‌پوشانی رفتاری ندارد."
    },
    "combatAI": {
      "policy": "epic_authored_priority",
      "rules": [
        "در آغاز نبرد ترجیح می‌دهد مهارت‌های گروهی دشمن را مختل کند؛ اگر دشمنی آماده مهارت قدرتمند باشد، سکوت را روی او متمرکز می‌کند.",
        "silence_enemy_casters",
        "use_ready_role_skill",
        "avoid_overkill",
        "protect_companion_survival"
      ],
      "tieBreak": "species_priority_then_highest_expected_value"
    },
    "evolution": {
      "nextRank": "legendary",
      "itemId": "companion_evolution_epic_to_legendary",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "abyssal_prism_serpent",
    "name": "مار منشوری مغاک",
    "nameEn": "Abyssal Prism Serpent",
    "rank": "epic",
    "levelMin": 1,
    "levelMax": 100,
    "role": "جادوگر / پرتوهای چندرنگ",
    "lore": "مار دریایی بلورین که نور را در فلس‌های منشوری می‌شکند و به پرتوهای جادویی تبدیل می‌کند.",
    "portrait": "assets/necromancer/companions/epic/abyssal_prism_serpent.webp",
    "stats": {
      "power": 21,
      "speed": 16,
      "endurance": 19,
      "vitality": 20,
      "intellect": 17,
      "perception": 16,
      "luck": 12,
      "faith": 16
    },
    "growthPerLevel": {
      "power": 0.44,
      "speed": 0.34,
      "endurance": 0.4,
      "vitality": 0.46,
      "intellect": 0.36,
      "perception": 0.34,
      "luck": 0.25,
      "faith": 0.34
    },
    "skills": [
      {
        "id": "abyssal_prism_serpent_1",
        "name": "پرتو منشوری",
        "type": "physical_multi",
        "target": "three_enemies",
        "powerPct": 210,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "۱۶۵٪ آسیب جادویی به یک هدف."
      },
      {
        "id": "abyssal_prism_serpent_2",
        "name": "شکست طیف",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "۱۲۰٪ آسیب جادویی به سه دشمن.",
        "attackPct": 18,
        "speedPct": 18,
        "defensePct": 18
      },
      {
        "id": "abyssal_prism_serpent_3",
        "name": "فلس آینه‌ای",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 130,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "افزایش ۲۵٪ مقاومت جادویی خودش برای ۲ نوبت."
      }
    ],
    "passive": {
      "name": "موهبت حماسی",
      "description": "استعداد ذاتی جادوگر / پرتوهای چندرنگ: در شرایط ویژه نبرد، نقش تاکتیکی خود را تقویت می‌کند و با موجودات دیگر هم‌پوشانی رفتاری ندارد."
    },
    "combatAI": {
      "policy": "epic_authored_priority",
      "rules": [
        "اگر چند دشمن حاضر باشند ضربه سه‌گانه را انتخاب می‌کند؛ در برابر دشمنان مقاوم فیزیکی از غرش تهی استفاده می‌کند.",
        "adaptive_multi_form",
        "use_ready_role_skill",
        "avoid_overkill",
        "protect_companion_survival"
      ],
      "tieBreak": "species_priority_then_highest_expected_value"
    },
    "evolution": {
      "nextRank": "legendary",
      "itemId": "companion_evolution_epic_to_legendary",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "astral_jelly_matriarch",
    "name": "مادر عروس‌دریایی اختر",
    "nameEn": "Astral Jelly Matriarch",
    "rank": "epic",
    "levelMin": 1,
    "levelMax": 100,
    "role": "کنترل‌کننده / میدان انرژی",
    "lore": "توده‌ای شناور از رشته‌های نورانی و جوهر کیهانی؛ با میدان‌های انرژی حرکت دشمنان را مختل می‌کند.",
    "portrait": "assets/necromancer/companions/epic/astral_jelly_matriarch.webp",
    "stats": {
      "power": 17,
      "speed": 10,
      "endurance": 22,
      "vitality": 22,
      "intellect": 18,
      "perception": 15,
      "luck": 11,
      "faith": 21
    },
    "growthPerLevel": {
      "power": 0.36,
      "speed": 0.21,
      "endurance": 0.48,
      "vitality": 0.48,
      "intellect": 0.38,
      "perception": 0.32,
      "luck": 0.23,
      "faith": 0.44
    },
    "skills": [
      {
        "id": "astral_jelly_matriarch_1",
        "name": "رشته اختر",
        "type": "guard",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "کاهش ۳۰٪ سرعت همه دشمنان برای ۲ نوبت.",
        "guardPct": 40
      },
      {
        "id": "astral_jelly_matriarch_2",
        "name": "میدان شناور",
        "type": "control",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "سپر ۲۰٪ HP برای دو همراه.",
        "attackReductionPct": 20,
        "defenseReductionPct": 20,
        "speedReductionPct": 20
      },
      {
        "id": "astral_jelly_matriarch_3",
        "name": "بارش ستاره‌ژله",
        "type": "magic",
        "target": "single",
        "powerPct": 160,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "۱۳۵٪ آسیب جادویی به همه دشمنان."
      }
    ],
    "passive": {
      "name": "موهبت حماسی",
      "description": "استعداد ذاتی کنترل‌کننده / میدان انرژی: در شرایط ویژه نبرد، نقش تاکتیکی خود را تقویت می‌کند و با موجودات دیگر هم‌پوشانی رفتاری ندارد."
    },
    "combatAI": {
      "policy": "epic_authored_priority",
      "rules": [
        "وقتی چند همراه آسیب‌پذیرند از تختگاه ژرف استفاده می‌کند؛ سپس میدان را با فشار اقیانوس کند می‌سازد.",
        "team_guard_and_slow",
        "use_ready_role_skill",
        "avoid_overkill",
        "protect_companion_survival"
      ],
      "tieBreak": "species_priority_then_highest_expected_value"
    },
    "evolution": {
      "nextRank": "legendary",
      "itemId": "companion_evolution_epic_to_legendary",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "bonewing_manta",
    "name": "مانتای استخوان‌بال",
    "nameEn": "Bonewing Manta",
    "rank": "epic",
    "levelMin": 1,
    "levelMax": 100,
    "role": "مهاجم هوایی / شکار از بالا",
    "lore": "شکارچی عظیم و پهن‌بال که بی‌صدا بر فراز میدان می‌لغزد و با موج استخوانی از بالا ضربه می‌زند.",
    "portrait": "assets/necromancer/companions/epic/bonewing_manta.webp",
    "stats": {
      "power": 12,
      "speed": 14,
      "endurance": 17,
      "vitality": 18,
      "intellect": 22,
      "perception": 18,
      "luck": 13,
      "faith": 19
    },
    "growthPerLevel": {
      "power": 0.25,
      "speed": 0.29,
      "endurance": 0.36,
      "vitality": 0.38,
      "intellect": 0.46,
      "perception": 0.38,
      "luck": 0.27,
      "faith": 0.4
    },
    "skills": [
      {
        "id": "bonewing_manta_1",
        "name": "لغزش بال‌استخوان",
        "type": "dot_aoe",
        "target": "all_enemies",
        "powerPct": 90,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "۱۷۰٪ آسیب به یک دشمن و ۷۰٪ آسیب به هدف دوم.",
        "dotDamagePct": 18,
        "dotDurationTurns": 3
      },
      {
        "id": "bonewing_manta_2",
        "name": "شکار از فراز",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "۱۹۰٪ آسیب به دشمن عقب‌صف.",
        "attackReductionPct": 20,
        "defenseReductionPct": 20,
        "speedReductionPct": 20
      },
      {
        "id": "bonewing_manta_3",
        "name": "پوشش باد",
        "type": "magic",
        "target": "single",
        "powerPct": 180,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "افزایش ۲۵٪ سرعت و جاخالی برای ۲ نوبت."
      }
    ],
    "passive": {
      "name": "موهبت حماسی",
      "description": "استعداد ذاتی مهاجم هوایی / شکار از بالا: در شرایط ویژه نبرد، نقش تاکتیکی خود را تقویت می‌کند و با موجودات دیگر هم‌پوشانی رفتاری ندارد."
    },
    "combatAI": {
      "policy": "epic_authored_priority",
      "rules": [
        "ابتدا زوال گروهی ایجاد می‌کند و سپس هدف دارای زوال را با ترکاندن مهر تمام می‌کند.",
        "spread_decay_then_burst",
        "use_ready_role_skill",
        "avoid_overkill",
        "protect_companion_survival"
      ],
      "tieBreak": "species_priority_then_highest_expected_value"
    },
    "evolution": {
      "nextRank": "legendary",
      "itemId": "companion_evolution_epic_to_legendary",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "glacier_shard_beast",
    "name": "درنده خرده‌یخ",
    "nameEn": "Glacier Shard Beast",
    "rank": "epic",
    "levelMin": 1,
    "levelMax": 100,
    "role": "مهاجم / زره کریستالی",
    "lore": "جانوری چهاراندام با صفحات بلور یخی؛ با شکستن صفحاتش موجی از ترکش‌های جادویی آزاد می‌کند.",
    "portrait": "assets/necromancer/companions/epic/glacier_shard_beast.webp",
    "stats": {
      "power": 9,
      "speed": 15,
      "endurance": 16,
      "vitality": 18,
      "intellect": 22,
      "perception": 21,
      "luck": 19,
      "faith": 22
    },
    "growthPerLevel": {
      "power": 0.19,
      "speed": 0.32,
      "endurance": 0.34,
      "vitality": 0.38,
      "intellect": 0.46,
      "perception": 0.44,
      "luck": 0.4,
      "faith": 0.46
    },
    "skills": [
      {
        "id": "glacier_shard_beast_1",
        "name": "ترکش یخ‌فام",
        "type": "buff",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "۱۵۰٪ آسیب به دو دشمن.",
        "attackPct": 18,
        "speedPct": 18,
        "defensePct": 18
      },
      {
        "id": "glacier_shard_beast_2",
        "name": "پوسته شکسته",
        "type": "shield",
        "target": "two_lowest_allies",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "کاهش ۳۵٪ آسیب دریافتی برای ۲ نوبت.",
        "shieldPct": 25
      },
      {
        "id": "glacier_shard_beast_3",
        "name": "انفجار بلور",
        "type": "magic",
        "target": "single",
        "powerPct": 150,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "۱۷۰٪ آسیب جادویی به یک هدف."
      }
    ],
    "passive": {
      "name": "موهبت حماسی",
      "description": "استعداد ذاتی مهاجم / زره کریستالی: در شرایط ویژه نبرد، نقش تاکتیکی خود را تقویت می‌کند و با موجودات دیگر هم‌پوشانی رفتاری ندارد."
    },
    "combatAI": {
      "policy": "epic_authored_priority",
      "rules": [
        "پیش از ضربه‌های سنگین دشمن، سپر می‌سازد؛ در غیر این صورت پیش‌آگاهی را برای تقویت گروه حفظ می‌کند.",
        "predict_and_prevent_burst",
        "use_ready_role_skill",
        "avoid_overkill",
        "protect_companion_survival"
      ],
      "tieBreak": "species_priority_then_highest_expected_value"
    },
    "evolution": {
      "nextRank": "legendary",
      "itemId": "companion_evolution_epic_to_legendary",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "iron_bell_revenant",
    "name": "بازگشته زنگ‌آهن",
    "nameEn": "Iron Bell Revenant",
    "rank": "epic",
    "levelMin": 1,
    "levelMax": 100,
    "role": "مهاجم سنگین / تضعیف",
    "lore": "موجودی زنجیرپوش با ناقوس آهنی در سینه؛ ضربه‌هایش ریتم و تمرکز دشمن را برهم می‌زند.",
    "portrait": "assets/necromancer/companions/epic/iron_bell_revenant.webp",
    "stats": {
      "power": 19,
      "speed": 22,
      "endurance": 17,
      "vitality": 18,
      "intellect": 13,
      "perception": 21,
      "luck": 18,
      "faith": 15
    },
    "growthPerLevel": {
      "power": 0.4,
      "speed": 0.46,
      "endurance": 0.36,
      "vitality": 0.38,
      "intellect": 0.27,
      "perception": 0.44,
      "luck": 0.38,
      "faith": 0.32
    },
    "skills": [
      {
        "id": "iron_bell_revenant_1",
        "name": "ضربه زنگ‌آهن",
        "type": "physical_multi",
        "target": "two_enemies",
        "powerPct": 160,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "۱۷۵٪ آسیب و کاهش ۲۰٪ دقت هدف."
      },
      {
        "id": "iron_bell_revenant_2",
        "name": "طنین بی‌ریتم",
        "type": "physical",
        "target": "backline",
        "powerPct": 190,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "کاهش ۲۰٪ سرعت و قدرت حمله دشمنان."
      },
      {
        "id": "iron_bell_revenant_3",
        "name": "زنجیر ناقوس",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "گرفتن یک دشمن و کاهش دفاع او برای ۲ نوبت.",
        "attackPct": 18,
        "speedPct": 18,
        "defensePct": 18
      }
    ],
    "passive": {
      "name": "موهبت حماسی",
      "description": "استعداد ذاتی مهاجم سنگین / تضعیف: در شرایط ویژه نبرد، نقش تاکتیکی خود را تقویت می‌کند و با موجودات دیگر هم‌پوشانی رفتاری ندارد."
    },
    "combatAI": {
      "policy": "epic_authored_priority",
      "rules": [
        "اولویت با دشمنان دوربرد و جادوگران؛ هنگام تهدید مستقیم، بال‌های توفانی را فعال می‌کند.",
        "dive_backline_targets",
        "use_ready_role_skill",
        "avoid_overkill",
        "protect_companion_survival"
      ],
      "tieBreak": "species_priority_then_highest_expected_value"
    },
    "evolution": {
      "nextRank": "legendary",
      "itemId": "companion_evolution_epic_to_legendary",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "voidwing_eclipse_ray",
    "name": "پرتوی بال‌خلأ",
    "nameEn": "Voidwing Eclipse Ray",
    "rank": "epic",
    "levelMin": 1,
    "levelMax": 100,
    "role": "کنترل / جابه‌جایی میدان",
    "lore": "موجودی پرتووار از خلأ که سایه‌اش روی زمین می‌لغزد و موقعیت و دقت دشمنان را مختل می‌کند.",
    "portrait": "assets/necromancer/companions/epic/voidwing_eclipse_ray.webp",
    "stats": {
      "power": 22,
      "speed": 8,
      "endurance": 23,
      "vitality": 22,
      "intellect": 12,
      "perception": 13,
      "luck": 8,
      "faith": 18
    },
    "growthPerLevel": {
      "power": 0.46,
      "speed": 0.17,
      "endurance": 0.48,
      "vitality": 0.48,
      "intellect": 0.25,
      "perception": 0.27,
      "luck": 0.17,
      "faith": 0.38
    },
    "skills": [
      {
        "id": "voidwing_eclipse_ray_1",
        "name": "لغزش در خلأ",
        "type": "guard",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "کاهش ۳۰٪ دقت همه دشمنان برای ۲ نوبت.",
        "guardPct": 40
      },
      {
        "id": "voidwing_eclipse_ray_2",
        "name": "پرتاب سایه",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "۱۵۵٪ آسیب جادویی به هدف.",
        "attackReductionPct": 20,
        "defenseReductionPct": 20,
        "speedReductionPct": 20
      },
      {
        "id": "voidwing_eclipse_ray_3",
        "name": "پرده کسوف",
        "type": "physical_multi",
        "target": "all_enemies",
        "powerPct": 140,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "افزایش ۲۵٪ جاخالی همراهان برای ۲ نوبت."
      }
    ],
    "passive": {
      "name": "موهبت حماسی",
      "description": "استعداد ذاتی کنترل / جابه‌جایی میدان: در شرایط ویژه نبرد، نقش تاکتیکی خود را تقویت می‌کند و با موجودات دیگر هم‌پوشانی رفتاری ندارد."
    },
    "combatAI": {
      "policy": "epic_authored_priority",
      "rules": [
        "در برابر مهاجمان سریع زره خارآهن را فعال می‌کند و سپس دشمنان نزدیک را با چرخش تیغه‌ها می‌زند.",
        "reflect_and_lock_melee",
        "use_ready_role_skill",
        "avoid_overkill",
        "protect_companion_survival"
      ],
      "tieBreak": "species_priority_then_highest_expected_value"
    },
    "evolution": {
      "nextRank": "legendary",
      "itemId": "companion_evolution_epic_to_legendary",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "obsidian_scarab_scourge",
    "name": "عقرب ابسیدین‌چنگ",
    "nameEn": "Obsidian Scourge Scorpion",
    "rank": "epic",
    "levelMin": 1,
    "levelMax": 100,
    "role": "شکارچی / زهر و ضدزره",
    "lore": "عقربی عظیم با نیش بلورین و چنگال‌های سیاه؛ زهرش سپر و زره را فرسوده می‌کند.",
    "portrait": "assets/necromancer/companions/epic/obsidian_scarab_scourge.webp",
    "stats": {
      "power": 15,
      "speed": 17,
      "endurance": 19,
      "vitality": 20,
      "intellect": 19,
      "perception": 18,
      "luck": 15,
      "faith": 21
    },
    "growthPerLevel": {
      "power": 0.32,
      "speed": 0.36,
      "endurance": 0.4,
      "vitality": 0.46,
      "intellect": 0.4,
      "perception": 0.38,
      "luck": 0.32,
      "faith": 0.44
    },
    "skills": [
      {
        "id": "obsidian_scarab_scourge_1",
        "name": "نیش ابسیدین",
        "type": "buff",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "۱۸۰٪ آسیب و زهر سه‌نوبتی.",
        "attackPct": 18,
        "speedPct": 18,
        "defensePct": 18
      },
      {
        "id": "obsidian_scarab_scourge_2",
        "name": "چنگال خردکن",
        "type": "shield",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 0,
        "description": "کاهش ۳۰٪ سپر و دفاع هدف.",
        "shieldPct": 25
      },
      {
        "id": "obsidian_scarab_scourge_3",
        "name": "هجوم هشت‌پا",
        "type": "physical_multi",
        "target": "three_enemies",
        "powerPct": 120,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "سه ضربه ۶۰٪ به یک هدف."
      }
    ],
    "passive": {
      "name": "موهبت حماسی",
      "description": "استعداد ذاتی شکارچی / زهر و ضدزره: در شرایط ویژه نبرد، نقش تاکتیکی خود را تقویت می‌کند و با موجودات دیگر هم‌پوشانی رفتاری ندارد."
    },
    "combatAI": {
      "policy": "epic_authored_priority",
      "rules": [
        "ابتدا کلونی را تقویت می‌کند؛ اگر گروه آسیب جدی دیده باشد پوسته سلطنتی را جلو می‌اندازد.",
        "command_and_shield_swarm",
        "use_ready_role_skill",
        "avoid_overkill",
        "protect_companion_survival"
      ],
      "tieBreak": "species_priority_then_highest_expected_value"
    },
    "evolution": {
      "nextRank": "legendary",
      "itemId": "companion_evolution_epic_to_legendary",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "ironroot_colossus",
    "name": "کلوسوس ریشه‌آهن",
    "nameEn": "Ironroot Colossus",
    "rank": "epic",
    "levelMin": 1,
    "levelMax": 100,
    "role": "تانک / مهار حرکت",
    "lore": "عنصری از ریشه‌های فلزی و هسته مذاب؛ برخلاف غول‌های سنگی، با ریشه‌های سیم‌مانند دشمن را می‌بندد.",
    "portrait": "assets/necromancer/companions/epic/ironroot_colossus.webp",
    "stats": {
      "power": 14,
      "speed": 21,
      "endurance": 16,
      "vitality": 20,
      "intellect": 21,
      "perception": 18,
      "luck": 17,
      "faith": 22
    },
    "growthPerLevel": {
      "power": 0.29,
      "speed": 0.44,
      "endurance": 0.34,
      "vitality": 0.46,
      "intellect": 0.44,
      "perception": 0.38,
      "luck": 0.36,
      "faith": 0.46
    },
    "skills": [
      {
        "id": "ironroot_colossus_1",
        "name": "ریشه سیمی",
        "type": "heal",
        "target": "two_lowest_allies",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "ریشه‌دارکردن دو دشمن برای یک نوبت.",
        "healPct": 24
      },
      {
        "id": "ironroot_colossus_2",
        "name": "هسته مذاب",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 140,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "کاهش ۴۰٪ آسیب دریافتی خودش."
      },
      {
        "id": "ironroot_colossus_3",
        "name": "چکش ریشه‌آهن",
        "type": "buff",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "۱۵۰٪ آسیب به دو دشمن.",
        "attackPct": 18,
        "speedPct": 18,
        "defensePct": 18
      }
    ],
    "passive": {
      "name": "موهبت حماسی",
      "description": "استعداد ذاتی تانک / مهار حرکت: در شرایط ویژه نبرد، نقش تاکتیکی خود را تقویت می‌کند و با موجودات دیگر هم‌پوشانی رفتاری ندارد."
    },
    "combatAI": {
      "policy": "epic_authored_priority",
      "rules": [
        "اگر دو همراه زیر ۵۵٪ HP باشند درمان را اولویت می‌دهد؛ در غیر این صورت با انفجار گروهی فشار می‌آورد.",
        "heal_or_burst_by_team_state",
        "use_ready_role_skill",
        "avoid_overkill",
        "protect_companion_survival"
      ],
      "tieBreak": "species_priority_then_highest_expected_value"
    },
    "evolution": {
      "nextRank": "legendary",
      "itemId": "companion_evolution_epic_to_legendary",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "starless_moth_queen",
    "name": "ملکه شب‌پره بی‌ستاره",
    "nameEn": "Starless Moth Queen",
    "rank": "epic",
    "levelMin": 1,
    "levelMax": 100,
    "role": "پشتیبان / خواب و اختلال",
    "lore": "شب‌پره‌ای عظیم با بال‌های پرنقش که گرده‌های خاموش‌کننده اراده پخش می‌کند.",
    "portrait": "assets/necromancer/companions/epic/starless_moth_queen.webp",
    "stats": {
      "power": 11,
      "speed": 5,
      "endurance": 22,
      "vitality": 23,
      "intellect": 20,
      "perception": 14,
      "luck": 8,
      "faith": 22
    },
    "growthPerLevel": {
      "power": 0.23,
      "speed": 0.16,
      "endurance": 0.48,
      "vitality": 0.48,
      "intellect": 0.42,
      "perception": 0.29,
      "luck": 0.17,
      "faith": 0.46
    },
    "skills": [
      {
        "id": "starless_moth_queen_1",
        "name": "گرده خواب",
        "type": "shield",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 0,
        "description": "خواباندن یک دشمن برای یک نوبت؛ با آسیب بیدار می‌شود.",
        "shieldPct": 25
      },
      {
        "id": "starless_moth_queen_2",
        "name": "غبار بال",
        "type": "heal",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 0,
        "description": "کاهش ۲۰٪ دقت همه دشمنان.",
        "healPct": 24
      },
      {
        "id": "starless_moth_queen_3",
        "name": "پودر بیداری",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 120,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "درمان ۲۰٪ HP دو همراه و افزایش ۱۵٪ سرعت آن‌ها."
      }
    ],
    "passive": {
      "name": "موهبت حماسی",
      "description": "استعداد ذاتی پشتیبان / خواب و اختلال: در شرایط ویژه نبرد، نقش تاکتیکی خود را تقویت می‌کند و با موجودات دیگر هم‌پوشانی رفتاری ندارد."
    },
    "combatAI": {
      "policy": "epic_authored_priority",
      "rules": [
        "وقتی دو همراه یا بیشتر آسیب دیده‌اند طاق استخوان را ترجیح می‌دهد؛ سپس درمان گروهی.",
        "mobile_sanctuary_support",
        "use_ready_role_skill",
        "avoid_overkill",
        "protect_companion_survival"
      ],
      "tieBreak": "species_priority_then_highest_expected_value"
    },
    "evolution": {
      "nextRank": "legendary",
      "itemId": "companion_evolution_epic_to_legendary",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "floating_sarcophagus",
    "name": "تابوت شناور نفرین",
    "nameEn": "Cursed Floating Sarcophagus",
    "rank": "epic",
    "levelMin": 1,
    "levelMax": 100,
    "role": "پشتیبان / جذب آسیب",
    "lore": "تابوتی باستانی که بی‌آنکه حامل داشته باشد در هوا حرکت می‌کند و آسیب متحدان را در مهرهای خود ذخیره می‌کند.",
    "portrait": "assets/necromancer/companions/epic/floating_sarcophagus.webp",
    "stats": {
      "power": 23,
      "speed": 13,
      "endurance": 22,
      "vitality": 23,
      "intellect": 18,
      "perception": 16,
      "luck": 10,
      "faith": 20
    },
    "growthPerLevel": {
      "power": 0.48,
      "speed": 0.27,
      "endurance": 0.48,
      "vitality": 0.48,
      "intellect": 0.38,
      "perception": 0.34,
      "luck": 0.21,
      "faith": 0.42
    },
    "skills": [
      {
        "id": "floating_sarcophagus_1",
        "name": "مهر تابوت",
        "type": "physical_multi",
        "target": "three_enemies",
        "powerPct": 150,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "سپر ۳۰٪ HP برای همه همراهان."
      },
      {
        "id": "floating_sarcophagus_2",
        "name": "بلع آسیب",
        "type": "control",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "کاهش ۳۵٪ آسیب دریافتی همراهان برای ۲ نوبت.",
        "attackReductionPct": 20,
        "defenseReductionPct": 20,
        "speedReductionPct": 20
      },
      {
        "id": "floating_sarcophagus_3",
        "name": "رهایی مومیایی",
        "type": "physical",
        "target": "single",
        "powerPct": 200,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "۱۶۰٪ آسیب جادویی به یک دشمن."
      }
    ],
    "passive": {
      "name": "موهبت حماسی",
      "description": "استعداد ذاتی پشتیبان / جذب آسیب: در شرایط ویژه نبرد، نقش تاکتیکی خود را تقویت می‌کند و با موجودات دیگر هم‌پوشانی رفتاری ندارد."
    },
    "combatAI": {
      "policy": "epic_authored_priority",
      "rules": [
        "در برابر گروه، بلع موج؛ در برابر هدف سپردار، آرواره شکاف را انتخاب می‌کند.",
        "break_shields_and_crush_groups",
        "use_ready_role_skill",
        "avoid_overkill",
        "protect_companion_survival"
      ],
      "tieBreak": "species_priority_then_highest_expected_value"
    },
    "evolution": {
      "nextRank": "legendary",
      "itemId": "companion_evolution_epic_to_legendary",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "eclipse_halo_herald",
    "name": "پیام‌آور هاله کسوف",
    "nameEn": "Eclipse Halo Herald",
    "rank": "epic",
    "levelMin": 1,
    "levelMax": 100,
    "role": "جادوگر / تقویت و انفجار",
    "lore": "پیکره‌ای با حلقه خورشیدگرفته و زره بنفش که انرژی هاله را برای ضربه‌های انفجاری ذخیره می‌کند.",
    "portrait": "assets/necromancer/companions/epic/eclipse_halo_herald.webp",
    "stats": {
      "power": 21,
      "speed": 11,
      "endurance": 22,
      "vitality": 22,
      "intellect": 17,
      "perception": 19,
      "luck": 12,
      "faith": 18
    },
    "growthPerLevel": {
      "power": 0.44,
      "speed": 0.23,
      "endurance": 0.48,
      "vitality": 0.48,
      "intellect": 0.36,
      "perception": 0.4,
      "luck": 0.25,
      "faith": 0.38
    },
    "skills": [
      {
        "id": "eclipse_halo_herald_1",
        "name": "هاله سیاه",
        "type": "control",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "افزایش ۲۰٪ هوش و ایمان همراهان.",
        "attackReductionPct": 20,
        "defenseReductionPct": 20,
        "speedReductionPct": 20
      },
      {
        "id": "eclipse_halo_herald_2",
        "name": "پرتو کسوف",
        "type": "guard",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "۱۸۰٪ آسیب جادویی به یک هدف.",
        "guardPct": 40
      },
      {
        "id": "eclipse_halo_herald_3",
        "name": "حلقه فروپاشی",
        "type": "physical_multi",
        "target": "all_enemies",
        "powerPct": 135,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "۱۳۰٪ آسیب به همه دشمنان."
      }
    ],
    "passive": {
      "name": "موهبت حماسی",
      "description": "استعداد ذاتی جادوگر / تقویت و انفجار: در شرایط ویژه نبرد، نقش تاکتیکی خود را تقویت می‌کند و با موجودات دیگر هم‌پوشانی رفتاری ندارد."
    },
    "combatAI": {
      "policy": "epic_authored_priority",
      "rules": [
        "ابتدا دقت گروه دشمن را مختل می‌کند؛ هنگام افت HP به زیر ۵۰٪ پوسته فشرده را فعال می‌کند.",
        "blind_then_endure",
        "use_ready_role_skill",
        "avoid_overkill",
        "protect_companion_survival"
      ],
      "tieBreak": "species_priority_then_highest_expected_value"
    },
    "evolution": {
      "nextRank": "legendary",
      "itemId": "companion_evolution_epic_to_legendary",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "coral_hydra_twins",
    "name": "هیدرای مرجان‌زاد",
    "nameEn": "Coral Hydra Twins",
    "rank": "epic",
    "levelMin": 1,
    "levelMax": 100,
    "role": "مهاجم چندهدفه / باززایی",
    "lore": "دو سر مستقل از یک تنه مرجانی که با حملات متناوب، چند دشمن را هدف می‌گیرند.",
    "portrait": "assets/necromancer/companions/epic/coral_hydra_twins.webp",
    "stats": {
      "power": 13,
      "speed": 19,
      "endurance": 18,
      "vitality": 20,
      "intellect": 20,
      "perception": 19,
      "luck": 14,
      "faith": 23
    },
    "growthPerLevel": {
      "power": 0.27,
      "speed": 0.4,
      "endurance": 0.38,
      "vitality": 0.46,
      "intellect": 0.42,
      "perception": 0.4,
      "luck": 0.29,
      "faith": 0.48
    },
    "skills": [
      {
        "id": "coral_hydra_twins_1",
        "name": "گاز دو سر",
        "type": "heal",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 0,
        "description": "دو ضربه ۹۰٪ به دو دشمن.",
        "healPct": 24
      },
      {
        "id": "coral_hydra_twins_2",
        "name": "بازرویی مرجان",
        "type": "buff",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "درمان ۲۲٪ HP خودش و یک همراه.",
        "attackPct": 18,
        "speedPct": 18,
        "defensePct": 18
      },
      {
        "id": "coral_hydra_twins_3",
        "name": "خیزش هیدرا",
        "type": "magic",
        "target": "single",
        "powerPct": 175,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "۱۵۰٪ آسیب به سه دشمن."
      }
    ],
    "passive": {
      "name": "موهبت حماسی",
      "description": "استعداد ذاتی مهاجم چندهدفه / باززایی: در شرایط ویژه نبرد، نقش تاکتیکی خود را تقویت می‌کند و با موجودات دیگر هم‌پوشانی رفتاری ندارد."
    },
    "combatAI": {
      "policy": "epic_authored_priority",
      "rules": [
        "در برابر آسیب جادویی دشمنان، سرود بال‌ها را زودتر استفاده می‌کند؛ سپس درمان گروهی.",
        "holy_guardian_support",
        "use_ready_role_skill",
        "avoid_overkill",
        "protect_companion_survival"
      ],
      "tieBreak": "species_priority_then_highest_expected_value"
    },
    "evolution": {
      "nextRank": "legendary",
      "itemId": "companion_evolution_epic_to_legendary",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "stainedglass_arachnid",
    "name": "عنکبوت شیشه‌نگار",
    "nameEn": "Stainedglass Arachnid",
    "rank": "epic",
    "levelMin": 1,
    "levelMax": 100,
    "role": "کنترل / تله‌گذاری",
    "lore": "عنکبوتی سازه‌وار با بدن شیشه‌رنگی؛ تارهایش مانند پنجره‌های شکسته، مسیر حرکت دشمن را مسدود می‌کند.",
    "portrait": "assets/necromancer/companions/epic/stainedglass_arachnid.webp",
    "stats": {
      "power": 10,
      "speed": 18,
      "endurance": 17,
      "vitality": 20,
      "intellect": 21,
      "perception": 18,
      "luck": 17,
      "faith": 20
    },
    "growthPerLevel": {
      "power": 0.21,
      "speed": 0.38,
      "endurance": 0.36,
      "vitality": 0.46,
      "intellect": 0.44,
      "perception": 0.38,
      "luck": 0.36,
      "faith": 0.42
    },
    "skills": [
      {
        "id": "stainedglass_arachnid_1",
        "name": "تار شیشه‌رنگ",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "گرفتارکردن یک دشمن برای یک نوبت.",
        "attackReductionPct": 20,
        "defenseReductionPct": 20,
        "speedReductionPct": 20
      },
      {
        "id": "stainedglass_arachnid_2",
        "name": "باران منشور",
        "type": "heal",
        "target": "two_lowest_allies",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "۱۲۵٪ آسیب جادویی به همه دشمنان.",
        "healPct": 24
      },
      {
        "id": "stainedglass_arachnid_3",
        "name": "پوسته رنگین",
        "type": "dot_aoe",
        "target": "all_enemies",
        "powerPct": 85,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "سپر ۲۵٪ HP برای خودش و ضعیف‌ترین همراه.",
        "dotDamagePct": 18,
        "dotDurationTurns": 3
      }
    ],
    "passive": {
      "name": "موهبت حماسی",
      "description": "استعداد ذاتی کنترل / تله‌گذاری: در شرایط ویژه نبرد، نقش تاکتیکی خود را تقویت می‌کند و با موجودات دیگر هم‌پوشانی رفتاری ندارد."
    },
    "combatAI": {
      "policy": "epic_authored_priority",
      "rules": [
        "دشمن خطرناک را می‌خواباند؛ اگر همراهان مسموم باشند شهد سیاه را در اولویت قرار می‌دهد.",
        "sleep_and_cleanse",
        "use_ready_role_skill",
        "avoid_overkill",
        "protect_companion_survival"
      ],
      "tieBreak": "species_priority_then_highest_expected_value"
    },
    "evolution": {
      "nextRank": "legendary",
      "itemId": "companion_evolution_epic_to_legendary",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "astral_astrolabe_engine",
    "name": "ماشین اسطرلاب اختر",
    "nameEn": "Astral Astrolabe Engine",
    "rank": "epic",
    "levelMin": 1,
    "levelMax": 100,
    "role": "پشتیبان / تنظیم زمان مهارت",
    "lore": "ماشینی شناور از حلقه‌های نجومی که چرخه مهارت همراهان را تنظیم و نوبت‌های گروه را هماهنگ می‌کند.",
    "portrait": "assets/necromancer/companions/epic/astral_astrolabe_engine.webp",
    "stats": {
      "power": 20,
      "speed": 20,
      "endurance": 17,
      "vitality": 18,
      "intellect": 19,
      "perception": 19,
      "luck": 16,
      "faith": 14
    },
    "growthPerLevel": {
      "power": 0.42,
      "speed": 0.42,
      "endurance": 0.36,
      "vitality": 0.38,
      "intellect": 0.4,
      "perception": 0.4,
      "luck": 0.34,
      "faith": 0.29
    },
    "skills": [
      {
        "id": "astral_astrolabe_engine_1",
        "name": "تنظیم اسطرلاب",
        "type": "magic_aoe",
        "target": "three_enemies",
        "powerPct": 130,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "کاهش یک نوبت از انتظار مهارت یک همراه."
      },
      {
        "id": "astral_astrolabe_engine_2",
        "name": "مدار هماهنگ",
        "type": "physical",
        "target": "single",
        "powerPct": 180,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "افزایش ۱۸٪ سرعت همه همراهان."
      },
      {
        "id": "astral_astrolabe_engine_3",
        "name": "ستاره‌سنجی",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "۱۵۰٪ آسیب جادویی و کاهش ۱۵٪ دقت هدف.",
        "attackPct": 18,
        "speedPct": 18,
        "defensePct": 18
      }
    ],
    "passive": {
      "name": "موهبت حماسی",
      "description": "استعداد ذاتی پشتیبان / تنظیم زمان مهارت: در شرایط ویژه نبرد، نقش تاکتیکی خود را تقویت می‌کند و با موجودات دیگر هم‌پوشانی رفتاری ندارد."
    },
    "combatAI": {
      "policy": "epic_authored_priority",
      "rules": [
        "اگر سه دشمن حاضر باشند صاعقه زنجیره‌ای را انتخاب می‌کند؛ برای حذف هدف کلیدی از گاز رعد استفاده می‌کند.",
        "chain_lightning_finisher",
        "use_ready_role_skill",
        "avoid_overkill",
        "protect_companion_survival"
      ],
      "tieBreak": "species_priority_then_highest_expected_value"
    },
    "evolution": {
      "nextRank": "legendary",
      "itemId": "companion_evolution_epic_to_legendary",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "manyeyed_pomegranate",
    "name": "انار هزارچشم",
    "nameEn": "Many-Eyed Pomegranate",
    "rank": "epic",
    "levelMin": 1,
    "levelMax": 100,
    "role": "جادوگر / نفرین و انفجار",
    "lore": "میوه‌ای اهریمنی با صدها چشم زنده و ریشه‌های خونی؛ نگاه‌هایش ضعف دشمن را آشکار می‌کند.",
    "portrait": "assets/necromancer/companions/epic/manyeyed_pomegranate.webp",
    "stats": {
      "power": 23,
      "speed": 7,
      "endurance": 24,
      "vitality": 23,
      "intellect": 11,
      "perception": 14,
      "luck": 7,
      "faith": 16
    },
    "growthPerLevel": {
      "power": 0.48,
      "speed": 0.16,
      "endurance": 0.48,
      "vitality": 0.48,
      "intellect": 0.23,
      "perception": 0.29,
      "luck": 0.16,
      "faith": 0.34
    },
    "skills": [
      {
        "id": "manyeyed_pomegranate_1",
        "name": "نگاه هزارچشم",
        "type": "guard",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش ۲۵٪ دفاع و ایمان همه دشمنان.",
        "guardPct": 40
      },
      {
        "id": "manyeyed_pomegranate_2",
        "name": "دانه خونین",
        "type": "physical",
        "target": "single",
        "powerPct": 200,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "۱۸۰٪ آسیب جادویی به هدف نشان‌گذاری‌شده."
      },
      {
        "id": "manyeyed_pomegranate_3",
        "name": "انفجار انار",
        "type": "control",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "۱۴۰٪ آسیب به سه دشمن.",
        "attackReductionPct": 20,
        "defenseReductionPct": 20,
        "speedReductionPct": 20
      }
    ],
    "passive": {
      "name": "موهبت حماسی",
      "description": "استعداد ذاتی جادوگر / نفرین و انفجار: در شرایط ویژه نبرد، نقش تاکتیکی خود را تقویت می‌کند و با موجودات دیگر هم‌پوشانی رفتاری ندارد."
    },
    "combatAI": {
      "policy": "epic_authored_priority",
      "rules": [
        "در برابر دشمن سپردار فک فولادخوار را اولویت می‌دهد؛ هنگام خطر جدی به حالت دفاعی می‌رود.",
        "armor_break_tank",
        "use_ready_role_skill",
        "avoid_overkill",
        "protect_companion_survival"
      ],
      "tieBreak": "species_priority_then_highest_expected_value"
    },
    "evolution": {
      "nextRank": "legendary",
      "itemId": "companion_evolution_epic_to_legendary",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "chainbound_hellbeast",
    "name": "دیو زنجیرآتش",
    "nameEn": "Chainbound Hellbeast",
    "rank": "epic",
    "levelMin": 1,
    "levelMax": 100,
    "role": "مهاجم / مهار و یورش",
    "lore": "جانوری چهارپا با زنجیرهای گداخته که با کشیدن زنجیر، هدف را به محدوده حمله خود می‌کشد.",
    "portrait": "assets/necromancer/companions/epic/chainbound_hellbeast.webp",
    "stats": {
      "power": 21,
      "speed": 18,
      "endurance": 18,
      "vitality": 19,
      "intellect": 14,
      "perception": 20,
      "luck": 17,
      "faith": 13
    },
    "growthPerLevel": {
      "power": 0.44,
      "speed": 0.38,
      "endurance": 0.38,
      "vitality": 0.4,
      "intellect": 0.29,
      "perception": 0.42,
      "luck": 0.36,
      "faith": 0.27
    },
    "skills": [
      {
        "id": "chainbound_hellbeast_1",
        "name": "کشیدن زنجیر",
        "type": "physical",
        "target": "single",
        "powerPct": 170,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "کشیدن هدف به جلو و کاهش ۲۰٪ سرعتش."
      },
      {
        "id": "chainbound_hellbeast_2",
        "name": "یورش زنجیرآتش",
        "type": "magic_debuff",
        "target": "single",
        "powerPct": 90,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "۱۸۵٪ آسیب فیزیکی."
      },
      {
        "id": "chainbound_hellbeast_3",
        "name": "حلقه گداخته",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "آسیب ۹۰٪ و سوزاندن هدف برای ۳ نوبت.",
        "attackPct": 18,
        "speedPct": 18,
        "defensePct": 18
      }
    ],
    "passive": {
      "name": "موهبت حماسی",
      "description": "استعداد ذاتی مهاجم / مهار و یورش: در شرایط ویژه نبرد، نقش تاکتیکی خود را تقویت می‌کند و با موجودات دیگر هم‌پوشانی رفتاری ندارد."
    },
    "combatAI": {
      "policy": "epic_authored_priority",
      "rules": [
        "ابتدا شکار در تاریکی را در برابر دشمنان سریع فعال می‌کند؛ سپس هدف کم‌جان را با جهش پنجه‌ماه دنبال می‌کند.",
        "poisoned_target_hunter",
        "use_ready_role_skill",
        "avoid_overkill",
        "protect_companion_survival"
      ],
      "tieBreak": "species_priority_then_highest_expected_value"
    },
    "evolution": {
      "nextRank": "legendary",
      "itemId": "companion_evolution_epic_to_legendary",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "hourglass_wraith_guardian",
    "name": "نگهبان شبح‌ساعت",
    "nameEn": "Hourglass Wraith Guardian",
    "rank": "epic",
    "levelMin": 1,
    "levelMax": 100,
    "role": "کنترل / کندسازی نوبت",
    "lore": "نگهبانی شفاف که درون سینه‌اش ساعت شنی معلق است؛ زمان واکنش دشمن را کند می‌کند.",
    "portrait": "assets/necromancer/companions/epic/hourglass_wraith_guardian.webp",
    "stats": {
      "power": 13,
      "speed": 19,
      "endurance": 16,
      "vitality": 18,
      "intellect": 20,
      "perception": 21,
      "luck": 18,
      "faith": 17
    },
    "growthPerLevel": {
      "power": 0.27,
      "speed": 0.4,
      "endurance": 0.34,
      "vitality": 0.38,
      "intellect": 0.42,
      "perception": 0.44,
      "luck": 0.38,
      "faith": 0.36
    },
    "skills": [
      {
        "id": "hourglass_wraith_guardian_1",
        "name": "شن روان زمان",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "کاهش ۳۰٪ سرعت همه دشمنان.",
        "attackReductionPct": 20,
        "defenseReductionPct": 20,
        "speedReductionPct": 20
      },
      {
        "id": "hourglass_wraith_guardian_2",
        "name": "دانه واپسین",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 3,
        "durationTurns": 2,
        "description": "۱۷۰٪ آسیب جادویی به یک هدف.",
        "attackReductionPct": 20,
        "defenseReductionPct": 20,
        "speedReductionPct": 20
      },
      {
        "id": "hourglass_wraith_guardian_3",
        "name": "بازگشت لحظه",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 125,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "کاهش دو نوبت از انتظار مهارت یک همراه."
      }
    ],
    "passive": {
      "name": "موهبت حماسی",
      "description": "استعداد ذاتی کنترل / کندسازی نوبت: در شرایط ویژه نبرد، نقش تاکتیکی خود را تقویت می‌کند و با موجودات دیگر هم‌پوشانی رفتاری ندارد."
    },
    "combatAI": {
      "policy": "epic_authored_priority",
      "rules": [
        "جادوگر یا دشمن دارای مهارت آماده را گرفتار می‌کند؛ سپس قدرت مهارت او را تضعیف می‌کند.",
        "trap_skill_threats",
        "use_ready_role_skill",
        "avoid_overkill",
        "protect_companion_survival"
      ],
      "tieBreak": "species_priority_then_highest_expected_value"
    },
    "evolution": {
      "nextRank": "legendary",
      "itemId": "companion_evolution_epic_to_legendary",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "crystal_shell_behemoth",
    "name": "بهموت لاک‌بلور",
    "nameEn": "Crystal-Shell Behemoth",
    "rank": "epic",
    "levelMin": 1,
    "levelMax": 100,
    "role": "تانک / ضدحمله و سپر",
    "lore": "خرچنگی غول‌آسا با لاک بلورین و چنگال‌های سنگی؛ ضربه‌ها را در پوسته ذخیره و بازتاب می‌دهد.",
    "portrait": "assets/necromancer/companions/epic/crystal_shell_behemoth.webp",
    "stats": {
      "power": 24,
      "speed": 16,
      "endurance": 22,
      "vitality": 22,
      "intellect": 20,
      "perception": 18,
      "luck": 13,
      "faith": 19
    },
    "growthPerLevel": {
      "power": 0.48,
      "speed": 0.34,
      "endurance": 0.48,
      "vitality": 0.48,
      "intellect": 0.42,
      "perception": 0.38,
      "luck": 0.27,
      "faith": 0.4
    },
    "skills": [
      {
        "id": "crystal_shell_behemoth_1",
        "name": "چنگال بلور",
        "type": "hybrid",
        "target": "all_enemies",
        "powerPct": 165,
        "cooldownTurns": 5,
        "durationTurns": 0,
        "description": "۱۸۰٪ آسیب و شکستن ۳۰٪ سپر هدف."
      },
      {
        "id": "crystal_shell_behemoth_2",
        "name": "لاک بازتاب",
        "type": "physical",
        "target": "single",
        "powerPct": 210,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "کاهش ۴۵٪ آسیب دریافتی برای ۲ نوبت."
      },
      {
        "id": "crystal_shell_behemoth_3",
        "name": "موج خرده‌بلور",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "۱۳۰٪ آسیب به همه دشمنان نزدیک.",
        "attackPct": 18,
        "speedPct": 18,
        "defensePct": 18
      }
    ],
    "passive": {
      "name": "موهبت حماسی",
      "description": "استعداد ذاتی تانک / ضدحمله و سپر: در شرایط ویژه نبرد، نقش تاکتیکی خود را تقویت می‌کند و با موجودات دیگر هم‌پوشانی رفتاری ندارد."
    },
    "combatAI": {
      "policy": "epic_authored_priority",
      "rules": [
        "با چند دشمن نفس شکاف را انتخاب می‌کند؛ در نبرد تک‌هدفه چنگال تایتان را به‌کار می‌برد و بیداری مغاک را برای مرحله پایانی نگه می‌دارد.",
        "hybrid_boss_hunter",
        "use_ready_role_skill",
        "avoid_overkill",
        "protect_companion_survival"
      ],
      "tieBreak": "species_priority_then_highest_expected_value"
    },
    "evolution": {
      "nextRank": "legendary",
      "itemId": "companion_evolution_epic_to_legendary",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  }
]);
export function chooseEpicCompanionIntent(companionOrId, context={}) {
 const source=typeof companionOrId==='string'?NECROMANCER_EPIC_COMPANIONS.find(x=>x.id===companionOrId):companionOrId;
 if(!source) return null;
 const enemies=(context.enemies||[]).filter(x=>Number(x.hp??1)>0), allies=(context.allies||[]).filter(x=>Number(x.hp??1)>0);
 const ratio=x=>Number(x.hp??0)/Math.max(1,Number(x.maxHp)||1);
 const weakest=[...enemies].sort((a,b)=>ratio(a)-ratio(b))[0];
 const lowest=[...allies].sort((a,b)=>ratio(a)-ratio(b))[0];
 const ready=source.skills.filter(s=>Number(context.cooldowns?.[s.id]||0)<=0 && (context.canUseSkill?context.canUseSkill(s)!==false:true));
 const rules=source.combatAI.rules.join('|'); let skill=null;
 if(lowest && ratio(lowest)<.58) skill=ready.find(s=>['heal','shield'].includes(s.type)||s.target==='lowest_hp_ally'||s.target==='two_lowest_allies');
 if(!skill && enemies.length>=3) skill=ready.find(s=>['physical_multi','magic_aoe','dot_aoe','hybrid'].includes(s.type)||s.target==='three_enemies'||s.target==='all_enemies');
 if(!skill && /silence|caster|skill_threat|trap_skill/.test(rules)) skill=ready.find(s=>['silence','control','debuff'].includes(s.type));
 if(!skill && Number(context.selfHpPct??100)<55) skill=ready.find(s=>['guard','shield','heal'].includes(s.type));
 if(!skill && /buff|support|cooldown/.test(rules)) skill=ready.find(s=>['buff','shield','heal'].includes(s.type));
 if(!skill && weakest) skill=ready.find(s=>['physical','magic','physical_multi','magic_aoe','hybrid','dot','dot_aoe','silence','control','debuff'].includes(s.type));
 if(!skill) return chooseBaseIntent(source,context);
 let targetId=null;
 if(skill.target==='self') targetId=context.selfId??null;
 else if(skill.target==='lowest_hp_ally'||skill.target==='two_lowest_allies') targetId=lowest?.id??context.selfId??null;
 else if(!['all_enemies','all_allies','three_enemies','two_enemies','backline','random_ally'].includes(skill.target)) targetId=weakest?.id??null;
 return {action:'use_skill',skillId:skill.id,targetId,targetMode:skill.target,reason:'epic_species_authored_priority',skill:JSON.parse(JSON.stringify(skill))};
}
