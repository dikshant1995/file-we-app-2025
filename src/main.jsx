import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import CustomerFacingApp from './CustomerFacingApp.jsx'
import AdminPortalApp from './AdminPortalApp.jsx'
import './index.css'

// Domain Detection:
// 1. Production Admin Domain: laxmicredit.in (or admin.laxmicredit.in)
// 2. Query param for local testing: ?mode=admin
// 3. Environment override: VITE_APP_MODE === 'admin'
const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
const pathname = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

const isAdminDomain = 
  hostname.includes('laxmicredit.in') || 
  urlParams?.get('mode') === 'admin' ||
  pathname.startsWith('/admin') ||
  pathname.startsWith('/dashboard') ||
  import.meta.env.VITE_APP_MODE === 'admin';

// Enforce website icon (favicon) dynamically across both .in and .com
if (typeof document !== 'undefined') {
  let link = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  link.type = 'image/png';
  link.href = '/favicon.png';

  // Set appropriate page title for .in (admin) vs .com (consumer)
  if (isAdminDomain) {
    document.title = 'Laxmi Credit Core Admin - Enterprise Console';
  } else {
    document.title = 'Laxmi Credit - Intelligent Lending Platform';
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        {isAdminDomain ? <AdminPortalApp /> : <CustomerFacingApp />}
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)