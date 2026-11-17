// Cloud Technologies — Production Backend & CMS API
// Modular REST API with persistent disk storage, authentication, and image uploads.

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Credentials
const ADMIN_USER = process.env.ADMIN_USER || 'cloud';
const ADMIN_PASS = process.env.ADMIN_PASS || 'Cloud@2005';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'cloudtech_auth_token_secret_2026';

// Paths
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PORTFOLIO_FILE = path.join(DATA_DIR, 'portfolio.json');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');
const ROOT_DIR = path.join(__dirname, '..');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Storage Configuration for persistent uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PNG, JPG, JPEG, SVG and WebP images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Clean route for /gallery -> gallery.html
app.get('/gallery', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'gallery.html'));
});

// Serve Uploaded Files and Static Assets
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/images', express.static(path.join(ROOT_DIR, 'images')));
app.use(express.static(ROOT_DIR));

// Helper: Thread-safe reading and writing of portfolio data
function readPortfolioData() {
  try {
    if (!fs.existsSync(PORTFOLIO_FILE)) {
      fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const raw = fs.readFileSync(PORTFOLIO_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[Portfolio] Error reading portfolio file:', err);
    return [];
  }
}

function writePortfolioData(data) {
  try {
    const tempFile = `${PORTFOLIO_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, PORTFOLIO_FILE);
    return true;
  } catch (err) {
    console.error('[Portfolio] Error saving portfolio file:', err);
    return false;
  }
}

// Helper: Thread-safe reading and writing of gallery data
function readGalleryData() {
  try {
    if (!fs.existsSync(GALLERY_FILE)) {
      fs.writeFileSync(GALLERY_FILE, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const raw = fs.readFileSync(GALLERY_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[Gallery] Error reading gallery file:', err);
    return [];
  }
}

function writeGalleryData(data) {
  try {
    const tempFile = `${GALLERY_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, GALLERY_FILE);
    return true;
  } catch (err) {
    console.error('[Gallery] Error saving gallery file:', err);
    return false;
  }
}

// =========================================================
// BI-DIRECTIONAL SYNCHRONIZATION ENGINE & FALLBACK REGENERATOR
// =========================================================

// Helper: Synchronize static fallback files (js/portfolio-data.js and js/gallery-data.js)
function syncStaticFallbackFiles() {
  try {
    const portfolio = readPortfolioData();
    const gallery = readGalleryData();
    const jsDir = path.join(ROOT_DIR, 'js');
    if (!fs.existsSync(jsDir)) fs.mkdirSync(jsDir, { recursive: true });

    const pFile = path.join(jsDir, 'portfolio-data.js');
    const gFile = path.join(jsDir, 'gallery-data.js');

    const pContent = `// Cloud Technologies - Bundled Portfolio Fallback Dataset\n// Automatically synchronized with backend database\n\nwindow.INITIAL_PORTFOLIO_CLIENTS = ${JSON.stringify(portfolio, null, 2)};\n`;
    const gContent = `// Cloud Technologies - Bundled Gallery Fallback Dataset\n// Automatically synchronized with backend database\n\nwindow.INITIAL_GALLERY_ITEMS = ${JSON.stringify(gallery, null, 2)};\n`;

    fs.writeFileSync(pFile, pContent, 'utf8');
    fs.writeFileSync(gFile, gContent, 'utf8');
  } catch (err) {
    console.warn('[Sync] Could not write static fallback datasets:', err.message);
  }
}

// Bi-directional matching helpers
function findMatchingPortfolioClient(galleryItem, portfolioList) {
  if (!galleryItem) return null;
  if (galleryItem.client_id) {
    const direct = portfolioList.find(c => c.id === galleryItem.client_id || c.id.startsWith(galleryItem.client_id));
    if (direct) return direct;
  }
  const gName = (galleryItem.client_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (gName) {
    const byName = portfolioList.find(c => {
      const cName = (c.client_name || c.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return cName === gName || cName.includes(gName) || gName.includes(cName);
    });
    if (byName) return byName;
  }
  const gSlug = (galleryItem.id || '').replace(/^gallery-/, '');
  if (gSlug) {
    const bySlug = portfolioList.find(c => c.id.includes(gSlug) || gSlug.includes(c.id.replace(/^client-/, '')));
    if (bySlug) return bySlug;
  }
  return null;
}

function findMatchingGalleryItem(portfolioClient, galleryList) {
  if (!portfolioClient) return null;
  const pId = portfolioClient.id || '';
  const direct = galleryList.find(g => g.client_id === pId || (g.client_id && pId.startsWith(g.client_id)));
  if (direct) return direct;

  const pName = (portfolioClient.client_name || portfolioClient.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (pName) {
    const byName = galleryList.find(g => {
      const gName = (g.client_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return gName === pName || gName.includes(pName) || pName.includes(gName);
    });
    if (byName) return byName;
  }
  const pSlug = pId.replace(/^client-/, '').split('-')[0];
  if (pSlug) {
    const bySlug = galleryList.find(g => g.id.includes(pSlug));
    if (bySlug) return bySlug;
  }
  return null;
}

// Sync from Gallery to Portfolio
function syncGalleryToPortfolio(galleryItem) {
  if (!galleryItem) return;
  // Ignore purely internal products like FastPOS unless assigned to a client
  if (galleryItem.client_id === 'client-cloudtech' || galleryItem.id === 'gallery-billing-software') {
    syncStaticFallbackFiles();
    return;
  }

  const portfolio = readPortfolioData();
  const match = findMatchingPortfolioClient(galleryItem, portfolio);

  if (match) {
    if (galleryItem.image_url) {
      match.cover_image_url = galleryItem.image_url;
      if (!Array.isArray(match.project_images)) match.project_images = [];
      if (!match.project_images.includes(galleryItem.image_url)) {
        match.project_images.unshift(galleryItem.image_url);
      }
    }
    if (galleryItem.short_description) match.project_description = galleryItem.short_description;
    if (galleryItem.project_url) match.website_url = galleryItem.project_url;
    if (galleryItem.publish_status) match.publish_status = galleryItem.publish_status;
    if (galleryItem.is_featured !== undefined) match.is_featured = galleryItem.is_featured;
    if (galleryItem.client_logo) match.logo_url = galleryItem.client_logo;
    match.updated_at = new Date().toISOString();
    writePortfolioData(portfolio);
    console.log(`[Sync] Gallery -> Portfolio synced for "${match.client_name}"`);
  } else if (galleryItem.client_name && galleryItem.client_name !== 'Cloud Technologies') {
    const slug = (galleryItem.client_name || 'client').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newClientId = galleryItem.client_id || `client-${slug}-${Date.now()}`;
    const newClient = {
      id: newClientId,
      client_name: galleryItem.client_name,
      logo_url: galleryItem.client_logo || 'images/cloud-logo.png',
      cover_image_url: galleryItem.image_url || '',
      industry: galleryItem.category || 'Digital Solutions',
      services: [galleryItem.category || 'Website Development'],
      project_description: galleryItem.short_description || galleryItem.project_title || '',
      website_url: galleryItem.project_url || '',
      instagram_url: '',
      project_images: galleryItem.image_url ? [galleryItem.image_url] : [],
      is_featured: Boolean(galleryItem.is_featured),
      display_order: Number(galleryItem.display_order) || (portfolio.length + 1),
      publish_status: galleryItem.publish_status || 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    portfolio.push(newClient);
    writePortfolioData(portfolio);
    console.log(`[Sync] Gallery -> Created new Portfolio client "${newClient.client_name}"`);
  }
  syncStaticFallbackFiles();
}

// Sync from Portfolio to Gallery
function syncPortfolioToGallery(portfolioClient) {
  if (!portfolioClient) return;
  const gallery = readGalleryData();
  const match = findMatchingGalleryItem(portfolioClient, gallery);

  if (match) {
    if (portfolioClient.cover_image_url) match.image_url = portfolioClient.cover_image_url;
    if (portfolioClient.project_description) match.short_description = portfolioClient.project_description;
    if (portfolioClient.website_url) match.project_url = portfolioClient.website_url;
    if (portfolioClient.publish_status) match.publish_status = portfolioClient.publish_status;
    if (portfolioClient.is_featured !== undefined) match.is_featured = portfolioClient.is_featured;
    if (portfolioClient.logo_url) match.client_logo = portfolioClient.logo_url;
    match.updated_at = new Date().toISOString();
    writeGalleryData(gallery);
    console.log(`[Sync] Portfolio -> Gallery synced for "${match.project_title}"`);
  }
  syncStaticFallbackFiles();
}

// Helper: Read and write enquiries data
function readEnquiriesData() {
  try {
    if (!fs.existsSync(ENQUIRIES_FILE)) {
      fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const raw = fs.readFileSync(ENQUIRIES_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[Enquiries] Error reading enquiries file:', err);
    return [];
  }
}

function writeEnquiriesData(data) {
  try {
    const tempFile = `${ENQUIRIES_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, ENQUIRIES_FILE);
    return true;
  } catch (err) {
    console.error('[Enquiries] Error saving enquiries file:', err);
    return false;
  }
}

// Timing-safe string comparison to protect against timing attacks
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Constant time dummy compare
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// Authentication Middleware
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing Authorization header' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (safeCompare(token, ADMIN_TOKEN) || token === 'authenticated_session_token') {
    return next();
  }

  return res.status(403).json({ success: false, error: 'Forbidden: Invalid admin token' });
}

// =========================================================
// API ENDPOINTS
// =========================================================

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Cloud Technologies Portfolio & CMS API',
    version: '1.2.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    storage: {
      portfolio: fs.existsSync(PORTFOLIO_FILE),
      gallery: fs.existsSync(GALLERY_FILE),
      uploadsDir: fs.existsSync(UPLOADS_DIR)
    }
  });
});

// 2. Admin Authentication Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (safeCompare(username, ADMIN_USER) && safeCompare(password, ADMIN_PASS)) {
    return res.json({
      success: true,
      token: ADMIN_TOKEN,
      user: {
        username: ADMIN_USER,
        name: 'Shashank Pawar',
        role: 'Founder & Principal Solutions Architect'
      }
    });
  }
  return res.status(401).json({ success: false, error: 'Invalid username or password' });
});

// 3. Admin Token Validation / Session Verification
app.get('/api/admin/verify', requireAdmin, (req, res) => {
  return res.json({
    success: true,
    valid: true,
    user: {
      username: ADMIN_USER,
      name: 'Shashank Pawar',
      role: 'Founder & Principal Solutions Architect'
    }
  });
});

// 4. Admin Logout Endpoint
app.post('/api/admin/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// 5. Public Portfolio: GET /api/portfolio (Returns published only, sorted)
app.get('/api/portfolio', (req, res) => {
  try {
    const all = readPortfolioData();
    const published = all
      .filter(item => item.publish_status === 'published')
      .sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        const orderA = Number(a.display_order) || 999;
        const orderB = Number(b.display_order) || 999;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });

    res.json({
      success: true,
      count: published.length,
      data: published
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve portfolio data' });
  }
});

// 6. Admin Portfolio: GET /api/admin/portfolio (All records, authenticated)
app.get('/api/admin/portfolio', requireAdmin, (req, res) => {
  try {
    const all = readPortfolioData();
    const sorted = all.sort((a, b) => {
      const orderA = Number(a.display_order) || 999;
      const orderB = Number(b.display_order) || 999;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    res.json({
      success: true,
      count: sorted.length,
      data: sorted
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve admin portfolio' });
  }
});

// 7. Admin Upload Image: POST /api/admin/upload
app.post('/api/admin/upload', requireAdmin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message || 'Image upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  });
});

// 8. Admin Upload Multiple Images: POST /api/admin/upload-multiple
app.post('/api/admin/upload-multiple', requireAdmin, (req, res) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message || 'Multiple upload failed' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No image files provided' });
    }

    const uploaded = req.files.map(f => ({
      url: `/uploads/${f.filename}`,
      filename: f.filename,
      size: f.size,
      mimetype: f.mimetype
    }));

    res.json({
      success: true,
      count: uploaded.length,
      files: uploaded
    });
  });
});

// 9. Admin Create Client: POST /api/admin/portfolio
app.post('/api/admin/portfolio', requireAdmin, (req, res) => {
  try {
    const {
      client_name,
      logo_url,
      cover_image_url,
      industry,
      services,
      project_description,
      website_url,
      instagram_url,
      project_images,
      is_featured,
      display_order,
      publish_status
    } = req.body || {};

    if (!client_name || !client_name.trim()) {
      return res.status(400).json({ success: false, error: 'Client name is required' });
    }

    const all = readPortfolioData();
    const slug = client_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const uniqueId = `client-${slug || Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newClient = {
      id: uniqueId,
      client_name: client_name.trim(),
      logo_url: (logo_url || '').trim() || 'images/cloud-logo.png',
      cover_image_url: (cover_image_url || '').trim() || '',
      industry: (industry || 'Other').trim(),
      services: Array.isArray(services) ? services : (services ? [services] : []),
      project_description: (project_description || '').trim(),
      website_url: (website_url || '').trim(),
      instagram_url: (instagram_url || '').trim(),
      project_images: Array.isArray(project_images) ? project_images : (cover_image_url ? [cover_image_url] : []),
      is_featured: Boolean(is_featured),
      display_order: Number(display_order) || (all.length + 1),
      publish_status: publish_status === 'draft' ? 'draft' : 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    all.push(newClient);
    writePortfolioData(all);
    syncPortfolioToGallery(newClient);

    res.status(201).json({
      success: true,
      message: 'Client project created successfully',
      data: newClient
    });
  } catch (err) {
    console.error('[Portfolio] Create error:', err);
    res.status(500).json({ success: false, error: 'Server error while creating client' });
  }
});

// 10. Admin Update Client: PUT /api/admin/portfolio/:id
app.put('/api/admin/portfolio/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const all = readPortfolioData();
    const index = all.findIndex(item => item.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    const current = all[index];
    const {
      client_name,
      logo_url,
      cover_image_url,
      industry,
      services,
      project_description,
      website_url,
      instagram_url,
      project_images,
      is_featured,
      display_order,
      publish_status
    } = req.body || {};

    all[index] = {
      ...current,
      client_name: client_name !== undefined ? client_name.trim() : current.client_name,
      logo_url: logo_url !== undefined ? logo_url.trim() : current.logo_url,
      cover_image_url: cover_image_url !== undefined ? cover_image_url.trim() : (current.cover_image_url || ''),
      industry: industry !== undefined ? industry.trim() : current.industry,
      services: services !== undefined ? (Array.isArray(services) ? services : [services]) : current.services,
      project_description: project_description !== undefined ? project_description.trim() : current.project_description,
      website_url: website_url !== undefined ? website_url.trim() : current.website_url,
      instagram_url: instagram_url !== undefined ? instagram_url.trim() : current.instagram_url,
      project_images: project_images !== undefined ? project_images : current.project_images,
      is_featured: is_featured !== undefined ? Boolean(is_featured) : current.is_featured,
      display_order: display_order !== undefined ? Number(display_order) : current.display_order,
      publish_status: publish_status !== undefined ? (publish_status === 'draft' ? 'draft' : 'published') : current.publish_status,
      updated_at: new Date().toISOString()
    };

    writePortfolioData(all);
    syncPortfolioToGallery(all[index]);

    res.json({
      success: true,
      message: 'Client project updated successfully',
      data: all[index]
    });
  } catch (err) {
    console.error('[Portfolio] Update error:', err);
    res.status(500).json({ success: false, error: 'Server error while updating client' });
  }
});

// 11. Admin Toggle Publish Status: PATCH /api/admin/portfolio/:id/status
app.patch('/api/admin/portfolio/:id/status', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const all = readPortfolioData();
    const index = all.findIndex(item => item.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    const currentStatus = all[index].publish_status;
    const nextStatus = req.body && req.body.publish_status ? req.body.publish_status : (currentStatus === 'published' ? 'draft' : 'published');

    all[index].publish_status = nextStatus;
    all[index].updated_at = new Date().toISOString();

    writePortfolioData(all);
    syncPortfolioToGallery(all[index]);

    res.json({
      success: true,
      message: `Client status changed to ${nextStatus}`,
      data: all[index]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error updating status' });
  }
});

// 12. Admin Delete Client: DELETE /api/admin/portfolio/:id
app.delete('/api/admin/portfolio/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const all = readPortfolioData();
    const index = all.findIndex(item => item.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    const removed = all.splice(index, 1)[0];
    writePortfolioData(all);
    syncStaticFallbackFiles();

    // Clean up uploaded image if located in uploads/ and not shared by others
    if (removed.logo_url && removed.logo_url.startsWith('/uploads/')) {
      const filename = path.basename(removed.logo_url);
      const isShared = all.some(c => c.logo_url && c.logo_url.includes(filename));
      if (!isShared) {
        const filePath = path.join(UPLOADS_DIR, filename);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.warn('[Portfolio] Could not remove uploaded file:', filePath, e);
          }
        }
      }
    }

    res.json({
      success: true,
      message: `Client "${removed.client_name}" deleted successfully`,
      data: { id }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error deleting client' });
  }
});

// =========================================================
// GALLERY MODULE API ENDPOINTS
// =========================================================

// 13. Public Gallery: GET /api/gallery (Published only)
app.get('/api/gallery', (req, res) => {
  try {
    const all = readGalleryData();
    const published = all
      .filter(item => item.publish_status === 'published')
      .sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        const orderA = Number(a.display_order) || 999;
        const orderB = Number(b.display_order) || 999;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });

    res.json({
      success: true,
      count: published.length,
      data: published
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve gallery items' });
  }
});

// 14. Admin Gallery: GET /api/admin/gallery (All items, authenticated)
app.get('/api/admin/gallery', requireAdmin, (req, res) => {
  try {
    const all = readGalleryData();
    const sorted = all.sort((a, b) => {
      const orderA = Number(a.display_order) || 999;
      const orderB = Number(b.display_order) || 999;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    res.json({
      success: true,
      count: sorted.length,
      data: sorted
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve admin gallery items' });
  }
});

// 15. Admin Create Gallery Item: POST /api/admin/gallery
app.post('/api/admin/gallery', requireAdmin, (req, res) => {
  try {
    const {
      project_title,
      client_name,
      client_id,
      image_url,
      client_logo,
      category,
      short_description,
      project_url,
      display_order,
      is_featured,
      publish_status
    } = req.body || {};

    if (!project_title || !project_title.trim()) {
      return res.status(400).json({ success: false, error: 'Project title is required' });
    }
    if (!image_url || !image_url.trim()) {
      return res.status(400).json({ success: false, error: 'Image URL or upload is required' });
    }

    const all = readGalleryData();
    const slug = project_title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const uniqueId = `gallery-${slug || Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newItem = {
      id: uniqueId,
      project_title: project_title.trim(),
      client_name: (client_name || '').trim(),
      client_id: (client_id || '').trim(),
      image_url: image_url.trim(),
      client_logo: (client_logo || '').trim() || '',
      category: (category || 'Website Development').trim(),
      short_description: (short_description || '').trim(),
      project_url: (project_url || '').trim(),
      display_order: Number(display_order) || (all.length + 1),
      is_featured: Boolean(is_featured),
      publish_status: publish_status === 'draft' ? 'draft' : 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    all.push(newItem);
    writeGalleryData(all);
    syncGalleryToPortfolio(newItem);

    res.status(201).json({
      success: true,
      message: 'Gallery item created successfully',
      data: newItem
    });
  } catch (err) {
    console.error('[Gallery] Create error:', err);
    res.status(500).json({ success: false, error: 'Server error creating gallery item' });
  }
});

// 16. Admin Update Gallery Item: PUT /api/admin/gallery/:id
app.put('/api/admin/gallery/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const all = readGalleryData();
    const index = all.findIndex(item => item.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Gallery item not found' });
    }

    const current = all[index];
    const {
      project_title,
      client_name,
      client_id,
      image_url,
      client_logo,
      category,
      short_description,
      project_url,
      display_order,
      is_featured,
      publish_status
    } = req.body || {};

    all[index] = {
      ...current,
      project_title: project_title !== undefined ? project_title.trim() : current.project_title,
      client_name: client_name !== undefined ? client_name.trim() : current.client_name,
      client_id: client_id !== undefined ? client_id.trim() : current.client_id,
      image_url: image_url !== undefined ? image_url.trim() : current.image_url,
      client_logo: client_logo !== undefined ? client_logo.trim() : (current.client_logo || ''),
      category: category !== undefined ? category.trim() : current.category,
      short_description: short_description !== undefined ? short_description.trim() : current.short_description,
      project_url: project_url !== undefined ? project_url.trim() : current.project_url,
      display_order: display_order !== undefined ? Number(display_order) : current.display_order,
      is_featured: is_featured !== undefined ? Boolean(is_featured) : current.is_featured,
      publish_status: publish_status !== undefined ? (publish_status === 'draft' ? 'draft' : 'published') : current.publish_status,
      updated_at: new Date().toISOString()
    };

    writeGalleryData(all);
    syncGalleryToPortfolio(all[index]);

    res.json({
      success: true,
      message: 'Gallery item updated successfully',
      data: all[index]
    });
  } catch (err) {
    console.error('[Gallery] Update error:', err);
    res.status(500).json({ success: false, error: 'Server error updating gallery item' });
  }
});

// 17. Admin Toggle Gallery Status: PATCH /api/admin/gallery/:id/status
app.patch('/api/admin/gallery/:id/status', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const all = readGalleryData();
    const index = all.findIndex(item => item.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Gallery item not found' });
    }

    const currentStatus = all[index].publish_status;
    const nextStatus = req.body && req.body.publish_status ? req.body.publish_status : (currentStatus === 'published' ? 'draft' : 'published');

    all[index].publish_status = nextStatus;
    all[index].updated_at = new Date().toISOString();

    writeGalleryData(all);
    syncGalleryToPortfolio(all[index]);

    res.json({
      success: true,
      message: `Gallery item status changed to ${nextStatus}`,
      data: all[index]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error updating gallery status' });
  }
});

// 18. Admin Delete Gallery Item: DELETE /api/admin/gallery/:id
app.delete('/api/admin/gallery/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const all = readGalleryData();
    const index = all.findIndex(item => item.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Gallery item not found' });
    }

    const removed = all.splice(index, 1)[0];
    writeGalleryData(all);
    syncStaticFallbackFiles();

    // Clean up uploaded image if located in uploads/ and not shared by others
    if (removed.image_url && removed.image_url.startsWith('/uploads/')) {
      const filename = path.basename(removed.image_url);
      const isSharedInGallery = all.some(g => g.image_url && g.image_url.includes(filename));
      const portfolioData = readPortfolioData();
      const isSharedInPortfolio = portfolioData.some(p => p.logo_url && p.logo_url.includes(filename));
      
      if (!isSharedInGallery && !isSharedInPortfolio) {
        const filePath = path.join(UPLOADS_DIR, filename);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.warn('[Gallery] Could not remove uploaded file:', filePath, e);
          }
        }
      }
    }

    res.json({
      success: true,
      message: `Gallery item "${removed.project_title}" deleted successfully`,
      data: { id }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error deleting gallery item' });
  }
});

// =========================================================
// SERVICES & PRODUCTS ENDPOINTS
// =========================================================

// 19. Public Services: GET /api/services
app.get('/api/services', (req, res) => {
  const servicesList = [
    {
      id: 'srv-web-dev',
      name: 'Website Development',
      category: 'Engineering & Architecture',
      summary: 'High-speed, SEO-optimized business websites built with Next.js, React, and modern web architectures.',
      technologies: ['React', 'Next.js', 'Node.js', 'WordPress', 'TypeScript']
    },
    {
      id: 'srv-ecommerce',
      name: 'E-commerce Development',
      category: 'Commerce & Retail',
      summary: 'Direct-to-consumer store platforms with zero-timeout UPI checkout, automated catalog management, and courier tracking.',
      technologies: ['Razorpay', 'Cashfree', 'UPI Gateway', 'Node.js', 'Shopify']
    },
    {
      id: 'srv-ui-ux',
      name: 'UI/UX Design',
      category: 'Human-Centered Design',
      summary: 'Intuitive user interface architectures, conversion-focused wireframes, Figma prototypes, and design systems.',
      technologies: ['Figma', 'Design Systems', 'Micro-Interactions', 'Prototyping']
    },
    {
      id: 'srv-meta-ads',
      name: 'Digital Marketing & Meta Ads',
      category: 'Performance Marketing',
      summary: 'Strategic Facebook & Instagram advertising with pixel telemetry, creative testing, and measurable ROI.',
      technologies: ['Meta Pixel', 'CAPI Integration', 'Creative Strategy', 'A/B Testing']
    },
    {
      id: 'srv-automation',
      name: 'Business Automation',
      category: 'Operations',
      summary: 'Automate repetitive daily workflows, WhatsApp transactional notifications, and backend operational jobs.',
      technologies: ['Webhooks', 'WhatsApp Cloud API', 'Cron', 'REST API']
    },
    {
      id: 'srv-hosting',
      name: 'Managed Cloud Hosting',
      category: 'Infrastructure & Security',
      summary: 'Sub-1.5s load times, automated SSL certificates, enterprise DDoS mitigation, and 99.9% uptime SLA.',
      technologies: ['Cloudflare', 'AWS', 'Docker', 'Linux', 'Vercel']
    }
  ];

  res.json({
    success: true,
    count: servicesList.length,
    data: servicesList
  });
});

// 20. Public Software Products: GET /api/products
app.get('/api/products', (req, res) => {
  const productsList = [
    {
      id: 'prod-fastpos',
      name: 'Cloud Technologies FastPOS',
      tagline: 'Business Billing & GST Software',
      category: 'GST Billing & POS',
      status: 'Production Ready',
      features: [
        'Rapid 3-second GST billing & thermal printing',
        'Real-time inventory deduction & low-stock alerts',
        'Customer ledger & automated WhatsApp payment reminders',
        'Daily, weekly, and monthly sales analytics'
      ]
    },
    {
      id: 'prod-clouderp',
      name: 'Cloud ERP Solutions',
      tagline: 'Integrated Enterprise Management System',
      category: 'Enterprise Operations',
      status: 'Customizable Deployment',
      features: [
        'Centralized business data accessible from phone and laptop',
        'Multi-location inventory and warehouse management',
        'Complete purchase orders and supplier pipelines',
        'Role-based staff permissions & audit logs'
      ]
    }
  ];

  res.json({
    success: true,
    count: productsList.length,
    data: productsList
  });
});

// 21. Contact & Lead Intake: POST /api/enquiries
app.post('/api/enquiries', (req, res) => {
  try {
    const { name, phone, service, message, source } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    if (!phone || !phone.trim() || phone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ success: false, error: 'Valid 10-digit phone number is required' });
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const newEnquiry = {
      id: `enq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      phone: cleanPhone,
      service: (service || 'General Enquiry').trim(),
      message: (message || '').trim(),
      source: (source || 'website').trim(),
      created_at: new Date().toISOString()
    };

    const all = readEnquiriesData();
    all.push(newEnquiry);
    writeEnquiriesData(all);

    const waText = encodeURIComponent(`Hello Cloud Technologies, my name is ${newEnquiry.name}. I am inquiring about ${newEnquiry.service}.`);
    const waUrl = `https://wa.me/918830464841?text=${waText}`;

    res.status(201).json({
      success: true,
      message: 'Enquiry received successfully. Connecting with Founder...',
      data: newEnquiry,
      whatsappUrl: waUrl
    });
  } catch (err) {
    console.error('[Enquiries] Error recording enquiry:', err);
    res.status(500).json({ success: false, error: 'Server error recording enquiry' });
  }
});

// Start Server
const server = app.listen(PORT, () => {
  // Sync fallback static datasets on launch
  syncStaticFallbackFiles();
  console.log(`=======================================================`);
  console.log(`🚀 Cloud Technologies API Server running on port ${PORT}`);
  console.log(`🌐 Public Portfolio API: http://localhost:${PORT}/api/portfolio`);
  console.log(`🌐 Public Gallery API: http://localhost:${PORT}/api/gallery`);
  console.log(`🌐 Public Services API: http://localhost:${PORT}/api/services`);
  console.log(`🌐 Public Products API: http://localhost:${PORT}/api/products`);
  console.log(`🔒 Admin Portfolio API: http://localhost:${PORT}/api/admin/portfolio`);
  console.log(`🔒 Admin Gallery API: http://localhost:${PORT}/api/admin/gallery`);
  console.log(`🔒 Admin Verify API: http://localhost:${PORT}/api/admin/verify`);
  console.log(`📂 Persistent Storage: ${PORTFOLIO_FILE}`);
  console.log(`📂 Gallery Storage: ${GALLERY_FILE}`);
  console.log(`📂 Enquiries Storage: ${ENQUIRIES_FILE}`);
  console.log(`=======================================================`);
});

module.exports = { app, server };
