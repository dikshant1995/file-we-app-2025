import React, { useState, useEffect } from 'react';
import { auth, db } from '../../config/firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateEmail, updatePassword } from 'firebase/auth';
import { Settings, Shield, Mail, Smartphone, Lock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import './ProfileSecurity.css';

const ProfileSecurity = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [userProfile, setUserProfile] = useState(null);

    // Config fields
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const user = auth.currentUser;
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserProfile(data);
                    setDisplayName(data.displayName || '');
                    setEmail(data.email || '');
                    setMobile(data.mobile || '');
                }
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to synchronize security profile nodes.' });
        }
        setLoading(false);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("No authenticated user target detected.");

            // 1. Update Firebase Auth Email if changed
            if (email !== user.email) {
                try {
                    await updateEmail(user, email);
                } catch (authErr) {
                    if (authErr.message.includes('requires-recent-login')) {
                        throw new Error("Security Alert: Re-authentication required to modify master email. Please log out and log back in to make this change.");
                    }
                    throw authErr;
                }
            }

            // 2. Update Firebase Auth Password if typed
            if (newPassword) {
                try {
                    await updatePassword(user, newPassword);
                } catch (passErr) {
                    if (passErr.message.includes('requires-recent-login')) {
                        throw new Error("Security Alert: Re-authentication required to modify access key. Please log out and log back in.");
                    }
                    throw passErr;
                }
            }

            // 3. Update Firestore Document
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                displayName: displayName,
                email: email,
                mobile: mobile,
                updatedAt: new Date()
            });

            setMessage({ type: 'success', text: 'Enterprise Security Parameters successfully updated and synced!' });
            setNewPassword('');
            fetchUserProfile();
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: err.message });
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="profile-security-loading">
                <RefreshCw className="animate-spin text-primary" size={32} />
                <p>Initializing Secure Profile Encryption...</p>
            </div>
        );
    }

    return (
        <div className="profile-security-container animate-fade-in">
            <div className="ps-header">
                <Shield size={32} className="text-primary" />
                <div>
                    <h1>System Profile & Recovery Matrix</h1>
                    <p>Configure corporate credentials and emergency node override attributes.</p>
                </div>
            </div>

            <div className="ps-grid">
                <form onSubmit={handleSaveProfile} className="glass-panel ps-card">
                    <div className="card-header">
                        <Settings size={20} className="text-primary" />
                        <h3>Credentials Management</h3>
                    </div>

                    <div className="ps-form-grid">
                        <div className="ps-input-group">
                            <label>Administrator Identity Name</label>
                            <div className="ps-input-wrapper">
                                <input 
                                    type="text" 
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Display Name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="ps-input-group">
                            <label>Master Corporate Email</label>
                            <div className="ps-input-wrapper">
                                <Mail size={16} className="input-icon" />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ceo@laxmicredit.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="ps-input-group">
                            <label>SMS Recovery Node (Mobile Number)</label>
                            <div className="ps-input-wrapper">
                                <Smartphone size={16} className="input-icon" />
                                <input 
                                    type="text" 
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="7014439276"
                                />
                            </div>
                        </div>

                        <div className="ps-input-group">
                            <label>Update Security Access Key</label>
                            <div className="ps-input-wrapper">
                                <Lock size={16} className="input-icon" />
                                <input 
                                    type="password" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="•••••••• (Leave blank to retain)"
                                    minLength={8}
                                />
                            </div>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`ps-status-message ${message.type}`}>
                            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            <span>{message.text}</span>
                        </div>
                    )}

                    <div className="ps-footer">
                        <button type="submit" className="btn-save-profile" disabled={saving}>
                            {saving ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                            Authorize & Commit Changes
                        </button>
                    </div>
                </form>

                <div className="glass-panel ps-info-card">
                    <div className="card-header">
                        <Shield size={20} className="text-primary" />
                        <h3>Recovery Information</h3>
                    </div>
                    <div className="ps-info-body">
                        <p className="info-text">
                            Your SMS Recovery Node number and Master Email are critical assets. In the event of an emergency access lockout, authentication codes will be transmitted strictly to these pre-authorized endpoints.
                        </p>
                        <div className="active-nodes-list mt-6">
                            <div className="node-item">
                                <span className="node-dot active"></span>
                                <div className="node-details">
                                    <span className="node-title">Primary Mail Dispatch</span>
                                    <span className="node-val">{email || 'Not Setup'}</span>
                                </div>
                            </div>
                            <div className="node-item mt-4">
                                <span className={`node-dot ${mobile ? 'active' : ''}`}></span>
                                <div className="node-details">
                                    <span className="node-title">Emergency SMS Override</span>
                                    <span className="node-val">{mobile || 'Unconfigured'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSecurity;
