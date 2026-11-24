/** ETRANOM V1994 — 20 Divine companions devoted to death, judgment and the afterlife. */
import { NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel, chooseNecromancerCompanionIntent as chooseBaseIntent } from './necromancer-common-companions-v1995.js';
export { NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel };
export const NECROMANCER_DIVINE_COMPANIONS = Object.freeze(
[
  {
    "id": "hades",
    "name": "هادس، فرمانروای جهان زیرین",
    "nameEn": "Hades",
    "rank": "divine",
    "mythology": "یونان باستان",
    "levelMin": 1,
    "levelMax": 100,
    "role": "پادشاه جهان زیرین / کنترل و ضربه سنگین",
    "lore": "هادس فرمانروای قلمرو مردگان در اساطیر یونان است؛ این تجسم با عصای دوشاخه و فرمان بر سایه‌ها، مرز میان زندگان و مردگان را نگهبانی می‌کند.",
    "portrait": "assets/necromancer/companions/divine/hades.webp",
    "stats": {
      "power": 68,
      "speed": 62,
      "endurance": 67,
      "vitality": 68,
      "intellect": 66,
      "perception": 65,
      "luck": 60,
      "faith": 69
    },
    "growthPerLevel": {
      "power": 0.52,
      "speed": 0.38,
      "endurance": 0.5,
      "vitality": 0.54,
      "intellect": 0.48,
      "perception": 0.45,
      "luck": 0.3,
      "faith": 0.56
    },
    "skills": [
      {
        "id": "hades_1",
        "name": "فرمان تخت سیاه",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش قدرت حمله و دفاع دشمنان."
      },
      {
        "id": "hades_2",
        "name": "نیزه دوشاخه",
        "type": "magic",
        "target": "single",
        "powerPct": 245,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "ضربه جادویی سنگین به هدف."
      },
      {
        "id": "hades_3",
        "name": "دروازه استیکس",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 1,
        "description": "مهار هدف برای یک نوبت."
      }
    ],
    "passive": {
      "name": "هراس فرمانروای خاموش",
      "description": "با ورود هادس، میدان به قلمرو مردگان بدل می‌شود و مقاومت دشمنان در برابر کنترل کاهش می‌یابد."
    },
    "combatAI": {
      "policy": "divine_underworld_sovereign",
      "rules": [
        "با ورود هادس، میدان به قلمرو مردگان بدل می‌شود و مقاومت دشمنان در برابر کنترل کاهش می‌یابد.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": null,
      "itemId": null,
      "requirements": [
        "highest_rank_no_evolution"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "osiris",
    "name": "اوزیریس، داور رستاخیز",
    "nameEn": "Osiris",
    "rank": "divine",
    "mythology": "مصر باستان",
    "levelMin": 1,
    "levelMax": 100,
    "role": "داور ارواح / پشتیبانی و احیای محدود",
    "lore": "اوزیریس خدای مردگان و رستاخیز در مصر باستان است؛ فرمانروای دادگاه ارواح که سرنوشت آنان را در تالار داوری تعیین می‌کند.",
    "portrait": "assets/necromancer/companions/divine/osiris.webp",
    "stats": {
      "power": 70,
      "speed": 64,
      "endurance": 69,
      "vitality": 70,
      "intellect": 68,
      "perception": 67,
      "luck": 62,
      "faith": 71
    },
    "growthPerLevel": {
      "power": 0.52,
      "speed": 0.38,
      "endurance": 0.5,
      "vitality": 0.54,
      "intellect": 0.48,
      "perception": 0.45,
      "luck": 0.3,
      "faith": 0.56
    },
    "skills": [
      {
        "id": "osiris_1",
        "name": "داوری قلب",
        "type": "magic",
        "target": "single",
        "powerPct": 205,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "آسیب داوری به هدف."
      },
      {
        "id": "osiris_2",
        "name": "ردای رستاخیز",
        "type": "shield",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "سپر برای متحد کم‌جان."
      },
      {
        "id": "osiris_3",
        "name": "ترازوی ماعت",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش قدرت دشمنان."
      }
    ],
    "passive": {
      "name": "ترازوی دو حقیقت",
      "description": "پس از نخستین افت شدید جان همراهان، سپری کوتاه برای ضعیف‌ترین متحد ایجاد می‌کند."
    },
    "combatAI": {
      "policy": "divine_underworld_sovereign",
      "rules": [
        "پس از نخستین افت شدید جان همراهان، سپری کوتاه برای ضعیف‌ترین متحد ایجاد می‌کند.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": null,
      "itemId": null,
      "requirements": [
        "highest_rank_no_evolution"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "persephone",
    "name": "پرسفونه، ملکه دو جهان",
    "nameEn": "Persephone",
    "rank": "divine",
    "mythology": "یونان باستان",
    "levelMin": 1,
    "levelMax": 100,
    "role": "ملکه زیرزمین / کنترل و آسیب تدریجی",
    "lore": "پرسفونه ملکه جهان زیرین و الهه چرخه بازگشت بهار است؛ دوگانگی زندگی و مرگ در قدرت او جمع شده است.",
    "portrait": "assets/necromancer/companions/divine/persephone.webp",
    "stats": {
      "power": 72,
      "speed": 66,
      "endurance": 71,
      "vitality": 72,
      "intellect": 70,
      "perception": 69,
      "luck": 64,
      "faith": 73
    },
    "growthPerLevel": {
      "power": 0.52,
      "speed": 0.38,
      "endurance": 0.5,
      "vitality": 0.54,
      "intellect": 0.48,
      "perception": 0.45,
      "luck": 0.3,
      "faith": 0.56
    },
    "skills": [
      {
        "id": "persephone_1",
        "name": "انار جهان زیرین",
        "type": "dot_aoe",
        "target": "all_enemies",
        "powerPct": 125,
        "cooldownTurns": 4,
        "durationTurns": 3,
        "description": "فرسایش روحی گروهی."
      },
      {
        "id": "persephone_2",
        "name": "فرمان بهار خاموش",
        "type": "heal",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 0,
        "description": "درمان متحد کم‌جان."
      },
      {
        "id": "persephone_3",
        "name": "تاج دو جهان",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 1,
        "description": "مهار یک دشمن."
      }
    ],
    "passive": {
      "name": "تاج انار سیاه",
      "description": "اثرات مهار و فرسایش او در برابر دشمنان زخمی نیرومندتر می‌شود."
    },
    "combatAI": {
      "policy": "divine_underworld_sovereign",
      "rules": [
        "اثرات مهار و فرسایش او در برابر دشمنان زخمی نیرومندتر می‌شود.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": null,
      "itemId": null,
      "requirements": [
        "highest_rank_no_evolution"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "orcus",
    "name": "اورکوس، نگهبان سوگند مردگان",
    "nameEn": "Orcus",
    "rank": "divine",
    "mythology": "روم باستان",
    "levelMin": 1,
    "levelMax": 100,
    "role": "شکننده سوگند / ضدباف و تنبیه",
    "lore": "اورکوس در سنت رومی با جهان مردگان و مجازات پیمان‌شکنان پیوند دارد؛ این پیکر ارواح عهدشکن را با زنجیرهای دوزخی می‌بندد.",
    "portrait": "assets/necromancer/companions/divine/orcus.webp",
    "stats": {
      "power": 74,
      "speed": 68,
      "endurance": 73,
      "vitality": 74,
      "intellect": 72,
      "perception": 71,
      "luck": 66,
      "faith": 75
    },
    "growthPerLevel": {
      "power": 0.52,
      "speed": 0.38,
      "endurance": 0.5,
      "vitality": 0.54,
      "intellect": 0.48,
      "perception": 0.45,
      "luck": 0.3,
      "faith": 0.56
    },
    "skills": [
      {
        "id": "orcus_1",
        "name": "زنجیر سوگند",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 1,
        "description": "مهار هدف."
      },
      {
        "id": "orcus_2",
        "name": "نفرین پیمان‌شکن",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش حمله دشمنان."
      },
      {
        "id": "orcus_3",
        "name": "آذرخش دوزخ",
        "type": "magic",
        "target": "single",
        "powerPct": 235,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "ضربه آتشین."
      }
    ],
    "passive": {
      "name": "زنجیر پیمان‌شکن",
      "description": "دشمنانی را که اثر تقویتی دارند در اولویت خاموش‌سازی قرار می‌دهد."
    },
    "combatAI": {
      "policy": "divine_underworld_sovereign",
      "rules": [
        "دشمنانی را که اثر تقویتی دارند در اولویت خاموش‌سازی قرار می‌دهد.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": null,
      "itemId": null,
      "requirements": [
        "highest_rank_no_evolution"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "dis_pater",
    "name": "دیس پاتر، پدر ثروت زیرزمین",
    "nameEn": "Dis Pater",
    "rank": "divine",
    "mythology": "روم باستان",
    "levelMin": 1,
    "levelMax": 100,
    "role": "فرمانروای ژرفا / دفاع و ضربه",
    "lore": "دیس پاتر خدای رومی جهان زیرین و ثروت نهفته در زمین است؛ قدرت او از ژرفای خاک و گنج‌های مدفون برمی‌خیزد.",
    "portrait": "assets/necromancer/companions/divine/dis_pater.webp",
    "stats": {
      "power": 76,
      "speed": 70,
      "endurance": 75,
      "vitality": 76,
      "intellect": 74,
      "perception": 73,
      "luck": 68,
      "faith": 77
    },
    "growthPerLevel": {
      "power": 0.52,
      "speed": 0.38,
      "endurance": 0.5,
      "vitality": 0.54,
      "intellect": 0.48,
      "perception": 0.45,
      "luck": 0.3,
      "faith": 0.56
    },
    "skills": [
      {
        "id": "dis_pater_1",
        "name": "گنج مدفون",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "افزایش قدرت و دفاع خود."
      },
      {
        "id": "dis_pater_2",
        "name": "شکاف ژرفا",
        "type": "physical",
        "target": "single",
        "powerPct": 230,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "ضربه سنگین."
      },
      {
        "id": "dis_pater_3",
        "name": "پوسته زمین",
        "type": "guard",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "کاهش آسیب دریافتی."
      }
    ],
    "passive": {
      "name": "گنج مدفون",
      "description": "با کاهش جان خود، دفاع موقت می‌گیرد و ضربه بعدی‌اش قدرت بیشتری می‌یابد."
    },
    "combatAI": {
      "policy": "divine_underworld_sovereign",
      "rules": [
        "با کاهش جان خود، دفاع موقت می‌گیرد و ضربه بعدی‌اش قدرت بیشتری می‌یابد.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": null,
      "itemId": null,
      "requirements": [
        "highest_rank_no_evolution"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "mors",
    "name": "مورس، تجسم مرگ",
    "nameEn": "Mors",
    "rank": "divine",
    "mythology": "روم باستان",
    "levelMin": 1,
    "levelMax": 100,
    "role": "درَوگر الهی / اجرای هدف کم‌جان",
    "lore": "مورس تجسم مرگ در اساطیر روم است؛ نه پادشاهی با چهره انسانی، بلکه حضور خاموشی که پایان عمر را اعلام می‌کند.",
    "portrait": "assets/necromancer/companions/divine/mors.webp",
    "stats": {
      "power": 68,
      "speed": 62,
      "endurance": 67,
      "vitality": 68,
      "intellect": 66,
      "perception": 65,
      "luck": 60,
      "faith": 69
    },
    "growthPerLevel": {
      "power": 0.52,
      "speed": 0.38,
      "endurance": 0.5,
      "vitality": 0.54,
      "intellect": 0.48,
      "perception": 0.45,
      "luck": 0.3,
      "faith": 0.56
    },
    "skills": [
      {
        "id": "mors_1",
        "name": "داس پایان",
        "type": "physical",
        "target": "single",
        "powerPct": 275,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "ضربه سنگین به هدف."
      },
      {
        "id": "mors_2",
        "name": "سکوت آخرین نفس",
        "type": "silence",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 1,
        "description": "سکوت هدف."
      },
      {
        "id": "mors_3",
        "name": "سایه پایان",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش توان دشمنان."
      }
    ],
    "passive": {
      "name": "آخرین نفس",
      "description": "مهارت نهایی را روی دشمن کم‌جان متمرکز می‌کند تا از اتلاف آسیب جلوگیری شود."
    },
    "combatAI": {
      "policy": "divine_underworld_sovereign",
      "rules": [
        "مهارت نهایی را روی دشمن کم‌جان متمرکز می‌کند تا از اتلاف آسیب جلوگیری شود.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": null,
      "itemId": null,
      "requirements": [
        "highest_rank_no_evolution"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "donn",
    "name": "دون، سالار سرزمین مردگان",
    "nameEn": "Donn",
    "rank": "divine",
    "mythology": "ایرلند؛ اساطیر سلتی",
    "levelMin": 1,
    "levelMax": 100,
    "role": "راهنمای ارواح / آسیب روحی",
    "lore": "دون در سنت ایرلندی با سرزمین مردگان و جزیره‌ای در غرب پیوند دارد که ارواح به سوی آن می‌روند.",
    "portrait": "assets/necromancer/companions/divine/donn.webp",
    "stats": {
      "power": 70,
      "speed": 64,
      "endurance": 69,
      "vitality": 70,
      "intellect": 68,
      "perception": 67,
      "luck": 62,
      "faith": 71
    },
    "growthPerLevel": {
      "power": 0.52,
      "speed": 0.38,
      "endurance": 0.5,
      "vitality": 0.54,
      "intellect": 0.48,
      "perception": 0.45,
      "luck": 0.3,
      "faith": 0.56
    },
    "skills": [
      {
        "id": "donn_1",
        "name": "فراخوان جزیره غرب",
        "type": "dot_aoe",
        "target": "all_enemies",
        "powerPct": 115,
        "cooldownTurns": 4,
        "durationTurns": 3,
        "description": "آسیب روحی تدریجی."
      },
      {
        "id": "donn_2",
        "name": "راه ارواح",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "افزایش سرعت و ادراک."
      },
      {
        "id": "donn_3",
        "name": "مه غربی",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش دقت و سرعت."
      }
    ],
    "passive": {
      "name": "جزیره خاموشان",
      "description": "در آغاز نبرد، دشمنان را با هراس روحی تضعیف می‌کند."
    },
    "combatAI": {
      "policy": "divine_underworld_sovereign",
      "rules": [
        "در آغاز نبرد، دشمنان را با هراس روحی تضعیف می‌کند.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": null,
      "itemId": null,
      "requirements": [
        "highest_rank_no_evolution"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "tuoni",
    "name": "تونی، خدای رود مرگ",
    "nameEn": "Tuoni",
    "rank": "divine",
    "mythology": "فنلاند؛ اساطیر فینّی",
    "levelMin": 1,
    "levelMax": 100,
    "role": "فرمانروای رود / فرسایش و کندسازی",
    "lore": "تونی فرمانروای سرزمین مردگان توئونیلا در اساطیر فنلاندی است؛ رود سیاه مرز قلمرو او را از جهان زندگان جدا می‌کند.",
    "portrait": "assets/necromancer/companions/divine/tuoni.webp",
    "stats": {
      "power": 72,
      "speed": 66,
      "endurance": 71,
      "vitality": 72,
      "intellect": 70,
      "perception": 69,
      "luck": 64,
      "faith": 73
    },
    "growthPerLevel": {
      "power": 0.52,
      "speed": 0.38,
      "endurance": 0.5,
      "vitality": 0.54,
      "intellect": 0.48,
      "perception": 0.45,
      "luck": 0.3,
      "faith": 0.56
    },
    "skills": [
      {
        "id": "tuoni_1",
        "name": "رود سیاه",
        "type": "dot_aoe",
        "target": "all_enemies",
        "powerPct": 120,
        "cooldownTurns": 4,
        "durationTurns": 3,
        "description": "فرسایش گروهی."
      },
      {
        "id": "tuoni_2",
        "name": "موج مرداب",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش سرعت."
      },
      {
        "id": "tuoni_3",
        "name": "غرقاب خاموش",
        "type": "magic",
        "target": "single",
        "powerPct": 225,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "ضربه آب و تاریکی."
      }
    ],
    "passive": {
      "name": "رود بی‌بازگشت",
      "description": "سرعت دشمنان را کاهش می‌دهد و آسیب تدریجی رود مرگ را اعمال می‌کند."
    },
    "combatAI": {
      "policy": "divine_underworld_sovereign",
      "rules": [
        "سرعت دشمنان را کاهش می‌دهد و آسیب تدریجی رود مرگ را اعمال می‌کند.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": null,
      "itemId": null,
      "requirements": [
        "highest_rank_no_evolution"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "tuonetar",
    "name": "توئنتار، بانوی توئونیلا",
    "nameEn": "Tuonetar",
    "rank": "divine",
    "mythology": "فنلاند؛ اساطیر فینّی",
    "levelMin": 1,
    "levelMax": 100,
    "role": "ملکه مردگان / کنترل گروهی",
    "lore": "توئنتار ملکه سرزمین مردگان و همسر تونی است؛ در روایت‌ها با جامی از نوشیدنی جهان زیرین تصویر می‌شود.",
    "portrait": "assets/necromancer/companions/divine/tuonetar.webp",
    "stats": {
      "power": 74,
      "speed": 68,
      "endurance": 73,
      "vitality": 74,
      "intellect": 72,
      "perception": 71,
      "luck": 66,
      "faith": 75
    },
    "growthPerLevel": {
      "power": 0.52,
      "speed": 0.38,
      "endurance": 0.5,
      "vitality": 0.54,
      "intellect": 0.48,
      "perception": 0.45,
      "luck": 0.3,
      "faith": 0.56
    },
    "skills": [
      {
        "id": "tuonetar_1",
        "name": "جام فراموشی",
        "type": "silence",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 1,
        "description": "سکوت هدف."
      },
      {
        "id": "tuonetar_2",
        "name": "مه توئونیلا",
        "type": "control",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 6,
        "durationTurns": 1,
        "description": "اختلال گروهی کوتاه."
      },
      {
        "id": "tuonetar_3",
        "name": "دست ملکه",
        "type": "magic",
        "target": "single",
        "powerPct": 220,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "ضربه جادویی."
      }
    ],
    "passive": {
      "name": "جام فراموشی",
      "description": "توانایی‌های دشمنان را برای یک نوبت مختل می‌کند."
    },
    "combatAI": {
      "policy": "divine_underworld_sovereign",
      "rules": [
        "توانایی‌های دشمنان را برای یک نوبت مختل می‌کند.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": null,
      "itemId": null,
      "requirements": [
        "highest_rank_no_evolution"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "kalma",
    "name": "کالما، بانوی گورستان",
    "nameEn": "Kalma",
    "rank": "divine",
    "mythology": "فنلاند؛ اساطیر فینّی",
    "levelMin": 1,
    "levelMax": 100,
    "role": "الهه گورستان / زهر و فرسایش",
    "lore": "کالما با گورستان، بوی مرگ و آرامگاه‌ها پیوند دارد؛ حضورش خاک گور را به نیرویی فرساینده بدل می‌کند.",
    "portrait": "assets/necromancer/companions/divine/kalma.webp",
    "stats": {
      "power": 76,
      "speed": 70,
      "endurance": 75,
      "vitality": 76,
      "intellect": 74,
      "perception": 73,
      "luck": 68,
      "faith": 77
    },
    "growthPerLevel": {
      "power": 0.52,
      "speed": 0.38,
      "endurance": 0.5,
      "vitality": 0.54,
      "intellect": 0.48,
      "perception": 0.45,
      "luck": 0.3,
      "faith": 0.56
    },
    "skills": [
      {
        "id": "kalma_1",
        "name": "بوی خاک گور",
        "type": "dot_aoe",
        "target": "all_enemies",
        "powerPct": 110,
        "cooldownTurns": 4,
        "durationTurns": 3,
        "description": "فرسایش گروهی."
      },
      {
        "id": "kalma_2",
        "name": "لمس آرامگاه",
        "type": "dot",
        "target": "single",
        "powerPct": 190,
        "cooldownTurns": 3,
        "durationTurns": 3,
        "description": "فرسایش تک‌هدف."
      },
      {
        "id": "kalma_3",
        "name": "خاک سرد",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش قدرت حمله."
      }
    ],
    "passive": {
      "name": "نَفَس گورستان",
      "description": "اثر فرسایش را بر دشمنانی که از قبل زخمی‌اند تشدید می‌کند."
    },
    "combatAI": {
      "policy": "divine_underworld_sovereign",
      "rules": [
        "اثر فرسایش را بر دشمنانی که از قبل زخمی‌اند تشدید می‌کند.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": null,
      "itemId": null,
      "requirements": [
        "highest_rank_no_evolution"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "aita",
    "name": "آیتا، شاه جهان زیرین",
    "nameEn": "Aita",
    "rank": "divine",
    "mythology": "اتروسکی",
    "levelMin": 1,
    "levelMax": 100,
    "role": "شاه مردگان / ضربه جادویی",
    "lore": "آیتا فرمانروای جهان زیرین در سنت اتروسکی است و اغلب با پوشش گرگ‌مانند و هیبت شاهانه تصویر می‌شود.",
    "portrait": "assets/necromancer/companions/divine/aita.webp",
    "stats": {
      "power": 68,
      "speed": 62,
      "endurance": 67,
      "vitality": 68,
      "intellect": 66,
      "perception": 65,
      "luck": 60,
      "faith": 69
    },
    "growthPerLevel": {
      "power": 0.52,
      "speed": 0.38,
      "endurance": 0.5,
      "vitality": 0.54,
      "intellect": 0.48,
      "perception": 0.45,
      "luck": 0.3,
      "faith": 0.56
    },
    "skills": [
      {
        "id": "aita_1",
        "name": "نقاب گرگین",
        "type": "guard",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "کاهش آسیب دریافتی."
      },
      {
        "id": "aita_2",
        "name": "چنگال جهان زیرین",
        "type": "physical",
        "target": "single",
        "powerPct": 245,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "ضربه فیزیکی."
      },
      {
        "id": "aita_3",
        "name": "فرمان سایه‌ها",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش دفاع."
      }
    ],
    "passive": {
      "name": "نقاب گرگین",
      "description": "در برابر حملات جادویی مقاومت می‌گیرد و به مهاجم پاسخ می‌دهد."
    },
    "combatAI": {
      "policy": "divine_underworld_sovereign",
      "rules": [
        "در برابر حملات جادویی مقاومت می‌گیرد و به مهاجم پاسخ می‌دهد.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": null,
      "itemId": null,
      "requirements": [
        "highest_rank_no_evolution"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "vanth",
    "name": "وانث، فرشته گذر ارواح",
    "nameEn": "Vanth",
    "rank": "divine",
    "mythology": "اتروسکی",
    "levelMin": 1,
    "levelMax": 100,
    "role": "فرشته مرگ / پشتیبانی و کنترل",
    "lore": "وانث موجودی بالدار در هنر اتروسکی است که در صحنه‌های مرگ و سفر روح به جهان زیرین حضور دارد؛ اغلب طومار سرنوشت همراه اوست.",
    "portrait": "assets/necromancer/companions/divine/vanth.webp",
    "stats": {
      "power": 70,
      "speed": 64,
      "endurance": 69,
      "vitality": 70,
      "intellect": 68,
      "perception": 67,
      "luck": 62,
      "faith": 71
    },
    "growthPerLevel": {
      "power": 0.52,
      "speed": 0.38,
      "endurance": 0.5,
      "vitality": 0.54,
      "intellect": 0.48,
      "perception": 0.45,
      "luck": 0.3,
      "faith": 0.56
    },
    "skills": [
      {
        "id": "vanth_1",
        "name": "طومار سرنوشت",
        "type": "buff",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 6,
        "durationTurns": 2,
        "description": "افزایش ادراک و شانس متحدان."
      },
      {
        "id": "vanth_2",
        "name": "مشعل گذر",
        "type": "magic",
        "target": "single",
        "powerPct": 210,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "آسیب نور سرد."
      },
      {
        "id": "vanth_3",
        "name": "بال‌های بدرقه",
        "type": "shield",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "سپر متحد کم‌جان."
      }
    ],
    "passive": {
      "name": "طومار واپسین",
      "description": "سرنوشت هدف را نشان می‌کند و احتمال اثرگذاری مهارت‌های متحدان را بالا می‌برد."
    },
    "combatAI": {
      "policy": "divine_underworld_sovereign",
      "rules": [
        "سرنوشت هدف را نشان می‌کند و احتمال اثرگذاری مهارت‌های متحدان را بالا می‌برد.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": null,
      "itemId": null,
      "requirements": [
        "highest_rank_no_evolution"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "charun",
    "name": "خارون اتروسکی، دربان دوزخ",
    "nameEn": "Charun",
    "rank": "divine",
    "mythology": "اتروسکی",
    "levelMin": 1,
    "levelMax": 100,
    "role": "دربان جهان زیرین / کنترل و ضربه",
    "lore": "خارون در سنت اتروسکی نگهبان گذر به جهان مردگان است؛ با چکش یا سلاحی سنگین دروازه را پاس می‌دهد.",
    "portrait": "assets/necromancer/companions/divine/charun.webp",
    "stats": {
      "power": 72,
      "speed": 66,
      "endurance": 71,
      "vitality": 72,
      "intellect": 70,
      "perception": 69,
      "luck": 64,
      "faith": 73
    },
    "growthPerLevel": {
      "power": 0.52,
      "speed": 0.38,
      "endurance": 0.5,
      "vitality": 0.54,
      "intellect": 0.48,
      "perception": 0.45,
      "luck": 0.3,
      "faith": 0.56
    },
    "skills": [
      {
        "id": "charun_1",
        "name": "چکش دروازه",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 1,
        "description": "مهار هدف."
      },
      {
        "id": "charun_2",
        "name": "گذر بی‌بازگشت",
        "type": "physical",
        "target": "single",
        "powerPct": 250,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "ضربه سنگین."
      },
      {
        "id": "charun_3",
        "name": "نگهبان آستانه",
        "type": "guard",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "کاهش آسیب دریافتی."
      }
    ],
    "passive": {
      "name": "چکش دروازه",
      "description": "هدف را برای یک نوبت از اقدام مؤثر بازمی‌دارد."
    },
    "combatAI": {
      "policy": "divine_underworld_sovereign",
      "rules": [
        "هدف را برای یک نوبت از اقدام مؤثر بازمی‌دارد.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": null,
      "itemId": null,
      "requirements": [
        "highest_rank_no_evolution"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "yanluo_wang",
    "name": "یانلوو وانگ، شاه دادگاه دهم",
    "nameEn": "Yanluo Wang",
    "rank": "divine",
    "mythology": "چین؛ آیین‌ها و اساطیر عامیانه",
    "levelMin": 1,
    "levelMax": 100,
    "role": "قاضی مردگان / داوری و کاهش توان",
    "lore": "یانلوو وانگ فرمانروای دادگاه جهان زیرین در سنت چینی است؛ کردار ارواح را می‌سنجد و حکم آنان را صادر می‌کند.",
    "portrait": "assets/necromancer/companions/divine/yanluo_wang.webp",
    "stats": {
      "power": 74,
      "speed": 68,
      "endurance": 73,
      "vitality": 74,
      "intellect": 72,
      "perception": 71,
      "luck": 66,
      "faith": 75
    },
    "growthPerLevel": {
      "power": 0.52,
      "speed": 0.38,
      "endurance": 0.5,
      "vitality": 0.54,
      "intellect": 0.48,
      "perception": 0.45,
      "luck": 0.3,
      "faith": 0.56
    },
    "skills": [
      {
        "id": "yanluo_wang_1",
        "name": "حکم ده دادگاه",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 3,
        "description": "کاهش قدرت هدف."
      },
      {
        "id": "yanluo_wang_2",
        "name": "مهر قاضی",
        "type": "silence",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 1,
        "description": "سکوت هدف."
      },
      {
        "id": "yanluo_wang_3",
        "name": "فرمان قضایی",
        "type": "magic",
        "target": "all_enemies",
        "powerPct": 135,
        "cooldownTurns": 5,
        "durationTurns": 0,
        "description": "آسیب جادویی گروهی."
      }
    ],
    "passive": {
      "name": "حکم ده دادگاه",
      "description": "بر دشمن دارای بیشترین قدرت، نشان داوری می‌گذارد و توانش را کاهش می‌دهد."
    },
    "combatAI": {
      "policy": "divine_underworld_sovereign",
      "rules": [
        "بر دشمن دارای بیشترین قدرت، نشان داوری می‌گذارد و توانش را کاهش می‌دهد.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": null,
      "itemId": null,
      "requirements": [
        "highest_rank_no_evolution"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "meng_po",
    "name": "مِنگ پو، بانوی فراموشی",
    "nameEn": "Meng Po",
    "rank": "divine",
    "mythology": "چین؛ اساطیر عامیانه",
    "levelMin": 1,
    "levelMax": 100,
    "role": "بانوی چرخه تولد / پاکسازی و پشتیبانی",
    "lore": "مِنگ پو به ارواح پیش از تولد دوباره نوشیدنی فراموشی می‌دهد تا خاطرات زندگی پیشین را پشت سر بگذارند.",
    "portrait": "assets/necromancer/companions/divine/meng_po.webp",
    "stats": {
      "power": 76,
      "speed": 70,
      "endurance": 75,
      "vitality": 76,
      "intellect": 74,
      "perception": 73,
      "luck": 68,
      "faith": 77
    },
    "growthPerLevel": {
      "power": 0.52,
      "speed": 0.38,
      "endurance": 0.5,
      "vitality": 0.54,
      "intellect": 0.48,
      "perception": 0.45,
      "luck": 0.3,
      "faith": 0.56
    },
    "skills": [
      {
        "id": "meng_po_1",
        "name": "آش فراموشی",
        "type": "heal",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 0,
        "description": "درمان متحد."
      },
      {
        "id": "meng_po_2",
        "name": "پاک‌کردن خاطره",
        "type": "shield",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "سپر متحد."
      },
      {
        "id": "meng_po_3",
        "name": "مه بی‌نامی",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش ادراک دشمنان."
      }
    ],
    "passive": {
      "name": "آش فراموشی",
      "description": "یک اثر منفی را از متحد ضعیف پاک می‌کند و برای او سپر می‌سازد."
    },
    "combatAI": {
      "policy": "divine_underworld_sovereign",
      "rules": [
        "یک اثر منفی را از متحد ضعیف پاک می‌کند و برای او سپر می‌سازد.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": null,
      "itemId": null,
      "requirements": [
        "highest_rank_no_evolution"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "xolotl",
    "name": "شولوتل، راهنمای خورشید مردگان",
    "nameEn": "Xolotl",
    "rank": "divine",
    "mythology": "آزتک؛ مکزیک مرکزی",
    "levelMin": 1,
    "levelMax": 100,
    "role": "راهنمای ارواح / سرعت و یورش",
    "lore": "شولوتل خدای همراهی‌کننده مردگان و راهنمای خورشید در جهان زیرین در سنت آزتکی است؛ با سگ و دگرگونی پیوند دارد.",
    "portrait": "assets/necromancer/companions/divine/xolotl.webp",
    "stats": {
      "power": 68,
      "speed": 62,
      "endurance": 67,
      "vitality": 68,
      "intellect": 66,
      "perception": 65,
      "luck": 60,
      "faith": 69
    },
    "growthPerLevel": {
      "power": 0.52,
      "speed": 0.38,
      "endurance": 0.5,
      "vitality": 0.54,
      "intellect": 0.48,
      "perception": 0.45,
      "luck": 0.3,
      "faith": 0.56
    },
    "skills": [
      {
        "id": "xolotl_1",
        "name": "گام سگ آتشین",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "افزایش سرعت و قدرت."
      },
      {
        "id": "xolotl_2",
        "name": "دندان گذرگاه",
        "type": "physical",
        "target": "single",
        "powerPct": 235,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "ضربه سریع."
      },
      {
        "id": "xolotl_3",
        "name": "مشعل خورشید مردگان",
        "type": "magic",
        "target": "all_enemies",
        "powerPct": 125,
        "cooldownTurns": 5,
        "durationTurns": 0,
        "description": "آسیب گروهی."
      }
    ],
    "passive": {
      "name": "سگِ گذرگاه",
      "description": "پس از اجرای مهارت، برای حمله بعدی سرعت و دقت بیشتری می‌گیرد."
    },
    "combatAI": {
      "policy": "divine_underworld_sovereign",
      "rules": [
        "پس از اجرای مهارت، برای حمله بعدی سرعت و دقت بیشتری می‌گیرد.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": null,
      "itemId": null,
      "requirements": [
        "highest_rank_no_evolution"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "ogbunabali",
    "name": "اوگبونابالی، خدای مرگ",
    "nameEn": "Ogbunabali",
    "rank": "divine",
    "mythology": "ایگبو؛ نیجریه",
    "levelMin": 1,
    "levelMax": 100,
    "role": "خدای مرگ / ضربه و هراس",
    "lore": "اوگبونابالی در برخی سنت‌های ایگبو به‌عنوان خدای مرگ شناخته می‌شود؛ نام او با بردن انسان‌ها در شب مرگ پیوند دارد.",
    "portrait": "assets/necromancer/companions/divine/ogbunabali.webp",
    "stats": {
      "power": 70,
      "speed": 64,
      "endurance": 69,
      "vitality": 70,
      "intellect": 68,
      "perception": 67,
      "luck": 62,
      "faith": 71
    },
    "growthPerLevel": {
      "power": 0.52,
      "speed": 0.38,
      "endurance": 0.5,
      "vitality": 0.54,
      "intellect": 0.48,
      "perception": 0.45,
      "luck": 0.3,
      "faith": 0.56
    },
    "skills": [
      {
        "id": "ogbunabali_1",
        "name": "ندای نیمه‌شب",
        "type": "magic",
        "target": "single",
        "powerPct": 250,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "ضربه روحی."
      },
      {
        "id": "ogbunabali_2",
        "name": "سایه مرگ",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش حمله."
      },
      {
        "id": "ogbunabali_3",
        "name": "خاموشی ناگهانی",
        "type": "silence",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 1,
        "description": "سکوت هدف."
      }
    ],
    "passive": {
      "name": "ندای نیمه‌شب",
      "description": "به هدفی که تازه مهارت اجرا کرده آسیب روحی وارد می‌کند."
    },
    "combatAI": {
      "policy": "divine_underworld_sovereign",
      "rules": [
        "به هدفی که تازه مهارت اجرا کرده آسیب روحی وارد می‌کند.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": null,
      "itemId": null,
      "requirements": [
        "highest_rank_no_evolution"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "namtar",
    "name": "نامتار، وزیر سرنوشت",
    "nameEn": "Namtar",
    "rank": "divine",
    "mythology": "میان‌رودان؛ سومری و اکدی",
    "levelMin": 1,
    "levelMax": 100,
    "role": "فرستاده مرگ / بیماری و فرسایش",
    "lore": "نامتار در اساطیر میان‌رودان وزیر جهان زیرین و حامل بیماری و سرنوشت مرگبار است؛ در این پیکر به‌جای تکرار خدایان مشهور، نقش فرستاده حکم را دارد.",
    "portrait": "assets/necromancer/companions/divine/namtar.webp",
    "stats": {
      "power": 72,
      "speed": 66,
      "endurance": 71,
      "vitality": 72,
      "intellect": 70,
      "perception": 69,
      "luck": 64,
      "faith": 73
    },
    "growthPerLevel": {
      "power": 0.52,
      "speed": 0.38,
      "endurance": 0.5,
      "vitality": 0.54,
      "intellect": 0.48,
      "perception": 0.45,
      "luck": 0.3,
      "faith": 0.56
    },
    "skills": [
      {
        "id": "namtar_1",
        "name": "مهر بیماری",
        "type": "dot_aoe",
        "target": "all_enemies",
        "powerPct": 120,
        "cooldownTurns": 4,
        "durationTurns": 3,
        "description": "فرسایش گروهی."
      },
      {
        "id": "namtar_2",
        "name": "فرمان وزیر",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش دفاع."
      },
      {
        "id": "namtar_3",
        "name": "تب سرنوشت",
        "type": "dot",
        "target": "single",
        "powerPct": 205,
        "cooldownTurns": 3,
        "durationTurns": 3,
        "description": "فرسایش تک‌هدف."
      }
    ],
    "passive": {
      "name": "مهر بیماری",
      "description": "اثرات فرسایشی را روی دشمنان متعدد پخش می‌کند."
    },
    "combatAI": {
      "policy": "divine_underworld_sovereign",
      "rules": [
        "اثرات فرسایشی را روی دشمنان متعدد پخش می‌کند.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": null,
      "itemId": null,
      "requirements": [
        "highest_rank_no_evolution"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "baron_samedi",
    "name": "بارون سامدی، ارباب گورستان",
    "nameEn": "Baron Samedi",
    "rank": "divine",
    "mythology": "هائیتی؛ وودو",
    "levelMin": 1,
    "levelMax": 100,
    "role": "روح لوا مرگ / کنترل و احیا",
    "lore": "بارون سامدی از لواهای مرتبط با مرگ و گورستان در وودوی هائیتی است؛ نگهبان گذر میان زندگی و مرگ و چهره‌ای آیینی و متمایز.",
    "portrait": "assets/necromancer/companions/divine/baron_samedi.webp",
    "stats": {
      "power": 74,
      "speed": 68,
      "endurance": 73,
      "vitality": 74,
      "intellect": 72,
      "perception": 71,
      "luck": 66,
      "faith": 75
    },
    "growthPerLevel": {
      "power": 0.52,
      "speed": 0.38,
      "endurance": 0.5,
      "vitality": 0.54,
      "intellect": 0.48,
      "perception": 0.45,
      "luck": 0.3,
      "faith": 0.56
    },
    "skills": [
      {
        "id": "baron_samedi_1",
        "name": "سلام گورستان",
        "type": "shield",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "سپر اضطراری."
      },
      {
        "id": "baron_samedi_2",
        "name": "عصای استخوانی",
        "type": "physical",
        "target": "single",
        "powerPct": 230,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "ضربه فیزیکی."
      },
      {
        "id": "baron_samedi_3",
        "name": "رقص میان دو جهان",
        "type": "control",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 6,
        "durationTurns": 1,
        "description": "اختلال گروهی."
      }
    ],
    "passive": {
      "name": "سلامِ گورستان",
      "description": "یک بار در نبرد، پس از سقوط به آستانه مرگ، سپر اضطراری فعال می‌کند."
    },
    "combatAI": {
      "policy": "divine_underworld_sovereign",
      "rules": [
        "یک بار در نبرد، پس از سقوط به آستانه مرگ، سپر اضطراری فعال می‌کند.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": null,
      "itemId": null,
      "requirements": [
        "highest_rank_no_evolution"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "sedna",
    "name": "سدنا، بانوی ژرفای مردگان",
    "nameEn": "Sedna",
    "rank": "divine",
    "mythology": "اینوئیت؛ سنت‌های قطبی",
    "levelMin": 1,
    "levelMax": 100,
    "role": "بانوی ژرفا / کنترل آب و فرسایش",
    "lore": "سدنا در برخی روایت‌های اینوئیت فرمانروای ژرفای دریا و موجودات دریایی است؛ این نسخه بر پیوند او با قلمرو تاریک زیر آب و ارواح غرق‌شدگان تکیه دارد.",
    "portrait": "assets/necromancer/companions/divine/sedna.webp",
    "stats": {
      "power": 76,
      "speed": 70,
      "endurance": 75,
      "vitality": 76,
      "intellect": 74,
      "perception": 73,
      "luck": 68,
      "faith": 77
    },
    "growthPerLevel": {
      "power": 0.52,
      "speed": 0.38,
      "endurance": 0.5,
      "vitality": 0.54,
      "intellect": 0.48,
      "perception": 0.45,
      "luck": 0.3,
      "faith": 0.56
    },
    "skills": [
      {
        "id": "sedna_1",
        "name": "مدفن ژرفا",
        "type": "dot_aoe",
        "target": "all_enemies",
        "powerPct": 120,
        "cooldownTurns": 4,
        "durationTurns": 3,
        "description": "آسیب آبی تدریجی."
      },
      {
        "id": "sedna_2",
        "name": "دست‌های زیر یخ",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 1,
        "description": "مهار هدف."
      },
      {
        "id": "sedna_3",
        "name": "خشم اقیانوس خاموش",
        "type": "magic",
        "target": "single",
        "powerPct": 245,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "ضربه آب ژرف."
      }
    ],
    "passive": {
      "name": "مدفنِ ژرفا",
      "description": "دشمنان را با فشار ژرفا کند می‌کند و آسیب آبی تدریجی وارد می‌سازد."
    },
    "combatAI": {
      "policy": "divine_underworld_sovereign",
      "rules": [
        "دشمنان را با فشار ژرفا کند می‌کند و آسیب آبی تدریجی وارد می‌سازد.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": null,
      "itemId": null,
      "requirements": [
        "highest_rank_no_evolution"
      ],
      "preserveLevel": true
    }
  }
]
);

export function chooseDivineCompanionIntent(companionOrId, context={}) {
 const source=typeof companionOrId==='string'?NECROMANCER_DIVINE_COMPANIONS.find(x=>x.id===companionOrId):companionOrId;
 if(!source) return null;
 const enemies=(context.enemies||[]).filter(x=>Number(x.hp??1)>0), allies=(context.allies||[]).filter(x=>Number(x.hp??1)>0);
 const ratio=x=>Number(x.hp??0)/Math.max(1,Number(x.maxHp)||1);
 const weakest=[...enemies].sort((a,b)=>ratio(a)-ratio(b))[0], lowest=[...allies].sort((a,b)=>ratio(a)-ratio(b))[0];
 const ready=source.skills.filter(s=>Number(context.cooldowns?.[s.id]||0)<=0 && (context.canUseSkill?context.canUseSkill(s)!==false:true));
 let skill=null;
 if(lowest&&ratio(lowest)<.45) skill=ready.find(s=>['heal','shield'].includes(s.type));
 if(!skill&&enemies.length>=2) skill=ready.find(s=>s.target==='all_enemies');
 if(!skill&&Number(context.selfHpPct??100)<40) skill=ready.find(s=>['guard','shield'].includes(s.type));
 if(!skill) skill=ready.find(s=>['control','silence','debuff'].includes(s.type));
 if(!skill&&weakest) skill=ready.find(s=>['physical','magic','dot'].includes(s.type));
 if(!skill) return chooseBaseIntent(source,context);
 let targetId=null; if(skill.target==='self') targetId=context.selfId??null; else if(skill.target==='lowest_hp_ally') targetId=lowest?.id??context.selfId??null; else if(!['all_enemies','all_allies'].includes(skill.target)) targetId=weakest?.id??null;
 return {action:'use_skill',skillId:skill.id,targetId,targetMode:skill.target,reason:'divine_afterlife_authored_priority',skill:JSON.parse(JSON.stringify(skill))};
}
