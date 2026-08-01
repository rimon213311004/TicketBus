const { chromium } = require('playwright');
const path = require('path');
const OUT = path.join(__dirname, 'out');
const BASE = 'http://localhost:5173';
const API = 'http://localhost:5000/api';

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  const d = new Date(Date.now() + 6 * 86400000);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  // Sign in.
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('#email', 'demo@ticketbus.com');
  await page.fill('#password', 'Demo@123');
  await page.click('button[type=submit]');
  await page.waitForTimeout(2000);

  // Book with CASH this time.
  await page.goto(`${BASE}/search?from=Dhaka&to=Sylhet&date=${date}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.locator('a:has-text("Select seats")').first().click();
  await page.waitForURL('**/seats');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, '20-seatmap-wide.png') });

  const avail = page.locator('button[aria-label*="available"]');
  await avail.nth(5).click();
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(2500);
  console.log('passenger url:', page.url());

  await page.locator('input[id^="name-"]').first().fill('Cash Payer');
  await page.locator('input[id^="age-"]').first().fill('30');
  await page.fill('#contactName', 'Cash Payer');
  await page.fill('#contactPhone', '01722222222');
  await page.fill('#contactEmail', 'cash@example.com');
  await page.locator('#boardingPointId').selectOption({ index: 1 });
  await page.locator('#droppingPointId').selectOption({ index: 1 });
  await page.click('button:has-text("Cash at Counter")');
  await page.waitForTimeout(400);
  await page.click('button:has-text("Continue to payment")');
  await page.waitForTimeout(2500);
  console.log('cash payment url:', page.url());
  await page.screenshot({ path: path.join(OUT, '21-cash-payment.png') });

  const bookingId = page.url().match(/bookings\/([a-f0-9]+)\//)?.[1];
  console.log('cash booking:', bookingId);

  // Admin verifies the earlier bKash payment via the API, then customer sees CONFIRMED.
  const adminRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@ticketbus.com', password: 'Admin@123' }),
  });
  const admin = await adminRes.json();
  const adminToken = admin.data.accessToken;

  const pendingRes = await fetch(`${API}/payments/pending`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const pending = await pendingRes.json();
  console.log('pending verifications:', pending.data.payments.length);

  if (pending.data.payments.length > 0) {
    const p = pending.data.payments[0];
    const vRes = await fetch(`${API}/payments/${p._id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ notes: 'Verified in bKash statement' }),
    });
    const v = await vRes.json();
    console.log('verified booking status:', v.data.booking.status);

    await page.goto(`${BASE}/bookings/${v.data.booking._id}/success`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT, '22-confirmed-ticket.png') });
  }

  await page.goto(`${BASE}/my-tickets`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(OUT, '23-my-tickets-mixed.png'), fullPage: true });

  console.log('\nERRORS:', errors.length ? errors : 'none');
  await browser.close();
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
