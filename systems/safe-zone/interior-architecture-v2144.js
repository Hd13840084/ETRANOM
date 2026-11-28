// ETRANOM V2144 — Stage 7B: authored interior architecture for all 27 safe-zone buildings.
// Logical floor plans and partition geometry; physical wall collision is finalized in Stage 19.
const raw = {
  "online_player_market": {
    "title": "بازار اصلی",
    "rooms": [
      "سالن معامله",
      "دفتر ثبت",
      "انبار امن",
      "غرفه‌ها"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 3,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 3,
        "x2": 7,
        "y2": 8,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 5,
        "x2": 7,
        "y2": 5,
        "height": 1.0
      }
    ],
    "floorMaterial": "stone",
    "ceilingClass": "high",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": true,
    "stairs": {
      "present": true,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "pvp_hall": {
    "title": "تالار مبارزه",
    "rooms": [
      "میدان مرکزی",
      "جایگاه داور",
      "رختکن",
      "انبار تجهیزات"
    ],
    "partitions": [
      {
        "x1": 2,
        "y1": 0,
        "x2": 2,
        "y2": 3,
        "height": 1.0
      },
      {
        "x1": 8,
        "y1": 0,
        "x2": 8,
        "y2": 3,
        "height": 1.0
      },
      {
        "x1": 2,
        "y1": 3,
        "x2": 8,
        "y2": 3,
        "height": 1.0
      },
      {
        "x1": 5,
        "y1": 5,
        "x2": 5,
        "y2": 8,
        "height": 1.0
      }
    ],
    "floorMaterial": "basalt",
    "ceilingClass": "high",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": true,
    "stairs": {
      "present": true,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "inn": {
    "title": "مسافرخانه",
    "rooms": [
      "سالن پذیرایی",
      "آشپزخانه",
      "اتاق مهمان",
      "انبار و پله"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 4,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 4,
        "x2": 7,
        "y2": 8,
        "height": 1.0
      }
    ],
    "floorMaterial": "oak",
    "ceilingClass": "standard",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": true,
    "stairs": {
      "present": true,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "smith": {
    "title": "آهنگری",
    "rooms": [
      "کارگاه کوره",
      "سندان و آهن‌کوبی",
      "انبار شمش",
      "اتاق ابزار"
    ],
    "partitions": [
      {
        "x1": 4,
        "y1": 0,
        "x2": 4,
        "y2": 5,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 5,
        "x2": 10,
        "y2": 5,
        "height": 1.0
      }
    ],
    "floorMaterial": "stone",
    "ceilingClass": "high",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": false,
    "stairs": {
      "present": false,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "guild": {
    "title": "انجمن ماجراجویان",
    "rooms": [
      "تالار اصلی",
      "بایگانی",
      "اتاق شورا",
      "دفتر قرارداد"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 3,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 3,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 3,
        "x2": 7,
        "y2": 3,
        "height": 1.0
      },
      {
        "x1": 5,
        "y1": 5,
        "x2": 5,
        "y2": 8,
        "height": 1.0
      }
    ],
    "floorMaterial": "stone",
    "ceilingClass": "high",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": true,
    "stairs": {
      "present": true,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "alchemy": {
    "title": "آزمایشگاه",
    "rooms": [
      "سالن تقطیر",
      "انبار مواد",
      "اتاق آزمایش",
      "کتابخانه نسخه‌ها"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 4,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      }
    ],
    "floorMaterial": "basalt",
    "ceilingClass": "standard",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": true,
    "stairs": {
      "present": true,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "enchanter_shop": {
    "title": "کارگاه افسون",
    "rooms": [
      "سالن رون‌ها",
      "اتاق بلورها",
      "کتابخانه",
      "اتاق کتیبه"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 4,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      }
    ],
    "floorMaterial": "basalt",
    "ceilingClass": "high",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": true,
    "stairs": {
      "present": true,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "clinic": {
    "title": "درمانگاه",
    "rooms": [
      "پذیرش",
      "سالن درمان",
      "اتاق معاینه",
      "انبار دارو"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 4,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      }
    ],
    "floorMaterial": "limestone",
    "ceilingClass": "standard",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": true,
    "stairs": {
      "present": true,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "guardhouse": {
    "title": "پاسگاه نگهبانی",
    "rooms": [
      "اتاق گشت",
      "اتاق استراحت",
      "زره‌خانه",
      "برج دیده‌بانی"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 4,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      }
    ],
    "floorMaterial": "stone",
    "ceilingClass": "high",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": true,
    "stairs": {
      "present": true,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "fire_temple": {
    "title": "آتشکده",
    "rooms": [
      "سالن نیایش",
      "آتشدان",
      "اتاق خادمان",
      "انبار آیینی"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 4,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      }
    ],
    "floorMaterial": "basalt",
    "ceilingClass": "high",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": true,
    "stairs": {
      "present": true,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "stable": {
    "title": "اصطبل",
    "rooms": [
      "راهروی مرکزی",
      "آخور غربی",
      "آخور شرقی",
      "انبار علوفه"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 8,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 8,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 5,
        "x2": 10,
        "y2": 5,
        "height": 1.0
      }
    ],
    "floorMaterial": "oak",
    "ceilingClass": "low",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": false,
    "stairs": {
      "present": false,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "granary": {
    "title": "انبار غله",
    "rooms": [
      "سالن کیسه‌ها",
      "بخش سیلو",
      "ترازو و بارگیری",
      "انبار ابزار"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 4,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      }
    ],
    "floorMaterial": "oak",
    "ceilingClass": "high",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": true,
    "stairs": {
      "present": true,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "grain_mill": {
    "title": "آسیاب کشتزار",
    "rooms": [
      "سالن سنگ‌آسیاب",
      "قیف دانه",
      "انبار آرد",
      "اتاق چرخ‌دنده"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 4,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      }
    ],
    "floorMaterial": "oak",
    "ceilingClass": "high",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": true,
    "stairs": {
      "present": true,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "grain_bakery": {
    "title": "نانوایی",
    "rooms": [
      "پیشخوان",
      "اتاق خمیرگیری",
      "تنور",
      "قفسه و انبار"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 4,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      }
    ],
    "floorMaterial": "brick",
    "ceilingClass": "standard",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": false,
    "stairs": {
      "present": false,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "grain_farmstead": {
    "title": "خانه کدخدا",
    "rooms": [
      "سالن خانه",
      "آشپزخانه",
      "اتاق خواب",
      "دفتر اسناد"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 4,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      }
    ],
    "floorMaterial": "oak",
    "ceilingClass": "standard",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": false,
    "stairs": {
      "present": false,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "grain_herbgarden": {
    "title": "گلخانه",
    "rooms": [
      "راهروی کشت",
      "بستر گیاهان",
      "اتاق خشک‌کردن",
      "انبار بذر"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 4,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      }
    ],
    "floorMaterial": "glass",
    "ceilingClass": "high",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": false,
    "stairs": {
      "present": false,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "grain_livestock": {
    "title": "طویله",
    "rooms": [
      "راهروی دام",
      "آغل غربی",
      "آغل شرقی",
      "انبار کاه"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 8,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 8,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 5,
        "x2": 10,
        "y2": 5,
        "height": 1.0
      }
    ],
    "floorMaterial": "oak",
    "ceilingClass": "low",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": false,
    "stairs": {
      "present": false,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "rootwood_sawmill": {
    "title": "چوب‌بری",
    "rooms": [
      "سالن برش",
      "انبار الوار",
      "اتاق ابزار",
      "بارانداز"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 4,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      }
    ],
    "floorMaterial": "oak",
    "ceilingClass": "high",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": false,
    "stairs": {
      "present": false,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "rootwood_carpenter": {
    "title": "نجاری",
    "rooms": [
      "میز کار اصلی",
      "قفسه ابزار",
      "انبار چوب",
      "اتاق پرداخت"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 4,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      }
    ],
    "floorMaterial": "oak",
    "ceilingClass": "standard",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": false,
    "stairs": {
      "present": false,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "rootwood_herbalist": {
    "title": "کلبه گیاه‌شناس",
    "rooms": [
      "اتاق پذیرش",
      "آزمایش گیاه",
      "خشک‌خانه",
      "انبار ریشه"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 4,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      }
    ],
    "floorMaterial": "oak",
    "ceilingClass": "standard",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": false,
    "stairs": {
      "present": false,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "rootwood_hunters": {
    "title": "خانه شکارچیان",
    "rooms": [
      "سالن شکار",
      "اتاق تجهیزات",
      "اتاق نقشه",
      "انبار پوست"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 4,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      }
    ],
    "floorMaterial": "oak",
    "ceilingClass": "standard",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": false,
    "stairs": {
      "present": false,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "rootwood_apiary": {
    "title": "زنبورستان",
    "rooms": [
      "سالن کندوها",
      "اتاق استخراج عسل",
      "انبار موم",
      "اتاق ابزار"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 4,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      }
    ],
    "floorMaterial": "oak",
    "ceilingClass": "high",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": false,
    "stairs": {
      "present": false,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "iron_mine": {
    "title": "معدن سنگ‌آهن",
    "rooms": [
      "تونل اصلی",
      "شاخه استخراج",
      "اتاق ابزار",
      "انبار کانه"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 8,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 8,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 5,
        "x2": 7,
        "y2": 5,
        "height": 1.0
      }
    ],
    "floorMaterial": "rock",
    "ceilingClass": "low",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": false,
    "stairs": {
      "present": false,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "iron_smelter": {
    "title": "ذوب‌خانه",
    "rooms": [
      "سالن کوره",
      "قالب‌ریزی",
      "انبار سوخت",
      "حوضچه خنک‌سازی"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 4,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      }
    ],
    "floorMaterial": "basalt",
    "ceilingClass": "high",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": false,
    "stairs": {
      "present": false,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "iron_stonecutter": {
    "title": "سنگ‌تراشی",
    "rooms": [
      "سالن تراش",
      "انبار بلوک",
      "اتاق ابزار",
      "سایش و پرداخت"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 4,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      }
    ],
    "floorMaterial": "stone",
    "ceilingClass": "high",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": false,
    "stairs": {
      "present": false,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "iron_hall": {
    "title": "سرای معدن‌کاران",
    "rooms": [
      "سالن استراحت",
      "آشپزخانه",
      "اتاق نقشه",
      "انبار چراغ"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 4,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      }
    ],
    "floorMaterial": "stone",
    "ceilingClass": "standard",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": true,
    "stairs": {
      "present": true,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  },
  "iron_cartwright": {
    "title": "گاری‌سازی",
    "rooms": [
      "سالن مونتاژ",
      "کارگاه چرخ",
      "انبار محور",
      "اتاق پرچ‌کاری"
    ],
    "partitions": [
      {
        "x1": 3,
        "y1": 0,
        "x2": 3,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 7,
        "y1": 0,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      },
      {
        "x1": 3,
        "y1": 4,
        "x2": 7,
        "y2": 4,
        "height": 1.0
      }
    ],
    "floorMaterial": "oak",
    "ceilingClass": "high",
    "entrance": {
      "edge": "south",
      "x": 5,
      "width": 1
    },
    "upperFloor": false,
    "stairs": {
      "present": false,
      "position": {
        "x": 9,
        "y": 7
      }
    }
  }
};
const freeze = (v) => { if (!v || typeof v !== 'object' || Object.isFrozen(v)) return v; Object.values(v).forEach(freeze); return Object.freeze(v); };
export const ETRANOM_INTERIOR_ARCHITECTURE_V2144 = freeze(raw);
export function getInteriorArchitectureV2144(id) { return ETRANOM_INTERIOR_ARCHITECTURE_V2144[id] || null; }
export function auditInteriorArchitectureV2144() {
 const ids=Object.keys(ETRANOM_INTERIOR_ARCHITECTURE_V2144), errors=[];
 for (const [id,p] of Object.entries(ETRANOM_INTERIOR_ARCHITECTURE_V2144)) {
  if (!p.title || p.rooms.length < 3) errors.push(`rooms:${id}`);
  if (!p.partitions.length) errors.push(`partitions:${id}`);
  for (const w of p.partitions) if (![w.x1,w.y1,w.x2,w.y2].every(Number.isFinite) || w.x1<0 || w.x1>10 || w.x2<0 || w.x2>10 || w.y1<0 || w.y1>8 || w.y2<0 || w.y2>8 || (w.x1===w.x2 && w.y1===w.y2)) errors.push(`wall_geometry:${id}`);
  if (p.entrance.edge!=='south' || p.entrance.x!==5) errors.push(`entrance_alignment:${id}`);
  if (p.stairs.present && (!p.upperFloor || p.stairs.position.x<0 || p.stairs.position.x>10)) errors.push(`stairs:${id}`);
 }
 return Object.freeze({ok:errors.length===0 && ids.length===27,version:2144,stage:'7B',buildingCount:ids.length,errors:Object.freeze(errors),physicalCollision:'deferred-to-stage-19',interactiveStairs:'architecture-defined-only'});
}
if (typeof window !== 'undefined') { window.ETRANOM_INTERIOR_ARCHITECTURE_V2144=ETRANOM_INTERIOR_ARCHITECTURE_V2144; window.ETRANOM_INTERIOR_ARCHITECTURE_AUDIT_V2144=auditInteriorArchitectureV2144(); }
