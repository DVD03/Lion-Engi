/**
 * Lions Engineering - Deployment Configuration
 * 
 * BACKEND_API_URL:
 * - If Backend is deployed on Render (e.g. https://lions-engineering-backend.onrender.com)
 *   and Frontend is on Vercel, set your Render backend URL here with '/api' suffix.
 * - If running locally or as a fullstack monolith on Render, leave it as '/api'.
 */
window.API_BASE = window.API_BASE || '/api';
