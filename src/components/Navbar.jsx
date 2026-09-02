import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="main-navbar">
            <div className="nav-container">
                <div className="nav-left">
                    <Link to="/" className="nav-brand">
                        <Cpu size={26} color="#F58220" />
                        <span style={{ color: '#06064D', fontWeight: 900, fontFamily: 'Montserrat, sans-serif' }}>LAXMI</span>
                        <span style={{ color: '#F58220', fontWeight: 900, fontFamily: 'Montserrat, sans-serif' }}>CREDIT</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
