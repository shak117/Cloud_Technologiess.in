const { chromium } = require('playwright');
const path = require('path');

const artDir = 'C:/Users/Admin1/.gemini/antigravity/brain/cd399ad1-9f87-443a-9da6-3f065e899e03';

async function runVisualVerification() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });

  // -----------------------------------------------------------
  // 1. LIVE WEBSITE HOMEPAGE & PORTFOLIO CARDS (DESKTOP 1440)
  // -----------------------------------------------------------
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5000/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Scroll to #work (Portfolio section)
  await page.locator('#work').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Verify Knotberry card metrics
  const knotberryCard = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.project-card'));
    const knotberry = cards.find(c => c.innerText.toLowerCase().includes('knotberry'));
    if (!knotberry) return null;

    const coverImg = knotberry.querySelector('.project-cover-img');
    const badgeLogo = knotberry.querySelector('.project-badge-logo');
    const coverBox = knotberry.querySelector('.project-cover-box');
    const brandAvatar = knotberry.querySelector('.project-brand-avatar');

    return {
      title: knotberry.querySelector('.project-client-name')?.innerText,
      coverSrc: coverImg?.src,
      logoSrc: badgeLogo?.src,
      coverBoxRect: coverBox ? {
        width: Math.round(coverBox.getBoundingClientRect().width),
        height: Math.round(coverBox.getBoundingClientRect().height)
      } : null,
      brandAvatarRect: brandAvatar ? {
        width: Math.round(brandAvatar.getBoundingClientRect().width),
        height: Math.round(brandAvatar.getBoundingClientRect().height)
      } : null,
      badgeLogoRect: badgeLogo ? {
        width: Math.round(badgeLogo.getBoundingClientRect().width),
        height: Math.round(badgeLogo.getBoundingClientRect().height)
      } : null
    };
  });

  console.log('Live Website Knotberry Card Inspection:', JSON.stringify(knotberryCard, null, 2));

  // Capture screenshot of the portfolio grid showing all 4 cards
  const portfolioEl = await page.locator('#work');
  await portfolioEl.screenshot({ path: path.join(artDir, 'verify_portfolio_section_fixed.png') });
  console.log('Captured portfolio grid screenshot: verify_portfolio_section_fixed.png');

  // -----------------------------------------------------------
  // 2. ADMIN PANEL: LOGIN & TABLE INSPECTION
  // -----------------------------------------------------------
  const adminPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await adminPage.goto('http://localhost:5000/admin.html', { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(500);

  // Fill in login credentials
  await adminPage.fill('#adminUsername', 'cloud');
  await adminPage.fill('#adminPassword', 'Cloud@2005');
  await adminPage.click('button[type="submit"]');
  await adminPage.waitForTimeout(800);

  // Verify table metrics in admin panel
  const adminTableMetrics = await adminPage.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#portfolioTableBody tr'));
    return rows.map(r => {
      const name = r.querySelector('.client-primary-name')?.innerText;
      const logoBox = r.querySelector('.table-logo-box');
      const logoImg = r.querySelector('.table-logo-img');
      const boxRect = logoBox ? logoBox.getBoundingClientRect() : null;
      const imgRect = logoImg ? logoImg.getBoundingClientRect() : null;

      return {
        clientName: name,
        boxWidth: boxRect ? Math.round(boxRect.width) : 0,
        boxHeight: boxRect ? Math.round(boxRect.height) : 0,
        imgWidth: imgRect ? Math.round(imgRect.width) : 0,
        imgHeight: imgRect ? Math.round(imgRect.height) : 0,
        logoSrc: logoImg?.src
      };
    });
  });

  console.log('Admin Table Logo Dimensions:', JSON.stringify(adminTableMetrics, null, 2));

  // Capture screenshot of the Admin Dashboard Table
  await adminPage.screenshot({ path: path.join(artDir, 'verify_admin_table_fixed.png') });
  console.log('Captured admin table screenshot: verify_admin_table_fixed.png');

  // Open the View Details modal for Knotberry
  console.log('Opening Knotberry View modal in Admin...');
  const knotberryViewBtn = await adminPage.locator('#portfolioTableBody tr').nth(3).locator('.action-btn').first();
  await knotberryViewBtn.click();
  await adminPage.waitForTimeout(500);

  // Capture screenshot of the View Modal
  await adminPage.screenshot({ path: path.join(artDir, 'verify_admin_view_knotberry_modal.png') });
  console.log('Captured admin view modal screenshot: verify_admin_view_knotberry_modal.png');

  await browser.close();
  console.log('Visual verification complete!');
}

runVisualVerification().catch(console.error);
