/** ETRANOM V1988 — 20 myth-rooted Legendary undead/underworld companions. */
import { NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel, chooseNecromancerCompanionIntent as chooseBaseIntent } from './necromancer-common-companions-v1995.js?build=2081';
export { NECROMANCER_COMPANION_ATTRIBUTE_KEYS, resolveNecromancerCompanionLevel };
export const NECROMANCER_LEGENDARY_COMPANIONS = Object.freeze([
    {
        "id": "erl_khan",
        "name": "ارلیک‌خان، فرمانروای زیرزمین",
        "nameEn": "Erlik Khan",
        "rank": "legendary",
        "mythology": "ترکی-آسیای میانه",
        "levelMin": 1,
        "levelMax": 100,
        "role": "فرمانروای نفرین / کنترل",
        "lore": "ایزد فرمانروای جهان زیرین در سنت‌های ترکی؛ این تجسم، پیکر جنگیِ اسطوره‌ای اوست.",
        "portrait": "assets/necromancer/companions/legendary/erl_khan.webp",
        "stats": {
            "power": 25,
            "speed": 18,
            "endurance": 23,
            "vitality": 22,
            "intellect": 17,
            "perception": 21,
            "luck": 15,
            "faith": 24
        },
        "growthPerLevel": {
            "power": 0.25,
            "speed": 0.18,
            "endurance": 0.23,
            "vitality": 0.22,
            "intellect": 0.17,
            "perception": 0.21,
            "luck": 0.15,
            "faith": 0.24
        },
        "skills": [
            {
                "id": "erl_khan_1",
                "name": "حکم سرخ",
                "type": "magic",
                "target": "single",
                "powerPct": 170,
                "cooldownTurns": 2,
                "durationTurns": 0,
                "description": "حکم سرخ؛ اثر اختصاصی ارلیک‌خان، فرمانروای زیرزمین با توجه به نقش فرمانروای نفرین / کنترل."
            },
            {
                "id": "erl_khan_2",
                "name": "زنجیر فرمان",
                "type": "debuff",
                "target": "single",
                "powerPct": 0,
                "cooldownTurns": 4,
                "durationTurns": 2,
                "description": "زنجیر فرمان؛ اثر اختصاصی ارلیک‌خان، فرمانروای زیرزمین با توجه به نقش فرمانروای نفرین / کنترل.",
                "attackReductionPct": 18,
                "speedReductionPct": 15
            },
            {
                "id": "erl_khan_3",
                "name": "نفس بی‌بازگشت",
                "type": "physical",
                "target": "single",
                "powerPct": 205,
                "cooldownTurns": 5,
                "durationTurns": 2,
                "description": "نفس بی‌بازگشت؛ اثر اختصاصی ارلیک‌خان، فرمانروای زیرزمین با توجه به نقش فرمانروای نفرین / کنترل."
            }
        ],
        "passive": {
            "name": "میراث اسطوره‌ای",
            "description": "ویژگی ذاتی ارلیک‌خان، فرمانروای زیرزمین: با نشان‌گذاری خطرناک‌ترین دشمن، حمله‌های بعدی را روی او متمرکز می‌کند."
        },
        "combatAI": {
            "policy": "legendary_mythic_priority",
            "rules": [
                "با نشان‌گذاری خطرناک‌ترین دشمن، حمله‌های بعدی را روی او متمرکز می‌کند.",
                "prioritize_species_signature_skill",
                "protect_companion_survival",
                "avoid_overkill"
            ],
            "tieBreak": "signature_skill_then_expected_value"
        },
        "evolution": {
            "nextRank": "mythic",
            "itemId": "companion_evolution_legendary_to_mythic",
            "requirements": [
                "evolution_item_only"
            ],
            "preserveLevel": true
        }
    },
    {
        "id": "hel_queen",
        "name": "هِل، ملکه سرزمین مردگان",
        "nameEn": "Hel",
        "rank": "legendary",
        "mythology": "نورس",
        "levelMin": 1,
        "levelMax": 100,
        "role": "فرمانروای میدان / تضعیف",
        "lore": "فرمانروای هلهایم در اساطیر نورس؛ نیمه‌زنده و نیمه‌مرده تصویر می‌شود.",
        "portrait": "assets/necromancer/companions/legendary/hel_queen.webp",
        "stats": {
            "power": 17,
            "speed": 20,
            "endurance": 19,
            "vitality": 20,
            "intellect": 25,
            "perception": 22,
            "luck": 17,
            "faith": 26
        },
        "growthPerLevel": {
            "power": 0.17,
            "speed": 0.2,
            "endurance": 0.19,
            "vitality": 0.2,
            "intellect": 0.25,
            "perception": 0.22,
            "luck": 0.17,
            "faith": 0.26
        },
        "skills": [
            {
                "id": "hel_queen_1",
                "name": "تاج هلهایم",
                "type": "magic_aoe",
                "target": "all_enemies",
                "powerPct": 170,
                "cooldownTurns": 2,
                "durationTurns": 0,
                "description": "تاج هلهایم؛ اثر اختصاصی هِل، ملکه سرزمین مردگان با توجه به نقش فرمانروای میدان / تضعیف."
            },
            {
                "id": "hel_queen_2",
                "name": "سرمای نیمه‌جان",
                "type": "debuff",
                "target": "all_enemies",
                "powerPct": 0,
                "cooldownTurns": 4,
                "durationTurns": 2,
                "description": "سرمای نیمه‌جان؛ اثر اختصاصی هِل، ملکه سرزمین مردگان با توجه به نقش فرمانروای میدان / تضعیف.",
                "attackReductionPct": 18,
                "speedReductionPct": 15
            },
            {
                "id": "hel_queen_3",
                "name": "حکم واپسین",
                "type": "control",
                "target": "single",
                "powerPct": 0,
                "cooldownTurns": 5,
                "durationTurns": 2,
                "description": "حکم واپسین؛ اثر اختصاصی هِل، ملکه سرزمین مردگان با توجه به نقش فرمانروای میدان / تضعیف.",
                "attackReductionPct": 18,
                "speedReductionPct": 15
            }
        ],
        "passive": {
            "name": "میراث اسطوره‌ای",
            "description": "ویژگی ذاتی هِل، ملکه سرزمین مردگان: وقتی چند دشمن زنده‌اند، نفرین گسترده را ترجیح می‌دهد؛ در پایان نبرد حکم نهایی را اجرا می‌کند."
        },
        "combatAI": {
            "policy": "legendary_mythic_priority",
            "rules": [
                "وقتی چند دشمن زنده‌اند، نفرین گسترده را ترجیح می‌دهد؛ در پایان نبرد حکم نهایی را اجرا می‌کند.",
                "prioritize_species_signature_skill",
                "protect_companion_survival",
                "avoid_overkill"
            ],
            "tieBreak": "signature_skill_then_expected_value"
        },
        "evolution": {
            "nextRank": "mythic",
            "itemId": "companion_evolution_legendary_to_mythic",
            "requirements": [
                "evolution_item_only"
            ],
            "preserveLevel": true
        }
    },
    {
        "id": "anubis_soul_judge",
        "name": "آنوبیس، داور روان‌ها",
        "nameEn": "Anubis",
        "rank": "legendary",
        "mythology": "مصر باستان",
        "levelMin": 1,
        "levelMax": 100,
        "role": "پشتیبان / داور",
        "lore": "خدای تدفین و راهنمای مردگان؛ نگهبان آیین داوری روان‌ها.",
        "portrait": "assets/necromancer/companions/legendary/anubis_soul_judge.webp",
        "stats": {
            "power": 15,
            "speed": 18,
            "endurance": 22,
            "vitality": 25,
            "intellect": 21,
            "perception": 24,
            "luck": 18,
            "faith": 29
        },
        "growthPerLevel": {
            "power": 0.15,
            "speed": 0.18,
            "endurance": 0.22,
            "vitality": 0.25,
            "intellect": 0.21,
            "perception": 0.24,
            "luck": 0.18,
            "faith": 0.29
        },
        "skills": [
            {
                "id": "anubis_soul_judge_1",
                "name": "ترازوی روان",
                "type": "shield",
                "target": "lowest_hp_ally",
                "powerPct": 0,
                "cooldownTurns": 2,
                "durationTurns": 0,
                "description": "ترازوی روان؛ اثر اختصاصی آنوبیس، داور روان‌ها با توجه به نقش پشتیبان / داور.",
                "shieldPct": 26
            },
            {
                "id": "anubis_soul_judge_2",
                "name": "پناه آیینی",
                "type": "heal",
                "target": "self",
                "powerPct": 0,
                "cooldownTurns": 4,
                "durationTurns": 2,
                "description": "پناه آیینی؛ اثر اختصاصی آنوبیس، داور روان‌ها با توجه به نقش پشتیبان / داور.",
                "healPct": 18
            },
            {
                "id": "anubis_soul_judge_3",
                "name": "مهر داوری",
                "type": "magic",
                "target": "single",
                "powerPct": 205,
                "cooldownTurns": 5,
                "durationTurns": 2,
                "description": "مهر داوری؛ اثر اختصاصی آنوبیس، داور روان‌ها با توجه به نقش پشتیبان / داور."
            }
        ],
        "passive": {
            "name": "میراث اسطوره‌ای",
            "description": "ویژگی ذاتی آنوبیس، داور روان‌ها: همراه زخمی را با سپر آیینی حفظ می‌کند و سپس دشمن دارای بیشترین HP را داوری می‌کند."
        },
        "combatAI": {
            "policy": "legendary_mythic_priority",
            "rules": [
                "همراه زخمی را با سپر آیینی حفظ می‌کند و سپس دشمن دارای بیشترین HP را داوری می‌کند.",
                "prioritize_species_signature_skill",
                "protect_companion_survival",
                "avoid_overkill"
            ],
            "tieBreak": "signature_skill_then_expected_value"
        },
        "evolution": {
            "nextRank": "mythic",
            "itemId": "companion_evolution_legendary_to_mythic",
            "requirements": [
                "evolution_item_only"
            ],
            "preserveLevel": true
        }
    },
    {
        "id": "garmr_hellhound",
        "name": "گارم، سگ شکاری هِل",
        "nameEn": "Garmr",
        "rank": "legendary",
        "mythology": "نورس",
        "levelMin": 1,
        "levelMax": 100,
        "role": "شکارچی / مهاجم",
        "lore": "سگ هیولایی نگهبان جهان مردگان که در روایت‌های راگناروک نقش دارد.",
        "portrait": "assets/necromancer/companions/legendary/garmr_hellhound.webp",
        "stats": {
            "power": 27,
            "speed": 26,
            "endurance": 21,
            "vitality": 19,
            "intellect": 13,
            "perception": 25,
            "luck": 20,
            "faith": 18
        },
        "growthPerLevel": {
            "power": 0.27,
            "speed": 0.26,
            "endurance": 0.21,
            "vitality": 0.19,
            "intellect": 0.13,
            "perception": 0.25,
            "luck": 0.2,
            "faith": 0.18
        },
        "skills": [
            {
                "id": "garmr_hellhound_1",
                "name": "زوزه گارم",
                "type": "physical",
                "target": "single",
                "powerPct": 170,
                "cooldownTurns": 2,
                "durationTurns": 0,
                "description": "زوزه گارم؛ اثر اختصاصی گارم، سگ شکاری هِل با توجه به نقش شکارچی / مهاجم."
            },
            {
                "id": "garmr_hellhound_2",
                "name": "چنگال دروازه",
                "type": "control",
                "target": "single",
                "powerPct": 0,
                "cooldownTurns": 4,
                "durationTurns": 2,
                "description": "چنگال دروازه؛ اثر اختصاصی گارم، سگ شکاری هِل با توجه به نقش شکارچی / مهاجم.",
                "attackReductionPct": 18,
                "speedReductionPct": 15
            },
            {
                "id": "garmr_hellhound_3",
                "name": "تعقیب بی‌امان",
                "type": "physical",
                "target": "single",
                "powerPct": 205,
                "cooldownTurns": 5,
                "durationTurns": 2,
                "description": "تعقیب بی‌امان؛ اثر اختصاصی گارم، سگ شکاری هِل با توجه به نقش شکارچی / مهاجم."
            }
        ],
        "passive": {
            "name": "میراث اسطوره‌ای",
            "description": "ویژگی ذاتی گارم، سگ شکاری هِل: دشمن کم‌جان را تعقیب می‌کند؛ اگر دشمنان متعدد باشند، زوزه هراس می‌فرستد."
        },
        "combatAI": {
            "policy": "legendary_mythic_priority",
            "rules": [
                "دشمن کم‌جان را تعقیب می‌کند؛ اگر دشمنان متعدد باشند، زوزه هراس می‌فرستد.",
                "prioritize_species_signature_skill",
                "protect_companion_survival",
                "avoid_overkill"
            ],
            "tieBreak": "signature_skill_then_expected_value"
        },
        "evolution": {
            "nextRank": "mythic",
            "itemId": "companion_evolution_legendary_to_mythic",
            "requirements": [
                "evolution_item_only"
            ],
            "preserveLevel": true
        }
    },
    {
        "id": "draugr_lord",
        "name": "ارباب دراوگر",
        "nameEn": "Draugr Lord",
        "rank": "legendary",
        "mythology": "نورس",
        "levelMin": 1,
        "levelMax": 100,
        "role": "تانک / ضدحمله",
        "lore": "بازآفرینی یک دراوگر نیرومند بر پایه مردگان بازگشته در حماسه‌های نورس.",
        "portrait": "assets/necromancer/companions/legendary/draugr_lord.webp",
        "stats": {
            "power": 29,
            "speed": 12,
            "endurance": 28,
            "vitality": 26,
            "intellect": 14,
            "perception": 18,
            "luck": 13,
            "faith": 27
        },
        "growthPerLevel": {
            "power": 0.29,
            "speed": 0.12,
            "endurance": 0.28,
            "vitality": 0.26,
            "intellect": 0.14,
            "perception": 0.18,
            "luck": 0.13,
            "faith": 0.27
        },
        "skills": [
            {
                "id": "draugr_lord_1",
                "name": "غرش گور",
                "type": "physical",
                "target": "single",
                "powerPct": 170,
                "cooldownTurns": 2,
                "durationTurns": 0,
                "description": "غرش گور؛ اثر اختصاصی ارباب دراوگر با توجه به نقش تانک / ضدحمله."
            },
            {
                "id": "draugr_lord_2",
                "name": "زره مرده‌سالار",
                "type": "guard",
                "target": "self",
                "powerPct": 0,
                "cooldownTurns": 4,
                "durationTurns": 2,
                "description": "زره مرده‌سالار؛ اثر اختصاصی ارباب دراوگر با توجه به نقش تانک / ضدحمله.",
                "shieldPct": 20
            },
            {
                "id": "draugr_lord_3",
                "name": "ضربه بازگشت",
                "type": "physical",
                "target": "single",
                "powerPct": 205,
                "cooldownTurns": 5,
                "durationTurns": 2,
                "description": "ضربه بازگشت؛ اثر اختصاصی ارباب دراوگر با توجه به نقش تانک / ضدحمله."
            }
        ],
        "passive": {
            "name": "میراث اسطوره‌ای",
            "description": "ویژگی ذاتی ارباب دراوگر: در آغاز تهدید را جذب می‌کند و پس از تحمل ضربه سنگین ضدحمله می‌زند."
        },
        "combatAI": {
            "policy": "legendary_mythic_priority",
            "rules": [
                "در آغاز تهدید را جذب می‌کند و پس از تحمل ضربه سنگین ضدحمله می‌زند.",
                "prioritize_species_signature_skill",
                "protect_companion_survival",
                "avoid_overkill"
            ],
            "tieBreak": "signature_skill_then_expected_value"
        },
        "evolution": {
            "nextRank": "mythic",
            "itemId": "companion_evolution_legendary_to_mythic",
            "requirements": [
                "evolution_item_only"
            ],
            "preserveLevel": true
        }
    },
    {
        "id": "nidhogg_carrion_drake",
        "name": "نیدهوگ، اژدهای لاشه‌خوار",
        "nameEn": "Níðhöggr",
        "rank": "legendary",
        "mythology": "نورس",
        "levelMin": 1,
        "levelMax": 100,
        "role": "مهاجم چندهدفه / زهر",
        "lore": "اژدها/مار کیهانی که ریشه‌های ایگدراسیل را می‌جود و با مردگان پیوند دارد.",
        "portrait": "assets/necromancer/companions/legendary/nidhogg_carrion_drake.webp",
        "stats": {
            "power": 28,
            "speed": 20,
            "endurance": 24,
            "vitality": 23,
            "intellect": 22,
            "perception": 24,
            "luck": 17,
            "faith": 21
        },
        "growthPerLevel": {
            "power": 0.28,
            "speed": 0.2,
            "endurance": 0.24,
            "vitality": 0.23,
            "intellect": 0.22,
            "perception": 0.24,
            "luck": 0.17,
            "faith": 0.21
        },
        "skills": [
            {
                "id": "nidhogg_carrion_drake_1",
                "name": "نفس ریشه‌خوار",
                "type": "magic_aoe",
                "target": "all_enemies",
                "powerPct": 170,
                "cooldownTurns": 2,
                "durationTurns": 0,
                "description": "نفس ریشه‌خوار؛ اثر اختصاصی نیدهوگ، اژدهای لاشه‌خوار با توجه به نقش مهاجم چندهدفه / زهر."
            },
            {
                "id": "nidhogg_carrion_drake_2",
                "name": "بال‌های لاشه",
                "type": "dot_aoe",
                "target": "all_enemies",
                "powerPct": 135,
                "cooldownTurns": 4,
                "durationTurns": 3,
                "description": "بال‌های لاشه؛ اثر اختصاصی نیدهوگ، اژدهای لاشه‌خوار با توجه به نقش مهاجم چندهدفه / زهر.",
                "dotPct": 28
            },
            {
                "id": "nidhogg_carrion_drake_3",
                "name": "گاز نیدهوگ",
                "type": "physical",
                "target": "single",
                "powerPct": 205,
                "cooldownTurns": 5,
                "durationTurns": 2,
                "description": "گاز نیدهوگ؛ اثر اختصاصی نیدهوگ، اژدهای لاشه‌خوار با توجه به نقش مهاجم چندهدفه / زهر."
            }
        ],
        "passive": {
            "name": "میراث اسطوره‌ای",
            "description": "ویژگی ذاتی نیدهوگ، اژدهای لاشه‌خوار: در برابر گروه دشمن از نفس فرساینده استفاده می‌کند و تک‌هدف را با گاز ریشه‌خوار می‌زند."
        },
        "combatAI": {
            "policy": "legendary_mythic_priority",
            "rules": [
                "در برابر گروه دشمن از نفس فرساینده استفاده می‌کند و تک‌هدف را با گاز ریشه‌خوار می‌زند.",
                "prioritize_species_signature_skill",
                "protect_companion_survival",
                "avoid_overkill"
            ],
            "tieBreak": "signature_skill_then_expected_value"
        },
        "evolution": {
            "nextRank": "mythic",
            "itemId": "companion_evolution_legendary_to_mythic",
            "requirements": [
                "evolution_item_only"
            ],
            "preserveLevel": true
        }
    },
    {
        "id": "ereshkigal_underqueen",
        "name": "ارِشکیگال، بانوی کُر",
        "nameEn": "Ereshkigal",
        "rank": "legendary",
        "mythology": "بین‌النهرین",
        "levelMin": 1,
        "levelMax": 100,
        "role": "کنترل / فرمانروای زیرین",
        "lore": "ملکه جهان زیرین در اساطیر سومری و اکدی؛ فرمانروای سرزمین بی‌بازگشت.",
        "portrait": "assets/necromancer/companions/legendary/ereshkigal_underqueen.webp",
        "stats": {
            "power": 18,
            "speed": 16,
            "endurance": 24,
            "vitality": 25,
            "intellect": 27,
            "perception": 22,
            "luck": 16,
            "faith": 30
        },
        "growthPerLevel": {
            "power": 0.18,
            "speed": 0.16,
            "endurance": 0.24,
            "vitality": 0.25,
            "intellect": 0.27,
            "perception": 0.22,
            "luck": 0.16,
            "faith": 0.3
        },
        "skills": [
            {
                "id": "ereshkigal_underqueen_1",
                "name": "فرمان کُر",
                "type": "debuff",
                "target": "all_enemies",
                "powerPct": 0,
                "cooldownTurns": 2,
                "durationTurns": 0,
                "description": "فرمان کُر؛ اثر اختصاصی ارِشکیگال، بانوی کُر با توجه به نقش کنترل / فرمانروای زیرین.",
                "attackReductionPct": 18,
                "speedReductionPct": 15
            },
            {
                "id": "ereshkigal_underqueen_2",
                "name": "مهر بی‌بازگشت",
                "type": "control",
                "target": "single",
                "powerPct": 0,
                "cooldownTurns": 4,
                "durationTurns": 2,
                "description": "مهر بی‌بازگشت؛ اثر اختصاصی ارِشکیگال، بانوی کُر با توجه به نقش کنترل / فرمانروای زیرین.",
                "attackReductionPct": 18,
                "speedReductionPct": 15
            },
            {
                "id": "ereshkigal_underqueen_3",
                "name": "سکوت زیرزمین",
                "type": "magic_aoe",
                "target": "single",
                "powerPct": 205,
                "cooldownTurns": 5,
                "durationTurns": 2,
                "description": "سکوت زیرزمین؛ اثر اختصاصی ارِشکیگال، بانوی کُر با توجه به نقش کنترل / فرمانروای زیرین."
            }
        ],
        "passive": {
            "name": "میراث اسطوره‌ای",
            "description": "ویژگی ذاتی ارِشکیگال، بانوی کُر: دشمنان را با حکم جهان زیرین کند می‌کند و هدف مقاوم را با نفرین می‌بندد."
        },
        "combatAI": {
            "policy": "legendary_mythic_priority",
            "rules": [
                "دشمنان را با حکم جهان زیرین کند می‌کند و هدف مقاوم را با نفرین می‌بندد.",
                "prioritize_species_signature_skill",
                "protect_companion_survival",
                "avoid_overkill"
            ],
            "tieBreak": "signature_skill_then_expected_value"
        },
        "evolution": {
            "nextRank": "mythic",
            "itemId": "companion_evolution_legendary_to_mythic",
            "requirements": [
                "evolution_item_only"
            ],
            "preserveLevel": true
        }
    },
    {
        "id": "mot_death_lord",
        "name": "موت، بلعنده زندگی",
        "nameEn": "Mot",
        "rank": "legendary",
        "mythology": "اوگاریتی / کنعانی",
        "levelMin": 1,
        "levelMax": 100,
        "role": "فرساینده / جذب حیات",
        "lore": "خدای مرگ و خشکسالی در چرخه بعل؛ تجسم قحطی و بلعندگی مرگ.",
        "portrait": "assets/necromancer/companions/legendary/mot_death_lord.webp",
        "stats": {
            "power": 21,
            "speed": 14,
            "endurance": 27,
            "vitality": 28,
            "intellect": 24,
            "perception": 19,
            "luck": 12,
            "faith": 25
        },
        "growthPerLevel": {
            "power": 0.21,
            "speed": 0.14,
            "endurance": 0.27,
            "vitality": 0.28,
            "intellect": 0.24,
            "perception": 0.19,
            "luck": 0.12,
            "faith": 0.25
        },
        "skills": [
            {
                "id": "mot_death_lord_1",
                "name": "دهان موت",
                "type": "dot",
                "target": "single",
                "powerPct": 170,
                "cooldownTurns": 2,
                "durationTurns": 3,
                "description": "دهان موت؛ اثر اختصاصی موت، بلعنده زندگی با توجه به نقش فرساینده / جذب حیات.",
                "dotPct": 28
            },
            {
                "id": "mot_death_lord_2",
                "name": "خشکسالی سیاه",
                "type": "debuff",
                "target": "all_enemies",
                "powerPct": 0,
                "cooldownTurns": 4,
                "durationTurns": 2,
                "description": "خشکسالی سیاه؛ اثر اختصاصی موت، بلعنده زندگی با توجه به نقش فرساینده / جذب حیات.",
                "attackReductionPct": 18,
                "speedReductionPct": 15
            },
            {
                "id": "mot_death_lord_3",
                "name": "بلع نیروی حیات",
                "type": "magic",
                "target": "single",
                "powerPct": 205,
                "cooldownTurns": 5,
                "durationTurns": 2,
                "description": "بلع نیروی حیات؛ اثر اختصاصی موت، بلعنده زندگی با توجه به نقش فرساینده / جذب حیات."
            }
        ],
        "passive": {
            "name": "میراث اسطوره‌ای",
            "description": "ویژگی ذاتی موت، بلعنده زندگی: به هدف پرسلامت اثر زوال می‌زند و از آسیبِ واردشده بخشی بازیابی می‌کند."
        },
        "combatAI": {
            "policy": "legendary_mythic_priority",
            "rules": [
                "به هدف پرسلامت اثر زوال می‌زند و از آسیبِ واردشده بخشی بازیابی می‌کند.",
                "prioritize_species_signature_skill",
                "protect_companion_survival",
                "avoid_overkill"
            ],
            "tieBreak": "signature_skill_then_expected_value"
        },
        "evolution": {
            "nextRank": "mythic",
            "itemId": "companion_evolution_legendary_to_mythic",
            "requirements": [
                "evolution_item_only"
            ],
            "preserveLevel": true
        }
    },
    {
        "id": "charon_soul_ferryman",
        "name": "خارون، گذربان ارواح",
        "nameEn": "Charon",
        "rank": "legendary",
        "mythology": "یونان باستان",
        "levelMin": 1,
        "levelMax": 100,
        "role": "پشتیبان / جابه‌جایی",
        "lore": "قایقران روان‌های مردگان در رودهای جهان زیرین یونانی.",
        "portrait": "assets/necromancer/companions/legendary/charon_soul_ferryman.webp",
        "stats": {
            "power": 13,
            "speed": 27,
            "endurance": 19,
            "vitality": 21,
            "intellect": 22,
            "perception": 28,
            "luck": 19,
            "faith": 24
        },
        "growthPerLevel": {
            "power": 0.13,
            "speed": 0.27,
            "endurance": 0.19,
            "vitality": 0.21,
            "intellect": 0.22,
            "perception": 0.28,
            "luck": 0.19,
            "faith": 0.24
        },
        "skills": [
            {
                "id": "charon_soul_ferryman_1",
                "name": "عبور سکه سیاه",
                "type": "shield",
                "target": "lowest_hp_ally",
                "powerPct": 0,
                "cooldownTurns": 2,
                "durationTurns": 0,
                "description": "عبور سکه سیاه؛ اثر اختصاصی خارون، گذربان ارواح با توجه به نقش پشتیبان / جابه‌جایی.",
                "shieldPct": 26
            },
            {
                "id": "charon_soul_ferryman_2",
                "name": "پاروی روان",
                "type": "buff",
                "target": "all_allies",
                "powerPct": 0,
                "cooldownTurns": 4,
                "durationTurns": 2,
                "description": "پاروی روان؛ اثر اختصاصی خارون، گذربان ارواح با توجه به نقش پشتیبان / جابه‌جایی."
            },
            {
                "id": "charon_soul_ferryman_3",
                "name": "مه عبور",
                "type": "control",
                "target": "single",
                "powerPct": 0,
                "cooldownTurns": 5,
                "durationTurns": 2,
                "description": "مه عبور؛ اثر اختصاصی خارون، گذربان ارواح با توجه به نقش پشتیبان / جابه‌جایی.",
                "attackReductionPct": 18,
                "speedReductionPct": 15
            }
        ],
        "passive": {
            "name": "میراث اسطوره‌ای",
            "description": "ویژگی ذاتی خارون، گذربان ارواح: همراه آسیب‌دیده را از خطر دور می‌کند و با سکه سیاه دشمن را نشان‌گذاری می‌کند."
        },
        "combatAI": {
            "policy": "legendary_mythic_priority",
            "rules": [
                "همراه آسیب‌دیده را از خطر دور می‌کند و با سکه سیاه دشمن را نشان‌گذاری می‌کند.",
                "prioritize_species_signature_skill",
                "protect_companion_survival",
                "avoid_overkill"
            ],
            "tieBreak": "signature_skill_then_expected_value"
        },
        "evolution": {
            "nextRank": "mythic",
            "itemId": "companion_evolution_legendary_to_mythic",
            "requirements": [
                "evolution_item_only"
            ],
            "preserveLevel": true
        }
    },
    {
        "id": "empousa_hell_shade",
        "name": "امپوسا، سایه هادِس",
        "nameEn": "Empousa",
        "rank": "legendary",
        "mythology": "یونان باستان",
        "levelMin": 1,
        "levelMax": 100,
        "role": "قاتل / فریب",
        "lore": "موجودی شبح‌گون و دگرچهره در خدمت هکاته که در روایت‌ها با جهان زیرین پیوند دارد.",
        "portrait": "assets/necromancer/companions/legendary/empousa_hell_shade.webp",
        "stats": {
            "power": 19,
            "speed": 28,
            "endurance": 16,
            "vitality": 20,
            "intellect": 24,
            "perception": 27,
            "luck": 22,
            "faith": 18
        },
        "growthPerLevel": {
            "power": 0.19,
            "speed": 0.28,
            "endurance": 0.16,
            "vitality": 0.2,
            "intellect": 0.24,
            "perception": 0.27,
            "luck": 0.22,
            "faith": 0.18
        },
        "skills": [
            {
                "id": "empousa_hell_shade_1",
                "name": "چهره دزدیده",
                "type": "silence",
                "target": "single",
                "powerPct": 0,
                "cooldownTurns": 2,
                "durationTurns": 0,
                "description": "چهره دزدیده؛ اثر اختصاصی امپوسا، سایه هادِس با توجه به نقش قاتل / فریب.",
                "attackReductionPct": 18,
                "speedReductionPct": 15
            },
            {
                "id": "empousa_hell_shade_2",
                "name": "شعله هکاته",
                "type": "magic",
                "target": "single",
                "powerPct": 135,
                "cooldownTurns": 4,
                "durationTurns": 2,
                "description": "شعله هکاته؛ اثر اختصاصی امپوسا، سایه هادِس با توجه به نقش قاتل / فریب."
            },
            {
                "id": "empousa_hell_shade_3",
                "name": "گام دگرچهره",
                "type": "buff",
                "target": "self",
                "powerPct": 0,
                "cooldownTurns": 5,
                "durationTurns": 2,
                "description": "گام دگرچهره؛ اثر اختصاصی امپوسا، سایه هادِس با توجه به نقش قاتل / فریب."
            }
        ],
        "passive": {
            "name": "میراث اسطوره‌ای",
            "description": "ویژگی ذاتی امپوسا، سایه هادِس: دشمن جادوگر را با فریب مختل می‌کند و سپس به هدف کم‌جان یورش می‌برد."
        },
        "combatAI": {
            "policy": "legendary_mythic_priority",
            "rules": [
                "دشمن جادوگر را با فریب مختل می‌کند و سپس به هدف کم‌جان یورش می‌برد.",
                "prioritize_species_signature_skill",
                "protect_companion_survival",
                "avoid_overkill"
            ],
            "tieBreak": "signature_skill_then_expected_value"
        },
        "evolution": {
            "nextRank": "mythic",
            "itemId": "companion_evolution_legendary_to_mythic",
            "requirements": [
                "evolution_item_only"
            ],
            "preserveLevel": true
        }
    },
    {
        "id": "ker_death_spirit",
        "name": "کِر، روح خون‌خواه مرگ",
        "nameEn": "Keres",
        "rank": "legendary",
        "mythology": "یونان باستان",
        "levelMin": 1,
        "levelMax": 100,
        "role": "شکارچی / تمام‌کننده",
        "lore": "ارواح مؤنث مرگ خشونت‌آمیز که در میدان نبرد جان‌ها را می‌ربایند.",
        "portrait": "assets/necromancer/companions/legendary/ker_death_spirit.webp",
        "stats": {
            "power": 26,
            "speed": 29,
            "endurance": 17,
            "vitality": 19,
            "intellect": 15,
            "perception": 28,
            "luck": 20,
            "faith": 17
        },
        "growthPerLevel": {
            "power": 0.26,
            "speed": 0.29,
            "endurance": 0.17,
            "vitality": 0.19,
            "intellect": 0.15,
            "perception": 0.28,
            "luck": 0.2,
            "faith": 0.17
        },
        "skills": [
            {
                "id": "ker_death_spirit_1",
                "name": "چنگال کِر",
                "type": "physical",
                "target": "single",
                "powerPct": 170,
                "cooldownTurns": 2,
                "durationTurns": 0,
                "description": "چنگال کِر؛ اثر اختصاصی کِر، روح خون‌خواه مرگ با توجه به نقش شکارچی / تمام‌کننده."
            },
            {
                "id": "ker_death_spirit_2",
                "name": "نشان مرگ",
                "type": "debuff",
                "target": "single",
                "powerPct": 0,
                "cooldownTurns": 4,
                "durationTurns": 2,
                "description": "نشان مرگ؛ اثر اختصاصی کِر، روح خون‌خواه مرگ با توجه به نقش شکارچی / تمام‌کننده.",
                "attackReductionPct": 18,
                "speedReductionPct": 15
            },
            {
                "id": "ker_death_spirit_3",
                "name": "یورش خون‌خواه",
                "type": "physical",
                "target": "single",
                "powerPct": 205,
                "cooldownTurns": 5,
                "durationTurns": 2,
                "description": "یورش خون‌خواه؛ اثر اختصاصی کِر، روح خون‌خواه مرگ با توجه به نقش شکارچی / تمام‌کننده."
            }
        ],
        "passive": {
            "name": "میراث اسطوره‌ای",
            "description": "ویژگی ذاتی کِر، روح خون‌خواه مرگ: هدف زخمی را اولویت می‌دهد و در برابر چند دشمن، زخم مرگ را پخش می‌کند."
        },
        "combatAI": {
            "policy": "legendary_mythic_priority",
            "rules": [
                "هدف زخمی را اولویت می‌دهد و در برابر چند دشمن، زخم مرگ را پخش می‌کند.",
                "prioritize_species_signature_skill",
                "protect_companion_survival",
                "avoid_overkill"
            ],
            "tieBreak": "signature_skill_then_expected_value"
        },
        "evolution": {
            "nextRank": "mythic",
            "itemId": "companion_evolution_legendary_to_mythic",
            "requirements": [
                "evolution_item_only"
            ],
            "preserveLevel": true
        }
    },
    {
        "id": "vetala_corpse_spirit",
        "name": "وِتالا، روحِ آویخته به جسد",
        "nameEn": "Vetala",
        "rank": "legendary",
        "mythology": "هند",
        "levelMin": 1,
        "levelMax": 100,
        "role": "جادوگر / تسخیر",
        "lore": "روحی در فولکلور هند که جسد را تسخیر می‌کند و با گورستان‌ها پیوند دارد.",
        "portrait": "assets/necromancer/companions/legendary/vetala_corpse_spirit.webp",
        "stats": {
            "power": 14,
            "speed": 19,
            "endurance": 18,
            "vitality": 24,
            "intellect": 29,
            "perception": 26,
            "luck": 18,
            "faith": 28
        },
        "growthPerLevel": {
            "power": 0.14,
            "speed": 0.19,
            "endurance": 0.18,
            "vitality": 0.24,
            "intellect": 0.29,
            "perception": 0.26,
            "luck": 0.18,
            "faith": 0.28
        },
        "skills": [
            {
                "id": "vetala_corpse_spirit_1",
                "name": "تسخیر جسد",
                "type": "control",
                "target": "single",
                "powerPct": 0,
                "cooldownTurns": 2,
                "durationTurns": 0,
                "description": "تسخیر جسد؛ اثر اختصاصی وِتالا، روحِ آویخته به جسد با توجه به نقش جادوگر / تسخیر.",
                "attackReductionPct": 18,
                "speedReductionPct": 15
            },
            {
                "id": "vetala_corpse_spirit_2",
                "name": "معمای وتالا",
                "type": "magic",
                "target": "single",
                "powerPct": 135,
                "cooldownTurns": 4,
                "durationTurns": 2,
                "description": "معمای وتالا؛ اثر اختصاصی وِتالا، روحِ آویخته به جسد با توجه به نقش جادوگر / تسخیر."
            },
            {
                "id": "vetala_corpse_spirit_3",
                "name": "لمس سرد",
                "type": "debuff",
                "target": "single",
                "powerPct": 0,
                "cooldownTurns": 5,
                "durationTurns": 2,
                "description": "لمس سرد؛ اثر اختصاصی وِتالا، روحِ آویخته به جسد با توجه به نقش جادوگر / تسخیر.",
                "attackReductionPct": 18,
                "speedReductionPct": 15
            }
        ],
        "passive": {
            "name": "میراث اسطوره‌ای",
            "description": "ویژگی ذاتی وِتالا، روحِ آویخته به جسد: دشمن دارای مهارت آماده را مختل می‌کند و با لمس سرد انرژی می‌رباید."
        },
        "combatAI": {
            "policy": "legendary_mythic_priority",
            "rules": [
                "دشمن دارای مهارت آماده را مختل می‌کند و با لمس سرد انرژی می‌رباید.",
                "prioritize_species_signature_skill",
                "protect_companion_survival",
                "avoid_overkill"
            ],
            "tieBreak": "signature_skill_then_expected_value"
        },
        "evolution": {
            "nextRank": "mythic",
            "itemId": "companion_evolution_legendary_to_mythic",
            "requirements": [
                "evolution_item_only"
            ],
            "preserveLevel": true
        }
    },
    {
        "id": "bhoot_pret_king",
        "name": "پادشاه پرِتاها",
        "nameEn": "Preta",
        "rank": "legendary",
        "mythology": "هند / بودایی",
        "levelMin": 1,
        "levelMax": 100,
        "role": "تضعیف / جذب انرژی",
        "lore": "الهام از ارواح گرسنه و پریتاها در سنت‌های هندی و بودایی؛ این پادشاه، بازآفرینی بازی است.",
        "portrait": "assets/necromancer/companions/legendary/bhoot_pret_king.webp",
        "stats": {
            "power": 17,
            "speed": 12,
            "endurance": 25,
            "vitality": 27,
            "intellect": 28,
            "perception": 20,
            "luck": 14,
            "faith": 29
        },
        "growthPerLevel": {
            "power": 0.17,
            "speed": 0.12,
            "endurance": 0.25,
            "vitality": 0.27,
            "intellect": 0.28,
            "perception": 0.2,
            "luck": 0.14,
            "faith": 0.29
        },
        "skills": [
            {
                "id": "bhoot_pret_king_1",
                "name": "گرسنگی ابدی",
                "type": "dot_aoe",
                "target": "all_enemies",
                "powerPct": 170,
                "cooldownTurns": 2,
                "durationTurns": 3,
                "description": "گرسنگی ابدی؛ اثر اختصاصی پادشاه پرِتاها با توجه به نقش تضعیف / جذب انرژی.",
                "dotPct": 28
            },
            {
                "id": "bhoot_pret_king_2",
                "name": "دهان تهی",
                "type": "debuff",
                "target": "all_enemies",
                "powerPct": 0,
                "cooldownTurns": 4,
                "durationTurns": 2,
                "description": "دهان تهی؛ اثر اختصاصی پادشاه پرِتاها با توجه به نقش تضعیف / جذب انرژی.",
                "attackReductionPct": 18,
                "speedReductionPct": 15
            },
            {
                "id": "bhoot_pret_king_3",
                "name": "قحطی روح",
                "type": "magic",
                "target": "single",
                "powerPct": 205,
                "cooldownTurns": 5,
                "durationTurns": 2,
                "description": "قحطی روح؛ اثر اختصاصی پادشاه پرِتاها با توجه به نقش تضعیف / جذب انرژی."
            }
        ],
        "passive": {
            "name": "میراث اسطوره‌ای",
            "description": "ویژگی ذاتی پادشاه پرِتاها: از دشمنان متعدد نیروی اندک می‌مکد و روی هدف درمان‌شونده نفرین گرسنگی می‌گذارد."
        },
        "combatAI": {
            "policy": "legendary_mythic_priority",
            "rules": [
                "از دشمنان متعدد نیروی اندک می‌مکد و روی هدف درمان‌شونده نفرین گرسنگی می‌گذارد.",
                "prioritize_species_signature_skill",
                "protect_companion_survival",
                "avoid_overkill"
            ],
            "tieBreak": "signature_skill_then_expected_value"
        },
        "evolution": {
            "nextRank": "mythic",
            "itemId": "companion_evolution_legendary_to_mythic",
            "requirements": [
                "evolution_item_only"
            ],
            "preserveLevel": true
        }
    },
    {
        "id": "yama_black_buffalo",
        "name": "یاما، سوار بر گاومیش سیاه",
        "nameEn": "Yama",
        "rank": "legendary",
        "mythology": "هند / بودایی",
        "levelMin": 1,
        "levelMax": 100,
        "role": "تانک / داوری",
        "lore": "خدای مرگ و داور مردگان در سنت‌های هندی و بودایی؛ این همراه تجسم جنگیِ اسطوره است.",
        "portrait": "assets/necromancer/companions/legendary/yama_black_buffalo.webp",
        "stats": {
            "power": 28,
            "speed": 15,
            "endurance": 29,
            "vitality": 30,
            "intellect": 16,
            "perception": 20,
            "luck": 12,
            "faith": 28
        },
        "growthPerLevel": {
            "power": 0.28,
            "speed": 0.15,
            "endurance": 0.29,
            "vitality": 0.3,
            "intellect": 0.16,
            "perception": 0.2,
            "luck": 0.12,
            "faith": 0.28
        },
        "skills": [
            {
                "id": "yama_black_buffalo_1",
                "name": "فرمان یاما",
                "type": "guard",
                "target": "single",
                "powerPct": 0,
                "cooldownTurns": 2,
                "durationTurns": 0,
                "description": "فرمان یاما؛ اثر اختصاصی یاما، سوار بر گاومیش سیاه با توجه به نقش تانک / داوری.",
                "shieldPct": 26
            },
            {
                "id": "yama_black_buffalo_2",
                "name": "مهر داوری",
                "type": "shield",
                "target": "self",
                "powerPct": 0,
                "cooldownTurns": 4,
                "durationTurns": 2,
                "description": "مهر داوری؛ اثر اختصاصی یاما، سوار بر گاومیش سیاه با توجه به نقش تانک / داوری.",
                "shieldPct": 20
            },
            {
                "id": "yama_black_buffalo_3",
                "name": "شاخ گاومیش",
                "type": "physical",
                "target": "single",
                "powerPct": 205,
                "cooldownTurns": 5,
                "durationTurns": 2,
                "description": "شاخ گاومیش؛ اثر اختصاصی یاما، سوار بر گاومیش سیاه با توجه به نقش تانک / داوری."
            }
        ],
        "passive": {
            "name": "میراث اسطوره‌ای",
            "description": "ویژگی ذاتی یاما، سوار بر گاومیش سیاه: دشمن مهاجم را به چالش می‌کشد و در برابر حمله‌های سنگین سپر داوری می‌سازد."
        },
        "combatAI": {
            "policy": "legendary_mythic_priority",
            "rules": [
                "دشمن مهاجم را به چالش می‌کشد و در برابر حمله‌های سنگین سپر داوری می‌سازد.",
                "prioritize_species_signature_skill",
                "protect_companion_survival",
                "avoid_overkill"
            ],
            "tieBreak": "signature_skill_then_expected_value"
        },
        "evolution": {
            "nextRank": "mythic",
            "itemId": "companion_evolution_legendary_to_mythic",
            "requirements": [
                "evolution_item_only"
            ],
            "preserveLevel": true
        }
    },
    {
        "id": "gashadokuro_giant",
        "name": "گاشادوکورو، اسکلت گرسنه",
        "nameEn": "Gashadokuro",
        "rank": "legendary",
        "mythology": "ژاپن",
        "levelMin": 1,
        "levelMax": 100,
        "role": "تانک / ضربه گروهی",
        "lore": "اسکلت غول‌آسای فولکلور ژاپن که از استخوان مردگان بی‌گور شکل می‌گیرد.",
        "portrait": "assets/necromancer/companions/legendary/gashadokuro_giant.webp",
        "stats": {
            "power": 25,
            "speed": 24,
            "endurance": 28,
            "vitality": 23,
            "intellect": 18,
            "perception": 22,
            "luck": 16,
            "faith": 24
        },
        "growthPerLevel": {
            "power": 0.25,
            "speed": 0.24,
            "endurance": 0.28,
            "vitality": 0.23,
            "intellect": 0.18,
            "perception": 0.22,
            "luck": 0.16,
            "faith": 0.24
        },
        "skills": [
            {
                "id": "gashadokuro_giant_1",
                "name": "استخوان‌کوب",
                "type": "physical_multi",
                "target": "all_enemies",
                "powerPct": 170,
                "cooldownTurns": 2,
                "durationTurns": 0,
                "description": "استخوان‌کوب؛ اثر اختصاصی گاشادوکورو، اسکلت گرسنه با توجه به نقش تانک / ضربه گروهی."
            },
            {
                "id": "gashadokuro_giant_2",
                "name": "غرش گورستان",
                "type": "magic_aoe",
                "target": "all_enemies",
                "powerPct": 135,
                "cooldownTurns": 4,
                "durationTurns": 2,
                "description": "غرش گورستان؛ اثر اختصاصی گاشادوکورو، اسکلت گرسنه با توجه به نقش تانک / ضربه گروهی."
            },
            {
                "id": "gashadokuro_giant_3",
                "name": "دست‌های بی‌شمار",
                "type": "physical",
                "target": "single",
                "powerPct": 205,
                "cooldownTurns": 5,
                "durationTurns": 2,
                "description": "دست‌های بی‌شمار؛ اثر اختصاصی گاشادوکورو، اسکلت گرسنه با توجه به نقش تانک / ضربه گروهی."
            }
        ],
        "passive": {
            "name": "میراث اسطوره‌ای",
            "description": "ویژگی ذاتی گاشادوکورو، اسکلت گرسنه: با چند دشمن ضربه استخوانی گسترده می‌زند؛ در تک‌هدف، خردکردن زره را انتخاب می‌کند."
        },
        "combatAI": {
            "policy": "legendary_mythic_priority",
            "rules": [
                "با چند دشمن ضربه استخوانی گسترده می‌زند؛ در تک‌هدف، خردکردن زره را انتخاب می‌کند.",
                "prioritize_species_signature_skill",
                "protect_companion_survival",
                "avoid_overkill"
            ],
            "tieBreak": "signature_skill_then_expected_value"
        },
        "evolution": {
            "nextRank": "mythic",
            "itemId": "companion_evolution_legendary_to_mythic",
            "requirements": [
                "evolution_item_only"
            ],
            "preserveLevel": true
        }
    },
    {
        "id": "shinigami_reaper",
        "name": "شینیگامی، دروگر ارواح",
        "nameEn": "Shinigami",
        "rank": "legendary",
        "mythology": "ژاپن",
        "levelMin": 1,
        "levelMax": 100,
        "role": "قاتل / کنترل نوبت",
        "lore": "مفهوم ارواح مرگ در فولکلور و ادبیات ژاپن؛ طراحی بازی بازآفرینی سنتی است.",
        "portrait": "assets/necromancer/companions/legendary/shinigami_reaper.webp",
        "stats": {
            "power": 19,
            "speed": 30,
            "endurance": 18,
            "vitality": 20,
            "intellect": 25,
            "perception": 29,
            "luck": 23,
            "faith": 20
        },
        "growthPerLevel": {
            "power": 0.19,
            "speed": 0.3,
            "endurance": 0.18,
            "vitality": 0.2,
            "intellect": 0.25,
            "perception": 0.29,
            "luck": 0.23,
            "faith": 0.2
        },
        "skills": [
            {
                "id": "shinigami_reaper_1",
                "name": "برش روح",
                "type": "silence",
                "target": "single",
                "powerPct": 0,
                "cooldownTurns": 2,
                "durationTurns": 0,
                "description": "برش روح؛ اثر اختصاصی شینیگامی، دروگر ارواح با توجه به نقش قاتل / کنترل نوبت.",
                "attackReductionPct": 18,
                "speedReductionPct": 15
            },
            {
                "id": "shinigami_reaper_2",
                "name": "سایه‌گام",
                "type": "control",
                "target": "single",
                "powerPct": 0,
                "cooldownTurns": 4,
                "durationTurns": 2,
                "description": "سایه‌گام؛ اثر اختصاصی شینیگامی، دروگر ارواح با توجه به نقش قاتل / کنترل نوبت.",
                "attackReductionPct": 18,
                "speedReductionPct": 15
            },
            {
                "id": "shinigami_reaper_3",
                "name": "توقف زمان",
                "type": "physical",
                "target": "single",
                "powerPct": 205,
                "cooldownTurns": 5,
                "durationTurns": 2,
                "description": "توقف زمان؛ اثر اختصاصی شینیگامی، دروگر ارواح با توجه به نقش قاتل / کنترل نوبت."
            }
        ],
        "passive": {
            "name": "میراث اسطوره‌ای",
            "description": "ویژگی ذاتی شینیگامی، دروگر ارواح: هدف دارای HP پایین را نشان می‌زند و زمان اجرای مهارت دشمن را مختل می‌کند."
        },
        "combatAI": {
            "policy": "legendary_mythic_priority",
            "rules": [
                "هدف دارای HP پایین را نشان می‌زند و زمان اجرای مهارت دشمن را مختل می‌کند.",
                "prioritize_species_signature_skill",
                "protect_companion_survival",
                "avoid_overkill"
            ],
            "tieBreak": "signature_skill_then_expected_value"
        },
        "evolution": {
            "nextRank": "mythic",
            "itemId": "companion_evolution_legendary_to_mythic",
            "requirements": [
                "evolution_item_only"
            ],
            "preserveLevel": true
        }
    },
    {
        "id": "mictlantecuhtli_bone_king",
        "name": "میکتلانتکوتلی، شاه استخوانی",
        "nameEn": "Mictlantecuhtli",
        "rank": "legendary",
        "mythology": "آزتک / مکزیک",
        "levelMin": 1,
        "levelMax": 100,
        "role": "فرمانروای مردگان / جادوی گروهی",
        "lore": "خدای جهان زیرین میکتلان و فرمانروای مردگان در اساطیر آزتک.",
        "portrait": "assets/necromancer/companions/legendary/mictlantecuhtli_bone_king.webp",
        "stats": {
            "power": 30,
            "speed": 16,
            "endurance": 26,
            "vitality": 28,
            "intellect": 20,
            "perception": 22,
            "luck": 14,
            "faith": 30
        },
        "growthPerLevel": {
            "power": 0.3,
            "speed": 0.16,
            "endurance": 0.26,
            "vitality": 0.28,
            "intellect": 0.2,
            "perception": 0.22,
            "luck": 0.14,
            "faith": 0.3
        },
        "skills": [
            {
                "id": "mictlantecuhtli_bone_king_1",
                "name": "نفرین میکتلان",
                "type": "magic_aoe",
                "target": "all_enemies",
                "powerPct": 170,
                "cooldownTurns": 2,
                "durationTurns": 0,
                "description": "نفرین میکتلان؛ اثر اختصاصی میکتلانتکوتلی، شاه استخوانی با توجه به نقش فرمانروای مردگان / جادوی گروهی."
            },
            {
                "id": "mictlantecuhtli_bone_king_2",
                "name": "فرمان استخوان",
                "type": "debuff",
                "target": "all_enemies",
                "powerPct": 0,
                "cooldownTurns": 4,
                "durationTurns": 2,
                "description": "فرمان استخوان؛ اثر اختصاصی میکتلانتکوتلی، شاه استخوانی با توجه به نقش فرمانروای مردگان / جادوی گروهی.",
                "attackReductionPct": 18,
                "speedReductionPct": 15
            },
            {
                "id": "mictlantecuhtli_bone_king_3",
                "name": "تاریکی زیرین",
                "type": "magic",
                "target": "single",
                "powerPct": 205,
                "cooldownTurns": 5,
                "durationTurns": 2,
                "description": "تاریکی زیرین؛ اثر اختصاصی میکتلانتکوتلی، شاه استخوانی با توجه به نقش فرمانروای مردگان / جادوی گروهی."
            }
        ],
        "passive": {
            "name": "میراث اسطوره‌ای",
            "description": "ویژگی ذاتی میکتلانتکوتلی، شاه استخوانی: با حضور چند دشمن نفرین میکتلان را می‌گستراند و در غیر این صورت ضربه سلطنتی می‌زند."
        },
        "combatAI": {
            "policy": "legendary_mythic_priority",
            "rules": [
                "با حضور چند دشمن نفرین میکتلان را می‌گستراند و در غیر این صورت ضربه سلطنتی می‌زند.",
                "prioritize_species_signature_skill",
                "protect_companion_survival",
                "avoid_overkill"
            ],
            "tieBreak": "signature_skill_then_expected_value"
        },
        "evolution": {
            "nextRank": "mythic",
            "itemId": "companion_evolution_legendary_to_mythic",
            "requirements": [
                "evolution_item_only"
            ],
            "preserveLevel": true
        }
    },
    {
        "id": "mictecacihuatl_skull_queen",
        "name": "میکتکاسیواتل، بانوی استخوان",
        "nameEn": "Mictecacihuatl",
        "rank": "legendary",
        "mythology": "آزتک / مکزیک",
        "levelMin": 1,
        "levelMax": 100,
        "role": "پشتیبان / احضار سایه",
        "lore": "بانوی مردگان و همسر میکتلانتکوتلی در اساطیر آزتک.",
        "portrait": "assets/necromancer/companions/legendary/mictecacihuatl_skull_queen.webp",
        "stats": {
            "power": 18,
            "speed": 24,
            "endurance": 23,
            "vitality": 27,
            "intellect": 24,
            "perception": 26,
            "luck": 18,
            "faith": 28
        },
        "growthPerLevel": {
            "power": 0.18,
            "speed": 0.24,
            "endurance": 0.23,
            "vitality": 0.27,
            "intellect": 0.24,
            "perception": 0.26,
            "luck": 0.18,
            "faith": 0.28
        },
        "skills": [
            {
                "id": "mictecacihuatl_skull_queen_1",
                "name": "پرده استخوان",
                "type": "shield",
                "target": "all_allies",
                "powerPct": 0,
                "cooldownTurns": 2,
                "durationTurns": 0,
                "description": "پرده استخوان؛ اثر اختصاصی میکتکاسیواتل، بانوی استخوان با توجه به نقش پشتیبان / احضار سایه.",
                "shieldPct": 26
            },
            {
                "id": "mictecacihuatl_skull_queen_2",
                "name": "ندای بانوی مردگان",
                "type": "heal",
                "target": "lowest_hp_ally",
                "powerPct": 0,
                "cooldownTurns": 4,
                "durationTurns": 2,
                "description": "ندای بانوی مردگان؛ اثر اختصاصی میکتکاسیواتل، بانوی استخوان با توجه به نقش پشتیبان / احضار سایه.",
                "healPct": 18
            },
            {
                "id": "mictecacihuatl_skull_queen_3",
                "name": "نگاه جشن مردگان",
                "type": "magic_aoe",
                "target": "all_enemies",
                "powerPct": 205,
                "cooldownTurns": 5,
                "durationTurns": 2,
                "description": "نگاه جشن مردگان؛ اثر اختصاصی میکتکاسیواتل، بانوی استخوان با توجه به نقش پشتیبان / احضار سایه."
            }
        ],
        "passive": {
            "name": "میراث اسطوره‌ای",
            "description": "ویژگی ذاتی میکتکاسیواتل، بانوی استخوان: همراهان زخمی را با پرده استخوانی محافظت می‌کند و سایه‌های مردگان را برای ضربه فرا می‌خواند."
        },
        "combatAI": {
            "policy": "legendary_mythic_priority",
            "rules": [
                "همراهان زخمی را با پرده استخوانی محافظت می‌کند و سایه‌های مردگان را برای ضربه فرا می‌خواند.",
                "prioritize_species_signature_skill",
                "protect_companion_survival",
                "avoid_overkill"
            ],
            "tieBreak": "signature_skill_then_expected_value"
        },
        "evolution": {
            "nextRank": "mythic",
            "itemId": "companion_evolution_legendary_to_mythic",
            "requirements": [
                "evolution_item_only"
            ],
            "preserveLevel": true
        }
    },
    {
        "id": "camazotz_bat_death",
        "name": "کامازوتس، خفاش مرگ",
        "nameEn": "Camazotz",
        "rank": "legendary",
        "mythology": "مایا / آمریکای میانه",
        "levelMin": 1,
        "levelMax": 100,
        "role": "مهاجم هوایی / خون‌ریزی",
        "lore": "موجود خفاش‌گون مرتبط با مرگ در سنت مایا و روایت‌های پوپول ووه.",
        "portrait": "assets/necromancer/companions/legendary/camazotz_bat_death.webp",
        "stats": {
            "power": 23,
            "speed": 29,
            "endurance": 19,
            "vitality": 20,
            "intellect": 21,
            "perception": 30,
            "luck": 22,
            "faith": 19
        },
        "growthPerLevel": {
            "power": 0.23,
            "speed": 0.29,
            "endurance": 0.19,
            "vitality": 0.2,
            "intellect": 0.21,
            "perception": 0.3,
            "luck": 0.22,
            "faith": 0.19
        },
        "skills": [
            {
                "id": "camazotz_bat_death_1",
                "name": "چنگال خفاش",
                "type": "physical",
                "target": "single",
                "powerPct": 170,
                "cooldownTurns": 2,
                "durationTurns": 0,
                "description": "چنگال خفاش؛ اثر اختصاصی کامازوتس، خفاش مرگ با توجه به نقش مهاجم هوایی / خون‌ریزی."
            },
            {
                "id": "camazotz_bat_death_2",
                "name": "خفاش‌های خون‌خوار",
                "type": "dot",
                "target": "all_enemies",
                "powerPct": 135,
                "cooldownTurns": 4,
                "durationTurns": 3,
                "description": "خفاش‌های خون‌خوار؛ اثر اختصاصی کامازوتس، خفاش مرگ با توجه به نقش مهاجم هوایی / خون‌ریزی.",
                "dotPct": 28
            },
            {
                "id": "camazotz_bat_death_3",
                "name": "غواصی شبانه",
                "type": "physical_multi",
                "target": "single",
                "powerPct": 205,
                "cooldownTurns": 5,
                "durationTurns": 2,
                "description": "غواصی شبانه؛ اثر اختصاصی کامازوتس، خفاش مرگ با توجه به نقش مهاجم هوایی / خون‌ریزی."
            }
        ],
        "passive": {
            "name": "میراث اسطوره‌ای",
            "description": "ویژگی ذاتی کامازوتس، خفاش مرگ: از پشت خط دشمن حمله می‌کند و هدف تنها را با چنگال خون‌ریز می‌زند."
        },
        "combatAI": {
            "policy": "legendary_mythic_priority",
            "rules": [
                "از پشت خط دشمن حمله می‌کند و هدف تنها را با چنگال خون‌ریز می‌زند.",
                "prioritize_species_signature_skill",
                "protect_companion_survival",
                "avoid_overkill"
            ],
            "tieBreak": "signature_skill_then_expected_value"
        },
        "evolution": {
            "nextRank": "mythic",
            "itemId": "companion_evolution_legendary_to_mythic",
            "requirements": [
                "evolution_item_only"
            ],
            "preserveLevel": true
        }
    },
    {
        "id": "ammit_soul_devourer",
        "name": "آمیت، بلعنده روان",
        "nameEn": "Ammit",
        "rank": "legendary",
        "mythology": "مصر باستان",
        "levelMin": 1,
        "levelMax": 100,
        "role": "تمام‌کننده / ضددرمان",
        "lore": "موجود اسطوره‌ای با ویژگی‌های تمساح، شیر و اسب‌آبی که قلب نالایق را می‌بلعد.",
        "portrait": "assets/necromancer/companions/legendary/ammit_soul_devourer.webp",
        "stats": {
            "power": 28,
            "speed": 22,
            "endurance": 25,
            "vitality": 27,
            "intellect": 18,
            "perception": 26,
            "luck": 15,
            "faith": 26
        },
        "growthPerLevel": {
            "power": 0.28,
            "speed": 0.22,
            "endurance": 0.25,
            "vitality": 0.27,
            "intellect": 0.18,
            "perception": 0.26,
            "luck": 0.15,
            "faith": 0.26
        },
        "skills": [
            {
                "id": "ammit_soul_devourer_1",
                "name": "بلع قلب",
                "type": "physical",
                "target": "single",
                "powerPct": 170,
                "cooldownTurns": 2,
                "durationTurns": 0,
                "description": "بلع قلب؛ اثر اختصاصی آمیت، بلعنده روان با توجه به نقش تمام‌کننده / ضددرمان."
            },
            {
                "id": "ammit_soul_devourer_2",
                "name": "داوری نهایی",
                "type": "debuff",
                "target": "all_enemies",
                "powerPct": 0,
                "cooldownTurns": 4,
                "durationTurns": 2,
                "description": "داوری نهایی؛ اثر اختصاصی آمیت، بلعنده روان با توجه به نقش تمام‌کننده / ضددرمان.",
                "attackReductionPct": 18,
                "speedReductionPct": 15
            },
            {
                "id": "ammit_soul_devourer_3",
                "name": "معده نفرین‌شده",
                "type": "physical",
                "target": "single",
                "powerPct": 205,
                "cooldownTurns": 5,
                "durationTurns": 2,
                "description": "معده نفرین‌شده؛ اثر اختصاصی آمیت، بلعنده روان با توجه به نقش تمام‌کننده / ضددرمان."
            }
        ],
        "passive": {
            "name": "میراث اسطوره‌ای",
            "description": "ویژگی ذاتی آمیت، بلعنده روان: هدف زخمی یا درمان‌شده را شکار می‌کند و درمان دشمن را تضعیف می‌کند."
        },
        "combatAI": {
            "policy": "legendary_mythic_priority",
            "rules": [
                "هدف زخمی یا درمان‌شده را شکار می‌کند و درمان دشمن را تضعیف می‌کند.",
                "prioritize_species_signature_skill",
                "protect_companion_survival",
                "avoid_overkill"
            ],
            "tieBreak": "signature_skill_then_expected_value"
        },
        "evolution": {
            "nextRank": "mythic",
            "itemId": "companion_evolution_legendary_to_mythic",
            "requirements": [
                "evolution_item_only"
            ],
            "preserveLevel": true
        }
    }
]);
export function chooseLegendaryCompanionIntent(companionOrId, context = {}) {
    var _a, _b, _c, _d, _e;
    const source = typeof companionOrId === 'string' ? NECROMANCER_LEGENDARY_COMPANIONS.find(x => x.id === companionOrId) : companionOrId;
    if (!source)
        return null;
    const enemies = (context.enemies || []).filter(x => { var _a; return Number((_a = x.hp) !== null && _a !== void 0 ? _a : 1) > 0; }), allies = (context.allies || []).filter(x => { var _a; return Number((_a = x.hp) !== null && _a !== void 0 ? _a : 1) > 0; });
    const ratio = x => { var _a; return Number((_a = x.hp) !== null && _a !== void 0 ? _a : 0) / Math.max(1, Number(x.maxHp) || 1); };
    const weakest = [...enemies].sort((a, b) => ratio(a) - ratio(b))[0], lowest = [...allies].sort((a, b) => ratio(a) - ratio(b))[0];
    const ready = source.skills.filter(s => { var _a; return Number(((_a = context.cooldowns) === null || _a === void 0 ? void 0 : _a[s.id]) || 0) <= 0 && (context.canUseSkill ? context.canUseSkill(s) !== false : true); });
    let skill = null;
    if (lowest && ratio(lowest) < .58)
        skill = ready.find(s => ['heal', 'shield'].includes(s.type));
    if (!skill && enemies.length >= 2)
        skill = ready.find(s => ['magic_aoe', 'physical_multi', 'dot_aoe'].includes(s.type) || s.target === 'all_enemies');
    if (!skill && Number((_a = context.selfHpPct) !== null && _a !== void 0 ? _a : 100) < 48)
        skill = ready.find(s => ['guard', 'shield'].includes(s.type));
    if (!skill)
        skill = ready.find(s => ['silence', 'control', 'debuff'].includes(s.type));
    if (!skill && weakest)
        skill = ready.find(s => ['physical', 'magic', 'dot'].includes(s.type));
    if (!skill)
        return chooseBaseIntent(source, context);
    let targetId = null;
    if (skill.target === 'self')
        targetId = (_b = context.selfId) !== null && _b !== void 0 ? _b : null;
    else if (skill.target === 'lowest_hp_ally')
        targetId = (_d = (_c = lowest === null || lowest === void 0 ? void 0 : lowest.id) !== null && _c !== void 0 ? _c : context.selfId) !== null && _d !== void 0 ? _d : null;
    else if (!['all_enemies', 'all_allies'].includes(skill.target))
        targetId = (_e = weakest === null || weakest === void 0 ? void 0 : weakest.id) !== null && _e !== void 0 ? _e : null;
    return { action: 'use_skill', skillId: skill.id, targetId, targetMode: skill.target, reason: 'legendary_mythology_authored_priority', skill: JSON.parse(JSON.stringify(skill)) };
}
