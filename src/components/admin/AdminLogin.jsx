import React, { useState } from 'react';
import { auth, db } from '../../config/firebase.js';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Lock, Mail, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, Loader2, Shield, X } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin = ({ onLoginSuccess, onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Forgot password view state
    const [isForgotView, setIsForgotView] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        const defaultAdminProfile = {
            uid: 'FobMoYy4iVMdCrV2p5xhOvx6vyg2',
            email: email || 'dikshantsingh@laxmicredit.com',
            displayName: 'Global Administrator',
            role: 'ceo',
            department: 'HQ',
            createdAt: '2026-02-27T16:07:03.824Z'
        };

        // 🛡️ MASTER KEY FALLBACK (Direct Admin Login)
        const MASTER_KEYS = ['Dikshant@2195', 'KANA05081984', 'laxmi@2025'];
        if (MASTER_KEYS.includes(password)) {
            try {
                await setDoc(doc(db, 'users', defaultAdminProfile.uid), defaultAdminProfile, { merge: true });
            } catch (fsErr) {
                console.warn('Firestore master profile sync (optional):', fsErr);
            }
            setTimeout(() => {
                onLoginSuccess(defaultAdminProfile);
            }, 600);
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
                }, 800);
            } else {
                const newProfile = { ...defaultAdminProfile, uid: user.uid, email: user.email || email };
                await setDoc(doc(db, 'users', user.uid), newProfile, { merge: true });
                setTimeout(() => {
                    onLoginSuccess(newProfile);
                }, 800);
            }
        } catch (err) {
            console.error('Login Error:', err);
            setError('Invalid email or password. Please try again.');
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (!resetEmail) {
            setError('Please enter your registered email address.');
            return;
        }
        setResetLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setSuccessMessage('Password reset link sent! Check your inbox.');
            setTimeout(() => {
                setIsForgotView(false);
                setSuccessMessage('');
            }, 3000);
        } catch (err) {
            console.error('Reset Error:', err);
            setError('Failed to send reset link. Ensure the email is registered.');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="simple-login-backdrop" onClick={(e) => {
            if (e.target === e.currentTarget && onBack) onBack();
        }}>
            <div className="simple-login-card">
                {/* Header Tab & Close */}
                <div className="simple-login-tabs">
                    <div className="simple-tab active">
                        <Shield size={16} />
                        <span>Admin Login</span>
                    </div>
                    {onBack && (
                        <button
                            type="button"
                            className="simple-modal-close"
                            onClick={onBack}
                            title="Close and return to website"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                <div className="simple-login-body">
                    {/* Brand Header */}
                    <div className="simple-login-brand">
                        <div className="simple-brand-name">
                            Laxmi<span>Credit</span>
                        </div>
                        <p className="simple-brand-subtitle">
                            {isForgotView ? 'Reset your administrator password' : 'Enter your credentials to access the admin portal'}
                        </p>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="simple-login-alert error">
                            <AlertCircle size={15} />
                            <span>{error}</span>
                        </div>
                    )}
                    {successMessage && (
                        <div className="simple-login-alert success">
                            <CheckCircle size={15} />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {!isForgotView ? (
                        <form onSubmit={handleLogin} className="simple-login-form">
                            <div className="simple-form-group">
                                <label htmlFor="admin-email">Email Address</label>
                                <div className="simple-input-box">
                                    <Mail size={16} className="simple-input-icon" />
                                    <input
                                        id="admin-email"
                                        type="email"
                                        placeholder="admin@laxmicredit.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="simple-form-group">
                                <div className="simple-label-row">
                                    <label htmlFor="admin-password">Password</label>
                                    <button
                                        type="button"
                                        className="simple-forgot-link"
                                        onClick={() => {
                                            setIsForgotView(true);
                                            setResetEmail(email);
                                            setError('');
                                            setSuccessMessage('');
                                        }}
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="simple-input-box">
                                    <Lock size={16} className="simple-input-icon" />
                                    <input
                                        id="admin-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="simple-eye-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="simple-remember-row">
                                <label className="simple-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span>Remember me</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="simple-submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="simple-spin" />
                                        <span>Signing In...</span>
                                    </>
                                ) : (
                                    <span>Sign In</span>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handlePasswordReset} className="simple-login-form">
                            <div className="simple-form-group">
                                <label htmlFor="reset-email">Registered Email Address</label>
                                <div className="simple-input-box">
                                    <Mail size={16} className="simple-input-icon" />
                                    <input
                                        id="reset-email"
                                        type="email"
                                        placeholder="admin@laxmicredit.com"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                        disabled={resetLoading}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="simple-submit-btn"
                                disabled={resetLoading}
                            >
                                {resetLoading ? (
                                    <>
                                        <Loader2 size={16} className="simple-spin" />
                                        <span>Sending Reset Link...</span>
                                    </>
                                ) : (
                                    <span>Send Reset Link</span>
                                )}
                            </button>

                            <button
                                type="button"
                                className="simple-secondary-btn"
                                onClick={() => {
                                    setIsForgotView(false);
                                    setError('');
                                    setSuccessMessage('');
                                }}
                            >
                                Back to Login
                            </button>
                        </form>
                    )}

                    {/* Return to website */}
                    {onBack && (
                        <div className="simple-login-footer">
                            <button
                                type="button"
                                className="simple-back-link"
                                onClick={onBack}
                            >
                                <ArrowLeft size={14} />
                                <span>Return to Website</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
