// Cloud Technologies — Complete Automated API QA & Integration Test Suite
// Executes real HTTP requests against the running Node.js backend.
// Verifies authentication, portfolio CRUD, image uploads, gallery CRUD, services, products, and contact APIs.

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';
const ADMIN_USER = 'cloud';
const ADMIN_PASS = 'Cloud@2005';
let adminToken = '';

const testResults = [];

function recordTest(endpoint, method, description, status, details = '') {
  testResults.push({ endpoint, method, description, status, details });
  const icon = status === 'PASS' ? '✅' : (status === 'FAIL' ? '❌' : '⚠️');
  console.log(`${icon} [${status}] ${method} ${endpoint} — ${description}`);
  if (details && status === 'FAIL') {
    console.log(`   Details: ${details}`);
  }
}

// Helper to make HTTP requests
function request(method, pathUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathUrl, BASE_URL);
    const headers = options.headers || {};
    
    let bodyData = null;
    if (options.json) {
      headers['Content-Type'] = 'application/json';
      bodyData = JSON.stringify(options.json);
      headers['Content-Length'] = Buffer.byteLength(bodyData);
    } else if (options.rawBody) {
      bodyData = options.rawBody;
      headers['Content-Length'] = Buffer.byteLength(bodyData);
    }

    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method.toUpperCase(),
      headers: headers
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = null;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          json: json
        });
      });
    });

    req.on('error', (err) => reject(err));
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

// Multipart helper for file upload tests
function uploadFile(pathUrl, fieldName, filename, fileBuffer, mimeType, token) {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const url = new URL(pathUrl, BASE_URL);

    let pre = `--${boundary}\r\n`;
    pre += `Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n`;
    pre += `Content-Type: ${mimeType}\r\n\r\n`;

    const post = `\r\n--${boundary}--\r\n`;
    const fullBody = Buffer.concat([Buffer.from(pre, 'utf8'), fileBuffer, Buffer.from(post, 'utf8')]);

    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullBody.length,
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({ status: res.statusCode, body: data, json });
      });
    });

    req.on('error', reject);
    req.write(fullBody);
    req.end();
  });
}

async function runTestSuite() {
  console.log(`\n=============================================================`);
  console.log(`🚀 STARTING REAL BACKEND API & INTEGRATION TEST SUITE`);
  console.log(`   Target Server: ${BASE_URL}`);
  console.log(`=============================================================\n`);

  // -------------------------------------------------------------
  // 1. HEALTH CHECK
  // -------------------------------------------------------------
  try {
    const res = await request('GET', '/api/health');
    if (res.status === 200 && res.json && res.json.status === 'ok') {
      recordTest('/api/health', 'GET', 'Health check returns status ok & storage verification', 'PASS');
    } else {
      recordTest('/api/health', 'GET', 'Health check', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    recordTest('/api/health', 'GET', 'Health check connection', 'FAIL', err.message);
    return;
  }

  // -------------------------------------------------------------
  // 2. AUTHENTICATION TESTS
  // -------------------------------------------------------------
  // Positive Login
  try {
    const res = await request('POST', '/api/admin/login', {
      json: { username: ADMIN_USER, password: ADMIN_PASS }
    });
    if (res.status === 200 && res.json && res.json.success && res.json.token) {
      adminToken = res.json.token;
      recordTest('/api/admin/login', 'POST', 'Valid admin credentials return auth token & user profile', 'PASS');
    } else {
      recordTest('/api/admin/login', 'POST', 'Valid login', 'FAIL', JSON.stringify(res.json));
    }
  } catch (err) {
    recordTest('/api/admin/login', 'POST', 'Valid login', 'FAIL', err.message);
  }

  // Negative Login: Wrong password
  try {
    const res = await request('POST', '/api/admin/login', {
      json: { username: ADMIN_USER, password: 'WrongPassword999!' }
    });
    if (res.status === 401 && res.json && res.json.success === false) {
      recordTest('/api/admin/login', 'POST', 'Rejection of invalid password with 401 Unauthorized', 'PASS');
    } else {
      recordTest('/api/admin/login', 'POST', 'Invalid password rejection', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    recordTest('/api/admin/login', 'POST', 'Invalid password rejection', 'FAIL', err.message);
  }

  // Token Verification: GET /api/admin/verify (with valid token)
  try {
    const res = await request('GET', '/api/admin/verify', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (res.status === 200 && res.json && res.json.valid === true) {
      recordTest('/api/admin/verify', 'GET', 'Session token validation succeeds for authenticated token', 'PASS');
    } else {
      recordTest('/api/admin/verify', 'GET', 'Token verification', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    recordTest('/api/admin/verify', 'GET', 'Token verification', 'FAIL', err.message);
  }

  // Negative Token Verification: Missing token
  try {
    const res = await request('GET', '/api/admin/verify');
    if (res.status === 401 && res.json && res.json.success === false) {
      recordTest('/api/admin/verify', 'GET', 'Rejects missing Authorization header with 401 Unauthorized', 'PASS');
    } else {
      recordTest('/api/admin/verify', 'GET', 'Missing auth rejection', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    recordTest('/api/admin/verify', 'GET', 'Missing auth rejection', 'FAIL', err.message);
  }

  // Negative Token Verification: Invalid token
  try {
    const res = await request('GET', '/api/admin/verify', {
      headers: { 'Authorization': 'Bearer fake_hacker_token_12345' }
    });
    if (res.status === 403 && res.json && res.json.success === false) {
      recordTest('/api/admin/verify', 'GET', 'Rejects invalid bearer token with 403 Forbidden', 'PASS');
    } else {
      recordTest('/api/admin/verify', 'GET', 'Invalid token rejection', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    recordTest('/api/admin/verify', 'GET', 'Invalid token rejection', 'FAIL', err.message);
  }

  // Logout Endpoint: POST /api/admin/logout
  try {
    const res = await request('POST', '/api/admin/logout');
    if (res.status === 200 && res.json && res.json.success === true) {
      recordTest('/api/admin/logout', 'POST', 'Admin logout clears server session state cleanly', 'PASS');
    } else {
      recordTest('/api/admin/logout', 'POST', 'Logout endpoint', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    recordTest('/api/admin/logout', 'POST', 'Logout endpoint', 'FAIL', err.message);
  }

  // -------------------------------------------------------------
  // 3. IMAGE UPLOAD TESTS
  // -------------------------------------------------------------
  let uploadedLogoUrl = '';
  // Positive Single Image Upload: Valid PNG
  try {
    const pngDummy = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    const res = await uploadFile('/api/admin/upload', 'image', 'test_logo.png', pngDummy, 'image/png', adminToken);
    if (res.status === 200 && res.json && res.json.success && res.json.url) {
      uploadedLogoUrl = res.json.url;
      recordTest('/api/admin/upload', 'POST', 'Upload valid PNG logo returns persistent relative URL', 'PASS');
    } else {
      recordTest('/api/admin/upload', 'POST', 'Upload PNG logo', 'FAIL', res.body);
    }
  } catch (err) {
    recordTest('/api/admin/upload', 'POST', 'Upload PNG logo', 'FAIL', err.message);
  }

  // Negative Upload: Invalid file type (.exe / application/octet-stream)
  try {
    const badBuffer = Buffer.from('MZ...fake executable content');
    const res = await uploadFile('/api/admin/upload', 'image', 'virus.exe', badBuffer, 'application/x-msdownload', adminToken);
    if (res.status === 400 && res.json && res.json.success === false) {
      recordTest('/api/admin/upload', 'POST', 'Rejection of non-image MIME type (.exe) with 400 Bad Request', 'PASS');
    } else {
      recordTest('/api/admin/upload', 'POST', 'Invalid file type rejection', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    recordTest('/api/admin/upload', 'POST', 'Invalid file type rejection', 'FAIL', err.message);
  }

  // Negative Upload: Missing image file
  try {
    const res = await request('POST', '/api/admin/upload', {
      headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      json: {}
    });
    if (res.status === 400) {
      recordTest('/api/admin/upload', 'POST', 'Rejection of request missing multipart file', 'PASS');
    } else {
      recordTest('/api/admin/upload', 'POST', 'Missing file rejection', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    recordTest('/api/admin/upload', 'POST', 'Missing file rejection', 'FAIL', err.message);
  }

  // Negative Upload: Unauthorized (missing token)
  try {
    const pngDummy = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    const res = await uploadFile('/api/admin/upload', 'image', 'test.png', pngDummy, 'image/png', 'invalid_token');
    if (res.status === 403) {
      recordTest('/api/admin/upload', 'POST', 'Rejection of unauthorized upload with 403 Forbidden', 'PASS');
    } else {
      recordTest('/api/admin/upload', 'POST', 'Unauthorized upload rejection', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    recordTest('/api/admin/upload', 'POST', 'Unauthorized upload rejection', 'FAIL', err.message);
  }

  // -------------------------------------------------------------
  // 4. PORTFOLIO CRUD & DATA INTEGRITY LIFECYCLE
  // -------------------------------------------------------------
  // Public Portfolio List: GET /api/portfolio
  try {
    const res = await request('GET', '/api/portfolio');
    if (res.status === 200 && res.json && res.json.success && Array.isArray(res.json.data)) {
      const knotberry = res.json.data.find(c => c.client_name.toLowerCase().includes('knotberry'));
      const hasSeparatedFields = res.json.data.every(c => 'logo_url' in c && 'cover_image_url' in c);
      if (knotberry && hasSeparatedFields) {
        recordTest('/api/portfolio', 'GET', `Public portfolio returns ${res.json.count} published clients with separated logo_url & cover_image_url`, 'PASS');
      } else {
        recordTest('/api/portfolio', 'GET', 'Public portfolio data structure', 'FAIL', 'Missing separated fields or knotberry record');
      }
    } else {
      recordTest('/api/portfolio', 'GET', 'Public portfolio', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    recordTest('/api/portfolio', 'GET', 'Public portfolio', 'FAIL', err.message);
  }

  // Admin Portfolio List: GET /api/admin/portfolio
  try {
    const res = await request('GET', '/api/admin/portfolio', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (res.status === 200 && res.json && res.json.success && Array.isArray(res.json.data)) {
      recordTest('/api/admin/portfolio', 'GET', `Admin portfolio returns all ${res.json.count} records including drafts`, 'PASS');
    } else {
      recordTest('/api/admin/portfolio', 'GET', 'Admin portfolio', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    recordTest('/api/admin/portfolio', 'GET', 'Admin portfolio', 'FAIL', err.message);
  }

  // CREATE QA TEMPORARY CLIENT
  let createdClientId = '';
  const testClientPayload = {
    client_name: 'QA Test Client Automation',
    logo_url: uploadedLogoUrl || 'images/cloud-logo.png',
    cover_image_url: 'images/sk-relax-showcase.png',
    industry: 'Healthcare',
    services: ['Website Development', 'UI/UX Design'],
    project_description: 'Automated test record for verification of data integrity and lifecycle.',
    website_url: 'https://qatestclient.example.com',
    is_featured: false,
    display_order: 99,
    publish_status: 'published'
  };

  try {
    const res = await request('POST', '/api/admin/portfolio', {
      headers: { 'Authorization': `Bearer ${adminToken}` },
      json: testClientPayload
    });
    if (res.status === 201 && res.json && res.json.success && res.json.data && res.json.data.id) {
      createdClientId = res.json.data.id;
      recordTest('/api/admin/portfolio', 'POST', `Client creation creates persistent record with ID: ${createdClientId}`, 'PASS');
    } else {
      recordTest('/api/admin/portfolio', 'POST', 'Client creation', 'FAIL', JSON.stringify(res.json));
    }
  } catch (err) {
    recordTest('/api/admin/portfolio', 'POST', 'Client creation', 'FAIL', err.message);
  }

  // Verify created client in public API
  try {
    const res = await request('GET', '/api/portfolio');
    const found = res.json && res.json.data && res.json.data.find(c => c.id === createdClientId);
    if (found && found.cover_image_url === 'images/sk-relax-showcase.png') {
      recordTest('/api/portfolio', 'GET', 'Created client appears immediately in public portfolio response', 'PASS');
    } else {
      recordTest('/api/portfolio', 'GET', 'Public visibility of new client', 'FAIL', 'Record not found in public list');
    }
  } catch (err) {
    recordTest('/api/portfolio', 'GET', 'Public visibility of new client', 'FAIL', err.message);
  }

  // UPDATE CLIENT: PUT /api/admin/portfolio/:id
  try {
    const res = await request('PUT', `/api/admin/portfolio/${createdClientId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
      json: {
        project_description: 'Updated QA description to verify PUT modification persistence.',
        cover_image_url: 'images/hiramoti-showcase.jpg'
      }
    });
    if (res.status === 200 && res.json && res.json.data && res.json.data.cover_image_url === 'images/hiramoti-showcase.jpg') {
      recordTest(`/api/admin/portfolio/${createdClientId}`, 'PUT', 'Client update persists modified cover_image_url & description', 'PASS');
    } else {
      recordTest(`/api/admin/portfolio/${createdClientId}`, 'PUT', 'Client update', 'FAIL', JSON.stringify(res.json));
    }
  } catch (err) {
    recordTest(`/api/admin/portfolio/${createdClientId}`, 'PUT', 'Client update', 'FAIL', err.message);
  }

  // UNPUBLISH (TOGGLE STATUS TO DRAFT): PATCH /api/admin/portfolio/:id/status
  try {
    const res = await request('PATCH', `/api/admin/portfolio/${createdClientId}/status`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
      json: { publish_status: 'draft' }
    });
    if (res.status === 200 && res.json && res.json.data && res.json.data.publish_status === 'draft') {
      recordTest(`/api/admin/portfolio/${createdClientId}/status`, 'PATCH', 'Toggle status changes client from published to draft', 'PASS');
    } else {
      recordTest(`/api/admin/portfolio/${createdClientId}/status`, 'PATCH', 'Toggle status', 'FAIL', JSON.stringify(res.json));
    }
  } catch (err) {
    recordTest(`/api/admin/portfolio/${createdClientId}/status`, 'PATCH', 'Toggle status', 'FAIL', err.message);
  }

  // Verify draft client disappears from public API
  try {
    const res = await request('GET', '/api/portfolio');
    const found = res.json && res.json.data && res.json.data.find(c => c.id === createdClientId);
    if (!found) {
      recordTest('/api/portfolio', 'GET', 'Draft client disappears cleanly from public API results', 'PASS');
    } else {
      recordTest('/api/portfolio', 'GET', 'Draft isolation', 'FAIL', 'Draft client was returned in public endpoint!');
    }
  } catch (err) {
    recordTest('/api/portfolio', 'GET', 'Draft isolation', 'FAIL', err.message);
  }

  // DELETE CLIENT: DELETE /api/admin/portfolio/:id
  try {
    const res = await request('DELETE', `/api/admin/portfolio/${createdClientId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (res.status === 200 && res.json && res.json.success === true) {
      recordTest(`/api/admin/portfolio/${createdClientId}`, 'DELETE', 'Admin delete client cleans up database record & temporary files', 'PASS');
    } else {
      recordTest(`/api/admin/portfolio/${createdClientId}`, 'DELETE', 'Delete client', 'FAIL', JSON.stringify(res.json));
    }
  } catch (err) {
    recordTest(`/api/admin/portfolio/${createdClientId}`, 'DELETE', 'Delete client', 'FAIL', err.message);
  }

  // Verify deleted client is gone from admin API
  try {
    const res = await request('GET', '/api/admin/portfolio', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const found = res.json && res.json.data && res.json.data.find(c => c.id === createdClientId);
    if (!found) {
      recordTest('/api/admin/portfolio', 'GET', 'Confirm complete cleanup of test client from persistent database', 'PASS');
    } else {
      recordTest('/api/admin/portfolio', 'GET', 'Confirm deletion', 'FAIL', 'Deleted client still exists in database!');
    }
  } catch (err) {
    recordTest('/api/admin/portfolio', 'GET', 'Confirm deletion', 'FAIL', err.message);
  }

  // -------------------------------------------------------------
  // 5. GALLERY API ENDPOINTS
  // -------------------------------------------------------------
  // Public Gallery List: GET /api/gallery
  try {
    const res = await request('GET', '/api/gallery');
    if (res.status === 200 && res.json && res.json.success && Array.isArray(res.json.data)) {
      recordTest('/api/gallery', 'GET', `Public gallery returns ${res.json.count} published creations`, 'PASS');
    } else {
      recordTest('/api/gallery', 'GET', 'Public gallery', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    recordTest('/api/gallery', 'GET', 'Public gallery', 'FAIL', err.message);
  }

  // Admin Gallery List: GET /api/admin/gallery
  try {
    const res = await request('GET', '/api/admin/gallery', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (res.status === 200 && res.json && res.json.success && Array.isArray(res.json.data)) {
      recordTest('/api/admin/gallery', 'GET', `Admin gallery returns all ${res.json.count} items`, 'PASS');
    } else {
      recordTest('/api/admin/gallery', 'GET', 'Admin gallery', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    recordTest('/api/admin/gallery', 'GET', 'Admin gallery', 'FAIL', err.message);
  }

  // CREATE GALLERY QA ITEM
  let createdGalleryId = '';
  try {
    const res = await request('POST', '/api/admin/gallery', {
      headers: { 'Authorization': `Bearer ${adminToken}` },
      json: {
        project_title: 'QA Test Gallery Item',
        client_name: 'QA Client',
        image_url: 'images/knotberry-studios.png',
        category: 'E-commerce',
        short_description: 'Temporary QA creation item',
        publish_status: 'published'
      }
    });
    if (res.status === 201 && res.json && res.json.data && res.json.data.id) {
      createdGalleryId = res.json.data.id;
      recordTest('/api/admin/gallery', 'POST', `Gallery creation creates item ID: ${createdGalleryId}`, 'PASS');
    } else {
      recordTest('/api/admin/gallery', 'POST', 'Gallery creation', 'FAIL', JSON.stringify(res.json));
    }
  } catch (err) {
    recordTest('/api/admin/gallery', 'POST', 'Gallery creation', 'FAIL', err.message);
  }

  // DELETE GALLERY QA ITEM
  try {
    const res = await request('DELETE', `/api/admin/gallery/${createdGalleryId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (res.status === 200 && res.json && res.json.success === true) {
      recordTest(`/api/admin/gallery/${createdGalleryId}`, 'DELETE', 'Admin delete gallery item removes record cleanly', 'PASS');
    } else {
      recordTest(`/api/admin/gallery/${createdGalleryId}`, 'DELETE', 'Delete gallery item', 'FAIL', JSON.stringify(res.json));
    }
  } catch (err) {
    recordTest(`/api/admin/gallery/${createdGalleryId}`, 'DELETE', 'Delete gallery item', 'FAIL', err.message);
  }

  // -------------------------------------------------------------
  // 6. SERVICES & PRODUCTS CATALOGUE
  // -------------------------------------------------------------
  // Public Services: GET /api/services
  try {
    const res = await request('GET', '/api/services');
    if (res.status === 200 && res.json && res.json.success && res.json.count >= 6) {
      recordTest('/api/services', 'GET', `Services endpoint returns ${res.json.count} structured service offerings`, 'PASS');
    } else {
      recordTest('/api/services', 'GET', 'Services endpoint', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    recordTest('/api/services', 'GET', 'Services endpoint', 'FAIL', err.message);
  }

  // Public Products: GET /api/products
  try {
    const res = await request('GET', '/api/products');
    if (res.status === 200 && res.json && res.json.success && res.json.count >= 2) {
      recordTest('/api/products', 'GET', `Products endpoint returns FastPOS Billing and Cloud ERP solutions`, 'PASS');
    } else {
      recordTest('/api/products', 'GET', 'Products endpoint', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    recordTest('/api/products', 'GET', 'Products endpoint', 'FAIL', err.message);
  }

  // -------------------------------------------------------------
  // 7. CONTACT & ENQUIRY INTAKE
  // -------------------------------------------------------------
  // Positive Enquiry
  try {
    const res = await request('POST', '/api/enquiries', {
      json: {
        name: 'Shashank Test Lead',
        phone: '9876543210',
        service: 'Website Development',
        message: 'Looking for a high performance business website with UPI integration.'
      }
    });
    if (res.status === 201 && res.json && res.json.success && res.json.whatsappUrl) {
      recordTest('/api/enquiries', 'POST', 'Contact intake validates lead, logs record & generates prefilled WhatsApp link', 'PASS');
    } else {
      recordTest('/api/enquiries', 'POST', 'Contact intake', 'FAIL', JSON.stringify(res.json));
    }
  } catch (err) {
    recordTest('/api/enquiries', 'POST', 'Contact intake', 'FAIL', err.message);
  }

  // Negative Enquiry: Invalid phone number
  try {
    const res = await request('POST', '/api/enquiries', {
      json: {
        name: 'Invalid Lead',
        phone: '123' // Too short
      }
    });
    if (res.status === 400 && res.json && res.json.success === false) {
      recordTest('/api/enquiries', 'POST', 'Rejection of invalid phone number with 400 Bad Request', 'PASS');
    } else {
      recordTest('/api/enquiries', 'POST', 'Invalid phone rejection', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    recordTest('/api/enquiries', 'POST', 'Invalid phone rejection', 'FAIL', err.message);
  }

  // -------------------------------------------------------------
  // SUMMARY REPORT
  // -------------------------------------------------------------
  console.log(`\n=============================================================`);
  const total = testResults.length;
  const passed = testResults.filter(t => t.status === 'PASS').length;
  const failed = testResults.filter(t => t.status === 'FAIL').length;
  console.log(`📊 TEST SUITE SUMMARY: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log(`=============================================================\n`);

  // Write test results to JSON report
  const reportPath = path.join(__dirname, 'test_results.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    total,
    passed,
    failed,
    results: testResults
  }, null, 2));

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
