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
                        <span style={{ fontSize: '1.65rem', fontWeight: 900, fontStyle: 'italic', fontFamily: "'Montserrat', sans-serif", color: '#06064D', letterSpacing: '-0.8px' }}>
                            LAXMI <span style={{ color: '#F58220', fontWeight: 900, fontStyle: 'italic' }}>CREDIT</span>
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
