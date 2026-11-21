# V1883 — رابط کاربری تخصص آورنده آخرالزمان

- افزوده‌شدن Web Component مستقل `apocalypse-harbinger-panel` با چهار تب مهارت‌ها، استعدادها، تعالی‌ها و قلمرو.
- نمایش سطح بازشدن، رتبه مهارت، هزینه استقامت و زمان بازیابی.
- نمایش ۴ شاخه استعداد، ۱۰ تعالی و چهار مرحله قلمرو از کاتالوگ JSON واحد.
- رابط واکنش‌گرا و راست‌چین، با رنگ‌بندی بنفش/سیاه.

## اتصال در صفحه دلخواه
```js
import { createApocalypseHarbingerPanel } from './systems/classes/apocalypse-harbinger-panel.js';
container.append(createApocalypseHarbingerPanel(player));
```

این کامپوننت مستقل است؛ هنوز به پنجره اصلی پروفایل/انتخاب تخصص بازی متصل نشده و کنترل‌های ارتقا/خرید استعداد نیز صرفاً نمایشی هستند.
