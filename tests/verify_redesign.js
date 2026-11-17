const { chromium } = require('C:/Users/Admin1/AppData/Local/OpenAI/Codex/runtimes/cua_node/45309f9050f7314b/bin/node_modules/playwright');
const path = require('path');

const artDir = 'C:/Users/Admin1/.gemini/antigravity/brain/cd399ad1-9f87-443a-9da6-3f065e899e03';

async function runRedesignAudit() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });

  // -----------------------------------------------------------
  // 1. DESKTOP VIEWPORT (1440 x 900)
  // -----------------------------------------------------------
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5000/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Capture Full Desktop Hero & Nav
  await page.screenshot({ path: path.join(artDir, 'verify_redesign_desktop_hero.png'), clip: { x: 0, y: 0, width: 1440, height: 850 } });
  console.log('Saved verify_redesign_desktop_hero.png');

  // Verify Founder section is intact & protected
  const founderEl = await page.locator('#about');
  await founderEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const founderPhoto = await page.locator('.founder-real-photo').getAttribute('src');
  const founderName = await page.locator('.founder-name-heading').innerText();
  console.log('Founder section check:', { founderPhoto, founderName });
  await founderEl.screenshot({ path: path.join(artDir, 'verify_redesign_founder_protected.png') });
  console.log('Saved verify_redesign_founder_protected.png');

  // Verify Dynamic Client Showcase
  const showcaseEl = await page.locator('#clients');
  await showcaseEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  const showcaseCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.showcase-client-card'));
    return cards.map(c => ({
      name: c.querySelector('.showcase-client-name')?.innerText,
      isActive: c.classList.contains('active'),
      isAdjacent: c.classList.contains('adjacent'),
      cover: c.querySelector('.showcase-card-cover img')?.src,
      logo: c.querySelector('.showcase-brand-avatar img')?.src
    }));
  });
  console.log('Client Showcase Cards:', JSON.stringify(showcaseCards, null, 2));

  await showcaseEl.screenshot({ path: path.join(artDir, 'verify_redesign_client_showcase.png') });
  console.log('Saved verify_redesign_client_showcase.png');

  // Test Shuffle Interaction
  console.log('Testing shuffle button interaction...');
  const shuffleBtn = await page.locator('#btnShuffleClients');
  await shuffleBtn.click();
  await page.waitForTimeout(600);

  const shuffledState = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.showcase-client-card'));
    const active = cards.find(c => c.classList.contains('active'));
    return {
      activeName: active ? active.querySelector('.showcase-client-name')?.innerText : 'NONE',
      totalCount: cards.length
    };
  });
  console.log('After shuffle interaction:', shuffledState);
  await showcaseEl.screenshot({ path: path.join(artDir, 'verify_redesign_client_showcase_shuffled.png') });
  console.log('Saved verify_redesign_client_showcase_shuffled.png');

  // Test Prev / Next controls
  const nextBtn = await page.locator('#clientShowcaseNext');
  await nextBtn.click();
  await page.waitForTimeout(500);

  // Verify Services Section (all 8 services)
  const servicesEl = await page.locator('#services');
  await servicesEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const serviceCount = await page.evaluate(() => {
    return document.querySelectorAll('.services-grid-8 .service-card').length;
  });
  console.log('Services rendered count:', serviceCount);
  await servicesEl.screenshot({ path: path.join(artDir, 'verify_redesign_services_8.png') });
  console.log('Saved verify_redesign_services_8.png');

  // Verify Software Section
  const softwareEl = await page.locator('#software');
  await softwareEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await softwareEl.screenshot({ path: path.join(artDir, 'verify_redesign_software.png') });
  console.log('Saved verify_redesign_software.png');

  // Verify Our Work (Portfolio Section)
  const workEl = await page.locator('#work');
  await workEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await workEl.screenshot({ path: path.join(artDir, 'verify_redesign_our_work.png') });
  console.log('Saved verify_redesign_our_work.png');

  // -----------------------------------------------------------
  // 2. MOBILE VIEWPORT (390 x 844 - iPhone 14 / modern mobile)
  // -----------------------------------------------------------
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://localhost:5000/index.html', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(600);

  // Check Mobile Client Showcase
  const mobileShowcase = await mobilePage.locator('#clients');
  await mobileShowcase.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(500);
  await mobileShowcase.screenshot({ path: path.join(artDir, 'verify_redesign_mobile_showcase.png') });
  console.log('Saved verify_redesign_mobile_showcase.png');

  // Check horizontal overflow on mobile
  const hasHorizontalScroll = await mobilePage.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log('Mobile horizontal overflow detected:', hasHorizontalScroll);

  // -----------------------------------------------------------
  // 3. GALLERY PAGE (1440 x 900)
  // -----------------------------------------------------------
  const galleryPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await galleryPage.goto('http://localhost:5000/gallery.html', { waitUntil: 'networkidle' });
  await galleryPage.waitForTimeout(600);

  const galleryItemsCount = await galleryPage.evaluate(() => {
    return document.querySelectorAll('.gallery-card').length;
  });
  console.log('Gallery page items count:', galleryItemsCount);
  await galleryPage.screenshot({ path: path.join(artDir, 'verify_redesign_gallery_page.png') });
  console.log('Saved verify_redesign_gallery_page.png');

  await browser.close();
  console.log('All redesign visual verifications complete!');
}

runRedesignAudit().catch(console.error);
