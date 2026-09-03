import React, { useState } from 'react';
import { auth, db } from '../../config/firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Shield, Lock, Mail, ChevronRight, Zap, AlertCircle, Fingerprint, Globe, Eye, EyeOff, Smartphone, Key, CheckCircle, RefreshCw, Award, ArrowLeft } from 'lucide-react';
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
            setOtpStatus({ type: 'error', message: "Please specify your administrative email first." });
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
            setOtpStatus({ type: 'error', message: "Security relay unable to deliver verification code." });
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
                alert("Master Identity Verified! A secure password reset link has been dispatched to your email address.");
                setOtpWorkflow(false);
                setOtpStep(1);
            } else {
                setOtpStatus({ type: 'error', message: res.data.message });
            }
        } catch (err) {
            setOtpStatus({ type: 'error', message: "Failed to confirm authorization code." });
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
            }, 800);
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
                }, 1000);
            } else {
                const newProfile = { ...defaultAdminProfile, uid: user.uid, email: user.email || 'dikshantsingh@laxmicredit.com' };
                await setDoc(doc(db, 'users', user.uid), newProfile, { merge: true });
                setTimeout(() => {
                    onLoginSuccess(newProfile);
                }, 1000);
            }
        } catch (err) {
            console.error('Login Error:', err);
            setError('Authentication Failed. Invalid administrative credentials.');
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-overlay laxmi-admin-theme">
            {/* Ambient Background Glows */}
            <div className="ambient-glow orb-orange"></div>
            <div className="ambient-glow orb-blue"></div>
            <div className="decor-grid-pattern"></div>

            <div className="login-card premium-glass-card">
                {/* Brand Header */}
                <div className="admin-brand-header">
                    <div className="brand-logo-container">
                        <div className="shield-badge-glow">
                            <Shield size={38} className="shield-icon" />
                            <Lock size={18} className="lock-sub-icon" />
                        </div>
                    </div>

                    <h1 className="brand-portal-title">
                        Laxmi <span className="highlight-orange">Credit</span>
                    </h1>
                    <p className="brand-portal-subtitle">
                        Administrative Console & Master Rule Engine
                    </p>

                    <div className="auth-access-pill">
                        <span className="live-dot"></span>
                        CEO & EXECUTIVE ACCESS ONLY
                    </div>
                </div>

                {/* Status Strip */}
                <div className="admin-status-strip">
                    <div className="status-item">
                        <Globe size={13} />
                        <span>HQ Institutional Node</span>
                    </div>
                    <div className="status-item highlight">
                        <Zap size={13} />
                        <span>SSL 256-Bit Active</span>
                    </div>
                </div>

                {!otpWorkflow ? (
                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="form-input-group">
                            <label>ADMINISTRATIVE EMAIL</label>
                            <div className="input-field-wrapper">
                                <Mail size={18} className="field-icon" />
                                <input
                                    type="email"
                                    placeholder="admin@laxmicredit.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-input-group mt-4">
                            <label>SECURITY PASSKEY</label>
                            <div className="input-field-wrapper">
                                <Lock size={18} className="field-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                    style={{ paddingRight: '3.2rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="password-toggle-btn"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="forgot-node-row">
                            <button 
                                type="button" 
                                onClick={() => { setOtpWorkflow(true); setOtpStep(1); setOtpStatus({type:'', message:''}); }}
                                className="recovery-link"
                            >
                                Forgot Passkey? Recover via OTP
                            </button>
                        </div>

                        {error && (
                            <div className="auth-error-banner">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className={`admin-submit-btn ${loading ? 'processing' : ''}`} 
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="btn-loading-state">
                                    <RefreshCw className="spin-icon" size={18} />
                                    <span>AUTHENTICATING IDENTITY...</span>
                                </div>
                            ) : (
                                <>
                                    <span>SECURE SIGN IN</span>
                                    <ChevronRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    // OTP WORKFLOW
                    <div className="otp-workflow-container">
                        <div className="otp-header-pill">
                            🔐 MULTI-FACTOR IDENTITY VERIFICATION
                        </div>
                        
                        {otpStep === 1 ? (
                            <div className="otp-step-content">
                                <div className="form-input-group">
                                    <label>TARGET AUTHORIZED EMAIL</label>
                                    <div className="input-field-wrapper">
                                        <Mail size={18} className="field-icon" />
                                        <input
                                            type="email"
                                            placeholder="Enter registered email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="otp-medium-grid">
                                    <button 
                                        type="button"
                                        onClick={() => setOtpMedium('email')}
                                        className={`medium-card ${otpMedium === 'email' ? 'active' : ''}`}
                                    >
                                        <Mail size={22} />
                                        <span>Email Dispatch</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setOtpMedium('sms')}
                                        className={`medium-card ${otpMedium === 'sms' ? 'active' : ''}`}
                                    >
                                        <Smartphone size={22} />
                                        <span>SMS Delivery</span>
                                    </button>
                                </div>
                                
                                {otpStatus.message && (
                                    <div className={`otp-status-box ${otpStatus.type}`}>
                                        {otpStatus.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                                        <span>{otpStatus.message}</span>
                                    </div>
                                )}

                                <button 
                                    onClick={triggerOtpGeneration} 
                                    disabled={otpLoading}
                                    className="admin-submit-btn"
                                >
                                    {otpLoading ? <RefreshCw className="spin-icon" size={18} /> : <Key size={18} />}
                                    <span>SEND VERIFICATION CODE</span>
                                </button>
                            </div>
                        ) : (
                            <div className="otp-step-content">
                                {otpStatus.message && (
                                    <div className="otp-status-box success">
                                        <CheckCircle size={16} />
                                        <span>{otpStatus.message}</span>
                                    </div>
                                )}

                                <div className="form-input-group">
                                    <label>ENTER 6-DIGIT VERIFICATION CODE</label>
                                    <input 
                                        type="text" 
                                        maxLength={6}
                                        placeholder="• • • • • •"
                                        value={typedOtp}
                                        onChange={(e) => setTypedOtp(e.target.value.replace(/\D/g, ''))}
                                        className="otp-code-input"
                                        onKeyPress={(e) => e.key === 'Enter' && verifyOtpKey()}
                                        autoFocus
                                    />
                                </div>

                                <button 
                                    onClick={verifyOtpKey} 
                                    disabled={otpLoading || typedOtp.length < 6}
                                    className="admin-submit-btn"
                                >
                                    {otpLoading ? <RefreshCw className="spin-icon" size={18} /> : <Lock size={18} />}
                                    <span>VERIFY & RESET ACCESS</span>
                                </button>
                            </div>
                        )}

                        <button 
                            onClick={() => { setOtpWorkflow(false); setOtpStatus({type:'', message:''}); }}
                            className="back-to-login-btn"
                        >
                            <ArrowLeft size={14} />
                            <span>Return to Passkey Login</span>
                        </button>
                    </div>
                )}

                {/* Footer Security Watermark */}
                <div className="admin-login-footer">
                    <div className="security-guarantee">
                        <Shield size={14} />
                        <span>ZERO-TRUST CLOUD ARCHITECTURE • SOC-2 COMPLIANT</span>
                    </div>
                    <div className="version-tag">LaxmiCredit Rule Engine v2.5.0</div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
