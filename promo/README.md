# AgeNow promo (25s, 1080×1920)

A vertical promo video built in code: `promo.html` draws every frame from a
time value (`render(t)`), and `render.js` captures 30 frames per second with
Playwright and muxes them with the voiceover through ffmpeg.

- `promo.html` — the animation. Scene start times are in `T`, captions in
  `CAPTIONS`; both are tuned to the word timings of `voiceover.mp3`.
  Open `promo.html?t=9.5` in a browser to see a single frame.
- `voiceover.mp3` — Hebrew male narrator ("Omer", ElevenLabs `eleven_v4`).
- `music.py` — background music synthesized in code (numpy), arranged to
  the scene times: `python3 music.py music.wav`.
- `render.js` — `node render.js voiceover.mp3 music.wav agenow-promo.mp4`
  (needs Playwright with Chromium and ffmpeg; about 5 minutes).

The folder is listed in `.assetsignore`, so it is not uploaded to the site.

Narration script:

> בני כמה אתם היום? לא בערך — בדיוק! הכירו את אייג' נאו. לוחצים על הפלוס,
> כותבים שם ותאריך לידה… ובום! שנים, חודשים וימים — ברגע אחד. מוסיפים עד
> חמישה אנשים: הילדים, בן הזוג, סבתא. כל אחד בלשונית משלו. והכול נשמר רק
> אצלכם, בטלפון. אייג' נאו. הגיל שלכם — עכשיו.
