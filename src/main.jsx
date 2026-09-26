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
const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

const isAdminDomain = 
  hostname.includes('laxmicredit.in') || 
  urlParams?.get('mode') === 'admin' ||
  import.meta.env.VITE_APP_MODE === 'admin';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        {isAdminDomain ? <AdminPortalApp /> : <CustomerFacingApp />}
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)