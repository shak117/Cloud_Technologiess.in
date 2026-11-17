const { chromium } = require('playwright');
const path = require('path');

const artDir = 'C:/Users/Admin1/.gemini/antigravity/brain/cd399ad1-9f87-443a-9da6-3f065e899e03';

async function runVerification() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });

  // 1. HOME PAGE PORTFOLIO SECTION
  const homePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await homePage.goto('http://localhost:5000/index.html', { waitUntil: 'networkidle' });
  await homePage.waitForTimeout(600);

  // Scroll to #work
  await homePage.locator('#work').scrollIntoViewIfNeeded();
  await homePage.waitForTimeout(500);

  const homeCards = await homePage.evaluate(() => {
    return Array.from(document.querySelectorAll('.project-card')).map(card => {
      return {
        clientName: card.querySelector('.project-client-name')?.innerText,
        coverSrc: card.querySelector('.project-cover-img')?.src,
        logoSrc: card.querySelector('.project-badge-logo')?.src,
        coverRenderedWidth: card.querySelector('.project-cover-img')?.clientWidth,
        coverRenderedHeight: card.querySelector('.project-cover-img')?.clientHeight
      };
    });
  });

  console.log('Home Page Portfolio Cards:', JSON.stringify(homeCards, null, 2));

  // Screenshot of Home page #work section
  const workEl = await homePage.locator('#work');
  await workEl.screenshot({ path: path.join(artDir, 'verify_home_synced_with_gallery.png') });
  console.log('Saved verify_home_synced_with_gallery.png');

  // 2. GALLERY PAGE
  const galleryPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await galleryPage.goto('http://localhost:5000/gallery.html', { waitUntil: 'networkidle' });
  await galleryPage.waitForTimeout(600);

  const galleryItems = await galleryPage.evaluate(() => {
    return Array.from(document.querySelectorAll('.gallery-card')).map(card => {
      return {
        title: card.querySelector('.gallery-card-title')?.innerText,
        client: card.querySelector('.gallery-card-client')?.innerText?.trim(),
        imgSrc: card.querySelector('.gallery-card-img')?.src
      };
    });
  });

  console.log('Gallery Page Items:', JSON.stringify(galleryItems, null, 2));

  // Screenshot of Gallery grid
  const galleryGridEl = await galleryPage.locator('#galleryGrid');
  await galleryGridEl.screenshot({ path: path.join(artDir, 'verify_gallery_page_synced.png') });
  console.log('Saved verify_gallery_page_synced.png');

  // 3. ADMIN PANEL - GALLERY TAB
  const adminPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await adminPage.goto('http://localhost:5000/admin.html', { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(500);

  // Fill in login
  await adminPage.fill('#adminUsername', 'cloud');
  await adminPage.fill('#adminPassword', 'Cloud@2005');
  await adminPage.click('button[type="submit"]');
  await adminPage.waitForTimeout(800);

  // Switch to Gallery Management tab
  await adminPage.click('#sideLinkGallery');
  await adminPage.waitForTimeout(600);

  const adminGalleryRows = await adminPage.evaluate(() => {
    return Array.from(document.querySelectorAll('#galleryTableBody tr')).map(row => {
      return {
        title: row.querySelector('.gallery-table-title')?.innerText,
        client: row.querySelector('.gallery-table-client')?.innerText,
        imgSrc: row.querySelector('.table-gallery-img')?.src
      };
    });
  });

  console.log('Admin Gallery Rows:', JSON.stringify(adminGalleryRows, null, 2));

  await adminPage.screenshot({ path: path.join(artDir, 'verify_admin_gallery_tab_synced.png') });
  console.log('Saved verify_admin_gallery_tab_synced.png');

  await browser.close();
  console.log('All visual verifications completed successfully!');
}

runVerification().catch(console.error);
