import React, { useState } from 'react';
import { auth, db } from '../../config/firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Shield, Lock, Mail, ChevronRight, Zap, AlertCircle, Fingerprint, Cpu, Globe } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                // Simulation of neural handshake
                setTimeout(() => {
                    onLoginSuccess(userData);
                }, 1500);
            } else {
                setError('Neural Identification Error: identity_not_found');
                setLoading(false);
            }
        } catch (err) {
            console.error('Login Error:', err);
            setError('Biometric Verification Failed. Access Revoked.');
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-overlay neural-background">
            <div className="login-card glass-panel cyber-border">
                <div className="neural-header">
                    <div className="neural-logo">
                        <Cpu size={40} className="cpu-pulse" color="#00d4ff" />
                        <Fingerprint size={28} className="fingerprint-overlay" color="#00ff88" />
                    </div>
                    <h1>LAXMI NEURAL GATEWAY</h1>
                    <div className="access-level-badge">CEO / MASTER ACCESS</div>
                </div>

                <div className="login-context-info">
                    <div className="ctx-item">
                        <Globe size={12} />
                        <span>Node: IN-WEST-1</span>
                    </div>
                    <div className="ctx-item">
                        <Zap size={12} fill="#00ff88" stroke="none" />
                        <span>Latency: 24ms</span>
                    </div>
                </div>

                <form className="login-form mt-6" onSubmit={handleLogin}>
                    <div className="neural-input-wrapper">
                        <label>IDENTITY EMAIL</label>
                        <div className="input-with-icon">
                            <Mail size={16} />
                            <input
                                type="email"
                                placeholder="ceo@laxmicredit.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="neural-input-wrapper mt-4">
                        <label>NEURAL ACCESS KEY</label>
                        <div className="input-with-icon">
                            <Lock size={16} />
                            <input
                                type="password"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="neural-alert mt-4">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button type="submit" className={`neural-login-btn ${loading ? 'processing' : ''}`} disabled={loading}>
                        {loading ? (
                            <div className="processing-content">
                                <span className="small-pulse" />
                                <span>SYNCHRONIZING NEURAL MESH...</span>
                            </div>
                        ) : (
                            <>
                                <span>ESTABLISH UPLINK</span>
                                <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer-branding">
                    <div className="security-tag">
                        <Shield size={12} />
                        RSA-4096 NEURAL ENCRYPTION ACTIVE
                    </div>
                    <div className="system-version">OS: NeuralCore v2.4.0</div>
                </div>
            </div>

            <div className="background-decor-elements">
                <div className="decor-line top"></div>
                <div className="decor-line bottom"></div>
                <div className="decor-grid"></div>
            </div>
        </div>
    );
};

export default AdminLogin;
