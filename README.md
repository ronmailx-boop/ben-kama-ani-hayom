# 🎂 AgeNow

אפליקציית ווב פשוטה שמחשבת גיל מדויק לפי תאריך לידה — בשנים, חודשים וימים.

## ✨ פיצ'רים

- הוספת עד **5 אנשים** שונים
- כל אדם מופיע כלשונית עם שמו
- לחיצה על לשונית מציגה הודעה עם הגיל המדויק
- נתונים נשמרים **LocalStorage** — נשארים גם אחרי רענון
- ממשק בעברית, כיוון RTL מלא
- עיצוב כהה ומודרני

## 📁 מבנה הפרויקט

```
ben-kama-ani-hayom/
├── index.html   # מבנה האפליקציה
├── style.css    # עיצוב
├── app.js       # לוגיקה וחישוב גיל
├── sw.js        # Service Worker — עבודה גם בלי אינטרנט
├── manifest.json # הגדרות PWA (אייקונים, צילומי מסך)
└── README.md
```

## 🚀 הפעלה

1. Clone את הריפוזיטורי:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ben-kama-ani-hayom.git
   ```
2. פתח את `index.html` בדפדפן — לא נדרש שרת.

## ☁️ כתובת האפליקציה (Cloudflare)

האפליקציה זמינה בכתובת **https://agenow.vplusstudio.app**
(וגם `https://agenow.ronmailx.workers.dev`).

כל push ל-`main` מעלה אותה אוטומטית דרך ה-workflow `Deploy to Cloudflare`
(`.github/workflows/deploy-cloudflare.yml` + `wrangler.jsonc`).
דורש Secret בשם `CLOUDFLARE_API_TOKEN` בריפו — בלעדיו הפריסה מדלגת.

## 📱 Google Play

האפליקציה ב-Google Play היא TWA (Trusted Web Activity) שנבנתה ב-[PWABuilder](https://www.pwabuilder.com),
והיא מציגה את `https://agenow.vplusstudio.app`. לכן:

- **תיקונים ותכונות חדשות** מגיעים למשתמשי החנות לבד אחרי המיזוג ל-`main` והפריסה ל-Cloudflare.
  לא צריך להעלות גרסה חדשה לחנות.
- **צריך לבנות קובץ חדש** רק כשמשנים את האייקון, את השם או את צבע מסך הפתיחה, או לפי הדרישה השנתית של גוגל (בהמשך).

חומרי דף החנות (תמונות וטקסטים בעברית ובאנגלית) נמצאים ב-`store/`.

### ⏰ תזכורת שנתית: Target API level

בערך פעם בשנה (בדרך כלל עד סוף אוגוסט) גוגל מעלה את גרסת האנדרואיד המינימלית שאפליקציה צריכה להיות בנויה לה.
אפליקציה שלא עודכנה מפסיקה להופיע למשתמשים חדשים. מי שכבר התקין ממשיך להשתמש בה כרגיל.
Play Console שולח מייל והתראה כמה חודשים לפני המועד.

**בנייה מחדש (כ-10 דקות):**

1. ב-[pwabuilder.com](https://www.pwabuilder.com) מקלידים `https://agenow.vplusstudio.app` ← **Start**.
2. **Package For Stores** ← **Android** ← **Generate Package** ← **All Settings**.
3. ממלאים בדיוק כמו בפעם הראשונה:
   - **Package ID:** `app.vplusstudio.agenow` (חייב להיות זהה)
   - **Start URL:** `/?source=twa` (בלי זה הסטטיסטיקה נטענת באפליקציה, בניגוד ל-"No data collected" בטופס Data safety)
   - **App version / Version code:** מעלים באחד ממה שהועלה בפעם הקודמת (למשל `1.0.1` / `2`). גוגל דוחה Version code שכבר הועלה.
4. **Signing key:** בוחרים **Use mine** ומעלים את `signing.keystore` עם הסיסמאות ממנהל הסיסמאות.
   **לא** Create new: מפתח חדש לא יתקבל לאפליקציה הקיימת.
5. **Download Package**, ומעלים את קובץ ה-`.aab` ל-Play Console ← **Production** ← **Create new release**.

מפתח החתימה (`signing.keystore` + הסיסמאות) **לא נשמר בריפו**. הוא שמור במנהל הסיסמאות, עם גיבוי מוצפן.
אם הוא אבד, מבקשים מגוגל להחליף אותו: ב-Play Console, תחת **Setup** ← **App integrity**, יש בקשה לאיפוס מפתח ההעלאה (upload key reset).

## 🌐 פריסה עם GitHub Pages

1. כנס ל-**Settings** של הריפוזיטורי
2. תחת **Pages** בחר `main` branch ו-`/ (root)`
3. האפליקציה תהיה זמינה בכתובת:  
   `https://YOUR_USERNAME.github.io/ben-kama-ani-hayom`

## 🛠 טכנולוגיות

- HTML5, CSS3, JavaScript (Vanilla)
- Google Fonts — Secular One + Heebo
- LocalStorage לשמירת נתונים
