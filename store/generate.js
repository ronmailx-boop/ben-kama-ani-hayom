// Generates the Google Play listing images in store/en and store/he.
// Serve the app first:  python3 -m http.server 8765   (from the repo root)
// Then run:              node store/generate.js
// Play wants images without transparency; convert the output to RGB, e.g. with Pillow.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const BASE = 'http://localhost:8765/';

const COPY = {
  en: {
    locale: 'en-US', dir: 'ltr',
    people: [
      { id: '1', name: 'Dana', birthdate: '1992-03-14' },
      { id: '2', name: 'Noah', birthdate: '2015-08-02' },
      { id: '3', name: 'Grandma Ruth', birthdate: '1948-11-25' },
    ],
    extra: [{ id: '4', name: 'Leo', birthdate: '2021-05-05' }, { id: '5', name: 'Maya', birthdate: '1988-06-30' }],
    newName: 'Leo', newDate: '2021-05-05',
    shots: [
      ['Exact age, down to the day', 'Years, months and days, always up to date'],
      ['Tap a name, see the age', 'Switch between people in one tap'],
      ['Add someone in seconds', 'Just a name and a date of birth'],
      ['Private by design', 'No sign-up. Your data stays on your phone. Works offline.'],
    ],
    tagline: 'Exact age in years, months and days',
  },
  he: {
    locale: 'he-IL', dir: 'rtl',
    people: [
      { id: '1', name: 'דנה', birthdate: '1992-03-14' },
      { id: '2', name: 'יואב', birthdate: '2015-08-02' },
      { id: '3', name: 'סבתא רחל', birthdate: '1948-11-25' },
    ],
    extra: [{ id: '4', name: 'אורי', birthdate: '2021-05-05' }, { id: '5', name: 'מאיה', birthdate: '1988-06-30' }],
    newName: 'אורי', newDate: '2021-05-05',
    shots: [
      ['הגיל המדויק, עד היום', 'שנים, חודשים וימים, תמיד מעודכן'],
      ['נוגעים בשם ורואים את הגיל', 'מעבר בין אנשים בלחיצה אחת'],
      ['מוסיפים מישהו בשניות', 'רק שם ותאריך לידה'],
      ['פרטי לגמרי', 'בלי הרשמה. המידע נשאר בטלפון שלך. עובד גם בלי אינטרנט.'],
    ],
    tagline: 'הגיל המדויק בשנים, חודשים וימים',
  },
};

const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Secular+One&family=Heebo:wght@400;600&display=block" rel="stylesheet">';
const BG = `background:#0f0e17;background-image:
  radial-gradient(circle at 15% 8%, rgba(247,168,35,.35), transparent 45%),
  radial-gradient(circle at 90% 95%, rgba(255,77,141,.28), transparent 45%);`;

function frameHtml(c, img, [title, sub]) {
  return `<!doctype html><html dir="${c.dir}"><head><meta charset="utf-8">${FONTS}<style>
  *{margin:0;box-sizing:border-box}
  body{width:1080px;height:1920px;overflow:hidden;${BG}font-family:Heebo,sans-serif;color:#fffffe;text-align:center}
  h1{font-family:'Secular One',sans-serif;font-weight:400;font-size:84px;line-height:1.15;color:#f7a823;margin:120px 70px 0;text-shadow:0 0 40px rgba(247,168,35,.35)}
  p{font-size:42px;color:#d0d1e0;margin:26px 90px 0;line-height:1.35}
  .phone{position:absolute;left:50%;top:470px;transform:translateX(-50%);width:800px;padding:16px;border-radius:72px;background:#26243a;box-shadow:0 30px 90px rgba(0,0,0,.6),0 0 0 3px #3a3852}
  .phone img{display:block;width:100%;border-radius:58px}
  </style></head><body><h1>${title}</h1><p>${sub}</p><div class="phone"><img src="data:image/png;base64,${img}"></div></body></html>`;
}

function featureHtml(c, icon) {
  return `<!doctype html><html dir="${c.dir}"><head><meta charset="utf-8">${FONTS}<style>
  *{margin:0;box-sizing:border-box}
  body{width:1024px;height:500px;overflow:hidden;${BG}font-family:Heebo,sans-serif;display:flex;align-items:center;gap:64px;padding:0 90px}
  img{width:280px;height:280px;border-radius:64px;box-shadow:0 20px 60px rgba(0,0,0,.5),0 0 60px rgba(247,168,35,.35)}
  h1{font-family:'Secular One',sans-serif;font-weight:400;font-size:112px;line-height:1;color:#f7a823;text-shadow:0 0 40px rgba(247,168,35,.4)}
  p{font-size:38px;color:#d0d1e0;margin-top:22px;line-height:1.3;max-width:620px;text-wrap:balance}
  </style></head><body><img src="data:image/png;base64,${icon}"><div><h1 dir="ltr" style="text-align:${c.dir==='rtl'?'right':'left'}">AgeNow</h1><p>${c.tagline}</p></div></body></html>`;
}

(async () => {
  const b = await chromium.launch();
  const icon = fs.readFileSync(path.join(ROOT, 'icons/icon-512.png')).toString('base64');
  for (const lang of ['en', 'he']) {
    const c = COPY[lang];
    const out = path.join(ROOT, 'store', lang);
    const app = await b.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2.5, locale: c.locale, isMobile: true, hasTouch: true });
    const p = await app.newPage();
    const load = async people => {
      await p.goto(BASE);
      await p.evaluate(v => localStorage.setItem('benKamaAni_people', JSON.stringify(v)), people);
      await p.reload(); await p.waitForLoadState('networkidle'); await p.waitForTimeout(800);
    };
    const raw = [];
    await load(c.people);
    raw.push(await p.screenshot());
    await p.click('.tab >> nth=2'); await p.waitForTimeout(700);
    raw.push(await p.screenshot());
    await load(c.people);
    await p.click('#addBtn'); await p.waitForTimeout(400);
    await p.fill('#inputName', c.newName); await p.fill('#inputDate', c.newDate);
    await p.evaluate(() => document.activeElement.blur()); await p.waitForTimeout(300);
    raw.push(await p.screenshot());
    await load([...c.people, ...c.extra]);
    raw.push(await p.screenshot());
    await app.close();

    const page = await b.newPage({ viewport: { width: 1080, height: 1920 } });
    for (let i = 0; i < raw.length; i++) {
      await page.setContent(frameHtml(c, raw[i].toString('base64'), c.shots[i]), { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(out, `screenshot-${i + 1}.png`) });
    }
    await page.setViewportSize({ width: 1024, height: 500 });
    await page.setContent(featureHtml(c, icon), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(out, 'feature-graphic.png') });
    await page.close();
  }
  await b.close();
})();
