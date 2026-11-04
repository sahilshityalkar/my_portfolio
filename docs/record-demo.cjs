// Re-records docs/demo.webm against a running production build (npm run build && npm run start).
// Needs Playwright (npx playwright install chromium); not a dependency of the site.
// Usage: node docs/record-demo.cjs [http://localhost:3000]  -> writes the video into docs/video/
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: 'docs/video', size: { width: 1440, height: 900 } } });
  await c.addInitScript(() => { try { sessionStorage.setItem('glass-demo', '1'); localStorage.setItem('theme', 'day'); } catch {} });
  const p = await c.newPage();
  const glide = async (x0, y0, x1, y1, ms) => { const n = Math.round(ms / 16); for (let i = 0; i <= n; i++) { const t = i / n, e = t < .5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2; await p.mouse.move(x0 + (x1 - x0) * e, y0 + (y1 - y0) * e); await p.waitForTimeout(16); } };
  await p.goto((process.argv[2] || 'http://localhost:3000') + '/', { waitUntil: 'networkidle' });
  await p.mouse.move(1100, 700);
  await p.waitForTimeout(2400);                       // the name drafts, then inks
  // the glass: over the name, across the surname
  await p.keyboard.press('l'); await glide(1100, 700, 230, 210, 900); await p.waitForTimeout(500);
  await glide(230, 210, 1050, 330, 1800); await p.waitForTimeout(400);
  await glide(1050, 330, 620, 540, 900); await p.waitForTimeout(500);
  // flood into the blueprint, look around, return
  await p.mouse.click(1200, 140); await p.waitForTimeout(1700);
  await p.mouse.wheel(0, 500); await p.waitForTimeout(1200); await p.mouse.wheel(0, -500); await p.waitForTimeout(900);
  await p.keyboard.press('Escape'); await p.waitForTimeout(700);
  // the measure: drag narrower, wider, let go
  const k = await p.locator('.measure-handle').boundingBox();
  await glide(620, 540, k.x + 6, k.y + 6, 500); await p.mouse.down();
  await glide(k.x + 6, k.y + 6, k.x - 170, k.y + 6, 1300); await p.waitForTimeout(400);
  await glide(k.x - 170, k.y + 6, k.x + 220, k.y + 6, 1500); await p.waitForTimeout(400);
  await p.mouse.up(); await p.waitForTimeout(1300);
  // As built: scroll to Plate I, hover the lens across the drawing, flood it
  await p.mouse.move(1300, 600);
  for (let i = 0; i < 18; i++) { await p.mouse.wheel(0, 40); await p.waitForTimeout(30); }
  await p.waitForTimeout(900);
  const f = await p.locator('.asbuilt-toggle').evaluate((el) => { const r = el.closest('figure').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  await glide(1300, 600, f.x + f.w * 0.25, f.y + f.h * 0.5, 700); await p.waitForTimeout(500);
  await glide(f.x + f.w * 0.25, f.y + f.h * 0.5, f.x + f.w * 0.75, f.y + f.h * 0.35, 1800); await p.waitForTimeout(400);
  await p.mouse.move(f.x + f.w + 120, f.y + 40, { steps: 8 }); await p.waitForTimeout(400);
  await p.click('.asbuilt-toggle'); await p.waitForTimeout(1600); await p.click('.asbuilt-toggle'); await p.waitForTimeout(900);
  // Night, and the glass by night
  await p.click('header button[aria-label^="Day theme"]'); await p.waitForTimeout(1600);
  await p.keyboard.press('l'); await glide(f.x + f.w + 120, f.y + 40, f.x + f.w * 0.5, f.y + f.h * 0.45, 1200); await p.waitForTimeout(900);
  await p.keyboard.press('Escape'); await p.waitForTimeout(600);
  // the colophon: this visit, measured
  await p.evaluate(() => document.querySelector('.titleblock').scrollIntoView({ block: 'center', behavior: 'smooth' }));
  await p.waitForTimeout(2400);
  await c.close(); await b.close();
  console.log(require('fs').readdirSync('docs/video'));
})();
