const { chromium } = require('playwright');
const path = require('path');

const OUT = path.join(__dirname, 'out');
const BASE = 'http://localhost:5173';

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
  console.log(`  shot: ${name}`);
}

(async () => {
  const browser = await chromium.launch();
  const errors = [];

  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));

  console.log('1. Home page');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await shot(page, '01-home');

  console.log('2. Search');
  await page.fill('#from', 'Dhaka');
  await page.fill('#to', 'Chattogram');
  const d = new Date(Date.now() + 4 * 86400000);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  await page.fill('#date', date);
  await page.click('button[type=submit]');
  await page.waitForURL('**/search**');
  await page.waitForTimeout(1500);
  await shot(page, '02-search-results');

  const busCount = await page.locator('article').count();
  console.log(`  buses listed: ${busCount}`);

  console.log('3. Seat selection');
  await page.locator('a:has-text("Select seats")').first().click();
  await page.waitForURL('**/seats');
  await page.waitForTimeout(1500);
  await shot(page, '03-seat-map');

  const seatCount = await page.locator('button[aria-label^="Seat "]').count();
  console.log(`  seats rendered: ${seatCount}`);

  console.log('4. Select two seats');
  const avail = page.locator('button[aria-label*="available"]');
  await avail.nth(0).click();
  await avail.nth(0).click();
  await page.waitForTimeout(600);
  await shot(page, '04-seats-selected');

  console.log('5. Continue -> login redirect');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(1500);
  console.log(`  url: ${page.url()}`);
  await shot(page, '05-login');

  console.log('6. Sign in');
  await page.fill('#email', 'demo@ticketbus.com');
  await page.fill('#password', 'Demo@123');
  await page.click('button[type=submit]');
  await page.waitForTimeout(2500);
  console.log(`  url after login: ${page.url()}`);
  await shot(page, '06-after-login');

  // Re-run selection now that we're authenticated.
  if (!page.url().includes('/passengers')) {
    console.log('7. Re-select seats as signed-in user');
    await page.goto(`${BASE}/search?from=Dhaka&to=Chattogram&date=${date}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.locator('a:has-text("Select seats")').first().click();
    await page.waitForURL('**/seats');
    await page.waitForTimeout(1500);
    const a2 = page.locator('button[aria-label*="available"]');
    await a2.nth(0).click();
    await a2.nth(0).click();
    await page.waitForTimeout(400);
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(2500);
  }

  console.log(`  url: ${page.url()}`);
  await shot(page, '07-passenger-details');

  console.log('8. Fill passenger form');
  const names = page.locator('input[id^="name-"]');
  const n = await names.count();
  for (let i = 0; i < n; i++) {
    await names.nth(i).fill(i === 0 ? 'Raihan Rimon' : 'Ayesha Rahman');
    await page.locator('input[id^="age-"]').nth(i).fill(i === 0 ? '26' : '24');
  }
  await page.fill('#contactName', 'Raihan Rimon');
  await page.fill('#contactPhone', '01711111111');
  await page.fill('#contactEmail', 'raihan@example.com');

  const bpOptions = await page.locator('#boardingPointId option').count();
  if (bpOptions > 1) await page.locator('#boardingPointId').selectOption({ index: 1 });
  const dpOptions = await page.locator('#droppingPointId option').count();
  if (dpOptions > 1) await page.locator('#droppingPointId').selectOption({ index: 1 });
  await page.waitForTimeout(400);
  await shot(page, '08-passenger-filled');

  console.log('9. Continue to payment');
  await page.click('button:has-text("Continue to payment")');
  await page.waitForTimeout(2500);
  console.log(`  url: ${page.url()}`);
  await shot(page, '09-payment');

  console.log('10. Submit TrxID');
  const trx = 'BKH' + Math.floor(Math.random() * 1e9);
  await page.fill('#senderNumber', '01711111111');
  await page.fill('#trxId', trx);
  await page.click('button:has-text("Submit for verification")');
  await page.waitForTimeout(3000);
  console.log(`  url: ${page.url()}  trx: ${trx}`);
  await shot(page, '10-success');

  console.log('11. My tickets');
  await page.goto(`${BASE}/my-tickets`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await shot(page, '11-my-tickets');

  console.log('12. Dark mode');
  await page.click('button[aria-label*="dark mode"]');
  await page.waitForTimeout(800);
  await shot(page, '12-dark-mode');

  console.log('13. Mobile viewport');
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mpage = await mobile.newPage();
  mpage.on('pageerror', (err) => errors.push(`mobile pageerror: ${err.message}`));
  await mpage.goto(BASE, { waitUntil: 'networkidle' });
  await mpage.waitForTimeout(1500);
  await shot(mpage, '13-mobile-home');
  await mpage.goto(`${BASE}/search?from=Dhaka&to=Chattogram&date=${date}`, { waitUntil: 'networkidle' });
  await mpage.waitForTimeout(1500);
  await shot(mpage, '14-mobile-search');

  console.log('\n=== ERRORS ===');
  if (errors.length === 0) console.log('none');
  else errors.forEach((e) => console.log(e));

  await browser.close();
})().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
