import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import LeadManager from './admin/LeadManager.jsx';
import UnifiedBankPolicyManager from './admin/UnifiedBankPolicyManager.jsx';
import AdminLogin from './admin/AdminLogin.jsx';
import ChangePasswordModal from './admin/ChangePasswordModal.jsx';
import { auth, db } from '../config/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Users, Building2, KeyRound } from 'lucide-react';
import laxmiLogo from '../assets/laxmi-logo.png';

const AdminDashboard = ({ onBackToCustomer, initialUser }) => {
  // Only 2 Main Features: 'leads' and 'bank-policy'
  const [activeMenu, setActiveMenu] = useState('leads');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [user, setUser] = useState(() => {
    if (initialUser) return initialUser;
    try {
      const stored = localStorage.getItem('laxmi_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Sync activeMenu with browser history & URL hash so browser Back/Forward (<- / ->) buttons seamlessly switch tabs
  const handleTabChange = (tabId, pushHistory = true) => {
    if (tabId === activeMenu) return;
    setActiveMenu(tabId);
    if (pushHistory) {
      window.history.pushState({ tab: tabId }, '', `#${tabId}`);
    }
  };

  // Browser Native Back/Forward Button handler (popstate)
  useEffect(() => {
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash.startsWith('bank-policy')) {
      setActiveMenu('bank-policy');
    } else if (initialHash === 'leads') {
      setActiveMenu('leads');
    } else {
      window.history.replaceState({ tab: 'leads' }, '', '#leads');
    }

    const handlePopState = (event) => {
      if (event.state && event.state.tab) {
        setActiveMenu(event.state.tab);
      } else {
        const hash = window.location.hash.replace('#', '');
        if (hash.startsWith('bank-policy')) {
          setActiveMenu('bank-policy');
        } else {
          setActiveMenu('leads');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser(data);
            try {
              localStorage.setItem('laxmi_admin_user', JSON.stringify(data));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.error("Auth Loading Error:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('laxmi_admin_user');
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Logout Error:', err);
    }
    if (onBackToCustomer) {
      onBackToCustomer();
    }
  };

  // Only 2 Main Features as requested: Lead Management and Bank Policy (View & Edit)
  const menuItems = [
    { 
      id: 'leads', 
      icon: <Users size={18} stroke="#60a5fa" />, 
      label: 'Lead Management' 
    },
    { 
      id: 'bank-policy', 
      icon: <Building2 size={18} stroke="#F58220" />, 
      label: 'Bank Policy (View & Edit)' 
    }
  ];

  const renderContent = () => {
    if (activeMenu === 'leads') {
      return <LeadManager userRole={user?.role || 'admin'} />;
    }
    if (activeMenu === 'bank-policy') {
      return <UnifiedBankPolicyManager />;
    }
    return <LeadManager userRole={user?.role || 'admin'} />;
  };

  if (loading) return <div className="neural-loading">Loading Admin Console...</div>;
  if (!user) return <AdminLogin onLoginSuccess={(u) => setUser(u)} onBack={onBackToCustomer} />;

  return (
    <div className="admin-dashboard professional-grid-bg">
      {/* Executive Header with Top Navigation Buttons */}
      <header className="dashboard-header executive-header">
        <div className="header-content">
          <div className="header-left">
            <div 
              className="admin-brand-logo" 
              onClick={onBackToCustomer} 
              title="Return to LaxmiCredit Home Page"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <img src={laxmiLogo} alt="Laxmi Credit Icon" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
              <span className="brand-laxmi">Laxmi</span><span className="brand-credit">Credit</span>
              <span className="brand-portal-tag">Admin Console</span>
            </div>
          </div>

          {/* Top Header Navigation Tabs */}
          <nav className="header-nav-buttons">
            {menuItems.map(item => (
              <button
                key={item.id}
                className={`header-nav-btn ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => handleTabChange(item.id)}
              >
                <span className="nav-btn-icon">{item.icon}</span>
                <span className="nav-btn-label">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="header-right">
            <button 
              className="btn-quick-change-password"
              onClick={() => setIsPasswordModalOpen(true)}
              title="Change Administrator Password"
            >
              <KeyRound size={15} />
              <span>Change Password</span>
            </button>
            <div className="presence-metadata">
              <div className="user-entity-badge">
                <div className="entity-icon">👤</div>
                <div className="entity-info">
                  <span className="entity-name">{user.displayName || 'Global Administrator'}</span>
                  <span className={`entity-role ${user.role}`}>{user.role?.toUpperCase() || 'ADMIN'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Full-Width Container */}
      <div className="dashboard-container full-width">
        <main className="dashboard-main full-width">
          <div className="content-area">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Admin Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        user={user} 
      />
    </div>
  );
};

export default AdminDashboard;
