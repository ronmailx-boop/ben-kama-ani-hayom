# AgeNow promo (25s, 1080×1920)

A vertical promo video built in code: `promo.html` draws every frame from a
time value (`render(t)`), and `render.js` captures 30 frames per second with
Playwright and muxes them with the voiceover through ffmpeg.

- `promo.html` — the animation, in Hebrew (default) or English (`?lang=en`).
  Each language in `CONTENT` has its own texts, scene times `T` and
  captions, tuned to the word timings of its voiceover.
  Open `promo.html?lang=en&t=9.5` in a browser to see a single frame.
- `voiceover.mp3` — Hebrew male narrator ("Omer", ElevenLabs `eleven_v4`).
- `voiceover-en.mp3` — English male narrator ("Hale", ElevenLabs `eleven_v4`).
- `music.py` — background music synthesized in code (numpy), arranged to
  the scene times: `python3 music.py music.wav` (Hebrew) or
  `python3 music.py music-en.wav 4.3 18.35 20.65` (English).
- `render.js` — `node render.js voiceover.mp3 music.wav agenow-promo.mp4 [he|en]`
  (needs Playwright with Chromium and ffmpeg; about 5 minutes).

The in-app guide videos are 720p copies: `media/guide.mp4` (Hebrew) and
`media/guide-en.mp4` (English).

The folder is listed in `.assetsignore`, so it is not uploaded to the site.

Narration script:

> בני כמה אתם היום? לא בערך — בדיוק! הכירו את אייג' נאו. לוחצים על הפלוס,
> כותבים שם ותאריך לידה… ובום! שנים, חודשים וימים — ברגע אחד. מוסיפים עד
> חמישה אנשים: הילדים, בן הזוג, סבתא. כל אחד בלשונית משלו. והכול נשמר רק
> אצלכם, בטלפון. אייג' נאו. הגיל שלכם — עכשיו.

English narration:

> How old are you today? Not roughly — exactly. Meet AgeNow. Tap the plus,
> type a name and a date of birth… and boom! Years, months and days — in a
> second. Add up to five people: the kids, your partner, Grandma. Each one
> gets their own tab. And everything stays right on your phone. AgeNow. Your
> age — right now.
