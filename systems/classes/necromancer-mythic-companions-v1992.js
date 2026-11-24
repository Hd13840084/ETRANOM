/** ETRANOM V1992 — 20 myth-rooted Mythic Necromancer companions. */
import { NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel, chooseNecromancerCompanionIntent as chooseBaseIntent } from './necromancer-common-companions-v1995.js';
export { NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel };
export const NECROMANCER_MYTHIC_COMPANIONS = Object.freeze([
  {
    "id": "apep",
    "name": "آپوفیس، مارِ آشوب",
    "nameEn": "Apep",
    "rank": "mythic",
    "mythology": "مصر باستان",
    "levelMin": 1,
    "levelMax": 100,
    "role": "اژدهای آشوب / فرسایش گروهی",
    "lore": "آپوفیس مار عظیم آشوب است که در اسطوره‌های مصری هر شب با رع برای بلعیدن خورشید می‌جنگد؛ این تجسم بر فروپاشی نظم و فرسایش چند دشمن تمرکز دارد.",
    "portrait": "assets/necromancer/companions/mythic/apep.webp",
    "stats": {
      "power": 47,
      "speed": 32,
      "endurance": 43,
      "vitality": 45,
      "intellect": 39,
      "perception": 46,
      "luck": 28,
      "faith": 36
    },
    "growthPerLevel": {
      "power": 0.42,
      "speed": 0.28,
      "endurance": 0.39,
      "vitality": 0.4,
      "intellect": 0.35,
      "perception": 0.41,
      "luck": 0.24,
      "faith": 0.32
    },
    "skills": [
      {
        "id": "apep_1",
        "name": "بلعیدن روشنایی",
        "type": "dot_aoe",
        "target": "all_enemies",
        "powerPct": 155,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "آسیب تاریکی گروهی و فرسایش تدریجی."
      },
      {
        "id": "apep_2",
        "name": "حلقه بی‌نظمی",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش قدرت حمله همه دشمنان."
      },
      {
        "id": "apep_3",
        "name": "نیش شب ابدی",
        "type": "magic",
        "target": "single",
        "powerPct": 235,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "ضربه سنگین به هدف منتخب."
      }
    ],
    "passive": {
      "name": "موهبت اسطوره‌ای",
      "description": "کسوفِ آشوب: در آغاز نبرد، مقاومت دشمنان در برابر اثرات فرسایشی را می‌شکند."
    },
    "combatAI": {
      "policy": "mythic_signature_priority",
      "rules": [
        "کسوفِ آشوب: در آغاز نبرد، مقاومت دشمنان در برابر اثرات فرسایشی را می‌شکند.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": "divine",
      "itemId": "companion_evolution_mythic_to_divine",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "tiamat",
    "name": "تیامات، مادر اژدهایان",
    "nameEn": "Tiamat",
    "rank": "mythic",
    "mythology": "میان‌رودان باستان؛ اساطیر بابلی",
    "levelMin": 1,
    "levelMax": 100,
    "role": "اژدهای نخستین / حمله چندهدفه",
    "lore": "تیامات نیروی نخستین آب‌های شور و مادر موجودات هیولایی در اسطوره بابلی است؛ در این پیکر، اژدهایی چندسر و فرمانروای توفان‌های آغازین است.",
    "portrait": "assets/necromancer/companions/mythic/tiamat.webp",
    "stats": {
      "power": 49,
      "speed": 34,
      "endurance": 47,
      "vitality": 48,
      "intellect": 43,
      "perception": 42,
      "luck": 30,
      "faith": 38
    },
    "growthPerLevel": {
      "power": 0.44,
      "speed": 0.3,
      "endurance": 0.42,
      "vitality": 0.43,
      "intellect": 0.38,
      "perception": 0.37,
      "luck": 0.26,
      "faith": 0.34
    },
    "skills": [
      {
        "id": "tiamat_1",
        "name": "توفان نخستین",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 175,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "موج جادویی به تمام دشمنان."
      },
      {
        "id": "tiamat_2",
        "name": "فریاد مادرِ ژرفا",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش دفاع و سرعت دشمنان."
      },
      {
        "id": "tiamat_3",
        "name": "آرواره آفرینش",
        "type": "physical",
        "target": "single",
        "powerPct": 245,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "گازگرفتن ویرانگر به یک هدف."
      }
    ],
    "passive": {
      "name": "موهبت اسطوره‌ای",
      "description": "زهدان هیولاها: پس از اجرای مهارت گروهی، قدرت ضربه بعدی افزایش می‌یابد."
    },
    "combatAI": {
      "policy": "mythic_signature_priority",
      "rules": [
        "زهدان هیولاها: پس از اجرای مهارت گروهی، قدرت ضربه بعدی افزایش می‌یابد.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": "divine",
      "itemId": "companion_evolution_mythic_to_divine",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "surtr",
    "name": "سورت، آتش‌سالار واپسین",
    "nameEn": "Surtr",
    "rank": "mythic",
    "mythology": "نورس",
    "levelMin": 1,
    "levelMax": 100,
    "role": "غول آتش / تخریب و سوختگی",
    "lore": "سورت غول آتشین موسپلهایم است که در راگناروک با شمشیر شعله‌ور جهان را به آتش می‌کشد.",
    "portrait": "assets/necromancer/companions/mythic/surtr.webp",
    "stats": {
      "power": 52,
      "speed": 35,
      "endurance": 48,
      "vitality": 50,
      "intellect": 35,
      "perception": 40,
      "luck": 27,
      "faith": 42
    },
    "growthPerLevel": {
      "power": 0.46,
      "speed": 0.31,
      "endurance": 0.43,
      "vitality": 0.45,
      "intellect": 0.31,
      "perception": 0.36,
      "luck": 0.24,
      "faith": 0.38
    },
    "skills": [
      {
        "id": "surtr_1",
        "name": "شمشیر پایان جهان",
        "type": "physical",
        "target": "single",
        "powerPct": 270,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "ضربه آتشین سنگین به هدف."
      },
      {
        "id": "surtr_2",
        "name": "باران اخگر",
        "type": "dot_aoe",
        "target": "all_enemies",
        "powerPct": 135,
        "cooldownTurns": 5,
        "durationTurns": 3,
        "description": "آسیب گروهی همراه با سوختگی."
      },
      {
        "id": "surtr_3",
        "name": "پوسته گدازه",
        "type": "guard",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش آسیب دریافتی برای دو نوبت."
      }
    ],
    "passive": {
      "name": "موهبت اسطوره‌ای",
      "description": "شراره راگناروک: در برابر دشمنان متعدد، آسیب آتش او افزایش می‌یابد."
    },
    "combatAI": {
      "policy": "mythic_signature_priority",
      "rules": [
        "شراره راگناروک: در برابر دشمنان متعدد، آسیب آتش او افزایش می‌یابد.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": "divine",
      "itemId": "companion_evolution_mythic_to_divine",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "fenrir",
    "name": "فنریر، گرگِ بندگسل",
    "nameEn": "Fenrir",
    "rank": "mythic",
    "mythology": "نورس",
    "levelMin": 1,
    "levelMax": 100,
    "role": "شکارچی / ضربه بحرانی",
    "lore": "فنریر گرگ عظیم‌الجثه‌ای در اساطیر نورس است که در راگناروک بندهایش را می‌گسلد و اودین را می‌بلعد.",
    "portrait": "assets/necromancer/companions/mythic/fenrir.webp",
    "stats": {
      "power": 50,
      "speed": 48,
      "endurance": 43,
      "vitality": 46,
      "intellect": 31,
      "perception": 49,
      "luck": 42,
      "faith": 30
    },
    "growthPerLevel": {
      "power": 0.45,
      "speed": 0.43,
      "endurance": 0.38,
      "vitality": 0.41,
      "intellect": 0.27,
      "perception": 0.44,
      "luck": 0.38,
      "faith": 0.26
    },
    "skills": [
      {
        "id": "fenrir_1",
        "name": "گسستن زنجیر",
        "type": "physical",
        "target": "single",
        "powerPct": 260,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "یورش سریع و سنگین به یک دشمن."
      },
      {
        "id": "fenrir_2",
        "name": "شکارِ آخرین نفس",
        "type": "physical",
        "target": "single",
        "powerPct": 205,
        "cooldownTurns": 2,
        "durationTurns": 0,
        "description": "آسیب بیشتر به هدف کم‌جان."
      },
      {
        "id": "fenrir_3",
        "name": "زوزه راگناروک",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 3,
        "description": "افزایش قدرت و سرعت خود."
      }
    ],
    "passive": {
      "name": "موهبت اسطوره‌ای",
      "description": "شکارِ سرنوشت: اگر دشمنی کم‌جان باشد، اولویت حمله و قدرت ضربه فنریر افزایش می‌یابد."
    },
    "combatAI": {
      "policy": "mythic_signature_priority",
      "rules": [
        "شکارِ سرنوشت: اگر دشمنی کم‌جان باشد، اولویت حمله و قدرت ضربه فنریر افزایش می‌یابد.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": "divine",
      "itemId": "companion_evolution_mythic_to_divine",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "jormungandr",
    "name": "یورمونگاند، مارِ میانه‌جهان",
    "nameEn": "Jormungandr",
    "rank": "mythic",
    "mythology": "نورس",
    "levelMin": 1,
    "levelMax": 100,
    "role": "مار کیهانی / کنترل میدان",
    "lore": "یورمونگاند مار عظیمی است که جهان را در میان حلقه‌های خود گرفته و در راگناروک با ثور روبه‌رو می‌شود.",
    "portrait": "assets/necromancer/companions/mythic/jormungandr.webp",
    "stats": {
      "power": 48,
      "speed": 38,
      "endurance": 49,
      "vitality": 48,
      "intellect": 37,
      "perception": 47,
      "luck": 31,
      "faith": 36
    },
    "growthPerLevel": {
      "power": 0.43,
      "speed": 0.34,
      "endurance": 0.44,
      "vitality": 0.43,
      "intellect": 0.33,
      "perception": 0.42,
      "luck": 0.27,
      "faith": 0.32
    },
    "skills": [
      {
        "id": "jormungandr_1",
        "name": "حلقه اقیانوسی",
        "type": "control",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "مهار و کندکردن همه دشمنان."
      },
      {
        "id": "jormungandr_2",
        "name": "زهرِ ژرفای جهان",
        "type": "dot_aoe",
        "target": "all_enemies",
        "powerPct": 145,
        "cooldownTurns": 4,
        "durationTurns": 3,
        "description": "زهر گروهی با اثر ماندگار."
      },
      {
        "id": "jormungandr_3",
        "name": "ضربه دم کیهانی",
        "type": "physical",
        "target": "single",
        "powerPct": 250,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "ضربه سنگین به هدف."
      }
    ],
    "passive": {
      "name": "موهبت اسطوره‌ای",
      "description": "حلقه جهان: دشمنان را درگیر می‌کند و سرعت گروه مقابل را کاهش می‌دهد."
    },
    "combatAI": {
      "policy": "mythic_signature_priority",
      "rules": [
        "حلقه جهان: دشمنان را درگیر می‌کند و سرعت گروه مقابل را کاهش می‌دهد.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": "divine",
      "itemId": "companion_evolution_mythic_to_divine",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "typhon",
    "name": "تایفون، پدر هیولاها",
    "nameEn": "Typhon",
    "rank": "mythic",
    "mythology": "یونان باستان",
    "levelMin": 1,
    "levelMax": 100,
    "role": "تایتان هیولایی / انفجار جادویی",
    "lore": "تایفون هیولایی سهمگین با سرهای اژدهایی و نیروی توفان است که با زئوس جنگید و در زیر اتنا مهار شد.",
    "portrait": "assets/necromancer/companions/mythic/typhon.webp",
    "stats": {
      "power": 53,
      "speed": 39,
      "endurance": 50,
      "vitality": 51,
      "intellect": 45,
      "perception": 43,
      "luck": 29,
      "faith": 39
    },
    "growthPerLevel": {
      "power": 0.47,
      "speed": 0.35,
      "endurance": 0.45,
      "vitality": 0.46,
      "intellect": 0.4,
      "perception": 0.38,
      "luck": 0.25,
      "faith": 0.35
    },
    "skills": [
      {
        "id": "typhon_1",
        "name": "توفان صدسر",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 185,
        "cooldownTurns": 5,
        "durationTurns": 0,
        "description": "انفجار جادویی بر تمام دشمنان."
      },
      {
        "id": "typhon_2",
        "name": "چنگال هیولا",
        "type": "physical",
        "target": "single",
        "powerPct": 255,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "ضربه مستقیم و سنگین."
      },
      {
        "id": "typhon_3",
        "name": "وحشت تایتانی",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش قدرت حمله دشمنان."
      }
    ],
    "passive": {
      "name": "موهبت اسطوره‌ای",
      "description": "خیزش توفان: هنگام وجود سه دشمن، مهارت اصلی او به تمام صف آسیب بیشتری می‌زند."
    },
    "combatAI": {
      "policy": "mythic_signature_priority",
      "rules": [
        "خیزش توفان: هنگام وجود سه دشمن، مهارت اصلی او به تمام صف آسیب بیشتری می‌زند.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": "divine",
      "itemId": "companion_evolution_mythic_to_divine",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "hecate",
    "name": "هکاته، بانوی سه‌راهی",
    "nameEn": "Hecate",
    "rank": "mythic",
    "mythology": "یونان باستان",
    "levelMin": 1,
    "levelMax": 100,
    "role": "جادوگر کیهانی / کنترل و پشتیبانی",
    "lore": "هکاته ایزدبانوی جادو، شب، ارواح و گذرگاه‌هاست؛ سه‌پیکری او نماد فرمانروایی بر سه مسیر و مرز جهان‌هاست.",
    "portrait": "assets/necromancer/companions/mythic/hecate.webp",
    "stats": {
      "power": 39,
      "speed": 43,
      "endurance": 40,
      "vitality": 42,
      "intellect": 53,
      "perception": 49,
      "luck": 39,
      "faith": 50
    },
    "growthPerLevel": {
      "power": 0.35,
      "speed": 0.39,
      "endurance": 0.36,
      "vitality": 0.38,
      "intellect": 0.48,
      "perception": 0.44,
      "luck": 0.35,
      "faith": 0.45
    },
    "skills": [
      {
        "id": "hecate_1",
        "name": "کلید جهان پنهان",
        "type": "silence",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "خاموش‌کردن مهارت هدف."
      },
      {
        "id": "hecate_2",
        "name": "مشعل ارواح",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 150,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "آسیب جادویی به همه دشمنان."
      },
      {
        "id": "hecate_3",
        "name": "حفاظ سه‌گانه",
        "type": "shield",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 6,
        "durationTurns": 2,
        "description": "ایجاد سپر برای تمام همراهان."
      }
    ],
    "passive": {
      "name": "موهبت اسطوره‌ای",
      "description": "کلید سه‌راهی: در صورت افت سلامت همراهان، مهارت پشتیبانی را بر حمله مقدم می‌کند."
    },
    "combatAI": {
      "policy": "mythic_signature_priority",
      "rules": [
        "کلید سه‌راهی: در صورت افت سلامت همراهان، مهارت پشتیبانی را بر حمله مقدم می‌کند.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": "divine",
      "itemId": "companion_evolution_mythic_to_divine",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "thanatos",
    "name": "تاناتوس، تجسم مرگ آرام",
    "nameEn": "Thanatos",
    "rank": "mythic",
    "mythology": "یونان باستان",
    "levelMin": 1,
    "levelMax": 100,
    "role": "روح مرگ / اجرای هدف",
    "lore": "تاناتوس تجسم مرگ در اساطیر یونان است؛ برخلاف خشونت جنگ، مرگ آرام و اجتناب‌ناپذیر را نمایندگی می‌کند.",
    "portrait": "assets/necromancer/companions/mythic/thanatos.webp",
    "stats": {
      "power": 43,
      "speed": 51,
      "endurance": 41,
      "vitality": 42,
      "intellect": 49,
      "perception": 54,
      "luck": 36,
      "faith": 46
    },
    "growthPerLevel": {
      "power": 0.38,
      "speed": 0.46,
      "endurance": 0.36,
      "vitality": 0.37,
      "intellect": 0.44,
      "perception": 0.49,
      "luck": 0.32,
      "faith": 0.41
    },
    "skills": [
      {
        "id": "thanatos_1",
        "name": "لمس واپسین",
        "type": "magic",
        "target": "single",
        "powerPct": 275,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "ضربه مرگبار به هدف."
      },
      {
        "id": "thanatos_2",
        "name": "سایه خاموش",
        "type": "silence",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "ممنوع‌کردن مهارت‌های هدف."
      },
      {
        "id": "thanatos_3",
        "name": "گذر بی‌صدا",
        "type": "buff",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "افزایش سرعت و دقت خود."
      }
    ],
    "passive": {
      "name": "موهبت اسطوره‌ای",
      "description": "لمس واپسین: دشمنان بسیار کم‌جان را برای اجرای ضربه نهایی انتخاب می‌کند."
    },
    "combatAI": {
      "policy": "mythic_signature_priority",
      "rules": [
        "لمس واپسین: دشمنان بسیار کم‌جان را برای اجرای ضربه نهایی انتخاب می‌کند.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": "divine",
      "itemId": "companion_evolution_mythic_to_divine",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "izanami",
    "name": "ایزانامی، مادر یومی",
    "nameEn": "Izanami",
    "rank": "mythic",
    "mythology": "ژاپن؛ شینتو",
    "levelMin": 1,
    "levelMax": 100,
    "role": "ملکه جهان مردگان / نفرین و احیا",
    "lore": "ایزانامی در اسطوره ژاپن پس از مرگ به فرمانروای یومی، سرزمین مردگان، بدل می‌شود؛ این همراه تجسمی اسطوره‌ای از اقتدار آن جهان است.",
    "portrait": "assets/necromancer/companions/mythic/izanami.webp",
    "stats": {
      "power": 42,
      "speed": 37,
      "endurance": 46,
      "vitality": 49,
      "intellect": 54,
      "perception": 46,
      "luck": 34,
      "faith": 52
    },
    "growthPerLevel": {
      "power": 0.37,
      "speed": 0.33,
      "endurance": 0.41,
      "vitality": 0.44,
      "intellect": 0.49,
      "perception": 0.41,
      "luck": 0.3,
      "faith": 0.47
    },
    "skills": [
      {
        "id": "izanami_1",
        "name": "آلودگی یومی",
        "type": "dot_aoe",
        "target": "all_enemies",
        "powerPct": 140,
        "cooldownTurns": 4,
        "durationTurns": 3,
        "description": "نفرین فرسایشی بر همه دشمنان."
      },
      {
        "id": "izanami_2",
        "name": "فرمان مردگان",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 3,
        "description": "کاهش قدرت و دفاع یک هدف."
      },
      {
        "id": "izanami_3",
        "name": "بازگشت از تاریکی",
        "type": "heal",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 6,
        "durationTurns": 0,
        "description": "درمان همراه با کمترین HP."
      }
    ],
    "passive": {
      "name": "موهبت اسطوره‌ای",
      "description": "نفرین یومی: دشمنی که به او آسیب می‌زند، برای چند نوبت فرسوده می‌شود."
    },
    "combatAI": {
      "policy": "mythic_signature_priority",
      "rules": [
        "نفرین یومی: دشمنی که به او آسیب می‌زند، برای چند نوبت فرسوده می‌شود.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": "divine",
      "itemId": "companion_evolution_mythic_to_divine",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "supay",
    "name": "سوپای، فرمانروای اوکو پاچا",
    "nameEn": "Supay",
    "rank": "mythic",
    "mythology": "اینکا؛ آند",
    "levelMin": 1,
    "levelMax": 100,
    "role": "ارباب زیرزمین / کنترل و زهر",
    "lore": "سوپای در سنت آندی با جهان زیرین و ارواح مردگان پیوند دارد؛ در برخی روایت‌ها فرمانروای اوکو پاچا و موجودی هراس‌انگیز است.",
    "portrait": "assets/necromancer/companions/mythic/supay.webp",
    "stats": {
      "power": 47,
      "speed": 40,
      "endurance": 48,
      "vitality": 49,
      "intellect": 47,
      "perception": 45,
      "luck": 33,
      "faith": 48
    },
    "growthPerLevel": {
      "power": 0.42,
      "speed": 0.36,
      "endurance": 0.43,
      "vitality": 0.44,
      "intellect": 0.42,
      "perception": 0.4,
      "luck": 0.29,
      "faith": 0.43
    },
    "skills": [
      {
        "id": "supay_1",
        "name": "دروازه زیرزمین",
        "type": "control",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "مهار هدف برای دو نوبت."
      },
      {
        "id": "supay_2",
        "name": "غبار گورستان",
        "type": "dot_aoe",
        "target": "all_enemies",
        "powerPct": 145,
        "cooldownTurns": 5,
        "durationTurns": 3,
        "description": "آسیب تدریجی گروهی."
      },
      {
        "id": "supay_3",
        "name": "بهای عبور",
        "type": "magic",
        "target": "single",
        "powerPct": 245,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "آسیب جادویی سنگین."
      }
    ],
    "passive": {
      "name": "موهبت اسطوره‌ای",
      "description": "فرمان اوکو پاچا: اثرات کنترل او بر دشمنان مقاوم دوام بیشتری دارد."
    },
    "combatAI": {
      "policy": "mythic_signature_priority",
      "rules": [
        "فرمان اوکو پاچا: اثرات کنترل او بر دشمنان مقاوم دوام بیشتری دارد.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": "divine",
      "itemId": "companion_evolution_mythic_to_divine",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "ah_puch",
    "name": "آه پوچ، شاه استخوان‌ها",
    "nameEn": "Ah Puch",
    "rank": "mythic",
    "mythology": "مایا؛ یوکاتان",
    "levelMin": 1,
    "levelMax": 100,
    "role": "خدای مرگ / انفجار استخوانی",
    "lore": "آه پوچ در سنت مایایی با مرگ، پوسیدگی و جهان زیرین پیوند دارد؛ این تجسم با زنگوله‌ها و استخوان‌های آیینی شناخته می‌شود.",
    "portrait": "assets/necromancer/companions/mythic/ah_puch.webp",
    "stats": {
      "power": 48,
      "speed": 36,
      "endurance": 47,
      "vitality": 50,
      "intellect": 43,
      "perception": 48,
      "luck": 31,
      "faith": 44
    },
    "growthPerLevel": {
      "power": 0.43,
      "speed": 0.32,
      "endurance": 0.42,
      "vitality": 0.45,
      "intellect": 0.38,
      "perception": 0.43,
      "luck": 0.27,
      "faith": 0.39
    },
    "skills": [
      {
        "id": "ah_puch_1",
        "name": "ناقوس پوسیدگی",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 165,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "آسیب جادویی گروهی."
      },
      {
        "id": "ah_puch_2",
        "name": "استخوان‌شکن",
        "type": "physical",
        "target": "single",
        "powerPct": 250,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "ضربه استخوانی به یک هدف."
      },
      {
        "id": "ah_puch_3",
        "name": "نفس گور",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش دفاع همه دشمنان."
      }
    ],
    "passive": {
      "name": "موهبت اسطوره‌ای",
      "description": "بوی پوسیدگی: دشمنان زخمی در برابر مهارت‌های او آسیب بیشتری دریافت می‌کنند."
    },
    "combatAI": {
      "policy": "mythic_signature_priority",
      "rules": [
        "بوی پوسیدگی: دشمنان زخمی در برابر مهارت‌های او آسیب بیشتری دریافت می‌کنند.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": "divine",
      "itemId": "companion_evolution_mythic_to_divine",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "veles",
    "name": "ولس، خدای ژرفا و دگرگونی",
    "nameEn": "Veles",
    "rank": "mythic",
    "mythology": "اسلاوی",
    "levelMin": 1,
    "levelMax": 100,
    "role": "خدای زیرزمین / جادو و دگرگونی",
    "lore": "ولس در سنت اسلاوی با جهان زیرین، دام‌ها، جادو و ثروت پیوند دارد و در اسطوره‌ها رقیب پروون است.",
    "portrait": "assets/necromancer/companions/mythic/veles.webp",
    "stats": {
      "power": 43,
      "speed": 42,
      "endurance": 47,
      "vitality": 46,
      "intellect": 53,
      "perception": 47,
      "luck": 40,
      "faith": 45
    },
    "growthPerLevel": {
      "power": 0.38,
      "speed": 0.37,
      "endurance": 0.42,
      "vitality": 0.41,
      "intellect": 0.48,
      "perception": 0.42,
      "luck": 0.36,
      "faith": 0.4
    },
    "skills": [
      {
        "id": "veles_1",
        "name": "مارِ زیرریشه",
        "type": "magic",
        "target": "single",
        "powerPct": 250,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "ضربه جادویی متمرکز."
      },
      {
        "id": "veles_2",
        "name": "مهِ دگرگونی",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش سرعت و قدرت دشمنان."
      },
      {
        "id": "veles_3",
        "name": "پوستِ خرس",
        "type": "guard",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش آسیب دریافتی."
      }
    ],
    "passive": {
      "name": "موهبت اسطوره‌ای",
      "description": "ریشه‌های ژرف: با گذشت نبرد، توان جادویی او به‌تدریج تقویت می‌شود."
    },
    "combatAI": {
      "policy": "mythic_signature_priority",
      "rules": [
        "ریشه‌های ژرف: با گذشت نبرد، توان جادویی او به‌تدریج تقویت می‌شود.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": "divine",
      "itemId": "companion_evolution_mythic_to_divine",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "chernobog",
    "name": "چرنو‌بوگ، خدای تاریکی",
    "nameEn": "Chernobog",
    "rank": "mythic",
    "mythology": "اسلاوی؛ روایت‌های قرون میانه",
    "levelMin": 1,
    "levelMax": 100,
    "role": "سایه‌سالار / نفرین و تخریب",
    "lore": "چرنو‌بوگ، «خدای سیاه»، در منابع اسلاوی قرون میانه به‌عنوان چهره‌ای مرتبط با بداقبالی و تاریکی یاد شده است؛ جزئیات پرستش او محل بحث پژوهشی است.",
    "portrait": "assets/necromancer/companions/mythic/chernobog.webp",
    "stats": {
      "power": 49,
      "speed": 43,
      "endurance": 45,
      "vitality": 46,
      "intellect": 51,
      "perception": 50,
      "luck": 37,
      "faith": 39
    },
    "growthPerLevel": {
      "power": 0.44,
      "speed": 0.38,
      "endurance": 0.4,
      "vitality": 0.41,
      "intellect": 0.46,
      "perception": 0.45,
      "luck": 0.33,
      "faith": 0.35
    },
    "skills": [
      {
        "id": "chernobog_1",
        "name": "سایه بدفرجام",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 160,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "آسیب تاریکی به همه دشمنان."
      },
      {
        "id": "chernobog_2",
        "name": "نشان شومی",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 3,
        "description": "کاهش قدرت و سرعت هدف."
      },
      {
        "id": "chernobog_3",
        "name": "پرده شب",
        "type": "shield",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "سپر شخصی در برابر آسیب."
      }
    ],
    "passive": {
      "name": "موهبت اسطوره‌ای",
      "description": "بخت سیاه: احتمال اثرگذاری نفرین‌های او در برابر دشمنان کم‌جان بیشتر است."
    },
    "combatAI": {
      "policy": "mythic_signature_priority",
      "rules": [
        "بخت سیاه: احتمال اثرگذاری نفرین‌های او در برابر دشمنان کم‌جان بیشتر است.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": "divine",
      "itemId": "companion_evolution_mythic_to_divine",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "rahu",
    "name": "راهو، بلعنده خورشید",
    "nameEn": "Rahu",
    "rank": "mythic",
    "mythology": "هند؛ سنت‌های ودایی و پورانه‌ای",
    "levelMin": 1,
    "levelMax": 100,
    "role": "دیو کسوف / خاموشی و اختلال",
    "lore": "راهو در سنت هندو سرِ جداشده آسورا است که خورشید و ماه را می‌بلعد و کسوف پدید می‌آورد.",
    "portrait": "assets/necromancer/companions/mythic/rahu.webp",
    "stats": {
      "power": 46,
      "speed": 47,
      "endurance": 42,
      "vitality": 44,
      "intellect": 52,
      "perception": 53,
      "luck": 44,
      "faith": 34
    },
    "growthPerLevel": {
      "power": 0.41,
      "speed": 0.42,
      "endurance": 0.37,
      "vitality": 0.39,
      "intellect": 0.47,
      "perception": 0.48,
      "luck": 0.4,
      "faith": 0.3
    },
    "skills": [
      {
        "id": "rahu_1",
        "name": "بلع خورشید",
        "type": "silence",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "خاموشی گروهی."
      },
      {
        "id": "rahu_2",
        "name": "سایه کسوف",
        "type": "magic_aoe",
        "target": "all_enemies",
        "powerPct": 155,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "انفجار تاریک گروهی."
      },
      {
        "id": "rahu_3",
        "name": "نیش آسورا",
        "type": "magic",
        "target": "single",
        "powerPct": 245,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "آسیب جادویی تک‌هدفه."
      }
    ],
    "passive": {
      "name": "موهبت اسطوره‌ای",
      "description": "کسوف: در برابر دشمن جادوگر، مهارت خاموشی را در اولویت می‌گذارد."
    },
    "combatAI": {
      "policy": "mythic_signature_priority",
      "rules": [
        "کسوف: در برابر دشمن جادوگر، مهارت خاموشی را در اولویت می‌گذارد.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": "divine",
      "itemId": "companion_evolution_mythic_to_divine",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "ketu",
    "name": "کیتو، دنباله اژدهای آسمانی",
    "nameEn": "Ketu",
    "rank": "mythic",
    "mythology": "هند؛ سنت‌های ودایی و پورانه‌ای",
    "levelMin": 1,
    "levelMax": 100,
    "role": "روح گره کیهانی / پیش‌بینی و ضدجادو",
    "lore": "کیتو در اخترشناسی و اسطوره هندو گره قمری جنوبی و دنباله پیکر راهو است؛ با رهایی، گسست و نیروهای رازآمیز پیوند دارد.",
    "portrait": "assets/necromancer/companions/mythic/ketu.webp",
    "stats": {
      "power": 41,
      "speed": 49,
      "endurance": 42,
      "vitality": 43,
      "intellect": 54,
      "perception": 55,
      "luck": 45,
      "faith": 38
    },
    "growthPerLevel": {
      "power": 0.36,
      "speed": 0.44,
      "endurance": 0.37,
      "vitality": 0.38,
      "intellect": 0.49,
      "perception": 0.5,
      "luck": 0.41,
      "faith": 0.34
    },
    "skills": [
      {
        "id": "ketu_1",
        "name": "گسست پیوند",
        "type": "silence",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 2,
        "description": "قطع مهارت هدف."
      },
      {
        "id": "ketu_2",
        "name": "دنباله ستاره",
        "type": "magic",
        "target": "single",
        "powerPct": 265,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "ضربه دقیق جادویی."
      },
      {
        "id": "ketu_3",
        "name": "پرده رهایی",
        "type": "buff",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 6,
        "durationTurns": 2,
        "description": "افزایش مقاومت جادویی همراهان."
      }
    ],
    "passive": {
      "name": "موهبت اسطوره‌ای",
      "description": "ادراک گسسته: هدف‌گیری او در برابر دشمنان دارای سپر اولویت می‌یابد."
    },
    "combatAI": {
      "policy": "mythic_signature_priority",
      "rules": [
        "ادراک گسسته: هدف‌گیری او در برابر دشمنان دارای سپر اولویت می‌یابد.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": "divine",
      "itemId": "companion_evolution_mythic_to_divine",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "mahishasura",
    "name": "ماهیشاسورا، دیو گاومیش‌پیکر",
    "nameEn": "Mahishasura",
    "rank": "mythic",
    "mythology": "هند؛ پورانه‌ها و سنت شاکتی",
    "levelMin": 1,
    "levelMax": 100,
    "role": "دیو جنگاور / تانک تهاجمی",
    "lore": "ماهیشاسورا دیوی گاومیش‌پیکر است که در روایت‌های شاکتی به دست دورگا شکست می‌خورد؛ نماد نیروی سرکش و دگرپیکری است.",
    "portrait": "assets/necromancer/companions/mythic/mahishasura.webp",
    "stats": {
      "power": 54,
      "speed": 34,
      "endurance": 52,
      "vitality": 53,
      "intellect": 34,
      "perception": 39,
      "luck": 30,
      "faith": 37
    },
    "growthPerLevel": {
      "power": 0.48,
      "speed": 0.3,
      "endurance": 0.47,
      "vitality": 0.48,
      "intellect": 0.3,
      "perception": 0.35,
      "luck": 0.26,
      "faith": 0.33
    },
    "skills": [
      {
        "id": "mahishasura_1",
        "name": "شاخ‌شکاف",
        "type": "physical",
        "target": "single",
        "powerPct": 275,
        "cooldownTurns": 4,
        "durationTurns": 0,
        "description": "یورش ویرانگر فیزیکی."
      },
      {
        "id": "mahishasura_2",
        "name": "غرش آسورا",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش قدرت حمله دشمنان."
      },
      {
        "id": "mahishasura_3",
        "name": "پوست گاومیش",
        "type": "guard",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش آسیب دریافتی."
      }
    ],
    "passive": {
      "name": "موهبت اسطوره‌ای",
      "description": "خشم گاومیش: هرچه HP او کمتر شود، شدت حملات فیزیکی‌اش افزایش می‌یابد."
    },
    "combatAI": {
      "policy": "mythic_signature_priority",
      "rules": [
        "خشم گاومیش: هرچه HP او کمتر شود، شدت حملات فیزیکی‌اش افزایش می‌یابد.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": "divine",
      "itemId": "companion_evolution_mythic_to_divine",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "balor",
    "name": "بالور، چشم ویرانگر",
    "nameEn": "Balor",
    "rank": "mythic",
    "mythology": "ایرلندی؛ چرخه اولستر",
    "levelMin": 1,
    "levelMax": 100,
    "role": "غول یک‌چشم / انفجار و کنترل",
    "lore": "بالور غول یک‌چشم در اساطیر ایرلندی است؛ نگاه چشم ویرانگر او نیروی مرگبار دارد و در نبرد با لو شکست می‌خورد.",
    "portrait": "assets/necromancer/companions/mythic/balor.webp",
    "stats": {
      "power": 50,
      "speed": 31,
      "endurance": 49,
      "vitality": 50,
      "intellect": 38,
      "perception": 53,
      "luck": 32,
      "faith": 35
    },
    "growthPerLevel": {
      "power": 0.45,
      "speed": 0.27,
      "endurance": 0.44,
      "vitality": 0.45,
      "intellect": 0.34,
      "perception": 0.48,
      "luck": 0.28,
      "faith": 0.31
    },
    "skills": [
      {
        "id": "balor_1",
        "name": "چشم مرگبار",
        "type": "magic",
        "target": "single",
        "powerPct": 285,
        "cooldownTurns": 5,
        "durationTurns": 0,
        "description": "پرتو ویرانگر به یک هدف."
      },
      {
        "id": "balor_2",
        "name": "لرزش فوموریان",
        "type": "control",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 6,
        "durationTurns": 1,
        "description": "اختلال کوتاه در کل صف دشمن."
      },
      {
        "id": "balor_3",
        "name": "پوسته غول",
        "type": "shield",
        "target": "self",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "سپر شخصی."
      }
    ],
    "passive": {
      "name": "موهبت اسطوره‌ای",
      "description": "نگاه ویرانگر: دشمنان دارای HP بالا را با حمله ویژه نشانه می‌گیرد."
    },
    "combatAI": {
      "policy": "mythic_signature_priority",
      "rules": [
        "نگاه ویرانگر: دشمنان دارای HP بالا را با حمله ویژه نشانه می‌گیرد.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": "divine",
      "itemId": "companion_evolution_mythic_to_divine",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "nergal",
    "name": "نرگال، سالار جنگ و طاعون",
    "nameEn": "Nergal",
    "rank": "mythic",
    "mythology": "میان‌رودان باستان؛ سومری و اکدی",
    "levelMin": 1,
    "levelMax": 100,
    "role": "خدای جنگ و طاعون / آسیب ترکیبی",
    "lore": "نرگال در سنت‌های میان‌رودانی با جنگ، بیماری و جهان زیرین پیوند دارد؛ از نظر هویت و نقش با دیوهای گالو متفاوت است.",
    "portrait": "assets/necromancer/companions/mythic/nergal.webp",
    "stats": {
      "power": 50,
      "speed": 39,
      "endurance": 48,
      "vitality": 49,
      "intellect": 47,
      "perception": 45,
      "luck": 32,
      "faith": 43
    },
    "growthPerLevel": {
      "power": 0.45,
      "speed": 0.35,
      "endurance": 0.43,
      "vitality": 0.44,
      "intellect": 0.42,
      "perception": 0.4,
      "luck": 0.28,
      "faith": 0.38
    },
    "skills": [
      {
        "id": "nergal_1",
        "name": "طاعون میدان",
        "type": "dot_aoe",
        "target": "all_enemies",
        "powerPct": 145,
        "cooldownTurns": 4,
        "durationTurns": 3,
        "description": "آسیب تدریجی و فرسایش گروهی."
      },
      {
        "id": "nergal_2",
        "name": "گرز جنگ",
        "type": "physical",
        "target": "single",
        "powerPct": 260,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "ضربه فیزیکی سنگین."
      },
      {
        "id": "nergal_3",
        "name": "فرمان آشوب",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش قدرت و دفاع دشمنان."
      }
    ],
    "passive": {
      "name": "موهبت اسطوره‌ای",
      "description": "طاعون جنگی: حملات او دشمنان را هم‌زمان زخمی و تضعیف می‌کند."
    },
    "combatAI": {
      "policy": "mythic_signature_priority",
      "rules": [
        "طاعون جنگی: حملات او دشمنان را هم‌زمان زخمی و تضعیف می‌کند.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": "divine",
      "itemId": "companion_evolution_mythic_to_divine",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "hine_nui_te_po",
    "name": "هینه‌نوی‌ته‌پو، بانوی شب بزرگ",
    "nameEn": "Hine-nui-te-po",
    "rank": "mythic",
    "mythology": "مائوری؛ سنت‌های پولینزی",
    "levelMin": 1,
    "levelMax": 100,
    "role": "بانوی مرگ / محافظت و داوری",
    "lore": "هینه‌نوی‌ته‌پو در سنت مائوری بانوی شب بزرگ و نگهبان گذر مردگان است؛ شخصیت او در این طراحی با احترام و بدون تبدیل به هیولای بی‌ریشه بازنمایی می‌شود.",
    "portrait": "assets/necromancer/companions/mythic/hine_nui_te_po.webp",
    "stats": {
      "power": 39,
      "speed": 40,
      "endurance": 48,
      "vitality": 50,
      "intellect": 50,
      "perception": 47,
      "luck": 37,
      "faith": 56
    },
    "growthPerLevel": {
      "power": 0.35,
      "speed": 0.36,
      "endurance": 0.43,
      "vitality": 0.45,
      "intellect": 0.45,
      "perception": 0.42,
      "luck": 0.33,
      "faith": 0.5
    },
    "skills": [
      {
        "id": "hine_nui_te_po_1",
        "name": "پرده شب بزرگ",
        "type": "shield",
        "target": "all_allies",
        "powerPct": 0,
        "cooldownTurns": 6,
        "durationTurns": 2,
        "description": "سپر برای همه همراهان."
      },
      {
        "id": "hine_nui_te_po_2",
        "name": "داوری واپسین",
        "type": "debuff",
        "target": "single",
        "powerPct": 0,
        "cooldownTurns": 4,
        "durationTurns": 3,
        "description": "کاهش قدرت و سرعت هدف."
      },
      {
        "id": "hine_nui_te_po_3",
        "name": "نَفَس بازگشت",
        "type": "heal",
        "target": "lowest_hp_ally",
        "powerPct": 0,
        "cooldownTurns": 6,
        "durationTurns": 0,
        "description": "درمان همراه با کمترین HP."
      }
    ],
    "passive": {
      "name": "موهبت اسطوره‌ای",
      "description": "دروازه واپسین: هنگام افت شدید HP همراه، درمان و سپر را بر حمله مقدم می‌کند."
    },
    "combatAI": {
      "policy": "mythic_signature_priority",
      "rules": [
        "دروازه واپسین: هنگام افت شدید HP همراه، درمان و سپر را بر حمله مقدم می‌کند.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": "divine",
      "itemId": "companion_evolution_mythic_to_divine",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
  {
    "id": "azi_dahaka",
    "name": "اژی‌دهاک، اژدهای سه‌سر",
    "nameEn": "Azi Dahaka",
    "rank": "mythic",
    "mythology": "ایران باستان؛ اوستا و شاهنامه",
    "levelMin": 1,
    "levelMax": 100,
    "role": "اژدهای اهریمنی / زهر و چندهدفه",
    "lore": "اژی‌دهاک در اوستا موجودی اهریمنی و سه‌سر است و در شاهنامه با نام ضحاک پادشاهی ستمگر می‌شود؛ این همراه بر هویت اژدهایی اسطوره‌ای تمرکز دارد.",
    "portrait": "assets/necromancer/companions/mythic/azi_dahaka.webp",
    "stats": {
      "power": 52,
      "speed": 38,
      "endurance": 51,
      "vitality": 52,
      "intellect": 43,
      "perception": 46,
      "luck": 31,
      "faith": 40
    },
    "growthPerLevel": {
      "power": 0.47,
      "speed": 0.34,
      "endurance": 0.46,
      "vitality": 0.47,
      "intellect": 0.38,
      "perception": 0.41,
      "luck": 0.27,
      "faith": 0.36
    },
    "skills": [
      {
        "id": "azi_dahaka_1",
        "name": "زهر سه‌سر",
        "type": "dot_aoe",
        "target": "all_enemies",
        "powerPct": 150,
        "cooldownTurns": 4,
        "durationTurns": 3,
        "description": "زهر گروهی ماندگار."
      },
      {
        "id": "azi_dahaka_2",
        "name": "نیش اژدها",
        "type": "physical",
        "target": "single",
        "powerPct": 265,
        "cooldownTurns": 3,
        "durationTurns": 0,
        "description": "ضربه فیزیکی سنگین."
      },
      {
        "id": "azi_dahaka_3",
        "name": "هراس اژی",
        "type": "debuff",
        "target": "all_enemies",
        "powerPct": 0,
        "cooldownTurns": 5,
        "durationTurns": 2,
        "description": "کاهش قدرت حمله دشمنان."
      }
    ],
    "passive": {
      "name": "موهبت اسطوره‌ای",
      "description": "سه دهان زهرآگین: اثر زهر او با هر نوبت باقی‌ماندن روی هدف تشدید می‌شود."
    },
    "combatAI": {
      "policy": "mythic_signature_priority",
      "rules": [
        "سه دهان زهرآگین: اثر زهر او با هر نوبت باقی‌ماندن روی هدف تشدید می‌شود.",
        "prioritize_species_signature_skill",
        "protect_companion_survival",
        "avoid_overkill"
      ],
      "tieBreak": "signature_skill_then_expected_value"
    },
    "evolution": {
      "nextRank": "divine",
      "itemId": "companion_evolution_mythic_to_divine",
      "requirements": [
        "evolution_item_only"
      ],
      "preserveLevel": true
    }
  },
]);

export function chooseMythicCompanionIntent(companionOrId, context={}) {
 const source=typeof companionOrId==='string'?NECROMANCER_MYTHIC_COMPANIONS.find(x=>x.id===companionOrId):companionOrId;
 if(!source) return null;
 const enemies=(context.enemies||[]).filter(x=>Number(x.hp??1)>0), allies=(context.allies||[]).filter(x=>Number(x.hp??1)>0);
 const ratio=x=>Number(x.hp??0)/Math.max(1,Number(x.maxHp)||1);
 const weakest=[...enemies].sort((a,b)=>ratio(a)-ratio(b))[0], lowest=[...allies].sort((a,b)=>ratio(a)-ratio(b))[0];
 const ready=source.skills.filter(s=>Number(context.cooldowns?.[s.id]||0)<=0 && (context.canUseSkill?context.canUseSkill(s)!==false:true));
 let skill=null;
 if(lowest&&ratio(lowest)<.52) skill=ready.find(s=>['heal','shield'].includes(s.type));
 if(!skill&&enemies.length>=2) skill=ready.find(s=>['magic_aoe','physical_multi','dot_aoe'].includes(s.type)||s.target==='all_enemies');
 if(!skill&&Number(context.selfHpPct??100)<42) skill=ready.find(s=>['guard','shield'].includes(s.type));
 if(!skill) skill=ready.find(s=>['silence','control','debuff'].includes(s.type));
 if(!skill&&weakest) skill=ready.find(s=>['physical','magic','dot'].includes(s.type));
 if(!skill) return chooseBaseIntent(source,context);
 let targetId=null; if(skill.target==='self') targetId=context.selfId??null; else if(skill.target==='lowest_hp_ally') targetId=lowest?.id??context.selfId??null; else if(!['all_enemies','all_allies'].includes(skill.target)) targetId=weakest?.id??null;
 return {action:'use_skill',skillId:skill.id,targetId,targetMode:skill.target,reason:'mythic_mythology_authored_priority',skill:JSON.parse(JSON.stringify(skill))};
}
