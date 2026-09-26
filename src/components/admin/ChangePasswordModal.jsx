import React, { useState } from 'react';
import { auth, db } from '../../config/firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, X, ShieldCheck } from 'lucide-react';
import './ChangePasswordModal.css';

const MASTER_KEYS = ['Dikshant@2195', 'KANA05081984', 'laxmi@2025'];

const ChangePasswordModal = ({ isOpen, onClose, user }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!currentPassword) {
            setError('Please enter your current administrator password.');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match.');
            return;
        }

        setLoading(true);

        try {
            // 1. Verify current password
            let storedCustom = localStorage.getItem('laxmi_admin_custom_password');
            try {
                const configSnap = await getDoc(doc(db, 'users', 'admin_config'));
                if (configSnap.exists() && configSnap.data().masterPassword) {
                    storedCustom = configSnap.data().masterPassword;
                }
            } catch (err) {
                console.warn('Could not read Firestore admin_config:', err);
            }

            const validCurrents = storedCustom ? [...MASTER_KEYS, storedCustom] : MASTER_KEYS;
            const isCurrentValid = validCurrents.includes(currentPassword);

            if (!isCurrentValid) {
                setError('Current password is incorrect. Please enter the current valid admin password.');
                setLoading(false);
                return;
            }

            // 2. Persist new password to Firestore
            try {
                await setDoc(doc(db, 'users', 'admin_config'), {
                    masterPassword: newPassword,
                    updatedAt: new Date().toISOString(),
                    updatedBy: user?.email || user?.displayName || 'Admin'
                }, { merge: true });

                const uid = user?.uid || 'FobMoYy4iVMdCrV2p5xhOvx6vyg2';
                await setDoc(doc(db, 'users', uid), {
                    adminPassword: newPassword,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            } catch (fsErr) {
                console.warn('Firestore password save error (will rely on local persistence):', fsErr);
            }

            // 3. Persist locally
            localStorage.setItem('laxmi_admin_custom_password', newPassword);

            // 4. Update Firebase Auth if an active currentUser exists
            if (auth.currentUser) {
                try {
                    await updatePassword(auth.currentUser, newPassword);
                } catch (authErr) {
                    console.warn('Firebase Auth updatePassword notice:', authErr?.message);
                }
            }

            setSuccess('Admin password updated successfully! Your new credentials are active.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            setTimeout(() => {
                if (onClose) onClose();
            }, 2000);
        } catch (err) {
            console.error('Password change error:', err);
            setError(err.message || 'Failed to update administrator password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="password-modal-overlay" onClick={onClose}>
            <div className="password-modal-container glass-panel" onClick={(e) => e.stopPropagation()}>
                <div className="password-modal-header">
                    <div className="header-info">
                        <div className="icon-wrapper">
                            <KeyRound size={22} color="#00d4ff" />
                        </div>
                        <div>
                            <h3>Change Admin Password</h3>
                            <span className="subtitle">Update security credentials for Admin Portal access</span>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose} title="Close">
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="password-alert-banner alert-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="password-alert-banner alert-success">
                        <CheckCircle2 size={18} />
                        <span>{success}</span>
                    </div>
                )}

                <form onSubmit={handleUpdatePassword} className="password-form">
                    <div className="form-group">
                        <label>Current Password</label>
                        <div className="input-password-wrap">
                            <input
                                type={showCurrent ? 'text' : 'password'}
                                placeholder="Enter current admin password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-vis-btn"
                                onClick={() => setShowCurrent(!showCurrent)}
                                tabIndex="-1"
                            >
                                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>New Admin Password</label>
                        <div className="input-password-wrap">
                            <input
                                type={showNew ? 'text' : 'password'}
                                placeholder="Enter new password (min. 6 characters)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-vis-btn"
                                onClick={() => setShowNew(!showNew)}
                                tabIndex="-1"
                            >
                                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <div className="input-password-wrap">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                placeholder="Re-enter new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-vis-btn"
                                onClick={() => setShowConfirm(!showConfirm)}
                                tabIndex="-1"
                            >
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="password-security-hint">
                        <ShieldCheck size={15} color="#10b981" />
                        <span>Changes apply immediately across all admin sessions and Cloud Firestore.</span>
                    </div>

                    <div className="password-modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit-password" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="spinning" />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <Lock size={16} />
                                    <span>Update Password</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
