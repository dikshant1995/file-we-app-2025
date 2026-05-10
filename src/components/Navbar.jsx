import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onAdminClick, onHomeClick }) => {
    const location = useLocation();

    const handleHomeClick = (e) => {
        // If we're already on the personal loan route, trigger the reset logic
        if (location.pathname === '/personal-loan' && onHomeClick) {
            e.preventDefault();
            onHomeClick();
        }
    };

    return (
        <nav className="main-navbar">
            <div className="nav-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/" style={{ textDecoration: 'none', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '5px', color: 'white', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '4px 8px' }}>
                        <ArrowLeft size={12} /> Exit
                    </Link>
                    <Link to="/" className="nav-brand">
                        <span className="text-glow">Laxmi Omni</span>
                        <span className="ai-badge">CORE v4</span>
                    </Link>
                </div>
                <div className="nav-links">
                    <Link
                        to="/personal-loan"
                        className={`nav-item ${location.pathname === '/personal-loan' ? 'active' : ''}`}
                        onClick={handleHomeClick}
                    >
                        Personal Loan
                    </Link>
                    <Link to="/blog" className={`nav-item ${location.pathname.startsWith('/blog') ? 'active' : ''}`}>
                        Insights
                    </Link>
                    <button className="nav-admin-btn" onClick={onAdminClick}>
                        <Lock size={13} />
                        <span>ADMIN</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
