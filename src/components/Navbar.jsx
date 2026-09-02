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
                        <span 
                            style={{ 
                                fontSize: '1.8rem', 
                                fontWeight: 900, 
                                fontStyle: 'italic', 
                                fontFamily: "'Mulish', 'Plus Jakarta Sans', sans-serif", 
                                letterSpacing: '-0.8px',
                                background: 'linear-gradient(135deg, #F58220 0%, #1E40AF 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                display: 'inline-block'
                            }}
                        >
                            Laxmi credit
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
