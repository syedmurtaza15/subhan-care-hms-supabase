/**
 * Capture screenshots for Sprint 1-13.
 */

import { chromium } from '/usr/local/lib/node_modules/playwright/index.mjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const BASE_URL = process.env.SUBHAN_BASE_URL || 'http://localhost:4173';

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const PAGES = [
  // Auth (Sprint 1-3)
  { slug: '01-login', path: '/login', auth: false, waitFor: 'input[type="email"]' },
  { slug: '02-forgot-password', path: '/forgot-password', auth: false, waitFor: 'input[name="email"]' },
  { slug: '03-otp-verification', path: '/otp-verification', auth: false, waitFor: '.otp-input',
    state: { email: 'admin@subancare.com' } },
  { slug: '04-reset-password', path: '/reset-password', auth: false, waitFor: 'input[name="password"]',
    state: { resetToken: 'demo-token', email: 'admin@subancare.com' } },
  // Dashboard (Sprint 1-3)
  { slug: '05-dashboard', path: '/dashboard', auth: true, waitFor: '.dashboard-page__hero' },
  // Sprint 4-6: Patients module
  { slug: '06-patients-list', path: '/dashboard/patients', auth: true, waitFor: '.patients-page__table' },
  { slug: '07-patient-detail', path: '/dashboard/patients/PT-2391', auth: true, waitFor: '.patient-detail__hero' },
  { slug: '08-patient-history', path: '/dashboard/patients/PT-2391/history', auth: true, waitFor: '.patient-history' },
  // Sprint 4-6: Doctors module
  { slug: '09-doctors-list', path: '/dashboard/doctors', auth: true, waitFor: '.doctor-card' },
  { slug: '10-doctor-detail', path: '/dashboard/doctors/DR-HAMZA', auth: true, waitFor: '.doctor-detail__hero' },
  // Sprint 4-6: Appointments
  { slug: '11-appointments-list', path: '/dashboard/appointments', auth: true, waitFor: '.appointments-page' },
  { slug: '12-appointments-calendar', path: '/dashboard/appointments', auth: true, waitFor: '.ui-calendar',
    preClick: '.appointments-page__view-toggle button:nth-child(2)' },
  { slug: '13-appointment-detail', path: '/dashboard/appointments/APT-1001', auth: true, waitFor: '.appointment-detail__hero' },
  // Sprint 4-6: Billing
  { slug: '14-billing-list', path: '/dashboard/billing', auth: true, waitFor: '.billing-page__table' },
  { slug: '15-invoice-receipt', path: '/dashboard/billing/INV-5001', auth: true, waitFor: '.receipt-page__card' },
  { slug: '16-outstanding-payments', path: '/dashboard/billing/outstanding', auth: true, waitFor: '.outstanding-page__row' },
  // Sprint 7-9: Prescriptions
  { slug: '20-prescriptions-list', path: '/dashboard/prescriptions', auth: true, waitFor: '.prescriptions-page__table' },
  { slug: '21-prescription-detail', path: '/dashboard/prescriptions/RX-3001', auth: true, waitFor: '.prescription-detail__hero' },
  // Sprint 7-9: Inventory
  { slug: '22-inventory', path: '/dashboard/inventory', auth: true, waitFor: '.inventory-page__table' },
  // Sprint 10-13: Reports + Settings polish
  { slug: '23-reports', path: '/dashboard/reports', auth: true, waitFor: '.reports-page__kpis' },
  { slug: '19-settings', path: '/dashboard/settings', auth: true, waitFor: '.settings-page__tabs' },
  // Staff module
  { slug: '17-staff', path: '/dashboard/staff', auth: true, waitFor: '.staff-page__table' },
  // Account
  { slug: '18-profile', path: '/dashboard/profile', auth: true, waitFor: '.profile-page__hero' },
  // Error pages
  { slug: '24-error-404', path: '/forbidden-page-that-does-not-exist', auth: false, waitFor: '.error-page__card' },
  { slug: '25-error-403', path: '/forbidden', auth: false, waitFor: '.error-page__card' },
  { slug: '26-error-500', path: '/server-error', auth: false, waitFor: '.error-page__card' },
];

const seedAuth = async (context) => {
  await context.addInitScript(() => {
    const seed = {
      auth: {
        token: 'subhan.demo.token.admin',
        user: {
          id: 'usr_admin',
          name: 'Ayesha Khan',
          email: 'admin@subancare.com',
          role: 'ADMIN',
          department: 'Operations',
        },
      },
      remember: true,
    };
    localStorage.setItem('subhan_care.auth.user', JSON.stringify(seed.auth.user));
    localStorage.setItem('subhan_care.auth.token', JSON.stringify(seed.auth.token));
    localStorage.setItem('subhan_care.auth.remember', JSON.stringify(seed.remember));
  });
};

const capture = async (browser, viewport, page) => {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  if (page.auth) {
    await seedAuth(context);
  }

  const browserPage = await context.newPage();
  browserPage.on('pageerror', (err) => console.error('[pageerror]', page.path, err.message));
  browserPage.on('console', (msg) => {
    if (msg.type() === 'error') console.error('[console.error]', page.path, msg.text());
  });

  const target = `${BASE_URL}${page.path}`;
  await browserPage.goto(target, { waitUntil: 'networkidle', timeout: 30000 });

  if (page.state) {
    await browserPage.evaluate((state) => {
      const existing = JSON.parse(localStorage.getItem('subhan_care.auth.user') || '{}');
      localStorage.setItem(
        'subhan_care.auth.user',
        JSON.stringify({ ...existing, ...state }),
      );
    }, page.state);
    await browserPage.goto(target, { waitUntil: 'networkidle', timeout: 30000 });
  }

  try {
    await browserPage.waitForSelector(page.waitFor, { timeout: 15000 });
  } catch (err) {
    console.warn(`waitForSelector(${page.waitFor}) timed out on ${page.path}`);
  }

  if (page.preClick) {
    try {
      await browserPage.waitForSelector(page.preClick, { timeout: 5000 });
      await browserPage.click(page.preClick);
      await browserPage.waitForTimeout(900);
    } catch (err) {
      console.warn(`preClick ${page.preClick} failed on ${page.path}`);
    }
  }

  await browserPage.evaluate(() => document.fonts && document.fonts.ready);
  await browserPage.waitForTimeout(450);

  const filename = path.join(OUTPUT_DIR, `${page.slug}-${viewport.name}.png`);
  await browserPage.screenshot({ path: filename, fullPage: false });
  console.log(`✓ saved ${filename}`);

  await context.close();
};

(async () => {
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    executablePath: '/root/.cache/ms-playwright/chromium-1223/chrome-linux/chrome',
  });
  try {
    for (const viewport of VIEWPORTS) {
      console.log(`\n=== Viewport: ${viewport.name} (${viewport.width}x${viewport.height}) ===`);
      for (const page of PAGES) {
        await capture(browser, viewport, page);
      }
    }
  } finally {
    await browser.close();
  }
  console.log('\nDone.');
})();