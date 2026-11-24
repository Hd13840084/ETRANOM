# ETRANOM V1989 — Legendary Companion Runtime Integration

این بسته بر پایه فایل‌های پروژه موجود در V1988 ساخته شده است.

### اجرا
فایل `index.html` را از طریق همان Hosting پروژه اجرا کنید. نسخه فعال Bestiary در `index.html` به `necromancer-companion-bestiary-v1989.js` اشاره می‌کند.

### محتوای همراهان
- ۲۰ Common
- ۲۰ Uncommon
- ۲۰ Rare
- ۲۰ Epic
- ۲۰ Legendary
- مجموع ۱۰۰ گونه

### فایل‌های کلیدی
- `systems/classes/necromancer-legendary-companions-v1988.js`
- `systems/classes/necromancer-companion-bestiary-v1989.js`
- `systems/classes/necromancer-underworld-gate-v1984.js`
- `game.js`
- `index.html`

### آزمون
```bash
node --test tests/v1988/*.test.mjs tests/v1984/necromancer-underworld-gate-v1984.test.mjs tests/v1987/necromancer-epic-companions-v1987.test.mjs tests/v1986/necromancer-rare-companions-v1986.test.mjs tests/v1985/necromancer-uncommon-companions-v1985.test.mjs tests/v1982/necromancer-common-companions-v1982.test.mjs
```

این بسته هنوز به GitHub/Hosting منتشر نشده و تست مرورگر زنده/چندکاربره انجام نشده است.
