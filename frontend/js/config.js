/**
 * Lions Engineering - Deployment Configuration
 * Backend Live URL: https://lion-engi.onrender.com
 */
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Automatically uses live Render backend on Vercel/production, or '/api' on localhost
window.API_BASE = isLocal ? '/api' : 'https://lion-engi.onrender.com/api';
