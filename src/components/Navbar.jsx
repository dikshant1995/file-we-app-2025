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
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
