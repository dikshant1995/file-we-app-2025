import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Lock } from 'lucide-react';
import laxmiLogo from '../assets/laxmi-logo.png';
import './Navbar.css';

const Navbar = ({ onAdminClick }) => {
    return (
        <nav className="main-navbar">
            <div className="nav-container">
                <div className="nav-left">
                    <Link to="/" className="nav-brand" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img 
                            src={laxmiLogo} 
                            alt="Laxmi Credit Icon" 
                            style={{ height: '36px', width: 'auto', objectFit: 'contain' }} 
                        />
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
                    <Link 
                        to="/admin" 
                        className="nav-admin-btn"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#cbd5e1',
                            textDecoration: 'none',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            background: 'rgba(30, 41, 59, 0.7)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Lock size={13} style={{ color: '#f58220' }} />
                        <span>Admin Dashboard</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
