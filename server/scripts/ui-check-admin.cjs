/* Smoke-checks the pages added in this round: /faq, /profile, /settings, /admin. */
const { chromium } = require('playwright');
const path = require('path');

const OUT = path.join(__dirname, 'out');
const BASE = 'http://localhost:5173';

const CUSTOMER = { email: 'demo@ticketbus.com', password: 'Demo@123' };
const ADMIN = { email: 'admin@ticketbus.com', password: 'Admin@123' };

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
  console.log(`  shot: ${name}`);
}

async function signIn(page, who) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('#email', who.email);
  await page.fill('#password', who.password);
  await page.click('button[type=submit]');
  await page.waitForFunction(() => !location.pathname.startsWith('/login'), { timeout: 15000 });
}

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const page = await context.newPage();

  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  console.log('1. FAQ (public)');
  await page.goto(`${BASE}/faq`, { waitUntil: 'networkidle' });
  const faqHeading = await page.textContent('h1');
  const firstQ = await page.textContent('h3 button span');
  console.log(`   h1="${faqHeading}" firstQuestion="${firstQ}"`);
  // Accordion: second question starts collapsed, opens on click.
  const triggers = page.locator('h3 button');
  await triggers.nth(1).click();
  await page.waitForTimeout(400);
  console.log(`   after click, expanded=${await triggers.nth(1).getAttribute('aria-expanded')}`);
  await shot(page, 'a1-faq');

  console.log('2. Customer is redirected away from /admin');
  await signIn(page, CUSTOMER);
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  console.log(`   landed on: ${new URL(page.url()).pathname}`);

  console.log('3. Profile');
  await page.goto(`${BASE}/profile`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  console.log(`   name="${await page.inputValue('#name')}" phone="${await page.inputValue('#phone')}"`);
  console.log(`   email disabled=${await page.isDisabled('#email')}`);
  const saveBtn = page.locator('form button[type=submit]');
  console.log(`   save disabled while pristine=${await saveBtn.isDisabled()}`);
  await page.fill('#name', 'Demo Customer Edited');
  await page.waitForTimeout(300);
  console.log(`   save enabled after edit=${!(await saveBtn.isDisabled())}`);
  await shot(page, 'a2-profile');

  console.log('4. Settings');
  await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  // Password mismatch should surface a field error, not a request.
  await page.fill('#currentPassword', 'Demo@123');
  await page.fill('#newPassword', 'Another@123');
  await page.fill('#confirmPassword', 'Mismatch@123');
  await page.click('form button[type=submit]');
  await page.waitForTimeout(600);
  console.log(`   mismatch error shown: ${(await page.locator('text=Passwords do not match').count()) > 0}`);
  await shot(page, 'a3-settings');

  console.log('5. Dark mode toggle from Settings');
  await page.click('button[aria-pressed="false"]');
  await page.waitForTimeout(500);
  console.log(`   html.dark=${await page.evaluate(() => document.documentElement.classList.contains('dark'))}`);
  await shot(page, 'a4-settings-dark');
  await page.click('button[aria-pressed="false"]');
  await page.waitForTimeout(400);

  console.log('6. Admin dashboard');
  await signIn(page, ADMIN);
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  console.log(`   h1="${await page.textContent('h1')}"`);
  const rows = await page.locator('article').count();
  console.log(`   queue rows=${rows}`);
  if (rows > 0) {
    console.log(`   first row code="${await page.locator('article h2').first().textContent()}"`);
  }
  await shot(page, 'a5-admin');

  console.log('7. Reject flow opens and validates (no submit)');
  if (rows > 0) {
    await page.click('text=Reject');
    await page.waitForTimeout(400);
    const confirm = page.locator('button:has-text("Confirm rejection")');
    console.log(`   confirm disabled when empty=${await confirm.isDisabled()}`);
    await page.fill('input[id^=reason-]', 'Test reason not submitted');
    await page.waitForTimeout(300);
    console.log(`   confirm enabled with reason=${!(await confirm.isDisabled())}`);
    await shot(page, 'a6-admin-reject');
    await page.click('button:has-text("Cancel")');
  }

  console.log('8. Nav links present for signed-in admin');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  for (const label of ['Profile', 'Admin', 'My Tickets']) {
    console.log(`   nav "${label}": ${(await page.locator(`header a:has-text("${label}")`).count()) > 0}`);
  }

  console.log('\nerrors:', errors.length ? errors : 'none');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
