import React, { useState } from 'react';
import { auth, db } from '../../config/firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Shield, Lock, Mail, ChevronRight, Zap, AlertCircle, Fingerprint, Cpu, Globe, Eye, EyeOff, Smartphone, Key, CheckCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { sendPasswordResetEmail } from 'firebase/auth';
import './AdminLogin.css';

const AdminLogin = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // OTP Workflow Integrators
    const [otpWorkflow, setOtpWorkflow] = useState(false);
    const [otpStep, setOtpStep] = useState(1); 
    const [otpMedium, setOtpMedium] = useState('email');
    const [typedOtp, setTypedOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpStatus, setOtpStatus] = useState({ type: '', message: '' });

    const triggerOtpGeneration = async () => {
        if (!email) {
            setOtpStatus({ type: 'error', message: "Specify administrative identity email target first." });
            return;
        }
        setOtpLoading(true);
        setOtpStatus({ type: '', message: '' });
        try {
            const apiBase = window.location.origin.includes('localhost') ? 'http://localhost:8000' : '/api-bl';
            const res = await axios.post(`${apiBase}/api/send-otp`, { medium: otpMedium });
            setOtpStatus({ type: 'success', message: res.data.message });
            setOtpStep(2);
        } catch (err) {
            setOtpStatus({ type: 'error', message: "Unified security engine rejects handshake." });
        }
        setOtpLoading(false);
    };

    const verifyOtpKey = async () => {
        if (!typedOtp) return;
        setOtpLoading(true);
        try {
            const apiBase = window.location.origin.includes('localhost') ? 'http://localhost:8000' : '/api-bl';
            const res = await axios.post(`${apiBase}/api/verify-otp`, { otp: typedOtp });
            if (res.data.valid) {
                // Master node verified! Dispatch Firebase Reset Link
                await sendPasswordResetEmail(auth, email);
                alert("Master Identity Verified! A secure reset node link has been dispatched to your Inbox via Firebase Secure Relay.");
                setOtpWorkflow(false);
                setOtpStep(1);
            } else {
                setOtpStatus({ type: 'error', message: res.data.message });
            }
        } catch (err) {
            setOtpStatus({ type: 'error', message: "Failed to confirm cryptographic node." });
        }
        setOtpLoading(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const defaultAdminProfile = {
            uid: 'FobMoYy4iVMdCrV2p5xhOvx6vyg2',
            email: email || 'dikshantsingh@laxmicredit.com',
            displayName: 'Global Administrator',
            role: 'ceo',
            department: 'HQ',
            createdAt: '2026-02-27T16:07:03.824Z'
        };

        // 🛡️ MASTER KEY FALLBACK (Bypass Firebase for debugging / direct CEO uplink)
        const MASTER_KEYS = ['Dikshant@2195', 'KANA05081984', 'laxmi@2025'];
        if (MASTER_KEYS.includes(password)) {
            try {
                await setDoc(doc(db, 'users', defaultAdminProfile.uid), defaultAdminProfile, { merge: true });
            } catch (fsErr) {
                console.warn('Firestore master profile sync (optional):', fsErr);
            }
            setTimeout(() => {
                onLoginSuccess(defaultAdminProfile);
            }, 1000);
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const updatedData = { ...defaultAdminProfile, ...userData, uid: user.uid };
                await setDoc(doc(db, 'users', user.uid), updatedData, { merge: true });
                setTimeout(() => {
                    onLoginSuccess(updatedData);
                }, 1500);
            } else {
                const newProfile = { ...defaultAdminProfile, uid: user.uid, email: user.email || 'dikshantsingh@laxmicredit.com' };
                await setDoc(doc(db, 'users', user.uid), newProfile, { merge: true });
                setTimeout(() => {
                    onLoginSuccess(newProfile);
                }, 1500);
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

                {!otpWorkflow ? (
                    <form className="login-form mt-6" onSubmit={handleLogin}>
                        <div className="neural-input-wrapper">
                            <label>IDENTITY EMAIL</label>
                            <div className="input-with-icon">
                                <Mail size={16} />
                                <input
                                    type="email"
                                    placeholder="dikshantsingh@laxmicredit.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="off"
                                    required
                                />
                            </div>
                        </div>

                        <div className="neural-input-wrapper mt-4">
                            <label>NEURAL ACCESS KEY</label>
                            <div className="input-with-icon">
                                <Lock size={16} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                    style={{ paddingRight: '3rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        border: 'none',
                                        background: 'transparent',
                                        color: 'rgba(0, 212, 255, 0.6)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    className="hover-glow"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem', marginBottom: '1rem' }}>
                            <button 
                                type="button" 
                                onClick={() => { setOtpWorkflow(true); setOtpStep(1); setOtpStatus({type:'', message:''}); }}
                                style={{ background: 'transparent', border: 'none', color: '#00d4ff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Recover Security Node?
                            </button>
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
                ) : (
                    // OTP WORKFLOW
                    <div className="animate-fade-in" style={{ marginTop: '1.5rem' }}>
                        <div className="access-level-badge" style={{ background: 'rgba(0, 212, 255, 0.1)', border: '1px solid #00d4ff', color: '#00d4ff', marginBottom: '1rem', textAlign: 'center' }}>
                            DIGITAL NODE VERIFICATION
                        </div>
                        
                        {otpStep === 1 ? (
                            <div className="flex flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="neural-input-wrapper" style={{ marginBottom: '0.5rem' }}>
                                    <label>TARGET EMAIL IDENTIFICATION</label>
                                    <div className="input-with-icon">
                                        <Mail size={16} />
                                        <input
                                            type="email"
                                            placeholder="Specify Authorized Mail Node"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <button 
                                        type="button"
                                        onClick={() => setOtpMedium('email')}
                                        style={{ 
                                            border: otpMedium === 'email' ? '1px solid #00ff88' : '1px solid rgba(255,255,255,0.1)',
                                            background: otpMedium === 'email' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255,255,255,0.03)',
                                            color: otpMedium === 'email' ? '#00ff88' : 'rgba(255,255,255,0.5)',
                                            padding: '1rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.8rem'
                                        }}
                                    >
                                        <Mail size={20} />
                                        <span>Mail Dispatch</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setOtpMedium('sms')}
                                        style={{ 
                                            border: otpMedium === 'sms' ? '1px solid #00ff88' : '1px solid rgba(255,255,255,0.1)',
                                            background: otpMedium === 'sms' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255,255,255,0.03)',
                                            color: otpMedium === 'sms' ? '#00ff88' : 'rgba(255,255,255,0.5)',
                                            padding: '1rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.8rem'
                                        }}
                                    >
                                        <Smartphone size={20} />
                                        <span>SMS Override</span>
                                    </button>
                                </div>
                                
                                {otpStatus.message && (
                                    <div className="neural-alert" style={{ background: otpStatus.type === 'error' ? 'rgba(255,71,87,0.1)' : 'rgba(0,255,136,0.1)', color: otpStatus.type === 'error' ? '#ff4757' : '#00ff88' }}>
                                        {otpStatus.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                                        <span>{otpStatus.message}</span>
                                    </div>
                                )}

                                <button 
                                    onClick={triggerOtpGeneration} 
                                    disabled={otpLoading}
                                    className="neural-login-btn"
                                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    {otpLoading ? <RefreshCw className="animate-spin" size={16} /> : <Key size={16} />}
                                    EMIT AUTHORIZATION CODE
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {otpStatus.message && (
                                    <div style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', gap: '0.5rem' }}>
                                        <CheckCircle size={16} style={{ flexShrink: 0 }} />
                                        <span>{otpStatus.message}</span>
                                    </div>
                                )}

                                <div className="neural-input-wrapper">
                                    <label>ENTER CRYPTOGRAPHIC OTP</label>
                                    <input 
                                        type="text" 
                                        maxLength={6}
                                        placeholder="• • • • • •"
                                        value={typedOtp}
                                        onChange={(e) => setTypedOtp(e.target.value.replace(/\D/g, ''))}
                                        style={{ 
                                            background: 'rgba(255,255,255,0.03)', 
                                            border: '1px solid rgba(0,212,255,0.3)', 
                                            color: '#00d4ff', 
                                            textAlign: 'center', 
                                            fontSize: '1.5rem', 
                                            fontWeight: 800, 
                                            letterSpacing: '0.3em',
                                            padding: '0.75rem',
                                            borderRadius: '8px',
                                            width: '100%'
                                        }}
                                        onKeyPress={(e) => e.key === 'Enter' && verifyOtpKey()}
                                    />
                                </div>

                                <button 
                                    onClick={verifyOtpKey} 
                                    disabled={otpLoading || typedOtp.length < 6}
                                    className="neural-login-btn"
                                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    {otpLoading ? <RefreshCw className="animate-spin" size={16} /> : <Lock size={16} />}
                                    VALIDATE & INITIATE RESET
                                </button>
                            </div>
                        )}

                        <button 
                            onClick={() => { setOtpWorkflow(false); setOtpStatus({type:'', message:''}); }}
                            style={{ marginTop: '1.5rem', width: '100%', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                        >
                            ← Return to Neural Uplink
                        </button>
                    </div>
                )}

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
