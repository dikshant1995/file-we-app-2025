import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  MessageCircle,
  Archive,
  Lock,
  ChevronRight,
  Layers,
  History,
  TrendingUp,
  BarChart3,
  Zap,
  Target,
  ArrowLeftRight,
  ShieldCheck,
  Clock,
  Briefcase,
  UserCheck,
  FileSignature,
  Percent
} from 'lucide-react';
import BankList from './admin/BankList';
import LeadManager from './admin/LeadManager';
import BlogManager from './admin/BlogManager';
import ExperienceManager from './admin/ExperienceManager';
import BankConfigEditor from './admin/BankConfigEditor';
import Analytics from './admin/Analytics';
import ImportExport from './admin/ImportExport';
import AuditLog from './admin/AuditLog';
import AdminLogin from './admin/AdminLogin';
import './AdminDashboard.css';

const AdminDashboard = ({ onBackToCustomer }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin_authenticated') === 'true';
  });
  const [activeTab, setActiveTab] = useState('leads');

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('admin_authenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
  };

  const menuItems = [
    { id: 'leads', icon: <Users size={18} />, label: 'Customer Lead Pipeline', component: 'LeadManager' },
    { id: 'blogs', icon: <FileText size={18} />, label: 'Financial Hub (Blogs)', component: 'BlogManager' },
    { id: 'feedback', icon: <MessageCircle size={18} />, label: 'Experience Pulses', component: 'ExperienceManager' },
    { id: 'banks', icon: <Database size={18} />, label: 'Institutional Overview', component: 'BankList' },
    { id: 'config', icon: <Settings size={18} />, label: 'Policy Configuration', component: 'BankConfigEditor' },
    { id: 'categories', icon: <Layers size={18} />, label: 'Categorization Models', component: 'BankConfigEditor', section: 'categories' },
    { id: 'interest', icon: <Percent size={18} />, label: 'Rate Structures', component: 'BankConfigEditor', section: 'interest' },
    { id: 'loan-capping', icon: <Lock size={18} />, label: 'Capital Capping', component: 'BankConfigEditor', section: 'loanCapping' },
    { id: 'age-rules', icon: <UserCheck size={18} />, label: 'Demographic Rules', component: 'BankConfigEditor', section: 'ageRules' },
    { id: 'tenure', icon: <Clock size={18} />, label: 'Tenure Optimization', component: 'BankConfigEditor', section: 'tenureRules' },
    { id: 'foir', icon: <Target size={18} />, label: 'FOIR Parameters', component: 'BankConfigEditor', section: 'foir' },
    { id: 'multiplier', icon: <Zap size={18} />, label: 'Multiplier Logic', component: 'BankConfigEditor', section: 'multiplier' },
    { id: 'bt', icon: <ArrowLeftRight size={18} />, label: 'Liability Consolidation', component: 'BankConfigEditor', section: 'bt' },
    { id: 'credit-score', icon: <ShieldCheck size={18} />, label: 'Risk Assessment', component: 'BankConfigEditor', section: 'creditScore' },
    { id: 'employment', icon: <Briefcase size={18} />, label: 'Employment Credentialing', component: 'BankConfigEditor', section: 'employment' },
    { id: 'documents', icon: <FileSignature size={18} />, label: 'Documentation Protocol', component: 'BankConfigEditor', section: 'documents' },
    { id: 'special', icon: <FileText size={18} />, label: 'Exceptional Policies', component: 'BankConfigEditor', section: 'special' },
    { id: 'fees', icon: <Percent size={18} />, label: 'Fee Schedules', component: 'BankConfigEditor', section: 'fees' },
    { id: 'analytics', icon: <BarChart3 size={18} />, label: 'Performance Analytics', component: 'Analytics' },
    { id: 'import-export', icon: <ArrowLeftRight size={18} />, label: 'Data Operations', component: 'ImportExport' },
    { id: 'audit', icon: <History size={18} />, label: 'System Audit Log', component: 'AuditLog' }
  ];

  const [selectedBank, setSelectedBank] = useState(null);
  const [activeLocation, setActiveLocation] = useState({ state: '', city: '' });

  const renderView = () => {
    const activeItem = menuItems.find(item => item.id === activeTab);

    switch (activeItem?.component) {
      case 'LeadManager':
        return <LeadManager />;
      case 'BlogManager':
        return <BlogManager />;
      case 'ExperienceManager':
        return <ExperienceManager />;
      case 'BankList':
        return <BankList
          activeLocation={activeLocation}
          onSelectBank={(bank) => {
            setSelectedBank(bank);
            setActiveTab('config');
          }}
        />;
      case 'BankConfigEditor':
        return <BankConfigEditor
          selectedBank={selectedBank}
          section={activeItem.section}
          activeLocation={activeLocation}
          onNavigate={(id) => setActiveTab(id)}
        />;
      case 'Analytics':
        return <Analytics />;
      case 'ImportExport':
        return <ImportExport />;
      case 'AuditLog':
        return <AuditLog />;
      default:
        return <LeadManager />;
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

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
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>TERMINATE SESSION</span>
          </button>
          <button
            className="btn-logout"
            onClick={onBackToCustomer}
            style={{ marginTop: '8px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <ArrowLeftRight size={16} />
            <span>EXIT TO PORTAL</span>
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
