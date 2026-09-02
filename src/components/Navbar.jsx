import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Lock } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onAdminClick }) => {
    return (
        <nav className="main-navbar">
            <div className="nav-container">
                <div className="nav-left">
                    <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
                        <span style={{ fontSize: '1.75rem', fontFamily: "'Montserrat', sans-serif", letterSpacing: '-0.8px', display: 'inline-flex', alignItems: 'center' }}>
                            <span style={{ color: '#F58220', fontWeight: 900, fontStyle: 'italic' }}>Laxmi</span>
                            <span style={{ color: '#1E40AF', fontWeight: 800, fontStyle: 'italic', marginLeft: '4px' }}>credit</span>
                        </span>
                    </Link>
                </div>
                <div className="nav-right">
                    <button className="nav-admin-btn" onClick={onAdminClick}>
                        <Lock size={14} />
                        <span>ADMIN</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
