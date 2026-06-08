import { chromium } from 'playwright';

const pages = [
  { url: 'http://localhost:5555', name: '01-landing' },
  { url: 'http://localhost:5555/login', name: '02-login' },
  { url: 'http://localhost:5555/register', name: '03-register' },
  { url: 'http://localhost:5555/feed', name: '04-feed' },
  { url: 'http://localhost:5555/explore', name: '05-explore' },
  { url: 'http://localhost:5555/trips', name: '06-trips' },
  { url: 'http://localhost:5555/profile', name: '07-profile' },
  { url: 'http://localhost:5555/buddy', name: '08-buddy' },
  { url: 'http://localhost:5555/notifications', name: '09-notifications' },
  { url: 'http://localhost:5555/create', name: '10-create' },
  { url: 'http://localhost:5555/settings', name: '11-settings' },
  { url: 'http://localhost:5555/place/doi-ang-khang', name: '12-place-detail' },
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });

for (const p of pages) {
  const page = await context.newPage();
  try {
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `C:/tmp/${p.name}.png`, fullPage: false });
    console.log('OK', p.name);
  } catch(e) {
    console.log('FAIL', p.name, e.message.slice(0,60));
  }
  await page.close();
}

await browser.close();
