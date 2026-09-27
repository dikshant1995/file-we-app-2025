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

// Global Error Boundary to prevent white blank screen on any runtime exception
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Laxmi Credit Caught Error:', error, errorInfo);
  }
  handleReset = () => {
    try {
      window.location.hash = '';
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b1120',
          color: '#f8fafc',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '24px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#F58220', fontSize: '1.8rem', marginBottom: '8px' }}>Laxmi Credit Console</h2>
          <p style={{ color: '#94a3b8', maxWidth: '480px', marginBottom: '24px', lineHeight: '1.5' }}>
            System detected a temporary display discrepancy. Click below to refresh the console smoothly.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '10px 24px',
              backgroundColor: '#F58220',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            Reload Console
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          {isAdminDomain ? <AdminPortalApp /> : <CustomerFacingApp />}
        </BrowserRouter>
      </HelmetProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>,
)