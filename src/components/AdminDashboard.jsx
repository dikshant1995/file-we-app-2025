import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import LeadManager from './admin/LeadManager.jsx';
import UnifiedBankPolicyManager from './admin/UnifiedBankPolicyManager.jsx';
import AdminLogin from './admin/AdminLogin.jsx';
import { auth, db } from '../config/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Users, Building2 } from 'lucide-react';

const AdminDashboard = ({ onBackToCustomer, initialUser }) => {
  // Only 2 Main Features: 'leads' and 'bank-policy'
  const [activeMenu, setActiveMenu] = useState('leads');
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
      {/* Executive Header */}
      <header className="dashboard-header executive-header">
        <div className="header-content">
          <div className="header-left">
            <div 
              className="admin-brand-logo" 
              onClick={onBackToCustomer} 
              title="Return to LaxmiCredit Home Page"
            >
              <span className="brand-laxmi">Laxmi</span><span className="brand-credit">Credit</span>
              <span className="brand-portal-tag">Admin Console</span>
            </div>
          </div>

          <div className="header-right">
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

      {/* Main Container with Sidebar and Content */}
      <div className="dashboard-container">
        <aside className="dashboard-sidebar executive-sidebar">
          <div className="sidebar-scrollable">
            <div className="sidebar-group-label">PRIMARY MODULES</div>
            <nav className="sidebar-menu">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
                  onClick={() => setActiveMenu(item.id)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="content-area">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
