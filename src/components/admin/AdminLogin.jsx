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
    const [isSignUp, setIsSignUp] = useState(false); // Locked for security

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                onLoginSuccess(userDoc.data());
            } else {
                setError('Neural Access Error: Profile Not Recognized.');
            }
        } catch (err) {
            console.error('Login Error:', err);
            setError('Neural Verification Failed. Access Denied.');
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
                    <p>Enterprise Access Protocol</p>
                </div>

                <form className="login-form" onSubmit={handleLogin}>
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
                        {loading ? "Decrypting..." : "AUTHORIZE ACCESS"}
                        <ChevronRight size={18} />
                    </button>
                </form>

                <div className="login-footer">
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
