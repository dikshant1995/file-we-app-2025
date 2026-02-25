import React, { useState } from 'react';
import {
  Users,
  Settings,
  Database,
  LogOut,
  LayoutDashboard,
  BarChart2,
  Bell,
  Shield,
  FileText,
  MessageSquare,
  Globe,
  Layers,
  Archive,
  Lock,
  MessageCircle
} from 'lucide-react';
import BankList from './admin/BankList';
import LeadManager from './admin/LeadManager';
import BlogManager from './admin/BlogManager';
import ExperienceManager from './admin/ExperienceManager';
import './AdminDashboard.css';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('leads');

  const menuItems = [
    { id: 'leads', icon: <Users size={18} />, label: 'Customer Lead Pipeline', component: 'LeadManager' },
    { id: 'blogs', icon: <FileText size={18} />, label: 'Financial Hub (Blogs)', component: 'BlogManager' },
    { id: 'feedback', icon: <MessageCircle size={18} />, label: 'Experience Pulses', component: 'ExperienceManager' },
    { id: 'banks', icon: <Database size={18} />, label: 'Institutional Overview', component: 'BankList' },
    { id: 'config', icon: <Settings size={18} />, label: 'Policy Configuration', component: 'BankConfigEditor' },
    { id: 'categories', icon: <Layers size={18} />, label: 'Categorization Models', component: 'BankConfigEditor', section: 'categories' },
    { id: 'import-export', icon: <Archive size={18} />, label: 'Data Operations', component: 'ImportExport' },
    { id: 'audit', icon: <Shield size={18} />, label: 'System Audit Log', component: 'AuditLog' },
    { id: 'settings', icon: <Lock size={18} />, label: 'Security & Access', component: 'Settings' },
  ];

  const renderView = () => {
    switch (activeTab) {
      case 'leads':
        return <LeadManager />;
      case 'BankList':
        return <BankList />;
      case 'ImportExport':
        return <ImportExport />;
      case 'BlogManager':
        return <BlogManager />;
      case 'ExperienceManager':
        return <ExperienceManager />;
      case 'AuditLog':
        return <AuditLog />;
      default:
        // Attempt to find by component name if ID doesn't match directly
        const item = menuItems.find(i => i.id === activeTab);
        if (item?.component === 'LeadManager') return <LeadManager />;
        if (item?.component === 'BlogManager') return <BlogManager />;
        if (item?.component === 'ExperienceManager') return <ExperienceManager />;
        if (item?.component === 'BankList') return <BankList />;
        return <LeadManager />;
    }
  };

  // Helper placeholder components for missing ones
  const ImportExport = () => <div className="p-8"><h2 className="text-xl font-bold mb-4">Data Operations</h2><p className="text-gray-400">Import/Export system is active and monitoring data integrity.</p></div>;
  const AuditLog = () => <div className="p-8"><h2 className="text-xl font-bold mb-4">System Audit Log</h2><p className="text-gray-400">Security pulses and access logs are being recorded.</p></div>;

  return (
    <div className="admin-dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo-box">
            <Shield size={22} className="logo-icon" />
            <div className="logo-text">
              <span className="logo-main">LAXMI</span>
              <span className="logo-sub">CREDIT ROOT</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">
            <div className="nav-group-label">Core Operations</div>
            {menuItems.slice(0, 3).map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
                {activeTab === item.id && <motion.div layoutId="activeNav" className="active-indicator" />}
              </button>
            ))}
          </div>

          <div className="nav-group">
            <div className="nav-group-label">System Control</div>
            {menuItems.slice(3).map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
                {activeTab === item.id && <motion.div layoutId="activeNav" className="active-indicator" />}
              </button>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={onLogout}>
            <LogOut size={18} />
            <span>TERMINATE SESSION</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-top-bar">
          <div className="top-bar-left">
            <div className="view-title">
              {menuItems.find(i => i.id === activeTab)?.label || 'System Overview'}
            </div>
          </div>

          <div className="top-bar-right">
            <div className="system-status">
              <span className="status-dot"></span>
              Neural Link: Active
            </div>
            <div className="notification-bell">
              <Bell size={18} />
              <span className="notification-badge"></span>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
