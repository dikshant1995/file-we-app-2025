import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onAdminClick, onHomeClick }) => {
    const location = useLocation();

    const handleHomeClick = (e) => {
        // If we're already on the home page route, trigger the reset logic
        if (location.pathname === '/' && onHomeClick) {
            e.preventDefault();
            onHomeClick();
        }
    };

    return (
        <nav className="main-navbar">
            <div className="nav-container">
                <Link to="/" className="nav-brand" onClick={handleHomeClick}>
                    <span className="text-glow">LoanAI</span>
                    <span className="ai-badge">v2.0</span>
                </Link>
                <div className="nav-links">
                    <Link
                        to="/"
                        className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
                        onClick={handleHomeClick}
                    >
                        Calculator
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
