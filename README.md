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

## 🌐 פריסה עם GitHub Pages

1. כנס ל-**Settings** של הריפוזיטורי
2. תחת **Pages** בחר `main` branch ו-`/ (root)`
3. האפליקציה תהיה זמינה בכתובת:  
   `https://YOUR_USERNAME.github.io/ben-kama-ani-hayom`

## 🛠 טכנולוגיות

- HTML5, CSS3, JavaScript (Vanilla)
- Google Fonts — Secular One + Heebo
- LocalStorage לשמירת נתונים
