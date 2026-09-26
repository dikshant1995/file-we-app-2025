import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard.jsx';
import AdminLogin from './components/admin/AdminLogin.jsx';
import { auth, db } from './config/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ShieldCheck, LogOut, ExternalLink, Lock } from 'lucide-react';
import './AdminPortalApp.css';

/**
 * Dedicated Admin Portal Application
 * Exclusively served on laxmicredit.in (and ?mode=admin)
 */
export default function AdminPortalApp() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('laxmi_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser(data);
            localStorage.setItem('laxmi_admin_user', JSON.stringify(data));
          } else {
            const basicUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'Administrator',
              role: 'admin'
            };
            setUser(basicUser);
            localStorage.setItem('laxmi_admin_user', JSON.stringify(basicUser));
          }
        }
      } catch (err) {
        console.error('Admin Auth Listener Error:', err);
      } finally {
        setLoading(false);
      }
    });

    // Fallback if auth takes more than 1s to resolve
    const timer = setTimeout(() => setLoading(false), 1200);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleLoginSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    try {
      localStorage.setItem('laxmi_admin_user', JSON.stringify(authenticatedUser));
    } catch (e) {}
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('laxmi_admin_user');
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading && !user) {
    return (
      <div className="admin-portal-loader-screen">
        <div className="admin-portal-spinner"></div>
        <p>Connecting to Laxmi Credit Secure Core...</p>
      </div>
    );
  }

  // If not logged in, show sleek dedicated login screen
  if (!user) {
    return (
      <div className="admin-portal-login-wrapper">
        <div className="admin-portal-login-topbar">
          <div className="admin-portal-brand">
            <span className="brand-orange">Laxmi</span>
            <span className="brand-blue">Credit</span>
            <span className="brand-domain-badge">Enterprise Console</span>
          </div>
          <a 
            href="https://laxmicredit.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="admin-portal-consumer-link"
          >
            <span>Visit Customer Website</span>
            <ExternalLink size={14} />
          </a>
        </div>

        <AdminLogin 
          onLoginSuccess={handleLoginSuccess}
          onBack={null} // No customer fallback inside admin domain
        />
      </div>
    );
  }

  // Once authenticated, render complete Admin Dashboard
  return (
    <div className="admin-portal-container">
      {/* Top Bar with Security Badge, Domain indicator, and Logout */}
      <div className="admin-portal-system-banner">
        <div className="system-banner-left">
          <ShieldCheck size={16} style={{ color: '#10b981' }} />
          <span className="system-badge">Laxmi Credit Core Admin</span>
          <span className="system-domain-pill">laxmicredit.in</span>
          <span className="system-status-indicator">
            <span className="pulse-dot"></span>
            Cloud Firestore Connected
          </span>
        </div>

        <div className="system-banner-right">
          <a 
            href="https://laxmicredit.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="banner-customer-link"
            title="Open customer website in new tab"
          >
            <span>Customer Website (laxmicredit.com)</span>
            <ExternalLink size={12} />
          </a>
          <button 
            onClick={handleLogout}
            className="system-logout-btn"
            title="Sign out of Admin Console"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <AdminDashboard 
        initialUser={user} 
        onBackToCustomer={handleLogout} 
      />
    </div>
  );
}
