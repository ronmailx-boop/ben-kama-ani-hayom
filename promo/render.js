// Renders promo.html frame by frame and muxes it with the voiceover.
// Usage: node render.js <voiceover.mp3> <music.wav> <out.mp4>  (music.wav comes from music.py)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

const FPS = 30;
const [voice, music, out] = process.argv.slice(2);

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(__dirname, 'promo.html'));
  await page.evaluate(() => document.fonts.ready);
  const total = await page.evaluate(() => window.TOTAL);
  const frames = Math.round(total * FPS);

  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-i', voice, '-i', music,
    // Voice normalized for social apps; music sits ~9 dB lower and ducks under the voice
    '-filter_complex',
    '[1:a]loudnorm=I=-14:TP=-1.5:LRA=7,aresample=48000,apad,asplit=2[v][sc];' +
    '[2:a]aresample=48000,volume=-9dB[m];' +
    '[m][sc]sidechaincompress=threshold=0.04:ratio=5:attack=15:release=350[md];' +
    '[v][md]amix=inputs=2:duration=shortest:normalize=0,alimiter=limit=0.89[a]',
    '-map', '0:v', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-c:a', 'aac', '-b:a', '256k', '-ar', '48000',
    '-t', String(total), '-movflags', '+faststart', out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  for (let i = 0; i < frames; i++) {
    await page.evaluate(t => window.render(t), i / FPS);
    const png = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.log(`frame ${i}/${frames}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('done', out);
})();
