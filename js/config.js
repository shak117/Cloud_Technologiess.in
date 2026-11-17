// Cloud Technologies - Client API Configuration
// This enables automatic switching between local development, deployed Render API, and GitHub Pages.

(function() {
  const isLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' || 
                  window.location.protocol === 'file:';

  // Configurable backend URL. On production, update this or set window.CLOUD_API_OVERRIDE
  const PRODUCTION_API_URL = window.CLOUD_API_OVERRIDE || '';

  window.CLOUD_CONFIG = {
    // When local, use local backend on port 5000; when deployed, use configured production URL or same-origin
    apiUrl: isLocal ? 'http://localhost:5000' : (PRODUCTION_API_URL || ''),
    brand: {
      name: 'Cloud Technologies',
      tagline: 'Building Digital Solutions That Help Businesses Grow',
      phone: '+91 8830464841',
      whatsapp: '8830464841',
      email: 'technologiescloud97@gmail.com',
      location: 'Satara, Maharashtra | Serving Businesses Across India'
    }
  };
})();
