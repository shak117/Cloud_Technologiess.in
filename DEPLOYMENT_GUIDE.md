# Cloud Technologies — Admin Panel & Live CMS Deployment Guide

This guide explains how to deploy and connect the **Cloud Technologies** live website and administrative portfolio CMS.

---

## 1. System Architecture

The application is structured into a decoupled, high-performance architecture:

```
                    ┌──────────────────────────────────────────────┐
                    │               GitHub Pages                   │
                    │        (Static High-Speed Frontend)          │
                    │   • index.html (Homepage & Live Portfolio)   │
                    │   • admin.html (Modern SaaS CMS Dashboard)   │
                    │   • js/config.js (API Bridge Configuration)  │
                    │   • js/portfolio-data.js (Resilient Fallback)│
                    └──────────────────────┬───────────────────────┘
                                           │
                        REST API Requests  │  (Fallback to bundled
                         & Bearer Tokens   │   cache if offline)
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │              Render / Railway                │
                    │         (Node.js REST API Backend)           │
                    │   • server/server.js (Express CRUD API)      │
                    │   • server/data/portfolio.json (JSON DB)     │
                    │   • server/uploads/ (Client Logos & Assets)  │
                    └──────────────────────────────────────────────┘
```

- **Live Website (`index.html`)**: Automatically fetches published clients from the backend API. If the backend is waking up or offline, it seamlessly falls back to `js/portfolio-data.js`—zero blank screens, zero broken images.
- **Admin Panel (`admin.html`)**: Protected portal for managing clients, editing project descriptions, toggling publish status, reordering showcase items, and uploading brand logos.
- **Enquiry Handling**: 100% direct to Founder Shashank Pawar's WhatsApp (`+91 8830464841`) with custom prefilled messages tailored to each client project.

---

## 2. Deploying the Backend API (Render.com)

Render provides free hosting for Node.js web services.

### Step 1: Create a Web Service on Render
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `cloudtechnologies`.

### Step 2: Configure Service Settings
- **Name**: `cloudtechnologies-api`
- **Region**: Singapore or Frankfurt (closest to India / target audience)
- **Branch**: `main`
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Instance Type**: `Free`

### Step 3: Configure Environment Variables
In the Render dashboard under **Environment Variables**, add:

| Key | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `10000` | Port assigned by Render |
| `ADMIN_USERNAME` | `cloud` | Admin login username |
| `ADMIN_PASSWORD` | `Cloud@2005` | Admin login password |
| `ADMIN_TOKEN_SECRET` | `cloudtech_auth_token_secret_2026` | Token authentication key |
| `ALLOWED_ORIGIN` | `*` | Or specify your GitHub Pages URL |

### Step 4: Deploy & Copy Service URL
Click **Create Web Service**. Once deployed, Render will provide your public API URL:
`https://cloudtechnologies-api.onrender.com`

---

## 3. Connecting GitHub Pages to Deployed Backend

Open `js/config.js` in your repository and set the `PRODUCTION_API_URL`:

```javascript
// js/config.js
(function() {
  const isLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' || 
                  window.location.protocol === 'file:';

  // Set your deployed Render URL here:
  const PRODUCTION_API_URL = window.CLOUD_API_OVERRIDE || 'https://cloudtechnologies-api.onrender.com';

  window.CLOUD_CONFIG = {
    apiUrl: isLocal ? 'http://localhost:5000' : PRODUCTION_API_URL,
    brand: {
      name: 'Cloud Technologies',
      phone: '+91 8830464841',
      whatsapp: '8830464841',
      email: 'technologiescloud97@gmail.com'
    }
  };
})();
```

Commit and push `js/config.js` to GitHub:
```bash
git add js/config.js
git commit -m "Connect live website to Render API"
git push origin main
```

---

## 4. Local Development & Testing

To test everything locally on your computer:

1. **Start the Backend Server**:
   ```powershell
   cd c:\Users\Admin1\OneDrive\Desktop\cloudtechnologies\server
   node server.js
   ```
   Server starts on `http://localhost:5000`.

2. **Open the Website**:
   Double click `index.html` or serve via live-server.
   - Portfolio cards load dynamically from `http://localhost:5000/api/portfolio`.
   - Client carousel scrolls smoothly every 1.5 seconds.
   - Industry filters dynamically sort projects.

3. **Open the Admin Panel**:
   Open `admin.html` in your browser.
   - **Username**: `cloud`
   - **Password**: `Cloud@2005`
   - Click `+ Add New Client` to create a project or edit existing clients.
   - Any updates reflect immediately on `index.html` upon refresh!

---

## 5. API Endpoints Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System status and database records count |
| `GET` | `/api/portfolio` | Public | Returns all `published` client projects |
| `POST` | `/api/admin/login` | Public | Authenticates credentials and returns Bearer token |
| `GET` | `/api/admin/portfolio` | Protected | Returns all projects (published + draft) |
| `POST` | `/api/admin/portfolio` | Protected | Creates a new client project record |
| `PUT` | `/api/admin/portfolio/:id` | Protected | Updates existing client project |
| `PATCH` | `/api/admin/portfolio/:id/status` | Protected | Quick-toggle status (`published` / `draft`) |
| `DELETE` | `/api/admin/portfolio/:id` | Protected | Permanently deletes a client record |
| `POST` | `/api/admin/upload` | Protected | Multi-part image upload (PNG, JPG, WebP, SVG < 5MB) |

---

## 6. Security & Best Practices

1. **Authentication Token**: The admin session uses a cryptographically signed Bearer token verified on every protected API call.
2. **File Upload Sanitization**: Multer validates MIME types and rejects files exceeding 5MB or non-image payloads.
3. **Atomic Persistence**: `portfolio.json` writes use safe temporary file replacement to prevent data corruption during power interruptions or concurrent edits.
4. **Resilient Offline Cache**: If the Render backend is cold-starting, `index.html` renders verified clients seamlessly without displaying errors to prospective clients.
