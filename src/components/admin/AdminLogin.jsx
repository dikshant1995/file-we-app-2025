import React, { useState } from 'react';
import { auth, db } from '../../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Shield, Lock, Mail, ChevronRight, Zap, AlertCircle } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSignUp, setIsSignUp] = useState(false); // Only for the very first CEO account setup

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check role in Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                onLoginSuccess(userData);
            } else {
                // Handle case where user exists in Auth but not in Firestore (shouldn't happen with proper flow)
                setError('Profile not found in database. Contact support.');
            }
        } catch (err) {
            console.error('Login Error:', err);
            setError('Invalid credentials or neural connection failure.');
        } finally {
            setLoading(false);
        }
    };

    const handleInitialSetup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const ceoProfile = {
                uid: user.uid,
                email: user.email,
                role: 'ceo',
                displayName: 'Global Administrator',
                department: 'HQ',
                createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'users', user.uid), ceoProfile);
            onLoginSuccess(ceoProfile);
        } catch (err) {
            console.error('Setup Error:', err);
            setError('Account setup failed. Possibly already exists.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-overlay">
            <div className="login-card glass-panel shadow-2xl">
                <div className="login-header">
                    <div className="shield-icon">
                        <Shield size={32} color="#00ff88" />
                    </div>
                    <h2>Laxmi Neural Gate</h2>
                    <p>{isSignUp ? "Initialize Master CEO Account" : "Enterprise Access Protocol"}</p>
                </div>

                <form className="login-form" onSubmit={isSignUp ? handleInitialSetup : handleLogin}>
                    <div className="input-group">
                        <Mail size={18} className="input-icon" />
                        <input
                            type="email"
                            placeholder="Corporate Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Lock size={18} className="input-icon" />
                        <input
                            type="password"
                            placeholder="Neural Access Key"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="login-error">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? "Decrypting..." : (isSignUp ? "Create Master ID" : "Authorize Access")}
                        <ChevronRight size={18} />
                    </button>
                </form>

                <div className="login-footer">
                    <p onClick={() => setIsSignUp(!isSignUp)}>
                        {isSignUp ? "Already have a Master ID? Sign In" : "Need to setup the first Master ID?"}
                    </p>
                    <div className="security-tag">
                        <Zap size={10} fill="#00ff88" stroke="transparent" />
                        256-Bit Neural Encryption Active
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
